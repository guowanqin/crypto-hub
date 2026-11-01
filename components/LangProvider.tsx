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

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "zh") setLangState(saved);
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* 忽略 */
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
