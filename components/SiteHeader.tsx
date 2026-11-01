"use client";

import Link from "next/link";
import { SITE_NAME, MASCOT_NAME } from "@/lib/site";
import { useLang } from "./LangProvider";

export default function SiteHeader() {
  const { lang, setLang } = useLang();
  return (
    <header className="site-header">
      <Link href="/" className="brand-link">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="brand-avatar" />
        <span className="brand-name">{SITE_NAME[lang]}</span>
      </Link>
      <span className="header-spacer" />
      <div className="lang-switch" role="group" aria-label="Language / 语言">
        <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>
          中文
        </button>
        <span className="lang-sep">|</span>
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
          EN
        </button>
      </div>
    </header>
  );
}
