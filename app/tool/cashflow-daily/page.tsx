import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import CashflowToolClient from "@/components/CashflowToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/cashflow-daily 站内直接使用每日加密现金流榜——
// DefiLlama 协议手续费与收入数据，精选 10 个主流协议按 24 小时收入排名。
const tool = getTool("cashflow-daily")!;
const path = "/tool/cashflow-daily";

const TITLE = `每日加密现金流榜｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看每日加密现金流榜：DefiLlama 协议手续费与收入数据，精选 10 个主流协议按 24 小时收入排名，附日环比、7 日与 30 日收入、1 年与历史累计及近 30 日走势。口径公开：榜上是协议收入，不是持币人现金流，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "加密现金流",
    "每日加密现金流榜",
    "协议收入",
    "协议手续费",
    "DefiLlama",
    "Hyperliquid 收入",
    "DeFi 收入排名",
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

export default async function CashflowToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <CashflowToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="cashflow-daily" />
      <ToolJsonLd slug="cashflow-daily" />
    </>
  );
}
