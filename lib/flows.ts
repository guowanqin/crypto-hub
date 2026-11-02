/**
 * 交易所资金流 + 保证金（合约）看板：自动取数 + 派生口径（纯函数尽量与取数分离）。
 *
 *
 * - 总览：DeFiLlama /cexs 页展示的那组数（clean reserves + inflows_24h/1w/1m），
 * 两级取数（按保真度排序，任一级成功即用，两级全败时 errors.flows 带每一级
 * 的来源标签与原始错误）：
 *   L1 解析 defillama.com/cexs 服务端渲染页的 __NEXT_DATA__（与页面展示完全
 *   同源同值），请求带完整浏览器头。但 defillama.com 对部分机房出口直接 403
 *   （2026-11-02 线上实测 Vercel 出口被挡，本地出口正常；彼时线上错误为
 *   "HTTP 403 https://defillama.com/cexs"），仅靠请求头未必能过，故有 L2。
 *   L2 api.llama.fi/cexs 目录 JSON（前端 CEXS_API 的目录端点）：实测其 payload
 *   已内嵌拼装好的 currentTvl 与 inflows_24h/1w/1m，与页面 __NEXT_DATA__ 同
 *   字段、同管线，两次抓取仅有分钟级数值时差；其 slug 小写后与页面的
 *   cexProtocolSlug 逐一相同，coin/currentTvl 16 家全对齐。api.llama.fi 域名
 *   不在 defillama.com 的机房封锁范围内（本站 updatedProtocol 明细一直走它）。
 *   环境变量 FLOWS_FORCE_LEVEL=1|2 可强制只走某一级（本地验证 fallback 用）。
 * 旧版 api.llama.fi/cex、/cex/{slug} 已 404，api.llama.fi/inflows 现为付费
 * 接口（HTTP 402）；defillama-datasets.llama.fi 下 cex 相关文件名（cex.json、
 * cexs.json、cex/、cex-reserves.json 等，2026-11-02 逐一探测）均为 404，无
 * 静态 JSON 镜像可用。只收录主流名单内、且 currentTvl 有值的交易所；
 * Coinbase、Kraken、Upbit 等未被 DeFiLlama 追踪钱包集覆盖（currentTvl 为
 * 空），不硬凑行。
 * - 口径：currentTvl 是「clean reserves」——已标记钱包资产总额剔除自家代币
 * （如 Binance 剔除 BNB）；inflows 是 DeFiLlama 按钱包转账算的净流入（剔除价格
 * 因素的近似），不等于用户净申购，口径卡里写明。
 * - 明细（点行展开）：api.llama.fi/updatedProtocol/{cexProtocolSlug}（免费可达，
 * Binance 约 27MB，只在点开时按需拉、按 slug 缓存 1 小时）→ 聚合各链
 * chainTvls 的日线 tvl 与 tokensInUsd：最新代币构成（剔除自家代币后前 8 名）、
 * 最近 35 个完整日的 clean 储备序列，以及由相邻日收盘差算出的「余额变化」。
 * 注意余额变化含价格因素，与总览的净流入引擎口径不同，只作交叉核对，页面明示。
 *
 *
 * - OKX：官方公开接口直取——/api/v5/public/open-interest（SWAP+FUTURES 的 oiUsd
 * 求和）+ BTC-USDT-SWAP 资金费率（/8h）。
 * - Hyperliquid：官方 info 接口 metaAndAssetCtxs——全品种 openInterest × markPx
 * 求和为总 OI；BTC 资金费率为每小时口径（/1h）。
 * - 其余各所（Binance、Bybit、Bitget、Gate、KuCoin、MEXC、HTX、Deribit、Kraken、
 * Bitfinex、Crypto.com）：官方合约接口对机房/部分地域 IP 受限（Binance fapi 与
 * Bybit v5 已实测被地域拦截），统一用 CoinGecko 衍生品聚合兜底：
 * /derivatives/exchanges 的 open_interest_btc × BTC 现价换算 USD；
 * /derivatives 里按市场名匹配 BTC/XBT 永续（取未平仓最大者）的 funding_rate
 * （该字段本身即百分数）。CoinGecko 的 Hyperliquid OI 与官方值明显不符，故
 * Hyperliquid 只用官方源、不走 CG。
 * - 多空比：Binance/Bybit 官方统计接口地域受限、OKX rubik 多空比接口已下线
 * （实测 404），免费公开源暂不可得——字段恒为 null，页面显示「—」并在口径卡说明。
 * - 某家全源失败时该行数值给 null（页面显示「暂不可用」），绝不编数。
 */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const errMsg = (err: unknown) =>
  (err instanceof Error ? err.message : String(err)).slice(0, 160);

async function fetchJson(
  url: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<any> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": UA,
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

/** 页面抓取带完整浏览器请求头（UA/Accept/Accept-Language/Referer），排除纯 UA 引起的 403。 */
async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": UA,
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      referer: "https://defillama.com/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

/* ---------------- 资金流总览 ---------------- */

export interface FlowRow {
  name: string;
  /** cexProtocolSlug，明细取数用（如 "binance-cex"） */
  slug: string;
  /** 储备口径中被剔除的自家代币符号（如 BNB）；无则 null */
  ownToken: string | null;
  /** clean reserves（USD，剔除自家代币） */
  reservesUsd: number | null;
  flow24h: number | null;
  flow7d: number | null;
  flow30d: number | null;
}

export interface FlowsOverview {
  rows: FlowRow[];
  fetchedAt: string;
}

/** 总览收录的主流交易所名单（以 DeFiLlama 实际覆盖为准；表中无数据的自动剔除）。 */
const FLOW_WHITELIST = [
  "Binance",
  "OKX",
  "Bybit",
  "Bitfinex",
  "Robinhood",
  "Gate",
  "Bitget",
  "Gemini",
  "Bitstamp",
  "MEXC",
  "HTX",
  "Deribit",
  "KuCoin",
  "Crypto.com",
  "HashKey Exchange",
  "BingX",
];

/** L1（页面 __NEXT_DATA__）与 L2（api.llama.fi/cexs）条目字段同名，仅 slug 字段不同，统一在此建行。 */
function rowsFromCexEntries(
  cexs: any[],
  slugOf: (c: any) => string,
  srcLabel: string,
): FlowRow[] {
  const rows: FlowRow[] = [];
  for (const c of cexs) {
    if (!c || typeof c.name !== "string") continue;
    if (!FLOW_WHITELIST.includes(c.name)) continue;
    const tvl = Number(c.currentTvl);
    if (!Number.isFinite(tvl) || tvl <= 0) continue;
    const num = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    rows.push({
      name: c.name,
      slug: slugOf(c),
      ownToken: typeof c.coin === "string" && c.coin ? c.coin : null,
      reservesUsd: tvl,
      flow24h: num(c.inflows_24h),
      flow7d: num(c.inflows_1w),
      flow30d: num(c.inflows_1m),
    });
  }
  rows.sort((a, b) => (b.reservesUsd ?? 0) - (a.reservesUsd ?? 0));
  if (rows.length < 5)
    throw new Error(`${srcLabel}: only ${rows.length} usable rows`);
  return rows;
}

export function parseCexsNextData(html: string): FlowRow[] {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) throw new Error("defillama cexs page: __NEXT_DATA__ not found");
  const data = JSON.parse(m[1]);
  const cexs = data?.props?.pageProps?.cexs;
  if (!Array.isArray(cexs))
    throw new Error("defillama cexs page: pageProps.cexs missing");
  return rowsFromCexEntries(
    cexs,
    (c) => (typeof c.cexProtocolSlug === "string" ? c.cexProtocolSlug : ""),
    "defillama cexs page",
  );
}

/** L2 解析：api.llama.fi/cexs 目录 JSON（slug 小写后与页面 cexProtocolSlug 对齐，如 "Binance-CEX"→"binance-cex"）。 */
export function parseCexsApiPayload(payload: any): FlowRow[] {
  const cexs = payload?.cexs;
  if (!Array.isArray(cexs))
    throw new Error("api.llama.fi/cexs: cexs array missing");
  return rowsFromCexEntries(
    cexs,
    (c) => (typeof c.slug === "string" ? c.slug.toLowerCase() : ""),
    "api.llama.fi/cexs",
  );
}

async function fetchFlowsOverviewL1(): Promise<FlowRow[]> {
  const html = await fetchText("https://defillama.com/cexs", 25_000);
  return parseCexsNextData(html);
}

async function fetchFlowsOverviewL2(): Promise<FlowRow[]> {
  const payload = await fetchJson("https://api.llama.fi/cexs", 20_000);
  return parseCexsApiPayload(payload);
}

/**
 * 资金流总览两级取数：L1 defillama.com/cexs 页面 → L2 api.llama.fi/cexs JSON。
 * FLOWS_FORCE_LEVEL=1|2 时只走指定一级（验证 fallback 用，生产不设）。
 * 任一级成功即返回；全部失败抛出的错误带每一级的来源标签与原始错误。
 */
export async function fetchFlowsOverview(): Promise<FlowsOverview> {
  const force = process.env.FLOWS_FORCE_LEVEL;
  const failures: string[] = [];
  if (force !== "2") {
    try {
      const rows = await fetchFlowsOverviewL1();
      return { rows, fetchedAt: new Date().toISOString() };
    } catch (err) {
      failures.push(`flows L1 (defillama.com/cexs page): ${errMsg(err)}`);
      if (force === "1") throw new Error(failures.join(" | "));
    }
  }
  try {
    const rows = await fetchFlowsOverviewL2();
    return { rows, fetchedAt: new Date().toISOString() };
  } catch (err) {
    failures.push(`flows L2 (api.llama.fi/cexs): ${errMsg(err)}`);
    throw new Error(failures.join(" | "));
  }
}

/* ---------------- 单所明细（updatedProtocol 按需聚合） ---------------- */

export interface CexTokenShare {
  symbol: string;
  usd: number;
  /** 占 clean 储备（剔除自家代币后总额）的百分比 */
  pct: number;
}

export interface CexSeriesPoint {
  date: string; // UTC YYYY-MM-DD
  reservesUsd: number; // clean reserves
}

export interface CexDetail {
  slug: string;
  name: string;
  /** 被剔除的自家代币符号（如 BNB）；无则 null */
  ownToken: string | null;
  tokens: CexTokenShare[];
  /** 最近至多 35 个完整日，旧→新 */
  series: CexSeriesPoint[];
  /** 由日线收盘差算出的余额变化（含价格因素，与净流入引擎口径不同） */
  balanceChange: { h24: number | null; d7: number | null; d30: number | null };
  fetchedAt: string;
}

interface CexMeta {
  name: string;
  coin: string | null;
}

/** 明细所需的 name/coin 元数据：api.llama.fi/cexs 目录（slug 大小写不敏感匹配）。 */
export async function fetchCexMeta(slug: string): Promise<CexMeta | null> {
  const payload = await fetchJson("https://api.llama.fi/cexs", 20_000);
  const list = payload?.cexs;
  if (!Array.isArray(list)) return null;
  const want = slug.toLowerCase();
  for (const c of list) {
    if (typeof c?.slug === "string" && c.slug.toLowerCase() === want) {
      return {
        name: typeof c.name === "string" ? c.name : slug,
        coin: typeof c.coin === "string" && c.coin ? c.coin : null,
      };
    }
  }
  return null;
}

export function buildCexDetail(
  proto: any,
  slug: string,
  meta: CexMeta,
): CexDetail {
  const chainTvls = proto?.chainTvls;
  if (!chainTvls || typeof chainTvls !== "object") {
    throw new Error("updatedProtocol: chainTvls missing");
  }
  const coin = meta.coin;
  const totalByDate = new Map<number, number>();
  const ownByDate = new Map<number, number>();
  const latestTokens = new Map<string, number>();

  for (const chain of Object.keys(chainTvls)) {
    const entry = chainTvls[chain];
    for (const p of entry?.tvl ?? []) {
      const d = Number(p?.date);
      const v = Number(p?.totalLiquidityUSD);
      if (Number.isFinite(d) && Number.isFinite(v)) {
        totalByDate.set(d, (totalByDate.get(d) ?? 0) + v);
      }
    }
    const tiu: any[] = Array.isArray(entry?.tokensInUsd)
      ? entry.tokensInUsd
      : [];
    for (const p of tiu) {
      const d = Number(p?.date);
      const own = coin ? Number(p?.tokens?.[coin]) : NaN;
      if (Number.isFinite(d) && Number.isFinite(own)) {
        ownByDate.set(d, (ownByDate.get(d) ?? 0) + own);
      }
    }
    const last = tiu[tiu.length - 1];
    if (last?.tokens && typeof last.tokens === "object") {
      for (const [sym, v] of Object.entries(last.tokens)) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          latestTokens.set(sym, (latestTokens.get(sym) ?? 0) + n);
        }
      }
    }
  }

  // 代币构成：剔除自家代币，以 clean 总额为分母
  const ownLatest = coin ? (latestTokens.get(coin) ?? 0) : 0;
  const totalLatest = [...latestTokens.values()].reduce((s, v) => s + v, 0);
  const cleanLatest = Math.max(totalLatest - ownLatest, 0);
  const tokens: CexTokenShare[] = [...latestTokens.entries()]
    .filter(([sym]) => sym !== coin)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([symbol, usd]) => ({
      symbol,
      usd,
      pct: cleanLatest > 0 ? (usd / cleanLatest) * 100 : 0,
    }));

  // 日线 clean 序列：只取整日时间戳（剔除当日未完成的盘中点）
  const dates = [...totalByDate.keys()]
    .filter((d) => d % 86400 === 0)
    .sort((a, b) => a - b);
  const clean = dates.map((d) => ({
    ts: d,
    v: (totalByDate.get(d) ?? 0) - (ownByDate.get(d) ?? 0),
  }));
  const tail = clean.slice(-35);
  const series: CexSeriesPoint[] = tail.map(({ ts, v }) => ({
    date: new Date(ts * 1000).toISOString().slice(0, 10),
    reservesUsd: v,
  }));
  const diff = (back: number): number | null => {
    const a = clean[clean.length - 1];
    const b = clean[clean.length - 1 - back];
    return a && b ? a.v - b.v : null;
  };

  return {
    slug,
    name: meta.name,
    ownToken: coin,
    tokens,
    series,
    balanceChange: { h24: diff(1), d7: diff(7), d30: diff(30) },
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCexDetail(
  slug: string,
  metaHint?: CexMeta | null,
): Promise<CexDetail> {
  const meta = metaHint ?? (await fetchCexMeta(slug));
  if (!meta) throw new Error(`cex meta not found for ${slug}`);
  const proto = await fetchJson(
    `https://api.llama.fi/updatedProtocol/${encodeURIComponent(slug)}`,
    60_000,
  );
  return buildCexDetail(proto, slug, meta);
}

/* ---------------- 保证金（合约） ---------------- */

export type MarginSource = "okx" | "hyperliquid" | "coingecko";

export interface MarginRow {
  name: string;
  /** 合约未平仓总额（USD 名义价值） */
  oiUsd: number | null;
  /** BTC 永续资金费率（百分数，如 0.01 = 0.01%） */
  fundingPct: number | null;
  /** 资金费率结算周期（已确证的才标） */
  fundingPeriod: "8h" | "1h" | null;
  /** 多空比：免费公开源暂不可得，恒 null（口径卡说明） */
  lsRatio: number | null;
  source: MarginSource;
}

interface CgVenue {
  name: string;
  cgId: string;
  cgMarket: string;
  fundingPeriod: "8h" | "1h" | null;
}

const CG_VENUES: CgVenue[] = [
  {
    name: "Binance",
    cgId: "binance_futures",
    cgMarket: "Binance (Futures)",
    fundingPeriod: "8h",
  },
  {
    name: "Bybit",
    cgId: "bybit",
    cgMarket: "Bybit (Futures)",
    fundingPeriod: "8h",
  },
  {
    name: "Bitget",
    cgId: "bitget_futures",
    cgMarket: "Bitget Futures",
    fundingPeriod: "8h",
  },
  {
    name: "Gate",
    cgId: "gate_futures",
    cgMarket: "Gate (Futures)",
    fundingPeriod: "8h",
  },
  {
    name: "MEXC",
    cgId: "mxc_futures",
    cgMarket: "MEXC (Futures)",
    fundingPeriod: "8h",
  },
  {
    name: "KuCoin",
    cgId: "kumex",
    cgMarket: "KuCoin Futures",
    fundingPeriod: "8h",
  },
  {
    name: "HTX",
    cgId: "huobi_dm",
    cgMarket: "HTX Futures",
    fundingPeriod: "8h",
  },
  {
    name: "Deribit",
    cgId: "deribit",
    cgMarket: "Deribit",
    fundingPeriod: "1h",
  },
  {
    name: "Kraken",
    cgId: "kraken_futures",
    cgMarket: "Kraken (Futures)",
    fundingPeriod: "1h",
  },
  {
    name: "Bitfinex",
    cgId: "bitfinex_futures",
    cgMarket: "Bitfinex (Futures)",
    fundingPeriod: null,
  },
  {
    name: "Crypto.com",
    cgId: "crypto_com_futures",
    cgMarket: "Crypto.com Exchange (Futures)",
    fundingPeriod: "1h",
  },
];

async function fetchOkxMargin(): Promise<{
  oiUsd: number;
  fundingPct: number | null;
}> {
  const [swap, fut, funding] = await Promise.all([
    fetchJson(
      "https://www.okx.com/api/v5/public/open-interest?instType=SWAP",
      20_000,
    ),
    fetchJson(
      "https://www.okx.com/api/v5/public/open-interest?instType=FUTURES",
      20_000,
    ),
    fetchJson(
      "https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP",
      20_000,
    ).catch(() => null),
  ]);
  const sum = (payload: any) => {
    if (!Array.isArray(payload?.data))
      throw new Error("okx open-interest: bad payload");
    return payload.data.reduce(
      (s: number, x: any) =>
        s + (Number.isFinite(Number(x?.oiUsd)) ? Number(x.oiUsd) : 0),
      0,
    );
  };
  const oiUsd = sum(swap) + sum(fut);
  if (!(oiUsd > 0)) throw new Error("okx open-interest: zero total");
  const fr = Number(funding?.data?.[0]?.fundingRate);
  return { oiUsd, fundingPct: Number.isFinite(fr) ? fr * 100 : null };
}

async function fetchHlMargin(): Promise<{
  oiUsd: number;
  fundingPct: number | null;
  btcMark: number | null;
}> {
  const payload = await fetchJson("https://api.hyperliquid.xyz/info", 20_000, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
  });
  const universe = payload?.[0]?.universe;
  const ctxs = payload?.[1];
  if (!Array.isArray(universe) || !Array.isArray(ctxs)) {
    throw new Error("hyperliquid: bad payload");
  }
  let oiUsd = 0;
  let fundingPct: number | null = null;
  let btcMark: number | null = null;
  for (let i = 0; i < universe.length; i++) {
    const c = ctxs[i];
    const oi = Number(c?.openInterest);
    const px = Number(c?.markPx);
    if (Number.isFinite(oi) && Number.isFinite(px)) oiUsd += oi * px;
    if (universe[i]?.name === "BTC") {
      const f = Number(c?.funding);
      fundingPct = Number.isFinite(f) ? f * 100 : null; // 每小时费率（分数→百分数）
      btcMark = Number.isFinite(px) ? px : null;
    }
  }
  if (!(oiUsd > 0)) throw new Error("hyperliquid: zero total OI");
  return { oiUsd, fundingPct, btcMark };
}

async function fetchCgBtcPrice(): Promise<number> {
  const payload = await fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    15_000,
  );
  const p = Number(payload?.bitcoin?.usd);
  if (!Number.isFinite(p) || p <= 0)
    throw new Error("coingecko price: bad payload");
  return p;
}

async function fetchCgDerivExchanges(): Promise<Map<string, number>> {
  const payload = await fetchJson(
    "https://api.coingecko.com/api/v3/derivatives/exchanges?per_page=100&page=1",
    25_000,
  );
  if (!Array.isArray(payload))
    throw new Error("coingecko deriv exchanges: bad payload");
  const out = new Map<string, number>();
  for (const e of payload) {
    const oi = Number(e?.open_interest_btc);
    if (typeof e?.id === "string" && Number.isFinite(oi) && oi > 0)
      out.set(e.id, oi);
  }
  return out;
}

/** CG /derivatives：按市场名取 BTC/XBT 永续中未平仓最大者的 funding_rate（百分数）。 */
async function fetchCgFundings(): Promise<Map<string, number>> {
  const payload = await fetchJson(
    "https://api.coingecko.com/api/v3/derivatives?include_tickers=unexpired",
    40_000,
  );
  if (!Array.isArray(payload))
    throw new Error("coingecko derivatives: bad payload");
  const byMarket = new Map<string, { oi: number; fr: number }>();
  for (const t of payload) {
    if (!t || typeof t !== "object") continue;
    if (typeof t.market !== "string") continue;
    if (t.contract_type !== "perpetual") continue;
    const sym = typeof t.symbol === "string" ? t.symbol : "";
    if (!/^(BTC|XBT|PF_XBT|BTCF0)/.test(sym)) continue;
    const oi = Number(t.open_interest);
    const fr = Number(t.funding_rate);
    if (!Number.isFinite(oi) || !Number.isFinite(fr)) continue;
    const cur = byMarket.get(t.market);
    if (!cur || oi > cur.oi) byMarket.set(t.market, { oi, fr });
  }
  const out = new Map<string, number>();
  for (const [k, v] of byMarket) out.set(k, v.fr);
  return out;
}

export interface MarginResult {
  rows: MarginRow[];
  btcPriceUsd: number | null;
}

export async function fetchMargin(): Promise<MarginResult> {
  const rows: MarginRow[] = [];
  const problems: string[] = [];

  const [okx, hl, cgOi, cgFr, cgPrice] = await Promise.allSettled([
    fetchOkxMargin(),
    fetchHlMargin(),
    fetchCgDerivExchanges(),
    fetchCgFundings(),
    fetchCgBtcPrice(),
  ]);

  let btcPrice: number | null = null;
  if (cgPrice.status === "fulfilled") btcPrice = cgPrice.value;
  else problems.push(`btcPrice: ${errMsg(cgPrice.reason)}`);
  if (btcPrice == null && hl.status === "fulfilled")
    btcPrice = hl.value.btcMark;

  if (okx.status === "fulfilled") {
    rows.push({
      name: "OKX",
      oiUsd: okx.value.oiUsd,
      fundingPct: okx.value.fundingPct,
      fundingPeriod: "8h",
      lsRatio: null,
      source: "okx",
    });
  } else {
    problems.push(`okx: ${errMsg(okx.reason)}`);
    rows.push({
      name: "OKX",
      oiUsd: null,
      fundingPct: null,
      fundingPeriod: "8h",
      lsRatio: null,
      source: "okx",
    });
  }

  if (hl.status === "fulfilled") {
    rows.push({
      name: "Hyperliquid",
      oiUsd: hl.value.oiUsd,
      fundingPct: hl.value.fundingPct,
      fundingPeriod: "1h",
      lsRatio: null,
      source: "hyperliquid",
    });
  } else {
    problems.push(`hyperliquid: ${errMsg(hl.reason)}`);
    rows.push({
      name: "Hyperliquid",
      oiUsd: null,
      fundingPct: null,
      fundingPeriod: "1h",
      lsRatio: null,
      source: "hyperliquid",
    });
  }

  const oiMap = cgOi.status === "fulfilled" ? cgOi.value : null;
  if (!oiMap)
    problems.push(`cgOi: ${errMsg((cgOi as PromiseRejectedResult).reason)}`);
  const frMap = cgFr.status === "fulfilled" ? cgFr.value : null;
  if (!frMap)
    problems.push(
      `cgFunding: ${errMsg((cgFr as PromiseRejectedResult).reason)}`,
    );

  for (const v of CG_VENUES) {
    const oiBtc = oiMap?.get(v.cgId);
    rows.push({
      name: v.name,
      oiUsd: oiBtc != null && btcPrice ? oiBtc * btcPrice : null,
      fundingPct: frMap?.get(v.cgMarket) ?? null,
      fundingPeriod: v.fundingPeriod,
      lsRatio: null,
      source: "coingecko",
    });
  }

  rows.sort((a, b) => (b.oiUsd ?? -1) - (a.oiUsd ?? -1));
  if (rows.every((r) => r.oiUsd == null)) {
    throw new Error(`margin: all sources failed [${problems.join("; ")}]`);
  }
  return { rows, btcPriceUsd: btcPrice };
}

/* ---------------- payload ---------------- */

export interface FlowsPayload {
  fetchedAt: string;
  flows: FlowsOverview | null;
  margin: MarginRow[] | null;
  btcPriceUsd: number | null;
  errors: { flows?: string; margin?: string };
}

export interface CexDetailPayload {
  fetchedAt: string;
  detail: CexDetail | null;
  error?: string;
}
