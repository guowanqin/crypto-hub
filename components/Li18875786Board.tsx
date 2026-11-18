"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  LI18875786_ITEMS,
  LI18875786_UPDATED,
  li18875786Categories,
  filterLi18875786Items,
} from "@/lib/li18875786";

interface BoardDict {
  boardKicker: string;
  boardMetaPrefix: string;
  updatedOn: string;
  searchLabel: string;
  searchPlaceholder: string;
  allCategories: string;
  totalItems: string;
  addedOn: string;
  newBadge: string;
  openQuark: string;
  emptyTitle: string;
  emptyBody: string;
  methodTitle: string;
  methodBody: string;
  honestTitle: string;
  honestBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  sourcesTitle: string;
}

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "夸克网盘资源 · 每天更新的课程与资料目录",
    boardMetaPrefix: "来源：X 账号 @li18875786 的公开资源目录",
    updatedOn: "数据更新于",
    searchLabel: "搜索资源",
    searchPlaceholder: "输入标题关键词…",
    allCategories: "全部",
    totalItems: "条资源",
    addedOn: "收录于",
    newBadge: "新",
    openQuark: "打开夸克网盘",
    emptyTitle: "没有符合条件的资源",
    emptyBody: "换个搜索词或分类试试。",
    methodTitle: "收录口径（全部公开）",
    methodBody: "本页收录 X 账号 @li18875786 公开资源目录里带夸克网盘链接的条目：每个夸克链接一条，只有百度网盘链接的条目不收；按目录原顺序排列（新在前）。标题为本站按 SEO 长尾规则改写的版本：保留原课程名与真实信息，去掉符号、大小与营销空话。目录本身没有逐条日期，本页的「收录日期」是本站首次抓取到该条目的日期（现有条目均为 2026-11-17 首次收录），近 7 天新收录的带「新」标记。分类按标题关键词自动归类，可能个别分得不准，以标题为准。本站每天 10:00 自动拉取目录更新。",
    honestTitle: "这个榜能看什么、不能看什么",
    honestBody: "能看：最近又分享了哪些课程和资料，顺着分类或搜索找。不能看：资源质量与完整度——本站没有逐个下载核验，内容以网盘里实际文件为准。",
    disclaimerTitle: "第三方分享链接，使用前请自行判断",
    disclaimerBody: "本页链接均为第三方分享，与本站无关；链接可能随时失效，内容版权归原作者所有，本页仅作目录索引、供学习交流。下载与使用前请结合自己的判断，重要资料请自行备份。",
    sourcesTitle: "数据来源",
  },
  en: {
    boardKicker: "Quark Drive Resources · a daily-updated directory of courses and materials",
    boardMetaPrefix: "Source: the public resource directory of X account @li18875786",
    updatedOn: "Updated",
    searchLabel: "Search resources",
    searchPlaceholder: "Type a title keyword…",
    allCategories: "All",
    totalItems: "resources",
    addedOn: "Collected",
    newBadge: "NEW",
    openQuark: "Open in Quark Drive",
    emptyTitle: "No resources match",
    emptyBody: "Try a different search term or category.",
    methodTitle: "How the board works (fully disclosed)",
    methodBody: "This page lists the entries with a Quark Drive link from the public resource directory of X account @li18875786: one item per Quark link — entries that only carry a Baidu Drive link are not collected. Items keep the directory's own order (newest first). Titles are this site's SEO long-tail rewrites of the originals: course names and factual details are kept, decorative symbols, file sizes and marketing filler are removed. The directory gives no per-item date; the date shown is when this site first collected the item (all current items were first collected on 2026-11-17), and items collected in the last 7 days carry a NEW badge. Categories are assigned automatically from title keywords and may occasionally be off — trust the title. This site re-fetches the directory automatically at 10:00 every day.",
    honestTitle: "What this board can and cannot tell you",
    honestBody: "It can tell you which courses and materials were shared recently, browsable by category or search. It cannot tell you about quality or completeness — nothing here was downloaded and verified item by item; what is actually inside each drive share is what counts.",
    disclaimerTitle: "Third-party share links — judge for yourself before using",
    disclaimerBody: "Every link here is a third-party share and is not affiliated with this site; links may stop working at any time, and copyright belongs to the original authors. This page is only an index, for study and exchange. Judge for yourself before downloading or using anything, and keep your own backup of anything important.",
    sourcesTitle: "Data sources",
  },
  // TW-START
  tw: {
    boardKicker: "夸克網盤資源 · 每天更新的課程與資料目錄",
    boardMetaPrefix: "來源：X 賬號 @li18875786 的公開資源目錄",
    updatedOn: "資料更新於",
    searchLabel: "搜尋資源",
    searchPlaceholder: "輸入標題關鍵詞…",
    allCategories: "全部",
    totalItems: "條資源",
    addedOn: "收錄於",
    newBadge: "新",
    openQuark: "開啟夸克網盤",
    emptyTitle: "沒有符合條件的資源",
    emptyBody: "換個搜尋詞或分類試試。",
    methodTitle: "收錄口徑（全部公開）",
    methodBody: "本頁收錄 X 賬號 @li18875786 公開資源目錄裡帶夸克網盤連結的條目：每個夸克連結一條，只有百度網盤連結的條目不收；按目錄原順序排列（新在前）。標題為本站按 SEO 長尾規則改寫的版本：保留原課程名與真實資訊，去掉符號、大小與營銷空話。目錄本身沒有逐條日期，本頁的「收錄日期」是本站首次抓取到該條目的日期（現有條目均為 2026-11-17 首次收錄），近 7 天新收錄的帶「新」標記。分類按標題關鍵詞自動歸類，可能個別分得不準，以標題為準。本站每天 10:00 自動拉取目錄更新。",
    honestTitle: "這個榜能看什麼、不能看什麼",
    honestBody: "能看：最近又分享了哪些課程和資料，順著分類或搜尋找。不能看：資源質量與完整度——本站沒有逐個下載核驗，內容以網盤裡實際檔案為準。",
    disclaimerTitle: "第三方分享連結，使用前請自行判斷",
    disclaimerBody: "本頁連結均為第三方分享，與本站無關；連結可能隨時失效，內容版權歸原作者所有，本頁僅作目錄索引、供學習交流。下載與使用前請結合自己的判斷，重要資料請自行備份。",
    sourcesTitle: "資料來源",
  },
  // TW-END
};

export default function Li18875786Board() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => li18875786Categories(LI18875786_ITEMS), []);
  // 「新」标记：晚于首批收录日、且在数据更新日 7 天内新收录的条目。
  // 首批 364 条是同一天整体收录的，不算「新」。
  const firstCollected = LI18875786_ITEMS.reduce(
    (min, it) => (it.added < min ? it.added : min),
    LI18875786_ITEMS[0]?.added ?? LI18875786_UPDATED
  );
  const isNew = (added: string) => {
    if (added <= firstCollected) return false;
    const diff =
      (Date.parse(LI18875786_UPDATED) - Date.parse(added)) / 86400000;
    return diff >= 0 && diff <= 7;
  };
  const visible = useMemo(
    () => filterLi18875786Items(LI18875786_ITEMS, query, category),
    [query, category]
  );

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMetaPrefix}
          {` · ${d.updatedOn} ${LI18875786_UPDATED}`}
        </p>
      </div>

      <div className="mood-controls" style={{ marginTop: 16 }}>
        <label>
          {d.searchLabel}
          <input
            type="search"
            value={query}
            placeholder={d.searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 260 }}
            aria-label={d.searchLabel}
          />
        </label>
      </div>

      <div className="chips-row" style={{ marginTop: 12 }} role="group" aria-label={d.allCategories}>
        <button
          type="button"
          className={`filter-chip${category === "" ? " on" : ""}`}
          onClick={() => setCategory("")}
          aria-pressed={category === ""}
        >
          {d.allCategories} ({LI18875786_ITEMS.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`filter-chip${category === c.name ? " on" : ""}`}
            onClick={() => setCategory(category === c.name ? "" : c.name)}
            aria-pressed={category === c.name}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      <p className="burn-note" style={{ marginTop: 12 }}>
        {visible.length} {d.totalItems}
      </p>

      {visible.length === 0 ? (
        <>
          <p className="burn-note">{d.emptyTitle}</p>
          <p className="body-text">{d.emptyBody}</p>
        </>
      ) : (
        <div>
          {visible.map((item) => (
            <article
              key={item.id}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "14px 0",
              }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 17, lineHeight: 1.5 }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <p className="body-text" style={{ margin: 0, fontSize: 13 }}>
                <span className="chip">{item.category}</span>{" "}
                · {d.addedOn} {item.added}
                {isNew(item.added) ? (
                  <>
                    {" "}
                    <span className="chip">{d.newBadge}</span>
                  </>
                ) : null}{" "}
                ·{" "}
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {d.openQuark} ↗
                </a>
              </p>
            </article>
          ))}
        </div>
      )}

      <h3 className="sub-title">{d.methodTitle}</h3>
      <p className="body-text">{d.methodBody}</p>

      <h3 className="sub-title">{d.honestTitle}</h3>
      <p className="body-text">{d.honestBody}</p>

      <h3 className="sub-title">{d.disclaimerTitle}</h3>
      <p className="body-text">{d.disclaimerBody}</p>

      <h3 className="sub-title">{d.sourcesTitle}</h3>
      <p className="body-text">
        X ·{" "}
        <a href="https://x.com/li18875786" target="_blank" rel="noopener noreferrer">
          @li18875786
        </a>
        {" · "}
        <a href="https://zy.zcw20241221.workers.dev/" target="_blank" rel="noopener noreferrer">
          zy.zcw20241221.workers.dev
        </a>
      </p>
    </section>
  );
}
