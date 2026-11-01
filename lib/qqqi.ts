/**
 * QQQI 攒股收息定投估值工具：自动取数 + 派生口径 + 定投模拟（纯函数）。
 *
 * QQQI = NEOS Nasdaq-100 High Income ETF（NasdaqGM: QQQI），2024-01-30 上市：
 * 持有纳斯达克 100 成分股并卖出指数备兑期权换取月度派息的高收息 ETF。
 * 派息里含期权金与可能的资本返还（ROC）成分，不是普通股息；分红率高 ≠ 总回报高。
 *
 * 取数（服务端 /api/qqqi 汇总，任一源失败只降级对应区块，绝不编数）：
 * - 行情+分红：Yahoo Finance chart 接口（免 key，range=5y、interval=1d、events=div）
 *   一次拿到自上市以来全部日线与全部分红事件（除息日 + 每股金额）。
 * - 现价兜底：Yahoo 会封部分机房 IP（CRCL 已踩过），故行情另有 Cboe delayed
 *   quotes CDN 备用源（与 CRCL 同路：历史日线 + 现价接口补最后一根）。
 *   分红历史只有 Yahoo 一路；Yahoo 挂而 Cboe 活时，分红区块单独降级。
 * - 环境变量 QQQI_DISABLE_YAHOO=1 可强制只走备用源（运维/验证用）。
 *
 * 派生口径（全部写在页面上）：
 * - TTM 派息 = 最近 12 次月度派息之和；当前分红率 = TTM 派息 ÷ 现价。
 * - 52 周高低 = 最近 252 个交易日收盘的最高/最低；52 周水位 =（现价−低）÷（高−低）。
 * - 分红率分位：逐月末取「过去 12 个月派息 ÷ 当月末收盘」的滚动年化分红率序列
 *   （要求窗口内至少 10 次派息），当前分红率在该序列中的百分位。
 *   估值刻度只按分位定档：≥70 收息低估区、30–70 中性区、<30 偏高区。
 */

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export interface QqqiQuote {
  /** 最新日线收盘价（USD） */
  price: number;
  prevClose: number;
  changePct: number;
  /** 最新日线日期（美东，YYYY-MM-DD） */
  quoteDate: string;
  /** 最近 252 个交易日最高收盘及其日期 */
  high52: { value: number; date: string };
  /** 最近 252 个交易日最低收盘及其日期 */
  low52: { value: number; date: string };
  /** 现价在 52 周区间的位置（0–100，%） */
  pos52Pct: number;
  /** 实际供数源："yahoo" | "cboe"（线上诊断用） */
  source?: string;
  fetchedAt: string;
}

export interface QqqiDiv {
  /** 除息日（美东，YYYY-MM-DD） */
  date: string;
  /** 每股派息（USD） */
  amount: number;
}

export type QqqiVerdict = "cheap" | "neutral" | "rich";

export interface QqqiYieldStats {
  /** 当前分红率在自身历史滚动分红率序列中的百分位（0–100） */
  percentile: number;
  median: number;
  min: number;
  max: number;
  /** 序列点数（月数） */
  points: number;
}

export interface QqqiDist {
  /** 最近一次派息 */
  latest: QqqiDiv;
  /** TTM 派息：最近 12 次之和（USD/股） */
  ttm: number;
  /** 当前分红率（%）= TTM ÷ 现价；现价不可用时为 null */
  yieldPct: number | null;
  /** 派息历史（新→旧，最多 24 条） */
  history: QqqiDiv[];
  /** 分红率自身历史分位统计；历史不足时为 null */
  yieldStats: QqqiYieldStats | null;
  /** 按分位定档的估值参考；无分位时为 null */
  verdict: QqqiVerdict | null;
  fetchedAt: string;
}

export interface QqqiPayload {
  fetchedAt: string;
  quote: QqqiQuote | null;
  dist: QqqiDist | null;
  errors: { quote?: string; dist?: string };
}

/** 估值刻度定档：只按分红率自身历史分位。≥70 低估、30–70 中性、<30 偏高。 */
export function verdictForYieldPct(percentile: number): QqqiVerdict {
  if (percentile >= 70) return "cheap";
  if (percentile >= 30) return "neutral";
  return "rich";
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

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

export interface DayBar {
  date: string; // 美东 YYYY-MM-DD
  close: number;
}

const errMsg = (err: unknown) =>
  (err instanceof Error ? err.message : String(err)).slice(0, 120);

interface YahooChart {
  bars: DayBar[];
  divs: QqqiDiv[]; // 旧→新
}

/** Yahoo chart 接口：日线 + 分红事件（query1/query2 容错）。 */
async function fetchYahooChart(): Promise<YahooChart> {
  const path =
    "/v8/finance/chart/QQQI?range=5y&interval=1d&events=div&includePrePost=false";
  const errs: string[] = [];
  let payload: unknown = null;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      payload = await fetchJson(`https://${host}${path}`, 10_000);
      break;
    } catch (err) {
      errs.push(`${host.split(".")[0]}: ${errMsg(err)}`);
    }
  }
  if (payload == null) throw new Error(`yahoo[${errs.join("; ")}]`);

  const result = (payload as any)?.chart?.result?.[0];
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
  if (bars.length < 60) throw new Error("yahoo: too few daily bars");

  const divMap = result.events?.dividends ?? {};
  const divs: QqqiDiv[] = [];
  for (const key of Object.keys(divMap)) {
    const d = divMap[key];
    const amount = Number(d?.amount);
    const t = Number(d?.date);
    if (Number.isFinite(amount) && amount > 0 && Number.isFinite(t) && t > 0) {
      divs.push({ date: nyDate(t), amount });
    }
  }
  divs.sort((a, b) => (a.date < b.date ? -1 : 1));
  if (divs.length < 12) throw new Error("yahoo: too few dividend events");
  return { bars, divs };
}

/** 由日线收盘序列算 QqqiQuote（两源共用，收盘口径）。 */
function quoteFromBars(bars: DayBar[], source: string): QqqiQuote {
  const rows = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (rows.length < 60) throw new Error(`${source}: too few daily bars`);
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const win = rows.slice(-252);
  let high52 = win[0];
  let low52 = win[0];
  for (const r of win) {
    if (r.close > high52.close) high52 = r;
    if (r.close < low52.close) low52 = r;
  }
  const span = high52.close - low52.close;
  return {
    price: last.close,
    prevClose: prev.close,
    changePct: (last.close / prev.close - 1) * 100,
    quoteDate: last.date,
    high52: { value: high52.close, date: high52.date },
    low52: { value: low52.close, date: low52.date },
    pos52Pct: span > 0 ? clamp(((last.close - low52.close) / span) * 100, 0, 100) : 50,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

/** 备用源：Cboe delayed quotes CDN（照 CRCL 同路处理最后一根补齐）。 */
async function fetchCboeBars(): Promise<DayBar[]> {
  const base = "https://cdn.cboe.com/api/global/delayed_quotes";
  let hist: unknown;
  try {
    hist = await fetchJson(`${base}/charts/historical/QQQI.json`, 10_000);
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
  if (bars.length < 60) throw new Error("cboe: too few daily bars");
  bars.sort((a, b) => (a.date < b.date ? -1 : 1));

  try {
    const q = (await fetchJson(`${base}/quotes/QQQI.json`, 10_000)) as any;
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
 * 取 QQQI 行情：Yahoo 主源 → Cboe 备用源；全失败抛合并原因（供 errors 诊断）。
 * 返回同时带回日线序列（算分红率分位要用；两源日线同口径，谁供数就用谁的）。
 */
export async function fetchQqqiQuote(): Promise<{
  quote: QqqiQuote;
  bars: DayBar[] | null;
}> {
  const errs: string[] = [];
  if (process.env.QQQI_DISABLE_YAHOO !== "1") {
    try {
      const { bars } = await fetchYahooChart();
      return { quote: quoteFromBars(bars, "yahoo"), bars };
    } catch (err) {
      errs.push(errMsg(err));
    }
  } else {
    errs.push("yahoo skipped (QQQI_DISABLE_YAHOO=1)");
  }
  try {
    const bars = await fetchCboeBars();
    return { quote: quoteFromBars(bars, "cboe"), bars };
  } catch (err) {
    errs.push(errMsg(err));
  }
  throw new Error(errs.join(" | "));
}

/** 取分红事件全量（旧→新）。只有 Yahoo 一路。 */
export async function fetchQqqiDividends(): Promise<QqqiDiv[]> {
  const { divs } = await fetchYahooChart();
  return divs;
}

/**
 * 滚动年化分红率序列：逐月末收盘，取该日之前 365 天内除息的派息之和 ÷ 收盘。
 * 窗口内派息不足 10 次的月份跳过（上市初期数据不全，不硬凑）。
 */
export function rollingYieldSeries(bars: DayBar[], divs: QqqiDiv[]): number[] {
  const rows = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  const monthEnds: DayBar[] = [];
  for (let i = 0; i < rows.length; i++) {
    const ym = rows[i].date.slice(0, 7);
    const next = rows[i + 1];
    if (!next || next.date.slice(0, 7) !== ym) monthEnds.push(rows[i]);
  }
  const out: number[] = [];
  for (const me of monthEnds) {
    const end = me.date;
    const startDate = new Date(`${end}T00:00:00Z`);
    startDate.setUTCDate(startDate.getUTCDate() - 365);
    const start = startDate.toISOString().slice(0, 10);
    let sum = 0;
    let count = 0;
    for (const d of divs) {
      if (d.date > start && d.date <= end) {
        sum += d.amount;
        count++;
      }
    }
    if (count >= 10 && me.close > 0) out.push((sum / me.close) * 100);
  }
  return out;
}

/** 由分红事件 + 现价组装分红区块（纯函数，可独立验算）。 */
export function buildDist(
  divsOldToNew: QqqiDiv[],
  price: number | null,
  bars: DayBar[] | null
): QqqiDist {
  const desc = [...divsOldToNew].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = desc[0];
  const ttm = desc.slice(0, 12).reduce((s, d) => s + d.amount, 0);
  const yieldPct = price && price > 0 ? (ttm / price) * 100 : null;

  let yieldStats: QqqiYieldStats | null = null;
  let verdict: QqqiVerdict | null = null;
  if (yieldPct != null && bars) {
    const series = rollingYieldSeries(bars, divsOldToNew);
    if (series.length >= 6) {
      const sorted = [...series].sort((a, b) => a - b);
      // 序列最后一个点按构造应恰等于当前分红率，但两边求和顺序不同会有
      // 浮点末位差；比较时放 1e-6 容差，避免终点被误判到分位之外。
      const below = series.filter((v) => v <= yieldPct + 1e-6).length;
      const percentile = (below / series.length) * 100;
      yieldStats = {
        percentile,
        median: sorted[Math.floor(sorted.length / 2)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        points: series.length,
      };
      verdict = verdictForYieldPct(percentile);
    }
  }

  return {
    latest,
    ttm,
    yieldPct,
    history: desc.slice(0, 24),
    yieldStats,
    verdict,
    fetchedAt: new Date().toISOString(),
  };
}

/* ---------------- 定投模拟（纯函数，前后端共用同一口径） ---------------- */

export interface DcaInputs {
  /** 每月定投金额（USD） */
  monthlyUsd: number;
  /** 定投年限（1–30） */
  years: number;
  /** 假设年分红率（%） */
  annualYieldPct: number;
  /** 假设股价年增速（%，可负） */
  annualGrowthPct: number;
  /** 分红再投入开关 */
  reinvest: boolean;
  /** 起始价（实时现价带入） */
  startPrice: number;
}

export interface DcaYearRow {
  year: number;
  /** 年末总股数 */
  shares: number;
  /** 当年分红合计（USD） */
  divYear: number;
  /** 年末市值（USD） */
  value: number;
}

export interface DcaResult {
  totalShares: number;
  /** 期末月收息：期末持股 × 期末价 × 假设年分红率 ÷ 12（USD） */
  finalMonthlyIncome: number;
  /** 累计投入（USD） */
  contributed: number;
  /** 累计分红（USD，含已再投入部分） */
  totalDividends: number;
  /** 期末市值（USD） */
  finalValue: number;
  finalPrice: number;
  yearly: DcaYearRow[];
}

/**
 * 逐月模拟口径（页面明示）：第 m 月（m 从 0 起）股价 = 起始价 ×(1+增速)^(m/12)；
 * 月初按当月价买入定投金额（股数可小数）；月末按持股数 × 每股派息发放，
 * 每股派息 = 当月价 × 年分红率 ÷ 12；再投入开则立即按当月价买回。
 */
export function simulateDca(input: DcaInputs): DcaResult {
  const months = Math.round(input.years) * 12;
  const g = input.annualGrowthPct / 100;
  const y = input.annualYieldPct / 100;
  let shares = 0;
  let contributed = 0;
  let totalDividends = 0;
  let divYear = 0;
  const yearly: DcaYearRow[] = [];
  let price = input.startPrice;
  for (let m = 0; m < months; m++) {
    price = input.startPrice * Math.pow(1 + g, m / 12);
    shares += input.monthlyUsd / price;
    contributed += input.monthlyUsd;
    const div = shares * ((price * y) / 12);
    totalDividends += div;
    divYear += div;
    if (input.reinvest) shares += div / price;
    if ((m + 1) % 12 === 0) {
      yearly.push({
        year: (m + 1) / 12,
        shares,
        divYear,
        value: shares * price,
      });
      divYear = 0;
    }
  }
  const finalPrice = price;
  return {
    totalShares: shares,
    finalMonthlyIncome: (shares * finalPrice * y) / 12,
    contributed,
    totalDividends,
    finalValue: shares * finalPrice,
    finalPrice,
    yearly,
  };
}
