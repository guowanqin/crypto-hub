import type { Metadata } from "next";
import CrclClient from "@/components/CrclClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/crcl 不走通用标签模板，主体是 CRCL 买入估值面板。
// SEO 标题由需求指定：「CRCL 买入估值面板｜18btc 币圈工具导航」。
const tag = getTag("crcl")!;
const path = "/tag/crcl";

const TITLE = `CRCL 买入估值面板｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "按买入信号分模型（v6）实时计算 Circle（CRCL）的估值与买入信号：估值层看 P/S、恐慌层看 RSI14、基本面层看 USDC 供应 180 天变化，黑天鹅否决只看 USDC 市占率；附流通市值、FDV、P/S(TTM)、市值/调整后EBITDA、距历史新高与上市低点、USDC 基本面与营收利润数据。股价与 USDC 数据自动调取，分数是纪律工具，不是预测，不构成投资建议。";

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
  other: { "tools:count": String(toolsByTag("crcl").length) },
};

export default async function CrclTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <CrclClient tag={tag} adsPreview={ads === "preview"} />;
}
