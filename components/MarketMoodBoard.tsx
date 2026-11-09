"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  SYMBOLS,
  TIMEFRAMES,
  TVL_CHAINS,
  symbolToPair,
  isValidPair,
  scoreMomentum,
  scoreFng,
  scoreAhr999,
  scoreFunding,
  scoreTvl,
  computeComposite,
  change7dFromCloses,
  vol7FromCloses,
  ahr999FromCloses,
  ahr999CurveFromCloses,
  fetchBinanceKlines,
  fetchBinanceTicker,
  fetchFng,
  fetchHyperliquid,
  fetchChainTvl,
  tvlChange7d,
  TOTAL_WEIGHT,
  TILT_THRESHOLD,
  type TimeframeId,
  type TvlChain,
  type FngPoint,
  type TvlPoint,
  type HyperliquidAsset,
} from "@/lib/marketmood";

/** 简易 SVG 走势线（面积填充 + 折线），沿用站内看板已有的手绘 SVG 方式，不引外站图表组件。 */
function Sparkline({
  values,
  stroke,
  height = 72,
}: {
  values: number[];
  stroke: string;
  height?: number;
}) {
  if (values.length < 2) return null;
  const w = 300;
  const h = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => (i / (values.length - 1)) * w;
  const py = (v: number) => h - 6 - ((v - min) / span) * (h - 12);
  const line = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg className="mood-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon points={area} fill={stroke} opacity={0.12} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={1.8} />
    </svg>
  );
}

function fmtPct(v: number, digits = 2): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)}%`;
}

function fmtUsd(v: number): string {
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toFixed(0)}`;
}

function fmtPrice(v: number): string {
  return v >= 1000
    ? v.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : v.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function fmtTime(ms: number | null): string {
  if (!ms) return "—";
  const dt = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

interface BoardDict {
  boardKicker: string;
  boardMeta: string;
  symbolLabel: string;
  timeframeLabel: string;
  tvlChainLabel: string;
  customPairLabel: string;
  customPairPlaceholder: string;
  refreshBtn: string;
  noteTf: string;
  noteCoin: string;
  priceLabel: string;
  change24h: string;
  updatedAt: string;
  loading: string;
  loadError: string;
  moodLabel: string;
  rangeLabel: string;
  confLabel: string;
  scoreLabel: string;
  rangeOsc: string;
  dirBull: string;
  dirNeutral: string;
  dirBear: string;
  confLow: string;
  confMedium: string;
  confHigh: string;
  formulaTitle: string;
  renormNote: string;
  chartTitle: string;
  chartNote: string;
  tableTitle: string;
  colIndicator: string;
  colValue: string;
  colScore: string;
  colWeight: string;
  colSource: string;
  colStatus: string;
  statusOk: string;
  statusMissing: string;
  indMomentum: string;
  indFng: string;
  indAhr999: string;
  indFunding: string;
  indTvl: string;
  srcBinance: string;
  srcFng: string;
  srcAhr999: string;
  srcHl: string;
  srcTvl: string;
  fngTitle: string;
  fngHistory: string;
  ahrTitle: string;
  ahrZoneBuy: string;
  ahrZoneDca: string;
  ahrZoneRisk: string;
  ahrNote: string;
  tvlTitle: string;
  hlTitle: string;
  hlMark: string;
  hlFunding: string;
  hlOi: string;
  methodTitle: string;
  methodBody: string;
  bandCol: string;
  thresholdsTitle: string;
  thresholdsBody: string;
  confTitle: string;
  confBody: string;
  targetTitle: string;
  targetBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  sourcesTitle: string;
}

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "多指标合成市场倾向 · 概率判断，非保证",
    boardMeta: "数据全部取自公开免费接口",
    symbolLabel: "币种",
    timeframeLabel: "K 线周期",
    tvlChainLabel: "TVL 链",
    customPairLabel: "自定义交易对",
    customPairPlaceholder: "如 DOGEUSDT",
    refreshBtn: "刷新数据",
    noteTf: "切换周期只改变 K 线图与现价口径，不改变合成打分：K 线动量始终按 7 日计。",
    noteCoin: "FNG 与 Ahr999 始终是市场 / BTC 级指标，不随币种切换；TVL 按独立的链选择器计分。",
    priceLabel: "现价",
    change24h: "24h",
    updatedAt: "更新于",
    loading: "正在取数…",
    loadError: "取数失败，请稍后刷新重试。",
    moodLabel: "市场倾向",
    rangeLabel: "目标区间",
    confLabel: "置信",
    scoreLabel: "加权分",
    rangeOsc: "区间震荡、不设单边目标",
    dirBull: "看涨倾向",
    dirNeutral: "震荡 / 观望",
    dirBear: "看跌倾向",
    confLow: "低",
    confMedium: "中",
    confHigh: "高",
    formulaTitle: "合成公式（可复算）",
    renormNote:
      "有指标未取到，已按剩余权重重新归一：原权重和 3.8，实际参与权重和 {used}。",
    chartTitle: "K 线（收盘价连线）",
    chartNote: "收盘价连线，非蜡烛图；切换周期只改变本图。",
    tableTitle: "打分明细",
    colIndicator: "指标",
    colValue: "当前值",
    colScore: "分",
    colWeight: "权重",
    colSource: "来源",
    colStatus: "状态",
    statusOk: "已取到",
    statusMissing: "未取到，已排除",
    indMomentum: "K 线动量（7 日）",
    indFng: "贪婪指数",
    indAhr999: "九神 Ahr999",
    indFunding: "HL 资金费率",
    indTvl: "TVL 7 日",
    srcBinance: "Binance 公开 K 线",
    srcFng: "alternative.me",
    srcAhr999: "Ahr999（本站自算）",
    srcHl: "Hyperliquid",
    srcTvl: "DefiLlama",
    fngTitle: "贪婪指数（不计入合成的展示）",
    fngHistory: "近 90 日",
    ahrTitle: "九神 Ahr999 曲线（近 2 年）",
    ahrZoneBuy: "抄底区 < 0.45",
    ahrZoneDca: "定投区 0.45–1.2",
    ahrZoneRisk: "谨慎区 > 1.2",
    ahrNote:
      "本站按公开公式自算：现价 ÷ 200 日几何均值 × 现价 ÷ 幂律拟合值；2026-11-09 自算 0.42，原站快照显示 0.428，基本一致。",
    tvlTitle: "TVL 曲线",
    hlTitle: "Hyperliquid 永续",
    hlMark: "Mark 价",
    hlFunding: "资金费率",
    hlOi: "持仓量",
    methodTitle: "合成方法（全部公开）",
    methodBody:
      "每个指标先按自己的口径换算成方向分（整数，-2 至 +2），再按权重加权合成总分；分项打分档位与置信映射为本站自定规则（原站未公开），见下表，口径固定、不随心情改。",
    bandCol: "打分档位（本站自定）",
    thresholdsTitle: "倾向阈值（页面公开口径）",
    thresholdsBody:
      "加权分绝对值 < 1.2 判震荡 / 观望；≥ 1.2 按正负判看涨 / 看跌倾向。",
    confTitle: "置信三分档（本站自定）",
    confBody:
      "一致度 = 占优方向的权重 ÷ 参与权重和。高：加权分绝对值 ≥ 1.2 且一致度 ≥ 2/3；低：加权分绝对值 < 0.5 且一致度 < 1/2；其余为中。",
    targetTitle: "目标区间算法（本站自定）",
    targetBody:
      "方向明确时按 7 日波动率估算：波幅 = 近 7 日日收益率标准差 × √7；看涨取 [现价, 现价×(1+波幅)]，看跌取 [现价×(1−波幅), 现价]。震荡时不设单边目标。",
    disclaimerTitle: "仅供参考，不构成投资建议",
    disclaimerBody:
      "本页结果是基于公开免费指标的概率倾向，不是保涨保跌的承诺，也不构成买卖指令。市场随时会变，动手前请结合自己的判断与风险承受能力。",
    sourcesTitle: "数据来源",
  },
  en: {
    boardKicker: "Multi-indicator market sentiment · a probability tilt, not a guarantee",
    boardMeta: "All data from public, free APIs",
    symbolLabel: "Symbol",
    timeframeLabel: "Chart interval",
    tvlChainLabel: "TVL chain",
    customPairLabel: "Custom pair",
    customPairPlaceholder: "e.g. DOGEUSDT",
    refreshBtn: "Refresh data",
    noteTf: "Switching the interval only changes the chart and price basis — never the composite score: momentum is always measured over 7 days.",
    noteCoin: "Fear & Greed and Ahr999 are always market / BTC-level indicators and never follow the symbol switch; TVL is scored by its own chain selector.",
    priceLabel: "Price",
    change24h: "24h",
    updatedAt: "Updated",
    loading: "Fetching data…",
    loadError: "Fetch failed — please refresh and retry in a moment.",
    moodLabel: "Market tilt",
    rangeLabel: "Target range",
    confLabel: "Confidence",
    scoreLabel: "Weighted score",
    rangeOsc: "Ranging — no one-way target",
    dirBull: "Bullish tilt",
    dirNeutral: "Ranging / wait",
    dirBear: "Bearish tilt",
    confLow: "Low",
    confMedium: "Medium",
    confHigh: "High",
    formulaTitle: "Composite formula (reproducible)",
    renormNote:
      "An indicator could not be fetched, so weights were renormalised over the rest: original total 3.8, actual total {used}.",
    chartTitle: "K-line (close-price line)",
    chartNote: "Close-price line, not candlesticks; switching the interval only changes this chart.",
    tableTitle: "Score breakdown",
    colIndicator: "Indicator",
    colValue: "Value",
    colScore: "Score",
    colWeight: "Weight",
    colSource: "Source",
    colStatus: "Status",
    statusOk: "Fetched",
    statusMissing: "Missing — excluded",
    indMomentum: "K-line momentum (7d)",
    indFng: "Fear & Greed Index",
    indAhr999: "Ahr999 Index",
    indFunding: "HL funding rate",
    indTvl: "TVL (7d)",
    srcBinance: "Binance public klines",
    srcFng: "alternative.me",
    srcAhr999: "Ahr999 (computed on-site)",
    srcHl: "Hyperliquid",
    srcTvl: "DefiLlama",
    fngTitle: "Fear & Greed Index (display only)",
    fngHistory: "Last 90 days",
    ahrTitle: "Ahr999 curve (last 2 years)",
    ahrZoneBuy: "Bottom zone < 0.45",
    ahrZoneDca: "DCA zone 0.45–1.2",
    ahrZoneRisk: "Caution zone > 1.2",
    ahrNote:
      "Computed on-site from the public formula: price ÷ 200-day geometric mean × price ÷ power-law fit. Self-computed 0.42 on 2026-11-09 vs 0.428 on the reference snapshot — broadly in line.",
    tvlTitle: "TVL curve",
    hlTitle: "Hyperliquid perps",
    hlMark: "Mark price",
    hlFunding: "Funding rate",
    hlOi: "Open interest",
    methodTitle: "Methodology (fully disclosed)",
    methodBody:
      "Each indicator is first converted into a directional score (integer, −2 to +2) on its own terms, then combined into a weighted total. The per-indicator bands and the confidence mapping are this site's own rules (not published by the reference site) — see the table below; the rules stay fixed.",
    bandCol: "Scoring bands (this site's own rules)",
    thresholdsTitle: "Tilt thresholds (published rule)",
    thresholdsBody:
      "Absolute weighted score < 1.2 means ranging / wait; ≥ 1.2 means a bullish or bearish tilt by sign.",
    confTitle: "Confidence tiers (this site's own rules)",
    confBody:
      "Agreement = weight on the dominant side ÷ participating weight. High: |weighted| ≥ 1.2 and agreement ≥ 2/3. Low: |weighted| < 0.5 and agreement < 1/2. Otherwise medium.",
    targetTitle: "Target-range method (this site's own rules)",
    targetBody:
      "When a direction is clear, the range is estimated from 7-day volatility: expected move = std. dev. of daily log returns over 7 days × √7. Bullish: [price, price × (1 + move)]; bearish: [price × (1 − move), price]. No one-way target while ranging.",
    disclaimerTitle: "For reference only — not investment advice",
    disclaimerBody:
      "Results on this page are a probability tilt built on public, free indicators — not a promise that prices will rise or fall, and not a buy or sell instruction. Markets change at any time; use your own judgement and risk tolerance before acting.",
    sourcesTitle: "Data sources",
  },
    tw: {
    boardKicker: "多指標合成市場傾向 · 機率判斷，非保證",
    boardMeta: "資料全部取自公開免費介面",
    symbolLabel: "幣種",
    timeframeLabel: "K 線週期",
    tvlChainLabel: "TVL 鏈",
    customPairLabel: "自定義交易對",
    customPairPlaceholder: "如 DOGEUSDT",
    refreshBtn: "重新整理資料",
    noteTf: "切換週期只改變 K 線圖與現價口徑，不改變合成打分：K 線動量始終按 7 日計。",
    noteCoin: "FNG 與 Ahr999 始終是市場 / BTC 級指標，不隨幣種切換；TVL 按獨立的鏈選擇器計分。",
    priceLabel: "現價",
    change24h: "24h",
    updatedAt: "更新於",
    loading: "正在取數…",
    loadError: "取數失敗，請稍後重新整理重試。",
    moodLabel: "市場傾向",
    rangeLabel: "目標區間",
    confLabel: "置信",
    scoreLabel: "加權分",
    rangeOsc: "區間震盪、不設單邊目標",
    dirBull: "看漲傾向",
    dirNeutral: "震盪 / 觀望",
    dirBear: "看跌傾向",
    confLow: "低",
    confMedium: "中",
    confHigh: "高",
    formulaTitle: "合成公式（可復算）",
    renormNote: "有指標未取到，已按剩餘權重重新歸一：原權重和 3.8，實際參與權重和 {used}。",
    chartTitle: "K 線（收盤價連線）",
    chartNote: "收盤價連線，非蠟燭圖；切換週期只改變本圖。",
    tableTitle: "打分明細",
    colIndicator: "指標",
    colValue: "當前值",
    colScore: "分",
    colWeight: "權重",
    colSource: "來源",
    colStatus: "狀態",
    statusOk: "已取到",
    statusMissing: "未取到，已排除",
    indMomentum: "K 線動量（7 日）",
    indFng: "貪婪指數",
    indAhr999: "九神 Ahr999",
    indFunding: "HL 資金費率",
    indTvl: "TVL 7 日",
    srcBinance: "Binance 公開 K 線",
    srcFng: "alternative.me",
    srcAhr999: "Ahr999（本站自算）",
    srcHl: "Hyperliquid",
    srcTvl: "DefiLlama",
    fngTitle: "貪婪指數（不計入合成的展示）",
    fngHistory: "近 90 日",
    ahrTitle: "九神 Ahr999 曲線（近 2 年）",
    ahrZoneBuy: "抄底區 < 0.45",
    ahrZoneDca: "定投區 0.45–1.2",
    ahrZoneRisk: "謹慎區 > 1.2",
    ahrNote: "本站按公開公式自算：現價 ÷ 200 日幾何均值 × 現價 ÷ 冪律擬合值；2026-11-09 自算 0.42，原站快照顯示 0.428，基本一致。",
    tvlTitle: "TVL 曲線",
    hlTitle: "Hyperliquid 永續",
    hlMark: "Mark 價",
    hlFunding: "資金費率",
    hlOi: "持倉量",
    methodTitle: "合成方法（全部公開）",
    methodBody: "每個指標先按自己的口徑換算成方向分（整數，-2 至 +2），再按權重加權合成總分；分項打分檔位與置信對映為本站自定規則（原站未公開），見下表，口徑固定、不隨心情改。",
    bandCol: "打分檔位（本站自定）",
    thresholdsTitle: "傾向閾值（頁面公開口徑）",
    thresholdsBody: "加權分絕對值 < 1.2 判震盪 / 觀望；≥ 1.2 按正負判看漲 / 看跌傾向。",
    confTitle: "置信三分檔（本站自定）",
    confBody: "一致度 = 佔優方向的權重 ÷ 參與權重和。高：加權分絕對值 ≥ 1.2 且一致度 ≥ 2/3；低：加權分絕對值 < 0.5 且一致度 < 1/2；其餘為中。",
    targetTitle: "目標區間演算法（本站自定）",
    targetBody: "方向明確時按 7 日波動率估算：波幅 = 近 7 日日收益率標準差 × √7；看漲取 [現價, 現價×(1+波幅)]，看跌取 [現價×(1−波幅), 現價]。震盪時不設單邊目標。",
    disclaimerTitle: "僅供參考，不構成投資建議",
    disclaimerBody: "本頁結果是基於公開免費指標的機率傾向，不是保漲保跌的承諾，也不構成買賣指令。市場隨時會變，動手前請結合自己的判斷與風險承受能力。",
    sourcesTitle: "資料來源",
  },
};

const FNG_CLASS: Record<string, Record<Lang, string>> = {
  "Extreme Fear": { zh: "极度恐慌", tw: "極度恐慌", en: "Extreme Fear" },
  Fear: { zh: "恐慌", tw: "恐慌", en: "Fear" },
  Neutral: { zh: "中性", tw: "中性", en: "Neutral" },
  Greed: { zh: "贪婪", tw: "貪婪", en: "Greed" },
  "Extreme Greed": { zh: "极度贪婪", tw: "極度貪婪", en: "Extreme Greed" },
};

/** 分项打分档位表（本站自定规则；数字与符号跨语言通用）。 */
const BANDS: { id: string; bands: string[] }[] = [
  { id: "momentum", bands: ["≥ +5% → +2", "+2% ~ +5% → +1", "−2% ~ +2% → 0", "−5% ~ −2% → −1", "≤ −5% → −2"] },
  { id: "fng", bands: ["0–19 → +2", "20–39 → +1", "40–59 → 0", "60–79 → −1", "80–100 → −2"] },
  { id: "ahr999", bands: ["< 0.45 → +2", "0.45–0.9 → +1", "0.9–1.2 → 0", "1.2–2.0 → −1", "> 2.0 → −2"] },
  { id: "funding", bands: ["< −0.05%/h → +2", "−0.05% ~ −0.01%/h → +1", "−0.01% ~ +0.01%/h → 0", "+0.01% ~ +0.05%/h → −1", "> +0.05%/h → −2"] },
  { id: "tvl", bands: ["≥ +5% → +2", "+2% ~ +5% → +1", "−2% ~ +2% → 0", "−5% ~ −2% → −1", "≤ −5% → −2"] },
];

function fmtSigned(v: number): string {
  return v > 0 ? `+${v}` : `${v}`;
}

export default function MarketMoodBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [symbol, setSymbol] = useState("BTC");
  const [customPair, setCustomPair] = useState("");
  const [timeframe, setTimeframe] = useState<TimeframeId>("1d");
  const [tvlChain, setTvlChain] = useState<TvlChain>("Bitcoin");
  const [refreshKey, setRefreshKey] = useState(0);
  const pair = useMemo(() => {
    const cp = customPair.trim().toUpperCase();
    return cp !== "" && isValidPair(cp) ? cp : symbolToPair(symbol);
  }, [symbol, customPair]);
  const customInvalid = customPair.trim() !== "" && !isValidPair(customPair.trim().toUpperCase());
  const interval = TIMEFRAMES.find((t) => t.id === timeframe)?.interval ?? "1d";
  const hlCoin = pair.replace(/USDT$/, "");

  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState<{ price: number; change24hPct: number } | null>(null);
  const [closesDaily, setClosesDaily] = useState<number[] | null>(null);
  const [btcCloses, setBtcCloses] = useState<number[] | null>(null);
  const [btcTimes, setBtcTimes] = useState<number[] | null>(null);
  const [chartCloses, setChartCloses] = useState<number[] | null>(null);
  const [fng, setFng] = useState<FngPoint[] | null>(null);
  const [hl, setHl] = useState<HyperliquidAsset | null>(null);
  const [tvl, setTvl] = useState<TvlPoint[] | null>(null);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const errsNext: Record<string, boolean> = {};
    const tasks: Promise<void>[] = [];
    tasks.push(
      (async () => {
        try {
          const kl = await fetchBinanceKlines(pair, "1d", 30);
          if (!cancelled) setClosesDaily(kl.map((k) => k.close));
        } catch {
          errsNext.momentum = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const kl = await fetchBinanceKlines("BTCUSDT", "1d", 1000);
          if (cancelled) return;
          setBtcCloses(kl.map((k) => k.close));
          setBtcTimes(kl.map((k) => k.openTime));
        } catch {
          errsNext.ahr999 = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const kl = await fetchBinanceKlines(pair, interval, 120);
          if (!cancelled) setChartCloses(kl.map((k) => k.close));
        } catch {
          errsNext.chart = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const t = await fetchBinanceTicker(pair);
          if (!cancelled) setTicker(t);
        } catch {
          errsNext.ticker = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const f = await fetchFng(90);
          if (!cancelled) setFng(f);
        } catch {
          errsNext.fng = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const h = await fetchHyperliquid(hlCoin);
          if (!cancelled) setHl(h);
        } catch {
          errsNext.funding = true;
        }
      })()
    );
    tasks.push(
      (async () => {
        try {
          const v = await fetchChainTvl(tvlChain);
          if (!cancelled) setTvl(v);
        } catch {
          errsNext.tvl = true;
        }
      })()
    );
    Promise.all(tasks).then(() => {
      if (cancelled) return;
      setErrs(errsNext);
      setLoading(false);
      setUpdatedAt(Date.now());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair, interval, tvlChain, refreshKey]);

  const change7d = useMemo(
    () => (closesDaily ? change7dFromCloses(closesDaily) : null),
    [closesDaily]
  );
  const vol7 = useMemo(() => (closesDaily ? vol7FromCloses(closesDaily) : null), [closesDaily]);
  const ahr999 = useMemo(
    () => (btcCloses ? ahr999FromCloses(btcCloses, Date.now()) : null),
    [btcCloses]
  );
  const ahrCurve = useMemo(
    () => (btcCloses && btcTimes ? ahr999CurveFromCloses(btcCloses, btcTimes) : []),
    [btcCloses, btcTimes]
  );
  const fngLatest = fng && fng.length > 0 ? fng[0] : null;
  const tvl7d = useMemo(() => (tvl ? tvlChange7d(tvl) : null), [tvl]);

  const composite = useMemo(
    () =>
      computeComposite(
        {
          momentum:
            change7d !== null ? { value: change7d, score: scoreMomentum(change7d) } : undefined,
          fng: fngLatest ? { value: fngLatest.value, score: scoreFng(fngLatest.value) } : undefined,
          ahr999: ahr999 !== null ? { value: ahr999, score: scoreAhr999(ahr999) } : undefined,
          funding: hl ? { value: hl.fundingPctPerHour, score: scoreFunding(hl.fundingPctPerHour) } : undefined,
          tvl: tvl7d !== null ? { value: tvl7d, score: scoreTvl(tvl7d) } : undefined,
        },
        ticker?.price ?? null,
        vol7
      ),
    [change7d, fngLatest, ahr999, hl, tvl7d, ticker, vol7]
  );

  const dirLabel =
    composite?.direction === "bullish"
      ? d.dirBull
      : composite?.direction === "bearish"
        ? d.dirBear
        : d.dirNeutral;
  const dirColor =
    composite?.direction === "bullish"
      ? "var(--green)"
      : composite?.direction === "bearish"
        ? "var(--red)"
        : "var(--muted)";
  const confLabel =
    composite?.confidence === "high"
      ? d.confHigh
      : composite?.confidence === "low"
        ? d.confLow
        : d.confMedium;
  const formulaExpr = composite
    ? `(${composite.items.map((it) => `${fmtSigned(it.score)}×${it.weight}`).join(" + ")}) ÷ ${composite.usedWeight} = ${composite.weighted.toFixed(2)}`
    : "—";
  const ahrZone =
    ahr999 === null ? "—" : ahr999 < 0.45 ? d.ahrZoneBuy : ahr999 <= 1.2 ? d.ahrZoneDca : d.ahrZoneRisk;

  const rows = [
    {
      id: "momentum",
      label: d.indMomentum,
      value: change7d !== null ? fmtPct(change7d) : "—",
      score: change7d !== null ? scoreMomentum(change7d) : null,
      weight: 1,
      source: d.srcBinance,
      ok: change7d !== null,
    },
    {
      id: "fng",
      label: d.indFng,
      value:
        fngLatest !== null
          ? `${fngLatest.value}（${FNG_CLASS[fngLatest.classification]?.[lang] ?? fngLatest.classification}）`
          : "—",
      score: fngLatest !== null ? scoreFng(fngLatest.value) : null,
      weight: 1,
      source: d.srcFng,
      ok: fngLatest !== null,
    },
    {
      id: "ahr999",
      label: d.indAhr999,
      value: ahr999 !== null ? `${ahr999.toFixed(3)} · ${ahrZone}` : "—",
      score: ahr999 !== null ? scoreAhr999(ahr999) : null,
      weight: 1,
      source: d.srcAhr999,
      ok: ahr999 !== null,
    },
    {
      id: "funding",
      label: d.indFunding,
      value: hl !== null ? `${hl.fundingPctPerHour.toFixed(4)}%/h` : "—",
      score: hl !== null ? scoreFunding(hl.fundingPctPerHour) : null,
      weight: 0.5,
      source: d.srcHl,
      ok: hl !== null,
    },
    {
      id: "tvl",
      label: d.indTvl,
      value: tvl7d !== null ? `${fmtPct(tvl7d)}（${tvlChain}）` : "—",
      score: tvl7d !== null ? scoreTvl(tvl7d) : null,
      weight: 0.3,
      source: d.srcTvl,
      ok: tvl7d !== null,
    },
  ];

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMeta}
          {updatedAt ? ` · ${d.updatedAt} ${fmtTime(updatedAt)}` : ""}
        </p>
      </div>

      {/* 控制区：币种 / 周期 / TVL 链 / 自定义交易对 */}
      <div className="mood-controls">
        <label>
          {d.symbolLabel}
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          {d.timeframeLabel}
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as TimeframeId)}>
            {TIMEFRAMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          {d.tvlChainLabel}
          <select value={tvlChain} onChange={(e) => setTvlChain(e.target.value as TvlChain)}>
            {TVL_CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          {d.customPairLabel}
          <input
            value={customPair}
            placeholder={d.customPairPlaceholder}
            onChange={(e) => setCustomPair(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn primary"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          {d.refreshBtn}
        </button>
      </div>
      {customInvalid && (
        <p className="burn-note" style={{ marginTop: 10 }}>
          {lang === "en"
            ? "Invalid pair format — using the selected symbol instead (e.g. DOGEUSDT)."
            : lang === "tw"
              ? "交易對格式不正確——改用已選幣種（例如 DOGEUSDT）。"
              : "交易对格式不正确——改用已选币种（例如 DOGEUSDT）。"}
        </p>
      )}
      <p className="body-text" style={{ marginTop: 10 }}>
        {d.noteTf}
        <br />
        {d.noteCoin}
      </p>

      {loading && <p className="burn-note">{d.loading}</p>}

      {!loading && composite && (
        <>
          <div className="mood-price">
            <span>
              {pair} · {d.priceLabel} ${ticker ? fmtPrice(ticker.price) : "—"}
            </span>
            {ticker && (
              <span style={{ color: ticker.change24hPct >= 0 ? "var(--green)" : "var(--red)" }}>
                {d.change24h} {fmtPct(ticker.change24hPct)}
              </span>
            )}
          </div>

          <div className="cycle-grid" style={{ marginTop: 12 }}>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.moodLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ color: dirColor, fontSize: 40 }}>
                  {dirLabel}
                </span>
              </div>
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.rangeLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 28 }}>
                  {composite.targetLow !== null && composite.targetHigh !== null
                    ? `$${fmtPrice(composite.targetLow)} – $${fmtPrice(composite.targetHigh)}`
                    : d.rangeOsc}
                </span>
              </div>
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.confLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 40 }}>
                  {confLabel}
                </span>
                <span className="body-text">
                  {lang === "en"
                    ? `agreement ${(composite.agreement * 100).toFixed(0)}%`
                    : `一致度 ${(composite.agreement * 100).toFixed(0)}%`}
                </span>
              </div>
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.scoreLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position">{composite.weighted.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <h3 className="sub-title">{d.formulaTitle}</h3>
          <p className="body-text">
            {formulaExpr}
            {composite.excluded.length > 0 && (
              <>
                <br />
                {d.renormNote.replace("{used}", String(composite.usedWeight))}
              </>
            )}
          </p>
        </>
      )}

      {!loading && !composite && (
        <p className="burn-note">{d.loadError}</p>
      )}

      {/* K 线图 */}
      <h3 className="sub-title">{d.chartTitle}</h3>
      {chartCloses ? (
        <>
          <Sparkline values={chartCloses} stroke="#8a6d1f" height={120} />
          <p className="body-text">{d.chartNote}</p>
        </>
      ) : (
        <p className="burn-note">{errs.chart ? d.loadError : d.loading}</p>
      )}

      {/* 打分明细 */}
      <h3 className="sub-title">{d.tableTitle}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{d.colIndicator}</th>
              <th>{d.colValue}</th>
              <th>{d.colScore}</th>
              <th>{d.colWeight}</th>
              <th>{d.colSource}</th>
              <th>{d.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.value}</td>
                <td>{r.score !== null ? fmtSigned(r.score) : "—"}</td>
                <td>×{r.weight}</td>
                <td>{r.source}</td>
                <td>{r.ok ? d.statusOk : d.statusMissing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 不计入合成的展示：FNG / Ahr999 / TVL / HL */}
      <div className="cycle-grid" style={{ marginTop: 14 }}>
        <div className="cycle-card">
          <p className="cycle-card-label">{d.fngTitle}</p>
          {fngLatest ? (
            <>
              <div className="cycle-position-row">
                <span className="cycle-position">{fngLatest.value}</span>
                <span className="body-text">
                  {FNG_CLASS[fngLatest.classification]?.[lang] ?? fngLatest.classification}
                </span>
              </div>
              <div className="burn-bar" style={{ marginTop: 10 }}>
                <div className="burn-bar-fill" style={{ width: `${fngLatest.value}%` }} />
              </div>
              {fng && fng.length > 1 && (
                <>
                  <div style={{ marginTop: 10 }}>
                    <Sparkline values={[...fng].reverse().map((p) => p.value)} stroke="#8a6d1f" />
                  </div>
                  <p className="body-text">{d.fngHistory}</p>
                </>
              )}
            </>
          ) : (
            <p className="burn-note">{errs.fng ? d.loadError : d.loading}</p>
          )}
        </div>
        <div className="cycle-card">
          <p className="cycle-card-label">{d.ahrTitle}</p>
          {ahr999 !== null ? (
            <>
              <div className="cycle-position-row">
                <span className="cycle-position">{ahr999.toFixed(3)}</span>
                <span className="body-text">{ahrZone}</span>
              </div>
              {ahrCurve.length > 1 && (
                <div style={{ marginTop: 10 }}>
                  <Sparkline values={ahrCurve.map((p) => p.v)} stroke="#8a6d1f" />
                </div>
              )}
              <p className="body-text">{d.ahrNote}</p>
            </>
          ) : (
            <p className="burn-note">{errs.ahr999 ? d.loadError : d.loading}</p>
          )}
        </div>
        <div className="cycle-card">
          <p className="cycle-card-label">
            {d.tvlTitle} · {tvlChain}
          </p>
          {tvl && tvl.length > 0 ? (
            <>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 32 }}>
                  {fmtUsd(tvl[tvl.length - 1].tvl)}
                </span>
                {tvl7d !== null && <span className="body-text">7d {fmtPct(tvl7d)}</span>}
              </div>
              <div style={{ marginTop: 10 }}>
                <Sparkline values={tvl.slice(-90).map((p) => p.tvl)} stroke="#8a6d1f" />
              </div>
            </>
          ) : (
            <p className="burn-note">{errs.tvl ? d.loadError : d.loading}</p>
          )}
        </div>
        <div className="cycle-card">
          <p className="cycle-card-label">
            {d.hlTitle} · {hlCoin}
          </p>
          {hl ? (
            <div className="table-wrap">
              <table>
                <tbody>
                  <tr>
                    <td>{d.hlMark}</td>
                    <td>${fmtPrice(hl.markPx)}</td>
                  </tr>
                  <tr>
                    <td>{d.hlFunding}</td>
                    <td>{hl.fundingPctPerHour.toFixed(4)}%/h</td>
                  </tr>
                  <tr>
                    <td>{d.hlOi}</td>
                    <td>{fmtUsd(hl.openInterestUsd)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="burn-note">{errs.funding ? d.loadError : d.loading}</p>
          )}
        </div>
      </div>

      {/* 方法区：全部公开 */}
      <h3 className="sub-title">{d.methodTitle}</h3>
      <p className="body-text">{d.methodBody}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{d.colIndicator}</th>
              <th>{d.bandCol}</th>
              <th>{d.colWeight}</th>
            </tr>
          </thead>
          <tbody>
            {BANDS.map((b) => {
              const label =
                b.id === "momentum"
                  ? d.indMomentum
                  : b.id === "fng"
                    ? d.indFng
                    : b.id === "ahr999"
                      ? d.indAhr999
                      : b.id === "funding"
                        ? d.indFunding
                        : d.indTvl;
              const weight =
                b.id === "funding" ? 0.5 : b.id === "tvl" ? 0.3 : 1;
              return (
                <tr key={b.id}>
                  <td>{label}</td>
                  <td>{b.bands.join("；")}</td>
                  <td>×{weight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3 className="sub-title">{d.thresholdsTitle}</h3>
      <p className="body-text">{d.thresholdsBody}</p>
      <h3 className="sub-title">{d.confTitle}</h3>
      <p className="body-text">{d.confBody}</p>
      <h3 className="sub-title">{d.targetTitle}</h3>
      <p className="body-text">{d.targetBody}</p>

      <h3 className="sub-title">{d.disclaimerTitle}</h3>
      <p className="body-text">{d.disclaimerBody}</p>

      <h3 className="sub-title">{d.sourcesTitle}</h3>
      <p className="body-text">
        Binance ·{" "}
        <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer">
          binance.com
        </a>
        {" · "}alternative.me ·{" "}
        <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer">
          alternative.me
        </a>
        {" · "}Ahr999 ·{" "}
        <a href="https://ahr999.com" target="_blank" rel="noopener noreferrer">
          ahr999.com
        </a>
        {" · "}Hyperliquid ·{" "}
        <a href="https://hyperliquid.xyz" target="_blank" rel="noopener noreferrer">
          hyperliquid.xyz
        </a>
        {" · "}DefiLlama ·{" "}
        <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">
          defillama.com
        </a>
      </p>
    </section>
  );
}
