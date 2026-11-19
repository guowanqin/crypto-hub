// 夸克网盘资源（quark-resources）：X 账号 @li18875786 的公开资源目录。
//
// 数据来源：该账号每条帖子统一指向的资源目录站
// https://zy.zcw20241221.workers.dev/（公开静态页，无需登录、无需 key），
// 由 scripts/update-li18875786.py 每天拉取、清洗后写入 data/li18875786.json，
// 经 GitHub Action 每天 10:00 CST 自动更新。本页不直连源站，只读快照数据。
// 第二来源（2026-11-19 并入）：@FLMdongtianfudi 的 Telegram 频道公开预览
// （t.me/s/FLMdongtianfudi），同一脚本合并抓取、按夸克 ID 去重；
// 过滤口径为站长所定：只过滤成人/色情内容，影视与破解游戏照常收录。
// 收录口径（页面公开）：每个夸克网盘链接一条，只有百度链接的条目不收；
// 按夸克 ID 去重、保持目录原顺序（新在前）；标题为本站按 SEO 长尾规则
// 改写的版本（对照表 data/li18875786-titles.json，更新脚本自动套用）；
// 目录没有逐条日期，条目的 added 是本站首次收录日期，不编源站日期；
// 分类由解析器内的固定关键词表按标题自动归类。

import raw from "@/data/li18875786.json";

export interface Li18875786Item {
  /** 夸克分享 ID（pan.quark.cn/s/<id> 中的 id，全站唯一）。 */
  id: string;
  title: string;
  /** 夸克网盘分享链接 https://pan.quark.cn/s/<id>。 */
  url: string;
  category: string;
  /** 本站首次收录日期 YYYY-MM-DD（源站不提供逐条日期，这是本站口径）。 */
  added: string;
}

export interface Li18875786Data {
  /** 快照日期 YYYY-MM-DD（拉取当天）。 */
  updated: string;
  items: Li18875786Item[];
}

export const LI18875786_DATA: Li18875786Data = raw as unknown as Li18875786Data;

/** 全部条目（目录原顺序，新在前）。 */
export const LI18875786_ITEMS: Li18875786Item[] = LI18875786_DATA.items;

/** 快照日期。 */
export const LI18875786_UPDATED: string = LI18875786_DATA.updated;

export interface CategoryCount {
  name: string;
  count: number;
}

/** 分类及条数，按条数从多到少排。 */
export function li18875786Categories(items: Li18875786Item[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh"));
}

/** 搜索（标题/链接）+ 分类筛选。 */
export function filterLi18875786Items(
  items: Li18875786Item[],
  query: string,
  category: string
): Li18875786Item[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category && item.category !== category) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q)
    );
  });
}
