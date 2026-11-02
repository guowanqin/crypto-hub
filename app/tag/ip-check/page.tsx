import type { Metadata } from "next";
import IpCheckClient from "@/components/IpCheckClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/ip-check 不走通用标签模板，主体是 IP 风险检测与网络环境自查工具。
// SEO 标题由需求指定：「IP 风险检测｜18btc 币圈工具导航」。
const tag = getTag("ip-check")!;
const path = "/tag/ip-check";

const TITLE = `IP 风险检测工具合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "IP 风险检测与网络环境自查：输入 IP 或域名（打开自动先查你的出口 IP），查地理位置、ASN、运营商与网段，判定 IDC 机房 / 家宽住宅 / 移动网络属性，按公开规则给风险分并逐项列出证据；附 RDAP Whois、WebRTC 泄露与浏览器环境检测（本地完成不上传）。风险分是公开信号评分，不是商业欺诈分。";

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
  other: { "tools:count": String(toolsByTag("ip-check").length) },
};

export default async function IpCheckTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <IpCheckClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
