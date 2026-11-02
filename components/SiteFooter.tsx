"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HUB_DICT } from "@/lib/i18n";
import { GROUPS } from "@/lib/groups";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

/** 页脚上方广告位：预览开关从 URL 读取（页脚在 layout 中拿不到 searchParams props） */
function FooterAdSlot() {
  const searchParams = useSearchParams();
  return <AdSlot id="footer_top" preview={searchParams.get("ads") === "preview"} />;
}

export default function SiteFooter() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  return (
    <>
      {/* 广告位：全站页脚正上方，只出现一次 */}
      <Suspense fallback={null}>
        <FooterAdSlot />
      </Suspense>
      <footer className="site-footer">
        {/* 分类导航：7 个大类直达首页对应区块（方案一；标签页仍各自保留，文案随全站语言开关切换，页脚不另设语言切换） */}
        <nav className="footer-cats" aria-label={t.categoriesTitle}>
          <p className="footer-cats-title">{t.categoriesTitle}</p>
          <div className="footer-cats-grid">
            {GROUPS.map((group) => (
              <Link key={group.id} href={`/#${group.id}`} className="footer-cat-link">
                {group.name[lang]}
              </Link>
            ))}
          </div>
        </nav>
        <p className="footer-disclaimer">{t.disclaimer}</p>
        <p className="footer-note">{t.footerNote}</p>
      </footer>
    </>
  );
}
