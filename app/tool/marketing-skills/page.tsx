import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import MarketingSkillsPanelClient from "@/components/MarketingSkillsPanelClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  MSH_META,
  getSkillDirectory,
  getGlossary,
  getFaq,
} from "@/lib/marketing-skills";

// 专属工具页：/tool/marketing-skills 站内直接使用出海营销技能库
// （9 个海外营销技能全文 + 术语表 + 新手 100 问，数据同步自 GitHub
// 开源仓库 aronhy/marketing-skill-hub，CC BY-NC 4.0，页面带署名块）。
const tool = getTool("marketing-skills")!;
const path = "/tool/marketing-skills";

const TITLE = `出海营销技能库｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用出海营销技能库：GitHub 开源仓库 marketing-skill-hub 的 9 个海外营销技能（增长战略、广告投放、广告文案、UGC 视频、投放优化、冷邮件外联、邮件营销、私域成交、社媒运营）全文站内读，中英正文与配套参考文档齐全，另附中英对照术语表（88 条）与出海新手 100 问，全部可搜索、可按功能分组筛选。内容按 CC BY-NC 4.0 许可镜像，原文的 Pro 推销与引流成分已剥离。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "出海营销",
    "海外营销技能",
    "营销技能库",
    "Agent Skills",
    "AI营销",
    "跨境电商运营",
    "独立站推广",
    "广告投放教程",
    "冷邮件",
    "邮件营销",
    "私域成交",
    "社媒运营",
    "出海术语表",
    "出海新手问答",
    "marketing skill hub",
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

export default async function MarketingSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  const glossary = getGlossary();
  const faq = getFaq();
  return (
    <>
      <MarketingSkillsPanelClient
        adsPreview={ads === "preview"}
        directory={getSkillDirectory()}
        glossary={glossary.terms}
        faq={faq.items}
        meta={MSH_META}
      />
      <RelatedTools slug="marketing-skills" />
      <ToolJsonLd slug="marketing-skills" />
    </>
  );
}
