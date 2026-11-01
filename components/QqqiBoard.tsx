"use client";

import { useEffect, useMemo, useState } from "react";
import {
  simulateDca,
  type QqqiPayload,
  type QqqiVerdict,
} from "@/lib/qqqi";
import { HUB_DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {ps} 股价源 · {ds} 分红源 · {qt} 取数时间（按实际供数源填充）
    loading: string;
    loadError: string;
    quoteMeta: string; // {date}
    priceAsOf: string;
    yieldBadge: string; // {y}
    statLatestDiv: string;
    statLatestDivSub: string; // {date}
    statTtm: string;
    statTtmSub: string;
    statYield: string;
    statYieldSub: string;
    statMonthly: string;
    statMonthlySub: string;
    statHigh52: string; // {d}
    statLow52: string; // {d}
    pos52Label: string; // {p}
    quoteFail: string;
    distFail: string;
    secHistory: string;
    histIntro: string;
    colExDate: string;
    colAmount: string;
    colTtm: string;
    secValue: string;
    valueIntro: string;
    gaugeYieldTitle: string; // {p} {n}
    gaugeYieldNow: string; // {y}
    gaugeMedian: string; // {m} {min} {max}
    gauge52Title: string; // {p}
    zoneCheap: string;
    zoneNeutral: string;
    zoneRich: string;
    ruleLine: string;
    valueFail: string;
    verdicts: Record<QqqiVerdict, string>;
    secSim: string;
    simIntro: string;
    inMonthly: string;
    inYears: string;
    inYield: string;
    inGrowth: string;
    inReinvest: string;
    reinvestOn: string;
    reinvestOff: string;
    simAssump: string; // {price} {m} {y} {g} {r}
    outShares: string;
    outIncome: string;
    outIncomeSub: string;
    outContrib: string;
    outDivs: string;
    outValue: string;
    colYear: string;
    colShares: string;
    colDivYear: string;
    colValue: string;
    simNeedPrice: string;
    secRisk: string;
    riskParas: string[];
    caliberTitle: string;
    caliberBody: string;
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "QQQI 数据看板 · NEOS Nasdaq-100 High Income ETF",
    sourceLine: "数据源：{ps}（股价）· {ds}（分红）· 取数 {qt}",
    loading: "正在拉取 QQQI 行情与派息数据…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    quoteMeta: "NasdaqGM（QQQI）· 日线截至 {date} · 2024-01-30 上市",
    priceAsOf: "最新收盘价",
    yieldBadge: "当前分红率 {y}",
    statLatestDiv: "最近一次派息",
    statLatestDivSub: "除息日 {date} · 每股",
    statTtm: "TTM 派息合计",
    statTtmSub: "最近 12 次月度派息 · 每股",
    statYield: "当前分红率",
    statYieldSub: "TTM 派息 ÷ 现价",
    statMonthly: "月均派息",
    statMonthlySub: "TTM ÷ 12 · 每股每月约",
    statHigh52: "52 周最高收盘 · {d}",
    statLow52: "52 周最低收盘 · {d}",
    pos52Label: "52 周水位 {p}（低→高）",
    quoteFail: "股价数据暂时拉取失败，行情与估值区块先隐藏；派息历史不受影响。",
    distFail: "派息数据暂时拉取失败，分红与模拟器区块先隐藏；行情不受影响。",
    secHistory: "01 · 派息历史",
    histIntro:
      "QQQI 按月派息。下表为最近 24 次除息记录（每股金额，USD）；「滚动 TTM」为含当次在内的最近 12 次之和——分红率就是拿这个数除以现价。",
    colExDate: "除息日",
    colAmount: "每股派息",
    colTtm: "滚动 TTM（12 次）",
    secValue: "02 · 估值参考（收息角度）",
    valueIntro:
      "收息型 ETF 没有市盈率可看，能看的是两件事：现在买入锁定的分红率，放在它自己历史里算高还是算低；股价在 52 周区间里处于什么水位。下面这把刻度只按分红率分位定档，不掺其它指标。",
    gaugeYieldTitle: "分红率自身历史分位 {p} · 共 {n} 个月样本",
    gaugeYieldNow: "当前分红率 {y}",
    gaugeMedian: "历史中位 {m} · 区间 {min} – {max}",
    gauge52Title: "股价 52 周水位 {p}",
    zoneCheap: "收息低估区（分位 ≥70）",
    zoneNeutral: "中性区（30–70）",
    zoneRich: "偏高区（<30）",
    ruleLine:
      "定档规则：分红率分位 ≥70 → 收息低估区（同样的钱现在能锁定比历史上 70% 时期更高的分红率）；30–70 → 中性区；<30 → 偏高区（分红率处于自身历史低位，多半是价格涨上去了）。注意：分红率高也可能来自股价下跌，刻度只描述「收息性价比」，不预测涨跌。",
    valueFail: "分红率分位暂时算不出：需要行情与足量派息历史同时可用，数据恢复后自动补上。",
    verdicts: {
      cheap: "收息低估区",
      neutral: "中性区",
      rich: "偏高区",
    },
    secSim: "03 · 攒股收息定投模拟器",
    simIntro:
      "把「每月投一点、靠派息慢慢攒股」算成具体数字。逐月模拟：月初按当月价买入，月末按持股数领派息；股价按你假设的年增速逐月平滑变动，分红率按你假设的年率锁定不变——都是假设，不是预测。",
    inMonthly: "每月定投金额（USD）",
    inYears: "定投年限（1–30 年）",
    inYield: "假设年分红率（%）",
    inGrowth: "假设股价年增速（%，可负）",
    inReinvest: "分红再投入",
    reinvestOn: "开（派息立即买回）",
    reinvestOff: "关（派息留作现金）",
    simAssump:
      "本次假设：起始价 {price}（实时现价）、每月投入 {m}、年分红率 {y}、股价年增速 {g}、分红再投入 {r}。每股派息 = 当月价 × 年分红率 ÷ 12。",
    outShares: "期末总股数",
    outIncome: "期末月收息",
    outIncomeSub: "期末持股 × 期末价 × 年分红率 ÷ 12",
    outContrib: "累计投入",
    outDivs: "累计分红",
    outValue: "期末市值",
    colYear: "年份",
    colShares: "年末股数",
    colDivYear: "当年分红",
    colValue: "年末市值",
    simNeedPrice: "模拟器需要实时现价作起始价，行情恢复后自动可用。",
    secRisk: "04 · 风险与口径",
    riskParas: [
      "历史很短：QQQI 于 2024 年 1 月 30 日才上市，全部分红历史只有两年多，上面的「自身历史分位」样本就这么长，别把两年多的刻度当成穿越周期的规律。",
      "派息 ≠ 股息：QQQI 的派息来自卖出纳指 100 备兑期权的期权金，并可能包含资本返还（ROC）——即把你自己的本金的一部分发回来。分红率看着高，不等于基金赚了那么多；要看总回报（含价格涨跌），必要时对照基金公司的 ROC 通知（19a 通知）。",
      "备兑期权的代价：卖了看涨期权等于卖掉了上涨空间——纳指大涨时 QQQI 会明显跑输 QQQ；它的主场是震荡与慢牛行情里的现金流，不是进攻。",
      "模拟器是算术，不是预测：分红率与股价增速在现实中都会变，实际派息金额逐月浮动，模拟结果只帮你理解「攒股—收息」的数量级。",
    ],
    caliberTitle: "数据口径",
    caliberBody:
      "股价与日线来自 Yahoo Finance（服务端 15 分钟缓存，被机房 IP 拦截时自动切换 Cboe 延迟行情兜底）：现价为最新日线收盘价，涨跌幅对前一交易日收盘；52 周高低按最近 252 个交易日收盘口径。派息数据来自 Yahoo Finance 分红事件（不可用时由 stockanalysis.com 兜底，页头标注实际来源；服务端 12 小时缓存）：除息日为美东日期，TTM 为最近 12 次派息之和，分红率 = TTM ÷ 现价。分红率历史分位由逐月末「过去 12 个月派息 ÷ 当月末收盘」滚动计算，窗口内派息不足 10 次的月份不纳入。本页所有数字均为公开数据的机械计算，不构成投资建议。",
    toolsTitle: "相关工具",
  },
  en: {
    boardKicker: "QQQI Data Board · NEOS Nasdaq-100 High Income ETF",
    sourceLine: "Sources: {ps} (price) · {ds} (dividends) · fetched {qt}",
    loading: "Fetching QQQI price and distribution data…",
    loadError: "Data is temporarily unavailable — please refresh shortly.",
    quoteMeta: "NasdaqGM (QQQI) · daily bars as of {date} · listed 2024-01-30",
    priceAsOf: "Latest close",
    yieldBadge: "Distribution rate {y}",
    statLatestDiv: "Latest distribution",
    statLatestDivSub: "Ex-date {date} · per share",
    statTtm: "TTM distributions",
    statTtmSub: "Last 12 monthly payouts · per share",
    statYield: "Distribution rate",
    statYieldSub: "TTM distributions ÷ price",
    statMonthly: "Avg monthly payout",
    statMonthlySub: "TTM ÷ 12 · per share per month",
    statHigh52: "52-week high close · {d}",
    statLow52: "52-week low close · {d}",
    pos52Label: "52-week position {p} (low→high)",
    quoteFail: "Price data is temporarily unavailable, so the quote and valuation sections are hidden for now; distribution history is unaffected.",
    distFail: "Distribution data is temporarily unavailable, so the income sections and simulator are hidden for now; the quote is unaffected.",
    secHistory: "01 · Distribution History",
    histIntro:
      "QQQI pays monthly. The table shows the last 24 ex-dates (per-share amounts, USD); 'rolling TTM' is the sum of the 12 payouts up to and including that row — the distribution rate is that figure divided by the current price.",
    colExDate: "Ex-date",
    colAmount: "Per-share payout",
    colTtm: "Rolling TTM (12)",
    secValue: "02 · Valuation Reference (Income Angle)",
    valueIntro:
      "An income ETF has no P/E to look at. What you can check: the distribution rate you lock in today versus its own history, and where the price sits in its 52-week range. The scale below is set by the distribution-rate percentile alone — no other inputs.",
    gaugeYieldTitle: "Distribution-rate percentile {p} · {n} monthly samples",
    gaugeYieldNow: "Current distribution rate {y}",
    gaugeMedian: "Historical median {m} · range {min} – {max}",
    gauge52Title: "Price position in 52-week range {p}",
    zoneCheap: "Income-cheap zone (percentile ≥70)",
    zoneNeutral: "Neutral zone (30–70)",
    zoneRich: "Rich zone (<30)",
    ruleLine:
      "Banding rule: percentile ≥70 → income-cheap zone (the same money locks in a higher distribution rate than in 70% of its history); 30–70 → neutral; <30 → rich (the rate sits at a historical low, usually because the price ran up). Note a high rate can also come from a falling price — the scale describes income value only and predicts nothing.",
    valueFail: "The percentile needs both the live price and enough distribution history; it will appear automatically once the data recovers.",
    verdicts: {
      cheap: "Income-cheap zone",
      neutral: "Neutral zone",
      rich: "Rich zone",
    },
    secSim: "03 · Share-Accumulation DCA Simulator",
    simIntro:
      "Turn 'invest a little each month and let payouts pile up shares' into concrete numbers. Monthly simulation: buy at the start of each month at that month's price, collect the payout at month-end on your share count; the price glides at your assumed annual growth and the distribution rate stays at your assumed level — assumptions, not forecasts.",
    inMonthly: "Monthly investment (USD)",
    inYears: "Years (1–30)",
    inYield: "Assumed annual distribution rate (%)",
    inGrowth: "Assumed annual price growth (%, can be negative)",
    inReinvest: "Reinvest distributions",
    reinvestOn: "On (payouts buy back in)",
    reinvestOff: "Off (payouts kept as cash)",
    simAssump:
      "Assumptions: start price {price} (live), monthly {m}, annual distribution rate {y}, annual price growth {g}, reinvest {r}. Per-share payout = month price × annual rate ÷ 12.",
    outShares: "Final shares",
    outIncome: "Final monthly income",
    outIncomeSub: "Final shares × final price × annual rate ÷ 12",
    outContrib: "Total contributed",
    outDivs: "Total distributions",
    outValue: "Final value",
    colYear: "Year",
    colShares: "Year-end shares",
    colDivYear: "Distributions that year",
    colValue: "Year-end value",
    simNeedPrice: "The simulator needs the live price as its start price; it becomes available once the quote feed recovers.",
    secRisk: "04 · Risks & Methodology",
    riskParas: [
      "Short history: QQQI listed on 30 Jan 2024, so its entire distribution history is barely over two years. The 'own-history percentile' above is built on just that span — do not read a two-year scale as a through-cycle law.",
      "Distributions ≠ dividends: QQQI's payouts come from selling Nasdaq-100 covered calls and may include return of capital (ROC) — part of your own principal handed back. A high distribution rate does not mean the fund earned that much; judge total return (price change included) and check the fund's ROC (Section 19a) notices when it matters.",
      "The covered-call trade-off: sold upside. When the Nasdaq-100 rallies hard, QQQI will lag QQQ by a wide margin. Its home turf is cash flow in sideways-to-slowly-rising markets, not offence.",
      "The simulator is arithmetic, not a forecast: real distribution rates and prices move, and actual payouts vary month to month. Use the output to size up the accumulate-and-collect idea, nothing more.",
    ],
    caliberTitle: "Data methodology",
    caliberBody:
      "Prices and daily bars come from Yahoo Finance (15-minute server cache, automatically falling back to Cboe delayed quotes when datacenter IPs are blocked): the price shown is the latest daily close, change is versus the previous session; the 52-week high/low use the last 252 trading days' closes. Distributions come from Yahoo Finance dividend events (falling back to stockanalysis.com when unavailable — the header names the source actually used; 12-hour server cache): ex-dates are New York dates, TTM is the sum of the last 12 payouts, and the distribution rate is TTM ÷ price. The rate's history percentile rolls month by month ('trailing-12-month payouts ÷ that month-end close'); months with fewer than 10 payouts in the window are excluded. Everything here is a mechanical computation over public data and is not investment advice.",
    toolsTitle: "Related tools",
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
function fmtPct(v: number, digits = 1): string {
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

export { DICT as QQQI_DICT };

/** 供数源代码 → 页面显示名（来源标注按 API 实际返回填充）。 */
const SRC_LABEL: Record<string, string> = {
  yahoo: "Yahoo Finance",
  cboe: "Cboe",
  stockanalysis: "stockanalysis.com",
};

// QQQI 攒股收息定投看板本体：/tag/qqqi 标签页与 /tool/qqqi-panel 工具页共用同一组件。
export default function QqqiBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];

  const [data, setData] = useState<QqqiPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/qqqi")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: QqqiPayload) => {
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
  const dist = data?.dist ?? null;

  /* ---- 模拟器状态 ---- */
  const [monthlyStr, setMonthlyStr] = useState("1000");
  const [yearsStr, setYearsStr] = useState("10");
  const [yieldOverride, setYieldOverride] = useState<string | null>(null);
  const [growthStr, setGrowthStr] = useState("0");
  const [reinvest, setReinvest] = useState(true);

  const liveYield = dist?.yieldPct ?? null;
  const yieldEff =
    yieldOverride !== null
      ? parseNum(yieldOverride, liveYield ?? 14)
      : liveYield ?? 14;

  const sim = useMemo(() => {
    if (!q) return null;
    const monthlyUsd = Math.max(0, parseNum(monthlyStr, 1000));
    const years = Math.min(30, Math.max(1, Math.round(parseNum(yearsStr, 10))));
    const growth = Math.min(15, Math.max(-10, parseNum(growthStr, 0)));
    return simulateDca({
      monthlyUsd,
      years,
      annualYieldPct: yieldEff,
      annualGrowthPct: growth,
      reinvest,
      startPrice: q.price,
    });
  }, [q, monthlyStr, yearsStr, growthStr, yieldEff, reinvest]);

  const verdict = dist?.verdict ?? null;

  // 来源标注按实际供数源填充：股价源看 quote.source、分红源看 dist.source；
  // 分红区块缺席时整段去掉，不给没供上数的源挂名。
  const priceSrcLabel = SRC_LABEL[q?.source ?? "yahoo"] ?? "Yahoo Finance";
  const divSrcLabel = dist ? SRC_LABEL[dist.source] ?? dist.source : null;
  let sourceText = d.sourceLine.replace("{ps}", priceSrcLabel);
  if (divSrcLabel) {
    sourceText = sourceText.replace("{ds}", divSrcLabel);
  } else {
    sourceText = sourceText
      .replace(" · {ds}（分红）", "")
      .replace(" · {ds} (dividends)", "");
  }
  sourceText = data
    ? sourceText.replace("{qt}", fmtTime(data.fetchedAt))
    : sourceText.replace(" · 取数 {qt}", "").replace(" · fetched {qt}", "");

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
          {/* 英雄区：现价 + 分红率徽章 */}
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
                  {fmtPct(q.changePct, 2)}
                </span>
                {dist?.yieldPct != null && (
                  <span className="qqqi-yield-badge">
                    ● {d.yieldBadge.replace("{y}", `${dist.yieldPct.toFixed(2)}%`)}
                  </span>
                )}
              </div>
              <p className="crcl-hero-sub">{d.priceAsOf}</p>
            </div>
          ) : (
            <p className="burn-note">{d.quoteFail}</p>
          )}

          {/* 行情与分红卡组 */}
          {dist ? (
            <div className="burn-grid crcl-stats">
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statLatestDiv}</p>
                <p className="burn-stat-value">{fmtUsd(dist.latest.amount, 3)}</p>
                <p className="burn-stat-sub">
                  {d.statLatestDivSub.replace("{date}", dist.latest.date)}
                </p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statTtm}</p>
                <p className="burn-stat-value">{fmtUsd(dist.ttm, 3)}</p>
                <p className="burn-stat-sub">{d.statTtmSub}</p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statYield}</p>
                <p className="burn-stat-value">
                  {dist.yieldPct != null ? `${dist.yieldPct.toFixed(2)}%` : "—"}
                </p>
                <p className="burn-stat-sub">{d.statYieldSub}</p>
              </div>
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statMonthly}</p>
                <p className="burn-stat-value">{fmtUsd(dist.ttm / 12, 3)}</p>
                <p className="burn-stat-sub">{d.statMonthlySub}</p>
              </div>
              {q && (
                <>
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
                </>
              )}
            </div>
          ) : (
            <p className="burn-note">{d.distFail}</p>
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

          {/* 01 派息历史 */}
          <h3 className="crcl-sec-title">{d.secHistory}</h3>
          <p className="body-text crcl-sec-intro">{d.histIntro}</p>
          {dist ? (
            <div className="burn-table-wrap">
              <table className="burn-table">
                <thead>
                  <tr>
                    <th>{d.colExDate}</th>
                    <th>{d.colAmount}</th>
                    <th>{d.colTtm}</th>
                  </tr>
                </thead>
                <tbody>
                  {dist.history.map((row, i) => {
                    const rolling =
                      i + 11 < dist.history.length
                        ? dist.history
                            .slice(i, i + 12)
                            .reduce((s, x) => s + x.amount, 0)
                        : null;
                    return (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td>{fmtUsd(row.amount, 3)}</td>
                        <td>{rolling != null ? fmtUsd(rolling, 3) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="burn-note">{d.distFail}</p>
          )}

          {/* 02 估值参考 */}
          <h3 className="crcl-sec-title">{d.secValue}</h3>
          <p className="body-text crcl-sec-intro">{d.valueIntro}</p>
          {dist?.yieldStats && dist.yieldPct != null && verdict ? (
            <>
              <div className="qqqi-gauge-head">
                <span className={`qqqi-chip is-${verdict}`}>
                  {d.verdicts[verdict]}
                </span>
                <span className="qqqi-gauge-now">
                  {d.gaugeYieldNow.replace("{y}", `${dist.yieldPct.toFixed(2)}%`)}
                </span>
                <span className="qqqi-gauge-meta">
                  {d.gaugeYieldTitle
                    .replace("{p}", `${dist.yieldStats.percentile.toFixed(0)}`)
                    .replace("{n}", String(dist.yieldStats.points))}
                  {" · "}
                  {d.gaugeMedian
                    .replace("{m}", `${dist.yieldStats.median.toFixed(2)}%`)
                    .replace("{min}", `${dist.yieldStats.min.toFixed(2)}%`)
                    .replace("{max}", `${dist.yieldStats.max.toFixed(2)}%`)}
                </span>
              </div>
              <div
                className="qqqi-gauge"
                role="img"
                aria-label={d.gaugeYieldTitle
                  .replace("{p}", `${dist.yieldStats.percentile.toFixed(0)}`)
                  .replace("{n}", String(dist.yieldStats.points))}
              >
                <div className="qqqi-gauge-zone is-rich" style={{ width: "30%" }}>
                  {d.zoneRich}
                </div>
                <div className="qqqi-gauge-zone is-neutral" style={{ width: "40%" }}>
                  {d.zoneNeutral}
                </div>
                <div className="qqqi-gauge-zone is-cheap" style={{ width: "30%" }}>
                  {d.zoneCheap}
                </div>
                <span
                  className="qqqi-gauge-marker"
                  style={{ left: `${dist.yieldStats.percentile}%` }}
                />
              </div>
              {q && (
                <p className="qqqi-gauge-meta" style={{ marginTop: 14 }}>
                  {d.gauge52Title.replace("{p}", `${q.pos52Pct.toFixed(0)}%`)}
                  {" · "}
                  {fmtPrice(q.low52.value)} – {fmtPrice(q.high52.value)}
                </p>
              )}
              <p className="body-text" style={{ marginTop: 10 }}>
                {d.ruleLine}
              </p>
            </>
          ) : (
            <p className="burn-note">{d.valueFail}</p>
          )}

          {/* 03 定投模拟器 */}
          <h3 className="crcl-sec-title">{d.secSim}</h3>
          <p className="body-text crcl-sec-intro">{d.simIntro}</p>
          {q && sim ? (
            <>
              <div className="qqqi-sim-form">
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
                <label className="qqqi-field">
                  <span>{d.inYears}</span>
                  <input
                    className="qqqi-input"
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    value={yearsStr}
                    onChange={(e) => setYearsStr(e.target.value)}
                  />
                </label>
                <label className="qqqi-field">
                  <span>{d.inYield}</span>
                  <input
                    className="qqqi-input"
                    type="number"
                    min={0}
                    max={40}
                    step={0.1}
                    value={
                      yieldOverride !== null
                        ? yieldOverride
                        : yieldEff.toFixed(2)
                    }
                    onChange={(e) => setYieldOverride(e.target.value)}
                  />
                </label>
                <label className="qqqi-field">
                  <span>{d.inGrowth}</span>
                  <input
                    className="qqqi-input"
                    type="number"
                    min={-10}
                    max={15}
                    step={0.5}
                    value={growthStr}
                    onChange={(e) => setGrowthStr(e.target.value)}
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

              <p className="qqqi-assump">
                {d.simAssump
                  .replace("{price}", fmtPrice(q.price))
                  .replace("{m}", fmtUsd(Math.max(0, parseNum(monthlyStr, 1000)), 0))
                  .replace("{y}", `${yieldEff.toFixed(2)}%`)
                  .replace(
                    "{g}",
                    fmtPct(Math.min(15, Math.max(-10, parseNum(growthStr, 0))))
                  )
                  .replace("{r}", reinvest ? d.reinvestOn : d.reinvestOff)}
              </p>

              <div className="burn-grid crcl-stats qqqi-sim-out">
                <div className="burn-stat burn-stat-hero">
                  <p className="burn-stat-label">{d.outShares}</p>
                  <p className="burn-stat-value">
                    {sim.totalShares.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="burn-stat burn-stat-hero">
                  <p className="burn-stat-label">{d.outIncome}</p>
                  <p className="burn-stat-value">{fmtUsd(sim.finalMonthlyIncome)}</p>
                  <p className="burn-stat-sub">{d.outIncomeSub}</p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.outContrib}</p>
                  <p className="burn-stat-value">{fmtUsd(sim.contributed, 0)}</p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.outDivs}</p>
                  <p className="burn-stat-value">{fmtUsd(sim.totalDividends)}</p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.outValue}</p>
                  <p className="burn-stat-value">{fmtUsd(sim.finalValue)}</p>
                </div>
              </div>

              <div className="burn-table-wrap">
                <table className="burn-table">
                  <thead>
                    <tr>
                      <th>{d.colYear}</th>
                      <th>{d.colShares}</th>
                      <th>{d.colDivYear}</th>
                      <th>{d.colValue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.yearly.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>
                          {row.shares.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>{fmtUsd(row.divYear)}</td>
                        <td>{fmtUsd(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="burn-note">{d.simNeedPrice}</p>
          )}

          {/* 04 风险与口径 */}
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
