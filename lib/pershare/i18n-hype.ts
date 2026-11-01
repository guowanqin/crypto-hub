import type { Dict, Lang } from "./i18n";

/** HYPE 标签页在通用 Dict 之外多出的文案 */
export interface HypeDict extends Dict {
  brand: string;
  /** 看板口径标注（hero 区） */
  caliberNote: string;
  /** SEC 披露追踪口径并存提示 */
  secNote: string;
  fieldCash: string;
  fieldDeferredTax: string;
  fieldPurrPrice: string;
  /** 价差卡上的股价标签（带收盘日期，如「当前股价（PURR · 收盘价 2026-10-30）」） */
  spreadStockPricePurr: (date: string) => string;
  /** 价差卡上的股价标签（用户手动输入时） */
  spreadStockPricePurrManual: string;
  /** 股价统计格小字（用户手动输入时） */
  purrManualTag: string;
  /** PURR 取价方式说明（无代币化股票、用收盘价） */
  purrNote: string;
  /** HYPE 原生质押参考（小字） */
  stakingNote: string;
}

export const DICT_HYPE: Record<Lang, HypeDict> = {
  zh: {
    brand: "HYPE CALCULATOR",
    updatedAt: (time, source) => `数据更新于 ${time} · 来源 ${source}`,
    loadingMarket: "正在拉取实时行情…",
    refreshing: "刷新中…",
    refresh: "刷新",
    fetchError: "行情拉取失败，请点刷新重试。",
    heroTitle: "PURR 每股含 HYPE · Hyperliquid Strategies",
    heroSub:
      "纳斯达克上市的 HYPE 财库公司（Nasdaq: PURR），数字资产财库公司（DAT）· 本页按官方摊薄口径计算（与 BNC 页的基本口径不同）",
    perShareUnit: "HYPE / 股",
    usdPerShareUnit: "/ 股",
    formulaLabel: "每股含 HYPE =",
    formulaHoldings: (n) => `持仓 ${n} HYPE`,
    formulaShares: (n) => `摊薄股数 ${n} 股`,
    statAdjNav: "调整后 NAV / 股（持仓＋现金－递延税负债）",
    statMnav: "mNAV（PURR 收盘价 ÷ 调整后 NAV）",
    discount: (p) => `折价 ${p}%`,
    premium: (p) => `溢价 ${p}%`,
    statBncbPrice: "HYPE 价格（实时，WHYPE 池价）",
    statBnbPrice: "PURR 股价（纳斯达克收盘价）",
    spreadTitle: "价差",
    spreadCoinValue: "含币价",
    spreadStockPrice: "当前股价（PURR）",
    spreadStockPricePurr: (date) => `当前股价（PURR · 收盘价 ${date}）`,
    spreadStockPricePurrManual: "当前股价（PURR · 手动输入）",
    purrManualTag: "手动输入",
    spreadResult: "价差",
    spreadAtPar: "平价",
    spreadNote:
      "价差为含币价与股价的账面差额；财库公司股票不可按含币量赎回，折价不等于无风险套利。",
    spreadWordDisc: "折价",
    spreadWordPrem: "溢价",
    spreadDiscRate: (p) => `折价率 ${p}%`,
    spreadPremRate: (p) => `溢价率 ${p}%`,
    spreadLegend: "折价＝股价低于每股含币价值；溢价＝股价高于每股含币价值。",
    editOpen: "编辑披露数据（持仓 / 股数 / 现金 / 递延税负债 / PURR 股价）",
    editClose: "收起",
    fieldHoldings: "HYPE 持仓（枚，公司看板口径）",
    fieldShares: "完全摊薄股数（股，公司看板口径）",
    fieldLiabilities: "负债（美元）",
    fieldCash: "现金（美元）",
    fieldDeferredTax: "递延税负债（美元）",
    fieldPurrPrice: "PURR 股价（美元，手动兜底值，可编辑）",
    editHint:
      "默认值：持仓 38,900,000 枚 HYPE、完全摊薄股数 302,700,000 股（公司官方看板口径，2026-10-29，看板周更；摊薄股数由看板按库藏股法随股价计算）；现金 $132.6M（2026-08-19）、递延税负债约 $194M，公司无有息负债；PURR 股价由服务端经 Yahoo Finance 自动获取最近收盘价，本字段为手动兜底值（预填 $11.01 = 2026-10-30 收盘），手动修改后以本字段为准。修改后立即按摊薄口径重算，并保存在本机浏览器。",
    caliberNote:
      "口径标注：持仓与股数采用公司官方看板口径（hypestrat.xyz，2026-10-29）；本页采用官方摊薄口径——PURR 基本股数 197.8M 股为 2026-08-23 的旧数字且公司持续增发，故不采用。",
    secNote:
      "并存提示：SEC 披露追踪口径的持仓为 29.28M 枚（截至 2026-08-27），与看板口径时点不同，详见下方常见问题。",
    purrNote:
      "取价说明：PURR 没有 BNCB 式的高流动性代币化股票（无 bStocks / xStocks；Ondo 的 PURRon 市值仅约 $1.3K 不可用），故 mNAV 与价差用纳斯达克收盘价计算：服务端经 Yahoo Finance 自动获取最近一个交易日的收盘价并标注日期（上方日期即收盘日期），不是实时价；自动取价失败、或你在编辑区手动改过股价时，改用手动值并标注「手动输入」。Bitget 站内 rPURR（约 $11）仅作参考。",
    stakingNote: "参考：HYPE 原生质押年化 ≈ 2.3%（浮动），与下方池子年化不是一回事。",
    poolsTitle: "HYPE 池子年化（HyperEVM）",
    poolsSub:
      "默认显示「±5% 区间在价内年化」：按 HyperEVM 链上当前有效流动性、只算当前价上下 5% 价格带换算出的年化，与卡片小字的「全池平均」不是一回事（全池平均 = 24h 成交量 × 费率 × 365 ÷ TVL）。±5% 是很窄的区间：价格停留在带内时资金效率高、年化也高，但价格一出带收益即归零。用下方统一设置可给所有池子换区间（全区间、各预设、自定义），也可以逐张卡片单独改。注意：HYPE 的主要现货流动性在 HyperCore 原生订单簿，HyperEVM 的 AMM 池只是其中一部分。",
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
    bncbSpot: "WHYPE 价格（池内现价）",
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
      "数据来源：GeckoTerminal（hyperevm 网络）行情与 HyperEVM 链上读数（Project X、HyperSwap V3 池合约），服务端缓存约 5 分钟。WHYPE 合约：0x5555555555555555555555555555555555555555。注意：Hyperliquid 链上的同名 meme 代币 PURR 与上市公司 Hyperliquid Strategies（PURR）无关，本页不使用其数据。",
    footerDisclaimer:
      "口径说明：每股含 HYPE 按公司看板口径（2026-10-29）与官方摊薄口径计算，SEC 披露追踪口径（29.28M 枚，2026-08-27）并存提示；PURR 股价为经 Yahoo Finance 获取的纳斯达克最近收盘价、非实时。区间年化为「价格停留在区间内」的理论值，未计无常损失；单日成交量年化波动极大。本页仅供信息参考，不构成投资建议。",
  },
  en: {
    brand: "HYPE CALCULATOR",
    updatedAt: (time, source) => `Updated ${time} · Source: ${source}`,
    loadingMarket: "Loading live market data…",
    refreshing: "Refreshing…",
    refresh: "Refresh",
    fetchError: "Failed to load market data. Please refresh and try again.",
    heroTitle: "PURR HYPE per Share · Hyperliquid Strategies",
    heroSub:
      "Nasdaq-listed HYPE treasury company (Nasdaq: PURR) · Official diluted basis on this page (unlike the BNC page's basic basis) · Live HYPE per share, PURR mNAV and the spread at a glance",
    perShareUnit: "HYPE / share",
    usdPerShareUnit: "/ share",
    formulaLabel: "HYPE per share =",
    formulaHoldings: (n) => `Holdings ${n} HYPE`,
    formulaShares: (n) => `Diluted shares ${n}`,
    statAdjNav: "Adjusted NAV / share (holdings + cash − deferred tax)",
    statMnav: "mNAV (PURR close ÷ adjusted NAV)",
    discount: (p) => `${p}% discount`,
    premium: (p) => `${p}% premium`,
    statBncbPrice: "HYPE Price (live, WHYPE pool price)",
    statBnbPrice: "PURR stock price (Nasdaq close)",
    spreadTitle: "Spread",
    spreadCoinValue: "Coin value per share",
    spreadStockPrice: "Current share price (PURR)",
    spreadStockPricePurr: (date) => `Current share price (PURR · close ${date})`,
    spreadStockPricePurrManual: "Current share price (PURR · manual entry)",
    purrManualTag: "manual entry",
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
    editOpen:
      "Edit disclosed figures (holdings / shares / cash / deferred tax / PURR price)",
    editClose: "Collapse",
    fieldHoldings: "HYPE holdings (company dashboard basis)",
    fieldShares: "Fully diluted shares (company dashboard basis)",
    fieldLiabilities: "Liabilities (USD)",
    fieldCash: "Cash (USD)",
    fieldDeferredTax: "Deferred tax liability (USD)",
    fieldPurrPrice: "PURR stock price (USD, manual fallback, editable)",
    editHint:
      "Defaults: 38,900,000 HYPE held and 302,700,000 fully diluted shares (company dashboard basis, 2026-10-29, updated weekly; the diluted count is computed by the dashboard with the treasury method and moves with the share price); cash $132.6M (2026-08-19), deferred tax liability ≈ $194M, no interest-bearing debt; the PURR price is fetched automatically from Yahoo Finance (latest close) — this field is the manual fallback (prefilled at $11.01, the 2026-10-30 close) and takes over once you edit it. Edits recalculate on the diluted basis immediately and are saved in this browser.",
    caliberNote:
      "Basis note: holdings and share count use the company's official dashboard figures (hypestrat.xyz, 2026-10-29), and this page uses the official diluted basis — PURR's basic share count of 197.8M dates from 2026-08-23 and is stale amid ongoing issuance, so it is not used.",
    secNote:
      "Also note: the SEC-filing-tracked holdings figure is 29.28M HYPE (as of 2026-08-27), a different date from the dashboard basis — see the FAQ below.",
    purrNote:
      "Pricing note: PURR has no liquid tokenized stock like BNCB (no bStocks / xStocks listing; Ondo's PURRon has only ≈ $1.3K market cap and is unusable), so mNAV and the spread use the Nasdaq closing price: the server fetches the most recent trading day's close via Yahoo Finance and labels it with its date (the date above is the close date) — not a live price. If the automatic fetch fails, or you edit the price field yourself, the manual value is used instead and labeled “manual entry”. Bitget's in-platform rPURR (≈ $11) is for reference only.",
    stakingNote:
      "Reference: native HYPE staking yields ≈ 2.3% APY (variable) — a different thing from the pool APYs below.",
    poolsTitle: "HYPE Pool APY (HyperEVM)",
    poolsSub:
      "Shown by default: the ±5% range in-range APY — the yield converted from current HyperEVM on-chain active liquidity for a price band 5% above and below the current price. It is not the same as the 'pool average' in small print on each card (pool average = 24h volume × fee rate × 365 ÷ TVL). ±5% is a narrow band: capital efficiency and APY are high while the price stays inside, but income drops to zero once it leaves. Set one range for all pools below (full range, presets, or custom), or adjust each card individually. Note: most of HYPE's spot liquidity sits in the HyperCore native order book — HyperEVM AMM pools are only part of the picture.",
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
    bncbSpot: "WHYPE price (in-pool)",
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
      "Data sources: GeckoTerminal (hyperevm network) market data and HyperEVM on-chain reads (Project X and HyperSwap V3 pool contracts), cached server-side for about 5 minutes. WHYPE contract: 0x5555555555555555555555555555555555555555. Note: the meme token also named PURR on Hyperliquid is unrelated to the listed company Hyperliquid Strategies (PURR); this page does not use its data.",
    footerDisclaimer:
      "Methodology: HYPE per share uses the company dashboard basis (2026-10-29) and the official diluted basis; the SEC-filing-tracked figure (29.28M HYPE, 2026-08-27) is shown alongside. The PURR stock price is the latest Nasdaq close fetched via Yahoo Finance, not live. Range APYs are theoretical values assuming the price stays in range, before impermanent loss; annualizing a single day's volume is highly volatile. For information only — not investment advice.",
  },
};
