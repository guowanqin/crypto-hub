import { NextResponse } from "next/server";
import {
  chainHint,
  chainNext,
  getIdiom,
  getPoem,
  makeQuiz,
  poetryStats,
  searchIdioms,
  searchPoems,
  type ChainMode,
} from "@/lib/poetry";

export const dynamic = "force-dynamic";

// 古籍诗词精选版接口：语料在构建时落盘进仓库（lib/data/poetry/），
// 运行时全部走本站这个接口按页/按需下发，浏览器永远拿不到整份语料，
// 也不依赖任何外部接口。
// mode=meta    收录统计（各典籍条数、成语条数、数据来源）
// mode=search  q/book/page 诗词检索（标题/作者/全文）分页
// mode=read    id → 单篇全文
// mode=idiom   q/page 成语词典检索；或 word= 精确查一条
// mode=chain   word/cmode(same|pinyin)/used(逗号分隔) → 系统接龙一步
// mode=hint    word/cmode/used → 可接数量与示例（游戏内提示）
// mode=quiz    随机一题猜诗词（四选一）
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "meta";
  const base = { ok: true as const };

  if (mode === "meta") {
    return NextResponse.json({ ...base, ...poetryStats() });
  }
  if (mode === "search") {
    const result = searchPoems({
      q: url.searchParams.get("q") ?? "",
      book: url.searchParams.get("book") ?? "",
      page: Number(url.searchParams.get("page") ?? "1"),
    });
    return NextResponse.json({ ...base, ...result });
  }
  if (mode === "read") {
    const poem = getPoem(url.searchParams.get("id") ?? "");
    if (!poem) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    return NextResponse.json({ ...base, poem });
  }
  if (mode === "idiom") {
    const word = url.searchParams.get("word");
    if (word) {
      const entry = getIdiom(word);
      if (!entry) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
      return NextResponse.json({ ...base, entry });
    }
    const result = searchIdioms({
      q: url.searchParams.get("q") ?? "",
      page: Number(url.searchParams.get("page") ?? "1"),
    });
    return NextResponse.json({ ...base, ...result });
  }
  if (mode === "chain" || mode === "hint") {
    const word = (url.searchParams.get("word") ?? "").trim();
    const cm: ChainMode = url.searchParams.get("cmode") === "pinyin" ? "pinyin" : "same";
    const used = (url.searchParams.get("used") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (mode === "hint") {
      return NextResponse.json({ ...base, word, chainMode: cm, ...chainHint(word, cm, used) });
    }
    const result = chainNext(word, cm, used);
    return NextResponse.json({ ...base, chainMode: cm, ...result });
  }
  if (mode === "quiz") {
    return NextResponse.json({ ...base, quiz: makeQuiz() });
  }
  return NextResponse.json({ ok: false, error: `unknown mode: ${mode}` }, { status: 400 });
}
