import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import MarketMoodToolClient from "@/components/MarketMoodToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/market-mood 站内直接使用市场倾向看板——K 线动量、贪婪
// 指数、Ahr999、Hyperliquid 资金费率、TVL 五项公开免费指标按权重合成市场倾向。
const tool = getTool("market-mood")!;
const path = "/tool/market-mood";

const TITLE = `市场倾向看板｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用市场倾向看板：K 线动量、贪婪指数、Ahr999、Hyperliquid 资金费率与 TVL 五项公开免费指标按权重合成市场倾向，给出看涨看跌、目标区间、置信与加权分，方法与阈值全页公开。仅供参考，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "市场倾向",
    "市场倾向看板",
    "多指标合成",
    "看涨看跌",
    "目标区间",
    "市场情绪",
    "贪婪指数",
    "Ahr999",
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

export default async function MarketMoodToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <MarketMoodToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="market-mood" />
      <ToolJsonLd slug="market-mood" />
    </>
  );
}
