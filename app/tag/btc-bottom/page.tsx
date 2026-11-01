import type { Metadata } from "next";
import BtcCycleClient from "@/components/BtcCycleClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/btc-bottom 不走通用标签模板，主体是 BTC 周期抄底看板。
// SEO 标题由需求指定：「BTC 抄底倒计时｜18btc 币圈工具导航」。
const tag = getTag("btc-bottom")!;
const path = "/tag/btc-bottom";

const TITLE = `BTC 抄底倒计时｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "按四年减半周期与实时区块高度推演 BTC 周期位置：当前周期位置、熊市进度、距本轮熊底（位置 0）的倒计时与目标区块、五档分批建仓触发位（0.20 / 0.15 / 0.10 / 0.05 / 0.02），以及第 5 次减半（位置 0.5）与下轮牛顶（位置 1）的预计日期。数据源为实时链上（mempool.space）。模型推演，不构成投资建议。";

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
  other: { "tools:count": String(toolsByTag("btc-bottom").length) },
};

export default async function BtcBottomTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <BtcCycleClient tag={tag} adsPreview={ads === "preview"} />;
}
