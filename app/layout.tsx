import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import LangProvider from "@/components/LangProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, type Lang } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

// SITE_URL 为空（域名未定）时不输出 canonical / og:url / metadataBase，域名定了填常量即可生效。
const hasSiteUrl = SITE_URL !== "";

export const viewport: Viewport = {
  themeColor: "#FAF6ED",
};

export const metadata: Metadata = {
  ...(hasSiteUrl
    ? {
        metadataBase: new URL(SITE_URL),
        alternates: { canonical: SITE_URL + "/" },
      }
    : {}),
  title: SITE_TITLE.zh,
  description: SITE_DESCRIPTION.zh,
  keywords: [
    "币圈工具导航",
    "币圈工具",
    "加密工具导航",
    "行情数据工具",
    "链上分析工具",
    "DeFi工具",
    "18btc",
    "crypto tools directory",
    "best crypto tools",
    "on-chain analytics tools",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(hasSiteUrl ? { url: SITE_URL + "/" } : {}),
    siteName: SITE_NAME.zh,
    title: SITE_TITLE.zh,
    description: SITE_DESCRIPTION.zh,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE.zh,
    description: SITE_DESCRIPTION.zh,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME.zh,
  alternateName: SITE_NAME.en,
  ...(hasSiteUrl ? { url: SITE_URL + "/" } : {}),
  inLanguage: ["zh-CN", "zh-TW", "en"],
  description: SITE_DESCRIPTION.zh,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name.zh,
      ...(hasSiteUrl ? { url: `${SITE_URL}/tool/${tool.slug}` } : {}),
    })),
  },
};

/** 按访客 IP 国家（Vercel 注入的 x-vercel-ip-country）映射首次访问默认语言：
 *  台港澳 → 繁體；中、新、马 → 简体；其他 → 英文；无此 header（本地开发）→ 简体。
 *  只决定首次默认，用户手动切换后以其选择为准（见 LangProvider）。 */
function detectLang(country: string | null): Lang {
  switch ((country ?? "").toUpperCase()) {
    case "TW":
    case "HK":
    case "MO":
      return "tw";
    case "CN":
    case "SG":
    case "MY":
      return "zh";
    default:
      return country ? "en" : "zh";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const country = (await headers()).get("x-vercel-ip-country");
  const detectedLang = detectLang(country);
  return (
    <html lang="zh-CN">
      <body>
        <LangProvider detectedLang={detectedLang}>
          <div className="site-wrap">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </LangProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
