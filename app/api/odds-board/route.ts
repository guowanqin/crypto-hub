import { NextResponse } from "next/server";
import { fetchOddsBoard, type OddsBoardData } from "@/lib/odds-board";

export const dynamic = "force-dynamic";

// 与 /api/btc-cycle 同一缓存模式：10 分钟缓存，取数失败时回退上次成功值（stale）；
// 从未成功过则明确 502 报错，不编造概率。
const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; data: OddsBoardData } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "hit" },
    });
  }
  try {
    const data = await fetchOddsBoard();
    cache = { at: Date.now(), data };
    return NextResponse.json(data, { headers: { "x-cache": "miss" } });
  } catch (err) {
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache": "stale" } });
    return NextResponse.json(
      { error: "预测市场赔率暂时拉取失败", detail: String(err) },
      { status: 502 },
    );
  }
}
