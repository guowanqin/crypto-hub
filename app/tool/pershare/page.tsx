import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import PerShareClient from "@/components/PerShareClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const tool = getTool("pershare")!;
const path = "/tool/pershare";

const TITLE = `每股含币量计算器｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接计算 BNC、PURR 每股含币量与折溢价：BNC 每股含 BNB（基本口径）、PURR 每股含 HYPE（官方摊薄口径），含币价对股价的价差（折价 / 溢价）与 mNAV 实时呈现，并可查询 BNCB、HYPE 池子年化收益率（默认 ±5% 区间，支持全区间、自定义区间与 LP 收益测算）。数据实时刷新，免注册。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "每股含币量",
    "每股含币量计算器",
    "BNC 财库公司",
    "BNB 财库公司",
    "HYPE 财库公司",
    "PURR 财库公司",
    "每股含 BNB",
    "每股含 HYPE",
    "mNAV",
    "财库公司折价",
    "BNCB 池子年化收益率",
    "HYPE 池子年化收益率",
    "BNB per share",
    "HYPE per share",
    "mNAV calculator",
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

export default async function PerSharePage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <PerShareClient adsPreview={ads === "preview"} />
      <RelatedTools slug="pershare" />
    </>
  );
}
