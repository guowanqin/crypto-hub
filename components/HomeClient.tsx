"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { TAGS } from "@/lib/tags";
import { TOOLS, toolsByTag, type ToolDef } from "@/lib/tools";
import { FEATURED_TOOLS } from "@/lib/featured";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

export default function HomeClient({ adsPreview = false }: { adsPreview?: boolean }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [activeType, setActiveType] = useState<"all" | "builtin" | "third">("all");
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // 分类 chips 默认只露前 9 个；当前选中的分类不在默认集合内时也要露出来，避免选中项「消失」
  const visibleTags = useMemo(() => {
    const base = tagsExpanded ? TAGS : TAGS.slice(0, 9);
    if (activeTag !== "all" && !base.some((tg) => tg.id === activeTag)) {
      const sel = TAGS.find((tg) => tg.id === activeTag);
      if (sel) return [...base, sel];
    }
    return base;
  }, [tagsExpanded, activeTag]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    return TOOLS.filter((tool) =>
      [tool.name.zh, tool.name.en, tool.oneLiner.zh, tool.oneLiner.en, tool.detail.zh, tool.detail.en]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [q]);

  // 类型筛选口径：独立可用 = embedded 站内工具；第三方 = type 为 third-party 的收录工具
  const typeOk = (tool: ToolDef): boolean =>
    activeType === "all"
      ? true
      : activeType === "builtin"
        ? Boolean(tool.embedded)
        : tool.type === "third-party";

  // 首页实际展示的分类区块（应用分类 + 类型筛选，跳过变空的分类），供分类间广告位按序插入
  const visibleSections = TAGS.filter((tag) => activeTag === "all" || tag.id === activeTag)
    .map((tag) => ({
      tag,
      list: toolsByTag(tag.id).filter(typeOk),
    }))
    .filter((s) => s.list.length > 0);

  const filteredTotal = visibleSections.reduce((n, s) => n + s.list.length, 0);

  return (
    <main className="page">
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-pose.webp" alt={MASCOT_NAME[lang]} className="hero-mascot" />
        <h1>{t.heroTitle}</h1>
        <p className="hero-sub">{t.heroSub}</p>
        <div className="search-box">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label="Search tools"
          />
        </div>
      </section>

      {/* 广告位：首页顶部横幅（hero 下方、分类区块上方） */}
      <AdSlot id="home_top" preview={adsPreview} />

      {matches !== null ? (
        <section className="section">
          <h2 className="section-title">
            {t.searchResults.replace("{n}", String(matches.length)).replace("{q}", query.trim())}
          </h2>
          {matches.length === 0 ? (
            <p className="empty-note">{t.noResults}</p>
          ) : (
            <div className="card-grid">
              {matches.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 热门精选：仅默认视图（无搜索词、分类=全部、类型=全部）显示，避免与筛选结果重复 */}
          {activeTag === "all" && activeType === "all" && (
            <section className="section featured-section">
              <div className="section-head">
                <h2 className="section-title">🔥 {t.featuredTitle}</h2>
              </div>
              <div className="card-grid">
                {FEATURED_TOOLS.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* 筛选：分类（来自标签注册表）+ 类型（独立可用 / 第三方），可组合 */}
          <div className="filter-bar">
            <div className="filter-row" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={`filter-chip${activeTag === "all" ? " on" : ""}`}
                aria-pressed={activeTag === "all"}
                onClick={() => setActiveTag("all")}
              >
                {t.allTags}
              </button>
              {visibleTags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  className={`filter-chip${activeTag === tag.id ? " on" : ""}`}
                  aria-pressed={activeTag === tag.id}
                  onClick={() => setActiveTag(tag.id)}
                >
                  {tag.name[lang]}
                </button>
              ))}
              {TAGS.length > 9 && (
                <button
                  type="button"
                  className="filter-chip filter-chip-more"
                  aria-expanded={tagsExpanded}
                  onClick={() => setTagsExpanded((v) => !v)}
                >
                  {tagsExpanded ? t.lessTags : t.moreTags}
                </button>
              )}
            </div>
            <div className="filter-row" role="group" aria-label="Filter by type">
              <button
                type="button"
                className={`filter-chip${activeType === "all" ? " on" : ""}`}
                aria-pressed={activeType === "all"}
                onClick={() => setActiveType("all")}
              >
                {t.allTags}
              </button>
              <button
                type="button"
                className={`filter-chip${activeType === "builtin" ? " on" : ""}`}
                aria-pressed={activeType === "builtin"}
                onClick={() => setActiveType("builtin")}
              >
                {t.filterBuiltin}
              </button>
              <button
                type="button"
                className={`filter-chip${activeType === "third" ? " on" : ""}`}
                aria-pressed={activeType === "third"}
                onClick={() => setActiveType("third")}
              >
                {t.filterThird}
              </button>
            </div>
          </div>

          {filteredTotal === 0 ? (
            <section className="section">
              <p className="empty-note">{t.filterEmpty}</p>
            </section>
          ) : (
            visibleSections.map(({ tag, list }, idx) => (
              <Fragment key={tag.id}>
                <section className="section">
                  <div className="section-head">
                    <Link href={`/tag/${tag.id}`} className="section-title-link">
                      <h2 className="section-title">{tag.name[lang]}</h2>
                      <span className="section-count">
                        {t.toolsCount.replace("{n}", String(list.length))}
                      </span>
                      <span className="section-arrow">→</span>
                    </Link>
                  </div>
                  <div className="card-grid">
                    {list.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </section>
                {/* 广告位：首页中部横幅（第 3 个分类区块之后） */}
                {idx === 2 && <AdSlot id="home_mid" preview={adsPreview} />}
              </Fragment>
            ))
          )}
        </>
      )}
    </main>
  );
}
