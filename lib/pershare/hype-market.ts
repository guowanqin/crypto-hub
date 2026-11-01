import { keccak256, toBytes } from "viem";
import type { HypeMarketData, PoolMarket, RangeBasis } from "./types";

/**
 * HYPE 标签页行情（Hyperliquid Strategies / Nasdaq: PURR）。
 * 数据：GeckoTerminal hyperevm 网络（WHYPE 价、池 TVL/成交量）+ HyperEVM RPC 链上读数。
 * 注意消歧：Hyperliquid 链上的同名 meme 代币 PURR 与本公司无关，这里不用它的任何数据。
 */

/** Wrapped HYPE（HyperEVM，18 位小数） */
export const WHYPE_ADDRESS = "0x5555555555555555555555555555555555555555";
const USDC_ADDRESS = "0xb88339cb7199b77e23db6e890353e22632ba630f"; // 6 位小数
const UBTC_ADDRESS = "0x9fdbda0a5e284c32744d2f17ee5c74b284993463"; // 8 位小数
const HYPEREVM_RPC = "https://rpc.hyperliquid.xyz/evm";

interface HypePoolDef {
  key: string;
  dex: string;
  pair: string;
  quote: "USDC" | "UBTC";
  feePercent: number;
  address: string;
  /** token0 恒为 WHYPE（已链上核实，2026-11-01） */
  dec0: number;
  token1: string;
  dec1: number;
}

/**
 * 候选池（2026-11-01 已逐一用标准 V3 接口实测 liquidity()/slot0()/fee()/token0()/token1()，
 * 四个池读数全部成功，token0 均为 WHYPE、费率与标注一致，故全部纳入区间换算）：
 * - Project X USDC/WHYPE 0.05%：TVL ≈ $13.7M
 * - Project X USDC/WHYPE 0.3%：TVL ≈ $4.1M
 * - HyperSwap V3 UBTC/WHYPE 0.3%：TVL ≈ $2.3M
 * - HyperSwap V3 USDC/WHYPE 0.3%：TVL ≈ $1.2M
 */
export const HYPE_POOL_DEFS: HypePoolDef[] = [
  {
    key: "px-usdc-005",
    dex: "Project X",
    pair: "WHYPE / USDC",
    quote: "USDC",
    feePercent: 0.05,
    address: "0x6c9a33e3b592c0d65b3ba59355d5be0d38259285",
    dec0: 18,
    token1: USDC_ADDRESS,
    dec1: 6,
  },
  {
    key: "px-usdc-03",
    dex: "Project X",
    pair: "WHYPE / USDC",
    quote: "USDC",
    feePercent: 0.3,
    address: "0x422e586c906eb241f784b4f5a633c2c7e59a2f54",
    dec0: 18,
    token1: USDC_ADDRESS,
    dec1: 6,
  },
  {
    key: "hs-ubtc-03",
    dex: "HyperSwap V3",
    pair: "WHYPE / UBTC",
    quote: "UBTC",
    feePercent: 0.3,
    address: "0x3a36b04bcc1d5e2e303981ef643d2668e00b43e7",
    dec0: 18,
    token1: UBTC_ADDRESS,
    dec1: 8,
  },
  {
    key: "hs-usdc-03",
    dex: "HyperSwap V3",
    pair: "WHYPE / USDC",
    quote: "USDC",
    feePercent: 0.3,
    address: "0xe712d505572b3f84c1b4deb99e1beab9dd0e23c9",
    dec0: 18,
    token1: USDC_ADDRESS,
    dec1: 6,
  },
];

const GT = "https://api.geckoterminal.com/api/v2";
const DS = "https://api.dexscreener.com/latest/dex";

async function fetchJson(url: string): Promise<unknown> {
  const r = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

interface HypePoolQuote {
  tvlUsd: number;
  volume24hUsd: number;
  source: string;
  /** 计价代币（token1）的美元价（USDC≈1、UBTC≈BTC 价） */
  token1Usd: number | null;
  /** WHYPE 的美元价（由该池 GT 报价推得，作 HYPE 价兜底） */
  hypeUsd: number | null;
}

async function gtPool(def: HypePoolDef): Promise<HypePoolQuote> {
  const j = (await fetchJson(
    `${GT}/networks/hyperevm/pools/${def.address}`,
  )) as {
    data?: {
      attributes?: Record<string, unknown>;
      relationships?: Record<
        string,
        { data?: { id?: string } } | undefined
      >;
    };
  };
  const a = j.data?.attributes ?? {};
  const rel = j.data?.relationships ?? {};
  const vol = a.volume_usd as Record<string, unknown> | undefined;
  const tvlUsd = num(a.reserve_in_usd);
  const volume24hUsd = num(vol?.h24);
  if (tvlUsd === null || volume24hUsd === null)
    throw new Error("geckoterminal pool fields missing");

  // GT 的 base/quote 与链上 token0/token1 无关，按地址匹配价格
  const addrOf = (id?: string) =>
    (id ?? "").replace(/^hyperevm_/, "").toLowerCase();
  const baseAddr = addrOf(rel.base_token?.data?.id);
  const quoteAddr = addrOf(rel.quote_token?.data?.id);
  const priceOf = (addr: string): number | null => {
    if (addr === baseAddr) return num(a.base_token_price_usd);
    if (addr === quoteAddr) return num(a.quote_token_price_usd);
    return null;
  };
  return {
    tvlUsd,
    volume24hUsd,
    source: "geckoterminal",
    token1Usd: priceOf(def.token1.toLowerCase()),
    hypeUsd: priceOf(WHYPE_ADDRESS),
  };
}

async function dsPool(def: HypePoolDef): Promise<HypePoolQuote> {
  const j = (await fetchJson(`${DS}/pairs/hyperevm/${def.address}`)) as {
    pairs?: Array<{
      liquidity?: { usd?: number };
      volume?: { h24?: number };
      priceUsd?: string;
    }> | null;
  };
  const p = j.pairs?.[0];
  const tvlUsd = num(p?.liquidity?.usd);
  const volume24hUsd = num(p?.volume?.h24);
  if (tvlUsd === null || volume24hUsd === null)
    throw new Error("dexscreener pair not found");
  return {
    tvlUsd,
    volume24hUsd,
    source: "dexscreener",
    token1Usd: def.quote === "USDC" ? 1 : null,
    hypeUsd: num(p?.priceUsd),
  };
}

async function gtTokenPrice(token: string): Promise<number> {
  const j = (await fetchJson(`${GT}/networks/hyperevm/tokens/${token}`)) as {
    data?: { attributes?: Record<string, unknown> };
  };
  const p = num(j.data?.attributes?.price_usd);
  if (p === null) throw new Error("geckoterminal token price missing");
  return p;
}

async function dsTokenPrice(token: string): Promise<number> {
  const j = (await fetchJson(`${DS}/tokens/${token}`)) as {
    pairs?: Array<{ priceUsd?: string; liquidity?: { usd?: number } }> | null;
  };
  const pairs = (j.pairs ?? [])
    .filter((p) => num(p.priceUsd) !== null)
    .sort((x, y) => (y.liquidity?.usd ?? 0) - (x.liquidity?.usd ?? 0));
  const p = num(pairs[0]?.priceUsd);
  if (p === null) throw new Error("dexscreener token price missing");
  return p;
}

/* ---------------- HyperEVM 链上读数（eth_call，批量） ---------------- */

function selector(sig: string): string {
  return keccak256(toBytes(sig)).slice(0, 10);
}
const SEL_LIQUIDITY = selector("liquidity()");
const SEL_SLOT0 = selector("slot0()");
const Q96 = 2 ** 96;

interface RpcCall {
  to: string;
  data: string;
}

async function ethCallBatch(calls: RpcCall[]): Promise<(string | null)[]> {
  try {
    const r = await fetch(HYPEREVM_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        calls.map((c, i) => ({
          jsonrpc: "2.0",
          id: i + 1,
          method: "eth_call",
          params: [{ to: c.to, data: c.data }, "latest"],
        })),
      ),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`RPC HTTP ${r.status}`);
    const j = (await r.json()) as Array<{
      id: number;
      result?: string;
      error?: { message?: string };
    }>;
    if (!Array.isArray(j)) throw new Error("RPC batch not array");
    const byId = new Map(j.map((x) => [x.id, x]));
    return calls.map((_, i) => {
      const item = byId.get(i + 1);
      return item && !item.error && item.result ? item.result : null;
    });
  } catch {
    // 批量失败时退回逐个调用
    return Promise.all(
      calls.map(async (c) => {
        try {
          const r = await fetch(HYPEREVM_RPC, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_call",
              params: [{ to: c.to, data: c.data }, "latest"],
            }),
            cache: "no-store",
          });
          if (!r.ok) return null;
          const j = (await r.json()) as {
            result?: string;
            error?: { message?: string };
          };
          return !j.error && j.result ? j.result : null;
        } catch {
          return null;
        }
      }),
    );
  }
}

function firstWord(hex: string): bigint {
  return BigInt("0x" + hex.slice(2, 66));
}

interface ChainRead {
  activeLiquidityRaw: bigint;
  sqrtPriceX96: bigint;
}

async function readAllChains(): Promise<(ChainRead | null)[]> {
  const calls: RpcCall[] = [];
  for (const def of HYPE_POOL_DEFS) {
    calls.push({ to: def.address, data: SEL_LIQUIDITY });
    calls.push({ to: def.address, data: SEL_SLOT0 });
  }
  const results = await ethCallBatch(calls);
  return HYPE_POOL_DEFS.map((_, i) => {
    const liqHex = results[i * 2];
    const slot0Hex = results[i * 2 + 1];
    if (!liqHex || !slot0Hex) return null;
    try {
      return {
        activeLiquidityRaw: firstWord(liqHex),
        sqrtPriceX96: firstWord(slot0Hex),
      };
    } catch {
      return null;
    }
  });
}

/* ---------------- PURR 股价：Yahoo Finance 最近收盘价（Stooq 兜底） ---------------- */

interface PurrClose {
  price: number;
  /** 交易日期（America/New_York，YYYY-MM-DD） */
  date: string;
}

/** Yahoo chart 的 bar 时间戳（秒）→ 纽约交易日 YYYY-MM-DD */
function nyDateOf(unixSeconds: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(unixSeconds * 1000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Yahoo Finance chart 接口（query1/query2）：取最近一个交易日的收盘价与日期。
 * 2026-11-01 实测可用：返回最近收盘 $11.01（2026-10-30），与纳斯达克收盘一致。
 */
async function fetchPurrCloseYahoo(host: string): Promise<PurrClose | null> {
  const r = await fetch(
    `https://${host}/v8/finance/chart/PURR?interval=1d&range=5d`,
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!r.ok) return null;
  const j = (await r.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: (number | null)[] }> };
      }> | null;
    };
  };
  const res = j.chart?.result?.[0];
  const ts = res?.timestamp ?? [];
  const closes = res?.indicators?.quote?.[0]?.close ?? [];
  for (let i = closes.length - 1; i >= 0; i--) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c) && c > 0 && ts[i]) {
      return { price: Math.round(c * 100) / 100, date: nyDateOf(ts[i]) };
    }
  }
  return null;
}

/**
 * Stooq 日线 CSV（兜底）：https://stooq.com/q/l/?s=purr.us&f=sd2t2ohlcv&h&e=csv
 * 2026-11-01 实测：该端点对任意代码（含 AAPL）均返回错误页，取不到数；
 * 保留严格校验的尝试，取不到返回 null。
 */
async function fetchPurrCloseStooq(): Promise<PurrClose | null> {
  try {
    const r = await fetch(
      "https://stooq.com/q/l/?s=purr.us&f=sd2t2ohlcv&h&e=csv",
      {
        headers: { "user-agent": "Mozilla/5.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!r.ok) return null;
    const text = await r.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const cols = lines[1].split(",");
    // Symbol,Date,Time,Open,High,Low,Close,Volume
    if (cols.length < 7 || !/purr/i.test(cols[0])) return null;
    const date = cols[1];
    const close = parseFloat(cols[6]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    if (!Number.isFinite(close) || close <= 0) return null;
    return { price: close, date };
  } catch {
    return null;
  }
}

/** PURR 最近收盘价：Yahoo Finance 优先（双主机），失败再试 Stooq，都取不到返回 null */
async function fetchPurrClose(): Promise<PurrClose | null> {
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const v = await fetchPurrCloseYahoo(host);
      if (v) return v;
    } catch {
      /* 换下一个来源 */
    }
  }
  return fetchPurrCloseStooq();
}

/* ---------------- 组装 ---------------- */

export async function fetchHypeMarket(): Promise<HypeMarketData> {
  const [hypeTokenPrice, poolQuotes, chainReads, purrClose] =
    await Promise.all([
      (async () => {
        try {
          return await gtTokenPrice(WHYPE_ADDRESS);
        } catch {
          try {
            return await dsTokenPrice(WHYPE_ADDRESS);
          } catch {
            return null;
          }
        }
      })(),
      Promise.all(
        HYPE_POOL_DEFS.map(async (def) => {
          try {
            return await gtPool(def);
          } catch {
            try {
              return await dsPool(def);
            } catch {
              return null;
            }
          }
        }),
      ),
      readAllChains(),
      fetchPurrClose(),
    ]);

  const pools: PoolMarket[] = HYPE_POOL_DEFS.map((def, i) => {
    const quote = poolQuotes[i];
    const chain = chainReads[i];
    const fee = def.feePercent / 100;
    const annualFeesUsd =
      quote !== null ? quote.volume24hUsd * fee * 365 : null;
    const poolAverageApr =
      quote !== null && annualFeesUsd !== null && quote.tvlUsd > 0
        ? annualFeesUsd / quote.tvlUsd
        : null;

    let rangeBasis: RangeBasis | null = null;
    let priceUsd: number | null = quote?.hypeUsd ?? null;
    if (chain !== null && quote?.token1Usd) {
      const sqrtPrice = Number(chain.sqrtPriceX96) / Q96;
      // 人类价格（token1/WHYPE）= sqrtPrice² × 10^(dec0 − dec1)
      const priceToken1 = sqrtPrice * sqrtPrice * 10 ** (def.dec0 - def.dec1);
      if (priceToken1 > 0) {
        rangeBasis = {
          // 与 lib/range.ts 的 L/V 公式配套：L 按计价代币（token1）小数位折算
          activeLiquidity: Number(chain.activeLiquidityRaw) / 10 ** def.dec1,
          sqrtPrice,
          priceToken1,
          token1Usd: quote.token1Usd,
        };
        priceUsd = priceToken1 * quote.token1Usd;
      }
    }

    return {
      key: def.key,
      dex: def.dex,
      pair: def.pair,
      quote: def.quote,
      feePercent: def.feePercent,
      address: def.address,
      kind: "v3" as const,
      tvlUsd: quote?.tvlUsd ?? null,
      volume24hUsd: quote?.volume24hUsd ?? null,
      annualFeesUsd,
      poolAverageApr,
      priceUsd,
      rangeBasis,
      dataSource: quote?.source ?? null,
    };
  });

  // HYPE 价：代币行情优先；缺失时用最大 USDC 池（Project X 0.05%）的链上价兜底
  const pxMain = pools.find((p) => p.key === "px-usdc-005");
  const hypePriceUsd = hypeTokenPrice ?? pxMain?.priceUsd ?? null;

  const sources = new Set(pools.map((p) => p.dataSource).filter(Boolean));
  return {
    fetchedAt: new Date().toISOString(),
    source: sources.size ? [...sources].join(" + ") : "unavailable",
    hypePriceUsd,
    purrCloseUsd: purrClose?.price ?? null,
    purrCloseDate: purrClose?.date ?? null,
    pools,
  };
}
