import { NextResponse } from "next/server";
import { fetchPatternScan, type PatternsPayload } from "@/lib/patterns";

export const dynamic = "force-dynamic";

// 缓存 30 分钟：回测要对 50 个标的逐日跑 6 个形态，计算较重，且底层是
// 日线数据（收盘后才变），没有必要短缓存。命中直出；上游整类失败时回退
// stale 成功数据，无 stale 时回带 error 的空载荷（HTTP 200，面板据此提示
// 并保留重试）；失败只记 60 秒短路，源恢复后至多 60 秒自动重试，
// 失败结果绝不写进成功缓存。
const TTL_MS = 30 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

let cache: { at: number; payload: PatternsPayload } | null = null;
let fail: { at: number; error: string } | null = null;

function emptyPayload(error: string): PatternsPayload {
  return {
    scannedAt: new Date().toISOString(),
    coverage: {
      symbolsTotal: 0,
      symbolsWithData: 0,
      cryptoWithData: 0,
      stockWithData: 0,
      dataStart: null,
      dataEnd: null,
      eventStart: null,
      eventEnd: null,
    },
    patterns: [],
    error,
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return NextResponse.json(cache.payload);
  if (fail && now - fail.at < FAIL_TTL_MS) {
    if (cache) return NextResponse.json(cache.payload);
    return NextResponse.json(emptyPayload(fail.error));
  }
  try {
    const payload = await fetchPatternScan();
    cache = { at: Date.now(), payload };
    fail = null;
    return NextResponse.json(payload);
  } catch (err) {
    fail = { at: Date.now(), error: String(err) };
    if (cache) return NextResponse.json(cache.payload);
    return NextResponse.json(emptyPayload(fail.error));
  }
}
