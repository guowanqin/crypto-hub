"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AssetResult,
  AssetSignal,
  SignalsPayload,
  SignalType,
  Timeframe,
} from "@/lib/signals";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const PAGE_SIZE = 12;
const LIST_STEP = 12;
const ALL_TYPES: SignalType[] = [
  "top-div",
  "bottom-div",
  "breakout-up",
  "breakout-down",
  "range",
];

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {t}
    loading: string;
    loadError: string;
    refresh: string;
    refreshing: string;
    statScanned: string;
    statBreadth: string;
    statSignals: string;
    breadthOf: string; // {up} / {total}
    kindAll: string;
    kindCrypto: string;
    kindStock: string;
    tfAll: string;
    searchPlaceholder: string;
    chip: Record<SignalType, string>;
    divFlatTop: string;
    divFlatBottom: string;
    divNewHigh: string;
    divNewLow: string;
    volTag: string;
    rvol: string;
    noSignal: string;
    unavailableTag: string;
    evidence: string;
    hideEvidence: string;
    evPrice: string;
    evDif: string;
    evTime: string;
    evP1Top: string;
    evP2Top: string;
    evP1Bottom: string;
    evP2Bottom: string;
    evRangeHigh: string;
    evRangeLow: string;
    evVolMult: string;
    secFeed: string;
    feedIntro: string;
    feedEmpty: string;
    colTrigger: string;
    showMore: string; // {n}
    collapse: string;
    noResults: string;
    stocksDown: string;
    cryptoDown: string;
    secCaliber: string;
    caliber: string[];
  }
> = {
  zh: {
    boardKicker: "策略信号扫描 · 主流币 + 美股 · MACD 背离 / 横盘突破",
    sourceLine: "数据来源：币圈 Binance 公开行情（备用 OKX）· 美股 Yahoo Finance 公开数据 · 扫描于 {t} · 每 5 分钟自动刷新",
    loading: "正在扫描全部标的的 K 线与信号…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    refresh: "立即刷新",
    refreshing: "刷新中…",
    statScanned: "扫描标的",
    statBreadth: "上涨广度",
    statSignals: "信号标的",
    breadthOf: "{up} / {total} 上涨",
    kindAll: "全部",
    kindCrypto: "币圈",
    kindStock: "美股",
    tfAll: "全部周期",
    searchPlaceholder: "搜索币种 / 股票代码",
    chip: {
      "top-div": "顶背离",
      "bottom-div": "底背离",
      "breakout-up": "向上突破",
      "breakout-down": "向下突破",
      range: "区间整理",
    },
    divFlatTop: "平顶动能背离",
    divFlatBottom: "平底动能背离",
    divNewHigh: "创新高背离",
    divNewLow: "创新低背离",
    volTag: "放量",
    rvol: "量比",
    noSignal: "本轮无信号",
    unavailableTag: "数据不可用",
    evidence: "证据",
    hideEvidence: "收起证据",
    evPrice: "价格",
    evDif: "DIF",
    evTime: "时间",
    evP1Top: "前高 P1",
    evP2Top: "后高 P2",
    evP1Bottom: "前低 P1",
    evP2Bottom: "后低 P2",
    evRangeHigh: "区间上沿（前 20 根最高）",
    evRangeLow: "区间下沿（前 20 根最低）",
    evVolMult: "量比倍数",
    secFeed: "信号动态",
    feedIntro: "全部标的最新确认的信号，按确认时间从新到旧排。确认时间是信号成立的那根 K 线收盘时刻，不是高低点出现的时刻。",
    feedEmpty: "当前筛选下暂无已确认信号。",
    colTrigger: "触发价",
    showMore: "显示更多（剩余 {n} 个）",
    collapse: "收起",
    noResults: "当前筛选下没有符合的标的。",
    stocksDown: "美股数据源暂时不可用：公开接口本次未返回数据，美股一类已如实留空，不用假数补位；币圈扫描不受影响，源恢复后会自动补上。",
    cryptoDown: "币圈数据源暂时不可用：两个公开源本次均未返回数据，币圈一类已如实留空；美股扫描不受影响。",
    secCaliber: "口径与风险",
    caliber: [
      "指标与信号定义：MACD 参数 (12, 26, 9)，DIF = EMA12 − EMA26，DEA = DIF 的 EMA9。摆动点取左右各 5 根的分形高 / 低点；顶背离 = 最近两个摆动高点价格后高更高、但后高处 DIF 更低（价差 ≤1.5% 记平顶动能背离，否则记创新高背离），底背离镜像。横盘突破 = 最后一根已收盘 K 线的收盘价突破此前 20 根的最高 / 最低；该根量达到此前 20 根均量的 1.5 倍时标「放量」。收盘价仍在 20 根区间内且区间宽度 ≤6% 时标「区间整理」（低优先级信息）。量比 = 最后一根已收盘 K 线量 ÷ 此前 20 根均量。",
      "只用已收盘 K 线：正在形成的那根不参与任何计算。摆动点必须等右侧 5 根 K 线收盘才能确认，所以背离信号天然滞后于实际高低点数根 K 线；本页只上报确认根落在最近 3 根内的背离，看到信号时价格往往已经离开高低点一段距离。",
      "数据来源与延迟：币圈 K 线来自 Binance 公开行情接口（单标的失败时自动换 OKX 公开接口），服务端缓存约 3 分钟、页面每 5 分钟刷新。美股来自 Yahoo Finance 公开数据，属于延迟行情；非交易时段没有新 K 线，美股信号会停留在最近一个交易时段的结果。4 小时周期由 1 小时 K 线聚合（币圈按 UTC 对齐，美股按交易日开盘锚定）。",
      "涨跌口径：现价取最近一根已收盘 15 分钟 K 线的收盘价。币圈涨跌为交易所 24 小时滚动涨跌幅；美股涨跌为最近两个交易日收盘价之比，与官方单日涨跌幅口径不同，请勿混用。",
      "风险提示：形态识别是概率工具，不是预测。背离可以连续出现多次后才反转（背离钝化），横盘突破也常见冲出区间又收回的假突破；小周期（15 分钟）信号噪声明显多于大周期。本工具只对公开数据做机械扫描，不构成投资建议，据此交易的风险自担。",
    ],
  },
  tw: {
    boardKicker: "策略信號掃描 · 主流幣 + 美股 · MACD 背離 / 橫盤突破",
    sourceLine: "資料來源：幣圈 Binance 公開行情（備用 OKX）· 美股 Yahoo Finance 公開資料 · 掃描於 {t} · 每 5 分鐘自動刷新",
    loading: "正在掃描全部標的的 K 線與信號…",
    loadError: "資料暫時拉取失敗，請稍後刷新重試。",
    refresh: "立即刷新",
    refreshing: "刷新中…",
    statScanned: "掃描標的",
    statBreadth: "上漲廣度",
    statSignals: "信號標的",
    breadthOf: "{up} / {total} 上漲",
    kindAll: "全部",
    kindCrypto: "幣圈",
    kindStock: "美股",
    tfAll: "全部週期",
    searchPlaceholder: "搜尋幣種 / 股票代碼",
    chip: {
      "top-div": "頂背離",
      "bottom-div": "底背離",
      "breakout-up": "向上突破",
      "breakout-down": "向下突破",
      range: "區間整理",
    },
    divFlatTop: "平頂動能背離",
    divFlatBottom: "平底動能背離",
    divNewHigh: "創新高背離",
    divNewLow: "創新低背離",
    volTag: "放量",
    rvol: "量比",
    noSignal: "本輪無信號",
    unavailableTag: "資料不可用",
    evidence: "證據",
    hideEvidence: "收起證據",
    evPrice: "價格",
    evDif: "DIF",
    evTime: "時間",
    evP1Top: "前高 P1",
    evP2Top: "後高 P2",
    evP1Bottom: "前低 P1",
    evP2Bottom: "後低 P2",
    evRangeHigh: "區間上沿（前 20 根最高）",
    evRangeLow: "區間下沿（前 20 根最低）",
    evVolMult: "量比倍數",
    secFeed: "信號動態",
    feedIntro: "全部標的最新確認的信號，按確認時間從新到舊排。確認時間是信號成立的那根 K 線收盤時刻，不是高低點出現的時刻。",
    feedEmpty: "目前篩選下暫無已確認信號。",
    colTrigger: "觸發價",
    showMore: "顯示更多（剩餘 {n} 個）",
    collapse: "收起",
    noResults: "目前篩選下沒有符合的標的。",
    stocksDown: "美股資料來源暫時不可用：公開介面本次未返回資料，美股一類已如實留空，不用假數補位；幣圈掃描不受影響，來源恢復後會自動補上。",
    cryptoDown: "幣圈資料來源暫時不可用：兩個公開來源本次均未返回資料，幣圈一類已如實留空；美股掃描不受影響。",
    secCaliber: "口徑與風險",
    caliber: [
      "指標與信號定義：MACD 參數 (12, 26, 9)，DIF = EMA12 − EMA26，DEA = DIF 的 EMA9。擺動點取左右各 5 根的分形高 / 低點；頂背離 = 最近兩個擺動高點價格後高更高、但後高處 DIF 更低（價差 ≤1.5% 記平頂動能背離，否則記創新高背離），底背離鏡像。橫盤突破 = 最後一根已收盤 K 線的收盤價突破此前 20 根的最高 / 最低；該根量達到此前 20 根均量的 1.5 倍時標「放量」。收盤價仍在 20 根區間內且區間寬度 ≤6% 時標「區間整理」（低優先級資訊）。量比 = 最後一根已收盤 K 線量 ÷ 此前 20 根均量。",
      "只用已收盤 K 線：正在形成的那根不參與任何計算。擺動點必須等右側 5 根 K 線收盤才能確認，所以背離信號天然滯後於實際高低點數根 K 線；本頁只上報確認根落在最近 3 根內的背離，看到信號時價格往往已經離開高低點一段距離。",
      "資料來源與延遲：幣圈 K 線來自 Binance 公開行情介面（單標的失敗時自動換 OKX 公開介面），伺服器端快取約 3 分鐘、頁面每 5 分鐘刷新。美股來自 Yahoo Finance 公開資料，屬於延遲行情；非交易時段沒有新 K 線，美股信號會停留在最近一個交易時段的結果。4 小時週期由 1 小時 K 線聚合（幣圈按 UTC 對齊，美股按交易日開盤錨定）。",
      "漲跌口徑：現價取最近一根已收盤 15 分鐘 K 線的收盤價。幣圈漲跌為交易所 24 小時滾動漲跌幅；美股漲跌為最近兩個交易日收盤價之比，與官方單日漲跌幅口徑不同，請勿混用。",
      "風險提示：形態識別是機率工具，不是預測。背離可以連續出現多次後才反轉（背離鈍化），橫盤突破也常見衝出區間又收回的假突破；小週期（15 分鐘）信號噪聲明顯多於大週期。本工具只對公開資料做機械掃描，不構成投資建議，據此交易的風險自擔。",
    ],
  },
  en: {
    boardKicker: "Strategy Signal Scanner · Major crypto + US stocks · MACD divergence / range breakout",
    sourceLine: "Sources: Binance public market data for crypto (OKX fallback) · Yahoo Finance public data for US stocks · Scanned at {t} · Auto-refresh every 5 minutes",
    loading: "Scanning candles and signals across all symbols…",
    loadError: "Data failed to load for now — please refresh and try again.",
    refresh: "Refresh now",
    refreshing: "Refreshing…",
    statScanned: "Symbols scanned",
    statBreadth: "Advancers breadth",
    statSignals: "Symbols with signals",
    breadthOf: "{up} / {total} advancing",
    kindAll: "All",
    kindCrypto: "Crypto",
    kindStock: "US stocks",
    tfAll: "All timeframes",
    searchPlaceholder: "Search symbol / name",
    chip: {
      "top-div": "Bearish divergence",
      "bottom-div": "Bullish divergence",
      "breakout-up": "Breakout up",
      "breakout-down": "Breakdown",
      range: "Range-bound",
    },
    divFlatTop: "Flat-top momentum divergence",
    divFlatBottom: "Flat-bottom momentum divergence",
    divNewHigh: "New-high divergence",
    divNewLow: "New-low divergence",
    volTag: "Volume surge",
    rvol: "RVOL",
    noSignal: "No signal this round",
    unavailableTag: "Data unavailable",
    evidence: "Evidence",
    hideEvidence: "Hide evidence",
    evPrice: "Price",
    evDif: "DIF",
    evTime: "Time",
    evP1Top: "First high P1",
    evP2Top: "Second high P2",
    evP1Bottom: "First low P1",
    evP2Bottom: "Second low P2",
    evRangeHigh: "Range high (prev 20 bars)",
    evRangeLow: "Range low (prev 20 bars)",
    evVolMult: "Volume multiple",
    secFeed: "Signal feed",
    feedIntro: "The latest confirmed signals across all symbols, newest first. The confirmation time is when the confirming candle closed — not when the high or low itself formed.",
    feedEmpty: "No confirmed signals under the current filters.",
    colTrigger: "Trigger",
    showMore: "Show more ({n} left)",
    collapse: "Collapse",
    noResults: "No symbols match the current filters.",
    stocksDown: "The US-stock data source is temporarily unavailable: the public feed returned nothing this round, so US stocks are honestly left blank — no invented numbers. Crypto scanning is unaffected and stocks will reappear once the source recovers.",
    cryptoDown: "The crypto data source is temporarily unavailable: both public feeds returned nothing this round, so crypto is honestly left blank. US-stock scanning is unaffected.",
    secCaliber: "Method & risks",
    caliber: [
      "Definitions: MACD (12, 26, 9) — DIF = EMA12 − EMA26, DEA = EMA9 of DIF. Swing points are fractal highs/lows with 5 bars on each side. Bearish divergence = the latest two swing highs make a higher price high with a lower DIF at the second high (a price gap ≤1.5% is labelled flat-top momentum divergence, otherwise new-high divergence); bullish divergence mirrors this. A range breakout = the last closed candle closing beyond the highest high / lowest low of the previous 20 candles; if that candle's volume reaches 1.5× the previous 20-candle average it is tagged as a volume surge. A symbol still inside its 20-candle range with a range width ≤6% is tagged range-bound (low-priority information). RVOL = the last closed candle's volume ÷ the previous 20-candle average.",
      "Closed candles only: the candle still forming never enters any calculation. A swing point needs 5 more closed candles on its right to be confirmed, so divergence signals inherently lag the actual high or low by several candles; this page only reports divergences whose confirmation candle falls within the last 3 closed candles. By the time a signal appears, price has usually already moved away from the extreme.",
      "Sources & latency: crypto candles come from Binance's public market-data API (with a per-symbol automatic fallback to OKX), cached server-side for about 3 minutes and refreshed on this page every 5 minutes. US stocks come from Yahoo Finance public data, which is delayed; outside market hours there are no new candles, so stock signals stay at the most recent session's result. The 4h timeframe is aggregated from 1h candles (UTC-aligned for crypto, session-anchored for US stocks).",
      "Price & change caliber: the shown price is the close of the most recent closed 15-minute candle. Crypto change is the exchange's rolling 24-hour change; the stock change is the ratio of the last two trading days' closing prices, which is not the same caliber as an official single-day change — do not mix them.",
      "Risk note: pattern recognition is a probabilistic tool, not a prediction. Divergences can repeat several times before a reversal (divergence exhaustion), and range breakouts often fail and fall back inside. Signals on small timeframes (15m) are far noisier than on large ones. This tool mechanically scans public data only and is not investment advice; trading on it is at your own risk.",
    ],
  },
};

const LOCALES: Record<Lang, string> = { zh: "zh-CN", tw: "zh-TW", en: "en-US" };

function fmtPrice(p: number | null): string {
  if (p == null || !Number.isFinite(p)) return "—";
  if (p >= 100) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return String(parseFloat(p.toPrecision(5)));
  return String(parseFloat(p.toPrecision(4)));
}

function fmtSigned(v: number): string {
  return String(parseFloat(v.toPrecision(5)));
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtTime(ms: number, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

function signalLabel(sig: AssetSignal, d: (typeof DICT)[Lang]): string {
  if (sig.type === "top-div")
    return sig.subtype === "flat" ? d.divFlatTop : d.divNewHigh;
  if (sig.type === "bottom-div")
    return sig.subtype === "flat" ? d.divFlatBottom : d.divNewLow;
  return d.chip[sig.type];
}

function badgeClass(type: SignalType): string {
  switch (type) {
    case "top-div":
    case "breakout-down":
      return "sig-badge sig-badge-bear";
    case "bottom-div":
    case "breakout-up":
      return "sig-badge sig-badge-bull";
    default:
      return "sig-badge sig-badge-flat";
  }
}

function Spark({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${((i / (data.length - 1)) * 100).toFixed(1)},${(26 - ((v - min) / range) * 24).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      className="sig-spark"
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#1e7d46" : "#b3402a"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function SignalsBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<SignalsPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [kind, setKind] = useState<"all" | "crypto" | "stock">("all");
  const [tf, setTf] = useState<"all" | Timeframe>("all");
  const [types, setTypes] = useState<ReadonlySet<SignalType>>(new Set());
  const [query, setQuery] = useState("");
  const [cardsShown, setCardsShown] = useState(PAGE_SIZE);
  const [feedShown, setFeedShown] = useState(PAGE_SIZE);
  const [openEvidence, setOpenEvidence] = useState<ReadonlySet<string>>(new Set());

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/signals", { cache: "no-store" });
      const payload = (await res.json()) as SignalsPayload;
      if (payload.error && payload.assets.length === 0) {
        setFailed(true);
      } else {
        setData(payload);
        setFailed(false);
      }
    } catch {
      setFailed(true);
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), 300_000);
    return () => window.clearInterval(id);
  }, [load]);

  // 筛选变化时分级展开计数重置回首屏（§5）
  useEffect(() => {
    setCardsShown(PAGE_SIZE);
    setFeedShown(PAGE_SIZE);
  }, [kind, tf, types, query]);

  const toggleType = (t: SignalType) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const toggleEvidence = (key: string) =>
    setOpenEvidence((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  /** 资产在当前周期/类型筛选下可见的信号 */
  const visibleSignals = useCallback(
    (a: AssetResult): AssetSignal[] =>
      a.signals.filter(
        (s) =>
          (tf === "all" || s.tf === tf) &&
          (types.size === 0 || types.has(s.type)),
      ),
    [tf, types],
  );

  const cards = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const list = data.assets
      .filter((a) => kind === "all" || a.kind === kind)
      .filter((a) => types.size === 0 || visibleSignals(a).length > 0)
      .filter(
        (a) =>
          q === "" ||
          a.symbol.toLowerCase().includes(q) ||
          a.name.zh.toLowerCase().includes(q) ||
          a.name.en.toLowerCase().includes(q),
      )
      .map((a) => ({ asset: a, sigs: visibleSignals(a) }));
    const prio = (sigs: AssetSignal[]) =>
      sigs.some((s) => s.type !== "range") ? 0 : sigs.length > 0 ? 1 : 2;
    list.sort((x, y) => {
      const p = prio(x.sigs) - prio(y.sigs);
      if (p !== 0) return p;
      return (
        Math.abs(y.asset.change24h ?? 0) - Math.abs(x.asset.change24h ?? 0)
      );
    });
    return list;
  }, [data, kind, types, query, visibleSignals]);

  const feed = useMemo(() => {
    if (!data) return [];
    const rows: { asset: AssetResult; sig: AssetSignal }[] = [];
    for (const a of data.assets) {
      if (kind !== "all" && a.kind !== kind) continue;
      for (const sig of visibleSignals(a)) rows.push({ asset: a, sig });
    }
    rows.sort((x, y) => y.sig.confirmedAt - x.sig.confirmedAt);
    return rows;
  }, [data, kind, visibleSignals]);

  const shownCards = cards.slice(0, cardsShown);
  const shownFeed = feed.slice(0, feedShown);

  return (
    <section className="card sig-board">
      <p className="crcl-kicker">{d.boardKicker}</p>
      {data && (
        <p className="body-text sig-source">
          {d.sourceLine.replace(
            "{t}",
            new Intl.DateTimeFormat(LOCALES[lang], {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }).format(new Date(data.scannedAt)),
          )}
        </p>
      )}

      {!data && !failed && <p className="body-text">{d.loading}</p>}
      {failed && !data && <p className="body-text sig-error">{d.loadError}</p>}

      {data && (
        <>
          <div className="sig-stats">
            <div className="sig-stat">
              <span className="sig-stat-num">{data.breadth.total}</span>
              <span className="sig-stat-label">{d.statScanned}</span>
            </div>
            <div className="sig-stat">
              <span className="sig-stat-num">
                {data.breadth.upPct.toFixed(0)}%
              </span>
              <span className="sig-stat-label">
                {d.statBreadth} ·{" "}
                {d.breadthOf
                  .replace("{up}", String(data.breadth.up))
                  .replace("{total}", String(data.breadth.total))}
              </span>
            </div>
            <div className="sig-stat">
              <span className="sig-stat-num">{data.breadth.withSignals}</span>
              <span className="sig-stat-label">{d.statSignals}</span>
            </div>
          </div>

          {data.stocksUnavailable && (
            <p className="body-text sig-warn">{d.stocksDown}</p>
          )}
          {data.cryptoUnavailable && (
            <p className="body-text sig-warn">{d.cryptoDown}</p>
          )}

          <div className="sig-filters">
            <div className="sig-chip-row">
              {(
                [
                  ["all", d.kindAll],
                  ["crypto", d.kindCrypto],
                  ["stock", d.kindStock],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={`sig-chip${kind === k ? " sig-chip-on" : ""}`}
                  onClick={() => setKind(k)}
                >
                  {label}
                </button>
              ))}
              <span className="sig-chip-sep" />
              {(
                [
                  ["all", d.tfAll],
                  ["15m", "15m"],
                  ["1h", "1h"],
                  ["4h", "4h"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  className={`sig-chip${tf === v ? " sig-chip-on" : ""}`}
                  onClick={() => setTf(v)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="sig-chip-row">
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`sig-chip${types.has(t) ? " sig-chip-on" : ""}`}
                  onClick={() => toggleType(t)}
                  aria-pressed={types.has(t)}
                >
                  {d.chip[t]}
                </button>
              ))}
              <input
                className="ft-input sig-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d.searchPlaceholder}
              />
            </div>
          </div>

          {cards.length === 0 ? (
            <p className="body-text">{d.noResults}</p>
          ) : (
            <>
              <div className="sig-grid">
                {shownCards.map(({ asset: a, sigs }) => {
                  const primaryTf: Timeframe | null =
                    tf !== "all" ? tf : sigs.length > 0 ? sigs[0].tf : "1h";
                  const rvol =
                    primaryTf != null ? a.rvol[primaryTf] : null;
                  return (
                    <article key={a.symbol} className="sig-card">
                      <div className="sig-card-head">
                        <div>
                          <span className="sig-symbol">{a.symbol}</span>
                          <span className="sig-name">{a.name[lang]}</span>
                        </div>
                        <span className="sig-kind">
                          {a.kind === "crypto" ? d.kindCrypto : d.kindStock}
                        </span>
                      </div>
                      <div className="sig-price-row">
                        <span className="sig-price">${fmtPrice(a.price)}</span>
                        <span
                          className={
                            a.change24h == null
                              ? "sig-chg"
                              : a.change24h >= 0
                                ? "sig-chg sig-pos"
                                : "sig-chg sig-neg"
                          }
                        >
                          {fmtPct(a.change24h)}
                        </span>
                        <Spark
                          data={a.spark}
                          up={(a.change24h ?? 0) >= 0}
                        />
                      </div>
                      <div className="sig-badges">
                        {a.unavailable ? (
                          <span className="sig-badge sig-badge-flat">
                            {d.unavailableTag}
                          </span>
                        ) : sigs.length === 0 ? (
                          <span className="sig-none">{d.noSignal}</span>
                        ) : (
                          sigs.map((s, i) => (
                            <span key={i} className={badgeClass(s.type)}>
                              {signalLabel(s, d)} · {s.tf} ·{" "}
                              {fmtTime(s.confirmedAt, lang)}
                              {s.subtype === "with-volume" && (
                                <em className="sig-vol-tag">{d.volTag}</em>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="sig-meta">
                        <span>
                          {d.rvol}{" "}
                          {rvol != null ? rvol.toFixed(2) : "—"}
                          {primaryTf ? ` · ${primaryTf}` : ""}
                        </span>
                      </div>
                      {sigs
                        .filter((s) => s.evidence.p1 || s.evidence.rangeHigh != null)
                        .map((s, i) => {
                          const key = `${a.symbol}-${s.tf}-${s.type}`;
                          const open = openEvidence.has(key);
                          return (
                            <div key={i} className="sig-evidence">
                              <button
                                type="button"
                                className="sig-ev-btn"
                                onClick={() => toggleEvidence(key)}
                                aria-expanded={open}
                              >
                                {signalLabel(s, d)} · {s.tf} ·{" "}
                                {open ? d.hideEvidence : d.evidence} {open ? "▴" : "▾"}
                              </button>
                              {open && s.evidence.p1 && s.evidence.p2 && (
                                <div className="sig-ev-body">
                                  {(
                                    [
                                      [
                                        s.type === "top-div"
                                          ? d.evP1Top
                                          : d.evP1Bottom,
                                        s.evidence.p1,
                                      ],
                                      [
                                        s.type === "top-div"
                                          ? d.evP2Top
                                          : d.evP2Bottom,
                                        s.evidence.p2,
                                      ],
                                    ] as const
                                  ).map(([label, p]) => (
                                    <p key={label} className="sig-ev-line">
                                      <strong>{label}</strong> · {d.evPrice}{" "}
                                      {fmtPrice(p.price)} · {d.evDif}{" "}
                                      {fmtSigned(p.dif)} · {d.evTime}{" "}
                                      {fmtTime(p.time, lang)}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {open && s.evidence.rangeHigh != null && (
                                <div className="sig-ev-body">
                                  <p className="sig-ev-line">
                                    {d.evRangeHigh} {fmtPrice(s.evidence.rangeHigh)}
                                  </p>
                                  <p className="sig-ev-line">
                                    {d.evRangeLow} {fmtPrice(s.evidence.rangeLow ?? null)}
                                  </p>
                                  {s.evidence.volMultiple != null && (
                                    <p className="sig-ev-line">
                                      {d.evVolMult} {s.evidence.volMultiple.toFixed(2)}×
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </article>
                  );
                })}
              </div>
              {cards.length > PAGE_SIZE &&
                (cardsShown < cards.length ? (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() =>
                      setCardsShown((n) => Math.min(n + LIST_STEP, cards.length))
                    }
                  >
                    {d.showMore.replace("{n}", String(cards.length - cardsShown))} ▾
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() => setCardsShown(PAGE_SIZE)}
                  >
                    {d.collapse} ▴
                  </button>
                ))}
            </>
          )}

          <h3 className="crcl-sec-title">{d.secFeed}</h3>
          <p className="body-text crcl-sec-intro">{d.feedIntro}</p>
          {feed.length === 0 ? (
            <p className="body-text">{d.feedEmpty}</p>
          ) : (
            <>
              <ul className="sig-feed">
                {shownFeed.map(({ asset: a, sig }, i) => (
                  <li key={i} className="sig-feed-row">
                    <span className={badgeClass(sig.type)}>
                      {signalLabel(sig, d)}
                      {sig.subtype === "with-volume" && (
                        <em className="sig-vol-tag">{d.volTag}</em>
                      )}
                    </span>
                    <span className="sig-feed-sym">
                      {a.symbol} · {sig.tf}
                    </span>
                    <span className="sig-feed-time">
                      {fmtTime(sig.confirmedAt, lang)}
                    </span>
                    <span className="sig-feed-price">
                      {d.colTrigger} ${fmtPrice(sig.triggerPrice)}
                    </span>
                  </li>
                ))}
              </ul>
              {feed.length > PAGE_SIZE &&
                (feedShown < feed.length ? (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() =>
                      setFeedShown((n) => Math.min(n + LIST_STEP, feed.length))
                    }
                  >
                    {d.showMore.replace("{n}", String(feed.length - feedShown))} ▾
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() => setFeedShown(PAGE_SIZE)}
                  >
                    {d.collapse} ▴
                  </button>
                ))}
            </>
          )}

          <div className="arb-refresh-row">
            <button
              type="button"
              className="arb-refresh-btn"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              {refreshing ? d.refreshing : d.refresh}
            </button>
            {failed && <span className="arb-refresh-err">{d.loadError}</span>}
          </div>

          <h3 className="crcl-sec-title">{d.secCaliber}</h3>
          <div className="burn-note">
            {d.caliber.map((line, i) => (
              <p key={i} className="body-text">
                {line}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
