import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import EnglishTypingToolClient from "@/components/EnglishTypingToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/english-typing 站内直接练英语——
// 造句（看中文打完整英文句）+ 句型练习 + 句子打字（填空/语块/整句默写）+ 记忆曲线复习，
// 错句自动进本，句子里的生词点一下查释义发音，进度只存在浏览器本地。
const tool = getTool("english-typing")!;
const path = "/tool/english-typing";

const TITLE = `打字学英语｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内用句子学英语：看中文造句、打完整英文句子，8 个句型带例句、96 个句子分 8 包练打字，错句进本、记忆曲线安排复习，句子里的生词点一下查释义发音。不用登录，进度只存在你的浏览器里。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "打字学英语",
    "造句",
    "句型",
    "英语造句",
    "用句子学英语",
    "句子打字",
    "记忆曲线",
    "四级",
    "雅思",
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
