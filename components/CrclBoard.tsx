"use client";

import { useEffect, useState } from "react";
import type { CrclPayload, VerdictKey } from "@/lib/crcl";
import { CRCL_FINANCIALS } from "@/lib/crcl-config";
import { HUB_DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {qt} {ft}
    loading: string;
    loadError: string;
    quoteMeta: string; // {date} {ipo}
    priceAsOf: string;
    signalBadge: string; // {n}
    statMcap: string;
    statMcapSub: string; // {shares}
    statFdv: string;
    statFdvSub: string; // {shares}
    statPs: string;
    statPsSub: string; // {rev}
    statEbitda: string;
    statEbitdaSub: string;
    statAth: string;
    statAthSub: string; // {v} {d}
    statLow: string;
    statLowSub: string; // {v} {d}
    quoteFail: string;
    secSignal: string;
    signalIntro: string;
    todayScore: string; // {date}
    scoreScale: string;
    layerValuation: string; // {ps}
    layerPanic: string; // {rsi}
    layerFundamental: string; // {chg}
    ticksValuation: string[];
    ticksPanic: string[];
    vetoLine: string; // {pp} {veto}
    vetoOn: string;
    vetoOff: string;
    formulaLine: string; // {a} {b} {c} {veto} {total}
    gaugeTitle: string;
    g30: string;
    g90: string;
    g180: string;
    g365: string;
    gShare90: string;
    gVeto: string;
    inScore: string;
    notScored: string;
    currentShare: string; // {v}
    scoreFail: string;
    verdicts: Record<VerdictKey, string>;
    secUsdc: string;
    usdcSupply: string; // {date}
    usdcShare: string;
    usdcShareSub: string;
    sparkSupply: string;
    sparkShare: string;
    fundFail: string;
    secFinancials: string;
    finIntro: string;
    colPeriod: string;
    colRevenue: string;
    colEbitda: string;
    colNote: string;
    ttmRow: string;
    finNotesTitle: string;
    secManual: string;
    manualParas: string[];
    bandsTitle: string;
    caliberTitle: string;
    caliberBody: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "CRCL 数据看板 · Circle Internet Group",
    sourceLine: "数据源：Yahoo Finance（股价/日线）· DeFiLlama（USDC）· 取数 {qt}",
    loading: "正在拉取股价与 USDC 数据…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    quoteMeta: "Nasdaq（NYSE: CRCL）· 日线截至 {date} · 上市 {ipo}",
    priceAsOf: "最新收盘价",
    signalBadge: "收盘信号分 {n}",
    statMcap: "流通市值",
    statMcapSub: "{shares} 股",
    statFdv: "全流通市值 FDV",
    statFdvSub: "{shares} 稀释股（代理）",
    statPs: "P/S (TTM)",
    statPsSub: "市值 ÷ 过去 4 季营收 {rev}",
    statEbitda: "市值 / 调整后 EBITDA",
    statEbitdaSub: "TTM · 新口径",
    statAth: "距历史新高",
    statAthSub: "最高收盘 ${v} · {d}",
    statLow: "距上市低点",
    statLowSub: "最低收盘 ${v} · {d}",
    quoteFail: "股价数据暂时拉取失败，估值与信号分区块先隐藏；USDC 基本面与财报数据不受影响。",
    secSignal: "00 · 买入信号分",
    signalIntro:
      "把「什么时候该买」写成不受情绪影响的规则：v6（2026-11-01 起）：总分 =（估值层 0–80 + RSI 恐慌层 0–20 + 基本面层 ±10）× 1.3 × 否决乘数，封顶 130。基本面层按 USDC 180 天变化双向打分；否决乘数只看市占率——90 天掉超 2.5 个百分点才打折，USDC 绝对量缩水不触发（全市场一起缩是周期，份额被对手抢走才是 Circle 自己的问题）。财报按发布日生效，无未来数据。分数是纪律工具，不是预测。",
    todayScore: "今日信号分 · {date}",
    scoreScale: "基础满分 100 · 超额上限 130",
    layerValuation: "估值层 · P/S 实时 {ps}x",
    layerPanic: "恐慌层 · RSI14 {rsi}",
    layerFundamental: "基本面层 · USDC 180 天 {chg}（横盘 0 · 涨扣分双向）",
    ticksValuation: ["≥8x · 0", "6x · 30", "4.5x · 50 基础满", "3.5x · 65", "≤2.5x · 80"],
    ticksPanic: ["RSI ≥45 · 0", "RSI ≤30 · 20"],
    vetoLine: "黑天鹅否决：市占率 90 天 {pp} · 乘数 ×{veto} · {state}",
    vetoOn: "已触发打折",
    vetoOff: "未触发",
    formulaLine: "总分 =（{a} + {b} + {c}）× 1.3 × {veto} = {total}",
    gaugeTitle: "基本面仪表 · USDC 发行量变化 / 市占率 / 否决开关（仅 180 天一项进分数，其余供判断趋势）",
    g30: "USDC 30 天",
    g90: "USDC 90 天",
    g180: "USDC 180 天",
    g365: "USDC 365 天",
    gShare90: "市占率 90 天",
    gVeto: "黑天鹅否决",
    inScore: "进分数",
    notScored: "不计分",
    currentShare: "当前 {v} · 否决看这个（>2.5pp）",
    scoreFail: "信号分暂时算不出：需要股价与 USDC 两路数据同时可用，缺失的一路恢复后自动补上。",
    verdicts: {
      avoid: "明显高估 · 回避",
      watch: "偏高估 · 观望",
      start: "偏低估 · 小额分批开始",
      add: "低估 · 分批加仓",
      strong: "明显低估 · 积极分批",
      historic: "历史级低估 · 重仓窗口",
    },
    secUsdc: "01 · USDC 基本面",
    usdcSupply: "USDC 供应量 · {date}",
    usdcShare: "USDC 市占率",
    usdcShareSub: "占美元锚定稳定币总供应",
    sparkSupply: "供应量走势（近 1 年）",
    sparkShare: "市占率走势（近 1 年）",
    fundFail: "USDC 数据暂时拉取失败，基本面区块先隐藏；股价与财报数据不受影响。",
    secFinancials: "02 · 营收与利润",
    finIntro:
      "股本与利润表没有干净的免费自动源，本站按财报做成可编辑配置：每行标注是披露值、推导值还是推估值，TTM 合计与估值卡片同源。最新财报期截至 {end}，新财报发布后按发布日生效更新。",
    colPeriod: "季度",
    colRevenue: "营收（$M）",
    colEbitda: "调整后 EBITDA（$M）",
    colNote: "出处",
    ttmRow: "TTM（滚动四季）",
    finNotesTitle: "口径说明",
    secManual: "05 · 使用手册",
    manualParas: [
      "总分 =（估值层 + 恐慌层 + 基本面层）× 1.3 × 否决乘数，封顶 130、下限 0。基础满分 100，超过 100 的部分来自三层同时极端时的超额。",
      "估值层刻度：P/S ≥8x → 0；6x → 30；4.5x → 50（基础满，标尺竖线位）；3.5x → 65；≤2.5x → 80，锚点之间线性插值。P/S = 流通市值 ÷ TTM 营收，股价变，估值层实时变。",
      "恐慌层刻度：RSI14 ≥45 → 0；≤30 → 20，之间线性。RSI 用上市以来完整日线按 Wilder 法计算，信号分与技术指标均按日线收盘口径（技术面已并入本区与英雄区，不单列）。",
      "基本面层：USDC 供应量 180 天变化率 ÷15% ×10，限 ±10——涨 15% 加满、缩 15% 扣满、横盘 0 分。为什么只用 180 天：30/90 天太容易被单周大额申赎带偏，365 天又太迟钝。",
      "否决规则（黑天鹅否决）：只看市占率。USDC 市占率 90 天掉幅 ≤2.5pp 时乘数 1.0；2.5–4pp 之间线性降到 0.8；≥4pp 时乘数 0.8。USDC 绝对量缩水永不触发否决——全市场一起缩是周期，份额被对手抢走才是 Circle 自己的问题。",
      "财报按发布日生效，无未来数据：股本、营收、EBITDA 在新财报正式发布后才更新到面板，季度中途不预填、不外推。",
      "分数是纪律工具，不是预测：它只负责把「贵不贵、慌不慌、基本面顺不顺」量化成一个可执行的数，不预测股价涨跌。",
    ],
    bandsTitle: "判定带",
    caliberTitle: "数据口径",
    caliberBody:
      "股价与日线来自 Yahoo Finance（服务端 15 分钟缓存）：现价为最新日线收盘价，涨跌幅对前一交易日收盘；历史新高/上市低点均按收盘价口径（与参考看板一致）。USDC 供应与市占率来自 DeFiLlama 稳定币日序列（服务端 12 小时缓存）：市占率 = USDC 供应 ÷ 美元锚定稳定币总供应；180 天等变化率按日序列首尾值计算，与参考看板因取数日对齐方式不同会有小数点级差异。股本与利润表见「02 · 营收与利润」的口径说明，均为标注了来源与截至日期的可编辑配置。",
    disclaimerTitle: "风险提示",
    disclaimerBody:
      "本页按公开规则模型（v6）对公开数据做机械计算，信号分与判定带均为模型输出，不是预测，不构成投资建议。财报类配置数字含推导/推估成分（已逐项标注），请以 Circle 官方财报为准；据此操作的风险自担。",
    toolsTitle: "相关工具",
  },
  en: {
    boardKicker: "CRCL Data Board · Circle Internet Group",
    sourceLine: "Sources: Yahoo Finance (price/daily bars) · DeFiLlama (USDC) · fetched {qt}",
    loading: "Fetching price and USDC data…",
    loadError: "Data is temporarily unavailable — please refresh shortly.",
    quoteMeta: "Nasdaq (NYSE: CRCL) · daily bars as of {date} · IPO {ipo}",
    priceAsOf: "Latest close",
    signalBadge: "Close signal score {n}",
    statMcap: "Market cap",
    statMcapSub: "{shares} shares",
    statFdv: "Fully diluted value (FDV)",
    statFdvSub: "{shares} diluted shares (proxy)",
    statPs: "P/S (TTM)",
    statPsSub: "Market cap ÷ TTM revenue {rev}",
    statEbitda: "Market cap / Adj. EBITDA",
    statEbitdaSub: "TTM · new caliber",
    statAth: "From all-time high",
    statAthSub: "Highest close ${v} · {d}",
    statLow: "From post-IPO low",
    statLowSub: "Lowest close ${v} · {d}",
    quoteFail: "Price data is temporarily unavailable, so valuation and signal sections are hidden for now; USDC fundamentals and financials are unaffected.",
    secSignal: "00 · Buy Signal Score",
    signalIntro:
      "Turning 'when should I buy?' into emotion-free rules: v6 (from 2026-11-01): total = (valuation layer 0–80 + RSI panic layer 0–20 + fundamentals layer ±10) × 1.3 × veto multiplier, capped at 130. The fundamentals layer scores USDC's 180-day change two-sided; the veto multiplier watches market share only — a haircut starts only when share drops more than 2.5pp in 90 days, and a shrinking USDC supply alone never triggers it (a market-wide shrink is the cycle; share taken by rivals is Circle's own problem). Financials take effect on their release dates — no future data. The score is a discipline tool, not a prediction.",
    todayScore: "Today's signal score · {date}",
    scoreScale: "Base full score 100 · extended cap 130",
    layerValuation: "Valuation layer · live P/S {ps}x",
    layerPanic: "Panic layer · RSI14 {rsi}",
    layerFundamental: "Fundamentals layer · USDC 180d {chg} (flat 0 · two-sided)",
    ticksValuation: ["≥8x · 0", "6x · 30", "4.5x · 50 base full", "3.5x · 65", "≤2.5x · 80"],
    ticksPanic: ["RSI ≥45 · 0", "RSI ≤30 · 20"],
    vetoLine: "Black-swan veto: share 90d {pp} · multiplier ×{veto} · {state}",
    vetoOn: "haircut active",
    vetoOff: "not triggered",
    formulaLine: "Total = ({a} + {b} + {c}) × 1.3 × {veto} = {total}",
    gaugeTitle: "Fundamentals gauge · USDC supply changes / share / veto switch (only the 180-day item scores; the rest reads the trend)",
    g30: "USDC 30d",
    g90: "USDC 90d",
    g180: "USDC 180d",
    g365: "USDC 365d",
    gShare90: "Share 90d",
    gVeto: "Black-swan veto",
    inScore: "Scores",
    notScored: "Not scored",
    currentShare: "Now {v} · the veto watches this (>2.5pp)",
    scoreFail: "The signal score needs both the price and USDC feeds; it will appear automatically once the missing feed recovers.",
    verdicts: {
      avoid: "Clearly overvalued · Avoid",
      watch: "Somewhat overvalued · Watch",
      start: "Somewhat undervalued · Start small staged buys",
      add: "Undervalued · Stage in more",
      strong: "Clearly undervalued · Active staged buying",
      historic: "Historically undervalued · Heavy window",
    },
    secUsdc: "01 · USDC Fundamentals",
    usdcSupply: "USDC supply · {date}",
    usdcShare: "USDC market share",
    usdcShareSub: "Of total USD-pegged stablecoin supply",
    sparkSupply: "Supply trend (past year)",
    sparkShare: "Share trend (past year)",
    fundFail: "USDC data is temporarily unavailable, so the fundamentals section is hidden for now; price and financials are unaffected.",
    secFinancials: "02 · Revenue & Profit",
    finIntro:
      "Share counts and income-statement figures have no clean free automated feed, so this site keeps them as an editable, filing-based configuration: every row is labeled reported, derived or estimated, and the TTM totals feed the valuation cards above. Latest reported period ends {end}; new filings take effect on their release dates.",
    colPeriod: "Quarter",
    colRevenue: "Revenue ($M)",
    colEbitda: "Adj. EBITDA ($M)",
    colNote: "Source",
    ttmRow: "TTM (trailing four quarters)",
    finNotesTitle: "Methodology notes",
    secManual: "05 · User Manual",
    manualParas: [
      "Total = (valuation + panic + fundamentals) × 1.3 × veto multiplier, capped at 130, floored at 0. The base full score is 100; anything above comes from all three layers hitting extremes at once.",
      "Valuation scale: P/S ≥8x → 0; 6x → 30; 4.5x → 50 (base full, the tick-mark line); 3.5x → 65; ≤2.5x → 80, linearly interpolated between anchors. P/S = market cap ÷ TTM revenue, so this layer moves with the live price.",
      "Panic scale: RSI14 ≥45 → 0; ≤30 → 20, linear in between. RSI is Wilder's, computed on the full daily series since IPO; the score and all technicals use daily closes (technicals are folded into this section and the hero, not listed separately).",
      "Fundamentals layer: USDC supply's 180-day change ÷ 15% × 10, clamped to ±10 — +15% maxes it, −15% floors it, flat scores 0. Why 180 days only: 30/90 days get whipped around by single-week mints and redeems, and 365 days reacts too slowly.",
      "Veto rule (black-swan veto): market share only. If USDC's share drops ≤2.5pp in 90 days the multiplier is 1.0; between 2.5pp and 4pp it slides linearly to 0.8; at ≥4pp it is 0.8. A shrinking USDC supply on its own never triggers the veto — a market-wide shrink is the cycle; share taken by rivals is Circle's own problem.",
      "Financials take effect on release dates, with no future data: share counts, revenue and EBITDA are updated only after a filing is actually published — never pre-filled or extrapolated mid-quarter.",
      "The score is a discipline tool, not a prediction: it only quantifies cheap-or-not, panic-or-not and fundamentals into one actionable number. It does not forecast the share price.",
    ],
    bandsTitle: "Verdict bands",
    caliberTitle: "Data methodology",
    caliberBody:
      "Prices and daily bars come from Yahoo Finance (15-minute server cache): the displayed price is the latest daily close and the change is versus the previous session's close; the all-time high and post-IPO low use closing prices, matching the reference board. USDC supply and share come from DeFiLlama's stablecoin daily series (12-hour server cache): share = USDC supply ÷ total USD-pegged stablecoin supply; period changes use the series' first and last values, so minor decimals can differ from the reference board's alignment. Share counts and financials are the editable configuration detailed under '02 · Revenue & Profit', each with sources and as-of dates.",
    disclaimerTitle: "Risk notice",
    disclaimerBody:
      "This page mechanically applies a public rule model (v6) to public data. The score and verdict bands are model outputs, not predictions, and nothing here is investment advice. Configured financial figures include derived and estimated components (labeled item by item) — Circle's official filings prevail. Trade at your own risk.",
    toolsTitle: "Related tools",
  },
};

const VERDICT_ORDER: { key: VerdictKey; range: string }[] = [
  { key: "avoid", range: "0–19" },
  { key: "watch", range: "20–39" },
  { key: "start", range: "40–59" },
  { key: "add", range: "60–79" },
  { key: "strong", range: "80–99" },
  { key: "historic", range: "100–130" },
];

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`;
}
function fmtUsdB(v: number): string {
  return `$${(v / 1e9).toFixed(2)}B`;
}
function fmtUsdM(v: number): string {
  return `$${fmtInt(v)}M`;
}
function fmtPct(v: number, digits = 1): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)}%`;
}
function fmtPp(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(1)}pp`;
}
function fmtSharesM(v: number): string {
  return `${(v / 1e6).toFixed(1)}M`;
}
function fmtTime(iso: string): string {
  const dt = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}`;
}
function round1(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1);
}

/** 简易 SVG 走势线（面积填充 + 折线），points 为数值序列。 */
function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  if (values.length < 2) return null;
  const w = 300;
  const h = 72;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => (i / (values.length - 1)) * w;
  const py = (v: number) => h - 6 - ((v - min) / span) * (h - 12);
  const line = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg
      className="crcl-spark"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={area} fill={stroke} opacity={0.12} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={1.8} />
    </svg>
  );
}

/** 标准分数条（0..max 线性），可带刻度标注（pos 为分数值）。 */
function LayerBar({
  value,
  max,
  ticks,
}: {
  value: number;
  max: number;
  ticks: { at: number; label: string }[];
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="crcl-layer-bar">
      <div className="crcl-track">
        <div className="crcl-fill" style={{ width: `${pct}%` }} />
        {ticks.map((tk) => (
          <span
            key={tk.label}
            className="crcl-track-tick"
            style={{ left: `${(tk.at / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="crcl-ticks">
        {ticks.map((tk) => (
          <span
            key={tk.label}
            className="crcl-tick-label"
            style={{ left: `${(tk.at / max) * 100}%` }}
          >
            {tk.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 基本面层专用：−10…+10 零点居中条。 */
function ZeroBar({ value }: { value: number }) {
  const pos = ((value + 10) / 20) * 100; // 0..100
  const from = Math.min(50, pos);
  const width = Math.abs(pos - 50);
  return (
    <div className="crcl-layer-bar">
      <div className="crcl-track">
        <span className="crcl-track-zero" />
        <div
          className={`crcl-fill ${value < 0 ? "is-neg" : ""}`}
          style={{ left: `${from}%`, width: `${width}%` }}
        />
      </div>
      <div className="crcl-ticks crcl-ticks-ends">
        <span>−10</span>
        <span>0</span>
        <span>+10</span>
      </div>
    </div>
  );
}

export { DICT as CRCL_DICT };

// CRCL 买入估值看板本体：/tag/crcl 标签页与 /tool/crcl-panel 工具页共用同一组件。
export default function CrclBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];
  const fin = CRCL_FINANCIALS;

  const [data, setData] = useState<CrclPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/crcl")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: CrclPayload) => {
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
  const f = data?.fund ?? null;
  const val = data?.valuation ?? null;
  const s = data?.score ?? null;
  const verdict = s ? d.verdicts[s.verdict] : null;

  return (
      <section className="crcl-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">
            {data
              ? d.sourceLine.replace("{qt}", fmtTime(data.fetchedAt))
              : d.sourceLine.replace(" · 取数 {qt}", "").replace(" · fetched {qt}", "")}
          </p>
        </div>

        {!data && !failed && <p className="burn-note">{d.loading}</p>}
        {failed && <p className="burn-note">{d.loadError}</p>}

        {data && (
          <>
            {/* 英雄区：现价 + 信号分徽章 */}
            {q ? (
              <div className="crcl-hero">
                <p className="crcl-hero-meta">
                  {d.quoteMeta
                    .replace("{date}", q.quoteDate)
                    .replace("{ipo}", fin.ipoDate)}
                </p>
                <div className="crcl-price-row">
                  <span className="crcl-price">{fmtPrice(q.price)}</span>
                  <span
                    className={`crcl-change ${q.changePct < 0 ? "is-down" : "is-up"}`}
                  >
                    {fmtPct(q.changePct, 2)}
                  </span>
                  {s && verdict && (
                    <span className={`crcl-badge is-${s.verdict}`}>
                      ● {d.signalBadge.replace("{n}", String(s.total))} · {verdict}
                    </span>
                  )}
                </div>
                <p className="crcl-hero-sub">{d.priceAsOf}</p>
              </div>
            ) : (
              <p className="burn-note">{d.quoteFail}</p>
            )}

            {/* 六张指标卡 */}
            {q && val && (
              <div className="burn-grid crcl-stats">
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statMcap}</p>
                  <p className="burn-stat-value">{fmtUsdB(val.marketCap)}</p>
                  <p className="burn-stat-sub">
                    {d.statMcapSub.replace(
                      "{shares}",
                      fmtSharesM(fin.sharesOutstanding)
                    )}
                  </p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statFdv}</p>
                  <p className="burn-stat-value">{fmtUsdB(val.fdv)}</p>
                  <p className="burn-stat-sub">
                    {d.statFdvSub.replace(
                      "{shares}",
                      fmtSharesM(fin.dilutedShares)
                    )}
                  </p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statPs}</p>
                  <p className="burn-stat-value">{val.ps.toFixed(2)}x</p>
                  <p className="burn-stat-sub">
                    {d.statPsSub.replace("{rev}", fmtUsdM(fin.revenueTTM_M))}
                  </p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statEbitda}</p>
                  <p className="burn-stat-value">{val.mcapToEbitda.toFixed(1)}x</p>
                  <p className="burn-stat-sub">{d.statEbitdaSub}</p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statAth}</p>
                  <p className="burn-stat-value">{fmtPct(q.distAthPct)}</p>
                  <p className="burn-stat-sub">
                    {d.statAthSub
                      .replace("{v}", q.ath.value.toFixed(2))
                      .replace("{d}", q.ath.date)}
                  </p>
                </div>
                <div className="burn-stat">
                  <p className="burn-stat-label">{d.statLow}</p>
                  <p className="burn-stat-value">{fmtPct(q.distLowPct)}</p>
                  <p className="burn-stat-sub">
                    {d.statLowSub
                      .replace("{v}", q.low.value.toFixed(2))
                      .replace("{d}", q.low.date)}
                  </p>
                </div>
              </div>
            )}

            {/* 00 买入信号分 */}
            <h3 className="crcl-sec-title">{d.secSignal}</h3>
            <p className="body-text crcl-sec-intro">{d.signalIntro}</p>
            {s && q && f && val ? (
              <>
                <div className="crcl-signal-grid">
                  <div className="crcl-score-card">
                    <p className="crcl-score-label">
                      {d.todayScore.replace("{date}", q.quoteDate)}
                    </p>
                    <p className="crcl-score-big">{s.total}</p>
                    <p className="crcl-score-scale">{d.scoreScale}</p>
                    <span className={`crcl-band-chip is-${s.verdict}`}>{verdict}</span>
                    <p className="crcl-formula">
                      {d.formulaLine
                        .replace("{a}", String(Math.round(s.valuation)))
                        .replace("{b}", String(Math.round(s.panic)))
                        .replace("{c}", round1(s.fundamental))
                        .replace("{veto}", s.veto.toFixed(2).replace(/0$/, ""))
                        .replace("{total}", String(s.total))}
                    </p>
                  </div>
                  <div className="crcl-layers">
                    <div className="crcl-layer">
                      <div className="crcl-layer-head">
                        <span>
                          {d.layerValuation.replace("{ps}", val.ps.toFixed(2))}
                        </span>
                        <span className="crcl-layer-score">
                          {Math.round(s.valuation)} / 80
                        </span>
                      </div>
                      <LayerBar
                        value={s.valuation}
                        max={80}
                        ticks={[
                          { at: 0, label: d.ticksValuation[0] },
                          { at: 30, label: d.ticksValuation[1] },
                          { at: 50, label: d.ticksValuation[2] },
                          { at: 65, label: d.ticksValuation[3] },
                          { at: 80, label: d.ticksValuation[4] },
                        ]}
                      />
                    </div>
                    <div className="crcl-layer">
                      <div className="crcl-layer-head">
                        <span>{d.layerPanic.replace("{rsi}", q.rsi14.toFixed(1))}</span>
                        <span className="crcl-layer-score">
                          {Math.round(s.panic)} / 20
                        </span>
                      </div>
                      <LayerBar
                        value={s.panic}
                        max={20}
                        ticks={[
                          { at: 0, label: d.ticksPanic[0] },
                          { at: 20, label: d.ticksPanic[1] },
                        ]}
                      />
                    </div>
                    <div className="crcl-layer">
                      <div className="crcl-layer-head">
                        <span>
                          {d.layerFundamental.replace("{chg}", fmtPct(f.chg180Pct))}
                        </span>
                        <span className="crcl-layer-score">
                          {round1(s.fundamental)} / ±10
                        </span>
                      </div>
                      <ZeroBar value={s.fundamental} />
                    </div>
                    <p className="crcl-veto-line">
                      {d.vetoLine
                        .replace("{pp}", fmtPp(f.shareChg90Pp))
                        .replace("{veto}", s.veto.toFixed(2).replace(/0$/, ""))
                        .replace("{state}", s.veto < 1 ? d.vetoOn : d.vetoOff)}
                    </p>
                  </div>
                </div>

                {/* 基本面仪表 */}
                <p className="crcl-gauge-title">{d.gaugeTitle}</p>
                <div className="burn-grid crcl-gauge">
                  {[
                    { label: d.g30, v: fmtPct(f.chg30Pct), neg: f.chg30Pct < 0, chip: d.notScored },
                    { label: d.g90, v: fmtPct(f.chg90Pct), neg: f.chg90Pct < 0, chip: d.notScored },
                    { label: d.g180, v: fmtPct(f.chg180Pct), neg: f.chg180Pct < 0, chip: d.inScore, hot: true },
                    { label: d.g365, v: fmtPct(f.chg365Pct), neg: f.chg365Pct < 0, chip: d.notScored },
                  ].map((g) => (
                    <div key={g.label} className={`burn-stat${g.hot ? " burn-stat-hero" : ""}`}>
                      <p className="burn-stat-label">
                        {g.label}
                        <span className="crcl-chip">{g.chip}</span>
                      </p>
                      <p className={`burn-stat-value crcl-gauge-value ${g.neg ? "is-neg" : "is-pos"}`}>
                        {g.v}
                      </p>
                    </div>
                  ))}
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.gShare90}</p>
                    <p className={`burn-stat-value crcl-gauge-value ${f.shareChg90Pp < 0 ? "is-neg" : "is-pos"}`}>
                      {fmtPp(f.shareChg90Pp)}
                    </p>
                    <p className="burn-stat-sub">
                      {d.currentShare.replace("{v}", `${f.shareNowPct.toFixed(1)}%`)}
                    </p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.gVeto}</p>
                    <p className={`burn-stat-value crcl-gauge-value ${s.veto < 1 ? "is-neg" : "is-pos"}`}>
                      {s.veto < 1 ? d.vetoOn : d.vetoOff}
                    </p>
                    <p className="burn-stat-sub">
                      ×{s.veto.toFixed(2).replace(/0$/, "")}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="burn-note">{d.scoreFail}</p>
            )}

            {/* 01 USDC 基本面 */}
            <h3 className="crcl-sec-title">{d.secUsdc}</h3>
            {f ? (
              <>
                <div className="burn-grid crcl-stats">
                  <div className="burn-stat">
                    <p className="burn-stat-label">
                      {d.usdcSupply.replace("{date}", f.supplyDate)}
                    </p>
                    <p className="burn-stat-value">{fmtUsdB(f.supplyNow)}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.usdcShare}</p>
                    <p className="burn-stat-value">{f.shareNowPct.toFixed(2)}%</p>
                    <p className="burn-stat-sub">{d.usdcShareSub}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.g90} / {d.g180}</p>
                    <p className="burn-stat-value">
                      {fmtPct(f.chg90Pct)} / {fmtPct(f.chg180Pct)}
                    </p>
                  </div>
                </div>
                <div className="crcl-spark-grid">
                  <div className="crcl-spark-card">
                    <p className="crcl-spark-title">
                      {d.sparkSupply} · {fmtUsdB(f.supplyNow)}
                    </p>
                    <Sparkline values={f.spark.map((p) => p.supply)} stroke="#b8912b" />
                  </div>
                  <div className="crcl-spark-card">
                    <p className="crcl-spark-title">
                      {d.sparkShare} · {f.shareNowPct.toFixed(2)}%
                    </p>
                    <Sparkline values={f.spark.map((p) => p.sharePct)} stroke="#2563eb" />
                  </div>
                </div>
              </>
            ) : (
              <p className="burn-note">{d.fundFail}</p>
            )}
          </>
        )}

        {/* 02 营收与利润（静态配置，不依赖接口） */}
        <h3 className="crcl-sec-title">{d.secFinancials}</h3>
        <p className="body-text crcl-sec-intro">
          {d.finIntro.replace("{end}", fin.latestPeriodEnd)}
        </p>
        <div className="burn-table-wrap">
          <table className="burn-table">
            <thead>
              <tr>
                <th>{d.colPeriod}</th>
                <th>{d.colRevenue}</th>
                <th>{d.colEbitda}</th>
                <th>{d.colNote}</th>
              </tr>
            </thead>
            <tbody>
              {fin.quarters.map((row) => (
                <tr key={row.period}>
                  <td>
                    {row.period}
                    <span className="crcl-period-end"> · {row.periodEnd}</span>
                  </td>
                  <td>{row.revenueM.toFixed(1)}</td>
                  <td>{row.ebitdaM.toFixed(1)}</td>
                  <td className="crcl-note-cell">{row.note[lang]}</td>
                </tr>
              ))}
              <tr className="crcl-ttm-row">
                <td>{d.ttmRow}</td>
                <td>{fmtInt(fin.revenueTTM_M)}</td>
                <td>{fmtInt(fin.ebitdaTTM_M)}</td>
                <td className="crcl-note-cell">{fin.ttmNote[lang]}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="crcl-fin-note">
          {d.finNotesTitle}：{fin.sharesNote[lang]}
        </p>

        {/* 05 使用手册 */}
        <h3 className="crcl-sec-title">{d.secManual}</h3>
        <div className="card crcl-manual">
          {d.manualParas.map((p, i) => (
            <p key={i} className="body-text">
              {p}
            </p>
          ))}
          <p className="crcl-bands-title">{d.bandsTitle}</p>
          <div className="crcl-bands">
            {VERDICT_ORDER.map((b) => (
              <span
                key={b.key}
                className={`crcl-band-chip is-${b.key}${s && s.verdict === b.key ? " is-active" : ""}`}
              >
                {b.range} · {d.verdicts[b.key]}
              </span>
            ))}
          </div>
        </div>

        <div className="burn-notes">
          <div className="card">
            <h2>{d.caliberTitle}</h2>
            <p className="body-text">{d.caliberBody}</p>
          </div>
          <div className="card">
            <h2>{d.disclaimerTitle}</h2>
            <p className="body-text">{d.disclaimerBody}</p>
            <p className="body-text">{t.disclaimer}</p>
          </div>
        </div>
      </section>
  );
}
