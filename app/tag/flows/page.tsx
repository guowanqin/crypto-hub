import type { Metadata } from "next";
import FlowsClient from "@/components/FlowsClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/flows 不走通用标签模板，主体是交易所资金流入流出 + 保证金看板。
// SEO 标题由需求指定：「交易所资金流入流出与保证金｜18btc 币圈工具导航」。
const tag = getTag("flows")!;
const path = "/tag/flows";

const TITLE = `交易所资金流入流出与保证金｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "主流虚拟货币交易所的资金流入流出与保证金（合约）一页看板：各交易所链上储备总额与 24h/7d/30d 净流入净流出（DeFiLlama 已标记钱包口径，剔除自家代币），点开可看单家交易所的主要币种构成与近 35 日储备走势；保证金部分汇总各所合约未平仓总额（OI）与 BTC 永续资金费率，OKX、Hyperliquid 为官方接口直取，其余为 CoinGecko 衍生品聚合，逐行标注来源。储备与净流入不等于用户净申购，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [...tag.keywords, "币圈工具导航", "18btc"],
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
    description: DESCRIPTION,
  },
  other: { "tools:count": String(toolsByTag("flows").length) },
};

export default async function FlowsTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <FlowsClient tag={tag} adsPreview={ads === "preview"} />;
}
