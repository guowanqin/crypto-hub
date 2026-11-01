"use client";

import { HUB_DICT } from "@/lib/i18n";
import { useLang } from "./LangProvider";

export default function SiteFooter() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  return (
    <footer className="site-footer">
      <p className="footer-disclaimer">{t.disclaimer}</p>
      <p className="footer-note">{t.footerNote}</p>
    </footer>
  );
}
