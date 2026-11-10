"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  PROTOCOLS,
  fetchAllProtocolFees,
  sortRows,
  type CashflowMetric,
  type ProtocolFee,
  type SortKey,
} from "@/lib/cashflow";

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

function fmtTime(ms: number | null): string {
  if (!ms) return "—";
  const dt = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

interface BoardDict {
  boardKicker: string;
  boardMeta: string;
  metricLabel: string;
  metricFees: string;
  metricRevenue: string;
  sortLabel: string;
  sort24h: string;
  sort7d: string;
  sort30d: string;
  sortChange: string;
  refreshBtn: string;
  noteMetric: string;
  loading: string;
  loadError: string;
  updatedAt: string;
  totalLabel: string;
  topLabel: string;
  jumpLabel: string;
  expandHint: string;
  tableTitle: string;
  colRank: string;
  colProtocol: string;
  col24h: string;
  colChange: string;
  col7d: string;
  col30d: string;
  colStatus: string;
  statusOk: string;
  statusMissing: string;
  missingNote: string;
  detail1y: string;
  detailAll: string;
  detailChart: string;
  detailSite: string;
  detailLlama: string;
  methodTitle: string;
  methodBody: string;
  honestTitle: string;
  honestBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  sourcesTitle: string;
}

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "每日加密现金流榜 · 谁在真正赚钱",
    boardMeta: "数据取自 DefiLlama 免费接口 · 每天更新",
    metricLabel: "指标",
    metricFees: "手续费",
    metricRevenue: "协议收入",
    sortLabel: "排序",
    sort24h: "24h 收入",
    sort7d: "7 日收入",
    sort30d: "30 日收入",
    sortChange: "日环比",
    refreshBtn: "刷新数据",
    noteMetric:
      "手续费是用户付的全部费用；协议收入是协议留下的部分（扣掉分给流动性提供者等的成本）。同一协议两数不同是正常的。",
    loading: "正在取数…",
    loadError: "取数失败，请稍后刷新重试。",
    updatedAt: "更新于",
    totalLabel: "榜单 10 协议 24h 合计",
    topLabel: "今日第一",
    jumpLabel: "日环比最大涨幅",
    expandHint: "点任意一行展开该协议详情（1 年、历史累计、近 30 日走势、官网）。",
    tableTitle: "收入榜",
    colRank: "排名",
    colProtocol: "协议",
    col24h: "24h",
    colChange: "日环比",
    col7d: "7 日",
    col30d: "30 日",
    colStatus: "状态",
    statusOk: "已取到",
    statusMissing: "未取到，已排除",
    missingNote: "未取到，已排除：{names}。",
    detail1y: "1 年",
    detailAll: "历史累计",
    detailChart: "近 30 日走势",
    detailSite: "官网",
    detailLlama: "DefiLlama 协议页",
    methodTitle: "榜单口径（全部公开）",
    methodBody:
      "榜单只含本站精选的 10 个主流协议——按 DefiLlama 手续费规模挑出的头部协议；排名按所选指标的 24 小时值。DefiLlama 全量榜有 3,164 个协议，全量接口一次返回约 31MB，不适合浏览器直接取数，所以本页按协议逐个取数、本地排名；单个协议取不到时跳过并在榜下注明。数字每天更新，缓存约 10 分钟。",
    honestTitle: "先把口径说清楚",
    honestBody:
      "榜上数字是协议收到的手续费与收入，不是持币人分到的现金流，更不是买卖信号：价格跌的时候收入也可能涨，反过来也一样。Metaplanet、Circle 这类上市公司不在榜内。个别协议某日收入可能接近零，对照 7 日与 30 日一起看更稳。",
    disclaimerTitle: "仅供参考，不构成投资建议",
    disclaimerBody:
      "本页数字来自 DefiLlama 免费接口的协议收入统计，只反映钱流向了谁的协议，不代表某个币会涨会跌，也不构成买卖指令。动手前请结合自己的判断与风险承受能力。",
    sourcesTitle: "数据来源",
  },
  en: {
    boardKicker: "Daily Crypto Cash-Flow Board · who is actually earning",
    boardMeta: "Data from DefiLlama's free API · updated daily",
    metricLabel: "Metric",
    metricFees: "Fees",
    metricRevenue: "Protocol revenue",
    sortLabel: "Sort by",
    sort24h: "24h total",
    sort7d: "7d total",
    sort30d: "30d total",
    sortChange: "Day-on-day",
    refreshBtn: "Refresh data",
    noteMetric:
      "Fees are everything users paid; protocol revenue is the share the protocol keeps after payouts to liquidity providers and others. The two figures differ for the same protocol — that is normal.",
    loading: "Fetching data…",
    loadError: "Fetch failed — please refresh and retry in a moment.",
    updatedAt: "Updated",
    totalLabel: "24h total, all 10 protocols",
    topLabel: "Today's No. 1",
    jumpLabel: "Biggest day-on-day jump",
    expandHint:
      "Tap any row to expand that protocol's details (1y, all-time total, last-30-day trend, official site).",
    tableTitle: "Revenue ranking",
    colRank: "Rank",
    colProtocol: "Protocol",
    col24h: "24h",
    colChange: "Day-on-day",
    col7d: "7d",
    col30d: "30d",
    colStatus: "Status",
    statusOk: "Fetched",
    statusMissing: "Missing — excluded",
    missingNote: "Missing — excluded: {names}.",
    detail1y: "1y",
    detailAll: "All-time total",
    detailChart: "Last 30 days",
    detailSite: "Official site",
    detailLlama: "DefiLlama protocol page",
    methodTitle: "How the board works (fully disclosed)",
    methodBody:
      "The board covers only 10 major protocols picked by this site — the largest by DefiLlama fee volume. Ranking follows the selected metric's 24-hour value. DefiLlama's full ranking lists 3,164 protocols and its bulk endpoint returns about 31 MB in one response, which no browser should fetch directly, so this page fetches each protocol one by one and ranks locally; any protocol that fails to load is skipped and named below the table. Figures update daily and are cached for about 10 minutes.",
    honestTitle: "Read this first",
    honestBody:
      "The figures are fees and revenue collected by the protocol — not cash paid to token holders, and not a trading signal. Revenue can rise while prices fall, and the other way round. Listed stocks such as Metaplanet and Circle are not in this board. A single protocol's daily figure can be close to zero on a given day — read it alongside the 7-day and 30-day totals.",
    disclaimerTitle: "For reference only — not investment advice",
    disclaimerBody:
      "Figures on this page come from DefiLlama's free API and count protocol revenue — they only show whose protocol the money flows to. They say nothing about whether any token will rise or fall, and they are not a buy or sell instruction. Use your own judgement and risk tolerance before acting.",
    sourcesTitle: "Data sources",
  },
  tw: {
    boardKicker: "每日加密現金流榜 · 誰在真正賺錢",
    boardMeta: "資料取自 DefiLlama 免費介面 · 每天更新",
    metricLabel: "指標",
    metricFees: "手續費",
    metricRevenue: "協議收入",
    sortLabel: "排序",
    sort24h: "24h 收入",
    sort7d: "7 日收入",
    sort30d: "30 日收入",
    sortChange: "日環比",
    refreshBtn: "重新整理資料",
    noteMetric:
      "手續費是使用者付的全部費用；協議收入是協議留下的部分（扣掉分給流動性提供者等的成本）。同一協議兩數不同是正常的。",
    loading: "正在取數…",
    loadError: "取數失敗，請稍後重新整理重試。",
    updatedAt: "更新於",
    totalLabel: "榜單 10 協議 24h 合計",
    topLabel: "今日第一",
    jumpLabel: "日環比最大漲幅",
    expandHint: "點任意一行展開該協議詳情（1 年、歷史累計、近 30 日走勢、官網）。",
    tableTitle: "收入榜",
    colRank: "排名",
    colProtocol: "協議",
    col24h: "24h",
    colChange: "日環比",
    col7d: "7 日",
    col30d: "30 日",
    colStatus: "狀態",
    statusOk: "已取到",
    statusMissing: "未取到，已排除",
    missingNote: "未取到，已排除：{names}。",
    detail1y: "1 年",
    detailAll: "歷史累計",
    detailChart: "近 30 日走勢",
    detailSite: "官網",
    detailLlama: "DefiLlama 協議頁",
    methodTitle: "榜單口徑（全部公開）",
    methodBody:
      "榜單只含本站精選的 10 個主流協議——按 DefiLlama 手續費規模挑出的頭部協議；排名按所選指標的 24 小時值。DefiLlama 全量榜有 3,164 個協議，全量介面一次返回約 31MB，不適合瀏覽器直接取數，所以本頁按協議逐個取數、本地排名；單個協議取不到時跳過並在榜下註明。數字每天更新，快取約 10 分鐘。",
    honestTitle: "先把口徑說清楚",
    honestBody:
      "榜上數字是協議收到的手續費與收入，不是持幣人分到的現金流，更不是買賣訊號：價格跌的時候收入也可能漲，反過來也一樣。Metaplanet、Circle 這類上市公司不在榜內。個別協議某日收入可能接近零，對照 7 日與 30 日一起看更穩。",
    disclaimerTitle: "僅供參考，不構成投資建議",
    disclaimerBody:
      "本頁數字來自 DefiLlama 免費介面的協議收入統計，只反映錢流向了誰的協議，不代表某個幣會漲會跌，也不構成買賣指令。動手前請結合自己的判斷與風險承受能力。",
    sourcesTitle: "資料來源",
  },
};

const KIND_MAP: Record<string, { zh: string; en: string; tw: string }> = Object.fromEntries(
  PROTOCOLS.map((p) => [p.slug, p.kind])
);

export default function CashflowBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [metric, setMetric] = useState<CashflowMetric>("fees");
  const [sortKey, setSortKey] = useState<SortKey>("total24h");
  const [refreshKey, setRefreshKey] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProtocolFee[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    fetchAllProtocolFees(metric)
      .then(({ rows: r, missing: m }) => {
        if (cancelled) return;
        setRows(r);
        setMissing(m);
        setLoading(false);
        if (r.length === 0) {
          // 全部取数失败：当作加载失败处理，不写“更新于”时间戳。
          setLoadFailed(true);
          return;
        }
        setUpdatedAt(Date.now());
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [metric, refreshKey]);

  const sorted = useMemo(() => sortRows(rows, sortKey), [rows, sortKey]);
  const total24h = useMemo(() => rows.reduce((a, r) => a + r.total24h, 0), [rows]);
  const top = rows.length > 0 ? rows[0] : null;
  const biggestJump = useMemo(() => {
    let best: ProtocolFee | null = null;
    for (const r of rows) {
      if (r.change1d === null) continue;
      if (!best || r.change1d > (best.change1d ?? -Infinity)) best = r;
    }
    return best;
  }, [rows]);

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMeta}
          {updatedAt ? ` · ${d.updatedAt} ${fmtTime(updatedAt)}` : ""}
        </p>
      </div>

      {/* 控制区：指标 / 排序 / 刷新 */}
      <div className="mood-controls">
        <label>
          {d.metricLabel}
          <select value={metric} onChange={(e) => setMetric(e.target.value as CashflowMetric)}>
            <option value="fees">{d.metricFees}</option>
            <option value="revenue">{d.metricRevenue}</option>
          </select>
        </label>
        <label>
          {d.sortLabel}
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="total24h">{d.sort24h}</option>
            <option value="total7d">{d.sort7d}</option>
            <option value="total30d">{d.sort30d}</option>
            <option value="change1d">{d.sortChange}</option>
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
      <p className="body-text" style={{ marginTop: 10 }}>
        {d.noteMetric}
      </p>

      {loading && <p className="burn-note">{d.loading}</p>}

      {!loading && loadFailed && rows.length === 0 && (
        <p className="burn-note">{d.loadError}</p>
      )}

      {!loading && missing.length > 0 && (
        <p className="burn-note" style={{ marginTop: 10 }}>
          {d.missingNote.replace("{names}", missing.join("、"))}
        </p>
      )}

      {!loading && rows.length > 0 && (
        <>
          <div className="cycle-grid" style={{ marginTop: 12 }}>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.totalLabel}</p>
              <div className="cycle-position-row">
                <span className="cycle-position" style={{ fontSize: 32 }}>
                  {fmtUsd(total24h)}
                </span>
              </div>
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.topLabel}</p>
              {top && (
                <div className="cycle-position-row">
                  <span className="cycle-position" style={{ fontSize: 32 }}>
                    {top.label}
                  </span>
                  <span className="body-text">{fmtUsd(top.total24h)}</span>
                </div>
              )}
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.jumpLabel}</p>
              {biggestJump && biggestJump.change1d !== null ? (
                <div className="cycle-position-row">
                  <span className="cycle-position" style={{ fontSize: 32 }}>
                    {biggestJump.label}
                  </span>
                  <span
                    className="body-text"
                    style={{ color: biggestJump.change1d >= 0 ? "var(--green)" : "var(--red)" }}
                  >
                    {fmtPct(biggestJump.change1d)}
                  </span>
                </div>
              ) : (
                <p className="burn-note">—</p>
              )}
            </div>
          </div>

          <h3 className="sub-title">{d.tableTitle}</h3>
          <p className="body-text">{d.expandHint}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{d.colRank}</th>
                  <th>{d.colProtocol}</th>
                  <th>{d.col24h}</th>
                  <th>{d.colChange}</th>
                  <th>{d.col7d}</th>
                  <th>{d.col30d}</th>
                  <th>{d.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => {
                  const kind = KIND_MAP[r.slug]?.[lang] ?? "";
                  const open = expanded === r.slug;
                  return (
                    <Fragment key={r.slug}>
                      <tr
                        onClick={() => setExpanded(open ? null : r.slug)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{i + 1}</td>
                        <td>
                          <strong>{r.label}</strong>
                          <br />
                          <span style={{ color: "var(--muted)", fontSize: 13 }}>{kind}</span>
                        </td>
                        <td>{fmtUsd(r.total24h)}</td>
                        <td
                          style={{
                            color:
                              r.change1d === null
                                ? undefined
                                : r.change1d >= 0
                                  ? "var(--green)"
                                  : "var(--red)",
                          }}
                        >
                          {r.change1d !== null ? fmtPct(r.change1d) : "—"}
                        </td>
                        <td>{fmtUsd(r.total7d)}</td>
                        <td>{fmtUsd(r.total30d)}</td>
                        <td>{d.statusOk}</td>
                      </tr>
                      {open && (
                        <tr key={`${r.slug}-detail`}>
                          <td colSpan={7}>
                            <div className="table-wrap">
                              <table>
                                <tbody>
                                  <tr>
                                    <td>{d.detail1y}</td>
                                    <td>{fmtUsd(r.total1y)}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailAll}</td>
                                    <td>{fmtUsd(r.totalAllTime)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            {r.chart.length > 1 && (
                              <>
                                <div style={{ marginTop: 10 }}>
                                  <Sparkline
                                    values={r.chart.map((p) => p.v)}
                                    stroke="#8a6d1f"
                                  />
                                </div>
                                <p className="body-text">{d.detailChart}</p>
                              </>
                            )}
                            <p className="body-text">
                              {r.url && (
                                <>
                                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                                    {d.detailSite}
                                  </a>
                                  {" · "}
                                </>
                              )}
                              <a
                                href={`https://defillama.com/protocol/${r.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {d.detailLlama}
                              </a>
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 方法区与口径说明 */}
      <h3 className="sub-title">{d.methodTitle}</h3>
      <p className="body-text">{d.methodBody}</p>

      <h3 className="sub-title">{d.honestTitle}</h3>
      <p className="body-text">{d.honestBody}</p>

      <h3 className="sub-title">{d.disclaimerTitle}</h3>
      <p className="body-text">{d.disclaimerBody}</p>

      <h3 className="sub-title">{d.sourcesTitle}</h3>
      <p className="body-text">
        DefiLlama ·{" "}
        <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">
          defillama.com
        </a>
        {" · "}
        <a href="https://api-docs.defillama.com" target="_blank" rel="noopener noreferrer">
          api-docs.defillama.com
        </a>
      </p>
    </section>
  );
}
