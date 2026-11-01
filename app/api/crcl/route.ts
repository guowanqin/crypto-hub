import { NextResponse } from "next/server";
import {
  fetchCrclQuote,
  fetchUsdcFundamentals,
  computeScore,
  type CrclPayload,
  type CrclQuote,
  type CrclValuation,
  type UsdcFundamentals,
} from "@/lib/crcl";
import { CRCL_FINANCIALS } from "@/lib/crcl-config";

export const dynamic = "force-dynamic";

// 双层缓存（与本站 /api 既有模式一致：命中直出、失败回退 stale）：
// - 行情（Yahoo 日线）15 分钟；日线本身一天一根，15 分钟足够新。
// - 基本面（DeFiLlama 日序列）12 小时；源头一天一更。
// 两块独立取数、独立降级：任一源失败时用各自的旧缓存顶上，都没有才置 null，
// 页面按区块降级显示并标注数据时间，绝不编造数字。
const QUOTE_TTL_MS = 15 * 60 * 1000;
const FUND_TTL_MS = 12 * 60 * 60 * 1000;

let quoteCache: { at: number; data: CrclQuote } | null = null;
let fundCache: { at: number; data: UsdcFundamentals } | null = null;

async function getQuote(): Promise<{ data: CrclQuote | null; error?: string }> {
  if (quoteCache && Date.now() - quoteCache.at < QUOTE_TTL_MS) {
    return { data: quoteCache.data };
  }
  try {
    const data = await fetchCrclQuote();
    quoteCache = { at: Date.now(), data };
    return { data };
  } catch (err) {
    if (quoteCache) return { data: quoteCache.data };
    return { data: null, error: String(err) };
  }
}

async function getFund(): Promise<{ data: UsdcFundamentals | null; error?: string }> {
  if (fundCache && Date.now() - fundCache.at < FUND_TTL_MS) {
    return { data: fundCache.data };
  }
  try {
    const data = await fetchUsdcFundamentals();
    fundCache = { at: Date.now(), data };
    return { data };
  } catch (err) {
    if (fundCache) return { data: fundCache.data };
    return { data: null, error: String(err) };
  }
}

export async function GET() {
  const [{ data: quote, error: quoteErr }, { data: fund, error: fundErr }] =
    await Promise.all([getQuote(), getFund()]);

  const errors: CrclPayload["errors"] = {};
  if (quoteErr) errors.quote = quoteErr;
  if (fundErr) errors.fund = fundErr;

  let valuation: CrclValuation | null = null;
  if (quote) {
    const marketCap = quote.price * CRCL_FINANCIALS.sharesOutstanding;
    valuation = {
      marketCap,
      fdv: quote.price * CRCL_FINANCIALS.dilutedShares,
      ps: marketCap / (CRCL_FINANCIALS.revenueTTM_M * 1e6),
      mcapToEbitda: marketCap / (CRCL_FINANCIALS.ebitdaTTM_M * 1e6),
    };
  }

  const score =
    quote && fund && valuation
      ? computeScore({
          ps: valuation.ps,
          rsi14: quote.rsi14,
          usdcChg180Pct: fund.chg180Pct,
          shareChg90Pp: fund.shareChg90Pp,
        })
      : null;

  const payload: CrclPayload = {
    fetchedAt: new Date().toISOString(),
    quote,
    fund,
    valuation,
    score,
    financials: CRCL_FINANCIALS,
    errors,
  };
  return NextResponse.json(payload);
}
