"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/site";
import { LIVENESS_LABELS, RISK_LABELS } from "@/lib/slang";
import type {
  SlangAbbr,
  SlangCategory,
  SlangEntry,
  SlangStatus,
} from "@/lib/slang";
import { useLang } from "./LangProvider";

export const SLANG_DICT: Record<
  Lang,
  {
    toolsTitle: string;
    statsLine: (e: number, v: number, c: number) => string;
    syncedAt: string;
    staleNote: string;
    loadError: string;
    retry: string;
    searchPlaceholder: string;
    searchBtn: string;
    catAll: string;
    statusAll: string;
    resultCount: (n: number) => string;
    pageInfo: (p: number, t: number) => string;
    prev: string;
    next: string;
    noResults: string;
    loading: string;
    variantsLabel: string;
    explainLabel: string;
    sellerLabel: string;
    buyerLabel: string;
    trendLabel: string;
    successorLabel: string;
    abbrTitle: string;
    abbrSub: string;
    abbrPlaceholder: string;
    abbrBtn: string;
    abbrCuratedTitle: string;
    abbrEntriesTitle: string;
    abbrNone: string;
    abbrIdle: string;
    matchedVariants: string;
    aboutTitle: string;
    aboutParas: string[];
    sourceLine: string;
    repoLink: string;
  }
> = {
  zh: {
    toolsTitle: "二手黑话 · 本类工具",
    statsLine: (e, v, c) => `已同步 ${e} 个主题词条 · ${v.toLocaleString()} 个黑话变体 · ${c} 个分类`,
    syncedAt: "词库同步于",
    staleNote: "（上游暂时不可达，当前展示上次同步的缓存）",
    loadError: "词库数据暂时拉不到，请稍后重试。",
    retry: "重试",
    searchPlaceholder: "搜黑话、标准名或含义，如：矿渣、全绿、克劳格…",
    searchBtn: "查词典",
    catAll: "全部分类",
    statusAll: "全部状态",
    resultCount: (n) => `共 ${n} 条`,
    pageInfo: (p, t) => `第 ${p} / ${t} 页`,
    prev: "上一页",
    next: "下一页",
    noResults: "没查到匹配的词条，换个关键词或清掉筛选试试。",
    loading: "正在查词典…",
    variantsLabel: "常见变体",
    explainLabel: "百科释义",
    sellerLabel: "卖家潜台词",
    buyerLabel: "买家避坑",
    trendLabel: "当前动态",
    successorLabel: "接棒新词",
    abbrTitle: "拼音首字母缩写反查",
    abbrSub:
      "二手平台上很多暗号就是一串字母：输入缩写（如 cld、ga、xd），反查它在闲鱼/转转上通常指什么、属于哪个词条。",
    abbrPlaceholder: "输入字母缩写，如 cld",
    abbrBtn: "反查",
    abbrCuratedTitle: "缩写速查表命中",
    abbrEntriesTitle: "变体里带这个暗号的词条",
    abbrNone: "这个缩写暂时没查到。可能还没被收录，或者它不是字母型暗号——可以用上面的全文搜索试试中文变体。",
    abbrIdle: "输入缩写后点「反查」。",
    matchedVariants: "命中的变体",
    aboutTitle: "这本词典的定位与边界",
    aboutParas: [
      "这是一本给买家的解码词典：看懂卖家标题里的黑话、谐音和错别字，识破成色注水、仿品冒充、脱离平台交易等常见套路，少当韭菜。词条里的「卖家潜台词」是帮你听懂话术，不是教你说黑话。",
      "本站不提供把正常文案转成黑话的「卖家排雷转译」，上游数据里给卖家的规避建议字段本站也不展示——躲平台风控、卖仿品和灰产服务的那套玩法，不在本站的服务范围里。",
    ],
    sourceLine:
      "数据来源：GitHub 开源仓库 Domainsun/awesome-chinese-secondhand-slang（MIT License），本站服务端每日自动同步上游词库，分类统计与缩写表由同步程序从上游数据派生；词条原文版权归上游项目与贡献者所有。",
    repoLink: "上游开源仓库 →",
  },
  en: {
    toolsTitle: "Secondhand Slang · Tools in this shelf",
    statsLine: (e, v, c) =>
      `${e} topic entries synced · ${v.toLocaleString()} slang variants · ${c} categories`,
    syncedAt: "Dictionary synced at",
    staleNote: "(upstream unreachable — showing the last synced cache)",
    loadError: "The dictionary data could not be loaded. Please retry shortly.",
    retry: "Retry",
    searchPlaceholder: "Search slang, standard names or meanings…",
    searchBtn: "Search",
    catAll: "All categories",
    statusAll: "All statuses",
    resultCount: (n) => `${n} entries`,
    pageInfo: (p, t) => `Page ${p} / ${t}`,
    prev: "Prev",
    next: "Next",
    noResults: "No matching entries. Try another keyword or clear the filters.",
    loading: "Searching the dictionary…",
    variantsLabel: "Common variants",
    explainLabel: "What it means",
    sellerLabel: "What the seller really means",
    buyerLabel: "Buyer beware",
    trendLabel: "Current status",
    successorLabel: "Successor slang",
    abbrTitle: "Pinyin-initial abbreviation lookup",
    abbrSub:
      "Plenty of platform slang is just a string of letters. Type an abbreviation (e.g. cld, ga, xd) to look up what it usually means on Xianyu/Zhuanzhuan and which entries use it.",
    abbrPlaceholder: "Type letters, e.g. cld",
    abbrBtn: "Look up",
    abbrCuratedTitle: "Quick-table hits",
    abbrEntriesTitle: "Entries whose variants carry this code",
    abbrNone:
      "Nothing found for that abbreviation yet — it may not be collected, or it may not be a letter code. Try the full-text search above with the Chinese variant instead.",
    abbrIdle: "Type an abbreviation and hit Look up.",
    matchedVariants: "Matched variants",
    aboutTitle: "What this dictionary is — and is not",
    aboutParas: [
      "This is a buyer's decoding dictionary: understand the slang, homophones and deliberate typos in seller listings, and spot the usual tricks — inflated condition grades, counterfeits passed off as genuine, pressure to deal off-platform. The 'what the seller really means' field helps you read the pitch; it is not there to teach you to speak the slang.",
      "This site does not offer a seller-side 'translate my listing into evasion slang' tool, and the upstream dataset's advice-for-sellers field is deliberately not shown here. Dodging platform moderation to sell counterfeits or grey-market services is out of scope for this site.",
    ],
    sourceLine:
      "Data source: the open-source GitHub repository Domainsun/awesome-chinese-secondhand-slang (MIT License). Our server syncs the upstream dictionary daily; category stats and the abbreviation table are derived from the upstream data at sync time. Entry texts remain the property of the upstream project and its contributors.",
    repoLink: "Upstream repository →",
  },
};

interface MetaResp {
  ok: boolean;
  stale?: boolean;
  fetchedAt?: string;
  stats?: { entries: number; variants: number; categories: number; platforms: string[] };
  categories?: SlangCategory[];
  statuses?: SlangStatus[];
}
interface SearchResp {
  ok: boolean;
  total: number;
  page: number;
  pageSize: number;
  items: SlangEntry[];
}
interface AbbrResp {
  ok: boolean;
  curated: SlangAbbr[];
  entries: { entry: SlangEntry; matchedVariants: string[] }[];
}

const REPO_URL = "https://github.com/Domainsun/awesome-chinese-secondhand-slang";

function EntryCard({
  e,
  lang,
  catLabel,
}: {
  e: SlangEntry;
  lang: Lang;
  catLabel: string;
}) {
  const d = SLANG_DICT[lang];
  return (
    <article className="slang-card">
      <div className="slang-card-head">
        <h3 className="slang-card-name">{e.standardName}</h3>
        <div className="slang-badges">
          <span className={`slang-badge slang-live-${e.liveness}`}>
            ● {LIVENESS_LABELS[e.liveness][lang]}
          </span>
          <span className={`slang-badge slang-risk-${e.riskLevel}`}>
            {RISK_LABELS[e.riskLevel][lang]}
          </span>
        </div>
      </div>
      <p className="slang-card-meta">
        <span>{catLabel}</span>
        {e.platforms.length > 0 && <span> · {e.platforms.join(" / ")}</span>}
      </p>
      {e.slangVariants.length > 0 && (
        <div className="slang-block">
          <p className="slang-block-label">
            {d.variantsLabel}（{e.slangVariants.length}）
          </p>
          <div className="slang-variants">
            {e.slangVariants.map((v) => (
              <span className="slang-variant" key={v}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
      {e.explanation && (
        <div className="slang-block">
          <p className="slang-block-label">{d.explainLabel}</p>
          <p className="slang-block-text">{e.explanation}</p>
        </div>
      )}
      {e.sellerIntent && (
        <div className="slang-block">
          <p className="slang-block-label">{d.sellerLabel}</p>
          <p className="slang-block-text">{e.sellerIntent}</p>
        </div>
      )}
      {e.buyerAdvice && (
        <div className="slang-block slang-buyer">
          <p className="slang-block-label">{d.buyerLabel}</p>
          <p className="slang-block-text">{e.buyerAdvice}</p>
        </div>
      )}
      {e.activeTrend && (
        <div className="slang-block">
          <p className="slang-block-label">{d.trendLabel}</p>
          <p className="slang-block-text">{e.activeTrend}</p>
        </div>
      )}
      {e.successorSlang.length > 0 && (
        <div className="slang-block">
          <p className="slang-block-label">{d.successorLabel}</p>
          <div className="slang-variants">
            {e.successorSlang.map((v) => (
              <span className="slang-variant" key={v}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function SlangDict() {
  const { lang } = useLang();
  const d = SLANG_DICT[lang];

  const [meta, setMeta] = useState<MetaResp | null>(null);
  const [metaError, setMetaError] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<SearchResp | null>(null);
  const [searching, setSearching] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const [abbrQ, setAbbrQ] = useState("");
  const [abbr, setAbbr] = useState<AbbrResp | null>(null);
  const [abbrSearched, setAbbrSearched] = useState(false);
  const [abbrLoading, setAbbrLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/slang?mode=meta")
      .then((r) => r.json())
      .then((j: MetaResp) => {
        if (cancelled) return;
        if (j.ok) setMeta(j);
        else setMetaError(true);
      })
      .catch(() => !cancelled && setMetaError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const runSearch = useCallback(() => {
    setSearching(true);
    const params = new URLSearchParams({
      mode: "search",
      q: debouncedQ,
      cat,
      status,
      page: String(page),
    });
    fetch(`/api/slang?${params}`)
      .then((r) => r.json())
      .then((j: SearchResp) => {
        if (j.ok) setSearch(j);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debouncedQ, cat, status, page]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const catLabelOf = useCallback(
    (id: string) =>
      meta?.categories?.find((c) => c.id === id)?.name[lang] ?? id,
    [meta, lang]
  );

  const runAbbr = useCallback(() => {
    const query = abbrQ.trim();
    if (!query) return;
    setAbbrLoading(true);
    fetch(`/api/slang?mode=abbr&q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((j: AbbrResp) => {
        if (j.ok) setAbbr(j);
        setAbbrSearched(true);
      })
      .catch(() => setAbbrSearched(true))
      .finally(() => setAbbrLoading(false));
  }, [abbrQ]);

  const totalPages = search ? Math.max(1, Math.ceil(search.total / search.pageSize)) : 1;

  return (
    <div className="slang-tool">
      {/* 统计行 */}
      {meta?.stats && (
        <p className="slang-stats">
          {d.statsLine(meta.stats.entries, meta.stats.variants, meta.stats.categories)}
          {meta.fetchedAt && (
            <>
              {" · "}
              {d.syncedAt} {meta.fetchedAt.slice(0, 10)}
              {meta.stale ? ` ${d.staleNote}` : ""}
            </>
          )}
        </p>
      )}
      {metaError && (
        <div className="card slang-error">
          <p className="body-text">{d.loadError}</p>
          <button
            type="button"
            className="slang-btn"
            onClick={() => {
              setMetaError(false);
              setReloadTick((n) => n + 1);
              runSearch();
            }}
          >
            {d.retry}
          </button>
        </div>
      )}

      {/* 搜索 */}
      <div className="slang-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.searchPlaceholder}
          aria-label={d.searchBtn}
        />
      </div>

      {/* 分类筛选 */}
      <div className="filter-row slang-chiprow" role="group" aria-label="Category filter">
        <button
          type="button"
          className={`filter-chip${cat === "" ? " on" : ""}`}
          onClick={() => {
            setCat("");
            setPage(1);
          }}
        >
          {d.catAll}
        </button>
        {(meta?.categories ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            className={`filter-chip${cat === c.id ? " on" : ""}`}
            onClick={() => {
              setCat(c.id);
              setPage(1);
            }}
          >
            {c.name[lang]} · {c.count}
          </button>
        ))}
      </div>

      {/* 状态筛选 */}
      <div className="filter-row slang-chiprow" role="group" aria-label="Status filter">
        <button
          type="button"
          className={`filter-chip${status === "" ? " on" : ""}`}
          onClick={() => {
            setStatus("");
            setPage(1);
          }}
        >
          {d.statusAll}
        </button>
        {(meta?.statuses ?? []).map((s) => (
          <button
            key={s.value}
            type="button"
            className={`filter-chip${status === s.value ? " on" : ""}`}
            onClick={() => {
              setStatus(s.value);
              setPage(1);
            }}
          >
            <span className={`slang-dot slang-live-${s.value}`}>●</span> {s.label[lang]} ·{" "}
            {s.count}
          </button>
        ))}
      </div>

      {/* 结果 */}
      <div>
        <p className="slang-result-meta">
          {search ? d.resultCount(search.total) : searching ? d.loading : ""}
        </p>
        {search && search.items.length === 0 && (
          <p className="empty-note">{d.noResults}</p>
        )}
        <div className="slang-list">
          {(search?.items ?? []).map((e) => (
            <EntryCard key={e.id} e={e} lang={lang} catLabel={catLabelOf(e.category)} />
          ))}
        </div>
        {search && search.total > search.pageSize && (
          <div className="slang-pager">
            <button
              type="button"
              className="slang-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {d.prev}
            </button>
            <span>{d.pageInfo(page, totalPages)}</span>
            <button
              type="button"
              className="slang-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {d.next}
            </button>
          </div>
        )}
      </div>

      {/* 拼音缩写反查 */}
      <section className="card slang-abbr">
        <h2>{d.abbrTitle}</h2>
        <p className="body-text">{d.abbrSub}</p>
        <div className="slang-search slang-abbr-search">
          <input
            type="text"
            value={abbrQ}
            onChange={(e) => setAbbrQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAbbr()}
            placeholder={d.abbrPlaceholder}
            aria-label={d.abbrBtn}
          />
          <button type="button" className="slang-btn" onClick={runAbbr} disabled={abbrLoading}>
            {d.abbrBtn}
          </button>
        </div>
        {!abbrSearched && <p className="empty-note">{d.abbrIdle}</p>}
        {abbrSearched && abbr && abbr.curated.length === 0 && abbr.entries.length === 0 && (
          <p className="empty-note">{d.abbrNone}</p>
        )}
        {abbr && abbr.curated.length > 0 && (
          <div className="slang-block">
            <p className="slang-block-label">{d.abbrCuratedTitle}</p>
            <div className="slang-abbr-rows">
              {abbr.curated.map((a) => (
                <p className="slang-abbr-row" key={a.abbr}>
                  <strong>{a.abbr}</strong>
                  <span>
                    {a.meaning} · {a.field}
                    {a.note ? ` · ${a.note}` : ""}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
        {abbr && abbr.entries.length > 0 && (
          <div className="slang-block">
            <p className="slang-block-label">{d.abbrEntriesTitle}</p>
            <div className="slang-abbr-rows">
              {abbr.entries.map(({ entry, matchedVariants }) => (
                <p className="slang-abbr-row" key={entry.id}>
                  <strong>{entry.standardName}</strong>
                  <span>
                    {d.matchedVariants}：{matchedVariants.join("、")}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 定位与边界 + 数据来源 */}
      <section className="card slang-about">
        <h2>{d.aboutTitle}</h2>
        {d.aboutParas.map((p, i) => (
          <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
            {p}
          </p>
        ))}
        <p className="body-text" style={{ marginTop: 10 }}>
          {d.sourceLine}{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            {d.repoLink}
          </a>
        </p>
      </section>
    </div>
  );
}
