import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailClient from "@/components/ToolDetailClient";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import { TOOLS, getTool, type ToolDef } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** 在句读处截断：优先在 max 以内最后一个句末标点收尾，其次逗号，保证摘要读起来完整。 */
function cutAtBoundary(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  for (const punct of ["。", "；", "！", "？", "，", "、"]) {
    const idx = slice.lastIndexOf(punct);
    if (idx >= Math.floor(max * 0.45)) return slice.slice(0, idx + 1);
  }
  return slice;
}

/**
 * 通用工具页 meta description 组装（SEO 审计 P1-3 长度归一，目标 70–160 字）：
 * 常规 = oneLiner + 实测短评；过长时在句读处收短短评；过短（多为第三方分享页）时
 * 从注册 detail 摘句读完整的片段补足——内容全部来自注册文案，不编造事实，正文不受影响。
 */
function buildDescription(tool: ToolDef): string {
  const base = tool.oneLiner.zh;
  const takePart = tool.take.zh ? ` 实测短评：${tool.take.zh}` : "";
  let desc = base + takePart;
  if (desc.length > 160 && tool.take.zh) {
    const budget = 160 - base.length - " 实测短评：".length;
    desc = base + " 实测短评：" + cutAtBoundary(tool.take.zh, Math.max(budget, 0));
  } else if (desc.length < 70 && tool.detail.zh) {
    const budget = 122 - base.length - takePart.length;
    const snippet = cutAtBoundary(tool.detail.zh, Math.max(budget, 30));
    desc = base + snippet + takePart;
    if (desc.length > 160) desc = cutAtBoundary(desc, 160);
  }
  return desc;
}

// sheet2word、pershare、imagebox、foldervault、crcl-panel、qqqi-panel、qqq-panel、btc-cycle、filetime、pdfbox、ip-check、uni-burn、devtools、niuma-clock、arb-scanner 有专属静态页（app/tool/<slug>），不走动态路由。
const DEDICATED_PAGES = new Set([
  "sheet2word",
  "pershare",
  "imagebox",
  "foldervault",
  "crcl-panel",
  "qqqi-panel",
  "qqq-panel",
  "flows-panel",
  "chain-dau-panel",
  "arb-scanner",
  "uni-burn",
  "btc-cycle",
  "filetime",
  "pdfbox",
  "ocr-tool",
  "slang-dict",
  "ip-check",
  "poetry",
  "tweetbox",
  "devtools",
  "niuma-clock",
]);

export function generateStaticParams() {
  return TOOLS.filter((t) => !DEDICATED_PAGES.has(t.slug)).map((t) => ({ slug: t.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ads?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || DEDICATED_PAGES.has(slug)) return {};
  const title = `${tool.name.zh}｜${SITE_NAME.zh}`;
  const description = buildDescription(tool);
  const path = `/tool/${tool.slug}`;
  const tagNames = tool.tags.map((id) => TAG_MAP[id]?.name.zh ?? id);
  return {
    title,
    description,
    keywords: [tool.name.zh, ...tagNames, "币圈工具导航", "18btc"],
    ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
    openGraph: {
      type: "website",
      locale: "zh_CN",
      alternateLocale: ["en_US"],
      ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
      siteName: SITE_NAME.zh,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ToolPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ads } = await searchParams;
  const tool = getTool(slug);
  if (!tool || DEDICATED_PAGES.has(slug)) notFound();
  return (
    <>
      <ToolDetailClient tool={tool} adsPreview={ads === "preview"} />
      <RelatedTools slug={tool.slug} />
      <ToolJsonLd slug={tool.slug} />
    </>
  );
}
