import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import FolderVaultClient from "@/components/FolderVaultClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const tool = getTool("foldervault")!;
const path = "/tool/foldervault";

export const metadata: Metadata = {
  title: `文件夹加密保险箱｜${SITE_NAME.zh}`,
  description: `${tool.oneLiner.zh} AES-256-GCM 分块加密 + Argon2id 密钥派生，密码与恢复密钥双解锁，全部在浏览器本地完成，文件不上传，免费免注册。`,
  keywords: [
    "文件夹加密",
    "文件加密保险箱",
    "在线文件加密",
    "文件夹加密网页版",
    "AES-256加密",
    "folder vault",
    "encrypt files online",
    "币圈工具导航",
  ],
  ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
    siteName: SITE_NAME.zh,
    title: `文件夹加密保险箱｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
  twitter: {
    card: "summary_large_image",
    title: `文件夹加密保险箱｜${SITE_NAME.zh}`,
    description: tool.oneLiner.zh,
  },
};

export default async function FolderVaultPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <FolderVaultClient adsPreview={ads === "preview"} />
      <RelatedTools slug="foldervault" />
    </>
  );
}
