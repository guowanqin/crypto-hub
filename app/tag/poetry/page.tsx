import type { Metadata } from "next";
import PoetryClient from "@/components/PoetryClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/poetry 不走通用标签模板，主体是古籍诗词精选版
// （诗词检索 + 成语词典 + 成语接龙 + 猜诗词，数据为构建时落盘的开放语料）。
// SEO 标题由需求指定：「古诗词查询｜18btc 币圈工具导航」。
const tag = getTag("poetry")!;
const path = "/tag/poetry";

const TITLE = `古诗词查询｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "古籍诗词精选版：唐诗三百首、宋词三百首、诗经、楚辞、论语共 1,036 篇站内全文检索与阅读，30,895 条成语词典（拼音、释义、出处），再加成语接龙（同字/同音两模式）与猜诗词小游戏。数据来自 GitHub 开源语料 chinese-poetry 与 chinese-xinhua（均 MIT），构建时落盘、运行时不依赖外部接口；全量古籍与中医古籍请去文籍典册原站。";

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
  other: { "tools:count": String(toolsByTag("poetry").length) },
};

export default async function PoetryTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <PoetryClient tag={tag} adsPreview={ads === "preview"} />;
}
