import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import ArcPanelClient from "@/components/ArcPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/arc-panel 站内直接使用 Arc 链 TVL 与稳定币趋势看板。
const tool = getTool("arc-panel")!;
const path = "/tool/arc-panel";

const TITLE = `Arc 链 TVL 与稳定币趋势｜Arc 稳定币供应数据看板｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接查看 Circle 稳定币原生链 Arc 的资金面：DeFiLlama 统计的 Arc 链 TVL 历史趋势与稳定币供应（流通量）历史趋势同屏对照，附当前 TVL、当前稳定币总供应、供应与 TVL 比值、近 7 天与 30 天变化，以及按锚定币种拆分的稳定币构成。TVL 与稳定币供应统计对象不同，口径说明见页内，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Arc 链",
    "Arc TVL",
    "Arc 稳定币",
    "Arc 稳定币供应",
    "Arc 链数据",
    "Arc 链 TVL 趋势",
    "稳定币供应",
    "稳定币流通量",
    "Circle Arc",
    "USDC 原生链",
    "DeFiLlama Arc",
    "Arc chain TVL",
    "Arc stablecoin supply",
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

export default async function ArcPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <ArcPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="arc-panel" />
      <ToolJsonLd slug="arc-panel" />
    </>
  );
}
