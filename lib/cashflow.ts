// 每日加密现金流榜（cashflow-daily）：协议手续费 / 收入榜。
//
// 数据源：DefiLlama 免费接口（无 key），https://api.llama.fi
//   GET /summary/fees/{protocol}?dataType=dailyFees | dailyRevenue
// 全量榜 GET /overview/fees?dataType=dailyFees 返回约 31MB、3,164 个协议
// （2026-11-09 实测：30,923,916 字节），不适合浏览器直取；
// 故本页只取本站精选的 10 个协议，逐个取数后在本地按 24h 排名。
//
// 口径（页面公开）：DefiLlama 手续费 / 收入是协议收入，不是持币人现金流，
// 不构成交易信号；Metaplanet、Circle 等上市公司不在榜内。

export type CashflowMetric = "fees" | "revenue";

export interface ProtocolMeta {
  slug: string;
  label: string;
  kind: { zh: string; en: string; tw: string };
}

/** 本站精选的 10 个协议（2026-11-09 逐个在 DefiLlama 核对存在且有费用数据）。 */
export const PROTOCOLS: ProtocolMeta[] = [
  { slug: "hyperliquid", label: "Hyperliquid", kind: { zh: "永续合约 DEX", en: "Perps DEX", tw: "永續合約 DEX" } },
  { slug: "uniswap", label: "Uniswap", kind: { zh: "现货 DEX", en: "Spot DEX", tw: "現貨 DEX" } },
  { slug: "aave", label: "Aave", kind: { zh: "借贷协议", en: "Lending", tw: "借貸協議" } },
  { slug: "lido", label: "Lido", kind: { zh: "质押协议", en: "Staking", tw: "質押協議" } },
  { slug: "sky", label: "Sky（Maker）", kind: { zh: "稳定币协议", en: "Stablecoin", tw: "穩定幣協議" } },
  { slug: "pancakeswap", label: "PancakeSwap", kind: { zh: "现货 DEX", en: "Spot DEX", tw: "現貨 DEX" } },
  { slug: "gmx", label: "GMX", kind: { zh: "永续合约 DEX", en: "Perps DEX", tw: "永續合約 DEX" } },
  { slug: "ethena", label: "Ethena", kind: { zh: "稳定币协议", en: "Stablecoin", tw: "穩定幣協議" } },
  { slug: "jito", label: "Jito", kind: { zh: "Solana 质押", en: "Solana staking", tw: "Solana 質押" } },
  { slug: "raydium", label: "Raydium", kind: { zh: "现货 DEX", en: "Spot DEX", tw: "現貨 DEX" } },
];

export interface ProtocolFee {
  slug: string;
  label: string;
  name: string;
  url: string;
  total24h: number;
  prior24h: number;
  /** 日环比（%）：(24h − 前 24h) ÷ 前 24h；前值 ≤ 0 时为 null，页面显示“—”。 */
  change1d: number | null;
  total7d: number;
  total30d: number;
  total1y: number;
  totalAllTime: number;
  /** 每日收入曲线（近 30 日用于走势线）。 */
  chart: { t: number; v: number }[];
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

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DATA_TYPE: Record<CashflowMetric, string> = {
  fees: "dailyFees",
  revenue: "dailyRevenue",
};

/** 单个协议的费用 / 收入汇总（缓存 10 分钟）。 */
export async function fetchProtocolFee(
  meta: ProtocolMeta,
  metric: CashflowMetric
): Promise<ProtocolFee> {
  const cacheKey = `cf:fee:${meta.slug}:${metric}`;
  const cached = cacheGet<ProtocolFee>(cacheKey, 10 * 60_000);
  if (cached) return cached;
  const raw = (await fetchJson(
    `https://api.llama.fi/summary/fees/${meta.slug}?dataType=${DATA_TYPE[metric]}`
  )) as {
    name?: string;
    url?: string;
    total24h?: number;
    total48hto24h?: number;
    total7d?: number;
    total30d?: number;
    total1y?: number;
    totalAllTime?: number;
    totalDataChart?: [number, number][];
  };
  const total24h = Number(raw.total24h ?? 0);
  const prior24h = Number(raw.total48hto24h ?? 0);
  const out: ProtocolFee = {
    slug: meta.slug,
    label: meta.label,
    name: typeof raw.name === "string" && raw.name ? raw.name : meta.label,
    url: typeof raw.url === "string" ? raw.url : "",
    total24h,
    prior24h,
    change1d: prior24h > 0 ? ((total24h - prior24h) / prior24h) * 100 : null,
    total7d: Number(raw.total7d ?? 0),
    total30d: Number(raw.total30d ?? 0),
    total1y: Number(raw.total1y ?? 0),
    totalAllTime: Number(raw.totalAllTime ?? 0),
    chart: Array.isArray(raw.totalDataChart)
      ? raw.totalDataChart.slice(-30).map(([t, v]) => ({ t: t * 1000, v: Number(v) }))
      : [],
  };
  cacheSet(cacheKey, out);
  return out;
}

/** 全部 10 个协议逐个取数；某协议取不到时跳过（页面列出未取到的协议）。 */
export async function fetchAllProtocolFees(
  metric: CashflowMetric
): Promise<{ rows: ProtocolFee[]; missing: string[] }> {
  const settled = await Promise.allSettled(PROTOCOLS.map((m) => fetchProtocolFee(m, metric)));
  const rows: ProtocolFee[] = [];
  const missing: string[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") rows.push(r.value);
    else missing.push(PROTOCOLS[i].label);
  });
  rows.sort((a, b) => b.total24h - a.total24h);
  return { rows, missing };
}

export type SortKey = "total24h" | "total7d" | "total30d" | "change1d";

/** 按所选口径排序（日环比为 null 的排最后）。 */
export function sortRows(rows: ProtocolFee[], key: SortKey): ProtocolFee[] {
  const out = [...rows];
  if (key === "change1d") {
    out.sort((a, b) => (b.change1d ?? -Infinity) - (a.change1d ?? -Infinity));
  } else {
    out.sort((a, b) => b[key] - a[key]);
  }
  return out;
}
