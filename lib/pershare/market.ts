import { keccak256, toBytes } from "viem";
import type { MarketData, PoolDef, PoolMarket, RangeBasis } from "./types";

/** 官方 BNCB 合约（Binance bStocks，1:1 对应 Nasdaq: BNC） */
export const BNCB_ADDRESS = "0x4902c5ebc598265ed2212b559b042de8a5eeec3f";
const WBNB_ADDRESS = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
/** Uniswap V4 StateView（BSC） */
const STATEVIEW_ADDRESS = "0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4";
const BSC_RPC = "https://bsc-dataseed.binance.org";

export const POOL_DEFS: PoolDef[] = [
  {
    key: "cake-usdt-005",
    dex: "PancakeSwap V3",
    pair: "BNCB / USDT",
    quote: "USDT",
    feePercent: 0.05,
    address: "0xb754f10cebf50b8862444cf4d6c1cc31a3b71c18",
    kind: "v3",
  },
  {
    key: "cake-usdt-025",
    dex: "PancakeSwap V3",
    pair: "BNCB / USDT",
    quote: "USDT",
    feePercent: 0.25,
    address: "0x32c51041f3d7a66ac14aba7485444efb6e15efe1",
    kind: "v3",
  },
  {
    key: "cake-bnb-025",
    dex: "PancakeSwap V3",
    pair: "BNCB / WBNB",
    quote: "WBNB",
    feePercent: 0.25,
    address: "0x320e8096e5e7a46e43446141a5b15d801fc596f5",
    kind: "v3",
  },
  {
    key: "uni-usdt-0025",
    dex: "Uniswap V4",
    pair: "BNCB / USDT",
    quote: "USDT",
    feePercent: 0.025,
    address:
      "0x9bbad47b24f1c6a1b9951d4cc85714cf88ce9caf4a84ba4fbfdff2c5ac30cb73",
    kind: "v4",
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

interface PoolQuote {
  tvlUsd: number;
  volume24hUsd: number;
  source: string;
}

async function gtPool(address: string): Promise<PoolQuote> {
  const j = (await fetchJson(`${GT}/networks/bsc/pools/${address}`)) as {
    data?: { attributes?: Record<string, unknown> };
  };
  const a = j.data?.attributes ?? {};
  const vol = a.volume_usd as Record<string, unknown> | undefined;
  const tvlUsd = num(a.reserve_in_usd);
  const volume24hUsd = num(vol?.h24);
  if (tvlUsd === null || volume24hUsd === null)
    throw new Error("geckoterminal pool fields missing");
  return { tvlUsd, volume24hUsd, source: "geckoterminal" };
}

async function dsPool(address: string): Promise<PoolQuote> {
  const j = (await fetchJson(`${DS}/pairs/bsc/${address}`)) as {
    pairs?: Array<{
      liquidity?: { usd?: number };
      volume?: { h24?: number };
    }> | null;
  };
  const p = j.pairs?.[0];
  const tvlUsd = num(p?.liquidity?.usd);
  const volume24hUsd = num(p?.volume?.h24);
  if (tvlUsd === null || volume24hUsd === null)
    throw new Error("dexscreener pair not found");
  return { tvlUsd, volume24hUsd, source: "dexscreener" };
}

async function gtTokenPrice(token: string): Promise<number> {
  const j = (await fetchJson(`${GT}/networks/bsc/tokens/${token}`)) as {
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

async function tokenPrice(token: string): Promise<number | null> {
  try {
    return await gtTokenPrice(token);
  } catch {
    try {
      return await dsTokenPrice(token);
    } catch {
      return null;
    }
  }
}

/* ---------------- BSC 链上读数（eth_call） ---------------- */

function selector(sig: string): string {
  return keccak256(toBytes(sig)).slice(0, 10);
}

const SEL_LIQUIDITY = selector("liquidity()");
const SEL_SLOT0 = selector("slot0()");
const SEL_GET_LIQUIDITY = selector("getLiquidity(bytes32)");
const SEL_GET_SLOT0 = selector("getSlot0(bytes32)");

const Q96 = 2 ** 96;

async function ethCall(to: string, data: string): Promise<string> {
  const r = await fetch(BSC_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`RPC HTTP ${r.status}`);
  const j = (await r.json()) as { result?: string; error?: { message?: string } };
  if (j.error || !j.result) throw new Error(j.error?.message ?? "RPC no result");
  return j.result;
}

function firstWord(hex: string): bigint {
  return BigInt("0x" + hex.slice(2, 66));
}

interface ChainRead {
  activeLiquidityRaw: bigint;
  sqrtPriceX96: bigint;
}

async function readChain(def: PoolDef): Promise<ChainRead> {
  if (def.kind === "v3") {
    const [liqHex, slot0Hex] = await Promise.all([
      ethCall(def.address, SEL_LIQUIDITY),
      ethCall(def.address, SEL_SLOT0),
    ]);
    return { activeLiquidityRaw: firstWord(liqHex), sqrtPriceX96: firstWord(slot0Hex) };
  }
  const poolId = def.address.slice(2); // bytes32 参数（已是 64 位十六进制）
  const [liqHex, slot0Hex] = await Promise.all([
    ethCall(STATEVIEW_ADDRESS, SEL_GET_LIQUIDITY + poolId),
    ethCall(STATEVIEW_ADDRESS, SEL_GET_SLOT0 + poolId),
  ]);
  return { activeLiquidityRaw: firstWord(liqHex), sqrtPriceX96: firstWord(slot0Hex) };
}

/* ---------------- 组装 ---------------- */

export async function fetchMarket(): Promise<MarketData> {
  const [bnbPriceUsd, bncbTokenPrice, poolQuotes, chainReads] =
    await Promise.all([
      tokenPrice(WBNB_ADDRESS),
      tokenPrice(BNCB_ADDRESS),
      Promise.all(
        POOL_DEFS.map(async (def) => {
          try {
            return await gtPool(def.address);
          } catch {
            try {
              return await dsPool(def.address);
            } catch {
              return null;
            }
          }
        }),
      ),
      Promise.all(
        POOL_DEFS.map(async (def) => {
          try {
            return await readChain(def);
          } catch {
            return null;
          }
        }),
      ),
    ]);

  const pools: PoolMarket[] = POOL_DEFS.map((def, i) => {
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
    let priceUsd: number | null = null;
    if (chain !== null) {
      const sqrtPrice = Number(chain.sqrtPriceX96) / Q96;
      const priceToken1 = sqrtPrice * sqrtPrice;
      const token1Usd = def.quote === "USDT" ? 1 : (bnbPriceUsd ?? 0);
      if (token1Usd > 0 && priceToken1 > 0) {
        rangeBasis = {
          // 三个代币（BNCB/USDT/WBNB）均为 18 位小数，两侧折算一致
          activeLiquidity: Number(chain.activeLiquidityRaw) / 1e18,
          sqrtPrice,
          priceToken1,
          token1Usd,
        };
        priceUsd = priceToken1 * token1Usd;
      }
    }

    return {
      ...def,
      tvlUsd: quote?.tvlUsd ?? null,
      volume24hUsd: quote?.volume24hUsd ?? null,
      annualFeesUsd,
      poolAverageApr,
      priceUsd,
      rangeBasis,
      dataSource: quote?.source ?? null,
    };
  });

  // BNCB 价：代币行情优先；缺失时用 V4（USDT 计价）池的链上价兜底
  const v4 = pools.find((p) => p.key === "uni-usdt-0025");
  const bncbPriceUsd = bncbTokenPrice ?? v4?.priceUsd ?? null;

  const sources = new Set(pools.map((p) => p.dataSource).filter(Boolean));
  return {
    fetchedAt: new Date().toISOString(),
    source: sources.size ? [...sources].join(" + ") : "unavailable",
    bnbPriceUsd,
    bncbPriceUsd,
    pools,
  };
}
