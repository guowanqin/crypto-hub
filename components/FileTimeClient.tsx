"use client";

import Link from "next/link";
import type { TagDef } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME, type Lang } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import FileTimeTool from "./FileTimeTool";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    boardSub: string;
    boundaryTitle: string;
    boundaryParas: string[];
    scenesTitle: string;
    scenesParas: string[];
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "照片 EXIF 时间修改 · 站内可用",
    boardSub:
      "改的是照片内嵌的拍摄/创建/修改时间，本地处理不上传；改前改后逐张对照，确认了再导出。",
    boundaryTitle: "先说清：这里改的是哪种时间",
    boundaryParas: [
      "照片的时间分两处：一处是电脑里文件的系统时间（资源管理器里看到的创建/修改时间），另一处是照片文件内嵌的 EXIF 时间（拍摄时间、创建时间、修改时间）。本工具改的是后一处，三个 EXIF 字段同步修改，GPS、设备等其余信息原样保留。",
      "网页出于安全限制，改不了你硬盘上任何已有文件的系统时间；而且通过浏览器下载回去的文件，它的系统「修改时间」会变成下载那一刻——这是浏览器下载的统一行为，不是修改没生效。相册按时间排序、打卡系统补传照片时，读的都是 EXIF 时间，所以这些场景用本工具就够。",
      "如果你要改的正是电脑里文件的系统创建时间/修改时间，请用下方收录的桌面版 NewFileTime（Windows 小工具，免安装），它能在本地直接改文件与文件夹的系统时间。",
    ],
    scenesTitle: "适合哪些场景",
    scenesParas: [
      "相机/手机时钟设错了一批照片：用「整体平移」按差值统一纠正；只有文件时间的照片也能以文件时间为基准平移。补打卡、补传一组连续拍摄：用「按张递增」从第一张的时间开始，每张自动加几分钟，排出自然的时间序列。整理扫描件与旧照片：用「统一设置」把一批照片对齐到实际拍摄日期。",
      "小提醒：导出前请逐张核对列表里的「原时间 → 新时间」；个别平台（如部分社交软件）会二次压缩并重写照片，EXIF 可能被平台再次改动，那种情况不在本工具能控制的范围内。",
    ],
    toolsTitle: "文件时间 · 本类工具",
  },
  en: {
    boardKicker: "Photo EXIF Time Editor · Built-in",
    boardSub:
      "Edits the date taken, digitized and modified times embedded in your photos — locally, no uploads. Check the before/after for every photo, then export.",
    boundaryTitle: "First, be clear which clock this changes",
    boundaryParas: [
      "A photo's date lives in two places: the system timestamps of the file on your disk (the created/modified times shown in your file manager), and the EXIF times embedded in the photo itself (date taken, digitized, modified). This tool edits the second: all three EXIF fields are rewritten together, while GPS, device info and everything else stay untouched.",
      "For security reasons a web page cannot change the system timestamps of any file already on your disk; and a file you download back will carry the download moment as its system modified time — that is standard browser download behaviour, not a failed edit. Album sorting and attendance back-fills read the EXIF time, so those scenarios are fully covered here.",
      "If what you need to change is precisely the system created/modified time of files on your computer, use the desktop NewFileTime listed below (a portable Windows utility, no install): it changes the system timestamps of local files and folders directly.",
    ],
    scenesTitle: "When this is the right tool",
    scenesParas: [
      "A batch of photos from a camera with a wrong clock: use Shift to correct them all by the same offset — photos that only have a file time can be shifted from that base. Back-filling a check-in sequence: use Step to start at the first photo's moment and add a few minutes per photo, producing a natural timeline. Tidying scans and old photos: use Set to align a whole batch to the real shooting date.",
      "One caution: check each row's before → after before exporting. Some platforms re-compress uploads and rewrite photo metadata again — what they do after upload is outside this tool's control.",
    ],
    toolsTitle: "File Time · Tools in this shelf",
  },
};

export default function FileTimeClient({
  tag,
  adsPreview = false,
}: {
  tag: TagDef;
  adsPreview?: boolean;
}) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];
  const list = toolsByTag(tag.id);
  const otherLang = lang === "zh" ? "en" : "zh";

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
      </p>
      <section className="tag-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="tag-mascot" />
        <div>
          <p className="tag-kicker">
            {t.tagPageIntro} · {t.toolsCount.replace("{n}", String(list.length))}
          </p>
          <h1 className="tag-title">
            {tag.name[lang]}
            <span className="tag-title-alt">{tag.name[otherLang]}</span>
          </h1>
          <p className="tag-intro">{tag.intro[lang]}</p>
        </div>
      </section>

      {/* 广告位：标签页顶部横幅 */}
      <AdSlot id="tag_top" preview={adsPreview} />

      <section className="ft-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">{d.boardSub}</p>
        </div>
        <FileTimeTool />
      </section>

      <div className="burn-notes">
        <div className="card">
          <h2>{d.boundaryTitle}</h2>
          {d.boundaryParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
          <p className="body-text" style={{ marginTop: 10 }}>
            {t.disclaimer}
          </p>
        </div>
        <div className="card">
          <h2>{d.scenesTitle}</h2>
          {d.scenesParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {list.length > 0 && (
        <section className="section">
          <h2 className="section-title">{d.toolsTitle}</h2>
          <div className="card-grid">
            {list.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
