// GitHub 开源精选（github-picks）：X 账号 @bkdgiffug（lumxss）的开源项目分享。
//
// 数据来源：该账号在 X 上的公开帖子（每天约 4–5 条，专发 GitHub 开源项目）。
// X 无免费公开接口、未登录只能看到最新几条，本站每天多次定时查看其主页，
// 把新帖搬进 data/github-picks.json（本站 cron 人工智能流程，非 GitHub Action）。
// 收录口径（页面公开）：只收带 GitHub 仓库链接的原创项目帖，纯推广、撸毛
// 空投、无仓库链接的帖子不收；同一仓库只收一次；Star 数、主要语言、开源
// 协议在收录时经 GitHub 官方 API 核对（原帖 Star 数常为旧数）；标题为本站
// 按 SEO 长尾规则改写的版本；added 是原帖发布日期（本站收录日与之相同或
// 随后补录时按原帖日期归位）；分类由固定关键词表按帖子与仓库说明自动归类。

import raw from "@/data/github-picks.json";

export interface GithubPickItem {
  /** owner/repo 全小写，全站唯一。 */
  id: string;
  /** owner/repo 原始大小写。 */
  repo: string;
  /** 本站 SEO 长尾改写标题。 */
  title: string;
  /** 本站原创简介（事实转述，不照抄原帖营销文案）。 */
  summary: string;
  /** GitHub 仓库链接。 */
  url: string;
  /** 在线体验链接（原帖或仓库给出时才有）。 */
  demoUrl?: string;
  /** Star 数：收录时 GitHub 官方 API 核对值，会随时间变化。 */
  stars: number;
  /** 主要语言（GitHub API），无则空串。 */
  language: string;
  /** 开源协议 SPDX（如 GPL-3.0），未识别则空串。 */
  license: string;
  category: string;
  /** 原帖发布日期 YYYY-MM-DD。 */
  added: string;
  /** 原帖链接（出处）。 */
  postUrl: string;
  /** 来源账号（不带 @）。 */
  source: string;
}

export interface GithubPicksData {
  /** 快照日期 YYYY-MM-DD（最近一次同步日期）。 */
  updated: string;
  items: GithubPickItem[];
}

export const GITHUB_PICKS_DATA: GithubPicksData =
  raw as unknown as GithubPicksData;

/** 全部条目（新在前）。 */
export const GITHUB_PICKS_ITEMS: GithubPickItem[] = GITHUB_PICKS_DATA.items;

/** 快照日期。 */
export const GITHUB_PICKS_UPDATED: string = GITHUB_PICKS_DATA.updated;

export interface CategoryCount {
  name: string;
  count: number;
}

/** 分类及条数，按条数从多到少排。 */
export function githubPicksCategories(
  items: GithubPickItem[]
): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh"));
}

/** 搜索（标题/简介/仓库名）+ 分类筛选。 */
export function filterGithubPicksItems(
  items: GithubPickItem[],
  query: string,
  category: string
): GithubPickItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category && item.category !== category) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.repo.toLowerCase().includes(q)
    );
  });
}

/** Star 数展示：80741 → 8.1万，8408 → 8408。 */
export function formatStars(stars: number): string {
  if (stars >= 10000) {
    const v = (stars / 10000).toFixed(1).replace(/\.0$/, "");
    return `${v}万`;
  }
  return String(stars);
}
