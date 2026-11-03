"use client";

// 出海营销技能库工具本体：技能目录（搜索 + 分组筛选）→ 站内阅读器
// （技能正文 + 参考文档，正文经 /api/marketing-skills 按需取）→
// 中英对照术语表（搜索 + 分级展开）→ 出海新手 100 问（搜索 + 分级展开）。
// 内容为上游开源文档原文（CC BY-NC 4.0），按 AGENTS.md 第 8 节数据原文
// 不转换：界面语言 zh/tw 显示中文版正文、en 显示英文版正文，
// 参考文档一律上游原文（多为英文）。

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { HUB_DICT } from "@/lib/i18n";
import type {
  MshSkillDir,
  MshGlossaryTerm,
  MshFaqItem,
} from "@/lib/marketing-skills";
import { useLang } from "./LangProvider";
import MarkdownLite from "./MarkdownLite";

interface Dict {
  searchSkills: string;
  searchGlossary: string;
  searchFaq: string;
  groupAll: string;
  groups: Record<string, string>;
  skillsHeading: string;
  glossaryHeading: string;
  faqHeading: string;
  refsHeading: string;
  mainDoc: string;
  back: string;
  read: string;
  refsCount: string;
  skillsCount: string;
  termsCount: string;
  faqCount: string;
  noResults: string;
  loading: string;
  loadError: string;
  retry: string;
  refOriginalNote: string;
  hitBody: string;
  hitRef: string;
  faqHint: string;
}

const DICT: Record<Lang, Dict> = {
  zh: {
    searchSkills: "搜技能、正文、参考文档…",
    searchGlossary: "搜术语：如 CPM、保本 ROAS、冷邮件…",
    searchFaq: "搜问题：如 选品、封号、关税、收款…",
    groupAll: "全部",
    groups: {
      strategy: "战略规划",
      ads: "广告投放",
      creative: "内容创意",
      optimization: "优化复盘",
      outreach: "邮件外联",
      social: "私域与社媒",
    },
    skillsHeading: "技能目录",
    glossaryHeading: "中英对照术语表",
    faqHeading: "出海新手 100 问",
    refsHeading: "参考文档",
    mainDoc: "技能正文",
    back: "返回目录",
    read: "站内阅读",
    refsCount: "{n} 篇参考文档",
    skillsCount: "{n} 个技能",
    termsCount: "{n} 条术语",
    faqCount: "{n} 个问题",
    noResults: "没有找到相关内容，换个关键词试试。",
    loading: "加载中…",
    loadError: "正文加载失败，请重试。",
    retry: "重试",
    refOriginalNote: "参考文档为上游原文，未做翻译",
    hitBody: "正文命中",
    hitRef: "参考文档命中",
    faqHint: "点击展开回答",
  },
  en: {
    searchSkills: "Search skills, full texts, reference docs…",
    searchGlossary: "Search terms: CPM, break-even ROAS…",
    searchFaq: "Search questions: product choice, bans, tariffs…",
    groupAll: "All",
    groups: {
      strategy: "Strategy",
      ads: "Paid Ads",
      creative: "Creative",
      optimization: "Optimization",
      outreach: "Outreach",
      social: "Private & Social",
    },
    skillsHeading: "Skill Directory",
    glossaryHeading: "Bilingual Glossary",
    faqHeading: "Beginner FAQ — 100 Questions",
    refsHeading: "Reference Docs",
    mainDoc: "Skill Text",
    back: "Back to directory",
    read: "Read on-site",
    refsCount: "{n} reference docs",
    skillsCount: "{n} skills",
    termsCount: "{n} terms",
    faqCount: "{n} questions",
    noResults: "Nothing matched — try another keyword.",
    loading: "Loading…",
    loadError: "Failed to load the text. Please retry.",
    retry: "Retry",
    refOriginalNote: "Reference docs are shown in their original language",
    hitBody: "Match in text",
    hitRef: "Match in references",
    faqHint: "Click to expand the answer",
  },
  tw: {
    searchSkills: "搜技能、正文、參考文件…",
    searchGlossary: "搜術語：如 CPM、保本 ROAS、冷郵件…",
    searchFaq: "搜問題：如 選品、封號、關稅、收款…",
    groupAll: "全部",
    groups: {
      strategy: "戰略規劃",
      ads: "廣告投放",
      creative: "內容創意",
      optimization: "最佳化覆盤",
      outreach: "郵件外聯",
      social: "私域與社媒",
    },
    skillsHeading: "技能目錄",
    glossaryHeading: "中英對照術語表",
    faqHeading: "出海新手 100 問",
    refsHeading: "參考文件",
    mainDoc: "技能正文",
    back: "返回目錄",
    read: "站內閱讀",
    refsCount: "{n} 篇參考文件",
    skillsCount: "{n} 個技能",
    termsCount: "{n} 條術語",
    faqCount: "{n} 個問題",
    noResults: "沒有找到相關內容，換個關鍵詞試試。",
    loading: "載入中…",
    loadError: "正文載入失敗，請重試。",
    retry: "重試",
    refOriginalNote: "參考文件為上游原文，未做翻譯",
    hitBody: "正文命中",
    hitRef: "參考文件命中",
    faqHint: "點選展開回答",
  },
};

const PAGE = 12;

interface SearchHit {
  id: string;
  inBody: boolean;
  refFiles: string[];
}

interface DocState {
  title: string;
  body: string;
  lang: "en" | "zh";
}

interface Props {
  directory: MshSkillDir[];
  glossary: MshGlossaryTerm[];
  faq: MshFaqItem[];
}

export default function MarketingSkillsBoard({ directory, glossary, faq }: Props) {
  const { lang } = useLang();
  const d = DICT[lang];
  const hub = HUB_DICT[lang];
  const bodyLang: "en" | "zh" = lang === "en" ? "en" : "zh";

  // —— 技能目录：搜索 + 分组 ——
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [hits, setHits] = useState<Map<string, SearchHit> | null>(null);
  const searchSeq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits(null);
      return;
    }
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/marketing-skills?mode=search&q=${encodeURIComponent(q)}`
        );
        const json = await res.json();
        if (seq !== searchSeq.current) return;
        if (json.ok) {
          setHits(new Map(json.hits.map((h: SearchHit) => [h.id, h])));
        }
      } catch {
        /* 搜索失败时保留上一次结果 */
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const shownSkills = useMemo(
    () =>
      directory.filter(
        (s) =>
          (group === "all" || s.group === group) &&
          (hits === null || hits.has(s.id))
      ),
    [directory, group, hits]
  );

  // —— 阅读器 ——
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<string>("main");
  const [docCache, setDocCache] = useState<Map<string, DocState>>(new Map());
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(false);
  const openSkill = directory.find((s) => s.id === openSkillId) ?? null;
  const docKey = openSkill ? `${openSkill.id}|${openDoc}|${bodyLang}` : "";
  const doc = docCache.get(docKey) ?? null;

  useEffect(() => {
    if (!openSkill || docCache.has(docKey)) return;
    let cancelled = false;
    setDocLoading(true);
    setDocError(false);
    fetch(
      `/api/marketing-skills?mode=doc&skill=${encodeURIComponent(
        openSkill.id
      )}&doc=${encodeURIComponent(openDoc)}&lang=${bodyLang}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setDocCache((prev) =>
            new Map(prev).set(docKey, {
              title: json.title,
              body: json.body,
              lang: json.lang,
            })
          );
        } else {
          setDocError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDocError(true);
      })
      .finally(() => {
        if (!cancelled) setDocLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSkillId, openDoc, bodyLang]);

  const openReference = (file: string) => {
    if (openSkill && openSkill.references.some((r) => r.file === file)) {
      setOpenDoc(file);
      return;
    }
    const owner = directory.find((s) =>
      s.references.some((r) => r.file === file)
    );
    if (owner) {
      setOpenSkillId(owner.id);
      setOpenDoc(file);
    }
  };

  // —— 术语表：搜索 + 分级展开 ——
  const [gq, setGq] = useState("");
  const [gVisible, setGVisible] = useState(PAGE);
  useEffect(() => setGVisible(PAGE), [gq]);
  const shownTerms = useMemo(() => {
    const q = gq.trim().toLowerCase();
    if (!q) return glossary;
    return glossary.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.en.toLowerCase().includes(q) ||
        t.def.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [glossary, gq]);

  // —— 100 问：搜索 + 分级展开 ——
  const [fq, setFq] = useState("");
  const [fVisible, setFVisible] = useState(PAGE);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  useEffect(() => {
    setFVisible(PAGE);
    setExpandedFaq(null);
  }, [fq]);
  const shownFaq = useMemo(() => {
    const q = fq.trim().toLowerCase();
    if (!q) return faq;
    return faq.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [faq, fq]);

  const fmt = (tpl: string, n: number) => tpl.replace("{n}", String(n));

  return (
    <div className="msh">
      {/* ---------- 技能目录 / 阅读器 ---------- */}
      {!openSkill ? (
        <section>
          <h2 className="msh-section-title">{d.skillsHeading}</h2>
          <div className="msh-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={d.searchSkills}
              aria-label={d.skillsHeading}
            />
          </div>
          <div className="msh-chiprow">
            <button
              type="button"
              className={`filter-chip${group === "all" ? " on" : ""}`}
              onClick={() => setGroup("all")}
            >
              {d.groupAll}
            </button>
            {Object.entries(d.groups).map(([gid, label]) => (
              <button
                key={gid}
                type="button"
                className={`filter-chip${group === gid ? " on" : ""}`}
                onClick={() => setGroup(gid)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="msh-meta-line">{fmt(d.skillsCount, shownSkills.length)}</p>
          {shownSkills.length === 0 ? (
            <p className="msh-empty">{d.noResults}</p>
          ) : (
            <div className="msh-grid">
              {shownSkills.map((s) => {
                const hit = hits?.get(s.id);
                return (
                  <article key={s.id} className="msh-card">
                    <div className="msh-card-head">
                      <h3 className="msh-card-name">
                        {bodyLang === "en" ? s.name.en : s.name.zh}
                      </h3>
                      <span className="chip">{d.groups[s.group] ?? s.group}</span>
                    </div>
                    <p className="msh-card-summary">
                      {bodyLang === "en" ? s.summary.en : s.summary.zh}
                    </p>
                    <div className="msh-card-foot">
                      <span className="msh-card-refs">
                        {fmt(d.refsCount, s.references.length)}
                      </span>
                      {hit?.inBody && <span className="msh-hit">{d.hitBody}</span>}
                      {hit && hit.refFiles.length > 0 && (
                        <span className="msh-hit">{d.hitRef}</span>
                      )}
                      <button
                        type="button"
                        className="msh-read-btn"
                        onClick={() => {
                          setOpenSkillId(s.id);
                          setOpenDoc("main");
                        }}
                      >
                        {d.read} →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section>
          <button
            type="button"
            className="msh-back"
            onClick={() => setOpenSkillId(null)}
          >
            ← {d.back}
          </button>
          <h2 className="msh-section-title">
            {bodyLang === "en" ? openSkill.name.en : openSkill.name.zh}
          </h2>
          <div className="msh-doc-tabs">
            <button
              type="button"
              className={`filter-chip${openDoc === "main" ? " on" : ""}`}
              onClick={() => setOpenDoc("main")}
            >
              {d.mainDoc}
            </button>
            {openSkill.references.map((r) => (
              <button
                key={r.file}
                type="button"
                className={`filter-chip${openDoc === r.file ? " on" : ""}`}
                onClick={() => setOpenDoc(r.file)}
                title={r.file}
              >
                {r.title}
              </button>
            ))}
          </div>
          {openDoc !== "main" && (
            <p className="msh-meta-line">
              {openDoc} · {d.refOriginalNote}
            </p>
          )}
          {docLoading && !doc ? (
            <p className="msh-empty">{d.loading}</p>
          ) : docError && !doc ? (
            <p className="msh-empty">
              {d.loadError}{" "}
              <button
                type="button"
                className="msh-read-btn"
                onClick={() => setDocCache(new Map(docCache))}
              >
                {d.retry}
              </button>
            </p>
          ) : doc ? (
            <MarkdownLite md={doc.body} onOpenRef={openReference} />
          ) : null}
        </section>
      )}

      {/* ---------- 术语表 ---------- */}
      <section className="msh-section">
        <h2 className="msh-section-title">{d.glossaryHeading}</h2>
        <div className="msh-search">
          <input
            type="search"
            value={gq}
            onChange={(e) => setGq(e.target.value)}
            placeholder={d.searchGlossary}
            aria-label={d.glossaryHeading}
          />
        </div>
        <p className="msh-meta-line">{fmt(d.termsCount, shownTerms.length)}</p>
        {shownTerms.length === 0 ? (
          <p className="msh-empty">{d.noResults}</p>
        ) : (
          <>
            <ul className="msh-term-list">
              {shownTerms.slice(0, gVisible).map((t, i) => (
                <li key={`${t.term}-${i}`} className="msh-term">
                  <div className="msh-term-main">
                    <strong>{t.term}</strong>
                    <span className="msh-term-en">{t.en}</span>
                  </div>
                  <p className="msh-term-def">{t.def}</p>
                  <span className="msh-term-cat">{t.category}</span>
                </li>
              ))}
            </ul>
            {gVisible < shownTerms.length ? (
              <button
                type="button"
                className="filter-chip filter-chip-more group-expand-btn"
                onClick={() => setGVisible((v) => v + PAGE)}
              >
                {hub.showMoreRemaining.replace(
                  "{n}",
                  String(shownTerms.length - gVisible)
                )}
              </button>
            ) : (
              shownTerms.length > PAGE && (
                <button
                  type="button"
                  className="filter-chip filter-chip-more group-expand-btn"
                  onClick={() => setGVisible(PAGE)}
                >
                  {hub.hideTools}
                </button>
              )
            )}
          </>
        )}
      </section>

      {/* ---------- 100 问 ---------- */}
      <section className="msh-section">
        <h2 className="msh-section-title">{d.faqHeading}</h2>
        <div className="msh-search">
          <input
            type="search"
            value={fq}
            onChange={(e) => setFq(e.target.value)}
            placeholder={d.searchFaq}
            aria-label={d.faqHeading}
          />
        </div>
        <p className="msh-meta-line">{fmt(d.faqCount, shownFaq.length)}</p>
        {shownFaq.length === 0 ? (
          <p className="msh-empty">{d.noResults}</p>
        ) : (
          <>
            <ul className="msh-faq-list">
              {shownFaq.slice(0, fVisible).map((f) => (
                <li key={f.n} className="msh-faq">
                  <button
                    type="button"
                    className="msh-faq-q"
                    onClick={() =>
                      setExpandedFaq(expandedFaq === f.n ? null : f.n)
                    }
                  >
                    <span className="msh-faq-n">{f.n}.</span>
                    <span className="msh-faq-qtext">{f.q}</span>
                    <span className="msh-term-cat">{f.category}</span>
                    <span className="msh-faq-arrow">
                      {expandedFaq === f.n ? "▾" : "▸"}
                    </span>
                  </button>
                  {expandedFaq === f.n ? (
                    <div className="msh-faq-a">
                      <MarkdownLite md={f.a} onOpenRef={openReference} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="msh-meta-line">{d.faqHint}</p>
            {fVisible < shownFaq.length ? (
              <button
                type="button"
                className="filter-chip filter-chip-more group-expand-btn"
                onClick={() => setFVisible((v) => v + PAGE)}
              >
                {hub.showMoreRemaining.replace(
                  "{n}",
                  String(shownFaq.length - fVisible)
                )}
              </button>
            ) : (
              shownFaq.length > PAGE && (
                <button
                  type="button"
                  className="filter-chip filter-chip-more group-expand-btn"
                  onClick={() => setFVisible(PAGE)}
                >
                  {hub.hideTools}
                </button>
              )
            )}
          </>
        )}
      </section>
    </div>
  );
}
