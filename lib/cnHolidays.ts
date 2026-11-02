// 2026 年中国法定节假日与调休补班日（内置数据，不联网调取，不假装实时接口）。
//
// 来源：《国务院办公厅关于 2026 年部分节假日安排的通知》（国办发明电〔2025〕7 号），
// 2025 年 11 月 4 日公布。录入日期 2026-11-02，已与新华社通稿口径逐节核对一致：
//   元旦 1/1–1/3（补班 1/4）；春节 2/15–2/23（补班 2/14、2/28）；
//   清明 4/4–4/6（自然连休，无补班）；劳动节 5/1–5/5（补班 5/9）；
//   端午 6/19–6/21（自然连休，无补班）；中秋 9/25–9/27（自然连休，无补班）；
//   国庆 10/1–10/7（补班 9/20、10/10）。
// 清明、端午、中秋的「无补班」是经通知确认的结论，不是数据缺失。
//
// 注意：本数据只覆盖 2026 年。2027 年安排公布后需更新本文件；页面底部有对应说明。

import type { Lang } from "./site";

export interface CnHoliday {
  name: Record<Lang, string>;
  /** 放假首日 YYYY-MM-DD（本地日期） */
  start: string;
  /** 放假末日 YYYY-MM-DD（含当日） */
  end: string;
}

export const CN_HOLIDAYS_2026: CnHoliday[] = [
  { name: { zh: "元旦", en: "New Year's Day" }, start: "2026-01-01", end: "2026-01-03" },
  { name: { zh: "春节", en: "Spring Festival" }, start: "2026-02-15", end: "2026-02-23" },
  { name: { zh: "清明节", en: "Qingming Festival" }, start: "2026-04-04", end: "2026-04-06" },
  { name: { zh: "劳动节", en: "Labour Day" }, start: "2026-05-01", end: "2026-05-05" },
  { name: { zh: "端午节", en: "Dragon Boat Festival" }, start: "2026-06-19", end: "2026-06-21" },
  { name: { zh: "中秋节", en: "Mid-Autumn Festival" }, start: "2026-09-25", end: "2026-09-27" },
  { name: { zh: "国庆节", en: "National Day" }, start: "2026-10-01", end: "2026-10-07" },
];

/** 调休补班日（周末改为工作日），YYYY-MM-DD */
export const CN_MAKEUP_WORKDAYS_2026: string[] = [
  "2026-01-04",
  "2026-02-14",
  "2026-02-28",
  "2026-05-09",
  "2026-09-20",
  "2026-10-10",
];

const HOLIDAY_SET = new Set<string>();
for (const h of CN_HOLIDAYS_2026) {
  const [sy, sm, sd] = h.start.split("-").map(Number);
  const [ey, em, ed] = h.end.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    HOLIDAY_SET.add(dateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
}
const MAKEUP_SET = new Set(CN_MAKEUP_WORKDAYS_2026);

/** 本地日期 → YYYY-MM-DD（与内置数据的口径一致，避免时区换算误差） */
export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isHolidayDate(d: Date): boolean {
  return HOLIDAY_SET.has(dateKey(d));
}

export function isMakeupWorkday(d: Date): boolean {
  return MAKEUP_SET.has(dateKey(d));
}

/** 是否为应出勤日：周一至周五且不在放假区间内，或调休补班日 */
export function isWorkday(d: Date): boolean {
  if (isHolidayDate(d)) return false;
  if (isMakeupWorkday(d)) return true;
  const dow = d.getDay();
  return dow >= 1 && dow <= 5;
}

/** 某年某月（month 为 1–12）的应出勤天数 */
export function workdaysInMonth(year: number, month: number): number {
  const days = new Date(year, month, 0).getDate();
  let n = 0;
  for (let day = 1; day <= days; day++) {
    if (isWorkday(new Date(year, month - 1, day))) n++;
  }
  return n;
}

export interface NextHoliday {
  holiday: CnHoliday;
  /** 距放假首日的日历天数（今天 = 0） */
  daysUntilStart: number;
  /** 今天正处于该假期区间内 */
  inProgress: boolean;
  /** 假期总天数 */
  totalDays: number;
}

/** 以 from 所在日期为基准，找当前或下一个假期；2026 年假期全部结束后返回 null */
export function nextHoliday(from: Date): NextHoliday | null {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (const h of CN_HOLIDAYS_2026) {
    const [sy, sm, sd] = h.start.split("-").map(Number);
    const [ey, em, ed] = h.end.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    if (today > end) continue;
    const daysUntilStart = Math.max(
      0,
      Math.round((start.getTime() - today.getTime()) / 86400000)
    );
    return {
      holiday: h,
      daysUntilStart,
      inProgress: today >= start,
      totalDays: Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
    };
  }
  return null;
}
