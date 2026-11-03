import { NextResponse } from "next/server";
import { getDoc, searchSkills, MSH_META } from "@/lib/marketing-skills";

export const dynamic = "force-dynamic";

// 出海营销技能库接口：数据由 scripts/sync-marketing-skills.mjs 从 GitHub
// 开源仓库 aronhy/marketing-skill-hub（CC BY-NC 4.0）同步清洗后落到本地
// lib/data/marketing-skills.json；浏览器只调本站这个接口，按需取正文，
// 不一次性下发整库（约 300KB）。
// mode=doc    skill=<技能 id>&doc=main|<references 文件名>&lang=en|zh
// mode=search q=<关键词> → 命中技能（名称/简介/正文/参考文档）
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "doc";

  if (mode === "search") {
    const q = url.searchParams.get("q") ?? "";
    return NextResponse.json({ ok: true, hits: searchSkills(q) });
  }

  const skill = url.searchParams.get("skill") ?? "";
  const doc = url.searchParams.get("doc") ?? "main";
  const lang = url.searchParams.get("lang") === "en" ? "en" : "zh";
  const found = getDoc(skill, doc, lang);
  if (!found) {
    return NextResponse.json(
      { ok: false, error: "document not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ok: true,
    title: found.title,
    body: found.body,
    lang: found.lang,
    source: MSH_META.repoUrl,
  });
}
