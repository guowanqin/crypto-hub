"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { TAGS } from "@/lib/tags";
import { TOOLS, toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

export default function HomeClient({ adsPreview = false }: { adsPreview?: boolean }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const [query, setQuery] = useState("");

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

  // 首页实际展示的分类区块（跳过空分类），供分类间广告位按序插入
  const visibleSections = TAGS.map((tag) => ({
    tag,
    list: toolsByTag(tag.id),
  })).filter((s) => s.list.length > 0);

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
    </main>
  );
}
