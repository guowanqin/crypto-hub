// 古籍诗词精选版数据层（仅服务端使用，整份语料永不下发浏览器）。
//
// 数据来源与处理（构建时抓取落盘，运行时不依赖任何外部接口）：
// - 诗词典籍：GitHub 开源库 chinese-poetry/chinese-poetry（MIT License）
//   · 唐诗三百首 ← 全唐诗/唐诗三百首.json（366 条）
//   · 宋词三百首 ← 宋词/宋词三百首.json（280 条；源文件无独立标题，标题取词牌名）
//   · 诗经 ← 诗经/shijing.json（305 篇）
//   · 楚辞 ← 楚辞/chuci.json（65 篇）
//   · 论语 ← 论语/lunyu.json（20 篇）
//   落盘时经 OpenCC 繁转简；其中《静夜思》一条源数据收的是宋本《乐府诗集》
//   系统文字（床前看月光／举头望山月），本站按现代通行本
//   （床前明月光／举头望明月）校订此一条，特此注明。
// - 成语：GitHub 开源库 pwxcoo/chinese-xinhua（MIT License）data/idiom.json
//   （30,895 条；只保留 词/拼音/释义/出处 四字段，源数据本身为简体）。
// 古籍原文均为公版内容。

import tangData from "./data/poetry/tang.json";
import ciData from "./data/poetry/ci.json";
import shijingData from "./data/poetry/shijing.json";
import chuciData from "./data/poetry/chuci.json";
import lunyuData from "./data/poetry/lunyu.json";
import idiomData from "./data/poetry/idiom.json";

export type PoetryBook = "tang" | "ci" | "shijing" | "chuci" | "lunyu";

export interface Poem {
  id: string;
  book: PoetryBook;
  title: string;
  author: string;
  dynasty: string;
  extra: string; // 词牌 / 诗经分类 / 楚辞篇目等
  lines: string[];
}

export interface Idiom {
  word: string;
  pinyin: string;
  explanation: string;
  derivation: string;
}

interface RawPoem {
  title: string;
  author: string;
  extra?: string;
  lines: string[];
}

const BOOK_META: Record<PoetryBook, { dynasty: string }> = {
  tang: { dynasty: "唐" },
  ci: { dynasty: "宋" },
  shijing: { dynasty: "先秦" },
  chuci: { dynasty: "战国" },
  lunyu: { dynasty: "春秋" },
};

function buildBook(book: PoetryBook, raw: RawPoem[]): Poem[] {
  return raw.map((p, i) => ({
    id: `${book}-${i}`,
    book,
    title: p.title,
    author: p.author ?? "",
    dynasty: BOOK_META[book].dynasty,
    extra: p.extra ?? "",
    lines: p.lines,
  }));
}

export const POEMS: Poem[] = [
  ...buildBook("tang", tangData as RawPoem[]),
  ...buildBook("ci", ciData as RawPoem[]),
  ...buildBook("shijing", shijingData as RawPoem[]),
  ...buildBook("chuci", chuciData as RawPoem[]),
  ...buildBook("lunyu", lunyuData as RawPoem[]),
];

const POEM_MAP = new Map(POEMS.map((p) => [p.id, p]));

export const IDIOMS: Idiom[] = idiomData as Idiom[];
const IDIOM_MAP = new Map(IDIOMS.map((e) => [e.word, e]));

export const BOOK_ORDER: PoetryBook[] = ["tang", "ci", "shijing", "chuci", "lunyu"];

export function poetryStats() {
  const books = BOOK_ORDER.map((b) => ({
    book: b,
    dynasty: BOOK_META[b].dynasty,
    count: POEMS.filter((p) => p.book === b).length,
  }));
  return { books, poemTotal: POEMS.length, idiomTotal: IDIOMS.length };
}

export const PAGE_SIZE = 10;

// ---------- 诗词检索 ----------
export interface PoemSummary {
  id: string;
  book: PoetryBook;
  title: string;
  author: string;
  dynasty: string;
  extra: string;
  firstLine: string;
  lineCount: number;
}

function summarize(p: Poem): PoemSummary {
  return {
    id: p.id,
    book: p.book,
    title: p.title,
    author: p.author,
    dynasty: p.dynasty,
    extra: p.extra,
    firstLine: p.lines[0] ?? "",
    lineCount: p.lines.length,
  };
}

export function searchPoems(opts: { q: string; book: string; page: number }) {
  const q = opts.q.trim();
  const book = BOOK_ORDER.includes(opts.book as PoetryBook) ? (opts.book as PoetryBook) : null;
  let pool = book ? POEMS.filter((p) => p.book === book) : POEMS;
  if (q) {
    pool = pool.filter(
      (p) => p.title.includes(q) || p.author.includes(q) || p.lines.some((l) => l.includes(q))
    );
  }
  const total = pool.length;
  const page = Math.max(1, opts.page);
  const items = pool.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(summarize);
  return { total, page, pageSize: PAGE_SIZE, items };
}

export function getPoem(id: string): Poem | null {
  return POEM_MAP.get(id) ?? null;
}

// ---------- 成语词典 ----------
export function searchIdioms(opts: { q: string; page: number }) {
  const q = opts.q.trim();
  if (!q) return { total: 0, page: 1, pageSize: PAGE_SIZE, items: [] as Idiom[] };
  const wordHits: Idiom[] = [];
  const explHits: Idiom[] = [];
  for (const e of IDIOMS) {
    if (e.word.includes(q)) wordHits.push(e);
    else if (e.explanation.includes(q)) explHits.push(e);
  }
  // 词面命中在前（完全一致 > 开头 > 包含），释义命中在后
  wordHits.sort((a, b) => {
    const rank = (w: string) => (w === q ? 0 : w.startsWith(q) ? 1 : 2);
    return rank(a.word) - rank(b.word);
  });
  const all = [...wordHits, ...explHits];
  const total = all.length;
  const page = Math.max(1, opts.page);
  return { total, page, pageSize: PAGE_SIZE, items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

export function getIdiom(word: string): Idiom | null {
  return IDIOM_MAP.get(word) ?? null;
}

// ---------- 成语接龙 ----------
// 拼音归一化：去声调，用于「同音字」模式比较首/尾音节。
const TONE_MAP: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a", ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i", ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u", ǖ: "v", ǘ: "v", ǚ: "v", ǜ: "v", ü: "v",
};
export function plainSyllable(s: string): string {
  return s.split("").map((c) => TONE_MAP[c] ?? c).join("").toLowerCase();
}
function firstSyllable(e: Idiom): string {
  return plainSyllable((e.pinyin || "").split(/\s+/)[0] ?? "");
}
function lastSyllable(e: Idiom): string {
  const parts = (e.pinyin || "").split(/\s+/).filter(Boolean);
  return plainSyllable(parts[parts.length - 1] ?? "");
}

export type ChainMode = "same" | "pinyin";

export function chainCandidates(word: string, mode: ChainMode, exclude: string[]): Idiom[] {
  const cur = IDIOM_MAP.get(word);
  if (!cur) return [];
  const used = new Set(exclude);
  const lastChar = word[word.length - 1];
  const lastSyl = lastSyllable(cur);
  return IDIOMS.filter((e) => {
    if (e.word === word || used.has(e.word)) return false;
    if (mode === "same") return e.word[0] === lastChar;
    return firstSyllable(e) === lastSyl && firstSyllable(e) !== "";
  });
}

export function chainNext(word: string, mode: ChainMode, exclude: string[]) {
  const cur = IDIOM_MAP.get(word);
  if (!cur) return { ok: false as const, reason: "not-in-dict" as const };
  const cands = chainCandidates(word, mode, exclude);
  if (cands.length === 0) return { ok: true as const, found: false as const, from: cur };
  const pick = cands[Math.floor(Math.random() * cands.length)];
  return { ok: true as const, found: true as const, from: cur, next: pick, candidateCount: cands.length };
}

export function chainHint(word: string, mode: ChainMode, exclude: string[]) {
  const cands = chainCandidates(word, mode, exclude);
  return { count: cands.length, sample: cands.slice(0, 3).map((e) => e.word) };
}

// ---------- 猜诗词 ----------
// 把每篇按标点切成「句」，取相邻两句为一题：给上句、选下句。
// 干扰项取同一典籍里其它篇目的「下一句」，保证体裁与难度相近。
function clausesOf(p: Poem): string[] {
  const out: string[] = [];
  for (const line of p.lines) {
    for (const part of line.split(/[，。；？！、：·…—]+/)) {
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

interface QuizItem {
  poem: Poem;
  given: string;
  answer: string;
}

function buildQuizPool(): QuizItem[] {
  const items: QuizItem[] = [];
  for (const p of POEMS) {
    if (p.book === "lunyu") continue; // 论语是散文语录，不入猜诗词题库
    const cs = clausesOf(p);
    for (let i = 0; i + 1 < cs.length; i++) {
      // 只取「上句」长度 >= 3 的题，避免碎句
      if (cs[i].length >= 3 && cs[i + 1].length >= 3) {
        items.push({ poem: p, given: cs[i], answer: cs[i + 1] });
      }
    }
  }
  return items;
}
const QUIZ_POOL = buildQuizPool();
// 同典籍的「下一句」集合，给干扰项抽样
const ANSWERS_BY_BOOK = new Map<PoetryBook, string[]>();
for (const it of QUIZ_POOL) {
  const arr = ANSWERS_BY_BOOK.get(it.poem.book) ?? [];
  arr.push(it.answer);
  ANSWERS_BY_BOOK.set(it.poem.book, arr);
}

export function makeQuiz() {
  const item = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
  const pool = (ANSWERS_BY_BOOK.get(item.poem.book) ?? []).filter((a) => a !== item.answer);
  const distractors = new Set<string>();
  while (distractors.size < 3 && pool.length > 0) {
    distractors.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  const options = [item.answer, ...distractors];
  // 洗牌
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    poemId: item.poem.id,
    book: item.poem.book,
    title: item.poem.title,
    author: item.poem.author,
    dynasty: item.poem.dynasty,
    given: item.given,
    options,
    answerIndex: options.indexOf(item.answer),
  };
}
