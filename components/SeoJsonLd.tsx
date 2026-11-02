import { getTool } from "@/lib/tools";
import { TAG_MAP, getTag } from "@/lib/tags";
import { SITE_URL } from "@/lib/site";

// 页面级结构化数据（SEO 审计 P1-2）：给每页注入与本页内容对应的 JSON-LD，
// 取代「全站同一份 WebSite+ItemList」的旧做法（站点级 WebSite 块仍在根 layout）。
// - 工具页：BreadcrumbList（首页 → 主标签 → 工具）+ SoftwareApplication
// - 标签页：BreadcrumbList（首页 → 标签）；带 faqs 的标签页另加 FAQPage（取页面已有问答数据）
// 文案口径与 metadata 一致维持简体（AGENTS.md §8）。

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const HOME_CRUMB = { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_URL}/` };

// 偏金融/数据类的标签 → FinanceApplication，其余 → UtilitiesApplication
const FINANCE_TAGS = new Set([
  "market",
  "onchain",
  "defi",
  "burn",
  "btc-bottom",
  "crcl",
  "qqqi",
  "qqq",
  "flows",
  "chain-dau",
]);

export function ToolJsonLd({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  const url = `${SITE_URL}/tool/${tool.slug}`;
  const primaryTag = TAG_MAP[tool.tags[0]];
  const crumbs: object[] = [HOME_CRUMB];
  if (primaryTag) {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: primaryTag.name.zh,
      item: `${SITE_URL}/tag/${primaryTag.id}`,
    });
  }
  crumbs.push({
    "@type": "ListItem",
    position: crumbs.length + 1,
    name: tool.name.zh,
    item: url,
  });
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs,
  };
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name.zh,
    url,
    description: tool.detail.zh,
    applicationCategory: tool.tags.some((t) => FINANCE_TAGS.has(t))
      ? "FinanceApplication"
      : "UtilitiesApplication",
    operatingSystem: "Web",
    // 第三方工具价格与授权归其官方站，不在此声明免费
    ...(tool.type === "own"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" } }
      : {}),
  };
  return (
    <>
      <JsonLdScript data={breadcrumb} />
      <JsonLdScript data={app} />
    </>
  );
}

export function TagJsonLd({ tagId }: { tagId: string }) {
  const tag = getTag(tagId);
  if (!tag) return null;
  const url = `${SITE_URL}/tag/${tag.id}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      HOME_CRUMB,
      { "@type": "ListItem", position: 2, name: tag.name.zh, item: url },
    ],
  };
  return (
    <>
      <JsonLdScript data={breadcrumb} />
      {tag.faqs && tag.faqs.length > 0 && (
        <JsonLdScript
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tag.faqs.map((f) => ({
              "@type": "Question",
              name: f.q.zh,
              acceptedAnswer: { "@type": "Answer", text: f.a.zh },
            })),
          }}
        />
      )}
    </>
  );
}
