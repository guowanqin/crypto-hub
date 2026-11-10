"use client";

import { useEffect, useRef, useState } from "react";
import {
  EDGES,
  ENEMY_MARK,
  ENEMY_NAMES,
  HISTORY_NOTES,
  HINT_TEXT,
  LOSE_TEXT,
  LOUSHANGUAN_NOTE,
  NODE_MAP,
  NODES,
  STR,
  doFeint,
  doMove,
  doRest,
  formatLog,
  initialState,
  isCrossingEdge,
  minEnemyDistance,
  neighborsOf,
  validateMove,
  type GameState,
  type Lang3,
  type NodeId,
} from "@/lib/sidu-chishui";
import { useLang } from "./LangProvider";

const BEST_KEY = "sidu-chishui-best";
const RIVER_PATH =
  "M 480,-10 C 445,70 495,140 460,220 C 435,290 485,370 450,450 C 435,510 460,545 448,575";

interface Best {
  turns: number;
  wins: number;
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
  const t = STR[lang as Lang3];
  const [state, setState] = useState<GameState>(() => initialState());
  const [best, setBest] = useState<Best | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const savedRef = useRef("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BEST_KEY);
      if (raw) setBest(JSON.parse(raw) as Best);
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    if (state.phase !== "won") return;
    const key = `${round}-${state.turn}`;
    if (savedRef.current === key) return;
    savedRef.current = key;
    setBest((prev) => {
      const next: Best = {
        turns: prev ? Math.min(prev.turns, state.turn) : state.turn,
        wins: (prev?.wins ?? 0) + 1,
      };
      try {
        window.localStorage.setItem(BEST_KEY, JSON.stringify(next));
      } catch {
        /* 忽略 */
      }
      return next;
    });
  }, [state.phase, state.turn, round]);

  const startGame = () => {
    setHint(null);
    setRound((r) => r + 1);
    setState({ ...initialState(), phase: "playing" });
  };

  const handleNode = (id: NodeId) => {
    if (state.phase !== "playing") return;
    const problem = validateMove(state, id);
    if (problem) {
      setHint(HINT_TEXT[problem][lang as Lang3]);
      return;
    }
    setHint(null);
    setState(doMove(state, id));
  };

  const dist = state.phase === "playing" ? minEnemyDistance(state) : null;
  const reachable = state.phase === "playing" ? new Set(neighborsOf(state.player)) : new Set<NodeId>();
  const canRest =
    state.phase === "playing" && (dist === null || dist > 1);

  const enemiesByNode = new Map<NodeId, { id: string; node: NodeId }[]>();
  for (const e of state.enemies) {
    const list = enemiesByNode.get(e.node) ?? [];
    list.push(e);
    enemiesByNode.set(e.node, list);
  }

  const logLines = [...state.log].reverse().slice(0, 10);
  const note = state.lastNote > 0 ? HISTORY_NOTES[state.lastNote] : null;

  return (
    <section className="card" data-phase={state.phase} style={{ marginTop: 20 }}>
      <style>{`
        .sidu-pulse { animation: sidu-pulse 1.6s ease-in-out infinite; }
        @keyframes sidu-pulse { 0%,100% { opacity: .95; } 50% { opacity: .2; } }
        .sidu-node { cursor: pointer; }
        .sidu-node-label { paint-order: stroke; stroke: #FAF6ED; stroke-width: 3px; }
      `}</style>

      <h2>四渡赤水</h2>

      {state.phase === "start" && (
        <div>
          <p className="body-text">{t.intro}</p>
          <h3 className="sub-title">{t.rulesTitle}</h3>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.9, color: "var(--muted)", fontSize: 15 }}>
            {t.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="body-text" style={{ marginBottom: 14 }}>
            {best
              ? t.bestLine.replace("{turns}", String(best.turns)).replace("{wins}", String(best.wins))
              : t.bestNone}
          </p>
          <button className="btn primary big" data-action="start" onClick={startGame}>
            {t.start}
          </button>
        </div>
      )}

      {state.phase !== "start" && (
        <div>
          {/* HUD */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span className="badge badge-embedded" data-hud="crossings">
              {t.crossings} {Math.min(state.crossings, 4)}/4
              {state.crossings >= 4 ? ` · ${t.crossingsDone}` : ""}
            </span>
            <span className="badge" data-hud="morale">
              {t.morale} {state.morale}
              <Bar value={state.morale} color="#A67C2E" />
            </span>
            <span className="badge" data-hud="supplies">
              {t.supplies} {state.supplies}
              <Bar value={state.supplies} color="#2F6B8A" />
            </span>
            <span className="badge" data-hud="turn">
              {t.turn} {state.turn}
            </span>
            <span className="badge" data-hud="enemy-dist">
              {t.enemyDist} {dist === null ? "—" : dist}
            </span>
          </div>

          {/* 胜负结算 */}
          {state.phase === "won" && (
            <div
              className="card"
              data-result="won"
              style={{ background: "#EFF6E4", borderColor: "#4A7C3A", marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#2F5D23" }}>{t.winTitle}</h3>
              <p className="body-text">{t.winText}</p>
              <p className="body-text" style={{ marginTop: 8 }}>
                {t.turn} {state.turn} · {t.morale} {state.morale} · {t.supplies} {state.supplies}
              </p>
              {best && (
                <p className="body-text">
                  {t.bestLine.replace("{turns}", String(best.turns)).replace("{wins}", String(best.wins))}
                </p>
              )}
              <button className="btn primary" data-action="restart" onClick={startGame} style={{ marginTop: 10 }}>
                {t.restart}
              </button>
            </div>
          )}
          {state.phase === "lost" && (
            <div
              className="card"
              data-result="lost"
              style={{ background: "#FBEDEA", borderColor: "#B03A2E", marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#8A2A20" }}>{t.loseTitle}</h3>
              <p className="body-text">
                {state.loseReason ? LOSE_TEXT[state.loseReason][lang as Lang3] : ""}
              </p>
              <p className="body-text" style={{ marginTop: 8 }}>
                {t.turn} {state.turn} · {t.crossings} {Math.min(state.crossings, 4)}/4
              </p>
              <button className="btn primary" data-action="restart" onClick={startGame} style={{ marginTop: 10 }}>
                {t.restart}
              </button>
            </div>
          )}

          {/* 地图 */}
          <div style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 1000 660"
              role="img"
              aria-label="四渡赤水地图"
              style={{ width: "100%", minWidth: 560, maxWidth: 920, display: "block", margin: "0 auto" }}
            >
              {/* 赤水河 */}
              <path d={RIVER_PATH} fill="none" stroke="#6FA8CF" strokeWidth={36} strokeLinecap="round" opacity={0.55} />
              <path d={RIVER_PATH} fill="none" stroke="#A8D0E8" strokeWidth={24} strokeLinecap="round" opacity={0.8} />
              <text
                x={472}
                y={300}
                transform="rotate(-78 472 300)"
                textAnchor="middle"
                fontSize={14}
                letterSpacing={4}
                fill="#2F6B8A"
              >
                {t.riverLabel}
              </text>

              {/* 连线 */}
              {EDGES.map((e) => {
                const a = NODE_MAP[e.a];
                const b = NODE_MAP[e.b];
                const active =
                  (state.player === e.a && reachable.has(e.b)) ||
                  (state.player === e.b && reachable.has(e.a));
                return (
                  <line
                    key={`${e.a}-${e.b}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={
                      e.escape ? "#8a6d1f" : e.crossing ? "#2F6B8A" : active ? "#B8860B" : "#C9BFA8"
                    }
                    strokeWidth={e.crossing || e.escape ? 3 : active ? 3 : 2}
                    strokeDasharray={e.crossing ? "8 6" : e.escape ? "4 5" : undefined}
                    opacity={e.escape && state.crossings < 4 ? 0.45 : 1}
                  />
                );
              })}

              {/* 地点 */}
              {NODES.map((n) => {
                const isPlayer = state.player === n.id;
                const isReachable = reachable.has(n.id);
                const labelY = n.y + 30;
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
                      stroke={KIND_STROKE[n.kind]}
                      strokeWidth={1.5}
                    />
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
                      {n.name[lang as Lang3]}
                    </text>
                    <text
                      x={n.x}
                      y={labelY + 16}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#8a6d1f"
                      className="sidu-node-label"
                    >
                      {t.kindLabel[n.kind]}
                    </text>
                  </g>
                );
              })}

              {/* 红军 */}
              {(() => {
                const p = NODE_MAP[state.player];
                return (
                  <g pointerEvents="none">
                    <circle cx={p.x} cy={p.y} r={15} fill="#B03A2E" stroke="#fff" strokeWidth={2} />
                    <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={14} fill="#fff">
                      ★
                    </text>
                  </g>
                );
              })()}

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

          {/* 图例与提示 */}
          <p className="body-text" style={{ fontSize: 13, marginTop: 6 }}>
            <span style={{ color: "#B03A2E" }}>★ {t.legendArmy}</span>
            {" · "}
            {(["chuan", "qian", "central"] as const).map((id) => (
              <span key={id} style={{ marginRight: 8 }}>
                <span style={{ color: "#3D2C2C" }}>● {ENEMY_MARK[id]}</span> {ENEMY_NAMES[id][lang as Lang3]}
              </span>
            ))}
            <br />
            {t.moveHint}
          </p>
          {hint && (
            <p className="body-text" data-hint style={{ color: "#B03A2E", marginTop: 4 }}>
              {hint}
            </p>
          )}

          {/* 行动按钮 */}
          {state.phase === "playing" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                className="btn primary"
                data-action="feint"
                disabled={state.feintUsed}
                onClick={() => {
                  setHint(null);
                  setState(doFeint(state));
                }}
              >
                {t.feint}
                {state.feintUsed ? `（${t.feintDone}）` : ""}
              </button>
              <button
                className="btn"
                data-action="rest"
                disabled={!canRest}
                title={canRest ? "" : t.restBlocked}
                onClick={() => {
                  setHint(null);
                  setState(doRest(state));
                }}
              >
                {t.rest}
                {!canRest ? `（${t.restBlocked}）` : ""}
              </button>
            </div>
          )}

          {/* 战史小注 */}
          {note && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #A67C2E", marginTop: 16, marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                {t.noteTitle} · {note[lang as Lang3].title}
              </h3>
              <p className="body-text">{note[lang as Lang3].text}</p>
            </div>
          )}
          {state.loushanguanDone && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #B03A2E", marginTop: 16, marginBottom: 12 }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                {t.noteTitle} · {LOUSHANGUAN_NOTE[lang as Lang3].title}
              </h3>
              <p className="body-text">{LOUSHANGUAN_NOTE[lang as Lang3].text}</p>
            </div>
          )}

          {/* 行军日志 */}
          <h3 className="sub-title">{t.logTitle}</h3>
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
              <div key={e.id}>{formatLog(e, lang as Lang3)}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
