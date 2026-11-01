/**
 * QQQ 定投估值/回测工具：自动取数 + 派生口径 + 定投回测（纯函数）。
 *
 * QQQ = Invesco QQQ Trust（Nasdaq: QQQ），1999-03-10 上市，跟踪纳斯达克 100 指数，
 * 季度分红（有记录以来自 2003-12 起），费率已含在价格里。
 *
 * 取数（服务端 /api/qqq 汇总，沿用本站 CRCL/QQQI 的双源+降级+缓存规范：
 * 任一源失败只降级对应区块，绝不编数）：
 * - 行情（日线）：Yahoo Finance chart 主源（range=2y、interval=1d），供现价、
 *   MA200、52 周高低；Yahoo 会封部分机房 IP，故另有 Cboe delayed quotes CDN
 *   备用源（与 CRCL/QQQI 同路：历史日线 + 现价接口补最后一根）。Cboe 日线仅回溯
 *   到 2004 年，但行情窗口只需近两年，够用。环境变量 QQQ_DISABLE_YAHOO=1 可
 *   强制只走备用源（运维/验证用）。
 * - 回测月线全史（1999-03 至今的月收盘 + 分红事件）：
 *   主源 Yahoo chart（range=max、interval=1mo、events=div）。Yahoo 的 1mo 聚合
 *   不给上市月（1999-03，月中上市），用日线取当月最后交易日收盘补种（已实测：
 *   1999-04 月线收盘与 4/30 日线收盘逐分一致，月线口径 = 月末收盘）。
 *   Yahoo 不可用时兜底：仓库内一次性抓取的数据文件 lib/data/qqq-monthly.json
 *   （asOf 见文件内字段，来源同为 Yahoo 全史）作底，再用 Cboe 日线聚合补 asOf
 *   之后已走完的月份月线、用 stockanalysis 分红接口补 asOf 之后的新分红事件；
 *   payload.history.source 会如实标注走的是哪条路，页面回测区据此标注数据截至。
 * - 估值倍数（可选）：stockanalysis.com ETF 页内嵌 peRatio（12 小时缓存），
 *   拿不到就不出 PE 区块、估值温度退回三项价格指标，不用过期数字冒充实时。
 *
 * 派生口径（全部写在页面上）：
 * - ATH = 全史月收盘与近端日线收盘两者中的最高（收盘口径，非盘中高点）；
 *   回撤 = 1 − 现价 ÷ ATH。
 * - 52 周高低/水位 = 最近 252 个交易日收盘的最高/最低与现价在区间中的位置。
 * - MA200 偏离 = 现价 ÷ 近 200 个交易日收盘均值 − 1。
 * - 估值温度（0–100，越高越「冷」= 价格指标越偏便宜一侧）：三项子分取平均——
 *   MA200 偏离子分 = clamp(50 − 偏离% ÷ 15 × 50)（偏离 −15% 得 100、+15% 得 0）；
 *   距 ATH 回撤子分 = clamp(回撤% ÷ 30 × 100)（回撤 30% 以上得 100、ATH 处得 0）；
 *   52 周水位子分 = 100 − 水位%（区间底部得 100、顶部得 0）。
 *   PE 可用时纳入第四项：PE 子分 = clamp((35 − PE) ÷ (35 − 22) × 100)
 *   （PE ≤22 得 100、≥35 得 0），综合分改为四项平均。
 *   定档：≥65 偏冷、50–65 中性偏冷、35–50 中性偏热、<35 偏热。
 *
 * 回测口径（页面明示）：每月按当月收盘价买入定投金额（股数可小数）；当月分红
 * 按「上月末持股」计算（除息日在月内的先后月线粒度分辨不了，先后口径对 DCA
 * 与一次性买入一致套用），除息所在月月末按当月收盘价处理——再投入开则当月
 * 买回、关则现金累计单列计入期末总资产。年化按月现金流 XIRR 近似；
 * 期间最大回撤按标的月线总回报序列（收盘 + 当月每股分红再投）计，非账户净值
 * 回撤。未计税费与汇率；历史回测不代表未来。
 */

import bundledData from "./data/qqq-monthly.json";

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export interface MonthClose {
  /** YYYY-MM */
  m: string;
  close: number;
}

export interface QqqDiv {
  /** 除息日（美东，YYYY-MM-DD） */
  date: string;
  /** 每股分红（USD） */
  amount: number;
}

export interface QqqQuote {
  /** 最新日线收盘价（USD） */
  price: number;
  prevClose: number;
  changePct: number;
  /** 最新日线日期（美东，YYYY-MM-DD） */
  quoteDate: string;
  /** 近 200 个交易日收盘均值 */
  ma200: number;
  /** 现价相对 MA200 的偏离（%） */
  ma200DevPct: number;
  high52: { value: number; date: string };
  low52: { value: number; date: string };
  /** 现价在 52 周区间的位置（0–100，%） */
  pos52Pct: number;
  /** 历史最高收盘（月线全史 ∪ 近端日线，收盘口径）及其日期（日线为 YYYY-MM-DD，月线为 YYYY-MM） */
  ath: { value: number; date: string };
  /** 距 ATH 回撤（%，正数；现价即 ATH 时为 0） */
  athDrawdownPct: number;
  /** 实际供数源："yahoo" | "cboe" */
  source?: string;
  fetchedAt: string;
}

export type QqqHistorySource = "yahoo" | "bundled" | "bundled+cboe";

export interface QqqHistory {
  /** 月收盘序列（旧→新，只含已走完的月份） */
  months: MonthClose[];
  /** 分红事件（旧→新） */
  divs: QqqDiv[];
  /** 数据截至月份（YYYY-MM）= months 最后一项 */
  throughMonth: string;
  source: QqqHistorySource;
  /** 走兜底文件时其 asOf 月份（YYYY-MM） */
  bundledAsOf?: string;
  fetchedAt: string;
}

export interface QqqPe {
  value: number;
  source: "stockanalysis";
  fetchedAt: string;
}

export type QqqTempBand = "cold" | "cool" | "warm" | "hot";

export interface QqqTemp {
  /** 综合分 0–100（越高越冷） */
  score: number;
  band: QqqTempBand;
  parts: {
    ma200: number;
    ath: number;
    pos52: number;
    /** PE 子分；PE 不可用时为 null 且不计入综合 */
    pe: number | null;
  };
}

export interface QqqPayload {
  fetchedAt: string;
  quote: QqqQuote | null;
  history: QqqHistory | null;
  pe: QqqPe | null;
  temp: QqqTemp | null;
  errors: { quote?: string; history?: string; pe?: string };
}

/* ---------------- 估值温度（纯函数） ---------------- */

export function tempBandForScore(score: number): QqqTempBand {
  if (score >= 65) return "cold";
  if (score >= 50) return "cool";
  if (score >= 35) return "warm";
  return "hot";
}

export function computeTemperature(
  quote: QqqQuote,
  pe: QqqPe | null
): QqqTemp {
  const ma200 = clamp(50 - (quote.ma200DevPct / 15) * 50, 0, 100);
  const ath = clamp((quote.athDrawdownPct / 30) * 100, 0, 100);
  const pos52 = 100 - quote.pos52Pct;
  const pePart =
    pe != null ? clamp(((35 - pe.value) / (35 - 22)) * 100, 0, 100) : null;
  const parts = [ma200, ath, pos52, ...(pePart != null ? [pePart] : [])];
  const score = parts.reduce((s, v) => s + v, 0) / parts.length;
  return {
    score,
    band: tempBandForScore(score),
    parts: { ma200, ath, pos52, pe: pePart },
  };
}

/* ---------------- 取数 ---------------- */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

function nyDate(tsSeconds: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(tsSeconds * 1000));
}

function currentNyYm(): string {
  return nyDate(Math.floor(Date.now() / 1000)).slice(0, 7);
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function fetchText(
  url: string,
  timeoutMs: number,
  accept: string
): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

export interface DayBar {
  date: string; // 美东 YYYY-MM-DD
  close: number;
}

const errMsg = (err: unknown) =>
  (err instanceof Error ? err.message : String(err)).slice(0, 120);

async function fetchYahooChartJson(path: string): Promise<any> {
  const errs: string[] = [];
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      return await fetchJson(`https://${host}${path}`, 12_000);
    } catch (err) {
      errs.push(`${host.split(".")[0]}: ${errMsg(err)}`);
    }
  }
  throw new Error(`yahoo[${errs.join("; ")}]`);
}

function barsFromChart(payload: any): DayBar[] {
  const result = payload?.chart?.result?.[0];
  if (!result) throw new Error("yahoo: empty chart result");
  const ts: number[] = result.timestamp ?? [];
  const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
  const bars: DayBar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c) && c > 0) {
      bars.push({ date: nyDate(ts[i]), close: c });
    }
  }
  return bars;
}

/** Yahoo 日线（range=2y）：行情窗口用。 */
async function fetchYahooDaily(): Promise<DayBar[]> {
  const payload = await fetchYahooChartJson(
    "/v8/finance/chart/QQQ?range=2y&interval=1d&includePrePost=false"
  );
  const bars = barsFromChart(payload);
  if (bars.length < 260) throw new Error("yahoo: too few daily bars");
  return bars;
}

/** 由日线收盘序列算行情（ATH 由 route 结合月线全史另行回填）。 */
export function quoteFromBars(
  bars: DayBar[],
  source: string
): Omit<QqqQuote, "ath" | "athDrawdownPct"> {
  const rows = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (rows.length < 260) throw new Error(`${source}: too few daily bars`);
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const win = rows.slice(-252);
  let high52 = win[0];
  let low52 = win[0];
  for (const r of win) {
    if (r.close > high52.close) high52 = r;
    if (r.close < low52.close) low52 = r;
  }
  const maRows = rows.slice(-200);
  const ma200 = maRows.reduce((s, r) => s + r.close, 0) / maRows.length;
  const span = high52.close - low52.close;
  return {
    price: last.close,
    prevClose: prev.close,
    changePct: (last.close / prev.close - 1) * 100,
    quoteDate: last.date,
    ma200,
    ma200DevPct: (last.close / ma200 - 1) * 100,
    high52: { value: high52.close, date: high52.date },
    low52: { value: low52.close, date: low52.date },
    pos52Pct:
      span > 0 ? clamp(((last.close - low52.close) / span) * 100, 0, 100) : 50,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

/** Cboe delayed quotes CDN 日线（照 CRCL/QQQI 同路处理最后一根补齐）。 */
async function fetchCboeBars(): Promise<DayBar[]> {
  const base = "https://cdn.cboe.com/api/global/delayed_quotes";
  let hist: unknown;
  try {
    hist = await fetchJson(`${base}/charts/historical/QQQ.json`, 12_000);
  } catch (err) {
    throw new Error(`cboe: ${errMsg(err)}`);
  }
  const rawRows = (hist as any)?.data;
  if (!Array.isArray(rawRows)) throw new Error("cboe: bad historical payload");
  const bars: DayBar[] = [];
  for (const r of rawRows) {
    const c = Number(r?.close);
    const date = typeof r?.date === "string" ? r.date : "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(c) && c > 0) {
      bars.push({ date, close: c });
    }
  }
  if (bars.length < 260) throw new Error("cboe: too few daily bars");
  bars.sort((a, b) => (a.date < b.date ? -1 : 1));

  try {
    const q = (await fetchJson(`${base}/quotes/QQQ.json`, 10_000)) as any;
    const close = Number(q?.data?.close);
    const tradeDate =
      typeof q?.data?.last_trade_time === "string"
        ? q.data.last_trade_time.slice(0, 10)
        : "";
    const lastBar = bars[bars.length - 1];
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(tradeDate) &&
      Number.isFinite(close) &&
      close > 0 &&
      tradeDate > lastBar.date
    ) {
      const nowSec = Math.floor(Date.now() / 1000);
      const todayNy = nyDate(nowSec);
      const nyHour = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          hour12: false,
        }).format(new Date())
      );
      if (tradeDate < todayNy || nyHour >= 17) {
        bars.push({ date: tradeDate, close });
      }
    }
  } catch {
    // 现价补根失败不致命：历史序列本身可用（至多慢一个交易日）。
  }
  return bars;
}

/**
 * 取 QQQ 行情日线：Yahoo 主源 → Cboe 备用源（QQQ_DISABLE_YAHOO=1 时跳过
 * Yahoo）。全失败抛合并原因（供 errors 诊断）。
 */
export async function fetchQqqDaily(): Promise<{
  base: Omit<QqqQuote, "ath" | "athDrawdownPct">;
  bars: DayBar[];
}> {
  const errs: string[] = [];
  if (process.env.QQQ_DISABLE_YAHOO !== "1") {
    try {
      const bars = await fetchYahooDaily();
      return { base: quoteFromBars(bars, "yahoo"), bars };
    } catch (err) {
      errs.push(errMsg(err));
    }
  } else {
    errs.push("yahoo skipped (QQQ_DISABLE_YAHOO=1)");
  }
  try {
    const bars = await fetchCboeBars();
    return { base: quoteFromBars(bars, "cboe"), bars };
  } catch (err) {
    errs.push(errMsg(err));
  }
  throw new Error(errs.join(" | "));
}

/** 日线聚合为月收盘（每月最后一个交易日；只收已走完的月份）。 */
export function monthEndsFromDaily(bars: DayBar[]): MonthClose[] {
  const rows = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  const nowYm = currentNyYm();
  const out: MonthClose[] = [];
  for (let i = 0; i < rows.length; i++) {
    const ym = rows[i].date.slice(0, 7);
    const next = rows[i + 1];
    if ((!next || next.date.slice(0, 7) !== ym) && ym < nowYm) {
      out.push({ m: ym, close: rows[i].close });
    }
  }
  return out;
}

/** ATH：全史月收盘与近端日线收盘的最高者（收盘口径）。 */
export function computeAth(
  months: MonthClose[],
  bars: DayBar[] | null
): { value: number; date: string } {
  let best = { value: 0, date: "" };
  for (const mo of months) {
    if (mo.close > best.value) best = { value: mo.close, date: mo.m };
  }
  if (bars) {
    for (const b of bars) {
      if (b.close > best.value) best = { value: b.close, date: b.date };
    }
  }
  return best;
}

/* ---------------- 回测月线全史 ---------------- */

function normalizeMonths(rows: MonthClose[]): MonthClose[] {
  const nowYm = currentNyYm();
  const byM = new Map<string, number>();
  for (const r of rows) {
    if (!/^\d{4}-\d{2}$/.test(r.m)) continue;
    if (r.m >= nowYm) continue; // 当月未走完，不进回测口径
    if (!Number.isFinite(r.close) || r.close <= 0) continue;
    byM.set(r.m, r.close);
  }
  return [...byM.entries()]
    .map(([m, close]) => ({ m, close }))
    .sort((a, b) => (a.m < b.m ? -1 : 1));
}

function normalizeDivs(rows: QqqDiv[]): QqqDiv[] {
  const cutoff = new Date(Date.now() + 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const byDate = new Map<string, number>();
  for (const d of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) continue;
    if (d.date > cutoff) continue;
    if (!Number.isFinite(d.amount) || d.amount <= 0 || d.amount > 3) continue;
    if (!byDate.has(d.date)) byDate.set(d.date, d.amount);
  }
  return [...byDate.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Yahoo 全史月线 + 分红事件；1999-03 用日线月末收盘补种。 */
async function fetchYahooMonthly(): Promise<{
  months: MonthClose[];
  divs: QqqDiv[];
}> {
  const payload = await fetchYahooChartJson(
    "/v8/finance/chart/QQQ?range=max&interval=1mo&events=div&includePrePost=false"
  );
  const result = (payload as any)?.chart?.result?.[0];
  if (!result) throw new Error("yahoo: empty chart result");
  const ts: number[] = result.timestamp ?? [];
  const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
  const rawMonths: MonthClose[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c) && c > 0) {
      rawMonths.push({ m: nyDate(ts[i]).slice(0, 7), close: c });
    }
  }
  let months = normalizeMonths(rawMonths);
  if (months.length < 300) throw new Error("yahoo: too few monthly bars");

  const divMap = result.events?.dividends ?? {};
  const rawDivs: QqqDiv[] = [];
  for (const key of Object.keys(divMap)) {
    const d = divMap[key];
    const amount = Number(d?.amount);
    const t = Number(d?.date);
    if (Number.isFinite(amount) && amount > 0 && Number.isFinite(t) && t > 0) {
      rawDivs.push({ date: nyDate(t), amount });
    }
  }
  const divs = normalizeDivs(rawDivs);
  if (divs.length < 80) throw new Error("yahoo: too few dividend events");

  // 补种 1999-03：Yahoo 的 1mo 聚合自 1999-04 起（上市月中不聚合），
  // 用 1999 年 3 月日线最后一个交易日的收盘作该月月线收盘（口径同月线）。
  if (!months.some((x) => x.m === "1999-03")) {
    try {
      const seedPayload = await fetchYahooChartJson(
        "/v8/finance/chart/QQQ?period1=920160000&period2=923328000&interval=1d&includePrePost=false"
      );
      const seedBars = barsFromChart(seedPayload).filter((b) =>
        b.date.startsWith("1999-03")
      );
      if (seedBars.length > 0) {
        const last = seedBars[seedBars.length - 1];
        months = normalizeMonths([...months, { m: "1999-03", close: last.close }]);
      }
    } catch {
      // 补种失败不致命：回测从 1999-04 起，一样可用。
    }
  }
  return { months, divs };
}

const MONTH_EN: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/**
 * stockanalysis 分红（兜底补充用，只有近些年的事件）：结构化接口优先，
 * SSR 页内嵌 history 与表格行兜底（同 QQQI 的三段解析）。
 */
async function fetchStockAnalysisDivs(): Promise<QqqDiv[]> {
  const errs: string[] = [];
  try {
    const payload = JSON.parse(
      await fetchText(
        "https://stockanalysis.com/api/symbol/e/qqq/dividend",
        12_000,
        "application/json"
      )
    ) as any;
    const hist = payload?.data?.history;
    if (!Array.isArray(hist)) throw new Error("bad api payload");
    const rows: QqqDiv[] = [];
    for (const r of hist) {
      const amount = Number(String(r?.amt ?? "").replace(/[^0-9.]/g, ""));
      const date = typeof r?.dt === "string" ? r.dt : "";
      rows.push({ date, amount });
    }
    const divs = normalizeDivs(rows);
    if (divs.length >= 10) return divs;
    errs.push(`api: only ${divs.length} usable rows`);
  } catch (err) {
    errs.push(`api: ${errMsg(err)}`);
  }
  try {
    const html = await fetchText(
      "https://stockanalysis.com/etf/qqq/dividend/",
      12_000,
      "text/html"
    );
    const rows: QqqDiv[] = [];
    for (const m of html.matchAll(
      /\{dt:"(\d{4}-\d{2}-\d{2})",amt:"\$([0-9.]+)"/g
    )) {
      rows.push({ date: m[1], amount: Number(m[2]) });
    }
    if (rows.length === 0) {
      for (const m of html.matchAll(
        /<td[^>]*>([A-Z][a-z]{2}) (\d{1,2}), (\d{4})<\/td><!--\]--><!--\[6--><td[^>]*>\$([0-9.]+)<\/td>/g
      )) {
        const mm = MONTH_EN[m[1]];
        if (mm) {
          rows.push({
            date: `${m[3]}-${mm}-${m[2].padStart(2, "0")}`,
            amount: Number(m[4]),
          });
        }
      }
    }
    const divs = normalizeDivs(rows);
    if (divs.length >= 10) return divs;
    errs.push(`page: only ${divs.length} usable rows`);
  } catch (err) {
    errs.push(`page: ${errMsg(err)}`);
  }
  throw new Error(`stockanalysis[${errs.join("; ")}]`);
}

interface BundledFile {
  asOfMonth: string;
  months: MonthClose[];
  divs: QqqDiv[];
}

const BUNDLED = bundledData as unknown as BundledFile;

/**
 * 取回测全史：Yahoo 主源全量；不可用时走兜底文件（asOf 见 BUNDLED.asOfMonth）
 * 并尽力补新：Cboe 日线聚合补 asOf 之后的月线、stockanalysis 补新分红。
 * bundledAsOf 始终带回（走 Yahoo 时即 throughMonth），供页面如实标注。
 */
export async function fetchQqqHistory(): Promise<QqqHistory> {
  if (process.env.QQQ_DISABLE_YAHOO !== "1") {
    try {
      const { months, divs } = await fetchYahooMonthly();
      return {
        months,
        divs,
        throughMonth: months[months.length - 1].m,
        source: "yahoo",
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      // 落到兜底：兜底文件本身就是同一 Yahoo 全史的一次性抓取，不编数。
    }
  }
  const baseMonths = normalizeMonths(BUNDLED.months);
  const baseDivs = normalizeDivs(BUNDLED.divs);
  let months = baseMonths;
  let supplemented = false;
  try {
    const cboeMonths = monthEndsFromDaily(await fetchCboeBars());
    const extra = cboeMonths.filter(
      (mo) => mo.m > BUNDLED.asOfMonth && !baseMonths.some((b) => b.m === mo.m)
    );
    if (extra.length > 0) {
      months = normalizeMonths([...baseMonths, ...extra]);
      supplemented = true;
    }
  } catch {
    // Cboe 补月失败：只用兜底文件（截至 asOf，页面如实标注）。
  }
  let divs = baseDivs;
  try {
    const saDivs = await fetchStockAnalysisDivs();
    const lastBundled = baseDivs.length
      ? baseDivs[baseDivs.length - 1].date
      : "0000-00-00";
    const fresh = saDivs.filter((d) => d.date > lastBundled);
    if (fresh.length > 0) divs = normalizeDivs([...baseDivs, ...fresh]);
  } catch {
    // 分红补充失败：用兜底文件内的分红（截至其最后一次除息）。
  }
  return {
    months,
    divs,
    throughMonth: months[months.length - 1].m,
    source: supplemented ? "bundled+cboe" : "bundled",
    bundledAsOf: BUNDLED.asOfMonth,
    fetchedAt: new Date().toISOString(),
  };
}

/* ---------------- PE（可选，stockanalysis 内嵌值） ---------------- */

/**
 * stockanalysis ETF 页内嵌 peRatio（如 `peRatio:"27.57"`）。拿不到/越界
 * 就抛错走「无 PE」降级——页面不出 PE 区块，估值温度只用三项价格指标。
 */
export async function fetchQqqPe(): Promise<QqqPe> {
  const html = await fetchText(
    "https://stockanalysis.com/etf/qqq/",
    12_000,
    "text/html"
  );
  const m = html.match(/peRatio:"([0-9]+(?:\.[0-9]+)?)"/);
  if (!m) throw new Error("stockanalysis: peRatio not found");
  const value = Number(m[1]);
  if (!Number.isFinite(value) || value < 5 || value > 80) {
    throw new Error("stockanalysis: peRatio out of range");
  }
  return { value, source: "stockanalysis", fetchedAt: new Date().toISOString() };
}

/* ---------------- 定投回测（纯函数，前后端同一口径） ---------------- */

export interface BacktestInputs {
  /** 起始年月 YYYY-MM（须在 months 内） */
  startYm: string;
  /** 每月定投金额（USD） */
  monthlyUsd: number;
  /** 分红再投入开关 */
  reinvest: boolean;
}

export interface BacktestYearRow {
  year: number;
  /** 该年定投投入合计（USD，不含再投入的分红） */
  contributed: number;
  /** 该年分红合计（USD，再投入与否都计） */
  dividends: number;
  /** 年末股数（该年最后一个数据月月末） */
  endShares: number;
  /** 年末总资产（股数 × 月收盘 + 未再投入现金分红累计） */
  endAssets: number;
}

export interface LumpResult {
  /** 期末总资产（同口径：持股值 + 未再投入现金分红） */
  totalAssets: number;
  /** 年化（单笔现金流，%）；区间不足 2 个月时为 null */
  annualizedPct: number | null;
}

export interface BacktestResult {
  startYm: string;
  endYm: string;
  monthCount: number;
  /** 累计定投投入（USD） */
  contributed: number;
  /** 累计分红（USD，再投入与否都计） */
  totalDividends: number;
  /** 未再投入的现金分红累计（再投入开时为 0） */
  cashDividends: number;
  endShares: number;
  /** 期末月收盘价（USD） */
  endPrice: number;
  /** 摊薄成本 = 累计投入 ÷ 期末股数（再投入买入的股数未另计投入，页面注明） */
  avgCost: number;
  /** 期末股票市值 = 股数 × 期末月收盘 */
  sharesValue: number;
  /** 期末总资产 = 股票市值 + 现金分红累计 */
  totalAssets: number;
  /** 年化收益率（月现金流 XIRR 近似，%）；不可解时为 null */
  xirrPct: number | null;
  /** 期间标的最大回撤（月线总回报口径，%，正数） */
  maxDrawdownPct: number;
  lump: LumpResult;
  yearly: BacktestYearRow[];
}

/** 每月现金流 XIRR（二分法）：flows[k] 为第 k 个月月末现金流（流出为负）。 */
function xirrMonthly(flows: number[]): number | null {
  const npv = (r: number) =>
    flows.reduce((s, f, k) => s + f / Math.pow(1 + r, k / 12), 0);
  let lo = -0.9999;
  let hi = 100;
  let flo = npv(lo);
  let fhi = npv(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) {
    return null;
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = npv(mid);
    if (flo * fm <= 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return ((lo + hi) / 2) * 100;
}

export function runBacktest(
  months: MonthClose[],
  divs: QqqDiv[],
  input: BacktestInputs
): BacktestResult | null {
  const startIdx = months.findIndex((x) => x.m === input.startYm);
  if (startIdx < 0 || startIdx >= months.length) return null;
  const endIdx = months.length - 1;
  const n = endIdx - startIdx + 1;

  const divPerShareByMonth = new Map<string, number>();
  for (const d of divs) {
    const ym = d.date.slice(0, 7);
    divPerShareByMonth.set(ym, (divPerShareByMonth.get(ym) ?? 0) + d.amount);
  }
  const divAt = (idx: number) =>
    divPerShareByMonth.get(months[idx].m) ?? 0;

  // ---- DCA 主循环：当月分红按上月末持股计，再投入按当月收盘买回；
  //      当月定投按当月收盘买入（两者顺序不影响月末股数口径之外的结果）。
  let shares = 0;
  let cash = 0;
  let contributed = 0;
  let totalDividends = 0;
  const flows: number[] = [];
  const yearMap = new Map<number, BacktestYearRow>();
  for (let m = startIdx; m <= endIdx; m++) {
    const close = months[m].close;
    const divCash = shares * divAt(m);
    totalDividends += divCash;
    if (input.reinvest) shares += divCash / close;
    else cash += divCash;
    shares += input.monthlyUsd / close;
    contributed += input.monthlyUsd;
    flows.push(-input.monthlyUsd);

    const year = Number(months[m].m.slice(0, 4));
    const row = yearMap.get(year) ?? {
      year,
      contributed: 0,
      dividends: 0,
      endShares: 0,
      endAssets: 0,
    };
    row.contributed += input.monthlyUsd;
    row.dividends += divCash;
    row.endShares = shares;
    row.endAssets = shares * close + cash;
    yearMap.set(year, row);
  }
  const endPrice = months[endIdx].close;
  const sharesValue = shares * endPrice;
  const totalAssets = sharesValue + cash;
  if (flows.length > 0) flows[flows.length - 1] += totalAssets;
  const xirrPct = n >= 2 ? xirrMonthly(flows) : null;

  // ---- 标的月线总回报序列的最大回撤（收盘 + 当月每股分红，复投口径）
  let adj = months[startIdx].close;
  let peak = adj;
  let maxDd = 0;
  for (let m = startIdx + 1; m <= endIdx; m++) {
    adj *= (months[m].close + divAt(m)) / months[m - 1].close;
    if (adj > peak) peak = adj;
    const dd = (1 - adj / peak) * 100;
    if (dd > maxDd) maxDd = dd;
  }

  // ---- 对比线：同一笔总投入在起始月收盘一次性买入，分红同口径处理。
  let lumpShares = contributed / months[startIdx].close;
  let lumpCash = 0;
  for (let m = startIdx + 1; m <= endIdx; m++) {
    const divCash = lumpShares * divAt(m);
    if (input.reinvest) lumpShares += divCash / months[m].close;
    else lumpCash += divCash;
  }
  const lumpAssets = lumpShares * endPrice + lumpCash;
  const elapsedMonths = endIdx - startIdx;
  const lumpAnnual =
    elapsedMonths >= 2 && contributed > 0 && lumpAssets > 0
      ? (Math.pow(lumpAssets / contributed, 12 / elapsedMonths) - 1) * 100
      : null;

  return {
    startYm: months[startIdx].m,
    endYm: months[endIdx].m,
    monthCount: n,
    contributed,
    totalDividends,
    cashDividends: cash,
    endShares: shares,
    endPrice,
    avgCost: shares > 0 ? contributed / shares : 0,
    sharesValue,
    totalAssets,
    xirrPct,
    maxDrawdownPct: maxDd,
    lump: { totalAssets: lumpAssets, annualizedPct: lumpAnnual },
    yearly: [...yearMap.values()].sort((a, b) => a.year - b.year),
  };
}
