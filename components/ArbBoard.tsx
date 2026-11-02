"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ARB_ASSETS,
  type ArbPayload,
  type ArbRow,
} from "@/lib/arb";
import { LOCALE, type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    sourceLine: string; // {t} 取数时间
    loading: string;
    loadError: string;
    refresh: string;
    refreshing: string;
    secTable: string;
    tableIntro: string;
    colAsset: string;
    colSolana: string;
    colBsc: string;
    colGross: string;
    colDirection: string;
    colNet: string;
    liq: string; // 「流动性」
    dirTemplate: string; // {buy} {sell}
    flat: string;
    droppedTemplate: string; // {symbol} {detail}
    droppedChainLiq: string; // {chain} {liq}
    droppedChainNone: string; // {chain}
    secCosts: string;
    costsIntro: string;
    swapFee: string;
    bridgeFee: string;
    slippage: string;
    thresholdLabel: string;
    totalCost: string; // {x}
    secCaliber: string;
    caliber: string[];
  }
> = {
  zh: {
    boardKicker: "跨链套利扫描 · Solana ↔ BSC 同资产价差",
    sourceLine: "数据来源：DexScreener 公开接口 · 取数 {t} · 每 60 秒自动刷新",
    loading: "正在拉取两条链的 DEX 报价…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    refresh: "立即刷新",
    refreshing: "刷新中…",
    secTable: "01 · 价差总览",
    tableIntro:
      "每个资产取它在 Solana 与 BSC 上流动性最大的美元交易对报价；毛价差按低价链的价格计算，净价差是毛价差扣掉下方成本参数后的结果。表格按 |净价差| 从大到小排，净价差大于 0 的行标绿——那只是纸面空间，先看口径再动手。",
    colAsset: "资产",
    colSolana: "Solana 价格",
    colBsc: "BSC 价格",
    colGross: "毛价差",
    colDirection: "方向（低买 → 高卖）",
    colNet: "净价差",
    liq: "流动性",
    dirTemplate: "{buy} 买入 → {sell} 卖出",
    flat: "两链同价",
    droppedTemplate: "{symbol} 未列入：{detail}（收录门槛为两侧最大美元对流动性均 ≥ $30,000）",
    droppedChainLiq: "{chain} 侧最大对流动性仅 {liq}",
    droppedChainNone: "{chain} 侧无合格美元交易对",
    secCosts: "02 · 成本参数",
    costsIntro:
      "净价差 = 毛价差 −（2 × 单次兑换费 + 跨链桥费 + 滑点）。参数只保存在你这台设备的浏览器里，按你实际用的 DEX 和桥修改；网络 gas 与桥的固定费用不在这三项里，小资金时别忘了另算。",
    swapFee: "单次兑换费 %（买、卖各一次）",
    bridgeFee: "跨链桥费 %",
    slippage: "滑点 %",
    thresholdLabel: "只看净价差 ≥",
    totalCost: "当前总成本：{x}%",
    secCaliber: "03 · 口径与风险",
    caliber: [
      "价格口径：每条链取该资产流动性最大的美元（稳定币计价）交易对的池子报价，DEX、交易对与流动性逐行标注。池子报价是边际价格，不等于你的成交价——下单金额相对池子越大，实际滑点越高。",
      "资产性质：同名资产在两条链上不是同一个东西。SOL 的 BSC 版是币安锚定代币，ETH 的 Solana 版经 Wormhole 桥接，BTC 两侧分别是 Coinbase 的 cbBTC 与币安锚定的 BTCB（每行资产下方有注）。锚定/桥接资产多一层发行方与桥的信用和合约风险，价差里有一部分正是市场在给这层风险定价。",
      "时间风险：跨链搬运通常要数分钟到数十分钟，取决于桥和网络拥堵；这段时间里价差可能收窄、反转甚至消失。净价差为正，不等于真能赚到。",
      "成本口径：净价差只扣了兑换费、跨链桥费和滑点三项，没算两条链的网络 gas、桥的固定收费和资金占用时间。金额越小，固定成本占比越高，请按自己的实际通道改参数。",
      "收录门槛：只收两侧最大美元对流动性都 ≥ $30,000 的资产。BNB 没有收录——它在 Solana 上没有公认的官方或锚定代币，搜到的同名代币互不相同、报价彼此打架，无法给出可信价格，宁可空缺。",
      "本工具只做价差监控：不连钱包、不下单、不执行任何交易，也不构成投资建议。",
    ],
  },
  en: {
    boardKicker: "Cross-Chain Arb Scanner · Solana ↔ BSC price gaps",
    sourceLine: "Source: DexScreener public API · fetched {t} · auto-refreshes every 60s",
    loading: "Fetching DEX quotes from both chains…",
    loadError: "Data failed to load for now — please refresh later.",
    refresh: "Refresh now",
    refreshing: "Refreshing…",
    secTable: "01 · Spread Overview",
    tableIntro:
      "Each asset is quoted from its largest USD pair on Solana and on BSC. The gross spread is measured against the cheaper chain's price; the net spread subtracts the cost parameters below. Rows are sorted by |net spread|, largest first, and rows with a positive net spread are marked green — that is paper room only, so read the caliber notes before acting.",
    colAsset: "Asset",
    colSolana: "Solana price",
    colBsc: "BSC price",
    colGross: "Gross spread",
    colDirection: "Direction (buy low → sell high)",
    colNet: "Net spread",
    liq: "liquidity",
    dirTemplate: "Buy {buy} → Sell {sell}",
    flat: "Priced the same",
    droppedTemplate: "{symbol} not listed: {detail} (both sides' largest USD pair must hold ≥ $30,000)",
    droppedChainLiq: "largest {chain} pair holds only {liq}",
    droppedChainNone: "no qualifying USD pair on {chain}",
    secCosts: "02 · Cost Parameters",
    costsIntro:
      "Net spread = gross spread − (2 × swap fee + bridge fee + slippage). Parameters are stored only in this browser — set them to the DEX and bridge you actually use. Chain gas and fixed bridge charges are not in these three numbers; on small amounts, count them separately.",
    swapFee: "Swap fee % (once per side)",
    bridgeFee: "Bridge fee %",
    slippage: "Slippage %",
    thresholdLabel: "Only net spread ≥",
    totalCost: "Total cost now: {x}%",
    secCaliber: "03 · Caliber & Risks",
    caliber: [
      "Pricing: each chain's quote is the pool price of that asset's largest USD (stablecoin-quoted) pair, with the DEX, pair and liquidity shown on every row. A pool quote is a marginal price, not your fill — the larger your order is relative to the pool, the more slippage you actually pay.",
      "Asset nature: the same symbol is not the same thing on both chains. SOL on BSC is a Binance-pegged token, ETH on Solana arrived via Wormhole, and BTC is Coinbase's cbBTC on one side and Binance-pegged BTCB on the other (noted under each asset). Pegged and bridged assets carry an extra layer of issuer and bridge credit and contract risk — part of any spread is the market pricing exactly that risk.",
      "Time risk: moving assets across chains takes minutes to tens of minutes depending on the bridge and congestion; a spread can narrow, flip or vanish during the trip. A positive net spread is not money in the bank.",
      "Cost caliber: the net spread deducts only swap fees, the bridge fee and slippage. It does not include gas on either chain, fixed bridge charges, or the time your capital is in transit. The smaller the amount, the heavier fixed costs weigh — adjust the parameters to your own route.",
      "Listing bar: an asset is listed only when its largest USD pair on both chains holds at least $30,000. BNB is not listed — it has no recognised official or pegged token on Solana, and the same-name tokens found there disagree wildly on price, so there is no honest quote to show.",
      "This tool only monitors spreads: it connects no wallet, places no orders and executes no trades. Nothing here is investment advice.",
    ],
  },
  tw: {
    boardKicker: "跨鏈套利掃描 · Solana ↔ BSC 同資產價差",
    sourceLine: "資料來源：DexScreener 公開介面 · 取數 {t} · 每 60 秒自動重新整理",
    loading: "正在拉取兩條鏈的 DEX 報價…",
    loadError: "資料暫時拉取失敗，請稍後重新整理重試。",
    refresh: "立即重新整理",
    refreshing: "重新整理中…",
    secTable: "01 · 價差總覽",
    tableIntro:
      "每個資產取它在 Solana 與 BSC 上流動性最大的美元交易對報價；毛價差按低價鏈的價格計算，淨價差是毛價差扣掉下方成本參數後的結果。表格按 |淨價差| 從大到小排，淨價差大於 0 的行標綠——那只是紙面空間，先看口徑再動手。",
    colAsset: "資產",
    colSolana: "Solana 價格",
    colBsc: "BSC 價格",
    colGross: "毛價差",
    colDirection: "方向（低買 → 高賣）",
    colNet: "淨價差",
    liq: "流動性",
    dirTemplate: "{buy} 買入 → {sell} 賣出",
    flat: "兩鏈同價",
    droppedTemplate: "{symbol} 未列入：{detail}（收錄門檻為兩側最大美元對流動性均 ≥ $30,000）",
    droppedChainLiq: "{chain} 側最大對流動性僅 {liq}",
    droppedChainNone: "{chain} 側無合格美元交易對",
    secCosts: "02 · 成本參數",
    costsIntro:
      "淨價差 = 毛價差 −（2 × 單次兌換費 + 跨鏈橋費 + 滑點）。參數只保存在你這台裝置的瀏覽器裡，按你實際用的 DEX 和橋修改；網路 gas 與橋的固定費用不在這三項裡，小資金時別忘了另算。",
    swapFee: "單次兌換費 %（買、賣各一次）",
    bridgeFee: "跨鏈橋費 %",
    slippage: "滑點 %",
    thresholdLabel: "只看淨價差 ≥",
    totalCost: "目前總成本：{x}%",
    secCaliber: "03 · 口徑與風險",
    caliber: [
      "價格口徑：每條鏈取該資產流動性最大的美元（穩定幣計價）交易對的池子報價，DEX、交易對與流動性逐行標註。池子報價是邊際價格，不等於你的成交價——下單金額相對池子越大，實際滑點越高。",
      "資產性質：同名資產在兩條鏈上不是同一個東西。SOL 的 BSC 版是幣安錨定代幣，ETH 的 Solana 版經 Wormhole 橋接，BTC 兩側分別是 Coinbase 的 cbBTC 與幣安錨定的 BTCB（每行資產下方有注）。錨定/橋接資產多一層發行方與橋的信用和合約風險，價差裡有一部分正是市場在給這層風險定價。",
      "時間風險：跨鏈搬運通常要數分鐘到數十分鐘，取決於橋和網路擁堵；這段時間裡價差可能收窄、反轉甚至消失。淨價差為正，不等於真能賺到。",
      "成本口徑：淨價差只扣了兌換費、跨鏈橋費和滑點三項，沒算兩條鏈的網路 gas、橋的固定收費和資金占用時間。金額越小，固定成本占比越高，請按自己的實際通道改參數。",
      "收錄門檻：只收兩側最大美元對流動性都 ≥ $30,000 的資產。BNB 沒有收錄——它在 Solana 上沒有公認的官方或錨定代幣，搜到的同名代幣互不相同、報價彼此打架，無法給出可信價格，寧可空缺。",
      "本工具只做價差監控：不連錢包、不下單、不執行任何交易，也不構成投資建議。",
    ],
  },
};

const SETTINGS_KEY = "arb-scanner-settings";

interface ArbSettings {
  swapFee: string;
  bridgeFee: string;
  slippage: string;
  threshold: string;
  onlyAbove: boolean;
}

const DEFAULT_SETTINGS: ArbSettings = {
  swapFee: "0.25",
  bridgeFee: "0.3",
  slippage: "0.3",
  threshold: "0",
  onlyAbove: false,
};

function num(v: string, fallback = 0): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function fmtPrice(v: number): string {
  if (v >= 100)
    return v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (v >= 1) return v.toFixed(4);
  return v.toFixed(5);
}

function fmtLiq(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number, signed: boolean): string {
  const abs = Math.abs(v);
  const digits = abs !== 0 && abs < 0.1 ? 3 : 2;
  const s = abs.toFixed(digits);
  if (!signed) return `${s}%`;
  if (v > 0) return `+${s}%`;
  if (v < 0) return `−${s}%`;
  return `${s}%`;
}

function fmtTime(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang], {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface ComputedRow {
  row: ArbRow;
  gross: number;
  net: number;
  buyChain: "Solana" | "BSC" | null;
  sellChain: "Solana" | "BSC" | null;
}

export default function ArbBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<ArbPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<ArbSettings>(DEFAULT_SETTINGS);

  // 成本参数只存本地（localStorage），不上传
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ArbSettings>;
        setSettings({
          swapFee: String(parsed.swapFee ?? DEFAULT_SETTINGS.swapFee),
          bridgeFee: String(parsed.bridgeFee ?? DEFAULT_SETTINGS.bridgeFee),
          slippage: String(parsed.slippage ?? DEFAULT_SETTINGS.slippage),
          threshold: String(parsed.threshold ?? DEFAULT_SETTINGS.threshold),
          onlyAbove: Boolean(parsed.onlyAbove),
        });
      }
    } catch {
      /* 读不到就用默认值 */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* 存不下不影响使用 */
    }
  }, [settings]);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/arb", { cache: "no-store" });
      const payload = (await res.json()) as ArbPayload;
      if (payload.error && payload.rows.length === 0) {
        setFailed(true);
      } else {
        setData(payload);
        setFailed(false);
      }
    } catch {
      setFailed(true);
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const totalCost =
    2 * num(settings.swapFee) + num(settings.bridgeFee) + num(settings.slippage);
  const threshold = num(settings.threshold);

  const computed = useMemo<ComputedRow[]>(() => {
    if (!data) return [];
    const out: ComputedRow[] = [];
    for (const row of data.rows) {
      if (!row.ok || !row.solana || !row.bsc) continue;
      const solP = row.solana.priceUsd;
      const bscP = row.bsc.priceUsd;
      const low = Math.min(solP, bscP);
      const high = Math.max(solP, bscP);
      const gross = low > 0 ? ((high - low) / low) * 100 : 0;
      const net = gross - totalCost;
      out.push({
        row,
        gross,
        net,
        buyChain: gross === 0 ? null : solP < bscP ? "Solana" : "BSC",
        sellChain: gross === 0 ? null : solP < bscP ? "BSC" : "Solana",
      });
    }
    out.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    return out;
  }, [data, totalCost]);

  const visible = settings.onlyAbove
    ? computed.filter((c) => c.net >= threshold)
    : computed;
  const dropped = data?.rows.filter((r) => !r.ok) ?? [];
  const natureBySymbol = useMemo(
    () => new Map(ARB_ASSETS.map((a) => [a.symbol, a.nature])),
    [],
  );

  return (
    <section className="crcl-board">
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        <p className="burn-board-meta">
          {data
            ? d.sourceLine.replace("{t}", fmtTime(data.fetchedAt, lang))
            : d.loading}
        </p>
      </div>

      {!data && !failed && <p className="body-text">{d.loading}</p>}
      {failed && !data && <p className="body-text">{d.loadError}</p>}

      {data && (
        <>
          <h3 className="crcl-sec-title">{d.secTable}</h3>
          <p className="body-text crcl-sec-intro">{d.tableIntro}</p>
          <div className="burn-table-wrap">
            <table className="burn-table arb-table">
              <thead>
                <tr>
                  <th>{d.colAsset}</th>
                  <th>{d.colSolana}</th>
                  <th>{d.colBsc}</th>
                  <th>{d.colGross}</th>
                  <th>{d.colDirection}</th>
                  <th>{d.colNet}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.row.symbol} className={c.net > 0 ? "arb-row-pos" : undefined}>
                    <td>
                      <span className="arb-price">{c.row.symbol}</span>
                      <span className="arb-sub">
                        {natureBySymbol.get(c.row.symbol)?.[lang]}
                      </span>
                    </td>
                    <td>
                      <span className="arb-price">${fmtPrice(c.row.solana!.priceUsd)}</span>
                      <span className="arb-sub">
                        {c.row.solana!.dex} {c.row.solana!.pair} · {d.liq}{" "}
                        {fmtLiq(c.row.solana!.liquidityUsd)}
                      </span>
                    </td>
                    <td>
                      <span className="arb-price">${fmtPrice(c.row.bsc!.priceUsd)}</span>
                      <span className="arb-sub">
                        {c.row.bsc!.dex} {c.row.bsc!.pair} · {d.liq}{" "}
                        {fmtLiq(c.row.bsc!.liquidityUsd)}
                      </span>
                    </td>
                    <td>{fmtPct(c.gross, false)}</td>
                    <td>
                      {c.buyChain && c.sellChain
                        ? d.dirTemplate
                            .replace("{buy}", c.buyChain)
                            .replace("{sell}", c.sellChain)
                        : d.flat}
                    </td>
                    <td className={c.net > 0 ? "arb-net-pos" : "arb-net-neg"}>
                      {fmtPct(c.net, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {dropped.map((r) => (
            <p key={r.symbol} className="body-text arb-dropped">
              {d.droppedTemplate
                .replace("{symbol}", r.symbol)
                .replace(
                  "{detail}",
                  r.shortfalls
                    .map((s) =>
                      s.liquidityUsd == null
                        ? d.droppedChainNone.replace(
                            "{chain}",
                            s.chain === "solana" ? "Solana" : "BSC",
                          )
                        : d.droppedChainLiq
                            .replace(
                              "{chain}",
                              s.chain === "solana" ? "Solana" : "BSC",
                            )
                            .replace("{liq}", fmtLiq(s.liquidityUsd)),
                    )
                    .join("；"),
                )}
            </p>
          ))}

          <div className="arb-refresh-row">
            <button
              type="button"
              className="arb-refresh-btn"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              {refreshing ? d.refreshing : d.refresh}
            </button>
            {failed && <span className="arb-refresh-err">{d.loadError}</span>}
          </div>

          <h3 className="crcl-sec-title">{d.secCosts}</h3>
          <p className="body-text crcl-sec-intro">{d.costsIntro}</p>
          <div className="arb-settings">
            <label className="arb-field">
              <span>{d.swapFee}</span>
              <input
                className="ft-input arb-input"
                type="number"
                min="0"
                step="0.05"
                value={settings.swapFee}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, swapFee: e.target.value }))
                }
              />
            </label>
            <label className="arb-field">
              <span>{d.bridgeFee}</span>
              <input
                className="ft-input arb-input"
                type="number"
                min="0"
                step="0.05"
                value={settings.bridgeFee}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, bridgeFee: e.target.value }))
                }
              />
            </label>
            <label className="arb-field">
              <span>{d.slippage}</span>
              <input
                className="ft-input arb-input"
                type="number"
                min="0"
                step="0.05"
                value={settings.slippage}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, slippage: e.target.value }))
                }
              />
            </label>
            <label className="arb-field">
              <span>{d.thresholdLabel}</span>
              <span className="arb-threshold-row">
                <input
                  type="checkbox"
                  checked={settings.onlyAbove}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, onlyAbove: e.target.checked }))
                  }
                />
                <input
                  className="ft-input arb-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.threshold}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, threshold: e.target.value }))
                  }
                />
                <span>%</span>
              </span>
            </label>
            <p className="arb-total-cost">
              {d.totalCost.replace("{x}", totalCost.toFixed(2))}
            </p>
          </div>

          <h3 className="crcl-sec-title">{d.secCaliber}</h3>
          <div className="burn-note">
            {d.caliber.map((line, i) => (
              <p key={i} className="body-text">
                {line}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
