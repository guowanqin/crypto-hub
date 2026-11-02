import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import FlowsPanelClient from "@/components/FlowsPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/flows-panel 站内直接使用交易所资金流与保证金看板（与 /tag/flows 共用同一看板组件）。
const tool = getTool("flows-panel")!;
const path = "/tool/flows-panel";

const TITLE = `交易所资金流入流出与保证金｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用交易所资金流看板：Binance、OKX、Bybit、Bitget、Gate、KuCoin 等交易所的链上储备总额与 24h/7d/30d 净流入净流出（DeFiLlama 口径），可展开看单家币种构成与储备走势；附各所合约未平仓量（OI）与 BTC 永续资金费率，来源逐行标注。不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "交易所资金流",
    "交易所净流入",
    "交易所储备金",
    "合约未平仓量",
    "资金费率",
    "交易所保证金",
    "币安资金流",
    "OKX资金流",
    "exchange inflows",
    "exchange reserves",
    "open interest",
    "funding rate",
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

export default async function FlowsPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <FlowsPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="flows-panel" />
      <ToolJsonLd slug="flows-panel" />
    </>
  );
}
