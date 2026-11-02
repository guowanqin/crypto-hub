import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import PdfBoxClient from "@/components/PdfBoxClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/pdfbox 站内直接使用 PDF 工具箱（与 /tag/pdf 共用同一组件，纯前端本地处理）。
const tool = getTool("pdfbox")!;
const path = "/tool/pdfbox";

const TITLE = `PDF 工具箱｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用纯前端 PDF 工具箱：PDF 合并、按页码范围拆分或逐页拆分、页面删除/旋转/重排/插入空白页、文字水印、页码添加、骑缝章、指定页文字批注、图片转 PDF、PDF 转图片。全部处理在浏览器本地完成，文件不上传服务器，离线可用，免费无需注册。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "PDF工具箱",
    "PDF合并",
    "PDF拆分",
    "PDF水印",
    "PDF页码",
    "骑缝章",
    "PDF页面管理",
    "图片转PDF",
    "PDF转图片",
    "离线PDF工具",
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

export default async function PdfBoxPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <PdfBoxClient adsPreview={ads === "preview"} />
      <RelatedTools slug="pdfbox" />
      <ToolJsonLd slug="pdfbox" />
    </>
  );
}
