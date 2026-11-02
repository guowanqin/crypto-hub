import type { Lang } from "./site";

/**
 * 跨链套利扫描（/tool/arb-scanner）的数据层。
 *
 * 口径（建页时逐个用 DexScreener 核实，2026-11-02）：
 * - 每个资产在 Solana 与 BSC 各选一个代表代币地址（原生 / 官方锚定 / 主流发行）；
 * - 每条链的价格 = 该代币在该链上「流动性最大的美元（稳定币计价）交易对」的 priceUsd，
 *   选池规则：chainId 对版、baseToken 地址对版、quoteToken 为美元稳定币、liquidity.usd 最大；
 * - 两侧最大对流动性都必须 ≥ $30,000 才收录，不达标的如实回传 shortfalls，不编造报价。
 *
 * 未收录 BNB：BSC 侧 WBNB 没有问题，但 Solana 上不存在公认的官方/锚定 BNB 代币——
 * DexScreener 搜索到的同名代币互不相同、价格彼此打架（实测 $611–$722，真价约 $706），
 * 无法给出可信报价，按 §7 红线宁可空缺。Solana 侧的 Sollet 版 WBTC（9n4nbM…）
 * 已死亡（实测报价 $62.50），BTC 改用 Coinbase 发行的 cbBTC。
 */
export interface ArbAssetConfig {
  symbol: string;
  solanaAddress: string;
  bscAddress: string;
  /** 两侧代币性质（原生 / 锚定 / 桥接），页面逐行如实标注 */
  nature: Record<Lang, string>;
}

export const ARB_MIN_LIQUIDITY_USD = 30_000;

export const ARB_ASSETS: ArbAssetConfig[] = [
  {
    symbol: "SOL",
    solanaAddress: "So11111111111111111111111111111111111111112",
    bscAddress: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    nature: {
      zh: "Solana 侧为原生 SOL；BSC 侧为币安锚定的 SOL（Binance-Peg）",
      en: "Native SOL on Solana; Binance-pegged SOL on BSC",
      tw: "Solana 側為原生 SOL；BSC 側為幣安錨定的 SOL（Binance-Peg）",
    },
  },
  {
    symbol: "ETH",
    solanaAddress: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    bscAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    nature: {
      zh: "Solana 侧为经 Wormhole 桥接的 ETH；BSC 侧为币安锚定的 ETH",
      en: "Wormhole-bridged ETH on Solana; Binance-pegged ETH on BSC",
      tw: "Solana 側為經 Wormhole 橋接的 ETH；BSC 側為幣安錨定的 ETH",
    },
  },
  {
    symbol: "BTC",
    solanaAddress: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    bscAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    nature: {
      zh: "Solana 侧为 Coinbase 发行的 cbBTC；BSC 侧为币安锚定的 BTCB",
      en: "Coinbase-issued cbBTC on Solana; Binance-pegged BTCB on BSC",
      tw: "Solana 側為 Coinbase 發行的 cbBTC；BSC 側為幣安錨定的 BTCB",
    },
  },
  {
    symbol: "USDT",
    solanaAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    bscAddress: "0x55d398326f99059fF775485246999027B3197955",
    nature: {
      zh: "两侧均为 Tether 发行：Solana 为原生铸造，BSC 为 BSC-USD",
      en: "Tether-issued on both sides: native mint on Solana, BSC-USD on BSC",
      tw: "兩側均為 Tether 發行：Solana 為原生鑄造，BSC 為 BSC-USD",
    },
  },
  {
    symbol: "USDC",
    solanaAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    bscAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    nature: {
      zh: "Solana 侧为 Circle 原生发行；BSC 侧为币安锚定的 USDC",
      en: "Circle-native USDC on Solana; Binance-pegged USDC on BSC",
      tw: "Solana 側為 Circle 原生發行；BSC 側為幣安錨定的 USDC",
    },
  },
];

export interface ArbQuote {
  priceUsd: number;
  /** 展示用 DEX 名（由 dexId 美化） */
  dex: string;
  /** 交易对，如 SOL/USDC */
  pair: string;
  pairAddress: string;
  liquidityUsd: number;
}

export interface ArbShortfall {
  chain: "solana" | "bsc";
  /** 该侧找到的最大对流动性；完全没有合格交易对时为 null */
  liquidityUsd: number | null;
}

export interface ArbRow {
  symbol: string;
  solana: ArbQuote | null;
  bsc: ArbQuote | null;
  /** 两侧都达标才为 true；false 时看 shortfalls */
  ok: boolean;
  shortfalls: ArbShortfall[];
}

export interface ArbPayload {
  fetchedAt: string;
  rows: ArbRow[];
  error?: string;
}

/** 计价侧只认美元稳定币，保证 priceUsd 是该资产的美元报价而不是相对小币的价格。 */
const USD_QUOTE_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "FDUSD",
  "BUSD",
  "USD1",
  "TUSD",
  "PYUSD",
]);

const DEX_LABELS: Record<string, string> = {
  pancakeswap: "PancakeSwap",
  orca: "Orca",
  raydium: "Raydium",
  meteora: "Meteora",
  uniswap: "Uniswap",
  metric: "Metric",
  thena: "Thena",
  biswap: "Biswap",
  apeswap: "ApeSwap",
};

function dexLabel(dexId: string): string {
  return DEX_LABELS[dexId] ?? dexId.charAt(0).toUpperCase() + dexId.slice(1);
}

interface DexPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  priceUsd?: string;
  baseToken?: { address?: string; symbol?: string };
  quoteToken?: { address?: string; symbol?: string };
  liquidity?: { usd?: number };
}

function sameAddress(a: string | undefined, b: string, chain: string): boolean {
  if (!a) return false;
  // EVM 地址大小写不敏感；Solana 的 base58 必须逐字对版
  return chain === "bsc" ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function pickQuote(
  pairs: DexPair[],
  chain: "solana" | "bsc",
  address: string,
): { quote: ArbQuote | null; bestLiquidity: number | null } {
  let best: DexPair | null = null;
  let bestAnyLiquidity: number | null = null;
  for (const p of pairs) {
    if (p.chainId !== chain) continue;
    if (!sameAddress(p.baseToken?.address, address, chain)) continue;
    const liq = p.liquidity?.usd;
    if (typeof liq === "number" && Number.isFinite(liq)) {
      if (bestAnyLiquidity == null || liq > bestAnyLiquidity)
        bestAnyLiquidity = liq;
    }
    if (!p.quoteToken?.symbol || !USD_QUOTE_SYMBOLS.has(p.quoteToken.symbol))
      continue;
    if (!best || (liq ?? 0) > (best.liquidity?.usd ?? 0)) best = p;
  }
  if (!best) return { quote: null, bestLiquidity: bestAnyLiquidity };
  const price = Number(best.priceUsd);
  const liquidityUsd = best.liquidity?.usd ?? 0;
  if (!Number.isFinite(price) || price <= 0)
    return { quote: null, bestLiquidity: bestAnyLiquidity };
  return {
    quote: {
      priceUsd: price,
      dex: dexLabel(best.dexId ?? ""),
      pair: `${best.baseToken?.symbol ?? ""}/${best.quoteToken?.symbol ?? ""}`,
      pairAddress: best.pairAddress ?? "",
      liquidityUsd,
    },
    bestLiquidity: bestAnyLiquidity,
  };
}

async function fetchTokenPairs(address: string): Promise<DexPair[]> {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
    {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) throw new Error(`DexScreener HTTP ${res.status}`);
  const data = (await res.json()) as { pairs?: DexPair[] | null };
  return data.pairs ?? [];
}

export async function fetchArbQuotes(): Promise<ArbRow[]> {
  // 必须逐个地址查：DexScreener 的多地址合并调用只回约 30 个交易对，
  // 热门代币（如 WSOL）的池子会被挤掉——实测合并调用里 WSOL 的对一个都没有。
  const jobs: { asset: ArbAssetConfig; chain: "solana" | "bsc"; address: string }[] =
    ARB_ASSETS.flatMap((asset) => [
      { asset, chain: "solana" as const, address: asset.solanaAddress },
      { asset, chain: "bsc" as const, address: asset.bscAddress },
    ]);
  const results = await Promise.all(
    jobs.map(async (job) => ({ ...job, pairs: await fetchTokenPairs(job.address) })),
  );
  const pairsByKey = new Map(
    results.map((r) => [`${r.asset.symbol}:${r.chain}`, r.pairs]),
  );

  return ARB_ASSETS.map((asset) => {
    const sol = pickQuote(
      pairsByKey.get(`${asset.symbol}:solana`) ?? [],
      "solana",
      asset.solanaAddress,
    );
    const bsc = pickQuote(
      pairsByKey.get(`${asset.symbol}:bsc`) ?? [],
      "bsc",
      asset.bscAddress,
    );
    const shortfalls: ArbShortfall[] = [];
    const solOk =
      sol.quote != null && sol.quote.liquidityUsd >= ARB_MIN_LIQUIDITY_USD;
    const bscOk =
      bsc.quote != null && bsc.quote.liquidityUsd >= ARB_MIN_LIQUIDITY_USD;
    if (!solOk)
      shortfalls.push({
        chain: "solana",
        liquidityUsd: sol.quote?.liquidityUsd ?? sol.bestLiquidity,
      });
    if (!bscOk)
      shortfalls.push({
        chain: "bsc",
        liquidityUsd: bsc.quote?.liquidityUsd ?? bsc.bestLiquidity,
      });
    return {
      symbol: asset.symbol,
      solana: solOk ? sol.quote : null,
      bsc: bscOk ? bsc.quote : null,
      ok: solOk && bscOk,
      shortfalls,
    };
  });
}
