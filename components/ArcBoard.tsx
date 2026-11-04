"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArcChange, ArcPayload, ArcPoint } from "@/lib/arc";
import { LOCALE, type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT_ZH = {
  "asOfSub": "截至 {d}",
  "boardKicker": "Arc 链 · TVL 与稳定币趋势",
  "caliber": [
    "数据来源：DeFiLlama 公开接口。TVL 序列取其 Arc 链历史 TVL，稳定币序列取其 Arc 链稳定币流通量；本页的「当前 TVL」「当前稳定币供应」直接取各自历史序列的最后一点计算，与两张趋势图的末端严格对齐，不混用其他快照口径。",
    "TVL 是 DeFiLlama 统计的 Arc 链上 DeFi 协议锁仓总额，只算已经进入其收录协议的资金；桥进链上、躺在钱包里没有进入任何协议的稳定币，不计入 TVL。",
    "稳定币供应是 DeFiLlama 统计的 Arc 链上稳定币流通总量：按锚定币种（美元、欧元、英镑等）分别折美元后相加。它统计的是「链上一共有多少稳定币」，TVL 统计的是「有多少进了 DeFi 协议」，两个数统计对象不同，不可直接相减；比值只作资金去向的粗略参照。",
    "Arc 是 Circle 推出的稳定币原生新兴链，历史很短：TVL 序列自 2026 年 5 月起，上线初期有一段为 0（图中已剔除），稳定币序列自 2026 年 9 月中旬起。样本尚短，涨跌百分比容易被低基数放大，不要把短期变化当作长期趋势。",
    "本页数据每 10 分钟向 DeFiLlama 重新取数一次；第三方公开接口可能延迟、修订历史值或临时不可用，届时页面会回退展示上一次成功取到的数据。本页只是公开数据的整理与展示，不构成投资建议。"
  ],
  "caliberTitle": "05 · 口径说明",
  "ccyEUR": "欧元锚定",
  "ccyGBP": "英镑锚定",
  "ccyOTHER": "其他锚定币种",
  "ccyUSD": "美元锚定",
  "chartNote": "TVL 曲线已剔除上线初期连续为 0 的一段；稳定币序列自 2026 年 9 月中旬起，两图时间跨度不同，范围切换按各自序列末端对齐。",
  "chartStabTitle": "稳定币供应趋势（各锚定币种折 USD 合计）",
  "chartTvlTitle": "TVL 趋势（DeFi 协议锁仓）",
  "chartsIntro": "两条线看的是两件事：TVL 是已经进入 DeFi 协议的钱，稳定币供应是链上备好的钱。两线拉开，说明钱到了但还没开工；两线收窄，说明稳定币正被用进协议。",
  "col30d": "近 30 天变化",
  "col7d": "近 7 天变化",
  "colAmount": "金额",
  "colCcy": "锚定币种",
  "colMetric": "指标",
  "colNow": "当前",
  "colShare": "占比",
  "loadError": "数据暂时拉取失败，请稍后刷新重试。",
  "loading": "正在拉取 Arc 链 TVL 与稳定币数据…",
  "mixIntro": "当前流通量按锚定币种拆分（DeFiLlama 已逐币种折 USD）：",
  "range30": "近 30 天",
  "range90": "近 90 天",
  "rangeAll": "全部",
  "ratioLabel": "稳定币供应 ÷ TVL",
  "ratioSub": "两个口径统计对象不同，详见下方口径说明",
  "rowStab": "稳定币供应",
  "rowTvl": "TVL（DeFi 锁仓）",
  "secChanges": "03 · 关键变化",
  "secCharts": "02 · 趋势图",
  "secMix": "04 · 稳定币构成",
  "secVerdict": "01 · 一眼看懂",
  "sourceLine": "数据来源：DeFiLlama（TVL 与稳定币流通量）· 取数 {t}",
  "stabLabel": "当前稳定币供应",
  "tvlLabel": "当前 TVL（DeFi 锁仓）",
  "verdictHigh": "稳定币供应约为 DeFi TVL 的 {r} 倍：已经桥进 Arc 的稳定币，大部分还躺在钱包里，没有进入借贷、交易等 DeFi 协议——资金先到了，应用还没跟上。",
  "verdictLow": "DeFi TVL 已高于稳定币供应（比值 {r}）：锁仓里含有相当比例的非稳定币资产，或受计价口径影响；看趋势时留意两条线的相对变化。",
  "verdictMid": "稳定币供应与 DeFi TVL 大致相当（比值 {r}）：链上稳定币与已进入 DeFi 协议的锁仓规模接近，资金到位与应用承接基本同步。"
};

type ArcDict = typeof DICT_ZH;

const DICT: Record<Lang, ArcDict> = {
  zh: DICT_ZH,
  tw: {
  "asOfSub": "截至 {d}",
  "boardKicker": "Arc 鏈 · TVL 與穩定幣趨勢",
  "caliber": [
    "資料來源：DeFiLlama 公開介面。TVL 序列取其 Arc 鏈歷史 TVL，穩定幣序列取其 Arc 鏈穩定幣流通量；本頁的「當前 TVL」「當前穩定幣供應」直接取各自歷史序列的最後一點計算，與兩張趨勢圖的末端嚴格對齊，不混用其他快照口徑。",
    "TVL 是 DeFiLlama 統計的 Arc 鏈上 DeFi 協議鎖倉總額，只算已經進入其收錄協議的資金；橋進鏈上、躺在錢包裡沒有進入任何協議的穩定幣，不計入 TVL。",
    "穩定幣供應是 DeFiLlama 統計的 Arc 鏈上穩定幣流通總量：按錨定幣種（美元、歐元、英鎊等）分別折美元后相加。它統計的是「鏈上一共有多少穩定幣」，TVL 統計的是「有多少進了 DeFi 協議」，兩個數統計物件不同，不可直接相減；比值只作資金去向的粗略參照。",
    "Arc 是 Circle 推出的穩定幣原生新興鏈，歷史很短：TVL 序列自 2026 年 5 月起，上線初期有一段為 0（圖中已剔除），穩定幣序列自 2026 年 9 月中旬起。樣本尚短，漲跌百分比容易被低基數放大，不要把短期變化當作長期趨勢。",
    "本頁資料每 10 分鐘向 DeFiLlama 重新取數一次；第三方公開介面可能延遲、修訂歷史值或臨時不可用，屆時頁面會回退展示上一次成功取到的資料。本頁只是公開資料的整理與展示，不構成投資建議。"
  ],
  "caliberTitle": "05 · 口徑說明",
  "ccyEUR": "歐元錨定",
  "ccyGBP": "英鎊錨定",
  "ccyOTHER": "其他錨定幣種",
  "ccyUSD": "美元錨定",
  "chartNote": "TVL 曲線已剔除上線初期連續為 0 的一段；穩定幣序列自 2026 年 9 月中旬起，兩圖時間跨度不同，範圍切換按各自序列末端對齊。",
  "chartStabTitle": "穩定幣供應趨勢（各錨定幣種折 USD 合計）",
  "chartTvlTitle": "TVL 趨勢（DeFi 協議鎖倉）",
  "chartsIntro": "兩條線看的是兩件事：TVL 是已經進入 DeFi 協議的錢，穩定幣供應是鏈上備好的錢。兩線拉開，說明錢到了但還沒開工；兩線收窄，說明穩定幣正被用進協議。",
  "col30d": "近 30 天變化",
  "col7d": "近 7 天變化",
  "colAmount": "金額",
  "colCcy": "錨定幣種",
  "colMetric": "指標",
  "colNow": "當前",
  "colShare": "佔比",
  "loadError": "資料暫時拉取失敗，請稍後重新整理重試。",
  "loading": "正在拉取 Arc 鏈 TVL 與穩定幣資料…",
  "mixIntro": "當前流通量按錨定幣種拆分（DeFiLlama 已逐幣種折 USD）：",
  "range30": "近 30 天",
  "range90": "近 90 天",
  "rangeAll": "全部",
  "ratioLabel": "穩定幣供應 ÷ TVL",
  "ratioSub": "兩個口徑統計物件不同，詳見下方口徑說明",
  "rowStab": "穩定幣供應",
  "rowTvl": "TVL（DeFi 鎖倉）",
  "secChanges": "03 · 關鍵變化",
  "secCharts": "02 · 趨勢圖",
  "secMix": "04 · 穩定幣構成",
  "secVerdict": "01 · 一眼看懂",
  "sourceLine": "資料來源：DeFiLlama（TVL 與穩定幣流通量）· 取數 {t}",
  "stabLabel": "當前穩定幣供應",
  "tvlLabel": "當前 TVL（DeFi 鎖倉）",
  "verdictHigh": "穩定幣供應約為 DeFi TVL 的 {r} 倍：已經橋進 Arc 的穩定幣，大部分還躺在錢包裡，沒有進入借貸、交易等 DeFi 協議——資金先到了，應用還沒跟上。",
  "verdictLow": "DeFi TVL 已高於穩定幣供應（比值 {r}）：鎖倉裡含有相當比例的非穩定幣資產，或受計價口徑影響；看趨勢時留意兩條線的相對變化。",
  "verdictMid": "穩定幣供應與 DeFi TVL 大致相當（比值 {r}）：鏈上穩定幣與已進入 DeFi 協議的鎖倉規模接近，資金到位與應用承接基本同步。"
},
  en: {
  "asOfSub": "As of {d}",
  "boardKicker": "Arc Chain · TVL & Stablecoin Trends",
  "caliber": [
    "Source: DeFiLlama's public APIs — its historical TVL series for the Arc chain and its stablecoin circulation series for Arc. The 'current TVL' and 'current stablecoin supply' on this page are computed from the last point of each series, so they line up exactly with the ends of the two charts; no snapshot figure from a different caliber is mixed in.",
    "TVL is DeFiLlama's total value locked in DeFi protocols on Arc — only funds that have entered the protocols it tracks. Stablecoins that bridged onto the chain and sit idle in wallets are not part of TVL.",
    "Stablecoin supply is DeFiLlama's total circulating stablecoins on Arc: each peg currency (USD, EUR, GBP…) converted to USD and summed. It answers 'how many stablecoins exist on this chain', while TVL answers 'how much value sits inside DeFi protocols' — different objects that cannot simply be subtracted; the ratio is only a rough guide to where the money is.",
    "Arc is a young stablecoin-native chain from Circle, and its history is short: the TVL series starts in May 2026 with an all-zero opening stretch (trimmed from the chart), and the stablecoin series starts in mid-September 2026. With samples this short, percentage moves are easily amplified by a low base — do not read a few weeks of change as a long-term trend.",
    "This page re-fetches from DeFiLlama every 10 minutes. Third-party public APIs can lag, revise historical values or go briefly unavailable; when that happens the page falls back to the last successfully fetched data. This page only compiles and presents public data — it is not investment advice."
  ],
  "caliberTitle": "05 · Methodology & Caveats",
  "ccyEUR": "EUR-pegged",
  "ccyGBP": "GBP-pegged",
  "ccyOTHER": "Other pegs",
  "ccyUSD": "USD-pegged",
  "chartNote": "The TVL curve drops the all-zero stretch from the chain's first weeks; the stablecoin series starts in mid-September 2026. The two charts span different periods — range switches align to each series' own end.",
  "chartStabTitle": "Stablecoin Supply Trend (all peg currencies, in USD)",
  "chartTvlTitle": "TVL Trend (locked in DeFi protocols)",
  "chartsIntro": "The two lines measure two different things: TVL is money already inside DeFi protocols; stablecoin supply is money staged on the chain. When the lines spread apart, money has arrived but is not yet at work; when they narrow, stablecoins are being put to use in protocols.",
  "col30d": "30-Day Change",
  "col7d": "7-Day Change",
  "colAmount": "Amount",
  "colCcy": "Peg Currency",
  "colMetric": "Metric",
  "colNow": "Current",
  "colShare": "Share",
  "loadError": "Data failed to load for now — please refresh later.",
  "loading": "Fetching Arc TVL and stablecoin data…",
  "mixIntro": "Current circulation split by peg currency (each converted to USD by DeFiLlama):",
  "range30": "30D",
  "range90": "90D",
  "rangeAll": "All",
  "ratioLabel": "Stablecoin Supply ÷ TVL",
  "ratioSub": "The two metrics measure different things — see Methodology below",
  "rowStab": "Stablecoin supply",
  "rowTvl": "TVL (in DeFi protocols)",
  "secChanges": "03 · Key Changes",
  "secCharts": "02 · Trend Charts",
  "secMix": "04 · Stablecoin Breakdown",
  "secVerdict": "01 · The Short Version",
  "sourceLine": "Source: DeFiLlama (TVL & stablecoin circulation) · fetched {t}",
  "stabLabel": "Current Stablecoin Supply",
  "tvlLabel": "Current TVL (in DeFi protocols)",
  "verdictHigh": "Stablecoin supply is about {r}× the DeFi TVL: most of the stablecoins that have bridged into Arc are still sitting in wallets rather than inside lending, trading or other DeFi protocols — the money arrived first, the applications have not caught up.",
  "verdictLow": "DeFi TVL now exceeds stablecoin supply (ratio {r}): a sizeable share of the locked value is in non-stablecoin assets, or valuation calibers are at play — watch how the two lines move relative to each other.",
  "verdictMid": "Stablecoin supply and DeFi TVL are roughly in balance (ratio {r}): the stablecoins on-chain and the value actually locked in DeFi protocols are of similar size — arrivals and applications are moving together."
},
};

function fmtUsdBig(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtSignedUsd(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v === 0) return "$0";
  const sign = v > 0 ? "+" : "−";
  const a = Math.abs(v);
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)}K`;
  return `${sign}$${a.toFixed(0)}`;
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(1)}%`;
}

function changeClass(c: ArcChange): string {
  if (c.abs == null || c.abs === 0) return "";
  return c.abs > 0 ? "flows-in" : "flows-out";
}

function fmtTime(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang], {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

function fmtDate(tsSec: number, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(tsSec * 1000));
  } catch {
    return new Date(tsSec * 1000).toISOString().slice(0, 10);
  }
}

function fmtDayShort(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** 站内自绘 SVG 趋势图（面积填充 + 折线），与既有看板 Sparkline 同风格、大尺寸版。 */
function TrendChart({ points, stroke }: { points: ArcPoint[]; stroke: string }) {
  if (points.length < 2) return null;
  const w = 720;
  const h = 216;
  const padTop = 20;
  const padBottom = 26;
  const padX = 6;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => padX + (i / (points.length - 1)) * (w - padX * 2);
  const py = (v: number) =>
    h - padBottom - ((v - min) / span) * (h - padTop - padBottom);
  const line = points
    .map((p, i) => `${px(i).toFixed(1)},${py(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${padX},${h - padBottom} ${line} ${w - padX},${h - padBottom}`;
  return (
    <svg
      className="arc-chart"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={area} fill={stroke} opacity={0.1} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={1.8} />
      <text x={padX} y={13} fontSize={12} fill="#78716c">
        {fmtUsdBig(max)}
      </text>
      <text x={w - padX} y={h - padBottom + 4} fontSize={12} fill="#78716c" textAnchor="end">
        {fmtUsdBig(min)}
      </text>
      <text x={padX} y={h - 6} fontSize={12} fill="#78716c">
        {fmtDayShort(points[0].date)}
      </text>
      <text x={w - padX} y={h - 6} fontSize={12} fill="#78716c" textAnchor="end">
        {fmtDayShort(points[points.length - 1].date)}
      </text>
    </svg>
  );
}

type RangeKey = "30" | "90" | "all";

function inRange(points: ArcPoint[], range: RangeKey): ArcPoint[] {
  if (range === "all" || points.length === 0) return points;
  const days = range === "30" ? 30 : 90;
  const last = points[points.length - 1].date;
  const from = last - days * 86400;
  const cut = points.filter((p) => p.date >= from);
  return cut.length >= 2 ? cut : points;
}

const MIX_COLORS: Record<string, string> = {
  USD: "#8a6d1f",
  EUR: "#5f7f5a",
  GBP: "#4f6f8f",
  OTHER: "#a89a7c",
};

export default function ArcBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<ArcPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<RangeKey>("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/arc")
      .then((r) => r.json())
      .then((j: ArcPayload) => {
        if (!alive) return;
        if (j.board) setData(j);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const board = data?.board ?? null;

  const tvlChart = useMemo(
    () => (board ? inRange(board.tvlSeries, range) : []),
    [board, range],
  );
  const stabChart = useMemo(
    () => (board ? inRange(board.stabSeries, range) : []),
    [board, range],
  );

  const verdict = useMemo(() => {
    if (!board) return "";
    const r = `${(Math.round(board.ratio * 10) / 10).toFixed(1)}`;
    const tpl =
      board.ratio >= 1.2
        ? d.verdictHigh
        : board.ratio >= 0.8
          ? d.verdictMid
          : d.verdictLow;
    return tpl.replace("{r}", r);
  }, [board, d]);

  const ccyLabel = (key: string): string =>
    key === "USD"
      ? d.ccyUSD
      : key === "EUR"
        ? d.ccyEUR
        : key === "GBP"
          ? d.ccyGBP
          : d.ccyOTHER;

  const rangeBtn = (key: RangeKey, label: string) => (
    <button
      type="button"
      className={`arc-range-btn${range === key ? " arc-range-btn-on" : ""}`}
      onClick={() => setRange(key)}
    >
      {label}
    </button>
  );

  const wrapPct = (s: string) => (lang === "en" ? ` (${s})` : `（${s}）`);

  const changeCell = (c: ArcChange) => (
    <td className={changeClass(c)}>
      {fmtSignedUsd(c.abs)}
      {c.pct != null ? wrapPct(fmtPct(c.pct)) : ""}
    </td>
  );

  return (
    <section className="crcl-board">
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.sourceLine.replace(
            "{t}",
            data?.board ? fmtTime(data.board.fetchedAt, lang) : "—",
          )}
        </p>
      </div>

      {!data && !failed && <p className="body-text">{d.loading}</p>}
      {failed && <p className="body-text">{d.loadError}</p>}

      {board && (
        <>
          <h3 className="crcl-sec-title">{d.secVerdict}</h3>
          <div className="burn-grid crcl-stats">
            <div className="burn-stat burn-stat-hero">
              <p className="burn-stat-label">{d.tvlLabel}</p>
              <p className="burn-stat-value">{fmtUsdBig(board.tvlNow)}</p>
              <p className="burn-stat-sub">
                {d.asOfSub.replace(
                  "{d}",
                  fmtDate(board.tvlSeries[board.tvlSeries.length - 1].date, lang),
                )}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.stabLabel}</p>
              <p className="burn-stat-value">{fmtUsdBig(board.stabNow)}</p>
              <p className="burn-stat-sub">
                {d.asOfSub.replace(
                  "{d}",
                  fmtDate(board.stabSeries[board.stabSeries.length - 1].date, lang),
                )}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.ratioLabel}</p>
              <p className="burn-stat-value">{board.ratio.toFixed(2)}×</p>
              <p className="burn-stat-sub">{d.ratioSub}</p>
            </div>
          </div>
          <p className="body-text crcl-sec-intro">{verdict}</p>

          <h3 className="crcl-sec-title">{d.secCharts}</h3>
          <p className="body-text crcl-sec-intro">{d.chartsIntro}</p>
          <div className="arc-range">
            {rangeBtn("30", d.range30)}
            {rangeBtn("90", d.range90)}
            {rangeBtn("all", d.rangeAll)}
          </div>

          <div className="card arc-chart-card">
            <h4 className="arc-chart-title">{d.chartTvlTitle}</h4>
            <TrendChart points={tvlChart} stroke="#8a6d1f" />
          </div>
          <div className="card arc-chart-card">
            <h4 className="arc-chart-title">{d.chartStabTitle}</h4>
            <TrendChart points={stabChart} stroke="#4f6f8f" />
          </div>
          <p className="body-text arc-note">{d.chartNote}</p>

          <h3 className="crcl-sec-title">{d.secChanges}</h3>
          <div className="burn-table-wrap">
            <table className="burn-table flows-table">
              <thead>
                <tr>
                  <th>{d.colMetric}</th>
                  <th>{d.colNow}</th>
                  <th>{d.col7d}</th>
                  <th>{d.col30d}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{d.rowTvl}</td>
                  <td title={`$${Math.round(board.tvlNow).toLocaleString("en-US")}`}>
                    {fmtUsdBig(board.tvlNow)}
                  </td>
                  {changeCell(board.tvlChange7d)}
                  {changeCell(board.tvlChange30d)}
                </tr>
                <tr>
                  <td>{d.rowStab}</td>
                  <td title={`$${Math.round(board.stabNow).toLocaleString("en-US")}`}>
                    {fmtUsdBig(board.stabNow)}
                  </td>
                  {changeCell(board.stabChange7d)}
                  {changeCell(board.stabChange30d)}
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="crcl-sec-title">{d.secMix}</h3>
          <p className="body-text crcl-sec-intro">{d.mixIntro}</p>
          <div className="arc-mix-bar" aria-hidden="true">
            {board.composition.map((c) => (
              <div
                key={c.key}
                className="arc-mix-seg"
                style={{
                  width: `${Math.max(c.share * 100, 0)}%`,
                  background: MIX_COLORS[c.key] ?? MIX_COLORS.OTHER,
                }}
              />
            ))}
          </div>
          <div className="burn-table-wrap">
            <table className="burn-table flows-table">
              <thead>
                <tr>
                  <th>{d.colCcy}</th>
                  <th>{d.colAmount}</th>
                  <th>{d.colShare}</th>
                </tr>
              </thead>
              <tbody>
                {board.composition.map((c) => (
                  <tr key={c.key}>
                    <td>
                      <span
                        className="arc-mix-dot"
                        style={{ background: MIX_COLORS[c.key] ?? MIX_COLORS.OTHER }}
                      />
                      {ccyLabel(c.key)}
                      {wrapPct(c.key === "OTHER" ? "…" : c.key)}
                    </td>
                    <td title={`$${Math.round(c.usd).toLocaleString("en-US")}`}>
                      {fmtUsdBig(c.usd)}
                    </td>
                    <td>{(c.share * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="crcl-sec-title">{d.caliberTitle}</h3>
          <div className="burn-notes">
            <div className="card">
              {d.caliber.map((line, i) => (
                <p key={i} className="body-text" style={i ? { marginTop: 10 } : undefined}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
