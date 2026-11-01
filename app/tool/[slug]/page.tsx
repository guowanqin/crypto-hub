import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailClient from "@/components/ToolDetailClient";
import { TOOLS, getTool } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// sheet2word 有专属静态页（app/tool/sheet2word），不走动态路由。
export function generateStaticParams() {
  return TOOLS.filter((t) => t.slug !== "sheet2word").map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || slug === "sheet2word") return {};
  const title = `${tool.name.zh}｜${SITE_NAME.zh}`;
  const description = `${tool.oneLiner.zh}${tool.jinbijun.zh ? ` 金币君说：${tool.jinbijun.zh}` : ""}`;
  const path = `/tool/${tool.slug}`;
  const tagNames = tool.tags.map((id) => TAG_MAP[id]?.name.zh ?? id);
  return {
    title,
    description,
    keywords: [tool.name.zh, ...tagNames, "币圈工具导航", "金币君"],
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

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || slug === "sheet2word") notFound();
  return <ToolDetailClient tool={tool} />;
}
