import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import BtcCycleToolClient from "@/components/BtcCycleToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/btc-cycle 站内直接使用 BTC 周期抄底看板（与 /tag/btc-bottom 共用同一看板组件）。
const tool = getTool("btc-cycle")!;
const path = "/tool/btc-cycle";

const TITLE = `BTC 抄底倒计时｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用 BTC 抄底倒计时看板：按四年减半周期与实时区块高度推演周期位置、熊市进度、距熊底（位置 0）的倒计时与五档分批建仓触发位（0.20 / 0.15 / 0.10 / 0.05 / 0.02），附第 5 次减半与牛顶日期。数据源 mempool.space 实时链上。模型推演，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "BTC 抄底",
    "BTC 抄底倒计时",
    "比特币抄底",
    "BTC 周期位置",
    "减半周期",
    "熊市进度",
    "分批建仓",
    "比特币减半倒计时",
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

export default async function BtcCycleToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <BtcCycleToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="btc-cycle" />
      <ToolJsonLd slug="btc-cycle" />
    </>
  );
}
