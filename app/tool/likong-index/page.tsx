import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import LikongPanelClient from "@/components/LikongPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/likong-index 站内直接使用利空出尽指数（统计「利空出尽」
// 词族在 GDELT 全球新闻中的提及热度，合成逆向情绪指数，并对照 BTC / ETH /
// 标普 500 / 纳斯达克在历次高潮后的真实涨跌）。
const tool = getTool("likong-index")!;
const path = "/tool/likong-index";

const TITLE = `利空出尽指数：喊声多响算见底，附 BTC 与美股指数高潮后涨跌统计｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用利空出尽指数：统计「利空出尽、利空落地、坏消息出尽」等词在 GDELT 全球新闻中的提及占比，合成为 0–100 的逆向情绪指数（70 以上为高潮区），可叠加 BTC、ETH、标普 500、纳斯达克走势对照，并把每一次高潮后 7 天 / 30 天的实际涨跌全部列出统计，不挑样本。数据源为新闻媒体提及，非社交全量。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "利空出尽",
    "利空出尽就是利好",
    "利空出尽指数",
    "情绪指数",
    "逆向情绪指标",
    "恐慌指数",
    "见底信号",
    "抄底指标",
    "比特币底部",
    "新闻情绪",
    "GDELT",
    "sentiment index",
    "contrarian indicator",
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

export default async function LikongIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <LikongPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="likong-index" />
      <ToolJsonLd slug="likong-index" />
    </>
  );
}
