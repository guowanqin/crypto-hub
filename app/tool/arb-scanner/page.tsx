import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import ArbPanelClient from "@/components/ArbPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/arb-scanner 站内直接使用跨链套利扫描器（SOL 链 ↔ BSC 链同资产价差监控）。
const tool = getTool("arb-scanner")!;
const path = "/tool/arb-scanner";

const TITLE = `SOL/BSC 跨链套利价差扫描｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用跨链套利扫描：SOL、ETH、BTC、USDT、USDC 在 Solana 与 BSC 两条链上流动性最大的美元交易对报价（DexScreener），自动对比毛价差并扣除兑换费、桥费与滑点算净价差，成本可改、每 60 秒刷新，锚定与桥接资产性质逐项标注。只监控不下单。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "跨链套利",
    "套利扫描",
    "跨链搬砖",
    "SOL BSC 价差",
    "Solana BSC 套利",
    "同资产价差",
    "净价差",
    "DexScreener 价差",
    "cross-chain arbitrage",
    "arbitrage scanner",
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

export default async function ArbScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <ArbPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="arb-scanner" />
      <ToolJsonLd slug="arb-scanner" />
    </>
  );
}
