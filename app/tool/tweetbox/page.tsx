import type { Metadata } from "next";
import TweetPanelClient from "@/components/TweetPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/tweetbox 站内直接使用推特下载工具箱（与 /tag/twitter-tools 共用同一组件）。
const tool = getTool("tweetbox")!;
const path = "/tool/tweetbox";

const TITLE = `推特下载工具箱｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用推特下载工具箱：粘贴公开推文链接，自动解析作者、正文、发布时间与互动数，图片给原图直链、视频逐档列出分辨率与码率的 MP4 直链下载（推特 CDN 直链，本站服务器不中转）；推文一键导出 TXT、Markdown、HTML、JSON、CSV 与 PDF，同作者 Thread 识别后可整串导出 TXT、Markdown、JSON 与 EPUB。仅限公开推文，媒体版权归原作者。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "推特视频下载",
    "X视频下载",
    "Twitter视频下载",
    "推文下载",
    "推特图片下载",
    "Thread导出",
    "推文转PDF",
    "推文导出",
    "twitter video downloader",
    "tweet exporter",
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

export default async function TweetboxPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <TweetPanelClient adsPreview={ads === "preview"} />;
}
