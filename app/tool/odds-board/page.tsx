import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import OddsBoardToolClient from "@/components/OddsBoardToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/odds-board 站内直接看预测市场赔率榜——
// Polymarket 每日 above/below 市场里 BTC、ETH 今天站上各价位的隐含概率阶梯，
// 附 crypto 类事件 24h 交易量排行；概率为市场押注的隐含概率，不是预测。
const tool = getTool("odds-board")!;
const path = "/tool/odds-board";

const TITLE = `预测市场赔率榜｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看预测市场赔率榜：Polymarket 每日市场里，BTC、ETH 今天结算站上各价位的市场隐含概率一档一档列清，标出现价位置与隐含中位价位，附 crypto 类事件 24h 交易量排行。数据来自 Polymarket 公开免费接口，约 10 分钟更新。赔率是市场押注的隐含概率，仅供参考，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "预测市场",
    "Polymarket",
    "赔率榜",
    "隐含概率",
    "BTC 概率",
    "ETH 概率",
    "预测市场交易量",
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

export default async function OddsBoardToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <OddsBoardToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="odds-board" />
      <ToolJsonLd slug="odds-board" />
    </>
  );
}
