"use client";

import { getTool, newestTools, toolsByTag, type ToolDef } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import ToolCard from "./ToolCard";
import { useLang } from "./LangProvider";

/**
 * 工具页底部「同类工具」推荐：取当前工具第一个标签下的其他工具（最多 4 个）；
 * 同类不足 2 个时用最新上架工具补齐到 4 个。在各工具页的 page.tsx 层面渲染一次。
 */
export default function RelatedTools({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const tool = getTool(slug);
  if (!tool) return null;

  const primaryTag = tool.tags[0];
  const list: ToolDef[] = primaryTag
    ? toolsByTag(primaryTag).filter((x) => x.slug !== slug)
    : [];
  if (list.length < 2) {
    const seen = new Set(list.map((x) => x.slug));
    for (const f of newestTools(4, [slug, ...seen])) {
      if (list.length >= 4) break;
      list.push(f);
      seen.add(f.slug);
    }
  }
  const shown = list.slice(0, 4);
  if (shown.length === 0) return null;

  return (
    <section className="section related-section">
      <div className="section-head">
        <h2 className="section-title">{t.relatedTitle}</h2>
      </div>
      <div className="card-grid">
        {shown.map((x) => (
          <ToolCard key={x.slug} tool={x} />
        ))}
      </div>
    </section>
  );
}
