import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import UnlocksToolClient from "@/components/UnlocksToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/unlocks-board 站内直接看代币解锁日历榜——
// 未来 7 天与 30 天的代币悬崖解锁按日期排列，大额（占流通量 ≥5% 或
// 金额 ≥$2,000 万）提前标红，MON 等口径有分歧的条目置顶并双标口径；
// 数据由 Tokenomist API 免费试用每天自动更新 7 天窗口，未接入时用
// DefiLlama 公开页标注日期的快照兜底。解锁是供给事实，不是涨跌预测。
const tool = getTool("unlocks-board")!;
const path = "/tool/unlocks-board";

const TITLE = `代币解锁日历榜｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内看代币解锁日历榜：未来 7 天与 30 天的代币悬崖解锁按日期排列，解锁量、美元估值、占流通量比例与归属方一栏看清，占流通量 ≥5% 或金额 ≥$2,000 万的提前标红，MON（Monad）等口径有分歧的条目置顶并把两个口径都标出来。数据由 Tokenomist API 免费试用每天自动更新 7 天窗口，未接入时用 DefiLlama 公开页标注日期的快照兜底；解锁是供给端的事实，不是涨跌预测，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "代币解锁",
    "解锁日历",
    "代币解锁日历榜",
    "MON 解锁",
    "Monad 解锁",
    "ZRO 解锁",
    "Tokenomist",
    "DefiLlama",
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

export default async function UnlocksBoardToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <UnlocksToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="unlocks-board" />
      <ToolJsonLd slug="unlocks-board" />
    </>
  );
}
