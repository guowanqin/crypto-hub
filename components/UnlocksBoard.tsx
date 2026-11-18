"use client";

import { Fragment, useMemo, useState } from "react";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";
import {
  UNLOCK_ITEMS,
  UNLOCKS_DATA,
  UNLOCKS_UPDATED,
  isUnlockAlert,
  unlocksInWindow,
  type UnlockItem,
} from "@/lib/unlocks";

interface BoardDict {
  boardKicker: string;
  boardMetaPrefix: string;
  updatedOn: string;
  snapshotTag: string;
  total7d: string;
  total30d: string;
  totalNA: string;
  win7: string;
  win30: string;
  noteWin7Snapshot: string;
  noteWin7Api: string;
  noteWin30: string;
  colDate: string;
  colToken: string;
  colAmount: string;
  colValue: string;
  colPct: string;
  colAlloc: string;
  colType: string;
  typeCliff: string;
  pinnedBadge: string;
  alertBadge: string;
  allocUnknown: string;
  rowsSuffix: string;
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
    "boardKicker": "代币解锁日历榜 · 大额解锁提前看",
    "boardMetaPrefix": "数据来源：",
    "updatedOn": "更新于",
    "snapshotTag": "快照版",
    "total7d": "未来 7 天解锁总额",
    "total30d": "未来 30 天解锁总额",
    "totalNA": "免费档未提供",
    "win7": "未来 7 天",
    "win30": "未来 30 天",
    "noteWin7Snapshot": "当前是快照版：只列快照确证的条目；接入 Tokenomist API 后，未来 7 天窗口每天自动补全。",
    "noteWin7Api": "7 天窗口由 Tokenomist API 每天自动更新（免费试用只看未来 7 天，每币只列下一次悬崖解锁）。",
    "noteWin30": "30 天窗口：免费档（Tokenomist 免费试用）只提供未来 7 天的逐条事件，30 天逐条明细待升级套餐；当前显示窗口内已确证的条目与公开页合计。",
    "colDate": "日期",
    "colToken": "币种",
    "colAmount": "解锁量",
    "colValue": "美元估值",
    "colPct": "占流通量",
    "colAlloc": "归属方",
    "colType": "类型",
    "typeCliff": "悬崖解锁",
    "pinnedBadge": "置顶",
    "alertBadge": "大额",
    "allocUnknown": "未披露",
    "rowsSuffix": "条解锁",
    "emptyTitle": "这个窗口暂时没有条目",
    "emptyBody": "换另一个窗口看看，或等明天数据更新。",
    "methodTitle": "榜单口径（全部公开）",
    "methodBody": "数据走两条通道：① Tokenomist API 免费试用（每月 1,000 次调用、只看未来 7 天），配上 key 后本站每天 10:00 自动拉取、更新 7 天窗口；② 未接入前用 DefiLlama Unlocks 公开页的标注日期快照兜底，逐条标来源。红标规则：占流通量 ≥5% 或美元估值 ≥$2,000 万，任一命中即标「大额」。「占流通量」口径：快照为 DefiLlama 的占流通量比例；API 口径为解锁额占当前市值的比例（同一价格下与解锁量占流通量等价）。归属方只写数据源给了的，没给的标「未披露」，不猜。MON（Monad）口径分歧最大，置顶并在条目里把 DefiLlama（约 $2.52 亿、占流通量 144.89%）与 Tokenomist（约 $1.1 亿）两个口径都标清；ZRO 两个来源日期不一致，按 11 月 19–20 日区间显示。快照合计口径：未来 7 天 $4.144 亿、30 天 $9.69 亿，为 DefiLlama 公开页 2026-11-17 的页面合计。",
    "honestTitle": "解锁不是涨跌预测",
    "honestBody": "解锁只是供给端的事实：解锁后可能被抛售，也可能转去质押、做市或生态激励，历史上大额解锁之后涨、跌、横盘都出现过。本榜只帮你提前知道日子和量级，不预测价格，更不构成投资建议。",
    "disclaimerTitle": "数据可能调整，以项目方公告为准",
    "disclaimerBody": "第三方数据源的口径与时间表都可能变：项目方改期、口径修订都会让数字对不上。做重大决定前，请再核对项目方官方公告与链上合约。",
    "sourcesTitle": "数据来源"
},
  en: {
    "boardKicker": "Token Unlock Calendar · big unlocks, flagged in advance",
    "boardMetaPrefix": "Source:",
    "updatedOn": "Updated",
    "snapshotTag": "Snapshot",
    "total7d": "Unlocks in the next 7 days",
    "total30d": "Unlocks in the next 30 days",
    "totalNA": "Not in the free tier",
    "win7": "Next 7 days",
    "win30": "Next 30 days",
    "noteWin7Snapshot": "Snapshot mode: only source-confirmed entries are listed. Once the Tokenomist API key is connected, the 7-day window is filled in automatically every day.",
    "noteWin7Api": "The 7-day window is refreshed daily from the Tokenomist API (the free trial only looks 7 days ahead, one next cliff per token).",
    "noteWin30": "30-day window: the free tier (Tokenomist free trial) only provides per-event data for the next 7 days, so the 30-day list shows confirmed entries plus the published page total; a full 30-day list needs a paid plan.",
    "colDate": "Date",
    "colToken": "Token",
    "colAmount": "Amount",
    "colValue": "Value (USD)",
    "colPct": "% of circulating",
    "colAlloc": "Allocation",
    "colType": "Type",
    "typeCliff": "Cliff",
    "pinnedBadge": "Pinned",
    "alertBadge": "Large",
    "allocUnknown": "Not disclosed",
    "rowsSuffix": "unlocks",
    "emptyTitle": "No entries in this window yet",
    "emptyBody": "Try the other window, or wait for tomorrow's update.",
    "methodTitle": "How the board works (fully disclosed)",
    "methodBody": "Two data channels: (1) the Tokenomist API free trial (1,000 calls/month, next 7 days only) — once a key is connected, this site fetches it daily at 10:00 and refreshes the 7-day window; (2) until then, a dated snapshot of the public DefiLlama Unlocks page fills in, with every entry labelled by source. Flag rule: an unlock is marked “Large” when it is ≥5% of circulating supply or ≥$20M in value. The “% of circulating” column uses DefiLlama's share-of-circulating for snapshot rows and, for API rows, the unlock value as a share of current market cap (equivalent to amount over circulating supply at the same price). Allocations are printed only when the source provides them; otherwise they read “Not disclosed” — never guessed. MON (Monad) has the widest source disagreement, so it is pinned with both readings shown in its note: DefiLlama ≈ $251.79M and 144.89% of circulating, Tokenomist ≈ $110M. ZRO's date differs between sources and is shown as the Nov 19–20 range. Snapshot totals: $414.4M over 7 days and $969M over 30 days, the DefiLlama public page totals as of 2026-11-17.",
    "honestTitle": "An unlock is not a price prediction",
    "honestBody": "An unlock is a supply-side fact: unlocked tokens may be sold, or moved into staking, market making or ecosystem incentives — after large unlocks, prices have risen, fallen and gone sideways. This board only tells you the date and the size in advance; it does not predict prices and is not investment advice.",
    "disclaimerTitle": "Figures can change — the project's own notice wins",
    "disclaimerBody": "Third-party sources revise schedules and definitions: a project can postpone an unlock or restate a figure. Before any major decision, re-check the project's official announcements and the on-chain contracts.",
    "sourcesTitle": "Data sources"
},
  // TW-START
  tw: {
    "boardKicker": "代幣解鎖日曆榜 · 大額解鎖提前看",
    "boardMetaPrefix": "資料來源：",
    "updatedOn": "更新於",
    "snapshotTag": "快照版",
    "total7d": "未來 7 天解鎖總額",
    "total30d": "未來 30 天解鎖總額",
    "totalNA": "免費檔未提供",
    "win7": "未來 7 天",
    "win30": "未來 30 天",
    "noteWin7Snapshot": "當前是快照版：只列快照確證的條目；接入 Tokenomist API 後，未來 7 天視窗每天自動補全。",
    "noteWin7Api": "7 天視窗由 Tokenomist API 每天自動更新（免費試用只看未來 7 天，每幣只列下一次懸崖解鎖）。",
    "noteWin30": "30 天視窗：免費檔（Tokenomist 免費試用）只提供未來 7 天的逐條事件，30 天逐條明細待升級套餐；當前顯示視窗內已確證的條目與公開頁合計。",
    "colDate": "日期",
    "colToken": "幣種",
    "colAmount": "解鎖量",
    "colValue": "美元估值",
    "colPct": "佔流通量",
    "colAlloc": "歸屬方",
    "colType": "型別",
    "typeCliff": "懸崖解鎖",
    "pinnedBadge": "置頂",
    "alertBadge": "大額",
    "allocUnknown": "未披露",
    "rowsSuffix": "條解鎖",
    "emptyTitle": "這個視窗暫時沒有條目",
    "emptyBody": "換另一個視窗看看，或等明天資料更新。",
    "methodTitle": "榜單口徑（全部公開）",
    "methodBody": "資料走兩條通道：① Tokenomist API 免費試用（每月 1,000 次呼叫、只看未來 7 天），配上 key 後本站每天 10:00 自動拉取、更新 7 天視窗；② 未接入前用 DefiLlama Unlocks 公開頁的標註日期快照兜底，逐條標來源。紅標規則：佔流通量 ≥5% 或美元估值 ≥$2,000 萬，任一命中即標「大額」。「佔流通量」口徑：快照為 DefiLlama 的佔流通量比例；API 口徑為解鎖額佔當前市值的比例（同一價格下與解鎖量佔流通量等價）。歸屬方只寫資料來源給了的，沒給的標「未披露」，不猜。MON（Monad）口徑分歧最大，置頂並在條目裡把 DefiLlama（約 $2.52 億、佔流通量 144.89%）與 Tokenomist（約 $1.1 億）兩個口徑都標清；ZRO 兩個來源日期不一致，按 11 月 19–20 日區間顯示。快照合計口徑：未來 7 天 $4.144 億、30 天 $9.69 億，為 DefiLlama 公開頁 2026-11-17 的頁面合計。",
    "honestTitle": "解鎖不是漲跌預測",
    "honestBody": "解鎖只是供給端的事實：解鎖後可能被拋售，也可能轉去質押、做市或生態激勵，歷史上大額解鎖之後漲、跌、橫盤都出現過。本榜只幫你提前知道日子和量級，不預測價格，更不構成投資建議。",
    "disclaimerTitle": "資料可能調整，以專案方公告為準",
    "disclaimerBody": "第三方資料來源的口徑與時間表都可能變：專案方改期、口徑修訂都會讓數字對不上。做重大決定前，請再核對專案方官方公告與鏈上合約。",
    "sourcesTitle": "資料來源"
},
  // TW-END,
};

function fmtUsd(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtAmount(v: number | null, lang: Lang): string {
  if (v === null) return "—";
  if (lang === "en") {
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toLocaleString("en-US");
  }
  if (v >= 1e8) return `${(v / 1e8).toFixed(1)}亿`;
  if (v >= 1e4) return `${(v / 1e4).toFixed(1)}万`;
  return v.toLocaleString("en-US");
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  return `${v.toFixed(2)}%`;
}

function fmtDate(item: UnlockItem): string {
  if (item.dateEnd && item.dateEnd !== item.date) {
    return `${item.date} ~ ${item.dateEnd.slice(5)}`;
  }
  return item.date;
}

const RED_BADGE_STYLE = {
  color: "#fff",
  background: "var(--red)",
  borderRadius: 4,
  padding: "1px 6px",
  fontSize: 12,
} as const;

const PIN_BADGE_STYLE = {
  color: "#7a5b12",
  background: "#f3e3b3",
  borderRadius: 4,
  padding: "1px 6px",
  fontSize: 12,
} as const;

export default function UnlocksBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [windowDays, setWindowDays] = useState<7 | 30>(7);

  const isSnapshot = UNLOCKS_DATA.source === "snapshot";
  const visible = useMemo(
    () => unlocksInWindow(UNLOCK_ITEMS, windowDays),
    [windowDays]
  );
  const windowNote =
    windowDays === 30
      ? d.noteWin30
      : isSnapshot
        ? d.noteWin7Snapshot
        : d.noteWin7Api;

  return (
    <section className="card" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {d.boardMetaPrefix} {UNLOCKS_DATA.sourceLabel}
          {` · ${d.updatedOn} ${UNLOCKS_UPDATED}`}
          {isSnapshot && (
            <>
              {" "}
              <span className="chip">{d.snapshotTag}</span>
            </>
          )}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        {[
          { label: d.total7d, value: UNLOCKS_DATA.totals.next7dUsd },
          { label: d.total30d, value: UNLOCKS_DATA.totals.next30dUsd },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 200px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 14px",
              background: "var(--card)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              {s.label}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700 }}>
              {s.value !== null ? fmtUsd(s.value) : d.totalNA}
            </p>
          </div>
        ))}
      </div>

      <div
        className="chips-row"
        style={{ marginTop: 16 }}
        role="group"
        aria-label={d.win7}
      >
        {([7, 30] as const).map((w) => (
          <button
            key={w}
            type="button"
            className={`filter-chip${windowDays === w ? " on" : ""}`}
            onClick={() => setWindowDays(w)}
            aria-pressed={windowDays === w}
          >
            {w === 7 ? d.win7 : d.win30}
          </button>
        ))}
      </div>

      <p className="burn-note" style={{ marginTop: 12 }}>
        {windowNote}
      </p>
      <p className="burn-note">
        {visible.length} {d.rowsSuffix}
      </p>

      {visible.length === 0 ? (
        <>
          <p className="burn-note">{d.emptyTitle}</p>
          <p className="body-text">{d.emptyBody}</p>
        </>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{d.colDate}</th>
                <th>{d.colToken}</th>
                <th>{d.colAmount}</th>
                <th>{d.colValue}</th>
                <th>{d.colPct}</th>
                <th>{d.colAlloc}</th>
                <th>{d.colType}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const alert = isUnlockAlert(item);
                return (
                  <Fragment key={`${item.tokenId}-${item.date}`}>
                    <tr>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(item)}</td>
                      <td>
                        <strong>{item.symbol}</strong>{" "}
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>
                          {item.name}
                        </span>
                        {item.pinned && (
                          <>
                            {" "}
                            <span style={PIN_BADGE_STYLE}>{d.pinnedBadge}</span>
                          </>
                        )}
                        {alert && (
                          <>
                            {" "}
                            <span style={RED_BADGE_STYLE}>{d.alertBadge}</span>
                          </>
                        )}
                      </td>
                      <td>{fmtAmount(item.amount, lang)}</td>
                      <td>{fmtUsd(item.valueUsd)}</td>
                      <td
                        style={
                          item.pctCirc !== null && item.pctCirc >= 5
                            ? { color: "var(--red)", fontWeight: 700 }
                            : undefined
                        }
                      >
                        {fmtPct(item.pctCirc)}
                      </td>
                      <td>{item.allocations ? item.allocations : d.allocUnknown}</td>
                      <td>{d.typeCliff}</td>
                    </tr>
                    {item.note && (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ color: "var(--muted)", fontSize: 13 }}
                        >
                          {item.note}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
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
        DefiLlama ·{" "}
        <a
          href="https://defillama.com/unlocks"
          target="_blank"
          rel="noopener noreferrer"
        >
          defillama.com/unlocks
        </a>
        {" · "}Tokenomist ·{" "}
        <a
          href="https://tokenomist.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          tokenomist.ai
        </a>
      </p>
    </section>
  );
}
