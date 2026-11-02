"use client";

import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { tagIcon, iconBgForSlug } from "@/lib/tagIcons";
import { useLang } from "./LangProvider";

export default function ToolCard({ tool }: { tool: ToolDef }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  return (
    <Link href={`/tool/${tool.slug}`} className="tool-card">
      <div className="tool-card-top">
        <span
          className="tool-card-icon"
          style={{ background: iconBgForSlug(tool.slug) }}
          aria-hidden="true"
        >
          {tagIcon(tool.tags[0])}
        </span>
        <h3 className="tool-card-name">{tool.name[lang]}</h3>
        <div className="tool-badges">
          {tool.embedded ? (
            <span className="badge badge-embedded">{t.embeddedBadge}</span>
          ) : (
            <span className="badge badge-third">{t.thirdPartyBadge}</span>
          )}
          {tool.liveData && <span className="badge badge-live">{t.liveDataBadge}</span>}
        </div>
      </div>
      <p className="tool-card-oneliner">{tool.oneLiner[lang]}</p>
      {tool.take?.[lang] ? (
        <p className="tool-card-take">
          <span className="tool-card-take-label">{t.takeTitle}</span>
          {tool.take[lang]}
        </p>
      ) : null}
      <div className="tool-card-foot">
        <span className="tool-card-tags">
          {tool.tags.map((tagId) => (
            <span className="chip" key={tagId}>
              {TAG_MAP[tagId]?.name[lang] ?? tagId}
            </span>
          ))}
        </span>
        <span className="tool-card-cta">{t.viewIntro} →</span>
      </div>
    </Link>
  );
}
