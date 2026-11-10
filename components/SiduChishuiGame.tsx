"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACHIEVEMENT_DEFS,
  CODEX_CARDS,
  CODEX_MAP,
  DIFFICULTY_CONFIG,
  DIFFICULTY_NAMES,
  EDGES,
  ENEMY_MARK,
  ENEMY_NAMES,
  EVENT_DEFS,
  HISTORICAL_ROUTE,
  HISTORY_NOTES,
  HINT_TEXT,
  LOSE_TEXT,
  LOUSHANGUAN_NOTE,
  NODE_MAP,
  NODES,
  QUIZ_MAP,
  RANK_NAMES,
  STR,
  advanceEnemies,
  bfsDistance,
  computeScore,
  doDecoy,
  doFeint,
  doMove,
  doRest,
  formatLog,
  initialState,
  minEnemyDistance,
  neighborsOf,
  rankFor,
  reachableNodes,
  resolveCombat,
  resolveEvent,
  resolveQuiz,
  shortestPath,
  startGame,
  validateMove,
  type Difficulty,
  type EnemyId,
  type GameState,
  type Lang3,
  type MoveMode,
  type NodeId,
  type QuizQuestion,
} from "@/lib/sidu-chishui";
import { useLang } from "./LangProvider";

const BEST_KEY = "sidu-chishui-best";
const CODEX_KEY = "sidu-chishui-codex";
const ACH_KEY = "sidu-chishui-achievements";
const RIVER_PATH =
  "M 480,-10 C 445,70 495,140 460,220 C 435,290 485,370 450,450 C 435,510 460,545 448,575";
const EX_YUNNAN = new Set<NodeId>(["yunnan"]);

interface Best {
  turns: number;
  wins: number;
  score: number;
}

const KIND_FILL: Record<string, string> = {
  start: "#FDEBD0",
  town: "#FFFDF8",
  ford: "#DCEEF7",
  pass: "#F3E2C7",
  river: "#DCEEF7",
  escape: "#DFF0D8",
};

const KIND_STROKE: Record<string, string> = {
  start: "#8a6d1f",
  town: "#8a6d1f",
  ford: "#2F6B8A",
  pass: "#8a6d1f",
  river: "#2F6B8A",
  escape: "#4A7C3A",
};

const KIND_LABEL_KEY: Record<string, string> = {
  start: "kindStart",
  town: "kindTown",
  ford: "kindFord",
  pass: "kindPass",
  river: "kindRiver",
  escape: "kindEscape",
};

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span
      style={{
        display: "inline-block",
        width: 72,
        height: 8,
        borderRadius: 4,
        background: "#E8DFC8",
        verticalAlign: "middle",
        marginLeft: 6,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          display: "block",
          width: `${pct}%`,
          height: "100%",
          background: pct < 25 ? "#B03A2E" : color,
          borderRadius: 4,
        }}
      />
    </span>
  );
}

export default function SiduChishuiGame() {
  const { lang } = useLang();
  const L = lang as Lang3;
  const S = (k: string) => STR[k][L];
  const [state, setState] = useState<GameState>(() => initialState());
  const [difficulty, setDifficulty] = useState<Difficulty>("historical");
  const [mode, setMode] = useState<MoveMode>("steady");
  const [best, setBest] = useState<Best | null>(null);
  const [codexSaved, setCodexSaved] = useState<string[]>([]);
  const [achSaved, setAchSaved] = useState<string[]>([]);
  const [showCodex, setShowCodex] = useState(false);
  const [codexDetail, setCodexDetail] = useState<string | null>(null);
  const [decoyOpen, setDecoyOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [lastQuiz, setLastQuiz] = useState<{ q: QuizQuestion; chosen: number; correct: boolean } | null>(null);
  const [banner, setBanner] = useState<{ text: string; key: number } | null>(null);
  const [flash, setFlash] = useState(0);
  const [displayPos, setDisplayPos] = useState({ x: NODE_MAP.tucheng.x, y: NODE_MAP.tucheng.y });
  const prevNodeRef = useRef<NodeId>("tucheng");
  const savedRef = useRef("");

  // 读本地存档：最佳战绩、图鉴、成就。
  useEffect(() => {
    try {
      const b = window.localStorage.getItem(BEST_KEY);
      if (b) setBest(JSON.parse(b) as Best);
      const c = window.localStorage.getItem(CODEX_KEY);
      if (c) setCodexSaved(JSON.parse(c) as string[]);
      const a = window.localStorage.getItem(ACH_KEY);
      if (a) setAchSaved(JSON.parse(a) as string[]);
    } catch {
      /* 忽略 */
    }
  }, []);

  // 结算时落盘：图鉴、成就、最佳战绩。
  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    const key = `${state.phase}-${state.turn}-${state.route.length}`;
    if (savedRef.current === key) return;
    savedRef.current = key;
    setCodexSaved((prev) => {
      const next = [...new Set([...prev, ...state.codex])];
      try {
        window.localStorage.setItem(CODEX_KEY, JSON.stringify(next));
      } catch {
        /* 忽略 */
      }
      return next;
    });
    setAchSaved((prev) => {
      const next = [...new Set([...prev, ...state.achievements])];
      try {
        window.localStorage.setItem(ACH_KEY, JSON.stringify(next));
      } catch {
        /* 忽略 */
      }
      return next;
    });
    if (state.phase === "won") {
      setBest((prev) => {
        const next: Best = {
          turns: prev ? Math.min(prev.turns, state.turn) : state.turn,
          wins: (prev?.wins ?? 0) + 1,
          score: Math.max(prev?.score ?? 0, computeScore(state)),
        };
        try {
          window.localStorage.setItem(BEST_KEY, JSON.stringify(next));
        } catch {
          /* 忽略 */
        }
        return next;
      });
    }
  }, [state.phase, state.turn, state.route.length, state.codex, state.achievements]);

  // 敌军阶段：玩家行动 + 对话框解决完后，延迟跑敌军阶段（给棋子移动动画留时间）。
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.awaiting !== null || !state.needsEnemyPhase || lastQuiz !== null) return;
    const t = setTimeout(() => {
      setState((s) => advanceEnemies(s));
    }, 450);
    return () => clearTimeout(t);
  }, [state, lastQuiz]);

  // 横幅与战斗闪光：跟随日志最新一条。
  const lastLog = state.log[state.log.length - 1];
  useEffect(() => {
    if (!lastLog) return;
    if (lastLog.kind === "cross") {
      const n = HISTORY_NOTES[Math.min(lastLog.n, 4)];
      if (n) setBanner({ text: n[L].title, key: lastLog.id });
    } else if (lastLog.kind === "codex") {
      const c = CODEX_MAP[lastLog.cardId];
      if (c) setBanner({ text: `${STR.codexNew[L]} ${c.title[L]}`, key: lastLog.id });
    } else if (lastLog.kind === "combat") {
      setFlash(lastLog.id);
      setBanner({ text: lastLog.won ? STR.combatWin[L] : STR.combatLose[L], key: lastLog.id });
    } else if (lastLog.kind === "win" || lastLog.kind === "lose") {
      // 结算画面不再需要战斗横幅：清掉旧横幅，免得上一场的“伏击成功”留在结果屏上。
      setBanner(null);
    }
    const t = setTimeout(() => setBanner(null), 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLog]);

  // 棋子移动动画：沿最短路径插值（急行军分两段走）。
  useEffect(() => {
    const from = prevNodeRef.current;
    const to = state.player;
    if (from === to) return;
    const path = shortestPath(from, to);
    prevNodeRef.current = to;
    if (path && path.length === 3) {
      const mid = NODE_MAP[path[1]];
      setDisplayPos({ x: mid.x, y: mid.y });
      const t = setTimeout(
        () => setDisplayPos({ x: NODE_MAP[to].x, y: NODE_MAP[to].y }),
        240,
      );
      return () => clearTimeout(t);
    }
    setDisplayPos({ x: NODE_MAP[to].x, y: NODE_MAP[to].y });
  }, [state.player]);

  const startGameHandler = (d: Difficulty) => {
    setDifficulty(d);
    setHint(null);
    setLastQuiz(null);
    setDecoyOpen(false);
    setShowCodex(false);
    setCodexDetail(null);
    setMode("steady");
    prevNodeRef.current = "tucheng";
    setDisplayPos({ x: NODE_MAP.tucheng.x, y: NODE_MAP.tucheng.y });
    setState(startGame(initialState(), d));
  };

  const backToStart = () => {
    setHint(null);
    setLastQuiz(null);
    setDecoyOpen(false);
    setShowCodex(false);
    setCodexDetail(null);
    prevNodeRef.current = "tucheng";
    setDisplayPos({ x: NODE_MAP.tucheng.x, y: NODE_MAP.tucheng.y });
    setState(initialState());
  };

  const turnBusy =
    state.phase !== "playing" || state.awaiting !== null || state.needsEnemyPhase || lastQuiz !== null;

  const handleNode = (id: NodeId) => {
    if (turnBusy) return;
    const problem = validateMove(state, id, mode);
    if (problem) {
      setHint(HINT_TEXT[problem][L]);
      return;
    }
    setHint(null);
    setState((s) => doMove(s, id, mode));
  };

  const handleRest = () => {
    if (turnBusy) return;
    setHint(null);
    setState((s) => doRest(s));
  };

  const handleFeint = () => {
    if (turnBusy) return;
    setHint(null);
    setState((s) => doFeint(s));
  };

  const handleDecoy = (enemyId?: EnemyId) => {
    if (turnBusy) return;
    setDecoyOpen(false);
    setHint(null);
    setState((s) => doDecoy(s, enemyId));
  };

  const answerQuiz = (idx: number) => {
    const q = QUIZ_MAP[state.quizQueue[0]];
    if (!q) return;
    setLastQuiz({ q, chosen: idx, correct: idx === q.answer });
    setState((s) => resolveQuiz(s, idx));
  };

  const chooseEvent = (idx: number) => {
    setState((s) => resolveEvent(s, idx));
  };

  const resolveFight = (choice: "fight" | "evade") => {
    setState((s) => resolveCombat(s, choice));
  };

  const playing = state.phase === "playing";
  const dist = playing ? minEnemyDistance(state) : null;
  const reachable =
    playing && !turnBusy ? reachableNodes(state, mode) : new Set<NodeId>();
  const quiz =
    state.awaiting === "quiz" && lastQuiz === null
      ? QUIZ_MAP[state.quizQueue[0]]
      : null;
  const eventDef =
    state.awaiting === "event" && lastQuiz === null && state.pendingEventId
      ? EVENT_DEFS[state.pendingEventId]
      : null;
  const combat =
    state.awaiting === "combat" && lastQuiz === null ? state.pendingCombat : null;
  const otherAdjacent = combat
    ? state.enemies.filter(
        (e) =>
          e.id !== combat.enemy &&
          e.staggeredUntil < state.turn &&
          e.decoyedUntil < state.turn &&
          state.feintTurnsLeft === 0 &&
          neighborsOf(state.player).includes(e.node),
      )
    : [];

  const enemiesByNode = new Map<NodeId, { id: string; node: NodeId }[]>();
  for (const e of state.enemies) {
    const list = enemiesByNode.get(e.node) ?? [];
    list.push(e);
    enemiesByNode.set(e.node, list);
  }

  const logLines = [...state.log].reverse().slice(0, 10);
  const note = state.lastNote > 0 ? HISTORY_NOTES[state.lastNote] : null;
  const codexAll = [...new Set([...codexSaved, ...state.codex])];
  const achAll = [...new Set([...achSaved, ...state.achievements])];
  const score = computeScore(state);
  const rank = rankFor(state);
  const routeEqual = state.route.join(",") === HISTORICAL_ROUTE.join(",");

  const intentLabel = (e: (typeof state.enemies)[number]): string => {
    if (e.decoyedUntil >= state.turn) return STR.intentRetreat[L];
    if (e.staggeredUntil >= state.turn || state.feintTurnsLeft > 0 || state.crossedThisTurn)
      return STR.intentHold[L];
    if (e.intent === null) return STR.intentHold[L];
    if (e.id === "qian" && e.intent !== state.player) return STR.intentPatrol[L];
    if (e.id === "chuan") return STR.intentBlock[L];
    return STR.intentChase[L];
  };

  const diffDescKey: Record<Difficulty, string> = {
    easy: "diffEasyDesc",
    historical: "diffHistDesc",
    hard: "diffHardDesc",
  };

  return (
    <section className="card" data-phase={state.phase} style={{ marginTop: 20 }}>
      <style>{`
        .sidu-pulse { animation: sidu-pulse 1.6s ease-in-out infinite; }
        @keyframes sidu-pulse { 0%,100% { opacity: .95; } 50% { opacity: .2; } }
        .sidu-node { cursor: pointer; }
        .sidu-node-label { paint-order: stroke; stroke: #FAF6ED; stroke-width: 3px; }
        .sidu-river-flow { animation: sidu-flow 2.4s linear infinite; }
        @keyframes sidu-flow { to { stroke-dashoffset: -56; } }
        .sidu-flash { position: absolute; inset: 0; background: #B03A2E; pointer-events: none; animation: sidu-flash-anim .5s ease-out forwards; }
        @keyframes sidu-flash-anim { 0% { opacity: .28; } 100% { opacity: 0; } }
        .sidu-banner { position: absolute; left: 50%; top: 12px; transform: translateX(-50%); background: #3A3226; color: #FAF6ED; padding: 8px 16px; border-radius: 999px; font-size: 14px; white-space: nowrap; max-width: 92%; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 2px 10px rgba(0,0,0,.25); animation: sidu-banner-in .3s ease-out; z-index: 5; }
        @keyframes sidu-banner-in { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .sidu-player { transition: transform .45s ease; }
        .sidu-modal { position: fixed; inset: 0; background: rgba(30,25,15,.55); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 12px; }
        .sidu-modal-card { background: #FFFDF8; border: 1px solid #e6dbc2; border-radius: 12px; padding: 18px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 30px rgba(0,0,0,.3); }
        .sidu-opt { display: block; width: 100%; text-align: left; margin-top: 10px; padding: 12px 14px; border: 1px solid #e6dbc2; border-radius: 10px; background: #FAF6ED; cursor: pointer; font-size: 15px; line-height: 1.5; color: #3A3226; }
        .sidu-opt:hover { border-color: #A67C2E; background: #FFFDF8; }
        .sidu-opt small { display: block; color: #57534e; font-size: 13px; margin-top: 2px; }
        .sidu-mode { flex: 1 1 30%; min-width: 110px; text-align: left; padding: 10px 12px; border: 1px solid #e6dbc2; border-radius: 10px; background: #FAF6ED; cursor: pointer; font-size: 14px; line-height: 1.45; color: #3A3226; }
        .sidu-mode small { display: block; color: #57534e; font-size: 12px; margin-top: 2px; }
        .sidu-mode.active { border-color: #A67C2E; background: #A67C2E; color: #fff; }
        .sidu-mode.active small { color: #F5EAD0; }
        .sidu-mode:disabled { opacity: .55; cursor: default; }
        .sidu-diff { flex: 1 1 30%; min-width: 150px; text-align: left; padding: 12px 14px; border: 1px solid #e6dbc2; border-radius: 10px; background: #FAF6ED; cursor: pointer; font-size: 14px; line-height: 1.5; color: #3A3226; }
        .sidu-diff small { display: block; color: #57534e; font-size: 12px; margin-top: 4px; }
        .sidu-diff.active { border-color: #A67C2E; background: #FFFDF8; box-shadow: 0 0 0 2px #A67C2E inset; }
        .sidu-codex-card { border: 1px solid #e6dbc2; border-radius: 10px; padding: 10px 12px; background: #FAF6ED; cursor: pointer; font-size: 14px; line-height: 1.5; color: #3A3226; text-align: left; }
        .sidu-codex-card.locked { opacity: .65; cursor: default; background: #F3EDE0; }
      `}</style>

      <h2>四渡赤水</h2>

      {state.phase === "start" && (
        <div>
          <p className="body-text" style={{ color: "#8a6d1f", marginBottom: 4 }}>
            {S("startSubtitle")}
          </p>
          <p className="body-text">{S("startIntro")}</p>
          <h3 className="sub-title">{S("difficultyTitle")}</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {(["easy", "historical", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`sidu-diff${difficulty === d ? " active" : ""}`}
                data-difficulty={d}
                onClick={() => setDifficulty(d)}
              >
                <strong>{DIFFICULTY_NAMES[d][L]}</strong>
                <small>
                  {S("moraleLabel")} {DIFFICULTY_CONFIG[d].startMorale} · {S("suppliesLabel")}{" "}
                  {DIFFICULTY_CONFIG[d].startSupplies}
                </small>
                <small>{S(diffDescKey[d])}</small>
              </button>
            ))}
          </div>
          <h3 className="sub-title">{S("howTitle")}</h3>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.9, color: "var(--muted)", fontSize: 15 }}>
            <li>{S("rule1")}</li>
            <li>{S("rule2")}</li>
            <li>{S("rule3")}</li>
            <li>{S("rule4")}</li>
          </ul>
          <p className="body-text" style={{ marginBottom: 14 }}>
            {best
              ? `${S("bestLabel")}：${best.turns} ${S("turnLabel")} · ${best.score} ${S("scoreLabel")}`
              : S("bestNone")}
          </p>
          <button className="btn primary big" data-action="start" onClick={() => startGameHandler(difficulty)}>
            {S("startButton")}
          </button>
          <p className="body-text" style={{ fontSize: 12, marginTop: 14 }}>
            {S("startNote")}
          </p>
        </div>
      )}

      {state.phase !== "start" && (
        <div>
          {/* HUD */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <span className="badge badge-embedded" data-hud="crossings">
              {S("crossingsLabel")} {Math.min(state.crossings, 4)}/4
              {state.crossings >= 4 ? ` · ${S("crossingsDone")}` : ""}
            </span>
            <span className="badge" data-hud="morale">
              {S("moraleLabel")} {state.morale}
              <Bar value={state.morale} color="#A67C2E" />
            </span>
            <span className="badge" data-hud="supplies">
              {S("suppliesLabel")} {state.supplies}
              <Bar value={state.supplies} color="#2F6B8A" />
            </span>
            <span className="badge" data-hud="turn">
              {S("turnLabel")} {state.turn}
            </span>
            <span className="badge" data-hud="battles">
              {S("battlesLabel")} {state.battlesWon}
            </span>
            <span className="badge" data-hud="score">
              {S("scoreLabel")} {score}
            </span>
            <span className="badge" data-hud="difficulty">
              {DIFFICULTY_NAMES[state.difficulty][L]}
            </span>
            <span className="badge" data-hud="enemy-dist">
              {S("enemyDist")} {dist === null ? "—" : dist}
            </span>
          </div>

          {/* 战后复盘 */}
          {(state.phase === "won" || state.phase === "lost") && (
            <div
              className="card"
              data-result={state.phase}
              style={{
                background: state.phase === "won" ? "#EFF6E4" : "#FBEDEA",
                borderColor: state.phase === "won" ? "#4A7C3A" : "#B03A2E",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: state.phase === "won" ? "#2F5D23" : "#8A2A20" }}>
                {state.phase === "won" ? S("winTitle") : S("loseTitle")}
              </h3>
              {state.phase === "lost" && state.loseReason && (
                <p className="body-text">{LOSE_TEXT[state.loseReason][L]}</p>
              )}
              <h3 className="sub-title" style={{ marginTop: 12 }}>{S("reviewTitle")}</h3>
              <p className="body-text">
                {S("reviewScore")} {score} · {S("reviewRank")} {RANK_NAMES[rank][L]}
              </p>
              <p className="body-text">
                {S("reviewTurns")} {state.turn} · {S("crossingsLabel")} {Math.min(state.crossings, 4)}/4 ·{" "}
                {S("battlesLabel")} {state.battlesWon}/{state.battlesFought} · {S("quizTitle")}{" "}
                {state.quizCorrect}/{state.quizAnswered} · {S("codexTitle")} {codexAll.length}/12
              </p>
              <p className="body-text" style={{ fontSize: 13 }}>{S("reviewHistTime")}</p>
              <h4 style={{ margin: "10px 0 4px", fontSize: 14 }}>{S("yourRoute")}</h4>
              <div
                style={{
                  maxHeight: 90,
                  overflowY: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "#FFFDF8",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                {state.route.map((n) => NODE_MAP[n].name[L]).join(" → ")}
              </div>
              <h4 style={{ margin: "10px 0 4px", fontSize: 14 }}>{S("histRoute")}</h4>
              <div
                style={{
                  maxHeight: 90,
                  overflowY: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "#FFFDF8",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                {HISTORICAL_ROUTE.map((n) => NODE_MAP[n].name[L]).join(" → ")}
              </div>
              <p className="body-text" style={{ marginTop: 8 }}>
                {routeEqual ? S("diffSameRoute") : S("diffOtherRoute")}
              </p>
              <p className="body-text">
                {state.battlesWon > 0
                  ? S("diffBattles").replace("{battles}", String(state.battlesWon))
                  : S("diffNoBattles")}
              </p>
              <p className="body-text">
                {S("diffQuiz")
                  .replace("{correct}", String(state.quizCorrect))
                  .replace("{total}", String(state.quizAnswered))}
              </p>
              <h4 style={{ margin: "10px 0 4px", fontSize: 14 }}>{S("reviewTimeline")}</h4>
              {[1, 2, 3, 4].map((n) => (
                <p key={n} className="body-text" style={{ fontSize: 13, margin: "4px 0" }}>
                  <strong>{HISTORY_NOTES[n][L].title}</strong> — {HISTORY_NOTES[n][L].text}
                </p>
              ))}
              <h4 style={{ margin: "10px 0 4px", fontSize: 14 }}>{S("achievementsTitle")}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ACHIEVEMENT_DEFS.map((a) => {
                  const earned = achAll.includes(a.id);
                  return (
                    <span
                      key={a.id}
                      className="badge"
                      data-achievement={a.id}
                      data-earned={earned}
                      style={{
                        background: earned ? "#EFF6E4" : "#F3EDE0",
                        borderColor: earned ? "#4A7C3A" : "#e6dbc2",
                      }}
                      title={a.desc[L]}
                    >
                      {earned ? "★ " : "☆ "}
                      {a.name[L]}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <button
                  className="btn primary"
                  data-action="restart"
                  onClick={() => startGameHandler(state.difficulty)}
                >
                  {S("playAgain")}
                </button>
                <button className="btn" data-action="new-game" onClick={backToStart}>
                  {S("newGame")}
                </button>
              </div>
            </div>
          )}

          {/* 地图 */}
          <div style={{ overflowX: "auto", position: "relative" }}>
            {banner && <div className="sidu-banner" data-banner>{banner.text}</div>}
            {flash > 0 && <div key={flash} className="sidu-flash" />}
            <svg
              viewBox="0 0 1000 660"
              role="img"
              aria-label="四渡赤水地图"
              style={{ width: "100%", minWidth: 560, maxWidth: 920, display: "block", margin: "0 auto" }}
            >
              {/* 赤水河 */}
              <path d={RIVER_PATH} fill="none" stroke="#6FA8CF" strokeWidth={36} strokeLinecap="round" opacity={0.55} />
              <path d={RIVER_PATH} fill="none" stroke="#A8D0E8" strokeWidth={24} strokeLinecap="round" opacity={0.8} />
              <path
                d={RIVER_PATH}
                fill="none"
                stroke="#EAF6FF"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray="2 26"
                className="sidu-river-flow"
                opacity={0.9}
              />
              <text
                x={472}
                y={300}
                transform="rotate(-78 472 300)"
                textAnchor="middle"
                fontSize={14}
                letterSpacing={4}
                fill="#2F6B8A"
              >
                {S("riverLabel")}
              </text>

              {/* 连线 */}
              {EDGES.map((e) => {
                const a = NODE_MAP[e.a];
                const b = NODE_MAP[e.b];
                const active =
                  (state.player === e.a && reachable.has(e.b)) ||
                  (state.player === e.b && reachable.has(e.a));
                const stroke = e.escape
                  ? "#8a6d1f"
                  : e.crossing
                    ? "#2F6B8A"
                    : active
                      ? "#B8860B"
                      : "#C9BFA8";
                const strokeWidth = e.crossing || e.escape ? 3 : active ? 3 : 2;
                const strokeDasharray = e.crossing ? "8 6" : e.escape ? "4 5" : undefined;
                const opacity = e.escape && state.crossings < 4 ? 0.45 : 1;
                if (e.via) {
                  return (
                    <path
                      key={`${e.a}-${e.b}`}
                      d={`M ${a.x} ${a.y} Q ${e.via[0]} ${e.via[1]} ${b.x} ${b.y}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      opacity={opacity}
                    />
                  );
                }
                return (
                  <line
                    key={`${e.a}-${e.b}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    opacity={opacity}
                  />
                );
              })}

              {/* 敌军意图虚线 */}
              {state.enemies.map((e) => {
                if (!e.intent || e.intent === e.node) return null;
                const from = NODE_MAP[e.node];
                const to = NODE_MAP[e.intent];
                return (
                  <g key={`intent-${e.id}`} pointerEvents="none" opacity={0.75}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#B03A2E"
                      strokeWidth={1.5}
                      strokeDasharray="3 5"
                    />
                    <circle cx={to.x} cy={to.y} r={4} fill="none" stroke="#B03A2E" strokeWidth={1.5} />
                  </g>
                );
              })}

              {/* 地点 */}
              {NODES.map((n) => {
                const isPlayer = state.player === n.id;
                const isReachable = reachable.has(n.id);
                const labelY = n.y + 30;
                const blocked =
                  state.ferryBlocked !== null &&
                  state.ferryBlocked.node === n.id &&
                  state.ferryBlocked.untilTurn > state.turn;
                return (
                  <g
                    key={n.id}
                    data-node-id={n.id}
                    className={isReachable ? "sidu-node" : undefined}
                    onClick={() => handleNode(n.id)}
                    style={{ cursor: isReachable ? "pointer" : "default" }}
                  >
                    {isReachable && (
                      <circle cx={n.x} cy={n.y} r={18} fill="none" stroke="#B8860B" strokeWidth={2} className="sidu-pulse" />
                    )}
                    {isPlayer && (
                      <circle cx={n.x} cy={n.y} r={21} fill="none" stroke="#B03A2E" strokeWidth={2} opacity={0.4} />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={12}
                      fill={KIND_FILL[n.kind]}
                      stroke={blocked ? "#B03A2E" : KIND_STROKE[n.kind]}
                      strokeWidth={blocked ? 2.5 : 1.5}
                    />
                    {blocked && (
                      <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fill="#B03A2E" fontWeight="bold">
                        ✕
                      </text>
                    )}
                    {isReachable && (
                      <circle cx={n.x} cy={n.y} r={22} fill="transparent" pointerEvents="all" />
                    )}
                    <text
                      x={n.x}
                      y={labelY}
                      textAnchor="middle"
                      fontSize={15}
                      fill="#3A3226"
                      className="sidu-node-label"
                    >
                      {n.name[L]}
                    </text>
                    <text
                      x={n.x}
                      y={labelY + 16}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#8a6d1f"
                      className="sidu-node-label"
                    >
                      {S(KIND_LABEL_KEY[n.kind])}
                    </text>
                  </g>
                );
              })}

              {/* 红军（带移动动画） */}
              <g
                pointerEvents="none"
                className="sidu-player"
                style={{ transform: `translate(${displayPos.x}px, ${displayPos.y}px)` }}
              >
                <circle cx={0} cy={0} r={15} fill="#B03A2E" stroke="#fff" strokeWidth={2} />
                <text x={0} y={5} textAnchor="middle" fontSize={14} fill="#fff">
                  ★
                </text>
              </g>

              {/* 敌军 */}
              {[...enemiesByNode.entries()].flatMap(([nodeId, list]) => {
                const n = NODE_MAP[nodeId];
                return list.map((e, i) => {
                  const dx = (i - (list.length - 1) / 2) * 18;
                  return (
                    <g key={`${e.id}-${nodeId}`} pointerEvents="none">
                      <circle cx={n.x + dx} cy={n.y} r={11} fill="#3D2C2C" stroke="#fff" strokeWidth={1.5} />
                      <text x={n.x + dx} y={n.y + 4} textAnchor="middle" fontSize={11} fill="#fff">
                        {ENEMY_MARK[e.id as keyof typeof ENEMY_MARK]}
                      </text>
                    </g>
                  );
                });
              })}
            </svg>
          </div>

          {/* 图例与敌军意图 */}
          <p className="body-text" style={{ fontSize: 13, marginTop: 6 }}>
            <span style={{ color: "#B03A2E" }}>★ {S("legendArmy")}</span>
            {" · "}
            {state.enemies.map((e) => (
              <span key={e.id} style={{ marginRight: 10 }}>
                <span style={{ color: "#3D2C2C" }}>● {ENEMY_MARK[e.id]}</span>{" "}
                {ENEMY_NAMES[e.id][L]}：{intentLabel(e)}
                {e.intent && e.intent !== e.node ? ` → ${NODE_MAP[e.intent].name[L]}` : ""}
              </span>
            ))}
            <br />
            {S("mapHint")}
          </p>
          {playing && state.player === "wujiang" && state.crossings < 4 && (
            <p
              className="body-text"
              data-yunnan-locked
              style={{ color: "#B03A2E", fontSize: 13, marginTop: 4 }}
            >
              {S("yunnanLockedHint").replace("{n}", String(state.crossings))}
            </p>
          )}
          <p className="body-text" style={{ fontSize: 13, marginTop: 2 }}>
            {state.enemies.map((e) => (
              <span key={e.id} style={{ display: "block" }}>
                {ENEMY_NAMES[e.id][L]}：{S(`enemyBehavior${e.id[0].toUpperCase()}${e.id.slice(1)}`)}
              </span>
            ))}
          </p>
          {hint && (
            <p className="body-text" data-hint style={{ color: "#B03A2E", marginTop: 4 }}>
              {hint}
            </p>
          )}

          {/* 行动：行军方式 / 欺骗 */}
          {playing && (
            <div style={{ marginTop: 12 }}>
              <h3 className="sub-title">{S("moveTitle")}</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className={`sidu-mode${mode === "steady" ? " active" : ""}`}
                  data-mode="steady"
                  disabled={turnBusy}
                  onClick={() => setMode("steady")}
                >
                  <strong>{S("modeSteady")}</strong>
                  <small>{S("modeSteadyDesc")}</small>
                </button>
                <button
                  className={`sidu-mode${mode === "rush" ? " active" : ""}`}
                  data-mode="rush"
                  disabled={turnBusy}
                  onClick={() => setMode("rush")}
                >
                  <strong>{S("modeRush")}</strong>
                  <small>{S("modeRushDesc")}</small>
                </button>
                <button
                  className="sidu-mode"
                  data-action="rest"
                  disabled={turnBusy}
                  onClick={handleRest}
                >
                  <strong>{S("modeRest")}</strong>
                  <small>{S("modeRestDesc")}</small>
                </button>
              </div>
              {dist !== null && dist <= 1 && (
                <p className="body-text" style={{ color: "#B03A2E", fontSize: 13, marginTop: 6 }}>
                  {S("restDanger")}
                </p>
              )}
              <p className="body-text" style={{ fontSize: 13, marginTop: 6 }}>{S("moveHint")}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button
                  className="btn"
                  data-action="decoy"
                  disabled={turnBusy || state.morale <= 6}
                  onClick={() => setDecoyOpen((v) => !v)}
                >
                  {S("decoyLabel")}
                </button>
                <button
                  className="btn primary"
                  data-action="feint"
                  disabled={turnBusy || state.feintUsed}
                  onClick={handleFeint}
                >
                  {S("feintLabel")}
                  {state.feintUsed ? `（${S("usedUp")}）` : ""}
                </button>
              </div>
              <p className="body-text" style={{ fontSize: 13, marginTop: 4 }}>{S("decoyDesc")}</p>
              <p className="body-text" style={{ fontSize: 13 }}>{S("feintDesc")}</p>
              {decoyOpen && (
                <div data-decoy-picker style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {[...state.enemies]
                    .map((e) => ({ e, d: bfsDistance(e.node, state.player, EX_YUNNAN) }))
                    .sort((a, b) => (a.d ?? 99) - (b.d ?? 99))
                    .map(({ e, d }, i) => (
                      <button
                        key={e.id}
                        className="btn"
                        data-decoy-enemy={e.id}
                        onClick={() => handleDecoy(e.id)}
                      >
                        {ENEMY_NAMES[e.id][L]} · {NODE_MAP[e.node].name[L]}
                        {i === 0 ? ` · ${S("enemyDist")}` : ""}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 图鉴开关（进行中与结算后都能看） */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              className="btn"
              data-action="toggle-codex"
              onClick={() => {
                setShowCodex((v) => !v);
                setCodexDetail(null);
              }}
            >
              {S("codexTitle")} {codexAll.length}/12
            </button>
          </div>

          {/* 战史图鉴 */}
          {showCodex && (
            <div style={{ marginTop: 12 }} data-codex-panel>
              <h3 className="sub-title">
                {S("codexTitle")} {codexAll.length}/12
              </h3>
              <p className="body-text" style={{ fontSize: 13 }}>{S("codexHint")}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 8,
                }}
              >
                {CODEX_CARDS.map((c) => {
                  const unlocked = codexAll.includes(c.id);
                  const cat =
                    c.cat === "figure"
                      ? S("codexCatFigure")
                      : c.cat === "battle"
                        ? S("codexCatBattle")
                        : S("codexCatFerry");
                  return (
                    <button
                      key={c.id}
                      className={`sidu-codex-card${unlocked ? "" : " locked"}`}
                      data-codex-card={c.id}
                      data-unlocked={unlocked}
                      disabled={!unlocked}
                      onClick={() => setCodexDetail(c.id)}
                    >
                      <strong>{unlocked ? c.title[L] : "?"}</strong>
                      <br />
                      <span style={{ fontSize: 12, color: "#8a6d1f" }}>{cat}</span>
                      {!unlocked && (
                        <>
                          <br />
                          <span style={{ fontSize: 12 }}>
                            {S("codexLocked")} · {c.unlockHint[L]}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {codexDetail &&
                (() => {
                  const c = CODEX_MAP[codexDetail];
                  if (!c) return null;
                  return (
                    <div className="card" data-codex-detail style={{ marginTop: 10, borderLeft: "4px solid #A67C2E" }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{c.title[L]}</h3>
                      {c.lines[L].map((line, i) => (
                        <p key={i} className="body-text" style={{ margin: "4px 0" }}>
                          {line}
                        </p>
                      ))}
                      <p className="body-text" style={{ fontSize: 12 }}>
                        来源：{c.source}
                      </p>
                    </div>
                  );
                })()}
            </div>
          )}

          {/* 战史小注 */}
          {note && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #A67C2E", marginTop: 16, marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                {S("noteTitle")} · {note[L].title}
              </h3>
              <p className="body-text">{note[L].text}</p>
            </div>
          )}
          {state.loushanguanDone && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #B03A2E", marginTop: 16, marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                {S("noteTitle")} · {LOUSHANGUAN_NOTE[L].title}
              </h3>
              <p className="body-text">{LOUSHANGUAN_NOTE[L].text}</p>
            </div>
          )}

          {/* 行军日志 */}
          <h3 className="sub-title">{S("logTitle")}</h3>
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              background: "#FFFDF8",
              fontSize: 14,
              lineHeight: 1.9,
              color: "var(--muted)",
            }}
          >
            {logLines.map((e) => (
              <div key={e.id}>{formatLog(e, L)}</div>
            ))}
          </div>
        </div>
      )}

      {/* 问答反馈（先看讲解，再继续） */}
      {lastQuiz && (
        <div className="sidu-modal" data-quiz-feedback>
          <div className="sidu-modal-card">
            <h3 style={{ margin: "0 0 8px" }}>
              {lastQuiz.correct
                ? S("quizCorrect")
                : `${S("quizWrong")} ${lastQuiz.q.options[L][lastQuiz.q.answer]}`}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: "8px 0" }}>{lastQuiz.q.q[L]}</p>
            <p className="body-text">{lastQuiz.q.explain[L]}</p>
            <p className="body-text" style={{ fontSize: 12 }}>
              来源：{lastQuiz.q.source}
            </p>
            <button className="btn primary" data-action="quiz-continue" onClick={() => setLastQuiz(null)}>
              {S("quizContinue")}
            </button>
          </div>
        </div>
      )}

      {/* 史实问答 */}
      {quiz && (
        <div className="sidu-modal" data-quiz>
          <div className="sidu-modal-card">
            <h3 style={{ margin: "0 0 8px" }}>{S("quizTitle")}</h3>
            <p className="body-text" style={{ fontSize: 13 }}>{S("quizBonus")}</p>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: "8px 0" }}>{quiz.q[L]}</p>
            {quiz.options[L].map((opt, i) => (
              <button key={i} className="sidu-opt" data-quiz-option={i} onClick={() => answerQuiz(i)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 随机事件 */}
      {eventDef && (
        <div className="sidu-modal" data-event>
          <div className="sidu-modal-card">
            <h3 style={{ margin: "0 0 8px" }}>
              {S("eventTitle")} · {eventDef.title[L]}
            </h3>
            <p className="body-text">{eventDef.text[L]}</p>
            {eventDef.options.map((opt, i) => (
              <button key={i} className="sidu-opt" data-event-option={i} onClick={() => chooseEvent(i)}>
                {opt.label[L]}
                <small>{opt.desc[L]}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 战斗 */}
      {combat && (
        <div className="sidu-modal" data-combat>
          <div className="sidu-modal-card">
            <h3 style={{ margin: "0 0 8px" }}>
              {combat.defense ? S("combatDefenseTitle") : S("combatTitle")}
            </h3>
            <p className="body-text">
              {ENEMY_NAMES[combat.enemy][L]} · {S("combatChance")} {combat.chance}%
            </p>
            {combat.defense && <p className="body-text">{S("combatDefenseText")}</p>}
            {!combat.defense && (
              <p className="body-text" style={{ fontSize: 13 }}>
                {S("combatAmbushDesc")}
              </p>
            )}
            {otherAdjacent.length > 0 && (
              <p className="body-text" style={{ color: "#B03A2E" }}>
                {S("combatPincer")}
              </p>
            )}
            <button className="btn primary sidu-opt" data-action="combat-fight" onClick={() => resolveFight("fight")}>
              {S("combatAmbush")}
            </button>
            <button className="btn sidu-opt" data-action="combat-evade" onClick={() => resolveFight("evade")}>
              {S("combatEvade")}
              <small>{S("combatEvadeDesc")}</small>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
