import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import FileTimeToolClient from "@/components/FileTimeToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/filetime 站内直接使用照片 EXIF 时间修改工具（与 /tag/filetime 共用同一组件）。
// 口径必须如实：本工具改的是照片内嵌的 EXIF 时间，不是硬盘文件的系统时间。
const tool = getTool("filetime")!;
const path = "/tool/filetime";

const TITLE = `照片/文件时间修改｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接使用照片时间修改工具：在线批量修改 JPEG 照片内嵌的 EXIF 时间——拍摄时间、创建时间、修改时间三者同步，支持统一设置、整体平移（±天/时/分）与按张递增三种模式，GPS 与设备信息原样保留，改前改后逐张对照，单张或 ZIP 打包下载。全程浏览器本地处理，文件不上传。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "照片时间修改",
    "文件时间修改",
    "EXIF 时间修改",
    "批量修改照片时间",
    "照片拍摄时间修改",
    "NewFileTime 网页版",
    "photo exif time editor",
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

export default async function FileTimeToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <FileTimeToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="filetime" />
      <ToolJsonLd slug="filetime" />
    </>
  );
}
