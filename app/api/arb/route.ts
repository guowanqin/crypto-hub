import { NextResponse } from "next/server";
import { fetchArbQuotes, type ArbPayload } from "@/lib/arb";

export const dynamic = "force-dynamic";

// 缓存约 60 秒（与面板 60 秒自动刷新对齐）：命中直出；上游失败时回退 stale 成功数据，
// 无 stale 时回 error 载荷（HTTP 200，面板据此提示并保留重试）；失败只记 30 秒短路，
// 源恢复后至多 30 秒自动重试，失败结果绝不写进成功缓存。
const TTL_MS = 60 * 1000;
const FAIL_TTL_MS = 30 * 1000;

let cache: { at: number; payload: ArbPayload } | null = null;
let fail: { at: number; error: string } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return NextResponse.json(cache.payload);
  if (fail && now - fail.at < FAIL_TTL_MS) {
    if (cache) return NextResponse.json(cache.payload);
    const payload: ArbPayload = {
      fetchedAt: new Date(fail.at).toISOString(),
      rows: [],
      error: fail.error,
    };
    return NextResponse.json(payload);
  }
  try {
    const rows = await fetchArbQuotes();
    const payload: ArbPayload = { fetchedAt: new Date().toISOString(), rows };
    cache = { at: Date.now(), payload };
    fail = null;
    return NextResponse.json(payload);
  } catch (err) {
    fail = { at: Date.now(), error: String(err) };
    if (cache) return NextResponse.json(cache.payload);
    const payload: ArbPayload = {
      fetchedAt: new Date().toISOString(),
      rows: [],
      error: fail.error,
    };
    return NextResponse.json(payload);
  }
}
