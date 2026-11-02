import type { Metadata } from "next";
import ChainDauClient from "@/components/ChainDauClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/chain-dau 不走通用标签模板，主体是公链日活排行看板。
// SEO 标题由需求指定：「公链日活排行｜每日活跃地址 TOP｜18btc 币圈工具导航」。
const tag = getTag("chain-dau")!;
const path = "/tag/chain-dau";

const TITLE = `公链日活数据合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "公链日活排行：波场、BSC、Solana、以太坊、比特币、Base、Arbitrum、Polygon、TON 等主流公链过去 24 小时的活跃地址数（日活）、7 日变化、TVL 与人均锁仓（TVL ÷ 日活）一页排名，数据取自 DeFiLlama 自动更新，可搜索可排序。地址不等于真人，口径页面内写明，不构成投资建议。";

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
  other: { "tools:count": String(toolsByTag("chain-dau").length) },
};

export default async function ChainDauTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <ChainDauClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
