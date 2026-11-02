"use client";

import Link from "next/link";
import type { TagDef } from "@/lib/tags";
import { TOOLS, newestTools, toolsByTag, type ToolDef } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

export default function TagClient({
  tag,
  adsPreview = false,
}: {
  tag: TagDef;
  adsPreview?: boolean;
}) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const list = toolsByTag(tag.id);
  const otherLang = lang === "en" ? "zh" : "en";

  // 单工具标签页补位：工具数 < 3 时，底部用最新上架工具补到 4 个（排除本页已展示）；
  // 最新上架不足时再用其他站内可用工具补齐。工具数 ≥ 3 的标签页不渲染此区。
  const exploreList: ToolDef[] = [];
  if (list.length < 3) {
    const seen = new Set(list.map((x) => x.slug));
    for (const f of newestTools(4, [...seen])) {
      if (exploreList.length >= 4) break;
      exploreList.push(f);
      seen.add(f.slug);
    }
    if (exploreList.length < 4) {
      for (const tool of TOOLS) {
        if (exploreList.length >= 4) break;
        if (tool.embedded && !seen.has(tool.slug)) {
          exploreList.push(tool);
          seen.add(tool.slug);
        }
      }
    }
  }

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

      {/* 广告位：标签页顶部横幅（标题区与工具列表之间） */}
      <AdSlot id="tag_top" preview={adsPreview} />

      <div className="card-grid">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {/* 正文补厚：分类选购/使用指南（仅配了 guide 的标签渲染） */}
      {tag.guide && (
        <section className="tag-guide">
          <h2 className="section-title">{t.guideTitle}</h2>
          <p className="tag-guide-text">{tag.guide[lang]}</p>
        </section>
      )}

      {/* 正文补厚：常见问答（仅配了 faqs 的标签渲染） */}
      {tag.faqs && tag.faqs.length > 0 && (
        <section className="tag-faq">
          <div className="section-head">
            <h2 className="section-title">{t.faqTitle}</h2>
          </div>
          <div className="tag-faq-list">
            {tag.faqs.map((f, i) => (
              <details key={i} className="tag-faq-item">
                <summary>{f.q[lang]}</summary>
                <p className="tag-faq-a">{f.a[lang]}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 单工具标签页补位推荐：仅工具数 < 3 时渲染 */}
      {exploreList.length > 0 && (
        <section className="section tag-explore">
          <div className="section-head">
            <h2 className="section-title">{t.exploreTitle}</h2>
          </div>
          <div className="card-grid">
            {exploreList.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
