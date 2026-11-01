import type { Lang } from "./site";

export interface TagDef {
  id: string;
  name: Record<Lang, string>;
  // 标签落地页的一段介绍（页面正文，中英）
  intro: Record<Lang, string>;
  // SEO：独立 meta description（中英）
  seoDescription: Record<Lang, string>;
  keywords: string[];
}

export const TAGS: TagDef[] = [
  {
    id: "market",
    name: { zh: "行情数据", en: "Market Data" },
    intro: {
      zh: "查价格、看市值、盯新池子——行情是每个币圈人每天打开的第一类工具。这一类里既有全站式的行情总站，也有 DEX 实时终端，还有本站自研的财库股含币量计算器。",
      en: "Prices, market caps and fresh pools — market data is the first thing every crypto user opens each day. This shelf mixes all-in-one market boards, real-time DEX terminals, and our own treasury-stock per-share calculator.",
    },
    seoDescription: {
      zh: "行情数据工具收录：CoinGecko、CoinMarketCap 查币价与市值，DexScreener、GeckoTerminal 看 DEX 新池子与流动性，PerShare 算 BNC、PURR 财库股每股含币量——本站实测介绍，附适合人群与上手短评。",
      en: "Market data tools, field-tested: CoinGecko and CoinMarketCap for prices and market caps, DexScreener and GeckoTerminal for fresh DEX pools and liquidity, PerShare for BNC & PURR per-share coin content — with original intros and who each tool is for.",
    },
    keywords: [
      "行情数据工具",
      "查币价",
      "币圈行情网站",
      "DEX行情",
      "新币发现",
      "crypto market data tools",
      "crypto price tracker",
    ],
  },
  {
    id: "onchain",
    name: { zh: "链上分析", en: "On-chain Analysis" },
    intro: {
      zh: "消息会骗人，链上数据不会。这一类工具帮你查数据、盯巨鲸、看筹码分布、核对每一笔交易哈希——把叙事拆开，验证它到底有没有真金白银支撑。",
      en: "Narratives can lie; on-chain data can't. These tools help you query the chain, track whales, inspect holder distribution and verify every transaction hash — open up any story and check whether real money backs it.",
    },
    seoDescription: {
      zh: "链上分析工具收录：Dune 用 SQL 查链上数据与社区面板，Arkham 看实体标签与巨鲸动向，Bubblemaps 气泡图查筹码集中度，Etherscan 核对交易与合约——本站实测介绍，附适合人群与短评。",
      en: "On-chain analysis tools, field-tested: Dune for SQL queries and community dashboards, Arkham for entity labels and whale watching, Bubblemaps for holder concentration, Etherscan for verifying transactions and contracts.",
    },
    keywords: [
      "链上分析工具",
      "链上数据查询",
      "巨鲸追踪",
      "筹码分布",
      "区块浏览器",
      "on-chain analytics tools",
      "whale tracker",
    ],
  },
  {
    id: "defi",
    name: { zh: "DeFi 数据", en: "DeFi Data" },
    intro: {
      zh: "判断一个协议、一条链值不值得碰，先看它锁了多少真金白银。这一类收录 DeFi 世界的 TVL 与收入数据中枢，口径透明、免费无广告。",
      en: "Before touching a protocol or a chain, check how much real money it holds. This shelf holds the DeFi world's TVL and revenue data hub — transparent methodology, free, no ads.",
    },
    seoDescription: {
      zh: "DeFi 数据工具收录：DeFiLlama——全链 TVL、协议手续费与收入、稳定币市值的免费数据中枢，判断协议与公链基本面的主流参考。本站实测介绍，附适合人群与短评。",
      en: "DeFi data tools, field-tested: DeFiLlama — the free data hub for cross-chain TVL, protocol fees and revenue, and stablecoin market caps; the default reference for protocol and chain fundamentals.",
    },
    keywords: [
      "DeFi数据",
      "TVL查询",
      "协议收入排名",
      "defi analytics",
      "TVL tracker",
    ],
  },
  {
    id: "wallet",
    name: { zh: "钱包", en: "Wallets" },
    intro: {
      zh: "钱包是币圈人的日常入口。这一类只收真正改善多链体验的钱包：自动切链、签名前预演风险、资产总览，一次把安全感和使用感都拉满。",
      en: "The wallet is the daily front door to crypto. This shelf only lists wallets that genuinely improve multi-chain life: automatic network switching, pre-sign risk previews and a clear portfolio overview.",
    },
    seoDescription: {
      zh: "钱包工具收录：Rabby Wallet——多链 EVM 钱包，自动切链，签名前预演交易风险与余额变化，附资产组合总览。本站实测介绍，附适合人群与短评。",
      en: "Wallet tools, field-tested: Rabby Wallet — a multi-chain EVM wallet with automatic network switching, pre-sign transaction simulation with risk flags, and a portfolio overview.",
    },
    keywords: ["币圈钱包", "EVM钱包", "多链钱包", "crypto wallet", "web3 wallet"],
  },
  {
    id: "security",
    name: { zh: "安全工具", en: "Security" },
    intro: {
      zh: "币圈亏钱最冤的方式，是被早就给出去的授权掏空钱包。这一类收录保命工具：定期检查并撤销不用的代币授权，几分钟买一份安心。",
      en: "The dumbest way to lose money in crypto is getting drained through an approval you granted ages ago. This shelf holds the lifesavers: check and revoke stale token allowances — a few minutes for real peace of mind.",
    },
    seoDescription: {
      zh: "安全工具收录：Revoke.cash——一站查看并撤销你对各合约的代币授权（allowance），防范旧授权被利用盗币。本站实测介绍，附适合人群与短评。",
      en: "Security tools, field-tested: Revoke.cash — see every token allowance you've granted and revoke the unused ones in one click, guarding against stale-approval drains.",
    },
    keywords: [
      "代币授权撤销",
      "钱包安全工具",
      "撤销授权",
      "revoke token approvals",
      "crypto security tools",
    ],
  },
  {
    id: "office",
    name: { zh: "办公效率", en: "Office & Productivity" },
    intro: {
      zh: "币圈之外也要办公。这一类放本站自研的效率工具：第一个就是站内可直接用的 Excel 批量生成 Word——模板加表格，一行数据一份文档，不用离开本站就能生成下载。",
      en: "Even crypto people do paperwork. This shelf holds our own productivity tools, starting with the Excel-to-Word batch generator that runs right here on this site — template plus spreadsheet, one document per row, no leaving the page.",
    },
    seoDescription: {
      zh: "办公效率工具收录：Excel 批量生成 Word（Sheet2Word）——本站自研、站内可直接使用：上传 Word 模板与 Excel 表格，按行批量生成文档打包下载，本地处理不上传，免费无行数限制、免注册。",
      en: "Office tools, field-tested: Excel to Word Batch Generator (Sheet2Word) — built by us and usable right on this site: upload a Word template and an Excel sheet, generate one document per row and download the ZIP; local processing, free, no row limit, no sign-up.",
    },
    keywords: [
      "办公效率工具",
      "Excel批量生成Word",
      "在线邮件合并",
      "productivity tools",
      "generate word documents from excel",
    ],
  },
];

export const TAG_MAP: Record<string, TagDef> = Object.fromEntries(
  TAGS.map((t) => [t.id, t])
);

export function getTag(id: string): TagDef | undefined {
  return TAG_MAP[id];
}
