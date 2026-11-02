import type { Lang } from "./site";

export interface TagDef {
  id: string;
  name: Record<Lang, string>;
  // 标签落地页的一段介绍（页面正文，中英）
  intro: Record<Lang, string>;
  // SEO：独立 meta description（中英）
  seoDescription: Record<Lang, string>;
  keywords: string[];
  // 可选：分类选购/使用指南（标签页正文补厚，中英）
  guide?: Record<Lang, string>;
  // 可选：常见问答（标签页正文，中英）
  faqs?: { q: Record<Lang, string>; a: Record<Lang, string> }[];
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
    guide: {
      zh: "看行情先统一口径：同一个币在不同网站价格对不上，多半是聚合的交易所不同、更新慢了几秒。日常查价、市值排名用 CoinGecko、CoinMarketCap 这类聚合站足够；盯 DEX 新币要去 DexScreener、GeckoTerminal 看池子——别只看价格，流动性更重要，池子只有几千美元的币，涨幅再漂亮也卖不出去。涨跌幅确认是 24 小时还是 7 天口径，市值分清流通市值与完全稀释市值（FDV），差得远说明后面还有大量解锁。看财库股每股含币量，用站内的 PerShare。",
      en: "Start by aligning definitions: when two sites show different prices for the same coin, it is usually a different mix of exchanges and a few seconds of lag, not fake data. For everyday prices and market-cap rankings, aggregators like CoinGecko and CoinMarketCap are enough. For brand-new DEX tokens, go to DexScreener or GeckoTerminal and look past the price: liquidity depth matters more, because a pool holding only a few thousand dollars cannot absorb your sell however pretty the chart looks. Check whether a move is measured over 24 hours or 7 days, and separate circulating market cap from fully diluted valuation (FDV) — a wide gap means heavy unlocks ahead. For treasury stocks specifically, the built-in PerShare tracks the coin content of each share.",
    },
    faqs: [
      {
        q: {
          zh: "CoinGecko 和 CoinMarketCap 上的价格为什么不一样？",
          en: "Why do CoinGecko and CoinMarketCap show different prices for the same coin?",
        },
        a: {
          zh: "两家聚合的交易所和加权方式不同，更新也有先后，流动性薄的小币差价更明显。看主流币用哪家都行；真要下单，最终以你下单那家交易所的实时盘口为准。",
          en: "They aggregate different exchanges with different weighting, and their updates land seconds apart; thin, illiquid coins differ the most. Either is fine for major coins — but when you actually trade, the order book of the exchange you are trading on is the price that counts.",
        },
      },
      {
        q: {
          zh: "DEX 上新币涨了几十倍，能买吗？",
          en: "A new DEX token is up dozens of times — is it safe to buy?",
        },
        a: {
          zh: "先别看涨幅，去 DEX 终端看池子的流动性和持有人分布：流动性太浅，你买得进卖不出；前几名地址占比过高，随时可能砸盘。再确认合约允许卖出（不是只能买不能卖的貔貅盘），都过了关再谈买入。",
          en: "Ignore the percentage gain and check the pool first: its liquidity and holder distribution. A shallow pool lets you buy but not sell, and a few top addresses holding most of the supply can dump at any time. Also confirm the contract actually allows selling (no honeypot), then decide.",
        },
      },
      {
        q: {
          zh: "流通市值和 FDV 应该看哪个？",
          en: "Market cap or FDV — which one should I look at?",
        },
        a: {
          zh: "两个都看：流通市值反映当下盘子的大小，FDV 是全部代币解锁之后的市值。如果 FDV 是流通的好几倍，说明未来抛压很大，估值要打折看，别只拿流通市值觉得便宜。",
          en: "Both. Circulating market cap shows the size of today's float; FDV is the valuation once every token is unlocked. If FDV is several times the circulating cap, big sell pressure is still ahead — discount the valuation instead of calling it cheap on the circulating figure alone.",
        },
      },
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
    guide: {
      zh: "链上工具分工明确：区块浏览器（Etherscan 这类）是查账本的——转账到没到、合约验证过没有、地址还剩多少，先在这里核对；分析平台是做研究的：Dune 用 SQL 把原始数据做成可筛选的面板，跟踪赛道的资金和用户变化；Arkham 给地址打实体标签，盯交易所和巨鲸钱包的进出；Bubblemaps 用气泡图看持币地址之间的关联，专治「筹码是不是集中在少数人手里」。新手顺序：先查清一笔交易，再看懂一个地址的全部持仓，最后再碰面板和标签，别被别人的结论牵着走。",
      en: "On-chain tools have clear jobs. A block explorer (Etherscan and its peers) is the ledger: did a transfer land, is the contract verified, what does an address still hold — verify here first. Analytics platforms are for research: Dune turns raw data into filterable dashboards with SQL, good for tracking money and users across a sector; Arkham attaches entity labels to addresses, good for watching exchanges, institutions and whale wallets; Bubblemaps draws holder relationships as bubble charts, built for one question — is the supply concentrated in a few hands? A sensible learning order: read a single transaction in an explorer, then read one address's full portfolio, then graduate to dashboards and labels instead of starting from other people's conclusions.",
    },
    faqs: [
      {
        q: {
          zh: "怎么查一个钱包地址都买了哪些币？",
          en: "How do I see which tokens a wallet address holds?",
        },
        a: {
          zh: "把地址粘进对应链的区块浏览器（以太坊用 Etherscan），看它的代币持仓页就能列全。再想知道这个地址属于哪个机构、历史上跟谁转过账，去 Arkham 的实体标签页对照着看。",
          en: "Paste the address into the block explorer for its chain (Etherscan for Ethereum) and open its token holdings page for the full list. To learn which entity the address belongs to and who it has transacted with, cross-check it on Arkham's entity pages.",
        },
      },
      {
        q: {
          zh: "巨鲸地址在哪里看？转入交易所就是要砸盘吗？",
          en: "Where can I track whale wallets — and does a transfer to an exchange mean a dump is coming?",
        },
        a: {
          zh: "Arkham 和 Dune 上都有现成的巨鲸追踪面板，单个代币的大户分布可以在 Bubblemaps 看。转入交易所不必然是砸盘，也可能是做市、换仓或托管迁移，要结合金额大小和后续动作判断，别看到大额转账就追涨杀跌。",
          en: "Arkham and Dune both host ready-made whale-tracking dashboards, and Bubblemaps shows the big holders of a single token. A transfer into an exchange is not automatically a sell-off — it can be market making, a wallet reshuffle or a custody move. Judge it by size and by what happens next instead of chasing every large transfer.",
        },
      },
      {
        q: {
          zh: "Etherscan 显示交易成功，币为什么还没到账？",
          en: "Etherscan says the transaction succeeded — why hasn't the money arrived?",
        },
        a: {
          zh: "先核对转的是哪条链、哪个代币合约：转错链、或者转了同名假币，浏览器显示成功也不会进对方账户。再确认接收方是不是交易所充值地址——不少平台要等够确认数才入账，耐心等确认数达标即可。",
          en: "First check which chain and which token contract the transfer used: a wrong-chain send, or a look-alike fake token, will show as successful yet never reach the recipient. If the destination is an exchange deposit address, many platforms credit only after a set number of confirmations — wait for that count.",
        },
      },
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
    guide: {
      zh: "看 DeFi 先看 TVL（总锁仓量）：有多少真金白银押在一个协议或一条链里，是判断规模和信任度的第一指标，但别当成「项目值多少钱」——TVL 会随币价涨跌被动变化，也能被高补贴短期冲高。更靠谱的看法是两点：剔除币价涨幅后还剩多少真实流入；再看协议收入，有没有人持续付费，比锁仓数字更能说明生意成不成立。不同平台的 TVL 对不上多半是口径不同：是否计入借贷仓位、嵌套存款有没有重复计算、覆盖了哪些链。本站的 DeFiLlama 口径公开可查，适合做默认参照。",
      en: "In DeFi, start with TVL (total value locked): the real money parked in a protocol or on a chain, and the first gauge of scale and trust. Do not mistake it for what a project is worth — TVL floats passively with token prices and can be inflated short-term by yield subsidies. Two better checks: strip out price gains and see how much genuine inflow remains, and look at protocol revenue — people continuously paying to use something says more than a locked total. When platforms disagree on TVL it is almost always methodology: whether borrowing positions count, whether nested deposits are double-counted, which chains are covered. DeFiLlama, listed here, publishes its methodology, which makes it a good default reference; cross-check a project's own docs before any big decision.",
    },
    faqs: [
      {
        q: {
          zh: "TVL 是什么？是不是越高越好？",
          en: "What is TVL — and is higher always better?",
        },
        a: {
          zh: "TVL 是锁在协议里的资产总价值，反映规模和资金信任度，但高不等于安全，更不等于能赚钱：币价一涨 TVL 就跟着虚增，高补贴也能短期刷高。要结合协议收入、以及剔除币价涨幅后的 TVL 走势一起看。",
          en: "TVL is the total value of assets locked in a protocol — a measure of scale and of how much capital trusts it. Higher is not automatically safer or more profitable: a token rally inflates it passively, and generous subsidies can pump it briefly. Read it together with protocol revenue and the price-adjusted TVL trend.",
        },
      },
      {
        q: {
          zh: "为什么 DeFiLlama 和项目官网显示的 TVL 不一样？",
          en: "Why does DeFiLlama's TVL differ from the number on a project's own site?",
        },
        a: {
          zh: "官网常只算自家主要链，或把借贷、质押重复计数；DeFiLlama 用统一口径跨链统计并剔除一部分重复计算。差异来自统计口径，不是必有一方造假——DeFiLlama 的方法页写明了每个协议具体怎么算，拿不准时去对照。",
          en: "Project sites often count only their main chain, or count borrowed and staked positions twice. DeFiLlama applies one methodology across chains and removes some of that double-counting. The gap is methodology, not proof that either side is faking it — DeFiLlama's methodology pages document exactly how each protocol is counted.",
        },
      },
      {
        q: {
          zh: "看一个 DeFi 协议应该先看哪几项数据？",
          en: "Which numbers should I check first when sizing up a DeFi protocol?",
        },
        a: {
          zh: "先看 TVL 及其长期走势，再看手续费和协议收入（有没有真实付费用户），然后看它部署在哪些链、审计情况和历史安全记录。只盯着 APY 数字冲进去，是新手最常见的亏钱方式。",
          en: "Start with TVL and its long-term trend, then fees and protocol revenue (are there real paying users?), then which chains it runs on, its audits and its security track record. Charging in on the APY number alone is the most common way beginners lose money.",
        },
      },
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
    guide: {
      zh: "选钱包先看三件事：常玩的链它支不支持——Rabby 主打 EVM 多链、自动切链，不支持的链钱包再好也白搭；安全记录干不干净，有没有出过被盗事件、是否开源审计；日常体验，资产总览清不清楚、连 dApp 顺不顺。比功能更重要的是习惯：助记词只离线手写保管，截图存手机、念给任何「客服」听都等于送钱；大额资产放硬件钱包或单独地址，别和天天签合约的热钱包混用。签名前看一眼交易模拟和风险提示，看不懂的签名不要签——Rabby 这类钱包的签前预演，正是为这一步设计的。",
      en: "Judge a wallet on three things. First, chain support: Rabby is built for EVM chains with automatic network switching — a wallet that does not support the chains you use is useless however good it is. Second, its security record: any past drain incidents, and is the code open-source and audited? Third, daily feel: a clear portfolio overview and painless dApp connections. Habits matter more than features. Keep your seed phrase offline and handwritten — a screenshot on your phone, or reading it to any 'support agent', is handing over the money. Keep large holdings in a hardware wallet or a separate address, away from the hot wallet that signs contracts daily. And before signing, actually read the wallet's transaction simulation and risk flags; never sign what you do not understand — Rabby-style pre-sign previews exist precisely for that moment.",
    },
    faqs: [
      {
        q: {
          zh: "Rabby 和 MetaMask 有什么区别，该选哪个？",
          en: "Rabby vs MetaMask — what is the difference and which should I pick?",
        },
        a: {
          zh: "都是 EVM 钱包：Rabby 主打多链自动切换、签名前预演交易结果与风险、资产总览更直观；MetaMask 生态最广，老 dApp 兼容性最好。两个可以都装、按顺手程度切换，但同一套助记词不要在来路不明的钱包里导入。",
          en: "Both are EVM wallets. Rabby leans into automatic multi-chain switching, pre-sign simulation with risk flags and a clearer portfolio view; MetaMask has the widest ecosystem and the best compatibility with older dApps. You can run both and switch by preference — just never import the same seed phrase into a wallet you have not verified.",
        },
      },
      {
        q: {
          zh: "助记词到底怎么保管才安全？",
          en: "How should I actually store my seed phrase?",
        },
        a: {
          zh: "手写在纸上、离线存放，绝不截图、不存网盘、不发给任何人。任何网站、弹窗或「客服」让你输入助记词，都是诈骗。如果助记词丢失又删除了钱包，资产无法找回，没有例外。",
          en: "Write it on paper and store it offline. Never screenshot it, never put it in cloud storage, never give it to anyone. Any website, pop-up or 'support agent' asking for your seed phrase is a scam. And if you lose the phrase and delete the wallet, the funds are unrecoverable — there are no exceptions.",
        },
      },
      {
        q: {
          zh: "钱包里突然多了不认识的代币，是天上掉馅饼吗？",
          en: "Unknown tokens just appeared in my wallet — free money?",
        },
        a: {
          zh: "大概率是空投骗局：这类币常诱导你去陌生网站「领取」或授权，一签就被盗。不要点它附带的链接，也不要拿它去兑换，在钱包里把这个代币隐藏掉就好，眼不见为净。",
          en: "Almost certainly a dusting scam: these tokens lure you to a strange site to 'claim' or approve something, and one signature drains your wallet. Do not follow any link attached to them and do not try to swap them — just hide the token in your wallet and move on.",
        },
      },
    ],
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
    guide: {
      zh: "这类工具防两种丢钱方式。链上最常见的是授权风险：用过的 dApp 可能留着对你代币的授权（allowance），项目作恶或合约被攻破时，旧授权能被人直接用来掏空钱包——用 Revoke.cash 定期盘点、撤销不用的授权，成本只有一点 Gas。本地文件怕的是设备丢失或被人打开：钱包备份、私钥、证件这类敏感文件，用文件夹加密（站内保险箱或桌面版 FolderLock）加一层密码。把话说在前面：加密只是提高门槛，密码强度和保管方式才是关键，没有工具能承诺绝对安全；重要文件还要留一份异地备份。",
      en: "These tools guard against two different ways of losing money. On-chain, the common one is approval risk: every dApp you have used may still hold an allowance over your tokens, and if the project turns malicious or its contract is exploited, that stale approval can empty your wallet — audit regularly with Revoke.cash and revoke what you no longer use, for the cost of a little gas. Local files are the other front: wallet backups, key files and ID scans are at risk when a device is lost or opened by someone else, so put sensitive folders behind a folder-encryption tool (the built-in vault here, or the desktop FolderLock). One honest caveat: encryption only raises the bar — password strength and how you store it are what actually protect you, and no tool can promise absolute security. Keep an off-site backup of anything important, encrypted or not.",
    },
    faqs: [
      {
        q: {
          zh: "代币授权（allowance）是什么？为什么说它危险？",
          en: "What is a token allowance, and why is it risky?",
        },
        a: {
          zh: "授权就是你允许某个合约动用你钱包里某种代币的额度，swap、质押时都会用到，而且额度常被设成无限大。合约日后被盗或项目跑路时，攻击者就能凭这份旧授权直接转走你的币。定期撤销不用的授权，等于随手关门。",
          en: "An allowance is permission for a contract to move a set amount of a token out of your wallet — swaps and staking all need one, and the amount is often set to unlimited. If that contract is later exploited or the project rugs, the stale approval lets attackers transfer your tokens directly. Revoking approvals you no longer use is locking a door you left open.",
        },
      },
      {
        q: {
          zh: "撤销授权要花钱吗？会把我的币弄丢吗？",
          en: "Does revoking an allowance cost money — and can it lose my tokens?",
        },
        a: {
          zh: "撤销本身是一笔链上交易，只花少量 Gas，不会动你的代币余额；之后再用那个 dApp，重新授权一次就行。在 Revoke.cash 操作前先核对打开的是官网——这类工具的钓鱼仿站不少，进错站反而会被盗。",
          en: "A revoke is an ordinary on-chain transaction: it costs a little gas and never touches your token balances. Next time you use that dApp you simply approve again. Before doing anything on Revoke.cash, double-check you are on the real site — phishing clones of tools like this are common, and the fake one is the actual trap.",
        },
      },
      {
        q: {
          zh: "文件夹加密后，密码忘了怎么办？",
          en: "I encrypted a folder and forgot the password — now what?",
        },
        a: {
          zh: "基本上找不回来——正规加密工具没有后门，这正是它能挡住别人的原因。设置时就用密码管理器记好主密码，并把加密备份留一份在别处，别让唯一的钥匙和唯一的锁放在同一台设备上。",
          en: "In practice, it is gone — legitimate encryption tools have no backdoor, which is exactly why they keep other people out too. When you set up encryption, save the master password in a password manager and keep an encrypted backup somewhere else; never let the only key live on the same device as the only lock.",
        },
      },
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
    id: "flows",
    name: { zh: "交易所资金流", en: "Exchange Flows" },
    intro: {
      zh: "钱在往哪家交易所进、从哪家出，是判断市场情绪最直接的链上信号之一。这一页把主流交易所的储备与资金流和合约保证金放在一张看板上：储备总额与 24h/7d/30d 净流入净流出取自 DeFiLlama 追踪的已标记钱包（clean reserves，剔除各所自家代币），点开单家还能看主要币种构成与近 35 日储备走势；保证金部分是各所合约未平仓总额（OI）与 BTC 永续资金费率，OKX、Hyperliquid 官方接口直取，其余走 CoinGecko 衍生品聚合，来源逐行标注。先说清口径：净流入是标记钱包的转账净额，不等于用户净申购；Coinbase、Kraken 等未被该数据集追踪的交易所不在表内。",
      en: "Which exchanges money is flowing into — and out of — is one of the most direct on-chain sentiment signals there is. This board puts major exchanges' reserves and fund flows next to their derivatives margin: total reserves and 24h/7d/30d net inflows come from DeFiLlama's tracked, labelled wallets (clean reserves, each exchange's own token excluded), and expanding a row shows its top asset breakdown and 35-day reserve trend. The margin half lists each exchange's total open interest (OI) and BTC perpetual funding rate — straight from the official OKX and Hyperliquid APIs where possible, CoinGecko's derivatives aggregation elsewhere, with the source marked on every row. The caveat up front: a net inflow is the net transfer across labelled wallets, not users' net subscriptions, and exchanges this dataset does not track (Coinbase, Kraken, …) are not in the table.",
    },
    seoDescription: {
      zh: "交易所资金流入流出与保证金看板：Binance、OKX、Bybit、Bitfinex、Bitget、Gate、KuCoin、MEXC、HTX、Deribit 等主流交易所的链上储备总额与 24h/7d/30d 净流入净流出（DeFiLlama 已标记钱包口径，剔除自家代币），单家可展开主要币种构成与近 35 日储备走势；保证金汇总各所合约未平仓总额（OI）与 BTC 永续资金费率，官方接口与 CoinGecko 聚合逐行标注来源。储备与净流入不等于用户净申购，不构成投资建议。",
      en: "Exchange inflow/outflow and margin board: total on-chain reserves and 24h/7d/30d net flows for Binance, OKX, Bybit, Bitget, Gate, KuCoin, MEXC, HTX, Deribit and more (DeFiLlama labelled-wallet caliber, own tokens excluded), with per-exchange asset breakdowns and 35-day reserve trends; the margin table totals each exchange's open interest (OI) and BTC perpetual funding rate, sourced per row from official APIs or CoinGecko aggregation. Reserves and net flows are not users' net subscriptions; not investment advice.",
    },
    keywords: [
      "交易所资金流",
      "交易所净流入",
      "交易所净流出",
      "交易所资金流入",
      "交易所储备金",
      "交易所储备",
      "合约未平仓量",
      "未平仓量",
      "资金费率",
      "多空比",
      "交易所保证金",
      "币安资金流",
      "OKX资金流",
      "exchange inflows",
      "exchange reserves",
      "open interest",
      "funding rate",
    ],
  },
  {
    id: "chain-dau",
    name: { zh: "公链日活", en: "Chain Activity" },
    intro: {
      zh: "一条链到底有没有人用，不看口号看日活。这一页把主流公链过去 24 小时真正发起过交易的地址数从多到少排一排：波场、BSC、Solana、以太坊、比特币、Base、Arbitrum、Polygon、TON……再配上每条链的 TVL 和「人均锁仓」（TVL ÷ 日活），看清哪些链是人多钱也多，哪些是钱躺着不动、哪些是人挤人。数据取自 DeFiLlama 自动更新。先说清口径：地址不是真人，一人多地址、机器人和女巫都在数里；日活看的是链上真实使用强度，不是注册用户数。",
      en: "Whether a chain is actually used is a numbers question, not a slogan. This page ranks the major chains by the addresses that really sent a transaction in the past 24 hours — Tron, BSC, Solana, Ethereum, Bitcoin, Base, Arbitrum, Polygon, TON and more — with each chain's TVL and TVL-per-active-address alongside, so you can see which chains have both people and money, which have money sitting still, and which are crowded with small addresses. Data comes from DeFiLlama and refreshes automatically. The caveat up front: an address is not a person — multi-address users, bots and sybils are all counted; DAU measures real on-chain usage intensity, not registered users.",
    },
    seoDescription: {
      zh: "公链日活排行：主流公链过去 24 小时活跃地址数（日活）排名、日活 7 日变化、TVL 与人均锁仓（TVL ÷ 24h 日活）一页看齐，数据取自 DeFiLlama 自动调取，可按链名搜索、按日活/TVL/人均锁仓排序。含口径说明：地址不等于真人，Robinhood Chain 等未被统计的链不在榜内。",
      en: "Chain daily-activity ranking: the major chains ranked by active addresses over the past 24 hours, with the DAU 7-day change, TVL and TVL per active address (TVL ÷ 24h DAU) on one page — data fetched automatically from DeFiLlama, searchable, sortable by DAU, TVL or TVL per address. Includes the full methodology: an address is not a person, and chains the dataset does not track (e.g. Robinhood Chain) are absent.",
    },
    keywords: [
      "公链日活",
      "公链日活排行",
      "链日活排名",
      "每日活跃地址",
      "活跃地址数",
      "公链活跃度",
      "公链活跃度排名",
      "人均锁仓",
      "BSC日活",
      "波场日活",
      "Solana日活",
      "以太坊日活",
      "比特币活跃地址",
      "TON日活",
      "daily active addresses",
      "chain DAU ranking",
      "active addresses by chain",
      "most used blockchains",
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
    guide: {
      zh: "这一类收录的是红果短剧的第三方桌面客户端，把手机短剧搬到电脑和电视上看。先分清：它不是红果官方出品，官方只有手机 App；第三方客户端是个人开发者做的，版本状态也不同——Windows 有正式版，Mac（M 系列）和 Android TV 还是测试版，完整度以下载页标注为准。安装前做两件事：只从本站核对过的发布页下载，别点搜索引擎里的「高速下载器」仿冒链接；系统拦截或提醒时先核对来源再放行。另外，收藏和续播只存本机，换设备不同步，和官方的账号体系不同。",
      en: "This shelf currently lists a third-party desktop client for Hongguo short dramas — a way to watch the free phone-first dramas on a computer or TV. Be clear on what it is: not an official Hongguo product (the official app is mobile-only), but an independent developer's client, and its builds are at different stages — a proper Windows release, while the Mac (Apple Silicon) and Android TV builds are still betas, with completeness and stability as noted on the download page. Before installing, do two things: download only from the release page verified in this site's intro, never from a random 'high-speed downloader' ad in a search result; and if your system flags the installer, verify the source before overriding the warning instead of clicking through blindly. Also note that favourites and resume points are stored on the device only — nothing syncs across devices, unlike the official app's account system.",
    },
    faqs: [
      {
        q: {
          zh: "红果短剧有官方电脑版或电视版吗？",
          en: "Is there an official Hongguo app for PC or TV?",
        },
        a: {
          zh: "没有，红果官方只有手机 App。本站收录的桌面版是第三方开发者做的客户端，能在 Windows、Mac 和 Android TV 上看短剧，但与官方没有隶属关系；下载认准本站介绍里核对过的发布页，不要搜到什么就装什么。",
          en: "No — Hongguo's official app is mobile-only. The desktop client listed here is made by a third-party developer and has no affiliation with the official app, though it plays the same short dramas on Windows, Mac and Android TV. Download it only from the release page verified in this site's intro.",
        },
      },
      {
        q: {
          zh: "Android TV 电视版怎么安装？",
          en: "How do I install the Android TV build on my television?",
        },
        a: {
          zh: "把安装包拷进 U 盘插到电视上安装，或用电视自带的文件管理器侧载，前提是在设置里允许「安装未知来源应用」。它目前还是测试版，个别机型的遥控器适配不完善，操作别扭时接个鼠标会顺手很多。",
          en: "Copy the installer onto a USB drive and install it from the TV, or sideload it with the TV's file manager — either way you will need to allow 'install from unknown sources' in settings first. The TV build is still a beta and remote-control support is rough on some models; a plugged-in mouse makes it much easier.",
        },
      },
      {
        q: {
          zh: "第三方客户端安全吗？需要注册登录吗？",
          en: "Is a third-party client like this safe? Do I need an account?",
        },
        a: {
          zh: "本站收录的这个客户端不需要注册登录，收藏和播放记录只存在本机。通用的防护原则不变：只从可信发布页下载、核对文件名和版本号，来路不明的「破解版」「去广告版」不要装——那类包才是真正的高危区。",
          en: "The client listed here needs no account or login, and its favourites and playback history stay on your device. The usual rules still apply: download only from a trusted release page, check the file name and version, and never install 'cracked' or 'ad-free mod' builds from unknown sources — those are the genuinely dangerous ones.",
        },
      },
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
    guide: {
      zh: "办公工具先分清文件在哪儿处理。合同、证件、名单这类敏感文件，优先选本地处理的——本站的 Excel 批量生成 Word 和图片工具箱，文件不离开浏览器，关掉页面即无痕；要上传服务器转换的在线站，用之前先想想内容能不能见人。其次看批量能力：单个文件哪个都行，要按 Excel 几百行批量出文档、批量转格式，就要确认行数和大小限制、要不要注册付费。最后抽查质量：生成后抽最前、中间、最后各一份，看占位符有没有漏替换、排版有没有跑偏，再整批交付。",
      en: "With office tools, first ask where the file gets processed. For sensitive material — contracts, ID scans, rosters — prefer tools that work locally: this site's Excel-to-Word generator and image toolbox never let files leave your browser, and closing the tab leaves no trace. Upload-convert-download sites actually receive your files, so think before sending them anything private. Second, check batch limits: any tool handles one file, but generating documents from hundreds of spreadsheet rows or converting in bulk means checking row and size caps, and whether the good tier hides behind sign-up or payment. Finally, verify output quality: after a batch run, spot-check the first, a middle and the last file — confirm every placeholder was replaced and the layout held — before you ship the whole batch.",
    },
    faqs: [
      {
        q: {
          zh: "Excel 批量生成 Word 是怎么工作的？",
          en: "How does generating Word documents from Excel in bulk work?",
        },
        a: {
          zh: "先在 Word 模板里把要替换的位置写成占位符，再上传 Excel：表格的一行生成一份文档，列名和占位符一一对应。站内的 Sheet2Word 全程在本地处理，生成后打包成 ZIP 下载，没有行数限制，也不用注册。",
          en: "You mark the spots to fill in a Word template with placeholders, then upload an Excel sheet: each row becomes one document, with column names mapping to placeholders. The built-in Sheet2Word does this entirely locally, delivers a ZIP download, and has no row limit and no sign-up.",
        },
      },
      {
        q: {
          zh: "在线处理文件安全吗？文件会不会被上传？",
          en: "Is it safe to process files online — do they get uploaded?",
        },
        a: {
          zh: "取决于实现方式。本站的办公工具是纯前端本地处理，文件不上传服务器。采用「上传—转换—下载」模式的网站则真的会拿到你的文件，合同、证件这类敏感内容不要用这类站点处理。",
          en: "It depends on how the tool is built. This site's office tools run entirely in your browser and upload nothing. Sites built on an upload-convert-download model do receive your files — keep contracts, ID scans and anything sensitive away from those.",
        },
      },
      {
        q: {
          zh: "Filee 这种本地转换器和在线转换站有什么区别？",
          en: "How is a local converter like Filee different from online conversion sites?",
        },
        a: {
          zh: "Filee 是装在电脑上的本地转换器，拖拽就能批量转换图片、文档、音视频等多种格式，不依赖网络、不限次数。在线站胜在免安装，但通常有文件大小限制，文件也要经过别人的服务器。转换频繁、文件又大，本地工具更省事。",
          en: "Filee is a converter installed on your own machine: drag files in and convert images, documents, audio and video in bulk, with no network dependency and no usage caps. Online sites win on zero install, but they usually cap file size and your files pass through someone else's server. If you convert often or work with large files, a local tool is less hassle.",
        },
      },
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
  {
    id: "twitter-tools",
    name: { zh: "推特工具", en: "Twitter Tools" },
    intro: {
      zh: "刷到想存下来的推文，不用再找乱七八糟的下载站：粘贴一条公开推文链接，站内工具箱就能把正文和全部媒体解析出来——图片是原图、视频逐档给出分辨率与码率的 MP4 直链，推文还能导出成 TXT、Markdown、HTML、JSON、CSV、PDF，同作者的一串 Thread 可以整串导出成 EPUB。取数走推特公开嵌入接口与 FxTwitter 公开接口双源、免登录，下载走推特 CDN 直链、本机生成文件，本站服务器不碰你的文件。老牌下载站 TwiFlux 也收在同标签里，想对照着用也行。",
      en: "Found a tweet worth keeping? Skip the sketchy downloader sites: paste a public tweet link and the built-in toolbox parses the text and every media item — original-size photos, per-quality MP4 direct links with resolutions and bitrates, exports to TXT, Markdown, HTML, JSON, CSV and PDF, and whole same-author threads bundled into an EPUB. Data comes from Twitter's public embed endpoint and the FxTwitter public API (dual source, no login); downloads are direct Twitter-CDN links and files are generated locally — this site's servers never touch them. The long-running TwiFlux downloader is listed on the same shelf if you want a second option.",
    },
    seoDescription: {
      zh: "推特视频下载与推文导出工具箱（站内可用）：粘贴公开推文链接解析正文与媒体，图片原图下载、视频各画质 MP4 直链（分辨率+码率）、GIF 下载，推文导出 TXT/Markdown/HTML/JSON/CSV/PDF，Thread 整串导出与 EPUB 打包。双源自动取数（推特公开嵌入接口 + FxTwitter），免登录免注册；另收录老牌下载站 TwiFlux。仅限公开推文，版权归原作者。",
      en: "Twitter/X video downloader and tweet exporter, usable in-site: paste a public tweet link to parse its text and media — original-size photo downloads, MP4 direct links per quality (resolution + bitrate), GIF downloads, and exports to TXT/Markdown/HTML/JSON/CSV/PDF, with whole-thread export and EPUB bundling. Dual-source fetching (Twitter's public embed endpoint + FxTwitter), no login or sign-up; the established TwiFlux downloader is listed too. Public tweets only; media remains the authors' copyright.",
    },
    keywords: [
      "推特视频下载",
      "X视频下载",
      "Twitter视频下载",
      "推文下载",
      "推特下载",
      "推特图片下载",
      "推特GIF下载",
      "Thread导出",
      "推文转PDF",
      "推文导出",
      "推特媒体下载",
      "TwiFlux",
      "twitter video downloader",
      "tweet downloader",
      "thread exporter",
    ],
  },
];

export const TAG_MAP: Record<string, TagDef> = Object.fromEntries(
  TAGS.map((t) => [t.id, t])
);

export function getTag(id: string): TagDef | undefined {
  return TAG_MAP[id];
}
