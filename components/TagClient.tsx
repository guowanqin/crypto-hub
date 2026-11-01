"use client";

import Link from "next/link";
import type { TagDef } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import { useLang } from "./LangProvider";

export default function TagClient({ tag }: { tag: TagDef }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const list = toolsByTag(tag.id);
  const otherLang = lang === "zh" ? "en" : "zh";

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
      </p>
      <section className="tag-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jinbijun-avatar.webp" alt={MASCOT_NAME[lang]} className="tag-mascot" />
        <div>
          <p className="tag-kicker">
            {t.tagPageIntro} · {t.toolsCount.replace("{n}", String(list.length))}
          </p>
          <h1 className="tag-title">
            {tag.name[lang]}
            <span className="tag-title-alt">{tag.name[otherLang]}</span>
          </h1>
          <p className="tag-intro">{tag.intro[lang]}</p>
        </div>
      </section>

      <div className="card-grid">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </main>
  );
}
