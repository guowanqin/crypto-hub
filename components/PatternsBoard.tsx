"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MetricKey,
  PatternId,
  PatternsPayload,
} from "@/lib/patterns";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const PAGE_SIZE = 12;
const LIST_STEP = 12;
/** 已到期样本低于此数时统计卡标注「样本较少」——与口径卡公示的阈值一致 */
const LOW_SAMPLE = 30;

const ORDER: PatternId[] = [
  "ma-cross",
  "volume-breakout",
  "long-lower-shadow",
  "shrink-consolidation",
  "shrink-pullback",
  "oversold-reversal",
];

type BoardDict = {
  boardKicker: string;
  sourceLine: string;
  loading: string;
  loadError: string;
  refresh: string;
  refreshing: string;
  coverageLine: string;
  schematicNote: string;
  cardToday: string;
  cardEvents: string;
  pname: Record<PatternId, string>;
  pdesc: Record<PatternId, string>;
  pdef: Record<PatternId, string>;
  secStats: string;
  conclusion: string;
  conclusionNoData: string;
  lowSample: string;
  colHorizon: string;
  colSamples: string;
  colWinRate: string;
  colAvg: string;
  colMedian: string;
  horizonFmt: string;
  secToday: string;
  todayIntro: string;
  todayEmpty: string;
  colSymbol: string;
  colPrice: string;
  colChange: string;
  colMetrics: string;
  kindCrypto: string;
  kindStock: string;
  metric: Record<MetricKey, string>;
  secEvents: string;
  eventsIntro: string;
  colDate: string;
  pending: string;
  showMore: string;
  collapse: string;
  stocksDown: string;
  cryptoDown: string;
  secDefs: string;
  secCaliber: string;
  caliber: string[];
};

const DICT: Record<Lang, BoardDict> = {
  zh: {
    boardKicker: "形态选标的 · 先选形态 → 今日命中 + 历史回测 · 日线",
    sourceLine: "数据来源：币圈 Binance 公开行情（备用 OKX）· 美股 Yahoo Finance 公开数据 · 扫描于 {t} · 数据为服务端缓存，约 30 分钟更新一次",
    loading: "正在拉取全部标的的日线并回测 6 个形态，约需数秒…",
    loadError: "数据暂时拉取失败，请稍后刷新重试。",
    refresh: "立即刷新",
    refreshing: "刷新中…",
    coverageLine: "覆盖 {withData} / {total} 个标的（币圈 {crypto} · 美股 {stock}）· 日线数据 {from} ~ {to} · 回测事件 {efrom} ~ {eto}",
    schematicNote: "形态示意 · 非真实行情",
    cardToday: "今日命中 {n}",
    cardEvents: "历史触发 {n} 次",
    pname: {
      "ma-cross": "均线金叉",
      "volume-breakout": "放量突破",
      "long-lower-shadow": "下跌后长下影",
      "shrink-consolidation": "缩量整理",
      "shrink-pullback": "缩量回踩均线",
      "oversold-reversal": "超跌后转强",
    },
    pdesc: {
      "ma-cross": "MA5 上穿 MA20，当日量能高于 20 日均量。",
      "volume-breakout": "收盘突破 20 日最高收盘，量达均量 1.5 倍。",
      "long-lower-shadow": "下跌后长下影，收盘回到当日振幅上部。",
      "shrink-consolidation": "10 日振幅 ≤10%、量缩，收盘站上 MA20。",
      "shrink-pullback": "缩量回踩上行 MA20，最低不破、收稳。",
      "oversold-reversal": "20 日跌超 15% 后，收盘站回 MA5 并收阳。",
    },
    pdef: {
      "ma-cross": "均线金叉：昨日 MA5 ≤ MA20、今日 MA5 > MA20，且今日成交量大于此前 20 日均量。",
      "volume-breakout": "放量突破：今日收盘价高于此前 20 日最高收盘价，且今日成交量不低于此前 20 日均量的 1.5 倍。",
      "long-lower-shadow": "下跌后长下影：此前 10 日累计涨跌为负；今日下影线（开、收较低者减最低价）不小于实体（收减开的绝对值）的 2 倍，且收盘位于当日振幅的上部 30% 区间内。",
      "shrink-consolidation": "缩量整理：近 10 日振幅（最高减最低，再除以今日收盘）不超过 10%，今日成交量小于此前 20 日均量，且今日收盘高于 MA20。",
      "shrink-pullback": "缩量回踩均线：MA20 较 5 日前上行；昨日收盘高于昨日 MA20；今日最低价位于今日 MA20 的上下 2% 之内；今日收盘不低于 MA20；今日成交量小于此前 20 日均量的 80%。",
      "oversold-reversal": "超跌后转强：截至昨日，近 20 日跌幅不低于 15%（昨日收盘对比 21 日前收盘）；昨日收盘不高于昨日 MA5、今日收盘高于今日 MA5；今日收阳（收盘高于开盘）。",
    },
    secStats: "历史回测汇总",
    conclusion: "回测区间 {from} ~ {to}：该形态在全部标的上共触发 {total} 次（已去重）；触发后 10 日胜率 {win}、平均收益 {avg}（已到期样本 {n}）。",
    conclusionNoData: "回测区间 {from} ~ {to}：该形态共触发 {total} 次，但 10 日周期暂无已到期样本，胜率与收益待样本走完后统计。",
    lowSample: "样本较少：该形态部分周期已到期样本不足 30 个，统计仅供参考（阈值口径见下方说明）。",
    colHorizon: "持有周期",
    colSamples: "已到期样本",
    colWinRate: "胜率",
    colAvg: "平均收益",
    colMedian: "中位数收益",
    horizonFmt: "{h} 日",
    secToday: "今日命中标的",
    todayIntro: "以最近一根已收盘日线判定；「今日」对美股指最近一个交易日。",
    todayEmpty: "今日暂无命中该形态的标的。",
    colSymbol: "标的",
    colPrice: "现价",
    colChange: "当日涨跌",
    colMetrics: "命中关键数值",
    kindCrypto: "币圈",
    kindStock: "美股",
    metric: {
      volRatio: "量比",
      maGapPct: "MA5 高于 MA20",
      breakPct: "突破幅度",
      shadowSharePct: "下影占当日振幅",
      priorChangePct: "此前 10 日涨跌",
      rangePct: "近 10 日振幅",
      lowDistPct: "最低价距 MA20",
      priorDropPct: "此前 20 日涨跌",
    },
    secEvents: "最近触发事件",
    eventsIntro: "该形态最近 15 次触发（去重后，新→旧）；收益 = 触发后第 N 个交易日收盘价 ÷ 触发日收盘价 − 1。",
    colDate: "触发日期",
    pending: "未到期",
    showMore: "显示更多（剩余 {n} 个）",
    collapse: "收起",
    stocksDown: "美股数据源暂时不可用：公开接口本次未返回数据，美股一类已如实留空，不用假数补位；币圈部分不受影响，源恢复后会自动补上。",
    cryptoDown: "币圈数据源暂时不可用：两个公开源本次均未返回数据，币圈一类已如实留空；美股部分不受影响。",
    secDefs: "六个形态的精确定义",
    secCaliber: "口径与风险",
    caliber: [
      "回测方法：对每个标的的历史日线逐日跑与今日扫描完全相同的形态定义；同一标的同一形态两次触发间隔小于 10 个交易日只计第一次，避免连续多日重复计数。每次触发记录其后 5、10、20 个交易日的收盘到收盘收益；未走完该周期的触发不计入该周期分母，胜率 = 收益大于 0 的样本占比。统计为 30 个币与 20 只美股的全池汇总，未计手续费、滑点与资金成本；任一周期已到期样本不足 30 个时，统计卡会标注「样本较少，仅供参考」。",
      "数据来源与覆盖：币圈日线来自 Binance 公开行情接口（单标的失败时自动换 OKX，其日线历史上限 300 根，该标的回测区间会相应变短），美股日线来自 Yahoo Finance 公开数据（最长约 5 年，币圈约 2.7 年）。页面顶部公示实际取到数据的标的数与数据、事件起止日期，均按本轮实算，不写死。只用已收盘日线：正在形成的日线一律丢弃，美股当日日线在美东收盘前不参与判定，所以盘中打开本页，看到的仍是上一交易日的结论。",
      "混池局限：加密与美股混在同一个池子里统计，两个市场的波动结构、交易时段与参与者完全不同，汇总胜率只能看个大概率；单个标的的历史触发次数有限得多，不要把全池胜率当成对某个标的的预期。各标的历史长度不一（新上市标的更短），早期事件主要由历史更长的美股贡献。",
      "风险提示：形态识别是概率工具，不是预测。均线金叉可以连环假信号，放量突破也常见冲高回落，长下影之后继续阴跌的例子同样不少；胜率要连同平均收益、中位数一起看，单看一个数字做决定很容易被误导。历史表现不代表未来，本工具只做公开数据的机械扫描与统计，不构成投资建议，据此交易的风险自担。",
    ],
  },
  tw: {
    boardKicker: "形態選標的 · 先選形態 → 今日命中 + 歷史回測 · 日線",
    sourceLine: "資料來源：幣圈 Binance 公開行情（備用 OKX）· 美股 Yahoo Finance 公開資料 · 掃描於 {t} · 資料為服務端快取，約 30 分鐘更新一次",
    loading: "正在拉取全部標的的日線並回測 6 個形態，約需數秒…",
    loadError: "資料暫時拉取失敗，請稍後重新整理重試。",
    refresh: "立即重新整理",
    refreshing: "重新整理中…",
    coverageLine: "覆蓋 {withData} / {total} 個標的（幣圈 {crypto} · 美股 {stock}）· 日線資料 {from} ~ {to} · 回測事件 {efrom} ~ {eto}",
    schematicNote: "形態示意 · 非真實行情",
    cardToday: "今日命中 {n}",
    cardEvents: "歷史觸發 {n} 次",
    secStats: "歷史回測彙總",
    conclusion: "回測區間 {from} ~ {to}：該形態在全部標的上共觸發 {total} 次（已去重）；觸發後 10 日勝率 {win}、平均收益 {avg}（已到期樣本 {n}）。",
    conclusionNoData: "回測區間 {from} ~ {to}：該形態共觸發 {total} 次，但 10 日週期暫無已到期樣本，勝率與收益待樣本走完後統計。",
    lowSample: "樣本較少：該形態部分週期已到期樣本不足 30 個，統計僅供參考（閾值口徑見下方說明）。",
    colHorizon: "持有周期",
    colSamples: "已到期樣本",
    colWinRate: "勝率",
    colAvg: "平均收益",
    colMedian: "中位數收益",
    secToday: "今日命中標的",
    todayIntro: "以最近一根已收盤日線判定；「今日」對美股指最近一個交易日。",
    todayEmpty: "今日暫無命中該形態的標的。",
    colSymbol: "標的",
    colPrice: "現價",
    colChange: "當日漲跌",
    colMetrics: "命中關鍵數值",
    kindCrypto: "幣圈",
    kindStock: "美股",
    secEvents: "最近觸發事件",
    eventsIntro: "該形態最近 15 次觸發（去重後，新→舊）；收益 = 觸發後第 N 個交易日收盤價 ÷ 觸發日收盤價 − 1。",
    colDate: "觸發日期",
    pending: "未到期",
    showMore: "顯示更多（剩餘 {n} 個）",
    collapse: "收起",
    stocksDown: "美股資料來源暫時不可用：公開介面本次未返回資料，美股一類已如實留空，不用假數補位；幣圈部分不受影響，源恢復後會自動補上。",
    cryptoDown: "幣圈資料來源暫時不可用：兩個公開源本次均未返回資料，幣圈一類已如實留空；美股部分不受影響。",
    secDefs: "六個形態的精確定義",
    secCaliber: "口徑與風險",
    pname: {
      "ma-cross": "均線金叉",
      "volume-breakout": "放量突破",
      "long-lower-shadow": "下跌後長下影",
      "shrink-consolidation": "縮量整理",
      "shrink-pullback": "縮量回踩均線",
      "oversold-reversal": "超跌後轉強",
    },
    pdesc: {
      "ma-cross": "MA5 上穿 MA20，當日量能高於 20 日均量。",
      "volume-breakout": "收盤突破 20 日最高收盤，量達均量 1.5 倍。",
      "long-lower-shadow": "下跌後長下影，收盤迴到當日振幅上部。",
      "shrink-consolidation": "10 日振幅 ≤10%、量縮，收盤站上 MA20。",
      "shrink-pullback": "縮量回踩上行 MA20，最低不破、收穩。",
      "oversold-reversal": "20 日跌超 15% 後，收盤站回 MA5 並收陽。",
    },
    pdef: {
      "ma-cross": "均線金叉：昨日 MA5 ≤ MA20、今日 MA5 > MA20，且今日成交量大於此前 20 日均量。",
      "volume-breakout": "放量突破：今日收盤價高於此前 20 日最高收盤價，且今日成交量不低於此前 20 日均量的 1.5 倍。",
      "long-lower-shadow": "下跌後長下影：此前 10 日累計漲跌為負；今日下影線（開、收較低者減最低價）不小於實體（收減開的絕對值）的 2 倍，且收盤位於當日振幅的上部 30% 區間內。",
      "shrink-consolidation": "縮量整理：近 10 日振幅（最高減最低，再除以今日收盤）不超過 10%，今日成交量小於此前 20 日均量，且今日收盤高於 MA20。",
      "shrink-pullback": "縮量回踩均線：MA20 較 5 日前上行；昨日收盤高於昨日 MA20；今日最低價位於今日 MA20 的上下 2% 之內；今日收盤不低於 MA20；今日成交量小於此前 20 日均量的 80%。",
      "oversold-reversal": "超跌後轉強：截至昨日，近 20 日跌幅不低於 15%（昨日收盤對比 21 日前收盤）；昨日收盤不高於昨日 MA5、今日收盤高於今日 MA5；今日收陽（收盤高於開盤）。",
    },
    horizonFmt: "{h} 日",
    metric: {
      volRatio: "量比",
      maGapPct: "MA5 高於 MA20",
      breakPct: "突破幅度",
      shadowSharePct: "下影占當日振幅",
      priorChangePct: "此前 10 日漲跌",
      rangePct: "近 10 日振幅",
      lowDistPct: "最低價距 MA20",
      priorDropPct: "此前 20 日漲跌",
    },
    caliber: [
      "回測方法：對每個標的的歷史日線逐日跑與今日掃描完全相同的形態定義；同一標的同一形態兩次觸發間隔小於 10 個交易日只計第一次，避免連續多日重複計數。每次觸發記錄其後 5、10、20 個交易日的收盤到收盤收益；未走完該週期的觸發不計入該週期分母，勝率 = 收益大於 0 的樣本佔比。統計為 30 個幣與 20 只美股的全池彙總，未計手續費、滑點與資金成本；任一週期已到期樣本不足 30 個時，統計卡會標註「樣本較少，僅供參考」。",
      "資料來源與覆蓋：幣圈日線來自 Binance 公開行情介面（單標的失敗時自動換 OKX，其日線歷史上限 300 根，該標的回測區間會相應變短），美股日線來自 Yahoo Finance 公開資料（最長約 5 年，幣圈約 2.7 年）。頁面頂部公示實際取到資料的標的數與資料、事件起止日期，均按本輪實算，不寫死。只用已收盤日線：正在形成的日線一律丟棄，美股當日日線在美東收盤前不參與判定，所以盤中開啟本頁，看到的仍是上一交易日的結論。",
      "混池侷限：加密與美股混在同一個池子裡統計，兩個市場的波動結構、交易時段與參與者完全不同，彙總勝率只能看個大機率；單個標的的歷史觸發次數有限得多，不要把全池勝率當成對某個標的的預期。各標的歷史長度不一（新上市標的更短），早期事件主要由歷史更長的美股貢獻。",
      "風險提示：形態識別是機率工具，不是預測。均線金叉可以連環假訊號，放量突破也常見衝高回落，長下影之後繼續陰跌的例子同樣不少；勝率要連同平均收益、中位數一起看，單看一個數字做決定很容易被誤導。歷史表現不代表未來，本工具只做公開資料的機械掃描與統計，不構成投資建議，據此交易的風險自擔。",
    ],
  },
  en: {
    boardKicker: "Pattern Screener · Pick a pattern → today's matches + historical backtest · Daily candles",
    sourceLine: "Sources: Binance public market data for crypto (OKX fallback) · Yahoo Finance public data for US stocks · Scanned at {t} · Server-cached, refreshed about every 30 minutes",
    loading: "Fetching daily candles for all symbols and backtesting 6 patterns — this takes a few seconds…",
    loadError: "Data failed to load for now — please refresh and try again.",
    refresh: "Refresh now",
    refreshing: "Refreshing…",
    coverageLine: "Coverage: {withData} / {total} symbols (crypto {crypto} · US stocks {stock}) · Daily data {from} ~ {to} · Backtest events {efrom} ~ {eto}",
    schematicNote: "Schematic · not real market data",
    cardToday: "{n} matched today",
    cardEvents: "{n} historical triggers",
    pname: {
      "ma-cross": "MA Golden Cross",
      "volume-breakout": "Volume Breakout",
      "long-lower-shadow": "Long Lower Shadow After a Decline",
      "shrink-consolidation": "Low-Volume Consolidation",
      "shrink-pullback": "Low-Volume Pullback to the MA",
      "oversold-reversal": "Oversold Reversal",
    },
    pdesc: {
      "ma-cross": "MA5 crosses above MA20 with volume above the 20-day average.",
      "volume-breakout": "Close breaks the prior 20-day highest close on 1.5× average volume.",
      "long-lower-shadow": "After a 10-day decline, a long lower shadow with the close back in the day's upper range.",
      "shrink-consolidation": "10-day range ≤10% on shrinking volume, close above MA20.",
      "shrink-pullback": "Quiet pullback to the rising MA20 — low inside ±2%, close holds.",
      "oversold-reversal": "After a >15% 20-day drop, the close reclaims MA5 with a green candle.",
    },
    pdef: {
      "ma-cross": "MA golden cross: yesterday MA5 ≤ MA20 and today MA5 > MA20, with today's volume above the previous 20-day average volume.",
      "volume-breakout": "Volume breakout: today's close is above the highest close of the previous 20 days, and today's volume is at least 1.5× the previous 20-day average.",
      "long-lower-shadow": "Long lower shadow after a decline: the cumulative change over the prior 10 days is negative; today's lower shadow (the lower of open/close minus the low) is at least 2× the body (|close − open|), and the close sits in the top 30% of the day's range.",
      "shrink-consolidation": "Low-volume consolidation: the 10-day range (highest − lowest, divided by today's close) is no more than 10%, today's volume is below the previous 20-day average, and today's close is above MA20.",
      "shrink-pullback": "Low-volume pullback to the MA: MA20 is higher than 5 days ago; yesterday's close was above yesterday's MA20; today's low is within ±2% of today's MA20; today's close is at or above MA20; today's volume is below 80% of the previous 20-day average.",
      "oversold-reversal": "Oversold reversal: as of yesterday, the 20-day decline is at least 15% (yesterday's close vs the close 21 days earlier); yesterday's close was at or below yesterday's MA5 and today's close is above today's MA5; today is a green candle (close above open).",
    },
    secStats: "Historical backtest summary",
    conclusion: "Backtest window {from} ~ {to}: this pattern triggered {total} times across all symbols (deduplicated); 10-day win rate {win}, average return {avg} over {n} matured samples.",
    conclusionNoData: "Backtest window {from} ~ {to}: this pattern triggered {total} times, but no 10-day sample has matured yet — the win rate and returns will appear once samples complete.",
    lowSample: "Small sample: some horizons of this pattern have fewer than 30 matured samples — treat the statistics as indicative only (threshold defined below).",
    colHorizon: "Holding period",
    colSamples: "Matured samples",
    colWinRate: "Win rate",
    colAvg: "Average return",
    colMedian: "Median return",
    horizonFmt: "{h}d",
    secToday: "Today's matches",
    todayIntro: "Judged on the most recent closed daily candle; for US stocks, “today” means the latest trading day.",
    todayEmpty: "No symbol matches this pattern today.",
    colSymbol: "Symbol",
    colPrice: "Price",
    colChange: "Day change",
    colMetrics: "Trigger metrics",
    kindCrypto: "Crypto",
    kindStock: "US stock",
    metric: {
      volRatio: "Volume ratio",
      maGapPct: "MA5 above MA20",
      breakPct: "Breakout size",
      shadowSharePct: "Lower shadow / day range",
      priorChangePct: "Prior 10-day change",
      rangePct: "10-day range",
      lowDistPct: "Low vs MA20",
      priorDropPct: "Prior 20-day change",
    },
    secEvents: "Recent triggers",
    eventsIntro: "The 15 most recent triggers of this pattern (deduplicated, newest first); return = close N trading days later ÷ trigger-day close − 1.",
    colDate: "Trigger date",
    pending: "Pending",
    showMore: "Show more ({n} left)",
    collapse: "Collapse",
    stocksDown: "The US-stock data source is temporarily unavailable: the public feed returned nothing this round, so US stocks are honestly left blank — no invented numbers. The crypto part is unaffected and stocks will reappear once the source recovers.",
    cryptoDown: "The crypto data source is temporarily unavailable: both public feeds returned nothing this round, so crypto is honestly left blank. The US-stock part is unaffected.",
    secDefs: "Exact definitions of the six patterns",
    secCaliber: "Method & risks",
    caliber: [
      "Backtest method: every historical daily candle of every symbol is run through exactly the same pattern definitions as today's scan. Two triggers of the same pattern on the same symbol less than 10 trading days apart count only once, so multi-day streaks are not double-counted. Each trigger records the close-to-close return 5, 10 and 20 trading days later; triggers that have not yet reached a horizon are excluded from that horizon's denominator, and the win rate is the share of matured samples with a return above 0. Statistics pool all 30 crypto pairs and 20 US stocks/ETFs, with no deduction for fees, slippage or funding costs. If any horizon has fewer than 30 matured samples, the statistics card flags the pattern as a small sample.",
      "Sources & coverage: crypto daily candles come from Binance's public market-data API (with a per-symbol fallback to OKX, whose daily history is capped at 300 bars, shortening that symbol's backtest window); US-stock daily candles come from Yahoo Finance public data (up to about 5 years, vs about 2.7 years for crypto). The symbol count and the data/event date ranges shown at the top are computed from this run's actual data, never hard-coded. Closed candles only: the daily candle still forming is always discarded, and a US stock's current-day candle does not count until the 16:00 ET close — so intraday visits still show the previous trading day's verdict.",
      "Pooled-sample caveat: crypto and US stocks are pooled into one statistic, yet the two markets differ completely in volatility structure, trading hours and participants — read the pooled win rate as a rough probability only. Individual symbols have far fewer triggers than the pool, so never treat the pooled win rate as an expectation for one symbol. History length also varies by symbol (recent listings are shorter), and the earliest events are mostly contributed by longer-history US stocks.",
      "Risk note: pattern recognition is a probabilistic tool, not a prediction. Golden crosses can whipsaw repeatedly, volume breakouts often fail and fall back inside, and a long lower shadow can be followed by further declines. Read the win rate together with the average and median returns — deciding on any single number is misleading. Past performance does not predict future results. This tool mechanically scans and summarises public data only and is not investment advice; trading on it is at your own risk.",
    ],
  },
};

const LOCALES: Record<Lang, string> = { zh: "zh-CN", tw: "zh-TW", en: "en-US" };

function fmtPrice(p: number | null): string {
  if (p == null || !Number.isFinite(p)) return "—";
  if (p >= 100) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return String(parseFloat(p.toPrecision(5)));
  return String(parseFloat(p.toPrecision(4)));
}

function fmtPct(v: number | null, digits = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function fmtMetric(key: MetricKey, v: number): string {
  if (key === "volRatio") return `${v.toFixed(2)}×`;
  if (key === "rangePct" || key === "shadowSharePct") return `${v.toFixed(1)}%`;
  return fmtPct(v);
}

/* ---------------- 形态示意（自绘 SVG，非真实行情） ---------------- */

interface SchCandle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

function sch(closes: number[], vols: number[], wick = 0.8): SchCandle[] {
  return closes.map((c, i) => {
    const o = i === 0 ? c - 0.6 : closes[i - 1];
    return {
      o,
      c,
      h: Math.max(o, c) + wick,
      l: Math.min(o, c) - wick,
      v: vols[i] ?? 8,
    };
  });
}

interface SchSpec {
  candles: SchCandle[];
  maShort?: (number | null)[];
  maLong?: (number | null)[];
  level?: number;
}

const SCHEMATICS: Record<PatternId, SchSpec> = {
  "ma-cross": {
    candles: sch(
      [52, 51, 50, 50, 49, 49, 50, 51, 52, 54, 56, 59],
      [10, 9, 9, 8, 8, 7, 8, 9, 10, 12, 14, 18],
    ),
    maShort: [null, null, null, null, 50.4, 49.8, 49.6, 49.8, 50.2, 51.2, 52.6, 54.4],
    maLong: [51.9, 51.6, 51.3, 51.0, 50.8, 50.6, 50.5, 50.5, 50.7, 51.0, 51.5, 52.3],
  },
  "volume-breakout": {
    candles: sch(
      [50, 51, 49, 50, 52, 50, 49, 51, 50, 52, 51, 58],
      [10, 10, 9, 10, 10, 9, 9, 10, 9, 10, 9, 20],
    ),
    level: 52.6,
  },
  "long-lower-shadow": {
    candles: (() => {
      const cs = sch(
        [60, 58, 57, 55, 54, 52, 51, 50, 49, 48, 47, 49],
        [10, 10, 11, 10, 11, 10, 10, 11, 10, 10, 11, 13],
      );
      cs[11] = { o: 47.6, h: 49.7, l: 41.5, c: 49, v: 13 };
      return cs;
    })(),
  },
  "shrink-consolidation": {
    candles: sch(
      [50, 50.6, 49.8, 50.3, 49.9, 50.4, 50.1, 49.8, 50.2, 50.5, 50.3, 50.9],
      [14, 12, 11, 10, 9, 9, 8, 8, 7, 7, 6, 6],
      0.45,
    ),
    maLong: [48.6, 48.8, 49.0, 49.1, 49.3, 49.4, 49.6, 49.7, 49.9, 50.0, 50.1, 50.3],
  },
  "shrink-pullback": {
    candles: sch(
      [44, 46, 48, 50, 52, 54, 56, 55, 53.6, 54.2, 55.5, 57],
      [10, 11, 12, 12, 13, 13, 14, 11, 8, 7, 9, 12],
    ),
    maLong: [42, 43.5, 45, 46.8, 48.5, 50, 51.5, 52.5, 53.0, 53.2, 53.6, 54.2],
  },
  "oversold-reversal": {
    candles: sch(
      [70, 67, 64, 61, 58, 55, 53, 51, 50, 49.5, 51, 53],
      [12, 12, 13, 13, 14, 14, 13, 12, 11, 10, 11, 12],
    ),
    maShort: [null, null, null, null, 64.0, 61.0, 58.2, 55.6, 53.4, 51.7, 50.9, 50.9],
  },
};

function Schematic({ id }: { id: PatternId }) {
  const spec = SCHEMATICS[id];
  const W = 132;
  const H = 62;
  const VOL_H = 11;
  const PRICE_H = H - VOL_H - 3;
  const prices: number[] = [];
  for (const k of spec.candles) prices.push(k.h, k.l);
  for (const v of spec.maShort ?? []) if (v != null) prices.push(v);
  for (const v of spec.maLong ?? []) if (v != null) prices.push(v);
  if (spec.level != null) prices.push(spec.level);
  let min = Math.min(...prices);
  let max = Math.max(...prices);
  const pad = (max - min) * 0.08 || 1;
  min -= pad;
  max += pad;
  const y = (v: number) => 1.5 + (1 - (v - min) / (max - min)) * PRICE_H;
  const step = W / spec.candles.length;
  const bw = step * 0.52;
  const maxV = Math.max(...spec.candles.map((k) => k.v));
  const linePts = (arr: (number | null)[]) =>
    arr
      .map((v, i) =>
        v == null ? null : `${(i * step + step / 2).toFixed(1)},${y(v).toFixed(1)}`,
      )
      .filter(Boolean)
      .join(" ");
  return (
    <svg
      className="pat-schematic"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {spec.level != null && (
        <line
          x1={0}
          x2={W}
          y1={y(spec.level)}
          y2={y(spec.level)}
          stroke="#b08d3e"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      )}
      {spec.candles.map((k, i) => {
        const cx = i * step + step / 2;
        const up = k.c >= k.o;
        const color = up ? "#1e7d46" : "#b3402a";
        const top = y(Math.max(k.o, k.c));
        const height = Math.max(1, y(Math.min(k.o, k.c)) - top);
        const vh = (k.v / maxV) * VOL_H;
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(k.h)} y2={y(k.l)} stroke={color} strokeWidth="1" />
            <rect x={cx - bw / 2} y={top} width={bw} height={height} fill={color} />
            <rect x={cx - bw / 2} y={H - vh} width={bw} height={vh} fill={color} opacity={0.5} />
          </g>
        );
      })}
      {spec.maLong && (
        <polyline points={linePts(spec.maLong)} fill="none" stroke="#5b7a99" strokeWidth="1.3" />
      )}
      {spec.maShort && (
        <polyline points={linePts(spec.maShort)} fill="none" stroke="#b08d3e" strokeWidth="1.3" />
      )}
    </svg>
  );
}

/* ---------------- 看板本体 ---------------- */

export default function PatternsBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [data, setData] = useState<PatternsPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<PatternId>("ma-cross");
  const [hitsShown, setHitsShown] = useState(PAGE_SIZE);
  const [eventsShown, setEventsShown] = useState(PAGE_SIZE);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/patterns", { cache: "no-store" });
      const payload = (await res.json()) as PatternsPayload;
      if (payload.error && payload.patterns.length === 0) {
        setFailed(true);
      } else {
        setData(payload);
        setFailed(false);
      }
    } catch {
      setFailed(true);
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), 1_800_000);
    return () => window.clearInterval(id);
  }, [load]);

  // 切换形态时分级展开计数重置回首屏（§5）
  useEffect(() => {
    setHitsShown(PAGE_SIZE);
    setEventsShown(PAGE_SIZE);
  }, [selected]);

  const current = data?.patterns.find((p) => p.id === selected) ?? null;
  const cov = data?.coverage;
  const h10 = current?.horizons.find((h) => h.horizon === 10) ?? null;
  const lowSample =
    current != null &&
    current.totalEvents > 0 &&
    current.horizons.some((h) => h.samples < LOW_SAMPLE);

  const shownHits = current?.todayHits.slice(0, hitsShown) ?? [];
  const shownEvents = current?.recentEvents.slice(0, eventsShown) ?? [];

  const fill = useCallback(
    (tpl: string, vars: Record<string, string | number>) => {
      let out = tpl;
      for (const [k, v] of Object.entries(vars)) {
        out = out.replace(`{${k}}`, String(v));
      }
      return out;
    },
    [],
  );

  return (
    <section className="card sig-board">
      <p className="crcl-kicker">{d.boardKicker}</p>
      {data && (
        <>
          <p className="body-text sig-source">
            {fill(d.sourceLine, {
              t: new Intl.DateTimeFormat(LOCALES[lang], {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }).format(new Date(data.scannedAt)),
            })}
          </p>
          {cov && (
            <p className="body-text sig-source">
              {fill(d.coverageLine, {
                withData: cov.symbolsWithData,
                total: cov.symbolsTotal,
                crypto: cov.cryptoWithData,
                stock: cov.stockWithData,
                from: cov.dataStart ?? "—",
                to: cov.dataEnd ?? "—",
                efrom: cov.eventStart ?? "—",
                eto: cov.eventEnd ?? "—",
              })}
            </p>
          )}
        </>
      )}

      {!data && !failed && <p className="body-text">{d.loading}</p>}
      {failed && !data && <p className="body-text sig-error">{d.loadError}</p>}

      {/* 形态选择区（数据未就绪时也可先选） */}
      <div className="pat-grid">
        {ORDER.map((id) => {
          const pr = data?.patterns.find((p) => p.id === id);
          return (
            <button
              key={id}
              type="button"
              className={`pat-card${selected === id ? " pat-card-on" : ""}`}
              onClick={() => setSelected(id)}
              aria-pressed={selected === id}
            >
              <span className="pat-card-name">{d.pname[id]}</span>
              <Schematic id={id} />
              <span className="pat-card-note">{d.schematicNote}</span>
              <span className="pat-card-desc">{d.pdesc[id]}</span>
              <span className="pat-card-meta">
                {pr
                  ? `${fill(d.cardToday, { n: pr.todayHits.length })} · ${fill(d.cardEvents, { n: pr.totalEvents })}`
                  : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {data && current && (
        <>
          {data.stocksUnavailable && (
            <p className="body-text sig-warn">{d.stocksDown}</p>
          )}
          {data.cryptoUnavailable && (
            <p className="body-text sig-warn">{d.cryptoDown}</p>
          )}

          <h3 className="crcl-sec-title">
            {d.secStats} · {d.pname[current.id]}
          </h3>
          <p className="body-text crcl-sec-intro">
            {h10 && h10.samples > 0 && cov
              ? fill(d.conclusion, {
                  from: cov.eventStart ?? "—",
                  to: cov.eventEnd ?? "—",
                  total: current.totalEvents,
                  win: `${h10.winRate?.toFixed(1)}%`,
                  avg: fmtPct(h10.avg),
                  n: h10.samples,
                })
              : fill(d.conclusionNoData, {
                  from: cov?.eventStart ?? "—",
                  to: cov?.eventEnd ?? "—",
                  total: current.totalEvents,
                })}
          </p>
          {lowSample && <p className="body-text sig-warn">{d.lowSample}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{d.colHorizon}</th>
                  <th>{d.colSamples}</th>
                  <th>{d.colWinRate}</th>
                  <th>{d.colAvg}</th>
                  <th>{d.colMedian}</th>
                </tr>
              </thead>
              <tbody>
                {current.horizons.map((h) => (
                  <tr key={h.horizon}>
                    <td>{fill(d.horizonFmt, { h: h.horizon })}</td>
                    <td>{h.samples}</td>
                    <td>{h.winRate == null ? "—" : `${h.winRate.toFixed(1)}%`}</td>
                    <td className={h.avg == null ? undefined : h.avg >= 0 ? "sig-pos" : "sig-neg"}>
                      {fmtPct(h.avg)}
                    </td>
                    <td className={h.median == null ? undefined : h.median >= 0 ? "sig-pos" : "sig-neg"}>
                      {fmtPct(h.median)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="crcl-sec-title">
            {d.secToday} · {d.pname[current.id]}
          </h3>
          <p className="body-text crcl-sec-intro">{d.todayIntro}</p>
          {current.todayHits.length === 0 ? (
            <p className="body-text">{d.todayEmpty}</p>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{d.colSymbol}</th>
                      <th>{d.colPrice}</th>
                      <th>{d.colChange}</th>
                      <th>{d.colMetrics}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownHits.map((hit) => (
                      <tr key={hit.symbol}>
                        <td>
                          <strong>{hit.symbol}</strong> {hit.name[lang]}
                          <span className="pat-kind">
                            {hit.kind === "crypto" ? d.kindCrypto : d.kindStock}
                          </span>
                        </td>
                        <td>${fmtPrice(hit.price)}</td>
                        <td className={hit.changePct == null ? undefined : hit.changePct >= 0 ? "sig-pos" : "sig-neg"}>
                          {fmtPct(hit.changePct)}
                        </td>
                        <td className="pat-metrics">
                          {(
                            Object.entries(hit.metrics) as [MetricKey, number][]
                          )
                            .map(([k, v]) => `${d.metric[k]} ${fmtMetric(k, v)}`)
                            .join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {current.todayHits.length > PAGE_SIZE &&
                (hitsShown < current.todayHits.length ? (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() =>
                      setHitsShown((n) =>
                        Math.min(n + LIST_STEP, current.todayHits.length),
                      )
                    }
                  >
                    {fill(d.showMore, { n: current.todayHits.length - hitsShown })} ▾
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() => setHitsShown(PAGE_SIZE)}
                  >
                    {d.collapse} ▴
                  </button>
                ))}
            </>
          )}

          <h3 className="crcl-sec-title">
            {d.secEvents} · {d.pname[current.id]}
          </h3>
          <p className="body-text crcl-sec-intro">{d.eventsIntro}</p>
          {current.recentEvents.length === 0 ? (
            <p className="body-text">{d.todayEmpty}</p>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{d.colSymbol}</th>
                      <th>{d.colDate}</th>
                      <th>{fill(d.horizonFmt, { h: 5 })}</th>
                      <th>{fill(d.horizonFmt, { h: 10 })}</th>
                      <th>{fill(d.horizonFmt, { h: 20 })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownEvents.map((ev, i) => (
                      <tr key={`${ev.symbol}-${ev.ts}-${i}`}>
                        <td>
                          <strong>{ev.symbol}</strong> {ev.name[lang]}
                          <span className="pat-kind">
                            {ev.kind === "crypto" ? d.kindCrypto : d.kindStock}
                          </span>
                        </td>
                        <td>{ev.date}</td>
                        {([ev.ret5, ev.ret10, ev.ret20] as const).map((r, j) => (
                          <td
                            key={j}
                            className={r == null ? "pat-pending" : r >= 0 ? "sig-pos" : "sig-neg"}
                          >
                            {r == null ? d.pending : fmtPct(r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {current.recentEvents.length > PAGE_SIZE &&
                (eventsShown < current.recentEvents.length ? (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() =>
                      setEventsShown((n) =>
                        Math.min(n + LIST_STEP, current.recentEvents.length),
                      )
                    }
                  >
                    {fill(d.showMore, { n: current.recentEvents.length - eventsShown })} ▾
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sig-more-btn"
                    onClick={() => setEventsShown(PAGE_SIZE)}
                  >
                    {d.collapse} ▴
                  </button>
                ))}
            </>
          )}

          <div className="arb-refresh-row">
            <button
              type="button"
              className="arb-refresh-btn"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              {refreshing ? d.refreshing : d.refresh}
            </button>
            {failed && <span className="arb-refresh-err">{d.loadError}</span>}
          </div>

          <h3 className="crcl-sec-title">{d.secDefs}</h3>
          <div className="burn-note">
            {ORDER.map((id) => (
              <p key={id} className="body-text">
                {d.pdef[id]}
              </p>
            ))}
          </div>

          <h3 className="crcl-sec-title">{d.secCaliber}</h3>
          <div className="burn-note">
            {d.caliber.map((line, i) => (
              <p key={i} className="body-text">
                {line}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
