import type { Lang } from "./site";

export type ToolType = "own" | "third-party";

export interface ToolDef {
  slug: string;
  name: Record<Lang, string>;
  /** 第三方官网 / 本站工具官网；站内可用工具（sheet2word）为本站内页，url 指向其独立站仅作备用入口 */
  url: string;
  tags: string[];
  type: ToolType;
  /** 是否在本站内嵌可直接使用（sheet2word、pershare） */
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
    embedded: true,
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
    slug: "imagebox",
    name: { zh: "图片工具箱", en: "Image Toolbox" },
    url: "https://18btc.cc/tool/imagebox",
    tags: ["office"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "十个常用图片小工具装一页：批量压缩、改尺寸、加水印、九宫格切图、拼图、长图拼接、二维码、EXIF 清除、打码和图片转 GIF，全部本地处理。",
      en: "Ten everyday image utilities on one page — batch compression, resizing, watermarking, grid slicing, collage, long-image stitching, QR codes, EXIF scrubbing, mosaic redaction and image-to-GIF — all processed locally.",
    },
    detail: {
      zh: "发朋友圈、做小红书封面、传证件图之前，总有几个小活要干：图太大传不上去、九宫格要按顺序切好、拼图留白不均匀、截图里有手机号要打码、证件图带着 GPS 定位不敢直接发。这个工具箱把十个高频小工具放在一页：批量压缩（质量可调，JPG/PNG/WebP 互转）、改尺寸、文字水印、九宫格切图（2–4 行列可选，切完带序号打包）、网格拼图、长图拼接、二维码生成、EXIF 查看与一键清除、拖框打马赛克、多图合成 GIF。如实说明：所有处理都只在你自己的浏览器里用 Canvas 完成，图片不上传任何服务器，不用注册、没有水印、没有次数限制；关掉页面就什么都不留。",
      en: "Before posting to social media or uploading an ID photo there is always some small chore: the file is too big, a nine-grid needs slicing in order, a collage has uneven gaps, a screenshot shows a phone number, an ID photo carries GPS coordinates. This toolbox puts ten frequent jobs on one page: batch compression (adjustable quality, JPG/PNG/WebP conversion), resizing, text watermarking, grid slicing (2–4 rows/columns, numbered ZIP export), grid collages, long-image stitching, QR code generation, EXIF viewing and one-click scrubbing, drag-to-select mosaic redaction, and multi-image GIF creation. Stated plainly: everything runs only in your own browser via Canvas — images are never uploaded to any server, there is no sign-up, no watermark and no usage limit, and closing the page leaves nothing behind.",
    },
    audience: {
      zh: "经常发朋友圈/小红书要切九宫格拼图的内容创作者，以及随手要压缩、改尺寸、给图片打码去隐私的普通用户。",
      en: "Creators who slice nine-grids and build collages for social posts, plus anyone who casually needs to compress, resize, redact or de-metadata an image.",
    },
    take: {
      zh: "这类小工具网上很多，但大多要你先把图传上它的服务器。这个是真本地：本站实测断网也能用，处理证件图和截图时这点比什么都重要。",
      en: "Plenty of sites offer these little tools, but most make you upload your images to their servers first. This one is genuinely local — we tested it offline — and that matters most for ID photos and screenshots.",
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
  {
    slug: "defiburn",
    name: { zh: "DeFiBurn", en: "DeFiBurn" },
    url: "https://www.defiburn.com",
    tags: ["burn"],
    type: "third-party",
    oneLiner: {
      zh: "UNI 销毁数据终端：逐笔追踪 Uniswap 协议费销毁与各链销毁分布。",
      en: "A UNI burn data terminal: tracks Uniswap protocol-fee burns record by record, with per-chain breakdowns.",
    },
    detail: {
      zh: "专盯 UNI 销毁的数据站：把 Uniswap 各链协议费触发的销毁逐笔采集入账，给出每日销毁量、7/30 天合计、年化销毁速率与销毁构成（协议费销毁 vs 一次性金库销毁），并按链拆分销毁来源与费用开关状态。本站「销毁数据」页的核心指标与它的累计口径互相印证；想看更细的多链分布和历史趋势时，来这里深挖。",
      en: "A data site devoted to the UNI burn: it records every protocol-fee burn triggered across Uniswap's chains, with daily totals, 7/30-day sums, annualized burn rates and burn composition (protocol-fee burns vs the one-off treasury burn), plus per-chain sources and fee-switch status. The headline figures on our Burn Data page cross-check against its totals; come here for the deeper per-chain breakdowns and history.",
    },
    audience: {
      zh: "持有或观望 UNI、想量化其通缩节奏的投资者与研究者。",
      en: "UNI holders and researchers who want to quantify its deflation pace.",
    },
    take: {
      zh: "看 UNI 通缩别听人转述，来这里看它逐笔数出来的账。",
      en: "Skip the second-hand takes on UNI deflation — this is the ledger, counted record by record.",
    },
  },
  {
    slug: "filee",
    name: { zh: "Filee 文件格式转换器", en: "Filee File Converter" },
    url: "https://filee.sh",
    tags: ["office"],
    type: "third-party",
    oneLiner: {
      zh: "在电脑本地拖一下就转格式的免费开源转换器：255 种格式，文件不上传，不用装 Office。",
      en: "A free, open-source converter that works locally on your computer: drag a file, drop it on a format — 255 formats, no uploads, no Office needed.",
    },
    detail: {
      zh: "Filee 是装在电脑上的本地文件转换器，交互很特别：在资源管理器里选中文件，按住 Ctrl 拖动，光标旁会弹出一个格式圆环，把文件放到目标格式上松手，新文件就生成在原文件旁边。图片、PDF、Word/Excel/PowerPoint、视频、音频、电子书、压缩包等 18 大类共 255 种格式互转，还带裁剪、旋转、合并 PDF、打包 ZIP 等小工具；转换全部在本机完成，不上传、无需注册、无广告，批量转换不限制数量。转 Office 文档用它内置的引擎，不需要安装 Microsoft Office。Windows 与 Linux 为正式版，另有命令行和文件夹自动转换，适合要批量处理文件又不想把文件传上云的人。",
      en: "Filee is a desktop file converter with an unusual gesture-driven interface: select files in your file manager, hold Ctrl and drag, and a ring of target formats appears at your cursor — drop the files on a format and the converted copies land next to the originals. It converts across 255 formats in 18 families (images, PDF, Word/Excel/PowerPoint, video, audio, ebooks, archives and more), with extras like crop, rotate, PDF merge and ZIP packing. Everything runs on your own machine: no uploads, no sign-up, no ads, and batch conversion is unlimited. Office documents convert with its built-in engines, no Microsoft Office install required. Windows and Linux are stable releases, and there is a CLI plus watch-folder automation for heavier workflows.",
    },
    audience: {
      zh: "经常要转格式、又介意把文件上传到在线转换站的人；批量处理图片、文档、音视频的办公与自媒体用户。",
      en: "Anyone who converts files often but dislikes uploading them to online converters; office and creator workflows with lots of images, documents or media.",
    },
    take: {
      zh: "实测提醒：它是在电脑上装软件、不是网页工具；macOS 目前还是预览版（未公证，首次打开要手动放行），Linux 的拖动手势需要 X11 会话，视频等少数格式要按提示在应用内下载一次可选引擎。能接受这三点的话，「本地转换、不上传」这件事它做得比在线站干净。",
      en: "Hands-on notes: it is a desktop app, not a web tool; the macOS build is still a preview (not notarized, needs a one-time manual allow), the drag gesture on Linux needs an X11 session, and a few formats (video etc.) ask you to download an optional engine once inside the app. Accept those, and its fully local, no-upload conversion is cleaner than any online converter.",
    },
  },
  {
    slug: "btc-cycle",
    name: { zh: "BTC 抄底倒计时", en: "BTC Bottom Countdown" },
    url: "https://18btc.cc/tag/btc-bottom",
    tags: ["btc-bottom"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "按四年减半周期与实时区块高度推演 BTC 周期位置：现在离熊底还有多远、五档分批建仓点位在哪。",
      en: "Tracks BTC's position in the four-year halving cycle from the live block height: how far the bear-market bottom is, and where the five staged buying levels sit.",
    },
    detail: {
      zh: "把减半周期模型做成实时看板：锚点全部由减半区块推导（牛顶、熊底、第 5 次减半位置 0.5、下轮牛顶），用实时链上区块高度算出当前周期位置（0=熊底、1=牛顶）、熊市进度、距熊底的倒计时，以及按位置 0.20/0.15/0.10/0.05/0.02 倒推的五档分批建仓日期。越过熊底后自动切换为回升段视图与距下次减半倒计时。页面上有完整的口径说明，这是周期模型推演、不是价格预测，更不构成投资建议。",
      en: "A live dashboard for the halving-cycle model: every anchor is derived from halving blocks (cycle top, bear bottom, the fifth halving at position 0.5, next top), and the live on-chain block height yields the current cycle position (0 = bear bottom, 1 = bull top), bear-market progress, a countdown to the bottom, and five staged buying levels back-computed from positions 0.20/0.15/0.10/0.05/0.02. Past the bottom it switches to a recovery view with a countdown to the next halving. The methodology is spelled out on the page; it is a cycle model, not a price prediction, and not investment advice.",
    },
    audience: {
      zh: "按四年周期节奏做 BTC 中长线分批布局的投资者。",
      en: "Medium- to long-term BTC investors who stage entries around the four-year cycle.",
    },
    take: {
      zh: "抄底别凭感觉数日子，这个表把「还有多远、哪天到哪一档」算给你看；记住它是周期推演，仓位节奏还得自己拿捏。",
      en: "Don't count the days to the bottom by feel — this board computes how far is left and when each level arrives. It is a cycle projection, though; position sizing is still on you.",
    },
  },
  {
    slug: "crcl-panel",
    name: { zh: "CRCL 买入估值面板", en: "CRCL Buy & Valuation Panel" },
    url: "https://18btc.cc/tag/crcl",
    tags: ["crcl"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "按买入信号分模型（v6）实时算 Circle（CRCL）的估值与买入信号：P/S、RSI、USDC 供应与市占率自动取数。",
      en: "Circle's (CRCL) valuation and buy signal, computed live under the Buy Signal Score model (v6): P/S, RSI, USDC supply and market share fetched automatically.",
    },
    detail: {
      zh: "把「什么时候该买 CRCL」写成不受情绪影响的规则：总分 =（估值层 0–80 + 恐慌层 0–20 + 基本面层 ±10）× 1.3 × 否决乘数，封顶 130。估值层看实时 P/S，恐慌层看 RSI14，基本面层看 USDC 供应量 180 天变化；黑天鹅否决只看 USDC 市占率——份额被对手抢走才打折，全市场一起缩水不触发。面板同时给出流通市值、FDV、P/S(TTM)、市值/调整后 EBITDA、距历史新高与上市低点，以及 USDC 基本面仪表与营收利润表。股价与日线来自 Yahoo Finance，USDC 数据来自 DeFiLlama，股本与利润表为标注了来源与截至日期的可编辑配置。分数是纪律工具，不是预测，不构成投资建议。",
      en: "It turns 'when should I buy CRCL?' into emotion-free rules: total = (valuation layer 0–80 + panic layer 0–20 + fundamentals layer ±10) × 1.3 × veto multiplier, capped at 130. The valuation layer reads live P/S, the panic layer RSI14, the fundamentals layer USDC supply's 180-day change; the black-swan veto watches USDC market share only — share lost to rivals triggers a haircut, a market-wide shrink does not. The panel also shows market cap, FDV, P/S (TTM), market cap / adjusted EBITDA, distance from the all-time high and the post-IPO low, a USDC fundamentals gauge and the revenue & profit table. Prices and daily bars come from Yahoo Finance, USDC data from DeFiLlama; share counts and financials are an editable configuration with sources and as-of dates. The score is a discipline tool, not a prediction, and not investment advice.",
    },
    audience: {
      zh: "持有或观望 CRCL、想用规则代替情绪决定分批节奏的投资者。",
      en: "Investors holding or watching CRCL who want rules, not emotions, to pace staged buying.",
    },
    take: {
      zh: "先看分数再下单：三层分数条把贵不贵、慌不慌、基本面顺不顺一次摊开；记住它只是纪律工具，财报类数字记得看标注的截至日期。",
      en: "Check the score before the order: the three layer bars lay out cheap-or-not, panic-or-not and fundamentals in one view. It is a discipline tool only — and mind the as-of dates on the financial figures.",
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

/** /go/[slug] 的跳转目标：站内可用工具 → 站内页；其余 → 官网。
 *  例外：pershare 虽已站内内嵌，但 /go/pershare 是给外部引用用的短链，固定 302 到独立站官网。 */
export function goTarget(tool: ToolDef): string {
  if (tool.slug === "pershare") return tool.url;
  if (tool.embedded) return `/tool/${tool.slug}`;
  return tool.url;
}
