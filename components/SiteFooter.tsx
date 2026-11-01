"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HUB_DICT } from "@/lib/i18n";
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
        <p className="footer-disclaimer">{t.disclaimer}</p>
        <p className="footer-note">{t.footerNote}</p>
      </footer>
    </>
  );
}
