"use client";

import { Fragment, useMemo, useState } from "react";
import { TAG_MAP } from "@/lib/tags";
import { GROUPS, GROUP_BY_TAG, toolsByGroup } from "@/lib/groups";
import { TOOLS, compareTools, type ToolDef } from "@/lib/tools";
import { FEATURED_TOOLS } from "@/lib/featured";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

/** 首页每个大类默认展示的工具数（AGENTS.md 第 5 节），超出折叠、按钮原地展开 */
const GROUP_PAGE_SIZE = 6;
/** 首页「最新上架」展示数（AGENTS.md 第 5 节） */
const NEWEST_SIZE = 6;

export default function HomeClient({ adsPreview = false }: { adsPreview?: boolean }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [activeType, setActiveType] = useState<"all" | "builtin" | "third">("all");
  // 大类区块的展开状态（按组独立）：默认收起，只显示排序后的前 GROUP_PAGE_SIZE 个
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(new Set());
  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 最新上架：全站按统一排序（pin → 站内可用 → addedAt 新 → 同日注册靠后）取前 6
  const newestTools = useMemo(
    () => [...TOOLS].sort(compareTools).slice(0, NEWEST_SIZE),
    []
  );

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    return TOOLS.filter((tool) =>
      [
        tool.name.zh,
        tool.name.en,
        tool.oneLiner.zh,
        tool.oneLiner.en,
        tool.detail.zh,
        tool.detail.en,
        // 所属标签与所属大类的中英文名也纳入匹配：搜「销毁」「钱包」能命中整个分类的工具，
        // 搜「定投」「安全」能命中对应大类（美股定投 / 钱包与安全）的工具
        ...tool.tags.flatMap((id) => {
          const tg = TAG_MAP[id];
          const gr = GROUP_BY_TAG[id];
          return [
            ...(tg ? [tg.name.zh, tg.name.en] : []),
            ...(gr ? [gr.name.zh, gr.name.en] : []),
          ];
        }),
      ]
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

  // 首页实际展示的大类区块（方案一：按大类组织；应用大类 + 类型筛选，跳过变空的大类），
  // 供大类间广告位按序插入。组内工具 = 成员标签的工具按成员顺序拼接去重
  const visibleSections = GROUPS.filter((group) => activeGroup === "all" || group.id === activeGroup)
    .map((group) => ({
      group,
      list: toolsByGroup(group).filter(typeOk),
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
          {/* 热门精选：仅默认视图（无搜索词、大类=全部、类型=全部）显示，避免与筛选结果重复 */}
          {activeGroup === "all" && activeType === "all" && (
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

          {/* 最新上架：显示条件同热门精选（无搜索词、大类=全部、类型=全部），取全站排序前 6 */}
          {activeGroup === "all" && activeType === "all" && (
            <section className="section newest-section">
              <div className="section-head">
                <h2 className="section-title">🆕 {t.newestTitle}</h2>
              </div>
              <div className="card-grid">
                {newestTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* 筛选：大类（方案一的 7 个大类）+ 类型（独立可用 / 第三方），可组合 */}
          <div className="filter-bar">
            <div className="filter-row" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={`filter-chip${activeGroup === "all" ? " on" : ""}`}
                aria-pressed={activeGroup === "all"}
                onClick={() => setActiveGroup("all")}
              >
                {t.allTags}
              </button>
              {GROUPS.map((group) => (
                <button
                  type="button"
                  key={group.id}
                  className={`filter-chip${activeGroup === group.id ? " on" : ""}`}
                  aria-pressed={activeGroup === group.id}
                  onClick={() => setActiveGroup(group.id)}
                >
                  {group.name[lang]}
                </button>
              ))}
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
            visibleSections.map(({ group, list }, idx) => {
              const expanded = expandedGroups.has(group.id);
              const shown = expanded ? list : list.slice(0, GROUP_PAGE_SIZE);
              return (
                <Fragment key={group.id}>
                  <section className="section" id={group.id}>
                    <div className="section-head">
                      <div className="section-head-row">
                        <h2 className="section-title">{group.name[lang]}</h2>
                        <span className="section-count">
                          {t.toolsCount.replace("{n}", String(list.length))}
                        </span>
                      </div>
                    </div>
                    <div className="card-grid">
                      {shown.map((tool) => (
                        <ToolCard key={tool.slug} tool={tool} />
                      ))}
                    </div>
                    {list.length > GROUP_PAGE_SIZE && (
                      <div className="group-expand-row">
                        <button
                          type="button"
                          className="filter-chip filter-chip-more group-expand-btn"
                          aria-expanded={expanded}
                          onClick={() => toggleGroup(group.id)}
                        >
                          {expanded
                            ? t.hideTools
                            : t.showAllTools.replace("{n}", String(list.length))}
                        </button>
                      </div>
                    )}
                  </section>
                  {/* 广告位：首页中部横幅（第 3 个大类区块之后） */}
                  {idx === 2 && <AdSlot id="home_mid" preview={adsPreview} />}
                </Fragment>
              );
            })
          )}
        </>
      )}
    </main>
  );
}
