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
      zh: "查价格、看市值、盯新池子——行情是每个币圈人每天打开的第一类工具。这一类里既有全站式的行情总站，也有 DEX 实时终端，还有站内可直接用的财库股含币量计算器。",
      en: "Prices, market caps and fresh pools — market data is the first thing every crypto user opens each day. This shelf mixes all-in-one market boards, real-time DEX terminals, and a treasury-stock per-share calculator that runs right here on this site.",
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
    id: "burn",
    name: { zh: "销毁数据", en: "Burn Data" },
    intro: {
      zh: "代币销毁是真金白银的通缩：每一笔都记在链上，谁都能验。这一页直接读以太坊主网 UNI 合约，追踪 Uniswap 协议费驱动的 UNI 销毁——累计销毁了多少、占供应多少、最近又烧了多少笔，一目了然。",
      en: "A token burn is deflation you can verify: every burn is written on-chain for anyone to check. This page reads the UNI contract on Ethereum mainnet directly, tracking the protocol-fee-driven UNI burn — how much has been burned in total, what share of supply that is, and the latest burn records.",
    },
    seoDescription: {
      zh: "UNI 销毁数据实时追踪：直接读取以太坊主网 UNI 合约，统计 UNI 累计销毁量、销毁占初始供应比例、有效供应、近 24 小时与近 30 天销毁量、年化销毁量与年化通缩率，并逐笔列出最近销毁记录（附交易哈希）。",
      en: "Live UNI burn tracker reading the UNI contract on Ethereum mainnet: total UNI burned, share of the initial supply destroyed, effective supply, 24h and 30d burn totals, annualized burn and deflation rate, plus the latest burn records with transaction hashes.",
    },
    keywords: [
      "UNI销毁",
      "UNI销毁数据",
      "Uniswap销毁",
      "UNI通缩",
      "UNI burn",
      "Uniswap burn tracker",
      "代币销毁数据",
    ],
  },
  {
    id: "btc-bottom",
    name: { zh: "BTC 抄底", en: "BTC Bottom Fishing" },
    intro: {
      zh: "比特币的四年减半周期里，熊底和牛顶在区块高度上大致等距。这一页把周期锚点全部换算成区块：当前周期位置、距熊底还剩多少块多少天、五档分批建仓触发位——数据实时读链，位置一目了然。模型推演仅供参考，不构成投资建议。",
      en: "Across Bitcoin's four-year halving cycles, bear bottoms and bull tops sit at roughly even block-height distances. This page converts the cycle anchors into blocks: your current cycle position, how many blocks and days remain to the projected bottom, and five staged entry triggers — read live from the chain. A model projection for reference only, not investment advice.",
    },
    seoDescription: {
      zh: "BTC 抄底倒计时：按四年减半周期与实时区块高度推演比特币周期位置——当前周期位置、熊市进度、距本轮熊底的倒计时（目标区块 971,250）、第 5 次减半与下轮牛顶的预计日期，以及 0.20 / 0.15 / 0.10 / 0.05 / 0.02 五档分批建仓触发位。数据源为实时链上区块高度。",
      en: "BTC bottom-fishing countdown: Bitcoin's cycle position projected from the four-year halving cycle and the live block height — current position, bear-market progress, a countdown to this cycle's projected bottom (target block 971,250), estimated dates for the 5th halving and the next bull top, and five staged entry triggers at positions 0.20 / 0.15 / 0.10 / 0.05 / 0.02. Data source: live on-chain block height.",
    },
    keywords: [
      "BTC抄底",
      "比特币抄底",
      "比特币熊底",
      "BTC抄底倒计时",
      "减半周期",
      "比特币周期位置",
      "BTC bottom fishing",
      "bitcoin cycle bottom",
      "halving cycle",
    ],
  },
  {
    id: "crcl",
    name: { zh: "CRCL 估值", en: "CRCL Valuation" },
    intro: {
      zh: "Circle（CRCL）值多少钱、什么时候该买，不靠感觉靠规则。这一页把参考看板的「买入信号分」模型（v6）做成自动取数的面板：股价与 RSI 实时拉取，USDC 供应与市占率每日更新，估值层、恐慌层、基本面层三层打分再乘否决系数——分数是纪律工具，不是预测，更不构成投资建议。",
      en: "What Circle (CRCL) is worth, and when to buy, decided by rules instead of feelings. This page turns the reference board's Buy Signal Score model (v6) into an auto-updating panel: price and RSI fetched live, USDC supply and market share refreshed daily, three scoring layers — valuation, panic, fundamentals — combined and adjusted by a veto multiplier. The score is a discipline tool, not a prediction, and not investment advice.",
    },
    seoDescription: {
      zh: "CRCL 买入估值面板：按买入信号分模型（v6）实时计算 Circle（CRCL）的估值与买入信号——估值层看 P/S、恐慌层看 RSI14、基本面层看 USDC 供应 180 天变化，黑天鹅否决只看 USDC 市占率；附流通市值、FDV、P/S(TTM)、市值/调整后EBITDA、距历史新高与上市低点，以及 USDC 基本面与营收利润数据。股价、USDC 数据自动调取。",
      en: "CRCL buy & valuation panel: Circle's (CRCL) valuation and buy signal computed live under the Buy Signal Score model (v6) — a valuation layer on P/S, a panic layer on RSI14, a fundamentals layer on USDC supply's 180-day change, and a black-swan veto keyed only to USDC market share. Includes market cap, FDV, P/S (TTM), market cap / adjusted EBITDA, distance from the all-time high and post-IPO low, plus USDC fundamentals and revenue & profit data. Price and USDC data are fetched automatically.",
    },
    keywords: [
      "CRCL",
      "Circle",
      "CRCL估值",
      "CRCL买入信号分",
      "Circle股票",
      "USDC",
      "USDC市占率",
      "CRCL stock",
      "Circle valuation",
      "USDC supply",
    ],
  },
  {
    id: "qqqi",
    name: { zh: "QQQI 收息定投", en: "QQQI Income DCA" },
    intro: {
      zh: "QQQI（NEOS Nasdaq-100 High Income ETF）靠卖出纳指 100 备兑期权换月度派息，是「攒股收息」人群的热门标的。这一页把它的现价、派息历史与分红率自动拉齐，再配一个逐月模拟的定投计算器：每月投多少、投几年、分红再投入开不开，期末能攒多少股、每月收多少息，一次算清。先把口径说在前面：它 2024 年 1 月才上市、历史短，派息含期权金与可能的资本返还（ROC）成分，分红率不等于总回报。",
      en: "QQQI (the NEOS Nasdaq-100 High Income ETF) sells Nasdaq-100 covered calls to fund a monthly payout, making it a favourite of share-accumulating income investors. This page pulls its price, distribution history and distribution rate together automatically, with a month-by-month DCA simulator: how much per month, for how many years, reinvesting or not — and what that builds to in shares and monthly income. The caveats up front: it only listed in January 2024, so its history is short; its payouts include option premium and possibly return of capital (ROC); and a distribution rate is not a total return.",
    },
    seoDescription: {
      zh: "QQQI 攒股收息定投计算器：现价、52 周水位、最近派息、TTM 派息合计与当前分红率自动调取，最近 24 次派息历史、分红率自身历史分位估值参考一页看齐；定投模拟器按月模拟定投金额、年限、假设分红率与股价增速、分红再投入，算出期末股数与月收息。QQQI 为 NEOS 月度派息 ETF，派息含期权金与可能的 ROC 成分，不构成投资建议。",
      en: "QQQI share-accumulation income DCA calculator: live price, 52-week position, latest payout, TTM distributions and the current distribution rate fetched automatically, with the last 24 payouts and a valuation reference from the rate's own-history percentile. The simulator runs monthly contributions, years, an assumed distribution rate and price growth, with or without reinvestment, to final shares and monthly income. QQQI is a NEOS monthly-payout ETF; payouts include option premium and possible ROC. Not investment advice.",
    },
    keywords: [
      "QQQI",
      "QQQI分红",
      "QQQI派息",
      "QQQI股息率",
      "攒股收息",
      "收息定投",
      "QQQI定投计算器",
      "NEOS QQQI",
      "月度派息ETF",
      "备兑期权ETF",
      "QQQI dividend",
      "QQQI distribution rate",
    ],
  },
  {
    id: "filetime",
    name: { zh: "文件时间", en: "File Time" },
    intro: {
      zh: "相机时钟设错、照片传错日期、补打卡差几个小时——照片的时间写在两个地方：文件系统的创建/修改时间，和照片内嵌的 EXIF 时间。这一页的站内工具免费修改照片的 EXIF 拍摄时间、创建时间与修改时间（批量统一设置、整体平移、按张递增），相册排序与打卡补传认的正是它；要直接改电脑里文件的系统时间，同标签还收录了桌面版 NewFileTime。",
      en: "A photo's date lives in two places: the file system's created/modified timestamps, and the EXIF times embedded in the photo itself. The built-in tool on this page edits a photo's EXIF date-taken, digitized and modified times in bulk — set one time for all, shift everything by an offset, or step photo by photo — which is exactly what album sorting and attendance back-fills read. To change the system timestamps of files on your disk instead, the desktop NewFileTime is listed under this tag too.",
    },
    seoDescription: {
      zh: "照片/文件时间修改工具（网页版）：批量修改 JPEG 照片内嵌的 EXIF 拍摄时间、创建时间与修改时间，支持统一设置、整体平移与按张递增三种模式，改前改后逐张对照，单张或 ZIP 打包下载；全程浏览器本地处理，文件不上传。另收录桌面版 NewFileTime，可直接修改本地文件的系统创建/修改/访问时间。",
      en: "Photo & file time editor (web edition): batch-edit the EXIF date taken, digitized and modified times embedded in JPEG photos — set a single time, shift by an offset, or step photo by photo — with a before/after check per photo and single or ZIP downloads. Everything runs locally in your browser; nothing is uploaded. Also lists the desktop NewFileTime for changing system created/modified/accessed timestamps of local files.",
    },
    keywords: [
      "文件时间修改",
      "照片时间修改",
      "EXIF时间修改",
      "修改照片拍摄时间",
      "NewFileTime网页版",
      "文件创建时间修改",
      "照片日期修改",
      "EXIF date editor",
      "photo time changer",
      "NewFileTime online",
    ],
  },
  {
    id: "pdf",
    name: { zh: "PDF 工具", en: "PDF Tools" },
    intro: {
      zh: "处理 PDF 不必把文件传到陌生网站：合并、拆分、页面管理、水印、页码、骑缝章、批注、图片与 PDF 互转，全部在这个页面本地完成。这一页的站内工具箱参考信创 PDF 工具箱的功能集整理而成，纯前端、离线可用，合同、证件这类敏感文件从头到尾不离开你的电脑。",
      en: "You don't have to upload a PDF to some stranger's server to work on it: merge, split, page management, watermarks, page numbers, cross-page seals, annotations and image↔PDF conversion all happen locally on this page. The built-in toolbox follows the feature set of the Xinchuang PDF toolbox — pure front-end, works offline, and sensitive files like contracts and ID scans never leave your computer.",
    },
    seoDescription: {
      zh: "在线 PDF 工具箱（纯前端本地处理）：PDF 合并、按页码拆分、页面删除/重排/旋转/插入空白页、文字水印、页码添加、骑缝章、文字批注、图片转 PDF、PDF 转图片。文件不上传服务器，离线可用，免费无需注册。",
      en: "Online PDF toolbox that runs entirely in your browser: merge PDFs, split by page ranges, delete/reorder/rotate pages, insert blank pages, add text watermarks, page numbers, cross-page seals (perforation stamps) and text annotations, convert images to PDF and PDF pages to images. Files are never uploaded; works offline, free, no sign-up.",
    },
    keywords: [
      "PDF工具箱",
      "PDF合并",
      "PDF拆分",
      "PDF水印",
      "PDF页码",
      "骑缝章",
      "PDF页面管理",
      "图片转PDF",
      "PDF转图片",
      "离线PDF工具",
      "信创PDF工具箱",
      "PDF工具在线",
      "pdf toolbox",
      "merge pdf",
      "split pdf",
      "pdf watermark",
    ],
  },
  {
    id: "video",
    name: { zh: "影音娱乐", en: "Video & Entertainment" },
    intro: {
      zh: "想在大屏上看短剧、追剧，不用只盯着手机：这里收录能在电脑、电视和盒子上用的影音娱乐工具与客户端，看清来源与版本状态再下载安装。",
      en: "Short dramas and shows don't have to live on a phone screen: this section collects video and entertainment apps for computers, TVs and TV boxes — check the source and build status before you install anything.",
    },
    seoDescription: {
      zh: "影音娱乐工具收录：红果短剧第三方桌面客户端（Windows 正式版、Mac M 系列测试版、Android TV 版），电脑与电视大屏看短剧，找剧、收藏、本机续播与老板键，附来源核对与安全提醒。",
      en: "Video & entertainment picks: the third-party Hongguo short-drama desktop client (Windows release, Mac Apple-Silicon beta, Android TV beta) for watching short dramas on PC and TV — search, favourites, on-device resume and a boss key, with source checks and safety notes.",
    },
    keywords: [
      "红果短剧",
      "红果短剧桌面版",
      "红果短剧电脑版",
      "红果短剧电视版",
      "短剧客户端",
      "短剧桌面版",
      "免费短剧",
      "影音娱乐工具",
      "hongguo",
      "short drama app",
    ],
  },
  {
    id: "office",
    name: { zh: "办公效率", en: "Office & Productivity" },
    intro: {
      zh: "币圈之外也要办公。这一类放站内可直接用的效率工具：第一个就是 Excel 批量生成 Word——模板加表格，一行数据一份文档，不用离开本站就能生成下载。",
      en: "Even crypto people do paperwork. This shelf holds productivity tools that run right here on this site, starting with the Excel-to-Word batch generator — template plus spreadsheet, one document per row, no leaving the page.",
    },
    seoDescription: {
      zh: "办公效率工具收录：Excel 批量生成 Word（Sheet2Word）——站内可直接使用：上传 Word 模板与 Excel 表格，按行批量生成文档打包下载，本地处理不上传，免费无行数限制、免注册。",
      en: "Office tools, field-tested: Excel to Word Batch Generator (Sheet2Word) — usable right on this site: upload a Word template and an Excel sheet, generate one document per row and download the ZIP; local processing, free, no row limit, no sign-up.",
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
