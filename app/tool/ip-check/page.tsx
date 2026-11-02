import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import IpCheckPanelClient from "@/components/IpCheckPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/ip-check 站内直接使用 IP 风险检测工具（与 /tag/ip-check 共用同一组件）。
const tool = getTool("ip-check")!;
const path = "/tool/ip-check";

const TITLE = `IP 风险检测｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用 IP 风险检测：打开自动自查出口 IP，也可查任意 IP 或域名的地理位置、ASN、运营商与网段，按公开规则判定机房 / 家宽 / 移动属性并给出逐项列明的风险分，附 RDAP Whois、WebRTC 泄露与浏览器环境检测。后两项在浏览器本地完成，不上传服务器。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "IP检测",
    "IP风险检测",
    "IP查询",
    "原生IP检测",
    "机房IP",
    "家宽IP",
    "WebRTC泄露检测",
    "Whois查询",
    "IP check",
    "IP risk score",
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

export default async function IpCheckToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <IpCheckPanelClient adsPreview={ads === "preview"} />
      <RelatedTools slug="ip-check" />
      <ToolJsonLd slug="ip-check" />
    </>
  );
}
