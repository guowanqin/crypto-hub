import type { Metadata } from "next";
import QqqiPanelClient from "@/components/QqqiPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/qqqi-panel 站内直接使用 QQQI 攒股收息定投估值工具（与 /tag/qqqi 共用同一看板组件）。
const tool = getTool("qqqi-panel")!;
const path = "/tool/qqqi-panel";

const TITLE = `QQQI 攒股收息定投计算器｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用 QQQI 攒股收息定投计算器：现价、52 周水位、最近派息、TTM 派息与当前分红率自动调取，最近 24 次派息历史可查，分红率按自身历史分位给出收息角度的估值参考，再用定投模拟器逐月算清每月投入、年限、分红再投入下的期末股数与月收息。QQQI 派息含期权金与可能的资本返还（ROC）成分，分红率不等于总回报，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "QQQI",
    "QQQI分红",
    "QQQI派息",
    "QQQI定投计算器",
    "攒股收息",
    "收息定投",
    "NEOS QQQI",
    "月度派息ETF",
    "QQQI distribution",
    "QQQI dividend",
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

export default async function QqqiPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <QqqiPanelClient adsPreview={ads === "preview"} />;
}
