/**
 * BTC 四年减半周期「抄底位置」模型（按区块高度推演）
 *
 * 模型口径（由参考图逆向并验算，2026-11-01 核定）：
 * - 锚点全部由减半区块推导：减半间隔 210,000 块，偏移 78,750 块。
 *   对目标减半块 H：上轮牛顶 = H−131,250；本轮熊底 = H−78,750（位置 0）；
 *   减半本身恰在位置 0.5；下轮牛顶 = H+78,750（位置 1）。
 *   当前周期 H=1,050,000 → 牛顶 918,750、熊底 971,250、牛顶 1,128,750。
 * - 周期位置分段线性：
 *   熊市段（牛顶→熊底，跨度 52,500 块）：位置 =（熊底块 − 当前块）/ 52,500，从 1 降到 0；
 *   牛市段（熊底→下轮牛顶，跨度 157,500 块）：位置 =（当前块 − 熊底块）/ 157,500，从 0 升到 1。
 * - 熊市进度（熊市段）=（当前块 − 牛顶块）/ 52,500。
 * - 倒计时与预计日期一律按「剩余块数 × 10 分钟」从取数时刻推算（平均出块间隔）。
 * - 这是周期模型推演，历史周期不保证重演；页面已标注，不构成投资建议。
 *
 * 高度取数：服务端接口 /api/btc-cycle，主用 mempool.space、备用 blockstream.info，
 * 路由层 5 分钟缓存 + stale 回退。
 */

export const HALVING_INTERVAL = 210_000;
export const HALVING_OFFSET = 78_750;
/** 熊市段跨度（牛顶→熊底） */
export const BEAR_SPAN = 52_500;
/** 牛市段跨度（熊底→下轮牛顶） */
export const BULL_SPAN = 157_500;
/** 平均出块间隔（秒） */
export const BLOCK_SECONDS = 600;

export type Segment = "bear" | "bull";

export interface CycleAnchors {
  /** 目标减半块 H */
  halvingBlock: number;
  /** 第几次减半（H / 210,000） */
  halvingOrdinal: number;
  /** 上轮牛顶块（H−131,250，熊市段起点） */
  prevTopBlock: number;
  /** 本轮熊底块（H−78,750，位置 0） */
  bottomBlock: number;
  /** 下轮牛顶块（H+78,750，位置 1） */
  nextTopBlock: number;
}

export interface CycleTier {
  /** 触发位置（0–1） */
  position: number;
  /** 目标区块 = 熊底块 − 位置 × 52,500 */
  block: number;
  /** 预计到达时刻（ms epoch，按剩余块 × 10 分钟推算） */
  etaMs: number;
  /** 距今天数（带符号：正 = 还有，负 = 已过；按 144 块/天换算） */
  daysFromNow: number;
  /** 是否已触发（当前块 ≥ 目标块） */
  triggered: boolean;
}

export type StageKey =
  | "downtrend" // 熊市段 位置 > 0.20
  | "dca" // 熊市段 0.10 < 位置 ≤ 0.20
  | "dcaLate" // 熊市段 0.05 < 位置 ≤ 0.10
  | "goldNear" // 熊市段 0.02 < 位置 ≤ 0.05
  | "gold" // 熊市段 位置 ≤ 0.02
  | "recovery"; // 牛市段

export interface CycleState {
  height: number;
  anchors: CycleAnchors;
  segment: Segment;
  /** 周期位置 0–1（熊底 0、牛顶 1、减半 0.5） */
  position: number;
  /** 熊市进度 %（仅熊市段；牛市段为 100） */
  bearProgressPct: number;
  stage: StageKey;
  /** 倒计时目标块：熊市段 = 熊底块；牛市段 = 减半块 */
  countdownBlock: number;
  /** 倒计时目标时刻（ms epoch）= 取数时刻 +（目标块 − 当前块）× 600 秒 */
  countdownTargetMs: number;
  tiers: CycleTier[];
  /** 下一个未触发档位（牛市段为 null） */
  nextTier: CycleTier | null;
  /** 关键节点预计时刻（ms epoch） */
  nodeEtas: { bottomMs: number; halvingMs: number; topMs: number };
  /** 关键节点距今天数（带符号，按 144 块/天换算） */
  nodeDays: { bottom: number; halving: number; top: number };
}

const TIER_POSITIONS = [0.2, 0.15, 0.1, 0.05, 0.02] as const;

/** 由当前高度定位所在周期锚点：依次检查相邻两个减半周期的熊市段 / 牛市段窗口。 */
export function anchorsFor(height: number): CycleAnchors {
  const base = Math.floor(height / HALVING_INTERVAL) * HALVING_INTERVAL;
  for (const h of [base, base + HALVING_INTERVAL]) {
    const prevTop = h - 131_250;
    const bottom = h - HALVING_OFFSET;
    const nextTop = h + HALVING_OFFSET;
    if (
      (height >= prevTop && height <= bottom) ||
      (height >= bottom && height <= nextTop)
    ) {
      return {
        halvingBlock: h,
        halvingOrdinal: h / HALVING_INTERVAL,
        prevTopBlock: prevTop,
        bottomBlock: bottom,
        nextTopBlock: nextTop,
      };
    }
  }
  // 兜底（理论不可达）：按下一个减半块生成
  const h = base + HALVING_INTERVAL;
  return {
    halvingBlock: h,
    halvingOrdinal: h / HALVING_INTERVAL,
    prevTopBlock: h - 131_250,
    bottomBlock: h - HALVING_OFFSET,
    nextTopBlock: h + HALVING_OFFSET,
  };
}

function stageFor(segment: Segment, position: number): StageKey {
  if (segment === "bull") return "recovery";
  if (position > 0.2) return "downtrend";
  if (position > 0.1) return "dca";
  if (position > 0.05) return "dcaLate";
  if (position > 0.02) return "goldNear";
  return "gold";
}

/**
 * 由当前高度与取数时刻（ms epoch）算出全部周期状态。
 * 纯函数：mock 高度即可复算（验算用例见文件尾注释）。
 */
export function computeCycle(height: number, nowMs: number): CycleState {
  const anchors = anchorsFor(height);
  const segment: Segment = height <= anchors.bottomBlock ? "bear" : "bull";

  const position =
    segment === "bear"
      ? (anchors.bottomBlock - height) / BEAR_SPAN
      : (height - anchors.bottomBlock) / BULL_SPAN;

  const bearProgressPct =
    segment === "bear"
      ? ((height - anchors.prevTopBlock) / BEAR_SPAN) * 100
      : 100;

  const etaOf = (block: number) =>
    nowMs + (block - height) * BLOCK_SECONDS * 1000;
  const daysOf = (block: number) => (block - height) / 144;

  const tiers: CycleTier[] = TIER_POSITIONS.map((p) => {
    const block = anchors.bottomBlock - p * BEAR_SPAN;
    return {
      position: p,
      block,
      etaMs: etaOf(block),
      daysFromNow: daysOf(block),
      triggered: height >= block,
    };
  });
  const nextTier = tiers.find((t) => !t.triggered) ?? null;

  const countdownBlock =
    segment === "bear" ? anchors.bottomBlock : anchors.halvingBlock;

  return {
    height,
    anchors,
    segment,
    position,
    bearProgressPct,
    stage: stageFor(segment, position),
    countdownBlock,
    countdownTargetMs: etaOf(countdownBlock),
    tiers,
    nextTier,
    nodeEtas: {
      bottomMs: etaOf(anchors.bottomBlock),
      halvingMs: etaOf(anchors.halvingBlock),
      topMs: etaOf(anchors.nextTopBlock),
    },
    nodeDays: {
      bottom: daysOf(anchors.bottomBlock),
      halving: daysOf(anchors.halvingBlock),
      top: daysOf(anchors.nextTopBlock),
    },
  };
}

/** /api/btc-cycle 的响应结构 */
export interface BtcCycleData {
  /** 当前 BTC 区块高度 */
  height: number;
  /** 取数时刻（ISO） */
  fetchedAt: string;
  /** 实际命中的数据源主机名 */
  source: string;
}

const HEIGHT_SOURCES: { host: string; url: string }[] = [
  { host: "mempool.space", url: "https://mempool.space/api/blocks/tip/height" },
  { host: "blockstream.info", url: "https://blockstream.info/api/blocks/tip/height" },
];

/** 服务端取当前区块高度：多源顺序容错，任一返回合法高度即用。 */
export async function fetchBtcHeight(): Promise<BtcCycleData> {
  const errors: string[] = [];
  for (const src of HEIGHT_SOURCES) {
    try {
      const res = await fetch(src.url, {
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "18btc-hub/1.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = (await res.text()).trim();
      const height = Number.parseInt(text, 10);
      if (!Number.isFinite(height) || height <= 0 || String(height) !== text) {
        throw new Error(`bad payload: ${text.slice(0, 32)}`);
      }
      return { height, fetchedAt: new Date().toISOString(), source: src.host };
    } catch (err) {
      errors.push(`${src.host}: ${String(err)}`);
    }
  }
  throw new Error(errors.join("; "));
}

/**
 * 内置验算用例（与参考图逐项核对）：
 * computeCycle(962667, anyNow) 应得：
 * - anchors：H=1,050,000、prevTop=918,750、bottom=971,250、nextTop=1,128,750
 * - position = (971250−962667)/52500 = 0.16349 ≈ 0.163
 * - bearProgressPct = (962667−918750)/52500 = 83.65% ≈ 83.7%
 * - 距熊底 = (971250−962667)/144 ≈ 59.6 天
 * - 五档目标块 = 960,750 / 963,375 / 966,000 / 968,625 / 970,200
 */
