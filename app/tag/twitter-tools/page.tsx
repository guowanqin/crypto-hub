import type { Metadata } from "next";
import TweetClient from "@/components/TweetClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/twitter-tools 不走通用标签模板，主体是推特下载工具箱。
// SEO 标题由需求指定：「推特视频下载｜18btc 币圈工具导航」。
const tag = getTag("twitter-tools")!;
const path = "/tag/twitter-tools";

const TITLE = `推特视频下载｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "免费在线推特（Twitter/X）视频下载与推文导出工具：粘贴公开推文链接即可解析正文与全部媒体，图片给原图下载、视频逐档列出分辨率与码率的 MP4 直链（走推特 CDN 直链，本站不中转），推文可导出 TXT、Markdown、HTML、JSON、CSV 与 PDF，同作者 Thread 可整串导出（含 EPUB）。数据走推特公开嵌入接口与 FxTwitter 公开接口双源，免登录、免注册；仅限公开推文，内容版权归原作者。";

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
  other: { "tools:count": String(toolsByTag("twitter-tools").length) },
};

export default async function TwitterToolsTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <TweetClient tag={tag} adsPreview={ads === "preview"} />;
}
