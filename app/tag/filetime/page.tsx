import type { Metadata } from "next";
import FileTimeClient from "@/components/FileTimeClient";
import { getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TagJsonLd } from "@/components/SeoJsonLd";

// 专属标签页：/tag/filetime 不走通用标签模板，主体是站内可用的照片 EXIF 时间修改工具。
// SEO 标题由需求指定：「照片/文件时间修改｜18btc 币圈工具导航」。
// 口径必须如实：本工具改的是照片内嵌的 EXIF 时间，不是硬盘文件的系统时间。
const tag = getTag("filetime")!;
const path = "/tag/filetime";

const TITLE = `文件时间修改工具合集｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在线批量修改 JPEG 照片内嵌的 EXIF 时间：拍摄、创建、修改时间三者同步，支持统一设置、整体平移与按张递增三种模式，GPS 与设备信息原样保留，改前改后逐张对照，单张或 ZIP 下载。全程浏览器本地处理，文件不上传。修改文件系统时间的桌面版 NewFileTime 也在同标签收录。";

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
  other: { "tools:count": String(toolsByTag("filetime").length) },
};

export default async function FileTimeTagPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <FileTimeClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
