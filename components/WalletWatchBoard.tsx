"use client";

import { useCallback, useRef, useState } from "react";
import type { WalletWatchPayload, WatchTx } from "@/lib/walletwatch";
import { CHAIN_META } from "@/lib/walletwatch";
import { LOCALE, type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    boardSub: string;
    placeholder: string;
    chainLabel: string;
    chainAuto: string;
    queryBtn: string;
    querying: string;
    warnText: string;
    balanceLabel: string;
    txCountLabel: string;
    listedLabel: string;
    inLabel: string;
    outLabel: string;
    netLabel: string;
    sumNote: string; // {n} {k}
    outAlertTitle: string;
    outAlertText: string; // {m} {amt} {sym}
    colTime: string;
    colDir: string;
    colAmount: string;
    colCounter: string;
    colTx: string;
    dirIn: string;
    dirOut: string;
    dirSelf: string;
    dirUnknown: string;
    pending: string;
    failed: string;
    noTx: string;
    sourceNote: string; // {src} {t}
    caliberTitle: string;
    caliber: string[];
    viewTx: string;
  }
> = {
  zh: {
    boardKicker: "钱包只读监控",
    boardSub: "粘贴一个公开地址，立刻看它的余额、最近转账和出入账汇总——只读查询，不连钱包。",
    placeholder: "粘贴 BTC / ETH / SOL 公开地址，如 bc1q…、0x… 或 Solana 地址",
    chainLabel: "链",
    chainAuto: "自动识别",
    queryBtn: "查询",
    querying: "查询中…",
    warnText:
      "安全提醒：这里只粘贴公开地址。任何网站要你输入私钥或助记词都是诈骗——本工具不需要、本站也不会保存你查询过的地址。",
    balanceLabel: "当前余额",
    txCountLabel: "链上交易总笔数",
    listedLabel: "本次列出",
    inLabel: "转入合计（所列）",
    outLabel: "转出合计（所列）",
    netLabel: "净流入（所列）",
    sumNote: "汇总基于最近 {n} 笔交易中金额可取到的 {k} 笔，不是该地址的全部历史。",
    outAlertTitle: "最近有转出记录",
    outAlertText: "所列交易中有 {m} 笔转出，最大一笔 {amt} {sym}。如果不是你本人操作，请立刻核查。",
    colTime: "时间",
    colDir: "方向",
    colAmount: "金额",
    colCounter: "对方地址",
    colTx: "交易",
    dirIn: "转入",
    dirOut: "转出",
    dirSelf: "自转",
    dirUnknown: "—",
    pending: "未确认",
    failed: "失败",
    noTx: "该地址暂无可列出的原生币交易。",
    sourceNote: "数据来源：{src} · 查询时间 {t}",
    caliberTitle: "口径与限制（先看清再用）",
    caliber: [
      "只统计原生币（BTC / ETH / SOL）转账：代币转账（如 ERC-20、SPL）与合约内部交易不在统计内，余额也只是原生币余额。",
      "金额是该地址在这笔交易中的净变动：BTC 已扣除找零回流，含网络费的影响；Solana 的对方地址按余额反向变动推断，复杂交易（如兑换）可能不准。",
      "本页是即查即看版：不提供每 30 分钟自动扫描与出账报警——那类功能需要账号与后台服务，本站不做，也请不要轻信声称能「托管监控」的陌生网站。",
      "查询经本站服务器调取链上公开接口，地址不落盘保存；结果短时缓存 60 秒，链上刚发生的交易可能稍有延迟。",
    ],
    viewTx: "看交易",
  },
  tw: {
    boardKicker: "錢包唯讀監控",
    boardSub: "貼上一個公開地址，立刻看它的餘額、最近轉帳和出入帳彙總——唯讀查詢，不連錢包。",
    placeholder: "貼上 BTC / ETH / SOL 公開地址，如 bc1q…、0x… 或 Solana 地址",
    chainLabel: "鏈",
    chainAuto: "自動識別",
    queryBtn: "查詢",
    querying: "查詢中…",
    warnText:
      "安全提醒：這裡只貼上公開地址。任何網站要你輸入私鑰或助記詞都是詐騙——本工具不需要、本站也不會保存你查詢過的地址。",
    balanceLabel: "目前餘額",
    txCountLabel: "鏈上交易總筆數",
    listedLabel: "本次列出",
    inLabel: "轉入合計（所列）",
    outLabel: "轉出合計（所列）",
    netLabel: "淨流入（所列）",
    sumNote: "彙總基於最近 {n} 筆交易中金額可取到的 {k} 筆，不是該地址的全部歷史。",
    outAlertTitle: "最近有轉出記錄",
    outAlertText: "所列交易中有 {m} 筆轉出，最大一筆 {amt} {sym}。如果不是你本人操作，請立刻核查。",
    colTime: "時間",
    colDir: "方向",
    colAmount: "金額",
    colCounter: "對方地址",
    colTx: "交易",
    dirIn: "轉入",
    dirOut: "轉出",
    dirSelf: "自轉",
    dirUnknown: "—",
    pending: "未確認",
    failed: "失敗",
    noTx: "該地址暫無可列出的原生幣交易。",
    sourceNote: "資料來源：{src} · 查詢時間 {t}",
    caliberTitle: "口徑與限制（先看清再用）",
    caliber: [
      "只統計原生幣（BTC / ETH / SOL）轉帳：代幣轉帳（如 ERC-20、SPL）與合約內部交易不在統計內，餘額也只是原生幣餘額。",
      "金額是該地址在這筆交易中的淨變動：BTC 已扣除找零回流，含網路費的影響；Solana 的對方地址按餘額反向變動推斷，複雜交易（如兌換）可能不準。",
      "本頁是即查即看版：不提供每 30 分鐘自動掃描與出帳報警——那類功能需要帳號與後台服務，本站不做，也請不要輕信聲稱能「託管監控」的陌生網站。",
      "查詢經本站伺服器調取鏈上公開介面，地址不落盤保存；結果短時快取 60 秒，鏈上剛發生的交易可能稍有延遲。",
    ],
    viewTx: "看交易",
  },
  en: {
    boardKicker: "Wallet Watch (Read-Only)",
    boardSub:
      "Paste a public address to see its balance, latest transfers and in/out totals — read-only, no wallet connection.",
    placeholder: "Paste a BTC / ETH / SOL public address, e.g. bc1q…, 0x… or a Solana address",
    chainLabel: "Chain",
    chainAuto: "Auto-detect",
    queryBtn: "Check",
    querying: "Checking…",
    warnText:
      "Safety first: only ever paste a public address here. Any site asking for your private key or seed phrase is a scam — this tool never needs one, and this site does not store the addresses you check.",
    balanceLabel: "Current balance",
    txCountLabel: "Total on-chain transactions",
    listedLabel: "Listed here",
    inLabel: "Total in (listed)",
    outLabel: "Total out (listed)",
    netLabel: "Net flow (listed)",
    sumNote:
      "Totals cover the {k} of the {n} most recent transactions whose amounts could be fetched — not the address's full history.",
    outAlertTitle: "Recent outflows found",
    outAlertText:
      "{m} of the listed transactions are outflows; the largest is {amt} {sym}. If that was not you, investigate immediately.",
    colTime: "Time",
    colDir: "Direction",
    colAmount: "Amount",
    colCounter: "Counterparty",
    colTx: "Tx",
    dirIn: "In",
    dirOut: "Out",
    dirSelf: "Self",
    dirUnknown: "—",
    pending: "Unconfirmed",
    failed: "Failed",
    noTx: "No native-coin transactions to list for this address yet.",
    sourceNote: "Source: {src} · Fetched at {t}",
    caliberTitle: "Scope & limits (read before relying on it)",
    caliber: [
      "Native coins only (BTC / ETH / SOL): token transfers (ERC-20, SPL) and internal contract transactions are not counted, and the balance is the native-coin balance only.",
      "Amounts are the address's net balance change in that transaction: BTC figures are net of change outputs and include the fee effect; on Solana the counterparty is inferred from opposing balance changes and can be wrong for complex transactions such as swaps.",
      "This page is check-on-demand: it does not run 30-minute background scans or send outflow alerts — that needs accounts and a backend service, which this site does not offer. Be wary of unknown sites offering 'custodial monitoring'.",
      "Queries go through this site's server to public chain APIs; addresses are never written to disk. Results are cached for 60 seconds, so a just-broadcast transaction may appear slightly late.",
    ],
    viewTx: "View tx",
  },
};

function fmtAmt(v: number, locale: string, maxDp = 8): string {
  return v.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDp,
  });
}

function shortAddr(a: string | null): string {
  if (!a) return "—";
  if (a.length <= 16) return a;
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

function shortHash(h: string): string {
  return h.length <= 14 ? h : `${h.slice(0, 8)}…${h.slice(-6)}`;
}

export default function WalletWatchBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const locale = LOCALE[lang];

  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<WalletWatchPayload | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const addr = address.trim();
      if (!addr || loading) return;
      abortRef.current?.abort();
      const ctl = new AbortController();
      abortRef.current = ctl;
      setLoading(true);
      setFatal(null);
      try {
        const qs = new URLSearchParams({ address: addr, chain });
        const res = await fetch(`/api/wallet-watch?${qs.toString()}`, {
          signal: ctl.signal,
        });
        const data = (await res.json()) as WalletWatchPayload;
        setPayload(data);
        if (!data.ok && data.error) setFatal(data.error);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setFatal(String(err).slice(0, 160));
        }
      } finally {
        setLoading(false);
      }
    },
    [address, chain, loading]
  );

  const outs = payload?.txs.filter((t) => t.direction === "out") ?? [];
  const largestOut =
    outs.length > 0
      ? outs.reduce<WatchTx | null>(
          (best, t) =>
            t.amount !== null && (best === null || (best.amount ?? -1) < t.amount)
              ? t
              : best,
          null
        )
      : null;

  const dirLabel = (t: WatchTx) =>
    t.direction === "in"
      ? d.dirIn
      : t.direction === "out"
        ? d.dirOut
        : t.direction === "self"
          ? d.dirSelf
          : d.dirUnknown;

  return (
    <section className="crcl-board" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">{d.boardSub}</p>
      </div>

      <p className="ww-warn">{d.warnText}</p>

      <form className="ipc-form" onSubmit={run}>
        <input
          className="ipc-input"
          style={{ flex: "1 1 320px" }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={d.placeholder}
          spellCheck={false}
          autoComplete="off"
        />
        <label className="ww-chain-label">
          {d.chainLabel}
          <select
            className="ww-select"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            <option value="auto">{d.chainAuto}</option>
            <option value="btc">Bitcoin (BTC)</option>
            <option value="eth">Ethereum (ETH)</option>
            <option value="sol">Solana (SOL)</option>
          </select>
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? d.querying : d.queryBtn}
        </button>
      </form>

      {fatal && <p className="burn-note">{fatal}</p>}

      {payload?.ok && (
        <>
          <div className="ipc-head">
            <p className="ipc-kind">
              {payload.chainName} · {payload.symbol}
            </p>
            <p className="ipc-bigip ww-address">{payload.address}</p>
            <p className="ipc-fetched">
              {d.sourceNote
                .replace("{src}", payload.source ?? "—")
                .replace(
                  "{t}",
                  new Date(payload.fetchedAt).toLocaleString(locale, {
                    hour12: false,
                  })
                )}
            </p>
          </div>

          <div className="burn-grid crcl-stats">
            <div className="burn-stat burn-stat-hero">
              <p className="burn-stat-label">{d.balanceLabel}</p>
              <p className="burn-stat-value">
                {payload.balance !== null
                  ? `${fmtAmt(payload.balance, locale, 6)} ${payload.symbol}`
                  : "—"}
              </p>
              <p className="burn-stat-sub">
                {payload.txCount !== null
                  ? `${d.txCountLabel}: ${payload.txCount.toLocaleString(locale)}`
                  : ""}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.inLabel}</p>
              <p className="burn-stat-value" style={{ color: "var(--green)" }}>
                +{fmtAmt(payload.inSum, locale)} {payload.symbol}
              </p>
              <p className="burn-stat-sub">
                {d.listedLabel}: {payload.listedCount}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.outLabel}</p>
              <p className="burn-stat-value" style={{ color: "var(--red)" }}>
                −{fmtAmt(payload.outSum, locale)} {payload.symbol}
              </p>
              <p className="burn-stat-sub">
                {d.sumNote
                  .replace("{n}", String(payload.listedCount))
                  .replace("{k}", String(payload.amountKnownCount))}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.netLabel}</p>
              <p
                className="burn-stat-value"
                style={{
                  color:
                    payload.netSum > 0
                      ? "var(--green)"
                      : payload.netSum < 0
                        ? "var(--red)"
                        : undefined,
                }}
              >
                {payload.netSum > 0 ? "+" : payload.netSum < 0 ? "−" : ""}
                {fmtAmt(Math.abs(payload.netSum), locale)} {payload.symbol}
              </p>
              <p className="burn-stat-sub"></p>
            </div>
          </div>

          {outs.length > 0 && (
            <div className="ww-alert" role="note">
              <p className="ww-alert-title">⚠ {d.outAlertTitle}</p>
              <p>
                {d.outAlertText
                  .replace("{m}", String(outs.length))
                  .replace(
                    "{amt}",
                    largestOut?.amount !== null && largestOut?.amount !== undefined
                      ? fmtAmt(largestOut.amount, locale)
                      : "—"
                  )
                  .replace("{sym}", payload.symbol ?? "")}
              </p>
            </div>
          )}

          {payload.txs.length === 0 ? (
            <p className="burn-note">{d.noTx}</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{d.colTime}</th>
                    <th>{d.colDir}</th>
                    <th>{d.colAmount}</th>
                    <th>{d.colCounter}</th>
                    <th>{d.colTx}</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.txs.map((t) => (
                    <tr key={t.hash}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {t.time !== null
                          ? new Date(t.time * 1000).toLocaleString(locale, {
                              hour12: false,
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : d.pending}
                        {t.failed ? ` · ${d.failed}` : ""}
                        {!t.confirmed && t.time !== null ? ` · ${d.pending}` : ""}
                      </td>
                      <td>
                        <span
                          className="ww-dir"
                          style={{
                            color:
                              t.direction === "in"
                                ? "var(--green)"
                                : t.direction === "out"
                                  ? "var(--red)"
                                  : "var(--muted)",
                          }}
                        >
                          {t.direction === "in"
                            ? "↓ "
                            : t.direction === "out"
                              ? "↑ "
                              : ""}
                          {dirLabel(t)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {t.amount !== null
                          ? `${t.direction === "in" ? "+" : t.direction === "out" ? "−" : ""}${fmtAmt(t.amount, locale)} ${payload.symbol}`
                          : "—"}
                      </td>
                      <td>
                        {t.counterparty ? (
                          <a
                            href={
                              payload.chain
                                ? CHAIN_META[payload.chain].addrBase + t.counterparty
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t.counterparty}
                          >
                            {shortAddr(t.counterparty)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <a
                          href={t.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t.hash}
                        >
                          {shortHash(t.hash)} ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="ww-caliber">
            <h3>{d.caliberTitle}</h3>
            <ul>
              {d.caliber.map((line) => (
                <li key={line.slice(0, 24)}>{line}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
