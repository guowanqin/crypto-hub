import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import SiduChishuiToolClient from "@/components/SiduChishuiToolClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/sidu-chishui 站内直接游玩四渡赤水回合制小游戏——
// 1935 年红军四渡赤水，回合制走格子、渡河、摆脱围追，史实日期与渡口全对得上。
const tool = getTool("sidu-chishui")!;
const path = "/tool/sidu-chishui";

const TITLE = `四渡赤水小游戏｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内玩四渡赤水小游戏：1935 年红军四渡赤水的回合制策略棋，带队伍走格子、渡河、摆脱国民党大军围追堵截，南下云南跳出包围圈。每次渡河都有按史实写的战史小注。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "四渡赤水",
    "四渡赤水小游戏",
    "长征",
    "红军",
    "回合制",
    "策略游戏",
    "遵义",
    "娄山关",
    "金沙江",
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

export default async function SiduChishuiToolPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <SiduChishuiToolClient adsPreview={ads === "preview"} />
      <RelatedTools slug="sidu-chishui" />
      <ToolJsonLd slug="sidu-chishui" />
    </>
  );
}
