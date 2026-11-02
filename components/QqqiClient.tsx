"use client";

import Link from "next/link";
import type { TagDef } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import GroupBanner from "./GroupBanner";
import QqqiBoard, { QQQI_DICT } from "./QqqiBoard";
import { useLang } from "./LangProvider";

export default function QqqiClient({
  tag,
  adsPreview = false,
}: {
  tag: TagDef;
  adsPreview?: boolean;
}) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = QQQI_DICT[lang];
  const list = toolsByTag(tag.id);
  const otherLang = lang === "en" ? "zh" : "en";

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
      </p>
      <section className="tag-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="tag-mascot" />
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
      <GroupBanner tagId={tag.id} />

      {/* 广告位：标签页顶部横幅 */}
      <AdSlot id="tag_top" preview={adsPreview} />

      <QqqiBoard />

      {list.length > 0 && (
        <section className="section">
          <h2 className="section-title">{d.toolsTitle}</h2>
          <div className="card-grid">
            {list.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
