"use client";

import { useEffect, useState } from "react";
import type { UniBurnData } from "@/lib/uniburn";
import { DEAD_ADDRESS, UNI_ADDRESS } from "@/lib/uniburn";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

// UNI 销毁看板本体：/tag/burn 标签页与 /tool/uni-burn 工具页共用。
// 数据走 /api/uni-burn（服务端读以太坊主网 UNI 合约，缓存 30 分钟）。
const DICT: Record<
  Lang,
  {
    boardKicker: string;
    updatedAt: string;
    blockHeight: string;
    loading: string;
    loadError: string;
    totalBurned: string;
    totalBurnedSub: string;
    burnedShare: string;
    burnedShareSub: string;
    totalSupply: string;
    totalSupplySub: string;
    effectiveSupply: string;
    effectiveSupplySub: string;
    burn24h: string;
    burn24hSub: string;
    burn30d: string;
    burn30dSub: string;
    annualized: string;
    annualizedSub: string;
    deflationRate: string;
    deflationRateSub: string;
    unavailable: string;
    recentTitle: string;
    colTime: string;
    colAmount: string;
    colFrom: string;
    colTx: string;
    viewTx: string;
    mechTitle: string;
    mechBody: string;
    caliberTitle: string;
    caliberBody: string;
  }
> = {
  zh: {
    boardKicker: "UNI 销毁看板 · 以太坊主网实时数据",
    updatedAt: "数据更新",
    blockHeight: "区块高度",
    loading: "正在从以太坊主网读取销毁数据…",
    loadError: "销毁数据暂时拉取失败，请稍后刷新重试。",
    totalBurned: "累计销毁总量",
    totalBurnedSub: "销毁地址 0x…dEaD 的 UNI 余额",
    burnedShare: "占初始供应比例",
    burnedShareSub: "初始供应 1,000,000,000 UNI",
    totalSupply: "当前总供应（合约）",
    totalSupplySub: "UNI 合约 totalSupply，销毁不改变此值",
    effectiveSupply: "有效供应",
    effectiveSupplySub: "总供应 − 累计销毁",
    burn24h: "近 24 小时销毁",
    burn24hSub: "主网入账口径",
    burn30d: "近 30 天销毁",
    burn30dSub: "主网入账口径",
    annualized: "年化销毁量",
    annualizedSub: "按近 30 天速度折算（× 365/30）",
    deflationRate: "年化通缩率",
    deflationRateSub: "年化销毁量 ÷ 有效供应",
    unavailable: "暂不可用",
    recentTitle: "最近销毁记录",
    colTime: "时间（UTC）",
    colAmount: "销毁量",
    colFrom: "发送方",
    colTx: "交易",
    viewTx: "查看",
    mechTitle: "销毁机制",
    mechBody:
      "Uniswap 的 UNIfication 改革开启协议费开关后，各链协议费收入经 TokenJar 归集、跨链回到以太坊主网，兑换为 UNI 后转入销毁地址 0x000…dEaD 永久退出流通；2025 年 12 月底另有一笔约 1 亿枚的一次性金库销毁同路入账，占累计销毁的大头，此后每日销毁主要由协议费驱动。",
    caliberTitle: "统计口径",
    caliberBody:
      "本页所有数字直接读取以太坊主网 UNI 合约：累计销毁 = 销毁地址余额（UNI 合约没有减少总供应的 burn 函数，总供应恒为 10 亿，有效供应 = 总供应 − 累计销毁）；近 24 小时 / 30 天销毁按主网入账时间统计，与按「销毁发生日」记账的多链口径有 1–7 天时滞差异，两者不可直接相加。数据由本站服务端读取公共 RPC 节点，缓存 30 分钟刷新。",
  },
  en: {
    boardKicker: "UNI Burn Board · Live Ethereum mainnet data",
    updatedAt: "Updated",
    blockHeight: "Block",
    loading: "Reading burn data from Ethereum mainnet…",
    loadError: "Burn data is temporarily unavailable — please refresh shortly.",
    totalBurned: "Total Burned",
    totalBurnedSub: "UNI balance of the 0x…dEaD burn address",
    burnedShare: "Share of Initial Supply",
    burnedShareSub: "Initial supply 1,000,000,000 UNI",
    totalSupply: "Total Supply (contract)",
    totalSupplySub: "UNI contract totalSupply — burns do not change it",
    effectiveSupply: "Effective Supply",
    effectiveSupplySub: "Total supply − total burned",
    burn24h: "Burned in 24h",
    burn24hSub: "Mainnet crediting basis",
    burn30d: "Burned in 30d",
    burn30dSub: "Mainnet crediting basis",
    annualized: "Annualized Burn",
    annualizedSub: "30d pace scaled (× 365/30)",
    deflationRate: "Annualized Deflation",
    deflationRateSub: "Annualized burn ÷ effective supply",
    unavailable: "Unavailable",
    recentTitle: "Latest Burn Records",
    colTime: "Time (UTC)",
    colAmount: "Amount",
    colFrom: "From",
    colTx: "Tx",
    viewTx: "View",
    mechTitle: "How the burn works",
    mechBody:
      "Since Uniswap's UNIfication reform switched on protocol fees, fee revenue across chains is collected in TokenJars, bridged back to Ethereum mainnet, converted into UNI and sent to the burn address 0x000…dEaD, permanently leaving circulation. A one-off treasury burn of roughly 100M UNI was credited the same way in late December 2025 and makes up most of the cumulative total; daily burns since then are driven by protocol fees.",
    caliberTitle: "Methodology",
    caliberBody:
      "Every figure on this page is read directly from the UNI contract on Ethereum mainnet: total burned = the burn address balance (the UNI contract has no supply-reducing burn function, so total supply stays at 1 billion and effective supply = total supply − total burned). The 24h / 30d figures use mainnet crediting time and can lag burn-occurrence-date accounting by 1–7 days; the two bases must not be added together. Data is fetched server-side from public RPC endpoints and cached for 30 minutes.",
  },
  tw: {
    boardKicker: "UNI 銷燬看板 · 以太坊主網實時資料",
    updatedAt: "資料更新",
    blockHeight: "區塊高度",
    loading: "正在從以太坊主網讀取銷燬資料…",
    loadError: "銷燬資料暫時拉取失敗，請稍後重新整理重試。",
    totalBurned: "累計銷燬總量",
    totalBurnedSub: "銷燬地址 0x…dEaD 的 UNI 餘額",
    burnedShare: "佔初始供應比例",
    burnedShareSub: "初始供應 1,000,000,000 UNI",
    totalSupply: "當前總供應（合約）",
    totalSupplySub: "UNI 合約 totalSupply，銷燬不改變此值",
    effectiveSupply: "有效供應",
    effectiveSupplySub: "總供應 − 累計銷燬",
    burn24h: "近 24 小時銷燬",
    burn24hSub: "主網入賬口徑",
    burn30d: "近 30 天銷燬",
    burn30dSub: "主網入賬口徑",
    annualized: "年化銷燬量",
    annualizedSub: "按近 30 天速度折算（× 365/30）",
    deflationRate: "年化通縮率",
    deflationRateSub: "年化銷燬量 ÷ 有效供應",
    unavailable: "暫不可用",
    recentTitle: "最近銷燬記錄",
    colTime: "時間（UTC）",
    colAmount: "銷燬量",
    colFrom: "傳送方",
    colTx: "交易",
    viewTx: "檢視",
    mechTitle: "銷燬機制",
    mechBody: "Uniswap 的 UNIfication 改革開啟協議費開關後，各鏈協議費收入經 TokenJar 歸集、跨鏈回到以太坊主網，兌換為 UNI 後轉入銷燬地址 0x000…dEaD 永久退出流通；2025 年 12 月底另有一筆約 1 億枚的一次性金庫銷燬同路入賬，佔累計銷燬的大頭，此後每日銷燬主要由協議費驅動。",
    caliberTitle: "統計口徑",
    caliberBody: "本頁所有數字直接讀取以太坊主網 UNI 合約：累計銷燬 = 銷燬地址餘額（UNI 合約沒有減少總供應的 burn 函式，總供應恆為 10 億，有效供應 = 總供應 − 累計銷燬）；近 24 小時 / 30 天銷燬按主網入賬時間統計，與按「銷燬發生日」記賬的多鏈口徑有 1–7 天時滯差異，兩者不可直接相加。資料由本站服務端讀取公共 RPC 節點，快取 30 分鐘重新整理。",
  },
};

function fmtFull(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtCompact(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

function shortAddr(a: string): string {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

function fmtTimeUtc(iso: string): string {
  const dt = new Date(iso);
  const p = (v: number) => String(v).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())} ${p(dt.getUTCHours())}:${p(dt.getUTCMinutes())}`;
}

export default function UniBurnBoard() {
  const { lang } = useLang();
  const d = DICT[lang];

  const [data, setData] = useState<UniBurnData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/uni-burn")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: UniBurnData) => {
        if (alive) setData(j);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="burn-board" aria-label={d.boardKicker}>
      <div className="burn-board-head">
        <h2 className="burn-board-title">{d.boardKicker}</h2>
        {data && (
          <p className="burn-board-meta">
            {d.updatedAt} {fmtTimeUtc(data.fetchedAt)} UTC · {d.blockHeight}{" "}
            {data.latestBlock.toLocaleString("en-US")}
          </p>
        )}
      </div>

      {!data && !error && <p className="burn-note">{d.loading}</p>}
      {error && <p className="burn-note">{d.loadError}</p>}

      {data && (
        <>
          <div className="burn-grid">
            <div className="burn-stat burn-stat-hero">
              <p className="burn-stat-label">{d.totalBurned}</p>
              <p className="burn-stat-value">{fmtCompact(data.totalBurned)} UNI</p>
              <p className="burn-stat-sub">
                {fmtFull(data.totalBurned)} UNI · {d.totalBurnedSub}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.burnedShare}</p>
              <p className="burn-stat-value">{data.burnedPctOfGenesis.toFixed(2)}%</p>
              <div className="burn-bar" role="img" aria-label={`${data.burnedPctOfGenesis.toFixed(2)}%`}>
                <div
                  className="burn-bar-fill"
                  style={{ width: `${Math.min(100, data.burnedPctOfGenesis)}%` }}
                />
              </div>
              <p className="burn-stat-sub">{d.burnedShareSub}</p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.effectiveSupply}</p>
              <p className="burn-stat-value">{fmtCompact(data.effectiveSupply)} UNI</p>
              <p className="burn-stat-sub">
                {fmtFull(data.effectiveSupply)} UNI · {d.effectiveSupplySub}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.totalSupply}</p>
              <p className="burn-stat-value">{fmtCompact(data.totalSupply)} UNI</p>
              <p className="burn-stat-sub">{d.totalSupplySub}</p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.burn24h}</p>
              <p className="burn-stat-value">
                {data.burn24h === null ? "—" : `${fmtCompact(data.burn24h)} UNI`}
              </p>
              <p className="burn-stat-sub">
                {data.burn24h === null ? d.unavailable : `${fmtFull(data.burn24h)} UNI · ${d.burn24hSub}`}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.burn30d}</p>
              <p className="burn-stat-value">
                {data.burn30d === null ? "—" : `${fmtCompact(data.burn30d)} UNI`}
              </p>
              <p className="burn-stat-sub">
                {data.burn30d === null
                  ? d.unavailable
                  : `${fmtFull(data.burn30d)} UNI · ${d.burn30dSub}${
                      data.burn7d !== null
                        ? lang !== "en"
                          ? ` · 近 7 天 ${fmtCompact(data.burn7d)} UNI`
                          : ` · 7d ${fmtCompact(data.burn7d)} UNI`
                        : ""
                    }`}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.annualized}</p>
              <p className="burn-stat-value">
                {data.annualizedBurn === null ? "—" : `${fmtCompact(data.annualizedBurn)} UNI`}
              </p>
              <p className="burn-stat-sub">
                {data.annualizedBurn === null ? d.unavailable : d.annualizedSub}
              </p>
            </div>
            <div className="burn-stat">
              <p className="burn-stat-label">{d.deflationRate}</p>
              <p className="burn-stat-value">
                {data.annualizedRatePct === null
                  ? "—"
                  : `${data.annualizedRatePct.toFixed(2)}%`}
              </p>
              <p className="burn-stat-sub">
                {data.annualizedRatePct === null ? d.unavailable : d.deflationRateSub}
              </p>
            </div>
          </div>

          {data.recentBurns.length > 0 && (
            <div className="burn-records">
              <h3 className="burn-records-title">{d.recentTitle}</h3>
              <div className="burn-table-wrap">
                <table className="burn-table">
                  <thead>
                    <tr>
                      <th>{d.colTime}</th>
                      <th>{d.colAmount}</th>
                      <th>{d.colFrom}</th>
                      <th>{d.colTx}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBurns.map((b) => (
                      <tr key={b.txHash + b.from}>
                        <td>{fmtTimeUtc(b.timestamp)}</td>
                        <td>{fmtFull(b.amountUni)} UNI</td>
                        <td>
                          <a
                            href={`https://etherscan.io/address/${b.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortAddr(b.from)}
                          </a>
                        </td>
                        <td>
                          <a
                            href={`https://etherscan.io/tx/${b.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortAddr(b.txHash)} · {d.viewTx}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="burn-notes">
            <div className="card">
              <h2>{d.mechTitle}</h2>
              <p className="body-text">{d.mechBody}</p>
              <p className="body-text burn-addr-line">
                UNI{" "}
                <a
                  href={`https://etherscan.io/token/${UNI_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortAddr(UNI_ADDRESS)}
                </a>{" "}
                · {lang === "zh" ? "销毁地址" : lang === "tw" ? "銷毀地址" : "Burn address"}{" "}
                <a
                  href={`https://etherscan.io/token/${UNI_ADDRESS}?a=${DEAD_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortAddr(DEAD_ADDRESS)}
                </a>
              </p>
            </div>
            <div className="card">
              <h2>{d.caliberTitle}</h2>
              <p className="body-text">{d.caliberBody}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
