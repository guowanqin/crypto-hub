/**
 * 利空出尽指数（/tool/likong-index）的数据层与算法。
 *
 * 想法（站长原意）：「利空出尽就是利好」这类话在媒体上被喊得越响，
 * 越说明坏消息已被反复讨论、恐慌接近极值，阶段底部往往不远。本页把
 * 这句话族在全球新闻里的提及热度做成 0–100 的逆向情绪指数，并把每
 * 一次「喊声高潮」与 BTC / ETH / 标普 500 / 纳斯达克其后的真实涨跌
 * 对照，准不准由全部历史事件说话，不挑样本。
 *
 * 数据（静态文件 lib/data/likong-index.json，由 scripts/sync-likong.mjs
 * 经本站 GDELT 代理 /api/likong-src 生成后提交入库）：
 * - 来源 GDELT DOC 2.0 的 timelinevol（Volume Intensity）：每个词组
 *   每天的提及量占 GDELT 全部监测新闻量的百分比。这是**新闻媒体**
 *   口径，不是社交媒体全量：X（推特）全量搜索需付费 API，本版未接入，
 *   页面口径卡如实说明。数据文件里的 socialSample 数组为社交采样预留，
 *   有数据才渲染并标注「社交采样（估算）」。
 * - 词组（lib/likong-config.ts 单一事实源）：主词条「利空出尽」权重 3；
 *   扩展词「利空落地」「坏消息出尽」权重 2、「该跌不跌」权重 1；
 *   绝望组「割肉离场」「爆仓潮」权重 1（「恐慌抛售」实测覆盖过稀剔除）。查询形式经实测选定为不带引号的单
 *   关键词（带引号短语被 GDELT 以 "phrase is too short" 拒绝）。
 *
 * 算法（与页面口径卡同步公示）：
 * 1. 每组日提及占比 → 相对过去 90 天（不含当日）滚动基线的 z 分数：
 *    基线不足 30 天不出值；标准差下限取 max(σ, 基线均值×0.5)，z 截断 ±8，
 *    防稀疏序列在静默期把单日提及放大成天文数字。
 * 2. 各组 z 按权重加权平均 → 全期经验分位映射到 0–100（中位秩）。
 * 3. 3 日尾随平滑（只用当日及此前，不偷看未来）。
 * 4. 档位：<40 平静 / 40–70 升温 / >70 高潮。
 * 5. 高潮事件：平滑值上穿 70 起、回到 70 以下止为一次 excursion，
 *    取期间峰值日；峰值日相距 <10 天的 excursion 合并，只留更高峰值。
 * 6. 事件收益：峰值日收盘（当日非交易日取其后第一个交易日收盘）为
 *    基准，其后 +7 / +30 个**自然日**的首个交易日收盘与基准之比；
 *    数据缺失或未到期留空，不进统计分母。价格管道与 signal-scanner /
 *    pattern-scanner 同一口径：币圈 Binance 公开数据域日线（只用已
 *    收盘），美股指数 Yahoo Finance v8 chart 日线（query1 → query2
 *    容错，只用已收盘，美东日期）。
 */

import rawData from "./data/likong-index.json";
import {
  LIKONG_GROUP_MAP,
  type LikongAssetId,
} from "./likong-config";

export type { LikongAssetId };

/* ---------------- 数据文件类型 ---------------- */

interface LikongDataFile {
  meta: {
    source: string;
    generatedAt: string;
    timespan: string;
    coverageStart: string;
    coverageEnd: string;
    queries: Record<string, string>;
  };
  /** 连续日轴（YYYY-MM-DD，升序），各组 values 与之下标对齐，缺日已补 0 */
  days: string[];
  groups: { id: string; values: number[] }[];
  socialSample: unknown[];
}

const DATA = rawData as unknown as LikongDataFile;

/* ---------------- 对外类型 ---------------- */

export type LikongBand = "calm" | "warming" | "climax";

export interface LikongDayPoint {
  date: string;
  /** 平滑后指数 0–100；基线积累期为 null */
  value: number | null;
}

export interface LikongGroupState {
  id: string;
  kind: "main" | "ext" | "despair";
  weight: number;
  /** 该组自己的子指数（同法计算）当前值 0–100 */
  value: number | null;
  /** 最新一日原始提及占比（%） */
  rawNow: number | null;
  /** 最新一日日期 */
  rawDate: string | null;
  /** 近 120 天原始占比序列（画 sparkline 用） */
  spark: { date: string; value: number }[];
}

export interface LikongEventReturns {
  d7: number | null;
  d30: number | null;
}

export interface LikongEvent {
  /** 峰值日（YYYY-MM-DD） */
  date: string;
  /** excursion 起始日 */
  startDate: string;
  /** 峰值（平滑后指数） */
  peak: number;
  returns: Record<LikongAssetId, LikongEventReturns>;
}

export interface LikongAssetStat {
  asset: LikongAssetId;
  /** 全部事件数 */
  events: number;
  /** 已满 30 天（有 d30）的事件数 */
  matured30: number;
  upShare30: number | null;
  avg30: number | null;
  upShare7: number | null;
  avg7: number | null;
}

export interface LikongPricePoint {
  date: string;
  close: number;
}

export interface LikongPayload {
  /** 本载荷计算时间 */
  generatedAt: string;
  /** 数据文件生成时间（GDELT 同步时间） */
  dataGeneratedAt: string | null;
  coverage: { start: string; end: string } | null;
  current: {
    date: string;
    value: number;
    band: LikongBand;
    /** 较 7 天前变化（指数点） */
    delta7: number | null;
    /** 当前子指数最高的组 id */
    topGroupId: string | null;
    /** 近 7 天内出现过的高潮事件峰值日（无则 null） */
    recentEventDate: string | null;
  } | null;
  series: LikongDayPoint[];
  groups: LikongGroupState[];
  events: LikongEvent[];
  stats: LikongAssetStat[];
  prices: Record<LikongAssetId, LikongPricePoint[]>;
  socialSample: unknown[];
  errors: Record<string, string>;
  error?: string;
}

/* ---------------- 指数算法 ---------------- */

const BASELINE_DAYS = 90;
const MIN_BASELINE = 30;
const Z_CAP = 8;

/** 过去 window 天（不含当日）滚动基线 z 分数；基线不足 MIN_BASELINE 天为 null */
function rollingZ(values: number[]): (number | null)[] {
  const n = values.length;
  const out = new Array<number | null>(n).fill(null);
  // 前缀和 / 平方和，窗口 [i-window, i)
  const pre = new Array<number>(n + 1).fill(0);
  const pre2 = new Array<number>(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    pre[i + 1] = pre[i] + values[i];
    pre2[i + 1] = pre2[i] + values[i] * values[i];
  }
  for (let i = 0; i < n; i++) {
    const from = Math.max(0, i - BASELINE_DAYS);
    const cnt = i - from;
    if (cnt < MIN_BASELINE) continue;
    const mean = (pre[i] - pre[from]) / cnt;
    const variance = Math.max(0, (pre2[i] - pre2[from]) / cnt - mean * mean);
    const std = Math.sqrt(variance);
    const floor = Math.max(std, mean * 0.5, 1e-9);
    const z = (values[i] - mean) / floor;
    out[i] = Math.max(-Z_CAP, Math.min(Z_CAP, z));
  }
  return out;
}

/** 全期经验分位映射到 0–100（中位秩，处理并列） */
function percentileMap(zs: (number | null)[]): (number | null)[] {
  const present = zs.filter((z): z is number => z != null).sort((a, b) => a - b);
  const n = present.length;
  const out = new Array<number | null>(zs.length).fill(null);
  if (n === 0) return out;
  for (let i = 0; i < zs.length; i++) {
    const z = zs[i];
    if (z == null) continue;
    // 二分找并列区间 [lo, hi)
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (present[mid] < z) lo = mid + 1;
      else hi = mid;
    }
    const less = lo;
    let eq = 0;
    while (less + eq < n && present[less + eq] === z) eq++;
    out[i] = ((less + 0.5 * eq) / n) * 100;
  }
  return out;
}

/** 3 日尾随平滑（窗口内取非 null 均值；全 null 则 null） */
function smooth3(values: (number | null)[]): (number | null)[] {
  const out = new Array<number | null>(values.length).fill(null);
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let cnt = 0;
    for (let k = Math.max(0, i - 2); k <= i; k++) {
      const v = values[k];
      if (v != null) {
        sum += v;
        cnt++;
      }
    }
    out[i] = cnt > 0 ? sum / cnt : null;
  }
  return out;
}

export function bandOf(v: number): LikongBand {
  if (v > 70) return "climax";
  if (v >= 40) return "warming";
  return "calm";
}

interface Excursion {
  startIdx: number;
  peakIdx: number;
  peak: number;
}

function findEvents(
  days: string[],
  smoothed: (number | null)[],
): { date: string; startDate: string; peak: number }[] {
  const excursions: Excursion[] = [];
  let cur: Excursion | null = null;
  for (let i = 0; i < smoothed.length; i++) {
    const v = smoothed[i];
    if (cur == null) {
      if (v != null && v > 70) {
        cur = { startIdx: i, peakIdx: i, peak: v };
      }
    } else {
      if (v != null && v > cur.peak) {
        cur.peak = v;
        cur.peakIdx = i;
      }
      if (v == null || v <= 70) {
        excursions.push(cur);
        cur = null;
      }
    }
  }
  if (cur) excursions.push(cur);
  // 峰值日相距 <10 天的合并（只留更高峰值，起始日取更早者）
  const merged: Excursion[] = [];
  for (const ex of excursions) {
    const prev = merged[merged.length - 1];
    if (prev && ex.peakIdx - prev.peakIdx < 10) {
      if (ex.peak > prev.peak) {
        merged[merged.length - 1] = {
          startIdx: prev.startIdx,
          peakIdx: ex.peakIdx,
          peak: ex.peak,
        };
      }
    } else {
      merged.push(ex);
    }
  }
  return merged.map((ex) => ({
    date: days[ex.peakIdx],
    startDate: days[ex.startIdx],
    peak: Math.round(ex.peak * 10) / 10,
  }));
}

/** 计算一条完整的平滑指数序列（单组或合成组共用管线） */
function indexSeries(
  zRows: { z: (number | null)[]; weight: number }[],
  days: string[],
): (number | null)[] {
  const n = days.length;
  const composite = new Array<number | null>(n).fill(null);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let wSum = 0;
    for (const row of zRows) {
      const z = row.z[i];
      if (z != null) {
        sum += z * row.weight;
        wSum += row.weight;
      }
    }
    composite[i] = wSum > 0 ? sum / wSum : null;
  }
  return smooth3(percentileMap(composite));
}

/* ---------------- 价格管道（与 signals / patterns 同口径） ---------------- */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

async function fetchJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const BINANCE_BASE = "https://data-api.binance.vision";

async function fetchBinanceCloses(symbol: string): Promise<LikongPricePoint[]> {
  const j = (await fetchJson(
    `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}USDT&interval=1d&limit=1000`,
  )) as unknown[][];
  const now = Date.now();
  const out: LikongPricePoint[] = [];
  for (const r of j) {
    if (Number(r[6]) >= now) continue; // 丢弃正在形成的日线
    out.push({
      date: new Date(Number(r[0])).toISOString().slice(0, 10),
      close: Number(r[4]),
    });
  }
  return out;
}

/* 美东日期与收盘判断（与 lib/patterns.ts 同一口径） */
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

async function fetchYahooCloses(symbol: string): Promise<LikongPricePoint[]> {
  let lastErr: unknown = null;
  let rows: { t: number; c: number; v: number }[] | null = null;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const j = (await fetchJson(
        `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5y&includePrePost=false`,
      )) as {
        chart?: {
          result?: {
            timestamp?: number[];
            indicators?: {
              quote?: {
                close: (number | null)[];
                volume: (number | null)[];
              }[];
            };
          }[];
        };
      };
      const r = j?.chart?.result?.[0];
      if (r?.timestamp && r.indicators?.quote?.[0]) {
        const q = r.indicators.quote[0];
        rows = [];
        for (let i = 0; i < r.timestamp.length; i++) {
          const c = q.close[i];
          if (c == null) continue;
          rows.push({ t: r.timestamp[i] * 1000, c, v: q.volume[i] ?? 0 });
        }
        break;
      }
      lastErr = new Error("yahoo: empty chart result");
    } catch (err) {
      lastErr = err;
    }
  }
  if (!rows) throw lastErr ?? new Error("yahoo unavailable");

  const now = Date.now();
  const todayKey = etDateKey(now);
  const sessionOpen = etSessionOpen(now);
  const out: LikongPricePoint[] = [];
  for (const row of rows) {
    const key = etDateKey(row.t);
    if (key > todayKey) continue;
    if (key === todayKey && sessionOpen) continue; // 当日未收盘丢弃
    out.push({ date: key, close: row.c });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  // 剥尾部零量占位根（与 patterns 同处理）：按日期去重后从尾部数
  const volByDate = new Map<string, number>();
  for (const row of rows) volByDate.set(etDateKey(row.t), row.v);
  if ([...volByDate.values()].some((v) => v > 0)) {
    while (
      out.length > 0 &&
      (volByDate.get(out[out.length - 1].date) ?? 0) === 0
    ) {
      out.pop();
    }
  }
  return out;
}

/* ---------------- 事件收益 ---------------- */

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  return Math.round(
    (new Date(`${b}T00:00:00Z`).getTime() -
      new Date(`${a}T00:00:00Z`).getTime()) /
      86400000,
  );
}

/** 峰值日收盘 → +N 自然日首个交易日收盘的涨跌幅（%）；缺失/未到期返回 null */
function forwardReturn(
  closes: LikongPricePoint[],
  eventDate: string,
  days: number,
): number | null {
  if (closes.length === 0) return null;
  const base = closes.find((p) => p.date >= eventDate);
  if (!base) return null;
  const targetDate = addDays(eventDate, days);
  const tgt = closes.find((p) => p.date >= targetDate);
  if (!tgt) return null;
  if (tgt.date <= base.date) return null;
  // 目标点离目标日太远说明中间有数据大洞，不硬算
  if (dayDiff(targetDate, tgt.date) > 10) return null;
  return (tgt.close / base.close - 1) * 100;
}

/* ---------------- 组装载荷 ---------------- */

const ASSET_IDS: LikongAssetId[] = ["BTC", "ETH", "SPX", "IXIC"];

export async function fetchLikongBoard(): Promise<LikongPayload> {
  const days = DATA.days ?? [];
  const errors: Record<string, string> = {};

  // 各组 z 与子指数
  const groupRows = (DATA.groups ?? [])
    .filter((g) => LIKONG_GROUP_MAP[g.id] && g.values.length === days.length)
    .map((g) => {
      const def = LIKONG_GROUP_MAP[g.id];
      const z = rollingZ(g.values);
      const sub = smooth3(percentileMap(z));
      return { def, values: g.values, z, sub };
    });

  const smoothed = indexSeries(
    groupRows.map((r) => ({ z: r.z, weight: r.def.weight })),
    days,
  );
  const series: LikongDayPoint[] = days.map((date, i) => ({
    date,
    value: smoothed[i] != null ? Math.round(smoothed[i]! * 10) / 10 : null,
  }));

  // 当前状态
  let current: LikongPayload["current"] = null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = series[i].value;
    if (v != null) {
      const prev7 =
        i >= 7 && series[i - 7].value != null
          ? v - (series[i - 7].value as number)
          : null;
      current = {
        date: series[i].date,
        value: v,
        band: bandOf(v),
        delta7: prev7 != null ? Math.round(prev7 * 10) / 10 : null,
        topGroupId: null,
        recentEventDate: null,
      };
      break;
    }
  }

  const groups: LikongGroupState[] = groupRows.map((r) => {
    let value: number | null = null;
    for (let i = r.sub.length - 1; i >= 0; i--) {
      if (r.sub[i] != null) {
        value = Math.round(r.sub[i]! * 10) / 10;
        break;
      }
    }
    const lastIdx = r.values.length - 1;
    const sparkStart = Math.max(0, r.values.length - 120);
    return {
      id: r.def.id,
      kind: r.def.kind,
      weight: r.def.weight,
      value,
      rawNow: lastIdx >= 0 ? r.values[lastIdx] : null,
      rawDate: lastIdx >= 0 ? days[lastIdx] : null,
      spark: days.slice(sparkStart).map((date, k) => ({
        date,
        value: r.values[sparkStart + k],
      })),
    };
  });
  if (current) {
    let best: { id: string; v: number } | null = null;
    for (const gs of groups) {
      if (gs.value != null && (best == null || gs.value > best.v)) {
        best = { id: gs.id, v: gs.value };
      }
    }
    current.topGroupId = best?.id ?? null;
  }

  // 事件（先无收益，价格到位后填充）
  const rawEvents = findEvents(days, smoothed);
  if (current) {
    const recent = rawEvents
      .filter((e) => {
        const diff = dayDiff(e.date, current!.date);
        return diff >= 0 && diff <= 7;
      })
      .pop();
    current.recentEventDate = recent?.date ?? null;
  }

  // 价格（四标的并行，单标的失败只影响其收益列）
  const priceResults = await Promise.allSettled([
    fetchBinanceCloses("BTC"),
    fetchBinanceCloses("ETH"),
    fetchYahooCloses("^GSPC"),
    fetchYahooCloses("^IXIC"),
  ]);
  const prices = {} as Record<LikongAssetId, LikongPricePoint[]>;
  ASSET_IDS.forEach((id, i) => {
    const r = priceResults[i];
    if (r.status === "fulfilled") {
      prices[id] = r.value;
    } else {
      prices[id] = [];
      errors[id] = String(r.reason).slice(0, 160);
    }
  });

  const events: LikongEvent[] = rawEvents
    .map((e) => {
      const returns = {} as Record<LikongAssetId, LikongEventReturns>;
      for (const id of ASSET_IDS) {
        returns[id] = {
          d7: forwardReturn(prices[id], e.date, 7),
          d30: forwardReturn(prices[id], e.date, 30),
        };
      }
      return { ...e, returns };
    })
    .reverse(); // 新 → 旧

  const stats: LikongAssetStat[] = ASSET_IDS.map((id) => {
    const d30s = events
      .map((e) => e.returns[id].d30)
      .filter((v): v is number => v != null);
    const d7s = events
      .map((e) => e.returns[id].d7)
      .filter((v): v is number => v != null);
    const avg = (xs: number[]) =>
      xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null;
    const upShare = (xs: number[]) =>
      xs.length
        ? Math.round((xs.filter((x) => x > 0).length / xs.length) * 1000) / 10
        : null;
    return {
      asset: id,
      events: events.length,
      matured30: d30s.length,
      upShare30: upShare(d30s),
      avg30: avg(d30s),
      upShare7: upShare(d7s),
      avg7: avg(d7s),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    dataGeneratedAt: DATA.meta?.generatedAt ?? null,
    coverage:
      days.length > 0
        ? { start: days[0], end: days[days.length - 1] }
        : null,
    current,
    series,
    groups,
    events,
    stats,
    prices,
    socialSample: Array.isArray(DATA.socialSample) ? DATA.socialSample : [],
    errors,
  };
}
