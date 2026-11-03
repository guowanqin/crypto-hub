// 出海营销技能库数据层（仅服务端使用）。
//
// 数据源：GitHub 开源仓库 aronhy/marketing-skill-hub（作者 Aron 厚玉）。
// 许可证：技能内容（Markdown）为 CC BY-NC 4.0（署名即可免费分享、禁止商用
// 转售），脚本 MIT。本站只做免费站内阅读，页面带署名块。
//
// 取数方式：与 slang 的「浏览器永远只调本站接口、不直连上游」口径一致，
// 但本库内容是成篇文档，采用构建期同步：scripts/sync-marketing-skills.mjs
// 从 GitHub 拉取 9 个技能的 SKILL.md / SKILL.zh.md / references/*.md，做
// 广告清洗（剥离 Pro 版推销与作者社交引流，规则见同步脚本）后生成
// lib/data/marketing-skills.json 提交进仓库，页面读本地数据。
// 正文体量约 300KB，只在服务端持有：目录 / 术语表 / 100 问经页面 props
// 下发，技能与参考文档正文经 /api/marketing-skills 按需取，搜索亦在
// 服务端按正文关键词匹配（mode=search）。后续自动同步：重跑同步脚本、
// diff 有变化再提交即可，页面代码不动。

import rawData from "./data/marketing-skills.json";

export interface MshMeta {
  repo: string;
  repoUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceCommit: string;
  syncedAt: string;
}

export interface MshReference {
  file: string;
  title: string;
  lang: "en" | "zh";
  body: string;
}

export interface MshSkill {
  id: string;
  group: string;
  name: { en: string; zh: string };
  summary: { en: string; zh: string };
  bodyEn: string;
  bodyZh: string;
  references: MshReference[];
}

export interface MshGlossaryTerm {
  term: string;
  en: string;
  def: string;
  category: string;
}

export interface MshFaqItem {
  n: number;
  q: string;
  a: string;
  category: string;
}

interface MshData {
  meta: MshMeta;
  skills: MshSkill[];
  glossary: MshGlossaryTerm[];
  glossaryCategories: string[];
  faq: MshFaqItem[];
  faqCategories: string[];
}

const DATA = rawData as unknown as MshData;

export const MSH_META = DATA.meta;

/** 技能分组 id（界面分组是本站组织方式，分组名三语字典在组件内）。 */
export const MSH_GROUPS = [
  "strategy",
  "ads",
  "creative",
  "optimization",
  "outreach",
  "social",
] as const;

/** 目录数据（不含正文）：技能名 / 简介 / 分组 + 参考文档标题清单。 */
export interface MshSkillDir {
  id: string;
  group: string;
  name: { en: string; zh: string };
  summary: { en: string; zh: string };
  references: { file: string; title: string; lang: "en" | "zh" }[];
}

export function getSkillDirectory(): MshSkillDir[] {
  return DATA.skills.map((s) => ({
    id: s.id,
    group: s.group,
    name: s.name,
    summary: s.summary,
    references: s.references.map((r) => ({
      file: r.file,
      title: r.title,
      lang: r.lang,
    })),
  }));
}

export function getGlossary(): { terms: MshGlossaryTerm[]; categories: string[] } {
  return { terms: DATA.glossary, categories: DATA.glossaryCategories };
}

export function getFaq(): { items: MshFaqItem[]; categories: string[] } {
  // 只保留确有问答条目的分类（上游文末另有「该找谁」等说明性小节，无条目）。
  const used = DATA.faqCategories.filter((c) =>
    DATA.faq.some((f) => f.category === c)
  );
  return { items: DATA.faq, categories: used };
}

export interface MshDoc {
  title: string;
  body: string;
  lang: "en" | "zh";
}

/** 取一篇文档：doc=main 为技能正文（lang 决定中/英），否则为 references 文件名。 */
export function getDoc(
  skillId: string,
  doc: string,
  lang: "en" | "zh"
): MshDoc | null {
  const skill = DATA.skills.find((s) => s.id === skillId);
  if (!skill) return null;
  if (doc === "main") {
    return lang === "en"
      ? { title: skill.name.en, body: skill.bodyEn, lang: "en" }
      : { title: skill.name.zh, body: skill.bodyZh, lang: "zh" };
  }
  const ref = skill.references.find((r) => r.file === doc);
  if (!ref) return null;
  return { title: ref.title, body: ref.body, lang: ref.lang };
}

export interface MshSearchHit {
  id: string;
  inBody: boolean;
  refFiles: string[];
}

/** 全文搜索：名称 / 简介 / 中英正文 / 参考文档标题与正文，返回命中的技能。 */
export function searchSkills(q: string): MshSearchHit[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const hits: MshSearchHit[] = [];
  for (const s of DATA.skills) {
    const inHead =
      s.name.en.toLowerCase().includes(needle) ||
      s.name.zh.toLowerCase().includes(needle) ||
      s.summary.en.toLowerCase().includes(needle) ||
      s.summary.zh.toLowerCase().includes(needle);
    const inBody =
      s.bodyEn.toLowerCase().includes(needle) ||
      s.bodyZh.toLowerCase().includes(needle);
    const refFiles = s.references
      .filter(
        (r) =>
          r.title.toLowerCase().includes(needle) ||
          r.body.toLowerCase().includes(needle)
      )
      .map((r) => r.file);
    if (inHead || inBody || refFiles.length > 0) {
      hits.push({ id: s.id, inBody: inHead || inBody, refFiles });
    }
  }
  return hits;
}
