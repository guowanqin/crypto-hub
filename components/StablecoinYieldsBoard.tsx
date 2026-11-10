"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  CONTROL_POOL_ID,
  fetchYieldsBoard,
  sortPools,
  type YieldPool,
  type YieldSortKey,
} from "@/lib/stablecoin-yields";

function fmtPct(v: number | null, digits = 2): string {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)}%`;
}

function fmtApy(v: number): string {
  return `${v.toFixed(2)}%`;
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
  symbolLabel: string;
  symbolAll: string;
  symbolOther: string;
  tvlLabel: string;
  tvl10: string;
  tvl50: string;
  tvl100: string;
  sortLabel: string;
  sortApy: string;
  sortMean30d: string;
  sortTvl: string;
  hideVolatile: string;
  refreshBtn: string;
  noteVolatile: string;
  loading: string;
  loadError: string;
  updatedAt: string;
  topLabel: string;
  steadyLabel: string;
  controlLabel: string;
  expandHint: string;
  tableTitle: string;
  colRank: string;
  colPool: string;
  colApy: string;
  colMean30d: string;
  colTvl: string;
  colStatus: string;
  statusOk: string;
  flagVolatile: string;
  missingNote: string;
  detailBase: string;
  detailReward: string;
  detailMean30d: string;
  detailChange7d: string;
  detailChange30d: string;
  detailTvl: string;
  detailChain: string;
  detailMeta: string;
  detailRisk: string;
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
    boardKicker: "稳定币收益榜 · 钱放哪收益最高",
    boardMeta: "数据取自 DefiLlama 免费接口 · 每天更新",
    symbolLabel: "币种",
    symbolAll: "全部",
    symbolOther: "其他",
    tvlLabel: "最低 TVL",
    tvl10: "$10M 以上",
    tvl50: "$50M 以上",
    tvl100: "$100M 以上",
    sortLabel: "排序",
    sortApy: "年化最高",
    sortMean30d: "30 日均值",
    sortTvl: "TVL 最大",
    hideVolatile: "只看稳健池（隐藏红标）",
    refreshBtn: "刷新数据",
    noteVolatile:
      "红标是高波动金库：收益主要来自做市或策略盈亏，不是固定利息，APY 波动大，先看风险再看数字。",
    loading: "正在取数…",
    loadError: "取数失败，请稍后刷新重试。",
    updatedAt: "更新于",
    topLabel: "今日最高年化",
    steadyLabel: "稳健池最高",
    controlLabel: "稳健对照 · Aave USDC",
    expandHint: "点任意一行展开该池详情（基础与奖励拆分、30 日均值、7 日与 30 日变化、TVL、链与备注）。",
    tableTitle: "收益榜",
    colRank: "排名",
    colPool: "池子",
    colApy: "年化",
    colMean30d: "30 日均值",
    colTvl: "TVL",
    colStatus: "状态",
    statusOk: "已取到",
    flagVolatile: "高波动",
    missingNote: "未取到，已排除：{names}。",
    detailBase: "基础年化",
    detailReward: "奖励年化",
    detailMean30d: "30 日平均年化",
    detailChange7d: "7 日变化",
    detailChange30d: "30 日变化",
    detailTvl: "TVL",
    detailChain: "链",
    detailMeta: "备注",
    detailRisk: "无常风险",
    detailLlama: "DefiLlama 池页",
    methodTitle: "榜单口径（全部公开）",
    methodBody:
      "榜单只含本站精选的 20 个主流稳定币池——按 DefiLlama 收益规模与 TVL 挑出的头部池子，TVL 全部在 $50M 以上；排名按当前年化。DefiLlama 全量榜有 15,716 个池子，全量接口一次返回约 10MB，不适合浏览器直接取数，所以由本站服务端按池子取回后裁剪下发；单个池子取不到时跳过并在榜下注明。APY 每天更新，缓存约 10 分钟。红标池是高波动金库，收益主要来自做市或策略盈亏，APY 波动大；勾选“只看稳健池”可以把它们隐藏。",
    honestTitle: "先把口径说清楚",
    honestBody:
      "APY 是年化收益率，不是固定利息：今天 25% 的池子，下个月可能只有 3%——HLP 的 30 日均值就只有 3.5% 左右，单看当天数字会误判。红标池收益高但波动大，借贷池收益低但稳；拿不准就对照 Aave USDC 那张卡片，那是全市场最稳健的参照之一。榜上数字不构成投资建议。",
    disclaimerTitle: "仅供参考，不构成投资建议",
    disclaimerBody:
      "本页数字来自 DefiLlama 免费接口的池子收益统计，只反映各池当天的年化水平，不代表某个池子明天还有这个收益，也不构成存入或取出指令。动手前请结合自己的判断与风险承受能力，尤其注意红标池的波动与锁定期。",
    sourcesTitle: "数据来源",
  },
  en: {
    boardKicker: "Stablecoin Yields Board · where parked stables earn most",
    boardMeta: "Data from DefiLlama's free API · updated daily",
    symbolLabel: "Stablecoin",
    symbolAll: "All",
    symbolOther: "Other",
    tvlLabel: "Min TVL",
    tvl10: "$10M+",
    tvl50: "$50M+",
    tvl100: "$100M+",
    sortLabel: "Sort by",
    sortApy: "Highest APY",
    sortMean30d: "30d mean",
    sortTvl: "Largest TVL",
    hideVolatile: "Steady pools only (hide red flags)",
    refreshBtn: "Refresh data",
    noteVolatile:
      "Red flags mark high-volatility vaults: yield comes mostly from market-making or strategy P&L, not fixed interest, so APY swings widely. Check the risk before the number.",
    loading: "Fetching data…",
    loadError: "Fetch failed — please refresh and retry in a moment.",
    updatedAt: "Updated",
    topLabel: "Today's highest APY",
    steadyLabel: "Highest steady pool",
    controlLabel: "Steady reference · Aave USDC",
    expandHint:
      "Tap any row to expand that pool's details (base vs reward split, 30d mean, 7d and 30d change, TVL, chain, notes).",
    tableTitle: "Yield ranking",
    colRank: "Rank",
    colPool: "Pool",
    colApy: "APY",
    colMean30d: "30d mean",
    colTvl: "TVL",
    colStatus: "Status",
    statusOk: "Fetched",
    flagVolatile: "Volatile",
    missingNote: "Missing — excluded: {names}.",
    detailBase: "Base APY",
    detailReward: "Reward APY",
    detailMean30d: "30d mean APY",
    detailChange7d: "7d change",
    detailChange30d: "30d change",
    detailTvl: "TVL",
    detailChain: "Chain",
    detailMeta: "Notes",
    detailRisk: "Impermanent-loss risk",
    detailLlama: "DefiLlama pool page",
    methodTitle: "How the board works (fully disclosed)",
    methodBody:
      "The board covers only 20 major stablecoin pools picked by this site — the largest by DefiLlama yield volume and TVL, all above $50M TVL. Ranking follows the current APY. DefiLlama's full list has 15,716 pools and its bulk endpoint returns about 10 MB in one response, which no browser should fetch directly, so this site's server fetches the list, keeps only the selected pools and serves the trimmed data; any pool that fails to load is skipped and named below the table. APY updates daily and is cached for about 10 minutes. Red-flagged pools are high-volatility vaults whose yield comes mostly from market-making or strategy P&L, so APY swings widely; tick “Steady pools only” to hide them.",
    honestTitle: "Read this first",
    honestBody:
      "APY is an annualised yield, not fixed interest: a pool at 25% today can be near 3% next month — HLP's 30-day mean is only about 3.5%, so a single day's figure misleads. Red-flagged pools pay more but swing more; lending pools pay less but stay steadier. When unsure, check the Aave USDC card — one of the steadiest references in the market. Nothing here is investment advice.",
    disclaimerTitle: "For reference only — not investment advice",
    disclaimerBody:
      "Figures on this page come from DefiLlama's free API and only show each pool's APY today. They say nothing about what any pool will pay tomorrow, and they are not an instruction to deposit or withdraw. Use your own judgement and risk tolerance before acting — and mind the volatility and lock-up of red-flagged pools in particular.",
    sourcesTitle: "Data sources",
  },
  tw: {
    boardKicker: "穩定幣收益榜 · 錢放哪收益最高",
    boardMeta: "資料取自 DefiLlama 免費介面 · 每天更新",
    symbolLabel: "幣種",
    symbolAll: "全部",
    symbolOther: "其他",
    tvlLabel: "最低 TVL",
    tvl10: "$10M 以上",
    tvl50: "$50M 以上",
    tvl100: "$100M 以上",
    sortLabel: "排序",
    sortApy: "年化最高",
    sortMean30d: "30 日均值",
    sortTvl: "TVL 最大",
    hideVolatile: "只看穩健池（隱藏紅標）",
    refreshBtn: "重新整理資料",
    noteVolatile:
      "紅標是高波動金庫：收益主要來自做市或策略盈虧，不是固定利息，APY 波動大，先看風險再看數字。",
    loading: "正在取數…",
    loadError: "取數失敗，請稍後重新整理重試。",
    updatedAt: "更新於",
    topLabel: "今日最高年化",
    steadyLabel: "穩健池最高",
    controlLabel: "穩健對照 · Aave USDC",
    expandHint: "點任意一行展開該池詳情（基礎與獎勵拆分、30 日均值、7 日與 30 日變化、TVL、鏈與備註）。",
    tableTitle: "收益榜",
    colRank: "排名",
    colPool: "池子",
    colApy: "年化",
    colMean30d: "30 日均值",
    colTvl: "TVL",
    colStatus: "狀態",
    statusOk: "已取到",
    flagVolatile: "高波動",
    missingNote: "未取到，已排除：{names}。",
    detailBase: "基礎年化",
    detailReward: "獎勵年化",
    detailMean30d: "30 日平均年化",
    detailChange7d: "7 日變化",
    detailChange30d: "30 日變化",
    detailTvl: "TVL",
    detailChain: "鏈",
    detailMeta: "備註",
    detailRisk: "無常風險",
    detailLlama: "DefiLlama 池頁",
    methodTitle: "榜單口徑（全部公開）",
    methodBody:
      "榜單只含本站精選的 20 個主流穩定幣池——按 DefiLlama 收益規模與 TVL 挑出的頭部池子，TVL 全部在 $50M 以上；排名按當前年化。DefiLlama 全量榜有 15,716 個池子，全量介面一次返回約 10MB，不適合瀏覽器直接取數，所以由本站伺服器端按池子取回後裁剪下發；單個池子取不到時跳過並在榜下註明。APY 每天更新，快取約 10 分鐘。紅標池是高波動金庫，收益主要來自做市或策略盈虧，APY 波動大；勾選「只看穩健池」可以把它們隱藏。",
    honestTitle: "先把口徑說清楚",
    honestBody:
      "APY 是年化收益率，不是固定利息：今天 25% 的池子，下個月可能只有 3%——HLP 的 30 日均值就只有 3.5% 左右，單看當天數字會誤判。紅標池收益高但波動大，借貸池收益低但穩；拿不準就對照 Aave USDC 那張卡片，那是全市場最穩健的參照之一。榜上數字不構成投資建議。",
    disclaimerTitle: "僅供參考，不構成投資建議",
    disclaimerBody:
      "本頁數字來自 DefiLlama 免費介面的池子收益統計，只反映各池當天的年化水準，不代表某個池子明天還有這個收益，也不構成存入或取出指令。動手前請結合自己的判斷與風險承受能力，尤其注意紅標池的波動與鎖定期。",
    sourcesTitle: "資料來源",
  },
};

const MAIN_SYMBOLS = ["USDC", "USDT", "DAI", "USDS"];

export default function StablecoinYieldsBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [symbol, setSymbol] = useState("all");
  const [minTvl, setMinTvl] = useState(50_000_000);
  const [sortKey, setSortKey] = useState<YieldSortKey>("apy");
  const [hideVolatile, setHideVolatile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<YieldPool[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    fetchYieldsBoard()
      .then(({ rows: r, missing: m, loadFailed: f }) => {
        if (cancelled) return;
        setRows(r);
        setMissing(m);
        setLoading(false);
        if (f || r.length === 0) {
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
  }, [refreshKey]);

  const filtered = useMemo(() => {
    let out = rows;
    if (symbol !== "all") {
      out = out.filter((r) =>
        symbol === "other" ? !MAIN_SYMBOLS.includes(r.symbol) : r.symbol === symbol
      );
    }
    out = out.filter((r) => r.tvlUsd >= minTvl);
    if (hideVolatile) out = out.filter((r) => !r.volatile);
    return sortPools(out, sortKey);
  }, [rows, symbol, minTvl, hideVolatile, sortKey]);

  const top = rows.length > 0 ? [...rows].sort((a, b) => b.apy - a.apy)[0] : null;
  const steadiest = useMemo(() => {
    const steady = rows.filter((r) => !r.volatile);
    if (steady.length === 0) return null;
    return [...steady].sort((a, b) => b.apy - a.apy)[0];
  }, [rows]);
  const control = useMemo(
    () => rows.find((r) => r.id === CONTROL_POOL_ID) ?? null,
    [rows]
  );

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMeta}
          {updatedAt ? ` · ${d.updatedAt} ${fmtTime(updatedAt)}` : ""}
        </p>
      </div>

      {/* 控制区：币种 / 最低 TVL / 排序 / 隐藏高波动 / 刷新 */}
      <div className="mood-controls">
        <label>
          {d.symbolLabel}
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            <option value="all">{d.symbolAll}</option>
            {MAIN_SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="other">{d.symbolOther}</option>
          </select>
        </label>
        <label>
          {d.tvlLabel}
          <select value={minTvl} onChange={(e) => setMinTvl(Number(e.target.value))}>
            <option value={10_000_000}>{d.tvl10}</option>
            <option value={50_000_000}>{d.tvl50}</option>
            <option value={100_000_000}>{d.tvl100}</option>
          </select>
        </label>
        <label>
          {d.sortLabel}
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as YieldSortKey)}>
            <option value="apy">{d.sortApy}</option>
            <option value="apyMean30d">{d.sortMean30d}</option>
            <option value="tvlUsd">{d.sortTvl}</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <input
            type="checkbox"
            checked={hideVolatile}
            onChange={(e) => setHideVolatile(e.target.checked)}
          />
          {d.hideVolatile}
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
        {d.noteVolatile}
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
              <p className="cycle-card-label">{d.topLabel}</p>
              {top && (
                <div className="cycle-position-row">
                  <span className="cycle-position" style={{ fontSize: 32 }}>
                    {top.label}
                  </span>
                  <span className="body-text">{fmtApy(top.apy)}</span>
                </div>
              )}
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.steadyLabel}</p>
              {steadiest ? (
                <div className="cycle-position-row">
                  <span className="cycle-position" style={{ fontSize: 32 }}>
                    {steadiest.label}
                  </span>
                  <span className="body-text">{fmtApy(steadiest.apy)}</span>
                </div>
              ) : (
                <p className="burn-note">—</p>
              )}
            </div>
            <div className="cycle-card">
              <p className="cycle-card-label">{d.controlLabel}</p>
              {control ? (
                <div className="cycle-position-row">
                  <span className="cycle-position" style={{ fontSize: 32 }}>
                    {fmtApy(control.apy)}
                  </span>
                  <span className="body-text">
                    {control.symbol} · {control.chain}
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
                  <th>{d.colPool}</th>
                  <th>{d.colApy}</th>
                  <th>{d.colMean30d}</th>
                  <th>{d.colTvl}</th>
                  <th>{d.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const open = expanded === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr
                        onClick={() => setExpanded(open ? null : r.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{i + 1}</td>
                        <td>
                          <strong>{r.label}</strong>
                          {r.volatile && (
                            <span
                              style={{
                                color: "var(--red)",
                                border: "1px solid var(--red)",
                                borderRadius: 4,
                                padding: "0 4px",
                                marginLeft: 6,
                                fontSize: 12,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {d.flagVolatile}
                            </span>
                          )}
                          <br />
                          <span style={{ color: "var(--muted)", fontSize: 13 }}>
                            {r.symbol} · {r.chain} · {r.kind[lang]}
                          </span>
                        </td>
                        <td
                          style={{
                            color: r.volatile ? "var(--red)" : undefined,
                            fontWeight: r.volatile ? 700 : undefined,
                          }}
                        >
                          {fmtApy(r.apy)}
                        </td>
                        <td>{r.apyMean30d !== null ? fmtApy(r.apyMean30d) : "—"}</td>
                        <td>{fmtUsd(r.tvlUsd)}</td>
                        <td>{d.statusOk}</td>
                      </tr>
                      {open && (
                        <tr key={`${r.id}-detail`}>
                          <td colSpan={6}>
                            <div className="table-wrap">
                              <table>
                                <tbody>
                                  <tr>
                                    <td>{d.detailBase}</td>
                                    <td>{r.apyBase !== null ? fmtApy(r.apyBase) : "—"}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailReward}</td>
                                    <td>{r.apyReward !== null ? fmtApy(r.apyReward) : "—"}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailMean30d}</td>
                                    <td>{r.apyMean30d !== null ? fmtApy(r.apyMean30d) : "—"}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailChange7d}</td>
                                    <td>{fmtPct(r.apyPct7D)}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailChange30d}</td>
                                    <td>{fmtPct(r.apyPct30D)}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailTvl}</td>
                                    <td>{fmtUsd(r.tvlUsd)}</td>
                                  </tr>
                                  <tr>
                                    <td>{d.detailChain}</td>
                                    <td>{r.chain}</td>
                                  </tr>
                                  {r.poolMeta && (
                                    <tr>
                                      <td>{d.detailMeta}</td>
                                      <td>{r.poolMeta}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td>{d.detailRisk}</td>
                                    <td>{r.ilRisk ? r.ilRisk : "—"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <p className="body-text">
                              <a
                                href={`https://defillama.com/yields/pool/${r.id}`}
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
        <a href="https://defillama.com/yields" target="_blank" rel="noopener noreferrer">
          defillama.com/yields
        </a>
        {" · "}
        <a href="https://api-docs.defillama.com" target="_blank" rel="noopener noreferrer">
          api-docs.defillama.com
        </a>
      </p>
    </section>
  );
}
