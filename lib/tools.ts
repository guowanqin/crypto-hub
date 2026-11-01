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
    slug: "folderlock",
    name: { zh: "FolderLock 文件夹加密", en: "FolderLock Folder Encryption" },
    url: "https://github.com/ns2250225/FolderLock",
    tags: ["security"],
    type: "third-party",
    oneLiner: {
      zh: "Windows 本地文件夹加密工具：AES-256-GCM + Argon2id，连文件名和目录结构一起加密，资源管理器右键一键上锁。",
      en: "A Windows folder encryption tool: AES-256-GCM with Argon2id, encrypting file names and folder structure too — lock a folder from the Explorer right-click menu.",
    },
    detail: {
      zh: "FolderLock 是开源的 Windows 10/11 文件夹加密工具（Rust + Tauri）。选一个文件夹、设好密码，它会把内容连同文件名、目录名和目录结构一起加密，放进同级一个隐藏的 .folderlock 保险箱，原位置只留一个同名锁定入口，双击输密码解锁。它用信封加密：Argon2id 从密码派生密钥、每个保险箱有独立随机主密钥、文件按 1 MiB 分块流式加解密，大文件夹不用整体载入内存；建箱时还会生成一把独立的安全恢复密钥，忘密码能靠它找回来。支持右键菜单、系统托盘、健康检查、改密码，也提供命令行版本。免费开源，在 GitHub 上下载使用。",
      en: "FolderLock is an open-source folder encryption tool for Windows 10/11 (Rust + Tauri). Pick a folder, set a password, and it encrypts the contents together with file names, directory names and structure into a hidden .folderlock vault next to it, leaving a same-name locked entry in Explorer that unlocks with your password. It uses envelope encryption — Argon2id derives the key-wrapping key from your password, each vault gets its own random master key, and files are processed in 1 MiB authenticated chunks so large folders never load fully into memory. A separate recovery key is generated when you create a vault, in case the password is forgotten. Explorer context menu, system tray, vault health checks, password change and a CLI are included. Free and open source, distributed via GitHub.",
    },
    audience: {
      zh: "想在 Windows 电脑上给敏感文件夹加一把本地密码锁、又不想把文件传到任何云端的人。",
      en: "Windows users who want a local password lock on sensitive folders without sending files to any cloud.",
    },
    take: {
      zh: "实测提醒：加密设计是正经的（认证加密 + 信封密钥 + 恢复密钥），但项目还很早期、未经独立安全审计——先拿非重要文件试，重要数据务必另留一份独立备份，加密不能替代备份；另外它的解锁是把文件恢复成普通目录，不是实时挂载的虚拟盘。",
      en: "Hands-on notes: the crypto design is sound (authenticated encryption, envelope keys, a recovery key), but the project is young and has not had an independent security audit — try it on non-critical files first and always keep a separate backup of anything important; encryption is not a backup. Unlocking restores a plain folder rather than mounting a live virtual drive.",
    },
  },
  {
    slug: "foldervault",
    name: { zh: "文件夹加密保险箱", en: "Folder Vault" },
    url: "https://18btc.cc/tool/foldervault",
    tags: ["security"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "网页版文件夹加密：把一个文件夹或一批文件整体加密成一个 .vault 保险箱文件，密码或恢复密钥解锁，全程在浏览器本地完成。",
      en: "Folder encryption in the browser: seal a folder or a batch of files into a single .vault file, unlock it with your password or recovery key — everything happens locally in your browser.",
    },
    detail: {
      zh: "桌面加密软件能把文件夹原地锁在磁盘上，网页做不到原地锁定，保险箱文件是网页能给出的形态：选一个文件夹（或一批文件），设好密码，内容连同文件名和目录结构一起加密，打包成一个 .vault 文件下载保存；换台设备要用时，把 .vault 传回这个页面，输密码就能取回原来的文件，也可以改用建箱时生成的恢复密钥开箱。加密走信封设计：随机主密钥按 2 MiB 分块以 AES-256-GCM 逐块加密，主密钥由密码经 Argon2id 派生的密钥包裹，派生不可用时退化 PBKDF2-SHA256（实际用的算法会写进文件头）；密码错一个字都会被认证机制干净拒绝，不会解出坏文件。全部计算只在本地浏览器进行，文件不经过任何服务器。",
      en: "Desktop tools can lock a folder in place on disk; a web page cannot — so the web answer is a vault file. Pick a folder (or a batch of files), set a password, and the contents are encrypted together with file names and directory structure into one downloadable .vault file. Bring that file back to this page on any device, enter the password, and your original files come back — or use the recovery key generated when the vault was created. The design uses envelope encryption: a random master key encrypts data in 2 MiB AES-256-GCM chunks, and the master key is wrapped by a key derived from your password with Argon2id (falling back to PBKDF2-SHA256 when unavailable — the algorithm actually used is recorded in the file header). A wrong password is rejected cleanly by the authentication check; nothing half-decrypted is ever produced. All computation runs locally in your browser; files never pass through any server.",
    },
    audience: {
      zh: "想临时给一批文件（证件扫描、合同、私钥备份说明等）加密打包、又不想为了这点事专门装桌面软件的人。",
      en: "Anyone who needs to encrypt a batch of files (ID scans, contracts, key-backup notes) on the spot without installing desktop software for it.",
    },
    take: {
      zh: "本站实测过完整的建箱—开箱往返：逐字节比对一致，错密码会被当场拒绝，.vault 里搜不到任何明文文件名。记住三件事：恢复密钥只在建箱时出现一次、密码和密钥都丢了谁也救不了、加密不等于备份。",
      en: "We ran the full create–open round-trip ourselves: byte-for-byte identical files, a wrong password rejected on the spot, and no plaintext file names anywhere inside the .vault. Three things to remember — the recovery key is shown only once, losing both password and key is final, and encryption is not a backup.",
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
    url: "https://18btc.cc/tool/btc-cycle",
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
    url: "https://18btc.cc/tool/crcl-panel",
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
  {
    slug: "qqqi-panel",
    name: { zh: "QQQI 攒股收息定投计算器", en: "QQQI Income DCA Calculator" },
    url: "https://18btc.cc/tool/qqqi-panel",
    tags: ["qqqi"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "QQQI 现价、派息与分红率自动调取，再逐月模拟定投攒股：期末多少股、每月收多少息，一次算清。",
      en: "QQQI's price, payouts and distribution rate fetched automatically, plus a month-by-month DCA simulation: final shares and monthly income, worked out in one go.",
    },
    detail: {
      zh: "给「攒股收息」定投 QQQI 的人做的一页式工具。上半页是自动取数的看板：现价与涨跌、52 周高低与水位、最近一次派息、最近 12 次派息合计（TTM）与当前分红率（TTM ÷ 现价）、最近 24 次派息历史表；估值参考只用收息角度的两把尺——当前分红率在它自身历史（逐月滚动年化口径）中的分位，和股价的 52 周水位，定档规则印在页面上。下半页是定投模拟器：每月定投金额、年限（1–30 年）、假设年分红率（默认带入实时 TTM 分红率）、假设股价年增速、分红再投入开关，逐月模拟出期末总股数、期末月收息、累计投入、累计分红与期末市值，附逐年汇总表。口径提醒：QQQI 是 NEOS 的备兑期权收息 ETF，2024 年 1 月才上市，派息含期权金与可能的资本返还（ROC）成分而非普通股息，分红率不等于总回报；模拟是算术不是预测，不构成投资建议。",
      en: "A one-page tool for investors accumulating QQQI shares for income. The top half is an auto-updating board: price and change, 52-week high/low and position, the latest payout, the trailing-twelve-month distribution total (TTM) and the current distribution rate (TTM ÷ price), plus a table of the last 24 payouts. The valuation reference uses two income-angle rulers only — where the current distribution rate sits in its own history (a rolling monthly percentile) and where the price sits in its 52-week range — with the banding rules printed on the page. The bottom half is the DCA simulator: monthly amount, years (1–30), an assumed annual distribution rate (pre-filled with the live TTM rate), assumed annual price growth and a reinvestment toggle, simulated month by month into final shares, final monthly income, total contributed, total distributions and final value, with a year-by-year table. Mind the caliber: QQQI is NEOS's covered-call income ETF, listed only in January 2024; its payouts include option premium and possibly return of capital (ROC), not ordinary dividends, and the distribution rate is not a total return. The simulation is arithmetic, not a forecast, and nothing here is investment advice.",
    },
    audience: {
      zh: "在定投 QQQI、想按月攒股靠派息滚现金流，并想先把股数与月收息算清楚再动手的收息型投资者。",
      en: "Income investors dollar-cost-averaging into QQQI who want the share count and monthly income worked out before committing.",
    },
    take: {
      zh: "先用模拟器把终局看清楚再定投：同样的月供，开不开分红再投入，十年后股数差出一大截；但记住派息里有 ROC 成分，别只看分红率下单。",
      en: "Run the simulator before you start: on the same monthly amount, reinvesting or not makes a big difference to the share count ten years out. And remember the payouts include ROC — never buy on the distribution rate alone.",
    },
  },
  {
    slug: "qqq-panel",
    name: { zh: "QQQ 定投回测计算器", en: "QQQ DCA Backtest Calculator" },
    url: "https://18btc.cc/tool/qqq-panel",
    tags: ["qqq"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "QQQ 现价、估值温度自动调取，再用 1999 年上市以来的全史月线回测定投：期末股数、年化与最大回撤一次算清。",
      en: "QQQ's live price and valuation temperature fetched automatically, plus a DCA backtest on the full monthly history since its 1999 listing: final shares, annualised return and max drawdown in one go.",
    },
    detail: {
      zh: "给长期定投 QQQ 的人做的一页式工具。上半页是自动取数的看板：现价与涨跌、历史最高收盘（ATH，收盘口径）与距 ATH 回撤、52 周高低与水位、MA200 偏离，PE 取得到时一并列出；估值温度把 MA200 偏离、距 ATH 回撤、52 周水位（PE 可用时四项）各打一个子分再取平均，定档为偏冷/中性偏冷/中性偏热/偏热，子分公式与阈值全部印在页面上——它是指标刻度，不是买卖信号。下半页是定投回测器：数据是 QQQ 自 1999 年 3 月上市以来的全史月收盘与季度分红，任选起始年月、每月定投金额、分红再投入开关，输出累计投入、期末股数、摊薄成本对比期末价、期末总资产、累计分红、年化收益率（按月现金流 XIRR 近似）、期间标的最大回撤（月线总回报口径）与逐年汇总表，并附一条对比线：同一笔总投入在起始月一次性买入的结果。口径提醒：回测每月按当月收盘价买入，分红按上月末持股计，未计税费与汇率；历史回测不代表未来，不构成投资建议。",
      en: "A one-page tool for long-term QQQ dollar-cost averagers. The top half is an auto-updating board: price and change, the all-time high close (closing basis) and drawdown from it, the 52-week high/low and position, the distance to the 200-day average, and P/E when available. The valuation temperature scores each of the MA200 deviation, ATH drawdown and 52-week position (four inputs when P/E is available) and averages them into cold / cool-neutral / warm-neutral / hot bands, with every subscore formula and threshold printed on the page — it is a metric scale, not a buy or sell signal. The bottom half is the DCA backtester: QQQ's full monthly closes and quarterly dividends since its March 1999 listing, with any start month, a monthly amount and a dividend-reinvestment toggle, producing total contributed, final shares, diluted cost versus the final price, final total assets, total dividends, annualised return (an XIRR approximation over monthly cash flows), the underlying's max drawdown in the window (monthly total-return basis) and a year-by-year table — plus a comparison line for investing the same total as a lump sum at the start. Methodology notes: the backtest buys at each month's close, dividends are computed on the previous month-end share count, and taxes and FX are excluded. A backtest is history, not a forecast, and nothing here is investment advice.",
    },
    audience: {
      zh: "在按月定投 QQQ、想知道现在贵不贵、并想用真实历史检验自己定投方案的人。",
      en: "Investors dollar-cost-averaging into QQQ who want to know how stretched the price is and to test their plan against real history.",
    },
    take: {
      zh: "先拉一遍 2000 年起的回测再定投：看清最惨的时候账户要扛多深、一次性买入和定投差多少，再决定月供和心态；估值温度只当仪表盘看，别当择时器用。",
      en: "Run the backtest from 2000 before you start: see how deep the worst stretch gets and how DCA compares with a lump sum, then set your monthly amount and your expectations. Treat the temperature as a dashboard gauge, not a timing device.",
    },
  },
  {
    slug: "filetime",
    name: { zh: "照片/文件时间修改", en: "Photo & File Time Editor" },
    url: "https://18btc.cc/tool/filetime",
    tags: ["filetime"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "批量修改照片内嵌的 EXIF 拍摄/创建/修改时间：统一设置、整体平移、按张递增，本地处理不上传。",
      en: "Batch-edit the EXIF date taken, digitized and modified times inside your photos — set, shift or step — processed locally, never uploaded.",
    },
    detail: {
      zh: "照片的时间分两处：电脑里文件的系统时间，和照片文件内嵌的 EXIF 时间。这个站内工具改后一处：把 JPEG 照片的拍摄时间（DateTimeOriginal）、创建时间（DateTimeDigitized）、修改时间（ModifyDate）三者同步改掉，GPS、设备等其余 EXIF 原样保留。三种批量模式——统一设为某一时刻、按 ±天/时/分整体平移、从起始时间按张递增（批量补打卡序列用）；改前改后逐张对照核对，再单张下载或打包 ZIP。全部处理在浏览器本地完成，照片不上传任何服务器。边界要讲清：网页改不了你硬盘上已有文件的系统创建时间/修改时间，下载回去的文件其系统修改时间会是下载时刻——相册排序、打卡补传读的是 EXIF 时间，所以多数照片场景本工具就够；确需改本地文件系统时间，用同标签收录的桌面版 NewFileTime。",
      en: "A photo's date lives in two places: the system timestamps of the file on disk, and the EXIF times embedded in the photo. This on-site tool edits the second: it rewrites a JPEG's date taken (DateTimeOriginal), digitized (DateTimeDigitized) and modified (ModifyDate) times together, leaving GPS, device info and all other EXIF untouched. Three batch modes — set one moment for all, shift everything by ±days/hours/minutes, or step from a start time photo by photo (for back-filling a check-in sequence) — with a before/after comparison per photo, then single downloads or one ZIP. All processing happens locally in your browser; photos are never uploaded. The boundary, stated plainly: a web page cannot change the system created/modified times of files already on your disk, and a downloaded file's system modified time will be the download moment — but album sorting and attendance back-fills read the EXIF time, so most photo scenarios are covered here. If you truly need to change local files' system timestamps, use the desktop NewFileTime listed under the same tag.",
    },
    audience: {
      zh: "相机时间设错需要批量纠正、整理扫描照片日期、按 EXIF 时间补打卡序列的人。",
      en: "Anyone fixing a wrong camera clock in bulk, tidying scanned-photo dates, or back-filling a check-in sequence by EXIF time.",
    },
    take: {
      zh: "先分清改的是哪种时间：相册和打卡认 EXIF，这个网页版当场就能改；资源管理器里那个系统时间得靠桌面版，别下错工具。",
      en: "Be clear which clock you're changing: albums and check-ins read EXIF, which this web tool edits on the spot; the system timestamps in your file manager need the desktop app — don't grab the wrong tool.",
    },
  },
  {
    slug: "newfiletime",
    name: { zh: "NewFileTime（桌面版）", en: "NewFileTime (Desktop)" },
    url: "https://www.softwareok.com/?seite=Freeware/NewFileTime",
    tags: ["filetime"],
    type: "third-party",
    oneLiner: {
      zh: "Windows 便携小工具：直接修改本地文件与文件夹的创建、修改、访问时间，免安装、免费。",
      en: "A portable Windows utility that directly changes the created, modified and accessed timestamps of local files and folders — no install, free.",
    },
    detail: {
      zh: "SoftwareOK 出品的老牌 Windows 小工具（当前 8.33 版），绿色便携、免安装、免费。它调用系统接口，直接修改你电脑上文件与文件夹的创建时间、修改时间与访问时间——正是网页版做不到的那件事。支持拖放批量添加、按文件夹（含子目录）导入、把文件批量变「年轻」或「变老」（整体平移）、按文件名生成时间戳、夏令时/冬令时一小时纠偏，还能通过资源管理器右键菜单调用。需要纠正相机导出的文件系统时间、整理下载文件的日期时，用它在本地改最直接。",
      en: "A long-standing Windows utility from SoftwareOK (currently v8.33): portable, no install, free. It talks to the OS directly and changes the created, modified and accessed timestamps of files and folders on your own machine — exactly the thing a web page cannot do. It supports drag-and-drop batch adding, importing whole folders (including subfolders), making files proportionally younger or older (bulk shift), generating timestamps from file names, one-hour daylight-saving corrections, and invocation from the Explorer context menu. When the system timestamps of camera exports or downloads need fixing, this is the direct local way.",
    },
    audience: {
      zh: "需要直接修改 Windows 本地文件/文件夹系统时间的用户，尤其是批量整理照片与下载文件日期的人。",
      en: "Users who need to change the system timestamps of local Windows files/folders directly — especially bulk-fixing photo and download dates.",
    },
    take: {
      zh: "网页版改 EXIF、桌面版改系统时间，分工明确；它几百 KB、免安装，纠正文件日期时比任何在线工具都靠谱——注意只支持 Windows。",
      en: "The web tool edits EXIF; this desktop app edits system timestamps — a clear division of labour. It is a few hundred KB, needs no install, and beats any online tool for fixing file dates. Windows only, note.",
    },
  },
  {
    slug: "pdfbox",
    name: { zh: "PDF 工具箱", en: "PDF Toolbox" },
    url: "https://18btc.cc/tool/pdfbox",
    tags: ["pdf"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "纯前端 PDF 工具箱：合并、拆分、页面管理、水印、页码、骑缝章、批注、图片互转，文件不上传、离线可用。",
      en: "A pure front-end PDF toolbox: merge, split, page management, watermarks, page numbers, cross-page seals, annotations and image conversion — files never uploaded, works offline.",
    },
    detail: {
      zh: "参考信创 PDF 工具箱的功能集，在浏览器里把 PDF 的日常处理一次做全：多个 PDF 合并（可调序）、按页码范围拆分或逐页拆分、页面缩略图管理（删除、旋转、重排、插入同尺寸空白页）、文字水印（平铺或居中，透明度与角度可调）、页码添加（六个位置、数字或中文「第 X 页 共 N 页」格式）、骑缝章（印章图按页数自动切片逐页盖在右侧边缘，拼起来是完整一枚）、指定页文字批注，以及图片转 PDF 与 PDF 逐页转图片。全部处理都在你的浏览器本地完成：文件不经过任何服务器，断网也能用，尤其适合合同、证件、财务单据这类不该上传的文件。边界讲清：不做 PDF 转 Word/Excel（纯前端做不出可用的排版保真度），不做 OCR，也不做具法律效力的电子签章——骑缝章是把印章图按传统骑缝方式盖上，不替代 CA 电子签。",
      en: "Modelled on the Xinchuang PDF toolbox's feature set, it covers everyday PDF work in the browser: merge multiple PDFs (reorderable), split by page ranges or page-by-page, manage pages as thumbnails (delete, rotate, reorder, insert a blank page of the same size), text watermarks (tiled or centred, adjustable opacity and angle), page numbers (six positions; numeric or Chinese 'page X of N' formats), cross-page seals — the stamp image is sliced across all pages and placed on the right edge of each, reassembling into one complete seal — text annotations on a chosen page, and image→PDF / PDF→image conversion. Everything runs locally in your browser: files never pass through a server, it works offline, which suits contracts, ID scans and financial documents that should not be uploaded. The boundaries, plainly: no PDF→Word/Excel (a pure front-end cannot keep the layout usable), no OCR, and no legally binding e-signatures — the cross-page seal stamps the image the traditional perforation way and does not replace a CA-issued electronic seal.",
    },
    audience: {
      zh: "经常处理合同、标书、证件扫描件，需要合并拆分页码骑缝章、又不放心把文件传上云的行政、财务与法务人员。",
      en: "Admin, finance and legal staff who handle contracts, bids and ID scans, need merging, splitting, page numbers and cross-page seals, and don't want those files on someone else's server.",
    },
    take: {
      zh: "内网和涉密场景才是它的主场：打开页面就能干活，网线拔了照样跑；骑缝章切片对齐我们逐页验过，别拿它当 CA 电子签用就行。",
      en: "Its home turf is intranets and sensitive documents: open the page and work, network cable optional. We verified the seal slices align page by page — just don't mistake it for a CA e-signature.",
    },
  },
  {
    slug: "hongguo",
    name: { zh: "红果短剧桌面版（第三方客户端）", en: "Hongguo Short Drama Desktop (Third-party Client)" },
    url: "https://github.com/waligoraamodio288-rgb/hongguo-desktop-releases",
    tags: ["video"],
    type: "third-party",
    oneLiner: {
      zh: "把红果短剧搬到电脑和电视上的第三方客户端：Windows 正式版、Mac M 系列与 Android TV 测试版，找剧、收藏、本机续播，还有老板键。",
      en: "A third-party client that brings Hongguo short dramas to PC and TV: a stable Windows build plus Mac (Apple Silicon) and Android TV betas — search, favourites, on-device resume and a boss key.",
    },
    detail: {
      zh: "红果短剧官方只有手机 App，这个由「渠道有数」独立维护的第三方客户端把找剧和追剧搬到了大屏：Windows 10/11 正式版（当前 1.0.19）、Mac M 系列测试版、Android TV / 盒子 / 投影测试版。功能上有分类浏览、搜索、收藏、选集、倍速、自动连播和本机续播进度，还有上班摸鱼用的老板键（默认 Ctrl+Shift+B，隐藏窗口并自动暂停）；1.0.19 还能只读查看你手机上的云片单。通过它的 GitHub 发行仓库免费下载，仓库里同时有各版本的说明、已知问题和 SHA-256 校验值。它与红果官方没有关系：内容来自红果的内容服务，能不能播取决于服务与网络状况；观看记录和收藏只保存在当前设备，不与手机 App 同步。",
      en: "Hongguo (ByteDance's free short-drama app) officially ships only on phones. This third-party client, maintained independently by Qudao Youshu, brings drama hunting and bingeing to bigger screens: a stable Windows 10/11 build (currently 1.0.19), a Mac beta for Apple Silicon, and an Android TV / box / projector beta. It offers category browsing, search, favourites, episode picking, playback speed, auto-play-next and on-device resume, plus a boss key (Ctrl+Shift+B by default) that hides the window and pauses. Version 1.0.19 can also read your phone's cloud playlist (read-only). Downloads are free from its GitHub releases repo, which also carries per-version notes, known issues and SHA-256 checksums. It is not affiliated with the official app: content comes from Hongguo's service, so playback depends on that service and your network, and your history and favourites live only on the device — nothing syncs with the phone app.",
    },
    audience: {
      zh: "想在电脑或电视大屏上看红果短剧、不想一直举着手机的人。",
      en: "Anyone who wants to watch Hongguo short dramas on a computer or TV instead of holding a phone.",
    },
    take: {
      zh: "实测提醒：它是非官方第三方客户端，且 Windows 安装包没有发布者代码签名，安装时系统弹出「未知发布者」是正常现象——务必只从这个原发行仓库下载、别用乱七八糟的镜像站，并可对照仓库公布的 SHA-256 核对安装包；Mac 版未经公证、仍是测试版，播放可用性也要看当时的内容服务状态。",
      en: "Hands-on notes: this is an unofficial third-party client, and the Windows installer carries no publisher code signature, so an 'unknown publisher' prompt on install is expected — download only from this original releases repo (never random mirrors) and check the installer against the SHA-256 the repo publishes. The Mac build is unnotarised and still a beta, and playback availability depends on the content service at the time.",
    },
  },
  {
    slug: "ocr-tool",
    name: { zh: "图片文字识别 OCR（本地版）", en: "Image OCR — Local, In-Browser" },
    url: "https://18btc.cc/tool/ocr-tool",
    tags: ["ocr"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "在浏览器本地把图片里的文字识别出来：批量最多 20 张、中英混合、按行对照原图高亮，导出 TXT / Markdown / Word / ZIP，图片不上传。",
      en: "Recognise text from images locally in your browser: batches of up to 20, mixed Chinese/English, line-by-line highlights on the original image, export to TXT / Markdown / Word / ZIP — images are never uploaded.",
    },
    detail: {
      zh: "基于开源 Tesseract 引擎的本地 OCR：拖放、点击或粘贴导入图片（一次最多 20 张），识别在你浏览器的 Web Worker 里逐张排队完成，简体中文与英文混合识别，也可切纯中文 / 纯英文模式提速。结果按行列出，点任意一行，左侧原图上会把这一行框出来对位核对；认错的字可以直接在行内改掉。导出有单张 TXT、全部合成 Markdown、全部合成 TXT、Word 文档（.docx）和按图打包 ZIP（每张图一个同名 .txt）。代价讲清楚：第一次使用要联网下载识别模型（WASM 核心加中英文语言包，共几十 MB），下完之后浏览器会缓存、断网也能用；效果上印刷体、截图、单据是主场，手写字和复杂表格版面明显不如云端大厂 OCR——换来的是图片从头到尾不离开你的设备，证件、合同、聊天截图这类敏感图片不用先过别人的服务器。",
      en: "Local OCR powered by the open-source Tesseract engine: drag, click or paste to import images (up to 20 at a time); recognition runs in a Web Worker in your browser, one image at a time, in mixed Simplified-Chinese + English, with Chinese-only or English-only modes for speed. Results are listed line by line — click any line and that line is boxed on the original image so you can check it in place — and misread characters can be fixed right in the line. Exports: a single image's TXT, all results as Markdown, all as one TXT, a Word document (.docx), or a ZIP with one same-named .txt per image. The cost, stated plainly: the first run downloads the recognition models online (the WASM core plus the Chinese and English language packs, tens of MB in total); once cached it works offline. Print, screenshots and forms are its strength; handwriting and complex table layouts are clearly weaker than big-cloud OCR — in exchange, your images never leave your device, which matters for ID scans, contracts and chat screenshots.",
    },
    audience: {
      zh: "要把截图、扫描件、单据照片转成可编辑文字，又不想把图片上传到第三方网站的人：行政、财务、学生和做资料整理的人最常用。",
      en: "Anyone who needs text out of screenshots, scans or photos of documents without uploading the images to a third-party site — admin, finance, students and anyone tidying up documents.",
    },
    take: {
      zh: "实测口径：中英混合的印刷体截图识别够稳，逐行高亮对照改错很省事；第一次打开要等模型下载，急用先点一张图把模型拉下来。手写和表格别为难它，那是云端 OCR 的活。",
      en: "Field notes: printed mixed Chinese/English screenshots recognise reliably, and the line-highlight proofreading saves real time. The first open waits on the model download — feed it one image early to warm the cache. Don't ask it to do handwriting or tables; that's cloud OCR's job.",
    },
  },
  {
    slug: "imgpeel",
    name: { zh: "ImgPeel 图片文字识别", en: "ImgPeel — Image to Text OCR" },
    url: "https://imgpeel.toolooz.com/zh-CN",
    tags: ["ocr"],
    type: "third-party",
    oneLiner: {
      zh: "免费在线图片文字识别：同样主打浏览器本地 OCR、图片不上传，支持简繁英韩日俄等多语种，识别结果可导出 TXT、Markdown、Word。",
      en: "Free online image-to-text OCR that also runs locally in the browser with no uploads, covering Simplified/Traditional Chinese, English, Korean, Japanese, Russian and more, with export to TXT, Markdown and Word.",
    },
    detail: {
      zh: "ImgPeel 是 toolooz 旗下的一款在线 OCR 工具，形态是纯网页、打开即用：把图片拖进去做文字识别，按其官网介绍支持简体、繁体、英文、韩语、日语、俄语等多国语言，识别结果可以复制或下载为 TXT、Markdown、Word，也支持批量识别；和本站的本地 OCR 一样，它强调图片不上传、识别在浏览器本地完成。本站的文字识别工具在产品形态上参考了它（本地识别、批量、逐行对照、多格式导出），但两者是各自独立的实现与站点：语言覆盖上 ImgPeel 更广（多语种），本站工具则胜在与导航站一体、逐行高亮对照原图这一步做得更细。两个都是免费、无需注册，需要哪种直接用哪种。",
      en: "ImgPeel is an online OCR tool by toolooz — a pure web app that works on open: drop an image in for text recognition. Per its official site it covers Simplified and Traditional Chinese, English, Korean, Japanese, Russian and more languages; results can be copied or downloaded as TXT, Markdown or Word, and batch recognition is supported. Like this site's local OCR it stresses that images are not uploaded and recognition happens locally in the browser. Our OCR tool takes its product shape from ImgPeel (local recognition, batching, line-by-line checking, multi-format export) but the two are independent implementations on independent sites: ImgPeel covers more languages, while ours is integrated with this hub and does the line-highlight proofreading step in more detail. Both are free with no sign-up — use whichever fits.",
    },
    audience: {
      zh: "需要识别繁体或韩日俄等更多语种图片文字、或想多一个本地 OCR 备选的人。",
      en: "People who need Traditional Chinese, Korean, Japanese, Russian or other extra languages recognised, or who want a second local-OCR option.",
    },
    take: {
      zh: "同类里少见的老实工具：不上传、免注册、导出格式齐。多语种识别找它，中英混合加逐行对照核稿用本站内置的那个，两个配合着用正好。",
      en: "A refreshingly honest entry in its class: no uploads, no sign-up, a full set of export formats. Use it for extra languages; use the built-in one here for mixed Chinese/English with line-by-line proofreading — they complement each other.",
    },
  },
  {
    slug: "slang-dict",
    name: { zh: "二手黑话词典", en: "Secondhand Slang Dictionary" },
    url: "https://18btc.cc/tool/slang-dict",
    tags: ["slang"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "闲鱼、转转、小红书的黑话暗语站内直接查：全文搜索、分类与存活状态筛选、拼音缩写反查，每条带卖家潜台词与买家避坑。",
      en: "Look up Xianyu, Zhuanzhuan and Xiaohongshu slang right here: full-text search, category and survival-status filters, abbreviation lookup — every entry with the seller's real intent and buyer warnings.",
    },
    detail: {
      zh: "给二手买家做的解码词典，数据来自 GitHub 上的 MIT 开源词库 awesome-chinese-secondhand-slang，本站服务端每日自动同步（当前 149 个主题词条、5,082 个黑话变体，数字随上游更新）。用法：直接搜黑话、标准名或含义（如「矿渣」「全绿」「克劳格」），或按 27 个分类、按存活状态（现行可用 / 抽检限流 / 平台拦截）筛；每张词条卡列全变体、百科释义、卖家潜台词、买家避坑、当前动态与接棒新词，并标注风险等级。页面下方还有拼音首字母缩写反查：输入 cld、ga、xd 这类字母暗号，命中上游速查表与变体里真实带这个暗号的词条。定位与边界写在明处：本站只帮买家看懂黑话、避坑验货，不提供把正常文案转成黑话的卖家排雷转译，上游数据中给卖家的规避建议字段本站不展示。词条原文的版权归上游开源项目与贡献者所有（MIT License）。",
      en: "A decoding dictionary for secondhand buyers, powered by the MIT-licensed open-source awesome-chinese-secondhand-slang dictionary on GitHub, synced daily by our server (currently 149 topic entries and 5,082 slang variants, moving with upstream). Search slang, standard names or meanings, or filter by the 27 categories and by survival status (active / throttled / platform-blocked); each entry card lists all variants, a plain-language explanation, what the seller really means, buyer warnings, the current situation, successor slang and a risk level. A pinyin-initial abbreviation lookup sits below: type letter codes like cld, ga or xd to hit the upstream quick table and the entries whose variants actually carry that code. The boundary is stated plainly: this site only helps buyers understand slang and avoid pitfalls — there is no seller-side listing-to-slang translator, and the upstream dataset's advice-for-sellers field is not displayed. Entry texts belong to the upstream open-source project and its contributors (MIT License).",
    },
    audience: {
      zh: "在闲鱼、转转、小红书淘二手，怕被黑话话术绕进去、想先查清成色与套路再下单的买家。",
      en: "Secondhand buyers on Xianyu, Zhuanzhuan and Xiaohongshu who want to decode the pitch and check the pitfalls before paying.",
    },
    take: {
      zh: "下单前花十秒搜一下标题里的生词：很多「捡漏」看完卖家潜台词就冷静了。状态标成平台拦截的词更要留心——卖家还在用的，往往不是为了卖货，是为了把你引出平台。",
      en: "Spend ten seconds searching the unfamiliar words in a listing title before you pay: many a 'bargain' looks different once you've read what the seller really means. Be extra careful with terms flagged as platform-blocked — when a seller still uses them, the point is often not the item but getting you off the platform.",
    },
  },
  {
    slug: "awesome-slang",
    name: { zh: "Awesome 二手黑话开源词库", en: "Awesome Chinese Secondhand Slang (Open Source)" },
    url: "https://github.com/Domainsun/awesome-chinese-secondhand-slang",
    tags: ["slang"],
    type: "third-party",
    oneLiner: {
      zh: "本站词典的数据源头：GitHub 上的 MIT 开源二手黑话词库，词条、变体、存活状态与缩写表全部结构化开放，可下载原始 JSON。",
      en: "The data source behind this site's dictionary: an MIT-licensed open-source secondhand-slang corpus on GitHub — entries, variants, survival statuses and the abbreviation table, all structured and downloadable as raw JSON.",
    },
    detail: {
      zh: "Domainsun 维护的开源项目 awesome-chinese-secondhand-slang，把闲鱼、转转、小红书等平台的二手交易暗语整理成结构化数据：每个主题词条含标准名、全部黑话变体、适用平台、风险等级、存活状态、百科释义，以及卖家潜台词、买家避坑等双向透视字段，词库 JSON 在仓库的 data 目录完全开放。本站的二手黑话词典正是基于这份 MIT 许可的数据：本站服务端每日自动同步上游词库，套上搜索、筛选与缩写反查的界面；分类统计与界面分类名由同步程序派生标注，上游原始文件是一个词条数组（其 README 描述的四段式结构与文件现状略有出入，以文件为准）。想拿原始数据自己做工具、或给词库补新词条，直接去这个仓库下载 JSON 或提 PR。",
      en: "An open-source project maintained by Domainsun that structures the coded language of Xianyu, Zhuanzhuan, Xiaohongshu and other secondhand platforms: each topic entry carries a standard name, all its slang variants, applicable platforms, a risk level, a survival status, a plain-language explanation, and two-sided fields for what the seller really means and what buyers should watch for. The dictionary JSON sits fully open in the repo's data folder. This site's secondhand slang dictionary is built on that MIT-licensed data: our server syncs the upstream corpus daily and wraps it in search, filters and abbreviation lookup; category stats and display names are derived at sync time (the upstream file itself is a flat entry array — its README's four-part schema description differs slightly from the file, and the file wins). To build on the raw data yourself, or to contribute new entries, head to the repo for the JSON or a PR.",
    },
    audience: {
      zh: "想下载原始词库数据做自己的工具、或愿意给开源词库贡献新黑话词条的人。",
      en: "People who want the raw dictionary data for their own tools, or who'd like to contribute new slang entries to the open-source corpus.",
    },
    take: {
      zh: "本站词典里每条黑话的原文都出自这里，同步关系明明白白：发现新暗号，与其发帖问人，不如顺手给上游提个 PR，全网查词的人都受益。",
      en: "Every entry in this site's dictionary originates here, and the sync relationship is stated openly. Spot a new code word in the wild? File a PR upstream instead of just asking around — everyone who looks words up benefits.",
    },
  },
  {
    slug: "ip-check",
    name: { zh: "IP 风险检测", en: "IP Risk Check" },
    url: "https://18btc.cc/tool/ip-check",
    tags: ["ip-check"],
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "打开先自查出口 IP，也可查任意 IP/域名：地理、ASN、机房/家宽判定、逐项列明的风险分、Whois 与 WebRTC 泄露检测一页看齐。",
      en: "Your exit IP is checked on open; any IP or domain works too — geography, ASN, a datacenter/residential verdict, an itemised risk score, whois and a WebRTC leak check on one page.",
    },
    detail: {
      zh: "站内可直接使用的 IP 自查工具，产品形态参考 pingip.co，数据源与评分规则为本站自建并全量公开。打开页面先自动查你自己的出口 IP；输入任意 IP 或域名（域名经 DoH 解析）也可查。情报由服务端合并 ipwho.is（地理、ASN、运营商）与标记源（ip-api.com 主源、proxycheck.io 兜底，给出 proxy / hosting / mobile 标记），单源失败只降级对应字段、实际供数源在页面上标注；属性判定 IDC 机房 / 家宽住宅 / 移动网络逐项列出命中证据；风险分只用四条公开规则（proxy +45、hosting +35、云厂商 ASN +15、移动网络 −20），每项加减分与证据都在页面上对得回去——它衡量「像不像代理/机房出口」，不是商业风控库的欺诈分。原生 IP 只给参考判断（地理归属国与 RDAP 网段注册国是否一致、是否 Anycast），不装作能确证。Whois 走 RDAP 官方通道给注册组织/注册商、网段、注册日期与状态摘要。另有三节完全在浏览器本地完成、不上传服务器：WebRTC 泄露检测（STUN 公网地址与出口 IP 对比）、浏览器环境（时区、语言、UA、WebGL 等）、HTTP 延迟测试（浏览器发不了 ICMP，测的是 HTTP 往返，页面已标注）。",
      en: "A built-in IP self-audit tool whose product shape follows pingip.co, with data sources and scoring rules built — and fully published — by this site. Opening the page checks your own exit IP first; any IP or domain (domains resolved over DoH) can be queried. Intel is merged server-side from public sources — ipwho.is (geography, ASN, ISP) plus flag sources (ip-api.com primary, proxycheck.io as fallback, providing the proxy / hosting / mobile flags); if one source fails, only its fields degrade, and the page names the source that actually answered. The datacenter / residential / mobile verdict lists every piece of evidence, and the risk score uses just four public rules (proxy +45, hosting +35, cloud-provider ASN +15, mobile −20) with each item's points and evidence traceable on the page — it measures how much an IP looks like a proxy/datacenter exit, and is not a commercial fraud score. Native-IP status is a reference judgement only (geo country vs the RDAP netblock's registered country, and anycast), never a claimed certification. Whois comes from official RDAP channels: registrant/registrar, range, registration date and status. Three further sections run entirely in your browser and upload nothing: a WebRTC leak check (STUN public address vs your exit IP), a browser-environment readout (timezone, language, UA, WebGL…) and an HTTP latency test (a browser cannot send ICMP, so HTTP round-trips are measured — labelled as such on the page).",
    },
    audience: {
      zh: "在意自己网络出口「干不干净」的人：用代理/VPN/机场节点、远程办公、做账号运营与风控自查，想先看清出口 IP 的机房属性、风险标记与 WebRTC 有没有泄露的人。",
      en: "Anyone who cares how clean their network exit looks: proxy/VPN users, remote workers, account operators and the risk-conscious — anyone who wants the datacenter traits, risk flags and WebRTC leak status of their exit IP spelled out.",
    },
    take: {
      zh: "先拿它查自己的出口再查别人的：评分规则就四条、全印在页面上，命中哪条加多少分自己能验算；记住它测的是机房/代理特征，不是善恶——公共 DNS 和公司 VPN 分数高是天生的。",
      en: "Check your own exit before anyone else's: the score is just four rules printed in full on the page, so you can re-derive every point yourself. Remember it measures datacenter/proxy traits, not good or evil — public DNS resolvers and corporate VPNs score high by nature.",
    },
  },
  {
    slug: "pingip",
    name: { zh: "PingIP", en: "PingIP" },
    url: "https://pingip.co",
    tags: ["ip-check"],
    type: "third-party",
    oneLiner: {
      zh: "老牌在线 IP 自查站：IP/域名情报、风险评分、WebRTC 与浏览器环境检测、Ping 与 Whois，本站 IP 检测的产品形态参考对象。",
      en: "An established online IP self-check site — IP/domain intel, risk scoring, WebRTC and browser-environment checks, ping and whois; the reference this site's IP Check takes its shape from.",
    },
    detail: {
      zh: "PingIP（pingip.co）是一款免费、无需注册的在线 IP 风险检测与网络环境自查工具：可查询 IP 或域名的地理位置、ASN、运营商、CIDR、IDC 机房/家宽属性与原生 IP 倾向，并给出风险评分；站内还有 WebRTC 泄露检测、浏览器环境检测、Ping 测试与 Whois 查询，其中 WebRTC、时区、语言等环境检测在其页面本地完成、不上传服务器。本站的「IP 风险检测」在产品形态上参考了它（自查 + 情报 + 风险分 + 本地环境检测一页流），但两者是各自独立的站点与实现：本站把情报合并源（ipwho.is + ip-api）与四条评分规则的权重全量公开、逐项可验算，并把延迟一节如实标注为 HTTP 往返而非 ICMP Ping；PingIP 的覆盖与呈现则有它自己的口径。两个都免费，需要哪种直接用哪种。",
      en: "PingIP (pingip.co) is a free, no-sign-up IP risk-check and network self-audit tool: look up an IP or domain for geography, ASN, ISP, CIDR, datacenter-vs-residential traits and native-IP tendency, with a risk score; it also offers a WebRTC leak check, a browser-environment check, ping tests and whois lookups, with the WebRTC, timezone and language checks running locally on its pages rather than on a server. This site's IP Risk Check takes its product shape from PingIP (self-check + intel + risk score + local environment checks in one flow), but the two are independent sites and implementations: ours publishes its merged intel sources (ipwho.is + ip-api) and all four scoring weights for anyone to re-derive, and labels its latency section honestly as HTTP round-trips rather than ICMP ping; PingIP has its own coverage and presentation. Both are free — use whichever fits.",
    },
    audience: {
      zh: "想多一个 IP 自查备选、或想对照两家口径看同一个 IP 的人。",
      en: "People who want a second IP self-check option, or who like comparing two methodologies on the same IP.",
    },
    take: {
      zh: "这类工具的老面孔，功能排布是本站参考的原点；两边最大的差别在透明度：本站把数据源和评分权重全摊开，它更像开箱即用的成品——对照着用，正好互相验算。",
      en: "A familiar face in this category and the layout reference for this site's tool. The biggest difference is transparency: ours lays its sources and scoring weights bare, while PingIP is the more packaged product — run both and cross-check.",
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
