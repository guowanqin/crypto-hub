import type { Metadata } from "next";
import PdfClient from "@/components/PdfClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属标签页：/tag/pdf 不走通用标签模板，主体是站内可用的 PDF 工具箱
//（合并 / 拆分 / 页面管理 / 水印 / 页码 / 骑缝章 / 批注 / 转换，纯前端本地处理）。
// SEO 标题由需求指定：「PDF 工具箱｜18btc 币圈工具导航」。
const tag = getTag("pdf")!;
const path = "/tag/pdf";

const TITLE = `PDF 工具箱｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "纯前端在线 PDF 工具箱：PDF 合并、按页码范围拆分或逐页拆分、页面删除/旋转/重排/插入空白页、文字水印、页码添加、骑缝章、指定页文字批注、图片转 PDF、PDF 转图片。参考信创 PDF 工具箱功能集，全部处理在浏览器本地完成，文件不上传服务器，离线可用，免费无需注册。";

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
  other: { "tools:count": String(toolsByTag("pdf").length) },
};

export default async function PdfTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <PdfClient tag={tag} adsPreview={ads === "preview"} />;
}
