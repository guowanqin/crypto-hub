"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChainDauPayload, ChainDauRow } from "@/lib/chaindau";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {t} 取数时间
    loading: string;
    loadError: string;
    secBoard: string;
    boardIntro: string;
    statTopLabel: string;
    statTopSub: string; // {n} 原始地址数
    statTotalLabel: string;
    statTotalSub: string; // {n} 有日活数据的链条数
    statPerCapLabel: string;
    statPerCapSub: string; // {tvl} {dau}
    searchPlaceholder: string;
    colRank: string;
    colChain: string;
    colDau: string;
    colChange7d: string;
    colTvl: string;
    colPerCap: string;
    sortHint: string;
    showAll: string; // {n}
    showTop: string;
    noMatch: string;
    caliberTitle: string;
    caliber: string[];
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "公链日活 · 每日活跃地址排行",
    sourceLine: "数据来源：DeFiLlama（日活与 TVL）· 取数 {t}",
    loading: "正在拉取各链日活与 TVL 数据…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    secBoard: "01 · 公链日活排行",
    boardIntro:
      "一天之内真有人在用的链，从多到少排一排。日活是过去 24 小时在链上发起交易的去重地址数；人均锁仓 = 该链 TVL ÷ 24h 日活，看的是每个活跃地址背后垫了多少钱。默认显示前 20 名，可搜索链名、点列头换排序。",
    statTopLabel: "今日日活第一",
    statTopSub: "24h 活跃地址 {n} 个",
    statTotalLabel: "全榜 24h 日活合计",
    statTotalSub: "共 {n} 条链有日活数据（跨链重复计算同一人）",
    statPerCapLabel: "人均锁仓最高（日活 ≥10 万的链）",
    statPerCapSub: "TVL {tvl} · 日活 {dau}",
    searchPlaceholder: "搜链名，如 BSC / 波场 / Solana…",
    colRank: "#",
    colChain: "公链",
    colDau: "24h 日活",
    colChange7d: "日活 7 日变化",
    colTvl: "TVL",
    colPerCap: "人均锁仓",
    sortHint: "点击按此列排序",
    showAll: "显示全部 {n} 条",
    showTop: "只看前 20 名",
    noMatch: "没有匹配的链。",
    caliberTitle: "02 · 口径说明",
    caliber: [
      "数据来源：DeFiLlama 的 active-users 指标（与其官网 /chains 页同管线）。「日活」指过去 24 小时内在该链上发起交易的去重地址数：主流链（Ethereum、BSC、Tron、Arbitrum、Polygon、Base 等）由 Allium 索引原始交易表按发送地址去重统计，Solana 数交易签名者，比特币系（Bitcoin、Litecoin、Doge 等）用 CoinMetrics 的活跃地址口径，个别链用其浏览器官方统计——是大方向一致的全量活跃地址口径，但逐链数据源不同、细节有别，跨链严丝合缝对比并不存在。",
      "地址 ≠ 真人：一个人可以有很多地址，机器人、女巫地址、交易所热钱包都算在活跃地址里；跨链合计时同一个人会被重复计算。所以日活看的是「链上真实使用强度」，不是注册用户数。",
      "为什么没有「7 日活跃地址」列：DeFiLlama 源数据不提供 7 日 / 30 日的去重活跃地址总数（其 /chains 页的同名列目前同样为空），逐日曲线的口径又与 24h 总数对不上，本站不拿口径不同的数硬拼。本页的 7 日维度只给源里真实存在的「日活较 7 天前的变化率」。",
      "人均锁仓 = TVL ÷ 24h 日活。TVL 是 DeFiLlama 统计的该链 DeFi 协议锁仓总额；这个比值只是资金密度参考——TVL 里有大量不活跃的沉淀资金，日活里也有大量小额地址，它不等于「每个用户平均持有多少钱」，更不等于链的质量排名。",
      "覆盖范围：只收录 DeFiLlama 已统计日活的链。Robinhood Chain（罗宾汉链）有 TVL 记录（约 $10.9 亿）但其日活尚未被该数据集统计，故不在榜内；个别小链有日活、无 TVL 记录，人均锁仓显示为 —。",
      "与海报类榜单（如 Artemis 等其他口径）数值不同是正常的：统计源、地址归集方式与时间窗都不同。本页数据缓存约 1 小时后自动刷新；链上数据整理仅供参考，不构成投资建议。",
    ],
    toolsTitle: "公链日活 · 本类工具",
  },
  en: {
    boardKicker: "Chain Activity · Daily Active Addresses Ranking",
    sourceLine: "Source: DeFiLlama (active users & TVL) · fetched {t}",
    loading: "Fetching per-chain activity and TVL data…",
    loadError: "Data failed to load for now — please refresh later.",
    secBoard: "01 · Chain Daily-Activity Ranking",
    boardIntro:
      "The chains people actually used in the last day, ranked most to fewest. Daily active users (DAU) counts the unique addresses that sent a transaction on a chain in the past 24 hours; TVL per active address = the chain's TVL ÷ its 24h DAU — how much money sits behind each active address. Top 20 by default; search by chain name or click a column header to re-sort.",
    statTopLabel: "Today's #1 by DAU",
    statTopSub: "{n} active addresses in 24h",
    statTotalLabel: "Combined 24h DAU, all ranked chains",
    statTotalSub: "{n} chains have activity data (the same person counts once per chain)",
    statPerCapLabel: "Highest TVL per active address (DAU ≥ 100k)",
    statPerCapSub: "TVL {tvl} · DAU {dau}",
    searchPlaceholder: "Search chains, e.g. BSC / Tron / Solana…",
    colRank: "#",
    colChain: "Chain",
    colDau: "24h DAU",
    colChange7d: "DAU 7d Change",
    colTvl: "TVL",
    colPerCap: "TVL / Active Addr",
    sortHint: "Click to sort by this column",
    showAll: "Show all {n}",
    showTop: "Top 20 only",
    noMatch: "No matching chain.",
    caliberTitle: "02 · Methodology & Caveats",
    caliber: [
      "Source: DeFiLlama's active-users metric (the same pipeline as its /chains page). DAU is the number of unique addresses that sent a transaction on the chain in the past 24 hours: for major chains (Ethereum, BSC, Tron, Arbitrum, Polygon, Base…) Allium indexes the raw transaction tables and counts distinct senders; Solana counts distinct signers; Bitcoin-family chains (Bitcoin, Litecoin, Doge…) use CoinMetrics' active-address metric; a few chains use their explorer's official stats. The direction is consistent — all active addresses, not just users of tracked protocols — but the underlying source differs per chain, so cross-chain comparisons are approximate.",
      "An address is not a person: one person can control many addresses, and bots, sybils and exchange hot wallets all count as active. Cross-chain totals double-count the same person. DAU measures real on-chain usage intensity, not registered users.",
      "Why there is no '7-day active addresses' column: DeFiLlama publishes no deduplicated 7d/30d active-address totals (the same columns on its own /chains page are currently empty), and its daily chart series uses a caliber that does not reconcile with the 24h totals, so we do not stitch mismatched numbers together. The only 7-day dimension shown is the one the source actually provides: how the 24h DAU changed versus 7 days ago.",
      "TVL per active address = TVL ÷ 24h DAU, where TVL is DeFiLlama's total value locked in the chain's DeFi protocols. It is a capital-density reference only — much of the TVL is dormant and many active addresses are tiny — it is not 'the average user's balance', and not a chain-quality ranking.",
      "Coverage: only chains whose activity DeFiLlama tracks. Robinhood Chain has a TVL record (~$1.09B) but its active users are not yet covered by this dataset, so it is absent; a few small chains have DAU but no TVL record, shown as —.",
      "Different posters and leaderboards (e.g. Artemis-caliber rankings) will show different numbers — different sources, address attribution and time windows. Data is cached for about an hour. A compilation of public on-chain data, not investment advice.",
    ],
    toolsTitle: "Chain Activity · Tools in this shelf",
  },
};

export { DICT as CHAINDAU_DICT };

type SortKey = "dau24h" | "change7d" | "tvlUsd" | "perCapitaUsd";

function fmtDau(v: number, lang: Lang): string {
  if (lang === "zh") {
    if (v >= 10000) {
      const w = v / 10000;
      return `${w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, "")}万`;
    }
    return v.toLocaleString("en-US");
  }
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

function fmtUsdBig(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPerCap(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `≈$${Math.round(v).toLocaleString("en-US")}`;
}

function fmtChange(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
}

function changeClass(v: number | null): string {
  if (v == null || v === 0) return "";
  return v > 0 ? "flows-in" : "flows-out";
}

function fmtTime(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
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

function chainLabel(row: ChainDauRow, lang: Lang): string {
  if (lang === "zh") return row.nameZh ?? row.name;
  return row.name;
}

export default function ChainDauBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<ChainDauPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dau24h");
  const [sortDesc, setSortDesc] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/chain-dau")
      .then((r) => r.json())
      .then((j: ChainDauPayload) => {
        if (!alive) return;
        if (j.board && j.board.rows.length > 0) setData(j);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => data?.board?.rows ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.nameZh ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDesc ? bv - av : av - bv;
    });
    return arr;
  }, [filtered, sortKey, sortDesc]);

  const searching = query.trim().length > 0;
  const visible = searching || showAll ? sorted : sorted.slice(0, 20);

  const stats = useMemo(() => {
    if (rows.length === 0) return null;
    const top = rows[0];
    const total = rows.reduce((s, r) => s + r.dau24h, 0);
    const perCapTop =
      rows
        .filter((r) => r.dau24h >= 100_000 && r.perCapitaUsd != null)
        .sort((a, b) => (b.perCapitaUsd ?? 0) - (a.perCapitaUsd ?? 0))[0] ??
      null;
    return { top, total, perCapTop };
  }, [rows]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDesc((v) => !v);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sortMark = (key: SortKey) =>
    sortKey === key ? (sortDesc ? " ↓" : " ↑") : "";

  const thSort = (key: SortKey, label: string) => (
    <th
      className="chaindau-th-sort"
      title={d.sortHint}
      onClick={() => onSort(key)}
    >
      {label}
      {sortMark(key)}
    </th>
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

      {data?.board && stats && (
        <>
          <h3 className="crcl-sec-title">{d.secBoard}</h3>
          <p className="body-text crcl-sec-intro">{d.boardIntro}</p>

          <div className="burn-grid crcl-stats">
            <div className="burn-stat burn-stat-hero">
              <p className="burn-stat-label">{d.statTopLabel}</p>
              <p className="burn-stat-value">
                {chainLabel(stats.top, lang)}{" "}
                {fmtDau(stats.top.dau24h, lang)}
                {lang === "zh" ? "" : ""}
              </p>
              <p className="burn-stat-sub">
                {d.statTopSub.replace(
                  "{n}",
                  stats.top.dau24h.toLocaleString("en-US"),
                )}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.statTotalLabel}</p>
              <p className="burn-stat-value">{fmtDau(stats.total, lang)}</p>
              <p className="burn-stat-sub">
                {d.statTotalSub.replace("{n}", String(rows.length))}
              </p>
            </div>
            {stats.perCapTop && (
              <div className="burn-stat">
                <p className="burn-stat-label">{d.statPerCapLabel}</p>
                <p className="burn-stat-value">
                  {chainLabel(stats.perCapTop, lang)}{" "}
                  {fmtPerCap(stats.perCapTop.perCapitaUsd)}
                </p>
                <p className="burn-stat-sub">
                  {d.statPerCapSub
                    .replace("{tvl}", fmtUsdBig(stats.perCapTop.tvlUsd))
                    .replace(
                      "{dau}",
                      stats.perCapTop.dau24h.toLocaleString("en-US"),
                    )}
                </p>
              </div>
            )}
          </div>

          <div className="slang-search chaindau-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={d.searchPlaceholder}
              aria-label={d.searchPlaceholder}
            />
          </div>

          {visible.length === 0 ? (
            <p className="body-text">{d.noMatch}</p>
          ) : (
            <div className="burn-table-wrap">
              <table className="burn-table flows-table">
                <thead>
                  <tr>
                    <th>{d.colRank}</th>
                    <th>{d.colChain}</th>
                    {thSort("dau24h", d.colDau)}
                    {thSort("change7d", d.colChange7d)}
                    {thSort("tvlUsd", d.colTvl)}
                    {thSort("perCapitaUsd", d.colPerCap)}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.name}>
                      <td>{row.rank}</td>
                      <td>
                        {chainLabel(row, lang)}
                        {lang === "zh" && row.nameZh && row.nameZh !== row.name && (
                          <span className="flows-source"> {row.name}</span>
                        )}
                      </td>
                      <td title={row.dau24h.toLocaleString("en-US")}>
                        {fmtDau(row.dau24h, lang)}
                        {lang === "zh" ? "个地址" : ""}
                      </td>
                      <td className={changeClass(row.change7d)}>
                        {fmtChange(row.change7d)}
                      </td>
                      <td
                        title={
                          row.tvlUsd != null
                            ? `$${Math.round(row.tvlUsd).toLocaleString("en-US")}`
                            : undefined
                        }
                      >
                        {fmtUsdBig(row.tvlUsd)}
                      </td>
                      <td>{fmtPerCap(row.perCapitaUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!searching && sorted.length > 20 && (
            <p className="chaindau-showall">
              <button
                type="button"
                className="chaindau-showall-btn"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll
                  ? d.showTop
                  : d.showAll.replace("{n}", String(sorted.length))}
              </button>
            </p>
          )}

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
