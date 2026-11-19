import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import GithubPicksToolClient from "@/components/GithubPicksToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/github-picks 站内直接看 GitHub 开源项目精选——
// 每天同步 X 博主 @bkdgiffug 分享的 GitHub 开源项目，只收带仓库链接的
// 原创帖，Star/语言/协议经 GitHub 官方接口核对，按关键词自动分类、
// 支持搜索与筛选，点标题直达 GitHub 仓库。
const tool = getTool("github-picks")!;
const path = "/tool/github-picks";

const TITLE = `GitHub 开源项目精选｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看每天更新的 GitHub 开源项目精选：同步 X 博主分享的 AI 绘画设计、AI 编程开发、AI 模型接口、数据可视化、效率办公、学习资源类开源仓库，Star 数、主要语言与开源协议经 GitHub 官方接口核对，支持搜索与分类筛选，点标题直达 GitHub 仓库。只收带仓库链接的原创项目帖，纯推广与撸毛广告不收，同一仓库只收一次。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "GitHub开源项目",
    "开源项目推荐",
    "GitHub精选",
    "AI开源工具",
    "开源Skill",
    "GitHub项目推荐",
    "AI绘画工具",
    "AI编程工具",
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

export default async function GithubPicksToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <GithubPicksToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="github-picks" />
      <ToolJsonLd slug="github-picks" />
    </>
  );
}
