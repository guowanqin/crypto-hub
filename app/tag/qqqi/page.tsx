import type { Metadata } from "next";
import QqqiClient from "@/components/QqqiClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/qqqi 不走通用标签模板，主体是 QQQI 攒股收息定投估值看板。
// SEO 标题由需求指定：「QQQI 攒股收息定投计算器｜18btc 币圈工具导航」。
const tag = getTag("qqqi")!;
const path = "/tag/qqqi";

const TITLE = `QQQI 收息定投工具合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "QQQI（NEOS Nasdaq-100 High Income ETF）攒股收息定投估值工具：现价、52 周水位、TTM 派息合计与当前分红率自动调取，附 24 次派息历史、分红率历史分位参考与逐月定投模拟计算器。2024 年上市、历史短，派息含期权金与资本返还（ROC）成分，分红率不等于总回报，不构成投资建议。";

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
  other: { "tools:count": String(toolsByTag("qqqi").length) },
};

export default async function QqqiTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <QqqiClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
