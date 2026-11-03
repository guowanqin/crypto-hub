import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import WalletWatchPanelClient from "@/components/WalletWatchPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/wallet-watch 站内直接使用钱包只读监控（BTC / ETH / SOL 公开地址即查即看）。
const tool = getTool("wallet-watch")!;
const path = "/tool/wallet-watch";

const TITLE = `钱包只读监控｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用钱包只读监控：粘贴 Bitcoin、Ethereum 或 Solana 公开地址，立刻看当前余额、最近原生币转账（方向、金额、对方地址）与出入账汇总，有转出置顶提示。数据经本站服务器调取链上公开接口，只读查询——不连钱包、不保存地址、不提供定时报警，口径与限制页内写清。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "钱包监控",
    "钱包地址查询",
    "地址监控",
    "只读监控",
    "观察钱包",
    "BTC地址查询",
    "ETH地址查询",
    "SOL地址查询",
    "钱包余额查询",
    "链上地址追踪",
    "watch-only wallet",
    "wallet address monitor",
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

export default async function WalletWatchPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <WalletWatchPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="wallet-watch" />
      <ToolJsonLd slug="wallet-watch" />
    </>
  );
}
