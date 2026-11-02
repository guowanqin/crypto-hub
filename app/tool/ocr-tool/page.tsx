import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import OcrToolClient from "@/components/OcrToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/ocr-tool 站内直接使用本地 OCR（与 /tag/ocr 共用同一工具组件）。
const tool = getTool("ocr-tool")!;
const path = "/tool/ocr-tool";

const TITLE = `图片文字识别 OCR｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用本地 OCR：基于 Tesseract 引擎在浏览器里识别图片文字，图片不上传。批量导入最多 20 张，中英混合识别（简体中文 + 英文），结果按行展示、可在原图高亮定位、逐行编辑纠错，导出 TXT、Markdown、Word 或 ZIP。印刷体与截图效果好，手写与复杂表格弱于云端 OCR。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "图片文字识别",
    "在线OCR",
    "本地OCR",
    "图片转文字",
    "截图转文字",
    "OCR文字识别",
    "图片提取文字",
    "批量OCR",
    "免费OCR",
    "ocr online",
    "image to text",
    "tesseract ocr",
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

export default async function OcrToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <OcrToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="ocr-tool" />
      <ToolJsonLd slug="ocr-tool" />
    </>
  );
}
