"use client";

import Link from "next/link";
import { getTool } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME, SITE_NAME, type Lang } from "@/lib/site";
import type {
  MshSkillDir,
  MshGlossaryTerm,
  MshFaqItem,
  MshMeta,
} from "@/lib/marketing-skills";
import MarketingSkillsBoard from "./MarketingSkillsBoard";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

const tool = getTool("marketing-skills")!;

// 署名块文案（CC BY-NC 4.0 要求署名）：作者、源仓库、许可证与同步信息，
// 显著位置固定展示；tw 由 zh 经 OpenCC s2twp 离线转换写死（AGENTS.md §8）。
const ATTR: Record<
  Lang,
  {
    title: string;
    body: string;
    sourceRepo: string;
    licenseLabel: string;
    syncedLabel: string;
    commitLabel: string;
  }
> = {
  zh: {
    title: "内容来源与许可",
    body: "本页内容同步自 GitHub 开源仓库 marketing-skill-hub，作者 Aron 厚玉，按 CC BY-NC 4.0 许可证发布（署名即可免费分享，禁止商用转售）。本站仅提供免费站内阅读，同步时已剥离原文中的 Pro 版推销与社交账号引流成分。",
    sourceRepo: "源仓库",
    licenseLabel: "许可证",
    syncedLabel: "同步日期",
    commitLabel: "上游版本",
  },
  en: {
    title: "Source & Licence",
    body: "This page mirrors the GitHub open-source repo marketing-skill-hub by Aron Houyu, published under CC BY-NC 4.0 (free to share with attribution; no commercial resale). This site provides free on-site reading only; the sync strips the original's Pro upsells and social follow-bait.",
    sourceRepo: "Source repo",
    licenseLabel: "Licence",
    syncedLabel: "Synced",
    commitLabel: "Upstream rev",
  },
  tw: {
    title: "內容來源與許可",
    body: "本頁內容同步自 GitHub 開源倉庫 marketing-skill-hub，作者 Aron 厚玉，按 CC BY-NC 4.0 許可證釋出（署名即可免費分享，禁止商用轉售）。本站僅提供免費站內閱讀，同步時已剝離原文中的 Pro 版推銷與社交賬號引流成分。",
    sourceRepo: "源倉庫",
    licenseLabel: "許可證",
    syncedLabel: "同步日期",
    commitLabel: "上游版本",
  },
};

interface Props {
  adsPreview?: boolean;
  directory: MshSkillDir[];
  glossary: MshGlossaryTerm[];
  faq: MshFaqItem[];
  meta: MshMeta;
}

export default function MarketingSkillsPanelClient({
  adsPreview = false,
  directory,
  glossary,
  faq,
  meta,
}: Props) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const attr = ATTR[lang];

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
        <span className="crumb-sep">·</span>
        <Link href="/tag/office">{TAG_MAP["office"].name[lang]}</Link>
      </p>

      <section className="detail-head">
        <div className="tool-badges">
          <span className="badge badge-embedded">{t.embeddedBadge}</span>
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
      </section>

      {tool.image && (
        <figure className="detail-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tool.image} alt={tool.name[lang]} className="detail-image" />
        </figure>
      )}

      {/* 署名块（许可证要求）：作者 / 源仓库 / 许可证 / 同步信息 */}
      <section className="card msh-attr">
        <h2>{attr.title}</h2>
        <p className="body-text">{attr.body}</p>
        <p className="body-text msh-attr-meta">
          {attr.sourceRepo}：
          <a href={meta.repoUrl} target="_blank" rel="noopener noreferrer">
            github.com/{meta.repo}
          </a>
          {" · "}
          {attr.licenseLabel}：
          <a href={meta.licenseUrl} target="_blank" rel="noopener noreferrer">
            {meta.license}
          </a>
          {" · "}
          {attr.syncedLabel}：{meta.syncedAt}
          {" · "}
          {attr.commitLabel}：{meta.sourceCommit.slice(0, 7)}
        </p>
      </section>

      {/* 工具本体：站内直接使用 */}
      <MarketingSkillsBoard directory={directory} glossary={glossary} faq={faq} />

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
            {SITE_NAME[lang]} · {t.takeTitle}
          </h2>
          <p className="take-quote">“{tool.take[lang]}”</p>
        </div>
      </section>

      {/* 广告位：工具页底部横幅（介绍内容下方、页脚上方） */}
      <AdSlot id="tool_bottom" preview={adsPreview} />
    </main>
  );
}
