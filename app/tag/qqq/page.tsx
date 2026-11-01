import type { Metadata } from "next";
import QqqClient from "@/components/QqqClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/qqq 不走通用标签模板，主体是 QQQ 定投估值/回测看板。
// SEO 标题由需求指定：「QQQ 定投回测计算器｜18btc 币圈工具导航」。
const tag = getTag("qqq")!;
const path = "/tag/qqq";

const TITLE = `QQQ 定投回测计算器｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "QQQ（Invesco QQQ Trust，纳斯达克 100 ETF）定投估值与回测工具：现价、距 ATH 回撤、52 周水位、MA200 偏离自动调取，拼成口径全公开的估值温度（偏冷/中性偏冷/中性偏热/偏热）；定投回测器用 1999 年上市以来全史月线与季度分红，任选起始年月与每月金额，算出期末股数、摊薄成本、年化（XIRR 近似）、期间最大回撤与逐年汇总，并对比同额一次性买入。历史回测不代表未来，不构成投资建议。";

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
  other: { "tools:count": String(toolsByTag("qqq").length) },
};

export default async function QqqTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <QqqClient tag={tag} adsPreview={ads === "preview"} />;
}
