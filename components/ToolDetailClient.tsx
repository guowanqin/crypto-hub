"use client";

import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import { useLang } from "./LangProvider";

export default function ToolDetailClient({ tool }: { tool: ToolDef }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const primaryTag = tool.tags[0] ? TAG_MAP[tool.tags[0]] : undefined;

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
        {primaryTag && (
          <>
            <span className="crumb-sep">·</span>
            <Link href={`/tag/${primaryTag.id}`}>
              {t.backToTag.replace("{tag}", primaryTag.name[lang]).replace("← ", "")}
            </Link>
          </>
        )}
      </p>

      <section className="detail-head">
        <div className="tool-badges">
          <span className={`badge ${tool.type === "own" ? "badge-own" : "badge-third"}`}>
            {tool.type === "own" ? t.ownBadge : t.thirdPartyBadge}
          </span>
          {tool.embedded && <span className="badge badge-embedded">{t.embeddedBadge}</span>}
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
        <a className="btn primary big" href={`/go/${tool.slug}`} target="_blank" rel="noopener noreferrer">
          {t.visitTool} →
        </a>
      </section>

      <section className="card">
        <h2>{t.detailTitle}</h2>
        <p className="body-text">{tool.detail[lang]}</p>
        <h3 className="sub-title">{t.audienceTitle}</h3>
        <p className="body-text">{tool.audience[lang]}</p>
      </section>

      <section className="card jinbijun-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jinbijun-avatar.webp" alt={MASCOT_NAME[lang]} className="jinbijun-avatar" />
        <div>
          <h2 className="jinbijun-heading">
            {MASCOT_NAME[lang]} · {t.jinbijunTitle}
          </h2>
          <p className="jinbijun-quote">“{tool.jinbijun[lang]}”</p>
        </div>
      </section>

      <section className="card">
        <h3 className="sub-title">{t.tagsTitle}</h3>
        <div className="chips-row">
          {tool.tags.map((tagId) => (
            <Link key={tagId} href={`/tag/${tagId}`} className="chip chip-link">
              {TAG_MAP[tagId]?.name[lang] ?? tagId}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
