import { NextResponse } from "next/server";
import {
  getSlangDataset,
  lookupAbbr,
  searchSlang,
  SLANG_REPO_URL,
} from "@/lib/slang";

export const dynamic = "force-dynamic";

// 二手黑话词典接口：数据在服务端同步自 GitHub 开源仓库
// Domainsun/awesome-chinese-secondhand-slang（MIT），24 小时缓存 + stale 兜底
// 在 lib/slang.ts 内处理；浏览器永远只调本站这个接口，不直连上游 raw 文件，
// 也不会一次性拿到整份词库（搜索结果分页返回，每页 30 条）。
// mode=meta  词库统计 + 分类 + 状态枚举 + 同步时间
// mode=search q/cat/status/page 服务端搜索分页
// mode=abbr  q=拼音首字母缩写 → README 缩写表命中 + 变体含该字母暗号的词条
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "meta";
  const { data, stale, error } = await getSlangDataset();
  if (!data) {
    return NextResponse.json(
      { ok: false, error: error ?? "upstream unavailable" },
      { status: 502 }
    );
  }
  const base = { ok: true, stale, fetchedAt: data.fetchedAt, source: SLANG_REPO_URL };

  if (mode === "meta") {
    return NextResponse.json({
      ...base,
      stats: data.stats,
      categories: data.categories,
      statuses: data.statuses,
    });
  }
  if (mode === "search") {
    const result = searchSlang(data, {
      q: url.searchParams.get("q") ?? "",
      cat: url.searchParams.get("cat") ?? "",
      status: url.searchParams.get("status") ?? "",
      page: Number(url.searchParams.get("page") ?? "1"),
    });
    return NextResponse.json({ ...base, ...result });
  }
  if (mode === "abbr") {
    const result = lookupAbbr(data, url.searchParams.get("q") ?? "");
    return NextResponse.json({ ...base, ...result });
  }
  return NextResponse.json({ ok: false, error: `unknown mode: ${mode}` }, { status: 400 });
}
