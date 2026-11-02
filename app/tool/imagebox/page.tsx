import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import ImageBoxClient from "@/components/ImageBoxClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const tool = getTool("imagebox")!;
const path = "/tool/imagebox";

export const metadata: Metadata = {
  title: `图片工具箱｜${SITE_NAME.zh}`,
  description: `${tool.oneLiner.zh} 批量压缩、改尺寸加水印、九宫格切图、拼图、长图拼接、二维码生成、EXIF 清除、打码、图片转 GIF——全部在浏览器本地处理，图片不上传，免费免注册。`,
  keywords: [
    "图片工具箱",
    "在线图片压缩",
    "九宫格切图",
    "图片拼图",
    "长图拼接",
    "二维码生成",
    "EXIF清除",
    "图片打码",
    "图片转GIF",
    "image toolbox",
    "compress images online",
    "币圈工具导航",
  ],
  ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
    siteName: SITE_NAME.zh,
    title: `图片工具箱｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
  twitter: {
    card: "summary_large_image",
    title: `图片工具箱｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
};

export default async function ImageBoxPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <ImageBoxClient adsPreview={ads === "preview"} />
      <RelatedTools slug="imagebox" />
      <ToolJsonLd slug="imagebox" />
    </>
  );
}
