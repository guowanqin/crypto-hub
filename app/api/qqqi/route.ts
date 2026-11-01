import { NextResponse } from "next/server";
import {
  buildDist,
  fetchQqqiDividends,
  fetchQqqiQuote,
  type DayBar,
  type QqqiDiv,
  type QqqiDivSource,
  type QqqiPayload,
  type QqqiQuote,
} from "@/lib/qqqi";

export const dynamic = "force-dynamic";

// 双层缓存（与本站 /api/crcl 同一套模式：命中直出、失败回退 stale）：
// - 行情 15 分钟（Yahoo 主源 → Cboe 兜底双源在 lib 内处理）；
// - 分红历史 12 小时（Yahoo 主源 → stockanalysis 兜底在 lib 内处理；
//   源头月度派息，一天一查都富余；缓存同时记住实际供数源供页面标注）。
// 分红派生（TTM、分红率、分位）在每次请求时用缓存的原始分红事件 + 当前
// 行情现价现算，纯函数零成本，保证分红率跟着 15 分钟行情走而不是 12 小时。
// 行情失败绝不写入成功缓存：只记 60 秒失败短路，源恢复后至多 60 秒自动重试；
// 有 stale 成功数据时照常回退 stale。任一区块失败只降级该区块并带 errors 诊断。
const QUOTE_TTL_MS = 15 * 60 * 1000;
const QUOTE_FAIL_TTL_MS = 60 * 1000;
const DIV_TTL_MS = 12 * 60 * 60 * 1000;

let quoteCache: { at: number; quote: QqqiQuote; bars: DayBar[] | null } | null = null;
let quoteFail: { at: number; error: string } | null = null;
let divCache: { at: number; divs: QqqiDiv[]; source: QqqiDivSource } | null = null;

async function getQuote(): Promise<{ quote: QqqiQuote | null; error?: string }> {
  const now = Date.now();
  if (quoteCache && now - quoteCache.at < QUOTE_TTL_MS) {
    return { quote: quoteCache.quote };
  }
  if (quoteFail && now - quoteFail.at < QUOTE_FAIL_TTL_MS) {
    if (quoteCache) return { quote: quoteCache.quote };
    return { quote: null, error: quoteFail.error };
  }
  try {
    const { quote, bars } = await fetchQqqiQuote();
    quoteCache = {
      at: Date.now(),
      quote,
      // 两源日线同口径，谁供数用谁的；本次没带回时保留上一次的（至多旧一些）
      bars: bars ?? quoteCache?.bars ?? null,
    };
    quoteFail = null;
    return { quote };
  } catch (err) {
    quoteFail = { at: Date.now(), error: String(err) };
    if (quoteCache) return { quote: quoteCache.quote };
    return { quote: null, error: quoteFail.error };
  }
}

async function getDivs(): Promise<{
  divs: QqqiDiv[] | null;
  source: QqqiDivSource;
  error?: string;
}> {
  if (divCache && Date.now() - divCache.at < DIV_TTL_MS) {
    return { divs: divCache.divs, source: divCache.source };
  }
  try {
    const { divs, source } = await fetchQqqiDividends();
    divCache = { at: Date.now(), divs, source };
    return { divs, source };
  } catch (err) {
    if (divCache) return { divs: divCache.divs, source: divCache.source };
    return { divs: null, source: "yahoo", error: String(err) };
  }
}

export async function GET() {
  const [
    { quote, error: quoteErr },
    { divs, source: divSource, error: divErr },
  ] = await Promise.all([getQuote(), getDivs()]);

  const errors: QqqiPayload["errors"] = {};
  if (quoteErr) errors.quote = quoteErr;
  if (divErr) errors.dist = divErr;

  const dist = divs
    ? buildDist(divs, quote?.price ?? null, quoteCache?.bars ?? null, divSource)
    : null;

  const payload: QqqiPayload = {
    fetchedAt: new Date().toISOString(),
    quote,
    dist,
    errors,
  };
  return NextResponse.json(payload);
}
