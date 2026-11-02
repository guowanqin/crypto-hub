import { NextResponse } from "next/server";
import {
  fetchCexDetail,
  fetchCexMeta,
  fetchFlowsOverview,
  fetchMargin,
  type CexDetail,
  type CexDetailPayload,
  type FlowsOverview,
  type FlowsPayload,
  type MarginResult,
} from "@/lib/flows";

export const dynamic = "force-dynamic";

// 缓存（与本站 /api/qqqi 同一套模式：命中直出、失败回退 stale）：
// - 资金流总览 1 小时（DeFiLlama 储备为日级数据，小时级足够新）；
// - 保证金 10 分钟（OI/资金费率分钟级变化）；
// - 单所明细按 slug 各缓存 1 小时（updatedProtocol 单份可达数十 MB，只按需拉）。
// 失败绝不写入成功缓存：只记 60 秒失败短路，源恢复后至多 60 秒自动重试；
// 有 stale 成功数据时照常回退 stale。任一区块失败只降级该区块并带 errors 诊断。
const FLOWS_TTL_MS = 60 * 60 * 1000;
const MARGIN_TTL_MS = 10 * 60 * 1000;
const DETAIL_TTL_MS = 60 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

let flowsCache: { at: number; data: FlowsOverview } | null = null;
let flowsFail: { at: number; error: string } | null = null;
let marginCache: { at: number; data: MarginResult } | null = null;
let marginFail: { at: number; error: string } | null = null;
const detailCache = new Map<string, { at: number; data: CexDetail }>();
const detailFail = new Map<string, { at: number; error: string }>();

async function getFlows(): Promise<{
  data: FlowsOverview | null;
  error?: string;
}> {
  const now = Date.now();
  if (flowsCache && now - flowsCache.at < FLOWS_TTL_MS)
    return { data: flowsCache.data };
  if (flowsFail && now - flowsFail.at < FAIL_TTL_MS) {
    if (flowsCache) return { data: flowsCache.data };
    return { data: null, error: flowsFail.error };
  }
  try {
    const data = await fetchFlowsOverview();
    flowsCache = { at: Date.now(), data };
    flowsFail = null;
    return { data };
  } catch (err) {
    flowsFail = { at: Date.now(), error: String(err) };
    if (flowsCache) return { data: flowsCache.data };
    return { data: null, error: flowsFail.error };
  }
}

async function getMargin(): Promise<{
  data: MarginResult | null;
  error?: string;
}> {
  const now = Date.now();
  if (marginCache && now - marginCache.at < MARGIN_TTL_MS)
    return { data: marginCache.data };
  if (marginFail && now - marginFail.at < FAIL_TTL_MS) {
    if (marginCache) return { data: marginCache.data };
    return { data: null, error: marginFail.error };
  }
  try {
    const data = await fetchMargin();
    marginCache = { at: Date.now(), data };
    marginFail = null;
    return { data };
  } catch (err) {
    marginFail = { at: Date.now(), error: String(err) };
    if (marginCache) return { data: marginCache.data };
    return { data: null, error: marginFail.error };
  }
}

async function handleDetail(slugRaw: string) {
  const slug = slugRaw.toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(slug)) {
    const payload: CexDetailPayload = {
      fetchedAt: new Date().toISOString(),
      detail: null,
      error: "bad slug",
    };
    return NextResponse.json(payload, { status: 400 });
  }
  const now = Date.now();
  const cached = detailCache.get(slug);
  if (cached && now - cached.at < DETAIL_TTL_MS) {
    const payload: CexDetailPayload = {
      fetchedAt: cached.data.fetchedAt,
      detail: cached.data,
    };
    return NextResponse.json(payload);
  }
  const failed = detailFail.get(slug);
  if (failed && now - failed.at < FAIL_TTL_MS) {
    if (cached) {
      return NextResponse.json({
        fetchedAt: cached.data.fetchedAt,
        detail: cached.data,
      });
    }
    const payload: CexDetailPayload = {
      fetchedAt: new Date().toISOString(),
      detail: null,
      error: failed.error,
    };
    return NextResponse.json(payload);
  }
  try {
    // 元数据（name/自家代币）优先用总览缓存里的行，缺失再查 DeFiLlama 目录接口
    let meta: { name: string; coin: string | null } | null = null;
    const row = flowsCache?.data.rows.find(
      (r) => r.slug.toLowerCase() === slug,
    );
    if (row) meta = { name: row.name, coin: row.ownToken };
    const detail = await fetchCexDetail(
      slug,
      meta ?? (await fetchCexMeta(slug)),
    );
    detailCache.set(slug, { at: Date.now(), data: detail });
    detailFail.delete(slug);
    const payload: CexDetailPayload = { fetchedAt: detail.fetchedAt, detail };
    return NextResponse.json(payload);
  } catch (err) {
    const error = String(err);
    detailFail.set(slug, { at: Date.now(), error });
    if (cached) {
      return NextResponse.json({
        fetchedAt: cached.data.fetchedAt,
        detail: cached.data,
      });
    }
    const payload: CexDetailPayload = {
      fetchedAt: new Date().toISOString(),
      detail: null,
      error,
    };
    return NextResponse.json(payload);
  }
}

export async function GET(req: Request) {
  const cex = new URL(req.url).searchParams.get("cex");
  if (cex) return handleDetail(cex);

  const [{ data: flows, error: flowsErr }, { data: margin, error: marginErr }] =
    await Promise.all([getFlows(), getMargin()]);

  const errors: FlowsPayload["errors"] = {};
  if (flowsErr) errors.flows = flowsErr;
  if (marginErr) errors.margin = marginErr;

  const payload: FlowsPayload = {
    fetchedAt: new Date().toISOString(),
    flows,
    margin: margin?.rows ?? null,
    btcPriceUsd: margin?.btcPriceUsd ?? null,
    errors,
  };
  return NextResponse.json(payload);
}
