import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import EnglishTypingToolClient from "@/components/EnglishTypingToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/english-typing 站内直接练英语——
// 单词拼写（跟读/听写/自测）+ 句子打字（填空/语块/整句默写）+ 记忆曲线复习，
// 错词自动进本，进度只存在浏览器本地。
const tool = getTool("english-typing")!;
const path = "/tool/english-typing";

const TITLE = `打字学英语｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内打字学英语：240 个核心单词分 4 包练拼写（跟读拼写、听写、自测），60 个句子分 5 包练打字（单词填空、语块、整句默写），记忆曲线自动安排复习，错词进本、可收藏、可导入自己的句子。不用登录，进度只存在你的浏览器里。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "打字学英语",
    "背单词",
    "单词拼写",
    "英语听写",
    "句子打字",
    "记忆曲线",
    "四级单词",
    "雅思单词",
    "英语学习",
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

export default async function EnglishTypingToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <EnglishTypingToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="english-typing" />
      <ToolJsonLd slug="english-typing" />
    </>
  );
}
