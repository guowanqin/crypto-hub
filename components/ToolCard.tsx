"use client";

import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { useLang } from "./LangProvider";

export default function ToolCard({ tool }: { tool: ToolDef }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  return (
    <Link href={`/tool/${tool.slug}`} className="tool-card">
      <div className="tool-card-top">
        <h3 className="tool-card-name">{tool.name[lang]}</h3>
        <div className="tool-badges">
          <span className={`badge ${tool.type === "own" ? "badge-own" : "badge-third"}`}>
            {tool.type === "own" ? t.ownBadge : t.thirdPartyBadge}
          </span>
          {tool.embedded && <span className="badge badge-embedded">{t.embeddedBadge}</span>}
        </div>
      </div>
      <p className="tool-card-oneliner">{tool.oneLiner[lang]}</p>
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
