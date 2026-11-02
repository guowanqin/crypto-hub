"use client";

import Link from "next/link";
import { SIGN_IMAGE } from "@/lib/visuals";
import { MASCOT_NAME, type Lang } from "@/lib/site";
import { useLang } from "@/components/LangProvider";

// 自定义 404：举牌吉祥物引导回首页（牌面无字，文案走 HTML 以便三语切换）。
// 文案三份齐备（AGENTS.md §8）：tw 按 OpenCC s2twp 口径离线写死，不做运行时转换。
const TEXT: Record<Lang, { title: string; body: string; home: string }> = {
  zh: {
    title: "页面不存在",
    body: "你要找的页面不在这里，回到首页看看其他工具。",
    home: "返回首页",
  },
  tw: {
    title: "頁面不存在",
    body: "你要找的頁面不在這裡，回到首頁看看其他工具。",
    home: "返回首頁",
  },
  en: {
    title: "Page not found",
    body: "The page you're looking for isn't here — head back home to browse the tools.",
    home: "Back to home",
  },
};

export default function NotFound() {
  const { lang } = useLang();
  const t = TEXT[lang];
  return (
    <main className="page">
      <div className="notfound">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SIGN_IMAGE} alt={MASCOT_NAME[lang]} width={800} height={800} />
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link className="btn primary big" href="/">
          {t.home}
        </Link>
      </div>
    </main>
  );
}
