import type { RangeBasis } from "./types";

/** 区间选择：full=true 为全区间；否则为当前价下方 down% 到上方 up% 的价格带（可不对称） */
export interface RangeSel {
  full: boolean;
  down: number;
  up: number;
}

export const FULL_RANGE: RangeSel = { full: true, down: 50, up: 50 };
export const PRESET_PCTS = [50, 30, 20, 10, 5];

export function presetRange(pct: number): RangeSel {
  return { full: false, down: pct, up: pct };
}

export function sameRange(a: RangeSel, b: RangeSel): boolean {
  if (a.full || b.full) return a.full === b.full;
  return a.down === b.down && a.up === b.up;
}

/**
 * 某区间头寸的 L/V（每单位计价代币本金对应的流动性）。
 * 对当前价 P、区间 [Pa, Pb]：V = L × (2√P − √Pa − P/√Pb)，故 L/V = 1 / (2√P − √Pa − P/√Pb)。
 * 以 √P 归一化：L/V = (1/√P) × 1 / (2 − √a − 1/√b)，其中 a = Pa/P，b = Pb/P。
 * 全区间为 a→0、b→∞ 的极限，分母取 2。
 */
export function lvForRange(
  sqrtPrice: number,
  down: number | null,
  up: number | null,
): number {
  const sqrtA = down === null ? 0 : Math.sqrt(Math.max(0, 1 - down / 100));
  const invSqrtB = up === null ? 0 : 1 / Math.sqrt(1 + up / 100);
  const denom = 2 - sqrtA - invSqrtB;
  if (denom <= 0) return 0;
  return 1 / (sqrtPrice * denom);
}

/** 资金效率放大倍数 = 该区间 L/V ÷ 全区间 L/V */
export function efficiencyFor(sel: RangeSel): number {
  if (sel.full) return 1;
  const sqrtA = Math.sqrt(Math.max(0, 1 - sel.down / 100));
  const invSqrtB = 1 / Math.sqrt(1 + sel.up / 100);
  const denom = 2 - sqrtA - invSqrtB;
  if (denom <= 0) return 0;
  return 2 / denom;
}

export interface RangeResult {
  /** 在价内年化（小数），价格停留在区间内时成立 */
  apr: number;
  efficiency: number;
  bandLowUsd: number;
  bandHighUsd: number | null; // null = 无上限（全区间）
}

/** 按所选区间换算在价内年化：APR = 年化手续费(计价代币) × (L/V) ÷ L_active */
export function rangeAprFor(
  annualFeesUsd: number,
  priceUsd: number,
  basis: RangeBasis,
  sel: RangeSel,
): RangeResult {
  const feesToken1 = annualFeesUsd / basis.token1Usd;
  const lv = lvForRange(
    basis.sqrtPrice,
    sel.full ? null : sel.down,
    sel.full ? null : sel.up,
  );
  const apr =
    basis.activeLiquidity > 0 ? (feesToken1 * lv) / basis.activeLiquidity : 0;
  return {
    apr,
    efficiency: efficiencyFor(sel),
    bandLowUsd: sel.full ? 0 : priceUsd * (1 - sel.down / 100),
    bandHighUsd: sel.full ? null : priceUsd * (1 + sel.up / 100),
  };
}
