// 二手黑话词典数据层（仅服务端使用）。
//
// 数据源：GitHub 开源仓库 Domainsun/awesome-chinese-secondhand-slang（MIT License）。
// 上游 README 声称的词库文件结构（stats / categories / abbreviations / entries 四段对象）
// 与仓库实际文件不一致——实测 data/slang-dictionary.json 是一个「词条数组」
// （2026-11-02 实测：149 条主题词条、变体合计 5,082 个、27 个分类 id）。
// 因此本层在同步时自行派生：
// - stats：由词条数组实时统计（词条数、变体总数、分类数），不引用 README 徽章上的旧数字；
// - categories：由词条的 category 字段聚合计数，中文/英文名是本站的界面标注映射
//   （上游只给英文 slug id，未知 id 原样显示）；
// - abbreviations（拼音首字母缩写反查）：两路真实上游数据——README「三、拼音首字母
//   缩写速查」表（人工整理，带含义），以及词条变体里实际出现的拉丁字母暗号
//   （如 cld、gpt、mj，按 token 命中词条）。
// 存活状态枚举以 JSON 的 liveness 字段为准（active / watching / killed），
// 中文标签按上游 README 速查表的图例口径：现行可用 / 抽检限流 / 平台拦截。
//
// 缓存：24 小时（词库一天一同步足够）+ stale 兜底；失败只记 60 秒短路，
// 绝不把失败写入成功缓存（沿用本站 /api/crcl、/api/qqqi 的同一套规范）。
// 浏览器只调本站 /api/slang，永远不直连 raw 文件。

const JSON_URL =
  "https://raw.githubusercontent.com/Domainsun/awesome-chinese-secondhand-slang/main/data/slang-dictionary.json";
const README_URL =
  "https://raw.githubusercontent.com/Domainsun/awesome-chinese-secondhand-slang/main/README.md";
export const SLANG_REPO_URL =
  "https://github.com/Domainsun/awesome-chinese-secondhand-slang";

const UA = "Mozilla/5.0 (compatible; 18btc-hub/1.0; +https://18btc.cc)";
const TTL_MS = 24 * 60 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;
export const SLANG_PAGE_SIZE = 30;

export type SlangLiveness = "active" | "watching" | "killed";
export type SlangRisk = "danger" | "warning" | "safe";

export interface SlangEntry {
  id: string;
  standardName: string;
  category: string;
  slangVariants: string[];
  platforms: string[];
  riskLevel: SlangRisk;
  liveness: SlangLiveness;
  successorSlang: string[];
  activeTrend: string;
  explanation: string;
  sellerIntent: string;
  buyerAdvice: string;
  upvotes: number;
  downvotes: number;
}

export interface SlangCategory {
  id: string;
  name: { zh: string; tw: string; en: string };
  count: number;
}

export interface SlangStatus {
  value: SlangLiveness;
  label: { zh: string; tw: string; en: string };
  count: number;
}

export interface SlangAbbr {
  abbr: string;
  meaning: string;
  field: string;
  note: string;
}

export interface SlangDataset {
  entries: SlangEntry[];
  stats: {
    entries: number;
    variants: number;
    categories: number;
    platforms: string[];
  };
  categories: SlangCategory[];
  statuses: SlangStatus[];
  abbreviations: SlangAbbr[];
  fetchedAt: string;
}

// 分类 id → 本站界面标注名（上游 JSON 只给英文 slug；未收录的 id 原样显示）。
const CATEGORY_NAMES: Record<string, { zh: string; tw: string; en: string }> = {
  "ai-services": { zh: "AI 账号与服务", en: "AI Accounts & Services",
  tw: "AI 賬號與服務" },
  "digital-phone": { zh: "手机数码", en: "Phones & Mobile",
  tw: "手機數碼" },
  "pc-hardware": { zh: "电脑硬件", en: "PC Hardware",
  tw: "電腦硬體" },
  "condition-slang": { zh: "成色黑话", en: "Condition Slang",
  tw: "成色黑話" },
  "evasion-contact": { zh: "引流与联系方式", en: "Off-platform Contact Lures",
  tw: "引流與聯絡方式" },
  "trading-terms": { zh: "交易行话", en: "Trading Terms",
  tw: "交易行話" },
  "xiaohongshu-matrix": { zh: "小红书矩阵", en: "Xiaohongshu Matrix Accounts",
  tw: "小紅書矩陣" },
  "shoes-sneakers": { zh: "潮鞋鞋靴", en: "Sneakers & Shoes",
  tw: "潮鞋鞋靴" },
  "watches-jewelry": { zh: "手表珠宝", en: "Watches & Jewelry",
  tw: "手錶珠寶" },
  "anime-goods": { zh: "二次元谷子", en: "Anime Merch (Guzi)",
  tw: "二次元穀子" },
  "game-accounts": { zh: "游戏账号", en: "Game Accounts",
  tw: "遊戲賬號" },
  "academic-services": { zh: "学术代办服务", en: "Academic Services",
  tw: "學術代辦服務" },
  "traffic-growth": { zh: "引流涨粉", en: "Traffic & Follower Boosting",
  tw: "引流漲粉" },
  "virtual-resources": { zh: "虚拟资源", en: "Virtual Resources",
  tw: "虛擬資源" },
  "ticket-voucher": { zh: "票务卡券", en: "Tickets & Vouchers",
  tw: "票務卡券" },
  "camera-optics": { zh: "相机与光学", en: "Cameras & Optics",
  tw: "相機與光學" },
  "beauty-cosmetics": { zh: "美妆个护", en: "Beauty & Cosmetics",
  tw: "美妝個護" },
  "pets-plants": { zh: "宠物绿植", en: "Pets & Plants",
  tw: "寵物綠植" },
  "general-slang": { zh: "通用黑话", en: "General Slang",
  tw: "通用黑話" },
  "luxury-fashion": { zh: "奢侈品服饰", en: "Luxury Fashion",
  tw: "奢侈品服飾" },
  "digital-hardware": { zh: "数码硬件", en: "Digital Hardware",
  tw: "數碼硬體" },
  "streetwear-luxury": { zh: "潮牌轻奢", en: "Streetwear & Light Luxury",
  tw: "潮牌輕奢" },
  "anime-fandom": { zh: "二次元圈子", en: "Anime Fandom",
  tw: "二次元圈子" },
  "network-tools": { zh: "网络工具", en: "Network Tools",
  tw: "網路工具" },
  "social-traffic": { zh: "社交流量", en: "Social Traffic",
  tw: "社交流量" },
  "digital-assets": { zh: "数字资产", en: "Digital Assets",
  tw: "數字資產" },
  "hardware-mods": { zh: "硬件改装", en: "Hardware Mods",
  tw: "硬體改裝" },
};

export const LIVENESS_LABELS: Record<SlangLiveness, { zh: string; tw: string; en: string }> = {
  active: { zh: "现行可用", en: "Active",
  tw: "現行可用" },
  watching: { zh: "抽检限流", en: "Throttled / Watched",
  tw: "抽檢限流" },
  killed: { zh: "平台拦截", en: "Blocked by Platform",
  tw: "平臺攔截" },
};

export const RISK_LABELS: Record<SlangRisk, { zh: string; tw: string; en: string }> = {
  danger: { zh: "高风险", en: "High Risk",
  tw: "高風險" },
  warning: { zh: "需谨慎", en: "Caution",
  tw: "需謹慎" },
  safe: { zh: "相对安全", en: "Relatively Safe",
  tw: "相對安全" },
};

async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": UA },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function normalizeEntry(raw: unknown): SlangEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  const standardName = str(r.standardName);
  if (!id || !standardName) return null;
  const liveness: SlangLiveness =
    r.liveness === "watching" || r.liveness === "killed" ? r.liveness : "active";
  const riskLevel: SlangRisk =
    r.riskLevel === "danger" || r.riskLevel === "warning" ? r.riskLevel : "safe";
  return {
    id,
    standardName,
    category: str(r.category) || "general-slang",
    slangVariants: strArr(r.slangVariants),
    platforms: strArr(r.platforms),
    riskLevel,
    liveness,
    successorSlang: strArr(r.successorSlang),
    activeTrend: str(r.activeTrend),
    explanation: str(r.explanation),
    sellerIntent: str(r.sellerIntent),
    buyerAdvice: str(r.buyerAdvice),
    // 注意：上游的 sellerAdvice（给卖家的规避建议）与本站买家侧定位冲突，故意不透出。
    upvotes: num(r.upvotes),
    downvotes: num(r.downvotes),
  };
}

// 从 README「三、拼音首字母缩写速查 (A-Z)」一节解析人工整理的缩写表。
// 解析失败（上游改版式）时返回空数组，反查仍可用变体 token 那一路。
function parseAbbreviations(readme: string): SlangAbbr[] {
  const start = readme.indexOf("## 三");
  if (start < 0) return [];
  const rest = readme.slice(start);
  const end = rest.indexOf("\n## ");
  const section = end > 0 ? rest.slice(0, end) : rest;
  const out: SlangAbbr[] = [];
  for (const line of section.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((c) => c.replace(/\*\*/g, "").replace(/`/g, "").trim());
    if (cells.length < 4) continue;
    const [abbr, meaning, field, note] = cells;
    if (!abbr || abbr === "缩写" || /^-+$/.test(abbr.replace(/:/g, ""))) continue;
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(abbr)) continue;
    out.push({ abbr: abbr.toLowerCase(), meaning, field, note });
  }
  return out;
}

async function loadDataset(): Promise<SlangDataset> {
  const jsonText = await fetchText(JSON_URL, 20000);
  const parsed: unknown = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("upstream slang-dictionary.json is not an array");
  }
  const entries = parsed
    .map(normalizeEntry)
    .filter((e): e is SlangEntry => e !== null);

  // README 只是缩写表的补充来源，拉不到不拖垮整个词库。
  let abbreviations: SlangAbbr[] = [];
  try {
    abbreviations = parseAbbreviations(await fetchText(README_URL, 15000));
  } catch {
    abbreviations = [];
  }

  const catCounts = new Map<string, number>();
  const statusCounts = new Map<SlangLiveness, number>();
  const platformSet = new Set<string>();
  let variants = 0;
  for (const e of entries) {
    catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1);
    statusCounts.set(e.liveness, (statusCounts.get(e.liveness) ?? 0) + 1);
    e.platforms.forEach((p) => platformSet.add(p));
    variants += e.slangVariants.length;
  }
  const categories: SlangCategory[] = [...catCounts.entries()]
    .map(([id, count]) => ({
      id,
      name: CATEGORY_NAMES[id] ?? { zh: id, tw: id, en: id },
      count,
    }))
    .sort((a, b) => b.count - a.count);
  const statuses: SlangStatus[] = (
    ["active", "watching", "killed"] as SlangLiveness[]
  ).map((value) => ({
    value,
    label: LIVENESS_LABELS[value],
    count: statusCounts.get(value) ?? 0,
  }));

  return {
    entries,
    stats: {
      entries: entries.length,
      variants,
      categories: categories.length,
      platforms: [...platformSet],
    },
    categories,
    statuses,
    abbreviations,
    fetchedAt: new Date().toISOString(),
  };
}

let cache: { at: number; data: SlangDataset } | null = null;
let fail: { at: number; error: string } | null = null;

export async function getSlangDataset(): Promise<{
  data: SlangDataset | null;
  stale: boolean;
  error?: string;
}> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return { data: cache.data, stale: false };
  if (fail && now - fail.at < FAIL_TTL_MS) {
    if (cache) return { data: cache.data, stale: true };
    return { data: null, stale: false, error: fail.error };
  }
  try {
    const data = await loadDataset();
    cache = { at: Date.now(), data };
    fail = null;
    return { data, stale: false };
  } catch (err) {
    fail = { at: Date.now(), error: String(err) };
    if (cache) return { data: cache.data, stale: true };
    return { data: null, stale: false, error: fail.error };
  }
}

export interface SlangSearchResult {
  total: number;
  page: number;
  pageSize: number;
  items: SlangEntry[];
}

export function searchSlang(
  data: SlangDataset,
  opts: { q?: string; cat?: string; status?: string; page?: number }
): SlangSearchResult {
  const q = (opts.q ?? "").trim().toLowerCase();
  const cat = (opts.cat ?? "").trim();
  const status = (opts.status ?? "").trim();
  const page = Math.max(1, Math.floor(opts.page ?? 1) || 1);

  const scored: { e: SlangEntry; score: number; idx: number }[] = [];
  data.entries.forEach((e, idx) => {
    if (cat && e.category !== cat) return;
    if (
      status &&
      (status === "active" || status === "watching" || status === "killed") &&
      e.liveness !== status
    )
      return;
    if (!q) {
      scored.push({ e, score: 0, idx });
      return;
    }
    let score = 0;
    if (e.standardName.toLowerCase().includes(q)) score = 3;
    else if (e.slangVariants.some((v) => v.toLowerCase().includes(q))) score = 2;
    else if (
      e.explanation.toLowerCase().includes(q) ||
      e.sellerIntent.toLowerCase().includes(q) ||
      e.buyerAdvice.toLowerCase().includes(q)
    )
      score = 1;
    if (score > 0) scored.push({ e, score, idx });
  });
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);

  const total = scored.length;
  const start = (page - 1) * SLANG_PAGE_SIZE;
  return {
    total,
    page,
    pageSize: SLANG_PAGE_SIZE,
    items: scored.slice(start, start + SLANG_PAGE_SIZE).map((s) => s.e),
  };
}

export interface SlangAbbrResult {
  curated: SlangAbbr[];
  entries: { entry: SlangEntry; matchedVariants: string[] }[];
}

// 拼音首字母缩写反查：q 只处理拉丁字母。
// 两路命中：① README 人工缩写表（缩写相等或互为前缀）；
// ② 词条变体里真实出现的拉丁 token（token 相等优先，其次 token 以 q 开头）。
export function lookupAbbr(data: SlangDataset, rawQ: string): SlangAbbrResult {
  const q = rawQ.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!q) return { curated: [], entries: [] };

  const curated = data.abbreviations.filter(
    (a) => a.abbr === q || a.abbr.startsWith(q) || q.startsWith(a.abbr)
  );

  const hits: { entry: SlangEntry; matchedVariants: string[]; exact: boolean }[] = [];
  for (const entry of data.entries) {
    const matched: string[] = [];
    let exact = false;
    for (const v of entry.slangVariants) {
      const tokens = (v.match(/[A-Za-z]+/g) ?? []).map((t) => t.toLowerCase());
      const hit = tokens.find((t) => t === q || (q.length >= 2 && t.startsWith(q)));
      if (hit) {
        matched.push(v);
        if (tokens.some((t) => t === q)) exact = true;
      }
    }
    if (matched.length) {
      hits.push({
        entry,
        matchedVariants: matched.slice(0, 8),
        exact,
      });
    }
  }
  hits.sort((a, b) => Number(b.exact) - Number(a.exact));
  return {
    curated,
    entries: hits.slice(0, 20).map(({ entry, matchedVariants }) => ({
      entry,
      matchedVariants,
    })),
  };
}
