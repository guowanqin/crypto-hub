import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import Li18875786ToolClient from "@/components/Li18875786ToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/quark-resources 站内直接看夸克网盘资源目录——
// X 账号 @li18875786 公开资源目录里带夸克网盘链接的条目，每个夸克链接一条，
// 按标题关键词自动分类、支持搜索与筛选，每天 10:00 自动拉取目录更新；
// 链接为第三方分享，可能失效，版权归原作者。
const tool = getTool("quark-resources")!;
const path = "/tool/quark-resources";

const TITLE = `夸克网盘资源｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看夸克网盘资源目录：X 账号 @li18875786 每天分享的付费课程与学习资料，AI 课程、编程开发、剪辑摄影、电商运营、自媒体、英语学习、中小学教辅、考试考证、职场财会、生活技能等分类筛选，支持搜索，点标题直达夸克网盘。每个夸克链接一条，只有百度链接的条目不收；每天 10:00 自动拉取目录更新。链接为第三方分享，可能失效，版权归原作者，仅供学习交流。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "夸克网盘资源",
    "夸克网盘课程",
    "网盘资源目录",
    "li18875786",
    "付费课程分享",
    "学习资料",
    "AI 课程",
    "考试考证",
    "中小学教辅",
    "币圈工具导航",
    "18btc",
  ],
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
    description: tool.oneLiner.zh,
  },
};

export default async function QuarkResourcesToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <Li18875786ToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="quark-resources" />
      <ToolJsonLd slug="quark-resources" />
    </>
  );
}
