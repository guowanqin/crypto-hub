import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import SignalsPanelClient from "@/components/SignalsPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/signal-scanner 站内直接使用策略信号扫描器（主流币 + 美股的
// MACD 背离 / 横盘突破自动扫描，只用已收盘 K 线）。
const tool = getTool("signal-scanner")!;
const path = "/tool/signal-scanner";

const TITLE = `策略信号扫描：主流币与美股 MACD 背离、横盘突破｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用策略信号扫描：自动扫描 30 个主流币与 20 只美股在 15 分钟、1 小时、4 小时三个周期上的 MACD 顶背离、底背离与横盘突破信号，只用已收盘 K 线，每条背离附 P1/P2 价格与 DIF 证据可复核，另有上涨广度统计，每 5 分钟刷新。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "策略选币",
    "信号扫描",
    "MACD背离",
    "顶背离",
    "底背离",
    "平顶动能背离",
    "横盘突破",
    "放量突破",
    "量比",
    "上涨广度",
    "美股信号扫描",
    "strategy signal scanner",
    "MACD divergence",
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

export default async function SignalScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <SignalsPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="signal-scanner" />
      <ToolJsonLd slug="signal-scanner" />
    </>
  );
}
