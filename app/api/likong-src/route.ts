import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { LIKONG_GROUP_MAP, LIKONG_TIMESPANS } from "@/lib/likong-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// 利空出尽指数的 GDELT 取数代理：本机与多数访客网络直连 GDELT 会被其
// 按 IP 限流（约 1 次 / 5 秒的共享额度，实测成片 429），Vercel 出口
// 可用，故由服务端代取。无密钥，防滥用靠白名单：只允许
// lib/likong-config.ts 里登记过的词组 id 与 ≤25 个月的 timespan，
// 其余参数一律 400，mode/format 在服务端写死。
// 上游结果缓存 6 小时（revalidate 21600）：用 unstable_cache 包住
// 「成功才返回、失败即抛错」的取数函数——限流（429）与口径错误
// （GDELT 以纯文本返回，如短语太短）只透传给调用方、绝不进缓存，
// 避免一次限流把某个词组毒死 6 小时。仅供本站同步脚本使用。
const REVALIDATE_SEC = 21600;

class GdeltError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const fetchGdeltTimeline = unstable_cache(
  async (query: string, timespan: string): Promise<string> => {
    const upstream =
      "https://api.gdeltproject.org/api/v2/doc/doc?query=" +
      encodeURIComponent(query) +
      "&mode=timelinevol&format=json&timespan=" +
      timespan;
    const res = await fetch(upstream, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; 18btc-likong/1.0)" },
      cache: "no-store",
    });
    const text = await res.text();
    // GDELT 的限流与口径错误都以纯文本返回（限流是 HTTP 429，
    // 短语太短等是 HTTP 200 的文本）：只有真正的 JSON 才算成功。
    if (!text.startsWith("{")) {
      throw new GdeltError(
        res.status === 200 ? 502 : res.status,
        text.slice(0, 300),
      );
    }
    return text;
  },
  ["likong-src"],
  { revalidate: REVALIDATE_SEC },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const g = url.searchParams.get("g") ?? "";
  const timespan = url.searchParams.get("timespan") ?? "12m";
  const def = LIKONG_GROUP_MAP[g];
  if (!def) {
    return NextResponse.json(
      { error: `unknown group: ${g || "(empty)"}` },
      { status: 400 },
    );
  }
  if (!LIKONG_TIMESPANS.has(timespan)) {
    return NextResponse.json(
      { error: `timespan not allowed: ${timespan}` },
      { status: 400 },
    );
  }

  try {
    const text = await fetchGdeltTimeline(def.query, timespan);
    return new NextResponse(text, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    if (e instanceof GdeltError) {
      return new NextResponse(e.message, {
        status: e.status,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json(
      { error: `gdelt fetch failed: ${String(e).slice(0, 200)}` },
      { status: 502 },
    );
  }
}
