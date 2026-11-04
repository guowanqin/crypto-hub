import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import PatternsPanelClient from "@/components/PatternsPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/pattern-scanner 站内直接使用形态选标的（先选 K 线形态，
// 再筛今日命中的主流币与美股，并给出该形态的全池历史回测统计，只用已收盘日线）。
const tool = getTool("pattern-scanner")!;
const path = "/tool/pattern-scanner";

const TITLE = `形态选标的：K线形态筛币与美股，均线金叉、放量突破附历史回测｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内使用形态选标的：6 个内置日线 K 线形态（均线金叉、放量突破、下跌后长下影、缩量整理、缩量回踩均线、超跌后转强）任选一个，即时筛出今日命中的 30 个主流币与 20 只美股，并给出该形态在全标的池的历史回测——触发次数、5/10/20 日胜率、平均与中位数收益，只用已收盘日线判定。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "形态选股",
    "形态选标的",
    "K线形态",
    "均线金叉",
    "放量突破",
    "长下影",
    "缩量整理",
    "缩量回踩",
    "超跌反弹",
    "形态回测",
    "形态胜率",
    "币圈形态扫描",
    "美股形态选股",
    "pattern screener",
    "candlestick pattern backtest",
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

export default async function PatternScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <PatternsPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="pattern-scanner" />
      <ToolJsonLd slug="pattern-scanner" />
    </>
  );
}
