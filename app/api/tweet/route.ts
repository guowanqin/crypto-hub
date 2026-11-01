import { NextResponse } from "next/server";
import {
  fetchTweetPayload,
  parseTweetInput,
  type TweetPayload,
} from "@/lib/tweet";

export const dynamic = "force-dynamic";

// 缓存（沿用本站 /api 规范：命中直出、失败不长缓存）：
// - 同一条推文的解析结果短缓存 10 分钟（互动数变得慢，没必要每次重打双源）；
// - 失败结果只记 60 秒短路，源恢复后至多 60 秒自动重试；
// - 链接格式错（badformat）在取数前就地判定，不进缓存也不打源。
const OK_TTL_MS = 10 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

const okCache = new Map<string, { at: number; payload: TweetPayload }>();
const failCache = new Map<string, { at: number; payload: TweetPayload }>();

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const id = parseTweetInput(q);
  if (!id) {
    const payload: TweetPayload = {
      ok: false,
      error: { kind: "badformat" },
      tweet: null,
      thread: null,
      source: null,
      errors: {},
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, { status: 400 });
  }

  const now = Date.now();
  const okHit = okCache.get(id);
  if (okHit && now - okHit.at < OK_TTL_MS) {
    return NextResponse.json(okHit.payload);
  }
  const failHit = failCache.get(id);
  if (failHit && now - failHit.at < FAIL_TTL_MS) {
    return NextResponse.json(failHit.payload, { status: 200 });
  }

  const payload = await fetchTweetPayload(id);
  if (payload.ok) {
    okCache.set(id, { at: Date.now(), payload });
    failCache.delete(id);
    return NextResponse.json(payload);
  }
  failCache.set(id, { at: Date.now(), payload });
  return NextResponse.json(payload, { status: 200 });
}
