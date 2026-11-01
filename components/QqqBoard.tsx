"use client";

import { useEffect, useMemo, useState } from "react";
import {
  runBacktest,
  type QqqPayload,
  type QqqTempBand,
} from "@/lib/qqq";
import { HUB_DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {ps} 股价源 · {hs} 历史源 · {qt} 取数时间
    loading: string;
    loadError: string;
    quoteMeta: string; // {date}
    priceAsOf: string;
    statDrawdown: string;
    statDrawdownSub: string; // {ath} {date}
    statAth: string;
    statAthSub: string;
    statHigh52: string; // {d}
    statLow52: string; // {d}
    statMa200: string;
    statMa200Sub: string; // {v}
    statPe: string;
    statPeSub: string;
    pos52Label: string; // {p}
    quoteFail: string;
    historyFail: string;
    secTemp: string;
    tempIntro: string;
    tempScore: string; // {s}
    bands: Record<QqqTempBand, string>;
    partMa200: string; // {v} {dev} {s}
    partAth: string; // {dd} {s}
    partPos52: string; // {p} {s}
    partPe: string; // {v} {s}
    partPeOff: string;
    zoneHot: string;
    zoneWarm: string;
    zoneCool: string;
    zoneCold: string;
    tempRules: string;
    secBacktest: string;
    btIntro: string;
    btDataLine: string; // {through} {srcNote}
    inStartYear: string;
    inStartMonth: string;
    inMonthly: string;
    inReinvest: string;
    reinvestOn: string;
    reinvestOff: string;
    outContrib: string;
    outShares: string;
    outAvgCost: string;
    outAvgCostSub: string; // {p}
    outAssets: string;
    outAssetsSub: string; // {sv} {cd}
    outDivs: string;
    outXirr: string;
    outXirrSub: string;
    outMaxDd: string;
    outMaxDdSub: string;
    lumpLine: string; // {total} {start} {assets} {ann} {diff}
    lumpLineNoAnn: string; // {total} {start} {assets} {diff}
    diffMore: string;
    diffLess: string;
    colYear: string;
    colContrib: string;
    colDivYear: string;
    colShares: string;
    colAssets: string;
    btCaliber: string;
    btNeedHistory: string;
    btNeedAmount: string;
    secRisk: string;
    riskParas: string[];
    caliberTitle: string;
    caliberBody: string;
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "QQQ 数据看板 · Invesco QQQ Trust（纳斯达克 100 ETF）",
    sourceLine: "数据源：{ps}（股价）· {hs}（回测月线与分红）· 取数 {qt}",
    loading: "正在拉取 QQQ 行情与全史月线数据…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    quoteMeta: "Nasdaq（QQQ）· 日线截至 {date} · 1999-03-10 上市",
    priceAsOf: "最新收盘价",
    statDrawdown: "距 ATH 回撤",
    statDrawdownSub: "ATH {ath} · {date}（收盘口径）",
    statAth: "历史最高收盘（ATH）",
    statAthSub: "全史月线与近端日线中的最高收盘",
    statHigh52: "52 周最高收盘 · {d}",
    statLow52: "52 周最低收盘 · {d}",
    statMa200: "MA200 偏离",
    statMa200Sub: "200 日均线 {v}",
    statPe: "市盈率（PE）",
    statPeSub: "stockanalysis.com · 基金口径",
    pos52Label: "52 周水位 {p}（低→高）",
    quoteFail: "股价数据暂时拉取失败，行情与估值温度区块先隐藏；回测不受影响。",
    historyFail: "回测历史数据暂时不可用，定投回测器先隐藏；行情不受影响。",
    secTemp: "01 · 估值温度（价格指标刻度）",
    tempIntro:
      "QQQ 没有便宜或贵的官方答案，这把刻度只把三件可核查的价格事实拼在一起：股价离 200 日均线多远、离历史最高收盘跌了多少、在 52 周区间里处于什么水位。PE 取得到时作为第四项计入。每项 0–100 分（越高表示越偏「冷」——即越靠近历史上的低位一侧），综合分取平均。",
    tempScore: "综合 {s} 分",
    bands: {
      cold: "偏冷",
      cool: "中性偏冷",
      warm: "中性偏热",
      hot: "偏热",
    },
    partMa200: "MA200 偏离：现价 {v}（子分 {s}）",
    partAth: "距 ATH 回撤：{dd}（子分 {s}）",
    partPos52: "52 周水位：{p}（子分 {s}）",
    partPe: "PE：{v}（子分 {s}）",
    partPeOff: "PE：暂时取不到，本次不计入",
    zoneHot: "偏热 <35",
    zoneWarm: "中性偏热 35–50",
    zoneCool: "中性偏冷 50–65",
    zoneCold: "偏冷 ≥65",
    tempRules:
      "定档与子分规则（全部口径）：MA200 偏离子分 = 50 − 偏离% ÷ 15 × 50，限幅 0–100（偏离 −15% 得 100 分、+15% 得 0 分）；回撤子分 = 回撤% ÷ 30 × 100，限幅 0–100（回撤 ≥30% 得满分、在 ATH 处得 0 分）；52 周水位子分 = 100 − 水位%（区间底部 100 分、顶部 0 分）；PE 子分 = (35 − PE) ÷ 13 × 100，限幅 0–100（PE ≤22 满分、≥35 零分）。综合 ≥65 偏冷、50–65 中性偏冷、35–50 中性偏热、<35 偏热。说清楚：这是指标刻度，不是预测——偏冷不等于不会继续跌，历史上 QQQ 从「偏冷」位置再腰斩并不罕见；定投的意义本来就是不靠猜底。",
    secBacktest: "02 · 定投回测器",
    btIntro:
      "用 QQQ 上市以来的真实月线回测「按月定投」：选一个起始年月，输入每月金额，看看一路投到最新完整月份的期末股数、年化与最惨回撤，再和「同一笔钱在起点一次性买入」对照。",
    btDataLine: "回测数据截至 {through} 月末收盘 · {srcNote}",
    inStartYear: "起始年份",
    inStartMonth: "起始月份",
    inMonthly: "每月定投金额（USD）",
    inReinvest: "分红再投入",
    reinvestOn: "开（分红当月买回）",
    reinvestOff: "关（分红留作现金）",
    outContrib: "累计投入",
    outShares: "期末股数",
    outAvgCost: "摊薄成本",
    outAvgCostSub: "期末月收盘 {p}",
    outAssets: "期末总资产",
    outAssetsSub: "股票市值 {sv} + 现金分红 {cd}",
    outDivs: "累计分红",
    outXirr: "年化收益率（XIRR）",
    outXirrSub: "按月现金流近似",
    outMaxDd: "期间最大回撤（标的）",
    outMaxDdSub: "月线总回报口径，非账户净值",
    lumpLine:
      "对比线：同样的 {total} 若在 {start} 按当月收盘一次性买入（分红同口径处理），期末总资产 {assets}、年化 {ann}，比定投{diff}。",
    lumpLineNoAnn:
      "对比线：同样的 {total} 若在 {start} 按当月收盘一次性买入（分红同口径处理），期末总资产 {assets}，比定投{diff}。",
    diffMore: "多 {d}",
    diffLess: "少 {d}",
    colYear: "年份",
    colContrib: "年投入",
    colDivYear: "年内分红",
    colShares: "年末股数",
    colAssets: "年末总资产",
    btCaliber:
      "回测口径：每月按当月收盘价买入（股数可小数）；当月分红按上月末持股计算（除息日在月内的先后以月线粒度分辨不了，定投与一次性买入一致套用），再投入开则按除息月收盘价买回、关则现金累计，期末总资产含这笔现金。年化为按月现金流的 XIRR 近似；最大回撤为标的本身在月线总回报（收盘+分红复投）序列上的峰谷回撤，不是你的账户净值回撤（定投持续买入会把净值曲线摊平）。摊薄成本 = 累计投入 ÷ 期末股数，再投入的分红买入的股数未另计投入。未计税费、买卖价差与汇率；QQQ 的基金费率已含在价格里。历史回测不代表未来表现。",
    btNeedHistory: "回测需要全史月线数据，数据恢复后自动可用。",
    btNeedAmount: "把每月定投金额填成大于 0 的数字，这里就会跑出回测结果。",
    secRisk: "03 · 风险与口径",
    riskParas: [
      "波动是真的：QQQ 随纳指 100 走，历史上出现过 2000–2002 年科网泡沫破裂期超 80% 的峰谷回撤（月线总回报口径回测区可见）、2008 年与 2022 年的深跌。定投摊平的是买入成本，不是波动本身，账户浮亏三四成在长周期里是常态而非意外。",
      "高度集中：纳指 100 本质是美股大型科技成长股的集合，前十大权重常年占一半以上——买 QQQ 是对美国科技龙头下重注，不是买「全市场」，与宽基指数（如标普 500）的分散程度不是一回事。",
      "分红不是重点：QQQ 季度分红、当前分红率不足 1%，它是指数增值型工具不是收息工具；回测里的分红再投入对结果的影响远小于价格本身，别按收息逻辑理解它。",
      "汇率与税务：以人民币出入金的投资者还要承担 USD/CNY 汇率波动；分红与资本利得的税务处理因人而异，回测未计这些。",
    ],
    caliberTitle: "数据口径",
    caliberBody:
      "股价来自 Yahoo Finance 日线（服务端 15 分钟缓存，被机房 IP 拦截时自动切换 Cboe 延迟行情兜底）：现价为最新日线收盘价，涨跌幅对前一交易日收盘；52 周高低按最近 252 个交易日收盘；MA200 为近 200 个交易日收盘均值；ATH 为全史月收盘与近端日线收盘的最高者（收盘口径，不是盘中高点）。回测月线与分红来自 Yahoo Finance 全史（月线自 1999-03，1999-03 用日线月末收盘补种；分红事件自分红记录以来共 90 余次，季度派发）；Yahoo 不可用时自动切换为站内保存的全史数据文件作底（截至日期在回测区标注）、再以 Cboe 月线与 stockanalysis 分红补新。PE 来自 stockanalysis.com（12 小时缓存，取不到则整项不出）。本页所有数字均为公开数据的机械计算，不构成投资建议。",
    toolsTitle: "本类工具",
  },
  en: {
    boardKicker: "QQQ Data Board · Invesco QQQ Trust (Nasdaq-100 ETF)",
    sourceLine: "Sources: {ps} (price) · {hs} (backtest monthly data & dividends) · fetched {qt}",
    loading: "Fetching QQQ price and full-history monthly data…",
    loadError: "Data is temporarily unavailable — please refresh shortly.",
    quoteMeta: "Nasdaq (QQQ) · daily bars as of {date} · listed 1999-03-10",
    priceAsOf: "Latest close",
    statDrawdown: "Drawdown from ATH",
    statDrawdownSub: "ATH {ath} · {date} (closing basis)",
    statAth: "All-time high close (ATH)",
    statAthSub: "Highest close across full monthly history and recent daily bars",
    statHigh52: "52-week high close · {d}",
    statLow52: "52-week low close · {d}",
    statMa200: "Distance to MA200",
    statMa200Sub: "200-day average {v}",
    statPe: "P/E ratio",
    statPeSub: "stockanalysis.com · fund basis",
    pos52Label: "52-week position {p} (low→high)",
    quoteFail: "Price data is temporarily unavailable, so the quote and temperature sections are hidden for now; the backtest is unaffected.",
    historyFail: "Backtest history is temporarily unavailable, so the backtester is hidden for now; the quote is unaffected.",
    secTemp: "01 · Valuation Temperature (Price-Metric Scale)",
    tempIntro:
      "There is no official answer to whether QQQ is cheap. This scale only combines three checkable price facts: how far the price sits from its 200-day average, how far it has fallen from its all-time high close, and where it stands in its 52-week range. P/E joins as a fourth input when available. Each scores 0–100 (higher = 'colder', i.e. closer to the historical low side); the composite is the average.",
    tempScore: "Composite {s}",
    bands: {
      cold: "Cold",
      cool: "Cool-neutral",
      warm: "Warm-neutral",
      hot: "Hot",
    },
    partMa200: "MA200 deviation: {v} (subscore {s})",
    partAth: "Drawdown from ATH: {dd} (subscore {s})",
    partPos52: "52-week position: {p} (subscore {s})",
    partPe: "P/E: {v} (subscore {s})",
    partPeOff: "P/E: unavailable right now, excluded this time",
    zoneHot: "Hot <35",
    zoneWarm: "Warm-neutral 35–50",
    zoneCool: "Cool-neutral 50–65",
    zoneCold: "Cold ≥65",
    tempRules:
      "Banding and subscore rules (full methodology): MA200 subscore = 50 − deviation% ÷ 15 × 50, clamped 0–100 (−15% deviation scores 100, +15% scores 0); drawdown subscore = drawdown% ÷ 30 × 100, clamped (≥30% drawdown scores full, at the ATH scores 0); 52-week subscore = 100 − position% (bottom 100, top 0); P/E subscore = (35 − PE) ÷ 13 × 100, clamped (≤22 full, ≥35 zero). Composite ≥65 cold, 50–65 cool-neutral, 35–50 warm-neutral, <35 hot. Be clear: this is a metric scale, not a forecast — 'cold' does not mean it cannot fall further; QQQ has halved again from 'cold' readings more than once. DCA exists precisely so you don't have to call the bottom.",
    secBacktest: "02 · DCA Backtester",
    btIntro:
      "Backtest monthly dollar-cost averaging on QQQ's real monthly history since listing: pick a start month, enter a monthly amount, and see final shares, annualised return and the worst drawdown through the latest complete month — plus a comparison line for investing the same total as a lump sum at the start.",
    btDataLine: "Backtest data through the {through} month-end close · {srcNote}",
    inStartYear: "Start year",
    inStartMonth: "Start month",
    inMonthly: "Monthly investment (USD)",
    inReinvest: "Reinvest dividends",
    reinvestOn: "On (dividends buy back in)",
    reinvestOff: "Off (dividends kept as cash)",
    outContrib: "Total contributed",
    outShares: "Final shares",
    outAvgCost: "Diluted cost basis",
    outAvgCostSub: "Final month close {p}",
    outAssets: "Final total assets",
    outAssetsSub: "Share value {sv} + cash dividends {cd}",
    outDivs: "Total dividends",
    outXirr: "Annualised return (XIRR)",
    outXirrSub: "Monthly cash-flow approximation",
    outMaxDd: "Max drawdown in window (underlying)",
    outMaxDdSub: "Monthly total-return basis, not account NAV",
    lumpLine:
      "Comparison: the same {total} invested as a lump sum at the {start} close (dividends treated identically) ends at {assets}, annualised {ann} — {diff} versus DCA.",
    lumpLineNoAnn:
      "Comparison: the same {total} invested as a lump sum at the {start} close (dividends treated identically) ends at {assets} — {diff} versus DCA.",
    diffMore: "{d} more",
    diffLess: "{d} less",
    colYear: "Year",
    colContrib: "Contributed",
    colDivYear: "Dividends",
    colShares: "Year-end shares",
    colAssets: "Year-end assets",
    btCaliber:
      "Backtest methodology: each month buys at that month's closing price (fractional shares allowed); a month's dividends are computed on the shares held at the previous month-end (monthly bars cannot resolve ex-date ordering within the month; the same convention applies to DCA and the lump sum), reinvested at the ex-month's close when on, or accumulated as cash and included in final total assets when off. Annualised return is an XIRR approximation over monthly cash flows; max drawdown is the peak-to-trough fall of the underlying's monthly total-return series (close plus reinvested dividends), not of your account (ongoing contributions smooth an account curve). Diluted cost = total contributed ÷ final shares; shares bought with reinvested dividends are not counted as contributions. Taxes, spreads and FX are excluded; QQQ's expense ratio is already inside the price. Past backtests do not predict future performance.",
    btNeedHistory: "The backtester needs the full monthly history; it becomes available once the data recovers.",
    btNeedAmount: "Enter a monthly amount above zero and the backtest results will appear here.",
    secRisk: "03 · Risks & Methodology",
    riskParas: [
      "The volatility is real: QQQ tracks the Nasdaq-100 and has seen a peak-to-trough drawdown above 80% in the 2000–2002 dot-com bust (visible in the backtester on a monthly total-return basis), plus deep falls in 2008 and 2022. DCA averages your purchase cost, not the volatility itself — a 30–40% paper loss along the way is the norm over long horizons, not an accident.",
      "Highly concentrated: the Nasdaq-100 is essentially US large-cap tech growth; its top ten names routinely exceed half the index. Buying QQQ is a heavy bet on US tech leaders, not 'the whole market' — it is not diversified the way a broad index such as the S&P 500 is.",
      "Dividends are not the point: QQQ pays quarterly and yields under 1%; it is a growth vehicle, not an income vehicle. In the backtest, reinvested dividends matter far less than the price path — don't read it through an income lens.",
      "FX and taxes: investors funding in CNY also carry USD/CNY exchange-rate risk; dividend and capital-gains tax treatment varies by person and is excluded from the backtest.",
    ],
    caliberTitle: "Data methodology",
    caliberBody:
      "Prices come from Yahoo Finance daily bars (15-minute server cache, automatically falling back to Cboe delayed quotes when datacenter IPs are blocked): the price is the latest daily close and the change is versus the previous session; the 52-week high/low use the last 252 trading days' closes; MA200 is the mean of the last 200 closes; the ATH is the highest close across the full monthly history and recent daily bars (closing basis, not intraday highs). Backtest monthly bars and dividends come from Yahoo Finance's full history (monthly from 1999-03, with 1999-03 seeded from the daily month-end close; 90+ dividend events since records began, paid quarterly). If Yahoo is unavailable the page automatically falls back to a stored full-history data file (its as-of month is labelled in the backtest section), topped up with Cboe monthly bars and stockanalysis dividends. P/E comes from stockanalysis.com (12-hour cache; omitted entirely when unavailable). Everything here is a mechanical computation over public data and is not investment advice.",
    toolsTitle: "Tools in this shelf",
  },
};

function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`;
}
function fmtUsd(v: number, digits = 2): string {
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
function fmtSignedPct(v: number, digits = 1): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)}%`;
}
function fmtTime(iso: string): string {
  const dt = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}`;
}
function parseNum(s: string, fallback: number): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

export { DICT as QQQ_DICT };

const SRC_LABEL: Record<string, string> = {
  yahoo: "Yahoo Finance",
  cboe: "Cboe",
};

// QQQ 定投看板本体：/tag/qqq 标签页与 /tool/qqq-panel 工具页共用同一组件。
export default function QqqBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];

  const [data, setData] = useState<QqqPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/qqq")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: QqqPayload) => {
        if (alive) setData(j);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const q = data?.quote ?? null;
  const hist = data?.history ?? null;
  const pe = data?.pe ?? null;
  const temp = data?.temp ?? null;

  /* ---- 回测器状态 ---- */
  const months = useMemo(() => hist?.months ?? [], [hist]);
  const yearsAvail = useMemo(() => {
    const ys: number[] = [];
    for (const mo of months) {
      const y = Number(mo.m.slice(0, 4));
      if (ys[ys.length - 1] !== y) ys.push(y);
    }
    return ys;
  }, [months]);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [startMonth, setStartMonth] = useState<number | null>(null);
  const [monthlyStr, setMonthlyStr] = useState("1000");
  const [reinvest, setReinvest] = useState(true);

  const effYear =
    startYear != null && yearsAvail.includes(startYear)
      ? startYear
      : yearsAvail.includes(2015)
        ? 2015
        : (yearsAvail[0] ?? 1999);
  const monthsInYear = useMemo(
    () =>
      months
        .filter((mo) => Number(mo.m.slice(0, 4)) === effYear)
        .map((mo) => Number(mo.m.slice(5, 7))),
    [months, effYear]
  );
  const effMonth =
    startMonth != null && monthsInYear.includes(startMonth)
      ? startMonth
      : effYear === 2015 && monthsInYear.includes(1)
        ? 1
        : (monthsInYear[0] ?? 1);
  const startYm = `${effYear}-${String(effMonth).padStart(2, "0")}`;

  const monthlyUsd = Math.max(0, parseNum(monthlyStr, 1000));
  const bt = useMemo(() => {
    if (!hist || monthlyUsd <= 0) return null;
    return runBacktest(hist.months, hist.divs, {
      startYm,
      monthlyUsd,
      reinvest,
    });
  }, [hist, startYm, monthlyUsd, reinvest]);

  // 来源标注按实际供数源填充：股价源看 quote.source；历史源三分；
  // 区块缺席时整段去掉，不给没供上数的源挂名。
  const priceSrcLabel = SRC_LABEL[q?.source ?? "yahoo"] ?? "Yahoo Finance";
  let histSrcLabel = "Yahoo Finance";
  if (hist?.source === "bundled") {
    histSrcLabel =
      lang === "zh"
        ? `站内兜底数据（截至 ${hist.bundledAsOf}）`
        : `stored fallback data (as of ${hist.bundledAsOf})`;
  } else if (hist?.source === "bundled+cboe") {
    histSrcLabel =
      lang === "zh"
        ? `站内兜底数据（截至 ${hist.bundledAsOf}）+ Cboe/stockanalysis 补新`
        : `stored fallback data (as of ${hist.bundledAsOf}) topped up via Cboe/stockanalysis`;
  }
  let sourceText = d.sourceLine.replace("{ps}", priceSrcLabel);
  if (hist) {
    sourceText = sourceText.replace("{hs}", histSrcLabel);
  } else {
    sourceText = sourceText
      .replace(" · {hs}（回测月线与分红）", "")
      .replace(" · {hs} (backtest monthly data & dividends)", "");
  }
  sourceText = data
    ? sourceText.replace("{qt}", fmtTime(data.fetchedAt))
    : sourceText.replace(" · 取数 {qt}", "").replace(" · fetched {qt}", "");

  const athDateLabel = q
    ? q.ath.date.length === 7
      ? lang === "zh"
        ? `${q.ath.date} 月末`
        : `${q.ath.date} month-end`
      : q.ath.date
    : "";

  return (
    <section className="crcl-board" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">{sourceText}</p>
      </div>

      {!data && !failed && <p className="burn-note">{d.loading}</p>}
      {failed && <p className="burn-note">{d.loadError}</p>}

      {data && (
        <>
          {/* 英雄区：现价 */}
          {q ? (
            <div className="crcl-hero">
              <p className="crcl-hero-meta">
                {d.quoteMeta.replace("{date}", q.quoteDate)}
              </p>
              <div className="crcl-price-row">
                <span className="crcl-price">{fmtPrice(q.price)}</span>
                <span
                  className={`crcl-change ${q.changePct < 0 ? "is-down" : "is-up"}`}
                >
                  {fmtSignedPct(q.changePct, 2)}
                </span>
              </div>
              <p className="crcl-hero-sub">{d.priceAsOf}</p>
            </div>
          ) : (
            <p className="burn-note">{d.quoteFail}</p>
          )}

          {/* 行情卡组 */}
          {q && (
            <div className="burn-grid crcl-stats">
              <div className="burn-stat burn-stat-hero">
                <p className="burn-stat-label">{d.statDrawdown}</p>
                <p className="burn-stat-value">
                  −{q.athDrawdownPct.toFixed(1)}%
                </p>
                <p className="burn-stat-sub">
                  {d.statDrawdownSub
                    .replace("{ath}", fmtPrice(q.ath.value))
                    .replace("{date}", athDateLabel)}
                </p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statAth}</p>
                <p className="burn-stat-value">{fmtPrice(q.ath.value)}</p>
                <p className="burn-stat-sub">{d.statAthSub}</p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">
                  {d.statHigh52.replace("{d}", q.high52.date)}
                </p>
                <p className="burn-stat-value">{fmtPrice(q.high52.value)}</p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">
                  {d.statLow52.replace("{d}", q.low52.date)}
                </p>
                <p className="burn-stat-value">{fmtPrice(q.low52.value)}</p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statMa200}</p>
                <p className="burn-stat-value">
                  {fmtSignedPct(q.ma200DevPct, 1)}
                </p>
                <p className="burn-stat-sub">
                  {d.statMa200Sub.replace("{v}", fmtPrice(q.ma200))}
                </p>
              </div>
              {pe && (
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statPe}</p>
                  <p className="burn-stat-value">{pe.value.toFixed(1)}</p>
                  <p className="burn-stat-sub">{d.statPeSub}</p>
                </div>
              )}
            </div>
          )}

          {/* 52 周水位条 */}
          {q && (
            <div className="qqqi-pos52">
              <p className="qqqi-pos52-label">
                {d.pos52Label.replace("{p}", `${q.pos52Pct.toFixed(0)}%`)}
              </p>
              <div className="burn-bar">
                <div
                  className="burn-bar-fill"
                  style={{ width: `${q.pos52Pct}%` }}
                />
              </div>
            </div>
          )}

          {/* 01 估值温度 */}
          <h3 className="crcl-sec-title">{d.secTemp}</h3>
          <p className="body-text crcl-sec-intro">{d.tempIntro}</p>
          {q && temp ? (
            <>
              <div className="qqqi-gauge-head">
                <span className={`qqqi-chip qqq-band is-${temp.band}`}>
                  {d.bands[temp.band]}
                </span>
                <span className="qqqi-gauge-now">
                  {d.tempScore.replace("{s}", temp.score.toFixed(0))}
                </span>
                <span className="qqqi-gauge-meta">
                  {d.partMa200
                    .replace("{v}", fmtSignedPct(q.ma200DevPct, 1))
                    .replace("{s}", temp.parts.ma200.toFixed(0))}
                  {" · "}
                  {d.partAth
                    .replace("{dd}", `−${q.athDrawdownPct.toFixed(1)}%`)
                    .replace("{s}", temp.parts.ath.toFixed(0))}
                  {" · "}
                  {d.partPos52
                    .replace("{p}", `${q.pos52Pct.toFixed(0)}%`)
                    .replace("{s}", temp.parts.pos52.toFixed(0))}
                  {" · "}
                  {temp.parts.pe != null && pe
                    ? d.partPe
                        .replace("{v}", pe.value.toFixed(1))
                        .replace("{s}", temp.parts.pe.toFixed(0))
                    : d.partPeOff}
                </span>
              </div>
              <div
                className="qqqi-gauge"
                role="img"
                aria-label={`${d.bands[temp.band]} · ${d.tempScore.replace("{s}", temp.score.toFixed(0))}`}
              >
                <div className="qqqi-gauge-zone qqq-zone is-hot" style={{ width: "35%" }}>
                  {d.zoneHot}
                </div>
                <div className="qqqi-gauge-zone qqq-zone is-warm" style={{ width: "15%" }}>
                  {d.zoneWarm}
                </div>
                <div className="qqqi-gauge-zone qqq-zone is-cool" style={{ width: "15%" }}>
                  {d.zoneCool}
                </div>
                <div className="qqqi-gauge-zone qqq-zone is-cold" style={{ width: "35%" }}>
                  {d.zoneCold}
                </div>
                <span
                  className="qqqi-gauge-marker"
                  style={{ left: `${temp.score}%` }}
                />
              </div>
              <p className="body-text" style={{ marginTop: 10 }}>
                {d.tempRules}
              </p>
            </>
          ) : (
            <p className="burn-note">{d.quoteFail}</p>
          )}

          {/* 02 定投回测器 */}
          <h3 className="crcl-sec-title">{d.secBacktest}</h3>
          <p className="body-text crcl-sec-intro">{d.btIntro}</p>
          {hist ? (
            <>
              <p className="qqqi-gauge-meta" style={{ marginBottom: 10 }}>
                {d.btDataLine
                  .replace("{through}", hist.throughMonth)
                  .replace("{srcNote}", histSrcLabel)}
              </p>
              <div className="qqqi-sim-form">
                <label className="qqqi-field">
                  <span>{d.inStartYear}</span>
                  <select
                    className="qqqi-input"
                    value={effYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                  >
                    {yearsAvail.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="qqqi-field">
                  <span>{d.inStartMonth}</span>
                  <select
                    className="qqqi-input"
                    value={effMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                  >
                    {monthsInYear.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="qqqi-field">
                  <span>{d.inMonthly}</span>
                  <input
                    className="qqqi-input"
                    type="number"
                    min={0}
                    step={50}
                    value={monthlyStr}
                    onChange={(e) => setMonthlyStr(e.target.value)}
                  />
                </label>
                <label className="qqqi-field qqqi-field-check">
                  <span>{d.inReinvest}</span>
                  <button
                    type="button"
                    className={`qqqi-toggle${reinvest ? " is-on" : ""}`}
                    aria-pressed={reinvest}
                    onClick={() => setReinvest((v) => !v)}
                  >
                    {reinvest ? d.reinvestOn : d.reinvestOff}
                  </button>
                </label>
              </div>

              {bt ? (
                <>
                  <div className="burn-grid crcl-stats qqqi-sim-out">
                    <div className="burn-stat burn-stat-hero">
                      <p className="burn-stat-label">{d.outAssets}</p>
                      <p className="burn-stat-value">{fmtUsd(bt.totalAssets, 0)}</p>
                      <p className="burn-stat-sub">
                        {d.outAssetsSub
                          .replace("{sv}", fmtUsd(bt.sharesValue, 0))
                          .replace("{cd}", fmtUsd(bt.cashDividends, 0))}
                      </p>
                    </div>
                    <div className="burn-stat burn-stat-hero">
                      <p className="burn-stat-label">{d.outXirr}</p>
                      <p className="burn-stat-value">
                        {bt.xirrPct != null
                          ? fmtSignedPct(bt.xirrPct, 2)
                          : "—"}
                      </p>
                      <p className="burn-stat-sub">{d.outXirrSub}</p>
                    </div>
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.outContrib}</p>
                      <p className="burn-stat-value">
                        {fmtUsd(bt.contributed, 0)}
                      </p>
                    </div>
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.outShares}</p>
                      <p className="burn-stat-value">
                        {bt.endShares.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.outAvgCost}</p>
                      <p className="burn-stat-value">{fmtUsd(bt.avgCost)}</p>
                      <p className="burn-stat-sub">
                        {d.outAvgCostSub.replace("{p}", fmtPrice(bt.endPrice))}
                      </p>
                    </div>
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.outDivs}</p>
                      <p className="burn-stat-value">
                        {fmtUsd(bt.totalDividends, 0)}
                      </p>
                    </div>
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.outMaxDd}</p>
                      <p className="burn-stat-value">
                        −{bt.maxDrawdownPct.toFixed(1)}%
                      </p>
                      <p className="burn-stat-sub">{d.outMaxDdSub}</p>
                    </div>
                  </div>

                  <p className="qqqi-assump">
                    {(bt.lump.annualizedPct != null
                      ? d.lumpLine.replace(
                          "{ann}",
                          fmtSignedPct(bt.lump.annualizedPct, 2)
                        )
                      : d.lumpLineNoAnn
                    )
                      .replace("{total}", fmtUsd(bt.contributed, 0))
                      .replace("{start}", bt.startYm)
                      .replace("{assets}", fmtUsd(bt.lump.totalAssets, 0))
                      .replace(
                        "{diff}",
                        bt.lump.totalAssets >= bt.totalAssets
                          ? d.diffMore.replace(
                              "{d}",
                              fmtUsd(bt.lump.totalAssets - bt.totalAssets, 0)
                            )
                          : d.diffLess.replace(
                              "{d}",
                              fmtUsd(bt.totalAssets - bt.lump.totalAssets, 0)
                            )
                      )}
                  </p>

                  <div className="burn-table-wrap">
                    <table className="burn-table">
                      <thead>
                        <tr>
                          <th>{d.colYear}</th>
                          <th>{d.colContrib}</th>
                          <th>{d.colDivYear}</th>
                          <th>{d.colShares}</th>
                          <th>{d.colAssets}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bt.yearly.map((row) => (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            <td>{fmtUsd(row.contributed, 0)}</td>
                            <td>{fmtUsd(row.dividends, 0)}</td>
                            <td>
                              {row.endShares.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td>{fmtUsd(row.endAssets, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="burn-note">{d.btNeedAmount}</p>
              )}
              <p className="body-text" style={{ marginTop: 12 }}>
                {d.btCaliber}
              </p>
            </>
          ) : (
            <p className="burn-note">{d.historyFail}</p>
          )}

          {/* 03 风险与口径 */}
          <h3 className="crcl-sec-title">{d.secRisk}</h3>
          <div className="burn-notes">
            <div className="card">
              {d.riskParas.map((p, i) => (
                <p
                  key={i}
                  className="body-text"
                  style={i > 0 ? { marginTop: 10 } : undefined}
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="card">
              <h2>{d.caliberTitle}</h2>
              <p className="body-text">{d.caliberBody}</p>
              <p className="body-text">{t.disclaimer}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
