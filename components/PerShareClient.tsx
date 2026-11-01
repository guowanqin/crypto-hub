"use client";

import Link from "next/link";
import { getTool } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import PerShareShell from "./pershare/PerShareShell";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

const tool = getTool("pershare")!;

export default function PerShareClient({ adsPreview = false }: { adsPreview?: boolean }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
        <span className="crumb-sep">·</span>
        <Link href="/tag/market">{TAG_MAP.market.name[lang]}</Link>
      </p>

      <section className="detail-head">
        <div className="tool-badges">
          <span className="badge badge-own">{t.ownBadge}</span>
          <span className="badge badge-embedded">{t.embeddedBadge}</span>
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
      </section>

      {/* 计算器本体：站内直接使用（BNC / HYPE 双标签，实时行情） */}
      <PerShareShell />

      <section className="card" style={{ marginTop: 20 }}>
        <h2>{t.detailTitle}</h2>
        <p className="body-text">{tool.detail[lang]}</p>
        <h3 className="sub-title">{t.audienceTitle}</h3>
        <p className="body-text">{tool.audience[lang]}</p>
      </section>

      <section className="card take-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="take-avatar" />
        <div>
          <h2 className="take-heading">
            {MASCOT_NAME[lang]} · {t.takeTitle}
          </h2>
          <p className="take-quote">“{tool.take[lang]}”</p>
        </div>
      </section>

      <p className="standalone-line">
        <a href={tool.url} target="_blank" rel="noopener noreferrer">
          {t.openStandalone}
        </a>
      </p>

      {/* 广告位：工具页底部横幅（介绍内容下方、页脚上方） */}
      <AdSlot id="tool_bottom" preview={adsPreview} />
    </main>
  );
}
