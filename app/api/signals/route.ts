import { NextResponse } from "next/server";
import { fetchSignalScan, type SignalsPayload } from "@/lib/signals";

export const dynamic = "force-dynamic";

// 缓存约 180 秒（面板 5 分钟自动刷新，服务端缓存短于刷新间隔）：命中直出；
// 上游整类失败时回退 stale 成功数据，无 stale 时回带 error 的空载荷（HTTP 200，
// 面板据此提示并保留重试）；失败只记 60 秒短路，源恢复后至多 60 秒自动重试，
// 失败结果绝不写进成功缓存。
const TTL_MS = 180 * 1000;
const FAIL_TTL_MS = 60 * 1000;

let cache: { at: number; payload: SignalsPayload } | null = null;
let fail: { at: number; error: string } | null = null;

function emptyPayload(error: string): SignalsPayload {
  return {
    scannedAt: new Date().toISOString(),
    assets: [],
    breadth: { total: 0, up: 0, upPct: 0, withSignals: 0 },
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
    const payload = await fetchSignalScan();
    cache = { at: Date.now(), payload };
    fail = null;
    return NextResponse.json(payload);
  } catch (err) {
    fail = { at: Date.now(), error: String(err) };
    if (cache) return NextResponse.json(cache.payload);
    return NextResponse.json(emptyPayload(fail.error));
  }
}
