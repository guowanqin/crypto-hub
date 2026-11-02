/**
 * 公链日活排行：自动取数 + 派生口径（人均锁仓）。
 *
 * 数据源（DeFiLlama，与其官网 /chains 页同管线），两级取数（按任务约定
 * L1 优先机器端点、L2 页面解析；任一级成功即用，两级全败时 errors 带每一级
 * 的来源标签与原始错误；环境变量 CHAINDAU_FORCE_LEVEL=1|2 可强制单级验证）：
 *
 * - L1（机器端点，api.llama.fi，Vercel 出口可达）：
 *   日活走前端 defillama-app 的 ChainsByCategory 查询实际调用的接口
 *   GET https://api.llama.fi/v2/metrics/active-users?dataType=dailyActiveUsers
 *   （源码：fetchAdapterChainMetrics({adapterType:'active-users', chain:'All',
 *   dataType:'dailyActiveUsers'})，V2_SERVER_URL=https://api.llama.fi/v2）。
 *   返回 protocols 数组，前端只取 defillamaId 以 "chain#" 开头的条目作链级
 *   数据，字段 total24h（24h 日活）、change_1d / change_7d / change_1m
 *   （日活较 1 / 7 / 30 天前的变化率，%）、average1y。本站同法取数。
 *   TVL 走 GET https://api.llama.fi/v2/chains（name / tvl），按链名大小写
 *   不敏感 + 别名（Elrond→MultiversX）与日活表拼合；拼不上的小链 TVL 为
 *   null（页面显示 —），不换源硬拼。
 * - L2（页面解析，兜底）：defillama.com/chains 的 __NEXT_DATA__
 *   （pageProps.chains：name / tvl / activeUsers24h），与 L1 同管线同字段。
 *   注意两点实测差异：①该域对部分机房出口 403（本站 flows 总览已实测
 *   Vercel 出口被挡），故只作兜底；②页面 ISR 快照比 metrics 接口旧，
 *   个别链（如 opBNB、MultiversX）页面侧 activeUsers 为 0 而接口已有值，
 *   个别数值有约 1–3% 的快照时差。页面 payload 没有「日活变化率」字段
 *   （其 change_7d 是 TVL 变化，不可混用），L2 时 change7d 恒 null。
 *
 * 口径（依据 dimension-adapters 仓库 users/chains.ts 与各链 methodologyURL，
 * 2026-11-02 查证）：
 * - 「日活」是统计期内在链上发起交易的去重地址数。主流链（Ethereum、BSC、
 *   Tron、Arbitrum、Polygon、Base 等）由 Allium 索引原始交易表
 *   count(DISTINCT from_address)；Solana 数 DISTINCT signer（成功且非投票
 *   交易）；比特币系（Bitcoin、Litecoin、Doge 等）用 CoinMetrics 的
 *   AdrActCnt（当期发生资金流动的活跃地址）；个别链用其浏览器官方统计
 *   （Blockscout / Subscan / Routescan 等）。即全量活跃地址口径，不是
 *   「只算与 DeFiLlama 收录协议交互的地址」，但逐链数据源不同、细节有别。
 * - 7d / 30d：源数据**没有**去重或累计的 7 日 / 30 日活跃地址总数——metrics
 *   payload 里根本不存在 total7d / total30d 字段（前端类型声明了该字段但
 *   后端不返回），DeFiLlama /chains 页 payload 里 activeUsers7d /
 *   activeUsers30d 目前全为 0。逐日 chart 端点（/v2/chart/active-users/
 *   chain/{slug}）与 total24h 口径对不上（实测 Ethereum 图上末日约 4.6 万
 *   vs total24h 40.2 万），不能拿来拼 7 日累计。因此本页的 7 日维度只展示
 *   源里真实存在的 change_7d，列名「日活 7 日变化」，口径卡写明原因。
 * - 地址 ≠ 真人：一人多地址、机器人与女巫地址都计入，跨链合计还会重复计
 *   同一人；人均锁仓 = 该链 TVL ÷ 24h 日活，只是资金密度参考，不是人均资产。
 * - 海报类榜单（如 Artemis 口径）数值与本站不同属正常：统计源与口径不同。
 * - Robinhood Chain：DeFiLlama 有其 TVL（约 $10.9 亿）但 users 适配器尚未
 *   覆盖（metrics 无 chain# 条目、页面 activeUsers 为 0），故不上榜，不编数。
 */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const errMsg = (err: unknown) =>
  (err instanceof Error ? err.message : String(err)).slice(0, 160);

async function fetchJson(url: string, timeoutMs: number): Promise<any> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA, accept: "application/json" },
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

/* ---------------- 类型 ---------------- */

export interface ChainDauRow {
  /** 按 24h 日活降序的固定名次（换排序时不变） */
  rank: number;
  /** DeFiLlama 链名（英文，如 BSC、Tron） */
  name: string;
  /** 中文名（主流链有，其余 null，页面回退英文名） */
  nameZh: string | null;
  /** 24 小时日活（去重地址数） */
  dau24h: number;
  /** 日活较 7 天前的变化率（%，源字段 change_7d）；L2 页面源无此口径时 null */
  change7d: number | null;
  /** TVL（USD）；源里拼不上的小链为 null */
  tvlUsd: number | null;
  /** 人均锁仓 = TVL ÷ 24h 日活（USD）；TVL 缺失时 null */
  perCapitaUsd: number | null;
}

export interface ChainDauBoard {
  rows: ChainDauRow[];
  /** 实际命中的取数级别：api = L1 机器端点，page = L2 页面解析 */
  source: "api" | "page";
  fetchedAt: string;
}

export interface ChainDauPayload {
  fetchedAt: string;
  board: ChainDauBoard | null;
  errors: { board?: string };
}

/** 主流链中文名（DeFiLlama 链名小写为键）；表外链回退英文名显示。 */
const ZH_NAMES: Record<string, string> = {
  bsc: "币安链",
  tron: "波场",
  ethereum: "以太坊",
  bitcoin: "比特币",
  litecoin: "莱特币",
  doge: "狗狗币",
  bitcoincash: "比特币现金",
  stellar: "恒星链",
  "op mainnet": "Optimism 主网",
  optimism: "Optimism 主网",
  elrond: "MultiversX",
  multiversx: "MultiversX",
  near: "NEAR",
  avalanche: "雪崩链",
  cardano: "Cardano",
  xrpl: "瑞波链",
  xrp: "瑞波链",
  injective: "Injective",
  sei: "Sei",
  aptos: "Aptos",
  sui: "Sui",
  solana: "Solana",
  base: "Base 链",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  ton: "TON",
  celo: "Celo",
  kaia: "Kaia",
  opbnb: "opBNB",
  "hyperliquid l1": "Hyperliquid",
  algorand: "Algorand",
  "x layer": "X Layer",
  dash: "达世链",
  zcash: "Zcash",
  stacks: "Stacks",
  hedera: "Hedera",
  cronos: "Cronos",
  fantom: "Fantom",
  sonic: "Sonic",
  berachain: "Berachain",
  monad: "Monad",
  linea: "Linea",
  scroll: "Scroll",
  mantle: "Mantle",
  gnosis: "Gnosis",
  boba: "Boba",
  starknet: "Starknet",
};

/** TVL 拼合用的链名别名（小写）：日活表链名 → TVL 表链名。 */
const TVL_ALIASES: Record<string, string> = {
  elrond: "multiversx",
};

const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function buildRows(
  raw: Array<{
    name: string;
    dau24h: number;
    change7d: number | null;
    tvlUsd: number | null;
  }>,
  srcLabel: string,
): ChainDauRow[] {
  const rows = raw
    .filter((r) => r.dau24h > 0)
    .sort((a, b) => b.dau24h - a.dau24h)
    .map((r, i) => ({
      rank: i + 1,
      name: r.name,
      nameZh: ZH_NAMES[r.name.toLowerCase()] ?? null,
      dau24h: r.dau24h,
      change7d: r.change7d,
      tvlUsd: r.tvlUsd,
      perCapitaUsd:
        r.tvlUsd != null && r.dau24h > 0 ? r.tvlUsd / r.dau24h : null,
    }));
  if (rows.length < 20)
    throw new Error(`${srcLabel}: only ${rows.length} usable rows`);
  return rows;
}

/* ---------------- L1：api.llama.fi 机器端点 ---------------- */

export function parseMetricsPayload(
  metrics: any,
  tvlByKey: Map<string, number>,
): ChainDauRow[] {
  const protocols = metrics?.protocols;
  if (!Array.isArray(protocols))
    throw new Error("api.llama.fi metrics: protocols array missing");
  const raw = [];
  for (const p of protocols) {
    if (!p || typeof p.defillamaId !== "string") continue;
    if (!p.defillamaId.startsWith("chain#")) continue;
    const name =
      typeof p.displayName === "string" && p.displayName
        ? p.displayName
        : typeof p.name === "string"
          ? p.name
          : "";
    if (!name) continue;
    const dau = num(p.total24h);
    if (dau == null) continue;
    const key = name.toLowerCase();
    const tvl =
      tvlByKey.get(TVL_ALIASES[key] ?? key) ?? tvlByKey.get(key) ?? null;
    raw.push({
      name,
      dau24h: dau,
      change7d: num(p.change_7d),
      tvlUsd: tvl,
    });
  }
  return buildRows(raw, "api.llama.fi metrics");
}

export function tvlMapFromV2Chains(payload: any): Map<string, number> {
  if (!Array.isArray(payload))
    throw new Error("api.llama.fi/v2/chains: array missing");
  const map = new Map<string, number>();
  for (const c of payload) {
    if (!c || typeof c.name !== "string") continue;
    const tvl = num(c.tvl);
    if (tvl != null) map.set(c.name.toLowerCase(), tvl);
  }
  return map;
}

async function fetchBoardL1(): Promise<ChainDauBoard> {
  const [metrics, chains] = await Promise.all([
    fetchJson(
      "https://api.llama.fi/v2/metrics/active-users?dataType=dailyActiveUsers",
      30_000,
    ),
    fetchJson("https://api.llama.fi/v2/chains", 20_000),
  ]);
  const rows = parseMetricsPayload(metrics, tvlMapFromV2Chains(chains));
  return { rows, source: "api", fetchedAt: new Date().toISOString() };
}

/* ---------------- L2：defillama.com/chains 页面解析 ---------------- */

export function parseChainsNextData(html: string): ChainDauRow[] {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) throw new Error("defillama chains page: __NEXT_DATA__ not found");
  const data = JSON.parse(m[1]);
  const chains = data?.props?.pageProps?.chains;
  if (!Array.isArray(chains))
    throw new Error("defillama chains page: pageProps.chains missing");
  const raw = [];
  for (const c of chains) {
    if (!c || typeof c.name !== "string") continue;
    const dau = num(c.activeUsers24h);
    if (dau == null) continue;
    raw.push({
      name: c.name,
      dau24h: dau,
      // 页面 payload 的 change_7d 是 TVL 变化，不是日活变化，不可混用
      change7d: null,
      tvlUsd: num(c.tvl),
    });
  }
  return buildRows(raw, "defillama chains page");
}

async function fetchBoardL2(): Promise<ChainDauBoard> {
  const html = await fetchText("https://defillama.com/chains", 30_000);
  const rows = parseChainsNextData(html);
  return { rows, source: "page", fetchedAt: new Date().toISOString() };
}

/**
 * 公链日活两级取数：L1 api.llama.fi 机器端点 → L2 defillama.com/chains 页面。
 * CHAINDAU_FORCE_LEVEL=1|2 时只走指定一级（验证 fallback 用，生产不设）。
 * 任一级成功即返回；全部失败抛出的错误带每一级的来源标签与原始错误。
 */
export async function fetchChainDau(): Promise<ChainDauBoard> {
  const force = process.env.CHAINDAU_FORCE_LEVEL;
  const failures: string[] = [];
  if (force !== "2") {
    try {
      return await fetchBoardL1();
    } catch (err) {
      failures.push(`chain-dau L1 (api.llama.fi metrics): ${errMsg(err)}`);
      if (force === "1") throw new Error(failures.join(" | "));
    }
  }
  try {
    return await fetchBoardL2();
  } catch (err) {
    failures.push(`chain-dau L2 (defillama.com/chains page): ${errMsg(err)}`);
    throw new Error(failures.join(" | "));
  }
}
