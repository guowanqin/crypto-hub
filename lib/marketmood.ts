// 市场倾向看板（market-mood）：多指标合成框架与计算逻辑。
//
// 合成口径（页面公开、可复算）：
//   5 个指标，各自打分（整数，-2 至 +2），按权重加权平均：
//     加权分 = Σ(分 × 权重) ÷ Σ权重（权重之和 3.8）
//   倾向阈值：|加权分| < 1.2 → 震荡 / 观望；否则按正负判看涨 / 看跌。
//   权重、分项档位、置信分档、目标区间算法均在页面方法区公开。
//
// 指标清单（2026-11-09 核对，原站老张行情 · Market v2.4 快照，BTC $74,937.11）：
//   权重与合成公式、倾向阈值为页面公开口径；分项打分档位与置信映射原站未公开，
//   为本站自定规则（见下方各 score* 函数），不在页面上声称是原站的算法。
//   快照校验：(-2×1 + 1×1 + 2×1 + 0×0.5 + (-1)×0.3) ÷ 3.8 = 0.18 → 震荡 / 观望。
//
// 数据源（全部公开免费；取不到就留空并说明原因，绝不编造）：
//   Binance 公开接口、alternative.me、Ahr999（本站按公开公式自算，见下）、
//   Hyperliquid 公开接口、DefiLlama。

export type MoodDirection = "bullish" | "neutral" | "bearish";
export type ConfidenceTier = "low" | "medium" | "high";

/** 币种选择（默认 BTC；另可自定义交易对添加） */
export const SYMBOLS = ["BTC", "ETH", "SOL"] as const;
export type SymbolKey = (typeof SYMBOLS)[number];

/** K 线周期（切换周期不改变合成打分；K 线动量始终按 7 日计） */
export const TIMEFRAMES = [
  { id: "1m", interval: "1m" },
  { id: "15m", interval: "15m" },
  { id: "1h", interval: "1h" },
  { id: "4h", interval: "4h" },
  { id: "1d", interval: "1d" },
] as const;
export type TimeframeId = (typeof TIMEFRAMES)[number]["id"];

/** TVL 链选择器（独立于币种） */
export const TVL_CHAINS = ["Bitcoin", "Ethereum", "Solana", "Base", "BSC", "Tron"] as const;
export type TvlChain = (typeof TVL_CHAINS)[number];

export function symbolToPair(symbol: string): string {
  return `${symbol.toUpperCase()}USDT`;
}

/** 自定义交易对校验：形如 BTCUSDT / DOGEUSDT（大写字母 + USDT 结尾） */
export function isValidPair(pair: string): boolean {
  return /^[A-Z0-9]{2,12}USDT$/.test(pair);
}

// ---------------------------------------------------------------------------
// 分项打分档位（本站自定规则，非原站公开口径；页面方法区会如实标注）
// ---------------------------------------------------------------------------

/** K 线动量：7 日价格涨跌（%）→ -2..+2。快照例：7 日小跌 → -2。 */
export function scoreMomentum(change7dPct: number): number {
  if (change7dPct >= 5) return 2;
  if (change7dPct >= 2) return 1;
  if (change7dPct > -2) return 0;
  if (change7dPct > -5) return -1;
  return -2;
}

/** 贪婪指数：逆向计分。快照例：29（恐慌）→ +1。 */
export function scoreFng(value: number): number {
  if (value <= 19) return 2;
  if (value <= 39) return 1;
  if (value <= 59) return 0;
  if (value <= 79) return -1;
  return -2;
}

/** Ahr999：<0.45 抄底区。快照例：0.428 → +2。 */
export function scoreAhr999(v: number): number {
  if (v < 0.45) return 2;
  if (v < 0.9) return 1;
  if (v < 1.2) return 0;
  if (v < 2.0) return -1;
  return -2;
}

/** HL 资金费率（%/小时，逆向计分：资金费过热＝多头拥挤）。快照例：0.0013% → 0。 */
export function scoreFunding(ratePctPerHour: number): number {
  if (ratePctPerHour < -0.05) return 2;
  if (ratePctPerHour < -0.01) return 1;
  if (ratePctPerHour <= 0.01) return 0;
  if (ratePctPerHour <= 0.05) return -1;
  return -2;
}

/** TVL 7 日涨跌（%）。快照例：Bitcoin 7 日 -4.9% → -1。 */
export function scoreTvl(change7dPct: number): number {
  if (change7dPct >= 5) return 2;
  if (change7dPct >= 2) return 1;
  if (change7dPct > -2) return 0;
  if (change7dPct > -5) return -1;
  return -2;
}

// ---------------------------------------------------------------------------
// 合成
// ---------------------------------------------------------------------------

export interface IndicatorScore {
  id: "momentum" | "fng" | "ahr999" | "funding" | "tvl";
  /** 指标当前值（展示用原文案，如 "29（恐慌）" 的数值部分） */
  value: number;
  score: number;
  weight: number;
}

export const INDICATOR_WEIGHTS: Record<IndicatorScore["id"], number> = {
  momentum: 1,
  fng: 1,
  ahr999: 1,
  funding: 0.5,
  tvl: 0.3,
};

export const TOTAL_WEIGHT = 3.8;

/** 倾向阈值（页面公开口径） */
export const TILT_THRESHOLD = 1.2;

export function tiltFromWeighted(w: number): MoodDirection {
  if (Math.abs(w) < TILT_THRESHOLD) return "neutral";
  return w > 0 ? "bullish" : "bearish";
}

/**
 * 置信三分档（本站自定规则）：
 * 一致度 = 占优方向的权重 ÷ 总权重（中性分不计入任何一方）。
 * 高：|加权分| ≥ 1.2 且一致度 ≥ 2/3；低：|加权分| < 0.5 且一致度 < 1/2；其余为中。
 * 快照校验：加权分 0.18、一致度 2.0/3.8 ≈ 53% → 中（与原站显示一致）。
 */
export function confidenceTier(
  weighted: number,
  items: IndicatorScore[]
): { tier: ConfidenceTier; agreement: number } {
  let pos = 0;
  let neg = 0;
  let used = 0;
  for (const it of items) {
    used += it.weight;
    if (it.score > 0) pos += it.weight;
    else if (it.score < 0) neg += it.weight;
  }
  const agreement = used > 0 ? Math.max(pos, neg) / used : 0;
  let tier: ConfidenceTier = "medium";
  if (Math.abs(weighted) >= TILT_THRESHOLD && agreement >= 2 / 3) tier = "high";
  else if (Math.abs(weighted) < 0.5 && agreement < 1 / 2) tier = "low";
  return { tier, agreement };
}

export interface CompositeResult {
  items: IndicatorScore[];
  /** 实际参与合成的权重之和（某项取不到时按剩余权重重新归一，并在页面注明） */
  usedWeight: number;
  weighted: number;
  direction: MoodDirection;
  confidence: ConfidenceTier;
  agreement: number;
  /** 7 日波动率（近 7 日日收益率标准差 × √7），目标区间用 */
  vol7: number | null;
  /** 目标区间（震荡时为 null，页面显示“区间震荡、不设单边目标”） */
  targetLow: number | null;
  targetHigh: number | null;
  /** 被排除的指标（取不到数据时列出，并在页面注明） */
  excluded: IndicatorScore["id"][];
}

/**
 * 合成计算。某项取不到时将其排除、按剩余权重重新归一（页面会注明原权重和与实际权重和）。
 * 目标区间（本站自定口径）：方向明确时按 7 日波动率估算，看涨取 [现价, 现价×(1+波幅)]，
 * 看跌取 [现价×(1-波幅), 现价]；震荡时不设单边目标。
 */
export function computeComposite(
  scores: Partial<Record<IndicatorScore["id"], { value: number; score: number }>>,
  price: number | null,
  vol7: number | null
): CompositeResult | null {
  const ids: IndicatorScore["id"][] = ["momentum", "fng", "ahr999", "funding", "tvl"];
  const items: IndicatorScore[] = [];
  const excluded: IndicatorScore["id"][] = [];
  for (const id of ids) {
    const s = scores[id];
    if (!s) {
      excluded.push(id);
      continue;
    }
    items.push({ id, value: s.value, score: s.score, weight: INDICATOR_WEIGHTS[id] });
  }
  if (items.length === 0) return null;
  const usedWeight = items.reduce((a, b) => a + b.weight, 0);
  const weighted =
    items.reduce((a, b) => a + b.score * b.weight, 0) / usedWeight;
  const direction = tiltFromWeighted(weighted);
  const { tier, agreement } = confidenceTier(weighted, items);
  let targetLow: number | null = null;
  let targetHigh: number | null = null;
  if (direction !== "neutral" && price !== null && vol7 !== null && vol7 > 0) {
    if (direction === "bullish") {
      targetLow = price;
      targetHigh = price * (1 + vol7);
    } else {
      targetLow = price * (1 - vol7);
      targetHigh = price;
    }
  }
  return { items, usedWeight, weighted, direction, confidence: tier, agreement, vol7, targetLow, targetHigh, excluded };
}

/** 近 7 日波动率：日收益率（对数）标准差 × √7。输入为收盘价序列（至少 8 个）。 */
export function vol7FromCloses(closes: number[]): number | null {
  if (closes.length < 8) return null;
  const rets: number[] = [];
  for (let i = closes.length - 7; i < closes.length; i++) {
    rets.push(Math.log(closes[i] / closes[i - 1]));
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rets.length;
  return Math.sqrt(variance) * Math.sqrt(7);
}

/** 7 日涨跌（%）：最近收盘价相对 7 日前收盘价。输入为收盘价序列（至少 8 个）。 */
export function change7dFromCloses(closes: number[]): number | null {
  if (closes.length < 8) return null;
  const now = closes[closes.length - 1];
  const ago = closes[closes.length - 8];
  return ((now - ago) / ago) * 100;
}

// ---------------------------------------------------------------------------
// Ahr999（本站按公开公式自算）
//   AHR999 = (现价 ÷ 200 日几何均值) × (现价 ÷ 幂律拟合值)
//   拟合值 = 10^(5.84 × log10(自 2009-01-03 起的天数) − 17.01)，出自九神《囤比特币》公开公式。
//   校验：2026-11-09 自算 0.42，原站快照显示 0.428，基本一致（收盘口径差异所致）。
//   无免 key 公开接口可用时采用自算，页面如实标注为“本站自算”，不冒充原站数据。
// ---------------------------------------------------------------------------

const GENESIS = Date.UTC(2009, 0, 3);

export function ahr999FromCloses(closes: number[], asOfMs: number): number | null {
  if (closes.length < 200) return null;
  const window = closes.slice(-200);
  const geo = Math.exp(window.reduce((a, c) => a + Math.log(c), 0) / window.length);
  const price = closes[closes.length - 1];
  const days = Math.floor((asOfMs - GENESIS) / 86400000);
  if (days <= 0) return null;
  const fit = Math.pow(10, 5.84 * Math.log10(days) - 17.01);
  return (price / geo) * (price / fit);
}

/** Ahr999 近 2 年曲线：对每日收盘价逐日自算（需要约 930 根日 K：730 天曲线 + 200 日窗口）。 */
export function ahr999CurveFromCloses(closes: number[], timesMs: number[]): { t: number; v: number }[] {
  const out: { t: number; v: number }[] = [];
  const start = Math.max(200, closes.length - 730);
  for (let i = start; i < closes.length; i++) {
    const v = ahr999FromCloses(closes.slice(0, i + 1), timesMs[i]);
    if (v !== null) out.push({ t: timesMs[i], v });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 取数（全部公开免费接口；浏览器端直接调取，无 key；localStorage 缓存）
// ---------------------------------------------------------------------------

export type FetchState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T; updatedAt: number }
  | { status: "error"; reason: string };

const BINANCE_BASES = ["https://data-api.binance.vision", "https://api.binance.com"];

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

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Binance 公开 K 线（500 根）。失败时自动换备用域名。 */
export async function fetchBinanceKlines(
  pair: string,
  interval: string,
  limit = 500
): Promise<Kline[]> {
  const cacheKey = `mood:klines:${pair}:${interval}:${limit}`;
  const cached = cacheGet<Kline[]>(cacheKey, 60_000);
  if (cached) return cached;
  let lastErr: unknown = null;
  for (const base of BINANCE_BASES) {
    try {
      const raw = (await fetchJson(
        `${base}/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`
      )) as unknown[][];
      const klines: Kline[] = raw.map((k) => ({
        openTime: Number(k[0]),
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
        volume: Number(k[5]),
      }));
      cacheSet(cacheKey, klines);
      return klines;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Binance 取数失败");
}

/** Binance 24h 行情（现价与 24h 涨跌）。 */
export async function fetchBinanceTicker(
  pair: string
): Promise<{ price: number; change24hPct: number }> {
  const cacheKey = `mood:ticker:${pair}`;
  const cached = cacheGet<{ price: number; change24hPct: number }>(cacheKey, 60_000);
  if (cached) return cached;
  let lastErr: unknown = null;
  for (const base of BINANCE_BASES) {
    try {
      const raw = (await fetchJson(`${base}/api/v3/ticker/24hr?symbol=${pair}`)) as {
        lastPrice: string;
        priceChangePercent: string;
      };
      const out = { price: Number(raw.lastPrice), change24hPct: Number(raw.priceChangePercent) };
      cacheSet(cacheKey, out);
      return out;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Binance 取数失败");
}

export interface FngPoint {
  value: number;
  classification: string;
  timestamp: number;
}

/** alternative.me 贪婪指数（近 90 日；日级缓存 ≥6h）。 */
export async function fetchFng(limit = 90): Promise<FngPoint[]> {
  const cacheKey = `mood:fng:${limit}`;
  const cached = cacheGet<FngPoint[]>(cacheKey, 6 * 3600_000);
  if (cached) return cached;
  const raw = (await fetchJson(`https://api.alternative.me/fng/?limit=${limit}`)) as {
    data: { value: string; value_classification: string; timestamp: string }[];
  };
  const points: FngPoint[] = raw.data.map((d) => ({
    value: Number(d.value),
    classification: d.value_classification,
    timestamp: Number(d.timestamp) * 1000,
  }));
  cacheSet(cacheKey, points);
  return points;
}

export interface HyperliquidAsset {
  coin: string;
  fundingPctPerHour: number;
  markPx: number;
  openInterestUsd: number;
}

/** Hyperliquid 公开接口：资金费率、Mark 价、永续持仓量（缓存约 3 分钟）。 */
export async function fetchHyperliquid(coin: string): Promise<HyperliquidAsset> {
  const cacheKey = `mood:hl:${coin}`;
  const cached = cacheGet<HyperliquidAsset>(cacheKey, 3 * 60_000);
  if (cached) return cached;
  const raw = (await fetchJson("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
  })) as [{ universe: { name: string }[] }, { funding: string; markPx: string; openInterest: string }[]];
  const [meta, ctxs] = raw;
  const idx = meta.universe.findIndex((u) => u.name === coin);
  if (idx < 0 || !ctxs[idx]) throw new Error(`Hyperliquid 无 ${coin} 数据`);
  const ctx = ctxs[idx];
  const out: HyperliquidAsset = {
    coin,
    fundingPctPerHour: Number(ctx.funding) * 100,
    markPx: Number(ctx.markPx),
    openInterestUsd: Number(ctx.openInterest) * Number(ctx.markPx),
  };
  cacheSet(cacheKey, out);
  return out;
}

export interface TvlPoint {
  date: number;
  tvl: number;
}

/** DefiLlama 链 TVL 历史（缓存约 10 分钟）。 */
export async function fetchChainTvl(chain: TvlChain): Promise<TvlPoint[]> {
  const cacheKey = `mood:tvl:${chain}`;
  const cached = cacheGet<TvlPoint[]>(cacheKey, 10 * 60_000);
  if (cached) return cached;
  const raw = (await fetchJson(
    `https://api.llama.fi/v2/historicalChainTvl/${chain}`
  )) as { date: number; tvl: number }[];
  const points: TvlPoint[] = raw.map((d) => ({ date: d.date * 1000, tvl: d.tvl }));
  cacheSet(cacheKey, points);
  return points;
}

/** TVL 7 日涨跌（%）。 */
export function tvlChange7d(points: TvlPoint[]): number | null {
  if (points.length < 8) return null;
  const now = points[points.length - 1].tvl;
  const ago = points[points.length - 8].tvl;
  if (!ago) return null;
  return ((now - ago) / ago) * 100;
}
