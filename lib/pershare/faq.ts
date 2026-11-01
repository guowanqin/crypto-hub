export interface FaqItem {
  q: string;
  a: string;
}

/** 页面可见的常见问题区块与 JSON-LD（FAQPage）共用文案，中英各一份，保持一致 */
export const FAQ_ITEMS_ZH: FaqItem[] = [
  {
    q: "什么是财库公司？BNC 算财库公司吗？",
    a: "财库公司（数字资产财库公司，Digital Asset Treasury Company，简称 DAT）指把加密资产作为核心财库储备持有的上市公司：这类公司把融资所得或自有资金大量配置为比特币、BNB 等加密资产，并以「每股含币量」作为核心估值指标之一。BNC（BNB Standard Corp，纳斯达克代码 BNC）正是这样一家公司——它以持有 BNB 为核心财库策略，按公司披露持有 515,544 枚 BNB，是目前最大的企业级 BNB 财库公司。",
  },
  {
    q: "BNC 的 mNAV 怎么看？股价是折价还是溢价？",
    a: "mNAV = 股价 ÷ 每股净资产价值，是衡量财库公司股价相对每股含币价值折溢价的核心指标：小于 1 说明股价低于每股含币价值（折价），大于 1 则是溢价。本页用 BNCB 实时价 ÷ 调整后 NAV（每股含 BNB 的美元价值扣除负债，基本口径）实时计算 BNC 的 mNAV；hero 区下方的价差卡把同一件事拆成美元金额——含币价 − 当前股价 = 价差，并标注折价率或溢价率。财库公司折价在 DAT 股里并不罕见，但要注意：股票不能按每股含币量向公司赎回 BNB，折价不等于无风险套利。",
  },
  {
    q: "池子年化为什么默认显示 ±5% 区间？和全池平均有什么区别？",
    a: "页面上的年化是「在价内年化」：手续费只分给价格区间内的流动性，所以按链上当前有效流动性、针对你选定的价格带换算。默认选 ±5% 区间，也就是当前价上下 5% 的窄带——价格停留在带内时资金效率最高、年化也最高。全池平均则是整个池子的手续费除以总锁仓量（TVL）的平均数，把全池所有流动性混在一起算，通常明显低于 ±5% 区间的在价内年化、高于全区间年化，所以只在卡片小字里作对照。注意 ±5% 是很窄的区间：价格一旦走出区间，手续费收益立即归零，真实年化还要乘上价格停留在区间内的时间占比；想稳一点可以改选更宽的区间或全区间。",
  },
  {
    q: "为什么没有 BNCB/USDC 池？",
    a: "截至目前，BSC 上的行情索引（GeckoTerminal、DexScreener）里没有任何有规模的 BNCB/USDC 流动性池，BNCB 的链上交易对集中在 USDT 与 WBNB 两个计价币上，所以页面只列这四个真实存在的池子。",
  },
  {
    q: "价格区间怎么自定义？出区间会怎样？",
    a: "在池子板块顶部可以统一选择全区间、±50%、±30%、±20%、±10%、±5%，也可以在每张池子卡片上单独选区间，或点「自定义」用滑块和数字输入拉出不对称区间（例如下方 −10%、上方 +30%）。区间越窄、价格停留在区间内时年化越高，但价格一旦走出区间，该头寸的手续费收益立即归零，真实年化还要乘上价格实际停留在区间内的时间占比。BNCB 跟踪的是美股，美股开盘跳空很容易把价格打出窄区间。",
  },
  {
    q: "基本口径是什么意思？",
    a: "基本口径指分母只算公司已经发行在外的普通股股数（BNC 为 41,173,850 股，披露数据），每股含 BNB = 持仓 515,544 枚 ÷ 基本股数 ≈ 0.012521 枚。它回答的是「今天买一股 BNC，实打实对应多少枚 BNB」，本页面的每股含币量、调整后 NAV 与 mNAV 都按基本口径计算。",
  },
];

export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    q: "What is a treasury company? Is BNC one?",
    a: "A treasury company — a digital asset treasury company (DAT) — is a listed company that holds crypto assets as its core treasury reserve: it allocates raised or own capital heavily into assets such as Bitcoin or BNB, and is valued largely on its crypto per share. BNC (BNB Standard Corp, Nasdaq: BNC) is exactly that: holding BNB is its core treasury strategy, with 515,544 BNB disclosed, making it the largest corporate BNB treasury company today.",
  },
  {
    q: "What is BNC's mNAV? Is the stock at a discount or a premium?",
    a: "mNAV — share price ÷ net asset value per share — is the standard gauge of how a treasury stock trades against the crypto behind it: below 1.0 the shares trade at a discount to the coin value per share, above 1.0 at a premium. This page computes BNC mNAV live as the BNCB price ÷ adjusted NAV (the dollar value of BNB per share, net of liabilities, on the basic basis). The spread card below the hero figure shows the same gap in dollar terms — coin value per share minus the current share price — with the discount or premium rate. Note that the shares cannot be redeemed for the underlying BNB, so a discount is not a risk-free arbitrage.",
  },
  {
    q: "Why is pool APY shown for a ±5% range by default? How does it differ from the pool average?",
    a: "The APY on this page is an in-range APY: fees only go to liquidity inside the price range, so it is converted from current on-chain active liquidity for the specific band you choose. The default is a ±5% band — 5% above and below the current price — where capital efficiency, and therefore APY, is highest while the price stays inside. The pool average, by contrast, is the pool's total fees divided by its total value locked (TVL): a blended figure across all liquidity in the pool, usually far below the ±5% in-range APY and above the full-range APY, so it appears only as a small reference line on each card. Note that ±5% is a narrow band: once the price leaves it, fee income drops to zero immediately, and your real APY must be multiplied by the share of time the price actually stays in range; pick a wider range or the full range if you prefer a steadier profile.",
  },
  {
    q: "Why is there no BNCB/USDC pool?",
    a: "As of now, no BNCB/USDC liquidity pool of any meaningful size exists in the BSC market indexes (GeckoTerminal, DexScreener). BNCB's on-chain pairs are concentrated in USDT and WBNB quotes, so the page lists only these four pools that actually exist.",
  },
  {
    q: "How do I customize the price range? What happens out of range?",
    a: "Use the unified control at the top of the pools section to pick full range, ±50%, ±30%, ±20%, ±10% or ±5% for all pools, or set a range per pool card — including an asymmetric custom range via the sliders and number inputs (e.g. −10% below and +30% above). The narrower the range, the higher the APY while the price stays inside; but once the price leaves your range, fee income drops to zero immediately, and your real APY must be multiplied by the share of time the price actually stays in range. BNCB tracks a US stock, and US market open gaps can easily knock the price out of a narrow range.",
  },
  {
    q: "What does the basic basis mean?",
    a: "The basic basis uses only the common shares actually issued and outstanding as the denominator (41,173,850 shares for BNC, per company disclosure). BNB per share = 515,544 BNB held ÷ basic shares ≈ 0.012521. It answers: 'If I buy one share of BNC today, how much BNB does it actually represent?' Every per-share figure on this page — crypto per share, adjusted NAV and mNAV — uses the basic basis.",
  },
];

/** 默认（中文）FAQ，供 layout 的 JSON-LD 等既有引用使用 */
export const FAQ_ITEMS = FAQ_ITEMS_ZH;
