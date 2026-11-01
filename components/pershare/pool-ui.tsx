"use client";

// 池子卡片 / 价差卡 / 区间选择器：从 pershare.cc 独立站 app/pool-ui.tsx 原样移植，仅改 import 路径。

import { useState } from "react";
import type { PoolMarket } from "@/lib/pershare/types";
import {
  FULL_RANGE,
  PRESET_PCTS,
  presetRange,
  rangeAprFor,
  type RangeSel,
} from "@/lib/pershare/range";
import type { Dict } from "@/lib/pershare/i18n";

/* ---------------- 格式化（BNC / HYPE 两页共用） ---------------- */
export const fmtInt = (n: number, locale: string) =>
  new Intl.NumberFormat(locale).format(Math.round(n));
export const fmtUsd = (n: number, d = 2) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtUsd0 = (n: number) => {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
};
export const fmtPct = (frac: number | null, d = 1) =>
  frac === null || !Number.isFinite(frac) ? "—" : (frac * 100).toFixed(d) + "%";
export const fmtPrice = (n: number) => fmtUsd(n, n < 10 ? 3 : 2);

/* ---------------- 价差卡（BNC / HYPE 两页共用） ----------------
   含币价（每股含币量 × 币实时价，毛口径，不扣负债/税项）− 当前股价 = 价差 */
export function SpreadCard(props: {
  coinValue: number | null;
  stockPrice: number | null;
  stockLabel: string;
  t: Dict;
}) {
  const { coinValue, stockPrice, stockLabel, t } = props;
  const spread =
    coinValue !== null && stockPrice !== null ? coinValue - stockPrice : null;
  const pct =
    spread !== null && coinValue !== null && coinValue > 0
      ? (spread / coinValue) * 100
      : null;
  const kind =
    pct === null ? "na" : pct > 0.05 ? "disc" : pct < -0.05 ? "prem" : "par";
  /** 大字：方向词 + 绝对值金额（金额与百分比一律绝对值，方向只由词 + 颜色承担） */
  const bigText =
    spread === null
      ? "—"
      : kind === "disc"
        ? `${t.spreadWordDisc} ${fmtUsd(Math.abs(spread))}`
        : kind === "prem"
          ? `${t.spreadWordPrem} ${fmtUsd(Math.abs(spread))}`
          : `${t.spreadAtPar} ${fmtUsd(Math.abs(spread))}`;
  return (
    <div className={`spread-card spread-${kind}`}>
      <div className="spread-title">{t.spreadTitle}</div>
      <div className="spread-eq">
        <div className="spread-term">
          <div className="spread-k">{t.spreadCoinValue}</div>
          <div className="spread-v">
            {coinValue !== null ? fmtUsd(coinValue) : "—"}
            <small>{t.usdPerShareUnit}</small>
          </div>
        </div>
        <div className="spread-op">−</div>
        <div className="spread-term">
          <div className="spread-k">{stockLabel}</div>
          <div className="spread-v">
            {stockPrice !== null ? fmtUsd(stockPrice) : "—"}
            <small>{t.usdPerShareUnit}</small>
          </div>
        </div>
        <div className="spread-op">=</div>
        <div className="spread-term">
          <div className="spread-k">{t.spreadResult}</div>
          <div className="spread-v spread-big">
            {bigText}
            {spread !== null && <small>{t.usdPerShareUnit}</small>}
            {pct !== null && kind === "disc" && (
              <span className="spread-badge badge-disc">
                {t.spreadDiscRate(Math.abs(pct).toFixed(1))}
              </span>
            )}
            {pct !== null && kind === "prem" && (
              <span className="spread-badge badge-prem">
                {t.spreadPremRate(Math.abs(pct).toFixed(1))}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="spread-legend">{t.spreadLegend}</p>
      <p className="spread-note">{t.spreadNote}</p>
    </div>
  );
}

/* ---------------- 区间选择器 ---------------- */
function isPreset(sel: RangeSel) {
  return !sel.full && sel.down === sel.up && PRESET_PCTS.includes(sel.down);
}

export function RangeControl(props: {
  label: string;
  sel: RangeSel;
  onChange: (s: RangeSel) => void;
  t: Dict;
}) {
  const { sel, onChange, t } = props;
  const [customOpen, setCustomOpen] = useState(false);
  const customActive = customOpen || (!sel.full && !isPreset(sel));

  const openCustom = () => {
    setCustomOpen(true);
    if (sel.full) onChange({ full: false, down: 10, up: 10 });
  };
  const setSide = (side: "down" | "up", v: number) => {
    const nv = Number.isFinite(v) ? v : 0;
    onChange({
      full: false,
      down: side === "down" ? Math.min(95, Math.max(1, nv)) : sel.down,
      up: side === "up" ? Math.min(300, Math.max(1, nv)) : sel.up,
    });
  };

  return (
    <div className="range-ctl">
      <div className="r-label">{props.label}</div>
      <div className="chips">
        <button
          type="button"
          className={"chip-btn" + (sel.full ? " on" : "")}
          onClick={() => {
            setCustomOpen(false);
            onChange(FULL_RANGE);
          }}
        >
          {t.fullRange}
        </button>
        {PRESET_PCTS.map((p) => (
          <button
            key={p}
            type="button"
            className={
              "chip-btn" + (!sel.full && sel.down === p && sel.up === p ? " on" : "")
            }
            onClick={() => {
              setCustomOpen(false);
              onChange(presetRange(p));
            }}
          >
            ±{p}%
          </button>
        ))}
        <button
          type="button"
          className={"chip-btn" + (customActive && !sel.full ? " on" : "")}
          onClick={openCustom}
        >
          {t.custom}
        </button>
      </div>
      {customActive && !sel.full && (
        <div className="custom-box">
          <div className="slider-row">
            <label>
              <span>{t.downLabel}</span>
              <span className="numin">
                −
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={sel.down}
                  onChange={(e) => setSide("down", parseFloat(e.target.value))}
                />
                %
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={95}
              step={1}
              value={sel.down}
              onChange={(e) => setSide("down", parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-row">
            <label>
              <span>{t.upLabel}</span>
              <span className="numin">
                +
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={sel.up}
                  onChange={(e) => setSide("up", parseFloat(e.target.value))}
                />
                %
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={300}
              step={1}
              value={sel.up}
              onChange={(e) => setSide("up", parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 池子卡片 ---------------- */
export function PoolCard(props: {
  pool: PoolMarket;
  sel: RangeSel;
  onRangeChange: (s: RangeSel) => void;
  t: Dict;
  /** 池内现价行是否重点标注（BNC 页 BNCB 定价基准 / HYPE 页 WHYPE 现价） */
  highlightSpot?: boolean;
}) {
  const { pool, sel, t } = props;
  const res =
    pool.rangeBasis && pool.annualFeesUsd !== null && pool.priceUsd !== null
      ? rangeAprFor(pool.annualFeesUsd, pool.priceUsd, pool.rangeBasis, sel)
      : null;

  const headline = res ? res.apr : pool.poolAverageApr;
  const headlineLabel = res
    ? sel.full
      ? t.headlineFull
      : t.headlineRange(sel.down, sel.up)
    : t.headlineAvgFallback;

  return (
    <div className="pool-card">
      <div className="pool-head">
        <span className="pair">{pool.pair}</span>
        <span className="dex">{pool.dex}</span>
        <span className="fee">{t.feeRate(pool.feePercent)}</span>
      </div>

      <div className="pool-apr">{fmtPct(headline)}</div>
      <div className="pool-apr-label">{headlineLabel}</div>
      {res && pool.poolAverageApr !== null && (
        <div className="pool-avg">{t.poolAvgLine(fmtPct(pool.poolAverageApr))}</div>
      )}

      <div className="pool-meta">
        <div className="row">
          <span className="k">TVL</span>
          <b>{pool.tvlUsd !== null ? fmtUsd0(pool.tvlUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">{t.vol24h}</span>
          <b>{pool.volume24hUsd !== null ? fmtUsd0(pool.volume24hUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">{t.annualFees}</span>
          <b>{pool.annualFeesUsd !== null ? fmtUsd0(pool.annualFeesUsd) : "—"}</b>
        </div>
        <div className={"row" + (props.highlightSpot === false ? "" : " row-bncb")}>
          <span className="k">{t.bncbSpot}</span>
          <b>{pool.priceUsd !== null ? fmtPrice(pool.priceUsd) : "—"}</b>
        </div>
      </div>

      {res && (
        <>
          <div className="band-line">
            {sel.full ? (
              <>
                {t.bandLabel}
                <b>{t.fullPriceRangeText}</b> · {t.effLabel} <b>1.0×</b>（
                {t.baselineNote}）
              </>
            ) : (
              <>
                {t.bandLabel}
                <b>{fmtPrice(res.bandLowUsd)}</b> –{" "}
                <b>{res.bandHighUsd !== null ? fmtPrice(res.bandHighUsd) : "∞"}</b>{" "}
                · {t.effLabel} ≈ <b>{res.efficiency.toFixed(1)}×</b>
              </>
            )}
          </div>
          {!sel.full && (
            <div className="warn-line">⚠ {t.warnOutOfRange}</div>
          )}
        </>
      )}

      <RangeControl
        label={t.poolRangeLabel}
        sel={sel}
        onChange={props.onRangeChange}
        t={t}
      />
    </div>
  );
}
