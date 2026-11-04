/**
 * 形态选标的（/tool/pattern-scanner）的数据层、形态引擎与历史回测。
 *
 * 与 signal-scanner 的分工：那个按标的看信号；这个先选形态，再看
 * 「今日哪些标的命中」+「该形态在全标的池历史上的回测表现」。
 * 标的池与 signal-scanner 完全一致（30 个 USDT 现货对 + 20 只美股/ETF，
 * 清单直接从 lib/signals.ts 引用，不另维护一份）。
 *
 * 取数（只用**已收盘日线**，正在形成的那根一律丢弃）：
 * - 币圈：Binance 公开数据域 data-api.binance.vision 日线（limit 1000，
 *   约 2.7 年），单标的失败时降级 OKX 公开 candles（1D，只取 confirm=1，
 *   上限 300 根，历史比 Binance 短，覆盖区间按实算如实标注）。
 * - 美股：Yahoo Finance v8 chart 日线 range=5y（query1 → query2 容错）；
 *   当日日线在美东收盘前视为未收盘、丢弃；整类失败时返回
 *   stocksUnavailable 标记，页面如实留空，绝不编造数据补位。
 *
 * 形态口径（MA 均为收盘价简单移动平均；「此前 20 日均量」指触发日之前
 * 20 根日线的成交量均值，不含触发日；页面口径卡同步公示）：
 * 1. ma-cross 均线金叉：昨日 MA5 ≤ MA20、今日 MA5 > MA20，且今日量 > 此前 20 日均量。
 * 2. volume-breakout 放量突破：今日收盘 > 此前 20 日最高收盘，且今日量 ≥ 此前 20 日均量 ×1.5。
 * 3. long-lower-shadow 下跌后长下影：此前 10 日累计涨跌 < 0；今日下影线
 *    （min(开,收) − 最低）≥ 2 × 实体 |收−开|，且收盘 ≥ 最低 + 0.7 ×（最高−最低）。
 * 4. shrink-consolidation 缩量整理：近 10 日振幅（最高−最低）/今日收盘 ≤ 10%，
 *    今日量 < 此前 20 日均量，且今日收盘 > MA20。
 * 5. shrink-pullback 缩量回踩均线：MA20 今日 > 5 日前 MA20；昨日收盘 > 昨日 MA20；
 *    今日最低位于今日 MA20 的 ±2% 内；今日收盘 ≥ MA20；今日量 < 此前 20 日均量 ×80%。
 * 6. oversold-reversal 超跌后转强：截至昨日近 20 日跌幅 ≥ 15%（昨日收盘 vs
 *    21 日前收盘）；昨日收盘 ≤ 昨日 MA5、今日收盘 > 今日 MA5；今日收阳。
 *
 * 回测口径：对每标的历史逐日跑同一形态定义；同一标的同一形态两次触发
 * 间隔 < 10 个交易日只计第一次；每次触发记录其后 5/10/20 个交易日的
 * 收盘到收盘收益，未到期的触发不进该周期分母。统计为全标的池汇总，
 * 未计交易成本与滑点。
 */

import { CRYPTO_ASSETS, STOCK_ASSETS, type Candle } from "./signals";

export type PatternId =
  | "ma-cross"
  | "volume-breakout"
  | "long-lower-shadow"
  | "shrink-consolidation"
  | "shrink-pullback"
  | "oversold-reversal";

export const PATTERN_IDS: PatternId[] = [
  "ma-cross",
  "volume-breakout",
  "long-lower-shadow",
  "shrink-consolidation",
  "shrink-pullback",
  "oversold-reversal",
];

export type MetricKey =
  | "volRatio"
  | "maGapPct"
  | "breakPct"
  | "shadowSharePct"
  | "priorChangePct"
  | "rangePct"
  | "lowDistPct"
  | "priorDropPct";

export type PatternMetrics = Partial<Record<MetricKey, number>>;

export interface HorizonStat {
  horizon: 5 | 10 | 20;
  /** 已到期样本数（未到期触发不进分母） */
  samples: number;
  /** 胜率 %（收益 > 0 占比），无样本为 null */
  winRate: number | null;
  /** 平均收益 %，无样本为 null */
  avg: number | null;
  /** 中位数收益 %，无样本为 null */
  median: number | null;
}

export interface TodayHit {
  symbol: string;
  name: { zh: string; tw: string; en: string };
  kind: "crypto" | "stock";
  price: number;
  /** 最近已收盘日线涨跌 %（vs 前一根收盘） */
  changePct: number | null;
  metrics: PatternMetrics;
}

export interface PatternEvent {
  symbol: string;
  name: { zh: string; tw: string; en: string };
  kind: "crypto" | "stock";
  /** 触发日（该标的日线日期，UTC/交易日口径的 ISO 日期） */
  date: string;
  ts: number;
  /** 触发后 N 个交易日收盘到收盘收益 %；null = 未到期 */
  ret5: number | null;
  ret10: number | null;
  ret20: number | null;
}

export interface PatternResult {
  id: PatternId;
  /** 去重后的历史触发总数（全标的池） */
  totalEvents: number;
  horizons: HorizonStat[];
  todayHits: TodayHit[];
  /** 最近触发（去重后），最多 15 条，新→旧 */
  recentEvents: PatternEvent[];
}

export interface PatternsPayload {
  scannedAt: string;
  coverage: {
    symbolsTotal: number;
    symbolsWithData: number;
    cryptoWithData: number;
    stockWithData: number;
    /** 实际取到的日线数据起止（全池最早一根 / 最新已收盘一根） */
    dataStart: string | null;
    dataEnd: string | null;
    /** 实际回测事件起止（全池最早 / 最晚一次触发） */
    eventStart: string | null;
    eventEnd: string | null;
  };
  patterns: PatternResult[];
  stocksUnavailable?: boolean;
  cryptoUnavailable?: boolean;
  error?: string;
}

type AssetConfig = (typeof CRYPTO_ASSETS)[number];

/* ---------------- 通用取数（与 lib/signals.ts 同一写法） ---------------- */

async function fetchJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.split("?")[0]}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length) as R[];
  let idx = 0;
  const workers = Array.from(
    { length: Math.min(size, items.length) },
    async () => {
      while (idx < items.length) {
        const i = idx++;
        out[i] = await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

/* ---------------- 日线取数 ---------------- */

const BINANCE_BASE = "https://data-api.binance.vision";

async function fetchBinanceDaily(symbol: string): Promise<Candle[]> {
  const j = (await fetchJson(
    `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}USDT&interval=1d&limit=1000`,
  )) as unknown[][];
  const now = Date.now();
  const out: Candle[] = [];
  for (const r of j) {
    if (Number(r[6]) >= now) continue; // 丢弃正在形成的日线
    out.push({
      t: Number(r[0]),
      o: Number(r[1]),
      h: Number(r[2]),
      l: Number(r[3]),
      c: Number(r[4]),
      v: Number(r[5]),
    });
  }
  return out;
}

async function fetchOkxDaily(symbol: string): Promise<Candle[]> {
  const j = (await fetchJson(
    `https://www.okx.com/api/v5/market/candles?instId=${symbol}-USDT&bar=1D&limit=300`,
  )) as { code: string; data: string[][] };
  if (j.code !== "0" || !Array.isArray(j.data)) throw new Error("okx candles");
  const out: Candle[] = [];
  for (const r of j.data) {
    if (r[8] !== "1") continue; // 只取已收盘（confirm=1）
    out.push({
      t: Number(r[0]),
      o: Number(r[1]),
      h: Number(r[2]),
      l: Number(r[3]),
      c: Number(r[4]),
      v: Number(r[5]),
    });
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}

/* 美东日期与收盘判断（与 lib/signals.ts 同一口径的小份实现） */
const etDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const etClockFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
});

function etDateKey(ts: number): string {
  return etDateFmt.format(new Date(ts));
}

function etSessionOpen(now: number): boolean {
  const parts = etClockFmt.formatToParts(new Date(now));
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm < 16 * 60;
}

interface YahooDailyChart {
  timestamps: number[];
  quote: {
    open: (number | null)[];
    high: (number | null)[];
    low: (number | null)[];
    close: (number | null)[];
    volume: (number | null)[];
  };
}

async function fetchYahooDaily(symbol: string): Promise<Candle[]> {
  let lastErr: unknown = null;
  let chart: YahooDailyChart | null = null;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const j = (await fetchJson(
        `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5y&includePrePost=false`,
      )) as {
        chart?: {
          result?: {
            timestamp?: number[];
            indicators?: { quote?: YahooDailyChart["quote"][] };
          }[];
        };
      };
      const r = j?.chart?.result?.[0];
      if (r?.timestamp && r.indicators?.quote?.[0]) {
        chart = { timestamps: r.timestamp, quote: r.indicators.quote[0] };
        break;
      }
      lastErr = new Error("yahoo: empty chart result");
    } catch (err) {
      lastErr = err;
    }
  }
  if (!chart) throw lastErr ?? new Error("yahoo unavailable");

  const now = Date.now();
  const todayKey = etDateKey(now);
  const sessionOpen = etSessionOpen(now);
  const out: Candle[] = [];
  const { timestamps, quote } = chart;
  for (let i = 0; i < timestamps.length; i++) {
    const c = quote.close[i];
    const o = quote.open[i];
    const h = quote.high[i];
    const l = quote.low[i];
    if (c == null || o == null || h == null || l == null) continue;
    const t = timestamps[i] * 1000;
    // 只用已收盘日线：当日日线在美东收盘（16:00 ET）前一律丢弃
    const key = etDateKey(t);
    if (key > todayKey) continue;
    if (key === todayKey && sessionOpen) continue;
    out.push({ t, o, h, l, c, v: quote.volume[i] ?? 0 });
  }
  out.sort((a, b) => a.t - b.t);
  // 与 signals 同一处理：剥尾部连续的零量占位根（非真实成交）
  if (out.some((b) => b.v > 0)) {
    while (out.length > 0 && out[out.length - 1].v === 0) out.pop();
  }
  return out;
}

/* ---------------- 形态引擎 ---------------- */

/** 收盘价简单移动平均；不足 period 根处为 null */
function smaSeries(values: number[], period: number): (number | null)[] {
  const out = new Array<number | null>(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

interface Prepared {
  candles: Candle[];
  ma5: (number | null)[];
  ma20: (number | null)[];
  /** 成交量前缀和，avgVolPrior 用 */
  volPrefix: number[];
}

function prepare(candles: Candle[]): Prepared {
  const closes = candles.map((b) => b.c);
  const volPrefix = new Array<number>(candles.length + 1).fill(0);
  for (let i = 0; i < candles.length; i++) {
    volPrefix[i + 1] = volPrefix[i] + candles[i].v;
  }
  return {
    candles,
    ma5: smaSeries(closes, 5),
    ma20: smaSeries(closes, 20),
    volPrefix,
  };
}

/** 此前 n 根（不含 i）的成交量均值；历史不足返回 null */
function avgVolPrior(p: Prepared, i: number, n = 20): number | null {
  if (i < n) return null;
  return (p.volPrefix[i] - p.volPrefix[i - n]) / n;
}

/**
 * 在索引 i（触发日）判定形态；命中返回关键数值，未命中返回 null。
 * 所有定义与文件头口径逐条对应，页面口径卡同步公示。
 */
function evalPatternAt(
  id: PatternId,
  p: Prepared,
  i: number,
): PatternMetrics | null {
  const cs = p.candles;
  const bar = cs[i];
  switch (id) {
    case "ma-cross": {
      const ma5Prev = p.ma5[i - 1];
      const ma20Prev = p.ma20[i - 1];
      const ma5Now = p.ma5[i];
      const ma20Now = p.ma20[i];
      const avg = avgVolPrior(p, i);
      if (
        ma5Prev == null || ma20Prev == null || ma5Now == null ||
        ma20Now == null || avg == null || avg <= 0
      ) return null;
      if (!(ma5Prev <= ma20Prev && ma5Now > ma20Now)) return null;
      if (!(bar.v > avg)) return null;
      return {
        volRatio: bar.v / avg,
        maGapPct: (ma5Now / ma20Now - 1) * 100,
      };
    }
    case "volume-breakout": {
      const avg = avgVolPrior(p, i);
      if (avg == null || avg <= 0 || i < 20) return null;
      let priorMaxClose = -Infinity;
      for (let j = i - 20; j < i; j++) {
        if (cs[j].c > priorMaxClose) priorMaxClose = cs[j].c;
      }
      if (!(bar.c > priorMaxClose)) return null;
      if (!(bar.v >= 1.5 * avg)) return null;
      return {
        volRatio: bar.v / avg,
        breakPct: (bar.c / priorMaxClose - 1) * 100,
      };
    }
    case "long-lower-shadow": {
      if (i < 11) return null;
      const priorChange = (cs[i - 1].c / cs[i - 11].c - 1) * 100;
      if (!(priorChange < 0)) return null;
      const range = bar.h - bar.l;
      if (!(range > 0)) return null;
      const lower = Math.min(bar.o, bar.c) - bar.l;
      const body = Math.abs(bar.c - bar.o);
      if (!(lower > 0 && lower >= 2 * body)) return null;
      if (!(bar.c >= bar.l + 0.7 * range)) return null;
      return {
        shadowSharePct: (lower / range) * 100,
        priorChangePct: priorChange,
      };
    }
    case "shrink-consolidation": {
      const avg = avgVolPrior(p, i);
      const ma20Now = p.ma20[i];
      if (avg == null || ma20Now == null || i < 9) return null;
      let maxH = -Infinity;
      let minL = Infinity;
      for (let j = i - 9; j <= i; j++) {
        if (cs[j].h > maxH) maxH = cs[j].h;
        if (cs[j].l < minL) minL = cs[j].l;
      }
      const ampPct = ((maxH - minL) / bar.c) * 100;
      if (!(ampPct <= 10)) return null;
      if (!(bar.v < avg)) return null;
      if (!(bar.c > ma20Now)) return null;
      // 走到这里必有 bar.v < avg 且 bar.v ≥ 0，故 avg > 0
      return { rangePct: ampPct, volRatio: bar.v / avg };
    }
    case "shrink-pullback": {
      const avg = avgVolPrior(p, i);
      const ma20Now = p.ma20[i];
      const ma20Prev = p.ma20[i - 1];
      const ma20FiveAgo = p.ma20[i - 5];
      if (
        avg == null || ma20Now == null || ma20Prev == null ||
        ma20FiveAgo == null
      ) return null;
      if (!(ma20Now > ma20FiveAgo)) return null;
      if (!(cs[i - 1].c > ma20Prev)) return null;
      if (!(bar.l >= 0.98 * ma20Now && bar.l <= 1.02 * ma20Now)) return null;
      if (!(bar.c >= ma20Now)) return null;
      if (!(bar.v < 0.8 * avg)) return null;
      // 走到这里必有 bar.v < 0.8 × avg 且 bar.v ≥ 0，故 avg > 0
      return { lowDistPct: (bar.l / ma20Now - 1) * 100, volRatio: bar.v / avg };
    }
    case "oversold-reversal": {
      const ma5Prev = p.ma5[i - 1];
      const ma5Now = p.ma5[i];
      if (ma5Prev == null || ma5Now == null || i < 21) return null;
      const drop = (cs[i - 1].c / cs[i - 21].c - 1) * 100;
      if (!(drop <= -15)) return null;
      if (!(cs[i - 1].c <= ma5Prev && bar.c > ma5Now)) return null;
      if (!(bar.c > bar.o)) return null;
      return { priorDropPct: drop };
    }
  }
}

/* ---------------- 回测与扫描 ---------------- */

const HORIZONS = [5, 10, 20] as const;
/** 同一标的同一形态两次触发间隔 < 10 个交易日只计第一次 */
const DEDUP_GAP = 10;

function isoDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

interface SymbolSeries {
  cfg: AssetConfig;
  candles: Candle[];
}

function computePattern(
  id: PatternId,
  series: SymbolSeries[],
): { result: PatternResult; eventMinTs: number | null; eventMaxTs: number | null } {
  const rets: Record<number, number[]> = { 5: [], 10: [], 20: [] };
  const events: PatternEvent[] = [];
  const todayHits: TodayHit[] = [];
  let totalEvents = 0;
  let eventMinTs: number | null = null;
  let eventMaxTs: number | null = null;

  for (const { cfg, candles } of series) {
    if (candles.length < 30) continue;
    const p = prepare(candles);
    const n = candles.length;
    let lastKept = -Infinity;

    for (let i = 0; i < n; i++) {
      const metrics = evalPatternAt(id, p, i);
      if (i === n - 1 && metrics) {
        todayHits.push({
          symbol: cfg.symbol,
          name: cfg.name,
          kind: cfg.kind,
          price: candles[i].c,
          changePct:
            i >= 1 ? (candles[i].c / candles[i - 1].c - 1) * 100 : null,
          metrics,
        });
      }
      if (!metrics) continue;
      if (i - lastKept < DEDUP_GAP) continue;
      lastKept = i;
      totalEvents++;
      if (eventMinTs == null || candles[i].t < eventMinTs) eventMinTs = candles[i].t;
      if (eventMaxTs == null || candles[i].t > eventMaxTs) eventMaxTs = candles[i].t;
      const ev: PatternEvent = {
        symbol: cfg.symbol,
        name: cfg.name,
        kind: cfg.kind,
        date: isoDate(candles[i].t),
        ts: candles[i].t,
        ret5: null,
        ret10: null,
        ret20: null,
      };
      for (const h of HORIZONS) {
        if (i + h < n) {
          const r = (candles[i + h].c / candles[i].c - 1) * 100;
          rets[h].push(r);
          if (h === 5) ev.ret5 = r;
          else if (h === 10) ev.ret10 = r;
          else ev.ret20 = r;
        }
      }
      events.push(ev);
    }
  }

  events.sort((a, b) => b.ts - a.ts || a.symbol.localeCompare(b.symbol));

  const horizons: HorizonStat[] = HORIZONS.map((h) => {
    const arr = rets[h];
    if (arr.length === 0) {
      return { horizon: h, samples: 0, winRate: null, avg: null, median: null };
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const wins = arr.filter((r) => r > 0).length;
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      horizon: h,
      samples: arr.length,
      winRate: (wins / arr.length) * 100,
      avg: arr.reduce((s, r) => s + r, 0) / arr.length,
      median,
    };
  });

  return {
    result: {
      id,
      totalEvents,
      horizons,
      todayHits,
      recentEvents: events.slice(0, 15),
    },
    eventMinTs,
    eventMaxTs,
  };
}

export async function fetchPatternScan(): Promise<PatternsPayload> {
  const cryptoSeries: SymbolSeries[] = await mapPool(CRYPTO_ASSETS, 8, async (cfg) => {
    let candles: Candle[] = [];
    try {
      candles = await fetchBinanceDaily(cfg.symbol);
    } catch {
      /* 降级 OKX */
    }
    if (candles.length === 0) {
      try {
        candles = await fetchOkxDaily(cfg.symbol);
      } catch {
        /* 留空，覆盖统计如实反映 */
      }
    }
    return { cfg, candles };
  });

  const stockSeries: SymbolSeries[] = await mapPool(STOCK_ASSETS, 6, async (cfg) => {
    let candles: Candle[] = [];
    try {
      candles = await fetchYahooDaily(cfg.symbol);
    } catch {
      /* 留空 */
    }
    return { cfg, candles };
  });

  const all = [...cryptoSeries, ...stockSeries];
  const withData = all.filter((s) => s.candles.length >= 30);
  if (withData.length === 0) {
    throw new Error("patterns: all data sources unavailable");
  }

  let dataStart: number | null = null;
  let dataEnd: number | null = null;
  for (const s of withData) {
    const first = s.candles[0].t;
    const last = s.candles[s.candles.length - 1].t;
    if (dataStart == null || first < dataStart) dataStart = first;
    if (dataEnd == null || last > dataEnd) dataEnd = last;
  }

  const computed = PATTERN_IDS.map((id) => computePattern(id, withData));
  const patterns = computed.map((c) => c.result);

  // 回测实际覆盖区间 = 全部去重事件（非仅最近 15 条）的最早 / 最晚触发日
  let eventMinTs: number | null = null;
  let eventMaxTs: number | null = null;
  for (const c of computed) {
    if (c.eventMinTs != null && (eventMinTs == null || c.eventMinTs < eventMinTs)) {
      eventMinTs = c.eventMinTs;
    }
    if (c.eventMaxTs != null && (eventMaxTs == null || c.eventMaxTs > eventMaxTs)) {
      eventMaxTs = c.eventMaxTs;
    }
  }
  const eventStart = eventMinTs != null ? isoDate(eventMinTs) : null;
  const eventEnd = eventMaxTs != null ? isoDate(eventMaxTs) : null;

  return {
    scannedAt: new Date().toISOString(),
    coverage: {
      symbolsTotal: all.length,
      symbolsWithData: withData.length,
      cryptoWithData: cryptoSeries.filter((s) => s.candles.length >= 30).length,
      stockWithData: stockSeries.filter((s) => s.candles.length >= 30).length,
      dataStart: dataStart != null ? isoDate(dataStart) : null,
      dataEnd: dataEnd != null ? isoDate(dataEnd) : null,
      eventStart,
      eventEnd,
    },
    patterns,
    stocksUnavailable:
      stockSeries.filter((s) => s.candles.length >= 30).length === 0,
    cryptoUnavailable:
      cryptoSeries.filter((s) => s.candles.length >= 30).length === 0,
  };
}
