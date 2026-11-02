import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import DevToolsClient from "@/components/DevToolsClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/devtools 站内直接使用开发者工具箱（20 件纯前端小工具）。
const tool = getTool("devtools")!;
const path = "/tool/devtools";

const TITLE = `开发者工具箱｜Base64、JSON 格式化、时间戳转换、UUID 生成｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用的开发者工具箱：Base64 与 URL 编解码、Unicode 转义、进制与 Hex 互转、MD5 与 SHA 哈希、JWT 解码、密码强度检测、UUID 与随机密码生成、JSON 格式化校验、时间戳与颜色转换、单位换算、文本处理与对比，共 20 件小工具，全部本地运行不上传，免费免注册。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "开发者工具箱",
    "在线工具",
    "Base64 编码",
    "Base64 解码",
    "JSON 格式化",
    "JSON 校验",
    "时间戳转换",
    "UUID 生成器",
    "哈希计算",
    "MD5 在线",
    "SHA256",
    "JWT 解码",
    "URL 编码",
    "进制转换",
    "颜色转换",
    "随机密码生成",
    "developer toolbox",
    "base64 decode",
    "json formatter",
    "timestamp converter",
    "uuid generator",
    "jwt decoder",
    "hash calculator",
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

export default async function DevToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <DevToolsClient adsPreview={ads === "preview"} />
      <RelatedTools slug="devtools" />
      <ToolJsonLd slug="devtools" />
    </>
  );
}
