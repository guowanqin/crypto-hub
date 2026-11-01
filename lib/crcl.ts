import type { CrclFinancialsConfig } from "./crcl-config";

/**
 * CRCL 买入信号分模型（v6，2026-11-01 起）+ 自动取数。
 *
 * 模型口径（按用户提供的参考看板复刻，2026-11-01 核定，验算值见文件尾注释）：
 *   总分 =（估值层 0–80 + 恐慌层 0–20 + 基本面层 ±10）× 1.3 × 否决乘数，
 *   封顶 130、下限 0；基础满分 100。
 * - 估值层：实时 P/S 分段线性 —— ≥8x→0、6x→30、4.5x→50（基础满）、3.5x→65、≤2.5x→80。
 * - 恐慌层：RSI14 分段线性 —— ≥45→0、≤30→20。
 * - 基本面层：USDC 供应量 180 天变化率 ÷15% ×10，clamp 到 ±10。
 * - 否决乘数（黑天鹅否决，只看市占率）：USDC 稳定币市占率 90 天变化 ≥ −2.5pp → 1.0；
 *   −2.5pp…−4pp 线性降到 0.8；≤ −4pp → 0.8。USDC 绝对量缩水不触发否决。
 * - 判定带：0–19 明显高估·回避；20–39 偏高估·观望；40–59 偏低估·小额分批开始；
 *   60–79 低估·分批加仓；80–99 明显低估·积极分批；100–130 历史级低估·重仓窗口。
 * 分数是纪律工具，不是预测；页面已标注，不构成投资建议。
 *
 * 取数（服务端 /api/crcl 汇总，任一源失败只降级对应区块）：
 * - 股价/日线：Yahoo Finance chart 接口（免 key）主源 → 现价（最新日线收盘）、涨跌幅、
 *   RSI14（Wilder）、上市以来最高/最低收盘价及其日期（收盘口径，与参考看板一致）。
 *   Yahoo 会封部分机房 IP（Vercel 出口曾被拒、整段 quote 为 null），故加 Cboe 官方
 *   delayed quotes CDN 为独立备用源（不同域）：历史日线 + 现价接口，个股代码不带
 *   下划线前缀（_CRCL 是指数格式、返回 403；CRCL 才对）。Cboe 历史日线比现价接口
 *   慢一个交易日入库，故用现价接口的当日收盘补齐最后一根（仅限该日已收盘时）。
 *   两源同口径实测对照（2026-10-30）：现价 72.54、RSI 36.95≈37.0、距高 −72.5%、
 *   距低 +44.4%，与 Yahoo 一致。环境变量 CRCL_DISABLE_YAHOO=1 可强制只走备用源。
 * - USDC 供应/市占率：DeFiLlama 稳定币接口（免 key）→ 供应量日序列算
 *   30/90/180/365 天变化；市占率 = USDC ÷ 美元锚定稳定币总供应。
 * - 股本与利润表：lib/crcl-config.ts 可编辑常量（标注来源与截至日期）。
 */

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** 分段线性插值：anchors 为 [x, y] 且 x 降序排列；区间外取端点值。 */
function piecewiseDesc(x: number, anchors: [number, number][]): number {
  if (x >= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x <= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x1, y1] = anchors[i];
    const [x2, y2] = anchors[i + 1];
    if (x <= x1 && x >= x2) {
      return y1 + ((x1 - x) / (x1 - x2)) * (y2 - y1);
    }
  }
  return last[1];
}

/** 估值层 0–80：按实时 P/S（TTM）打分。 */
export function scoreValuation(ps: number): number {
  return piecewiseDesc(ps, [
    [8, 0],
    [6, 30],
    [4.5, 50],
    [3.5, 65],
    [2.5, 80],
  ]);
}

/** 恐慌层 0–20：按 RSI14 打分（越恐慌分越高）。 */
export function scorePanic(rsi: number): number {
  return piecewiseDesc(rsi, [
    [45, 0],
    [30, 20],
  ]);
}

/** 基本面层 −10…+10：USDC 供应量 180 天变化率（%）÷15% ×10 后 clamp。 */
export function scoreFundamental(usdcChg180Pct: number): number {
  return clamp((usdcChg180Pct / 15) * 10, -10, 10);
}

/** 否决乘数 0.8–1.0：只看 USDC 市占率 90 天变化（pp，负数 = 掉份额）。 */
export function vetoMultiplier(shareChg90Pp: number): number {
  const drop = -shareChg90Pp; // 正数 = 掉了多少 pp
  if (drop <= 2.5) return 1;
  if (drop >= 4) return 0.8;
  return 1 - 0.2 * ((drop - 2.5) / 1.5);
}

export type VerdictKey =
  | "avoid" // 0–19 明显高估·回避
  | "watch" // 20–39 偏高估·观望
  | "start" // 40–59 偏低估·小额分批开始
  | "add" // 60–79 低估·分批加仓
  | "strong" // 80–99 明显低估·积极分批
  | "historic"; // 100–130 历史级低估·重仓窗口

export function verdictFor(total: number): VerdictKey {
  if (total < 20) return "avoid";
  if (total < 40) return "watch";
  if (total < 60) return "start";
  if (total < 80) return "add";
  if (total < 100) return "strong";
  return "historic";
}

export interface SignalScore {
  valuation: number;
  panic: number;
  fundamental: number;
  veto: number;
  /** 封顶 130、下限 0 的整数总分 */
  total: number;
  verdict: VerdictKey;
}

/** 由四项原始输入算总分（纯函数，验算用例见文件尾注释）。 */
export function computeScore(input: {
  ps: number;
  rsi14: number;
  usdcChg180Pct: number;
  shareChg90Pp: number;
}): SignalScore {
  const valuation = scoreValuation(input.ps);
  const panic = scorePanic(input.rsi14);
  const fundamental = scoreFundamental(input.usdcChg180Pct);
  const veto = vetoMultiplier(input.shareChg90Pp);
  const raw = (valuation + panic + fundamental) * 1.3 * veto;
  const total = clamp(Math.round(raw), 0, 130);
  return { valuation, panic, fundamental, veto, total, verdict: verdictFor(total) };
}

/** Wilder RSI（与参考看板口径一致：完整日线计算）。 */
export function rsiWilder(closes: number[], period = 14): number {
  if (closes.length <= period) return NaN;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d;
    else losses -= d;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

/* ---------------- 取数 ---------------- */

export interface CrclQuote {
  /** 最新日线收盘价（USD） */
  price: number;
  prevClose: number;
  changePct: number;
  /** 最新日线日期（美东，YYYY-MM-DD） */
  quoteDate: string;
  /** 上市以来最高收盘价及其日期（收盘口径） */
  ath: { value: number; date: string };
  /** 上市以来最低收盘价及其日期（收盘口径） */
  low: { value: number; date: string };
  distAthPct: number;
  distLowPct: number;
  rsi14: number;
  /** 实际供数源："yahoo" | "cboe"（线上诊断用） */
  source?: string;
  fetchedAt: string;
}

export interface UsdcFundamentals {
  /** USDC 当前供应量（USD） */
  supplyNow: number;
  /** 供应量数据日期（YYYY-MM-DD） */
  supplyDate: string;
  chg30Pct: number;
  chg90Pct: number;
  chg180Pct: number;
  chg365Pct: number;
  /** USDC 占美元锚定稳定币总供应的比例（%） */
  shareNowPct: number;
  /** 市占率 90 天变化（pp） */
  shareChg90Pp: number;
  /** 近约 1 年周采样走势（供应量 USD、市占率 %） */
  spark: { date: string; supply: number; sharePct: number }[];
  fetchedAt: string;
}

export interface CrclValuation {
  marketCap: number;
  fdv: number;
  /** P/S (TTM) */
  ps: number;
  /** 流通市值 / 调整后 EBITDA (TTM) */
  mcapToEbitda: number;
}

export interface CrclPayload {
  fetchedAt: string;
  quote: CrclQuote | null;
  fund: UsdcFundamentals | null;
  valuation: CrclValuation | null;
  score: SignalScore | null;
  financials: CrclFinancialsConfig;
  errors: { quote?: string; fund?: string };
}

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

const isoDay = (tsSeconds: number) =>
  new Date(tsSeconds * 1000).toISOString().slice(0, 10);

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

interface DayBar {
  /** 交易日（美东，YYYY-MM-DD） */
  date: string;
  close: number;
}

/** 由日线收盘序列算 CrclQuote（两源共用，口径完全一致：收盘口径、Wilder RSI14）。 */
function quoteFromBars(bars: DayBar[], source: string): CrclQuote {
  const rows = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (rows.length < 20) throw new Error(`${source}: too few daily bars`);
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  let ath = rows[0];
  let low = rows[0];
  for (const r of rows) {
    if (r.close > ath.close) ath = r;
    if (r.close < low.close) low = r;
  }
  const rsi14 = rsiWilder(rows.map((r) => r.close));
  if (!Number.isFinite(rsi14)) throw new Error(`${source}: RSI unavailable`);
  return {
    price: last.close,
    prevClose: prev.close,
    changePct: (last.close / prev.close - 1) * 100,
    quoteDate: last.date,
    ath: { value: ath.close, date: ath.date },
    low: { value: low.close, date: low.date },
    distAthPct: (last.close / ath.close - 1) * 100,
    distLowPct: (last.close / low.close - 1) * 100,
    rsi14,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

const errMsg = (err: unknown) =>
  (err instanceof Error ? err.message : String(err)).slice(0, 120);

/** 主源：Yahoo Finance chart 接口（query1/query2 容错）。 */
async function fetchYahooBars(): Promise<DayBar[]> {
  const path =
    "/v8/finance/chart/CRCL?range=2y&interval=1d&includePrePost=false";
  const errs: string[] = [];
  let payload: unknown = null;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      payload = await fetchJson(`https://${host}${path}`, 8_000);
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
  if (bars.length < 20) throw new Error("yahoo: too few daily bars");
  return bars;
}

/**
 * 备用源：Cboe delayed quotes CDN（与 Yahoo 不同域）。
 * 个股代码不带下划线（_CRCL 是指数格式、S3 403）；历史日线 date/close 字段，
 * 自上市日 2025-06-05 起全量。历史比现价接口慢一个交易日入库，故用现价接口
 * 的 close 补最后一根——仅当该交易日已收盘（日期早于今日美东，或当日 17:00 ET 后），
 * 避免盘中把未定收盘写进序列。
 */
async function fetchCboeBars(): Promise<DayBar[]> {
  const base = "https://cdn.cboe.com/api/global/delayed_quotes";
  let hist: unknown;
  try {
    hist = await fetchJson(`${base}/charts/historical/CRCL.json`, 10_000);
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
  if (bars.length < 20) throw new Error("cboe: too few daily bars");
  bars.sort((a, b) => (a.date < b.date ? -1 : 1));

  try {
    const q = (await fetchJson(`${base}/quotes/CRCL.json`, 10_000)) as any;
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
 * 取 CRCL 行情：Yahoo 主源 → Cboe 备用源，任一成功即用；
 * 两源全失败时抛出合并的简短原因（供接口 errors.quote 线上诊断，无堆栈）。
 * CRCL_DISABLE_YAHOO=1 时跳过 Yahoo（运维/验证用）。
 */
export async function fetchCrclQuote(): Promise<CrclQuote> {
  const errs: string[] = [];
  if (process.env.CRCL_DISABLE_YAHOO !== "1") {
    try {
      return quoteFromBars(await fetchYahooBars(), "yahoo");
    } catch (err) {
      errs.push(errMsg(err));
    }
  } else {
    errs.push("yahoo skipped (CRCL_DISABLE_YAHOO=1)");
  }
  try {
    return quoteFromBars(await fetchCboeBars(), "cboe");
  } catch (err) {
    errs.push(errMsg(err));
  }
  throw new Error(errs.join(" | "));
}

interface DayPoint {
  date: number; // unix 秒（UTC 日）
  v: number;
}

function parseStableSeries(raw: unknown): DayPoint[] {
  const arr = raw as any[];
  if (!Array.isArray(arr)) throw new Error("defillama: bad series");
  const out: DayPoint[] = [];
  for (const p of arr) {
    const v = p?.totalCirculating?.peggedUSD;
    const date = Number(p?.date);
    if (Number.isFinite(date) && typeof v === "number" && v > 0) {
      out.push({ date, v });
    }
  }
  out.sort((a, b) => a.date - b.date);
  if (out.length < 400) throw new Error("defillama: series too short");
  return out;
}

/** 取 date 当日或之前最近一点 */
function atOrBefore(series: DayPoint[], date: number): DayPoint {
  let best = series[0];
  for (const p of series) {
    if (p.date <= date) best = p;
    else break;
  }
  return best;
}

const DAY = 86_400;

/** 取 USDC 供应与市占率：DeFiLlama 稳定币图表接口（USDC 单币 + 全市场）。 */
export async function fetchUsdcFundamentals(): Promise<UsdcFundamentals> {
  const [usdcRaw, allRaw] = await Promise.all([
    fetchJson("https://stablecoins.llama.fi/stablecoincharts/all?stablecoin=2", 20_000),
    fetchJson("https://stablecoins.llama.fi/stablecoincharts/all", 20_000),
  ]);
  const usdc = parseStableSeries(usdcRaw);
  const total = parseStableSeries(allRaw);

  const latest = usdc[usdc.length - 1];
  const chgPct = (days: number) => {
    const start = atOrBefore(usdc, latest.date - days * DAY);
    return (latest.v / start.v - 1) * 100;
  };
  const shareAt = (date: number) => {
    const u = atOrBefore(usdc, date);
    const t = atOrBefore(total, u.date);
    return (u.v / t.v) * 100;
  };
  const shareNowPct = shareAt(latest.date);
  const shareChg90Pp = shareNowPct - shareAt(latest.date - 90 * DAY);

  // 近约 1 年、每 7 天采样一条走势
  const spark: UsdcFundamentals["spark"] = [];
  for (let back = 364; back >= 0; back -= 7) {
    const p = atOrBefore(usdc, latest.date - back * DAY);
    spark.push({ date: isoDay(p.date), supply: p.v, sharePct: shareAt(p.date) });
  }

  return {
    supplyNow: latest.v,
    supplyDate: isoDay(latest.date),
    chg30Pct: chgPct(30),
    chg90Pct: chgPct(90),
    chg180Pct: chgPct(180),
    chg365Pct: chgPct(365),
    shareNowPct,
    shareChg90Pp,
    spark,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * 内置验算用例（参考看板 2026-10-30 数值，逐项核对）：
 * - scoreValuation(6.34) = 30 − (0.34/2)×30 = 24.9 ≈ 25 ✓
 * - scorePanic(37.0) = (45−37)/15×20 = 10.7 ≈ 11 ✓
 * - scoreFundamental(−7.6) = −7.6/15×10 = −5.1 ✓
 * - vetoMultiplier(−0.3) = 1.0（未触发）✓
 * - computeScore({ps:6.34, rsi14:37.0, usdcChg180Pct:−7.6, shareChg90Pp:−0.3}).total
 *   = round((24.9+10.7−5.1)×1.3×1.0) = round(39.65) = 40 ✓（判定带 start：偏低估·小额分批开始）
 * - rsiWilder(Yahoo CRCL 日线收盘，截至 2026-10-30) = 37.0 ✓（实测）
 * - ATH/LOW（收盘口径）：最高收盘 $263.45 @2025-06-23（距高 −72.5%）、
 *   最低收盘 $50.23 @2026-02-05（距低 +44.4%），与参考看板一致 ✓（实测）
 */
