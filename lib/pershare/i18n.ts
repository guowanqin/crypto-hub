/**
 * 轻量双语文案字典（手写，无 i18n 框架）。
 * 数字、公式符号、币种与代币符号（BNB、BNCB、USDT）不翻译。
 */
export type Lang = "zh" | "tw" | "en";

/** 站点正式网址（canonical、OG、JSON-LD、sitemap、robots 的单一数据源）；www 版重定向到主域名 */
export const SITE_URL = "https://pershare.cc";

/** 站点级标题（双标的，layout 元数据与默认 document.title）
 *  关键词结构：站级主词只有「每股含币量」；支柱词 BNC/BNB/HYPE/PURR 财库公司；
 *  「财库公司」裸词与 DAT 只作背景语义，不进标题主词位；英文走长尾（BNB/HYPE treasury company、mNAV）。 */
export const SITE_TITLE: Record<Lang, string> = {
  zh: "每股含币量计算器｜BNC 财库公司与 PURR 财库公司：每股含 BNB / HYPE、价差与池子年化收益率",
  en: "Crypto per Share Calculator | BNB Treasury Company BNC & HYPE Treasury Company PURR: mNAV, Discount & Pool APY",
  tw: "每股含幣量計算器｜BNC 財庫公司與 PURR 財庫公司：每股含 BNB / HYPE、價差與池子年化收益率",
};

export const SITE_DESCRIPTION: Record<Lang, string> = {
  zh: "每股含币量计算器：实时查询两家上市公司的每股含币量——BNC 财库公司（BNB Standard Corp，Nasdaq: BNC，最大的 BNB 财库公司）每股含 BNB（基本口径），与 PURR 财库公司（Hyperliquid Strategies，Nasdaq: PURR，HYPE 财库公司）每股含 HYPE（官方摊薄口径）；含币价对股价的价差、mNAV 折溢价一目了然，并提供 BNCB 池子年化收益率与 HYPE 池子年化收益率查询（默认 ±5% 区间换算，支持全区间、自定义区间与 LP 收益测算）。",
  en: "An mNAV calculator for BNC and PURR — the BNB treasury company (BNB Standard Corp, Nasdaq: BNC) and the HYPE treasury company (Hyperliquid Strategies, Nasdaq: PURR). Track live BNB per share (basic basis) and HYPE per share (official diluted basis), each stock's discount or premium to its coin value per share, plus BNCB pool APR and HYPE pool APY: shown for a ±5% range by default, with full-range and custom-range conversion and an LP earnings estimator.",
  tw: "每股含幣量計算器：實時查詢兩家上市公司的每股含幣量——BNC 財庫公司（BNB Standard Corp，Nasdaq: BNC，最大的 BNB 財庫公司）每股含 BNB（基本口徑），與 PURR 財庫公司（Hyperliquid Strategies，Nasdaq: PURR，HYPE 財庫公司）每股含 HYPE（官方攤薄口徑）；含幣價對股價的價差、mNAV 折溢價一目瞭然，並提供 BNCB 池子年化收益率與 HYPE 池子年化收益率查詢（預設 ±5% 區間換算，支援全區間、自定義區間與 LP 收益測算）。",
};

/** 每个标签页的 document.title（随标签与语言切换） */
export type AssetTab = "bnc" | "hype";
export const TAB_TITLES: Record<AssetTab, Record<Lang, string>> = {
  bnc: {
    zh: "BNC 财库公司每股含币量计算器｜每股含 BNB、价差 mNAV 与 BNCB 池子年化收益率",
    en: "BNC mNAV Calculator | BNB Treasury Company: BNB per Share, Discount & BNCB Pool APR",
    tw: "BNC 財庫公司每股含幣量計算器｜每股含 BNB、價差 mNAV 與 BNCB 池子年化收益率",
  },
  hype: {
    zh: "PURR 财库公司每股含 HYPE 计算器｜每股含币量、价差 mNAV 与 HYPE 池子年化收益率",
    en: "PURR mNAV Calculator | HYPE Treasury Company: HYPE per Share, Discount & HYPE Pool APY",
    tw: "PURR 財庫公司每股含 HYPE 計算器｜每股含幣量、價差 mNAV 與 HYPE 池子年化收益率",
  },
};

export interface Dict {
  updatedAt: (time: string, source: string) => string;
  loadingMarket: string;
  refreshing: string;
  refresh: string;
  fetchError: string;
  heroTitle: string;
  heroSub: string;
  perShareUnit: string;
  usdPerShareUnit: string;
  formulaLabel: string;
  formulaHoldings: (n: string) => string;
  formulaShares: (n: string) => string;
  statAdjNav: string;
  statMnav: string;
  discount: (p: string) => string;
  premium: (p: string) => string;
  statBncbPrice: string;
  statBnbPrice: string;
  spreadTitle: string;
  spreadCoinValue: string;
  spreadStockPrice: string;
  spreadResult: string;
  spreadAtPar: string;
  spreadNote: string;
  /** 价差大字方向词（金额一律绝对值，方向只由词 + 颜色承担） */
  spreadWordDisc: string;
  spreadWordPrem: string;
  /** 价差徽标：折价率 / 溢价率（百分比一律绝对值） */
  spreadDiscRate: (p: string) => string;
  spreadPremRate: (p: string) => string;
  /** 价差卡图例行 */
  spreadLegend: string;
  editOpen: string;
  editClose: string;
  fieldHoldings: string;
  fieldShares: string;
  fieldLiabilities: string;
  editHint: string;
  poolsTitle: string;
  poolsSub: string;
  unifiedLabel: string;
  poolRangeLabel: string;
  fullRange: string;
  custom: string;
  downLabel: string;
  upLabel: string;
  feeRate: (p: number) => string;
  headlineFull: string;
  headlineRange: (down: number, up: number) => string;
  headlineAvgFallback: string;
  poolAvgLine: (pct: string) => string;
  vol24h: string;
  annualFees: string;
  bncbSpot: string;
  bandLabel: string;
  fullPriceRangeText: string;
  effLabel: string;
  baselineNote: string;
  warnOutOfRange: string;
  lpTitle: string;
  lpSelectPool: string;
  lpAmount: string;
  lpRangeUsed: string;
  lpRangeNote: string;
  lpDaily: string;
  lpYearly: string;
  lpShare: string;
  lpHint: string;
  loadingPools: string;
  faqTitle: string;
  footerSource: string;
  footerDisclaimer: string;
}

export const DICT: Record<Lang, Dict> = {
  zh: {
    updatedAt: (time, source) => `数据更新于 ${time} · 来源 ${source}`,
    loadingMarket: "正在拉取实时行情…",
    refreshing: "刷新中…",
    refresh: "刷新",
    fetchError: "行情拉取失败，请点刷新重试。",
    heroTitle: "BNC 每股含币量 · BNB Standard Corp",
    heroSub:
      "纳斯达克上市的 BNB 财库公司（Nasdaq: BNC），数字资产财库公司（DAT）代表之一 · 本页只按基本口径计算",
    perShareUnit: "BNB / 股",
    usdPerShareUnit: "/ 股",
    formulaLabel: "每股含 BNB =",
    formulaHoldings: (n) => `持仓 ${n} BNB`,
    formulaShares: (n) => `基本股数 ${n} 股`,
    statAdjNav: "调整后 NAV / 股（扣负债）",
    statMnav: "mNAV（BNCB 价 ÷ 调整后 NAV）",
    discount: (p) => `折价 ${p}%`,
    premium: (p) => `溢价 ${p}%`,
    statBncbPrice: "BNCB 价格（BNC 定价基准）",
    statBnbPrice: "BNB 价格",
    spreadTitle: "价差",
    spreadCoinValue: "含币价",
    spreadStockPrice: "当前股价（BNCB）",
    spreadResult: "价差",
    spreadAtPar: "平价",
    spreadNote:
      "价差为含币价与股价的账面差额；财库公司股票不可按含币量赎回，折价不等于无风险套利。",
    spreadWordDisc: "折价",
    spreadWordPrem: "溢价",
    spreadDiscRate: (p) => `折价率 ${p}%`,
    spreadPremRate: (p) => `溢价率 ${p}%`,
    spreadLegend: "折价＝股价低于每股含币价值；溢价＝股价高于每股含币价值。",
    editOpen: "编辑披露数据（持仓 / 股数 / 负债）",
    editClose: "收起",
    fieldHoldings: "BNB 持仓（枚，公司披露）",
    fieldShares: "基本股数（股，公司披露）",
    fieldLiabilities: "负债（美元，调整后 NAV 扣除项）",
    editHint:
      "默认值：持仓 515,544 枚 BNB、基本股数 41,173,850 股（公司 2026 年披露）、负债约 $16.8M（2026-07-31 披露口径）。修改后立即按基本口径重算，并保存在本机浏览器。",
    poolsTitle: "BNCB 池子年化收益率",
    poolsSub:
      "默认显示「±5% 区间在价内年化」：按链上当前有效流动性、只算当前价上下 5% 价格带换算出的年化，与卡片小字的「全池平均」不是一回事（全池平均 = 24h 成交量 × 费率 × 365 ÷ TVL）。±5% 是很窄的区间：价格停留在带内时资金效率高、年化也高，但价格一出带收益即归零。用下方统一设置可给所有池子换区间（全区间、各预设、自定义），也可以逐张卡片单独改。",
    unifiedLabel: "统一区间设置（应用到所有池子）",
    poolRangeLabel: "本池价格区间（只改这个池）",
    fullRange: "全区间",
    custom: "自定义",
    downLabel: "下限：当前价下方",
    upLabel: "上限：当前价上方",
    feeRate: (p) => `费率 ${p}%`,
    headlineFull: "全区间在价内年化",
    headlineRange: (down, up) => `区间 −${down}% ~ +${up}% · 在价内年化`,
    headlineAvgFallback: "全池平均年化（链上读数暂不可用）",
    poolAvgLine: (pct) => `全池平均 ${pct}（对照口径，非区间年化）`,
    vol24h: "24h 成交量",
    annualFees: "年化手续费",
    bncbSpot: "BNCB 价格（定价基准）",
    bandLabel: "价格带：",
    fullPriceRangeText: "全价格范围",
    effLabel: "资金效率",
    baselineNote: "基准",
    warnOutOfRange:
      "价格走出该区间后手续费收益归零；真实年化需乘上价格停留在区间内的时间占比。",
    lpTitle: "LP 收益测算",
    lpSelectPool: "选择池子",
    lpAmount: "投入金额（美元）",
    lpRangeUsed: "采用区间",
    lpRangeNote: "（跟随该池卡片当前的区间设置）",
    lpDaily: "估算日手续费收入",
    lpYearly: "估算年手续费收入",
    lpShare: "占池有效流动性份额",
    lpHint:
      "按价格停留在所选区间内估算，未计无常损失与滑点；价格出区间期间收入为 0，实际收益低于此估算。",
    loadingPools: "正在拉取池子数据…",
    faqTitle: "常见问题",
    footerSource:
      "数据来源：GeckoTerminal / DexScreener 行情与 BSC 链上读数（PancakeSwap V3 池合约、Uniswap V4 StateView），服务端缓存约 5 分钟。官方 BNCB 合约：0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f，请警惕同名假币。",
    footerDisclaimer:
      "口径说明：区间年化为「价格停留在区间内」的理论值，未计无常损失；单日成交量年化波动极大。本页仅供信息参考，不构成投资建议。",
  },
  en: {
    updatedAt: (time, source) => `Updated ${time} · Source: ${source}`,
    loadingMarket: "Loading live market data…",
    refreshing: "Refreshing…",
    refresh: "Refresh",
    fetchError: "Failed to load market data. Please refresh and try again.",
    heroTitle: "BNC Crypto per Share · BNB Standard Corp",
    heroSub:
      "Nasdaq-listed BNB treasury company (Nasdaq: BNC) · Basic-basis figures only on this page · Live BNB per share — the figure behind management's “grow BNB per share” goal",
    perShareUnit: "BNB / share",
    usdPerShareUnit: "/ share",
    formulaLabel: "BNB per share =",
    formulaHoldings: (n) => `Holdings ${n} BNB`,
    formulaShares: (n) => `Basic shares ${n}`,
    statAdjNav: "Adjusted NAV / share (net of liabilities)",
    statMnav: "mNAV (BNCB price ÷ adjusted NAV)",
    discount: (p) => `${p}% discount`,
    premium: (p) => `${p}% premium`,
    statBncbPrice: "BNCB Price (BNC pricing basis)",
    statBnbPrice: "BNB price",
    spreadTitle: "Spread",
    spreadCoinValue: "Coin value per share",
    spreadStockPrice: "Current share price (BNCB)",
    spreadResult: "Spread",
    spreadAtPar: "At par",
    spreadNote:
      "The spread is the book difference between the coin value per share and the share price; treasury-company shares cannot be redeemed for the underlying coins, so a discount is not a risk-free arbitrage.",
    spreadWordDisc: "Discount",
    spreadWordPrem: "Premium",
    spreadDiscRate: (p) => `Discount rate ${p}%`,
    spreadPremRate: (p) => `Premium rate ${p}%`,
    spreadLegend:
      "Discount = the share price is below the coin value per share; premium = the share price is above the coin value per share.",
    editOpen: "Edit disclosed figures (holdings / shares / liabilities)",
    editClose: "Collapse",
    fieldHoldings: "BNB holdings (company-disclosed)",
    fieldShares: "Basic shares outstanding (company-disclosed)",
    fieldLiabilities: "Liabilities (USD, deducted in adjusted NAV)",
    editHint:
      "Defaults: 515,544 BNB held, 41,173,850 basic shares (company disclosures, 2026), liabilities ≈ $16.8M (as of 2026-07-31). Edits recalculate on the basic basis immediately and are saved in this browser.",
    poolsTitle: "BNCB Pool APY",
    poolsSub:
      "Shown by default: the ±5% range in-range APY — the yield converted from current on-chain active liquidity for a price band 5% above and below the current price. It is not the same as the 'pool average' in small print on each card (pool average = 24h volume × fee rate × 365 ÷ TVL). ±5% is a narrow band: capital efficiency and APY are high while the price stays inside, but income drops to zero once it leaves. Set one range for all pools below (full range, presets, or custom), or adjust each card individually.",
    unifiedLabel: "Unified range (applies to all pools)",
    poolRangeLabel: "This pool's range (this pool only)",
    fullRange: "Full range",
    custom: "Custom",
    downLabel: "Lower: below current price",
    upLabel: "Upper: above current price",
    feeRate: (p) => `Fee ${p}%`,
    headlineFull: "Full-range in-range APY",
    headlineRange: (down, up) => `Range −${down}% ~ +${up}% · in-range APY`,
    headlineAvgFallback: "Pool-average APY (on-chain data unavailable)",
    poolAvgLine: (pct) => `Pool average ${pct} (reference only, not the in-range APY)`,
    vol24h: "24h volume",
    annualFees: "Annualized fees",
    bncbSpot: "BNCB Price (pricing basis)",
    bandLabel: "Price band: ",
    fullPriceRangeText: "Full price range",
    effLabel: "Capital efficiency",
    baselineNote: "baseline",
    warnOutOfRange:
      "Once the price leaves this range, fee income drops to zero; your real APY must be multiplied by the share of time the price stays in range.",
    lpTitle: "LP Earnings Estimator",
    lpSelectPool: "Select pool",
    lpAmount: "Amount (USD)",
    lpRangeUsed: "Range applied",
    lpRangeNote: "(follows this pool card's current range setting)",
    lpDaily: "Est. daily fee income",
    lpYearly: "Est. annual fee income",
    lpShare: "Share of pool's active liquidity",
    lpHint:
      "Estimated assuming the price stays inside the selected range, before impermanent loss and slippage; income is zero while the price is out of range, so actual earnings will be lower.",
    loadingPools: "Loading pool data…",
    faqTitle: "FAQ",
    footerSource:
      "Data sources: GeckoTerminal / DexScreener market data and BSC on-chain reads (PancakeSwap V3 pool contracts, Uniswap V4 StateView), cached server-side for about 5 minutes. Official BNCB contract: 0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f — beware of fake tokens with the same name.",
    footerDisclaimer:
      "Methodology: range APYs are theoretical values assuming the price stays in range, before impermanent loss; annualizing a single day's volume is highly volatile. For information only — not investment advice.",
  },
  tw: {
    updatedAt: (time, source) => `資料更新於 ${time} · 來源 ${source}`,
    loadingMarket: "正在拉取實時行情…",
    refreshing: "重新整理中…",
    refresh: "重新整理",
    fetchError: "行情拉取失敗，請點重新整理重試。",
    heroTitle: "BNC 每股含幣量 · BNB Standard Corp",
    heroSub: "納斯達克上市的 BNB 財庫公司（Nasdaq: BNC），數字資產財庫公司（DAT）代表之一 · 本頁只按基本口徑計算",
    perShareUnit: "BNB / 股",
    usdPerShareUnit: "/ 股",
    formulaLabel: "每股含 BNB =",
    formulaHoldings: (n) => `持倉 ${n} BNB`,
    formulaShares: (n) => `基本股數 ${n} 股`,
    statAdjNav: "調整後 NAV / 股（扣負債）",
    statMnav: "mNAV（BNCB 價 ÷ 調整後 NAV）",
    discount: (p) => `折價 ${p}%`,
    premium: (p) => `溢價 ${p}%`,
    statBncbPrice: "BNCB 價格（BNC 定價基準）",
    statBnbPrice: "BNB 價格",
    spreadTitle: "價差",
    spreadCoinValue: "含幣價",
    spreadStockPrice: "當前股價（BNCB）",
    spreadResult: "價差",
    spreadAtPar: "平價",
    spreadNote: "價差為含幣價與股價的賬面差額；財庫公司股票不可按含幣量贖回，折價不等於無風險套利。",
    spreadWordDisc: "折價",
    spreadWordPrem: "溢價",
    spreadDiscRate: (p) => `折價率 ${p}%`,
    spreadPremRate: (p) => `溢價率 ${p}%`,
    spreadLegend: "折價＝股價低於每股含幣價值；溢價＝股價高於每股含幣價值。",
    editOpen: "編輯披露資料（持倉 / 股數 / 負債）",
    editClose: "收起",
    fieldHoldings: "BNB 持倉（枚，公司披露）",
    fieldShares: "基本股數（股，公司披露）",
    fieldLiabilities: "負債（美元，調整後 NAV 扣除項）",
    editHint: "預設值：持倉 515,544 枚 BNB、基本股數 41,173,850 股（公司 2026 年披露）、負債約 $16.8M（2026-07-31 披露口徑）。修改後立即按基本口徑重算，並儲存在本機瀏覽器。",
    poolsTitle: "BNCB 池子年化收益率",
    poolsSub: "預設顯示「±5% 區間在價內年化」：按鏈上當前有效流動性、只算當前價上下 5% 價格帶換算出的年化，與卡片小字的「全池平均」不是一回事（全池平均 = 24h 成交量 × 費率 × 365 ÷ TVL）。±5% 是很窄的區間：價格停留在帶內時資金效率高、年化也高，但價格一出帶收益即歸零。用下方統一設定可給所有池子換區間（全區間、各預設、自定義），也可以逐張卡片單獨改。",
    unifiedLabel: "統一區間設定（應用到所有池子）",
    poolRangeLabel: "本池價格區間（只改這個池）",
    fullRange: "全區間",
    custom: "自定義",
    downLabel: "下限：當前價下方",
    upLabel: "上限：當前價上方",
    feeRate: (p) => `費率 ${p}%`,
    headlineFull: "全區間在價內年化",
    headlineRange: (down, up) => `區間 −${down}% ~ +${up}% · 在價內年化`,
    headlineAvgFallback: "全池平均年化（鏈上讀數暫不可用）",
    poolAvgLine: (pct) => `全池平均 ${pct}（對照口徑，非區間年化）`,
    vol24h: "24h 成交量",
    annualFees: "年化手續費",
    bncbSpot: "BNCB 價格（定價基準）",
    bandLabel: "價格帶：",
    fullPriceRangeText: "全價格範圍",
    effLabel: "資金效率",
    baselineNote: "基準",
    warnOutOfRange: "價格走出該區間後手續費收益歸零；真實年化需乘上價格停留在區間內的時間佔比。",
    lpTitle: "LP 收益測算",
    lpSelectPool: "選擇池子",
    lpAmount: "投入金額（美元）",
    lpRangeUsed: "採用區間",
    lpRangeNote: "（跟隨該池卡片當前的區間設定）",
    lpDaily: "估算日手續費收入",
    lpYearly: "估算年手續費收入",
    lpShare: "佔池有效流動性份額",
    lpHint: "按價格停留在所選區間內估算，未計無常損失與滑點；價格出區間期間收入為 0，實際收益低於此估算。",
    loadingPools: "正在拉取池子資料…",
    faqTitle: "常見問題",
    footerSource: "資料來源：GeckoTerminal / DexScreener 行情與 BSC 鏈上讀數（PancakeSwap V3 池合約、Uniswap V4 StateView），服務端快取約 5 分鐘。官方 BNCB 合約：0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f，請警惕同名假幣。",
    footerDisclaimer: "口徑說明：區間年化為「價格停留在區間內」的理論值，未計無常損失；單日成交量年化波動極大。本頁僅供資訊參考，不構成投資建議。",
  },
};
