"use client";

// PerShare 计算器外壳：从 pershare.cc 独立站 app/Shell.tsx 移植。
// 适配点（仅外壳 glue，不动计算逻辑）：
// - 语言改由导航站 LangProvider 的全站中英切换驱动，不再用独立站自己的 bnc-lang localStorage；
//   计算器内不再设语言按钮，全站只保留站头一处中英切换，计算器只读 lang 渲染。
// - document.title 由本站页面 metadata 固定，不再随 BNC/HYPE 标签改写；
// - ?tab=hype 仍可分享，但写回的是本页路径（/tool/pershare），不再跳独立站根路径。
// - 两个标签页都保持挂载（隐藏而非卸载），切换不丢失各自的区间与设置状态（与源站一致）。
import { useEffect, useState } from "react";
import Calculator from "./Calculator";
import HypeCalculator from "./HypeCalculator";
import { useLang } from "../LangProvider";
import type { Lang } from "@/lib/site";
import type { AssetTab } from "@/lib/pershare/i18n";

const TAB_LABELS: Record<AssetTab, Record<Lang, string>> = {
  bnc: { zh: "BNC · BNB 财库公司", en: "BNC · BNB Treasury" },
  hype: { zh: "HYPE · PURR 财库公司", en: "HYPE · PURR Treasury" },
};

export default function PerShareShell() {
  const { lang } = useLang();
  const [tab, setTab] = useState<AssetTab>("bnc");

  /* 标签初始化：读 URL 查询参数 ?tab=hype */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (q === "hype" || q === "bnc") setTab(q);
    } catch {
      /* 忽略 */
    }
  }, []);

  const switchTab = (next: AssetTab) => {
    setTab(next);
    try {
      const url =
        window.location.pathname + (next === "hype" ? "?tab=hype" : "");
      window.history.replaceState(null, "", url);
    } catch {
      /* 忽略 */
    }
  };

  return (
    <div className="pershare-tool">
      <div className="tabbar" role="tablist" aria-label="Asset">
        {(["bnc", "hype"] as AssetTab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={"tab-btn" + (tab === key ? " on" : "")}
            onClick={() => switchTab(key)}
          >
            {TAB_LABELS[key][lang]}
          </button>
        ))}
      </div>

      <div style={{ display: tab === "bnc" ? undefined : "none" }}>
        <Calculator lang={lang} />
      </div>
      <div style={{ display: tab === "hype" ? undefined : "none" }}>
        <HypeCalculator lang={lang} />
      </div>
    </div>
  );
}
