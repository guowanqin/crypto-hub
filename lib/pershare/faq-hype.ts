import type { FaqItem } from "./faq";

/** HYPE 标签页（PURR / Hyperliquid Strategies）专属 FAQ，中英各一份，页面与 JSON-LD 共用 */
export const FAQ_HYPE_ZH: FaqItem[] = [
  {
    q: "PURR 每股含多少 HYPE？",
    a: "按公司官方看板口径（2026-10-29）：持仓 38.9M 枚 HYPE ÷ 完全摊薄股数 302.7M 股 ≈ 0.1285 枚/股。也就是说，买 1 股 PURR，背后大约对应 0.129 枚 HYPE；美元价值随 HYPE 实时价格浮动，本页 hero 区的大字就是用实时价换算的美元/股。公司看板为周更，持仓与股数变动后本页数值会随披露更新（持仓、股数可在页面上编辑）。",
  },
  {
    q: "PURR 的 mNAV 怎么看？现在是折价还是溢价？",
    a: "mNAV = 股价 ÷ 每股净资产价值。本页用 PURR 在纳斯达克的最近收盘价 ÷ 调整后 NAV（每股含 HYPE 的美元价值 + 现金 − 递延税负债，官方摊薄口径）计算 PURR 的 mNAV：小于 1 表示股价低于每股含币价值、处于折价，大于 1 则是溢价。hero 区下方的价差卡把同一件事拆成美元金额——含币价 − 当前股价 = 价差，并标注折价率或溢价率。PURR 没有高流动性的代币化股票，取价用的是收盘价而非实时价，看 mNAV 时要留意这个时间差；股票同样不能按含币量赎回 HYPE，折价不等于无风险套利。",
  },
  {
    q: "为什么 HYPE 页用摊薄口径，而 BNC 页用基本口径？",
    a: "因为两家公司的股数披露状况不同。PURR 的基本股数 197.8M 股是 2026-08-23 的数字，之后公司持续增发，这个分母已经过时；公司官方看板公布每股数据时用的就是完全摊薄股数（302.7M 股，含可转换证券、认股权证等摊薄因素；看板按库藏股法计算，该数字会随股价小幅变动）。所以本页与官口径一致，采用摊薄口径并明确标注。BNC 的基本股数披露较新，其页面按基本口径计算。",
  },
  {
    q: "PURR 有代币化股票吗？",
    a: "目前没有高流动性的代币化 PURR 股票：Binance bStocks 没有 PURR（BNC 有对应的 BNCB），xStocks（Backed）也没有；Ondo 有一个 PURRon，但市值仅约 $1.3K，几乎没有流动性，不可用。Bitget 站内有 rPURR（约 $11）仅作参考。因此本页的 mNAV 与价差不用代币价取价，而是用 PURR 在纳斯达克的收盘价：服务端通过 Yahoo Finance 自动获取最近一个交易日的收盘价并在页面上如实标注日期（自动取价失败时改用可编辑字段里的手动兜底值）——收盘价不是实时价格。",
  },
  {
    q: "持仓的看板口径和披露口径为什么不一样？",
    a: "两个数字来自不同时点、不同渠道：公司官方看板（hypestrat.xyz，周更）显示持仓 38.9M 枚 HYPE（2026-10-29）；而按 SEC 披露文件追踪的口径是 29.28M 枚（截至 2026-08-27）。SEC 披露有滞后，看板更新更勤，两者并不矛盾。本页以看板口径为主计算每股含 HYPE，并同时标注披露口径供对照；增持的正式确认以公司后续 SEC 文件为准。",
  },
  {
    q: "HYPE 池子年化收益率怎么算？和 BNCB 池子有什么不同？",
    a: "算法与 BNC 页一致：在价内年化 = 年化手续费 × (L/V) ÷ 当前有效流动性，默认显示 ±5% 区间，全池平均只作对照，价格出区间收益归零。不同之处在于数据面：HYPE 的池子在 HyperEVM 上（Project X、HyperSwap V3），本页通过 GeckoTerminal（hyperevm 网络）取 TVL 与成交量、通过 HyperEVM 链上读数取有效流动性。还要注意，HYPE 的主要现货流动性在 HyperCore 原生订单簿上，HyperEVM 的 AMM 池只是其中一部分，池子年化不代表 HYPE 整体的流动性状况。",
  },
];

export const FAQ_HYPE_TW: typeof FAQ_HYPE_ZH = [
  {
    q: "PURR 每股含多少 HYPE？",
    a: "按公司官方看板口徑（2026-10-29）：持倉 38.9M 枚 HYPE ÷ 完全攤薄股數 302.7M 股 ≈ 0.1285 枚/股。也就是說，買 1 股 PURR，背後大約對應 0.129 枚 HYPE；美元價值隨 HYPE 實時價格浮動，本頁 hero 區的大字就是用實時價換算的美元/股。公司看板為周更，持倉與股數變動後本頁數值會隨披露更新（持倉、股數可在頁面上編輯）。",
  },
  {
    q: "PURR 的 mNAV 怎麼看？現在是折價還是溢價？",
    a: "mNAV = 股價 ÷ 每股淨資產價值。本頁用 PURR 在納斯達克的最近收盤價 ÷ 調整後 NAV（每股含 HYPE 的美元價值 + 現金 − 遞延稅負債，官方攤薄口徑）計算 PURR 的 mNAV：小於 1 表示股價低於每股含幣價值、處於折價，大於 1 則是溢價。hero 區下方的價差卡把同一件事拆成美元金額——含幣價 − 當前股價 = 價差，並標註折價率或溢價率。PURR 沒有高流動性的代幣化股票，取價用的是收盤價而非實時價，看 mNAV 時要留意這個時間差；股票同樣不能按含幣量贖回 HYPE，折價不等於無風險套利。",
  },
  {
    q: "為什麼 HYPE 頁用攤薄口徑，而 BNC 頁用基本口徑？",
    a: "因為兩家公司的股數披露狀況不同。PURR 的基本股數 197.8M 股是 2026-08-23 的數字，之後公司持續增發，這個分母已經過時；公司官方看板公佈每股資料時用的就是完全攤薄股數（302.7M 股，含可轉換證券、認股權證等攤薄因素；看板按庫藏股法計算，該數字會隨股價小幅變動）。所以本頁與官口徑一致，採用攤薄口徑並明確標註。BNC 的基本股數披露較新，其頁面按基本口徑計算。",
  },
  {
    q: "PURR 有代幣化股票嗎？",
    a: "目前沒有高流動性的代幣化 PURR 股票：Binance bStocks 沒有 PURR（BNC 有對應的 BNCB），xStocks（Backed）也沒有；Ondo 有一個 PURRon，但市值僅約 $1.3K，幾乎沒有流動性，不可用。Bitget 站內有 rPURR（約 $11）僅作參考。因此本頁的 mNAV 與價差不用代幣價取價，而是用 PURR 在納斯達克的收盤價：服務端透過 Yahoo Finance 自動獲取最近一個交易日的收盤價並在頁面上如實標註日期（自動取價失敗時改用可編輯欄位裡的手動兜底值）——收盤價不是實時價格。",
  },
  {
    q: "持倉的看板口徑和披露口徑為什麼不一樣？",
    a: "兩個數字來自不同時點、不同渠道：公司官方看板（hypestrat.xyz，周更）顯示持倉 38.9M 枚 HYPE（2026-10-29）；而按 SEC 披露檔案追蹤的口徑是 29.28M 枚（截至 2026-08-27）。SEC 披露有滯後，看板更新更勤，兩者並不矛盾。本頁以看板口徑為主計算每股含 HYPE，並同時標註披露口徑供對照；增持的正式確認以公司後續 SEC 檔案為準。",
  },
  {
    q: "HYPE 池子年化收益率怎麼算？和 BNCB 池子有什麼不同？",
    a: "演算法與 BNC 頁一致：在價內年化 = 年化手續費 × (L/V) ÷ 當前有效流動性，預設顯示 ±5% 區間，全池平均只作對照，價格出區間收益歸零。不同之處在於資料面：HYPE 的池子在 HyperEVM 上（Project X、HyperSwap V3），本頁透過 GeckoTerminal（hyperevm 網路）取 TVL 與成交量、透過 HyperEVM 鏈上讀數取有效流動性。還要注意，HYPE 的主要現貨流動性在 HyperCore 原生訂單簿上，HyperEVM 的 AMM 池只是其中一部分，池子年化不代表 HYPE 整體的流動性狀況。",
  },
];

export const FAQ_HYPE_EN: FaqItem[] = [
  {
    q: "How much HYPE does each PURR share represent?",
    a: "On the company's official dashboard basis (2026-10-29): 38.9M HYPE held ÷ 302.7M fully diluted shares ≈ 0.1285 HYPE per share. In other words, one share of PURR is backed by roughly 0.129 HYPE; the dollar value moves with the live HYPE price — the big figure in this page's hero section is exactly that live conversion. The dashboard updates weekly; holdings and share counts on this page are editable as new disclosures arrive.",
  },
  {
    q: "What is PURR's mNAV? Is PURR trading at a discount or a premium?",
    a: "mNAV — share price ÷ net asset value per share — gauges how the stock trades against the crypto behind it. This page computes PURR mNAV as the latest Nasdaq closing price ÷ adjusted NAV (the dollar value of HYPE per share, plus cash, minus the deferred tax liability, on the official diluted basis): below 1.0 PURR trades at a discount to its coin value per share, above 1.0 at a premium. The spread card below the hero figure shows the same gap in dollars, with the discount or premium rate. Because PURR has no liquid tokenized stock, the price input is a close rather than a live quote — mind the timing gap; and the shares cannot be redeemed for the underlying HYPE, so a discount is not a risk-free arbitrage.",
  },
  {
    q: "Why does the HYPE page use the diluted basis while the BNC page uses the basic basis?",
    a: "Because the two companies' share-count disclosures differ. PURR's basic share count of 197.8M dates from 2026-08-23 and the company has kept issuing shares since, so that denominator is stale; the company's own dashboard publishes per-share figures on a fully diluted basis (302.7M shares, including convertibles, warrants and other dilutive instruments; the dashboard computes it with the treasury method, so the figure moves slightly with the share price). This page therefore follows the official basis and labels it clearly. BNC's basic share count is more recent, so its page uses the basic basis.",
  },
  {
    q: "Is there a tokenized PURR stock?",
    a: "There is currently no liquid tokenized PURR stock: Binance bStocks does not list PURR (BNC has BNCB), and neither does xStocks (Backed). Ondo has a PURRon, but its market cap is only about $1.3K — effectively no liquidity, so it is unusable. Bitget offers an in-platform rPURR (around $11) for reference only. This page therefore prices mNAV and the spread off PURR's Nasdaq closing price: the server fetches the most recent trading day's close automatically via Yahoo Finance and labels it with its date (falling back to the manual value in the editable field if the fetch fails) — a closing price is not a live price.",
  },
  {
    q: "Why do the dashboard holdings and the SEC-filing holdings differ?",
    a: "The two figures come from different channels at different times: the company's official dashboard (hypestrat.xyz, updated weekly) shows 38.9M HYPE held (2026-10-29), while the figure tracked from SEC filings is 29.28M HYPE (as of 2026-08-27). SEC filings lag behind, while the dashboard updates more frequently — the two are not contradictory. This page computes HYPE per share on the dashboard basis and shows the filing basis alongside for reference; formal confirmation of any increase comes from the company's subsequent SEC filings.",
  },
  {
    q: "How is the HYPE pool APY calculated? How does it differ from the BNCB pools?",
    a: "The method is the same as on the BNC page: in-range APY = annualized fees × (L/V) ÷ current active liquidity, shown for a ±5% range by default, with the pool average as a reference only, and income dropping to zero once the price leaves the range. The difference is the data surface: HYPE pools live on HyperEVM (Project X, HyperSwap V3); this page pulls TVL and volume from GeckoTerminal (hyperevm network) and active liquidity from HyperEVM on-chain reads. Note also that most of HYPE's spot liquidity sits in the HyperCore native order book — HyperEVM AMM pools are only part of the picture, so pool APYs do not describe HYPE liquidity as a whole.",
  },
];
