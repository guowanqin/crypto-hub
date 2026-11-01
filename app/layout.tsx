import type { Metadata, Viewport } from "next";
import "./globals.css";
import LangProvider from "@/components/LangProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
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
  inLanguage: ["zh-CN", "en"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <LangProvider>
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
