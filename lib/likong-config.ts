/**
 * 利空出尽指数（/tool/likong-index）的词组配置：路由白名单、算法权重、
 * 子指数标签的单一事实源。scripts/sync-likong.mjs 里有一份同构副本
 * （.mjs 不能直接 import TS），改这里必须同步改脚本，反之亦然。
 *
 * 查询形式经 2026-11-04 实测选定（GDELT DOC 2.0，mode=timelinevol，
 * timespan=12m/24m，date_resolution=day）：
 * - 带引号的短语（"利空出尽"）返回纯文本错误
 *   "The specified phrase is too short."（HTTP 200 但不是 JSON），不可用；
 * - 2 字中文关键词（割肉、爆仓）返回 "keyword that was too short"，
 *   同样不可用——绝望组因此改用 4 字新闻体词逐一实测 24 个月覆盖：
 *   割肉离场 283 天非零、爆仓潮 88 天非零，保留；恐慌抛售仅 63 天
 *   非零，覆盖过稀剔除（宁缺毋滥）；
 * - OR 组合必须加括号（(A OR B)），本工具分词组单独取数，不用 OR；
 * - 不带引号的单关键词形式返回真实日序列，是唯一可用形式；
 * - 各词的覆盖实测见 sync 脚本生成的数据文件 meta 与本次提交说明。
 */

export interface LikongGroupDef {
  /** 组 id（路由 ?g= 与数据文件 groups[].id 共用） */
  id: string;
  /** GDELT 查询串（不带引号的单关键词） */
  query: string;
  /** 合成权重（主词条最高） */
  weight: number;
  /** 子指数展示名（三语静态文案） */
  label: { zh: string; tw: string; en: string };
  /** 归组：main 主词条 / ext 扩展词 / despair 绝望组 */
  kind: "main" | "ext" | "despair";
}

export const LIKONG_GROUPS: LikongGroupDef[] = [
  {
    id: "main",
    query: "利空出尽",
    weight: 3,
    label: { zh: "利空出尽", tw: "利空出盡", en: "“Bad news exhausted”" },
    kind: "main",
  },
  {
    id: "land",
    query: "利空落地",
    weight: 2,
    label: { zh: "利空落地", tw: "利空落地", en: "“Bad news landed”" },
    kind: "ext",
  },
  {
    id: "badnews",
    query: "坏消息出尽",
    weight: 2,
    label: { zh: "坏消息出尽", tw: "壞消息出盡", en: "“Bad news all out”" },
    kind: "ext",
  },
  {
    id: "gaidie",
    query: "该跌不跌",
    weight: 1,
    label: { zh: "该跌不跌", tw: "該跌不跌", en: "“Won't fall when it should”" },
    kind: "ext",
  },
  {
    id: "gerou2",
    query: "割肉离场",
    weight: 1,
    label: { zh: "割肉离场", tw: "割肉離場", en: "“Cut losses and leave”" },
    kind: "despair",
  },
  {
    id: "baocang2",
    query: "爆仓潮",
    weight: 1,
    label: { zh: "爆仓潮", tw: "爆倉潮", en: "“Liquidation wave”" },
    kind: "despair",
  },
];

export const LIKONG_GROUP_MAP: Record<string, LikongGroupDef> = Object.fromEntries(
  LIKONG_GROUPS.map((g) => [g.id, g]),
);

/** 代理路由允许的 timespan（月数 ≤ 25 的白名单，防滥用任意长跨度） */
export const LIKONG_TIMESPANS = new Set([
  "1m",
  "3m",
  "6m",
  "12m",
  "18m",
  "24m",
  "25m",
]);

/** 事件收益与价格叠加的四个标的（标签放配置层，避免前端组件
 *  import 数据层时把数据文件打进浏览器包） */
export type LikongAssetId = "BTC" | "ETH" | "SPX" | "IXIC";

export const LIKONG_ASSETS: {
  id: LikongAssetId;
  label: { zh: string; tw: string; en: string };
  short: { zh: string; tw: string; en: string };
}[] = [
  {
    id: "BTC",
    label: { zh: "比特币 BTC", tw: "比特幣 BTC", en: "Bitcoin (BTC)" },
    short: { zh: "BTC", tw: "BTC", en: "BTC" },
  },
  {
    id: "ETH",
    label: { zh: "以太坊 ETH", tw: "以太坊 ETH", en: "Ethereum (ETH)" },
    short: { zh: "ETH", tw: "ETH", en: "ETH" },
  },
  {
    id: "SPX",
    label: { zh: "标普 500", tw: "標普 500", en: "S&P 500" },
    short: { zh: "标普", tw: "標普", en: "S&P" },
  },
  {
    id: "IXIC",
    label: { zh: "纳斯达克综合", tw: "納斯達克綜合", en: "Nasdaq Composite" },
    short: { zh: "纳指", tw: "納指", en: "Nasdaq" },
  },
];
