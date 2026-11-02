"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/site";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: "zh", setLang: () => {} });

export const useLang = () => useContext(Ctx);

const STORAGE_KEY = "hub-lang";

const HTML_LANG: Record<Lang, string> = { zh: "zh-CN", tw: "zh-TW", en: "en" };

function isLang(v: string | null): v is Lang {
  return v === "zh" || v === "tw" || v === "en";
}

/**
 * 语言优先级：localStorage 手动选择 > IP 检测（服务端按 x-vercel-ip-country 映射，
 * 由根 layout 以 detectedLang 传入）> 默认 zh。
 * localStorage 只在用户手动切换时写入，自动判定不落盘，
 * 避免出境/旅行后 IP 变化时被旧的自动结果锁死。
 */
export default function LangProvider({
  children,
  detectedLang = "zh",
}: {
  children: React.ReactNode;
  detectedLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(detectedLang);

  // 挂载后读手动选择（SSR 首帧用 detectedLang，与服务端渲染一致，不产生水合差异）
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* 忽略 */
    }
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
