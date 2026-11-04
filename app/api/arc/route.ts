import { NextResponse } from "next/server";
import { fetchArcBoard, type ArcBoard, type ArcPayload } from "@/lib/arc";

export const dynamic = "force-dynamic";

// 缓存（与本站 /api/chain-dau 同一套模式：命中直出、失败回退 stale）：
// - 看板缓存 10 分钟（DeFiLlama 为日级序列，10 分钟足够新，页面口径卡如实标注）；
// - 失败绝不写入成功缓存：只记 60 秒失败短路，源恢复后至多 60 秒自动重试；
//   有 stale 成功数据时照常回退 stale；失败时 errors.board 带来源诊断。
const BOARD_TTL_MS = 10 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

let boardCache: { at: number; data: ArcBoard } | null = null;
let boardFail: { at: number; error: string } | null = null;

async function getBoard(): Promise<{
  data: ArcBoard | null;
  error?: string;
}> {
  const now = Date.now();
  if (boardCache && now - boardCache.at < BOARD_TTL_MS)
    return { data: boardCache.data };
  if (boardFail && now - boardFail.at < FAIL_TTL_MS) {
    if (boardCache) return { data: boardCache.data };
    return { data: null, error: boardFail.error };
  }
  try {
    const data = await fetchArcBoard();
    boardCache = { at: Date.now(), data };
    boardFail = null;
    return { data };
  } catch (err) {
    boardFail = { at: Date.now(), error: String(err) };
    if (boardCache) return { data: boardCache.data };
    return { data: null, error: boardFail.error };
  }
}

export async function GET() {
  const { data: board, error } = await getBoard();
  const payload: ArcPayload = {
    fetchedAt: new Date().toISOString(),
    board,
    errors: error ? { board: error } : {},
  };
  return NextResponse.json(payload);
}
