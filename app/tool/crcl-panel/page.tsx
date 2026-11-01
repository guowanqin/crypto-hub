import type { Metadata } from "next";
import CrclPanelClient from "@/components/CrclPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/crcl-panel 站内直接使用 CRCL 买入估值看板（与 /tag/crcl 共用同一看板组件）。
const tool = getTool("crcl-panel")!;
const path = "/tool/crcl-panel";

const TITLE = `CRCL 买入估值面板｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用 CRCL 买入估值面板：按买入信号分模型（v6）实时计算 Circle（CRCL）的估值与买入信号——估值层看 P/S、恐慌层看 RSI14、基本面层看 USDC 供应 180 天变化，黑天鹅否决只看 USDC 市占率；附流通市值、FDV、距历史新高与上市低点、USDC 基本面与营收利润数据。股价与 USDC 数据自动调取，分数是纪律工具，不是预测，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "CRCL",
    "CRCL 买入估值面板",
    "CRCL 买入信号分",
    "Circle 估值",
    "CRCL 股票",
    "USDC 供应量",
    "USDC 市占率",
    "CRCL P/S",
    "CRCL RSI",
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

export default async function CrclPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <CrclPanelClient adsPreview={ads === "preview"} />;
}
