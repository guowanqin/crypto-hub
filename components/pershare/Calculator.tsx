"use client";

// BNC 计算器本体：从 pershare.cc 独立站 app/Calculator.tsx 原样移植（计算口径/逻辑未改），
// 仅 import 路径改指 lib/pershare；语言由外壳 PerShareShell 经 LangProvider 传入。

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MarketData } from "@/lib/pershare/types";
import { presetRange, lvForRange, type RangeSel } from "@/lib/pershare/range";
import { FAQ_ITEMS_EN, FAQ_ITEMS_TW, FAQ_ITEMS_ZH } from "@/lib/pershare/faq";
import { DICT, type Lang } from "@/lib/pershare/i18n";
import { PoolCard, RangeControl, SpreadCard, fmtInt, fmtPrice, fmtUsd } from "./pool-ui";

const parseNum = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

/* ---------------- 主组件（BNC 标签页） ---------------- */
interface Settings {
  holdings: string;
  shares: string;
  liabilities: string;
}
const DEFAULT_SETTINGS: Settings = {
  holdings: "515544",
  shares: "41173850",
  liabilities: "16800000",
};

export default function Calculator(props: { lang: Lang }) {
  const { lang } = props;
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editOpen, setEditOpen] = useState(false);

  const [unified, setUnified] = useState<RangeSel>(presetRange(5));
  const [poolRanges, setPoolRanges] = useState<Record<string, RangeSel>>({});

  const [lpPoolKey, setLpPoolKey] = useState("uni-usdt-0025");
  const [lpAmount, setLpAmount] = useState("10000");

  const t = DICT[lang];
  const locale = lang === "en" ? "en-US" : lang === "tw" ? "zh-TW" : "zh-CN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/market");
      const j = (await r.json()) as MarketData & { error?: string };
      if (!r.ok || j.error) throw new Error(j.error ?? "fetch failed");
      setData(j);
      setError(null);
    } catch {
      setError("fetch-failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bnc-settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) });
    } catch {
      /* 忽略损坏的本地设置 */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bnc-settings", JSON.stringify(settings));
    } catch {
      /* 忽略 */
    }
  }, [settings]);

  const rangeOf = useCallback(
    (key: string): RangeSel => poolRanges[key] ?? unified,
    [poolRanges, unified],
  );
  const applyUnified = (s: RangeSel) => {
    setUnified(s);
    setPoolRanges({});
  };

  const holdings = parseNum(settings.holdings);
  const shares = parseNum(settings.shares);
  const liabilities = parseNum(settings.liabilities);

  const hero = useMemo(() => {
    if (!data || shares <= 0) return null;
    const perShare = holdings / shares;
    const bnb = data.bnbPriceUsd;
    const perShareUsd = bnb !== null ? perShare * bnb : null;
    const adjNav =
      bnb !== null ? (holdings * bnb - liabilities) / shares : null;
    const mnav =
      data.bncbPriceUsd !== null && adjNav !== null && adjNav > 0
        ? data.bncbPriceUsd / adjNav
        : null;
    return { perShare, perShareUsd, adjNav, mnav };
  }, [data, holdings, shares, liabilities]);

  const lp = useMemo(() => {
    if (!data) return null;
    const pool = data.pools.find((p) => p.key === lpPoolKey) ?? data.pools[0];
    if (!pool) return null;
    const amount = parseFloat(lpAmount) || 0;
    const sel = rangeOf(pool.key);
    let daily: number | null = null;
    let yearly: number | null = null;
    let share: number | null = null;
    if (pool.rangeBasis && pool.annualFeesUsd !== null && amount > 0) {
      const lv = lvForRange(
        pool.rangeBasis.sqrtPrice,
        sel.full ? null : sel.down,
        sel.full ? null : sel.up,
      );
      const lPos = (amount / pool.rangeBasis.token1Usd) * lv;
      share = lPos / (pool.rangeBasis.activeLiquidity + lPos);
      daily = (pool.annualFeesUsd / 365) * share;
      yearly = pool.annualFeesUsd * share;
    } else if (pool.tvlUsd !== null && pool.volume24hUsd !== null && amount > 0) {
      share = amount / (pool.tvlUsd + amount);
      daily = pool.volume24hUsd * (pool.feePercent / 100) * share;
      yearly = daily * 365;
    }
    return { pool, sel, daily, yearly, share };
  }, [data, lpPoolKey, lpAmount, rangeOf]);

  const errorText = error ? t.fetchError : null;
  const faqItems = lang === "en" ? FAQ_ITEMS_EN : lang === "tw" ? FAQ_ITEMS_TW : FAQ_ITEMS_ZH;

  return (
    <div>
      <div className="topbar">
        <span className="brand">BNC CALCULATOR</span>
        <span className="updated">
          {data
            ? t.updatedAt(
                new Date(data.fetchedAt).toLocaleString(locale, { hour12: false }),
                data.source,
              )
            : t.loadingMarket}
        </span>
        <button type="button" className="btn" onClick={load} disabled={loading}>
          {loading ? t.refreshing : t.refresh}
        </button>
      </div>

      {/* ---------- 板块一：美股含币量 ---------- */}
      <section className="hero">
        <h2>{t.heroTitle}</h2>
        <p className="sub">{t.heroSub}</p>

        {hero && data ? (
          <>
            <div className="hero-main">
              <div className="hero-num">
                {hero.perShareUsd !== null ? fmtUsd(hero.perShareUsd) : "—"}
                <small>{t.usdPerShareUnit}</small>
              </div>
              <div className="hero-bnb">
                ≈ {hero.perShare.toFixed(6)}
                <span>{t.perShareUnit}</span>
              </div>
            </div>
            <SpreadCard
              coinValue={hero.perShareUsd}
              stockPrice={data.bncbPriceUsd}
              stockLabel={t.spreadStockPrice}
              t={t}
            />
            <div className="formula">
              <span>{t.formulaLabel}</span>
              <span className="chip">{t.formulaHoldings(fmtInt(holdings, locale))}</span>
              <span>÷</span>
              <span className="chip">{t.formulaShares(fmtInt(shares, locale))}</span>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <div className="k">{t.statAdjNav}</div>
                <div className="v">
                  {hero.adjNav !== null ? fmtUsd(hero.adjNav) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">{t.statMnav}</div>
                <div className="v">
                  {hero.mnav !== null ? hero.mnav.toFixed(2) + "×" : "—"}
                  {hero.mnav !== null && (
                    <small>
                      {" "}
                      {hero.mnav < 1
                        ? t.discount(((1 - hero.mnav) * 100).toFixed(1))
                        : t.premium(((hero.mnav - 1) * 100).toFixed(1))}
                    </small>
                  )}
                </div>
              </div>
              <div className="stat stat-bncb">
                <div className="k">{t.statBncbPrice}</div>
                <div className="v">
                  {data.bncbPriceUsd !== null ? fmtPrice(data.bncbPriceUsd) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">{t.statBnbPrice}</div>
                <div className="v">
                  {data.bnbPriceUsd !== null ? fmtUsd(data.bnbPriceUsd) : "—"}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={errorText ? "error-box" : "loading"}>
            {errorText ?? t.loadingMarket}
          </div>
        )}

        <div className="edit-panel">
          <button
            type="button"
            className="btn"
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? t.editClose : t.editOpen}
          </button>
          {editOpen && (
            <>
              <div className="edit-grid" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>{t.fieldHoldings}</label>
                  <input
                    value={settings.holdings}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, holdings: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldShares}</label>
                  <input
                    value={settings.shares}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, shares: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldLiabilities}</label>
                  <input
                    value={settings.liabilities}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, liabilities: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="hint">{t.editHint}</p>
            </>
          )}
        </div>
      </section>

      {/* ---------- 板块二：池子年化 ---------- */}
      <h2 className="section-title">{t.poolsTitle}</h2>
      <p className="section-sub">{t.poolsSub}</p>

      {data ? (
        <>
          <div className="panel">
            <RangeControl
              label={t.unifiedLabel}
              sel={unified}
              onChange={applyUnified}
              t={t}
            />
          </div>
          <div className="pool-grid">
            {data.pools.map((pool) => (
              <PoolCard
                key={pool.key}
                pool={pool}
                sel={rangeOf(pool.key)}
                onRangeChange={(s) =>
                  setPoolRanges((prev) => ({ ...prev, [pool.key]: s }))
                }
                t={t}
              />
            ))}
          </div>

          {/* ---------- LP 测算器 ---------- */}
          <h2 className="section-title">{t.lpTitle}</h2>
          <div className="panel">
            <div className="lp-grid">
              <div className="field">
                <label>{t.lpSelectPool}</label>
                <select
                  value={lp?.pool.key ?? lpPoolKey}
                  onChange={(e) => setLpPoolKey(e.target.value)}
                >
                  {data.pools.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.pair} · {p.dex} · {t.feeRate(p.feePercent)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t.lpAmount}</label>
                <input
                  value={lpAmount}
                  inputMode="decimal"
                  onChange={(e) => setLpAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.lpRangeUsed}</label>
                <div style={{ fontSize: 14, padding: "8px 0" }}>
                  {lp
                    ? lp.sel.full
                      ? t.fullRange
                      : `−${lp.sel.down}% ~ +${lp.sel.up}%`
                    : "—"}
                  {t.lpRangeNote}
                </div>
              </div>
            </div>
            {lp && (
              <div className="lp-result">
                <div className="stat">
                  <div className="k">{t.lpDaily}</div>
                  <div className="v">
                    {lp.daily !== null ? fmtUsd(lp.daily) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">{t.lpYearly}</div>
                  <div className="v">
                    {lp.yearly !== null ? fmtUsd(lp.yearly) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">{t.lpShare}</div>
                  <div className="v">
                    {lp.share !== null
                      ? (lp.share * 100).toFixed(3) + "%"
                      : "—"}
                  </div>
                </div>
              </div>
            )}
            <p className="hint">{t.lpHint}</p>
          </div>
        </>
      ) : (
        !errorText && <div className="loading">{t.loadingPools}</div>
      )}
      {errorText && !data && (
        <div className="error-box" style={{ marginTop: 12 }}>
          {errorText}
        </div>
      )}

      {/* ---------- FAQ ---------- */}
      <h2 className="section-title">{t.faqTitle}</h2>
      <div>
        {faqItems.map((f) => (
          <div className="faq-item" key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div>{t.footerSource}</div>
        <div>{t.footerDisclaimer}</div>
      </footer>
    </div>
  );
}
