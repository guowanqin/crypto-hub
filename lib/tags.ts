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
    id: "qqq",
    name: { zh: "QQQ 定投", en: "QQQ DCA" },
    intro: {
      zh: "QQQ（Invesco QQQ Trust）跟踪纳斯达克 100，1999 年上市，是定投人群最常拿来「无脑月供」的标的之一。但定投不等于不用看位置：这一页把现价、距历史最高收盘的回撤、52 周水位、与 200 日均线的偏离自动拉齐，拼成一把口径全公开的估值温度刻度；再用上市以来的全史月线做定投回测——任选起始年月、每月金额，算清期末股数、年化、期间最大回撤，并和同一笔钱一次性买入对照。先说清：刻度是指标不是预测，回测是历史不是未来。",
      en: "QQQ (the Invesco QQQ Trust) tracks the Nasdaq-100 and has been listed since 1999 — a default monthly-DCA vehicle for many investors. But DCA does not mean never looking at where you are: this page pulls the price, the drawdown from the all-time high close, the 52-week position and the distance to the 200-day average into one fully documented valuation-temperature scale, and backtests monthly DCA on the full monthly history since listing — pick a start month and a monthly amount to get final shares, annualised return and the worst drawdown in the window, compared against investing the same total as a lump sum. Up front: the scale is a metric, not a forecast, and a backtest is history, not the future.",
    },
    seoDescription: {
      zh: "QQQ 定投回测计算器：现价、距 ATH 回撤、52 周水位、MA200 偏离自动调取，拼成口径公开的估值温度（偏冷/中性偏冷/中性偏热/偏热）；回测器用 1999 年上市以来全史月线与季度分红，任选起始年月与每月定投金额，算出期末股数、摊薄成本、年化（XIRR）、期间最大回撤与逐年汇总，并对比同额一次性买入。历史回测不代表未来，不构成投资建议。",
      en: "QQQ DCA backtest calculator: live price, drawdown from the ATH close, 52-week position and MA200 deviation fetched automatically and combined into a fully documented valuation temperature (cold / cool-neutral / warm-neutral / hot). The backtester runs the full monthly history since the 1999 listing plus quarterly dividends — pick any start month and monthly amount to get final shares, diluted cost, annualised return (XIRR), the window's max drawdown and a year-by-year table, compared with a lump sum of the same total. Backtests are history, not a forecast, and not investment advice.",
    },
    keywords: [
      "QQQ定投",
      "QQQ估值",
      "QQQ定投计算器",
      "定投回测",
      "定投计算器",
      "纳斯达克100定投",
      "纳指ETF",
      "QQQ PE",
      "QQQ回测",
      "纳指100",
      "QQQ DCA",
      "QQQ backtest",
      "Nasdaq-100 DCA",
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
    id: "ocr",
    name: { zh: "文字识别", en: "OCR" },
    intro: {
      zh: "把图片里的文字抠出来，不必把截图、证件、单据传到陌生服务器：这一页用 Tesseract 引擎在你自己的浏览器里做本地 OCR，中英混合识别、批量排队、按行对照原图高亮定位，识别完直接导出 TXT、Markdown 或 Word。先说清边界：第一次用要联网下载识别模型（几十 MB，之后缓存、离线可用）；印刷体和截图是它的主场，手写和复杂表格版面明显弱于云端大厂 OCR——胜在图片从头到尾不离开你的设备。",
      en: "Pull the text out of images without uploading screenshots, ID scans or receipts to a stranger's server: this page runs the Tesseract engine locally in your own browser — mixed Chinese/English recognition, batch queuing, line-by-line highlights mapped back onto the original image, and export to TXT, Markdown or Word. The boundaries up front: the first run downloads the recognition models (tens of MB, then cached for offline use); printed text and screenshots are its home turf, while handwriting and complex table layouts are noticeably weaker than big-cloud OCR — the trade-off is that your images never leave your device.",
    },
    seoDescription: {
      zh: "在线图片文字识别 OCR（浏览器本地识别、图片不上传）：批量导入最多 20 张图片，中英混合识别（简体中文 + 英文），识别结果按行展示、点击行可在原图上高亮定位、逐行可编辑纠错，导出 TXT、Markdown、Word 文档或按图打包 ZIP。首次使用需下载识别模型，之后离线可用；免费无需注册。",
      en: "Online OCR that runs locally in your browser — images are never uploaded: batch-import up to 20 images, mixed Simplified-Chinese + English recognition, results listed line by line with click-to-highlight定位 on the original image, per-line editing, and export to TXT, Markdown, a Word document or a per-image ZIP. The first run downloads the recognition models; after that it works offline. Free, no sign-up.",
    },
    keywords: [
      "图片文字识别",
      "在线OCR",
      "本地OCR",
      "图片转文字",
      "截图转文字",
      "OCR文字识别",
      "图片提取文字",
      "批量OCR",
      "免费OCR",
      "ocr online",
      "image to text",
      "tesseract ocr",
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
    id: "slang",
    name: { zh: "二手黑话", en: "Secondhand Slang" },
    intro: {
      zh: "在闲鱼、转转、小红书买二手，最怕看不懂卖家的标题：矿渣、全绿、克劳格、买包烟成色……每个词背后都是一套话术。这一页是站内可直接查的二手黑话词典：149 个主题词条、5,000+ 个黑话变体全文检索，可按分类与存活状态（现行可用 / 抽检限流 / 平台拦截）筛选，每条都带百科释义、卖家潜台词和买家避坑，还有拼音首字母缩写反查。先把定位说清：这是给买家解码避坑的词典，本站不提供把文案转成黑话的卖家转译。数据每日自动同步自 GitHub 上的 MIT 开源词库。",
      en: "Buying secondhand on Xianyu, Zhuanzhuan or Xiaohongshu means decoding seller titles first: every slang term, homophone and deliberate typo hides a pitch. This page is a built-in, searchable dictionary of that slang — 149 topic entries and 5,000+ variants, filterable by category and survival status (active / throttled / platform-blocked), each with a plain-language explanation, what the seller really means, and buyer warnings, plus a pinyin-initial abbreviation lookup. The positioning, up front: this is a buyer's decoding and pitfall-avoidance dictionary — there is no seller-side 'translate my listing into slang' tool here. Data syncs daily from an MIT-licensed open-source dictionary on GitHub.",
    },
    seoDescription: {
      zh: "二手黑话词典：闲鱼、转转、小红书黑话暗语在线查询——149 个主题词条、5,000+ 变体全文搜索，按分类与存活状态筛选，词条带百科释义、卖家潜台词与买家避坑，附拼音首字母缩写反查（cld、ga、xd 等）。数据每日自动同步自 MIT 开源词库，买家解码避坑专用。",
      en: "Secondhand slang dictionary: look up the slang and coded language of Xianyu, Zhuanzhuan and Xiaohongshu — 149 topic entries and 5,000+ variants, full-text search with category and survival-status filters, each entry carrying an explanation, the seller's real intent and buyer warnings, plus a pinyin-initial abbreviation lookup (cld, ga, xd…). Synced daily from an MIT-licensed open-source dictionary; built for buyers decoding listings, not for sellers writing them.",
    },
    keywords: [
      "闲鱼黑话",
      "闲鱼暗语",
      "二手黑话词典",
      "闲鱼避坑",
      "转转黑话",
      "二手交易暗语",
      "小红书黑话",
      "闲鱼暗语大全",
      "二手黑话查询",
      "拼音缩写反查",
      "secondhand slang",
      "xianyu slang dictionary",
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
  {
    id: "ip-check",
    name: { zh: "IP 检测", en: "IP Check" },
    intro: {
      zh: "你的出口 IP 在别人眼里是什么样，风控系统就是怎么看你的：这一页打开先自动自查——地理位置、ASN、运营商、网段一次拉齐，再按四条全公开的规则判定它是 IDC 机房、家宽住宅还是移动网络，给出逐项列明的风险分，原生 IP 只给参考判断不装确证。也可以查任意 IP 或域名，附 RDAP Whois；WebRTC 泄露、浏览器环境与延迟测试三节全在你的浏览器本地跑，不上传。先说清边界：风险分是公开信号的规则评分，不是商业风控库的欺诈分；浏览器测不了 ICMP Ping，延迟一节测的是 HTTP 往返。",
      en: "Your exit IP is exactly what every risk system sees. This page self-checks yours on open — geography, ASN, ISP and netblock pulled together — then applies four fully published rules to call it datacenter, residential or mobile, with an itemised risk score; native-IP status is a reference judgement, never a fake certification. You can also look up any IP or domain, with RDAP whois attached, and the WebRTC-leak, browser-environment and latency sections all run locally in your browser. The limits up front: the score is a public-signal rule score, not a commercial fraud score; a browser cannot send ICMP pings, so the latency section measures HTTP round-trips.",
    },
    seoDescription: {
      zh: "IP 风险检测与网络环境自查：打开自动查出口 IP，可查任意 IP/域名的地理位置、ASN、运营商、CIDR 与 RDAP Whois，按公开规则判定 IDC 机房/家宽住宅/移动网络、给出逐项证据的风险分与原生 IP 参考判断；附 WebRTC 泄露检测、浏览器环境检测、HTTP 延迟测试（本地完成不上传）。免费、无需注册。",
      en: "IP risk check and network self-audit: your exit IP is checked on open; look up any IP or domain for geography, ASN, ISP, CIDR and RDAP whois, with a datacenter/residential/mobile verdict, an itemised rule-based risk score and a native-IP reference judgement. Includes a WebRTC leak check, browser-environment readout and HTTP latency test — all local, nothing uploaded. Free, no sign-up.",
    },
    keywords: [
      "IP检测",
      "IP风险检测",
      "IP查询",
      "原生IP",
      "原生IP检测",
      "机房IP",
      "家宽IP",
      "WebRTC泄露检测",
      "Whois查询",
      "IP地址查询",
      "IP归属地",
      "代理IP检测",
      "IP check",
      "IP risk score",
      "native IP",
      "WebRTC leak test",
    ],
  },
  {
    id: "poetry",
    name: { zh: "古籍诗词", en: "Classical Poetry" },
    intro: {
      zh: "查古诗词、背典籍、玩成语，不用在广告和弹窗里翻页：本站收了唐诗三百首、宋词三百首、诗经、楚辞、论语五部常用典籍做全文检索和整篇阅读，再配一部 3 万多条的成语词典（拼音、释义、出处齐全）和成语接龙、猜诗词两个小游戏。定位老实交代：这是常用精选版，不是 85 万首的全量古籍库——查全量古籍、中医古籍和全文检索，去同标签的文籍典册原站。数据取自 GitHub 开源语料，原文都是公版古籍。",
      en: "Classical poems, idioms and word games without the ads and popups: this shelf carries five everyday classics — the 300 Tang Poems, 300 Song Ci, the Book of Songs, the Verses of Chu and the Analects — with full-text search and whole-text reading, plus a 30,000-entry idiom dictionary (pinyin, meaning, source) and two mini-games, idiom chain and guess-the-next-line. The honest positioning: this is a curated edition, not an 850,000-poem full library — for the complete corpus, medical classics and full-text search, use the Wendian entry on this same shelf. Data comes from open GitHub corpora; all texts are public-domain classics.",
    },
    seoDescription: {
      zh: "古诗词查询精选版：唐诗三百首、宋词三百首、诗经、楚辞、论语共 1,036 篇全文检索与整篇阅读，30,895 条成语词典（拼音、释义、出处），成语接龙（同字/同音）与猜诗词小游戏，全部站内可用。数据来自 GitHub 开源语料 chinese-poetry、chinese-xinhua（MIT），原文为公版古籍；全量古籍与中医古籍请查文籍典册。",
      en: "Curated classical-poetry lookup: full-text search and reading across 1,036 texts — the 300 Tang Poems, 300 Song Ci, the Book of Songs, the Verses of Chu and the Analects — plus a 30,895-entry idiom dictionary (pinyin, meaning, source) and idiom-chain and guess-the-line games, all usable in-site. Data from the MIT-licensed chinese-poetry and chinese-xinhua corpora on GitHub; texts are public-domain classics. For the full corpus and medical classics, see Wendian.",
    },
    keywords: [
      "古诗词",
      "古诗词查询",
      "唐诗三百首",
      "宋词三百首",
      "宋词精选",
      "诗经",
      "楚辞",
      "论语",
      "成语词典",
      "成语大全",
      "成语接龙",
      "猜诗词",
      "文籍典册",
      "tang poems",
      "song ci",
      "book of songs",
      "chinese idioms",
    ],
  },
];

export const TAG_MAP: Record<string, TagDef> = Object.fromEntries(
  TAGS.map((t) => [t.id, t])
);

export function getTag(id: string): TagDef | undefined {
  return TAG_MAP[id];
}
