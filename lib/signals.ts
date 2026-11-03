/**
 * 策略信号扫描（/tool/signal-scanner）的数据层与信号引擎。
 *
 * 标的池（静态清单）：币圈 30 个 USDT 现货对 + 美股 20 只（含 ETF）。
 * 周期 15m / 1h / 4h；4h 由 1h K 线聚合（币圈按 UTC 整 4 小时对齐，
 * 美股按交易日开盘锚定、每 4 根 1h 一组）。**只用已收盘 K 线**：
 * 正在形成的那根一律丢弃，所有信号都以已收盘价计算。
 *
 * 取数（2026-11-03 建页时逐个实测，测试矩阵见文末注释）：
 * - 币圈首选 Binance 公开数据域 data-api.binance.vision（klines + 批量 ticker/24hr），
 *   单标的失败时逐个降级 OKX 公开 candles（只取 confirm=1 的已收盘根）。
 * - 美股走 Yahoo Finance v8 chart（query1 → query2 容错，本站 /api/crcl 有
 *   Yahoo 在个别出口被封的教训）：整类失败时返回 stocksUnavailable 标记，
 *   页面如实显示「美股数据源暂时不可用」，绝不编造数据补位。
 *
 * 信号口径（参数同时写在页面口径卡上）：
 * - MACD(12,26,9)：EMA12 − EMA26 = DIF，DIF 的 EMA9 = DEA，柱 = 2×(DIF − DEA)。
 *   EMA 用首值播种的递推式（与主流行情软件一致）。
 * - 摆动点：左右各 5 根的分形高 / 低点（严格大于 / 小于两侧 5 根）。
 * - 顶背离：最近两个摆动高点，价格后高 > 前高、后高处 DIF < 前高处 DIF；
 *   两高点价差 ≤1.5% 记「平顶动能背离」，否则「创新高背离」。底背离镜像，
 *   ≤1.5% 记「平底动能背离」，否则「创新低背离」。
 *   信号新鲜度：后一摆动点的确认根（其右侧第 5 根）须落在最近 3 根已收盘
 *   K 线内才上报——摆动点天然要等右侧 5 根收盘才成立，信号必然滞后于高点。
 * - 横盘突破：此前 20 根已收盘 K 线的最高 / 最低为区间沿，最后一根已收盘
 *   K 线收盘价突破上沿 = 向上突破、跌破下沿 = 向下突破；该根量 ≥ 此前
 *   20 根均量 ×1.5 时加「放量」标记。
 * - 区间整理：最新收盘价在上述 20 根区间之内且区间宽度（相对区间中点）
 *   ≤6% 的低优先级信息标签。
 * - 量比 RVOL = 最后一根已收盘 K 线量 / 此前 20 根均量。
 * - 24h 涨跌：币圈用 Binance 24h ticker；美股用最近两个交易日收盘价推算。
 * - 现价：最近一根已收盘 15 分钟 K 线的收盘价（美股取不到 15m 时退 1h）。
 */

export type Timeframe = "15m" | "1h" | "4h";
export const TIMEFRAMES: Timeframe[] = ["15m", "1h", "4h"];
const TF_MS: Record<Timeframe, number> = {
  "15m": 900_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
};

export type SignalType =
  | "top-div"
  | "bottom-div"
  | "breakout-up"
  | "breakout-down"
  | "range";

export type SignalSubtype = "flat" | "new-extreme" | "with-volume";

export interface SwingEvidence {
  price: number;
  dif: number;
  /** 摆动点所在 K 线的开盘时间（ms) */
  time: number;
}

export interface SignalEvidence {
  p1?: SwingEvidence;
  p2?: SwingEvidence;
  rangeHigh?: number;
  rangeLow?: number;
  /** 最后一根已收盘 K 线量 / 此前 20 根均量 */
  volMultiple?: number;
}

export interface AssetSignal {
  type: SignalType;
  subtype?: SignalSubtype;
  tf: Timeframe;
  /** 信号成立时刻（确认根的收盘时间，ms) */
  confirmedAt: number;
  /** 触发价：信号成立时的收盘价 */
  triggerPrice: number;
  evidence: SignalEvidence;
}

export interface AssetResult {
  symbol: string;
  name: { zh: string; tw: string; en: string };
  kind: "crypto" | "stock";
  price: number | null;
  change24h: number | null;
  signals: AssetSignal[];
  rvol: Partial<Record<Timeframe, number | null>>;
  /** 近 60 根收盘价（15m 优先） */
  spark: number[];
  /** 该标的数据不可得（两源皆失败 / K 线不足） */
  unavailable?: boolean;
}

export interface SignalsPayload {
  scannedAt: string;
  assets: AssetResult[];
  breadth: { total: number; up: number; upPct: number; withSignals: number };
  stocksUnavailable?: boolean;
  cryptoUnavailable?: boolean;
  error?: string;
}

interface AssetConfig {
  symbol: string;
  name: { zh: string; tw: string; en: string };
  kind: "crypto" | "stock";
}

export const CRYPTO_ASSETS: AssetConfig[] = [
  { symbol: "BTC", kind: "crypto", name: { zh: "比特币", tw: "比特幣", en: "Bitcoin" } },
  { symbol: "ETH", kind: "crypto", name: { zh: "以太坊", tw: "以太坊", en: "Ethereum" } },
  { symbol: "SOL", kind: "crypto", name: { zh: "索拉纳", tw: "索拉納", en: "Solana" } },
  { symbol: "BNB", kind: "crypto", name: { zh: "币安币", tw: "幣安幣", en: "BNB" } },
  { symbol: "XRP", kind: "crypto", name: { zh: "瑞波币", tw: "瑞波幣", en: "XRP" } },
  { symbol: "DOGE", kind: "crypto", name: { zh: "狗狗币", tw: "狗狗幣", en: "Dogecoin" } },
  { symbol: "ADA", kind: "crypto", name: { zh: "艾达币", tw: "艾達幣", en: "Cardano" } },
  { symbol: "TRX", kind: "crypto", name: { zh: "波场", tw: "波場", en: "TRON" } },
  { symbol: "LINK", kind: "crypto", name: { zh: "Chainlink", tw: "Chainlink", en: "Chainlink" } },
  { symbol: "AVAX", kind: "crypto", name: { zh: "雪崩协议", tw: "雪崩協議", en: "Avalanche" } },
  { symbol: "SUI", kind: "crypto", name: { zh: "Sui", tw: "Sui", en: "Sui" } },
  { symbol: "NEAR", kind: "crypto", name: { zh: "Near Protocol", tw: "Near Protocol", en: "Near Protocol" } },
  { symbol: "LTC", kind: "crypto", name: { zh: "莱特币", tw: "萊特幣", en: "Litecoin" } },
  { symbol: "BCH", kind: "crypto", name: { zh: "比特币现金", tw: "比特幣現金", en: "Bitcoin Cash" } },
  { symbol: "UNI", kind: "crypto", name: { zh: "Uniswap", tw: "Uniswap", en: "Uniswap" } },
  { symbol: "AAVE", kind: "crypto", name: { zh: "Aave", tw: "Aave", en: "Aave" } },
  { symbol: "ARB", kind: "crypto", name: { zh: "Arbitrum", tw: "Arbitrum", en: "Arbitrum" } },
  { symbol: "OP", kind: "crypto", name: { zh: "Optimism", tw: "Optimism", en: "Optimism" } },
  { symbol: "INJ", kind: "crypto", name: { zh: "Injective", tw: "Injective", en: "Injective" } },
  { symbol: "TIA", kind: "crypto", name: { zh: "Celestia", tw: "Celestia", en: "Celestia" } },
  { symbol: "PEPE", kind: "crypto", name: { zh: "佩佩蛙", tw: "佩佩蛙", en: "Pepe" } },
  { symbol: "WIF", kind: "crypto", name: { zh: "dogwifhat", tw: "dogwifhat", en: "dogwifhat" } },
  { symbol: "ENA", kind: "crypto", name: { zh: "Ethena", tw: "Ethena", en: "Ethena" } },
  { symbol: "ONDO", kind: "crypto", name: { zh: "Ondo", tw: "Ondo", en: "Ondo Finance" } },
  { symbol: "HYPE", kind: "crypto", name: { zh: "Hyperliquid", tw: "Hyperliquid", en: "Hyperliquid" } },
  { symbol: "ZEC", kind: "crypto", name: { zh: "大零币", tw: "大零幣", en: "Zcash" } },
  { symbol: "FIL", kind: "crypto", name: { zh: "Filecoin", tw: "Filecoin", en: "Filecoin" } },
  { symbol: "APT", kind: "crypto", name: { zh: "Aptos", tw: "Aptos", en: "Aptos" } },
  { symbol: "ATOM", kind: "crypto", name: { zh: "Cosmos", tw: "Cosmos", en: "Cosmos" } },
  { symbol: "DOT", kind: "crypto", name: { zh: "波卡", tw: "波卡", en: "Polkadot" } },
];

export const STOCK_ASSETS: AssetConfig[] = [
  { symbol: "SPY", kind: "stock", name: { zh: "标普500指数ETF", tw: "標普500指數ETF", en: "S&P 500 ETF" } },
  { symbol: "QQQ", kind: "stock", name: { zh: "纳斯达克100指数ETF", tw: "納斯達克100指數ETF", en: "Nasdaq-100 ETF" } },
  { symbol: "AAPL", kind: "stock", name: { zh: "苹果", tw: "蘋果", en: "Apple" } },
  { symbol: "MSFT", kind: "stock", name: { zh: "微软", tw: "微軟", en: "Microsoft" } },
  { symbol: "NVDA", kind: "stock", name: { zh: "英伟达", tw: "英偉達", en: "NVIDIA" } },
  { symbol: "AMZN", kind: "stock", name: { zh: "亚马逊", tw: "亞馬遜", en: "Amazon" } },
  { symbol: "GOOGL", kind: "stock", name: { zh: "谷歌", tw: "谷歌", en: "Alphabet" } },
  { symbol: "META", kind: "stock", name: { zh: "Meta", tw: "Meta", en: "Meta Platforms" } },
  { symbol: "TSLA", kind: "stock", name: { zh: "特斯拉", tw: "特斯拉", en: "Tesla" } },
  { symbol: "AMD", kind: "stock", name: { zh: "超威半导体", tw: "超威半導體", en: "AMD" } },
  { symbol: "AVGO", kind: "stock", name: { zh: "博通", tw: "博通", en: "Broadcom" } },
  { symbol: "NFLX", kind: "stock", name: { zh: "奈飞", tw: "奈飛", en: "Netflix" } },
  { symbol: "COIN", kind: "stock", name: { zh: "Coinbase", tw: "Coinbase", en: "Coinbase" } },
  { symbol: "MSTR", kind: "stock", name: { zh: "微策略", tw: "微策略", en: "MicroStrategy" } },
  { symbol: "CRCL", kind: "stock", name: { zh: "Circle", tw: "Circle", en: "Circle" } },
  { symbol: "PLTR", kind: "stock", name: { zh: "Palantir", tw: "Palantir", en: "Palantir" } },
  { symbol: "HOOD", kind: "stock", name: { zh: "Robinhood", tw: "Robinhood", en: "Robinhood" } },
  { symbol: "SMCI", kind: "stock", name: { zh: "超微电脑", tw: "超微電腦", en: "Super Micro Computer" } },
  { symbol: "ARM", kind: "stock", name: { zh: "Arm", tw: "Arm", en: "Arm Holdings" } },
  { symbol: "QQQI", kind: "stock", name: { zh: "纳斯达克100高收益ETF", tw: "納斯達克100高收益ETF", en: "NEOS Nasdaq-100 High Income ETF" } },
];

/* ---------------- 通用取数 ---------------- */

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.split("?")[0]}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length) as R[];
  let idx = 0;
  const workers = Array.from(
    { length: Math.min(size, items.length) },
    async () => {
      while (idx < items.length) {
        const i = idx++;
        out[i] = await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

/* ---------------- K 线与指标引擎 ---------------- */

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

function emaSeries(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out = new Array<number>(values.length);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = values[i] * k + out[i - 1] * (1 - k);
  }
  return out;
}

export function macdDif(closes: number[]): number[] {
  const e12 = emaSeries(closes, 12);
  const e26 = emaSeries(closes, 26);
  return closes.map((_, i) => e12[i] - e26[i]);
}

const SWING_W = 5;

function swingHighIdx(candles: Candle[]): number[] {
  const out: number[] = [];
  for (let i = SWING_W; i + SWING_W < candles.length; i++) {
    let ok = true;
    for (let j = 1; j <= SWING_W && ok; j++) {
      if (candles[i].h <= candles[i - j].h || candles[i].h <= candles[i + j].h)
        ok = false;
    }
    if (ok) out.push(i);
  }
  return out;
}

function swingLowIdx(candles: Candle[]): number[] {
  const out: number[] = [];
  for (let i = SWING_W; i + SWING_W < candles.length; i++) {
    let ok = true;
    for (let j = 1; j <= SWING_W && ok; j++) {
      if (candles[i].l >= candles[i - j].l || candles[i].l >= candles[i + j].l)
        ok = false;
    }
    if (ok) out.push(i);
  }
  return out;
}

const RANGE_N = 20;

export function analyzeSeries(
  candles: Candle[],
  tf: Timeframe,
): { signals: AssetSignal[]; rvol: number | null } {
  const signals: AssetSignal[] = [];
  const n = candles.length;
  if (n < RANGE_N + 1) return { signals, rvol: null };
  const tfMs = TF_MS[tf];
  const last = candles[n - 1];
  const prev = candles.slice(n - RANGE_N - 1, n - 1);

  let rangeHigh = -Infinity;
  let rangeLow = Infinity;
  let volSum = 0;
  for (const b of prev) {
    if (b.h > rangeHigh) rangeHigh = b.h;
    if (b.l < rangeLow) rangeLow = b.l;
    volSum += b.v;
  }
  const avgVol = volSum / RANGE_N;
  const volMultiple = avgVol > 0 ? last.v / avgVol : null;
  const rvol = volMultiple;

  // 横盘突破 / 区间整理（最后一根已收盘 K 线 vs 此前 20 根区间）
  if (last.c > rangeHigh || last.c < rangeLow) {
    signals.push({
      type: last.c > rangeHigh ? "breakout-up" : "breakout-down",
      ...(volMultiple != null && volMultiple >= 1.5
        ? { subtype: "with-volume" as const }
        : {}),
      tf,
      confirmedAt: last.t + tfMs,
      triggerPrice: last.c,
      evidence: {
        rangeHigh,
        rangeLow,
        ...(volMultiple != null ? { volMultiple } : {}),
      },
    });
  } else if ((rangeHigh - rangeLow) / ((rangeHigh + rangeLow) / 2) <= 0.06) {
    signals.push({
      type: "range",
      tf,
      confirmedAt: last.t + tfMs,
      triggerPrice: last.c,
      evidence: {
        rangeHigh,
        rangeLow,
        ...(volMultiple != null ? { volMultiple } : {}),
      },
    });
  }

  // MACD 背离（需要足够历史让 EMA 收敛）
  if (n >= 80) {
    const closes = candles.map((b) => b.c);
    const dif = macdDif(closes);

    const highs = swingHighIdx(candles);
    if (highs.length >= 2) {
      const i2 = highs[highs.length - 1];
      const i1 = highs[highs.length - 2];
      // 确认根 = i2 右侧第 5 根，须落在最近 3 根已收盘 K 线内
      if (i2 + SWING_W >= n - 3) {
        const p1 = candles[i1].h;
        const p2 = candles[i2].h;
        if (p2 > p1 && dif[i2] < dif[i1]) {
          signals.push({
            type: "top-div",
            subtype: (p2 - p1) / p1 <= 0.015 ? "flat" : "new-extreme",
            tf,
            confirmedAt: candles[i2 + SWING_W].t + tfMs,
            triggerPrice: candles[i2 + SWING_W].c,
            evidence: {
              p1: { price: p1, dif: dif[i1], time: candles[i1].t },
              p2: { price: p2, dif: dif[i2], time: candles[i2].t },
            },
          });
        }
      }
    }

    const lows = swingLowIdx(candles);
    if (lows.length >= 2) {
      const i2 = lows[lows.length - 1];
      const i1 = lows[lows.length - 2];
      if (i2 + SWING_W >= n - 3) {
        const p1 = candles[i1].l;
        const p2 = candles[i2].l;
        if (p2 < p1 && dif[i2] > dif[i1]) {
          signals.push({
            type: "bottom-div",
            subtype: (p1 - p2) / p1 <= 0.015 ? "flat" : "new-extreme",
            tf,
            confirmedAt: candles[i2 + SWING_W].t + tfMs,
            triggerPrice: candles[i2 + SWING_W].c,
            evidence: {
              p1: { price: p1, dif: dif[i1], time: candles[i1].t },
              p2: { price: p2, dif: dif[i2], time: candles[i2].t },
            },
          });
        }
      }
    }
  }

  return { signals, rvol };
}

/* ---------------- 4h 聚合 ---------------- */

/** 币圈 4h：1h 按 UTC 整 4 小时分桶，只保留满 4 根的完整桶（最后一桶未满即丢弃）。 */
function aggregate4hUtc(hourly: Candle[]): Candle[] {
  const buckets = new Map<number, Candle[]>();
  for (const b of hourly) {
    const key = Math.floor(b.t / TF_MS["4h"]);
    const arr = buckets.get(key);
    if (arr) arr.push(b);
    else buckets.set(key, [b]);
  }
  const out: Candle[] = [];
  for (const key of [...buckets.keys()].sort((a, b) => a - b)) {
    const arr = buckets.get(key)!;
    if (arr.length !== 4) continue;
    out.push({
      t: key * TF_MS["4h"],
      o: arr[0].o,
      h: Math.max(...arr.map((b) => b.h)),
      l: Math.min(...arr.map((b) => b.l)),
      c: arr[3].c,
      v: arr.reduce((s, b) => s + b.v, 0),
    });
  }
  return out;
}

/* ---------------- 币圈取数（Binance 首选，OKX 备用） ---------------- */

const BINANCE_BASE = "https://data-api.binance.vision";
const KLINE_LIMIT = 260;

async function fetchBinanceKlines(
  symbol: string,
  interval: "15m" | "1h",
): Promise<Candle[]> {
  const j = (await fetchJson(
    `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${KLINE_LIMIT}`,
  )) as unknown[][];
  const now = Date.now();
  const out: Candle[] = [];
  for (const r of j) {
    const closeTime = Number(r[6]);
    if (closeTime >= now) continue; // 丢弃正在形成的 K 线
    out.push({
      t: Number(r[0]),
      o: Number(r[1]),
      h: Number(r[2]),
      l: Number(r[3]),
      c: Number(r[4]),
      v: Number(r[5]),
    });
  }
  return out;
}

async function fetchBinanceChanges(): Promise<Map<string, number>> {
  const symbols = CRYPTO_ASSETS.map((a) => `${a.symbol}USDT`);
  const j = (await fetchJson(
    `${BINANCE_BASE}/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`,
  )) as { symbol: string; priceChangePercent: string }[];
  const map = new Map<string, number>();
  for (const r of j) {
    map.set(r.symbol.replace(/USDT$/, ""), Number(r.priceChangePercent));
  }
  return map;
}

const OKX_BAR: Record<"15m" | "1h", string> = { "15m": "15m", "1h": "1H" };

async function fetchOkxCandles(
  symbol: string,
  tf: "15m" | "1h",
): Promise<Candle[]> {
  const j = (await fetchJson(
    `https://www.okx.com/api/v5/market/candles?instId=${symbol}-USDT&bar=${OKX_BAR[tf]}&limit=300`,
  )) as { code: string; data: string[][] };
  if (j.code !== "0" || !Array.isArray(j.data)) throw new Error("okx candles");
  const out: Candle[] = [];
  for (const r of j.data) {
    if (r[8] !== "1") continue; // 只取已收盘（confirm=1）
    out.push({
      t: Number(r[0]),
      o: Number(r[1]),
      h: Number(r[2]),
      l: Number(r[3]),
      c: Number(r[4]),
      v: Number(r[5]),
    });
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}

async function fetchOkxChanges(): Promise<Map<string, number>> {
  const j = (await fetchJson(
    "https://www.okx.com/api/v5/market/tickers?instType=SPOT",
  )) as {
    code: string;
    data: { instId: string; last: string; open24h: string }[];
  };
  if (j.code !== "0") throw new Error("okx tickers");
  const map = new Map<string, number>();
  for (const r of j.data) {
    if (!r.instId.endsWith("-USDT")) continue;
    const open = Number(r.open24h);
    if (open > 0) {
      map.set(r.instId.replace(/-USDT$/, ""), (Number(r.last) / open - 1) * 100);
    }
  }
  return map;
}

/* ---------------- 美股取数（Yahoo Finance） ---------------- */

const etDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const etClockFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
});

function etDateKey(ts: number): string {
  return etDateFmt.format(new Date(ts));
}

/** 美东今天是否仍在常规交易时段内（<16:00 ET）——用于判断当日最后一个 4h 组是否已收盘。 */
function etSessionOpen(now: number): boolean {
  const parts = etClockFmt.formatToParts(new Date(now));
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm < 16 * 60;
}

interface YahooChart {
  timestamps: number[];
  quote: {
    open: (number | null)[];
    high: (number | null)[];
    low: (number | null)[];
    close: (number | null)[];
    volume: (number | null)[];
  };
}

async function fetchYahooChart(
  symbol: string,
  interval: "15m" | "60m",
  range: string,
): Promise<YahooChart> {
  let lastErr: unknown = null;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const j = (await fetchJson(
        `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`,
      )) as {
        chart?: {
          result?: {
            timestamp?: number[];
            indicators?: { quote?: YahooChart["quote"][] };
          }[];
        };
      };
      const r = j?.chart?.result?.[0];
      if (r?.timestamp && r.indicators?.quote?.[0]) {
        return { timestamps: r.timestamp, quote: r.indicators.quote[0] };
      }
      lastErr = new Error("yahoo: empty chart result");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("yahoo unavailable");
}

function yahooToCandles(chart: YahooChart, intervalSec: number): Candle[] {
  const now = Date.now();
  const out: Candle[] = [];
  const { timestamps, quote } = chart;
  for (let i = 0; i < timestamps.length; i++) {
    const c = quote.close[i];
    const o = quote.open[i];
    const h = quote.high[i];
    const l = quote.low[i];
    if (c == null || o == null || h == null || l == null) continue;
    const t = timestamps[i] * 1000;
    if (t + intervalSec * 1000 > now) continue; // 丢弃正在形成的那根
    out.push({ t, o, h, l, c, v: quote.volume[i] ?? 0 });
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}

/** 美股 4h：按交易日（美东日期）分组、日内每 4 根 1h 一组（开盘锚定）；当日最后一组在收盘前视为未完成、丢弃。 */
function aggregate4hSession(hourly: Candle[]): Candle[] {
  const byDay = new Map<string, Candle[]>();
  for (const b of hourly) {
    const key = etDateKey(b.t);
    const arr = byDay.get(key);
    if (arr) arr.push(b);
    else byDay.set(key, [b]);
  }
  const now = Date.now();
  const todayKey = etDateKey(now);
  const sessionOpen = etSessionOpen(now);
  const out: Candle[] = [];
  for (const key of [...byDay.keys()].sort()) {
    const arr = byDay.get(key)!;
    const groups: Candle[][] = [];
    for (let i = 0; i < arr.length; i += 4) groups.push(arr.slice(i, i + 4));
    groups.forEach((g, gi) => {
      if (key === todayKey && sessionOpen && gi === groups.length - 1) return;
      out.push({
        t: g[0].t,
        o: g[0].o,
        h: Math.max(...g.map((b) => b.h)),
        l: Math.min(...g.map((b) => b.l)),
        c: g[g.length - 1].c,
        v: g.reduce((s, b) => s + b.v, 0),
      });
    });
  }
  return out;
}

/** 最近两个交易日的收盘价之比 → 涨跌 %（美股涨跌口径，页面已标注）。 */
function stockChangeFromHourly(hourly: Candle[]): number | null {
  const lastCloseByDay = new Map<string, number>();
  for (const b of hourly) lastCloseByDay.set(etDateKey(b.t), b.c);
  const days = [...lastCloseByDay.keys()].sort();
  if (days.length < 2) return null;
  const last = lastCloseByDay.get(days[days.length - 1])!;
  const prev = lastCloseByDay.get(days[days.length - 2])!;
  return prev > 0 ? (last / prev - 1) * 100 : null;
}

/* ---------------- 单标的分析 ---------------- */

function buildResult(
  cfg: AssetConfig,
  series: Partial<Record<Timeframe, Candle[]>>,
  change24h: number | null,
): AssetResult {
  const signals: AssetSignal[] = [];
  const rvol: Partial<Record<Timeframe, number | null>> = {};
  for (const tf of TIMEFRAMES) {
    const candles = series[tf];
    if (!candles || candles.length === 0) {
      rvol[tf] = null;
      continue;
    }
    const r = analyzeSeries(candles, tf);
    signals.push(...r.signals);
    rvol[tf] = r.rvol;
  }
  const base = series["15m"]?.length ? series["15m"] : series["1h"];
  const price =
    base && base.length > 0 ? base[base.length - 1].c : null;
  const spark = base ? base.slice(-60).map((b) => b.c) : [];
  return {
    symbol: cfg.symbol,
    name: cfg.name,
    kind: cfg.kind,
    price,
    change24h,
    signals,
    rvol,
    spark,
    ...(price == null ? { unavailable: true } : {}),
  };
}

async function analyzeCrypto(
  cfg: AssetConfig,
  changes: Map<string, number> | null,
): Promise<AssetResult> {
  let s15: Candle[] = [];
  let s1h: Candle[] = [];
  try {
    [s15, s1h] = await Promise.all([
      fetchBinanceKlines(cfg.symbol, "15m"),
      fetchBinanceKlines(cfg.symbol, "1h"),
    ]);
  } catch {
    /* 整源失败时逐个换 OKX */
  }
  if (s15.length === 0) {
    try {
      s15 = await fetchOkxCandles(cfg.symbol, "15m");
    } catch {
      /* 留空，下面标 unavailable */
    }
  }
  if (s1h.length === 0) {
    try {
      s1h = await fetchOkxCandles(cfg.symbol, "1h");
    } catch {
      /* 同上 */
    }
  }
  const series: Partial<Record<Timeframe, Candle[]>> = {
    "15m": s15,
    "1h": s1h,
    "4h": s1h.length ? aggregate4hUtc(s1h) : [],
  };
  return buildResult(cfg, series, changes?.get(cfg.symbol) ?? null);
}

async function analyzeStock(cfg: AssetConfig): Promise<AssetResult> {
  const [c15, c60] = await Promise.all([
    fetchYahooChart(cfg.symbol, "15m", "1mo"),
    fetchYahooChart(cfg.symbol, "60m", "3mo"),
  ]);
  const s15 = yahooToCandles(c15, 900);
  const s1h = yahooToCandles(c60, 3600);
  const series: Partial<Record<Timeframe, Candle[]>> = {
    "15m": s15,
    "1h": s1h,
    "4h": s1h.length ? aggregate4hSession(s1h) : [],
  };
  return buildResult(cfg, series, stockChangeFromHourly(s1h));
}

/* ---------------- 全池扫描 ---------------- */

export async function fetchSignalScan(): Promise<SignalsPayload> {
  let changes: Map<string, number> | null = null;
  try {
    changes = await fetchBinanceChanges();
  } catch {
    try {
      changes = await fetchOkxChanges();
    } catch {
      changes = null;
    }
  }

  const crypto = await mapPool(CRYPTO_ASSETS, 8, (cfg) =>
    analyzeCrypto(cfg, changes),
  );
  const stocks = await mapPool(STOCK_ASSETS, 6, async (cfg) => {
    try {
      return await analyzeStock(cfg);
    } catch {
      return {
        symbol: cfg.symbol,
        name: cfg.name,
        kind: cfg.kind,
        price: null,
        change24h: null,
        signals: [],
        rvol: {},
        spark: [],
        unavailable: true,
      } as AssetResult;
    }
  });

  const assets = [...crypto, ...stocks];
  const withData = assets.filter((a) => !a.unavailable);
  const up = withData.filter((a) => (a.change24h ?? 0) > 0).length;
  return {
    scannedAt: new Date().toISOString(),
    assets,
    breadth: {
      total: withData.length,
      up,
      upPct: withData.length > 0 ? (up / withData.length) * 100 : 0,
      withSignals: assets.filter((a) => a.signals.length > 0).length,
    },
    stocksUnavailable: stocks.every((a) => a.unavailable),
    cryptoUnavailable: crypto.every((a) => a.unavailable),
  };
}

/*
 * 数据源实测矩阵（2026-11-03，建页环境本机 curl 实测）：
 * - Binance data-api.binance.vision /api/v3/klines：HTTP 200 ✓
 * - Binance data-api.binance.vision /api/v3/ticker/24hr（单标的与 symbols 批量）：HTTP 200 ✓
 * - OKX www.okx.com /api/v5/market/candles：HTTP 200 ✓（首根 confirm=0 为未收盘根，代码只取 confirm=1）
 * - Yahoo query1.finance.yahoo.com /v8/finance/chart（60m/15m，含 QQQI、CRCL、HOOD、SMCI）：HTTP 200 ✓
 * - Yahoo query2.finance.yahoo.com /v8/finance/chart：HTTP 200 ✓
 * 备注：Yahoo 在 Vercel 出口曾被封（见 /api/crcl 双源处理），故整类失败时
 * 本接口返回 stocksUnavailable、页面如实标注，不用任何假数据补位。
 */
