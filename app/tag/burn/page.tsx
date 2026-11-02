import type { Metadata } from "next";
import UniBurnClient from "@/components/UniBurnClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/burn 不走通用标签模板，主体是 UNI 销毁数据看板。
// SEO 标题由需求指定：「UNI 销毁数据｜18btc 币圈工具导航」。
const tag = getTag("burn")!;
const path = "/tag/burn";

const TITLE = `UNI 销毁数据｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "实时追踪 UNI 销毁：直接读取以太坊主网 UNI 合约，统计 UNI 累计销毁量、销毁占初始供应比例、有效供应、近 24 小时与近 30 天销毁量、年化销毁量与年化通缩率，并逐笔列出最近销毁记录（附交易哈希，可在 Etherscan 核对）。Uniswap 协议费驱动的 UNI 通缩，一页看清。";

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
  other: { "tools:count": String(toolsByTag("burn").length) },
};

export default async function BurnTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <UniBurnClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
