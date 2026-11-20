"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  GITHUB_PICKS_ITEMS,
  GITHUB_PICKS_UPDATED,
  githubPicksCategories,
  filterGithubPicksItems,
  formatStars,
} from "@/lib/github-picks";

interface BoardDict {
  boardKicker: string;
  updatedOn: string;
  searchLabel: string;
  searchPlaceholder: string;
  allCategories: string;
  totalItems: string;
  postedOn: string;
  newBadge: string;
  openRepo: string;
  viewPost: string;
  tryDemo: string;
  emptyTitle: string;
  emptyBody: string;
  showMore: string;
  left: string;
  collapse: string;
  methodTitle: string;
  methodBody: string;
  honestTitle: string;
  honestBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
}

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "GitHub 开源精选 · 每天同步的开源项目分享",
    updatedOn: "数据更新于",
    searchLabel: "搜索项目",
    searchPlaceholder: "输入项目名或关键词…",
    allCategories: "全部",
    totalItems: "个项目",
    postedOn: "发布于",
    newBadge: "新",
    openRepo: "GitHub 仓库",
    viewPost: "原帖",
    tryDemo: "在线体验",
    emptyTitle: "没有符合条件的项目",
    emptyBody: "换个搜索词或分类试试。",
    showMore: "显示更多",
    left: "剩余",
    collapse: "收起",
    methodTitle: "收录口径（全部公开）",
    methodBody: "本页每天同步 X 博主 lumxss（@bkdgiffug）的 GitHub 开源项目分享：只收带 GitHub 仓库链接的原创帖，纯推广、撸毛空投、没有仓库链接的帖子不收，同一仓库只收一次，按首次收录顺序排列（新在前）。每条的 Star 数、主要语言、开源协议在收录时经 GitHub 官方接口核对，博主原帖里的 Star 数常为旧数、与仓库实际不符的以核对值为准；Star 数会随时间变化，本页不逐日刷新旧条目数字。标题为本站按 SEO 长尾规则改写的版本：保留项目名与真实信息，去掉感叹式营销话术，不编造功能与数字。分类按帖子正文与仓库说明的关键词自动归类，可能个别分得不准，以标题和仓库为准。X 未登录只能看到最新几条，本站每天多次定时查看，极端情况下个别帖子可能漏收，漏收会在后续补录时按原帖日期归位。",
    honestTitle: "这个榜能看什么、不能看什么",
    honestBody: "能看：最近又有哪些值得收的开源项目，按分类或搜索快速定位，顺手核对 Star、语言和协议。不能看：项目质量的最终结论——本站没有逐个安装实测，好不好用要看仓库 README、Issue 区和你自己的试用；涉及账号、付费与免费通道的项目，风险提示都在条目里，务必自己判断。",
    disclaimerTitle: "第三方分享，使用前请自行判断",
    disclaimerBody: "本页条目均来自第三方在 X 上的公开分享，仓库版权与责任归各项目作者所有，本页仅作目录索引并注明原帖出处。开源协议以各仓库 LICENSE 为准；使用任何项目前请先看清协议与说明，涉及账号安全、付费服务的项目请自行评估风险。",
  },
  en: {
    boardKicker: "GitHub Open-Source Picks · project shares synced daily",
    updatedOn: "Updated",
    searchLabel: "Search projects",
    searchPlaceholder: "Type a project name or keyword…",
    allCategories: "All",
    totalItems: "projects",
    postedOn: "Posted",
    newBadge: "NEW",
    openRepo: "GitHub repo",
    viewPost: "Original post",
    tryDemo: "Live demo",
    emptyTitle: "No projects match",
    emptyBody: "Try a different search term or category.",
    showMore: "Show more",
    left: "left",
    collapse: "Collapse",
    methodTitle: "How the board works (fully disclosed)",
    methodBody: "This page syncs the GitHub open-source project shares of X creator lumxss (@bkdgiffug) every day: only original posts that carry a GitHub repository link are collected — pure promotions, airdrop-farming posts and posts without a repo link are skipped, and each repository is collected once, newest first. Every item's star count, primary language and license were checked against the official GitHub API when collected; the star numbers in the original posts are often stale, so the checked values win. Star counts change over time and old entries are not re-checked daily. Titles are this site's SEO long-tail rewrites: project names and factual details are kept, hype is removed, and nothing is invented. Categories are assigned automatically from keywords in the post and the repository description and may occasionally be off — trust the title and the repo. Logged-out X only shows the latest few posts; this site checks several times a day, but in rare cases a post may be missed and later backfilled under its original date.",
    honestTitle: "What this board can and cannot tell you",
    honestBody: "It can tell you which open-source projects are worth a look lately, browsable by category or search, with stars, language and license checked at a glance. It cannot give a final verdict on quality — nothing here was installed and tested one by one; read the repo's README and issues and try it yourself. For projects touching accounts, payments or free tiers, the risk notes are in each entry — judge for yourself.",
    disclaimerTitle: "Third-party shares — judge for yourself before using",
    disclaimerBody: "Every entry comes from a third party's public post on X; copyright and responsibility for each repository belong to its authors. This page is only an index and credits the original post for each item. Licenses follow each repository's LICENSE file; before using any project, read its license and docs, and assess the risk yourself for anything involving account safety or paid services.",
  },
  // TW-START
  tw: {
    boardKicker: "GitHub 開源精選 · 每天同步的開源專案分享",
    updatedOn: "資料更新於",
    searchLabel: "搜尋專案",
    searchPlaceholder: "輸入專案名或關鍵詞…",
    allCategories: "全部",
    totalItems: "個專案",
    postedOn: "發佈於",
    newBadge: "新",
    openRepo: "GitHub 倉庫",
    viewPost: "原帖",
    tryDemo: "在線體驗",
    emptyTitle: "沒有符合條件的專案",
    emptyBody: "換個搜尋詞或分類試試。",
    showMore: "顯示更多",
    left: "剩餘",
    collapse: "收起",
    methodTitle: "收錄口徑（全部公開）",
    methodBody: "本頁每天同步 X 博主 lumxss（@bkdgiffug）的 GitHub 開源專案分享：只收帶 GitHub 倉庫連結的原創帖，純推廣、擼毛空投、沒有倉庫連結的帖子不收，同一倉庫只收一次，按首次收錄順序排列（新在前）。每條的 Star 數、主要語言、開源協議在收錄時經 GitHub 官方介面核對，博主原帖裡的 Star 數常為舊數、與倉庫實際不符的以核對值為準；Star 數會隨時間變化，本頁不逐日重新整理舊條目數字。標題為本站按 SEO 長尾規則改寫的版本：保留專案名與真實資訊，去掉感嘆式營銷話術，不編造功能與數字。分類按帖子正文與倉庫說明的關鍵詞自動歸類，可能個別分得不準，以標題和倉庫為準。X 未登入只能看到最新幾條，本站每天多次定時檢視，極端情況下個別帖子可能漏收，漏收會在後續補錄時按原帖日期歸位。",
    honestTitle: "這個榜能看什麼、不能看什麼",
    honestBody: "能看：最近又有哪些值得收的開源專案，按分類或搜尋快速定位，順手核對 Star、語言和協議。不能看：專案質量的最終結論——本站沒有逐個安裝實測，好不好用要看倉庫 README、Issue 區和你自己的試用；涉及帳號、付費與免費通道的專案，風險提示都在條目裡，務必自己判斷。",
    disclaimerTitle: "第三方分享，使用前請自行判斷",
    disclaimerBody: "本頁條目均來自第三方在 X 上的公開分享，倉庫版權與責任歸各專案作者所有，本頁僅作目錄索引並註明原帖出處。開源協議以各倉庫 LICENSE 為準；使用任何專案前請先看清協議與說明，涉及帳號安全、付費服務的專案請自行評估風險。",
  },
  // TW-END
};

const INITIAL_SHOWN = 6; // 首屏条数（站内列表分级展开规则）
const STEP_SHOWN = 12; // 每次展开增量

export default function GithubPicksBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [shown, setShown] = useState(INITIAL_SHOWN);

  const categories = useMemo(() => githubPicksCategories(GITHUB_PICKS_ITEMS), []);
  // 「新」标记：数据更新日 7 天内发布的条目（首批整体收录的同一天条目不算新，
  // 与夸克页口径一致：以全集最早日期为界）。
  const firstCollected = GITHUB_PICKS_ITEMS.reduce(
    (min, it) => (it.added < min ? it.added : min),
    GITHUB_PICKS_ITEMS[0]?.added ?? GITHUB_PICKS_UPDATED
  );
  const isNew = (added: string) => {
    if (added <= firstCollected) return false;
    const diff =
      (Date.parse(GITHUB_PICKS_UPDATED) - Date.parse(added)) / 86400000;
    return diff >= 0 && diff <= 7;
  };
  const visible = useMemo(
    () => filterGithubPicksItems(GITHUB_PICKS_ITEMS, query, category),
    [query, category]
  );
  const pageItems = visible.slice(0, shown);
  const remaining = visible.length - pageItems.length;

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {`${d.updatedOn} ${GITHUB_PICKS_UPDATED}`}
        </p>
      </div>

      <div className="mood-controls" style={{ marginTop: 16 }}>
        <label>
          {d.searchLabel}
          <input
            type="search"
            value={query}
            placeholder={d.searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(INITIAL_SHOWN);
            }}
            style={{ maxWidth: 260 }}
            aria-label={d.searchLabel}
          />
        </label>
      </div>

      <div className="chips-row" style={{ marginTop: 12 }} role="group" aria-label={d.allCategories}>
        <button
          type="button"
          className={`filter-chip${category === "" ? " on" : ""}`}
          onClick={() => {
            setCategory("");
            setShown(INITIAL_SHOWN);
          }}
          aria-pressed={category === ""}
        >
          {d.allCategories} ({GITHUB_PICKS_ITEMS.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`filter-chip${category === c.name ? " on" : ""}`}
            onClick={() => {
              setCategory(category === c.name ? "" : c.name);
              setShown(INITIAL_SHOWN);
            }}
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
          {pageItems.map((item) => (
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
              <p className="body-text" style={{ margin: "0 0 6px" }}>
                {item.summary}
              </p>
              <p className="body-text" style={{ margin: 0, fontSize: 13 }}>
                <span className="chip">{item.category}</span>{" "}
                <span className="chip">{item.repo}</span> ★{" "}
                {formatStars(item.stars)}
                {item.language ? <> · {item.language}</> : null}
                {item.license ? <> · {item.license}</> : null}
                {" "}· {d.postedOn} {item.added}
                {isNew(item.added) ? (
                  <>
                    {" "}
                    <span className="chip">{d.newBadge}</span>
                  </>
                ) : null}{" "}
                ·{" "}
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {d.openRepo} ↗
                </a>{" "}
                ·{" "}
                <a href={item.postUrl} target="_blank" rel="noopener noreferrer">
                  {d.viewPost} ↗
                </a>
                {item.demoUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">
                      {d.tryDemo} ↗
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          ))}
          {remaining > 0 ? (
            <p style={{ marginTop: 12 }}>
              <button
                type="button"
                className="filter-chip"
                onClick={() => setShown(shown + STEP_SHOWN)}
              >
                {d.showMore}（{d.left} {remaining}）
              </button>
            </p>
          ) : visible.length > INITIAL_SHOWN ? (
            <p style={{ marginTop: 12 }}>
              <button
                type="button"
                className="filter-chip"
                onClick={() => setShown(INITIAL_SHOWN)}
              >
                {d.collapse}
              </button>
            </p>
          ) : null}
        </div>
      )}

      <h3 className="sub-title">{d.methodTitle}</h3>
      <p className="body-text">{d.methodBody}</p>

      <h3 className="sub-title">{d.honestTitle}</h3>
      <p className="body-text">{d.honestBody}</p>

      <h3 className="sub-title">{d.disclaimerTitle}</h3>
      <p className="body-text">{d.disclaimerBody}</p>
    </section>
  );
}
