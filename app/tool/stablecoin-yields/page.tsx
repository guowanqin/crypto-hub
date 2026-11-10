import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import StablecoinToolClient from "@/components/StablecoinToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/stablecoin-yields 站内直接使用稳定币收益榜——
// DefiLlama 收益数据，主流稳定币池按年化排名，高波动金库标红提示。
const tool = getTool("stablecoin-yields")!;
const path = "/tool/stablecoin-yields";

const TITLE = `稳定币收益榜｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看稳定币收益榜：DefiLlama 收益数据，主流稳定币池按年化排名，附基础与奖励拆分、30 日均值与 TVL，高波动金库标红提示。口径公开：APY 是年化收益率，不是固定利息，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "稳定币收益",
    "稳定币收益榜",
    "USDC 收益",
    "USDT 理财",
    "DeFi 年化",
    "DefiLlama",
    "HLP 收益",
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

export default async function StablecoinToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <StablecoinToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="stablecoin-yields" />
      <ToolJsonLd slug="stablecoin-yields" />
    </>
  );
}
