import { NextResponse } from "next/server";
import { fetchLikongBoard, type LikongPayload } from "@/lib/likong";

export const dynamic = "force-dynamic";

// 缓存 30 分钟：指数本体来自仓库内静态数据文件（由同步脚本更新），
// 只有四标的日线价格是在线取数，日线收盘后才变，没必要短缓存。
// 命中直出；整轮失败时回退 stale 成功数据，无 stale 时回带 error 的
// 空载荷（HTTP 200，面板据此提示并保留重试）；失败只记 60 秒短路，
// 失败结果绝不写进成功缓存。口径与 /api/patterns 一致。
const TTL_MS = 30 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

let cache: { at: number; payload: LikongPayload } | null = null;
let fail: { at: number; error: string } | null = null;

function emptyPayload(error: string): LikongPayload {
  return {
    generatedAt: new Date().toISOString(),
    dataGeneratedAt: null,
    coverage: null,
    current: null,
    series: [],
    groups: [],
    events: [],
    stats: [],
    prices: { BTC: [], ETH: [], SPX: [], IXIC: [] },
    socialSample: [],
    errors: {},
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
    const payload = await fetchLikongBoard();
    cache = { at: Date.now(), payload };
    fail = null;
    return NextResponse.json(payload);
  } catch (err) {
    fail = { at: Date.now(), error: String(err) };
    if (cache) return NextResponse.json(cache.payload);
    return NextResponse.json(emptyPayload(fail.error));
  }
}
