import type { Metadata } from "next";
import SlangDictClient from "@/components/SlangDictClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/slang-dict 站内直接使用二手黑话词典（与 /tag/slang 共用同一词典组件）。
const tool = getTool("slang-dict")!;
const path = "/tool/slang-dict";

const TITLE = `二手黑话词典｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 币圈工具导航站内直接查二手黑话词典：闲鱼、转转、小红书的黑话暗语全文搜索，按 27 个分类与存活状态（现行可用/抽检限流/平台拦截）筛选，词条卡片带变体列表、百科释义、卖家潜台词与买家避坑，另有拼音首字母缩写反查。数据每日自动同步自 GitHub MIT 开源词库 Domainsun/awesome-chinese-secondhand-slang，定位买家解码避坑，不提供卖家文案黑话转译。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "二手黑话词典",
    "闲鱼黑话",
    "闲鱼暗语",
    "闲鱼避坑",
    "转转黑话",
    "二手交易暗语",
    "黑话查询",
    "拼音缩写反查",
    "secondhand slang dictionary",
    "xianyu slang",
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

export default async function SlangDictPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <SlangDictClient adsPreview={ads === "preview"} />;
}
