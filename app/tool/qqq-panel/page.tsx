import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import QqqPanelClient from "@/components/QqqPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/qqq-panel 站内直接使用 QQQ 定投估值/回测工具（与 /tag/qqq 共用同一看板组件）。
const tool = getTool("qqq-panel")!;
const path = "/tool/qqq-panel";

const TITLE = `QQQ 定投回测计算器｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用 QQQ 定投回测计算器：现价、距 ATH 回撤、52 周水位、MA200 偏离自动调取，估值温度按全公开的子分规则定档（偏冷/中性偏冷/中性偏热/偏热）；回测器用 1999 年上市以来全史月线与季度分红，任选起始年月与每月定投金额，算出期末股数、年化、期间最大回撤与逐年汇总，并对比同额一次性买入。历史回测不代表未来，不构成投资建议。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "QQQ定投",
    "QQQ估值",
    "QQQ定投计算器",
    "定投回测",
    "定投计算器",
    "纳斯达克100定投",
    "纳指ETF",
    "QQQ PE",
    "QQQ回测",
    "QQQ DCA",
    "QQQ backtest",
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

export default async function QqqPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <QqqPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="qqq-panel" />
    </>
  );
}
