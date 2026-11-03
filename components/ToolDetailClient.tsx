"use client";

import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME, SITE_NAME } from "@/lib/site";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

export default function ToolDetailClient({
  tool,
  adsPreview = false,
}: {
  tool: ToolDef;
  adsPreview?: boolean;
}) {
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
          {tool.embedded ? (
            <span className="badge badge-embedded">{t.embeddedBadge}</span>
          ) : (
            <span className="badge badge-third">{t.thirdPartyBadge}</span>
          )}
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
        <a className="btn primary big" href={`/go/${tool.slug}`} target="_blank" rel="noopener noreferrer">
          {t.visitTool} →
        </a>
      </section>

      {tool.image && (
        <figure className="detail-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tool.image} alt={tool.name[lang]} className="detail-image" />
        </figure>
      )}

      <section className="card">
        <h2>{t.detailTitle}</h2>
        <p className="body-text">{tool.detail[lang]}</p>
        <h3 className="sub-title">{t.audienceTitle}</h3>
        <p className="body-text">{tool.audience[lang]}</p>
      </section>

      <section className="card take-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="take-avatar" />
        <div>
          <h2 className="take-heading">
            {SITE_NAME[lang]} · {t.takeTitle}
          </h2>
          <p className="take-quote">“{tool.take[lang]}”</p>
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

      {/* 广告位：工具页底部横幅（介绍内容下方、页脚上方） */}
      <AdSlot id="tool_bottom" preview={adsPreview} />
    </main>
  );
}
