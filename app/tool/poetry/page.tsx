import type { Metadata } from "next";
import PoetryPanelClient from "@/components/PoetryPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/poetry 站内直接使用古籍诗词精选版（与 /tag/poetry 共用同一组件）。
const tool = getTool("poetry")!;
const path = "/tool/poetry";

const TITLE = `古诗词查询｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用古籍诗词精选版：唐诗三百首、宋词三百首、诗经、楚辞、论语全文检索阅读，30,895 条成语词典查拼音、释义、出处，成语接龙与猜诗词小游戏站内直接玩。数据来自 GitHub 开源语料（MIT），原文为公版古籍；本站是常用精选版，全量古籍请查文籍典册原站。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "古诗词查询",
    "唐诗三百首",
    "宋词三百首",
    "诗经",
    "楚辞",
    "论语",
    "成语词典",
    "成语接龙",
    "猜诗词",
    "古诗词",
    "classical chinese poetry",
    "tang poems",
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

export default async function PoetryToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <PoetryPanelClient adsPreview={ads === "preview"} />;
}
