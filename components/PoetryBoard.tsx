"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HUB_DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

type Book = "tang" | "ci" | "shijing" | "chuci" | "lunyu";
type Tab = "search" | "idiom" | "chain" | "quiz";
type ChainMode = "same" | "pinyin";

interface BookStat {
  book: Book;
  dynasty: string;
  count: number;
}
interface MetaResp {
  ok: boolean;
  books: BookStat[];
  poemTotal: number;
  idiomTotal: number;
}
interface PoemSummary {
  id: string;
  book: Book;
  title: string;
  author: string;
  dynasty: string;
  extra: string;
  firstLine: string;
  lineCount: number;
}
interface PoemFull extends PoemSummary {
  lines: string[];
}
interface SearchResp {
  ok: boolean;
  total: number;
  page: number;
  pageSize: number;
  items: PoemSummary[];
}
interface IdiomEntry {
  word: string;
  pinyin: string;
  explanation: string;
  derivation: string;
}
interface IdiomResp {
  ok: boolean;
  total: number;
  page: number;
  pageSize: number;
  items: IdiomEntry[];
}
interface QuizData {
  poemId: string;
  book: Book;
  title: string;
  author: string;
  dynasty: string;
  given: string;
  options: string[];
  answerIndex: number;
}

// 拼音去声调（客户端校验接龙规则用；与服务端 lib/poetry.ts 同一口径）
const TONE_MAP: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a", ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i", ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u", ǖ: "v", ǘ: "v", ǚ: "v", ǜ: "v", ü: "v",
};
function plainSyllable(s: string): string {
  return s.split("").map((c) => TONE_MAP[c] ?? c).join("").toLowerCase();
}
function firstSyllableOf(pinyin: string): string {
  return plainSyllable((pinyin || "").split(/\s+/)[0] ?? "");
}
function lastSyllableOf(pinyin: string): string {
  const parts = (pinyin || "").split(/\s+/).filter(Boolean);
  return plainSyllable(parts[parts.length - 1] ?? "");
}

export const POETRY_DICT: Record<
  Lang,
  {
    boardKicker: string;
    toolsTitle: string;
    metaLine: string; // {poems} {idioms}
    tabs: Record<Tab, string>;
    bookNames: Record<Book, string>;
    allBooks: string;
    searchPlaceholder: string;
    searchBtn: string;
    loading: string;
    loadError: string;
    noResult: string;
    resultMeta: string; // {total} {page} {pages}
    prevPage: string;
    nextPage: string;
    readerHint: string;
    byAuthor: string; // {dynasty} {author}
    idiomPlaceholder: string;
    idiomIntro: string;
    idiomPinyin: string;
    idiomExpl: string;
    idiomFrom: string;
    startChain: string;
    chainIntro: string;
    chainModeSame: string;
    chainModePinyin: string;
    chainStartPlaceholder: string;
    chainPlayPlaceholder: string; // {char}
    chainStartBtn: string;
    chainPlayBtn: string;
    chainRestart: string;
    chainHintBtn: string;
    chainGiveUp: string;
    chainYou: string;
    chainSystem: string;
    chainScore: string; // {steps} {streak}
    chainNotInDict: string;
    chainRuleFail: string;
    chainSystemWin: string;
    chainUserWin: string;
    chainHintText: string; // {n} {samples}
    chainHintNone: string;
    chainGivenUp: string; // {steps}
    chainNeedStart: string;
    quizIntro: string;
    quizGivenLabel: string;
    quizNext: string;
    quizStart: string;
    quizScore: string; // {right} {total}
    quizCorrect: string;
    quizWrong: string; // {answer}
    quizFrom: string; // {title} {author} {dynasty}
    quizReadFull: string;
    quizHideFull: string;
    scopeTitle: string;
    scopeParas: string[];
    sourceTitle: string;
    sourceParas: string[];
    wendianLink: string;
  }
> = {
  zh: {
    boardKicker: "古籍诗词精选 · 站内可用",
    toolsTitle: "古籍诗词 · 本类工具",
    metaLine: "本站精选收录诗词典籍 {poems} 篇 · 成语 {idioms} 条，全部在本站内查、在本站内玩。",
    tabs: { search: "诗词检索", idiom: "成语词典", chain: "成语接龙", quiz: "猜诗词" },
    bookNames: { tang: "唐诗", ci: "宋词", shijing: "诗经", chuci: "楚辞", lunyu: "论语" },
    allBooks: "全部",
    searchPlaceholder: "搜标题、作者或正文，如：李白 / 明月光",
    searchBtn: "搜索",
    loading: "加载中…",
    loadError: "数据加载失败，请稍后重试。",
    noResult: "没有找到匹配的内容，换个关键词试试。",
    resultMeta: "共 {total} 条 · 第 {page}/{pages} 页",
    prevPage: "上一页",
    nextPage: "下一页",
    readerHint: "点任意一条查看全文",
    byAuthor: "{dynasty} · {author}",
    idiomPlaceholder: "搜成语或释义关键词，如：一心一意",
    idiomIntro: "输入成语（或释义里的关键词）查拼音、释义与出处；点词条旁的按钮可以直接拿它开一局接龙。",
    idiomPinyin: "拼音",
    idiomExpl: "释义",
    idiomFrom: "出处",
    startChain: "用它接龙",
    chainIntro:
      "规则：你先出一个成语（必须在词库中），系统接一个以下一条规则开头的成语，再轮到你接；同字模式要求首字与上一条末字相同，同音模式要求首字读音与上一条末字读音相同（不计声调）。接不上可以求提示或认输，系统接不上算你赢。",
    chainModeSame: "同字接龙",
    chainModePinyin: "同音接龙",
    chainStartPlaceholder: "输入一个成语开局，如：一心一意",
    chainPlayPlaceholder: "接「{char}」开头的成语",
    chainStartBtn: "开局",
    chainPlayBtn: "接！",
    chainRestart: "重新开始",
    chainHintBtn: "提示",
    chainGiveUp: "认输",
    chainYou: "你",
    chainSystem: "系统",
    chainScore: "已进行 {steps} 步 · 你成功接上 {streak} 次",
    chainNotInDict: "「{word}」不在词库里，换一个成语试试。",
    chainRuleFail: "接不上：这一条不符合当前接龙规则（看上一条的末字/末字读音）。",
    chainSystemWin: "系统接出「{word}」，轮到你了。",
    chainUserWin: "系统接不上了——这一局你赢了！",
    chainHintText: "还能接 {n} 条，例如：{samples}",
    chainHintNone: "这个字（音）开头的成语已经没有没用过的了。",
    chainGivenUp: "已认输。本局你共成功接上 {steps} 次。",
    chainNeedStart: "先输入一个成语开局。",
    quizIntro: "给出一句诗词，从四个选项里选出它的下一句。干扰项都来自同一部典籍，答完揭晓出处，可以读全篇。",
    quizGivenLabel: "上一句",
    quizNext: "下一题",
    quizStart: "开始答题",
    quizScore: "得分 {right} / {total}",
    quizCorrect: "答对了！",
    quizWrong: "答错了，下一句是「{answer}」。",
    quizFrom: "出自《{title}》{author}（{dynasty}）",
    quizReadFull: "读全篇",
    quizHideFull: "收起全篇",
    scopeTitle: "精选版的定位与边界（先说清）",
    scopeParas: [
      "本站做的是「常用精选版」：唐诗三百首、宋词三百首、诗经、楚辞、论语五部常用典籍加一部成语词典，够日常查询、背诵和玩接龙、猜诗词。原站那种 85 万首古诗词、2 万部古籍、700 部中医古籍的全量库不在本站——要查全量古籍、中医古籍或做全文检索，请去文籍典册原站。",
      "界面可以中英切换，但典籍原文保持中文原样；论语是散文语录，只参与检索阅读，不进猜诗词题库。",
    ],
    sourceTitle: "数据来源与口径",
    sourceParas: [
      "诗词数据来自 GitHub 开源库 chinese-poetry（MIT 许可）：唐诗三百首 366 条、宋词三百首 280 条（源数据无独立标题，标题取词牌名）、诗经 305 篇、楚辞 65 篇、论语 20 篇，共 1,036 篇；成语数据来自 GitHub 开源库 chinese-xinhua 的成语库（MIT 许可）30,895 条，只保留词、拼音、释义、出处四个字段。古籍原文均为公版内容。",
      "落盘处理说明：诗词统一经 OpenCC 由繁体转为简体；《静夜思》一条，源数据收的是宋本《乐府诗集》系统文字（床前看月光／举头望山月），本站按现代通行本（床前明月光／举头望明月）校订此一条。全部语料只经本站接口按页下发，不整包发给浏览器，运行时不调用任何外部接口。",
    ],
    wendianLink: "去文籍典册原站查全量 →",
  },
  en: {
    boardKicker: "Classical Poetry Picks · Built-in",
    toolsTitle: "Classical Poetry · Tools in this shelf",
    metaLine: "A curated in-site collection: {poems} classical texts and {idioms} idioms — search, read and play, all on this site.",
    tabs: { search: "Search poems", idiom: "Idiom dictionary", chain: "Idiom chain", quiz: "Guess the next line" },
    bookNames: { tang: "Tang poems", ci: "Song ci", shijing: "Book of Songs", chuci: "Verses of Chu", lunyu: "Analects" },
    allBooks: "All",
    searchPlaceholder: "Search title, author or text, e.g. 李白 / 明月光",
    searchBtn: "Search",
    loading: "Loading…",
    loadError: "Failed to load data. Please retry later.",
    noResult: "No matches. Try another keyword.",
    resultMeta: "{total} results · page {page}/{pages}",
    prevPage: "Prev",
    nextPage: "Next",
    readerHint: "Click any entry to read the full text",
    byAuthor: "{dynasty} · {author}",
    idiomPlaceholder: "Search an idiom or a meaning keyword",
    idiomIntro: "Look up an idiom's pinyin, meaning and source. Use the button on an entry to start an idiom-chain game with it.",
    idiomPinyin: "Pinyin",
    idiomExpl: "Meaning",
    idiomFrom: "Source",
    startChain: "Start chain",
    chainIntro:
      "Rules: you open with any idiom from the dictionary; the system answers with an idiom that starts with your last character (same-character mode) or with the same sound as your last character (homophone mode, tones ignored). Then it's your turn again. Ask for a hint or concede if you're stuck — if the system can't answer, you win.",
    chainModeSame: "Same character",
    chainModePinyin: "Homophone",
    chainStartPlaceholder: "Open with an idiom, e.g. 一心一意",
    chainPlayPlaceholder: "An idiom starting with “{char}”",
    chainStartBtn: "Start",
    chainPlayBtn: "Play",
    chainRestart: "Restart",
    chainHintBtn: "Hint",
    chainGiveUp: "Give up",
    chainYou: "You",
    chainSystem: "System",
    chainScore: "{steps} moves played · you chained {streak} times",
    chainNotInDict: "“{word}” is not in the dictionary. Try another idiom.",
    chainRuleFail: "That doesn't chain: it breaks the current rule (check the previous idiom's last character / sound).",
    chainSystemWin: "System played “{word}”. Your turn.",
    chainUserWin: "The system is stuck — you win this round!",
    chainHintText: "{n} options left, e.g. {samples}",
    chainHintNone: "No unused idiom starts with that character (sound).",
    chainGivenUp: "Conceded. You chained {steps} times this game.",
    chainNeedStart: "Open with an idiom first.",
    quizIntro: "Given one line of a poem, pick its next line from four options. Distractors come from the same collection. The source is revealed after each answer, and you can read the whole poem.",
    quizGivenLabel: "The line",
    quizNext: "Next question",
    quizStart: "Start",
    quizScore: "Score {right} / {total}",
    quizCorrect: "Correct!",
    quizWrong: "Not quite — the next line is “{answer}”.",
    quizFrom: "From 《{title}》 by {author} ({dynasty})",
    quizReadFull: "Read the poem",
    quizHideFull: "Hide the poem",
    scopeTitle: "What this is — and isn't",
    scopeParas: [
      "This is a curated edition for everyday use: the 300 Tang Poems, 300 Song Ci, the Book of Songs, the Verses of Chu and the Analects, plus an idiom dictionary — enough for lookup, recitation, idiom chains and line-guessing games. The original site's full library (850k+ poems, 20k+ classics, 700 medical classics) is not here; for full-text searching of the complete corpus, use the Wendian site itself.",
      "The interface switches between Chinese and English, but the classical texts stay in Chinese. The Analects is prose, so it is searchable and readable but not used in the guessing game.",
    ],
    sourceTitle: "Data sources & caliber",
    sourceParas: [
      "Poetry data comes from the open-source chinese-poetry repository on GitHub (MIT): 366 Tang-poem entries, 280 Song-ci entries (the source has no separate titles, so the tune pattern is used as the title), 305 Book of Songs pieces, 65 Verses of Chu pieces and 20 Analects chapters — 1,036 texts in total. Idioms come from the chinese-xinhua repository's idiom dataset (MIT): 30,895 entries, keeping only word, pinyin, meaning and source. All classical texts are public-domain works.",
      "Processing notes: the poems were converted from traditional to simplified Chinese with OpenCC when the data was vendored in. One entry, 静夜思, follows a Song-dynasty textual variant in the source (床前看月光 / 举头望山月); it has been aligned to the modern standard text (床前明月光 / 举头望明月) for this one entry. The corpus is served page-by-page through this site's own API only — never as a full download, and with no runtime calls to outside services.",
    ],
    wendianLink: "Search the full library on Wendian →",
  },
};

interface ChainMove {
  entry: IdiomEntry;
  by: "user" | "system";
}

export default function PoetryBoard() {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = POETRY_DICT[lang];

  const [meta, setMeta] = useState<MetaResp | null>(null);
  const [metaError, setMetaError] = useState(false);
  const [tab, setTab] = useState<Tab>("search");

  // ---- 诗词检索 ----
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [book, setBook] = useState<string>("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<SearchResp | null>(null);
  const [searching, setSearching] = useState(false);
  const [reader, setReader] = useState<PoemFull | null>(null);

  // ---- 成语词典 ----
  const [iq, setIq] = useState("");
  const [debouncedIq, setDebouncedIq] = useState("");
  const [ipage, setIpage] = useState(1);
  const [idioms, setIdioms] = useState<IdiomResp | null>(null);
  const [isearching, setIsearching] = useState(false);

  // ---- 成语接龙 ----
  const [chainMode, setChainModeState] = useState<ChainMode>("same");
  const [moves, setMoves] = useState<ChainMove[]>([]);
  const [chainInput, setChainInput] = useState("");
  const [chainMsg, setChainMsg] = useState("");
  const [chainOver, setChainOver] = useState(false);
  const [chainBusy, setChainBusy] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const movesRef = useRef<ChainMove[]>([]);
  movesRef.current = moves;

  // ---- 猜诗词 ----
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ right: 0, total: 0 });
  const [quizPoem, setQuizPoem] = useState<PoemFull | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/poetry?mode=meta")
      .then((r) => r.json())
      .then((j: MetaResp) => {
        if (cancelled) return;
        if (j.ok) setMeta(j);
        else setMetaError(true);
      })
      .catch(() => !cancelled && setMetaError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tm = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(tm);
  }, [q]);

  useEffect(() => {
    const tm = setTimeout(() => {
      setDebouncedIq(iq);
      setIpage(1);
    }, 350);
    return () => clearTimeout(tm);
  }, [iq]);

  const runSearch = useCallback(() => {
    setSearching(true);
    const params = new URLSearchParams({
      mode: "search",
      q: debouncedQ,
      book,
      page: String(page),
    });
    fetch(`/api/poetry?${params}`)
      .then((r) => r.json())
      .then((j: SearchResp) => {
        if (j.ok) setSearch(j);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debouncedQ, book, page]);

  useEffect(() => {
    if (tab === "search") runSearch();
  }, [tab, runSearch]);

  const runIdiomSearch = useCallback(() => {
    if (!debouncedIq.trim()) {
      setIdioms(null);
      return;
    }
    setIsearching(true);
    const params = new URLSearchParams({
      mode: "idiom",
      q: debouncedIq,
      page: String(ipage),
    });
    fetch(`/api/poetry?${params}`)
      .then((r) => r.json())
      .then((j: IdiomResp) => {
        if (j.ok) setIdioms(j);
      })
      .catch(() => {})
      .finally(() => setIsearching(false));
  }, [debouncedIq, ipage]);

  useEffect(() => {
    if (tab === "idiom") runIdiomSearch();
  }, [tab, runIdiomSearch]);

  const openPoem = (id: string, setFn: (p: PoemFull | null) => void) => {
    fetch(`/api/poetry?mode=read&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((j: { ok: boolean; poem?: PoemFull }) => {
        if (j.ok && j.poem) setFn(j.poem);
      })
      .catch(() => {});
  };

  const pages = search ? Math.max(1, Math.ceil(search.total / search.pageSize)) : 1;
  const ipages = idioms ? Math.max(1, Math.ceil(idioms.total / idioms.pageSize)) : 1;

  // ---- 接龙逻辑 ----
  const systemMove = async (hist: ChainMove[], mode: ChainMode) => {
    const tail = hist[hist.length - 1].entry.word;
    const used = hist.map((m) => m.entry.word).join(",");
    const params = new URLSearchParams({ mode: "chain", word: tail, cmode: mode, used });
    try {
      const j = await (await fetch(`/api/poetry?${params}`)).json();
      if (j.ok && j.found) {
        setMoves([...hist, { entry: j.next, by: "system" }]);
        setChainMsg(d.chainSystemWin.replace("{word}", j.next.word));
      } else {
        setChainOver(true);
        setChainMsg(d.chainUserWin);
      }
    } catch {
      setChainMsg(d.loadError);
    }
    setChainBusy(false);
  };

  const fetchIdiom = async (word: string): Promise<IdiomEntry | null> => {
    try {
      const j = await (
        await fetch(`/api/poetry?mode=idiom&word=${encodeURIComponent(word)}`)
      ).json();
      return j.ok ? (j.entry as IdiomEntry) : null;
    } catch {
      return null;
    }
  };

  const startChain = async (word: string) => {
    const w = word.trim();
    if (!w) {
      setChainMsg(d.chainNeedStart);
      return;
    }
    setChainBusy(true);
    const entry = await fetchIdiom(w);
    if (!entry) {
      setChainMsg(d.chainNotInDict.replace("{word}", w));
      setChainBusy(false);
      return;
    }
    const hist: ChainMove[] = [{ entry, by: "user" }];
    setMoves(hist);
    setChainOver(false);
    setUserStreak(0);
    setChainInput("");
    setChainMsg("");
    await systemMove(hist, chainMode);
  };

  const playChain = async () => {
    const w = chainInput.trim();
    const hist = movesRef.current;
    if (!w || hist.length === 0) return;
    setChainBusy(true);
    const entry = await fetchIdiom(w);
    if (!entry) {
      setChainMsg(d.chainNotInDict.replace("{word}", w));
      setChainBusy(false);
      return;
    }
    const prev = hist[hist.length - 1].entry;
    const ruleOk =
      chainMode === "same"
        ? entry.word[0] === prev.word[prev.word.length - 1]
        : firstSyllableOf(entry.pinyin) !== "" &&
          firstSyllableOf(entry.pinyin) === lastSyllableOf(prev.pinyin);
    if (!ruleOk || hist.some((m) => m.entry.word === entry.word)) {
      setChainMsg(d.chainRuleFail);
      setChainBusy(false);
      return;
    }
    const next: ChainMove[] = [...hist, { entry, by: "user" }];
    setMoves(next);
    setUserStreak((s) => s + 1);
    setChainInput("");
    setChainMsg("");
    await systemMove(next, chainMode);
  };

  const hintChain = async () => {
    const hist = movesRef.current;
    if (hist.length === 0) return;
    const tail = hist[hist.length - 1].entry.word;
    const used = hist.map((m) => m.entry.word).join(",");
    const params = new URLSearchParams({ mode: "hint", word: tail, cmode: chainMode, used });
    try {
      const j = await (await fetch(`/api/poetry?${params}`)).json();
      if (j.ok) {
        setChainMsg(
          j.count > 0
            ? d.chainHintText.replace("{n}", String(j.count)).replace("{samples}", (j.sample as string[]).join("、"))
            : d.chainHintNone
        );
      }
    } catch {
      setChainMsg(d.loadError);
    }
  };

  const giveUpChain = () => {
    setChainOver(true);
    setChainMsg(d.chainGivenUp.replace("{steps}", String(userStreak)));
  };

  const switchChainMode = (m: ChainMode) => {
    setChainModeState(m);
    setMoves([]);
    setChainOver(false);
    setChainMsg("");
    setUserStreak(0);
    setChainInput("");
  };

  // ---- 猜诗词逻辑 ----
  const loadQuiz = async () => {
    setQuizBusy(true);
    setPicked(null);
    setQuizPoem(null);
    try {
      const j = await (await fetch("/api/poetry?mode=quiz")).json();
      if (j.ok) setQuiz(j.quiz as QuizData);
    } catch {
      setChainMsg(d.loadError);
    }
    setQuizBusy(false);
  };

  const pickQuiz = (idx: number) => {
    if (picked !== null || !quiz) return;
    setPicked(idx);
    setQuizScore((s) => ({
      right: s.right + (idx === quiz.answerIndex ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const lastMove = moves[moves.length - 1];
  const playPlaceholderChar = lastMove
    ? chainMode === "same"
      ? lastMove.entry.word[lastMove.entry.word.length - 1]
      : lastSyllableOf(lastMove.entry.pinyin)
    : "";

  return (
    <>
      <section className="ft-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">
            {meta
              ? d.metaLine
                  .replace("{poems}", meta.poemTotal.toLocaleString())
                  .replace("{idioms}", meta.idiomTotal.toLocaleString())
              : metaError
                ? d.loadError
                : d.loading}
          </p>
        </div>

        <div className="poe-tabs" role="tablist">
          {(Object.keys(d.tabs) as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`poe-tab${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {d.tabs[key]}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <div>
            <div className="slang-chiprow" style={{ marginBottom: 10 }}>
              <button
                type="button"
                className={`poe-chip${book === "" ? " is-active" : ""}`}
                onClick={() => {
                  setBook("");
                  setPage(1);
                }}
              >
                {d.allBooks}
                {meta ? ` · ${meta.poemTotal}` : ""}
              </button>
              {meta?.books.map((b) => (
                <button
                  key={b.book}
                  type="button"
                  className={`poe-chip${book === b.book ? " is-active" : ""}`}
                  onClick={() => {
                    setBook(b.book);
                    setPage(1);
                  }}
                >
                  {d.bookNames[b.book]} · {b.count}
                </button>
              ))}
            </div>
            <div className="slang-search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={d.searchPlaceholder}
                aria-label={d.searchBtn}
              />
            </div>
            {searching && <p className="burn-note">{d.loading}</p>}
            {search && search.total === 0 && <p className="burn-note">{d.noResult}</p>}
            {search && search.total > 0 && (
              <>
                <p className="slang-result-meta">
                  {d.resultMeta
                    .replace("{total}", String(search.total))
                    .replace("{page}", String(search.page))
                    .replace("{pages}", String(pages))}
                  {" · "}
                  {d.readerHint}
                </p>
                <div className="poe-list">
                  {search.items.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`poe-item${reader?.id === p.id ? " is-active" : ""}`}
                      onClick={() => openPoem(p.id, setReader)}
                    >
                      <span className="poe-item-title">
                        《{p.title}》
                        <span className="poe-item-meta">
                          {d.byAuthor
                            .replace("{dynasty}", p.dynasty)
                            .replace("{author}", p.author || "—")}
                          {p.extra && p.book !== "ci" ? ` · ${p.extra}` : ""}
                          {p.book === "ci" ? ` · ${d.bookNames.ci}` : ` · ${d.bookNames[p.book]}`}
                        </span>
                      </span>
                      <span className="poe-item-first">{p.firstLine}</span>
                    </button>
                  ))}
                </div>
                <div className="poe-pager">
                  <button
                    type="button"
                    className="btn ghost small"
                    disabled={page <= 1}
                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                  >
                    {d.prevPage}
                  </button>
                  <button
                    type="button"
                    className="btn ghost small"
                    disabled={page >= pages}
                    onClick={() => setPage((v) => Math.min(pages, v + 1))}
                  >
                    {d.nextPage}
                  </button>
                </div>
              </>
            )}
            {reader && (
              <article className="poe-reader">
                <h3 className="poe-reader-title">《{reader.title}》</h3>
                <p className="poe-reader-meta">
                  {d.byAuthor
                    .replace("{dynasty}", reader.dynasty)
                    .replace("{author}", reader.author || "—")}
                  {reader.extra ? ` · ${reader.extra}` : ""}
                </p>
                <div className="poe-reader-body">
                  {reader.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </article>
            )}
          </div>
        )}

        {tab === "idiom" && (
          <div>
            <p className="burn-note" style={{ marginBottom: 10 }}>
              {d.idiomIntro}
            </p>
            <div className="slang-search">
              <input
                value={iq}
                onChange={(e) => setIq(e.target.value)}
                placeholder={d.idiomPlaceholder}
                aria-label={d.tabs.idiom}
              />
            </div>
            {isearching && <p className="burn-note">{d.loading}</p>}
            {idioms && idioms.total === 0 && <p className="burn-note">{d.noResult}</p>}
            {idioms && idioms.total > 0 && (
              <>
                <p className="slang-result-meta">
                  {d.resultMeta
                    .replace("{total}", String(idioms.total))
                    .replace("{page}", String(idioms.page))
                    .replace("{pages}", String(ipages))}
                </p>
                <div className="poe-list">
                  {idioms.items.map((e) => (
                    <div key={e.word} className="poe-idiom">
                      <div className="poe-idiom-head">
                        <span className="poe-idiom-word">{e.word}</span>
                        {e.pinyin && (
                          <span className="poe-idiom-pinyin">
                            {d.idiomPinyin}：{e.pinyin}
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn ghost small poe-idiom-btn"
                          onClick={() => {
                            setTab("chain");
                            void startChain(e.word);
                          }}
                        >
                          {d.startChain}
                        </button>
                      </div>
                      <p className="poe-idiom-line">
                        <strong>{d.idiomExpl}：</strong>
                        {e.explanation}
                      </p>
                      {e.derivation && (
                        <p className="poe-idiom-line">
                          <strong>{d.idiomFrom}：</strong>
                          {e.derivation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="poe-pager">
                  <button
                    type="button"
                    className="btn ghost small"
                    disabled={ipage <= 1}
                    onClick={() => setIpage((v) => Math.max(1, v - 1))}
                  >
                    {d.prevPage}
                  </button>
                  <button
                    type="button"
                    className="btn ghost small"
                    disabled={ipage >= ipages}
                    onClick={() => setIpage((v) => Math.min(ipages, v + 1))}
                  >
                    {d.nextPage}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "chain" && (
          <div>
            <p className="burn-note" style={{ marginBottom: 10 }}>
              {d.chainIntro}
            </p>
            <div className="slang-chiprow" style={{ marginBottom: 10 }}>
              <button
                type="button"
                className={`poe-chip${chainMode === "same" ? " is-active" : ""}`}
                onClick={() => switchChainMode("same")}
              >
                {d.chainModeSame}
              </button>
              <button
                type="button"
                className={`poe-chip${chainMode === "pinyin" ? " is-active" : ""}`}
                onClick={() => switchChainMode("pinyin")}
              >
                {d.chainModePinyin}
              </button>
            </div>
            {moves.length === 0 ? (
              <div className="slang-search">
                <input
                  value={chainInput}
                  onChange={(e) => setChainInput(e.target.value)}
                  placeholder={d.chainStartPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void startChain(chainInput);
                  }}
                />
                <button
                  type="button"
                  className="slang-btn"
                  disabled={chainBusy}
                  onClick={() => void startChain(chainInput)}
                >
                  {d.chainStartBtn}
                </button>
              </div>
            ) : (
              <>
                <div className="poe-chain-list">
                  {moves.map((m, i) => (
                    <div key={i} className={`poe-chain-move is-${m.by}`}>
                      <span className="poe-chain-who">
                        {m.by === "user" ? d.chainYou : d.chainSystem}
                      </span>
                      <span className="poe-chain-word">{m.entry.word}</span>
                      <span className="poe-chain-pinyin">{m.entry.pinyin}</span>
                    </div>
                  ))}
                </div>
                <p className="slang-result-meta">
                  {d.chainScore
                    .replace("{steps}", String(moves.length))
                    .replace("{streak}", String(userStreak))}
                </p>
                {!chainOver && (
                  <div className="slang-search">
                    <input
                      value={chainInput}
                      onChange={(e) => setChainInput(e.target.value)}
                      placeholder={d.chainPlayPlaceholder.replace("{char}", playPlaceholderChar)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void playChain();
                      }}
                    />
                    <button
                      type="button"
                      className="slang-btn"
                      disabled={chainBusy}
                      onClick={() => void playChain()}
                    >
                      {d.chainPlayBtn}
                    </button>
                  </div>
                )}
                <div className="poe-chain-actions">
                  {!chainOver && (
                    <>
                      <button type="button" className="btn ghost small" onClick={() => void hintChain()}>
                        {d.chainHintBtn}
                      </button>
                      <button type="button" className="btn ghost small" onClick={giveUpChain}>
                        {d.chainGiveUp}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => {
                      setMoves([]);
                      setChainOver(false);
                      setChainMsg("");
                      setUserStreak(0);
                      setChainInput("");
                    }}
                  >
                    {d.chainRestart}
                  </button>
                </div>
              </>
            )}
            {chainBusy && <p className="burn-note">{d.loading}</p>}
            {chainMsg && <p className="poe-chain-msg">{chainMsg}</p>}
          </div>
        )}

        {tab === "quiz" && (
          <div>
            <p className="burn-note" style={{ marginBottom: 10 }}>
              {d.quizIntro}
            </p>
            {!quiz ? (
              <button type="button" className="btn primary" disabled={quizBusy} onClick={() => void loadQuiz()}>
                {d.quizStart}
              </button>
            ) : (
              <div className="poe-quiz">
                <p className="slang-result-meta">
                  {d.quizScore
                    .replace("{right}", String(quizScore.right))
                    .replace("{total}", String(quizScore.total))}
                </p>
                <p className="poe-quiz-given">
                  <span className="poe-quiz-label">{d.quizGivenLabel}</span>
                  {quiz.given}，
                </p>
                <div className="poe-quiz-options">
                  {quiz.options.map((opt, i) => {
                    const isAnswer = i === quiz.answerIndex;
                    const isPicked = picked === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={picked !== null}
                        className={`poe-quiz-opt${picked !== null && isAnswer ? " is-right" : ""}${isPicked && !isAnswer ? " is-wrong" : ""}`}
                        onClick={() => pickQuiz(i)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <div className="poe-quiz-reveal">
                    <p className="poe-chain-msg">
                      {picked === quiz.answerIndex
                        ? d.quizCorrect
                        : d.quizWrong.replace("{answer}", quiz.options[quiz.answerIndex])}
                    </p>
                    <p className="poe-reader-meta">
                      {d.quizFrom
                        .replace("{title}", quiz.title)
                        .replace("{author}", quiz.author || "—")
                        .replace("{dynasty}", quiz.dynasty)}
                    </p>
                    <div className="poe-chain-actions">
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={() => {
                          if (quizPoem) setQuizPoem(null);
                          else openPoem(quiz.poemId, setQuizPoem);
                        }}
                      >
                        {quizPoem ? d.quizHideFull : d.quizReadFull}
                      </button>
                      <button
                        type="button"
                        className="btn primary small"
                        disabled={quizBusy}
                        onClick={() => void loadQuiz()}
                      >
                        {d.quizNext}
                      </button>
                    </div>
                    {quizPoem && (
                      <div className="poe-reader-body" style={{ marginTop: 10 }}>
                        {quizPoem.lines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="burn-notes">
        <div className="card">
          <h2>{d.scopeTitle}</h2>
          {d.scopeParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
          <p className="body-text" style={{ marginTop: 10 }}>
            <Link href="/tool/wendian">{d.wendianLink}</Link>
          </p>
          <p className="body-text" style={{ marginTop: 10 }}>
            {t.disclaimer}
          </p>
        </div>
        <div className="card">
          <h2>{d.sourceTitle}</h2>
          {d.sourceParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
