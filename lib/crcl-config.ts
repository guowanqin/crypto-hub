import type { Lang } from "./site";

/**
 * CRCL（Circle Internet Group）财报类配置 —— 可编辑常量。
 *
 * 股价、RSI、USDC 供应/市占率都有免费自动源（见 lib/crcl.ts），唯独股本与
 * 利润表数据没有干净的免费自动接口，因此按本站建站流程做成可编辑字段：
 * 每项标注来源与截至日期，Circle 发布新财报后改这里即可（页面标注的
 * 「财报按发布日生效」也指这张表）。
 *
 * 数值起点（2026-11-01 核定，与第三方统计互核）：
 * - 流通股数 253.9M、稀释股数 268.6M（代理）：参考看板 2026-10-30 口径；
 *   当日收盘 $72.54 × 253.9M = 流通市值 $18.42B，与看板卡片一致。
 * - TTM 营收 $2,905M：按看板 P/S(TTM) 6.34x 反算（18.42B ÷ 6.34）；
 *   与 TipRanks 统计的 TTM 营收约 $2.91B（截至 2026Q2）互核一致。
 * - TTM 调整后 EBITDA $642M：按看板 市值/调整后EBITDA 28.7x（新口径）
 *   反算（18.42B ÷ 28.7 ≈ $641.8M）。
 */

export type CrclFinancialsConfig = typeof CRCL_FINANCIALS;

export interface CrclQuarter {
  /** 季度标识，如 2026Q2 */
  period: string;
  /** 季度结束日 */
  periodEnd: string;
  /** 营收（百万美元，总营收与储备收入） */
  revenueM: number;
  /** 调整后 EBITDA（百万美元） */
  ebitdaM: number;
  /** 本行数字出处（披露值 / 推导值 / 推估值），页面表格脚注用 */
  note: Record<Lang, string>;
}

export const CRCL_FINANCIALS = {
  /** 上市日期（Nasdaq，CRCL） */
  ipoDate: "2025-06-05",
  /** 流通股数（股） */
  sharesOutstanding: 253_900_000,
  /** 稀释股数（股，代理口径） */
  dilutedShares: 268_600_000,
  /** TTM 营收（百万美元） */
  revenueTTM_M: 2_905,
  /** TTM 调整后 EBITDA（百万美元，新口径） */
  ebitdaTTM_M: 642,
  /** 最新财报期结束日（2026Q2，2026-08-05 发布） */
  latestPeriodEnd: "2026-06-30",
  /** 股本口径说明 */
  sharesNote: {
    zh: "流通 253.9M 股、稀释 268.6M 股（代理）为参考看板 2026-10-30 口径，与 Circle 公开披露股本互核；新财报发布后在此更新。",
    en: "253.9M shares outstanding and 268.6M diluted (proxy) follow the reference board's 2026-10-30 caliber, cross-checked against Circle's disclosed share counts; update here after each new filing.",
    tw: "流通 253.9M 股、稀釋 268.6M 股（代理）為參考看板 2026-10-30 口徑，與 Circle 公開披露股本互核；新財報釋出後在此更新。",
  } as Record<Lang, string>,
  /** TTM 数字推导说明 */
  ttmNote: {
    zh: "TTM 营收 $2,905M 按参考看板 P/S(TTM) 6.34x 与流通市值反算，与第三方统计的 TTM 营收约 $2.91B 互核；TTM 调整后 EBITDA $642M 按 市值/调整后EBITDA 28.7x（新口径）反算。两者均为截至最新财报期（2026Q2）的滚动四季口径。",
    en: "TTM revenue of $2,905M is back-solved from the reference board's P/S (TTM) of 6.34x and its market cap, cross-checked against third-party TTM revenue of about $2.91B; TTM adjusted EBITDA of $642M is back-solved from market cap / adjusted EBITDA of 28.7x (new caliber). Both are trailing-four-quarter figures as of the latest reported period (2026Q2).",
    tw: "TTM 營收 $2,905M 按參考看板 P/S(TTM) 6.34x 與流通市值反算，與第三方統計的 TTM 營收約 $2.91B 互核；TTM 調整後 EBITDA $642M 按 市值/調整後EBITDA 28.7x（新口徑）反算。兩者均為截至最新財報期（2026Q2）的滾動四季口徑。",
  } as Record<Lang, string>,
  /** 最近四个财报季度（旧 → 新），营收合计 = TTM 营收 */
  quarters: [
    {
      period: "2025Q3",
      periodEnd: "2025-09-30",
      revenueM: 740.0,
      ebitdaM: 166.0,
      note: {
        zh: "披露值：Circle 于 2025 年 11 月发布 Q3 财报，营收 $740M、调整后 EBITDA $166M。",
        en: "Reported: Circle's Q3 2025 release (Nov 2025) — revenue $740M, adjusted EBITDA $166M.",
        tw: "披露值：Circle 於 2025 年 11 月釋出 Q3 財報，營收 $740M、調整後 EBITDA $166M。",
      },
    },
    {
      period: "2025Q4",
      periodEnd: "2025-12-31",
      revenueM: 773.1,
      ebitdaM: 170.0,
      note: {
        zh: "营收为推导值：FY2025 全年营收 $2.75B 减 2025 年前三季披露值；EBITDA 为按其余季度利润率推估，非披露值。",
        en: "Revenue derived: FY2025 revenue of $2.75B minus the first three reported quarters of 2025; EBITDA estimated from the blended margin of the other quarters — not a reported figure.",
        tw: "營收為推導值：FY2025 全年營收 $2.75B 減 2025 年前三季披露值；EBITDA 為按其餘季度利潤率推估，非披露值。",
      },
    },
    {
      period: "2026Q1",
      periodEnd: "2026-03-31",
      revenueM: 690.6,
      ebitdaM: 151.8,
      note: {
        zh: "营收为推导值：TTM 营收减其余三季；EBITDA 为按其余季度利润率推估，非披露值。",
        en: "Revenue derived: TTM revenue minus the other three quarters; EBITDA estimated from the blended margin of the other quarters — not a reported figure.",
        tw: "營收為推導值：TTM 營收減其餘三季；EBITDA 為按其餘季度利潤率推估，非披露值。",
      },
    },
    {
      period: "2026Q2",
      periodEnd: "2026-06-30",
      revenueM: 701.3,
      ebitdaM: 154.2,
      note: {
        zh: "营收为披露值：Circle 于 2026 年 8 月 5 日发布的 Q2 财报，营收 $701.32M；EBITDA 为按其余季度利润率推估，非披露值。",
        en: "Revenue reported: Circle's Q2 2026 release (Aug 5, 2026) — revenue $701.32M; EBITDA estimated from the blended margin of the other quarters — not a reported figure.",
        tw: "營收為披露值：Circle 於 2026 年 8 月 5 日釋出的 Q2 財報，營收 $701.32M；EBITDA 為按其餘季度利潤率推估，非披露值。",
      },
    },
  ] as CrclQuarter[],
};
