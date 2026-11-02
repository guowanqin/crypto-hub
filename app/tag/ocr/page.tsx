import type { Metadata } from "next";
import OcrClient from "@/components/OcrClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/ocr 不走通用标签模板，主体是站内可用的本地 OCR 工具。
// SEO 标题由需求指定：「图片文字识别 OCR｜18btc 币圈工具导航」。
const tag = getTag("ocr")!;
const path = "/tag/ocr";

const TITLE = `OCR 文字识别工具合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在线图片文字识别 OCR（浏览器本地识别、图片不上传）：批量导入最多 20 张图片，中英混合识别（简体中文 + 英文），结果按行展示、可在原图高亮定位、逐行编辑纠错，导出 TXT、Markdown、Word 或 ZIP。首次需下载识别模型，之后离线可用，免费免注册。印刷体效果好，手写与复杂表格弱于云端 OCR。";

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
  other: { "tools:count": String(toolsByTag("ocr").length) },
};

export default async function OcrTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <OcrClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
