import type { Metadata } from "next";
import ChainDauPanelClient from "@/components/ChainDauPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/chain-dau-panel 站内直接使用公链日活排行看板（与 /tag/chain-dau 共用同一看板组件）。
const tool = getTool("chain-dau-panel")!;
const path = "/tool/chain-dau-panel";

const TITLE = `公链日活排行｜每日活跃地址 TOP｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用公链日活排行：主流公链过去 24 小时活跃地址数（日活）排行、日活 7 日变化、TVL 与人均锁仓（TVL ÷ 日活），数据取自 DeFiLlama 自动调取，可按链名搜索、按日活/TVL/人均锁仓排序。地址不等于真人，口径说明见页内，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "公链日活",
    "公链日活排行",
    "链活跃地址",
    "每日活跃地址",
    "公链活跃度排名",
    "人均锁仓",
    "TVL",
    "BSC日活",
    "波场日活",
    "Solana日活",
    "以太坊日活",
    "daily active addresses",
    "chain activity ranking",
    "active users by chain",
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

export default async function ChainDauPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <ChainDauPanelClient adsPreview={ads === "preview"} />;
}
