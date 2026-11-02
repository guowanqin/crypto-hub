import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import UniBurnPanelClient from "@/components/UniBurnPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/uni-burn 站内直接使用 UNI 销毁看板（与 /tag/burn 共用同一看板组件）。
const tool = getTool("uni-burn")!;
const path = "/tool/uni-burn";

const TITLE = `UNI 销毁进度追踪｜Uniswap 销毁了多少 UNI｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接追踪 UNI 销毁进度：直读以太坊主网 UNI 合约，给出累计销毁量、占初始供应（10 亿枚）比例、有效供应、近 24 小时与 30 天销毁量、年化销毁量与年化通缩率，逐笔列出最近销毁记录，附交易哈希可在 Etherscan 核对。口径为主网入账时间，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "UNI销毁",
    "UNI销毁进度",
    "UNI销毁追踪",
    "Uniswap销毁",
    "UNI通缩",
    "UNI供应量",
    "UNI协议费销毁",
    "UNI burn",
    "UNI burn tracker",
    "Uniswap burn",
    "UNI deflation",
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

export default async function UniBurnPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <UniBurnPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="uni-burn" />
      <ToolJsonLd slug="uni-burn" />
    </>
  );
}
