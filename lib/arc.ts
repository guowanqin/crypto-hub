/**
 * Arc 链 TVL 与稳定币趋势：自动取数 + 派生口径（结论比值、7/30 日变化、稳定币构成）。
 *
 * 数据源（DeFiLlama 公开接口，免 key；api.llama.fi / stablecoins.llama.fi，
 * 与 flows / chain-dau 看板同一出口策略）：
 * - TVL 历史：GET https://api.llama.fi/v2/historicalChainTvl/Arc
 *   返回 [{date(unix 秒), tvl}]，日级序列（2026-05 起，上线初期有一段 0 值）。
 * - 稳定币历史：GET https://stablecoins.llama.fi/stablecoincharts/Arc
 *   返回 [{date(unix 秒字符串), totalCirculatingUSD: {peggedUSD, peggedEUR, ...}}]，
 *   各锚定币种已折 USD；合计口径 = 各币种相加（2026-09 中旬起）。
 *
 * 口径自洽（页面红线）：「当前 TVL」「当前稳定币供应」一律取各自历史序列的
 * 最后一点计算 / 求和，与两张趋势图的末端严格对齐；不混用 /v2/chains 等
 * 快照接口（快照值与序列末点有小差异，混用会与图对不上）。
 * TVL 图表序列剔除开头连续 0 值段（链上线初期 DeFiLlama 尚无收录数据，
 * 不是真实锁仓为零的经济信号）；当前值与变化计算不受剔除影响（末点一致）。
 * 7 / 30 日变化 = 最后一点 vs 最接近「末点日期 − N 天」且不晚于该日的点；
 * 序列覆盖不到的目标日返回 null，页面显示 —，不编造。
 */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const TVL_URL = "https://api.llama.fi/v2/historicalChainTvl/Arc";
const STABLE_URL = "https://stablecoins.llama.fi/stablecoincharts/Arc";

export interface ArcPoint {
  /** unix 秒 */
  date: number;
  /** USD */
  value: number;
}

export interface ArcChange {
  /** 变化额（USD），目标日无数据时为 null */
  abs: number | null;
  /** 变化率（%），基准为 0 或无数据时为 null */
  pct: number | null;
}

export interface ArcCompositionItem {
  /** USD / EUR / GBP / OTHER（锚定币种代码，数据原文不翻译） */
  key: string;
  /** 当前流通量（USD） */
  usd: number;
  /** 占稳定币总供应比例（0–1） */
  share: number;
}

export interface ArcBoard {
  fetchedAt: string;
  /** 当前 TVL = TVL 序列最后一点（USD） */
  tvlNow: number;
  /** 当前稳定币供应 = 稳定币序列最后一点各币种合计（USD） */
  stabNow: number;
  /** 稳定币供应 ÷ TVL */
  ratio: number;
  /** TVL 图表序列（已剔除开头连续 0 值段） */
  tvlSeries: ArcPoint[];
  /** 稳定币供应图表序列（合计口径） */
  stabSeries: ArcPoint[];
  tvlChange7d: ArcChange;
  tvlChange30d: ArcChange;
  stabChange7d: ArcChange;
  stabChange30d: ArcChange;
  /** 稳定币构成（按金额降序，OTHER 汇总其余锚定币种） */
  composition: ArcCompositionItem[];
}

export interface ArcPayload {
  fetchedAt: string;
  board: ArcBoard | null;
  errors: Record<string, string>;
}

async function fetchJson(url: string, timeoutMs: number): Promise<any> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

/** 取不晚于 target 的最近一点（序列已按日期升序）；没有则 null。 */
function valueAtOrBefore(series: ArcPoint[], target: number): ArcPoint | null {
  let hit: ArcPoint | null = null;
  for (const p of series) {
    if (p.date <= target) hit = p;
    else break;
  }
  return hit;
}

function changeOver(series: ArcPoint[], days: number): ArcChange {
  if (series.length === 0) return { abs: null, pct: null };
  const last = series[series.length - 1];
  const base = valueAtOrBefore(series, last.date - days * 86400);
  if (!base) return { abs: null, pct: null };
  const abs = last.value - base.value;
  const pct = base.value !== 0 ? (abs / base.value) * 100 : null;
  return { abs, pct };
}

export async function fetchArcBoard(): Promise<ArcBoard> {
  const [tvlRaw, stabRaw] = await Promise.all([
    fetchJson(TVL_URL, 20000),
    fetchJson(STABLE_URL, 20000),
  ]);

  // TVL 序列：清洗 + 升序。
  const tvlAll: ArcPoint[] = (Array.isArray(tvlRaw) ? tvlRaw : [])
    .map((p: any) => ({ date: Number(p?.date), value: Number(p?.tvl) }))
    .filter((p: ArcPoint) => Number.isFinite(p.date) && Number.isFinite(p.value))
    .sort((a: ArcPoint, b: ArcPoint) => a.date - b.date);
  if (tvlAll.length === 0) throw new Error("Arc TVL series empty");

  // 图表序列：剔除开头连续 0 值段（至少保留末点）。
  let firstNonZero = tvlAll.findIndex((p) => p.value > 0);
  if (firstNonZero < 0) firstNonZero = tvlAll.length - 1;
  const tvlSeries = tvlAll.slice(firstNonZero);

  // 稳定币序列：每点合计各锚定币种（已折 USD）。
  const stabSeries: ArcPoint[] = (Array.isArray(stabRaw) ? stabRaw : [])
    .map((p: any) => {
      const buckets = p?.totalCirculatingUSD ?? {};
      let total = 0;
      for (const v of Object.values(buckets)) {
        const n = Number(v);
        if (Number.isFinite(n)) total += n;
      }
      return { date: Number(p?.date), value: total };
    })
    .filter((p: ArcPoint) => Number.isFinite(p.date) && p.value > 0)
    .sort((a: ArcPoint, b: ArcPoint) => a.date - b.date);
  if (stabSeries.length === 0) throw new Error("Arc stablecoin series empty");

  const tvlNow = tvlAll[tvlAll.length - 1].value;
  const stabNow = stabSeries[stabSeries.length - 1].value;

  // 稳定币构成：取与 stabSeries 末点同一日期的原始点，保证与合计严格对齐。
  const lastStabDate = stabSeries[stabSeries.length - 1].date;
  const lastRaw =
    (stabRaw as any[]).find((p: any) => Number(p?.date) === lastStabDate) ??
    (stabRaw as any[])[(stabRaw as any[]).length - 1];
  const lastBuckets: Record<string, number> = {};
  for (const [k, v] of Object.entries(lastRaw?.totalCirculatingUSD ?? {})) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) lastBuckets[k] = n;
  }
  const named: Array<{ rawKey: string; key: string }> = [
    { rawKey: "peggedUSD", key: "USD" },
    { rawKey: "peggedEUR", key: "EUR" },
    { rawKey: "peggedGBP", key: "GBP" },
  ];
  const composition: ArcCompositionItem[] = [];
  let otherUsd = 0;
  for (const [rawKey, usd] of Object.entries(lastBuckets)) {
    const hit = named.find((n) => n.rawKey === rawKey);
    if (hit) composition.push({ key: hit.key, usd, share: stabNow ? usd / stabNow : 0 });
    else otherUsd += usd;
  }
  if (otherUsd > 0)
    composition.push({ key: "OTHER", usd: otherUsd, share: stabNow ? otherUsd / stabNow : 0 });
  composition.sort((a, b) => b.usd - a.usd);

  return {
    fetchedAt: new Date().toISOString(),
    tvlNow,
    stabNow,
    ratio: tvlNow > 0 ? stabNow / tvlNow : 0,
    tvlSeries,
    stabSeries,
    tvlChange7d: changeOver(tvlAll, 7),
    tvlChange30d: changeOver(tvlAll, 30),
    stabChange7d: changeOver(stabSeries, 7),
    stabChange30d: changeOver(stabSeries, 30),
    composition,
  };
}
