// 稳定币收益榜（stablecoin-yields）：主流稳定币池按年化排名。
//
// 数据源：DefiLlama Yields 免费接口（无 key），https://yields.llama.fi/pools
//   全量榜一次返回约 10.7MB、15,716 个池子（2026-11-10 实测），不适合浏览器
//   直接取数；本站服务端按池子取回（app/api/stablecoin-yields）后裁剪下发，
//   浏览器只收精选 20 个池子的裁剪数据。Yields 接口没有单池现价端点
//   （/pool/{id} 返回 404），所以逐个取数不可行，只能全量取回再筛选。
//
// 口径（页面公开）：APY 是年化收益率，不是固定利息，天天变；高波动金库
//   （做市/策略盈亏驱动，含 HLP）包含在内但标红提示；榜上数字不构成投资建议。

export interface PoolMeta {
  id: string;
  symbol: string;
  project: string;
  /** 榜单显示名（协议 + 池子特征）。 */
  label: string;
  chain: string;
  kind: { zh: string; en: string; tw: string };
  /** 高波动金库：收益主要来自做市 / 策略盈亏，APY 波动大，页面标红提示。 */
  volatile: boolean;
}

/** 本站精选的 20 个稳定币池（2026-11-10 逐个在 DefiLlama 全量榜核对存在且 TVL > $50M）。 */
export const CURATED_POOLS: PoolMeta[] = [
  { id: "c676790b-ba37-5aa8-9ccf-d9a533daafdc", symbol: "USDC", project: "hyperliquid-hlp", label: "Hyperliquid HLP", chain: "Hyperliquid L1", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
  { id: "1a9c61c7-4094-4ee7-8d46-6ea8fb5689f1", symbol: "USDC", project: "accountable", label: "Accountable", chain: "Monad", kind: { zh: "积分金库", en: "Points vault", tw: "積分金庫" }, volatile: true },
  { id: "cb6139f9-4a68-4efd-8245-0312a92aee55", symbol: "APXUSD", project: "apyx-protocol", label: "Apyx", chain: "Ethereum", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
  { id: "e7fdda30-ce71-5dea-8b3a-dd43de77ce55", symbol: "STRUSD", project: "tori-finance", label: "Tori Finance", chain: "Ethereum", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
  { id: "86e18974-35ca-4948-9c82-694facf9d082", symbol: "USD1", project: "dolomite", label: "Dolomite", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "f6915ff0-ca54-509c-bf17-bd7ad2d0b614", symbol: "GTUSDGP", project: "morpho-blue", label: "Morpho Blue", chain: "Arbitrum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "2eb2bdf8-c3e3-5b30-8d49-8d5232294184", symbol: "USDC", project: "pareto-credit", label: "Pareto Credit", chain: "Ethereum", kind: { zh: "信贷", en: "Private credit", tw: "信貸" }, volatile: false },
  { id: "a90d554a-b548-4f50-b03e-9dcb724b7777", symbol: "USDT", project: "aave-v3", label: "Aave v3", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "c74227a1-e738-4021-bbe1-13363815aecb", symbol: "SAVUSD", project: "avant-avusd", label: "Avant avUSD", chain: "Avalanche", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
  { id: "7d491f26-a03b-4eca-ae2c-e068391b15d3", symbol: "USDC", project: "midas-rwa", label: "Midas RWA", chain: "Ethereum", kind: { zh: "RWA 收益", en: "RWA yield", tw: "RWA 收益" }, volatile: false },
  { id: "f4200c7d-d3fd-5b88-9398-ba66eac63a03", symbol: "USDC", project: "sentora-curator", label: "Sentora", chain: "Ethereum", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
  { id: "32f586b4-5358-5aa2-88ee-c842139e7023", symbol: "STEAKUSDG", project: "morpho-blue", label: "Morpho Blue", chain: "Robinhood Chain", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "1c312830-ee96-40c9-b55f-b0f209ca6ebd", symbol: "REUSD", project: "re", label: "Re", chain: "Ethereum", kind: { zh: "RWA 收益", en: "RWA yield", tw: "RWA 收益" }, volatile: false },
  { id: "9f71f0fd-cfac-54b1-865e-37338f481708", symbol: "STUSDS", project: "sky-lending", label: "Sky", chain: "Ethereum", kind: { zh: "杠杆收益", en: "Leveraged yield", tw: "槓桿收益" }, volatile: true },
  { id: "aa70268e-4b52-42bf-a116-608b370f9501", symbol: "USDC", project: "aave-v3", label: "Aave v3", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "f981a304-bb6c-45b8-b0c5-fd2f515ad23a", symbol: "USDT", project: "aave-v3", label: "Aave v3", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "e26ce7d9-db75-4aa4-b1db-cc21ae17bdfb", symbol: "DAI", project: "sparklend", label: "Spark", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "54e9b138-3146-4c1f-8dce-1cb948f5ef96", symbol: "USDS", project: "sparklend", label: "Spark", chain: "Ethereum", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "36f636df-3783-5b1b-b1c9-493e72cc51f4", symbol: "PYUSD", project: "kamino-lend", label: "Kamino", chain: "Solana", kind: { zh: "借贷", en: "Lending", tw: "借貸" }, volatile: false },
  { id: "712ce948-bd9e-4f4a-8916-b72c447f7578", symbol: "SUSDAI", project: "usd-ai", label: "USD.ai", chain: "Arbitrum", kind: { zh: "做市金库", en: "Market-making vault", tw: "做市金庫" }, volatile: true },
];

/** 稳健对照池：Aave v3 USDC（Ethereum），页面第三张卡片固定对照用。 */
export const CONTROL_POOL_ID = "aa70268e-4b52-42bf-a116-608b370f9501";

export interface YieldPool {
  id: string;
  symbol: string;
  project: string;
  label: string;
  chain: string;
  kind: { zh: string; en: string; tw: string };
  volatile: boolean;
  /** 当前年化（%）。 */
  apy: number;
  /** 基础年化（%），null 表示接口未给。 */
  apyBase: number | null;
  /** 奖励年化（%），null 表示接口未给。 */
  apyReward: number | null;
  /** 30 日平均年化（%），null 表示接口未给。 */
  apyMean30d: number | null;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  tvlUsd: number;
  ilRisk: string;
  poolMeta: string | null;
}

/** 服务端下发的裁剪数据（/api/stablecoin-yields 返回体）。 */
export interface YieldsPayload {
  fetchedAt: string;
  pools: YieldPool[] | null;
  missing: string[];
  errors: Record<string, string>;
}

function cacheGet<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; data: T };
    if (Date.now() - parsed.t > ttlMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function cacheSet(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
  } catch {
    // 缓存写失败不影响主流程
  }
}

/**
 * 取回精选池的当日收益数据（浏览器只调本站 /api/stablecoin-yields，
 * 服务端在上游全量榜里筛选裁剪；浏览器缓存 10 分钟）。
 * 全取不到时 rows 为空，页面按加载失败处理，不写“更新于”时间戳。
 */
export async function fetchYieldsBoard(): Promise<{
  rows: YieldPool[];
  missing: string[];
  loadFailed: boolean;
}> {
  const cacheKey = "sy:board";
  const cached = cacheGet<YieldsPayload>(cacheKey, 10 * 60_000);
  if (cached && cached.pools) {
    return { rows: cached.pools, missing: cached.missing, loadFailed: false };
  }
  try {
    const res = await fetch("/api/stablecoin-yields");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as YieldsPayload;
    if (!payload.pools || payload.pools.length === 0) {
      return { rows: [], missing: payload.missing ?? [], loadFailed: true };
    }
    cacheSet(cacheKey, payload);
    return { rows: payload.pools, missing: payload.missing ?? [], loadFailed: false };
  } catch {
    return { rows: [], missing: [], loadFailed: true };
  }
}

export type YieldSortKey = "apy" | "apyMean30d" | "tvlUsd";

/** 按所选口径排序（缺失值排最后）。 */
export function sortPools(rows: YieldPool[], key: YieldSortKey): YieldPool[] {
  const out = [...rows];
  const val = (r: YieldPool): number => {
    if (key === "apy") return r.apy;
    if (key === "apyMean30d") return r.apyMean30d ?? -Infinity;
    return r.tvlUsd;
  };
  out.sort((a, b) => val(b) - val(a));
  return out;
}
