"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TAGS } from "@/lib/tags";
import { TOOLS, toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import { useLang } from "./LangProvider";

export default function HomeClient() {
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

  return (
    <main className="page">
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jinbijun-pose.webp" alt={MASCOT_NAME[lang]} className="hero-mascot" />
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
        TAGS.map((tag) => {
          const list = toolsByTag(tag.id);
          if (list.length === 0) return null;
          return (
            <section className="section" key={tag.id}>
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
          );
        })
      )}
    </main>
  );
}
