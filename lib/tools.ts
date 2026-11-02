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
  /** 实际上架日期（YYYY-MM-DD），必填：首页「最新上架」与统一排序都靠它 */
  addedAt: string;
  /** 人工置顶权重（数字越大越靠前），只有站长点名要推的才设，一般留空 */
  pin?: number;
  oneLiner: Record<Lang, string>;
  detail: Record<Lang, string>;
  audience: Record<Lang, string>;
  take: Record<Lang, string>;
}

// 工具注册表：新增工具只改这一处数据，首页分区、标签页、介绍页、sitemap、/go 跳转自动跟随。
export const TOOLS: ToolDef[] = [
  {
    slug: "pershare",
    name: { zh: "PerShare 每股含币量计算器", en: "PerShare — Crypto per Share Calculator",
    tw: "PerShare 每股含幣量計算器" },
    url: "https://pershare.cc",
    tags: ["market"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "加密财库股每股含币量计算器：实时算 BNC、PURR 的含币价值与折溢价。",
      en: "Per-share coin calculator for crypto treasury stocks: live coin value and discount/premium for BNC and PURR.",
      tw: "加密財庫股每股含幣量計算器：實時算 BNC、PURR 的含幣價值與折溢價。",
    },
    detail: {
      zh: "把财库公司的持币量、股本和实时币价、股价放在一页算清：每股含多少 BNB / HYPE、每股含币价值多少美元、相对股价是折价还是溢价、mNAV 是多少。数据自动刷新，不用自己拉盘口和财报拼表格；折溢价的正负号全站统一规则，不会被符号绕晕。",
      en: "Puts a treasury company's coin holdings, share count, live coin price and stock price on one page: how much BNB/HYPE each share holds, what that is worth in USD, whether the stock trades at a discount or a premium, and the mNAV. Data refreshes automatically — no stitching quotes and filings together yourself — and the discount/premium sign convention is consistent across the whole page.",
      tw: "把財庫公司的持幣量、股本和實時幣價、股價放在一頁算清：每股含多少 BNB / HYPE、每股含幣價值多少美元、相對股價是折價還是溢價、mNAV 是多少。資料自動重新整理，不用自己拉盤口和財報拼表格；折溢價的正負號全站統一規則，不會被符號繞暈。",
    },
    audience: {
      zh: "关注加密财库股（DAT）估值、想判断 BNC / PURR 折溢价的投资者。",
      en: "Investors valuing crypto treasury (DAT) stocks and checking BNC / PURR discounts.",
      tw: "關注加密財庫股（DAT）估值、想判斷 BNC / PURR 折溢價的投資者。",
    },
    take: {
      zh: "财库股别只看股价，先来这儿看每股到底装了多少币。",
      en: "Don't just stare at the share price — check how much coin is inside each share first.",
      tw: "財庫股別只看股價，先來這兒看每股到底裝了多少幣。",
    },
  },
  {
    slug: "sheet2word",
    name: { zh: "Excel 批量生成 Word（Sheet2Word）", en: "Excel to Word Batch Generator (Sheet2Word)",
    tw: "Excel 批次生成 Word（Sheet2Word）" },
    url: "https://18btc.cc/tool/sheet2word",
    tags: ["office"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "Excel 批量生成 Word：模板填占位符，一行数据一份文档，打包下载。",
      en: "Batch-generate Word from Excel: fill a placeholder template — one document per row, one ZIP download.",
      tw: "Excel 批次生成 Word：模板填佔位符，一行資料一份文件，打包下載。",
    },
    detail: {
      zh: "在线邮件合并替代工具：不用装 Office，浏览器打开就能用。把 Word 模板里要替换的位置写成 {{姓名}} 这类占位符，Excel 第一行表头会自动与占位符按名匹配，每一行数据生成一份独立的 .docx，可按某一列的值自动命名，最后打包成 ZIP 一次下载。所有解析和生成都在你的浏览器本地完成，文件不上传任何服务器；完全免费、无行数限制、免注册。",
      en: "An online mail-merge alternative that needs no Office install: write {{Name}}-style placeholders in your .docx template, let the Excel header row auto-match them by name, and generate one standalone .docx per data row — named after any column you pick and zipped for a single download. Everything is parsed and generated locally in your browser, files are never uploaded; completely free, no row limit, no sign-up.",
      tw: "線上郵件合併替代工具：不用裝 Office，瀏覽器開啟就能用。把 Word 模板裡要替換的位置寫成 {{姓名}} 這類佔位符，Excel 第一行表頭會自動與佔位符按名匹配，每一行資料生成一份獨立的 .docx，可按某一列的值自動命名，最後打包成 ZIP 一次下載。所有解析和生成都在你的瀏覽器本地完成，檔案不上傳任何伺服器；完全免費、無行數限制、免註冊。",
    },
    audience: {
      zh: "要批量出录用通知书、证书、合同、工资条等同版式文档的行政、人事和运营人员。",
      en: "Admin, HR and ops folks who batch-produce offer letters, certificates, contracts or payslips from one template.",
      tw: "要批次出錄用通知書、證書、合同、工資條等同版式文件的行政、人事和運營人員。",
    },
    take: {
      zh: "币圈之外也要办公——批量套打这件事，它是真能把一下午的活压成一分钟，本站实测过。",
      en: "Even coin folks do paperwork — for batch documents this genuinely turns an afternoon into a minute. Field-tested by 18btc.",
      tw: "幣圈之外也要辦公——批次套打這件事，它是真能把一下午的活壓成一分鐘，本站實測過。",
    },
  },
  {
    slug: "imagebox",
    name: { zh: "图片工具箱", en: "Image Toolbox",
    tw: "圖片工具箱" },
    url: "https://18btc.cc/tool/imagebox",
    tags: ["office"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "本地图片工具箱：压缩、改尺寸、水印、九宫格、拼图、打码十合一，不上传。",
      en: "A local image toolbox: compress, resize, watermark, grid-slice, collage and redaction — ten tools, nothing uploaded.",
      tw: "本地圖片工具箱：壓縮、改尺寸、水印、九宮格、拼圖、打碼十合一，不上傳。",
    },
    detail: {
      zh: "发朋友圈、做小红书封面、传证件图之前，总有几个小活要干：图太大传不上去、九宫格要按顺序切好、拼图留白不均匀、截图里有手机号要打码、证件图带着 GPS 定位不敢直接发。这个工具箱把十个高频小工具放在一页：批量压缩（质量可调，JPG/PNG/WebP 互转）、改尺寸、文字水印、九宫格切图（2–4 行列可选，切完带序号打包）、网格拼图、长图拼接、二维码生成、EXIF 查看与一键清除、拖框打马赛克、多图合成 GIF。如实说明：所有处理都只在你自己的浏览器里用 Canvas 完成，图片不上传任何服务器，不用注册、没有水印、没有次数限制；关掉页面就什么都不留。",
      en: "Before posting to social media or uploading an ID photo there is always some small chore: the file is too big, a nine-grid needs slicing in order, a collage has uneven gaps, a screenshot shows a phone number, an ID photo carries GPS coordinates. This toolbox puts ten frequent jobs on one page: batch compression (adjustable quality, JPG/PNG/WebP conversion), resizing, text watermarking, grid slicing (2–4 rows/columns, numbered ZIP export), grid collages, long-image stitching, QR code generation, EXIF viewing and one-click scrubbing, drag-to-select mosaic redaction, and multi-image GIF creation. Stated plainly: everything runs only in your own browser via Canvas — images are never uploaded to any server, there is no sign-up, no watermark and no usage limit, and closing the page leaves nothing behind.",
      tw: "發朋友圈、做小紅書封面、傳證件圖之前，總有幾個小活要幹：圖太大傳不上去、九宮格要按順序切好、拼圖留白不均勻、截圖裡有手機號要打碼、證件圖帶著 GPS 定位不敢直接發。這個工具箱把十個高頻小工具放在一頁：批次壓縮（質量可調，JPG/PNG/WebP 互轉）、改尺寸、文字水印、九宮格切圖（2–4 行列可選，切完帶序號打包）、網格拼圖、長圖拼接、二維碼生成、EXIF 檢視與一鍵清除、拖框打馬賽克、多圖合成 GIF。如實說明：所有處理都只在你自己的瀏覽器裡用 Canvas 完成，圖片不上傳任何伺服器，不用註冊、沒有水印、沒有次數限制；關掉頁面就什麼都不留。",
    },
    audience: {
      zh: "经常发朋友圈/小红书要切九宫格拼图的内容创作者，以及随手要压缩、改尺寸、给图片打码去隐私的普通用户。",
      en: "Creators who slice nine-grids and build collages for social posts, plus anyone who casually needs to compress, resize, redact or de-metadata an image.",
      tw: "經常發朋友圈/小紅書要切九宮格拼圖的內容創作者，以及隨手要壓縮、改尺寸、給圖片打碼去隱私的普通使用者。",
    },
    take: {
      zh: "这类小工具网上很多，但大多要你先把图传上它的服务器。这个是真本地：本站实测断网也能用，处理证件图和截图时这点比什么都重要。",
      en: "Plenty of sites offer these little tools, but most make you upload your images to their servers first. This one is genuinely local — we tested it offline — and that matters most for ID photos and screenshots.",
      tw: "這類小工具網上很多，但大多要你先把圖傳上它的伺服器。這個是真本地：本站實測斷網也能用，處理證件圖和截圖時這點比什麼都重要。",
    },
  },
  {
    slug: "devtools",
    name: { zh: "开发者工具箱", en: "Dev Toolbox",
    tw: "開發者工具箱" },
    url: "https://18btc.cc/tool/devtools",
    tags: ["office"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "开发者工具箱：编码、哈希、JSON、时间戳等二十件小工具，本地运行。",
      en: "A developer toolbox: encoding, hashing, JSON, timestamps and more — twenty tools running locally.",
      tw: "開發者工具箱：編碼、雜湊、JSON、時間戳等二十件小工具，本地執行。",
    },
    detail: {
      zh: "把开发者和运维日常最高频的二十件小事装进一页：编码转换组有 Base64、URL 编码、Unicode 转义、进制转换与 Hex 互转（进制用 BigInt，再大的整数也不溢出）；加密与校验组有 MD5 / SHA-1 / SHA-256 / SHA-512 哈希计算、JWT 解码（只解 header 与 payload，页面上明示不验签）和密码强度检测（给熵估算和等级，不下绝对结论）；生成器组有 UUID 批量生成、随机密码与随机数；格式化与转换组有 JSON 格式化/压缩/校验（语法错误指出第几行第几列）、时间戳互转（带实时当前时间戳）、颜色转换、单位换算与 URL 参数解析（参数可编辑后拼回完整链接）；文本工具组有字数统计、八种大小写互转、行处理和按行文本对比。页面顶部可按工具名中英文搜索过滤。所有计算都只在你的浏览器本地完成：粘贴 token、密钥、日志片段都不会离开这台设备；免费、免注册、无次数限制。",
      en: "Twenty of the small jobs developers and ops folks do every day, on one page: Base64, URL encoding, Unicode escapes, radix conversion (BigInt — no overflow however large the integer) and hex conversion; MD5 / SHA-1 / SHA-256 / SHA-512 hashing, a JWT decoder (header and payload only, clearly labelled as not verifying signatures) and a password strength checker (entropy estimate and a grade, never an absolute verdict); batch UUIDs, random passwords and random numbers; JSON formatting, minifying and validation that points at the exact line and column of a syntax error, timestamp conversion with a live clock, color conversion, unit conversion and a URL parser whose query table is editable and rebuilds the link live; plus a text counter, eight case conversions, line tools and a line-by-line text diff. A search box at the top filters the tools by name in either language. Everything computes locally in your browser — tokens, keys and log snippets you paste never leave your device. Free, no sign-up, no usage limits.",
      tw: "把開發者和運維日常最高頻的二十件小事裝進一頁：編碼轉換組有 Base64、URL 編碼、Unicode 轉義、進位制轉換與 Hex 互轉（進位制用 BigInt，再大的整數也不溢位）；加密與校驗組有 MD5 / SHA-1 / SHA-256 / SHA-512 雜湊計算、JWT 解碼（只解 header 與 payload，頁面上明示不驗籤）和密碼強度檢測（給熵估算和等級，不下絕對結論）；生成器組有 UUID 批次生成、隨機密碼與隨機數；格式化與轉換組有 JSON 格式化/壓縮/校驗（語法錯誤指出第幾行第幾列）、時間戳互轉（帶實時當前時間戳）、顏色轉換、單位換算與 URL 引數解析（引數可編輯後拼回完整連結）；文字工具組有字數統計、八種大小寫互轉、行處理和按行文字對比。頁面頂部可按工具名中英文搜尋過濾。所有計算都只在你的瀏覽器本地完成：貼上 token、金鑰、日誌片段都不會離開這臺裝置；免費、免註冊、無次數限制。",
    },
    audience: {
      zh: "天天和接口、日志、token、时间戳打交道的开发者与运维，以及偶尔要解一段 Base64、验一个 JWT、算个哈希的普通用户。",
      en: "Developers and ops folks who live among APIs, logs, tokens and timestamps — plus anyone who occasionally needs to decode a Base64 string, peek inside a JWT or hash something.",
      tw: "天天和介面、日誌、token、時間戳打交道的開發者與運維，以及偶爾要解一段 Base64、驗一個 JWT、算個雜湊的普通使用者。",
    },
    take: {
      zh: "工具盘子照着 it-tools 那类合集的功能清单盘的，但东西是本站自己一件件做的：二十件全在本地跑，处理 token 和密钥时不用把敏感串粘到别人的服务器上——这一条就是把它留在站内的理由。常用度最高的是 JSON 校验的位置提示和 JWT 解码，接口调试时是真省事。",
      en: "The line-up follows the kind of inventory that collections like it-tools made popular, but every tool here is this site's own build and all twenty run locally — when you are handling tokens and keys, not pasting secrets into someone else's server is the whole point. The JSON error locator and the JWT decoder earn their keep fastest in day-to-day API debugging.",
      tw: "工具盤子照著 it-tools 那類合集的功能清單盤的，但東西是本站自己一件件做的：二十件全在本地跑，處理 token 和金鑰時不用把敏感串粘到別人的伺服器上——這一條就是把它留在站內的理由。常用度最高的是 JSON 校驗的位置提示和 JWT 解碼，介面除錯時是真省事。",
    },
  },
  {
    slug: "coingecko",
    name: { zh: "CoinGecko", en: "CoinGecko",
    tw: "CoinGecko" },
    url: "https://www.coingecko.com",
    tags: ["market"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "全球币种行情总站：价格、市值、交易所分布与新币发现。",
      en: "The all-in-one crypto market board: prices, market caps, exchanges and new listings.",
      tw: "全球幣種行情總站：價格、市值、交易所分佈與新幣發現。",
    },
    detail: {
      zh: "收录上万种代币的价格、市值、成交量和历史走势，并按交易所、公链和板块分类整理；新币上线和热门搜索更新很快，适合作为查任何币「现在多少钱、盘子多大」的第一站。链上 DEX 数据和 NFT 板块也一并覆盖，属于币圈人的默认首页之一。",
      en: "Tracks prices, market caps, volumes and history for tens of thousands of coins, organized by exchange, chain and category. New listings and trending searches update fast, making it the natural first stop for 'what is this coin worth and how big is it' — with DEX and NFT coverage on the side.",
      tw: "收錄上萬種代幣的價格、市值、成交量和歷史走勢，並按交易所、公鏈和板塊分類整理；新幣上線和熱門搜尋更新很快，適合作為查任何幣「現在多少錢、盤子多大」的第一站。鏈上 DEX 資料和 NFT 板塊也一併覆蓋，屬於幣圈人的預設首頁之一。",
    },
    audience: {
      zh: "几乎所有币圈用户，尤其是需要快速核对价格与市值的入门和进阶玩家。",
      en: "Practically every crypto user, especially anyone quickly verifying price and market cap.",
      tw: "幾乎所有幣圈使用者，尤其是需要快速核對價格與市值的入門和進階玩家。",
    },
    take: {
      zh: "查价我第一反应还是开它，数据全，更新稳。",
      en: "Still my first tab for a price check — broad data, steady updates.",
      tw: "查價我第一反應還是開它，資料全，更新穩。",
    },
  },
  {
    slug: "coinmarketcap",
    name: { zh: "CoinMarketCap", en: "CoinMarketCap",
    tw: "CoinMarketCap" },
    url: "https://coinmarketcap.com",
    tags: ["market"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "老牌币圈行情站：市值排行榜、恐惧贪婪指数与空投资讯。",
      en: "The veteran market site: cap rankings, the Fear & Greed Index and airdrop news.",
      tw: "老牌幣圈行情站：市值排行榜、恐懼貪婪指數與空投資訊。",
    },
    detail: {
      zh: "以市值排行榜闻名的老牌行情平台，除了价格与市值，还提供恐惧与贪婪指数、板块轮动、空投日历和学习赚币等栏目，资讯与教育内容比较丰富。查一个币的排名与历史市值时，它的排行榜口径是很多媒体引用的来源。",
      en: "The long-standing rankings platform: beyond prices and market caps it offers the Fear & Greed Index, sector rotation views, an airdrop calendar and Learn & Earn content. Its ranking methodology is the one much of the media cites when quoting a coin's rank or historical cap.",
      tw: "以市值排行榜聞名的老牌行情平臺，除了價格與市值，還提供恐懼與貪婪指數、板塊輪動、空投日曆和學習賺幣等欄目，資訊與教育內容比較豐富。查一個幣的排名與歷史市值時，它的排行榜口徑是很多媒體引用的來源。",
    },
    audience: {
      zh: "喜欢用排行榜和情绪指标辅助判断的用户。",
      en: "Users who like rankings and sentiment gauges as decision aids.",
      tw: "喜歡用排行榜和情緒指標輔助判斷的使用者。",
    },
    take: {
      zh: "排行榜和恐贪指数做得顺手，看大盘情绪时我会扫一眼。",
      en: "Its rankings and Fear & Greed gauge are handy — I glance at them for market mood.",
      tw: "排行榜和恐貪指數做得順手，看大盤情緒時我會掃一眼。",
    },
  },
  {
    slug: "dexscreener",
    name: { zh: "DexScreener", en: "DexScreener",
    tw: "DexScreener" },
    url: "https://dexscreener.com",
    tags: ["market"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "DEX 实时行情利器：新池子与新代币的链上第一发现地。",
      en: "Real-time DEX charts: where new pools and new tokens show up first.",
      tw: "DEX 實時行情利器：新池子與新代幣的鏈上第一發現地。",
    },
    detail: {
      zh: "实时追踪各条链上 DEX 的交易对、流动性、成交量和买卖笔数，新池子一出现就能看到，并带 K 线和逐笔交易明细。玩链上新币的人基本人手一个：既用来抢第一手信息，也用来看池子深度和交易结构先排一遍雷。",
      en: "Tracks pairs, liquidity, volume and buy/sell counts across DEXes on many chains in real time, with charts and a per-trade feed the moment a pool appears. A staple for on-chain traders — both for catching fresh tokens early and for checking pool depth and trade structure before jumping in.",
      tw: "實時追蹤各條鏈上 DEX 的交易對、流動性、成交量和買賣筆數，新池子一出現就能看到，並帶 K 線和逐筆交易明細。玩鏈上新幣的人基本人手一個：既用來搶第一手資訊，也用來看池子深度和交易結構先排一遍雷。",
    },
    audience: {
      zh: "在链上找新币、看池子深度的交易者。",
      en: "On-chain traders looking for new tokens and pool depth.",
      tw: "在鏈上找新幣、看池子深度的交易者。",
    },
    take: {
      zh: "新池子刚冒头它就有了，链上冲浪必备，但也记得先排雷。",
      en: "New pools surface here first — essential for chain surfing, just DYOR before apeing.",
      tw: "新池子剛冒頭它就有了，鏈上衝浪必備，但也記得先排雷。",
    },
  },
  {
    slug: "geckoterminal",
    name: { zh: "GeckoTerminal", en: "GeckoTerminal",
    tw: "GeckoTerminal" },
    url: "https://www.geckoterminal.com",
    tags: ["market"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "CoinGecko 出品的 DEX 数据站：池子、交易对与链上行情。",
      en: "CoinGecko's DEX terminal: pools, pairs and on-chain market data.",
      tw: "CoinGecko 出品的 DEX 資料站：池子、交易對與鏈上行情。",
    },
    detail: {
      zh: "CoinGecko 旗下的 DEX 数据终端，按链、DEX 和交易对整理流动性池数据，提供 K 线、成交记录和池子指标，界面清爽克制。它和 DexScreener 覆盖的池子高度重合，正好适合交叉验证：同一个池子两边数据对不上时，往往就是问题所在。",
      en: "CoinGecko's DEX data terminal organizes liquidity pools by chain, DEX and pair, with charts, trade history and pool metrics in a clean, restrained interface. Its coverage overlaps heavily with DexScreener's — which is exactly why it's useful: when the same pool shows different numbers in two places, that disagreement is the signal.",
      tw: "CoinGecko 旗下的 DEX 資料終端，按鏈、DEX 和交易對整理流動性池資料，提供 K 線、成交記錄和池子指標，介面清爽剋制。它和 DexScreener 覆蓋的池子高度重合，正好適合交叉驗證：同一個池子兩邊資料對不上時，往往就是問題所在。",
    },
    audience: {
      zh: "需要核对 DEX 池子数据、做交叉验证的链上用户。",
      en: "On-chain users who verify pool data across sources.",
      tw: "需要核對 DEX 池子資料、做交叉驗證的鏈上使用者。",
    },
    take: {
      zh: "同一个池子我习惯和 DexScreener 对着看，数据打架时最能发现问题。",
      en: "I cross-check pools here against DexScreener — disagreements are where the truth hides.",
      tw: "同一個池子我習慣和 DexScreener 對著看，資料打架時最能發現問題。",
    },
  },
  {
    slug: "defillama",
    name: { zh: "DeFiLlama", en: "DeFiLlama",
    tw: "DeFiLlama" },
    url: "https://defillama.com",
    tags: ["defi"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "DeFi 数据中枢：全链 TVL、协议收入与稳定币全景。",
      en: "The DeFi data hub: TVL, protocol revenue and stablecoins across all chains.",
      tw: "DeFi 資料中樞：全鏈 TVL、協議收入與穩定幣全景。",
    },
    detail: {
      zh: "免费无广告的 DeFi 数据平台，聚合各条链和上千个协议的 TVL、手续费、收入、稳定币市值等数据，口径公开透明、更新勤快。判断一个协议或一条链到底有多少真金白银时，它是圈内公认的主流参考，很多研报的数据都出自它。",
      en: "A free, ad-free DeFi analytics platform aggregating TVL, fees, revenue and stablecoin data for thousands of protocols across chains, with transparent methodology and frequent updates. It is the default reference for how much real money a protocol or chain actually holds — much of the industry's research cites it.",
      tw: "免費無廣告的 DeFi 資料平臺，聚合各條鏈和上千個協議的 TVL、手續費、收入、穩定幣市值等資料，口徑公開透明、更新勤快。判斷一個協議或一條鏈到底有多少真金白銀時，它是圈內公認的主流參考，很多研報的資料都出自它。",
    },
    audience: {
      zh: "DeFi 玩家、研究型用户和需要协议基本面数据的人。",
      en: "DeFi users, researchers and anyone needing protocol fundamentals.",
      tw: "DeFi 玩家、研究型使用者和需要協議基本面資料的人。",
    },
    take: {
      zh: "看 TVL 我只认它，免费还把数据口径写得明明白白。",
      en: "For TVL this is the one I trust — free, and the methodology is out in the open.",
      tw: "看 TVL 我只認它，免費還把資料口徑寫得明明白白。",
    },
  },
  {
    slug: "dune",
    name: { zh: "Dune", en: "Dune",
    tw: "Dune" },
    url: "https://dune.com",
    tags: ["onchain"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "链上数据 SQL 查询平台：可视化面板与社区查询宝库。",
      en: "On-chain data in SQL: dashboards and a huge library of community queries.",
      tw: "鏈上資料 SQL 查詢平臺：視覺化面板與社群查詢寶庫。",
    },
    detail: {
      zh: "把链上数据做成可查询的数据库，用 SQL 就能拉出交易、地址、协议的任意维度统计，并沉淀了海量社区公开面板可以直接套用。想验证一个热门叙事有没有数据支撑，来这里翻现成面板是最快的路径；会写 SQL 的人还能自己从零查。",
      en: "Turns blockchain data into a queryable database — write SQL to slice transactions, addresses and protocols any way you like, and reuse a massive library of public community dashboards. The fastest way to check whether a hot narrative has data behind it; SQL users can go fully custom.",
      tw: "把鏈上資料做成可查詢的資料庫，用 SQL 就能拉出交易、地址、協議的任意維度統計，並沉澱了海量社群公開面板可以直接套用。想驗證一個熱門敘事有沒有資料支撐，來這裡翻現成面板是最快的路徑；會寫 SQL 的人還能自己從零查。",
    },
    audience: {
      zh: "研究员、数据型玩家和想自己动手查链上数据的人。",
      en: "Researchers, data-driven traders and anyone who wants to query the chain themselves.",
      tw: "研究員、資料型玩家和想自己動手查鏈上資料的人。",
    },
    take: {
      zh: "别人讲故事，我来 Dune 翻面板——数据不会陪人演戏。",
      en: "People tell stories; I check Dune dashboards — data doesn't play along with narratives.",
      tw: "別人講故事，我來 Dune 翻面板——資料不會陪人演戲。",
    },
  },
  {
    slug: "arkham",
    name: { zh: "Arkham", en: "Arkham",
    tw: "Arkham" },
    url: "https://arkham.com",
    tags: ["onchain"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "实体标签情报平台：看懂大地址和机构在链上的一举一动。",
      en: "Entity-labelled intelligence: see what big addresses and institutions do on-chain.",
      tw: "實體標籤情報平臺：看懂大地址和機構在鏈上的一舉一動。",
    },
    detail: {
      zh: "以地址实体标注见长，把交易所、基金、项目方等真实身份与链上地址对应起来，并提供大额异动提醒和资金流向追踪。盯巨鲸和机构钱包动向时，它看的不是一串十六进制地址，而是「谁在买、谁在卖」。",
      en: "Known for labelling addresses with real-world entities — exchanges, funds, projects — plus large-move alerts and fund-flow tracing. For following whale and institutional wallets it answers 'who is buying and who is selling', not just which hex string moved.",
      tw: "以地址實體標註見長，把交易所、基金、專案方等真實身份與鏈上地址對應起來，並提供大額異動提醒和資金流向追蹤。盯巨鯨和機構錢包動向時，它看的不是一串十六進位制地址，而是「誰在買、誰在賣」。",
    },
    audience: {
      zh: "关注巨鲸动向、做链上情报跟踪的用户。",
      en: "Users tracking whale moves and on-chain intelligence.",
      tw: "關注巨鯨動向、做鏈上情報跟蹤的使用者。",
    },
    take: {
      zh: "光看地址没用，它把「这是谁的钱包」这件事做成了产品。",
      en: "Raw addresses tell you little; Arkham turned 'whose wallet is this' into a product.",
      tw: "光看地址沒用，它把「這是誰的錢包」這件事做成了產品。",
    },
  },
  {
    slug: "bubblemaps",
    name: { zh: "Bubblemaps", en: "Bubblemaps",
    tw: "Bubblemaps" },
    url: "https://bubblemaps.io",
    tags: ["onchain"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "气泡图可视化持币分布：一眼识破筹码集中和关联钱包的藏身处。",
      en: "Bubble charts for holder distribution: spot concentration and linked wallets at a glance.",
      tw: "氣泡圖視覺化持幣分佈：一眼識破籌碼集中和關聯錢包的藏身處。",
    },
    detail: {
      zh: "用气泡图可视化代币的持有人分布，关联钱包会被连成簇：筹码是不是集中在少数地址手里、「去中心化」是不是装出来的，看一张图就心里有数。买 meme 币和新币之前花两分钟看一眼，能避开一类最常见的坑。",
      en: "Visualizes a token's holders as bubble maps, clustering linked wallets so you can see whether supply is concentrated in a few addresses or genuinely spread out. Two minutes here before buying a meme or new token dodges one of the most common traps.",
      tw: "用氣泡圖視覺化代幣的持有人分佈，關聯錢包會被連成簇：籌碼是不是集中在少數地址手裡、「去中心化」是不是裝出來的，看一張圖就心裡有數。買 meme 幣和新幣之前花兩分鐘看一眼，能避開一類最常見的坑。",
    },
    audience: {
      zh: "玩 meme 币、新币，想先查筹码结构的用户。",
      en: "Meme and new-token buyers who check token distribution first.",
      tw: "玩 meme 幣、新幣，想先查籌碼結構的使用者。",
    },
    take: {
      zh: "买之前先看一眼气泡，筹码全攥在几个地址手里的，再香我也不碰。",
      en: "One glance before buying — if a few wallets hold everything, I pass no matter the hype.",
      tw: "買之前先看一眼氣泡，籌碼全攥在幾個地址手裡的，再香我也不碰。",
    },
  },
  {
    slug: "etherscan",
    name: { zh: "Etherscan", en: "Etherscan",
    tw: "Etherscan" },
    url: "https://etherscan.io",
    tags: ["onchain"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "以太坊区块浏览器：查交易、查地址、读合约的源头工具。",
      en: "The Ethereum block explorer: transactions, addresses and contracts at the source.",
      tw: "以太坊區塊瀏覽器：查交易、查地址、讀合約的源頭工具。",
    },
    detail: {
      zh: "以太坊生态最基础的浏览器，查交易哈希、地址余额、代币转账、合约源码和内部交易都靠它；其他 EVM 链的同系浏览器也沿用这套界面。任何人转述一笔链上记录时，回到这里对一遍哈希和时间戳，就是源头真相。",
      en: "The foundational explorer for Ethereum — look up transaction hashes, address balances, token transfers, contract source code and internal transactions. Its sibling explorers on other EVM chains share the same interface; whenever someone quotes an on-chain record, checking the hash and timestamp here is the source of truth.",
      tw: "以太坊生態最基礎的瀏覽器，查交易雜湊、地址餘額、代幣轉賬、合約原始碼和內部交易都靠它；其他 EVM 鏈的同系瀏覽器也沿用這套介面。任何人轉述一筆鏈上記錄時，回到這裡對一遍雜湊和時間戳，就是源頭真相。",
    },
    audience: {
      zh: "所有需要核实以太坊及 EVM 链上记录的用户。",
      en: "Anyone verifying records on Ethereum or EVM chains.",
      tw: "所有需要核實以太坊及 EVM 鏈上記錄的使用者。",
    },
    take: {
      zh: "任何人跟我说一笔转账，我都先去 Etherscan 对哈希，不听转述。",
      en: "Someone quotes me a transfer, I check the hash on Etherscan first — no hearsay.",
      tw: "任何人跟我說一筆轉賬，我都先去 Etherscan 對雜湊，不聽轉述。",
    },
  },
  {
    slug: "rabby",
    name: { zh: "Rabby Wallet", en: "Rabby Wallet",
    tw: "Rabby Wallet" },
    url: "https://rabby.io",
    tags: ["wallet"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "多链 EVM 钱包：交易前先给你算风险、看余额变化。",
      en: "A multi-chain EVM wallet that previews risk and balance changes before you sign.",
      tw: "多鏈 EVM 錢包：交易前先給你算風險、看餘額變化。",
    },
    detail: {
      zh: "主打多链体验的 EVM 钱包：打开 dApp 自动匹配对应网络，签名前会预演这笔交易并提示风险、预估签完之后的余额变化，还有跨链资产组合总览。对天天在多条 EVM 链之间来回跳的用户，它把传统单链钱包最烦人的几步都省掉了。",
      en: "An EVM wallet built for multi-chain life: it switches to the right network when you open a dApp, simulates each transaction before you sign — with risk flags and an estimate of your post-sign balance — and gives a cross-chain portfolio overview. For users hopping between EVM chains daily, it removes the most annoying steps of single-chain wallets.",
      tw: "主打多鏈體驗的 EVM 錢包：開啟 dApp 自動匹配對應網路，簽名前會預演這筆交易並提示風險、預估簽完之後的餘額變化，還有跨鏈資產組合總覽。對天天在多條 EVM 鏈之間來回跳的使用者，它把傳統單鏈錢包最煩人的幾步都省掉了。",
    },
    audience: {
      zh: "同时玩多条 EVM 链的 DeFi 用户。",
      en: "DeFi users active across multiple EVM chains.",
      tw: "同時玩多條 EVM 鏈的 DeFi 使用者。",
    },
    take: {
      zh: "签名前它会先告诉我这笔签完我还剩什么，这功能用过就回不去了。",
      en: "It shows what I'll have left after signing — once you use that, there's no going back.",
      tw: "簽名前它會先告訴我這筆簽完我還剩什麼，這功能用過就回不去了。",
    },
  },
  {
    slug: "revoke",
    name: { zh: "Revoke.cash", en: "Revoke.cash",
    tw: "Revoke.cash" },
    url: "https://revoke.cash",
    tags: ["security"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "代币授权管理工具：查清并撤销你给过的全部授权，降低被盗风险。",
      en: "Allowance manager: see every token approval you've given — and revoke them to cut risk.",
      tw: "代幣授權管理工具：查清並撤銷你給過的全部授權，降低被盜風險。",
    },
    detail: {
      zh: "专门管理代币授权（allowance）的工具：连上钱包就能看到你对每个合约的历史授权额度，不再使用的可以一键撤销。很多盗币事件源于很久以前的旧授权被利用，定期来这里清理一遍，是成本最低的安全习惯。",
      en: "A focused tool for token allowances: connect a wallet to see every approval you have granted to each contract, and revoke the ones you no longer use in one click. Many drains exploit approvals granted long ago, so a periodic cleanup here is the cheapest security habit there is.",
      tw: "專門管理代幣授權（allowance）的工具：連上錢包就能看到你對每個合約的歷史授權額度，不再使用的可以一鍵撤銷。很多盜幣事件源於很久以前的舊授權被利用，定期來這裡清理一遍，是成本最低的安全習慣。",
    },
    audience: {
      zh: "经常与 DeFi 合约交互、给过大量授权的用户。",
      en: "DeFi users who have approved many contracts over time.",
      tw: "經常與 DeFi 合約互動、給過大量授權的使用者。",
    },
    take: {
      zh: "每个月来撤一遍不用的授权，几分钟的事，能躲掉一类大坑。",
      en: "I revoke unused approvals monthly — a few minutes that dodges a whole class of drains.",
      tw: "每個月來撤一遍不用的授權，幾分鐘的事，能躲掉一類大坑。",
    },
  },
  {
    slug: "folderlock",
    name: { zh: "FolderLock 文件夹加密", en: "FolderLock Folder Encryption",
    tw: "FolderLock 資料夾加密" },
    url: "https://github.com/ns2250225/FolderLock",
    tags: ["security"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "Windows 文件夹加密：AES-256 加密连文件名一起锁，右键一键上锁。",
      en: "Windows folder encryption: AES-256 locks file names too — one right-click to seal a folder.",
      tw: "Windows 資料夾加密：AES-256 加密連檔名一起鎖，右鍵一鍵上鎖。",
    },
    detail: {
      zh: "FolderLock 是开源的 Windows 10/11 文件夹加密工具（Rust + Tauri）。选一个文件夹、设好密码，它会把内容连同文件名、目录名和目录结构一起加密，放进同级一个隐藏的 .folderlock 保险箱，原位置只留一个同名锁定入口，双击输密码解锁。它用信封加密：Argon2id 从密码派生密钥、每个保险箱有独立随机主密钥、文件按 1 MiB 分块流式加解密，大文件夹不用整体载入内存；建箱时还会生成一把独立的安全恢复密钥，忘密码能靠它找回来。支持右键菜单、系统托盘、健康检查、改密码，也提供命令行版本。免费开源，在 GitHub 上下载使用。",
      en: "FolderLock is an open-source folder encryption tool for Windows 10/11 (Rust + Tauri). Pick a folder, set a password, and it encrypts the contents together with file names, directory names and structure into a hidden .folderlock vault next to it, leaving a same-name locked entry in Explorer that unlocks with your password. It uses envelope encryption — Argon2id derives the key-wrapping key from your password, each vault gets its own random master key, and files are processed in 1 MiB authenticated chunks so large folders never load fully into memory. A separate recovery key is generated when you create a vault, in case the password is forgotten. Explorer context menu, system tray, vault health checks, password change and a CLI are included. Free and open source, distributed via GitHub.",
      tw: "FolderLock 是開源的 Windows 10/11 資料夾加密工具（Rust + Tauri）。選一個資料夾、設好密碼，它會把內容連同檔名、目錄名和目錄結構一起加密，放進同級一個隱藏的 .folderlock 保險箱，原位置只留一個同名鎖定入口，雙擊輸密碼解鎖。它用信封加密：Argon2id 從密碼派生金鑰、每個保險箱有獨立隨機主金鑰、檔案按 1 MiB 分塊流式加解密，大資料夾不用整體載入記憶體；建箱時還會生成一把獨立的安全恢復金鑰，忘密碼能靠它找回來。支援右鍵選單、系統托盤、健康檢查、改密碼，也提供命令列版本。免費開源，在 GitHub 上下載使用。",
    },
    audience: {
      zh: "想在 Windows 电脑上给敏感文件夹加一把本地密码锁、又不想把文件传到任何云端的人。",
      en: "Windows users who want a local password lock on sensitive folders without sending files to any cloud.",
      tw: "想在 Windows 電腦上給敏感資料夾加一把本地密碼鎖、又不想把檔案傳到任何雲端的人。",
    },
    take: {
      zh: "实测提醒：加密设计是正经的（认证加密 + 信封密钥 + 恢复密钥），但项目还很早期、未经独立安全审计——先拿非重要文件试，重要数据务必另留一份独立备份，加密不能替代备份；另外它的解锁是把文件恢复成普通目录，不是实时挂载的虚拟盘。",
      en: "Hands-on notes: the crypto design is sound (authenticated encryption, envelope keys, a recovery key), but the project is young and has not had an independent security audit — try it on non-critical files first and always keep a separate backup of anything important; encryption is not a backup. Unlocking restores a plain folder rather than mounting a live virtual drive.",
      tw: "實測提醒：加密設計是正經的（認證加密 + 信封金鑰 + 恢復金鑰），但專案還很早期、未經獨立安全審計——先拿非重要檔案試，重要資料務必另留一份獨立備份，加密不能替代備份；另外它的解鎖是把檔案恢復成普通目錄，不是實時掛載的虛擬盤。",
    },
  },
  {
    slug: "foldervault",
    name: { zh: "文件夹加密保险箱", en: "Folder Vault",
    tw: "資料夾加密保險箱" },
    url: "https://18btc.cc/tool/foldervault",
    tags: ["security"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "浏览器文件夹加密：整夹打包成 .vault 保险箱，本地完成不上传。",
      en: "Folder encryption in the browser: seal a whole folder into one .vault file — done locally, never uploaded.",
      tw: "瀏覽器資料夾加密：整夾打包成 .vault 保險箱，本地完成不上傳。",
    },
    detail: {
      zh: "桌面加密软件能把文件夹原地锁在磁盘上，网页做不到原地锁定，保险箱文件是网页能给出的形态：选一个文件夹（或一批文件），设好密码，内容连同文件名和目录结构一起加密，打包成一个 .vault 文件下载保存；换台设备要用时，把 .vault 传回这个页面，输密码就能取回原来的文件，也可以改用建箱时生成的恢复密钥开箱。加密走信封设计：随机主密钥按 2 MiB 分块以 AES-256-GCM 逐块加密，主密钥由密码经 Argon2id 派生的密钥包裹，派生不可用时退化 PBKDF2-SHA256（实际用的算法会写进文件头）；密码错一个字都会被认证机制干净拒绝，不会解出坏文件。全部计算只在本地浏览器进行，文件不经过任何服务器。",
      en: "Desktop tools can lock a folder in place on disk; a web page cannot — so the web answer is a vault file. Pick a folder (or a batch of files), set a password, and the contents are encrypted together with file names and directory structure into one downloadable .vault file. Bring that file back to this page on any device, enter the password, and your original files come back — or use the recovery key generated when the vault was created. The design uses envelope encryption: a random master key encrypts data in 2 MiB AES-256-GCM chunks, and the master key is wrapped by a key derived from your password with Argon2id (falling back to PBKDF2-SHA256 when unavailable — the algorithm actually used is recorded in the file header). A wrong password is rejected cleanly by the authentication check; nothing half-decrypted is ever produced. All computation runs locally in your browser; files never pass through any server.",
      tw: "桌面加密軟體能把資料夾原地鎖在磁碟上，網頁做不到原地鎖定，保險箱檔案是網頁能給出的形態：選一個資料夾（或一批檔案），設好密碼，內容連同檔名和目錄結構一起加密，打包成一個 .vault 檔案下載儲存；換臺裝置要用時，把 .vault 傳回這個頁面，輸密碼就能取回原來的檔案，也可以改用建箱時生成的恢復金鑰開箱。加密走信封設計：隨機主金鑰按 2 MiB 分塊以 AES-256-GCM 逐塊加密，主金鑰由密碼經 Argon2id 派生的金鑰包裹，派生不可用時退化 PBKDF2-SHA256（實際用的演算法會寫進檔案頭）；密碼錯一個字都會被認證機制乾淨拒絕，不會解出壞檔案。全部計算只在本地瀏覽器進行，檔案不經過任何伺服器。",
    },
    audience: {
      zh: "想临时给一批文件（证件扫描、合同、私钥备份说明等）加密打包、又不想为了这点事专门装桌面软件的人。",
      en: "Anyone who needs to encrypt a batch of files (ID scans, contracts, key-backup notes) on the spot without installing desktop software for it.",
      tw: "想臨時給一批檔案（證件掃描、合同、私鑰備份說明等）加密打包、又不想為了這點事專門裝桌面軟體的人。",
    },
    take: {
      zh: "本站实测过完整的建箱—开箱往返：逐字节比对一致，错密码会被当场拒绝，.vault 里搜不到任何明文文件名。记住三件事：恢复密钥只在建箱时出现一次、密码和密钥都丢了谁也救不了、加密不等于备份。",
      en: "We ran the full create–open round-trip ourselves: byte-for-byte identical files, a wrong password rejected on the spot, and no plaintext file names anywhere inside the .vault. Three things to remember — the recovery key is shown only once, losing both password and key is final, and encryption is not a backup.",
      tw: "本站實測過完整的建箱—開箱往返：逐位元組比對一致，錯密碼會被當場拒絕，.vault 裡搜不到任何明文檔名。記住三件事：恢復金鑰只在建箱時出現一次、密碼和金鑰都丟了誰也救不了、加密不等於備份。",
    },
  },
  {
    slug: "uni-burn",
    name: { zh: "UNI 销毁看板", en: "UNI Burn Tracker",
    tw: "UNI 銷燬看板" },
    url: "https://18btc.cc/tool/uni-burn",
    tags: ["burn"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "UNI 销毁进度追踪：累计销毁、供应占比与销毁速度逐笔可查。",
      en: "UNI burn tracker: total burned, share of supply and burn pace — every record verifiable.",
      tw: "UNI 銷燬進度追蹤：累計銷燬、供應占比與銷燬速度逐筆可查。",
    },
    detail: {
      zh: "本站自建的 UNI 销毁追踪看板，数据不经第三方加工：服务端直接读取以太坊主网 UNI 合约——累计销毁量就是销毁地址 0x000…dEaD 的 UNI 余额（UNI 合约没有减少总供应的 burn 函数，总供应恒为 10 亿枚，有效供应 = 总供应 − 累计销毁），并据此算出销毁占初始供应的比例、近 24 小时与近 30 天销毁量，以及按近 30 天速度折算的年化销毁量与年化通缩率；最近销毁记录逐笔列出，附发送方与交易哈希，点开即可在 Etherscan 核对。背景：Uniswap 的 UNIfication 改革开启协议费开关后，各链协议费收入经 TokenJar 归集、跨链回到以太坊主网，兑换为 UNI 后转入销毁地址永久退出流通；2025 年 12 月底另有一笔约 1 亿枚的一次性金库销毁同路入账，占了累计销毁的大头，此后每日销毁主要由协议费驱动。口径提醒：近 24 小时 / 30 天按主网入账时间统计，与按「销毁发生日」记账的多链口径有 1–7 天时滞差异，两者不可直接相加；数据由本站服务端缓存 30 分钟刷新。本工具不构成投资建议。",
      en: "Our own UNI burn tracker with no third-party processing in between: the server reads the UNI contract on Ethereum mainnet directly — the total burned is simply the UNI balance of the burn address 0x000…dEaD (the UNI contract has no supply-reducing burn function, so total supply stays at 1 billion and effective supply = total supply − total burned) — and derives the destroyed share of the initial supply, the 24h and 30d burn totals, and an annualized burn and deflation rate scaled from the 30-day pace. The latest burns are listed one by one with sender and transaction hash, each openable on Etherscan for verification. Background: since Uniswap's UNIfication reform switched on protocol fees, fee revenue from every chain is collected in TokenJars, bridged back to Ethereum mainnet, converted into UNI and sent to the burn address to leave circulation for good; a one-off treasury burn of roughly 100M UNI was credited the same way in late December 2025 and makes up most of the cumulative total, while daily burns since then are fee-driven. Mind the caliber: the 24h / 30d figures use mainnet crediting time and can lag burn-occurrence-date accounting by 1–7 days, so the two bases must not be added together; data is cached server-side and refreshed every 30 minutes. Not investment advice.",
      tw: "本站自建的 UNI 銷燬追蹤看板，資料不經第三方加工：服務端直接讀取以太坊主網 UNI 合約——累計銷燬量就是銷燬地址 0x000…dEaD 的 UNI 餘額（UNI 合約沒有減少總供應的 burn 函式，總供應恆為 10 億枚，有效供應 = 總供應 − 累計銷燬），並據此算出銷燬佔初始供應的比例、近 24 小時與近 30 天銷燬量，以及按近 30 天速度折算的年化銷燬量與年化通縮率；最近銷燬記錄逐筆列出，附傳送方與交易雜湊，點開即可在 Etherscan 核對。背景：Uniswap 的 UNIfication 改革開啟協議費開關後，各鏈協議費收入經 TokenJar 歸集、跨鏈回到以太坊主網，兌換為 UNI 後轉入銷燬地址永久退出流通；2025 年 12 月底另有一筆約 1 億枚的一次性金庫銷燬同路入賬，佔了累計銷燬的大頭，此後每日銷燬主要由協議費驅動。口徑提醒：近 24 小時 / 30 天按主網入賬時間統計，與按「銷燬發生日」記賬的多鏈口徑有 1–7 天時滯差異，兩者不可直接相加；資料由本站服務端快取 30 分鐘重新整理。本工具不構成投資建議。",
    },
    audience: {
      zh: "持有或观望 UNI、想亲眼核对协议费销毁进度与通缩速度、而不是听二手转述的投资者与研究者。",
      en: "UNI holders and watchers who want to verify the protocol-fee burn progress and deflation pace first-hand instead of relying on second-hand summaries.",
      tw: "持有或觀望 UNI、想親眼核對協議費銷燬進度與通縮速度、而不是聽二手轉述的投資者與研究者。",
    },
    take: {
      zh: "看 UNI 通缩先分清存量和增量：累计数里躺着约 1 亿枚一次性金库销毁，真正反映协议费造血速度的是近 30 天那一栏；年化通缩率还只是百分之零点几时，叙事归叙事，别把销毁本身当成买入理由。",
      en: "Separate the stock from the flow: the cumulative figure holds a one-off treasury burn of about 100M UNI, while the 30-day column is what actually reflects the protocol-fee engine. While the annualized deflation rate is still a fraction of a percent, enjoy the narrative — but don't treat the burn itself as a reason to buy.",
      tw: "看 UNI 通縮先分清存量和增量：累計數里躺著約 1 億枚一次性金庫銷燬，真正反映協議費造血速度的是近 30 天那一欄；年化通縮率還只是百分之零點幾時，敘事歸敘事，別把銷燬本身當成買入理由。",
    },
  },
  {
    slug: "defiburn",
    name: { zh: "DeFiBurn", en: "DeFiBurn",
    tw: "DeFiBurn" },
    url: "https://www.defiburn.com",
    tags: ["burn"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "UNI 销毁数据终端：逐笔追踪 Uniswap 协议费销毁与各链销毁分布。",
      en: "A UNI burn data terminal: tracks Uniswap protocol-fee burns record by record, with per-chain breakdowns.",
      tw: "UNI 銷燬資料終端：逐筆追蹤 Uniswap 協議費銷燬與各鏈銷燬分佈。",
    },
    detail: {
      zh: "专盯 UNI 销毁的数据站：把 Uniswap 各链协议费触发的销毁逐笔采集入账，给出每日销毁量、7/30 天合计、年化销毁速率与销毁构成（协议费销毁 vs 一次性金库销毁），并按链拆分销毁来源与费用开关状态。本站「销毁数据」页的核心指标与它的累计口径互相印证；想看更细的多链分布和历史趋势时，来这里深挖。",
      en: "A data site devoted to the UNI burn: it records every protocol-fee burn triggered across Uniswap's chains, with daily totals, 7/30-day sums, annualized burn rates and burn composition (protocol-fee burns vs the one-off treasury burn), plus per-chain sources and fee-switch status. The headline figures on our Burn Data page cross-check against its totals; come here for the deeper per-chain breakdowns and history.",
      tw: "專盯 UNI 銷燬的資料站：把 Uniswap 各鏈協議費觸發的銷燬逐筆採集入賬，給出每日銷燬量、7/30 天合計、年化銷燬速率與銷燬構成（協議費銷燬 vs 一次性金庫銷燬），並按鏈拆分銷燬來源與費用開關狀態。本站「銷燬資料」頁的核心指標與它的累計口徑互相印證；想看更細的多鏈分佈和歷史趨勢時，來這裡深挖。",
    },
    audience: {
      zh: "持有或观望 UNI、想量化其通缩节奏的投资者与研究者。",
      en: "UNI holders and researchers who want to quantify its deflation pace.",
      tw: "持有或觀望 UNI、想量化其通縮節奏的投資者與研究者。",
    },
    take: {
      zh: "看 UNI 通缩别听人转述，来这里看它逐笔数出来的账。",
      en: "Skip the second-hand takes on UNI deflation — this is the ledger, counted record by record.",
      tw: "看 UNI 通縮別聽人轉述，來這裡看它逐筆數出來的賬。",
    },
  },
  {
    slug: "filee",
    name: { zh: "Filee 文件格式转换器", en: "Filee File Converter",
    tw: "Filee 檔案格式轉換器" },
    url: "https://filee.sh",
    tags: ["office"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "免费开源格式转换器：本地拖拽即转 255 种格式，文件不上传。",
      en: "A free, open-source format converter: drag and drop locally — 255 formats, files never uploaded.",
      tw: "免費開源格式轉換器：本地拖拽即轉 255 種格式，檔案不上傳。",
    },
    detail: {
      zh: "Filee 是装在电脑上的本地文件转换器，交互很特别：在资源管理器里选中文件，按住 Ctrl 拖动，光标旁会弹出一个格式圆环，把文件放到目标格式上松手，新文件就生成在原文件旁边。图片、PDF、Word/Excel/PowerPoint、视频、音频、电子书、压缩包等 18 大类共 255 种格式互转，还带裁剪、旋转、合并 PDF、打包 ZIP 等小工具；转换全部在本机完成，不上传、无需注册、无广告，批量转换不限制数量。转 Office 文档用它内置的引擎，不需要安装 Microsoft Office。Windows 与 Linux 为正式版，另有命令行和文件夹自动转换，适合要批量处理文件又不想把文件传上云的人。",
      en: "Filee is a desktop file converter with an unusual gesture-driven interface: select files in your file manager, hold Ctrl and drag, and a ring of target formats appears at your cursor — drop the files on a format and the converted copies land next to the originals. It converts across 255 formats in 18 families (images, PDF, Word/Excel/PowerPoint, video, audio, ebooks, archives and more), with extras like crop, rotate, PDF merge and ZIP packing. Everything runs on your own machine: no uploads, no sign-up, no ads, and batch conversion is unlimited. Office documents convert with its built-in engines, no Microsoft Office install required. Windows and Linux are stable releases, and there is a CLI plus watch-folder automation for heavier workflows.",
      tw: "Filee 是裝在電腦上的本地檔案轉換器，互動很特別：在資源管理器裡選中檔案，按住 Ctrl 拖動，游標旁會彈出一個格式圓環，把檔案放到目標格式上鬆手，新檔案就生成在原檔案旁邊。圖片、PDF、Word/Excel/PowerPoint、影片、音訊、電子書、壓縮包等 18 大類共 255 種格式互轉，還帶裁剪、旋轉、合併 PDF、打包 ZIP 等小工具；轉換全部在本機完成，不上傳、無需註冊、無廣告，批次轉換不限制數量。轉 Office 文件用它內建的引擎，不需要安裝 Microsoft Office。Windows 與 Linux 為正式版，另有命令列和資料夾自動轉換，適合要批次處理檔案又不想把檔案傳上雲的人。",
    },
    audience: {
      zh: "经常要转格式、又介意把文件上传到在线转换站的人；批量处理图片、文档、音视频的办公与自媒体用户。",
      en: "Anyone who converts files often but dislikes uploading them to online converters; office and creator workflows with lots of images, documents or media.",
      tw: "經常要轉格式、又介意把檔案上傳到線上轉換站的人；批次處理圖片、文件、音影片的辦公與自媒體使用者。",
    },
    take: {
      zh: "实测提醒：它是在电脑上装软件、不是网页工具；macOS 目前还是预览版（未公证，首次打开要手动放行），Linux 的拖动手势需要 X11 会话，视频等少数格式要按提示在应用内下载一次可选引擎。能接受这三点的话，「本地转换、不上传」这件事它做得比在线站干净。",
      en: "Hands-on notes: it is a desktop app, not a web tool; the macOS build is still a preview (not notarized, needs a one-time manual allow), the drag gesture on Linux needs an X11 session, and a few formats (video etc.) ask you to download an optional engine once inside the app. Accept those, and its fully local, no-upload conversion is cleaner than any online converter.",
      tw: "實測提醒：它是在電腦上裝軟體、不是網頁工具；macOS 目前還是預覽版（未公證，首次開啟要手動放行），Linux 的拖動手勢需要 X11 會話，影片等少數格式要按提示在應用內下載一次可選引擎。能接受這三點的話，「本地轉換、不上傳」這件事它做得比線上站乾淨。",
    },
  },
  {
    slug: "btc-cycle",
    name: { zh: "BTC 抄底倒计时", en: "BTC Bottom Countdown",
    tw: "BTC 抄底倒計時" },
    url: "https://18btc.cc/tool/btc-cycle",
    tags: ["btc-bottom"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "实时区块高度推演 BTC 周期位置：离熊底多远、五档建仓点在哪。",
      en: "BTC cycle position from the live block height: how far to the bear bottom, and where the five buying tranches sit.",
      tw: "實時區塊高度推演 BTC 週期位置：離熊底多遠、五檔建倉點在哪。",
    },
    detail: {
      zh: "把减半周期模型做成实时看板：锚点全部由减半区块推导（牛顶、熊底、第 5 次减半位置 0.5、下轮牛顶），用实时链上区块高度算出当前周期位置（0=熊底、1=牛顶）、熊市进度、距熊底的倒计时，以及按位置 0.20/0.15/0.10/0.05/0.02 倒推的五档分批建仓日期。越过熊底后自动切换为回升段视图与距下次减半倒计时。页面上有完整的口径说明，这是周期模型推演、不是价格预测，更不构成投资建议。",
      en: "A live dashboard for the halving-cycle model: every anchor is derived from halving blocks (cycle top, bear bottom, the fifth halving at position 0.5, next top), and the live on-chain block height yields the current cycle position (0 = bear bottom, 1 = bull top), bear-market progress, a countdown to the bottom, and five staged buying levels back-computed from positions 0.20/0.15/0.10/0.05/0.02. Past the bottom it switches to a recovery view with a countdown to the next halving. The methodology is spelled out on the page; it is a cycle model, not a price prediction, and not investment advice.",
      tw: "把減半週期模型做成實時看板：錨點全部由減半區塊推導（牛頂、熊底、第 5 次減半位置 0.5、下輪牛頂），用實時鏈上區塊高度算出當前週期位置（0=熊底、1=牛頂）、熊市進度、距熊底的倒計時，以及按位置 0.20/0.15/0.10/0.05/0.02 倒推的五檔分批建倉日期。越過熊底後自動切換為回升段檢視與距下次減半倒計時。頁面上有完整的口徑說明，這是週期模型推演、不是價格預測，更不構成投資建議。",
    },
    audience: {
      zh: "按四年周期节奏做 BTC 中长线分批布局的投资者。",
      en: "Medium- to long-term BTC investors who stage entries around the four-year cycle.",
      tw: "按四年週期節奏做 BTC 中長線分批佈局的投資者。",
    },
    take: {
      zh: "抄底别凭感觉数日子，这个表把「还有多远、哪天到哪一档」算给你看；记住它是周期推演，仓位节奏还得自己拿捏。",
      en: "Don't count the days to the bottom by feel — this board computes how far is left and when each level arrives. It is a cycle projection, though; position sizing is still on you.",
      tw: "抄底別憑感覺數日子，這個表把「還有多遠、哪天到哪一檔」算給你看；記住它是週期推演，倉位節奏還得自己拿捏。",
    },
  },
  {
    slug: "crcl-panel",
    name: { zh: "CRCL 买入估值面板", en: "CRCL Buy & Valuation Panel",
    tw: "CRCL 買入估值面板" },
    url: "https://18btc.cc/tool/crcl-panel",
    tags: ["crcl"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "CRCL 估值与买入信号：P/S、RSI 与 USDC 数据自动取数打分。",
      en: "CRCL valuation and buy signal: P/S, RSI and USDC data fetched and scored automatically.",
      tw: "CRCL 估值與買入訊號：P/S、RSI 與 USDC 資料自動取數打分。",
    },
    detail: {
      zh: "把「什么时候该买 CRCL」写成不受情绪影响的规则：总分 =（估值层 0–80 + 恐慌层 0–20 + 基本面层 ±10）× 1.3 × 否决乘数，封顶 130。估值层看实时 P/S，恐慌层看 RSI14，基本面层看 USDC 供应量 180 天变化；黑天鹅否决只看 USDC 市占率——份额被对手抢走才打折，全市场一起缩水不触发。面板同时给出流通市值、FDV、P/S(TTM)、市值/调整后 EBITDA、距历史新高与上市低点，以及 USDC 基本面仪表与营收利润表。股价与日线来自 Yahoo Finance，USDC 数据来自 DeFiLlama，股本与利润表为标注了来源与截至日期的可编辑配置。分数是纪律工具，不是预测，不构成投资建议。",
      en: "It turns 'when should I buy CRCL?' into emotion-free rules: total = (valuation layer 0–80 + panic layer 0–20 + fundamentals layer ±10) × 1.3 × veto multiplier, capped at 130. The valuation layer reads live P/S, the panic layer RSI14, the fundamentals layer USDC supply's 180-day change; the black-swan veto watches USDC market share only — share lost to rivals triggers a haircut, a market-wide shrink does not. The panel also shows market cap, FDV, P/S (TTM), market cap / adjusted EBITDA, distance from the all-time high and the post-IPO low, a USDC fundamentals gauge and the revenue & profit table. Prices and daily bars come from Yahoo Finance, USDC data from DeFiLlama; share counts and financials are an editable configuration with sources and as-of dates. The score is a discipline tool, not a prediction, and not investment advice.",
      tw: "把「什麼時候該買 CRCL」寫成不受情緒影響的規則：總分 =（估值層 0–80 + 恐慌層 0–20 + 基本面層 ±10）× 1.3 × 否決乘數，封頂 130。估值層看實時 P/S，恐慌層看 RSI14，基本面層看 USDC 供應量 180 天變化；黑天鵝否決只看 USDC 市佔率——份額被對手搶走才打折，全市場一起縮水不觸發。面板同時給出流通市值、FDV、P/S(TTM)、市值/調整後 EBITDA、距歷史新高與上市低點，以及 USDC 基本面儀表與營收利潤表。股價與日線來自 Yahoo Finance，USDC 資料來自 DeFiLlama，股本與利潤表為標註了來源與截至日期的可編輯配置。分數是紀律工具，不是預測，不構成投資建議。",
    },
    audience: {
      zh: "持有或观望 CRCL、想用规则代替情绪决定分批节奏的投资者。",
      en: "Investors holding or watching CRCL who want rules, not emotions, to pace staged buying.",
      tw: "持有或觀望 CRCL、想用規則代替情緒決定分批節奏的投資者。",
    },
    take: {
      zh: "先看分数再下单：三层分数条把贵不贵、慌不慌、基本面顺不顺一次摊开；记住它只是纪律工具，财报类数字记得看标注的截至日期。",
      en: "Check the score before the order: the three layer bars lay out cheap-or-not, panic-or-not and fundamentals in one view. It is a discipline tool only — and mind the as-of dates on the financial figures.",
      tw: "先看分數再下單：三層分數條把貴不貴、慌不慌、基本面順不順一次攤開；記住它只是紀律工具，財報類數字記得看標註的截至日期。",
    },
  },
  {
    slug: "qqqi-panel",
    name: { zh: "QQQI 攒股收息定投计算器", en: "QQQI Income DCA Calculator",
    tw: "QQQI 攢股收息定投計算器" },
    url: "https://18btc.cc/tool/qqqi-panel",
    tags: ["qqqi"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "QQQI 收息定投计算：现价派息自动取数，逐月模拟期末股数与月息。",
      en: "QQQI income-DCA calculator: live price and payouts, simulated month by month — final shares and monthly income.",
      tw: "QQQI 收息定投計算：現價派息自動取數，逐月模擬期末股數與月息。",
    },
    detail: {
      zh: "给「攒股收息」定投 QQQI 的人做的一页式工具。上半页是自动取数的看板：现价与涨跌、52 周高低与水位、最近一次派息、最近 12 次派息合计（TTM）与当前分红率（TTM ÷ 现价）、最近 24 次派息历史表；估值参考只用收息角度的两把尺——当前分红率在它自身历史（逐月滚动年化口径）中的分位，和股价的 52 周水位，定档规则印在页面上。下半页是定投模拟器：每月定投金额、年限（1–30 年）、假设年分红率（默认带入实时 TTM 分红率）、假设股价年增速、分红再投入开关，逐月模拟出期末总股数、期末月收息、累计投入、累计分红与期末市值，附逐年汇总表。口径提醒：QQQI 是 NEOS 的备兑期权收息 ETF，2024 年 1 月才上市，派息含期权金与可能的资本返还（ROC）成分而非普通股息，分红率不等于总回报；模拟是算术不是预测，不构成投资建议。",
      en: "A one-page tool for investors accumulating QQQI shares for income. The top half is an auto-updating board: price and change, 52-week high/low and position, the latest payout, the trailing-twelve-month distribution total (TTM) and the current distribution rate (TTM ÷ price), plus a table of the last 24 payouts. The valuation reference uses two income-angle rulers only — where the current distribution rate sits in its own history (a rolling monthly percentile) and where the price sits in its 52-week range — with the banding rules printed on the page. The bottom half is the DCA simulator: monthly amount, years (1–30), an assumed annual distribution rate (pre-filled with the live TTM rate), assumed annual price growth and a reinvestment toggle, simulated month by month into final shares, final monthly income, total contributed, total distributions and final value, with a year-by-year table. Mind the caliber: QQQI is NEOS's covered-call income ETF, listed only in January 2024; its payouts include option premium and possibly return of capital (ROC), not ordinary dividends, and the distribution rate is not a total return. The simulation is arithmetic, not a forecast, and nothing here is investment advice.",
      tw: "給「攢股收息」定投 QQQI 的人做的一頁式工具。上半頁是自動取數的看板：現價與漲跌、52 周高低與水位、最近一次派息、最近 12 次派息合計（TTM）與當前分紅率（TTM ÷ 現價）、最近 24 次派息歷史表；估值參考只用收息角度的兩把尺——當前分紅率在它自身歷史（逐月滾動年化口徑）中的分位，和股價的 52 周水位，定檔規則印在頁面上。下半頁是定投模擬器：每月定投金額、年限（1–30 年）、假設年分紅率（預設帶入實時 TTM 分紅率）、假設股價年增速、分紅再投入開關，逐月模擬出期末總股數、期末月收息、累計投入、累計分紅與期末市值，附逐年彙總表。口徑提醒：QQQI 是 NEOS 的備兌期權收息 ETF，2024 年 1 月才上市，派息含期權金與可能的資本返還（ROC）成分而非普通股息，分紅率不等於總回報；模擬是算術不是預測，不構成投資建議。",
    },
    audience: {
      zh: "在定投 QQQI、想按月攒股靠派息滚现金流，并想先把股数与月收息算清楚再动手的收息型投资者。",
      en: "Income investors dollar-cost-averaging into QQQI who want the share count and monthly income worked out before committing.",
      tw: "在定投 QQQI、想按月攢股靠派息滾現金流，並想先把股數與月收息算清楚再動手的收息型投資者。",
    },
    take: {
      zh: "先用模拟器把终局看清楚再定投：同样的月供，开不开分红再投入，十年后股数差出一大截；但记住派息里有 ROC 成分，别只看分红率下单。",
      en: "Run the simulator before you start: on the same monthly amount, reinvesting or not makes a big difference to the share count ten years out. And remember the payouts include ROC — never buy on the distribution rate alone.",
      tw: "先用模擬器把終局看清楚再定投：同樣的月供，開不開分紅再投入，十年後股數差出一大截；但記住派息裡有 ROC 成分，別只看分紅率下單。",
    },
  },
  {
    slug: "flows-panel",
    name: { zh: "交易所资金流与保证金看板", en: "Exchange Flows & Margin Board",
    tw: "交易所資金流與保證金看板" },
    url: "https://18btc.cc/tool/flows-panel",
    tags: ["flows"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "交易所资金流看板：储备、净流入与资金费率一页看，来源逐行标注。",
      en: "Exchange flows board: reserves, netflows and funding rates on one page — sources marked per row.",
      tw: "交易所資金流看板：儲備、淨流入與資金費率一頁看，來源逐行標註。",
    },
    detail: {
      zh: "上半张表是资金流：Binance、OKX、Bybit、Bitfinex、Bitget、Gate、KuCoin、MEXC、HTX、Deribit 等主流交易所的链上储备总额与近 24 小时、7 天、30 天净流入净流出，数据与 DeFiLlama 的 CEX 储备追踪同源（已标记钱包口径，储备剔除各所自家代币如 BNB、OKB）；点开任意一行，能看这家的主要币种构成（前 8 名）和近 35 日储备走势，另附一组按日线余额差算的「余额变化」作交叉核对，并明示它含价格因素、与净流入引擎口径不同。下半张表是保证金（合约）：各所未平仓总额（OI）与 BTC 永续资金费率——OKX、Hyperliquid 走官方接口直取，Binance、Bybit 等官方接口对机房与部分地域 IP 受限，改用 CoinGecko 衍生品聚合，逐行标注来源；多空比因免费公开源暂无可靠口径（官方统计接口受限或已下线）而空缺，页面上如实说明。口径提醒：净流入只是标记钱包的转账净额，不等于用户净申购，更不等于交易所的财务状况；Coinbase、Kraken、Upbit 未被该数据集追踪，不在表内。本工具不构成投资建议。",
      en: "The top table is fund flows: total on-chain reserves and net inflows/outflows over 24h, 7d and 30d for Binance, OKX, Bybit, Bitfinex, Bitget, Gate, KuCoin, MEXC, HTX, Deribit and more, from the same DeFiLlama CEX reserve tracking (labelled-wallet caliber; reserves exclude each exchange's own token such as BNB or OKB). Expanding a row shows that exchange's top-eight asset breakdown and its 35-day reserve trend, plus a balance-change cross-check computed from daily balance differences — labelled as price-contaminated and different in caliber from the net-inflow engine. The bottom table is margin (derivatives): each venue's total open interest (OI) and BTC perpetual funding rate — OKX and Hyperliquid straight from their official APIs, the rest via CoinGecko's derivatives aggregation because their official APIs restrict datacenter and some regional IPs, with the source marked on every row. The long/short ratio is deliberately left blank: no free public source offers a reliable caliber (official statistics endpoints are restricted or retired), and the page says so. Mind the caliber: a net inflow is only the net transfer across labelled wallets — not users' net subscriptions, and not an exchange's financial condition; Coinbase, Kraken and Upbit are not tracked by this dataset and are absent. Nothing here is investment advice.",
      tw: "上半張表是資金流：Binance、OKX、Bybit、Bitfinex、Bitget、Gate、KuCoin、MEXC、HTX、Deribit 等主流交易所的鏈上儲備總額與近 24 小時、7 天、30 天淨流入淨流出，資料與 DeFiLlama 的 CEX 儲備追蹤同源（已標記錢包口徑，儲備剔除各所自家代幣如 BNB、OKB）；點開任意一行，能看這家的主要幣種構成（前 8 名）和近 35 日儲備走勢，另附一組按日線餘額差算的「餘額變化」作交叉核對，並明示它含價格因素、與淨流入引擎口徑不同。下半張表是保證金（合約）：各所未平倉總額（OI）與 BTC 永續資金費率——OKX、Hyperliquid 走官方介面直取，Binance、Bybit 等官方介面對機房與部分地域 IP 受限，改用 CoinGecko 衍生品聚合，逐行標註來源；多空比因免費公開源暫無可靠口徑（官方統計介面受限或已下線）而空缺，頁面上如實說明。口徑提醒：淨流入只是標記錢包的轉賬淨額，不等於使用者淨申購，更不等於交易所的財務狀況；Coinbase、Kraken、Upbit 未被該資料集追蹤，不在表內。本工具不構成投資建議。",
    },
    audience: {
      zh: "想盯交易所资金进出方向、合约杠杆热度与资金费率，再决定仓位节奏的现货与合约交易者。",
      en: "Spot and derivatives traders who watch which way exchange funds are flowing, how hot contract leverage is and where funding sits before sizing positions.",
      tw: "想盯交易所資金進出方向、合約槓桿熱度與資金費率，再決定倉位節奏的現貨與合約交易者。",
    },
    take: {
      zh: "看资金流先认口径：这是标记钱包的转账净额，某所一天净流出几十亿美金多半是大钱包搬家或内部划转的噪声，别看一根红柱子就恐慌；真要交叉验证，点开明细看余额变化和币种构成，两组数对着看才踏实。",
      en: "Read the caliber before the numbers: these are net transfers across labelled wallets, so a multi-billion one-day outflow is usually a big wallet moving or internal shuffling, not a bank run. Cross-check with the row's balance change and asset breakdown before drawing conclusions.",
      tw: "看資金流先認口徑：這是標記錢包的轉賬淨額，某所一天淨流出幾十億美金多半是大錢包搬家或內部劃轉的噪聲，別看一根紅柱子就恐慌；真要交叉驗證，點開明細看餘額變化和幣種構成，兩組數對著看才踏實。",
    },
  },
  {
    slug: "chain-dau-panel",
    name: { zh: "公链日活排行看板", en: "Chain Daily Activity Ranking",
    tw: "公鏈日活排行看板" },
    url: "https://18btc.cc/tool/chain-dau-panel",
    tags: ["chain-dau"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "公链日活排行：24 小时活跃地址排名，带 TVL 与人均锁仓可排序。",
      en: "Chains ranked by 24h active addresses, with TVL and TVL per active address — sortable.",
      tw: "公鏈日活排行：24 小時活躍地址排名，帶 TVL 與人均鎖倉可排序。",
    },
    detail: {
      zh: "一天之内真有人在用的链，从多到少排一排：波场、BSC、Solana、以太坊、比特币、Base、Arbitrum、Polygon、TON 等主流公链过去 24 小时发起过交易的去重地址数（日活），加上日活较 7 天前的变化、每条链的 TVL，以及人均锁仓（TVL ÷ 24h 日活）。数据与 DeFiLlama 的 active-users 指标同源（与其官网 /chains 页同一条管线）：日活走其 metrics 机器接口、TVL 走其 chains 接口自动拼合，接口不可达时回退解析官网页面，缓存约 1 小时。口径如实交代：日活是全量活跃地址口径（主流链按交易发送地址去重，Solana 数签名者，比特币系用 CoinMetrics 活跃地址），地址不等于真人；DeFiLlama 不提供 7 日去重活跃总数，本页不硬拼，只给真实存在的 7 日变化率；Robinhood Chain 尚未被该数据集统计日活，不在榜内。本工具不构成投资建议。",
      en: "The chains people actually used in the last day, ranked: unique addresses that sent a transaction in the past 24 hours (DAU) for Tron, BSC, Solana, Ethereum, Bitcoin, Base, Arbitrum, Polygon, TON and more, plus the DAU change versus 7 days ago, each chain's TVL, and TVL per active address (TVL ÷ 24h DAU). Data shares DeFiLlama's active-users pipeline (the same one behind its /chains page): DAU from its metrics API and TVL from its chains API, joined automatically, with a fallback that parses the public web page if the APIs are unreachable; cached for about an hour. The caliber, stated plainly: DAU counts all active addresses (distinct transaction senders on major chains, signers on Solana, CoinMetrics active addresses for the Bitcoin family), and an address is not a person; DeFiLlama publishes no deduplicated 7-day active total, so this board shows only the real 7-day change rate instead of stitching one together; Robinhood Chain's activity is not yet tracked by this dataset and is absent. Not investment advice.",
      tw: "一天之內真有人在用的鏈，從多到少排一排：波場、BSC、Solana、以太坊、比特幣、Base、Arbitrum、Polygon、TON 等主流公鏈過去 24 小時發起過交易的去重地址數（日活），加上日活較 7 天前的變化、每條鏈的 TVL，以及人均鎖倉（TVL ÷ 24h 日活）。資料與 DeFiLlama 的 active-users 指標同源（與其官網 /chains 頁同一條管線）：日活走其 metrics 機器介面、TVL 走其 chains 介面自動拼合，介面不可達時回退解析官網頁面，快取約 1 小時。口徑如實交代：日活是全量活躍地址口徑（主流鏈按交易傳送地址去重，Solana 數簽名者，比特幣系用 CoinMetrics 活躍地址），地址不等於真人；DeFiLlama 不提供 7 日去重活躍總數，本頁不硬拼，只給真實存在的 7 日變化率；Robinhood Chain 尚未被該資料集統計日活，不在榜內。本工具不構成投資建議。",
    },
    audience: {
      zh: "想快速判断一条公链到底有没有真实使用、是人多还是钱多，再决定去哪条链上交互、发币或投研的使用者与研究者。",
      en: "Users and researchers who want a quick read on whether a chain has real usage — people, money, or both — before choosing where to transact, launch or dig deeper.",
      tw: "想快速判斷一條公鏈到底有沒有真實使用、是人多還是錢多，再決定去哪條鏈上互動、發幣或投研的使用者與研究者。",
    },
    take: {
      zh: "看日活先分清「人」和「钱」：日活高、人均锁仓低的是散户大本营，日活不高、人均锁仓畸高的多半是资金盘着不动；两个数对着看，比单看 TVL 或单看日活都靠谱。还有一句：地址不是人，女巫和机器人最爱把日活刷出虚胖。",
      en: "Read DAU as two numbers, not one: high DAU with low TVL-per-address is retail country; modest DAU with very high TVL-per-address is mostly money parked still. The pair beats either metric alone — and remember an address is not a person: sybils and bots love inflating DAU.",
      tw: "看日活先分清「人」和「錢」：日活高、人均鎖倉低的是散戶大本營，日活不高、人均鎖倉畸高的多半是資金盤著不動；兩個數對著看，比單看 TVL 或單看日活都靠譜。還有一句：地址不是人，女巫和機器人最愛把日活刷出虛胖。",
    },
  },
  {
    slug: "qqq-panel",
    name: { zh: "QQQ 定投回测计算器", en: "QQQ DCA Backtest Calculator",
    tw: "QQQ 定投回測計算器" },
    url: "https://18btc.cc/tool/qqq-panel",
    tags: ["qqq"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "QQQ 定投回测：现价与估值温度自动取数，全史月线算年化回撤。",
      en: "QQQ DCA backtest: live price and valuation temperature, full-history monthly data — annualised return and drawdown.",
      tw: "QQQ 定投回測：現價與估值溫度自動取數，全史月線算年化回撤。",
    },
    detail: {
      zh: "给长期定投 QQQ 的人做的一页式工具。上半页是自动取数的看板：现价与涨跌、历史最高收盘（ATH，收盘口径）与距 ATH 回撤、52 周高低与水位、MA200 偏离，PE 取得到时一并列出；估值温度把 MA200 偏离、距 ATH 回撤、52 周水位（PE 可用时四项）各打一个子分再取平均，定档为偏冷/中性偏冷/中性偏热/偏热，子分公式与阈值全部印在页面上——它是指标刻度，不是买卖信号。下半页是定投回测器：数据是 QQQ 自 1999 年 3 月上市以来的全史月收盘与季度分红，任选起始年月、每月定投金额、分红再投入开关，输出累计投入、期末股数、摊薄成本对比期末价、期末总资产、累计分红、年化收益率（按月现金流 XIRR 近似）、期间标的最大回撤（月线总回报口径）与逐年汇总表，并附一条对比线：同一笔总投入在起始月一次性买入的结果。口径提醒：回测每月按当月收盘价买入，分红按上月末持股计，未计税费与汇率；历史回测不代表未来，不构成投资建议。",
      en: "A one-page tool for long-term QQQ dollar-cost averagers. The top half is an auto-updating board: price and change, the all-time high close (closing basis) and drawdown from it, the 52-week high/low and position, the distance to the 200-day average, and P/E when available. The valuation temperature scores each of the MA200 deviation, ATH drawdown and 52-week position (four inputs when P/E is available) and averages them into cold / cool-neutral / warm-neutral / hot bands, with every subscore formula and threshold printed on the page — it is a metric scale, not a buy or sell signal. The bottom half is the DCA backtester: QQQ's full monthly closes and quarterly dividends since its March 1999 listing, with any start month, a monthly amount and a dividend-reinvestment toggle, producing total contributed, final shares, diluted cost versus the final price, final total assets, total dividends, annualised return (an XIRR approximation over monthly cash flows), the underlying's max drawdown in the window (monthly total-return basis) and a year-by-year table — plus a comparison line for investing the same total as a lump sum at the start. Methodology notes: the backtest buys at each month's close, dividends are computed on the previous month-end share count, and taxes and FX are excluded. A backtest is history, not a forecast, and nothing here is investment advice.",
      tw: "給長期定投 QQQ 的人做的一頁式工具。上半頁是自動取數的看板：現價與漲跌、歷史最高收盤（ATH，收盤口徑）與距 ATH 回撤、52 周高低與水位、MA200 偏離，PE 取得到時一併列出；估值溫度把 MA200 偏離、距 ATH 回撤、52 周水位（PE 可用時四項）各打一個子分再取平均，定檔為偏冷/中性偏冷/中性偏熱/偏熱，子分公式與閾值全部印在頁面上——它是指標刻度，不是買賣訊號。下半頁是定投回測器：資料是 QQQ 自 1999 年 3 月上市以來的全史月收盤與季度分紅，任選起始年月、每月定投金額、分紅再投入開關，輸出累計投入、期末股數、攤薄成本對比期末價、期末總資產、累計分紅、年化收益率（按月現金流 XIRR 近似）、期間標的最大回撤（月線總回報口徑）與逐年彙總表，並附一條對比線：同一筆總投入在起始月一次性買入的結果。口徑提醒：回測每月按當月收盤價買入，分紅按上月末持股計，未計稅費與匯率；歷史回測不代表未來，不構成投資建議。",
    },
    audience: {
      zh: "在按月定投 QQQ、想知道现在贵不贵、并想用真实历史检验自己定投方案的人。",
      en: "Investors dollar-cost-averaging into QQQ who want to know how stretched the price is and to test their plan against real history.",
      tw: "在按月定投 QQQ、想知道現在貴不貴、並想用真實歷史檢驗自己定投方案的人。",
    },
    take: {
      zh: "先拉一遍 2000 年起的回测再定投：看清最惨的时候账户要扛多深、一次性买入和定投差多少，再决定月供和心态；估值温度只当仪表盘看，别当择时器用。",
      en: "Run the backtest from 2000 before you start: see how deep the worst stretch gets and how DCA compares with a lump sum, then set your monthly amount and your expectations. Treat the temperature as a dashboard gauge, not a timing device.",
      tw: "先拉一遍 2000 年起的回測再定投：看清最慘的時候賬戶要扛多深、一次性買入和定投差多少，再決定月供和心態；估值溫度只當儀表盤看，別當擇時器用。",
    },
  },
  {
    slug: "filetime",
    name: { zh: "照片/文件时间修改", en: "Photo & File Time Editor",
    tw: "照片/檔案時間修改" },
    url: "https://18btc.cc/tool/filetime",
    tags: ["filetime"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "照片 EXIF 时间批量改：统一、平移、递增三种改法，本地不上传。",
      en: "Batch-edit photo EXIF timestamps — set, shift or step — processed locally, never uploaded.",
      tw: "照片 EXIF 時間批次改：統一、平移、遞增三種改法，本地不上傳。",
    },
    detail: {
      zh: "照片的时间分两处：电脑里文件的系统时间，和照片文件内嵌的 EXIF 时间。这个站内工具改后一处：把 JPEG 照片的拍摄时间（DateTimeOriginal）、创建时间（DateTimeDigitized）、修改时间（ModifyDate）三者同步改掉，GPS、设备等其余 EXIF 原样保留。三种批量模式——统一设为某一时刻、按 ±天/时/分整体平移、从起始时间按张递增（批量补打卡序列用）；改前改后逐张对照核对，再单张下载或打包 ZIP。全部处理在浏览器本地完成，照片不上传任何服务器。边界要讲清：网页改不了你硬盘上已有文件的系统创建时间/修改时间，下载回去的文件其系统修改时间会是下载时刻——相册排序、打卡补传读的是 EXIF 时间，所以多数照片场景本工具就够；确需改本地文件系统时间，用同标签收录的桌面版 NewFileTime。",
      en: "A photo's date lives in two places: the system timestamps of the file on disk, and the EXIF times embedded in the photo. This on-site tool edits the second: it rewrites a JPEG's date taken (DateTimeOriginal), digitized (DateTimeDigitized) and modified (ModifyDate) times together, leaving GPS, device info and all other EXIF untouched. Three batch modes — set one moment for all, shift everything by ±days/hours/minutes, or step from a start time photo by photo (for back-filling a check-in sequence) — with a before/after comparison per photo, then single downloads or one ZIP. All processing happens locally in your browser; photos are never uploaded. The boundary, stated plainly: a web page cannot change the system created/modified times of files already on your disk, and a downloaded file's system modified time will be the download moment — but album sorting and attendance back-fills read the EXIF time, so most photo scenarios are covered here. If you truly need to change local files' system timestamps, use the desktop NewFileTime listed under the same tag.",
      tw: "照片的時間分兩處：電腦裡檔案的系統時間，和照片檔案內嵌的 EXIF 時間。這個站內工具改後一處：把 JPEG 照片的拍攝時間（DateTimeOriginal）、建立時間（DateTimeDigitized）、修改時間（ModifyDate）三者同步改掉，GPS、裝置等其餘 EXIF 原樣保留。三種批次模式——統一設為某一時刻、按 ±天/時/分整體平移、從起始時間按張遞增（批次補打卡序列用）；改前改後逐張對照核對，再單張下載或打包 ZIP。全部處理在瀏覽器本地完成，照片不上傳任何伺服器。邊界要講清：網頁改不了你硬碟上已有檔案的系統建立時間/修改時間，下載回去的檔案其系統修改時間會是下載時刻——相簿排序、打卡補傳讀的是 EXIF 時間，所以多數照片場景本工具就夠；確需改本地檔案系統時間，用同標籤收錄的桌面版 NewFileTime。",
    },
    audience: {
      zh: "相机时间设错需要批量纠正、整理扫描照片日期、按 EXIF 时间补打卡序列的人。",
      en: "Anyone fixing a wrong camera clock in bulk, tidying scanned-photo dates, or back-filling a check-in sequence by EXIF time.",
      tw: "相機時間設錯需要批次糾正、整理掃描照片日期、按 EXIF 時間補打卡序列的人。",
    },
    take: {
      zh: "先分清改的是哪种时间：相册和打卡认 EXIF，这个网页版当场就能改；资源管理器里那个系统时间得靠桌面版，别下错工具。",
      en: "Be clear which clock you're changing: albums and check-ins read EXIF, which this web tool edits on the spot; the system timestamps in your file manager need the desktop app — don't grab the wrong tool.",
      tw: "先分清改的是哪種時間：相簿和打卡認 EXIF，這個網頁版當場就能改；資源管理器裡那個系統時間得靠桌面版，別下錯工具。",
    },
  },
  {
    slug: "newfiletime",
    name: { zh: "NewFileTime（桌面版）", en: "NewFileTime (Desktop)",
    tw: "NewFileTime（桌面版）" },
    url: "https://www.softwareok.com/?seite=Freeware/NewFileTime",
    tags: ["filetime"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "Windows 便携时间工具：改文件的创建、修改、访问时间，免安装。",
      en: "A portable Windows utility: edit created, modified and accessed timestamps of local files — no install.",
      tw: "Windows 便攜時間工具：改檔案的建立、修改、訪問時間，免安裝。",
    },
    detail: {
      zh: "SoftwareOK 出品的老牌 Windows 小工具（当前 8.33 版），绿色便携、免安装、免费。它调用系统接口，直接修改你电脑上文件与文件夹的创建时间、修改时间与访问时间——正是网页版做不到的那件事。支持拖放批量添加、按文件夹（含子目录）导入、把文件批量变「年轻」或「变老」（整体平移）、按文件名生成时间戳、夏令时/冬令时一小时纠偏，还能通过资源管理器右键菜单调用。需要纠正相机导出的文件系统时间、整理下载文件的日期时，用它在本地改最直接。",
      en: "A long-standing Windows utility from SoftwareOK (currently v8.33): portable, no install, free. It talks to the OS directly and changes the created, modified and accessed timestamps of files and folders on your own machine — exactly the thing a web page cannot do. It supports drag-and-drop batch adding, importing whole folders (including subfolders), making files proportionally younger or older (bulk shift), generating timestamps from file names, one-hour daylight-saving corrections, and invocation from the Explorer context menu. When the system timestamps of camera exports or downloads need fixing, this is the direct local way.",
      tw: "SoftwareOK 出品的老牌 Windows 小工具（當前 8.33 版），綠色便攜、免安裝、免費。它呼叫系統介面，直接修改你電腦上檔案與資料夾的建立時間、修改時間與訪問時間——正是網頁版做不到的那件事。支援拖放批次新增、按資料夾（含子目錄）匯入、把檔案批次變「年輕」或「變老」（整體平移）、按檔名生成時間戳、夏令時/冬令時一小時糾偏，還能透過資源管理器右鍵選單呼叫。需要糾正相機匯出的檔案系統時間、整理下載檔案的日期時，用它在本地改最直接。",
    },
    audience: {
      zh: "需要直接修改 Windows 本地文件/文件夹系统时间的用户，尤其是批量整理照片与下载文件日期的人。",
      en: "Users who need to change the system timestamps of local Windows files/folders directly — especially bulk-fixing photo and download dates.",
      tw: "需要直接修改 Windows 本地檔案/資料夾系統時間的使用者，尤其是批次整理照片與下載檔案日期的人。",
    },
    take: {
      zh: "网页版改 EXIF、桌面版改系统时间，分工明确；它几百 KB、免安装，纠正文件日期时比任何在线工具都靠谱——注意只支持 Windows。",
      en: "The web tool edits EXIF; this desktop app edits system timestamps — a clear division of labour. It is a few hundred KB, needs no install, and beats any online tool for fixing file dates. Windows only, note.",
      tw: "網頁版改 EXIF、桌面版改系統時間，分工明確；它幾百 KB、免安裝，糾正檔案日期時比任何線上工具都靠譜——注意只支援 Windows。",
    },
  },
  {
    slug: "pdfbox",
    name: { zh: "PDF 工具箱", en: "PDF Toolbox",
    tw: "PDF 工具箱" },
    url: "https://18btc.cc/tool/pdfbox",
    tags: ["pdf"],
    addedAt: "2026-11-01",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "本地 PDF 工具箱：合并拆分、水印页码、骑缝章与图片互转，不上传。",
      en: "A local PDF toolbox: merge, split, watermarks, page numbers, cross-page seals and image conversion — never uploaded.",
      tw: "本地 PDF 工具箱：合併拆分、水印頁碼、騎縫章與圖片互轉，不上傳。",
    },
    detail: {
      zh: "参考信创 PDF 工具箱的功能集，在浏览器里把 PDF 的日常处理一次做全：多个 PDF 合并（可调序）、按页码范围拆分或逐页拆分、页面缩略图管理（删除、旋转、重排、插入同尺寸空白页）、文字水印（平铺或居中，透明度与角度可调）、页码添加（六个位置、数字或中文「第 X 页 共 N 页」格式）、骑缝章（印章图按页数自动切片逐页盖在右侧边缘，拼起来是完整一枚）、指定页文字批注，以及图片转 PDF 与 PDF 逐页转图片。全部处理都在你的浏览器本地完成：文件不经过任何服务器，断网也能用，尤其适合合同、证件、财务单据这类不该上传的文件。边界讲清：不做 PDF 转 Word/Excel（纯前端做不出可用的排版保真度），不做 OCR，也不做具法律效力的电子签章——骑缝章是把印章图按传统骑缝方式盖上，不替代 CA 电子签。",
      en: "Modelled on the Xinchuang PDF toolbox's feature set, it covers everyday PDF work in the browser: merge multiple PDFs (reorderable), split by page ranges or page-by-page, manage pages as thumbnails (delete, rotate, reorder, insert a blank page of the same size), text watermarks (tiled or centred, adjustable opacity and angle), page numbers (six positions; numeric or Chinese 'page X of N' formats), cross-page seals — the stamp image is sliced across all pages and placed on the right edge of each, reassembling into one complete seal — text annotations on a chosen page, and image→PDF / PDF→image conversion. Everything runs locally in your browser: files never pass through a server, it works offline, which suits contracts, ID scans and financial documents that should not be uploaded. The boundaries, plainly: no PDF→Word/Excel (a pure front-end cannot keep the layout usable), no OCR, and no legally binding e-signatures — the cross-page seal stamps the image the traditional perforation way and does not replace a CA-issued electronic seal.",
      tw: "參考信創 PDF 工具箱的功能集，在瀏覽器裡把 PDF 的日常處理一次做全：多個 PDF 合併（可調序）、按頁碼範圍拆分或逐頁拆分、頁面縮圖管理（刪除、旋轉、重排、插入同尺寸空白頁）、文字水印（平鋪或居中，透明度與角度可調）、頁碼新增（六個位置、數字或中文「第 X 頁 共 N 頁」格式）、騎縫章（印章圖按頁數自動切片逐頁蓋在右側邊緣，拼起來是完整一枚）、指定頁文字批註，以及圖片轉 PDF 與 PDF 逐頁轉圖片。全部處理都在你的瀏覽器本地完成：檔案不經過任何伺服器，斷網也能用，尤其適合合同、證件、財務單據這類不該上傳的檔案。邊界講清：不做 PDF 轉 Word/Excel（純前端做不出可用的排版保真度），不做 OCR，也不做具法律效力的電子簽章——騎縫章是把印章圖按傳統騎縫方式蓋上，不替代 CA 電子籤。",
    },
    audience: {
      zh: "经常处理合同、标书、证件扫描件，需要合并拆分页码骑缝章、又不放心把文件传上云的行政、财务与法务人员。",
      en: "Admin, finance and legal staff who handle contracts, bids and ID scans, need merging, splitting, page numbers and cross-page seals, and don't want those files on someone else's server.",
      tw: "經常處理合同、標書、證件掃描件，需要合併拆分頁碼騎縫章、又不放心把檔案傳上雲的行政、財務與法務人員。",
    },
    take: {
      zh: "内网和涉密场景才是它的主场：打开页面就能干活，网线拔了照样跑；骑缝章切片对齐我们逐页验过，别拿它当 CA 电子签用就行。",
      en: "Its home turf is intranets and sensitive documents: open the page and work, network cable optional. We verified the seal slices align page by page — just don't mistake it for a CA e-signature.",
      tw: "內網和涉密場景才是它的主場：開啟頁面就能幹活，網線拔了照樣跑；騎縫章切片對齊我們逐頁驗過，別拿它當 CA 電子籤用就行。",
    },
  },
  {
    slug: "hongguo",
    name: { zh: "红果短剧桌面版（第三方客户端）", en: "Hongguo Short Drama Desktop (Third-party Client)",
    tw: "紅果短劇桌面版（第三方客戶端）" },
    url: "https://github.com/waligoraamodio288-rgb/hongguo-desktop-releases",
    tags: ["video"],
    addedAt: "2026-11-01",
    type: "third-party",
    oneLiner: {
      zh: "红果短剧第三方客户端：把短剧搬上电脑和电视，找剧续播都方便。",
      en: "A third-party Hongguo client for PC and TV: search dramas and pick up where you left off.",
      tw: "紅果短劇第三方客戶端：把短劇搬上電腦和電視，找劇續播都方便。",
    },
    detail: {
      zh: "红果短剧官方只有手机 App，这个由「渠道有数」独立维护的第三方客户端把找剧和追剧搬到了大屏：Windows 10/11 正式版（当前 1.0.19）、Mac M 系列测试版、Android TV / 盒子 / 投影测试版。功能上有分类浏览、搜索、收藏、选集、倍速、自动连播和本机续播进度，还有上班摸鱼用的老板键（默认 Ctrl+Shift+B，隐藏窗口并自动暂停）；1.0.19 还能只读查看你手机上的云片单。通过它的 GitHub 发行仓库免费下载，仓库里同时有各版本的说明、已知问题和 SHA-256 校验值。它与红果官方没有关系：内容来自红果的内容服务，能不能播取决于服务与网络状况；观看记录和收藏只保存在当前设备，不与手机 App 同步。",
      en: "Hongguo (ByteDance's free short-drama app) officially ships only on phones. This third-party client, maintained independently by Qudao Youshu, brings drama hunting and bingeing to bigger screens: a stable Windows 10/11 build (currently 1.0.19), a Mac beta for Apple Silicon, and an Android TV / box / projector beta. It offers category browsing, search, favourites, episode picking, playback speed, auto-play-next and on-device resume, plus a boss key (Ctrl+Shift+B by default) that hides the window and pauses. Version 1.0.19 can also read your phone's cloud playlist (read-only). Downloads are free from its GitHub releases repo, which also carries per-version notes, known issues and SHA-256 checksums. It is not affiliated with the official app: content comes from Hongguo's service, so playback depends on that service and your network, and your history and favourites live only on the device — nothing syncs with the phone app.",
      tw: "紅果短劇官方只有手機 App，這個由「渠道有數」獨立維護的第三方客戶端把找劇和追劇搬到了大屏：Windows 10/11 正式版（當前 1.0.19）、Mac M 系列測試版、Android TV / 盒子 / 投影測試版。功能上有分類瀏覽、搜尋、收藏、選集、倍速、自動連播和本機續播進度，還有上班摸魚用的老闆鍵（預設 Ctrl+Shift+B，隱藏視窗並自動暫停）；1.0.19 還能只讀檢視你手機上的雲片單。透過它的 GitHub 發行倉庫免費下載，倉庫裡同時有各版本的說明、已知問題和 SHA-256 校驗值。它與紅果官方沒有關係：內容來自紅果的內容服務，能不能播取決於服務與網路狀況；觀看記錄和收藏只儲存在當前裝置，不與手機 App 同步。",
    },
    audience: {
      zh: "想在电脑或电视大屏上看红果短剧、不想一直举着手机的人。",
      en: "Anyone who wants to watch Hongguo short dramas on a computer or TV instead of holding a phone.",
      tw: "想在電腦或電視大屏上看紅果短劇、不想一直舉著手機的人。",
    },
    take: {
      zh: "实测提醒：它是非官方第三方客户端，且 Windows 安装包没有发布者代码签名，安装时系统弹出「未知发布者」是正常现象——务必只从这个原发行仓库下载、别用乱七八糟的镜像站，并可对照仓库公布的 SHA-256 核对安装包；Mac 版未经公证、仍是测试版，播放可用性也要看当时的内容服务状态。",
      en: "Hands-on notes: this is an unofficial third-party client, and the Windows installer carries no publisher code signature, so an 'unknown publisher' prompt on install is expected — download only from this original releases repo (never random mirrors) and check the installer against the SHA-256 the repo publishes. The Mac build is unnotarised and still a beta, and playback availability depends on the content service at the time.",
      tw: "實測提醒：它是非官方第三方客戶端，且 Windows 安裝包沒有釋出者程式碼簽名，安裝時系統彈出「未知釋出者」是正常現象——務必只從這個原發行倉庫下載、別用亂七八糟的映象站，並可對照倉庫公佈的 SHA-256 核對安裝包；Mac 版未經公證、仍是測試版，播放可用性也要看當時的內容服務狀態。",
    },
  },
  {
    slug: "ocr-tool",
    name: { zh: "图片文字识别 OCR（本地版）", en: "Image OCR — Local, In-Browser",
    tw: "圖片文字識別 OCR（本地版）" },
    url: "https://18btc.cc/tool/ocr-tool",
    tags: ["ocr"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "浏览器本地 OCR：图片文字批量识别，中英混合、不上传可导出。",
      en: "Local browser OCR: recognise text from image batches — mixed Chinese/English, never uploaded, exportable.",
      tw: "瀏覽器本地 OCR：圖片文字批次識別，中英混合、不上傳可匯出。",
    },
    detail: {
      zh: "基于开源 Tesseract 引擎的本地 OCR：拖放、点击或粘贴导入图片（一次最多 20 张），识别在你浏览器的 Web Worker 里逐张排队完成，简体中文与英文混合识别，也可切纯中文 / 纯英文模式提速。结果按行列出，点任意一行，左侧原图上会把这一行框出来对位核对；认错的字可以直接在行内改掉。导出有单张 TXT、全部合成 Markdown、全部合成 TXT、Word 文档（.docx）和按图打包 ZIP（每张图一个同名 .txt）。代价讲清楚：第一次使用要联网下载识别模型（WASM 核心加中英文语言包，共几十 MB），下完之后浏览器会缓存、断网也能用；效果上印刷体、截图、单据是主场，手写字和复杂表格版面明显不如云端大厂 OCR——换来的是图片从头到尾不离开你的设备，证件、合同、聊天截图这类敏感图片不用先过别人的服务器。",
      en: "Local OCR powered by the open-source Tesseract engine: drag, click or paste to import images (up to 20 at a time); recognition runs in a Web Worker in your browser, one image at a time, in mixed Simplified-Chinese + English, with Chinese-only or English-only modes for speed. Results are listed line by line — click any line and that line is boxed on the original image so you can check it in place — and misread characters can be fixed right in the line. Exports: a single image's TXT, all results as Markdown, all as one TXT, a Word document (.docx), or a ZIP with one same-named .txt per image. The cost, stated plainly: the first run downloads the recognition models online (the WASM core plus the Chinese and English language packs, tens of MB in total); once cached it works offline. Print, screenshots and forms are its strength; handwriting and complex table layouts are clearly weaker than big-cloud OCR — in exchange, your images never leave your device, which matters for ID scans, contracts and chat screenshots.",
      tw: "基於開源 Tesseract 引擎的本地 OCR：拖放、點選或貼上匯入圖片（一次最多 20 張），識別在你瀏覽器的 Web Worker 裡逐張排隊完成，簡體中文與英文混合識別，也可切純中文 / 純英文模式提速。結果按行列出，點任意一行，左側原圖上會把這一行框出來對位核對；認錯的字可以直接在行內改掉。匯出有單張 TXT、全部合成 Markdown、全部合成 TXT、Word 文件（.docx）和按圖打包 ZIP（每張圖一個同名 .txt）。代價講清楚：第一次使用要聯網下載識別模型（WASM 核心加中英文語言包，共幾十 MB），下完之後瀏覽器會快取、斷網也能用；效果上印刷體、截圖、單據是主場，手寫字和複雜表格版面明顯不如雲端大廠 OCR——換來的是圖片從頭到尾不離開你的裝置，證件、合同、聊天截圖這類敏感圖片不用先過別人的伺服器。",
    },
    audience: {
      zh: "要把截图、扫描件、单据照片转成可编辑文字，又不想把图片上传到第三方网站的人：行政、财务、学生和做资料整理的人最常用。",
      en: "Anyone who needs text out of screenshots, scans or photos of documents without uploading the images to a third-party site — admin, finance, students and anyone tidying up documents.",
      tw: "要把截圖、掃描件、單據照片轉成可編輯文字，又不想把圖片上傳到第三方網站的人：行政、財務、學生和做資料整理的人最常用。",
    },
    take: {
      zh: "实测口径：中英混合的印刷体截图识别够稳，逐行高亮对照改错很省事；第一次打开要等模型下载，急用先点一张图把模型拉下来。手写和表格别为难它，那是云端 OCR 的活。",
      en: "Field notes: printed mixed Chinese/English screenshots recognise reliably, and the line-highlight proofreading saves real time. The first open waits on the model download — feed it one image early to warm the cache. Don't ask it to do handwriting or tables; that's cloud OCR's job.",
      tw: "實測口徑：中英混合的印刷體截圖識別夠穩，逐行高亮對照改錯很省事；第一次開啟要等模型下載，急用先點一張圖把模型拉下來。手寫和表格別為難它，那是雲端 OCR 的活。",
    },
  },
  {
    slug: "imgpeel",
    name: { zh: "ImgPeel 图片文字识别", en: "ImgPeel — Image to Text OCR",
    tw: "ImgPeel 圖片文字識別" },
    url: "https://imgpeel.toolooz.com/zh-CN",
    tags: ["ocr"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "在线图片文字识别：浏览器本地 OCR 不上传，多语种可导出。",
      en: "Online image-to-text OCR that runs locally in the browser — many languages, no uploads, exportable results.",
      tw: "線上圖片文字識別：瀏覽器本地 OCR 不上傳，多語種可匯出。",
    },
    detail: {
      zh: "ImgPeel 是 toolooz 旗下的一款在线 OCR 工具，形态是纯网页、打开即用：把图片拖进去做文字识别，按其官网介绍支持简体、繁体、英文、韩语、日语、俄语等多国语言，识别结果可以复制或下载为 TXT、Markdown、Word，也支持批量识别；和本站的本地 OCR 一样，它强调图片不上传、识别在浏览器本地完成。本站的文字识别工具在产品形态上参考了它（本地识别、批量、逐行对照、多格式导出），但两者是各自独立的实现与站点：语言覆盖上 ImgPeel 更广（多语种），本站工具则胜在与导航站一体、逐行高亮对照原图这一步做得更细。两个都是免费、无需注册，需要哪种直接用哪种。",
      en: "ImgPeel is an online OCR tool by toolooz — a pure web app that works on open: drop an image in for text recognition. Per its official site it covers Simplified and Traditional Chinese, English, Korean, Japanese, Russian and more languages; results can be copied or downloaded as TXT, Markdown or Word, and batch recognition is supported. Like this site's local OCR it stresses that images are not uploaded and recognition happens locally in the browser. Our OCR tool takes its product shape from ImgPeel (local recognition, batching, line-by-line checking, multi-format export) but the two are independent implementations on independent sites: ImgPeel covers more languages, while ours is integrated with this hub and does the line-highlight proofreading step in more detail. Both are free with no sign-up — use whichever fits.",
      tw: "ImgPeel 是 toolooz 旗下的一款線上 OCR 工具，形態是純網頁、開啟即用：把圖片拖進去做文字識別，按其官網介紹支援簡體、繁體、英文、韓語、日語、俄語等多國語言，識別結果可以複製或下載為 TXT、Markdown、Word，也支援批次識別；和本站的本地 OCR 一樣，它強調圖片不上傳、識別在瀏覽器本地完成。本站的文字識別工具在產品形態上參考了它（本地識別、批次、逐行對照、多格式匯出），但兩者是各自獨立的實現與站點：語言覆蓋上 ImgPeel 更廣（多語種），本站工具則勝在與導航站一體、逐行高亮對照原圖這一步做得更細。兩個都是免費、無需註冊，需要哪種直接用哪種。",
    },
    audience: {
      zh: "需要识别繁体或韩日俄等更多语种图片文字、或想多一个本地 OCR 备选的人。",
      en: "People who need Traditional Chinese, Korean, Japanese, Russian or other extra languages recognised, or who want a second local-OCR option.",
      tw: "需要識別繁體或韓日俄等更多語種圖片文字、或想多一個本地 OCR 備選的人。",
    },
    take: {
      zh: "同类里少见的老实工具：不上传、免注册、导出格式齐。多语种识别找它，中英混合加逐行对照核稿用本站内置的那个，两个配合着用正好。",
      en: "A refreshingly honest entry in its class: no uploads, no sign-up, a full set of export formats. Use it for extra languages; use the built-in one here for mixed Chinese/English with line-by-line proofreading — they complement each other.",
      tw: "同類裡少見的老實工具：不上傳、免註冊、匯出格式齊。多語種識別找它，中英混合加逐行對照核稿用本站內建的那個，兩個配合著用正好。",
    },
  },
  {
    slug: "slang-dict",
    name: { zh: "二手黑话词典", en: "Secondhand Slang Dictionary",
    tw: "二手黑話詞典" },
    url: "https://18btc.cc/tool/slang-dict",
    tags: ["slang"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "二手平台黑话词典：暗语站内直接查，带潜台词解析与避坑提示。",
      en: "A secondhand-market slang dictionary: look up coded phrases in-site, with the real intent and buyer warnings.",
      tw: "二手平臺黑話詞典：暗語站內直接查，帶潛臺詞解析與避坑提示。",
    },
    detail: {
      zh: "给二手买家做的解码词典，数据来自 GitHub 上的 MIT 开源词库 awesome-chinese-secondhand-slang，本站服务端每日自动同步（当前 149 个主题词条、5,082 个黑话变体，数字随上游更新）。用法：直接搜黑话、标准名或含义（如「矿渣」「全绿」「克劳格」），或按 27 个分类、按存活状态（现行可用 / 抽检限流 / 平台拦截）筛；每张词条卡列全变体、百科释义、卖家潜台词、买家避坑、当前动态与接棒新词，并标注风险等级。页面下方还有拼音首字母缩写反查：输入 cld、ga、xd 这类字母暗号，命中上游速查表与变体里真实带这个暗号的词条。定位与边界写在明处：本站只帮买家看懂黑话、避坑验货，不提供把正常文案转成黑话的卖家排雷转译，上游数据中给卖家的规避建议字段本站不展示。词条原文的版权归上游开源项目与贡献者所有（MIT License）。",
      en: "A decoding dictionary for secondhand buyers, powered by the MIT-licensed open-source awesome-chinese-secondhand-slang dictionary on GitHub, synced daily by our server (currently 149 topic entries and 5,082 slang variants, moving with upstream). Search slang, standard names or meanings, or filter by the 27 categories and by survival status (active / throttled / platform-blocked); each entry card lists all variants, a plain-language explanation, what the seller really means, buyer warnings, the current situation, successor slang and a risk level. A pinyin-initial abbreviation lookup sits below: type letter codes like cld, ga or xd to hit the upstream quick table and the entries whose variants actually carry that code. The boundary is stated plainly: this site only helps buyers understand slang and avoid pitfalls — there is no seller-side listing-to-slang translator, and the upstream dataset's advice-for-sellers field is not displayed. Entry texts belong to the upstream open-source project and its contributors (MIT License).",
      tw: "給二手買家做的解碼詞典，資料來自 GitHub 上的 MIT 開源詞庫 awesome-chinese-secondhand-slang，本站服務端每日自動同步（當前 149 個主題詞條、5,082 個黑話變體，數字隨上游更新）。用法：直接搜黑話、標準名或含義（如「礦渣」「全綠」「克勞格」），或按 27 個分類、按存活狀態（現行可用 / 抽檢限流 / 平臺攔截）篩；每張詞條卡列全變體、百科釋義、賣家潛臺詞、買家避坑、當前動態與接棒新詞，並標註風險等級。頁面下方還有拼音首字母縮寫反查：輸入 cld、ga、xd 這類字母暗號，命中上游速查表與變體裡真實帶這個暗號的詞條。定位與邊界寫在明處：本站只幫買家看懂黑話、避坑驗貨，不提供把正常文案轉成黑話的賣家排雷轉譯，上游資料中給賣家的規避建議欄位本站不展示。詞條原文的版權歸上游開源專案與貢獻者所有（MIT License）。",
    },
    audience: {
      zh: "在闲鱼、转转、小红书淘二手，怕被黑话话术绕进去、想先查清成色与套路再下单的买家。",
      en: "Secondhand buyers on Xianyu, Zhuanzhuan and Xiaohongshu who want to decode the pitch and check the pitfalls before paying.",
      tw: "在閒魚、轉轉、小紅書淘二手，怕被黑話話術繞進去、想先查清成色與套路再下單的買家。",
    },
    take: {
      zh: "下单前花十秒搜一下标题里的生词：很多「捡漏」看完卖家潜台词就冷静了。状态标成平台拦截的词更要留心——卖家还在用的，往往不是为了卖货，是为了把你引出平台。",
      en: "Spend ten seconds searching the unfamiliar words in a listing title before you pay: many a 'bargain' looks different once you've read what the seller really means. Be extra careful with terms flagged as platform-blocked — when a seller still uses them, the point is often not the item but getting you off the platform.",
      tw: "下單前花十秒搜一下標題裡的生詞：很多「撿漏」看完賣家潛臺詞就冷靜了。狀態標成平臺攔截的詞更要留心——賣家還在用的，往往不是為了賣貨，是為了把你引出平臺。",
    },
  },
  {
    slug: "awesome-slang",
    name: { zh: "Awesome 二手黑话开源词库", en: "Awesome Chinese Secondhand Slang (Open Source)",
    tw: "Awesome 二手黑話開源詞庫" },
    url: "https://github.com/Domainsun/awesome-chinese-secondhand-slang",
    tags: ["slang"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "开源二手黑话词库：本站词典数据源，MIT 许可、结构化开放。",
      en: "An open-source secondhand-slang corpus: the data behind this site's dictionary — MIT-licensed and structured.",
      tw: "開源二手黑話詞庫：本站詞典資料來源，MIT 許可、結構化開放。",
    },
    detail: {
      zh: "Domainsun 维护的开源项目 awesome-chinese-secondhand-slang，把闲鱼、转转、小红书等平台的二手交易暗语整理成结构化数据：每个主题词条含标准名、全部黑话变体、适用平台、风险等级、存活状态、百科释义，以及卖家潜台词、买家避坑等双向透视字段，词库 JSON 在仓库的 data 目录完全开放。本站的二手黑话词典正是基于这份 MIT 许可的数据：本站服务端每日自动同步上游词库，套上搜索、筛选与缩写反查的界面；分类统计与界面分类名由同步程序派生标注，上游原始文件是一个词条数组（其 README 描述的四段式结构与文件现状略有出入，以文件为准）。想拿原始数据自己做工具、或给词库补新词条，直接去这个仓库下载 JSON 或提 PR。",
      en: "An open-source project maintained by Domainsun that structures the coded language of Xianyu, Zhuanzhuan, Xiaohongshu and other secondhand platforms: each topic entry carries a standard name, all its slang variants, applicable platforms, a risk level, a survival status, a plain-language explanation, and two-sided fields for what the seller really means and what buyers should watch for. The dictionary JSON sits fully open in the repo's data folder. This site's secondhand slang dictionary is built on that MIT-licensed data: our server syncs the upstream corpus daily and wraps it in search, filters and abbreviation lookup; category stats and display names are derived at sync time (the upstream file itself is a flat entry array — its README's four-part schema description differs slightly from the file, and the file wins). To build on the raw data yourself, or to contribute new entries, head to the repo for the JSON or a PR.",
      tw: "Domainsun 維護的開源專案 awesome-chinese-secondhand-slang，把閒魚、轉轉、小紅書等平臺的二手交易暗語整理成結構化資料：每個主題詞條含標準名、全部黑話變體、適用平臺、風險等級、存活狀態、百科釋義，以及賣家潛臺詞、買家避坑等雙向透視欄位，詞庫 JSON 在倉庫的 data 目錄完全開放。本站的二手黑話詞典正是基於這份 MIT 許可的資料：本站服務端每日自動同步上游詞庫，套上搜尋、篩選與縮寫反查的介面；分類統計與介面分類名由同步程式派生標註，上游原始檔案是一個詞條陣列（其 README 描述的四段式結構與檔案現狀略有出入，以檔案為準）。想拿原始資料自己做工具、或給詞庫補新詞條，直接去這個倉庫下載 JSON 或提 PR。",
    },
    audience: {
      zh: "想下载原始词库数据做自己的工具、或愿意给开源词库贡献新黑话词条的人。",
      en: "People who want the raw dictionary data for their own tools, or who'd like to contribute new slang entries to the open-source corpus.",
      tw: "想下載原始詞庫資料做自己的工具、或願意給開源詞庫貢獻新黑話詞條的人。",
    },
    take: {
      zh: "本站词典里每条黑话的原文都出自这里，同步关系明明白白：发现新暗号，与其发帖问人，不如顺手给上游提个 PR，全网查词的人都受益。",
      en: "Every entry in this site's dictionary originates here, and the sync relationship is stated openly. Spot a new code word in the wild? File a PR upstream instead of just asking around — everyone who looks words up benefits.",
      tw: "本站詞典裡每條黑話的原文都出自這裡，同步關係明明白白：發現新暗號，與其發帖問人，不如順手給上游提個 PR，全網查詞的人都受益。",
    },
  },
  {
    slug: "ip-check",
    name: { zh: "IP 风险检测", en: "IP Risk Check",
    tw: "IP 風險檢測" },
    url: "https://18btc.cc/tool/ip-check",
    tags: ["ip-check"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "IP 风险自查：出口与任意 IP 都可查，风险分逐项列明可核。",
      en: "IP risk self-check: your exit IP or any IP — with an itemised, verifiable risk score.",
      tw: "IP 風險自查：出口與任意 IP 都可查，風險分逐項列明可核。",
    },
    detail: {
      zh: "站内可直接使用的 IP 自查工具，产品形态参考 pingip.co，数据源与评分规则为本站自建并全量公开。打开页面先自动查你自己的出口 IP；输入任意 IP 或域名（域名经 DoH 解析）也可查。情报由服务端合并 ipwho.is（地理、ASN、运营商）与标记源（ip-api.com 主源、proxycheck.io 兜底，给出 proxy / hosting / mobile 标记），单源失败只降级对应字段、实际供数源在页面上标注；属性判定 IDC 机房 / 家宽住宅 / 移动网络逐项列出命中证据；风险分只用四条公开规则（proxy +45、hosting +35、云厂商 ASN +15、移动网络 −20），每项加减分与证据都在页面上对得回去——它衡量「像不像代理/机房出口」，不是商业风控库的欺诈分。原生 IP 只给参考判断（地理归属国与 RDAP 网段注册国是否一致、是否 Anycast），不装作能确证。Whois 走 RDAP 官方通道给注册组织/注册商、网段、注册日期与状态摘要。另有三节完全在浏览器本地完成、不上传服务器：WebRTC 泄露检测（STUN 公网地址与出口 IP 对比）、浏览器环境（时区、语言、UA、WebGL 等）、HTTP 延迟测试（浏览器发不了 ICMP，测的是 HTTP 往返，页面已标注）。",
      en: "A built-in IP self-audit tool whose product shape follows pingip.co, with data sources and scoring rules built — and fully published — by this site. Opening the page checks your own exit IP first; any IP or domain (domains resolved over DoH) can be queried. Intel is merged server-side from public sources — ipwho.is (geography, ASN, ISP) plus flag sources (ip-api.com primary, proxycheck.io as fallback, providing the proxy / hosting / mobile flags); if one source fails, only its fields degrade, and the page names the source that actually answered. The datacenter / residential / mobile verdict lists every piece of evidence, and the risk score uses just four public rules (proxy +45, hosting +35, cloud-provider ASN +15, mobile −20) with each item's points and evidence traceable on the page — it measures how much an IP looks like a proxy/datacenter exit, and is not a commercial fraud score. Native-IP status is a reference judgement only (geo country vs the RDAP netblock's registered country, and anycast), never a claimed certification. Whois comes from official RDAP channels: registrant/registrar, range, registration date and status. Three further sections run entirely in your browser and upload nothing: a WebRTC leak check (STUN public address vs your exit IP), a browser-environment readout (timezone, language, UA, WebGL…) and an HTTP latency test (a browser cannot send ICMP, so HTTP round-trips are measured — labelled as such on the page).",
      tw: "站內可直接使用的 IP 自查工具，產品形態參考 pingip.co，資料來源與評分規則為本站自建並全量公開。開啟頁面先自動查你自己的出口 IP；輸入任意 IP 或域名（域名經 DoH 解析）也可查。情報由服務端合併 ipwho.is（地理、ASN、運營商）與標記源（ip-api.com 主源、proxycheck.io 兜底，給出 proxy / hosting / mobile 標記），單源失敗只降級對應欄位、實際供數源在頁面上標註；屬性判定 IDC 機房 / 家寬住宅 / 行動網路逐項列出命中證據；風險分只用四條公開規則（proxy +45、hosting +35、雲廠商 ASN +15、行動網路 −20），每項加減分與證據都在頁面上對得回去——它衡量「像不像代理/機房出口」，不是商業風控庫的欺詐分。原生 IP 只給參考判斷（地理歸屬國與 RDAP 網段註冊國是否一致、是否 Anycast），不裝作能確證。Whois 走 RDAP 官方通道給註冊組織/註冊商、網段、註冊日期與狀態摘要。另有三節完全在瀏覽器本地完成、不上傳伺服器：WebRTC 洩露檢測（STUN 公網地址與出口 IP 對比）、瀏覽器環境（時區、語言、UA、WebGL 等）、HTTP 延遲測試（瀏覽器發不了 ICMP，測的是 HTTP 往返，頁面已標註）。",
    },
    audience: {
      zh: "在意自己网络出口「干不干净」的人：用代理/VPN/机场节点、远程办公、做账号运营与风控自查，想先看清出口 IP 的机房属性、风险标记与 WebRTC 有没有泄露的人。",
      en: "Anyone who cares how clean their network exit looks: proxy/VPN users, remote workers, account operators and the risk-conscious — anyone who wants the datacenter traits, risk flags and WebRTC leak status of their exit IP spelled out.",
      tw: "在意自己網路出口「乾不乾淨」的人：用代理/VPN/機場節點、遠端辦公、做賬號運營與風控自查，想先看清出口 IP 的機房屬性、風險標記與 WebRTC 有沒有洩露的人。",
    },
    take: {
      zh: "先拿它查自己的出口再查别人的：评分规则就四条、全印在页面上，命中哪条加多少分自己能验算；记住它测的是机房/代理特征，不是善恶——公共 DNS 和公司 VPN 分数高是天生的。",
      en: "Check your own exit before anyone else's: the score is just four rules printed in full on the page, so you can re-derive every point yourself. Remember it measures datacenter/proxy traits, not good or evil — public DNS resolvers and corporate VPNs score high by nature.",
      tw: "先拿它查自己的出口再查別人的：評分規則就四條、全印在頁面上，命中哪條加多少分自己能驗算；記住它測的是機房/代理特徵，不是善惡——公共 DNS 和公司 VPN 分數高是天生的。",
    },
  },
  {
    slug: "pingip",
    name: { zh: "PingIP", en: "PingIP",
    tw: "PingIP" },
    url: "https://pingip.co",
    tags: ["ip-check"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "在线 IP 情报站：风险评分、WebRTC 检测与 Whois 一站查齐。",
      en: "An online IP intel site: risk scoring, WebRTC checks and whois in one place.",
      tw: "線上 IP 情報站：風險評分、WebRTC 檢測與 Whois 一站查齊。",
    },
    detail: {
      zh: "PingIP（pingip.co）是一款免费、无需注册的在线 IP 风险检测与网络环境自查工具：可查询 IP 或域名的地理位置、ASN、运营商、CIDR、IDC 机房/家宽属性与原生 IP 倾向，并给出风险评分；站内还有 WebRTC 泄露检测、浏览器环境检测、Ping 测试与 Whois 查询，其中 WebRTC、时区、语言等环境检测在其页面本地完成、不上传服务器。本站的「IP 风险检测」在产品形态上参考了它（自查 + 情报 + 风险分 + 本地环境检测一页流），但两者是各自独立的站点与实现：本站把情报合并源（ipwho.is + ip-api）与四条评分规则的权重全量公开、逐项可验算，并把延迟一节如实标注为 HTTP 往返而非 ICMP Ping；PingIP 的覆盖与呈现则有它自己的口径。两个都免费，需要哪种直接用哪种。",
      en: "PingIP (pingip.co) is a free, no-sign-up IP risk-check and network self-audit tool: look up an IP or domain for geography, ASN, ISP, CIDR, datacenter-vs-residential traits and native-IP tendency, with a risk score; it also offers a WebRTC leak check, a browser-environment check, ping tests and whois lookups, with the WebRTC, timezone and language checks running locally on its pages rather than on a server. This site's IP Risk Check takes its product shape from PingIP (self-check + intel + risk score + local environment checks in one flow), but the two are independent sites and implementations: ours publishes its merged intel sources (ipwho.is + ip-api) and all four scoring weights for anyone to re-derive, and labels its latency section honestly as HTTP round-trips rather than ICMP ping; PingIP has its own coverage and presentation. Both are free — use whichever fits.",
      tw: "PingIP（pingip.co）是一款免費、無需註冊的線上 IP 風險檢測與網路環境自查工具：可查詢 IP 或域名的地理位置、ASN、運營商、CIDR、IDC 機房/家寬屬性與原生 IP 傾向，並給出風險評分；站內還有 WebRTC 洩露檢測、瀏覽器環境檢測、Ping 測試與 Whois 查詢，其中 WebRTC、時區、語言等環境檢測在其頁面本地完成、不上傳伺服器。本站的「IP 風險檢測」在產品形態上參考了它（自查 + 情報 + 風險分 + 本地環境檢測一頁流），但兩者是各自獨立的站點與實現：本站把情報合併源（ipwho.is + ip-api）與四條評分規則的權重全量公開、逐項可驗算，並把延遲一節如實標註為 HTTP 往返而非 ICMP Ping；PingIP 的覆蓋與呈現則有它自己的口徑。兩個都免費，需要哪種直接用哪種。",
    },
    audience: {
      zh: "想多一个 IP 自查备选、或想对照两家口径看同一个 IP 的人。",
      en: "People who want a second IP self-check option, or who like comparing two methodologies on the same IP.",
      tw: "想多一個 IP 自查備選、或想對照兩家口徑看同一個 IP 的人。",
    },
    take: {
      zh: "这类工具的老面孔，功能排布是本站参考的原点；两边最大的差别在透明度：本站把数据源和评分权重全摊开，它更像开箱即用的成品——对照着用，正好互相验算。",
      en: "A familiar face in this category and the layout reference for this site's tool. The biggest difference is transparency: ours lays its sources and scoring weights bare, while PingIP is the more packaged product — run both and cross-check.",
      tw: "這類工具的老面孔，功能排布是本站參考的原點；兩邊最大的差別在透明度：本站把資料來源和評分權重全攤開，它更像開箱即用的成品——對照著用，正好互相驗算。",
    },
  },
  {
    slug: "poetry",
    name: { zh: "古籍诗词精选", en: "Classical Poetry Picks",
    tw: "古籍詩詞精選" },
    url: "https://18btc.cc/tool/poetry",
    tags: ["poetry"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "古诗词全文检索：唐诗宋词诗经楚辞论语，外加成语词典与接龙。",
      en: "Full-text search of Tang and Song poetry, the Book of Songs, Chu Ci and the Analects — plus an idiom dictionary and games.",
      tw: "古詩詞全文檢索：唐詩宋詞詩經楚辭論語，外加成語詞典與接龍。",
    },
    detail: {
      zh: "本站的古籍诗词精选版，数据在构建时从 GitHub 开源语料落盘进仓库，运行时只经本站接口按页下发、不依赖任何外部服务。四块功能：诗词检索——按标题、作者或正文关键词搜五部典籍（唐诗三百首 366 条、宋词三百首 280 条、诗经 305 篇、楚辞 65 篇、论语 20 篇，共 1,036 篇），可按典籍筛选、分页浏览、点开读全篇；成语词典——30,895 条成语，拼音、释义、出处齐全，可按释义关键词反查；成语接龙——同字与同音（不计声调）两种模式轮流接龙，带提示与计分；猜诗词——给出上句四选一下句，干扰项同出一部典籍，答后揭晓出处并可读全篇。定位与边界写明：这是常用精选版，全量古籍（85 万首诗词、2 万部古籍、700 部中医古籍）与全文检索不在本站，请用同标签的文籍典册原站。数据许可：chinese-poetry 与 chinese-xinhua 均为 MIT；诗词落盘时经 OpenCC 繁转简，《静夜思》一条按现代通行本校订（源数据收的是宋本文字），原文均为公版古籍。",
      en: "This site's curated classical-poetry edition. Its data was vendored into the repo from open GitHub corpora at build time and is served page-by-page through this site's own API at runtime, with no outside services involved. Four parts: poem search across five classics by title, author or body text (366 Tang-poem entries, 280 Song-ci entries, 305 Book of Songs pieces, 65 Verses of Chu pieces, 20 Analects chapters — 1,036 texts), filterable by collection and readable in full; an idiom dictionary of 30,895 entries with pinyin, meanings and sources, searchable by meaning keywords too; an idiom-chain game in same-character and homophone (tone-insensitive) modes with hints and scoring; and a guess-the-next-line quiz whose distractors come from the same collection, with the source revealed and the full poem one tap away. Positioning and limits, stated plainly: this is a curated edition — the full corpus (850k poems, 20k classics, 700 medical classics) and full-text search live on the Wendian site, listed on the same shelf. Licensing: chinese-poetry and chinese-xinhua are both MIT; the poems were converted from traditional to simplified Chinese with OpenCC when vendored, and one entry （静夜思） follows the modern standard text where the source carried a Song-dynasty variant. All texts are public-domain classics.",
      tw: "本站的古籍詩詞精選版，資料在構建時從 GitHub 開源語料落盤進倉庫，執行時只經本站介面按頁下發、不依賴任何外部服務。四塊功能：詩詞檢索——按標題、作者或正文關鍵詞搜五部典籍（唐詩三百首 366 條、宋詞三百首 280 條、詩經 305 篇、楚辭 65 篇、論語 20 篇，共 1,036 篇），可按典籍篩選、分頁瀏覽、點開讀全篇；成語詞典——30,895 條成語，拼音、釋義、出處齊全，可按釋義關鍵詞反查；成語接龍——同字與同音（不計聲調）兩種模式輪流接龍，帶提示與計分；猜詩詞——給出上句四選一下句，干擾項同出一部典籍，答後揭曉出處並可讀全篇。定位與邊界寫明：這是常用精選版，全量古籍（85 萬首詩詞、2 萬部古籍、700 部中醫古籍）與全文檢索不在本站，請用同標籤的文籍典冊原站。資料許可：chinese-poetry 與 chinese-xinhua 均為 MIT；詩詞落盤時經 OpenCC 繁轉簡，《靜夜思》一條按現代通行本校訂（源資料收的是宋本文字），原文均為公版古籍。",
    },
    audience: {
      zh: "日常查诗查词、帮孩子预习背诵、或想玩两局成语接龙和猜诗词的普通读者。",
      en: "Everyday readers looking up a poem or idiom, helping kids preview and recite classics, or up for a round of idiom chain and guess-the-line.",
      tw: "日常查詩查詞、幫孩子預習背誦、或想玩兩局成語接龍和猜詩詞的普通讀者。",
    },
    take: {
      zh: "精选版的好处是快和干净：五部最常用的典籍加一部够厚的成语词典，没有广告和注册墙，查完还能顺手接两轮龙；真要翻冷门篇目和中医古籍，别在这儿耗着，去原站查全量。",
      en: "A curated edition earns its keep in speed and cleanliness: the five most-used classics plus a thick idiom dictionary, no ads and no sign-up wall, and a couple of chain rounds after your lookup. For obscure texts or the medical classics, don't linger here — go to the original site for the full corpus.",
      tw: "精選版的好處是快和乾淨：五部最常用的典籍加一部夠厚的成語詞典，沒有廣告和註冊牆，查完還能順手接兩輪龍；真要翻冷門篇目和中醫古籍，別在這兒耗著，去原站查全量。",
    },
  },
  {
    slug: "wendian",
    name: { zh: "文籍典册", en: "Wendian",
    tw: "文籍典冊" },
    url: "https://wendian.dicomp.net",
    tags: ["poetry"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "传统文化全量资料库：85 万首古诗词全文检索，古籍成语齐全。",
      en: "A full-scale traditional-culture library: 850k poems with full-text search, plus classics and idioms.",
      tw: "傳統文化全量資料庫：85 萬首古詩詞全文檢索，古籍成語齊全。",
    },
    detail: {
      zh: "文籍典册（wendian.dicomp.net）是一个中华传统文化资料查询站，走的是全量路线：整合古诗词、汉语字典、成语、歇后语、四书五经、中医药古籍、古籍文献与蒙学等内容，自述收录 85 万+ 首古诗词、1.4 万+ 汉字、3 万+ 成语、2 万+ 部古籍藏书和 700 部中医古籍，并提供全文检索、生字本、成语接龙、词语接龙、猜诗词等功能，免费使用、无需注册。本站的古籍诗词精选版只收五部常用典籍加一部成语词典，胜在站内直接查、直接玩、无广告；要翻精选之外的篇目、查中医古籍或做大范围全文检索，来文籍典册。两个站定位互补：日常高频用精选版，深挖全量用原站。",
      en: "Wendian (wendian.dicomp.net) is a traditional Chinese culture reference site that goes for full scale: classical poetry, a Chinese dictionary, idioms, xiehouyu, the Four Books and Five Classics, traditional-medicine classics, classical literature and children's primers — by its own account 850,000+ poems, 14,000+ characters, 30,000+ idioms, 20,000+ classics and 700 medical classics — with full-text search, a new-words notebook, idiom chains, word chains and line-guessing, free with no sign-up. This site's curated poetry edition keeps only the five everyday classics plus an idiom dictionary, and wins on being in-site, ad-free and instantly playable; for anything beyond the selection, the medical classics, or broad full-text search, Wendian is the place. The two complement each other: the curated edition for daily use, the original for deep digging.",
      tw: "文籍典冊（wendian.dicomp.net）是一箇中華傳統文化資料查詢站，走的是全量路線：整合古詩詞、漢語字典、成語、歇後語、四書五經、中醫藥古籍、古籍文獻與蒙學等內容，自述收錄 85 萬+ 首古詩詞、1.4 萬+ 漢字、3 萬+ 成語、2 萬+ 部古籍藏書和 700 部中醫古籍，並提供全文檢索、生字本、成語接龍、詞語接龍、猜詩詞等功能，免費使用、無需註冊。本站的古籍詩詞精選版只收五部常用典籍加一部成語詞典，勝在站內直接查、直接玩、無廣告；要翻精選之外的篇目、查中醫古籍或做大範圍全文檢索，來文籍典冊。兩個站定位互補：日常高頻用精選版，深挖全量用原站。",
    },
    audience: {
      zh: "需要查冷门诗词、整部古籍或中医古籍原文，做传统文化资料深挖的人。",
      en: "Anyone who needs obscure poems, complete classical texts or TCM classics — deep-diving into traditional-culture sources.",
      tw: "需要查冷門詩詞、整部古籍或中醫古籍原文，做傳統文化資料深挖的人。",
    },
    take: {
      zh: "体量是真大，精选版里找不到的篇目基本都能在这儿翻到，中医古籍这一块更是少见的全；代价是页面信息密度高、找东西要多点耐心，日常小查还是本站精选版更快。",
      en: "The scale is real — if a text isn't in the curated edition you'll very likely find it here, and its medical-classics coverage is unusually complete. The trade-off is dense pages that reward patience; for quick everyday lookups the curated edition here is faster.",
      tw: "體量是真大，精選版裡找不到的篇目基本都能在這兒翻到，中醫古籍這一塊更是少見的全；代價是頁面資訊密度高、找東西要多點耐心，日常小查還是本站精選版更快。",
    },
  },
  {
    slug: "tweetbox",
    name: { zh: "推特下载工具箱", en: "Tweet Toolbox",
    tw: "推特下載工具箱" },
    url: "https://18btc.cc/tool/tweetbox",
    tags: ["twitter-tools"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "推文解析下载：粘贴链接取原图与各画质视频，还能整串导出。",
      en: "Tweet parser and downloader: paste a link for original photos and per-quality videos — whole threads exportable too.",
      tw: "推文解析下載：貼上連結取原圖與各畫質影片，還能整串匯出。",
    },
    detail: {
      zh: "站内可用的推特媒体下载与推文导出工具箱，功能集参考老牌下载站 TwiFlux、独立实现。粘贴一条公开推文链接（twitter.com / x.com）或推文 ID，即可解析出作者、正文、发布时间、互动数（数据源实际返回的才显示）和全部媒体：图片给原图（name=orig）直链，视频与 GIF 逐档列出每个 MP4 变体的分辨率与码率供挑选，另附 HLS 播放列表链接（如有）。下载全部走推特 CDN 直链，本站服务器不中转文件；导出（TXT、Markdown、HTML、JSON、CSV，以及「打印另存」的 PDF）都在你的浏览器本地生成。若这条推文处在同作者自回复串中，工具会沿数据源返回的回复链把整串组装出来，提供 TXT、Markdown、JSON 与 EPUB 整串导出——组装口径如实标注：以数据源返回为准，只含截至本条的同作者串。取数双源：推特公开嵌入接口为主、FxTwitter 公开接口为备，免登录。边界：仅限公开推文；媒体版权归原作者，只下载你有权使用的内容。",
      en: "A built-in Twitter media downloader and tweet exporter, modelled on the established TwiFlux downloader and independently implemented. Paste a public tweet link (twitter.com / x.com) or a tweet ID to parse the author, text, timestamp, engagement counts (only what the data source actually returns) and every media item: photos come with original-size (name=orig) direct links; videos and GIFs list each MP4 variant with its resolution and bitrate, plus the HLS playlist link when one exists. Downloads are direct Twitter-CDN links — this site's servers never relay files — and exports (TXT, Markdown, HTML, JSON, CSV, and a print-to-PDF path) are generated locally in your browser. If the tweet sits in a same-author self-reply chain, the tool assembles the chain from the source's reply links and offers whole-thread TXT, Markdown, JSON and EPUB exports, with the assembly rule stated plainly: it follows what the source returns and covers the author's chain up to this post. Fetching is dual-source — Twitter's public embed endpoint first, the FxTwitter public API as backup — with no login. Boundaries: public tweets only, and media remains the original authors' copyright — download only what you have the right to use.",
      tw: "站內可用的推特媒體下載與推文匯出工具箱，功能集參考老牌下載站 TwiFlux、獨立實現。貼上一條公開推文連結（twitter.com / x.com）或推文 ID，即可解析出作者、正文、釋出時間、互動數（資料來源實際返回的才顯示）和全部媒體：圖片給原圖（name=orig）直鏈，影片與 GIF 逐檔列出每個 MP4 變體的解析度與位元速率供挑選，另附 HLS 播放列表連結（如有）。下載全部走推特 CDN 直鏈，本站伺服器不中轉檔案；匯出（TXT、Markdown、HTML、JSON、CSV，以及「列印另存」的 PDF）都在你的瀏覽器本地生成。若這條推文處在同作者自回覆串中，工具會沿資料來源返回的回覆鏈把整串組裝出來，提供 TXT、Markdown、JSON 與 EPUB 整串匯出——組裝口徑如實標註：以資料來源返回為準，只含截至本條的同作者串。取數雙源：推特公開嵌入介面為主、FxTwitter 公開介面為備，免登入。邊界：僅限公開推文；媒體版權歸原作者，只下載你有權使用的內容。",
    },
    audience: {
      zh: "想保存推文视频/图片原图、把推文或整串 Thread 存档成文档（含 EPUB 导入阅读器）的内容整理者、研究者与普通用户。",
      en: "Anyone archiving tweets — creators, researchers and everyday users who want original photos/videos saved, or a tweet or whole thread filed away as a document (EPUB included, for e-readers).",
      tw: "想儲存推文影片/圖片原圖、把推文或整串 Thread 存檔成文件（含 EPUB 匯入閱讀器）的內容整理者、研究者與普通使用者。",
    },
    take: {
      zh: "最省事的用法是粘贴链接先看变体表再下：同一条视频最高和最低画质体积能差几十倍，存手机里看选中间档就够；整串 Thread 导出 EPUB 塞进阅读器慢慢看，是这工具最值得用的地方。",
      en: "The smoothest flow is: paste, check the variant table, then download — the top and bottom qualities of one video can differ by dozens of times in size, and a mid tier is plenty for phone viewing. The genuinely special move is exporting a whole thread as an EPUB for your reader.",
      tw: "最省事的用法是貼上連結先看變體表再下：同一條影片最高和最低畫質體積能差幾十倍，存手機裡看選中間檔就夠；整串 Thread 匯出 EPUB 塞進閱讀器慢慢看，是這工具最值得用的地方。",
    },
  },
  {
    slug: "twiflux",
    name: { zh: "TwiFlux", en: "TwiFlux",
    tw: "TwiFlux" },
    url: "https://twiflux.com",
    tags: ["twitter-tools"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "推特视频下载站：粘贴推文链接取各画质 MP4，免注册免费下。",
      en: "A Twitter/X video downloader: paste a tweet link for per-quality MP4s — free, no sign-up.",
      tw: "推特影片下載站：貼上推文連結取各畫質 MP4，免註冊免費下。",
    },
    detail: {
      zh: "TwiFlux（twiflux.com）是一款免费、无需注册的在线推特/X 多功能下载站：以视频下载为主，粘贴公开推文链接后列出原帖可用的全部 MP4 格式（原始画质、分辨率与码率可见），单个文件上限 500 MiB；也覆盖 GIF、图片与音频下载，并提供把推文与 Thread 转换成 TXT、Markdown、HTML、PDF、JSON、CSV、RSS 等格式的工具（Thread 另有 EPUB、文章与轮播图）。本站的「推特下载工具箱」在功能集上参考了它——媒体逐档直链、推文多格式导出、Thread 整串打包——但两者是各自独立的站点与实现：本站取数走推特公开嵌入接口与 FxTwitter 公开接口双源，解析与导出全部在站内完成。两个都免费、都只处理公开推文，需要哪种直接用哪种；无论用哪个，媒体的版权都归原作者。",
      en: "TwiFlux (twiflux.com) is a free, no-sign-up online Twitter/X downloader: video first — paste a public tweet link and it lists every MP4 format the source offers (original quality, resolution and bitrate shown), up to 500 MiB per file — plus GIF, photo and audio downloads, and converters that turn tweets and threads into TXT, Markdown, HTML, PDF, JSON, CSV and RSS (threads also get EPUB, article and carousel exports). This site's Tweet Toolbox takes its feature set from TwiFlux — per-quality media links, multi-format tweet exports, whole-thread bundling — but the two are independent sites and implementations: ours fetches from Twitter's public embed endpoint and the FxTwitter public API and does all parsing and exporting in-site. Both are free and both handle public tweets only; use whichever fits, and remember the media stays the original authors' copyright either way.",
      tw: "TwiFlux（twiflux.com）是一款免費、無需註冊的線上推特/X 多功能下載站：以影片下載為主，貼上公開推文連結後列出原帖可用的全部 MP4 格式（原始畫質、解析度與位元速率可見），單個檔案上限 500 MiB；也覆蓋 GIF、圖片與音訊下載，並提供把推文與 Thread 轉換成 TXT、Markdown、HTML、PDF、JSON、CSV、RSS 等格式的工具（Thread 另有 EPUB、文章與輪播圖）。本站的「推特下載工具箱」在功能集上參考了它——媒體逐檔直鏈、推文多格式匯出、Thread 整串打包——但兩者是各自獨立的站點與實現：本站取數走推特公開嵌入介面與 FxTwitter 公開介面雙源，解析與匯出全部在站內完成。兩個都免費、都只處理公開推文，需要哪種直接用哪種；無論用哪個，媒體的版權都歸原作者。",
    },
    audience: {
      zh: "想要一个专注下载的老牌备选、或需要 RSS 等本站暂未提供的导出格式的人。",
      en: "People who want a download-focused established alternative, or export formats this site doesn't offer yet, such as RSS.",
      tw: "想要一個專注下載的老牌備選、或需要 RSS 等本站暫未提供的匯出格式的人。",
    },
    take: {
      zh: "下载这一件事它做得最专注，格式表干净利落，是本站工具箱排版的参考原点；差别在本站把解析、Thread 组装和 EPUB 打包收进了同一页，还不用在下载站之间来回跳。两边都只碰公开推文，这点没有例外。",
      en: "For pure downloading it's the most focused tool around, with a clean format table — the layout reference for this site's toolbox. The difference: ours folds parsing, thread assembly and EPUB bundling into one page on a site you already use. Both touch public tweets only, no exceptions.",
      tw: "下載這一件事它做得最專注，格式表乾淨利落，是本站工具箱排版的參考原點；差別在本站把解析、Thread 組裝和 EPUB 打包收進了同一頁，還不用在下載站之間來回跳。兩邊都只碰公開推文，這點沒有例外。",
    },
  },
  {
    slug: "handy",
    name: { zh: "Handy 离线语音转文字", en: "Handy — Offline Speech to Text",
    tw: "Handy 離線語音轉文字" },
    url: "https://handy.computer",
    tags: ["office"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "免费开源离线语音转文字：按快捷键说话，文字直接粘贴到任意输入框。",
      en: "Free, open-source offline speech to text: hold a shortcut, speak, and the text lands in any text field.",
      tw: "免費開源離線語音轉文字：按快捷鍵說話，文字直接貼上到任意輸入框。",
    },
    detail: {
      zh: "Handy 是装在电脑上的免费开源语音转文字应用（MIT 许可），主打离线与隐私：按住自定义快捷键说话、松手即转写，文字直接粘贴到当前输入框，不用在聊天框和转写窗口之间来回复制。转写全程在本机完成：先用 Silero 做语音活动检测过滤静音，再用 Whisper 模型（Small / Medium / Turbo / Large，可选 GPU 加速）或 CPU 优化的 Parakeet V3 转写，音频不发往任何云端。支持 Windows、macOS 与 Linux，也提供命令行开关与 Raycast 扩展。收录提醒：它是桌面软件、不是网页工具；模型首次使用需下载一次，之后全程离线；macOS 蓝牙耳机麦克风与部分 Linux 桌面环境有已知限制，见其官网说明。",
      en: "Handy is a free, open-source desktop speech-to-text app (MIT licence) built around offline use and privacy: hold a custom shortcut, speak, release, and the transcription is pasted straight into whatever text field is active — no copying back and forth between chat and transcription windows. Everything runs on your own machine: Silero voice-activity detection filters silence first, then Whisper models (Small / Medium / Turbo / Large, GPU acceleration optional) or the CPU-optimised Parakeet V3 transcribe — audio never goes to any cloud. It runs on Windows, macOS and Linux, with CLI flags and a Raycast extension. Listing notes: it is a desktop app, not a web tool; models download once on first use and then everything is offline; Bluetooth-headset microphones on macOS and some Linux desktop setups have known limitations, documented on its site.",
      tw: "Handy 是裝在電腦上的免費開源語音轉文字應用（MIT 許可），主打離線與隱私：按住自定義快捷鍵說話、鬆手即轉寫，文字直接貼上到當前輸入框，不用在聊天框和轉寫視窗之間來回複製。轉寫全程在本機完成：先用 Silero 做語音活動檢測過濾靜音，再用 Whisper 模型（Small / Medium / Turbo / Large，可選 GPU 加速）或 CPU 最佳化的 Parakeet V3 轉寫，音訊不發往任何雲端。支援 Windows、macOS 與 Linux，也提供命令列開關與 Raycast 擴充套件。收錄提醒：它是桌面軟體、不是網頁工具；模型首次使用需下載一次，之後全程離線；macOS 藍芽耳機麥克風與部分 Linux 桌面環境有已知限制，見其官網說明。",
    },
    audience: {
      zh: "不想把语音发上云、又想用说的代替打字的人；写长消息、会议纪要、代码注释时习惯口述的办公与创作用户。",
      en: "Anyone who'd rather not send voice to the cloud but wants to speak instead of type — office and creator users who dictate long messages, meeting notes or code comments.",
      tw: "不想把語音發上雲、又想用說的代替打字的人；寫長訊息、會議紀要、程式碼註釋時習慣口述的辦公與創作使用者。",
    },
    take: {
      zh: "收录说明：它是桌面软件不是网页工具，模型首次使用需下载一次，之后全程离线；按快捷键说话、松手即粘贴的流程，适合一切需要把语音变文字的场景，隐私这条线守得比在线转写站干净。",
      en: "Listing notes: a desktop app, not a web tool — models download once, then everything stays offline. The hold-to-talk, release-to-paste flow fits any speak-to-text job, and its privacy line is cleaner than any online transcription site's.",
      tw: "收錄說明：它是桌面軟體不是網頁工具，模型首次使用需下載一次，之後全程離線；按快捷鍵說話、鬆手即貼上的流程，適合一切需要把語音變文字的場景，隱私這條線守得比線上轉寫站乾淨。",
    },
  },
  {
    slug: "public-apis",
    name: { zh: "Public APIs 免费接口大全", en: "Public APIs — Free API Directory",
    tw: "Public APIs 免費介面大全" },
    url: "https://github.com/public-apis/public-apis",
    tags: ["office"],
    addedAt: "2026-11-02",
    type: "third-party",
    oneLiner: {
      zh: "免费公开接口目录：按分类、认证方式与 CORS 支持筛选，附直链。",
      en: "A directory of free public APIs: filter by category, auth and CORS support, with direct links.",
      tw: "免費公開介面目錄：按分類、認證方式與 CORS 支援篩選，附直鏈。",
    },
    detail: {
      zh: "Public APIs 是 GitHub 上近 50 万星的免费公开接口目录（MIT 许可，持续维护）：把互联网上无需付费即可调用的公开 API 按 Animal、区块链、加密货币、金融、天气、新闻等几十个分类整理成一张大表，每个条目写明是否需要认证（免 Key、OAuth 或 API Key）、是否支持 HTTPS 与 CORS，并附官方直链。找公开数据源、给小工具接天气汇率行情、做 Demo 缺测试接口时，先来这儿按分类翻一遍，比搜索引擎逐条验证省事。收录提醒：目录本身是清单、不是聚合网关，条目的可用性与限额以各接口官网为准；仓库不再提供可下载的 entries.json 数据文件，以 README 列表为准。",
      en: "Public APIs is a near-500K-star directory of free public APIs on GitHub (MIT licence, actively maintained): it organises no-cost public APIs into dozens of categories — Animals, Blockchain, Cryptocurrency, Finance, Weather, News and more — with each entry stating whether auth is needed (no key, OAuth or API key), whether HTTPS and CORS are supported, and a direct link to the official docs. Looking for a public data source, wiring weather, exchange-rate or market data into a small tool, or needing test endpoints for a demo? Browsing this list by category beats verifying search results one by one. Listing notes: the directory is a catalogue, not an aggregation gateway — availability and rate limits follow each API's own site — and the repo no longer ships a downloadable entries.json data file, so the README list is the source of truth.",
      tw: "Public APIs 是 GitHub 上近 50 萬星的免費公開介面目錄（MIT 許可，持續維護）：把網際網路上無需付費即可呼叫的公開 API 按 Animal、區塊鏈、加密貨幣、金融、天氣、新聞等幾十個分類整理成一張大表，每個條目寫明是否需要認證（免 Key、OAuth 或 API Key）、是否支援 HTTPS 與 CORS，並附官方直鏈。找公開資料來源、給小工具接天氣匯率行情、做 Demo 缺測試介面時，先來這兒按分類翻一遍，比搜尋引擎逐條驗證省事。收錄提醒：目錄本身是清單、不是聚合閘道器，條目的可用性與限額以各介面官網為準；倉庫不再提供可下載的 entries.json 資料檔案，以 README 列表為準。",
    },
    audience: {
      zh: "给小工具找公开数据源的开发者、做 Demo 缺测试接口的人，以及想了解有哪些免费接口可玩的爱好者。",
      en: "Developers hunting public data sources for small tools, anyone needing test endpoints for a demo, and hobbyists curious about what free APIs exist.",
      tw: "給小工具找公開資料來源的開發者、做 Demo 缺測試介面的人，以及想了解有哪些免費介面可玩的愛好者。",
    },
    take: {
      zh: "收录说明：近 50 万星的清单，区块链、加密货币、金融这些分类对本站读者尤其有用；条目只列接口名与直链，免 Key 与否、支不支持 CORS 都标明了，找数据源先来这儿翻一遍。",
      en: "Listing notes: a near-500K-star catalogue whose Blockchain, Cryptocurrency and Finance categories are especially useful for this site's readers — each entry names the API and links out, with no-key vs keyed and CORS support marked, so check here before hunting for a data source elsewhere.",
      tw: "收錄說明：近 50 萬星的清單，區塊鏈、加密貨幣、金融這些分類對本站讀者尤其有用；條目只列介面名與直鏈，免 Key 與否、支不支援 CORS 都標明瞭，找資料來源先來這兒翻一遍。",
    },
  },
  {
    slug: "niuma-clock",
    name: { zh: "牛马时钟", en: "Niuma Clock",
    tw: "牛馬時鐘" },
    url: "https://18btc.cc/tool/niuma-clock",
    tags: ["office"],
    addedAt: "2026-11-02",
    type: "own",
    embedded: true,
    oneLiner: {
      zh: "打工人牛马时钟：下班、周末、发薪与假期倒计时，工资按秒实时跳。",
      en: "A worker's clock: live countdowns to off-work, the weekend, payday and the next holiday, plus a per-second salary meter.",
      tw: "打工人牛馬時鐘：下班、週末、發薪與假期倒計時，工資按秒實時跳。",
    },
    detail: {
      zh: "牛马时钟是给打工人的一页时间账本：大字时钟每秒刷新，今日牛马进度按你设定的上下班时间算已搬砖多久、还剩多久；距离下班、距离周末、距离发工资、距离下一个法定节假日四个倒计时同屏盯着；填上月薪，工资秒表按秒跳钱——日薪按当月应出勤天数折算（周一至周五，扣除 2026 年法定放假、计入调休补班日）。上下班时间、午休、发薪日、月薪都能改，全部只保存在本机浏览器，不注册、不上传。",
      en: "Niuma Clock is a one-page time ledger for working folks: a big clock ticking every second, today's grind progress computed from your own start and finish times, and four countdowns on one screen — until off work, until the weekend, until payday and until the next public holiday. Add your monthly salary and the salary stopwatch ticks money in per second, with daily pay pro-rated over this month's scheduled workdays (Mon–Fri, minus 2026 public holidays, plus official make-up workdays). Work hours, lunch break, payday and salary are all adjustable and stored only in your browser — no sign-up, no upload.",
      tw: "牛馬時鐘是給打工人的一頁時間賬本：大字時鐘每秒重新整理，今日牛馬進度按你設定的上下班時間算已搬磚多久、還剩多久；距離下班、距離週末、距離發工資、距離下一個法定節假日四個倒計時同屏盯著；填上月薪，工資秒錶按秒跳錢——日薪按當月應出勤天數折算（週一至週五，扣除 2026 年法定放假、計入調休補班日）。上下班時間、午休、發薪日、月薪都能改，全部只儲存在本機瀏覽器，不註冊、不上傳。",
    },
    audience: {
      zh: "办公室打工人、等下班等发薪的牛马同胞，以及想把倒计时挂在屏幕上当桌面时钟的人。",
      en: "Office workers counting down to off-work and payday, and anyone who wants a countdown clock sitting on their screen.",
      tw: "辦公室打工人、等下班等發薪的牛馬同胞，以及想把倒計時掛在螢幕上當桌面時鐘的人。",
    },
    take: {
      zh: "四个倒计时同屏打开，等下班的心情一下子具体了；工资秒表按秒跳的那几分钱，是今天搬砖最诚实的反馈。",
      en: "With all four countdowns on one screen, waiting for off-work suddenly has numbers; the few cents ticking in per second are the most honest feedback today's grind gives back.",
      tw: "四個倒計時同屏開啟，等下班的心情一下子具體了；工資秒錶按秒跳的那幾分錢，是今天搬磚最誠實的反饋。",
    },
  },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t])
);

export function getTool(slug: string): ToolDef | undefined {
  return TOOL_MAP[slug];
}

/** 注册表原始下标：统一排序最后一级「同日按注册表顺序靠后者在前」用 */
const TOOL_INDEX: Record<string, number> = Object.fromEntries(
  TOOLS.map((t, i) => [t.slug, i])
);

/** 全站统一排序（AGENTS.md 第 5 节，定死，不许自创）：
 *  pin 高者在前 → 站内可用（embedded）在第三方前 → addedAt 新者在前 →
 *  同日按注册表顺序靠后者在前。大类区块、标签页列表共用。
 *  （首页「最新上架」不走此排序，见 compareNewest。） */
export function compareTools(a: ToolDef, b: ToolDef): number {
  const pinDiff = (b.pin ?? 0) - (a.pin ?? 0);
  if (pinDiff !== 0) return pinDiff;
  const embDiff = Number(b.embedded ?? false) - Number(a.embedded ?? false);
  if (embDiff !== 0) return embDiff;
  if (a.addedAt !== b.addedAt) return a.addedAt < b.addedAt ? 1 : -1;
  return TOOL_INDEX[b.slug] - TOOL_INDEX[a.slug];
}

/** 纯时间排序（AGENTS.md 第 5 节）：只按 addedAt 新者在前，同日按注册表顺序
 *  靠后者在前；不分站内 / 第三方优先级。供首页「最新上架」与各处兜底补位使用。 */
export function compareNewest(a: ToolDef, b: ToolDef): number {
  if (a.addedAt !== b.addedAt) return a.addedAt < b.addedAt ? 1 : -1;
  return TOOL_INDEX[b.slug] - TOOL_INDEX[a.slug];
}

/** 最新上架的 n 个工具（纯时间排序），可排除一批 slug（如当前工具自身、已展示的工具） */
export function newestTools(n: number, excludeSlugs: string[] = []): ToolDef[] {
  const exclude = new Set(excludeSlugs);
  return TOOLS.filter((t) => !exclude.has(t.slug))
    .sort(compareNewest)
    .slice(0, n);
}

export function toolsByTag(tagId: string): ToolDef[] {
  return TOOLS.filter((t) => t.tags.includes(tagId)).sort(compareTools);
}

/** /go/[slug] 的跳转目标：站内可用工具 → 站内页；其余 → 官网。
 *  例外：pershare 虽已站内内嵌，但 /go/pershare 是给外部引用用的短链，固定 302 到独立站官网。 */
export function goTarget(tool: ToolDef): string {
  if (tool.slug === "pershare") return tool.url;
  if (tool.embedded) return `/tool/${tool.slug}`;
  return tool.url;
}
