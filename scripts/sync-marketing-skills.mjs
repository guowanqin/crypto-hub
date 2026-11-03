#!/usr/bin/env node
// 出海营销技能库数据同步脚本（服务端/构建期使用，浏览器永不直连上游）。
//
// 数据源：GitHub 开源仓库 aronhy/marketing-skill-hub（作者 Aron 厚玉）。
// 许可证：技能内容（Markdown）为 CC BY-NC 4.0（署名即可免费分享、禁止商用转售），
// 脚本为 MIT。本站只做免费站内阅读，页面带署名块（作者 + 源仓库 + 许可证）。
//
// 同步方式（参照本站 slang 的「服务端取数、浏览器只读本站数据」口径）：
//   git clone 上游仓库 → 只取 skills/ 下 9 个技能的 SKILL.md / SKILL.zh.md /
//   references/*.md → 广告清洗（规则化过滤，见 cleanMarkdown）→ 解析术语表与
//   新手 100 问为结构化条目 → 生成 lib/data/marketing-skills.json，页面读本地数据。
// 后续自动同步：把本脚本挂到与其它日同步相同的 cron 机制重跑即可
// （跑完 git diff 有变化再 commit），页面代码无需改动。
//
// 用法：node scripts/sync-marketing-skills.mjs [上游本地克隆路径]
//   不带参数时自动 git clone --depth 1 到临时目录。

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_URL = "https://github.com/aronhy/marketing-skill-hub";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = path.join(ROOT, "lib", "data", "marketing-skills.json");

// 技能顺序与功能分组（分组是本站的界面组织方式，与上游目录无关）：
// strategy 战略规划 / ads 广告投放 / creative 内容创意 /
// optimization 优化复盘 / outreach 邮件外联 / social 私域与社媒
const SKILLS = [
  { id: "growth-strategy", group: "strategy" },
  { id: "paid-ads", group: "ads" },
  { id: "ad-copy", group: "creative" },
  { id: "ugc-video", group: "creative" },
  { id: "ads-optimization", group: "optimization" },
  { id: "cold-outreach", group: "outreach" },
  { id: "email-marketing", group: "outreach" },
  { id: "conversational-sales", group: "social" },
  { id: "social-media", group: "social" },
];

// ---------- 广告清洗规则 ----------
// 1) 域名黑名单：作者的 Pro 版售卖站与社交账号引流链接，一律剥离。
const BLACKLIST_DOMAINS = [
  "aronhouyu.com",
  "t.me/aronhouyu",
  "x.com/aronhouyu",
  "twitter.com/aronhouyu",
  "youtube.com/@aronhouyu",
  "youtu.be/@aronhouyu",
];
// 2) 整节剥离：标题命中以下模式的章节（连同其下属小节）整段删除。
const PROMO_HEADING =
  /(get\s*pro|获取\s*pro|pro\s*版|升级\s*pro|pro\s*version|关注作者|联系作者|联系方式|follow\s+(me|the\s+author)|求\s*star|give\s+(us\s+)?a\s+star)/i;
// 3) 整行剥离：单行命中以下模式即删行。
const PROMO_LINE =
  /(built\s+by\s+aron|plugin\s+install\s+\S*aronhy|marketplace\s+aronhy|扫码\s*(关注|加)|加\s*(我)?\s*微信|微信\s*[:：]\s*[A-Za-z])/i;

const stripLog = [];
function logStrip(file, rule, excerpt) {
  stripLog.push({ file, rule, excerpt: excerpt.trim().slice(0, 120) });
}

function containsBlacklist(text) {
  const low = text.toLowerCase();
  return BLACKLIST_DOMAINS.find((d) => low.includes(d));
}

/**
 * 清洗一篇 Markdown：
 * - 去 YAML frontmatter（返回解析出的键值）；
 * - 黑名单域名：含该链接的 Markdown 链接 / HTML 锚点就地剥除，整行只剩
 *   引流内容时删行；
 * - 命中 PROMO_HEADING 的章节整节删除；命中 PROMO_LINE 的行删除。
 * 所有剥离动作都记入 stripLog，最后随报告打印。
 */
function cleanMarkdown(raw, fileLabel) {
  let text = raw.replace(/\r\n/g, "\n");
  const meta = {};
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    }
    text = text.slice(fm[0].length);
  }

  const lines = text.split("\n");
  const out = [];
  let skipLevel = 0; // >0 时处于被整节剥离的章节内，记录其标题级别
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      if (skipLevel > 0 && level > skipLevel) continue; // 仍在被剥离章节内
      skipLevel = 0;
      if (PROMO_HEADING.test(heading[2])) {
        skipLevel = level;
        logStrip(fileLabel, "promo-section", line);
        continue;
      }
    } else if (skipLevel > 0) {
      continue;
    }

    if (PROMO_LINE.test(line)) {
      logStrip(fileLabel, "promo-line", line);
      continue;
    }

    const bad = containsBlacklist(line);
    if (bad) {
      logStrip(fileLabel, `blacklist:${bad}`, line);
      // 剥除指向黑名单域名的 Markdown 链接与 HTML 锚点，保留其余正文。
      let cleaned = line
        .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (m) =>
          containsBlacklist(m) ? "" : m
        )
        .replace(/\[([^\]]*)\]\(([^)]+)\)/g, (m, t, u) =>
          containsBlacklist(u) ? "" : m
        )
        .replace(/https?:\/\/[^\s)）」]+/g, (u) =>
          containsBlacklist(u) ? "" : u
        )
        .replace(/\s{2,}/g, " ")
        .trim();
      // 整行只剩标点/空内容时直接删行。
      if (!cleaned || /^[-—·|>*#\s]*$/.test(cleaned)) continue;
      out.push(cleaned);
      continue;
    }
    out.push(line);
  }
  return { meta, body: out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n" };
}

// ---------- 提取辅助 ----------

function firstHeading(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

/** 第一段普通正文（跳过标题、引用、列表、表格、代码块），md 链接转纯文本。 */
function firstParagraph(body, maxLen = 220) {
  const blocks = body.split(/\n\s*\n/);
  for (const block of blocks) {
    const t = block.trim();
    if (!t || /^[#>\-|`]/.test(t) || /^!\[/.test(t)) continue;
    const plain = t
      .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/[*_~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (plain.length < 10) continue;
    return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
  }
  return "";
}

function detectLang(text) {
  const sample = text.slice(0, 4000);
  const cjk = (sample.match(/[一-鿿]/g) || []).length;
  return cjk > 200 ? "zh" : "en";
}

/** 解析术语表：只收表头为「术语 | 英文 | 一句话解释」的三列表格行。 */
function parseGlossary(body) {
  const terms = [];
  const categories = [];
  let category = "";
  let inTermTable = false;
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      category = h[1].trim();
      inTermTable = false;
      continue;
    }
    if (/^\|\s*术语\s*\|\s*英文\s*\|\s*一句话解释\s*\|/.test(line)) {
      inTermTable = true;
      if (category && !categories.includes(category)) categories.push(category);
      continue;
    }
    if (inTermTable) {
      if (!line.startsWith("|")) {
        inTermTable = false;
        continue;
      }
      if (/^\|[\s:-]+\|/.test(line)) continue; // 分隔行
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length >= 3 && cells[0] && cells[2]) {
        terms.push({
          term: cells[0],
          en: cells[1],
          def: cells[2],
          category,
        });
      }
    }
  }
  return { terms, categories };
}

/** 解析新手 100 问：## 分类 + 「**N. 问题**」+ 随后的回答段落。 */
function parseFaq(body) {
  const items = [];
  const categories = [];
  let category = "";
  let current = null;
  const flush = () => {
    if (current) {
      current.a = current.aLines.join("\n").trim();
      delete current.aLines;
      items.push(current);
      current = null;
    }
  };
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      flush();
      category = h[1].trim().replace(/^[一二三四五六七八九十]+、/, "");
      if (!categories.includes(category)) categories.push(category);
      continue;
    }
    const q = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/);
    if (q) {
      flush();
      current = { n: Number(q[1]), q: q[2].trim(), category, aLines: [] };
      continue;
    }
    if (line.trim() === "---") {
      flush();
      continue;
    }
    if (current) current.aLines.push(line);
  }
  flush();
  return { items, categories };
}

// ---------- 主流程 ----------

function main() {
  let srcRoot = process.argv[2];
  let tmpDir = null;
  if (!srcRoot) {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "msh-"));
    execFileSync("git", ["clone", "--depth", "1", REPO_URL, tmpDir], {
      stdio: "inherit",
    });
    srcRoot = tmpDir;
  }
  let commit = "unknown";
  try {
    commit = execFileSync("git", ["-C", srcRoot, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    /* 本地路径无 git 信息时忽略 */
  }

  const skills = [];
  let glossary = { terms: [], categories: [] };
  let faq = { items: [], categories: [] };

  for (const { id, group } of SKILLS) {
    const dir = path.join(srcRoot, "skills", id);
    const enRaw = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
    const zhRaw = fs.readFileSync(path.join(dir, "SKILL.zh.md"), "utf8");
    const en = cleanMarkdown(enRaw, `${id}/SKILL.md`);
    const zh = cleanMarkdown(zhRaw, `${id}/SKILL.zh.md`);

    const references = [];
    const refDir = path.join(dir, "references");
    if (fs.existsSync(refDir)) {
      for (const file of fs.readdirSync(refDir).sort()) {
        if (!file.endsWith(".md")) continue;
        const cleaned = cleanMarkdown(
          fs.readFileSync(path.join(refDir, file), "utf8"),
          `${id}/references/${file}`
        );
        const body = cleaned.body;
        references.push({
          file,
          title: firstHeading(body) || file.replace(/\.md$/, ""),
          lang: detectLang(body),
          body,
        });
        if (id === "growth-strategy" && file === "glossary.md") {
          glossary = parseGlossary(body);
        }
        if (id === "growth-strategy" && file === "beginner-faq.md") {
          faq = parseFaq(body);
        }
      }
    }

    skills.push({
      id,
      group,
      name: {
        en: firstHeading(en.body).replace(/\s*[（(][^)）]*[)）]\s*$/, ""),
        zh: firstHeading(zh.body),
      },
      summary: {
        en: firstParagraph(en.body),
        zh: firstParagraph(zh.body),
      },
      bodyEn: en.body,
      bodyZh: zh.body,
      references,
    });
  }

  const data = {
    meta: {
      repo: "aronhy/marketing-skill-hub",
      repoUrl: REPO_URL,
      author: "Aron 厚玉",
      license: "CC BY-NC 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
      sourceCommit: commit,
      syncedAt: new Date().toISOString().slice(0, 10),
    },
    skills,
    glossary: glossary.terms,
    glossaryCategories: glossary.categories,
    faq: faq.items,
    faqCategories: faq.categories,
  };

  const json = JSON.stringify(data);
  // 出口自检：数据文件里不得出现黑名单域名。
  const bad = containsBlacklist(json);
  if (bad) {
    console.error(`✗ 清洗后仍检出黑名单域名 ${bad}，已中止写出`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 1) + "\n");

  const totalRefs = skills.reduce((n, s) => n + s.references.length, 0);
  console.log(`✓ 已写出 ${path.relative(ROOT, OUT_PATH)}`);
  console.log(
    `  技能 ${skills.length} 个 · 参考文档 ${totalRefs} 篇 · 术语 ${glossary.terms.length} 条 · 问答 ${faq.items.length} 条`
  );
  console.log(`  上游 commit ${commit.slice(0, 12)} · 同步日期 ${data.meta.syncedAt}`);
  console.log(`  广告剥离 ${stripLog.length} 处：`);
  for (const s of stripLog) console.log(`    - [${s.rule}] ${s.file}: ${s.excerpt}`);
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
}

main();
