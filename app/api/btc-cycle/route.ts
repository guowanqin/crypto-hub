import { NextResponse } from "next/server";
import { fetchBtcHeight, type BtcCycleData } from "@/lib/btccycle";

export const dynamic = "force-dynamic";

// 与 /api/market 同一缓存模式：5 分钟缓存，取数失败时回退上次成功值（stale）。
const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: BtcCycleData } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "hit" },
    });
  }
  try {
    const data = await fetchBtcHeight();
    cache = { at: Date.now(), data };
    return NextResponse.json(data, { headers: { "x-cache": "miss" } });
  } catch (err) {
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache": "stale" } });
    return NextResponse.json(
      { error: "区块高度暂时拉取失败", detail: String(err) },
      { status: 502 },
    );
  }
}
