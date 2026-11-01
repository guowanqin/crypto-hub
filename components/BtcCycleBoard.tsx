"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeCycle,
  type BtcCycleData,
  type StageKey,
} from "@/lib/btccycle";
import { HUB_DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

interface StageText {
  label: string;
  title: string;
  hint: string;
}

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLabel: string;
    heightLabel: string;
    updatedAt: string;
    loading: string;
    loadError: string;
    positionLabel: string;
    todayLabel: string;
    heightChip: string;
    progressLabelBear: string;
    progressLabelBull: string;
    countdownToBottom: string;
    countdownToHalving: string;
    targetLine: string; // {block} {date} {days}
    daysLeft: string; // {n}
    daysAgo: string; // {n}
    daysUnit: string;
    cdDays: string;
    cdHours: string;
    cdMins: string;
    cdSecs: string;
    nodeToday: string;
    nodeNow: string;
    nodeBottom: string;
    nodeHalving: string; // {n} 次减半序号
    nodeTop: string;
    nodeTodaySuffix: string;
    tiersTitleBear: string;
    tiersTitleBull: string;
    colTier: string;
    colTrigger: string;
    colBlock: string;
    colDate: string;
    colEta: string;
    triggerFmt: string; // {p}
    tierNames: string[];
    tierPast: string; // {n}
    tierFuture: string; // {n}
    tierToday: string;
    stages: Record<StageKey, StageText>;
    caliberTitle: string;
    caliberBody: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "BTC 周期位置看板 · 实时链上区块高度",
    sourceLabel: "数据源：实时链上（mempool.space）",
    heightLabel: "区块",
    updatedAt: "取数",
    loading: "正在读取实时区块高度…",
    loadError: "区块高度暂时拉取失败，请稍后刷新重试。",
    positionLabel: "当前周期位置",
    todayLabel: "今天",
    heightChip: "高度",
    progressLabelBear: "熊市进度（越接近 100% 越该动手）",
    progressLabelBull: "牛市段进度（熊底 → 减半 → 牛顶）",
    countdownToBottom: "距本轮熊底（抄底窗口）",
    countdownToHalving: "距下一次减半（位置 0.5）",
    targetLine: "目标区块 {block} · ≈ {date} · 还剩 {days} 天",
    daysLeft: "还剩 {n} 天",
    daysAgo: "已过 {n} 天",
    daysUnit: "天",
    cdDays: "天",
    cdHours: "时",
    cdMins: "分",
    cdSecs: "秒",
    nodeToday: "今天",
    nodeNow: "现在",
    nodeBottom: "熊底（位置 0）",
    nodeHalving: "第 {n} 次减半（位置 0.5）",
    nodeTop: "牛顶（位置 1）",
    nodeTodaySuffix: "",
    tiersTitleBear: "分批建仓档位（按周期位置倒推日期）",
    tiersTitleBull: "分批建仓档位（本轮已全部触发）",
    colTier: "档位",
    colTrigger: "触发条件",
    colBlock: "对应区块",
    colDate: "预计日期",
    colEta: "距今",
    triggerFmt: "位置 = {p}",
    tierNames: [
      "分批建仓 · 第一档",
      "分批建仓 · 第二档",
      "分批建仓 · 第三档",
      "黄金窗口临近",
      "黄金抄底窗口",
    ],
    tierPast: "已过 {n} 天",
    tierFuture: "还有 {n} 天",
    tierToday: "今天",
    stages: {
      downtrend: {
        label: "▼ 熊市下行段",
        title: "熊市下行段",
        hint: "离熊底还远，观望为主，别急着动手。",
      },
      dca: {
        label: "▼ 熊市下行段",
        title: "分批建仓区",
        hint: "进入末段，开始分批，控制节奏别梭哈。",
      },
      dcaLate: {
        label: "▼ 熊市下行段",
        title: "分批建仓后段",
        hint: "已过半程，按档位继续分批，保持节奏。",
      },
      goldNear: {
        label: "▼ 黄金窗口临近",
        title: "黄金窗口临近",
        hint: "接近熊底窗口，档位密集触发，留意最后一档。",
      },
      gold: {
        label: "▼ 黄金抄底窗口",
        title: "黄金抄底窗口",
        hint: "模型口径下的熊底窗口内，按计划执行，别犹豫也别上头。",
      },
      recovery: {
        label: "▲ 回升段",
        title: "回升段",
        hint: "熊底目标区块已过，周期位置正向减半（0.5）推进，本轮分批档位已全部触发。",
      },
    },
    caliberTitle: "模型口径",
    caliberBody:
      "锚点由减半区块推导：减半间隔 210,000 块、偏移 78,750 块——上轮牛顶 = 减半块 −131,250，本轮熊底 = 减半块 −78,750（位置 0），减半本身在位置 0.5，下轮牛顶 = 减半块 +78,750（位置 1）；当前周期减半块为 1,050,000，即牛顶 918,750、熊底 971,250、牛顶 1,128,750。周期位置在段内按区块线性插值；倒计时与预计日期一律按「剩余块数 × 10 分钟」从取数时刻推算，实际出块速度有波动，日期仅供参考。本页直接读取实时链上区块高度（主用 mempool.space，备用 blockstream.info），服务端缓存 5 分钟。",
    disclaimerTitle: "风险提示",
    disclaimerBody:
      "本页是按四年减半周期与区块高度推演的模型估算：历史周期不保证重演，熊底区块与日期都不是预测承诺。本页不构成投资建议，分批档位仅为模型触发位，请结合自身判断与风险承受能力决策。",
    toolsTitle: "相关工具",
  },
  en: {
    boardKicker: "BTC Cycle Position Board · Live on-chain block height",
    sourceLabel: "Data source: live on-chain (mempool.space)",
    heightLabel: "Block",
    updatedAt: "Fetched",
    loading: "Reading the live block height…",
    loadError: "Block height is temporarily unavailable — please refresh shortly.",
    positionLabel: "Current Cycle Position",
    todayLabel: "Today",
    heightChip: "Height",
    progressLabelBear: "Bear progress (closer to 100% = closer to action)",
    progressLabelBull: "Bull-leg progress (bottom → halving → top)",
    countdownToBottom: "To this cycle's bottom (buy window)",
    countdownToHalving: "To the next halving (position 0.5)",
    targetLine: "Target block {block} · ≈ {date} · {days} days left",
    daysLeft: "{n} days left",
    daysAgo: "{n} days ago",
    daysUnit: "days",
    cdDays: "d",
    cdHours: "h",
    cdMins: "m",
    cdSecs: "s",
    nodeToday: "Today",
    nodeNow: "Now",
    nodeBottom: "Bear bottom (position 0)",
    nodeHalving: "Halving #{n} (position 0.5)",
    nodeTop: "Bull top (position 1)",
    nodeTodaySuffix: "",
    tiersTitleBear: "Staged entry tiers (dates projected from cycle position)",
    tiersTitleBull: "Staged entry tiers (all triggered this cycle)",
    colTier: "Tier",
    colTrigger: "Trigger",
    colBlock: "Block",
    colDate: "Est. date",
    colEta: "From now",
    triggerFmt: "Position = {p}",
    tierNames: [
      "Staged entry · Tier 1",
      "Staged entry · Tier 2",
      "Staged entry · Tier 3",
      "Golden window approaching",
      "Golden buy window",
    ],
    tierPast: "{n} days ago",
    tierFuture: "In {n} days",
    tierToday: "Today",
    stages: {
      downtrend: {
        label: "▼ Bear downtrend",
        title: "Bear downtrend",
        hint: "Still far from the projected bottom — mostly wait, no rush.",
      },
      dca: {
        label: "▼ Bear downtrend",
        title: "Staged entry zone",
        hint: "Final stretch — start staging in, keep the pace, never all-in.",
      },
      dcaLate: {
        label: "▼ Bear downtrend",
        title: "Staged entry, late stage",
        hint: "Past halfway — keep staging per tier, hold the rhythm.",
      },
      goldNear: {
        label: "▼ Golden window near",
        title: "Golden window approaching",
        hint: "Close to the bottom window; tiers fire densely — watch the last one.",
      },
      gold: {
        label: "▼ Golden buy window",
        title: "Golden buy window",
        hint: "Inside the model's bottom window — execute the plan, no FOMO, no panic.",
      },
      recovery: {
        label: "▲ Recovery leg",
        title: "Recovery leg",
        hint: "The bottom target block has passed and the position is advancing toward the halving (0.5); all staged tiers for this cycle have triggered.",
      },
    },
    caliberTitle: "How the model works",
    caliberBody:
      "Anchors derive from the halving block: halving interval 210,000 blocks, offset 78,750 — previous top = halving −131,250, this cycle's bottom = halving −78,750 (position 0), the halving itself sits at position 0.5, next top = halving +78,750 (position 1). For the current cycle the halving block is 1,050,000, giving top 918,750, bottom 971,250 and next top 1,128,750. Position is linearly interpolated by block within each leg; the countdown and all estimated dates project from fetch time at remaining blocks × 10 minutes — real block times vary, so treat dates as approximations. This page reads the live on-chain block height (mempool.space primary, blockstream.info backup), cached server-side for 5 minutes.",
    disclaimerTitle: "Risk notice",
    disclaimerBody:
      "This page is a model projection from the four-year halving cycle and block height: past cycles are not guaranteed to repeat, and neither the bottom block nor its date is a prediction or promise. Nothing here is investment advice; the tiers are model trigger levels only — decide with your own judgment and risk tolerance.",
    toolsTitle: "Related tools",
  },
};

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtDate(ms: number, lang: Lang): string {
  const dt = new Date(ms);
  if (lang === "zh") {
    const p = (v: number) => String(v).padStart(2, "0");
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
  }
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(iso: string): string {
  const dt = new Date(iso);
  const p = (v: number) => String(v).padStart(2, "0");
  return `${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

function signedDays(days: number, d: (typeof DICT)["zh"]): string {
  const n = Math.round(Math.abs(days));
  if (n === 0) return d.tierToday;
  return days < 0
    ? d.daysAgo.replace("{n}", String(n))
    : d.daysLeft.replace("{n}", String(n));
}

const pad2 = (v: number) => String(v).padStart(2, "0");

export { DICT as BTC_CYCLE_DICT };

// BTC 周期抄底看板本体：/tag/btc-bottom 标签页与 /tool/btc-cycle 工具页共用同一组件。
export default function BtcCycleBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];

  const [data, setData] = useState<BtcCycleData | null>(null);
  const [error, setError] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    fetch("/api/btc-cycle")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: BtcCycleData) => {
        if (alive) setData(j);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const state = useMemo(
    () =>
      data
        ? computeCycle(data.height, new Date(data.fetchedAt).getTime())
        : null,
    [data]
  );

  const remainSec = state
    ? Math.max(0, Math.floor((state.countdownTargetMs - nowTick) / 1000))
    : 0;
  const cd = {
    days: Math.floor(remainSec / 86400),
    hours: Math.floor((remainSec % 86400) / 3600),
    mins: Math.floor((remainSec % 3600) / 60),
    secs: remainSec % 60,
  };

  const stage = state ? d.stages[state.stage] : null;
  const isBear = state?.segment === "bear";
  const progressPct = state
    ? isBear
      ? state.bearProgressPct
      : state.position * 100
    : 0;

  const nodes = state
    ? [
        {
          key: "today",
          color: "var(--gold)",
          label: d.nodeToday,
          date: fmtDate(new Date(data!.fetchedAt).getTime(), lang),
          eta: d.nodeNow,
        },
        {
          key: "bottom",
          color: "#2563eb",
          label: d.nodeBottom,
          date: fmtDate(state.nodeEtas.bottomMs, lang),
          eta: signedDays(state.nodeDays.bottom, d),
        },
        {
          key: "halving",
          color: "var(--gold)",
          label: d.nodeHalving.replace(
            "{n}",
            String(state.anchors.halvingOrdinal)
          ),
          date: fmtDate(state.nodeEtas.halvingMs, lang),
          eta: signedDays(state.nodeDays.halving, d),
        },
        {
          key: "top",
          color: "var(--red)",
          label: d.nodeTop,
          date: fmtDate(state.nodeEtas.topMs, lang),
          eta: signedDays(state.nodeDays.top, d),
        },
      ]
    : [];

  return (
      <section className="cycle-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">
            {d.sourceLabel}
            {data && (
              <>
                {" · "}
                {d.heightLabel} {fmtInt(data.height)} · {d.updatedAt}{" "}
                {fmtTime(data.fetchedAt)}
              </>
            )}
          </p>
        </div>

        {!data && !error && <p className="burn-note">{d.loading}</p>}
        {error && <p className="burn-note">{d.loadError}</p>}

        {data && state && stage && (
          <>
            <div className="cycle-grid">
              {/* 左卡：周期位置 */}
              <div className="cycle-card">
                <p className="cycle-card-label">┃ {d.positionLabel}</p>
                <div className="cycle-position-row">
                  <span className="cycle-position">{state.position.toFixed(3)}</span>
                  <span
                    className={`cycle-stage-label${isBear ? " is-bear" : " is-bull"}`}
                  >
                    {stage.label}
                  </span>
                </div>
                <div className="cycle-chips">
                  <span className="cycle-chip">
                    {d.todayLabel}{" "}
                    <strong>
                      {fmtDate(new Date(data.fetchedAt).getTime(), lang)}
                    </strong>
                  </span>
                  <span className="cycle-chip">
                    {d.heightChip} <strong>{fmtInt(data.height)}</strong>
                  </span>
                </div>
                <div className="cycle-hint-box">
                  <p className="cycle-hint-title">{stage.title}</p>
                  <p className="cycle-hint-text">{stage.hint}</p>
                </div>
                <div className="cycle-progress-head">
                  <span>
                    {isBear ? d.progressLabelBear : d.progressLabelBull}
                  </span>
                  <span>{progressPct.toFixed(1)}%</span>
                </div>
                <div
                  className="burn-bar cycle-bar"
                  role="img"
                  aria-label={`${progressPct.toFixed(1)}%`}
                >
                  <div
                    className="burn-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                  />
                </div>
              </div>

              {/* 右卡：倒计时 + 时间线 */}
              <div className="cycle-card">
                <p className="cycle-card-label">
                  ┃ {isBear ? d.countdownToBottom : d.countdownToHalving}
                </p>
                <div className="cycle-countdown" aria-live="off">
                  <span className="cycle-cd-num">{cd.days}</span>
                  <span className="cycle-cd-unit">{d.cdDays}</span>
                  <span className="cycle-cd-num">{pad2(cd.hours)}</span>
                  <span className="cycle-cd-unit">{d.cdHours}</span>
                  <span className="cycle-cd-num">{pad2(cd.mins)}</span>
                  <span className="cycle-cd-unit">{d.cdMins}</span>
                  <span className="cycle-cd-num">{pad2(cd.secs)}</span>
                  <span className="cycle-cd-unit">{d.cdSecs}</span>
                </div>
                <p className="cycle-target-line">
                  {d.targetLine
                    .replace("{block}", fmtInt(state.countdownBlock))
                    .replace(
                      "{date}",
                      fmtDate(state.countdownTargetMs, lang)
                    )
                    .replace(
                      "{days}",
                      String(
                        Math.max(
                          0,
                          Math.round(
                            (state.countdownBlock - state.height) / 144
                          )
                        )
                      )
                    )}
                </p>
                <ul className="cycle-timeline">
                  {nodes.map((n) => (
                    <li key={n.key} className="cycle-timeline-row">
                      <span
                        className="cycle-dot"
                        style={{ background: n.color }}
                      />
                      <span className="cycle-timeline-label">{n.label}</span>
                      <span className="cycle-timeline-date">≈ {n.date}</span>
                      <span className="cycle-timeline-eta">{n.eta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 档位表 */}
            <div className="burn-records">
              <h3 className="burn-records-title">
                {isBear ? d.tiersTitleBear : d.tiersTitleBull}
              </h3>
              <div className="burn-table-wrap">
                <table className="burn-table cycle-table">
                  <thead>
                    <tr>
                      <th>{d.colTier}</th>
                      <th>{d.colTrigger}</th>
                      <th>{d.colBlock}</th>
                      <th>{d.colDate}</th>
                      <th>{d.colEta}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.tiers.map((tier, i) => {
                      const isNext =
                        isBear && state.nextTier?.block === tier.block;
                      const daysAbs = Math.round(Math.abs(tier.daysFromNow));
                      return (
                        <tr
                          key={tier.block}
                          className={[
                            tier.triggered ? "is-done" : "",
                            isNext ? "is-next" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <td>
                            <span
                              className={`cycle-tier-dot${
                                tier.position <= 0.05 ? " is-gold" : ""
                              }`}
                            />
                            {d.tierNames[i]}
                          </td>
                          <td>
                            {d.triggerFmt.replace(
                              "{p}",
                              tier.position.toFixed(2)
                            )}
                          </td>
                          <td>{fmtInt(tier.block)}</td>
                          <td>≈ {fmtDate(tier.etaMs, lang)}</td>
                          <td>
                            {daysAbs === 0
                              ? d.tierToday
                              : tier.triggered
                                ? d.tierPast.replace("{n}", String(daysAbs))
                                : d.tierFuture.replace("{n}", String(daysAbs))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="burn-notes">
              <div className="card">
                <h2>{d.caliberTitle}</h2>
                <p className="body-text">{d.caliberBody}</p>
              </div>
              <div className="card">
                <h2>{d.disclaimerTitle}</h2>
                <p className="body-text">{d.disclaimerBody}</p>
                <p className="body-text">{t.disclaimer}</p>
              </div>
            </div>
          </>
        )}
      </section>
  );
}
