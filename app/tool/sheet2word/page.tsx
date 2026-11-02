import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import Sheet2WordClient from "@/components/Sheet2WordClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const tool = getTool("sheet2word")!;
const path = "/tool/sheet2word";

export const metadata: Metadata = {
  title: `Excel 批量生成 Word（站内可用）｜${SITE_NAME.zh}`,
  description: `${tool.oneLiner.zh} 在线邮件合并替代：本地处理不上传、完全免费、无行数限制、免注册——在币圈工具导航站内直接使用。`,
  keywords: [
    "Excel批量生成Word",
    "批量生成Word文档",
    "在线邮件合并",
    "Word模板批量生成",
    "generate word documents from excel",
    "mail merge online",
    "币圈工具导航",
  ],
  ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
    siteName: SITE_NAME.zh,
    title: `Excel 批量生成 Word（站内可用）｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
  twitter: {
    card: "summary_large_image",
    title: `Excel 批量生成 Word（站内可用）｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
};

export default async function Sheet2WordPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <Sheet2WordClient adsPreview={ads === "preview"} />
      <RelatedTools slug="sheet2word" />
      <ToolJsonLd slug="sheet2word" />
    </>
  );
}
