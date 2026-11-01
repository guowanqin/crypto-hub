import { NextResponse } from "next/server";
import {
  computeAth,
  computeTemperature,
  fetchQqqDaily,
  fetchQqqHistory,
  fetchQqqPe,
  type DayBar,
  type QqqHistory,
  type QqqPayload,
  type QqqPe,
  type QqqQuote,
} from "@/lib/qqq";

export const dynamic = "force-dynamic";

// 缓存（与本站 /api/qqqi、/api/crcl 同一套模式：命中直出、失败回退 stale）：
// - 行情 15 分钟（Yahoo 日线主源 → Cboe 兜底在 lib 内处理）；
// - 回测全史（月线+分红）12 小时（Yahoo 主源 → 兜底文件+补新在 lib 内处理）；
// - PE 12 小时（可选区块，失败只降级该区块）。
// 行情/历史失败绝不写入成功缓存：只记 60 秒失败短路，源恢复后自动重试；
// 有 stale 成功数据时照常回退 stale。ATH 在每次请求时由缓存的月线全史 +
// 当前日线现算（收盘口径），估值温度随之现算，保证跟着 15 分钟行情走。
const QUOTE_TTL_MS = 15 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;
const HISTORY_TTL_MS = 12 * 60 * 60 * 1000;
const PE_TTL_MS = 12 * 60 * 60 * 1000;

type QuoteBase = Omit<QqqQuote, "ath" | "athDrawdownPct">;

let quoteCache: { at: number; base: QuoteBase; bars: DayBar[] } | null = null;
let quoteFail: { at: number; error: string } | null = null;
let historyCache: { at: number; history: QqqHistory } | null = null;
let historyFail: { at: number; error: string } | null = null;
let peCache: { at: number; pe: QqqPe } | null = null;
let peFailAt = 0;

async function getQuoteBase(): Promise<{
  base: QuoteBase | null;
  bars: DayBar[] | null;
  error?: string;
}> {
  const now = Date.now();
  if (quoteCache && now - quoteCache.at < QUOTE_TTL_MS) {
    return { base: quoteCache.base, bars: quoteCache.bars };
  }
  if (quoteFail && now - quoteFail.at < FAIL_TTL_MS) {
    if (quoteCache) return { base: quoteCache.base, bars: quoteCache.bars };
    return { base: null, bars: null, error: quoteFail.error };
  }
  try {
    const { base, bars } = await fetchQqqDaily();
    quoteCache = { at: Date.now(), base, bars };
    quoteFail = null;
    return { base, bars };
  } catch (err) {
    quoteFail = { at: Date.now(), error: String(err) };
    if (quoteCache) return { base: quoteCache.base, bars: quoteCache.bars };
    return { base: null, bars: null, error: quoteFail.error };
  }
}

async function getHistory(): Promise<{
  history: QqqHistory | null;
  error?: string;
}> {
  const now = Date.now();
  if (historyCache && now - historyCache.at < HISTORY_TTL_MS) {
    return { history: historyCache.history };
  }
  if (historyFail && now - historyFail.at < FAIL_TTL_MS) {
    if (historyCache) return { history: historyCache.history };
    return { history: null, error: historyFail.error };
  }
  try {
    const history = await fetchQqqHistory();
    historyCache = { at: Date.now(), history };
    historyFail = null;
    return { history };
  } catch (err) {
    historyFail = { at: Date.now(), error: String(err) };
    if (historyCache) return { history: historyCache.history };
    return { history: null, error: historyFail.error };
  }
}

async function getPe(): Promise<{ pe: QqqPe | null; error?: string }> {
  const now = Date.now();
  if (peCache && now - peCache.at < PE_TTL_MS) return { pe: peCache.pe };
  if (peCache && now - peFailAt < FAIL_TTL_MS) return { pe: peCache.pe };
  if (!peCache && peFailAt && now - peFailAt < FAIL_TTL_MS) {
    return { pe: null, error: "pe recently failed" };
  }
  try {
    const pe = await fetchQqqPe();
    peCache = { at: Date.now(), pe };
    return { pe };
  } catch (err) {
    peFailAt = Date.now();
    if (peCache) return { pe: peCache.pe };
    return { pe: null, error: String(err) };
  }
}

export async function GET() {
  const [
    { base, bars, error: quoteErr },
    { history, error: historyErr },
    { pe, error: peErr },
  ] = await Promise.all([getQuoteBase(), getHistory(), getPe()]);

  const errors: QqqPayload["errors"] = {};
  if (quoteErr) errors.quote = quoteErr;
  if (historyErr) errors.history = historyErr;
  if (peErr) errors.pe = peErr;

  let quote: QqqQuote | null = null;
  if (base) {
    const ath = history
      ? computeAth(history.months, bars)
      : computeAth([], bars);
    quote = {
      ...base,
      ath,
      athDrawdownPct:
        ath.value > 0 ? Math.max(0, (1 - base.price / ath.value) * 100) : 0,
    };
  }

  const payload: QqqPayload = {
    fetchedAt: new Date().toISOString(),
    quote,
    history,
    pe,
    temp: quote ? computeTemperature(quote, pe) : null,
    errors,
  };
  return NextResponse.json(payload);
}
