"use client";

import Link from "next/link";
import { getTool } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME } from "@/lib/site";
import Sheet2WordTool from "./Sheet2WordTool";
import { useLang } from "./LangProvider";

const tool = getTool("sheet2word")!;

export default function Sheet2WordClient() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
        <span className="crumb-sep">·</span>
        <Link href="/tag/office">{TAG_MAP.office.name[lang]}</Link>
      </p>

      <section className="detail-head">
        <div className="tool-badges">
          <span className="badge badge-own">{t.ownBadge}</span>
          <span className="badge badge-embedded">{t.embeddedBadge}</span>
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
      </section>

      {/* 工具本体：站内直接使用 */}
      <Sheet2WordTool />

      <section className="card">
        <h2>{t.detailTitle}</h2>
        <p className="body-text">{tool.detail[lang]}</p>
        <h3 className="sub-title">{t.audienceTitle}</h3>
        <p className="body-text">{tool.audience[lang]}</p>
        <p className="standalone-line">
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {t.openStandalone.replace(" →", "")}（sheet2word.cc）→
          </a>
        </p>
      </section>

      <section className="card jinbijun-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jinbijun-avatar.webp" alt={MASCOT_NAME[lang]} className="jinbijun-avatar" />
        <div>
          <h2 className="jinbijun-heading">
            {MASCOT_NAME[lang]} · {t.jinbijunTitle}
          </h2>
          <p className="jinbijun-quote">“{tool.jinbijun[lang]}”</p>
        </div>
      </section>
    </main>
  );
}
