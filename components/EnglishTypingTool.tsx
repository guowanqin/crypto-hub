"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { WORD_PACKS, SENTENCE_PACKS, type EtWord, type EtSentence } from "@/lib/english-typing-data";
import {
  ET_STR,
  STORAGE_KEY,
  emptyProgress,
  loadProgress,
  saveProgress,
  itemState,
  gradeItem,
  levelOf,
  xpForNextLevel,
  normAnswer,
  splitChunks,
  splitSentences,
  firstLetterHint,
  todayKey,
  yesterdayKey,
  type EtProgress,
  type ItemState,
  type CustomSentencePack,
} from "@/lib/english-typing";

type Tab = "words" | "sentences" | "review" | "book" | "mine" | "stats";
type WordMode = "spell" | "dict" | "self";
type SentenceMode = "word" | "chunk" | "full";
type StatusFilter = "all" | "new" | "learning" | "mastered" | "wrong";

interface SessionItem {
  key: string;
  kind: "word" | "sentence";
  word?: EtWord;
  sentence?: EtSentence;
  packId: string;
}

const WORD_MODES: WordMode[] = ["spell", "dict", "self"];
const SENT_MODES: SentenceMode[] = ["word", "chunk", "full"];
const PAGE = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sentenceTokens(en: string): string[] {
  return en.split(/\s+/).filter(Boolean);
}

function tokenCore(tok: string): string {
  return tok.replace(/[^A-Za-z'-]/g, "");
}

export default function EnglishTypingTool() {
  const { lang } = useLang();
  const t = (k: keyof typeof ET_STR) => ET_STR[k][lang];

  const [prog, setProg] = useState<EtProgress | null>(null);
  const [tab, setTab] = useState<Tab>("words");

  // 单词浏览
  const [wPack, setWPack] = useState("daily");
  const [wMode, setWMode] = useState<WordMode>("spell");
  const [wStatus, setWStatus] = useState<StatusFilter>("all");
  const [wSearch, setWSearch] = useState("");
  const [wShown, setWShown] = useState(PAGE);

  // 句子浏览
  const [sPack, setSPack] = useState("s1");
  const [sMode, setSMode] = useState<SentenceMode>("word");
  const [sStatus, setSStatus] = useState<StatusFilter>("all");
  const [sSearch, setSSearch] = useState("");
  const [sShown, setSShown] = useState(PAGE);

  // 错词本展开
  const [bookShown, setBookShown] = useState(PAGE);
  const [bookTab, setBookTab] = useState<"wrong" | "fav">("wrong");

  // 会话
  const [session, setSession] = useState<{
    items: SessionItem[];
    idx: number;
    step: number;
    typed: string[];
    input: string;
    phase: "answer" | "feedback";
    lastCorrect: boolean | null;
    firstTry: boolean;
    showHint: boolean;
    showAnswer: boolean;
    done: number;
    correct: number;
    xp: number;
    startedAt: number;
    finished: boolean;
    sMode: SentenceMode;
  } | null>(null);

  const [audioBusy, setAudioBusy] = useState(false);
  const [audioNote, setAudioNote] = useState(false);
  const audioCache = useRef<Map<string, string>>(new Map());

  // 注意：所有 Hook 必须在 if (!prog) 提前返回之前声明，否则 Hook 顺序会变
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (session && session.phase === "answer") {
      inputRef.current?.focus();
    }
  }, [session?.idx, session?.step, session?.phase, session]);

  // 导入
  const [importText, setImportText] = useState("");
  const [importName, setImportName] = useState("");
  const [importList, setImportList] = useState<{ en: string; zh: string }[]>([]);
  const [importMsg, setImportMsg] = useState("");
  const [statsMsg, setStatsMsg] = useState("");

  useEffect(() => {
    setProg(loadProgress());
  }, []);

  useEffect(() => {
    if (prog) saveProgress(prog);
  }, [prog]);

  // ---- 发音：dictionaryapi.dev 取音频，失败用浏览器朗读，再失败显示音标 ----
  async function playWord(word: string) {
    setAudioNote(false);
    const cached = audioCache.current.get(word);
    if (cached) {
      try {
        await new Audio(cached).play();
        return;
      } catch {
        audioCache.current.delete(word);
      }
    }
    setAudioBusy(true);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      let audio = "";
      for (const entry of data) {
        for (const ph of entry.phonetics ?? []) {
          if (ph.audio) {
            audio = ph.audio;
            break;
          }
        }
        if (audio) break;
      }
      if (audio) {
        audioCache.current.set(word, audio);
        await new Audio(audio).play();
        return;
      }
      throw new Error("no-audio");
    } catch {
      try {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        setAudioNote(true);
      }
    } finally {
      setAudioBusy(false);
    }
  }

  // ---- 进度更新 ----
  function updateProg(fn: (p: EtProgress) => EtProgress) {
    setProg((prev) => (prev ? fn(prev) : prev));
  }

  function recordAttempt(key: string, ok: boolean, seconds: number) {
    updateProg((p) => {
      const st = itemState(p, key);
      const next: ItemState = {
        ...st,
        seen: st.seen + 1,
        correct: st.correct + (ok ? 1 : 0),
        wrong: st.wrong + (ok ? 0 : 1),
        status: st.status === "new" ? "learning" : st.status,
      };
      const tk = todayKey();
      const day = p.days[tk] ?? { items: 0, correct: 0, seconds: 0 };
      const days = {
        ...p.days,
        [tk]: {
          items: day.items + 1,
          correct: day.correct + (ok ? 1 : 0),
          seconds: day.seconds + seconds,
        },
      };
      const last = p.streak.last;
      const streak =
        last === tk
          ? p.streak
          : last === yesterdayKey()
            ? { last: tk, count: p.streak.count + 1 }
            : { last: tk, count: 1 };
      return { ...p, items: { ...p.items, [key]: next }, days, streak };
    });
  }

  function addXp(n: number) {
    updateProg((p) => ({ ...p, xp: p.xp + n }));
  }

  function markMode(modeId: string) {
    updateProg((p) =>
      p.modesTried.includes(modeId)
        ? p
        : { ...p, modesTried: [...p.modesTried, modeId] }
    );
  }

  function toggleFav(key: string) {
    updateProg((p) => {
      const st = itemState(p, key);
      return { ...p, items: { ...p.items, [key]: { ...st, fav: !st.fav } } };
    });
  }

  function toggleMastered(key: string) {
    updateProg((p) => {
      const st = itemState(p, key);
      const toMastered = st.status !== "mastered";
      return {
        ...p,
        items: {
          ...p.items,
          [key]: { ...st, status: toMastered ? "mastered" : "learning", due: 0, interval: toMastered ? 7 : 0 },
        },
      };
    });
  }

  function clearWrong(key: string) {
    updateProg((p) => {
      const st = itemState(p, key);
      return { ...p, items: { ...p.items, [key]: { ...st, wrong: 0 } } };
    });
  }

  function applyGrade(key: string, grade: "again" | "hard" | "good") {
    updateProg((p) => {
      const st = itemState(p, key);
      return { ...p, items: { ...p.items, [key]: gradeItem(st, grade) } };
    });
  }

  // ---- 会话 ----
  function startSession(items: SessionItem[], modeId: string, sModeOverride?: SentenceMode) {
    if (items.length === 0) return;
    markMode(modeId);
    setSession({
      items: shuffle(items),
      idx: 0,
      step: 0,
      typed: [],
      input: "",
      phase: "answer",
      lastCorrect: null,
      firstTry: true,
      showHint: false,
      showAnswer: false,
      done: 0,
      correct: 0,
      xp: 0,
      startedAt: Date.now(),
      finished: false,
      sMode: sModeOverride ?? sMode,
    });
  }

  function currentTarget(): string {
    if (!session) return "";
    const it = session.items[session.idx];
    if (it.kind === "word") return it.word!.w;
    if (session.sMode === "word") {
      const toks = sentenceTokens(it.sentence!.en).filter((x) => tokenCore(x));
      return tokenCore(toks[Math.min(session.step, toks.length - 1)] ?? "");
    }
    if (session.sMode === "chunk") {
      const ch = splitChunks(it.sentence!.en);
      return ch[Math.min(session.step, ch.length - 1)] ?? "";
    }
    return it.sentence!.en;
  }

  function submitAnswer() {
    if (!session || session.phase !== "answer") return;
    const it = session.items[session.idx];
    const target = currentTarget();
    const ok = normAnswer(session.input) === normAnswer(target);
    const elapsed = Math.min(120, Math.round((Date.now() - session.startedAt) / 1000));
    recordAttempt(it.key, ok, Math.max(1, Math.round(elapsed / Math.max(1, session.items.length))));
    setSession((s) =>
      s
        ? {
            ...s,
            phase: "feedback",
            lastCorrect: ok,
            firstTry: s.firstTry && ok,
            done: s.done + 1,
            correct: s.correct + (ok ? 1 : 0),
          }
        : s
    );
  }

  function revealAnswer() {
    if (!session || session.phase !== "answer") return;
    const it = session.items[session.idx];
    recordAttempt(it.key, false, 5);
    setSession((s) =>
      s ? { ...s, phase: "feedback", lastCorrect: false, firstTry: false, showAnswer: true } : s
    );
  }

  function advance() {
    if (!session) return;
    const it = session.items[session.idx];
    const totalSteps =
      it.kind === "word"
        ? 1
        : session.sMode === "word"
          ? sentenceTokens(it.sentence!.en).filter((x) => tokenCore(x)).length
          : session.sMode === "chunk"
            ? splitChunks(it.sentence!.en).length
            : 1;
    if (session.step + 1 < totalSteps) {
      // 下一步：把刚打对的词/语块记下来
      const done = session.lastCorrect
        ? [...session.typed, session.phase === "feedback" ? currentTarget() : ""].filter(Boolean)
        : session.typed;
      setSession((s) =>
        s ? { ...s, step: s.step + 1, typed: done, input: "", phase: "answer", lastCorrect: null, showAnswer: false } : s
      );
      return;
    }
    // 本题完成：按是否一次答对给经验
    const base = it.kind === "sentence" && session.sMode === "full" ? 15 : 10;
    const xp = session.firstTry ? base + 5 : base;
    addXp(xp);
    setSession((s) => (s ? { ...s, xp: s.xp + xp } : s));
    if (session.idx + 1 >= session.items.length) {
      setSession((s) => (s ? { ...s, finished: true } : s));
      updateProg((p) => {
        const s = session;
        const perfect = s.done > 0 && s.correct === s.done;
        return perfect && p.perfectSessions === 0
          ? { ...p, perfectSessions: 1 }
          : p;
      });
    } else {
      setSession((s) =>
        s
          ? { ...s, idx: s.idx + 1, step: 0, typed: [], input: "", phase: "answer", lastCorrect: null, firstTry: true, showHint: false, showAnswer: false }
          : s
      );
    }
  }

  // ---- 派生数据 ----
  const allSentencePacks = useMemo(() => {
    const custom = (prog?.customPacks ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      desc: `${c.sentences.length} ${t("sentencesUnit")}`,
      sentences: c.sentences,
    }));
    return [...SENTENCE_PACKS, ...custom];
  }, [prog?.customPacks]);

  const wPackWords = useMemo(() => {
    const pack = WORD_PACKS.find((p) => p.id === wPack) ?? WORD_PACKS[0];
    return pack.words.map((w) => ({ w, key: `w:${w.w}` }));
  }, [wPack]);

  const sPackSentences = useMemo(() => {
    const pack = allSentencePacks.find((p) => p.id === sPack) ?? allSentencePacks[0];
    return pack.sentences.map((s, i) => ({ s, key: `s:${pack.id}:${i}` }));
  }, [sPack, allSentencePacks]);

  function filterByStatus<T extends { key: string }>(
    list: T[],
    status: StatusFilter,
    search: string,
    hay: (x: T) => string
  ): T[] {
    if (!prog) return list;
    return list.filter((x) => {
      const st = itemState(prog, x.key);
      if (status === "new" && st.status !== "new") return false;
      if (status === "learning" && st.status !== "learning") return false;
      if (status === "mastered" && st.status !== "mastered") return false;
      if (status === "wrong" && st.wrong === 0) return false;
      if (search && !hay(x).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  const filteredWords = useMemo(
    () => filterByStatus(wPackWords, wStatus, wSearch, (x) => `${x.w.w} ${x.w.zh} ${x.w.ex}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wPackWords, wStatus, wSearch, prog]
  );
  const filteredSentences = useMemo(
    () => filterByStatus(sPackSentences, sStatus, sSearch, (x) => `${x.s.en} ${x.s.zh}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sPackSentences, sStatus, sSearch, prog]
  );

  const dueItems = useMemo(() => {
    if (!prog) return [];
    const now = Date.now();
    const out: SessionItem[] = [];
    for (const pack of WORD_PACKS) {
      for (const w of pack.words) {
        const key = `w:${w.w}`;
        const st = itemState(prog, key);
        if (st.due > 0 && st.due <= now && st.status !== "mastered") {
          out.push({ key, kind: "word", word: w, packId: pack.id });
        }
      }
    }
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        const key = `s:${pack.id}:${i}`;
        const st = itemState(prog, key);
        if (st.due > 0 && st.due <= now && st.status !== "mastered") {
          out.push({ key, kind: "sentence", sentence: s, packId: pack.id });
        }
      });
    }
    out.sort((a, b) => itemState(prog, a.key).due - itemState(prog, b.key).due);
    return out;
  }, [prog, allSentencePacks]);

  const wrongItems = useMemo(() => {
    if (!prog) return [];
    const out: { key: string; kind: "word" | "sentence"; word?: EtWord; sentence?: EtSentence; wrong: number }[] = [];
    for (const pack of WORD_PACKS) {
      for (const w of pack.words) {
        const st = itemState(prog, `w:${w.w}`);
        if (st.wrong > 0) out.push({ key: `w:${w.w}`, kind: "word", word: w, wrong: st.wrong });
      }
    }
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        const st = itemState(prog, `s:${pack.id}:${i}`);
        if (st.wrong > 0) out.push({ key: `s:${pack.id}:${i}`, kind: "sentence", sentence: s, wrong: st.wrong });
      });
    }
    out.sort((a, b) => b.wrong - a.wrong);
    return out;
  }, [prog, allSentencePacks]);

  const favItems = useMemo(() => {
    if (!prog) return [];
    const out: { key: string; kind: "word" | "sentence"; word?: EtWord; sentence?: EtSentence; wrong: number }[] = [];
    for (const pack of WORD_PACKS) {
      for (const w of pack.words) {
        if (itemState(prog, `w:${w.w}`).fav) out.push({ key: `w:${w.w}`, kind: "word", word: w, wrong: 0 });
      }
    }
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        if (itemState(prog, `s:${pack.id}:${i}`).fav) out.push({ key: `s:${pack.id}:${i}`, kind: "sentence", sentence: s, wrong: 0 });
      });
    }
    return out;
  }, [prog, allSentencePacks]);

  if (!prog) {
    return <div className="card"><p className="body-text">…</p></div>;
  }

  const today = prog.days[todayKey()] ?? { items: 0, correct: 0, seconds: 0 };
  const todayAcc = today.items > 0 ? Math.round((today.correct / today.items) * 100) : 0;
  const lv = levelOf(prog.xp);
  const lvProg = xpForNextLevel(prog.xp);

  // ---------- 会话界面 ----------

  function statusBadge(key: string) {
    const st = itemState(prog!, key);
    if (st.status === "mastered") return <span className="et-badge et-badge-mastered">{t("mastered")}</span>;
    if (st.status === "learning") return <span className="et-badge et-badge-learning">{t("learning")}</span>;
    return <span className="et-badge">{t("notLearned")}</span>;
  }

  function renderSession() {
    if (!session) return null;
    if (!prog) return null;
    if (session.finished) {
      const total = session.items.length;
      const acc = session.done > 0 ? Math.round((session.correct / session.done) * 100) : 0;
      const modeId: string =
        session.items.every((i) => i.kind === "word")
          ? wMode
          : session.items.every((i) => i.kind === "sentence")
            ? `s${session.sMode}`
            : "review";
      return (
        <section className="card et-session">
          <h2>{t("sessionDone")}</h2>
          <p className="body-text">
            {t("sessionStats")}：{session.correct}/{session.done}（{acc}%）· {t("xpEarned")} +{session.xp}
          </p>
          <div className="et-row">
            <button
              className="btn primary"
              onClick={() => startSession(session.items, modeId)}
            >
              {t("againBtn")}
            </button>
            <button className="btn ghost" onClick={() => setSession(null)}>
              {t("backToList")}
            </button>
          </div>
        </section>
      );
    }

    const it = session.items[session.idx];
    const isWord = it.kind === "word";
    const mode = isWord ? wMode : session.sMode;
    const totalSteps = isWord
      ? 1
      : session.sMode === "word"
        ? sentenceTokens(it.sentence!.en).filter((x) => tokenCore(x)).length
        : session.sMode === "chunk"
          ? splitChunks(it.sentence!.en).length
          : 1;
    const target = currentTarget();

    // 句子：按当前步骤渲染填空句
    function renderSentencePrompt(sess: NonNullable<typeof session>) {
      const en = it.sentence!.en;
      if (sess.sMode === "full") {
        return (
          <div>
            <p className="et-zh">{it.sentence!.zh}</p>
            {sess.showHint && <p className="et-hint">{firstLetterHint(en)}</p>}
            <button
              className="btn small ghost"
              onClick={() => setSession((s) => (s ? { ...s, showHint: !s.showHint } : s))}
            >
              {sess.showHint ? t("hideHint") : t("showHint")}
            </button>
          </div>
        );
      }
      if (sess.sMode === "chunk") {
        const chunks = splitChunks(en);
        return (
          <div>
            <p className="et-zh">{it.sentence!.zh}</p>
            <p className="et-sentence">
              {chunks.map((c, i) => (
                <span key={i}>
                  {i < sess.step ? (
                    <span className="et-done-chunk">{c}</span>
                  ) : i === sess.step ? (
                    <span className="et-blank">______</span>
                  ) : (
                    <span className="et-todo-chunk">···</span>
                  )}
                  {i < chunks.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
            <p className="et-step">
              {t("chunkOf")} {sess.step + 1} {t("chunkOf2")} {chunks.length} {t("chunkOf3")}
            </p>
          </div>
        );
      }
      const toks = sentenceTokens(en);
      const coreIdx: number[] = [];
      toks.forEach((tok, i) => {
        if (tokenCore(tok)) coreIdx.push(i);
      });
      const cur = coreIdx[Math.min(sess.step, coreIdx.length - 1)];
      return (
        <div>
          <p className="et-zh">{it.sentence!.zh}</p>
          <p className="et-sentence">
            {toks.map((tok, i) => (
              <span key={i}>
                {i === cur ? (
                  <span className="et-blank">______</span>
                ) : (
                  <span className={i < cur && coreIdx.includes(i) ? "et-done-chunk" : ""}>{tok}</span>
                )}{" "}
              </span>
            ))}
          </p>
          <p className="et-step">
            {t("chunkOf")} {sess.step + 1} {t("chunkOf2")} {coreIdx.length} {t("chunkOf3")}
          </p>
        </div>
      );
    }

    return (
      <section className="card et-session">
        <p className="et-progress-line">
          {t("itemOf")} {session.idx + 1} {t("itemOf2")} {session.items.length} {t("itemOf3")}
          {totalSteps > 1 ? ` · ${t("chunkOf")} ${session.step + 1} / ${totalSteps}` : ""}
          {" · "}
          {t("accuracy")} {session.done > 0 ? Math.round((session.correct / session.done) * 100) : 100}% · {t("xpLabel")} +{session.xp}
        </p>

        {isWord ? (
          <div>
            {mode === "spell" && (
              <div>
                <p className="et-word">{it.word!.w}</p>
                <p className="et-ipa">{it.word!.ipa}</p>
                <p className="et-zh">{it.word!.zh}</p>
                <p className="et-ex">{it.word!.ex}</p>
                <p className="et-ex-zh">{it.word!.exzh}</p>
              </div>
            )}
            {mode === "dict" && (
              <div>
                <p className="et-zh">{t("meaningIs")}：{it.word!.zh}</p>
                <p className="body-text">{t("listenFirst")}</p>
                <div className="et-row">
                  <button className="btn" onClick={() => playWord(it.word!.w)} disabled={audioBusy}>
                    🔊 {audioBusy ? "…" : t("listen")}
                  </button>
                  <button className="btn ghost" onClick={() => playWord(it.word!.w)} disabled={audioBusy}>
                    {t("listenAgain")}
                  </button>
                </div>
                {audioNote && <p className="et-note">{t("pronUnavailable")}</p>}
                <p className="et-ipa">{it.word!.ipa}</p>
              </div>
            )}
            {mode === "self" && (
              <div>
                <p className="et-zh">{t("meaningIs")}：{it.word!.zh}</p>
                <p className="et-ex">{t("example")}：{it.word!.exzh}</p>
              </div>
            )}
          </div>
        ) : (
          renderSentencePrompt(session)
        )}

        {session.phase === "answer" ? (
          <div>
            <input
              ref={inputRef}
              className="et-input"
              value={session.input}
              placeholder={
                isWord
                  ? t("typeWordHere")
                  : session.sMode === "word"
                    ? t("typeWordHere")
                    : session.sMode === "chunk"
                      ? t("typeChunkHere")
                      : t("typeSentenceHere")
              }
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setSession((s) => (s ? { ...s, input: e.target.value } : s))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (session.input.trim()) submitAnswer();
                }
              }}
            />
            <div className="et-row">
              <button
                className="btn primary"
                disabled={!session.input.trim()}
                onClick={submitAnswer}
              >
                {t("checkAnswer")}（Enter）
              </button>
              <button className="btn ghost" onClick={revealAnswer}>
                {t("showAnswer")}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className={session.lastCorrect ? "et-ok" : "et-bad"}>
              {session.lastCorrect ? `✓ ${t("correct")}` : `✗ ${t("wrong")}`}
              {session.firstTry && session.lastCorrect ? ` · ${t("firstTry")}` : ""}
            </p>
            <p className="body-text">
              {t("correctIs")}：<strong>{target}</strong>
            </p>
            {!session.lastCorrect && (
              <p className="body-text">
                {t("yourAnswer")}：{session.input || "—"}
              </p>
            )}
            {isWord && (
              <p className="et-ex">
                {t("example")}：{it.word!.ex}（{it.word!.exzh}）
              </p>
            )}
            {!isWord && <p className="et-ex">{t("grammarNote")}：{it.sentence!.note}</p>}
            {session.step + 1 < totalSteps ? (
              <div className="et-row">
                <button className="btn primary" onClick={advance}>
                  {t("nextItem")}
                </button>
              </div>
            ) : (
              <div>
                <p className="et-note">{t("gradeHint")}</p>
                <div className="et-row">
                  <button
                    className="btn"
                    onClick={() => {
                      applyGrade(it.key, "again");
                      advance();
                    }}
                  >
                    {t("gradeAgain")}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      applyGrade(it.key, "hard");
                      advance();
                    }}
                  >
                    {t("gradeHard")}
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => {
                      applyGrade(it.key, "good");
                      advance();
                    }}
                  >
                    {t("gradeGood")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="et-row et-item-actions">
          <button className="btn small ghost" onClick={() => toggleFav(it.key)}>
            {itemState(prog, it.key).fav ? `★ ${t("unfavorite")}` : `☆ ${t("favorite")}`}
          </button>
          <button className="btn small ghost" onClick={() => toggleMastered(it.key)}>
            {itemState(prog, it.key).status === "mastered" ? t("unmaster") : t("markMastered")}
          </button>
        </div>
      </section>
    );
  }

  // ---------- 单词浏览 ----------
  function renderWordsTab() {
    if (!prog) return null;
    const pack = WORD_PACKS.find((p) => p.id === wPack) ?? WORD_PACKS[0];
    const shown = filteredWords.slice(0, wShown);
    const remaining = filteredWords.length - shown.length;
    const statusFilters: { id: StatusFilter; label: string }[] = [
      { id: "all", label: t("all") },
      { id: "new", label: t("notLearned") },
      { id: "learning", label: t("learning") },
      { id: "mastered", label: t("mastered") },
      { id: "wrong", label: t("wrongOnly") },
    ];
    return (
      <div>
        <div className="et-chips">
          {WORD_PACKS.map((p) => (
            <button
              key={p.id}
              className={`btn small ${wPack === p.id ? "primary" : "ghost"}`}
              onClick={() => {
                setWPack(p.id);
                setWShown(PAGE);
              }}
            >
              {p.name}（{p.words.length}）
            </button>
          ))}
        </div>
        <p className="body-text">{pack.desc}</p>
        <div className="et-chips">
          {WORD_MODES.map((m) => (
            <button
              key={m}
              className={`btn small ${wMode === m ? "primary" : "ghost"}`}
              onClick={() => setWMode(m)}
            >
              {m === "spell" ? t("modeSpell") : m === "dict" ? t("modeDict") : t("modeSelf")}
            </button>
          ))}
        </div>
        <div className="et-chips">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              className={`btn small ${wStatus === f.id ? "primary" : "ghost"}`}
              onClick={() => {
                setWStatus(f.id);
                setWShown(PAGE);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="et-input"
          value={wSearch}
          placeholder={t("searchPh")}
          onChange={(e) => {
            setWSearch(e.target.value);
            setWShown(PAGE);
          }}
        />
        <div className="et-row">
          <button
            className="btn primary"
            disabled={filteredWords.length === 0}
            onClick={() =>
              startSession(
                filteredWords.map((x) => ({ key: x.key, kind: "word" as const, word: x.w, packId: wPack })),
                wMode
              )
            }
          >
            {t("startPractice")}（{filteredWords.length}）
          </button>
        </div>
        {filteredWords.length === 0 ? (
          <p className="body-text">{t("noResult")}</p>
        ) : (
          <ul className="et-list">
            {shown.map((x, i) => {
              const st = itemState(prog, x.key);
              return (
                <li key={x.key} className="et-list-item">
                  <div className="et-list-main">
                    <span className="et-word-sm">{x.w.w}</span>
                    <span className="et-ipa-sm">{x.w.ipa}</span>
                    <span>{x.w.zh}</span>
                    {statusBadge(x.key)}
                    {st.wrong > 0 && (
                      <span className="et-wrong-count">
                        {t("wrongCount")} {st.wrong} {t("timesUnit")}
                      </span>
                    )}
                  </div>
                  <div className="et-list-actions">
                    <button
                      className="btn small"
                      onClick={() => {
                        const rest = filteredWords.slice(i);
                        startSession(
                          rest.map((y) => ({ key: y.key, kind: "word" as const, word: y.w, packId: wPack })),
                          wMode
                        );
                      }}
                    >
                      {t("practiceFromHere")}
                    </button>
                    <button className="btn small ghost" onClick={() => toggleFav(x.key)}>
                      {st.fav ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {remaining > 0 && (
          <button className="btn" onClick={() => setWShown((n) => n + PAGE)}>
            {t("showMore")}（{t("remaining")} {remaining} {t("ofTotal")}）
          </button>
        )}
        {wShown > PAGE && filteredWords.length > PAGE && (
          <button className="btn ghost" onClick={() => setWShown(PAGE)}>
            {t("collapse")}
          </button>
        )}
      </div>
    );
  }

  // ---------- 句子浏览 ----------
  function renderSentencesTab() {
    if (!prog) return null;
    const pack = allSentencePacks.find((p) => p.id === sPack) ?? allSentencePacks[0];
    const shown = filteredSentences.slice(0, sShown);
    const remaining = filteredSentences.length - shown.length;
    const statusFilters: { id: StatusFilter; label: string }[] = [
      { id: "all", label: t("all") },
      { id: "new", label: t("notLearned") },
      { id: "learning", label: t("learning") },
      { id: "mastered", label: t("mastered") },
      { id: "wrong", label: t("wrongOnly") },
    ];
    return (
      <div>
        <div className="et-chips">
          {allSentencePacks.map((p) => (
            <button
              key={p.id}
              className={`btn small ${sPack === p.id ? "primary" : "ghost"}`}
              onClick={() => {
                setSPack(p.id);
                setSShown(PAGE);
              }}
            >
              {p.name}（{p.sentences.length}）
            </button>
          ))}
        </div>
        <p className="body-text">{pack.desc}</p>
        <div className="et-chips">
          {SENT_MODES.map((m) => (
            <button
              key={m}
              className={`btn small ${sMode === m ? "primary" : "ghost"}`}
              onClick={() => setSMode(m)}
            >
              {m === "word" ? t("modeSWord") : m === "chunk" ? t("modeSChunk") : t("modeSFull")}
            </button>
          ))}
        </div>
        <div className="et-chips">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              className={`btn small ${sStatus === f.id ? "primary" : "ghost"}`}
              onClick={() => {
                setSStatus(f.id);
                setSShown(PAGE);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="et-input"
          value={sSearch}
          placeholder={t("searchPh")}
          onChange={(e) => {
            setSSearch(e.target.value);
            setSShown(PAGE);
          }}
        />
        <div className="et-row">
          <button
            className="btn primary"
            disabled={filteredSentences.length === 0}
            onClick={() =>
              startSession(
                filteredSentences.map((x) => ({ key: x.key, kind: "sentence" as const, sentence: x.s, packId: sPack })),
                `s${sMode}`
              )
            }
          >
            {t("startPractice")}（{filteredSentences.length}）
          </button>
        </div>
        {filteredSentences.length === 0 ? (
          <p className="body-text">{t("noResult")}</p>
        ) : (
          <ul className="et-list">
            {shown.map((x, i) => {
              const st = itemState(prog, x.key);
              return (
                <li key={x.key} className="et-list-item">
                  <div className="et-list-main et-sentence-row">
                    <span className="et-sent-en">{x.s.en}</span>
                    <span>{x.s.zh}</span>
                    {statusBadge(x.key)}
                    {st.wrong > 0 && (
                      <span className="et-wrong-count">
                        {t("wrongCount")} {st.wrong} {t("timesUnit")}
                      </span>
                    )}
                  </div>
                  <div className="et-list-actions">
                    <button
                      className="btn small"
                      onClick={() => {
                        const rest = filteredSentences.slice(i);
                        startSession(
                          rest.map((y) => ({ key: y.key, kind: "sentence" as const, sentence: y.s, packId: sPack })),
                          `s${sMode}`
                        );
                      }}
                    >
                      {t("practiceFromHere")}
                    </button>
                    <button className="btn small ghost" onClick={() => toggleFav(x.key)}>
                      {st.fav ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {remaining > 0 && (
          <button className="btn" onClick={() => setSShown((n) => n + PAGE)}>
            {t("showMore")}（{t("remaining")} {remaining} {t("ofTotal")}）
          </button>
        )}
        {sShown > PAGE && filteredSentences.length > PAGE && (
          <button className="btn ghost" onClick={() => setSShown(PAGE)}>
            {t("collapse")}
          </button>
        )}
      </div>
    );
  }

  // ---------- 记忆复习 ----------
  function renderReviewTab() {
    if (!prog) return null;
    const shown = dueItems.slice(0, PAGE);
    return (
      <div>
        <p className="body-text">
          {t("reviewDue")}：{dueItems.length} {t("ofTotal")}
        </p>
        {dueItems.length === 0 ? (
          <p className="body-text">{t("reviewEmpty")}</p>
        ) : (
          <div>
            <div className="et-row">
              <button
                className="btn primary"
                onClick={() => {
                  setWMode("self");
                  startSession(dueItems, "review", "full");
                }}
              >
                {t("reviewStart")}（{dueItems.length}）
              </button>
            </div>
            <ul className="et-list">
              {shown.map((x) => {
                const st = itemState(prog, x.key);
                return (
                  <li key={x.key} className="et-list-item">
                    <div className="et-list-main">
                      <span>{x.kind === "word" ? x.word!.w : x.sentence!.en}</span>
                      <span>{x.kind === "word" ? x.word!.zh : x.sentence!.zh}</span>
                      <span className="et-note">
                        {t("dueIn")}：{new Date(st.due).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <p className="body-text">{t("gradeHint")}</p>
      </div>
    );
  }

  // ---------- 错词本 ----------
  function renderBookTab() {
    if (!prog) return null;
    const shownWrong = wrongItems.slice(0, bookShown);
    const remaining = wrongItems.length - shownWrong.length;
    const list = bookTab === "wrong" ? wrongItems : favItems;
    return (
      <div>
        <div className="et-chips">
          <button
            className={`btn small ${bookTab === "wrong" ? "primary" : "ghost"}`}
            onClick={() => setBookTab("wrong")}
          >
            {t("wrongOnly")}（{wrongItems.length}）
          </button>
          <button
            className={`btn small ${bookTab === "fav" ? "primary" : "ghost"}`}
            onClick={() => setBookTab("fav")}
          >
            {t("favorites")}（{favItems.length}）
          </button>
        </div>
        {bookTab === "wrong" && wrongItems.length > 0 && (
          <div className="et-row">
            <button
              className="btn primary"
              onClick={() => {
                setWMode("self");
                startSession(
                  wrongItems.map((x) => ({
                    key: x.key,
                    kind: x.kind,
                    word: x.word,
                    sentence: x.sentence,
                    packId: "",
                  })),
                  "review",
                  "full"
                );
              }}
            >
              {t("practiceWrong")}（{wrongItems.length}）
            </button>
          </div>
        )}
        {list.length === 0 ? (
          <p className="body-text">{bookTab === "wrong" ? t("weakestEmpty") : t("noResult")}</p>
        ) : (
          <ul className="et-list">
            {(bookTab === "wrong" ? shownWrong : list).map((x) => (
              <li key={x.key} className="et-list-item">
                <div className="et-list-main">
                  <span>{x.kind === "word" ? x.word!.w : x.sentence!.en}</span>
                  <span>{x.kind === "word" ? x.word!.zh : x.sentence!.zh}</span>
                  {bookTab === "wrong" && (
                    <span className="et-wrong-count">
                      {t("wrongCount")} {x.wrong} {t("timesUnit")}
                    </span>
                  )}
                </div>
                <div className="et-list-actions">
                  <button
                    className="btn small"
                    onClick={() => {
                      setWMode("self");
                      startSession(
                        [{ key: x.key, kind: x.kind, word: x.word, sentence: x.sentence, packId: "" }],
                        "review",
                        "full"
                      );
                    }}
                  >
                    {t("practiceFromHere")}
                  </button>
                  {bookTab === "wrong" ? (
                    <button className="btn small ghost" onClick={() => clearWrong(x.key)}>
                      {t("removeWrong")}
                    </button>
                  ) : (
                    <button className="btn small ghost" onClick={() => toggleFav(x.key)}>
                      {t("unfavorite")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {bookTab === "wrong" && remaining > 0 && (
          <button className="btn" onClick={() => setBookShown((n) => n + PAGE)}>
            {t("showMore")}（{t("remaining")} {remaining} {t("ofTotal")}）
          </button>
        )}
        {bookTab === "wrong" && bookShown > PAGE && wrongItems.length > PAGE && (
          <button className="btn ghost" onClick={() => setBookShown(PAGE)}>
            {t("collapse")}
          </button>
        )}
      </div>
    );
  }

  // ---------- 我的词包 ----------
  function renderMineTab() {
    if (!prog) return null;
    return (
      <div>
        <h3 className="sub-title">{t("importTitle")}</h3>
        <p className="body-text">{t("importDesc")}</p>
        <p className="et-note">{t("noAiNote")}</p>
        <textarea
          className="et-textarea"
          rows={5}
          value={importText}
          placeholder={t("importPh")}
          onChange={(e) => setImportText(e.target.value)}
        />
        <div className="et-row">
          <button
            className="btn primary"
            onClick={() => {
              const parts = splitSentences(importText);
              if (parts.length === 0) {
                setImportMsg(t("importEmpty"));
                return;
              }
              setImportList(parts.map((en) => ({ en, zh: "" })));
              setImportMsg("");
            }}
          >
            {t("importSplit")}
          </button>
        </div>
        {importMsg && <p className="et-bad">{importMsg}</p>}
        {importList.length > 0 && (
          <div>
            <input
              className="et-input"
              value={importName}
              placeholder={t("importNamePh")}
              onChange={(e) => setImportName(e.target.value)}
            />
            <ul className="et-list">
              {importList.map((s, i) => (
                <li key={i} className="et-list-item">
                  <div className="et-list-main et-sentence-row">
                    <span className="et-sent-en">{s.en}</span>
                    <input
                      className="et-input et-inline-input"
                      value={s.zh}
                      placeholder={t("translation")}
                      onChange={(e) =>
                        setImportList((prev) =>
                          prev.map((p, j) => (j === i ? { ...p, zh: e.target.value } : p))
                        )
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="et-row">
              <button
                className="btn primary"
                onClick={() => {
                  if (!importName.trim()) {
                    setImportMsg(t("importNeedName"));
                    return;
                  }
                  const pack: CustomSentencePack = {
                    id: `c${Date.now()}`,
                    name: importName.trim(),
                    sentences: importList.map((s) => ({ en: s.en, zh: s.zh, note: "" })),
                  };
                  updateProg((p) => ({ ...p, customPacks: [...p.customPacks, pack] }));
                  setImportText("");
                  setImportName("");
                  setImportList([]);
                  setImportMsg("");
                  setSPack(pack.id);
                  setTab("sentences");
                }}
              >
                {t("importSave")}（{importList.length}）
              </button>
            </div>
          </div>
        )}
        <h3 className="sub-title">{t("myPacks")}</h3>
        {prog.customPacks.length === 0 ? (
          <p className="body-text">{t("myPacksEmpty")}</p>
        ) : (
          <ul className="et-list">
            {prog.customPacks.map((c) => (
              <li key={c.id} className="et-list-item">
                <div className="et-list-main">
                  <span>
                    {c.name}（{c.sentences.length} {t("sentencesUnit")}）
                  </span>
                </div>
                <div className="et-list-actions">
                  <button
                    className="btn small"
                    onClick={() => {
                      setSPack(c.id);
                      setTab("sentences");
                    }}
                  >
                    {t("practicePack")}
                  </button>
                  <button
                    className="btn small ghost"
                    onClick={() => {
                      if (!window.confirm(t("deletePackConfirm"))) return;
                      updateProg((p) => {
                        const items = { ...p.items };
                        c.sentences.forEach((_, i) => {
                          delete items[`s:${c.id}:${i}`];
                        });
                        return {
                          ...p,
                          customPacks: p.customPacks.filter((x) => x.id !== c.id),
                          items,
                        };
                      });
                    }}
                  >
                    {t("deletePack")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ---------- 学习报告 ----------

  function renderStatsTab() {
    if (!prog) return null;
    const last7: { date: string; items: number; correct: number; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = todayKey(d);
      const day = prog.days[k] ?? { items: 0, correct: 0, seconds: 0 };
      last7.push({ date: k.slice(5), items: day.items, correct: day.correct, minutes: Math.round(day.seconds / 60) });
    }
    const totalSeen = Object.values(prog.items).reduce((a, s) => a + s.seen, 0);
    const firstPackDone = WORD_PACKS.some((p) => p.words.every((w) => itemState(prog, `w:${w.w}`).seen > 0));
    const allModes = ["spell", "dict", "self", "sword", "schunk", "sfull"].every((m) =>
      prog.modesTried.includes(m)
    );
    const achievements = [
      { id: "firstPack", label: t("achFirstPack"), done: firstPackDone },
      { id: "streak7", label: t("achStreak7"), done: prog.streak.count >= 7 },
      { id: "100", label: t("ach100"), done: totalSeen >= 100 },
      { id: "perfect", label: t("achPerfect"), done: prog.perfectSessions >= 1 },
      { id: "allModes", label: t("achAllModes"), done: allModes },
    ];
    const weakestWords = wrongItems.filter((x) => x.kind === "word").slice(0, 5);
    const maxDay = Math.max(1, ...last7.map((d) => d.items));

    return (
      <div>
        <div className="et-stats-grid">
          <div className="et-stat">
            <div className="et-stat-num">{today.items}</div>
            <div>{t("todayItems")}</div>
          </div>
          <div className="et-stat">
            <div className="et-stat-num">{todayAcc}%</div>
            <div>{t("accuracy")}</div>
          </div>
          <div className="et-stat">
            <div className="et-stat-num">
              {t("levelLabel")} {lv}
            </div>
            <div>
              {t("xpLabel")} {prog.xp}
              {lvProg.next !== null
                ? `（${t("levelLabel")} ${lv + 1}：${lvProg.cur}/${lvProg.next}）`
                : ""}
            </div>
          </div>
          <div className="et-stat">
            <div className="et-stat-num">{prog.streak.count}</div>
            <div>{t("streakLabel")}</div>
          </div>
        </div>
        <div className="et-level-bar">
          <div
            className="et-level-fill"
            style={{
              width: lvProg.next === null ? "100%" : `${Math.min(100, Math.round((lvProg.cur / lvProg.next) * 100))}%`,
            }}
          />
        </div>

        <h3 className="sub-title">{t("weekTitle")}</h3>
        <ul className="et-list">
          {last7.map((d) => (
            <li key={d.date} className="et-list-item">
              <div className="et-list-main">
                <span>{d.date}</span>
                <span className="et-bar" style={{ width: `${Math.max(4, Math.round((d.items / maxDay) * 120))}px` }} />
                <span>
                  {d.items} {t("ofTotal")} · {d.minutes} min
                </span>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="sub-title">{t("weakest")}</h3>
        {weakestWords.length === 0 ? (
          <p className="body-text">{t("weakestEmpty")}</p>
        ) : (
          <ul className="et-list">
            {weakestWords.map((x) => (
              <li key={x.key} className="et-list-item">
                <div className="et-list-main">
                  <span>{x.word!.w}</span>
                  <span>{x.word!.zh}</span>
                  <span className="et-wrong-count">
                    {t("wrongCount")} {x.wrong} {t("timesUnit")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="sub-title">{t("achTitle")}</h3>
        <ul className="et-list">
          {achievements.map((a) => (
            <li key={a.id} className="et-list-item">
              <div className="et-list-main">
                <span>{a.done ? "🏅" : "🔒"}</span>
                <span>{a.label}</span>
                <span>{a.done ? t("unlocked") : t("locked")}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="et-row">
          <button
            className="btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(prog, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "english-typing-progress.json";
              a.click();
              URL.revokeObjectURL(url);
              setStatsMsg(t("exportDone"));
            }}
          >
            {t("exportBtn")}
          </button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>
            {t("importBtn")}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              if (!window.confirm(t("resetConfirm"))) return;
              const fresh = emptyProgress();
              setProg(fresh);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
              } catch {
                // 忽略
              }
            }}
          >
            {t("resetBtn")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const p = JSON.parse(String(reader.result)) as EtProgress;
                  if (!p || typeof p !== "object" || !p.items || typeof p.xp !== "number") {
                    throw new Error("bad");
                  }
                  setProg({ ...emptyProgress(), ...p });
                  setStatsMsg(t("importDone"));
                } catch {
                  setStatsMsg(t("importFail"));
                }
              };
              reader.readAsText(f);
              e.target.value = "";
            }}
          />
        </div>
        {statsMsg && <p className="body-text">{statsMsg}</p>}
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "words", label: t("tabWords") },
    { id: "sentences", label: t("tabSentences") },
    { id: "review", label: `${t("tabReview")}（${dueItems.length}）` },
    { id: "book", label: t("tabBook") },
    { id: "mine", label: t("tabMine") },
    { id: "stats", label: t("tabStats") },
  ];

  return (
    <div className="et-tool">
      <div className="et-tabs">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            className={`btn small ${tab === tb.id ? "primary" : "ghost"}`}
            onClick={() => {
              setTab(tb.id);
              setSession(null);
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>
      {session
        ? renderSession()
        : tab === "words"
          ? renderWordsTab()
          : tab === "sentences"
            ? renderSentencesTab()
            : tab === "review"
              ? renderReviewTab()
              : tab === "book"
                ? renderBookTab()
                : tab === "mine"
                  ? renderMineTab()
                  : renderStatsTab()}
      <p className="et-note" style={{ marginTop: 16 }}>
        {t("sourceNote")}
      </p>
    </div>
  );
}
