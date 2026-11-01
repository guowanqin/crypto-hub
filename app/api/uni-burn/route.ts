import { NextResponse } from "next/server";
import { fetchUniBurn } from "@/lib/uniburn";
import type { UniBurnData } from "@/lib/uniburn";

export const dynamic = "force-dynamic";

// 日志扫描较重，缓存放宽到 30 分钟（DeFiBurn 亦为小时级更新）；
// 失败时回退旧缓存（stale），与 /api/market 同一模式。
const TTL_MS = 30 * 60 * 1000;
let cache: { at: number; data: UniBurnData } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "hit" },
    });
  }
  try {
    const data = await fetchUniBurn();
    cache = { at: Date.now(), data };
    return NextResponse.json(data, { headers: { "x-cache": "miss" } });
  } catch (err) {
    if (cache)
      return NextResponse.json(cache.data, { headers: { "x-cache": "stale" } });
    return NextResponse.json(
      { error: "UNI 销毁数据暂时拉取失败", detail: String(err) },
      { status: 502 },
    );
  }
}
