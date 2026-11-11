"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { SENTENCE_PACKS, PATTERNS, type EtSentence, type EtPattern } from "@/lib/english-typing-data";
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
  splitChineseLines,
  firstLetterHint,
  keywordHints,
  todayKey,
  yesterdayKey,
  type EtProgress,
  type ItemState,
  type CustomSentencePack,
} from "@/lib/english-typing";

type Tab = "make" | "patterns" | "sentences" | "review" | "book" | "mine" | "stats";
type SentenceMode = "word" | "chunk" | "full";
type PracticeMode = "make" | SentenceMode;
type StatusFilter = "all" | "new" | "learning" | "mastered" | "wrong";

interface SessionItem {
  key: string;
  sentence: EtSentence;
  packId: string;
}

interface Lookup {
  word: string;
  ipa: string;
  meanings: string[];
  audio: string;
  loading: boolean;
  error: boolean;
}

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
  const [tab, setTab] = useState<Tab>("make");

  // 造句浏览
  const [mPack, setMPack] = useState("s1");
  const [mStatus, setMStatus] = useState<StatusFilter>("all");
  const [mSearch, setMSearch] = useState("");
  const [mShown, setMShown] = useState(PAGE);
  const [shownEn, setShownEn] = useState<Record<string, boolean>>({});

  // 句子打字浏览
  const [sPack, setSPack] = useState("s1");
  const [sMode, setSMode] = useState<SentenceMode>("word");
  const [sStatus, setSStatus] = useState<StatusFilter>("all");
  const [sSearch, setSSearch] = useState("");
  const [sShown, setSShown] = useState(PAGE);

  // 错句本展开
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
    showKeywords: boolean;
    done: number;
    correct: number;
    xp: number;
    startedAt: number;
    finished: boolean;
    mode: PracticeMode;
    modeId: string;
  } | null>(null);

  const [audioBusy, setAudioBusy] = useState(false);
  const [audioNote, setAudioNote] = useState(false);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const lookupCache = useRef<Map<string, Lookup>>(new Map());

  // 注意：所有 Hook 必须在 if (!prog) 提前返回之前声明，否则 Hook 顺序会变
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (session && session.phase === "answer") {
      inputRef.current?.focus();
    }
  }, [session?.idx, session?.step, session?.phase, session]);

  // 导入
  const [importMode, setImportMode] = useState<"en" | "zh">("en");
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

  // ---- 生词查询：dictionaryapi.dev 取释义与发音，失败用浏览器朗读 ----
  async function lookupWord(word: string) {
    const core = word.replace(/[^A-Za-z'-]/g, "").toLowerCase();
    if (!core) return;
    setAudioNote(false);
    const cached = lookupCache.current.get(core);
    if (cached) {
      setLookup({ ...cached, loading: false, error: false });
      return;
    }
    setLookup({ word: core, ipa: "", meanings: [], audio: "", loading: true, error: false });
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(core)}`
      );
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const entry = data?.[0];
      const ipa: string =
        entry?.phonetic ??
        (entry?.phonetics ?? []).find((p: { text?: string }) => p.text)?.text ??
        "";
      let audio = "";
      for (const ph of entry?.phonetics ?? []) {
        if (ph.audio) {
          audio = ph.audio;
          break;
        }
      }
      const meanings: string[] = [];
      for (const m of entry?.meanings ?? []) {
        for (const d of m.definitions ?? []) {
          if (d.definition) {
            meanings.push(m.partOfSpeech ? `${m.partOfSpeech} · ${d.definition}` : d.definition);
          }
          if (meanings.length >= 3) break;
        }
        if (meanings.length >= 3) break;
      }
      if (meanings.length === 0 && !ipa) throw new Error("empty");
      const def: Lookup = { word: core, ipa, meanings, audio, loading: false, error: false };
      lookupCache.current.set(core, def);
      setLookup(def);
    } catch {
      setLookup({ word: core, ipa: "", meanings: [], audio: "", loading: false, error: true });
    }
  }

  async function playLookupAudio() {
    if (!lookup) return;
    setAudioNote(false);
    if (lookup.audio) {
      setAudioBusy(true);
      try {
        await new Audio(lookup.audio).play();
        return;
      } catch {
        // 掉到浏览器朗读
      } finally {
        setAudioBusy(false);
      }
    }
    try {
      const u = new SpeechSynthesisUtterance(lookup.word);
      u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      setAudioNote(true);
    }
  }

  /** 句子按词渲染，每个词可点查释义。 */
  function renderClickableEn(en: string, anchorKey: string) {
    const toks = sentenceTokens(en);
    return (
      <span>
        {toks.map((tok, i) => (
          <span key={`${anchorKey}-${i}`}>
            <button
              type="button"
              className="et-word-btn"
              title={t("wordLookupTip")}
              onClick={() => lookupWord(tok)}
            >
              {tok}
            </button>
            {i < toks.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );
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
  function startSession(items: SessionItem[], mode: PracticeMode, modeId: string) {
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
      showKeywords: false,
      done: 0,
      correct: 0,
      xp: 0,
      startedAt: Date.now(),
      finished: false,
      mode,
      modeId,
    });
  }

  function currentTarget(): string {
    if (!session) return "";
    const it = session.items[session.idx];
    if (session.mode === "word") {
      const toks = sentenceTokens(it.sentence.en).filter((x) => tokenCore(x));
      return tokenCore(toks[Math.min(session.step, toks.length - 1)] ?? "");
    }
    if (session.mode === "chunk") {
      const ch = splitChunks(it.sentence.en);
      return ch[Math.min(session.step, ch.length - 1)] ?? "";
    }
    return it.sentence.en;
  }

  function totalSteps(): number {
    if (!session) return 1;
    const it = session.items[session.idx];
    if (session.mode === "word") {
      return sentenceTokens(it.sentence.en).filter((x) => tokenCore(x)).length;
    }
    if (session.mode === "chunk") {
      return splitChunks(it.sentence.en).length;
    }
    return 1;
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
      s ? { ...s, phase: "feedback", lastCorrect: false, firstTry: false, showAnswer: false } : s
    );
  }

  function advance() {
    if (!session) return;
    const it = session.items[session.idx];
    const steps = totalSteps();
    if (session.step + 1 < steps) {
      // 下一步：把刚打对的词/语块记下来
      const done = session.lastCorrect
        ? [...session.typed, session.phase === "feedback" ? currentTarget() : ""].filter(Boolean)
        : session.typed;
      setSession((s) =>
        s ? { ...s, step: s.step + 1, typed: done, input: "", phase: "answer", lastCorrect: null } : s
      );
      return;
    }
    // 本题完成：按是否一次答对给经验
    const base = session.mode === "make" || session.mode === "full" ? 15 : 10;
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
          ? { ...s, idx: s.idx + 1, step: 0, typed: [], input: "", phase: "answer", lastCorrect: null, firstTry: true, showHint: false, showKeywords: false }
          : s
      );
    }
  }

  // ---- 派生数据 ----
  const allSentencePacks = useMemo(() => {
    const custom = (prog?.customPacks ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      desc: `${c.sentences.length} ${t("sentencesUnit")}${c.source === "zh" ? ` · ${t("makeOnly")}` : ""}`,
      sentences: c.sentences,
      source: c.source as "en" | "zh",
    }));
    const builtin = SENTENCE_PACKS.map((p) => ({ ...p, source: "en" as const }));
    return [...builtin, ...custom];
  }, [prog?.customPacks]);

  function packSentences(packId: string): { s: EtSentence; key: string }[] {
    const pack = allSentencePacks.find((p) => p.id === packId) ?? allSentencePacks[0];
    return pack.sentences.map((s, i) => ({ s, key: `s:${pack.id}:${i}` }));
  }

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

  const filteredMake = useMemo(
    () => filterByStatus(packSentences(mPack), mStatus, mSearch, (x) => `${x.s.en} ${x.s.zh}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mPack, mStatus, mSearch, prog, allSentencePacks]
  );
  const filteredSentences = useMemo(
    () => filterByStatus(packSentences(sPack), sStatus, sSearch, (x) => `${x.s.en} ${x.s.zh}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sPack, sStatus, sSearch, prog, allSentencePacks]
  );

  const dueItems = useMemo(() => {
    if (!prog) return [];
    const now = Date.now();
    const out: SessionItem[] = [];
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        const key = `s:${pack.id}:${i}`;
        const st = itemState(prog, key);
        if (st.due > 0 && st.due <= now && st.status !== "mastered") {
          out.push({ key, sentence: s, packId: pack.id });
        }
      });
    }
    for (const p of PATTERNS) {
      p.examples.forEach((s, i) => {
        const key = `p:${p.id}:${i}`;
        const st = itemState(prog, key);
        if (st.due > 0 && st.due <= now && st.status !== "mastered") {
          out.push({ key, sentence: s, packId: p.id });
        }
      });
    }
    out.sort((a, b) => itemState(prog, a.key).due - itemState(prog, b.key).due);
    return out;
  }, [prog, allSentencePacks]);

  const wrongItems = useMemo(() => {
    if (!prog) return [];
    const out: { key: string; sentence: EtSentence; wrong: number }[] = [];
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        const st = itemState(prog, `s:${pack.id}:${i}`);
        if (st.wrong > 0) out.push({ key: `s:${pack.id}:${i}`, sentence: s, wrong: st.wrong });
      });
    }
    for (const p of PATTERNS) {
      p.examples.forEach((s, i) => {
        const st = itemState(prog, `p:${p.id}:${i}`);
        if (st.wrong > 0) out.push({ key: `p:${p.id}:${i}`, sentence: s, wrong: st.wrong });
      });
    }
    out.sort((a, b) => b.wrong - a.wrong);
    return out;
  }, [prog, allSentencePacks]);

  const favItems = useMemo(() => {
    if (!prog) return [];
    const out: { key: string; sentence: EtSentence; wrong: number }[] = [];
    for (const pack of allSentencePacks) {
      pack.sentences.forEach((s, i) => {
        if (itemState(prog, `s:${pack.id}:${i}`).fav) {
          out.push({ key: `s:${pack.id}:${i}`, sentence: s, wrong: 0 });
        }
      });
    }
    for (const p of PATTERNS) {
      p.examples.forEach((s, i) => {
        if (itemState(prog, `p:${p.id}:${i}`).fav) {
          out.push({ key: `p:${p.id}:${i}`, sentence: s, wrong: 0 });
        }
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

  function statusBadge(key: string) {
    const st = itemState(prog!, key);
    if (st.status === "mastered") return <span className="et-badge et-badge-mastered">{t("mastered")}</span>;
    if (st.status === "learning") return <span className="et-badge et-badge-learning">{t("learning")}</span>;
    return <span className="et-badge">{t("notLearned")}</span>;
  }

  function statusFiltersRow(status: StatusFilter, setStatus: (v: StatusFilter) => void, onPick: () => void) {
    const filters: { id: StatusFilter; label: string }[] = [
      { id: "all", label: t("all") },
      { id: "new", label: t("notLearned") },
      { id: "learning", label: t("learning") },
      { id: "mastered", label: t("mastered") },
      { id: "wrong", label: t("wrongOnly") },
    ];
    return (
      <div className="et-chips">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`btn small ${status === f.id ? "primary" : "ghost"}`}
            onClick={() => {
              setStatus(f.id);
              onPick();
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    );
  }

  function renderLookupPanel() {
    if (!lookup) return null;
    return (
      <section className="card et-lookup">
        <div className="et-list-main">
          <span className="et-word-sm">{lookup.word}</span>
          {lookup.ipa && <span className="et-ipa-sm">{lookup.ipa}</span>}
          <button className="btn small ghost" onClick={() => setLookup(null)}>
            {t("closeBtn")}
          </button>
        </div>
        {lookup.loading && <p className="body-text">{t("lookupLoading")}</p>}
        {lookup.error && <p className="et-bad">{t("lookupFail")}</p>}
        {!lookup.loading && !lookup.error && (
          <div>
            {lookup.meanings.map((m, i) => (
              <p key={i} className="body-text">
                {t("lookupMeaning")} {i + 1}：{m}
              </p>
            ))}
            <div className="et-row">
              <button className="btn small" onClick={playLookupAudio} disabled={audioBusy}>
                🔊 {audioBusy ? "…" : t("listen")}
              </button>
            </div>
            {audioNote && <p className="et-note">{t("pronUnavailable")}</p>}
          </div>
        )}
      </section>
    );
  }

  // ---------- 会话界面 ----------

  function renderSession() {
    if (!session) return null;
    if (!prog) return null;
    if (session.finished) {
      const acc = session.done > 0 ? Math.round((session.correct / session.done) * 100) : 0;
      return (
        <section className="card et-session">
          <h2>{t("sessionDone")}</h2>
          <p className="body-text">
            {t("sessionStats")}：{session.correct}/{session.done}（{acc}%）· {t("xpEarned")} +{session.xp}
          </p>
          <div className="et-row">
            <button
              className="btn primary"
              onClick={() => startSession(session.items, session.mode, session.modeId)}
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
    const steps = totalSteps();
    const target = currentTarget();

    function renderSentencePrompt(sess: NonNullable<typeof session>) {
      const en = it.sentence.en;
      if (sess.mode === "make") {
        return (
          <div>
            <p className="body-text">{t("makePrompt")}</p>
            <p className="et-zh et-make-zh">{it.sentence.zh}</p>
            {sess.showKeywords && (
              <p className="et-hint">
                {t("keywordsHint")}：{keywordHints(en).join(" · ")}
              </p>
            )}
            {sess.showHint && <p className="et-hint">{firstLetterHint(en)}</p>}
            <div className="et-row">
              <button
                className="btn small ghost"
                onClick={() => setSession((s) => (s ? { ...s, showKeywords: !s.showKeywords } : s))}
              >
                {sess.showKeywords ? t("hideKeywords") : t("showKeywords")}
              </button>
              <button
                className="btn small ghost"
                onClick={() => setSession((s) => (s ? { ...s, showHint: !s.showHint } : s))}
              >
                {sess.showHint ? t("hideHint") : t("showHint")}
              </button>
            </div>
          </div>
        );
      }
      if (sess.mode === "full") {
        return (
          <div>
            <p className="et-zh">{it.sentence.zh}</p>
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
      if (sess.mode === "chunk") {
        const chunks = splitChunks(en);
        return (
          <div>
            <p className="et-zh">{it.sentence.zh}</p>
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
          <p className="et-zh">{it.sentence.zh}</p>
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
          {steps > 1 ? ` · ${t("chunkOf")} ${session.step + 1} / ${steps}` : ""}
          {" · "}
          {t("accuracy")} {session.done > 0 ? Math.round((session.correct / session.done) * 100) : 100}% · {t("xpLabel")} +{session.xp}
        </p>

        {renderSentencePrompt(session)}

        {session.phase === "answer" ? (
          <div>
            <input
              ref={inputRef}
              className="et-input"
              value={session.input}
              placeholder={
                session.mode === "chunk"
                  ? t("typeChunkHere")
                  : session.mode === "word"
                    ? t("typeWordHere")
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
              {t("correctIs")}：<strong>{renderClickableEn(target, `${it.key}-ans`)}</strong>
            </p>
            {!session.lastCorrect && (
              <p className="body-text">
                {t("yourAnswer")}：{session.input || "—"}
              </p>
            )}
            <p className="et-ex">
              {t("grammarNote")}：{it.sentence.note}
            </p>
            <p className="et-note">{t("wordLookupTip")}</p>
            {session.step + 1 < steps ? (
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

  // ---------- 造句 ----------
  function renderMakeTab() {
    if (!prog) return null;
    const pack = allSentencePacks.find((p) => p.id === mPack) ?? allSentencePacks[0];
    const shown = filteredMake.slice(0, mShown);
    const remaining = filteredMake.length - shown.length;
    return (
      <div>
        <p className="body-text">{t("makeIntro")}</p>
        <div className="et-chips">
          {allSentencePacks.map((p) => (
            <button
              key={p.id}
              className={`btn small ${mPack === p.id ? "primary" : "ghost"}`}
              onClick={() => {
                setMPack(p.id);
                setMShown(PAGE);
              }}
            >
              {p.name}（{p.sentences.length}）
            </button>
          ))}
        </div>
        <p className="body-text">{pack.desc}</p>
        {statusFiltersRow(mStatus, setMStatus, () => setMShown(PAGE))}
        <input
          className="et-input"
          value={mSearch}
          placeholder={t("searchPh")}
          onChange={(e) => {
            setMSearch(e.target.value);
            setMShown(PAGE);
          }}
        />
        <div className="et-row">
          <button
            className="btn primary"
            disabled={filteredMake.length === 0}
            onClick={() =>
              startSession(
                filteredMake.map((x) => ({ key: x.key, sentence: x.s, packId: mPack })),
                "make",
                "make"
              )
            }
          >
            {t("startPractice")}（{filteredMake.length}）
          </button>
        </div>
        {filteredMake.length === 0 ? (
          <p className="body-text">{t("noResult")}</p>
        ) : (
          <ul className="et-list">
            {shown.map((x, i) => {
              const st = itemState(prog, x.key);
              const enOpen = !!shownEn[x.key];
              return (
                <li key={x.key} className="et-list-item">
                  <div className="et-list-main et-sentence-row">
                    <span className="et-zh">{x.s.zh}</span>
                    <span className="et-note">{x.s.note}</span>
                    {enOpen && (
                      <span className="et-sent-en">{renderClickableEn(x.s.en, x.key)}</span>
                    )}
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
                        const rest = filteredMake.slice(i);
                        startSession(
                          rest.map((y) => ({ key: y.key, sentence: y.s, packId: mPack })),
                          "make",
                          "make"
                        );
                      }}
                    >
                      {t("practiceFromHere")}
                    </button>
                    <button
                      className="btn small ghost"
                      onClick={() =>
                        setShownEn((prev) => ({ ...prev, [x.key]: !prev[x.key] }))
                      }
                    >
                      {enOpen ? t("hideEn") : t("showEn")}
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
          <button className="btn" onClick={() => setMShown((n) => n + PAGE)}>
            {t("showMore")}（{t("remaining")} {remaining} {t("ofTotal")}）
          </button>
        )}
        {mShown > PAGE && filteredMake.length > PAGE && (
          <button className="btn ghost" onClick={() => setMShown(PAGE)}>
            {t("collapse")}
          </button>
        )}
      </div>
    );
  }

  // ---------- 句型练习 ----------
  function renderPatternsTab() {
    if (!prog) return null;
    return (
      <div>
        <p className="body-text">{t("patternIntro")}</p>
        <p className="body-text">
          {PATTERNS.length} {t("patternCount")}
        </p>
        <ul className="et-list">
          {PATTERNS.map((p) => (
            <li key={p.id} className="et-list-item et-pattern">
              <div className="et-list-main">
                <span className="et-pattern-name">{p.name}</span>
                <span className="et-pattern-struct">{p.pattern}</span>
                <span>{p.explain}</span>
                <span className="et-note">
                  {t("patternExamples")}：
                </span>
                {p.examples.map((ex, i) => (
                  <span key={i} className="et-pattern-ex">
                    <span className="et-sent-en">{renderClickableEn(ex.en, `${p.id}-${i}`)}</span>
                    <span>
                      {ex.zh}（{ex.note}）
                    </span>
                  </span>
                ))}
              </div>
              <div className="et-list-actions">
                <button
                  className="btn small primary"
                  onClick={() =>
                    startSession(
                      p.examples.map((ex, i) => ({
                        key: `p:${p.id}:${i}`,
                        sentence: ex,
                        packId: p.id,
                      })),
                      "make",
                      "pattern"
                    )
                  }
                >
                  {t("patternPractice")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ---------- 句子打字 ----------
  function renderSentencesTab() {
    if (!prog) return null;
    const pack = allSentencePacks.find((p) => p.id === sPack) ?? allSentencePacks[0];
    const packIsZh = pack.source === "zh";
    const shown = filteredSentences.slice(0, sShown);
    const remaining = filteredSentences.length - shown.length;
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
        {!packIsZh && (
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
        )}
        {statusFiltersRow(sStatus, setSStatus, () => setSShown(PAGE))}
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
                filteredSentences.map((x) => ({ key: x.key, sentence: x.s, packId: sPack })),
                packIsZh ? "make" : sMode,
                packIsZh ? "make" : `s${sMode}`
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
                    <span className="et-sent-en">{renderClickableEn(x.s.en, x.key)}</span>
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
                          rest.map((y) => ({ key: y.key, sentence: y.s, packId: sPack })),
                          packIsZh ? "make" : sMode,
                          packIsZh ? "make" : `s${sMode}`
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
                onClick={() => startSession(dueItems, "make", "review")}
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
                      <span className="et-sent-en">{x.sentence.en}</span>
                      <span>{x.sentence.zh}</span>
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

  // ---------- 错句本 ----------
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
              onClick={() =>
                startSession(
                  wrongItems.map((x) => ({ key: x.key, sentence: x.sentence, packId: "" })),
                  "make",
                  "review"
                )
              }
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
                  <span className="et-sent-en">{x.sentence.en}</span>
                  <span>{x.sentence.zh}</span>
                  {bookTab === "wrong" && (
                    <span className="et-wrong-count">
                      {t("wrongCount")} {x.wrong} {t("timesUnit")}
                    </span>
                  )}
                </div>
                <div className="et-list-actions">
                  <button
                    className="btn small"
                    onClick={() =>
                      startSession(
                        [{ key: x.key, sentence: x.sentence, packId: "" }],
                        "make",
                        "review"
                      )
                    }
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

  // ---------- 我的句包 ----------
  function renderMineTab() {
    if (!prog) return null;
    return (
      <div>
        <h3 className="sub-title">{t("importTitle")}</h3>
        <p className="body-text">{t("importDesc")}</p>
        <div className="et-chips">
          <button
            className={`btn small ${importMode === "en" ? "primary" : "ghost"}`}
            onClick={() => {
              setImportMode("en");
              setImportList([]);
              setImportMsg("");
            }}
          >
            {t("importModeEn")}
          </button>
          <button
            className={`btn small ${importMode === "zh" ? "primary" : "ghost"}`}
            onClick={() => {
              setImportMode("zh");
              setImportList([]);
              setImportMsg("");
            }}
          >
            {t("importModeZh")}
          </button>
        </div>
        {importMode === "zh" && <p className="body-text">{t("importZhDesc")}</p>}
        <p className="et-note">{t("noAiNote")}</p>
        <textarea
          className="et-textarea"
          rows={5}
          value={importText}
          placeholder={importMode === "en" ? t("importPh") : t("importZhPh")}
          onChange={(e) => setImportText(e.target.value)}
        />
        <div className="et-row">
          <button
            className="btn primary"
            onClick={() => {
              if (importMode === "en") {
                const parts = splitSentences(importText);
                if (parts.length === 0) {
                  setImportMsg(t("importEmpty"));
                  return;
                }
                setImportList(parts.map((en) => ({ en, zh: "" })));
                setImportMsg("");
              } else {
                const lines = splitChineseLines(importText);
                if (lines.length === 0) {
                  setImportMsg(t("importZhEmpty"));
                  return;
                }
                setImportList(lines.map((zh) => ({ en: "", zh })));
                setImportMsg("");
              }
            }}
          >
            {importMode === "en" ? t("importSplit") : t("importZhSplit")}
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
                    {importMode === "en" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <span className="et-zh">{s.zh}</span>
                        <input
                          className="et-input et-inline-input"
                          value={s.en}
                          placeholder={t("importEnAnswer")}
                          onChange={(e) =>
                            setImportList((prev) =>
                              prev.map((p, j) => (j === i ? { ...p, en: e.target.value } : p))
                            )
                          }
                        />
                      </>
                    )}
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
                    source: importMode,
                    sentences: importList.map((s) => ({ en: s.en, zh: s.zh, note: "" })),
                  };
                  updateProg((p) => ({ ...p, customPacks: [...p.customPacks, pack] }));
                  setImportText("");
                  setImportName("");
                  setImportList([]);
                  setImportMsg("");
                  setMPack(pack.id);
                  setSPack(pack.id);
                  setTab("make");
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
                  {c.source === "zh" && <span className="et-badge">{t("makeOnly")}</span>}
                </div>
                <div className="et-list-actions">
                  <button
                    className="btn small"
                    onClick={() => {
                      setMPack(c.id);
                      setSPack(c.id);
                      setTab("make");
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
    const firstPackDone = SENTENCE_PACKS.some((p) =>
      p.sentences.every((_, i) => itemState(prog, `s:${p.id}:${i}`).seen > 0)
    );
    const allModes = ["make", "pattern", "sword", "schunk", "sfull"].every((m) =>
      prog.modesTried.includes(m)
    );
    const achievements = [
      { id: "firstPack", label: t("achFirstPack"), done: firstPackDone },
      { id: "streak7", label: t("achStreak7"), done: prog.streak.count >= 7 },
      { id: "100", label: t("ach100"), done: totalSeen >= 100 },
      { id: "perfect", label: t("achPerfect"), done: prog.perfectSessions >= 1 },
      { id: "allModes", label: t("achAllModes"), done: allModes },
    ];
    const weakestSentences = wrongItems.slice(0, 5);
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
        {weakestSentences.length === 0 ? (
          <p className="body-text">{t("weakestEmpty")}</p>
        ) : (
          <ul className="et-list">
            {weakestSentences.map((x) => (
              <li key={x.key} className="et-list-item">
                <div className="et-list-main">
                  <span className="et-sent-en">{x.sentence.en}</span>
                  <span>{x.sentence.zh}</span>
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
    { id: "make", label: t("tabMake") },
    { id: "patterns", label: t("tabPatterns") },
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
      {renderLookupPanel()}
      {session
        ? renderSession()
        : tab === "make"
          ? renderMakeTab()
          : tab === "patterns"
            ? renderPatternsTab()
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
