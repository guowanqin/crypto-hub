import type { Metadata } from "next";
import SlangClient from "@/components/SlangClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/slang 不走通用标签模板，主体是站内可用的二手黑话词典
// （搜索、分类/状态筛选、拼音缩写反查），数据每日自动同步自 MIT 开源仓库
// Domainsun/awesome-chinese-secondhand-slang。
// SEO 标题由需求指定：「二手黑话词典｜18btc 币圈工具导航」。
const tag = getTag("slang")!;
const path = "/tag/slang";

const TITLE = `二手黑话查询工具合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "二手黑话词典：闲鱼、转转、小红书上的黑话、暗语、谐音与错别字一次查清——149 个主题词条、5,000+ 黑话变体在线检索，按分类与存活状态筛选，每条带百科释义、卖家潜台词与买家避坑，另有拼音首字母缩写反查。数据每日同步自 MIT 开源词库，给买家解码避坑用，不提供卖家黑话转译。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [...tag.keywords, "币圈工具导航", "18btc"],
  ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
    siteName: SITE_NAME.zh,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  other: { "tools:count": String(toolsByTag("slang").length) },
};

export default async function SlangTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <SlangClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
