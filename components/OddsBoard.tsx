"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  impliedMedian,
  type OddsAssetBoard,
  type OddsBoardData,
} from "@/lib/odds-board";

function fmtPrice(v: number | null, digits = 0): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function fmtProb(p: number): string {
  const pct = p * 100;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(2)}%`;
}

function fmtDist(strike: number, spot: number | null): string {
  if (spot === null || spot <= 0) return "—";
  const d = (strike / spot - 1) * 100;
  const sign = d > 0 ? "+" : d < 0 ? "−" : "";
  return `${sign}${Math.abs(d).toFixed(1)}%`;
}

function fmtVol(v: number): string {
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtTime(ms: number | null): string {
  if (!ms) return "—";
  const dt = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

/** 结算时间：本地时间月/日 时:分（事件按美东正午结算，页面注明口径）。 */
function fmtSettle(iso: string, lang: Lang): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "—";
  const p = (x: number) => String(x).padStart(2, "0");
  if (lang === "en") {
    return `${dt.getMonth() + 1}/${dt.getDate()} ${p(dt.getHours())}:${p(dt.getMinutes())} local`;
  }
  return `${dt.getMonth() + 1}月${dt.getDate()}日 ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

interface BoardDict {
  boardKicker: string;
  boardMeta: string;
  assetLabel: string;
  refreshBtn: string;
  loading: string;
  loadError: string;
  updatedAt: string;
  spotLabel: string;
  spotMissing: string;
  medianLabel: string;
  medianMissing: string;
  volumeLabel: string;
  settleLabel: string;
  settleNote: string;
  ladderTitle: string;
  ladderHint: string;
  colStrike: string;
  colProb: string;
  colDist: string;
  spotRowLabel: string;
  volumeTitle: string;
  colRank: string;
  colEvent: string;
  colVolume: string;
  volumeEmpty: string;
  methodTitle: string;
  methodBody: string;
  honestTitle: string;
  honestBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  sourcesTitle: string;
  sourcesBody: string;
}

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "预测市场赔率榜 · 市场在押注什么价位",
    boardMeta: "数据取自 Polymarket 公开免费接口 · 约 10 分钟更新",
    assetLabel: "币种",
    refreshBtn: "刷新数据",
    loading: "正在取数…",
    loadError: "取数失败：预测市场数据暂时拉不到，请稍后刷新重试。",
    updatedAt: "更新于",
    spotLabel: "现价",
    spotMissing: "现价未取到，本次不标现价位置",
    medianLabel: "隐含中位价位",
    medianMissing: "今日概率未跨过 50%，无中位价位",
    volumeLabel: "今日事件 24h 交易量",
    settleLabel: "结算时间",
    settleNote: "美东正午 12:00 · Binance 1 分钟收盘价",
    ladderTitle: "今日站上概率阶梯",
    ladderHint: "每一行是一个价位：今天结算时价格站上该价位的市场隐含概率。概率条越长，市场越确信；现价位置已在阶梯中标出。",
    colStrike: "价位",
    colProb: "站上概率",
    colDist: "距现价",
    spotRowLabel: "现价",
    volumeTitle: "预测市场 24h 交易量榜（crypto 类）",
    colRank: "排名",
    colEvent: "事件",
    colVolume: "24h 交易量",
    volumeEmpty: "交易量榜本次未取到，稍后刷新重试。",
    methodTitle: "榜单口径（全部公开）",
    methodBody: "数据源为 Polymarket 的 Gamma 公开接口（免费、免 key）。概率阶梯只收录每日 above/below 市场：以 Binance 对应币种 1 分钟 K 线在美东正午 12:00 的收盘价结算，站上价位记 Yes；每档概率取该档 Yes 的市场价格，即真金白银押注出的隐含概率。本页显示当前正在进行、最近一个结算点的 BTC 与 ETH 事件，本币种共 {levels} 档价位。交易量榜按接口返回的 24h 交易量排序，取 crypto 类前 10；同一事件的总交易量在不同接口间对不上，本页只写 24h 量。月度 reach 市场的概率疑似长时间未更新，本页不收录。",
    honestTitle: "先把口径说清楚",
    honestBody: "隐含概率是押注者用钱投票的结果，不是任何人的预测模型：它会随价格实时变动，也会受流动性与大户订单影响，临近结算时尤其跳得快。概率 70% 不等于一定会发生，30% 的事每天都在发生。现价来自 Binance 公开行情，与结算口径同一来源；现价取不到时本页只留空，不拿概率反推。",
    disclaimerTitle: "仅供参考，不构成投资建议",
    disclaimerBody: "本页只展示 Polymarket 的公开市场数据，不设交易入口、不提供下单链接。Polymarket 在部分国家和地区（包括美国）受到限制或禁止使用，请以当地规则为准。本页内容不构成任何买卖建议。",
    sourcesTitle: "数据来源",
    sourcesBody: "Polymarket Gamma API（gamma-api.polymarket.com）· Binance 公开行情（data-api.binance.vision）· CoinGecko（现价备用源）",
  },
  en: {
    boardKicker: "Prediction Market Odds Board · What the market is betting on",
    boardMeta: "Data from Polymarket's public free API · updated about every 10 minutes",
    assetLabel: "Asset",
    refreshBtn: "Refresh",
    loading: "Loading…",
    loadError: "Failed to load: prediction-market data is temporarily unavailable. Please refresh and try again.",
    updatedAt: "Updated",
    spotLabel: "Spot price",
    spotMissing: "Spot price unavailable; position not marked this time",
    medianLabel: "Implied median",
    medianMissing: "Today's odds never cross 50%, so there is no median",
    volumeLabel: "Today's event 24h volume",
    settleLabel: "Settlement",
    settleNote: "12:00 noon ET · Binance 1-minute close",
    ladderTitle: "Today's above-price odds ladder",
    ladderHint: "Each row is a price level: the market-implied probability that the settlement price closes above it today. Longer bars mean a more confident market; the current spot price is marked inside the ladder.",
    colStrike: "Level",
    colProb: "Prob. above",
    colDist: "Vs spot",
    spotRowLabel: "Spot",
    volumeTitle: "Prediction markets by 24h volume (crypto)",
    colRank: "Rank",
    colEvent: "Event",
    colVolume: "24h volume",
    volumeEmpty: "The volume board did not load this time. Please refresh.",
    methodTitle: "How this board works (fully disclosed)",
    methodBody: "Data comes from Polymarket's Gamma public API (free, no key). The ladder uses only the daily above/below markets: they settle on the Binance 1-minute candle closing at 12:00 noon ET, with Yes if the price is above the level; each rung's probability is that rung's Yes market price — the implied probability backed by real money. This page shows the currently running BTC and ETH events at the nearest settlement, with {levels} rungs for this asset. The volume board ranks crypto events by the API's 24h volume, top 10; total volume for the same event differs between endpoints, so only the 24h figure is shown. Monthly reach markets look stale and are not included.",
    honestTitle: "Read the odds for what they are",
    honestBody: "An implied probability is money voting, not anyone's forecasting model: it moves with price in real time, is swayed by liquidity and large orders, and jumps fastest near settlement. 70% does not mean it will happen, and 30% chances happen every day. Spot prices come from Binance's public feed — the same source the markets settle on; if spot cannot be fetched it is left blank, never reverse-engineered from the odds.",
    disclaimerTitle: "For reference only — not investment advice",
    disclaimerBody: "This page only displays Polymarket's public market data. It has no trading entry and no order links. Polymarket is restricted or unavailable in some countries and regions (including the United States); follow your local rules. Nothing here is a recommendation to buy or sell.",
    sourcesTitle: "Sources",
    sourcesBody: "Polymarket Gamma API (gamma-api.polymarket.com) · Binance public quotes (data-api.binance.vision) · CoinGecko (spot fallback)",
  },
  tw: {
    boardKicker: "預測市場賠率榜 · 市場在押注什麼價位",
    boardMeta: "資料取自 Polymarket 公開免費介面 · 約 10 分鐘更新",
    assetLabel: "幣種",
    refreshBtn: "重新整理資料",
    loading: "正在取數…",
    loadError: "取數失敗：預測市場資料暫時拉不到，請稍後重新整理重試。",
    updatedAt: "更新於",
    spotLabel: "現價",
    spotMissing: "現價未取到，本次不標現價位置",
    medianLabel: "隱含中位價位",
    medianMissing: "今日機率未跨過 50%，無中位價位",
    volumeLabel: "今日事件 24h 交易量",
    settleLabel: "結算時間",
    settleNote: "美東正午 12:00 · Binance 1 分鐘收盤價",
    ladderTitle: "今日站上機率階梯",
    ladderHint: "每一行是一個價位：今天結算時價格站上該價位的市場隱含機率。機率條越長，市場越確信；現價位置已在階梯中標出。",
    colStrike: "價位",
    colProb: "站上機率",
    colDist: "距現價",
    spotRowLabel: "現價",
    volumeTitle: "預測市場 24h 交易量榜（crypto 類）",
    colRank: "排名",
    colEvent: "事件",
    colVolume: "24h 交易量",
    volumeEmpty: "交易量榜本次未取到，稍後重新整理重試。",
    methodTitle: "榜單口徑（全部公開）",
    methodBody: "資料來源為 Polymarket 的 Gamma 公開介面（免費、免 key）。機率階梯只收錄每日 above/below 市場：以 Binance 對應幣種 1 分鐘 K 線在美東正午 12:00 的收盤價結算，站上價位記 Yes；每檔機率取該檔 Yes 的市場價格，即真金白銀押注出的隱含機率。本頁顯示當前正在進行、最近一個結算點的 BTC 與 ETH 事件，本幣種共 {levels} 檔價位。交易量榜按介面返回的 24h 交易量排序，取 crypto 類前 10；同一事件的總交易量在不同介面間對不上，本頁只寫 24h 量。月度 reach 市場的機率疑似長時間未更新，本頁不收錄。",
    honestTitle: "先把口徑說清楚",
    honestBody: "隱含機率是押注者用錢投票的結果，不是任何人的預測模型：它會隨價格實時變動，也會受流動性與大戶訂單影響，臨近結算時尤其跳得快。機率 70% 不等於一定會發生，30% 的事每天都在發生。現價來自 Binance 公開行情，與結算口徑同一來源；現價取不到時本頁只留空，不拿機率反推。",
    disclaimerTitle: "僅供參考，不構成投資建議",
    disclaimerBody: "本頁只展示 Polymarket 的公開市場資料，不設交易入口、不提供下單連結。Polymarket 在部分國家和地區（包括美國）受到限制或禁止使用，請以當地規則為準。本頁內容不構成任何買賣建議。",
    sourcesTitle: "資料來源",
    sourcesBody: "Polymarket Gamma API（gamma-api.polymarket.com）· Binance 公開行情（data-api.binance.vision）· CoinGecko（現價備用源）",
  },
};

export default function OddsBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<OddsBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [asset, setAsset] = useState<"BTC" | "ETH">("BTC");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch("/api/odds-board")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as OddsBoardData;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const board: OddsAssetBoard | null = data ? (asset === "BTC" ? data.btc : data.eth) : null;

  const median = useMemo(() => (board ? impliedMedian(board.levels) : null), [board]);

  // 阶梯按价位从高到低渲染；现价分隔行插在现价上下两档之间。
  const ladderRows = useMemo(() => {
    if (!board) return [] as { strike: number; prob: number }[];
    return [...board.levels].sort((a, b) => b.strike - a.strike);
  }, [board]);

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMeta}
          {data ? ` · ${d.updatedAt} ${fmtTime(data.fetchedAt)}` : ""}
        </p>
      </div>

      <div className="mood-controls">
        <label>
          {d.assetLabel}
          <select value={asset} onChange={(e) => setAsset(e.target.value as "BTC" | "ETH")}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </label>
        <button
          type="button"
          className="btn primary"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          {d.refreshBtn}
        </button>
      </div>

      {loading && <p className="burn-note">{d.loading}</p>}

      {!loading && failed && <p className="burn-note">{d.loadError}</p>}

      {!loading && !failed && board && (
        <>
          <div className="cycle-grid" style={{ marginTop: 12 }}>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.spotLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 32 }}>
                  {board.spot !== null ? fmtPrice(board.spot) : "—"}
                </span>
              </div>
              {board.spot === null && <p className="body-text">{d.spotMissing}</p>}
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.medianLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 32 }}>
                  {median !== null ? fmtPrice(Math.round(median)) : "—"}
                </span>
              </div>
              {median === null && <p className="body-text">{d.medianMissing}</p>}
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.volumeLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 32 }}>
                  {fmtVol(board.volume24hr)}
                </span>
              </div>
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.settleLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 22 }}>
                  {fmtSettle(board.endDate, lang)}
                </span>
              </div>
              <p className="body-text">{d.settleNote}</p>
            </div>
          </div>

          <h3 className="sub-title">{d.ladderTitle}</h3>
          <p className="body-text">{d.ladderHint}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{d.colStrike}</th>
                  <th style={{ minWidth: 180 }}>{d.colProb}</th>
                  <th>{d.colDist}</th>
                </tr>
              </thead>
              <tbody>
                {ladderRows.map((r, i) => {
                  const spot = board.spot;
                  const showSpotRow =
                    spot !== null &&
                    r.strike < spot &&
                    (i === 0 || ladderRows[i - 1].strike >= spot);
                  const showSpotRowAtEnd =
                    spot !== null &&
                    i === ladderRows.length - 1 &&
                    r.strike >= spot;
                  return (
                    <Fragment key={r.strike}>
                      {showSpotRow && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              background: "var(--gold-dim)",
                              color: "var(--gold-strong)",
                              fontWeight: 700,
                            }}
                          >
                            {d.spotRowLabel} {fmtPrice(spot)} ↓
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <strong>{fmtPrice(r.strike)}</strong>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                flex: "0 0 45%",
                                background: "var(--panel-soft)",
                                border: "1px solid var(--border)",
                                borderRadius: 4,
                                height: 12,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.max(0.5, r.prob * 100)}%`,
                                  background: "var(--gold)",
                                  height: "100%",
                                }}
                              />
                            </div>
                            <span>{fmtProb(r.prob)}</span>
                          </div>
                        </td>
                        <td>{fmtDist(r.strike, spot)}</td>
                      </tr>
                      {showSpotRowAtEnd && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              background: "var(--gold-dim)",
                              color: "var(--gold-strong)",
                              fontWeight: 700,
                            }}
                          >
                            {d.spotRowLabel} {fmtPrice(spot)} ↑
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3 className="sub-title">{d.volumeTitle}</h3>
          {data && data.volumeTop.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{d.colRank}</th>
                    <th>{d.colEvent}</th>
                    <th>{d.colVolume}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.volumeTop.map((e, i) => (
                    <tr key={e.slug}>
                      <td>{i + 1}</td>
                      <td>{e.title}</td>
                      <td>{fmtVol(e.volume24hr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="burn-note">{d.volumeEmpty}</p>
          )}
        </>
      )}

      {/* 方法区与口径说明 */}
      <h3 className="sub-title">{d.methodTitle}</h3>
      <p className="body-text">
        {d.methodBody.replace("{levels}", board ? String(board.levels.length) : "—")}
      </p>

      <h3 className="sub-title">{d.honestTitle}</h3>
      <p className="body-text">{d.honestBody}</p>

      <h3 className="sub-title">{d.disclaimerTitle}</h3>
      <p className="body-text">{d.disclaimerBody}</p>

      <h3 className="sub-title">{d.sourcesTitle}</h3>
      <p className="body-text">{d.sourcesBody}</p>
    </section>
  );
}
