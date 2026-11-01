import { NextResponse } from "next/server";
import { fetchHypeMarket } from "@/lib/pershare/hype-market";
import type { HypeMarketData } from "@/lib/pershare/types";

export const dynamic = "force-dynamic";

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: HypeMarketData } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "hit" },
    });
  }
  try {
    const data = await fetchHypeMarket();
    cache = { at: Date.now(), data };
    return NextResponse.json(data, { headers: { "x-cache": "miss" } });
  } catch (err) {
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache": "stale" } });
    return NextResponse.json(
      { error: "HYPE 行情数据暂时拉取失败", detail: String(err) },
      { status: 502 },
    );
  }
}
