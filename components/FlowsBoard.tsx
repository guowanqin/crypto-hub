"use client";

import { Fragment, useEffect, useState } from "react";
import type {
  CexDetail,
  CexDetailPayload,
  FlowsPayload,
  MarginSource,
} from "@/lib/flows";
import { HUB_DICT } from "@/lib/i18n";
import { LOCALE, type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {t} 取数时间
    loading: string;
    loadError: string;
    secFlows: string;
    flowsIntro: string;
    colExchange: string;
    colReserves: string;
    colFlow24h: string;
    colFlow7d: string;
    colFlow30d: string;
    flowsFail: string;
    expandHint: string;
    detailLoading: string;
    detailFail: string;
    detailTokensTitle: string; // {name}
    detailTokensNote: string; // {own} 被剔除的自家代币（无则空）
    detailSeriesTitle: string;
    detailBalanceTitle: string;
    detailBalanceNote: string;
    bal24h: string;
    bal7d: string;
    bal30d: string;
    secMargin: string;
    marginIntro: string;
    colOi: string;
    colFunding: string;
    colLs: string;
    colSource: string;
    marginFail: string;
    unavailable: string;
    sources: Record<MarginSource, string>;
    caliberTitle: string;
    caliberFlows: string[];
    caliberMargin: string[];
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "交易所资金流 · 储备与保证金看板",
    sourceLine:
      "数据来源：DeFiLlama（储备与净流入）· OKX / Hyperliquid 官方接口 · CoinGecko 衍生品聚合（保证金）· 取数 {t}",
    loading: "正在拉取交易所储备与合约数据…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    secFlows: "01 · 资金流总览（储备与净流入）",
    flowsIntro:
      "储备总额是 DeFiLlama 追踪到的各交易所已标记钱包资产（clean reserves，已剔除各所自家代币，如币安剔除 BNB）；净流入/流出是其按钱包转账计算的净流量，正数绿色为净流入、负数红色为净流出。点任意一行展开该交易所的主要币种构成与近 35 日储备走势。",
    colExchange: "交易所",
    colReserves: "储备总额",
    colFlow24h: "24h 净流入",
    colFlow7d: "7d 净流入",
    colFlow30d: "30d 净流入",
    flowsFail:
      "资金流数据暂时拉取失败（DeFiLlama 源异常），保证金区块不受影响。",
    expandHint: "展开构成",
    detailLoading: "正在拉取该交易所的链上构成（数据量较大，稍候）…",
    detailFail: "该交易所明细暂时拉取失败，稍后再试。",
    detailTokensTitle: "{name} · 主要币种构成",
    detailTokensNote:
      "构成按 clean reserves 口径（已剔除自家代币 {own}）计算占比；数据来自 DeFiLlama updatedProtocol 聚合的各链标记钱包。",
    detailSeriesTitle: "近 35 日储备走势（clean reserves，日线）",
    detailBalanceTitle: "按日线储备序列算的余额变化（交叉核对）",
    detailBalanceNote:
      "注意：这组数字是相邻日储备余额之差，包含持仓价格涨跌因素，与上方总览由 DeFiLlama 净流入引擎算出的净流量口径不同，两者不一致是正常的——总览看净流量，明细看余额变化。",
    bal24h: "24h",
    bal7d: "7d",
    bal30d: "30d",
    secMargin: "02 · 保证金（合约未平仓与资金费率）",
    marginIntro:
      "未平仓总额（OI）是各交易所全部合约的名义价值合计；资金费率取 BTC 永续合约，按各合约自身结算周期计（主流为 8 小时，Hyperliquid、Deribit、Kraken、Crypto.com 为 1 小时，单元格内已标注）。数据源逐行标注：OKX、Hyperliquid 为官方接口直取，其余为 CoinGecko 衍生品聚合（官方接口对机房与部分地域 IP 受限）。",
    colOi: "未平仓总额 (OI)",
    colFunding: "BTC 永续资金费率",
    colLs: "多空比",
    colSource: "数据源",
    marginFail: "保证金数据暂时全部拉取失败，资金流区块不受影响。",
    unavailable: "暂不可用",
    sources: {
      okx: "OKX 官方接口",
      hyperliquid: "Hyperliquid 官方接口",
      coingecko: "CoinGecko 聚合",
    },
    caliberTitle: "03 · 口径说明",
    caliberFlows: [
      "储备与净流入只覆盖 DeFiLlama 已标记的交易所钱包地址：未标记地址、场外交易、内部钱包划转都不在统计内，因此净流入不等于用户净申购/赎回，更不等于交易所的真实财务状况。",
      "Coinbase、Kraken、Upbit 等交易所的钱包未被该数据集追踪（无储备数据），故不在总览表内——不是它们没有储备，而是这套公开数据看不到。",
      "clean reserves 会剔除各所自家平台币（如 BNB、OKB、MNT），避免自家代币价格波动污染储备口径；展开明细里的币种构成与储备走势用同一口径。",
    ],
    caliberMargin: [
      "OI 口径：OKX 为其全部永续+交割合约 oiUsd 求和（官方），Hyperliquid 为全品种未平仓量 × 标记价格求和（官方），其余各所为 CoinGecko 衍生品聚合的 open_interest_btc 按 BTC 现价换算美元——不同来源的统计范围（是否含期权、交割合约）略有差异，跨所比较时留有余地。",
      "资金费率为 BTC 永续当前一期费率（百分数）：正值表示多头付空头、负值相反；结算周期不同（8 小时 / 1 小时）时数值不可直接横比，年化换算请自行按周期折算。",
      "多空比暂不提供数值：Binance、Bybit 的官方统计接口对机房与部分地域 IP 受限，OKX 对应的 rubik 多空比接口已经下线，免费公开源没有可靠口径——宁可空着，不编数字。",
      "资金流数据缓存约 1 小时、保证金约 10 分钟；本页所有数字都是链上与公开市场数据的整理，不构成投资建议。",
    ],
    toolsTitle: "交易所资金流 · 本类工具",
  },
  en: {
    boardKicker: "Exchange Flows · Reserves & Derivatives Board",
    sourceLine:
      "Sources: DeFiLlama (reserves & net inflows) · OKX / Hyperliquid official APIs · CoinGecko derivatives aggregation (margin) · fetched {t}",
    loading: "Fetching exchange reserves and derivatives data…",
    loadError: "Data failed to load for now — please refresh later.",
    secFlows: "01 · Fund Flows (Reserves & Net Inflows)",
    flowsIntro:
      "Reserves are the assets in each exchange's tracked, labelled wallets as compiled by DeFiLlama (clean reserves — each exchange's own token, e.g. BNB for Binance, is excluded). Net inflows/outflows are wallet-transfer-based net flows: green/positive is a net inflow, red/negative a net outflow. Click any row to expand that exchange's top asset breakdown and its 35-day reserve trend.",
    colExchange: "Exchange",
    colReserves: "Total Reserves",
    colFlow24h: "24h Net Inflow",
    colFlow7d: "7d Net Inflow",
    colFlow30d: "30d Net Inflow",
    flowsFail:
      "Flow data is temporarily unavailable (DeFiLlama source error); the margin section is unaffected.",
    expandHint: "Breakdown",
    detailLoading:
      "Fetching this exchange's on-chain breakdown (a large payload — a moment)…",
    detailFail:
      "This exchange's breakdown failed to load for now — try again later.",
    detailTokensTitle: "{name} · Top Asset Breakdown",
    detailTokensNote:
      "Shares are computed on the clean-reserves basis (own token {own} excluded); data aggregated by DeFiLlama's updatedProtocol from labelled wallets across chains.",
    detailSeriesTitle: "Reserves, Last 35 Days (clean reserves, daily)",
    detailBalanceTitle: "Balance Change from the Daily Series (cross-check)",
    detailBalanceNote:
      "Note: these figures are differences between adjacent daily reserve balances and include asset price moves, so they use a different caliber from the net-inflow engine behind the overview — disagreement between the two is expected. Use the overview for net flows and this for balance change.",
    bal24h: "24h",
    bal7d: "7d",
    bal30d: "30d",
    secMargin: "02 · Margin (Open Interest & Funding Rates)",
    marginIntro:
      "Open interest (OI) is the total notional of all open contracts on each exchange. Funding is the BTC perpetual's current rate, charged per each contract's own settlement cycle (8h for most majors; 1h for Hyperliquid, Deribit, Kraken and Crypto.com — labelled in each cell). Sources are marked per row: OKX and Hyperliquid come straight from their official APIs; the rest use CoinGecko's derivatives aggregation because those exchanges' official APIs restrict datacenter and some regional IPs.",
    colOi: "Open Interest (OI)",
    colFunding: "BTC Perp Funding",
    colLs: "Long/Short",
    colSource: "Source",
    marginFail:
      "Margin data failed to load entirely for now; the flows section is unaffected.",
    unavailable: "Unavailable",
    sources: {
      okx: "OKX official API",
      hyperliquid: "Hyperliquid official API",
      coingecko: "CoinGecko aggregation",
    },
    caliberTitle: "03 · Methodology & Caveats",
    caliberFlows: [
      "Reserves and net inflows only cover wallet addresses DeFiLlama has labelled: unlabelled addresses, OTC flow and internal wallet transfers are outside the scope, so a net inflow is not the same as users' net subscriptions or redemptions, and says nothing definitive about an exchange's finances.",
      "Coinbase, Kraken and Upbit wallets are not tracked by this dataset (no reserve figures), so they are absent from the table — not because they hold no reserves, but because this public dataset cannot see them.",
      "Clean reserves exclude each exchange's own platform token (BNB, OKB, MNT, …) so the token's own price swings do not pollute the reserve figures; the per-exchange breakdown and trend use the same basis.",
    ],
    caliberMargin: [
      "OI caliber: OKX sums oiUsd across all its perpetuals and dated futures (official); Hyperliquid sums open interest × mark price across all markets (official); the rest convert CoinGecko's aggregated open_interest_btc at the BTC spot price — coverage (options, dated futures) differs slightly by source, so compare across exchanges with care.",
      "Funding is the BTC perpetual's current-period rate in percent: positive means longs pay shorts. Rates on different settlement cycles (8h vs 1h) are not directly comparable — annualise by cycle if you need that.",
      "No long/short ratio is shown: Binance's and Bybit's official statistics endpoints are region-restricted, OKX's rubik long/short endpoint has been retired, and no free public source offers a reliable caliber — an honest blank beats an invented number.",
      "Flow data is cached for about an hour and margin data for about ten minutes. Everything here is a compilation of on-chain and public market data, not investment advice.",
    ],
    toolsTitle: "Exchange Flows · Tools in this shelf",
  },
  tw: {
    boardKicker: "交易所資金流 · 儲備與保證金看板",
    sourceLine: "資料來源：DeFiLlama（儲備與淨流入）· OKX / Hyperliquid 官方介面 · CoinGecko 衍生品聚合（保證金）· 取數 {t}",
    loading: "正在拉取交易所儲備與合約資料…",
    loadError: "資料暫時拉取失敗，請稍後重新整理重試。",
    secFlows: "01 · 資金流總覽（儲備與淨流入）",
    flowsIntro: "儲備總額是 DeFiLlama 追蹤到的各交易所已標記錢包資產（clean reserves，已剔除各所自家代幣，如幣安剔除 BNB）；淨流入/流出是其按錢包轉賬計算的淨流量，正數綠色為淨流入、負數紅色為淨流出。點任意一行展開該交易所的主要幣種構成與近 35 日儲備走勢。",
    colExchange: "交易所",
    colReserves: "儲備總額",
    colFlow24h: "24h 淨流入",
    colFlow7d: "7d 淨流入",
    colFlow30d: "30d 淨流入",
    flowsFail: "資金流資料暫時拉取失敗（DeFiLlama 源異常），保證金區塊不受影響。",
    expandHint: "展開構成",
    detailLoading: "正在拉取該交易所的鏈上構成（資料量較大，稍候）…",
    detailFail: "該交易所明細暫時拉取失敗，稍後再試。",
    detailTokensTitle: "{name} · 主要幣種構成",
    detailTokensNote: "構成按 clean reserves 口徑（已剔除自家代幣 {own}）計算佔比；資料來自 DeFiLlama updatedProtocol 聚合的各鏈標記錢包。",
    detailSeriesTitle: "近 35 日儲備走勢（clean reserves，日線）",
    detailBalanceTitle: "按日線儲備序列算的餘額變化（交叉核對）",
    detailBalanceNote: "注意：這組數字是相鄰日儲備餘額之差，包含持倉價格漲跌因素，與上方總覽由 DeFiLlama 淨流入引擎算出的淨流量口徑不同，兩者不一致是正常的——總覽看淨流量，明細看餘額變化。",
    bal24h: "24h",
    bal7d: "7d",
    bal30d: "30d",
    secMargin: "02 · 保證金（合約未平倉與資金費率）",
    marginIntro: "未平倉總額（OI）是各交易所全部合約的名義價值合計；資金費率取 BTC 永續合約，按各合約自身結算週期計（主流為 8 小時，Hyperliquid、Deribit、Kraken、Crypto.com 為 1 小時，單元格內已標註）。資料來源逐行標註：OKX、Hyperliquid 為官方介面直取，其餘為 CoinGecko 衍生品聚合（官方介面對機房與部分地域 IP 受限）。",
    colOi: "未平倉總額 (OI)",
    colFunding: "BTC 永續資金費率",
    colLs: "多空比",
    colSource: "資料來源",
    marginFail: "保證金資料暫時全部拉取失敗，資金流區塊不受影響。",
    unavailable: "暫不可用",
    sources: {
      okx: "OKX 官方介面",
      hyperliquid: "Hyperliquid 官方介面",
      coingecko: "CoinGecko 聚合",
    },
    caliberTitle: "03 · 口徑說明",
    caliberFlows: [
      "儲備與淨流入只覆蓋 DeFiLlama 已標記的交易所錢包地址：未標記地址、場外交易、內部錢包劃轉都不在統計內，因此淨流入不等於使用者淨申購/贖回，更不等於交易所的真實財務狀況。",
      "Coinbase、Kraken、Upbit 等交易所的錢包未被該資料集追蹤（無儲備資料），故不在總覽表內——不是它們沒有儲備，而是這套公開資料看不到。",
      "clean reserves 會剔除各所自家平臺幣（如 BNB、OKB、MNT），避免自家代幣價格波動汙染儲備口徑；展開明細裡的幣種構成與儲備走勢用同一口徑。",
    ],
    caliberMargin: [
      "OI 口徑：OKX 為其全部永續+交割合約 oiUsd 求和（官方），Hyperliquid 為全品種未平倉量 × 標記價格求和（官方），其餘各所為 CoinGecko 衍生品聚合的 open_interest_btc 按 BTC 現價換算美元——不同來源的統計範圍（是否含期權、交割合約）略有差異，跨所比較時留有餘地。",
      "資金費率為 BTC 永續當前一期費率（百分數）：正值表示多頭付空頭、負值相反；結算週期不同（8 小時 / 1 小時）時數值不可直接橫比，年化換算請自行按週期折算。",
      "多空比暫不提供數值：Binance、Bybit 的官方統計介面對機房與部分地域 IP 受限，OKX 對應的 rubik 多空比介面已經下線，免費公開源沒有可靠口徑——寧可空著，不編數字。",
      "資金流資料快取約 1 小時、保證金約 10 分鐘；本頁所有數字都是鏈上與公開市場資料的整理，不構成投資建議。",
    ],
    toolsTitle: "交易所資金流 · 本類工具",
  },
};

export { DICT as FLOWS_DICT };

/* ---------- 格式化 ---------- */

function fmtUsd(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtFlow(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v === 0) return "$0";
  return (v > 0 ? "+" : "−") + fmtUsd(Math.abs(v)).replace("−", "");
}

function flowClass(v: number | null): string {
  if (v == null || v === 0) return "";
  return v > 0 ? "flows-in" : "flows-out";
}

function fmtFunding(pct: number | null, period: "8h" | "1h" | null): string {
  if (pct == null || !Number.isFinite(pct)) return "—";
  const s = `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(4)}%`;
  return period ? `${s} /${period}` : s;
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

/* ---------- 明细展开 ---------- */

function Sparkline({
  points,
}: {
  points: { date: string; reservesUsd: number }[];
}) {
  if (points.length < 2) return null;
  const vals = points.map((p) => p.reservesUsd);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const W = 260;
  const H = 56;
  const step = W / (points.length - 1);
  const coords = points
    .map(
      (p, i) =>
        `${(i * step).toFixed(1)},${(H - 4 - ((p.reservesUsd - min) / span) * (H - 8)).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      className="flows-spark"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline points={coords} fill="none" />
    </svg>
  );
}

type DetailState =
  | { status: "loading" }
  | { status: "ok"; detail: CexDetail }
  | { status: "error" };

function DetailPanel({
  slug,
  state,
  lang,
}: {
  slug: string;
  state: DetailState | undefined;
  lang: Lang;
}) {
  const d = DICT[lang];
  if (!state || state.status === "loading") {
    return <p className="body-text">{d.detailLoading}</p>;
  }
  if (state.status === "error") {
    return <p className="body-text">{d.detailFail}</p>;
  }
  const det = state.detail;
  const bc = det.balanceChange;
  return (
    <div className="flows-detail" data-slug={slug}>
      <h4 className="flows-detail-title">
        {d.detailTokensTitle.replace("{name}", det.name)}
      </h4>
      {det.ownToken && (
        <p className="body-text flows-detail-note">
          {d.detailTokensNote.replace("{own}", det.ownToken)}
        </p>
      )}
      <div className="flows-tokens">
        {det.tokens.map((tk) => (
          <span key={tk.symbol} className="flows-token-chip">
            <strong>{tk.symbol}</strong> {fmtUsd(tk.usd)} · {tk.pct.toFixed(1)}%
          </span>
        ))}
      </div>
      {det.series.length >= 2 && (
        <>
          <h4 className="flows-detail-title">{d.detailSeriesTitle}</h4>
          <Sparkline points={det.series} />
          <p className="body-text flows-detail-note">
            {det.series[0].date} → {det.series[det.series.length - 1].date} ·{" "}
            {fmtUsd(det.series[0].reservesUsd)} →{" "}
            {fmtUsd(det.series[det.series.length - 1].reservesUsd)}
          </p>
        </>
      )}
      <h4 className="flows-detail-title">{d.detailBalanceTitle}</h4>
      <p className="body-text">
        {d.bal24h} <span className={flowClass(bc.h24)}>{fmtFlow(bc.h24)}</span>
        {"  ·  "}
        {d.bal7d} <span className={flowClass(bc.d7)}>{fmtFlow(bc.d7)}</span>
        {"  ·  "}
        {d.bal30d} <span className={flowClass(bc.d30)}>{fmtFlow(bc.d30)}</span>
      </p>
      <p className="body-text flows-detail-note">{d.detailBalanceNote}</p>
    </div>
  );
}

/* ---------- 看板本体 ---------- */

export default function FlowsBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];

  const [data, setData] = useState<FlowsPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, DetailState>>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/flows")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: FlowsPayload) => {
        if (alive) setData(j);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggleRow = (slug: string) => {
    if (!slug) return;
    if (openSlug === slug) {
      setOpenSlug(null);
      return;
    }
    setOpenSlug(slug);
    if (!details[slug]) {
      setDetails((s) => ({ ...s, [slug]: { status: "loading" } }));
      fetch(`/api/flows?cex=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((j: CexDetailPayload) => {
          setDetails((s) => ({
            ...s,
            [slug]: j.detail
              ? { status: "ok", detail: j.detail }
              : { status: "error" },
          }));
        })
        .catch(() => {
          setDetails((s) => ({ ...s, [slug]: { status: "error" } }));
        });
    }
  };

  const flows = data?.flows ?? null;
  const margin = data?.margin ?? null;

  return (
    <section className="crcl-board">
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {data
            ? d.sourceLine.replace("{t}", fmtTime(data.fetchedAt, lang))
            : d.loading}
        </p>
      </div>

      {!data && !failed && <p className="body-text">{d.loading}</p>}
      {failed && <p className="body-text">{d.loadError}</p>}

      {data && (
        <>
          {/* 01 资金流总览 */}
          <h3 className="crcl-sec-title">{d.secFlows}</h3>
          <p className="body-text crcl-sec-intro">{d.flowsIntro}</p>
          {flows ? (
            <div className="burn-table-wrap">
              <table className="burn-table flows-table">
                <thead>
                  <tr>
                    <th>{d.colExchange}</th>
                    <th>{d.colReserves}</th>
                    <th>{d.colFlow24h}</th>
                    <th>{d.colFlow7d}</th>
                    <th>{d.colFlow30d}</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.rows.map((row) => (
                    <Fragment key={row.slug || row.name}>
                      <tr
                        className={row.slug ? "flows-row-clickable" : undefined}
                        onClick={() => toggleRow(row.slug)}
                      >
                        <td>
                          <strong>{row.name}</strong>
                          {row.slug && (
                            <span className="flows-expand-hint">
                              {openSlug === row.slug ? "▾" : "▸"} {d.expandHint}
                            </span>
                          )}
                        </td>
                        <td>{fmtUsd(row.reservesUsd)}</td>
                        <td className={flowClass(row.flow24h)}>
                          {fmtFlow(row.flow24h)}
                        </td>
                        <td className={flowClass(row.flow7d)}>
                          {fmtFlow(row.flow7d)}
                        </td>
                        <td className={flowClass(row.flow30d)}>
                          {fmtFlow(row.flow30d)}
                        </td>
                      </tr>
                      {openSlug === row.slug && row.slug && (
                        <tr className="flows-detail-row">
                          <td colSpan={5}>
                            <DetailPanel
                              slug={row.slug}
                              state={details[row.slug]}
                              lang={lang}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="body-text burn-note">{d.flowsFail}</p>
          )}

          {/* 02 保证金 */}
          <h3 className="crcl-sec-title">{d.secMargin}</h3>
          <p className="body-text crcl-sec-intro">{d.marginIntro}</p>
          {margin ? (
            <div className="burn-table-wrap">
              <table className="burn-table flows-table">
                <thead>
                  <tr>
                    <th>{d.colExchange}</th>
                    <th>{d.colOi}</th>
                    <th>{d.colFunding}</th>
                    <th>{d.colLs}</th>
                    <th>{d.colSource}</th>
                  </tr>
                </thead>
                <tbody>
                  {margin.map((row) => (
                    <tr key={row.name}>
                      <td>
                        <strong>{row.name}</strong>
                      </td>
                      <td>
                        {row.oiUsd != null ? fmtUsd(row.oiUsd) : d.unavailable}
                      </td>
                      <td>{fmtFunding(row.fundingPct, row.fundingPeriod)}</td>
                      <td>
                        {row.lsRatio != null ? row.lsRatio.toFixed(2) : "—"}
                      </td>
                      <td className="flows-source">{d.sources[row.source]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="body-text burn-note">{d.marginFail}</p>
          )}

          {/* 03 口径说明 */}
          <h3 className="crcl-sec-title">{d.caliberTitle}</h3>
          <div className="burn-notes">
            <div className="card">
              {d.caliberFlows.map((p, i) => (
                <p
                  className="body-text"
                  key={i}
                  style={i > 0 ? { marginTop: 10 } : undefined}
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="card">
              {d.caliberMargin.map((p, i) => (
                <p
                  className="body-text"
                  key={i}
                  style={i > 0 ? { marginTop: 10 } : undefined}
                >
                  {p}
                </p>
              ))}
              <p className="body-text" style={{ marginTop: 10 }}>
                {t.disclaimer}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
