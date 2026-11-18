// 代币解锁日历榜（unlocks-board）：未来 7 天 / 30 天代币悬崖解锁日历。
//
// 数据走两条通道（页面公开）：
//  1) Tokenomist API（免费试用）：scripts/update-unlocks.py 每天 10:00 CST 由
//     GitHub Action 调用 GET https://api.tokenomist.ai/v5/unlock/events/upcoming
//     更新 7 天窗口（key 只存仓库 Secrets 的 TOKENOMIST_API_KEY，代码里没有 key）。
//     免费试用口径（2026-11-18 查 docs.tokenomist.ai 现行文档）：1,000 次/月、
//     120 次/分钟、50 个试用代币、upcoming 只看未来 7 天——所以 API 只更新
//     7 天窗口；30 天窗口在免费档下只有合计与快照条目，逐条明细待升级套餐。
//  2) 种子快照：key 未配上之前，用 data/unlocks.json 里的 DefiLlama Unlocks
//     公开页快照（2026-11-17）出榜，逐条标来源与口径，拿不到的明细留空说明，
//     绝不编造条目。
// 红标规则（页面公开）：占流通量 ≥5% 或美元估值 ≥$2,000 万。
// 「占流通量」口径：快照为 DefiLlama 的占流通量 %；API 的 valueToMarketCap 是
// 解锁额 ÷ 当前市值（同一价格下与解锁量 ÷ 流通量等价），同列展示并在页面注明。
// 本页只读打包进站的 data/unlocks.json，不直连上游 API。

import raw from "@/data/unlocks.json";

export interface UnlockItem {
  /** Tokenomist / DefiLlama 的代币 slug。 */
  tokenId: string;
  symbol: string;
  name: string;
  /** 解锁日期 YYYY-MM-DD。 */
  date: string;
  /** 日期口径有分歧时的区间结束日（ZRO：DefiLlama 记 11-19、另一来源记 11-20）。 */
  dateEnd: string | null;
  /** 解锁量（枚）；快照未确证时为 null，页面留空并在条目注里说明。 */
  amount: number | null;
  /** 美元估值；未确证时为 null。 */
  valueUsd: number | null;
  /** 占流通量 %；未确证时为 null。 */
  pctCirc: number | null;
  /** 归属方（团队 / 投资者 / 社区等）；数据源没给时为空串，页面标「未披露」。 */
  allocations: string;
  /** 解锁类型，目前只有悬崖解锁 "cliff"（两个数据源的 upcoming 口径都是 cliff）。 */
  type: string;
  /** 置顶（如口径分歧最大的 MON）。 */
  pinned: boolean;
  /** 条目注（口径分歧、缺项说明等），无则为空串。 */
  note: string;
}

export interface UnlocksData {
  /** 数据日期 YYYY-MM-DD（快照日或 API 拉取日），也是窗口计算的锚点。 */
  updated: string;
  /** "snapshot"（种子快照）| "tokenomist"（API 自动更新）。 */
  source: string;
  sourceLabel: string;
  totals: {
    /** 未来 7 天解锁总额（美元）；无可靠口径时为 null。 */
    next7dUsd: number | null;
    /** 未来 30 天解锁总额（美元）；免费档 API 不提供，接入后为 null。 */
    next30dUsd: number | null;
  };
  items: UnlockItem[];
}

export const UNLOCKS_DATA: UnlocksData = raw as unknown as UnlocksData;

/** 数据日期（窗口锚点）。 */
export const UNLOCKS_UPDATED: string = UNLOCKS_DATA.updated;

/** 红标阈值（页面公开）：占流通量 ≥5%。 */
export const ALERT_PCT = 5;
/** 红标阈值（页面公开）：美元估值 ≥$2,000 万。 */
export const ALERT_VALUE_USD = 20_000_000;

/** 是否触发红标：占流通量 ≥5% 或金额 ≥$2,000 万，任一命中即标。 */
export function isUnlockAlert(item: UnlockItem): boolean {
  return (
    (item.pctCirc !== null && item.pctCirc >= ALERT_PCT) ||
    (item.valueUsd !== null && item.valueUsd >= ALERT_VALUE_USD)
  );
}

function parseDay(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** 榜单排序：置顶在前，其余按日期从近到远、同日按美元估值从大到小。 */
export function sortUnlockItems(items: UnlockItem[]): UnlockItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (b.valueUsd ?? 0) - (a.valueUsd ?? 0);
  });
}

/** 全部条目（已按榜单规则排好）。 */
export const UNLOCK_ITEMS: UnlockItem[] = sortUnlockItems(UNLOCKS_DATA.items);

/**
 * 窗口筛选：以数据日期为锚点，取 [锚点, 锚点 + days 天] 内的条目
 * （含两端；MON 2026-11-24 恰在 2026-11-17 锚点的 7 天窗口边缘，含在内）。
 */
export function unlocksInWindow(
  items: UnlockItem[],
  days: number,
  anchor: string = UNLOCKS_UPDATED
): UnlockItem[] {
  const start = parseDay(anchor);
  const end = start + days * 86_400_000;
  return items.filter((item) => {
    const t = parseDay(item.date);
    return t >= start && t <= end;
  });
}
