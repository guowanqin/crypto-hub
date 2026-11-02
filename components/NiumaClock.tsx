"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import {
  isWorkday,
  nextHoliday,
  workdaysInMonth,
} from "@/lib/cnHolidays";
import { useLang } from "./LangProvider";

// 牛马时钟本体：实时时钟 + 今日进度 + 四个倒计时 + 工资秒表 + 本机设置。
// 全部在浏览器本地计算：时钟读本机时间，节假日用 lib/cnHolidays 的内置 2026 年数据，
// 设置只存 localStorage，不联网、不上传。

interface NiumaSettings {
  start: string; // 上班时间 HH:MM
  end: string; // 下班时间 HH:MM
  lunchStart: string; // 午休开始 HH:MM，可空
  lunchEnd: string; // 午休结束 HH:MM，可空
  payday: number; // 每月发薪日（几号）
  salary: string; // 月薪（元），空 = 未填
}

const DEFAULT_SETTINGS: NiumaSettings = {
  start: "09:00",
  end: "18:00",
  lunchStart: "",
  lunchEnd: "",
  payday: 15,
  salary: "",
};

const STORAGE_KEY = "niuma-clock-settings";

const NC = {
  zh: {
    weekdays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    progressTitle: "今日牛马进度",
    statusOff: "今天不上班",
    statusOffSub: "周末或假期，好好躺平，牛马也要吃草。",
    statusBefore: "还没上工",
    statusBeforeSub: (t: string) => `离上工还有 ${t}，先把草料备好。`,
    statusWorking: "搬砖进行中",
    statusLunch: "午休中",
    statusLunchSub: "秒表暂停，吃草时间不计入工时。",
    statusDone: "今日已解放",
    statusDoneSub: "下班了，今天的砖搬完了。",
    workedLabel: "已搬砖",
    leftLabel: "还剩",
    cdOffwork: "距离下班",
    cdWeekend: "距离周末",
    cdPayday: "距离发工资",
    cdHoliday: "距离下一个假期",
    weekendNow: "周末进行中",
    offworkTarget: (d: string) => `${d} 下班`,
    weekendTarget: (d: string) => `${d} 周五下班即周末`,
    weekendNowSub: (d: string) => `周一 ${d} 重新上工`,
    paydayTarget: (d: string) => `发薪日 ${d}`,
    holidayIn: (name: string) => `正在放${name}假期`,
    holidayInSub: (range: string, days: number) => `${range} · 共 ${days} 天`,
    holidayNextSub: (range: string, days: number) => `${range} · 放 ${days} 天`,
    holidayNone: "2026 年假期已休完",
    holidayNoneSub: "等 2027 年安排公布后更新",
    dayUnit: "天",
    earnedTitle: "工资秒表",
    earnedToday: "今日已赚",
    salaryGuide: "在下方设置里填上月薪，秒表马上开跑——看看你每秒挣多少钱。",
    dailyWage: "日薪约",
    perSecond: "每秒约",
    monthEarned: "本月已赚约",
    settingsTitle: "牛马设置",
    fStart: "上班时间",
    fEnd: "下班时间",
    fLunchStart: "午休开始（可空）",
    fLunchEnd: "午休结束（可空）",
    fPayday: "发薪日（每月几号）",
    fSalary: "月薪（税前，元，可空）",
    settingsNote: "设置只保存在这台设备的浏览器里，不上传、不统计，关掉页面也不会丢。",
    noteTitle: "口径说明",
    notes: [
      "工资秒表是估算玩法：日薪 = 月薪 ÷ 当月应出勤天数（周一至周五，扣除 2026 年法定放假、加上调休补班日），再按今日已工作秒数折算；不含社保、个税、加班费与奖金，图一乐，别拿它跟工资条对账。",
      "发薪倒计时按自然日计算，不考虑发薪日遇周末时银行或公司的顺延、提前规则。",
      "节假日数据为《国务院办公厅关于 2026 年部分节假日安排的通知》公布的安排，内置在页面里、不联网调取；2027 年安排公布后会更新。",
    ],
  },
  en: {
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    progressTitle: "Today's grind progress",
    statusOff: "No work today",
    statusOffSub: "Weekend or holiday — rest up, even workhorses graze.",
    statusBefore: "Not clocked in yet",
    statusBeforeSub: (t: string) => `Work starts in ${t} — get the feed ready.`,
    statusWorking: "On the clock",
    statusLunch: "Lunch break",
    statusLunchSub: "The meter pauses — grazing time doesn't count as work.",
    statusDone: "Done for today",
    statusDoneSub: "Off work — today's bricks are all moved.",
    workedLabel: "Worked",
    leftLabel: "Left",
    cdOffwork: "Until off work",
    cdWeekend: "Until the weekend",
    cdPayday: "Until payday",
    cdHoliday: "Until the next holiday",
    weekendNow: "Weekend in progress",
    offworkTarget: (d: string) => `Off work ${d}`,
    weekendTarget: (d: string) => `Weekend starts Fri ${d}`,
    weekendNowSub: (d: string) => `Back on the clock Mon ${d}`,
    paydayTarget: (d: string) => `Payday ${d}`,
    holidayIn: (name: string) => `${name} break in progress`,
    holidayInSub: (range: string, days: number) => `${range} · ${days} days`,
    holidayNextSub: (range: string, days: number) => `${range} · ${days} days off`,
    holidayNone: "All 2026 holidays are over",
    holidayNoneSub: "Will update once the 2027 schedule is out",
    dayUnit: "d",
    earnedTitle: "Salary stopwatch",
    earnedToday: "Earned today",
    salaryGuide: "Enter your monthly salary in the settings below and the meter starts ticking — see what you make per second.",
    dailyWage: "Daily ≈",
    perSecond: "Per second ≈",
    monthEarned: "This month ≈",
    settingsTitle: "Your settings",
    fStart: "Start work",
    fEnd: "Off work",
    fLunchStart: "Lunch starts (optional)",
    fLunchEnd: "Lunch ends (optional)",
    fPayday: "Payday (day of month)",
    fSalary: "Monthly salary (pre-tax, ¥, optional)",
    settingsNote: "Settings are stored only in this browser on this device — never uploaded, never tracked.",
    noteTitle: "How the numbers work",
    notes: [
      "The salary stopwatch is a rough estimate for fun: daily pay = monthly salary ÷ this month's scheduled workdays (Mon–Fri, minus 2026 public holidays, plus official make-up workdays), pro-rated by the seconds you have worked today. Social insurance, tax, overtime and bonuses are not included — don't reconcile it against your payslip.",
      "The payday countdown uses calendar days and ignores any weekend shifting your bank or employer may apply.",
      "Holiday data is the 2026 schedule published by the General Office of the State Council, built into this page rather than fetched live; it will be updated once the 2027 schedule is published.",
    ],
  },
  tw: {
    weekdays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    progressTitle: "今日牛馬進度",
    statusOff: "今天不上班",
    statusOffSub: "週末或假期，好好躺平，牛馬也要吃草。",
    statusBefore: "還沒上工",
    statusBeforeSub: (t: string) => `離上工還有 ${t}，先把草料備好。`,
    statusWorking: "搬磚進行中",
    statusLunch: "午休中",
    statusLunchSub: "秒錶暫停，吃草時間不計入工時。",
    statusDone: "今日已解放",
    statusDoneSub: "下班了，今天的磚搬完了。",
    workedLabel: "已搬磚",
    leftLabel: "還剩",
    cdOffwork: "距離下班",
    cdWeekend: "距離週末",
    cdPayday: "距離發工資",
    cdHoliday: "距離下一個假期",
    weekendNow: "週末進行中",
    offworkTarget: (d: string) => `${d} 下班`,
    weekendTarget: (d: string) => `${d} 週五下班即週末`,
    weekendNowSub: (d: string) => `週一 ${d} 重新上工`,
    paydayTarget: (d: string) => `發薪日 ${d}`,
    holidayIn: (name: string) => `正在放${name}假期`,
    holidayInSub: (range: string, days: number) => `${range} · 共 ${days} 天`,
    holidayNextSub: (range: string, days: number) => `${range} · 放 ${days} 天`,
    holidayNone: "2026 年假期已休完",
    holidayNoneSub: "等 2027 年安排公佈後更新",
    dayUnit: "天",
    earnedTitle: "工資秒錶",
    earnedToday: "今日已賺",
    salaryGuide: "在下方設定裡填上月薪，秒錶馬上開跑——看看你每秒掙多少錢。",
    dailyWage: "日薪約",
    perSecond: "每秒約",
    monthEarned: "本月已賺約",
    settingsTitle: "牛馬設定",
    fStart: "上班時間",
    fEnd: "下班時間",
    fLunchStart: "午休開始（可空）",
    fLunchEnd: "午休結束（可空）",
    fPayday: "發薪日（每月幾號）",
    fSalary: "月薪（稅前，元，可空）",
    settingsNote: "設定只儲存在這臺裝置的瀏覽器裡，不上傳、不統計，關掉頁面也不會丟。",
    noteTitle: "口徑說明",
    notes: [
      "工資秒錶是估算玩法：日薪 = 月薪 ÷ 當月應出勤天數（週一至週五，扣除 2026 年法定放假、加上調休補班日），再按今日已工作秒數折算；不含社保、個稅、加班費與獎金，圖一樂，別拿它跟工資條對賬。",
      "發薪倒計時按自然日計算，不考慮發薪日遇週末時銀行或公司的順延、提前規則。",
      "節假日資料為《國務院辦公廳關於 2026 年部分節假日安排的通知》公佈的安排，內建在頁面裡、不聯網調取；2027 年安排公佈後會更新。",
    ],
  },
} as const;

/** "HH:MM" → 当天分钟数；非法输入返回 null */
function parseHM(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 某天的某个分钟数 → Date */
function atMinutes(day: Date, minutes: number): Date {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  d.setMinutes(minutes);
  return d;
}

/** 今日工作时段（分钟区间数组）：[上班, 下班] 扣掉合法午休；设置非法时回落默认 9:00–18:00 无午休 */
function workSegments(s: NiumaSettings): Array<[number, number]> {
  const start = parseHM(s.start) ?? 9 * 60;
  let end = parseHM(s.end) ?? 18 * 60;
  if (end <= start) end = start + 60;
  const ls = parseHM(s.lunchStart);
  const le = parseHM(s.lunchEnd);
  if (ls !== null && le !== null && ls > start && le < end && ls < le) {
    return [
      [start, ls],
      [le, end],
    ];
  }
  return [[start, end]];
}

function segmentsTotalSeconds(segs: Array<[number, number]>): number {
  return segs.reduce((n, [a, b]) => n + (b - a) * 60, 0);
}

/** 今天已工作的秒数（只计工作时段内的部分；非工作日为 0） */
function workedSecondsToday(now: Date, segs: Array<[number, number]>): number {
  if (!isWorkday(now)) return 0;
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let total = 0;
  for (const [a, b] of segs) {
    const from = a * 60;
    const to = b * 60;
    if (nowSec > from) total += Math.min(nowSec, to) - from;
  }
  return Math.max(0, total);
}

/** 下一个工作日的下班时刻（从今天起找，含今天未过下班点的情况在调用处处理） */
function nextOffworkMoment(now: Date, s: NiumaSettings): Date {
  const endMin = workSegments(s).at(-1)![1];
  for (let i = 0; i < 370; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (!isWorkday(day)) continue;
    const t = atMinutes(day, endMin);
    if (t > now) return t;
  }
  return atMinutes(now, endMin);
}

/** 距离周末：本周五下班时刻；已进周末则返回「进行中」+ 下周一上班时刻 */
function weekendInfo(now: Date, s: NiumaSettings): { inWeekend: boolean; target: Date } {
  const startMin = workSegments(s)[0][0];
  const endMin = workSegments(s).at(-1)![1];
  const dow = now.getDay(); // 0=Sun..6=Sat
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((dow + 6) % 7));
  const fridayEnd = atMinutes(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4), endMin);
  if (now < fridayEnd) return { inWeekend: false, target: fridayEnd };
  const nextMondayStart = atMinutes(
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7),
    startMin
  );
  if (now < nextMondayStart) return { inWeekend: true, target: nextMondayStart };
  const nextFridayEnd = atMinutes(
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 11),
    endMin
  );
  return { inWeekend: false, target: nextFridayEnd };
}

/** 下一个发薪时刻（当月发薪日 00:00，已过则顺延下月；按自然日，不做周末顺延） */
function nextPayday(now: Date, payday: number): Date {
  const day = Math.min(31, Math.max(1, Math.floor(payday) || 15));
  for (let i = 0; i < 14; i++) {
    const y = now.getFullYear();
    const m = now.getMonth() + i;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const t = new Date(y, m, Math.min(day, lastDay));
    if (t > new Date(now.getFullYear(), now.getMonth(), now.getDate())) return t;
  }
  return now;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 秒数 → HH:MM:SS */
function fmtHMS(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** 秒数 → 「N天 HH:MM:SS」（0 天时只显示时间） */
function fmtCountdown(totalSec: number, dayUnit: string): string {
  const s = Math.max(0, Math.floor(totalSec));
  const days = Math.floor(s / 86400);
  return days > 0 ? `${days}${dayUnit} ${fmtHMS(s - days * 86400)}` : fmtHMS(s);
}

/** 时长（秒）→ 简短人话：X 小时 Y 分 / Y 分钟 */
function fmtDuration(totalSec: number, lang: Lang): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (lang === "zh") return h > 0 ? `${h} 小时 ${m} 分` : `${m} 分钟`;
  if (lang === "tw") return h > 0 ? `${h} 小時 ${m} 分` : `${m} 分鐘`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDateShort(d: Date, lang: Lang): string {
  if (lang !== "en") return `${d.getMonth() + 1}月${d.getDate()}日`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NiumaClock() {
  const { lang } = useLang();
  const t = NC[lang];
  const [settings, setSettings] = useState<NiumaSettings>(DEFAULT_SETTINGS);
  const [now, setNow] = useState<Date | null>(null);

  // 设置只从 localStorage 读（客户端挂载后），SSR 与首帧用默认值，避免水合不一致
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NiumaSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // 读不到就用默认设置
    }
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const update = (patch: Partial<NiumaSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 存储失败不影响使用
      }
      return next;
    });
  };

  const view = useMemo(() => {
    if (!now) return null;
    const segs = workSegments(settings);
    const totalSec = segmentsTotalSeconds(segs);
    const startMin = segs[0][0];
    const endMin = segs[segs.length - 1][1];
    const workday = isWorkday(now);
    const worked = workedSecondsToday(now, segs);
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    type Status = "off" | "before" | "working" | "lunch" | "done";
    let status: Status;
    if (!workday) status = "off";
    else if (nowMin < startMin) status = "before";
    else if (nowMin >= endMin) status = "done";
    else if (segs.length === 2 && nowMin >= segs[0][1] && nowMin < segs[1][0]) status = "lunch";
    else status = "working";

    // 工资秒表
    const salaryNum = Number(settings.salary);
    const hasSalary = settings.salary.trim() !== "" && Number.isFinite(salaryNum) && salaryNum > 0;
    let salaryView: {
      daily: number;
      perSecond: number;
      earnedToday: number;
      earnedMonth: number;
    } | null = null;
    if (hasSalary) {
      const monthWorkdays = workdaysInMonth(now.getFullYear(), now.getMonth() + 1);
      const daily = monthWorkdays > 0 ? salaryNum / monthWorkdays : 0;
      const perSecond = totalSec > 0 ? daily / totalSec : 0;
      const earnedToday = Math.min(worked * perSecond, daily);
      let fullDaysBefore = 0;
      for (let d = 1; d < now.getDate(); d++) {
        if (isWorkday(new Date(now.getFullYear(), now.getMonth(), d))) fullDaysBefore++;
      }
      salaryView = {
        daily,
        perSecond,
        earnedToday,
        earnedMonth: fullDaysBefore * daily + earnedToday,
      };
    }

    const offworkTarget = nextOffworkMoment(now, settings);
    const wk = weekendInfo(now, settings);
    const paydayTarget = nextPayday(now, settings.payday);
    const holiday = nextHoliday(now);

    return {
      segs,
      totalSec,
      worked,
      status,
      startDate: atMinutes(now, startMin),
      salaryView,
      offworkTarget,
      offworkSec: (offworkTarget.getTime() - now.getTime()) / 1000,
      weekend: wk,
      weekendSec: (wk.target.getTime() - now.getTime()) / 1000,
      paydayTarget,
      paydaySec: (paydayTarget.getTime() - now.getTime()) / 1000,
      holiday,
    };
  }, [now, settings]);

  const dateLine = now
    ? lang !== "en"
      ? `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${t.weekdays[now.getDay()]}`
      : `${t.weekdays[now.getDay()]}, ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : "····";

  return (
    <div className="niuma">
      {/* 大字实时时钟 */}
      <section className="card nc-clock-card">
        <div className="nc-time">{now ? fmtHMS(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) : "--:--:--"}</div>
        <p className="nc-date">{dateLine}</p>
      </section>

      {/* 今日牛马进度 */}
      <section className="card">
        <h2>🐂 {t.progressTitle}</h2>
        {view ? (
          <>
            <p className="nc-status">
              {view.status === "off" && t.statusOff}
              {view.status === "before" && t.statusBefore}
              {view.status === "working" && t.statusWorking}
              {view.status === "lunch" && t.statusLunch}
              {view.status === "done" && t.statusDone}
            </p>
            <p className="body-text nc-status-sub">
              {view.status === "off" && t.statusOffSub}
              {view.status === "before" &&
                t.statusBeforeSub(fmtCountdown((view.startDate.getTime() - (now?.getTime() ?? 0)) / 1000, t.dayUnit))}
              {view.status === "working" &&
                `${t.workedLabel} ${fmtDuration(view.worked, lang)} · ${t.leftLabel} ${fmtDuration(view.totalSec - view.worked, lang)}`}
              {view.status === "lunch" && t.statusLunchSub}
              {view.status === "done" && t.statusDoneSub}
            </p>
            <div className="nc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={view.totalSec > 0 ? Math.round((view.worked / view.totalSec) * 100) : 0}>
              <div
                className="nc-bar-fill"
                style={{ width: `${view.totalSec > 0 ? Math.min(100, (view.worked / view.totalSec) * 100) : 0}%` }}
              />
            </div>
            <p className="nc-bar-label">
              {view.totalSec > 0 ? ((view.worked / view.totalSec) * 100).toFixed(1) : "0.0"}%
            </p>
          </>
        ) : (
          <p className="body-text">···</p>
        )}
      </section>

      {/* 四个倒计时 */}
      <div className="nc-grid">
        <section className="card nc-cd">
          <h3 className="nc-cd-label">🏠 {t.cdOffwork}</h3>
          <p className="nc-cd-value">{view ? fmtCountdown(view.offworkSec, t.dayUnit) : "--:--:--"}</p>
          <p className="nc-cd-sub">{view ? t.offworkTarget(fmtDateShort(view.offworkTarget, lang)) : ""}</p>
        </section>
        <section className="card nc-cd">
          <h3 className="nc-cd-label">🛋️ {t.cdWeekend}</h3>
          {view?.weekend.inWeekend ? (
            <>
              <p className="nc-cd-value nc-cd-text">{t.weekendNow}</p>
              <p className="nc-cd-sub">
                {t.weekendNowSub(fmtDateShort(view.weekend.target, lang))} · {fmtCountdown(view.weekendSec, t.dayUnit)}
              </p>
            </>
          ) : (
            <>
              <p className="nc-cd-value">{view ? fmtCountdown(view.weekendSec, t.dayUnit) : "--:--:--"}</p>
              <p className="nc-cd-sub">{view ? t.weekendTarget(fmtDateShort(view.weekend.target, lang)) : ""}</p>
            </>
          )}
        </section>
        <section className="card nc-cd">
          <h3 className="nc-cd-label">💰 {t.cdPayday}</h3>
          <p className="nc-cd-value">{view ? fmtCountdown(view.paydaySec, t.dayUnit) : "--:--:--"}</p>
          <p className="nc-cd-sub">{view ? t.paydayTarget(fmtDateShort(view.paydayTarget, lang)) : ""}</p>
        </section>
        <section className="card nc-cd">
          <h3 className="nc-cd-label">🌴 {t.cdHoliday}</h3>
          {view ? (
            view.holiday ? (
              <>
                <p className="nc-cd-value">
                  {view.holiday.inProgress ? t.holidayIn(view.holiday.holiday.name[lang]) : `${view.holiday.daysUntilStart}${t.dayUnit}`}
                </p>
                <p className="nc-cd-sub">
                  {view.holiday.holiday.name[lang]} ·{" "}
                  {view.holiday.inProgress
                    ? t.holidayInSub(`${view.holiday.holiday.start.slice(5)} ~ ${view.holiday.holiday.end.slice(5)}`, view.holiday.totalDays)
                    : t.holidayNextSub(`${view.holiday.holiday.start.slice(5)} ~ ${view.holiday.holiday.end.slice(5)}`, view.holiday.totalDays)}
                </p>
              </>
            ) : (
              <>
                <p className="nc-cd-value nc-cd-text">{t.holidayNone}</p>
                <p className="nc-cd-sub">{t.holidayNoneSub}</p>
              </>
            )
          ) : (
            <p className="nc-cd-value">--</p>
          )}
        </section>
      </div>

      {/* 工资秒表 */}
      <section className="card nc-earn-card">
        <h2>⏱️ {t.earnedTitle}</h2>
        {view?.salaryView ? (
          <>
            <p className="nc-earn-label">{t.earnedToday}</p>
            <p className="nc-earn-value">¥{view.salaryView.earnedToday.toFixed(2)}</p>
            <p className="body-text nc-earn-sub">
              {t.dailyWage} ¥{view.salaryView.daily.toFixed(2)} · {t.perSecond} ¥
              {view.salaryView.perSecond.toFixed(4)} · {t.monthEarned} ¥
              {view.salaryView.earnedMonth.toFixed(2)}
            </p>
          </>
        ) : (
          <p className="body-text">{t.salaryGuide}</p>
        )}
      </section>

      {/* 设置（只存本机浏览器） */}
      <section className="card">
        <h2>⚙️ {t.settingsTitle}</h2>
        <div className="nc-form">
          <label className="nc-field">
            <span>{t.fStart}</span>
            <input type="time" value={settings.start} onChange={(e) => update({ start: e.target.value })} />
          </label>
          <label className="nc-field">
            <span>{t.fEnd}</span>
            <input type="time" value={settings.end} onChange={(e) => update({ end: e.target.value })} />
          </label>
          <label className="nc-field">
            <span>{t.fLunchStart}</span>
            <input type="time" value={settings.lunchStart} onChange={(e) => update({ lunchStart: e.target.value })} />
          </label>
          <label className="nc-field">
            <span>{t.fLunchEnd}</span>
            <input type="time" value={settings.lunchEnd} onChange={(e) => update({ lunchEnd: e.target.value })} />
          </label>
          <label className="nc-field">
            <span>{t.fPayday}</span>
            <input
              type="number"
              min={1}
              max={31}
              value={settings.payday}
              onChange={(e) => update({ payday: Number(e.target.value) })}
            />
          </label>
          <label className="nc-field">
            <span>{t.fSalary}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="10000"
              value={settings.salary}
              onChange={(e) => update({ salary: e.target.value })}
            />
          </label>
        </div>
        <p className="nc-note">{t.settingsNote}</p>
      </section>

      {/* 口径说明 */}
      <section className="card">
        <h2>📋 {t.noteTitle}</h2>
        {t.notes.map((n) => (
          <p key={n.slice(0, 12)} className="body-text">
            {n}
          </p>
        ))}
      </section>
    </div>
  );
}
