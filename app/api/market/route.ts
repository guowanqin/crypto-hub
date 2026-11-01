import { NextResponse } from "next/server";
import { fetchMarket } from "@/lib/pershare/market";
import type { MarketData } from "@/lib/pershare/types";

export const dynamic = "force-dynamic";

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: MarketData } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "hit" },
    });
  }
  try {
    const data = await fetchMarket();
    cache = { at: Date.now(), data };
    return NextResponse.json(data, { headers: { "x-cache": "miss" } });
  } catch (err) {
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache": "stale" } });
    return NextResponse.json(
      { error: "行情数据暂时拉取失败", detail: String(err) },
      { status: 502 },
    );
  }
}
