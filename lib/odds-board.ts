// 预测市场赔率榜（odds-board）：Polymarket 每日 above/below 市场的隐含概率阶梯
// + crypto 类事件 24h 交易量排行。
//
// 数据源（免费免 key 公开接口，2026-11-18 09:08–09:15 CST 立项实测，
// 本文件写作时 2026-11-18 13:2x CST 复测 HTTP 200）：
//   Polymarket Gamma API https://gamma-api.polymarket.com
//     当日事件按 slug 直查：/events?slug=<asset>-above-on-<month>-<day>-<year>
//       例：bitcoin-above-on-november-18-2026（事件提前约一周建好）；
//       每个 market 的 groupItemTitle 是价位（如 "64,000"），outcomePrices 是
//       JSON 字符串 ["Yes价","No价"]，Yes 价即市场隐含概率（0–1）。
//       事件按 Binance BTC/ETH-USDT 1 分钟 K 线在美东正午 12:00 的收盘价结算。
//     交易量榜：/events?tag_slug=crypto&order=volume24hr&ascending=false&limit=100
//       注意：limit > 50 时服务端要求 Accept-Encoding: gzip，否则返回
//       {"error":"gzip_required"}（2026-11-18 实测），fetch 时必须带该头。
//   现价：Binance 公开行情 https://data-api.binance.vision/api/v3/ticker/24hr
//     （api.binance.com 本机被地域拦截，vision 域名可用）；失败回退 CoinGecko
//     https://api.coingecko.com/api/v3/simple/price（免 key）。都取不到时现价
//     留空、页面不标现价位置，绝不拿隐含概率反推假现价。
//
// 口径（页面公开）：
//   v1 只做每日 above/below 市场（BTC、ETH）：当前正在进行、最近一个美东正午
//   结算的事件。月度 reach 市场（"Will Bitcoin reach $X in …?"）的 outcomePrices
//   立项实测疑似 stale（现价 $64,624 时"11 月触及 $72,500"Yes 标 1.0），不上。
//   交易量榜以列表接口的 24h 交易量（volume24hr）为准；同一事件的总交易量在
//   列表与单事件接口对不上（立项实测），页面不写总量。
//   赔率是市场押注的隐含概率，不是预测、不是投资建议；Polymarket 在部分地区
//   受限，本页只展示数据、不设交易入口与外链。
//
// 取数在服务端（/api/odds-board 路由，内存缓存 10 分钟 + stale 回退，与
// /api/btc-cycle 同一模式）；取不到当日事件时整榜报错，不编造概率。

export interface OddsLevel {
  /** 价位（美元） */
  strike: number;
  /** Yes 隐含概率（0–1） */
  prob: number;
}

export interface OddsAssetBoard {
  asset: "BTC" | "ETH";
  /** 事件标题原文，如 "Bitcoin above ___ on November 18?" */
  eventTitle: string;
  /** 事件 slug，如 bitcoin-above-on-november-18-2026 */
  eventSlug: string;
  /** 结算时间（美东正午）的 ISO 字符串 */
  endDate: string;
  /** 该事件 24h 交易量（美元，列表/事件口径） */
  volume24hr: number;
  /** 现价（美元），取不到为 null */
  spot: number | null;
  /** 概率阶梯，按价位升序 */
  levels: OddsLevel[];
}

export interface OddsVolumeEvent {
  title: string;
  slug: string;
  volume24hr: number;
}

export interface OddsBoardData {
  btc: OddsAssetBoard | null;
  eth: OddsAssetBoard | null;
  /** crypto 类事件 24h 交易量 Top 10 */
  volumeTop: OddsVolumeEvent[];
  /** 服务端取数完成时间（毫秒） */
  fetchedAt: number;
}

// ---------------------------------------------------------------------------
// 纯函数（解析与口径，可独立校验）
// ---------------------------------------------------------------------------

/** outcomePrices 可能是 JSON 字符串或已解析数组；取 Yes 价（第一个）。 */
export function parseYesPrice(raw: unknown): number | null {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const v = Number(arr[0]);
  if (!Number.isFinite(v) || v < 0 || v > 1) return null;
  return v;
}

/** groupItemTitle 形如 "64,000" / "1,600"；解析为数字价位。 */
export function parseStrike(title: unknown): number | null {
  if (typeof title !== "string") return null;
  const v = Number(title.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(v) || v <= 0) return null;
  return v;
}

/**
 * 隐含中位价位：概率阶梯上 prob 穿过 50% 的价位（线性插值）。
 * 全部价位概率都 >50% 或都 <50% 时返回 null（页面留空说明）。
 */
export function impliedMedian(levels: OddsLevel[]): number | null {
  if (levels.length === 0) return null;
  for (let i = 0; i < levels.length; i++) {
    if (levels[i].prob === 0.5) return levels[i].strike;
    if (levels[i].prob < 0.5) {
      if (i === 0) return null;
      const hi = levels[i - 1];
      const lo = levels[i];
      const span = hi.prob - lo.prob;
      if (span <= 0) return lo.strike;
      const frac = (hi.prob - 0.5) / span;
      return hi.strike + frac * (lo.strike - hi.strike);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 服务端取数（仅 /api/odds-board 路由调用）
// ---------------------------------------------------------------------------

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const FETCH_TIMEOUT_MS = 12_000;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "Accept-Encoding": "gzip", Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return res.json();
}

interface GammaMarket {
  groupItemTitle?: unknown;
  outcomePrices?: unknown;
  closed?: unknown;
}

interface GammaEvent {
  title?: unknown;
  slug?: unknown;
  endDate?: unknown;
  closed?: unknown;
  volume24hr?: unknown;
  markets?: GammaMarket[];
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** 美东（America/New_York）某日 +offset 天的日期，供拼事件 slug。 */
function etDatePlus(offsetDays: number): { y: number; m: number; d: number } {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? NaN);
  return { y: get("year"), m: get("month"), d: get("day") };
}

function eventSlug(assetSlug: string, dt: { y: number; m: number; d: number }): string {
  return `${assetSlug}-above-on-${MONTHS[dt.m - 1]}-${dt.d}-${dt.y}`;
}

function toAssetBoard(
  asset: "BTC" | "ETH",
  ev: GammaEvent,
  spot: number | null,
): OddsAssetBoard | null {
  if (typeof ev.title !== "string" || typeof ev.slug !== "string") return null;
  if (typeof ev.endDate !== "string") return null;
  const levels: OddsLevel[] = [];
  for (const m of ev.markets ?? []) {
    if (m.closed === true) continue;
    const strike = parseStrike(m.groupItemTitle);
    const prob = parseYesPrice(m.outcomePrices);
    if (strike === null || prob === null) continue;
    levels.push({ strike, prob });
  }
  if (levels.length === 0) return null;
  levels.sort((a, b) => a.strike - b.strike);
  return {
    asset,
    eventTitle: ev.title,
    eventSlug: ev.slug,
    endDate: ev.endDate,
    volume24hr: Number(ev.volume24hr) || 0,
    spot,
    levels,
  };
}

/** 按 slug 逐日找当前正在进行的每日 above 事件（未关闭、结算时间在未来）。 */
async function fetchDailyAboveEvent(assetSlug: string): Promise<GammaEvent | null> {
  const now = Date.now();
  const candidates: GammaEvent[] = [];
  // 事件提前约一周建好；从美东今天起向后探 3 天足够覆盖当前结算周期。
  for (let offset = 0; offset <= 3; offset++) {
    const slug = eventSlug(assetSlug, etDatePlus(offset));
    try {
      const raw = await fetchJson(`${GAMMA_BASE}/events?slug=${encodeURIComponent(slug)}`);
      const ev = Array.isArray(raw) ? (raw[0] as GammaEvent | undefined) : undefined;
      if (!ev) continue;
      if (ev.closed === true) continue;
      const end = typeof ev.endDate === "string" ? Date.parse(ev.endDate) : NaN;
      if (!Number.isFinite(end) || end <= now) continue;
      candidates.push(ev);
    } catch {
      // 单日探测失败不中断，继续下一天
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => Date.parse(String(a.endDate)) - Date.parse(String(b.endDate)));
    return candidates[0];
  }
  // 回退：在 crypto 事件列表里按标题找未关闭的 above 事件，取结算最早的一个。
  const list = (await fetchJson(
    `${GAMMA_BASE}/events?tag_slug=crypto&order=volume24hr&ascending=false&limit=100`,
  )) as GammaEvent[];
  const name = assetSlug === "bitcoin" ? "Bitcoin" : "Ethereum";
  const matches = list.filter(
    (e) =>
      typeof e.title === "string" &&
      e.title.startsWith(`${name} above ___ on `) &&
      e.closed !== true &&
      typeof e.endDate === "string" &&
      Date.parse(e.endDate) > now,
  );
  matches.sort((a, b) => Date.parse(String(a.endDate)) - Date.parse(String(b.endDate)));
  return matches[0] ?? null;
}

/** 现价：Binance vision 优先，CoinGecko 回退；都失败返回 null。 */
async function fetchSpot(pair: string, geckoId: string): Promise<number | null> {
  for (const base of ["https://data-api.binance.vision", "https://api.binance.com"]) {
    try {
      const raw = (await fetchJson(`${base}/api/v3/ticker/24hr?symbol=${pair}`)) as {
        lastPrice?: unknown;
      };
      const v = Number(raw?.lastPrice);
      if (Number.isFinite(v) && v > 0) return v;
    } catch {
      // 换下一个源
    }
  }
  try {
    const raw = (await fetchJson(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
    )) as Record<string, { usd?: unknown }> | null;
    const v = Number(raw?.[geckoId]?.usd);
    if (Number.isFinite(v) && v > 0) return v;
  } catch {
    // 现价留空
  }
  return null;
}

/** crypto 类事件 24h 交易量 Top 10（列表口径）。 */
async function fetchVolumeTop(): Promise<OddsVolumeEvent[]> {
  const list = (await fetchJson(
    `${GAMMA_BASE}/events?tag_slug=crypto&order=volume24hr&ascending=false&limit=100`,
  )) as GammaEvent[];
  const out: OddsVolumeEvent[] = [];
  for (const e of list) {
    if (typeof e.title !== "string" || typeof e.slug !== "string") continue;
    const v = Number(e.volume24hr);
    if (!Number.isFinite(v) || v <= 0) continue;
    out.push({ title: e.title, slug: e.slug, volume24hr: v });
    if (out.length >= 10) break;
  }
  return out;
}

/**
 * 整榜取数。BTC、ETH 任一当日事件取不到就抛错（路由回退 stale 或报错），
 * 不拿别的日期、别的口径补位；交易量榜失败只降级为空榜并注明（见路由）。
 */
export async function fetchOddsBoard(): Promise<OddsBoardData> {
  const [btcEv, ethEv, btcSpot, ethSpot, volumeTop] = await Promise.all([
    fetchDailyAboveEvent("bitcoin"),
    fetchDailyAboveEvent("ethereum"),
    fetchSpot("BTCUSDT", "bitcoin"),
    fetchSpot("ETHUSDT", "ethereum"),
    fetchVolumeTop().catch(() => [] as OddsVolumeEvent[]),
  ]);
  if (!btcEv) throw new Error("Polymarket 当日 Bitcoin above 事件未取到");
  if (!ethEv) throw new Error("Polymarket 当日 Ethereum above 事件未取到");
  const btc = toAssetBoard("BTC", btcEv, btcSpot);
  const eth = toAssetBoard("ETH", ethEv, ethSpot);
  if (!btc || !eth) throw new Error("Polymarket 当日事件解析为空");
  return { btc, eth, volumeTop, fetchedAt: Date.now() };
}
