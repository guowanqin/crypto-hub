import type { Lang } from "./site";

export type ToolType = "own" | "third-party";

export interface ToolDef {
  slug: string;
  name: Record<Lang, string>;
  /** 第三方官网 / 自研官网；站内可用工具（sheet2word）为本站内页，url 指向其独立站仅作备用入口 */
  url: string;
  tags: string[];
  type: ToolType;
  /** 是否在本站内嵌可直接使用（目前只有 sheet2word） */
  embedded?: boolean;
  oneLiner: Record<Lang, string>;
  detail: Record<Lang, string>;
  audience: Record<Lang, string>;
  take: Record<Lang, string>;
}

// 工具注册表：新增工具只改这一处数据，首页分区、标签页、介绍页、sitemap、/go 跳转自动跟随。
export const TOOLS: ToolDef[] = [
  {
    slug: "pershare",
    name: { zh: "PerShare 每股含币量计算器", en: "PerShare — Crypto per Share Calculator" },
    url: "https://pershare.cc",
    tags: ["market"],
    type: "own",
    oneLiner: {
      zh: "实时计算 BNC、PURR 两只加密财库股的每股含币量、含币价值与折溢价。",
      en: "Live per-share coin content, coin value per share, and discount/premium for the BNC and PURR crypto treasury stocks.",
    },
    detail: {
      zh: "把财库公司的持币量、股本和实时币价、股价放在一页算清：每股含多少 BNB / HYPE、每股含币价值多少美元、相对股价是折价还是溢价、mNAV 是多少。数据自动刷新，不用自己拉盘口和财报拼表格；折溢价的正负号全站统一规则，不会被符号绕晕。",
      en: "Puts a treasury company's coin holdings, share count, live coin price and stock price on one page: how much BNB/HYPE each share holds, what that is worth in USD, whether the stock trades at a discount or a premium, and the mNAV. Data refreshes automatically — no stitching quotes and filings together yourself — and the discount/premium sign convention is consistent across the whole page.",
    },
    audience: {
      zh: "关注加密财库股（DAT）估值、想判断 BNC / PURR 折溢价的投资者。",
      en: "Investors valuing crypto treasury (DAT) stocks and checking BNC / PURR discounts.",
    },
    take: {
      zh: "财库股别只看股价，先来这儿看每股到底装了多少币。",
      en: "Don't just stare at the share price — check how much coin is inside each share first.",
    },
  },
  {
    slug: "sheet2word",
    name: { zh: "Excel 批量生成 Word（Sheet2Word）", en: "Excel to Word Batch Generator (Sheet2Word)" },
    url: "https://18btc.cc/tool/sheet2word",
    tags: ["office"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "上传带 {{占位符}} 的 Word 模板和 Excel 表格，一行数据生成一份 Word，打包一次下载。",
      en: "Upload a Word template with {{placeholders}} and an Excel sheet — one Word document per row, packed into a single ZIP download.",
    },
    detail: {
      zh: "在线邮件合并替代工具：不用装 Office，浏览器打开就能用。把 Word 模板里要替换的位置写成 {{姓名}} 这类占位符，Excel 第一行表头会自动与占位符按名匹配，每一行数据生成一份独立的 .docx，可按某一列的值自动命名，最后打包成 ZIP 一次下载。所有解析和生成都在你的浏览器本地完成，文件不上传任何服务器；完全免费、无行数限制、免注册。",
      en: "An online mail-merge alternative that needs no Office install: write {{Name}}-style placeholders in your .docx template, let the Excel header row auto-match them by name, and generate one standalone .docx per data row — named after any column you pick and zipped for a single download. Everything is parsed and generated locally in your browser, files are never uploaded; completely free, no row limit, no sign-up.",
    },
    audience: {
      zh: "要批量出录用通知书、证书、合同、工资条等同版式文档的行政、人事和运营人员。",
      en: "Admin, HR and ops folks who batch-produce offer letters, certificates, contracts or payslips from one template.",
    },
    take: {
      zh: "币圈之外也要办公——批量套打这件事，它是真能把一下午的活压成一分钟，本站实测过。",
      en: "Even coin folks do paperwork — for batch documents this genuinely turns an afternoon into a minute. Field-tested by 18btc.",
    },
  },
  {
    slug: "coingecko",
    name: { zh: "CoinGecko", en: "CoinGecko" },
    url: "https://www.coingecko.com",
    tags: ["market"],
    type: "third-party",
    oneLiner: {
      zh: "全球币种行情总站：价格、市值、交易所与新币发现。",
      en: "The all-in-one crypto market board: prices, market caps, exchanges and new listings.",
    },
    detail: {
      zh: "收录上万种代币的价格、市值、成交量和历史走势，并按交易所、公链和板块分类整理；新币上线和热门搜索更新很快，适合作为查任何币「现在多少钱、盘子多大」的第一站。链上 DEX 数据和 NFT 板块也一并覆盖，属于币圈人的默认首页之一。",
      en: "Tracks prices, market caps, volumes and history for tens of thousands of coins, organized by exchange, chain and category. New listings and trending searches update fast, making it the natural first stop for 'what is this coin worth and how big is it' — with DEX and NFT coverage on the side.",
    },
    audience: {
      zh: "几乎所有币圈用户，尤其是需要快速核对价格与市值的入门和进阶玩家。",
      en: "Practically every crypto user, especially anyone quickly verifying price and market cap.",
    },
    take: {
      zh: "查价我第一反应还是开它，数据全，更新稳。",
      en: "Still my first tab for a price check — broad data, steady updates.",
    },
  },
  {
    slug: "coinmarketcap",
    name: { zh: "CoinMarketCap", en: "CoinMarketCap" },
    url: "https://coinmarketcap.com",
    tags: ["market"],
    type: "third-party",
    oneLiner: {
      zh: "老牌行情站：市值排行榜、恐惧贪婪指数与空投资讯。",
      en: "The veteran market site: cap rankings, the Fear & Greed Index and airdrop news.",
    },
    detail: {
      zh: "以市值排行榜闻名的老牌行情平台，除了价格与市值，还提供恐惧与贪婪指数、板块轮动、空投日历和学习赚币等栏目，资讯与教育内容比较丰富。查一个币的排名与历史市值时，它的排行榜口径是很多媒体引用的来源。",
      en: "The long-standing rankings platform: beyond prices and market caps it offers the Fear & Greed Index, sector rotation views, an airdrop calendar and Learn & Earn content. Its ranking methodology is the one much of the media cites when quoting a coin's rank or historical cap.",
    },
    audience: {
      zh: "喜欢用排行榜和情绪指标辅助判断的用户。",
      en: "Users who like rankings and sentiment gauges as decision aids.",
    },
    take: {
      zh: "排行榜和恐贪指数做得顺手，看大盘情绪时我会扫一眼。",
      en: "Its rankings and Fear & Greed gauge are handy — I glance at them for market mood.",
    },
  },
  {
    slug: "dexscreener",
    name: { zh: "DexScreener", en: "DexScreener" },
    url: "https://dexscreener.com",
    tags: ["market"],
    type: "third-party",
    oneLiner: {
      zh: "DEX 实时行情利器：新池子、新代币的第一发现地。",
      en: "Real-time DEX charts: where new pools and new tokens show up first.",
    },
    detail: {
      zh: "实时追踪各条链上 DEX 的交易对、流动性、成交量和买卖笔数，新池子一出现就能看到，并带 K 线和逐笔交易明细。玩链上新币的人基本人手一个：既用来抢第一手信息，也用来看池子深度和交易结构先排一遍雷。",
      en: "Tracks pairs, liquidity, volume and buy/sell counts across DEXes on many chains in real time, with charts and a per-trade feed the moment a pool appears. A staple for on-chain traders — both for catching fresh tokens early and for checking pool depth and trade structure before jumping in.",
    },
    audience: {
      zh: "在链上找新币、看池子深度的交易者。",
      en: "On-chain traders looking for new tokens and pool depth.",
    },
    take: {
      zh: "新池子刚冒头它就有了，链上冲浪必备，但也记得先排雷。",
      en: "New pools surface here first — essential for chain surfing, just DYOR before apeing.",
    },
  },
  {
    slug: "geckoterminal",
    name: { zh: "GeckoTerminal", en: "GeckoTerminal" },
    url: "https://www.geckoterminal.com",
    tags: ["market"],
    type: "third-party",
    oneLiner: {
      zh: "CoinGecko 出品的 DEX 数据站：池子、交易对与链上行情。",
      en: "CoinGecko's DEX terminal: pools, pairs and on-chain market data.",
    },
    detail: {
      zh: "CoinGecko 旗下的 DEX 数据终端，按链、DEX 和交易对整理流动性池数据，提供 K 线、成交记录和池子指标，界面清爽克制。它和 DexScreener 覆盖的池子高度重合，正好适合交叉验证：同一个池子两边数据对不上时，往往就是问题所在。",
      en: "CoinGecko's DEX data terminal organizes liquidity pools by chain, DEX and pair, with charts, trade history and pool metrics in a clean, restrained interface. Its coverage overlaps heavily with DexScreener's — which is exactly why it's useful: when the same pool shows different numbers in two places, that disagreement is the signal.",
    },
    audience: {
      zh: "需要核对 DEX 池子数据、做交叉验证的链上用户。",
      en: "On-chain users who verify pool data across sources.",
    },
    take: {
      zh: "同一个池子我习惯和 DexScreener 对着看，数据打架时最能发现问题。",
      en: "I cross-check pools here against DexScreener — disagreements are where the truth hides.",
    },
  },
  {
    slug: "defillama",
    name: { zh: "DeFiLlama", en: "DeFiLlama" },
    url: "https://defillama.com",
    tags: ["defi"],
    type: "third-party",
    oneLiner: {
      zh: "DeFi 数据中枢：全链 TVL、协议收入与稳定币全景。",
      en: "The DeFi data hub: TVL, protocol revenue and stablecoins across all chains.",
    },
    detail: {
      zh: "免费无广告的 DeFi 数据平台，聚合各条链和上千个协议的 TVL、手续费、收入、稳定币市值等数据，口径公开透明、更新勤快。判断一个协议或一条链到底有多少真金白银时，它是圈内公认的主流参考，很多研报的数据都出自它。",
      en: "A free, ad-free DeFi analytics platform aggregating TVL, fees, revenue and stablecoin data for thousands of protocols across chains, with transparent methodology and frequent updates. It is the default reference for how much real money a protocol or chain actually holds — much of the industry's research cites it.",
    },
    audience: {
      zh: "DeFi 玩家、研究型用户和需要协议基本面数据的人。",
      en: "DeFi users, researchers and anyone needing protocol fundamentals.",
    },
    take: {
      zh: "看 TVL 我只认它，免费还把数据口径写得明明白白。",
      en: "For TVL this is the one I trust — free, and the methodology is out in the open.",
    },
  },
  {
    slug: "dune",
    name: { zh: "Dune", en: "Dune" },
    url: "https://dune.com",
    tags: ["onchain"],
    type: "third-party",
    oneLiner: {
      zh: "链上数据 SQL 平台：可视化面板和社区查询宝库。",
      en: "On-chain data in SQL: dashboards and a huge library of community queries.",
    },
    detail: {
      zh: "把链上数据做成可查询的数据库，用 SQL 就能拉出交易、地址、协议的任意维度统计，并沉淀了海量社区公开面板可以直接套用。想验证一个热门叙事有没有数据支撑，来这里翻现成面板是最快的路径；会写 SQL 的人还能自己从零查。",
      en: "Turns blockchain data into a queryable database — write SQL to slice transactions, addresses and protocols any way you like, and reuse a massive library of public community dashboards. The fastest way to check whether a hot narrative has data behind it; SQL users can go fully custom.",
    },
    audience: {
      zh: "研究员、数据型玩家和想自己动手查链上数据的人。",
      en: "Researchers, data-driven traders and anyone who wants to query the chain themselves.",
    },
    take: {
      zh: "别人讲故事，我来 Dune 翻面板——数据不会陪人演戏。",
      en: "People tell stories; I check Dune dashboards — data doesn't play along with narratives.",
    },
  },
  {
    slug: "arkham",
    name: { zh: "Arkham", en: "Arkham" },
    url: "https://arkham.com",
    tags: ["onchain"],
    type: "third-party",
    oneLiner: {
      zh: "实体标签情报平台：看懂大地址和机构在链上干什么。",
      en: "Entity-labelled intelligence: see what big addresses and institutions do on-chain.",
    },
    detail: {
      zh: "以地址实体标注见长，把交易所、基金、项目方等真实身份与链上地址对应起来，并提供大额异动提醒和资金流向追踪。盯巨鲸和机构钱包动向时，它看的不是一串十六进制地址，而是「谁在买、谁在卖」。",
      en: "Known for labelling addresses with real-world entities — exchanges, funds, projects — plus large-move alerts and fund-flow tracing. For following whale and institutional wallets it answers 'who is buying and who is selling', not just which hex string moved.",
    },
    audience: {
      zh: "关注巨鲸动向、做链上情报跟踪的用户。",
      en: "Users tracking whale moves and on-chain intelligence.",
    },
    take: {
      zh: "光看地址没用，它把「这是谁的钱包」这件事做成了产品。",
      en: "Raw addresses tell you little; Arkham turned 'whose wallet is this' into a product.",
    },
  },
  {
    slug: "bubblemaps",
    name: { zh: "Bubblemaps", en: "Bubblemaps" },
    url: "https://bubblemaps.io",
    tags: ["onchain"],
    type: "third-party",
    oneLiner: {
      zh: "气泡图看持币分布：一眼识破筹码集中和关联钱包。",
      en: "Bubble charts for holder distribution: spot concentration and linked wallets at a glance.",
    },
    detail: {
      zh: "用气泡图可视化代币的持有人分布，关联钱包会被连成簇：筹码是不是集中在少数地址手里、「去中心化」是不是装出来的，看一张图就心里有数。买 meme 币和新币之前花两分钟看一眼，能避开一类最常见的坑。",
      en: "Visualizes a token's holders as bubble maps, clustering linked wallets so you can see whether supply is concentrated in a few addresses or genuinely spread out. Two minutes here before buying a meme or new token dodges one of the most common traps.",
    },
    audience: {
      zh: "玩 meme 币、新币，想先查筹码结构的用户。",
      en: "Meme and new-token buyers who check token distribution first.",
    },
    take: {
      zh: "买之前先看一眼气泡，筹码全攥在几个地址手里的，再香我也不碰。",
      en: "One glance before buying — if a few wallets hold everything, I pass no matter the hype.",
    },
  },
  {
    slug: "etherscan",
    name: { zh: "Etherscan", en: "Etherscan" },
    url: "https://etherscan.io",
    tags: ["onchain"],
    type: "third-party",
    oneLiner: {
      zh: "以太坊区块浏览器：查交易、查地址、读合约的源头工具。",
      en: "The Ethereum block explorer: transactions, addresses and contracts at the source.",
    },
    detail: {
      zh: "以太坊生态最基础的浏览器，查交易哈希、地址余额、代币转账、合约源码和内部交易都靠它；其他 EVM 链的同系浏览器也沿用这套界面。任何人转述一笔链上记录时，回到这里对一遍哈希和时间戳，就是源头真相。",
      en: "The foundational explorer for Ethereum — look up transaction hashes, address balances, token transfers, contract source code and internal transactions. Its sibling explorers on other EVM chains share the same interface; whenever someone quotes an on-chain record, checking the hash and timestamp here is the source of truth.",
    },
    audience: {
      zh: "所有需要核实以太坊及 EVM 链上记录的用户。",
      en: "Anyone verifying records on Ethereum or EVM chains.",
    },
    take: {
      zh: "任何人跟我说一笔转账，我都先去 Etherscan 对哈希，不听转述。",
      en: "Someone quotes me a transfer, I check the hash on Etherscan first — no hearsay.",
    },
  },
  {
    slug: "rabby",
    name: { zh: "Rabby Wallet", en: "Rabby Wallet" },
    url: "https://rabby.io",
    tags: ["wallet"],
    type: "third-party",
    oneLiner: {
      zh: "多链 EVM 钱包：交易前先给你算风险、看余额变化。",
      en: "A multi-chain EVM wallet that previews risk and balance changes before you sign.",
    },
    detail: {
      zh: "主打多链体验的 EVM 钱包：打开 dApp 自动匹配对应网络，签名前会预演这笔交易并提示风险、预估签完之后的余额变化，还有跨链资产组合总览。对天天在多条 EVM 链之间来回跳的用户，它把传统单链钱包最烦人的几步都省掉了。",
      en: "An EVM wallet built for multi-chain life: it switches to the right network when you open a dApp, simulates each transaction before you sign — with risk flags and an estimate of your post-sign balance — and gives a cross-chain portfolio overview. For users hopping between EVM chains daily, it removes the most annoying steps of single-chain wallets.",
    },
    audience: {
      zh: "同时玩多条 EVM 链的 DeFi 用户。",
      en: "DeFi users active across multiple EVM chains.",
    },
    take: {
      zh: "签名前它会先告诉我这笔签完我还剩什么，这功能用过就回不去了。",
      en: "It shows what I'll have left after signing — once you use that, there's no going back.",
    },
  },
  {
    slug: "revoke",
    name: { zh: "Revoke.cash", en: "Revoke.cash" },
    url: "https://revoke.cash",
    tags: ["security"],
    type: "third-party",
    oneLiner: {
      zh: "授权管理工具：查清并收回你给过的代币授权。",
      en: "Allowance manager: see every token approval you've given — and revoke them.",
    },
    detail: {
      zh: "专门管理代币授权（allowance）的工具：连上钱包就能看到你对每个合约的历史授权额度，不再使用的可以一键撤销。很多盗币事件源于很久以前的旧授权被利用，定期来这里清理一遍，是成本最低的安全习惯。",
      en: "A focused tool for token allowances: connect a wallet to see every approval you have granted to each contract, and revoke the ones you no longer use in one click. Many drains exploit approvals granted long ago, so a periodic cleanup here is the cheapest security habit there is.",
    },
    audience: {
      zh: "经常与 DeFi 合约交互、给过大量授权的用户。",
      en: "DeFi users who have approved many contracts over time.",
    },
    take: {
      zh: "每个月来撤一遍不用的授权，几分钟的事，能躲掉一类大坑。",
      en: "I revoke unused approvals monthly — a few minutes that dodges a whole class of drains.",
    },
  },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t])
);

export function getTool(slug: string): ToolDef | undefined {
  return TOOL_MAP[slug];
}

export function toolsByTag(tagId: string): ToolDef[] {
  return TOOLS.filter((t) => t.tags.includes(tagId));
}

/** /go/[slug] 的跳转目标：sheet2word 站内可用 → 站内页；其余 → 官网 */
export function goTarget(tool: ToolDef): string {
  if (tool.embedded) return `/tool/${tool.slug}`;
  return tool.url;
}
