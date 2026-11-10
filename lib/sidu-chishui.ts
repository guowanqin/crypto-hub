// 四渡赤水小游戏：纯逻辑（无 React），地图、走法、敌军、战斗、事件、问答、图鉴、胜负判定。
// 史实口径（来源：国防部 mod.gov.cn、国史网 dswxyjy.org.cn、四渡赤水纪念馆 neac.gov.cn、
// 中国军网 81.cn）：
// 一渡 1935-01-29 土城/元厚；二渡 1935-02-18~21 太平渡/二郎滩，随后取桐梓、
// 夺娄山关、再占遵义；三渡 1935-03-16~17 茅台；四渡 1935-03-21 晚~22 太平渡/
// 二郎滩；随后南渡乌江（主力 3月30~31日）、佯攻贵阳、1935-05-09 巧渡金沙江脱险。
// 全程歼灭和击溃敌 4 个师、2 个旅另 10 个团，俘敌 3600 余人；红军 3 万余人对约 40 万敌军。

export type Lang3 = "zh" | "tw" | "en";

export type NodeId =
  | "tucheng" | "yuanhou" | "zhaxi" | "gulin" | "taipingdu" | "erlangtan"
  | "maotai" | "xuyong" | "chishui" | "tongzi" | "loushanguan" | "zunyi"
  | "renhuai" | "guiyang" | "wujiang" | "yunnan";

export type NodeKind = "start" | "town" | "ford" | "pass" | "river" | "escape";

export interface GameNode {
  id: NodeId;
  name: Record<Lang3, string>;
  x: number;
  y: number;
  kind: NodeKind;
  /** 首次进入补给粮草的城镇 */
  supply?: boolean;
}

export const NODES: GameNode[] = [
  { id: "tucheng", name: { zh: "土城", tw: "土城", en: "Tucheng" }, x: 585, y: 95, kind: "start" },
  { id: "yuanhou", name: { zh: "元厚", tw: "元厚", en: "Yuanhou" }, x: 440, y: 165, kind: "ford" },
  { id: "zhaxi", name: { zh: "扎西", tw: "扎西", en: "Zhaxi" }, x: 120, y: 125, kind: "town", supply: true },
  { id: "gulin", name: { zh: "古蔺", tw: "古藺", en: "Gulin" }, x: 235, y: 235, kind: "town", supply: true },
  { id: "taipingdu", name: { zh: "太平渡", tw: "太平渡", en: "Taipingdu" }, x: 410, y: 250, kind: "ford" },
  { id: "erlangtan", name: { zh: "二郎滩", tw: "二郎灘", en: "Erlangtan" }, x: 430, y: 340, kind: "ford" },
  { id: "maotai", name: { zh: "茅台", tw: "茅台", en: "Maotai" }, x: 455, y: 460, kind: "ford", supply: true },
  { id: "xuyong", name: { zh: "叙永", tw: "敘永", en: "Xuyong" }, x: 215, y: 405, kind: "town" },
  { id: "chishui", name: { zh: "赤水", tw: "赤水", en: "Chishui" }, x: 690, y: 65, kind: "town" },
  { id: "tongzi", name: { zh: "桐梓", tw: "桐梓", en: "Tongzi" }, x: 655, y: 265, kind: "town" },
  { id: "loushanguan", name: { zh: "娄山关", tw: "婁山關", en: "Loushanguan" }, x: 645, y: 365, kind: "pass" },
  { id: "zunyi", name: { zh: "遵义", tw: "遵義", en: "Zunyi" }, x: 685, y: 455, kind: "town", supply: true },
  { id: "renhuai", name: { zh: "仁怀", tw: "仁懷", en: "Renhuai" }, x: 585, y: 545, kind: "town", supply: true },
  { id: "guiyang", name: { zh: "贵阳", tw: "貴陽", en: "Guiyang" }, x: 845, y: 535, kind: "town" },
  { id: "wujiang", name: { zh: "乌江", tw: "烏江", en: "Wujiang" }, x: 700, y: 595, kind: "river" },
  { id: "yunnan", name: { zh: "云南·金沙江", tw: "雲南·金沙江", en: "Yunnan · Jinsha River" }, x: 400, y: 605, kind: "escape" },
];

export const NODE_MAP: Record<NodeId, GameNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
) as Record<NodeId, GameNode>;

export interface Edge {
  a: NodeId;
  b: NodeId;
  /** 渡河连线：横跨赤水河 */
  crossing?: boolean;
  /** 脱险连线：须完成四渡方可通行 */
  escape?: boolean;
  /** 弯曲连线的控制点（[x, y]）：用于绕开途中节点，如茅台→乌江绕开仁怀 */
  via?: [number, number];
}

export const EDGES: Edge[] = [
  { a: "tucheng", b: "chishui" },
  { a: "tucheng", b: "yuanhou", crossing: true },
  { a: "tucheng", b: "tongzi" },
  { a: "yuanhou", b: "zhaxi" },
  { a: "yuanhou", b: "taipingdu" },
  { a: "zhaxi", b: "gulin" },
  { a: "gulin", b: "taipingdu" },
  { a: "gulin", b: "xuyong" },
  { a: "taipingdu", b: "erlangtan" },
  { a: "taipingdu", b: "tongzi", crossing: true },
  { a: "erlangtan", b: "tongzi", crossing: true },
  { a: "erlangtan", b: "xuyong" },
  { a: "erlangtan", b: "maotai" },
  { a: "erlangtan", b: "renhuai", crossing: true },
  { a: "maotai", b: "xuyong", crossing: true },
  { a: "maotai", b: "renhuai" },
  { a: "maotai", b: "wujiang", via: [590, 645] },
  { a: "tongzi", b: "chishui" },
  { a: "tongzi", b: "loushanguan" },
  { a: "loushanguan", b: "zunyi" },
  { a: "zunyi", b: "renhuai" },
  { a: "renhuai", b: "guiyang" },
  { a: "zunyi", b: "guiyang" },
  { a: "guiyang", b: "wujiang" },
  { a: "zunyi", b: "wujiang" },
  { a: "wujiang", b: "yunnan", escape: true },
];

const ADJ: Record<NodeId, NodeId[]> = Object.fromEntries(
  NODES.map((n) => [n.id, [] as NodeId[]]),
) as Record<NodeId, NodeId[]>;
for (const e of EDGES) {
  ADJ[e.a].push(e.b);
  ADJ[e.b].push(e.a);
}

export function neighborsOf(id: NodeId): NodeId[] {
  return ADJ[id];
}

export function edgeBetween(a: NodeId, b: NodeId): Edge | undefined {
  return EDGES.find(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
}

export function isCrossingEdge(a: NodeId, b: NodeId): boolean {
  return edgeBetween(a, b)?.crossing === true;
}

/** BFS 最短路径（按 NODES 顺序展开，结果确定）。exclude 中的节点不可通行。 */
export function shortestPath(
  from: NodeId,
  to: NodeId,
  exclude: ReadonlySet<NodeId> = new Set(),
): NodeId[] | null {
  if (from === to) return [from];
  if (exclude.has(to)) return null;
  const prev = new Map<NodeId, NodeId | null>([[from, null]]);
  const queue: NodeId[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of ADJ[cur]) {
      if (prev.has(nb) || exclude.has(nb)) continue;
      prev.set(nb, cur);
      if (nb === to) {
        const path: NodeId[] = [to];
        let p: NodeId | null = cur;
        while (p !== null) {
          path.unshift(p);
          p = prev.get(p) ?? null;
        }
        return path;
      }
      queue.push(nb);
    }
  }
  return null;
}

export function bfsDistance(
  from: NodeId,
  to: NodeId,
  exclude: ReadonlySet<NodeId> = new Set(),
): number | null {
  const p = shortestPath(from, to, exclude);
  return p === null ? null : p.length - 1;
}

/** 从 from 向 target 走一步（最短路径第一步）；已到达或不可达返回 null。 */
export function nextStep(
  from: NodeId,
  target: NodeId,
  exclude: ReadonlySet<NodeId> = new Set(),
): NodeId | null {
  const p = shortestPath(from, target, exclude);
  if (p === null || p.length < 2) return null;
  return p[1];
}

/** 从 from 远离 target 走一步（取与 target 距离最大的相邻点）。 */
export function stepAway(
  from: NodeId,
  target: NodeId,
  exclude: ReadonlySet<NodeId> = new Set(),
): NodeId | null {
  let best: NodeId | null = null;
  let bestD = -1;
  for (const nb of ADJ[from]) {
    if (exclude.has(nb)) continue;
    const d = bfsDistance(nb, target, exclude);
    if (d !== null && d > bestD) {
      bestD = d;
      best = nb;
    }
  }
  return best;
}

export type EnemyId = "chuan" | "qian" | "central" | "dian";

export const ENEMY_NAMES: Record<EnemyId, Record<Lang3, string>> = {
  chuan: { zh: "川军", tw: "川軍", en: "Sichuan Army" },
  qian: { zh: "黔军", tw: "黔軍", en: "Guizhou Army" },
  central: { zh: "中央军", tw: "中央軍", en: "Central Army" },
  dian: { zh: "滇军", tw: "滇軍", en: "Yunnan Army" },
};

export const ENEMY_MARK: Record<EnemyId, string> = {
  chuan: "川",
  qian: "黔",
  central: "中",
  dian: "滇",
};

/** 敌军战力（决定伏击胜算）：中央军最强，滇军次之，川军、黔军较弱。 */
export const ENEMY_STRENGTH: Record<EnemyId, number> = {
  central: 3,
  dian: 2,
  chuan: 2,
  qian: 1,
};

/** 黔军固定巡逻路线（循环）。 */
export const QIAN_PATROL: NodeId[] = ["tongzi", "loushanguan", "zunyi", "renhuai"];

/** 史实路线（复盘对照用）：按地图可走的节点串起来的战役主线——四渡在二郎滩渡河后不回头北上，经仁怀、茅台南下乌江（与史实进军方向一致）；仁怀、茅台前后各到两次。 */
export const HISTORICAL_ROUTE: NodeId[] = [
  "tucheng", "yuanhou", "zhaxi", "gulin", "taipingdu", "erlangtan",
  "tongzi", "loushanguan", "zunyi", "renhuai", "maotai", "xuyong",
  "erlangtan", "renhuai", "maotai", "wujiang", "yunnan",
];

export type Difficulty = "easy" | "historical" | "hard";

export const DIFFICULTY_NAMES: Record<Difficulty, Record<Lang3, string>> = {
  easy: { zh: "简单", tw: "簡單", en: "Easy" },
  historical: { zh: "史实", tw: "史實", en: "Historical" },
  hard: { zh: "困难", tw: "困難", en: "Hard" },
};

export interface DifficultyConfig {
  startMorale: number;
  startSupplies: number;
  /** 事件出现概率（每回合行军后） */
  eventChance: number;
  /** 事件代价倍率 */
  eventSeverity: number;
  /** 中央军在多少距离内会双倍追击（0 表示从不） */
  centralDoubleRange: number;
  /** 川军每几回合动一格（1 表示每回合都动） */
  chuanMoveEvery: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    startMorale: 85, startSupplies: 60, eventChance: 0.5, eventSeverity: 0.5,
    centralDoubleRange: 0, chuanMoveEvery: 2,
  },
  historical: {
    startMorale: 70, startSupplies: 45, eventChance: 0.6, eventSeverity: 1,
    centralDoubleRange: 0, chuanMoveEvery: 2,
  },
  hard: {
    startMorale: 60, startSupplies: 35, eventChance: 0.7, eventSeverity: 1.5,
    centralDoubleRange: 4, chuanMoveEvery: 1,
  },
};

export const START_MORALE = 70;
export const START_SUPPLIES = 45;
export const MOVE_MORALE_COST = 2;
export const MOVE_SUPPLIES_COST = 3;
export const FORCED_MORALE_COST = 5;
export const FORCED_SUPPLIES_COST = 6;
export const STEADY_MORALE_BONUS = 2;
export const CROSS_MORALE_COST = 3;
export const CROSS_SUPPLIES_COST = 8;
export const RAIN_CROSS_EXTRA = 4;
export const SUPPLY_BONUS = 12;
export const REST_MORALE = 8;
export const REST_SUPPLIES_COST = 2;
export const LOUSHANGUAN_BONUS = 20;
export const FEINT_SKIP_TURNS = 2;
export const DECOY_MORALE_COST = 6;
export const DECOY_TURNS = 2;
export const QUIZ_MORALE_BONUS = 5;
export const QUIZ_SUPPLIES_BONUS = 5;
export const COMBAT_MORALE_COST = 3;
export const COMBAT_WIN_SUPPLIES = 8;
export const COMBAT_WIN_MORALE = 5;
export const COMBAT_LOSE_MORALE = 8;
export const COMBAT_LOSE_SUPPLIES = 6;

/** 确定性伪随机数（mulberry32），存在 state 里，测试可固定种子。 */
export function nextRandom(rng: number): [number, number] {
  let t = (rng + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, t];
}

export function shuffle<T>(arr: readonly T[], rng: number): [T[], number] {
  const out = [...arr];
  let r = rng;
  for (let i = out.length - 1; i > 0; i--) {
    const [v, nr] = nextRandom(r);
    r = nr;
    const j = Math.floor(v * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return [out, r];
}

export type LoseReason = "caught" | "morale" | "supplies";
export type MoveMode = "steady" | "rush";
export type Awaiting = "quiz" | "event" | "combat" | null;

export type LogEntry =
  | { id: number; turn: number; kind: "move"; from: NodeId; to: NodeId; mode: MoveMode }
  | { id: number; turn: number; kind: "cross"; from: NodeId; to: NodeId; n: number }
  | { id: number; turn: number; kind: "rest" }
  | { id: number; turn: number; kind: "feint" }
  | { id: number; turn: number; kind: "decoy"; enemy: EnemyId }
  | { id: number; turn: number; kind: "event"; event: "supply" | "loushanguan"; node: NodeId }
  | { id: number; turn: number; kind: "enemy"; moves: { enemy: EnemyId; to: NodeId }[] }
  | { id: number; turn: number; kind: "info"; key: "start" | "crossSkip" | "feintSkip" }
  | { id: number; turn: number; kind: "gameEvent"; eventId: string; option: number }
  | { id: number; turn: number; kind: "combat"; enemy: EnemyId; won: boolean; chance: number; defense: boolean }
  | { id: number; turn: number; kind: "evade"; enemy: EnemyId; from: NodeId; to: NodeId }
  | { id: number; turn: number; kind: "quiz"; question: string; correct: boolean }
  | { id: number; turn: number; kind: "codex"; cardId: string }
  | { id: number; turn: number; kind: "win" }
  | { id: number; turn: number; kind: "lose"; reason: LoseReason; node?: NodeId };

export interface EnemyState {
  id: EnemyId;
  node: NodeId;
  /** 下一步意图（地图上虚线预告） */
  intent: NodeId | null;
  /** 被打乱/震慑到的回合数上限：回合数 <= 此值时不动 */
  staggeredUntil: number;
  /** 被分兵疑敌调开的回合数上限 */
  decoyedUntil: number;
}

export interface PendingCombat {
  enemy: EnemyId;
  chance: number;
  /** true = 敌军扑到红军脸上触发的遭遇战（无伏击地利，败则被俘）；false = 红军主动打的伏击。 */
  defense: boolean;
}

export interface GameState {
  phase: "start" | "playing" | "won" | "lost";
  difficulty: Difficulty;
  player: NodeId;
  prevPlayer: NodeId;
  turn: number;
  morale: number;
  supplies: number;
  crossings: number;
  enemies: EnemyState[];
  visitedSupply: NodeId[];
  visitedFords: NodeId[];
  route: NodeId[];
  feintUsed: boolean;
  feintTurnsLeft: number;
  loushanguanDone: boolean;
  battlesWon: number;
  battlesFought: number;
  quizQueue: string[];
  askedQuiz: string[];
  quizAnswered: number;
  quizCorrect: number;
  pendingEventId: string | null;
  eventDeck: string[];
  rng: number;
  pendingCombat: PendingCombat | null;
  awaiting: Awaiting;
  needsEnemyPhase: boolean;
  crossedThisTurn: boolean;
  codex: string[];
  newlyUnlocked: string[];
  achievements: string[];
  qianPatrolIdx: number;
  rainPenalty: boolean;
  ferryBlocked: { node: NodeId; untilTurn: number } | null;
  log: LogEntry[];
  loseReason?: LoseReason;
  /** 最近一次渡河对应的战史小注编号（1–4），0 表示暂无 */
  lastNote: number;
}

const NO_YUNNAN: ReadonlySet<NodeId> = new Set(["yunnan"]);

export function enemyAt(s: GameState, id: NodeId): EnemyState | undefined {
  return s.enemies.find((e) => e.node === id);
}

export function initialState(seed?: number): GameState {
  const rng = seed ?? ((Date.now() % 2147483647) | 0);
  const [deck, rng2] = shuffle(EVENT_IDS, rng);
  const s: GameState = {
    phase: "start",
    difficulty: "historical",
    player: "tucheng",
    prevPlayer: "tucheng",
    turn: 0,
    morale: DIFFICULTY_CONFIG.historical.startMorale,
    supplies: DIFFICULTY_CONFIG.historical.startSupplies,
    crossings: 0,
    enemies: [
      { id: "chuan", node: "chishui", intent: null, staggeredUntil: 0, decoyedUntil: 0 },
      { id: "qian", node: "tongzi", intent: null, staggeredUntil: 0, decoyedUntil: 0 },
      { id: "central", node: "renhuai", intent: null, staggeredUntil: 0, decoyedUntil: 0 },
    ],
    visitedSupply: [],
    visitedFords: [],
    route: ["tucheng"],
    feintUsed: false,
    feintTurnsLeft: 0,
    loushanguanDone: false,
    battlesWon: 0,
    battlesFought: 0,
    quizQueue: [],
    askedQuiz: [],
    quizAnswered: 0,
    quizCorrect: 0,
    pendingEventId: null,
    eventDeck: deck,
    rng: rng2,
    pendingCombat: null,
    awaiting: null,
    needsEnemyPhase: false,
    crossedThisTurn: false,
    codex: ["mao"],
    newlyUnlocked: [],
    achievements: [],
    qianPatrolIdx: 1,
    rainPenalty: false,
    ferryBlocked: null,
    log: [{ id: 0, turn: 0, kind: "info", key: "start" }],
    lastNote: 0,
  };
  return { ...s, enemies: computeIntents(s) };
}

export function startGame(s: GameState, difficulty: Difficulty, seed?: number): GameState {
  const fresh = initialState(seed);
  const [deck, rng] = shuffle(eventDeckFor(difficulty), fresh.rng);
  return {
    ...fresh,
    difficulty,
    morale: DIFFICULTY_CONFIG[difficulty].startMorale,
    supplies: DIFFICULTY_CONFIG[difficulty].startSupplies,
    eventDeck: deck,
    rng,
    phase: "playing",
  };
}

export type MoveProblem = "notAdjacent" | "occupied" | "locked" | "blockedFerry" | "noPath";

/** 渡口节点集合。 */
export const FORD_NODES: NodeId[] = ["yuanhou", "taipingdu", "erlangtan", "maotai"];

/** 两步行军的中间路径（forced 模式）：返回 [中间点, 终点]，无合法路径返回 null。 */
export function forcedPath(s: GameState, target: NodeId): [NodeId, NodeId] | null {
  if (target === s.player) return null;
  for (const mid of ADJ[s.player]) {
    if (mid === target) continue;
    if (enemyAt(s, mid)) continue;
    if (!ADJ[mid].includes(target)) continue;
    if (target === "yunnan" && s.crossings < 4) continue;
    if (enemyAt(s, target)) continue;
    if (isFerryBlocked(s, mid) || isFerryBlocked(s, target)) continue;
    return [mid, target];
  }
  return null;
}

export function isFerryBlocked(s: GameState, node: NodeId): boolean {
  return s.ferryBlocked !== null && s.ferryBlocked.node === node && s.turn < s.ferryBlocked.untilTurn;
}

/** 走法校验（组件与模拟共用）：相邻/两步、未被敌军占据、四渡未完成时不得南下云南。 */
export function validateMove(s: GameState, target: NodeId, mode: MoveMode): MoveProblem | null {
  if (target === s.player) return "notAdjacent";
  if (mode === "steady") {
    if (!ADJ[s.player].includes(target)) return "notAdjacent";
    if (enemyAt(s, target)) return "occupied";
    if (target === "yunnan" && s.crossings < 4) return "locked";
    if (isFerryBlocked(s, target)) return "blockedFerry";
    return null;
  }
  const p = forcedPath(s, target);
  if (!p) {
    if (ADJ[s.player].includes(target) && enemyAt(s, target)) return "occupied";
    if (target === "yunnan" && s.crossings < 4) return "locked";
    return "noPath";
  }
  return null;
}

/** 稳步模式可达节点；急行模式可达节点（两步）。 */
export function reachableNodes(s: GameState, mode: MoveMode): Set<NodeId> {
  const out = new Set<NodeId>();
  if (mode === "steady") {
    for (const nb of ADJ[s.player]) {
      if (validateMove(s, nb, "steady") === null) out.add(nb);
    }
    return out;
  }
  for (const mid of ADJ[s.player]) {
    if (enemyAt(s, mid) || isFerryBlocked(s, mid)) continue;
    for (const nb of ADJ[mid]) {
      if (nb === s.player) continue;
      if (validateMove(s, nb, "rush") === null) out.add(nb);
    }
  }
  return out;
}

export function minEnemyDistance(s: GameState): number | null {
  let best: number | null = null;
  for (const e of s.enemies) {
    const d = bfsDistance(e.node, s.player, NO_YUNNAN);
    if (d !== null && (best === null || d < best)) best = d;
  }
  return best;
}

/** 伏击胜算（百分比）：士气越高胜算越大，敌军越强胜算越低。 */
/** 伏击胜算：基础 70 − 战力×10，伏击方占地利 +10，再按士气修正，夹取 15–90。遭遇战（defense）没有伏击地利。 */
export function combatChance(s: GameState, enemy: EnemyId, ambush = true): number {
  const base = 70 - ENEMY_STRENGTH[enemy] * 10 + (ambush ? 10 : 0);
  const chance = base + Math.round((s.morale - 50) / 2);
  return Math.max(15, Math.min(90, chance));
}

/** 敌军本回合的追击目标。 */
function enemyTarget(s: GameState, e: EnemyState): NodeId {
  if (e.id === "chuan") {
    // 川军：缓慢地去堵离红军最近的渡口；已在渡口上就守住它。
    if (FORD_NODES.includes(e.node)) return e.node;
    let best: NodeId | null = null;
    let bestD = Infinity;
    for (const f of FORD_NODES) {
      const d = bfsDistance(f, s.player, NO_YUNNAN);
      if (d !== null && d < bestD) {
        bestD = d;
        best = f;
      }
    }
    return best ?? s.player;
  }
  if (e.id === "qian") {
    // 黔军：沿固定路线巡逻；红军进入两格内才追击。
    const d = bfsDistance(e.node, s.player, NO_YUNNAN);
    if (d !== null && d <= 2) return s.player;
    return QIAN_PATROL[s.qianPatrolIdx % QIAN_PATROL.length];
  }
  return s.player;
}

/** 敌军一步能走几格：中央军逼近时双倍追击，川军隔回合才动。 */
function enemySteps(s: GameState, e: EnemyState): number {
  const cfg = DIFFICULTY_CONFIG[s.difficulty];
  if (e.id === "central") {
    const d = bfsDistance(e.node, s.player, NO_YUNNAN);
    if (cfg.centralDoubleRange > 0 && d !== null && d <= cfg.centralDoubleRange) return 2;
    return 1;
  }
  if (e.id === "chuan") {
    return s.turn % cfg.chuanMoveEvery === 0 ? 1 : 0;
  }
  return 1;
}

/** 为每支敌军算出下一步意图（不实际移动），供地图预告。 */
export function computeIntents(s: GameState): EnemyState[] {
  return s.enemies.map((e) => {
    if (e.staggeredUntil >= s.turn) return { ...e, intent: null };
    if (e.decoyedUntil >= s.turn) {
      return { ...e, intent: stepAway(e.node, s.player, NO_YUNNAN) };
    }
    if (s.feintTurnsLeft > 0 || s.crossedThisTurn) return { ...e, intent: null };
    const target = enemyTarget(s, e);
    if (enemySteps(s, e) === 0) return { ...e, intent: null };
    return { ...e, intent: nextStep(e.node, target, NO_YUNNAN) };
  });
}

let logSeq = 1;
function nextLogId(): number {
  return logSeq++;
}

/** 敌军行动阶段：按各自行为移动；渡河后、佯攻期内、分兵疑敌期内或被打乱时停步。 */
function moveEnemies(s: GameState): GameState {
  const log = [...s.log];
  if (s.crossedThisTurn) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "info", key: "crossSkip" });
    return { ...s, log, crossedThisTurn: false };
  }
  if (s.feintTurnsLeft > 0) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "info", key: "feintSkip" });
    return { ...s, log, feintTurnsLeft: s.feintTurnsLeft - 1, crossedThisTurn: false };
  }
  let qianPatrolIdx = s.qianPatrolIdx;
  const enemies = s.enemies.map((e) => {
    if (e.staggeredUntil >= s.turn) return e;
    if (e.decoyedUntil >= s.turn) {
      // 被分兵疑敌调开：转身远离红军一格。
      const away = stepAway(e.node, s.player, NO_YUNNAN);
      return away && away !== e.node ? { ...e, node: away } : e;
    }
    const target = enemyTarget(s, e);
    let node = e.node;
    const steps = enemySteps(s, e);
    for (let i = 0; i < steps; i++) {
      const step = nextStep(node, target, NO_YUNNAN);
      if (!step) break;
      node = step;
      if (node === target) break;
    }
    return { ...e, node };
  });
  // 黔军到达巡逻点后推进到下一个巡逻目标。
  const qian = enemies.find((e) => e.id === "qian");
  if (qian && qian.node === QIAN_PATROL[qianPatrolIdx % QIAN_PATROL.length]) {
    qianPatrolIdx += 1;
  }
  const moves = enemies
    .filter((e, i) => e.node !== s.enemies[i].node)
    .map((e) => ({ enemy: e.id, to: e.node }));
  if (moves.length > 0) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "enemy", moves });
  }
  return { ...s, enemies, qianPatrolIdx, log, crossedThisTurn: false };
}

/** 结算敌军阶段并检查被抓；随后刷新各敌军下一步意图。
 * 先模拟敌军移动：若有敌军会踩到红军脸上，不直接判被抓，而是先打一场遭遇战
 * （防御战，无伏击地利，败则被俘）——玩家总有一次用骰子自救的机会。 */
export function advanceEnemies(s: GameState): GameState {
  if (s.phase !== "playing" || !s.needsEnemyPhase) return s;
  const sim = moveEnemies({ ...s, needsEnemyPhase: false });
  const catcher = sim.enemies.find(
    (e, i) => e.node === s.player && s.enemies[i].node !== s.player,
  );
  if (catcher) {
    return {
      ...s,
      pendingCombat: {
        enemy: catcher.id,
        chance: combatChance(s, catcher.id, false),
        defense: true,
      },
      awaiting: "combat",
    };
  }
  let ns = sim;
  if (ns.enemies.some((e) => e.node === ns.player)) {
    return finishGame({
      ...ns,
      phase: "lost",
      loseReason: "caught",
      log: [
        ...ns.log,
        { id: nextLogId(), turn: ns.turn, kind: "lose", reason: "caught", node: ns.player },
      ],
    });
  }
  return { ...ns, enemies: computeIntents(ns) };
}

function applyResourceLoss(s: GameState): GameState | null {
  if (s.morale <= 0) {
    return {
      ...s,
      phase: "lost",
      loseReason: "morale",
      log: [...s.log, { id: nextLogId(), turn: s.turn, kind: "lose", reason: "morale" }],
    };
  }
  if (s.supplies <= 0) {
    return {
      ...s,
      phase: "lost",
      loseReason: "supplies",
      log: [...s.log, { id: nextLogId(), turn: s.turn, kind: "lose", reason: "supplies" }],
    };
  }
  return null;
}

/** 解锁图鉴卡：返回新增解锁的卡片 id。 */
function unlockCodex(s: GameState, ids: string[]): { codex: string[]; newly: string[] } {
  const codex = [...s.codex];
  const newly: string[] = [];
  for (const id of ids) {
    if (!codex.includes(id)) {
      codex.push(id);
      newly.push(id);
    }
  }
  return { codex, newly };
}

/** 根据当前局面判定应解锁的图鉴卡。 */
function codexUnlocksFor(s: GameState): string[] {
  const ids: string[] = [];
  if (s.crossings >= 1) ids.push("tucheng", "yuanhou");
  if (s.crossings >= 2) ids.push("taipingdu", "erlangtan");
  if (s.crossings >= 3) ids.push("maotai");
  if (s.loushanguanDone) ids.push("loushanguan");
  if (s.route.includes("zunyi") && s.crossings >= 2) ids.push("zunyi-meeting", "zhou");
  if (s.battlesWon >= 1) ids.push("zhu");
  if (s.phase === "won") ids.push("jinsha", "liu");
  return ids;
}

/** 按  quiz → event → combat 的顺序，决定接下来要弹出的对话框。 */
function setAwaiting(s: GameState): GameState {
  if (s.phase !== "playing") return { ...s, awaiting: null };
  if (s.quizQueue.length > 0) return { ...s, awaiting: "quiz" };
  if (s.pendingEventId !== null) return { ...s, awaiting: "event" };
  if (s.pendingCombat !== null) return { ...s, awaiting: "combat" };
  return { ...s, awaiting: null };
}

/** 抽一张事件（按难度概率）；返回更新后的 state（可能无事件）。 */
/** 本局可抽的事件牌堆：滇军增援只出现在困难难度（史实难度保持原版的三路敌军）。 */
export function eventDeckFor(difficulty: Difficulty): string[] {
  if (difficulty === "hard") return [...EVENT_IDS];
  return EVENT_IDS.filter((id) => id !== "reinforcements");
}

function maybeDrawEvent(s: GameState): GameState {
  const cfg = DIFFICULTY_CONFIG[s.difficulty];
  const [v, rng] = nextRandom(s.rng);
  let { eventDeck, rng: r2 } = s;
  if (v >= cfg.eventChance) return { ...s, rng };
  if (eventDeck.length === 0) {
    const [deck, nr] = shuffle(eventDeckFor(s.difficulty), r2);
    eventDeck = deck;
    r2 = nr;
  }
  const [id, ...rest] = eventDeck;
  return { ...s, rng: r2, eventDeck: rest, pendingEventId: id };
}

export function doMove(s: GameState, target: NodeId, mode: MoveMode): GameState {
  if (s.phase !== "playing" || s.awaiting !== null) return s;
  if (validateMove(s, target, mode) !== null) return s;
  const from = s.player;
  const turn = s.turn + 1;
  let morale = s.morale;
  let supplies = s.supplies;
  let crossings = s.crossings;
  let lastNote = s.lastNote;
  let visitedSupply = s.visitedSupply;
  let visitedFords = s.visitedFords;
  let loushanguanDone = s.loushanguanDone;
  let rainPenalty = s.rainPenalty;
  const log: LogEntry[] = [...s.log];
  let crossed = false;
  let crossCount = 0;

  // 路径：稳步一格，急行两格（经中间点）。
  const legs: [NodeId, NodeId][] =
    mode === "steady"
      ? [[from, target]]
      : (() => {
          const p = forcedPath(s, target)!;
          return [[from, p[0]], [p[0], target]];
        })();

  if (mode === "steady") {
    morale -= MOVE_MORALE_COST;
    morale = Math.min(100, morale + STEADY_MORALE_BONUS);
    supplies -= MOVE_SUPPLIES_COST;
  } else {
    morale -= FORCED_MORALE_COST;
    supplies -= FORCED_SUPPLIES_COST;
  }

  // 原地掉头（立刻退回刚来的节点）不算一次渡河：渡河计数只认推进战役的渡河，
  // 否则在同一渡口来回横跳就能刷满四渡。
  const isUTurn = target === s.prevPlayer;

  for (const [a, b] of legs) {
    if (isCrossingEdge(a, b)) {
      crossed = true;
      morale -= CROSS_MORALE_COST;
      supplies -= CROSS_SUPPLIES_COST;
      if (rainPenalty) {
        supplies -= RAIN_CROSS_EXTRA;
        rainPenalty = false;
      }
      if (!isUTurn) {
        crossCount += 1;
        crossings += 1;
        if (crossings <= 4) lastNote = crossings;
      }
    }
  }
  if (crossed) {
    log.push({ id: nextLogId(), turn, kind: "cross", from, to: target, n: crossings });
  } else {
    log.push({ id: nextLogId(), turn, kind: "move", from, to: target, mode });
  }

  // 渡口图鉴：踩上渡口即解锁。
  for (const [, b] of legs) {
    if (FORD_NODES.includes(b) && !visitedFords.includes(b)) {
      visitedFords = [...visitedFords, b];
    }
  }
  const node = NODE_MAP[target];
  if (node.supply && !visitedSupply.includes(target)) {
    supplies = Math.min(100, supplies + SUPPLY_BONUS);
    visitedSupply = [...visitedSupply, target];
    log.push({ id: nextLogId(), turn, kind: "event", event: "supply", node: target });
  }
  if (
    !loushanguanDone &&
    crossings >= 2 &&
    (target === "loushanguan" || target === "zunyi")
  ) {
    morale = Math.min(100, morale + LOUSHANGUAN_BONUS);
    loushanguanDone = true;
    log.push({ id: nextLogId(), turn, kind: "event", event: "loushanguan", node: target });
  }

  // 问答：每新完成一次渡河，排一道题（不重复）。
  let quizQueue = [...s.quizQueue];
  let rng = s.rng;
  if (crossCount > 0) {
    const remaining = QUIZ_BANK.filter(
      (q) => !s.askedQuiz.includes(q.id) && !quizQueue.includes(q.id),
    );
    const [picked, nr] = pickQuiz(remaining, rng, crossCount);
    rng = nr;
    quizQueue = [...quizQueue, ...picked.map((q) => q.id)];
  }

  let ns: GameState = {
    ...s,
    player: target,
    prevPlayer: from,
    turn,
    morale,
    supplies,
    crossings,
    visitedSupply,
    visitedFords,
    route: [...s.route, target],
    loushanguanDone,
    lastNote,
    log,
    crossedThisTurn: crossed,
    rainPenalty,
    quizQueue,
    rng,
    needsEnemyPhase: true,
  };

  // 图鉴解锁（渡河、夺关、重占遵义等）。
  const { codex, newly } = unlockCodex(ns, codexUnlocksFor(ns));
  ns = { ...ns, codex, newlyUnlocked: [...ns.newlyUnlocked, ...newly] };
  for (const id of newly) {
    ns = { ...ns, log: [...ns.log, { id: nextLogId(), turn, kind: "codex", cardId: id }] };
  }

  if (target === "yunnan") {
    const won: GameState = { ...ns, phase: "won" as const, needsEnemyPhase: false, log: [...ns.log, { id: nextLogId(), turn, kind: "win" }] };
    const { codex: c2, newly: n2 } = unlockCodex(won, codexUnlocksFor(won));
    const withCodex: GameState = { ...won, codex: c2, newlyUnlocked: [...won.newlyUnlocked, ...n2] };
    return finishGame(withCodex);
  }
  const lost = applyResourceLoss(ns);
  if (lost) return finishGame(lost);

  // 抽事件（行军后），再决定是否弹出战斗提示。
  // 只有“清醒”的敌军才会拦路：被打乱、被分兵疑敌调开、或佯攻期内的敌军注意力不在红军身上，不会触发战斗——这正是分兵疑敌能帮你通过关口的原因。
  ns = maybeDrawEvent(ns);
  const adjacent = ns.feintTurnsLeft > 0
    ? undefined
    : ns.enemies.find(
        (e) =>
          e.staggeredUntil < ns.turn &&
          e.decoyedUntil < ns.turn &&
          bfsDistance(e.node, ns.player, NO_YUNNAN) === 1,
      );
  if (adjacent) {
    ns = { ...ns, pendingCombat: { enemy: adjacent.id, chance: combatChance(ns, adjacent.id, true), defense: false } };
  }
  return setAwaiting(ns);
}

/** 从剩余题库里按 PRNG 抽 n 道题（不重复）。 */
function pickQuiz(pool: { id: string }[], rng: number, n: number): [{ id: string }[], number] {
  const [shuffled, r] = shuffle(pool.map((q) => q.id), rng);
  return [shuffled.slice(0, n).map((id) => ({ id })), r];
}

export function doRest(s: GameState): GameState {
  if (s.phase !== "playing" || s.awaiting !== null) return s;
  // 休整永远可行（没有软锁）：敌军在附近时休整很危险，敌军阶段仍可能追上你。
  const turn = s.turn + 1;
  const morale = Math.min(100, s.morale + REST_MORALE);
  const supplies = s.supplies - REST_SUPPLIES_COST;
  let ns: GameState = {
    ...s,
    prevPlayer: s.player,
    turn,
    morale,
    supplies,
    crossedThisTurn: false,
    needsEnemyPhase: true,
    log: [...s.log, { id: nextLogId(), turn, kind: "rest" }],
  };
  const lost = applyResourceLoss(ns);
  if (lost) return finishGame(lost);
  return setAwaiting(ns);
}

/** 佯攻贵阳：一次性免费行动，把每支敌军调到离玩家最远的地点，并让敌军停两回合。 */
export function doFeint(s: GameState): GameState {
  if (s.feintUsed || s.phase !== "playing" || s.awaiting !== null) return s;
  const taken = new Set<NodeId>([s.player]);
  const enemies = s.enemies.map((e) => {
    let best: NodeId | null = null;
    let bestD = -1;
    for (const n of NODES) {
      if (n.id === "yunnan" || taken.has(n.id)) continue;
      const d = bfsDistance(n.id, s.player, NO_YUNNAN);
      if (d !== null && d > bestD) {
        bestD = d;
        best = n.id;
      }
    }
    if (best) taken.add(best);
    return best ? { ...e, node: best, intent: null } : e;
  });
  return {
    ...s,
    feintUsed: true,
    feintTurnsLeft: FEINT_SKIP_TURNS,
    enemies,
    log: [...s.log, { id: nextLogId(), turn: s.turn, kind: "feint" }],
  };
}

/** 分兵疑敌：花士气把一支敌军调开两回合（它转身远离红军）。不指定目标时调开最近的一支；可指定要调开的敌军。 */
export function doDecoy(s: GameState, enemyId?: EnemyId): GameState {
  if (s.phase !== "playing" || s.awaiting !== null) return s;
  if (s.morale <= DECOY_MORALE_COST) return s;
  let target: EnemyState | null = null;
  if (enemyId) {
    target = s.enemies.find((e) => e.id === enemyId) ?? null;
  } else {
    let bestD = Infinity;
    for (const e of s.enemies) {
      const d = bfsDistance(e.node, s.player, NO_YUNNAN);
      if (d !== null && d < bestD) {
        bestD = d;
        target = e;
      }
    }
  }
  if (!target) return s;
  const enemies = s.enemies.map((e) =>
    e.id === (target as EnemyState).id
      ? { ...e, decoyedUntil: s.turn + DECOY_TURNS, intent: null }
      : e,
  );
  return {
    ...s,
    morale: s.morale - DECOY_MORALE_COST,
    enemies,
    log: [
      ...s.log,
      { id: nextLogId(), turn: s.turn, kind: "decoy", enemy: (target as EnemyState).id },
    ],
  };
}

/** 伏击结算：roll 为 0–99 的随机数（缺省用 state 的 PRNG）。胜：敌军后撤两格、被打乱一回合、缴获粮草；败：士气粮草受损、敌军也被打乱一回合（双方重整）。 */
export function resolveCombat(
  s: GameState,
  choice: "fight" | "evade",
  roll?: number,
): GameState {
  if (s.phase !== "playing" || !s.pendingCombat) return s;
  const { enemy, chance, defense } = s.pendingCombat;
  let ns: GameState = { ...s, pendingCombat: null };
  if (choice === "evade") {
    // 避战：退回上一个地点（来路一定是空的——敌军阶段还没跑，来路上没有敌军）。
    // 若上一个地点就是当前位置（例如休整后被遭遇），则向远离敌军的方向退一步；无路可退时原地不动。
    let back = s.prevPlayer;
    if (back === s.player) {
      const away = stepAway(s.player, ns.enemies.find((e) => e.id === enemy)?.node ?? s.player, NO_YUNNAN);
      if (away) back = away;
    }
    const evaded: GameState = {
      ...ns,
      player: back,
      log: [
        ...ns.log,
        { id: nextLogId(), turn: ns.turn, kind: "evade", enemy, from: s.player, to: back },
      ],
    };
    return setAwaiting(evaded);
  }
  let r = roll;
  if (r === undefined) {
    const [v, nr] = nextRandom(ns.rng);
    r = Math.floor(v * 100);
    ns = { ...ns, rng: nr };
  }
  const won = (r as number) < chance;
  const log: LogEntry[] = [...ns.log, { id: nextLogId(), turn: ns.turn, kind: "combat", enemy, won, chance, defense }];
  if (won) {
    const target = ns.enemies.find((e) => e.id === enemy)!;
    let node = target.node;
    for (let i = 0; i < 2; i++) {
      const away = stepAway(node, ns.player, NO_YUNNAN);
      if (!away || away === node) break;
      node = away;
    }
    const enemies = ns.enemies.map((e) =>
      e.id === enemy ? { ...e, node, staggeredUntil: ns.turn + 1, intent: null } : e,
    );
    ns = {
      ...ns,
      enemies,
      morale: Math.min(100, ns.morale - COMBAT_MORALE_COST + COMBAT_WIN_MORALE),
      supplies: Math.min(100, ns.supplies + COMBAT_WIN_SUPPLIES),
      battlesWon: ns.battlesWon + 1,
      battlesFought: ns.battlesFought + 1,
      log,
    };
  } else {
    const enemies = ns.enemies.map((e) =>
      e.id === enemy ? { ...e, staggeredUntil: ns.turn + 1, intent: null } : e,
    );
    ns = {
      ...ns,
      enemies,
      morale: ns.morale - COMBAT_MORALE_COST - COMBAT_LOSE_MORALE,
      supplies: ns.supplies - COMBAT_LOSE_SUPPLIES,
      battlesFought: ns.battlesFought + 1,
      log,
    };
  }
  const { codex, newly } = unlockCodex(ns, codexUnlocksFor(ns));
  ns = { ...ns, codex, newlyUnlocked: [...ns.newlyUnlocked, ...newly] };
  if (defense && !won) {
    // 遭遇战打输了：敌军已经扑到脸上，无路可退——被俘。
    return finishGame({
      ...ns,
      phase: "lost",
      loseReason: "caught",
      log: [
        ...ns.log,
        { id: nextLogId(), turn: ns.turn, kind: "lose", reason: "caught", node: ns.player },
      ],
    });
  }
  const lost = applyResourceLoss(ns);
  if (lost) return finishGame(lost);
  return setAwaiting(ns);
}

/** 回答问答：答对 +士气/粮草；答错只显示正确答案与讲解，不重罚。 */
export function resolveQuiz(s: GameState, optionIndex: number): GameState {
  if (s.phase !== "playing" || s.quizQueue.length === 0) return s;
  const q = QUIZ_BANK.find((x) => x.id === s.quizQueue[0]);
  if (!q) return s;
  const correct = optionIndex === q.answer;
  const ns: GameState = {
    ...s,
    quizQueue: s.quizQueue.slice(1),
    askedQuiz: [...s.askedQuiz, q.id],
    quizAnswered: s.quizAnswered + 1,
    quizCorrect: s.quizCorrect + (correct ? 1 : 0),
    morale: correct ? Math.min(100, s.morale + QUIZ_MORALE_BONUS) : s.morale,
    supplies: correct ? Math.min(100, s.supplies + QUIZ_SUPPLIES_BONUS) : s.supplies,
    log: [...s.log, { id: nextLogId(), turn: s.turn, kind: "quiz", question: q.id, correct }],
  };
  return setAwaiting(ns);
}

/** 选择事件选项：按难度倍率折算代价（向下取整，至少 1 点；事件不直接致死）。 */
export function resolveEvent(s: GameState, optionIndex: number): GameState {
  if (s.phase !== "playing" || !s.pendingEventId) return s;
  const def = EVENT_DEFS[s.pendingEventId];
  if (!def || !def.options[optionIndex]) return s;
  const opt = def.options[optionIndex];
  const sev = DIFFICULTY_CONFIG[s.difficulty].eventSeverity;
  const scale = (n: number) => (n === 0 ? 0 : Math.max(1, Math.round(Math.abs(n) * sev)) * Math.sign(n));
  let ns: GameState = { ...s, pendingEventId: null };
  const fx = opt.fx;
  if (fx.morale) ns = { ...ns, morale: ns.morale + scale(fx.morale) };
  if (fx.supplies) ns = { ...ns, supplies: ns.supplies + scale(fx.supplies) };
  if (fx.skipEnemies) ns = { ...ns, feintTurnsLeft: Math.max(ns.feintTurnsLeft, 1) };
  if (fx.crossCostPlus) ns = { ...ns, rainPenalty: true };
  if (fx.blockFerry) {
    ns = { ...ns, ferryBlocked: { node: fx.blockFerry, untilTurn: ns.turn + (fx.ferryBlockTurns ?? 1) } };
  }
  if (fx.blockNearestFerry) {
    let best: NodeId | null = null;
    let bestD = Infinity;
    for (const f of FORD_NODES) {
      const d = bfsDistance(f, ns.player, NO_YUNNAN);
      if (d !== null && d < bestD) { bestD = d; best = f; }
    }
    if (best) ns = { ...ns, ferryBlocked: { node: best, untilTurn: ns.turn + (fx.ferryBlockTurns ?? 1) } };
  }
  if (fx.addEnemy === "dian" && !ns.enemies.some((e) => e.id === "dian")) {
    const delay = fx.delayAddEnemy ?? 0;
    ns = {
      ...ns,
      enemies: [
        ...ns.enemies,
        {
          id: "dian",
          node: "guiyang",
          intent: null,
          staggeredUntil: delay > 0 ? ns.turn + delay : 0,
          decoyedUntil: 0,
        },
      ],
    };
  }
  // 事件代价不直接致死：士气/粮草最低保留 1。
  ns = {
    ...ns,
    morale: Math.max(1, Math.min(100, ns.morale)),
    supplies: Math.max(1, Math.min(100, ns.supplies)),
    log: [...ns.log, { id: nextLogId(), turn: ns.turn, kind: "gameEvent", eventId: def.id, option: optionIndex }],
  };
  return setAwaiting(ns);
}

/** 战绩评分。 */
export function computeScore(s: GameState): number {
  return (
    (s.phase === "won" ? 1000 : 0) +
    Math.max(0, s.morale) +
    Math.max(0, s.supplies) +
    s.battlesWon * 150 +
    s.quizCorrect * 50 +
    s.crossings * 50 -
    s.turn * 10
  );
}

export type RankId = "mastermind" | "steady" | "narrow" | "escaped" | "failed";

export function rankFor(s: GameState): RankId {
  if (s.phase !== "won") return "failed";
  const score = computeScore(s);
  if (score >= 1500) return "mastermind";
  if (score >= 1150) return "steady";
  if (score >= 800) return "narrow";
  return "escaped";
}

/** 成就判定（本局新获得的成就 id）。 */
export function achievementsEarned(s: GameState): string[] {
  const out: string[] = [];
  if (s.phase === "won") {
    out.push("first-win");
    if (s.turn <= 15) out.push("speed-15");
    if (s.battlesFought === 0) out.push("no-combat");
    if (s.difficulty === "hard") out.push("hard-win");
  }
  if (s.quizAnswered >= 3 && s.quizCorrect === s.quizAnswered) out.push("quiz-perfect");
  if (s.codex.length >= CODEX_CARDS.length) out.push("codex-full");
  return out;
}

/** 结算：算分、发成就。 */
function finishGame(s: GameState): GameState {
  const earned = achievementsEarned(s);
  return {
    ...s,
    awaiting: null,
    pendingCombat: null,
    pendingEventId: null,
    achievements: [...new Set([...s.achievements, ...earned])],
  };
}

// ---------- 随机事件 ----------
export interface EventFx {
  morale?: number;
  supplies?: number;
  /** 敌军下回合不动 */
  skipEnemies?: boolean;
  /** 下次渡河额外耗粮 */
  crossCostPlus?: number;
  /** 封锁指定渡口 */
  blockFerry?: NodeId;
  /** 封锁离红军最近的渡口 */
  blockNearestFerry?: boolean;
  ferryBlockTurns?: number;
  /** 增援的滇军出现 */
  addEnemy?: EnemyId;
  /** 增援延迟几回合出现 */
  delayAddEnemy?: number;
}

export interface EventOption {
  label: Record<Lang3, string>;
  desc: Record<Lang3, string>;
  fx: EventFx;
}

export interface EventDef {
  id: string;
  title: Record<Lang3, string>;
  text: Record<Lang3, string>;
  options: [EventOption, EventOption];
}

export const EVENT_DEFS: Record<string, EventDef> = {
  fog: {
    id: "fog",
    title: { zh: "大雾", tw: "大霧", en: "Heavy Fog" },
    text: {
      zh: "晨雾弥漫山谷，敌军看不清红军的去向。",
      tw: "晨霧瀰漫山谷，敵軍看不清紅軍的去向。",
      en: "Morning fog fills the valley — the enemy cannot see where the Red Army is headed.",
    },
    options: [
      {
        label: { zh: "趁雾转移", tw: "趁霧轉移", en: "Slip away in the fog" },
        desc: { zh: "敌军下回合不动；士气 −2", tw: "敵軍下回合不動；士氣 −2", en: "Enemy columns hold next turn; morale −2" },
        fx: { skipEnemies: true, morale: -2 },
      },
      {
        label: { zh: "原地待命", tw: "原地待命", en: "Hold position" },
        desc: { zh: "士气 +4", tw: "士氣 +4", en: "Morale +4" },
        fx: { morale: 4 },
      },
    ],
  },
  rain: {
    id: "rain",
    title: { zh: "暴雨", tw: "暴雨", en: "Downpour" },
    text: {
      zh: "暴雨倾盆，赤水河水暴涨，下一次渡河要多耗粮草。",
      tw: "暴雨傾盆，赤水河水暴漲，下一次渡河要多耗糧草。",
      en: "A downpour swells the Chishui — the next crossing will cost extra supplies.",
    },
    options: [
      {
        label: { zh: "冒雨渡河", tw: "冒雨渡河", en: "Cross in the rain" },
        desc: { zh: "下次渡河粮草 +4；士气 −3", tw: "下次渡河糧草 +4；士氣 −3", en: "Next crossing costs +4 supplies; morale −3" },
        fx: { crossCostPlus: 4, morale: -3 },
      },
      {
        label: { zh: "等雨停", tw: "等雨停", en: "Wait it out" },
        desc: { zh: "士气 +3", tw: "士氣 +3", en: "Morale +3" },
        fx: { morale: 3 },
      },
    ],
  },
  support: {
    id: "support",
    title: { zh: "群众支援", tw: "群眾支援", en: "Villagers' Aid" },
    text: {
      zh: "山村群众送来粮食，还打听到敌军的动向。",
      tw: "山村群眾送來糧食，還打聽到敵軍的動向。",
      en: "Villagers bring grain — and word of where the enemy is moving.",
    },
    options: [
      {
        label: { zh: "接受粮食", tw: "接受糧食", en: "Take the grain" },
        desc: { zh: "粮草 +10", tw: "糧草 +10", en: "Supplies +10" },
        fx: { supplies: 10 },
      },
      {
        label: { zh: "只要情报", tw: "只要情報", en: "Take only the news" },
        desc: { zh: "粮草 +4，士气 +3", tw: "糧草 +4，士氣 +3", en: "Supplies +4, morale +3" },
        fx: { supplies: 4, morale: 3 },
      },
    ],
  },
  wounded: {
    id: "wounded",
    title: { zh: "伤员掉队", tw: "傷員掉隊", en: "Wounded Stragglers" },
    text: {
      zh: "几名伤员跟不上队伍，乡亲们愿意帮忙安置他们。",
      tw: "幾名傷員跟不上隊伍，鄉親們願意幫忙安置他們。",
      en: "Several wounded men are falling behind, and local families offer to shelter them.",
    },
    options: [
      {
        label: { zh: "抬上伤员一起走", tw: "抬上傷員一起走", en: "Carry them along" },
        desc: { zh: "粮草 −6，士气 +6", tw: "糧草 −6，士氣 +6", en: "Supplies −6, morale +6" },
        fx: { supplies: -6, morale: 6 },
      },
      {
        label: { zh: "托付乡亲安置", tw: "託付鄉親安置", en: "Leave them with the villagers" },
        desc: { zh: "士气 −2，粮草 +2", tw: "士氣 −2，糧草 +2", en: "Morale −2, supplies +2" },
        fx: { morale: -2, supplies: 2 },
      },
    ],
  },
  reinforcements: {
    id: "reinforcements",
    title: { zh: "敌军增援", tw: "敵軍增援", en: "Enemy Reinforcements" },
    text: {
      zh: "滇军一个纵队正赶来增援，贵阳方向的敌军又多了一支。",
      tw: "滇軍一個縱隊正趕來增援，貴陽方向的敵軍又多了一支。",
      en: "A Yunnan column is marching to reinforce the enemy near Guiyang.",
    },
    options: [
      {
        label: { zh: "分兵阻击", tw: "分兵阻擊", en: "Detach a blocking force" },
        desc: { zh: "滇军晚两回合出现；士气 −8", tw: "滇軍晚兩回合出現；士氣 −8", en: "The Yunnan column arrives 2 turns late; morale −8" },
        fx: { addEnemy: "dian", delayAddEnemy: 2, morale: -8 },
      },
      {
        label: { zh: "不予理会", tw: "不予理會", en: "Ignore them" },
        desc: { zh: "滇军立即出现", tw: "滇軍立即出現", en: "The Yunnan column appears at once" },
        fx: { addEnemy: "dian" },
      },
    ],
  },
  intel: {
    id: "intel",
    title: { zh: "侦察得手", tw: "偵察得手", en: "Scouts Report Back" },
    text: {
      zh: "侦察员摸清了敌军布防，还截到一批敌军粮草。",
      tw: "偵察員摸清了敵軍佈防，還截到一批敵軍糧草。",
      en: "Scouts have mapped the enemy positions — and seized a grain convoy.",
    },
    options: [
      {
        label: { zh: "截获粮草", tw: "截獲糧草", en: "Seize the grain" },
        desc: { zh: "粮草 +8，士气 −2", tw: "糧草 +8，士氣 −2", en: "Supplies +8, morale −2" },
        fx: { supplies: 8, morale: -2 },
      },
      {
        label: { zh: "摸清敌情", tw: "摸清敵情", en: "Study the deployments" },
        desc: { zh: "士气 +5", tw: "士氣 +5", en: "Morale +5" },
        fx: { morale: 5 },
      },
    ],
  },
  ferry: {
    id: "ferry",
    title: { zh: "渡船被毁", tw: "渡船被毀", en: "Ferries Burned" },
    text: {
      zh: "敌军烧毁了最近渡口的渡船，渡河的路被堵住了。",
      tw: "敵軍燒燬了最近渡口的渡船，渡河的路被堵住了。",
      en: "The enemy has burned the boats at the nearest ferry — the crossing is blocked.",
    },
    options: [
      {
        label: { zh: "连夜抢修", tw: "連夜搶修", en: "Repair through the night" },
        desc: { zh: "粮草 −5，士气 −2，渡口保住了", tw: "糧草 −5，士氣 −2，渡口保住了", en: "Supplies −5, morale −2; the ferry stays open" },
        fx: { supplies: -5, morale: -2 },
      },
      {
        label: { zh: "绕道他渡", tw: "繞道他渡", en: "Detour to another ferry" },
        desc: { zh: "最近的渡口封锁一回合", tw: "最近的渡口封鎖一回合", en: "The nearest ferry is blocked for 1 turn" },
        fx: { blockNearestFerry: true, ferryBlockTurns: 1 },
      },
    ],
  },
  night: {
    id: "night",
    title: { zh: "夜行军", tw: "夜行軍", en: "Night March" },
    text: {
      zh: "天黑了，敌军也在扎营。夜色是最好的掩护。",
      tw: "天黑了，敵軍也在紮營。夜色是最好的掩護。",
      en: "Night falls and the enemy is making camp. Darkness is the best cover.",
    },
    options: [
      {
        label: { zh: "摸黑急行", tw: "摸黑急行", en: "March in the dark" },
        desc: { zh: "敌军下回合不动；士气 −4", tw: "敵軍下回合不動；士氣 −4", en: "Enemy columns hold next turn; morale −4" },
        fx: { skipEnemies: true, morale: -4 },
      },
      {
        label: { zh: "扎营休息", tw: "紮營休息", en: "Make camp" },
        desc: { zh: "士气 +6，粮草 −2", tw: "士氣 +6，糧草 −2", en: "Morale +6, supplies −2" },
        fx: { morale: 6, supplies: -2 },
      },
    ],
  },
};

export const EVENT_IDS = Object.keys(EVENT_DEFS);

// ---------- 史实问答（题库 18 道，事实均已核对） ----------
export interface QuizQuestion {
  id: string;
  q: Record<Lang3, string>;
  options: Record<Lang3, string[]>;
  answer: number;
  explain: Record<Lang3, string>;
  source: string;
}

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: "first-cross-date",
    q: { zh: "四渡赤水第一次渡过赤水河是哪一天？", tw: "四渡赤水第一次渡過赤水河是哪一天？", en: "On which day did the Red Army cross the Chishui for the first time?" },
    options: {
      zh: ["1935年1月15日", "1935年1月29日", "1935年2月18日", "1935年3月16日"],
      tw: ["1935年1月15日", "1935年1月29日", "1935年2月18日", "1935年3月16日"],
      en: ["15 Jan 1935", "29 Jan 1935", "18 Feb 1935", "16 Mar 1935"],
    },
    answer: 1,
    explain: {
      zh: "1935年1月29日，红军从土城、元厚一渡赤水河，西进川南。",
      tw: "1935年1月29日，紅軍從土城、元厚一渡赤水河，西進川南。",
      en: "On 29 Jan 1935 the Red Army crossed from Tucheng and Yuanhou, pushing west into southern Sichuan.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "first-cross-ford",
    q: { zh: "一渡赤水，红军从哪些渡口过河？", tw: "一渡赤水，紅軍從哪些渡口過河？", en: "At which ferries did the Red Army cross the first time?" },
    options: {
      zh: ["太平渡、二郎滩", "土城、元厚", "茅台、仁怀", "皎平渡、洪门渡"],
      tw: ["太平渡、二郎灘", "土城、元厚", "茅台、仁懷", "皎平渡、洪門渡"],
      en: ["Taipingdu, Erlangtan", "Tucheng, Yuanhou", "Maotai, Renhuai", "Jiaopingdu, Hongmen"],
    },
    answer: 1,
    explain: {
      zh: "一渡从土城上下渡口、猿猴场（今元厚）过河。",
      tw: "一渡從土城上下渡口、猿猴場（今元厚）過河。",
      en: "The first crossing used the Tucheng ferries and Yuanhou — then called Yuanhouchang.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "zunyi-meeting-date",
    q: { zh: "遵义会议召开于哪几天？", tw: "遵義會議召開於哪幾天？", en: "On which dates was the Zunyi Conference held?" },
    options: {
      zh: ["1935年1月7–9日", "1935年1月15–17日", "1935年2月5–7日", "1935年3月16–18日"],
      tw: ["1935年1月7–9日", "1935年1月15–17日", "1935年2月5–7日", "1935年3月16–18日"],
      en: ["7–9 Jan 1935", "15–17 Jan 1935", "5–7 Feb 1935", "16–18 Mar 1935"],
    },
    answer: 1,
    explain: {
      zh: "1935年1月15日至17日，中共中央政治局扩大会议在遵义召开。",
      tw: "1935年1月15日至17日，中共中央政治局擴大會議在遵義召開。",
      en: "The enlarged Politburo meeting was held in Zunyi on 15–17 Jan 1935.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "zunyi-meeting-mao",
    q: { zh: "遵义会议事实上确立了谁在党中央和红军的领导地位？", tw: "遵義會議事實上確立了誰在黨中央和紅軍的領導地位？", en: "The Zunyi Conference established whose leadership in the Party and the Red Army?" },
    options: {
      zh: ["朱德", "周恩来", "毛泽东", "张闻天"],
      tw: ["朱德", "周恩來", "毛澤東", "張聞天"],
      en: ["Zhu De", "Zhou Enlai", "Mao Zedong", "Zhang Wentian"],
    },
    answer: 2,
    explain: {
      zh: "会议增选毛泽东为中央政治局常委，事实上确立了他在党中央和红军的领导地位。",
      tw: "會議增選毛澤東為中央政治局常委，事實上確立了他在黨中央和紅軍的領導地位。",
      en: "Mao was elected to the Politburo Standing Committee, establishing his leadership in fact.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "tucheng-why",
    q: { zh: "土城战役后，红军为什么撤出战斗？", tw: "土城戰役後，紅軍為什麼撤出戰鬥？", en: "Why did the Red Army break off the Battle of Tucheng?" },
    options: {
      zh: ["粮草断绝", "情报有误，川军远比预计的多，敌援军不断赶到", "遵义会议决定撤退", "渡船被敌军烧毁"],
      tw: ["糧草斷絕", "情報有誤，川軍遠比預計的多，敵援軍不斷趕到", "遵義會議決定撤退", "渡船被敵軍燒毀"],
      en: ["Supplies ran out", "Bad intelligence: the Sichuan force was far larger than reported, with reinforcements arriving", "The Zunyi Conference ordered a retreat", "The enemy burned the ferries"],
    },
    answer: 1,
    explain: {
      zh: "情报说川军只有2个团，实际是2个旅4个团，另有2个旅正在增援。",
      tw: "情報說川軍只有2個團，實際是2個旅4個團，另有2個旅正在增援。",
      en: "Intelligence said two regiments; in fact there were two brigades of four regiments, with two more brigades on the way.",
    },
    source: "中国军网 81.cn",
  },
  {
    id: "zhaxi-zhang",
    q: { zh: "扎西会议上，由谁代替博古负中央总的责任？", tw: "扎西會議上，由誰代替博古負中央總的責任？", en: "At the Zhaxi meetings, who replaced Bo Gu as the Party's overall leader?" },
    options: {
      zh: ["毛泽东", "周恩来", "张闻天", "朱德"],
      tw: ["毛澤東", "周恩來", "張聞天", "朱德"],
      en: ["Mao Zedong", "Zhou Enlai", "Zhang Wentian", "Zhu De"],
    },
    answer: 2,
    explain: {
      zh: "1935年2月5日，中央政治局常委分工，决定由张闻天代替博古负总责。",
      tw: "1935年2月5日，中央政治局常委分工，決定由張聞天代替博古負總責。",
      en: "On 5 Feb 1935 the Standing Committee assigned Zhang Wentian to take over from Bo Gu.",
    },
    source: "国史网 dswxyjy.org.cn",
  },
  {
    id: "second-cross-ford",
    q: { zh: "二渡赤水，红军从哪些渡口过河？", tw: "二渡赤水，紅軍從哪些渡口過河？", en: "At which ferries did the Red Army cross the second time?" },
    options: {
      zh: ["土城、元厚", "太平渡、二郎滩", "茅台、仁怀", "皎平渡、龙街渡"],
      tw: ["土城、元厚", "太平渡、二郎灘", "茅台、仁懷", "皎平渡、龍街渡"],
      en: ["Tucheng, Yuanhou", "Taipingdu, Erlangtan", "Maotai, Renhuai", "Jiaopingdu, Longjie"],
    },
    answer: 1,
    explain: {
      zh: "1935年2月18日至21日，红军从太平渡、二郎滩二渡赤水，重入贵州。",
      tw: "1935年2月18日至21日，紅軍從太平渡、二郎灘二渡赤水，重入貴州。",
      en: "On 18–21 Feb 1935 the Red Army recrossed at Taipingdu and Erlangtan, re-entering Guizhou.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "loushanguan-result",
    q: { zh: "娄山关大捷后五天内，红军共歼灭和击溃敌军多少？", tw: "婁山關大捷後五天內，紅軍共殲滅和擊潰敵軍多少？", en: "In the five days after Loushan Pass, how much of the enemy did the Red Army destroy or rout?" },
    options: {
      zh: ["一个师", "两个师又八个团", "四个师", "八个团"],
      tw: ["一個師", "兩個師又八個團", "四個師", "八個團"],
      en: ["One division", "Two divisions and eight regiments", "Four divisions", "Eight regiments"],
    },
    answer: 1,
    explain: {
      zh: "五天内连下桐梓、娄山关、遵义，歼灭和击溃敌军两个师又八个团，俘敌约3000人。",
      tw: "五天內連下桐梓、婁山關、遵義，殲滅和擊潰敵軍兩個師又八個團，俘敵約3000人。",
      en: "In five days the Red Army took Tongzi, Loushan Pass and Zunyi, destroying or routing two divisions and eight regiments and capturing about 3,000 men.",
    },
    source: "中国军网 81.cn",
  },
  {
    id: "loushanguan-peng",
    q: { zh: "娄山关战斗中，指挥红三军团进攻的是谁？", tw: "婁山關戰鬥中，指揮紅三軍團進攻的是誰？", en: "Who commanded the Third Army Corps in the fight for Loushan Pass?" },
    options: {
      zh: ["彭德怀", "林彪", "刘伯承", "聂荣臻"],
      tw: ["彭德懷", "林彪", "劉伯承", "聶榮臻"],
      en: ["Peng Dehuai", "Lin Biao", "Liu Bocheng", "Nie Rongzhen"],
    },
    answer: 0,
    explain: {
      zh: "1935年2月25日，红三军团军团长彭德怀率部向娄山关挺进。",
      tw: "1935年2月25日，紅三軍團軍團長彭德懷率部向婁山關挺進。",
      en: "On 25 Feb 1935 corps commander Peng Dehuai led the Third Army Corps toward the pass.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "third-cross",
    q: { zh: "三渡赤水发生在何时、何地？", tw: "三渡赤水發生在何時、何地？", en: "When and where was the third crossing?" },
    options: {
      zh: ["1935年2月18日，太平渡", "1935年3月16日，茅台", "1935年3月21日，二郎滩", "1935年1月29日，元厚"],
      tw: ["1935年2月18日，太平渡", "1935年3月16日，茅台", "1935年3月21日，二郎灘", "1935年1月29日，元厚"],
      en: ["18 Feb 1935, Taipingdu", "16 Mar 1935, Maotai", "21 Mar 1935, Erlangtan", "29 Jan 1935, Yuanhou"],
    },
    answer: 1,
    explain: {
      zh: "1935年3月16日晚，红军从茅台三渡赤水，西进古蔺、叙永。",
      tw: "1935年3月16日晚，紅軍從茅台三渡赤水，西進古藺、敘永。",
      en: "On the night of 16 Mar 1935 the Red Army crossed west from Maotai toward Gulin and Xuyong.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "fourth-cross",
    q: { zh: "四渡赤水发生在何时？", tw: "四渡赤水發生在何時？", en: "When was the fourth crossing?" },
    options: {
      zh: ["1935年2月18–21日", "1935年3月16–17日", "1935年3月21日晚–22日", "1935年5月3–9日"],
      tw: ["1935年2月18–21日", "1935年3月16–17日", "1935年3月21日晚–22日", "1935年5月3–9日"],
      en: ["18–21 Feb 1935", "16–17 Mar 1935", "Night of 21–22 Mar 1935", "3–9 May 1935"],
    },
    answer: 2,
    explain: {
      zh: "1935年3月21日晚至22日，红军从太平渡、二郎滩四渡赤水，再入黔北。",
      tw: "1935年3月21日晚至22日，紅軍從太平渡、二郎灘四渡赤水，再入黔北。",
      en: "On the night of 21–22 Mar 1935 the Red Army crossed east again at Taipingdu and Erlangtan.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "wujiang",
    q: { zh: "四渡赤水后，红军主力在哪几天南渡乌江？", tw: "四渡赤水後，紅軍主力在哪幾天南渡烏江？", en: "After the fourth crossing, on which days did the main force cross the Wu River south?" },
    options: {
      zh: ["1935年3月21–22日", "1935年3月30–31日", "1935年4月15–16日", "1935年5月3–4日"],
      tw: ["1935年3月21–22日", "1935年3月30–31日", "1935年4月15–16日", "1935年5月3–4日"],
      en: ["21–22 Mar 1935", "30–31 Mar 1935", "15–16 Apr 1935", "3–4 May 1935"],
    },
    answer: 1,
    explain: {
      zh: "四渡后红军主力于3月30日至31日南渡乌江，跳出包围圈。",
      tw: "四渡後紅軍主力於3月30日至31日南渡烏江，跳出包圍圈。",
      en: "The main force crossed the Wu River on 30–31 Mar 1935, breaking out of the encirclement.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "feint-guiyang",
    q: { zh: "红军佯攻贵阳，真正的目的是什么？", tw: "紅軍佯攻貴陽，真正的目的是什麼？", en: "What was the real purpose of the feint at Guiyang?" },
    options: {
      zh: ["攻占贵阳", "调出滇军，使云南防务空虚", "与红二、六军团会合", "北渡长江"],
      tw: ["攻佔貴陽", "調出滇軍，使雲南防務空虛", "與紅二、六軍團會合", "北渡長江"],
      en: ["Capture Guiyang", "Draw the Yunnan Army out, leaving Yunnan undefended", "Join the Second and Sixth Army Corps", "Cross the Yangtze north"],
    },
    answer: 1,
    explain: {
      zh: "佯攻贵阳诱出滇军增援，云南后方空虚，红军得以西进、巧渡金沙江。",
      tw: "佯攻貴陽誘出滇軍增援，雲南後方空虛，紅軍得以西進、巧渡金沙江。",
      en: "The feint drew the Yunnan Army to Guiyang, leaving Yunnan open for the march to the Jinsha River.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "jinsha-ford",
    q: { zh: "巧渡金沙江，红军主力从哪个渡口过江？", tw: "巧渡金沙江，紅軍主力從哪個渡口過江？", en: "At which ferry did the main force cross the Jinsha River?" },
    options: {
      zh: ["皎平渡", "太平渡", "元厚", "茅台"],
      tw: ["皎平渡", "太平渡", "元厚", "茅台"],
      en: ["Jiaopingdu", "Taipingdu", "Yuanhou", "Maotai"],
    },
    answer: 0,
    explain: {
      zh: "1935年5月3日至9日，红军主力从云南禄劝皎平渡巧渡金沙江。",
      tw: "1935年5月3日至9日，紅軍主力從雲南祿勸皎平渡巧渡金沙江。",
      en: "On 3–9 May 1935 the main force crossed at Jiaopingdu in Luquan, Yunnan.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "jinsha-liu",
    q: { zh: "巧渡金沙江的渡江指挥部司令员是谁？", tw: "巧渡金沙江的渡江指揮部司令員是誰？", en: "Who commanded the river-crossing headquarters at the Jinsha?" },
    options: {
      zh: ["朱德", "周恩来", "刘伯承", "彭德怀"],
      tw: ["朱德", "周恩來", "劉伯承", "彭德懷"],
      en: ["Zhu De", "Zhou Enlai", "Liu Bocheng", "Peng Dehuai"],
    },
    answer: 2,
    explain: {
      zh: "中革军委成立渡江指挥部，由总参谋长刘伯承任司令员，陈云任政委。",
      tw: "中革軍委成立渡江指揮部，由總參謀長劉伯承任司令員，陳雲任政委。",
      en: "The Military Commission set up a crossing headquarters under chief of staff Liu Bocheng, with Chen Yun as political commissar.",
    },
    source: "国务院国资委 sasac.gov.cn",
  },
  {
    id: "jinsha-days",
    q: { zh: "巧渡金沙江用了多长时间？", tw: "巧渡金沙江用了多長時間？", en: "How long did the Jinsha crossing take?" },
    options: {
      zh: ["一夜", "三天三夜", "七天七夜", "一个月"],
      tw: ["一夜", "三天三夜", "七天七夜", "一個月"],
      en: ["One night", "Three days and nights", "Seven days and nights", "A month"],
    },
    answer: 2,
    explain: {
      zh: "1935年5月3日至9日，仅凭6条木船、37名船工，七天七夜全部渡过。",
      tw: "1935年5月3日至9日，僅憑6條木船、37名船工，七天七夜全部渡過。",
      en: "From 3 to 9 May 1935, six wooden boats and 37 boatmen ferried the whole army across in seven days and nights.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "total-result",
    q: { zh: "四渡赤水全程，红军共歼灭和击溃敌军多少？", tw: "四渡赤水全程，紅軍共殲滅和擊潰敵軍多少？", en: "Over the whole Four Crossings campaign, how much of the enemy did the Red Army destroy or rout?" },
    options: {
      zh: ["2个师又8个团", "4个师、2个旅另10个团", "8个师", "10个团"],
      tw: ["2個師又8個團", "4個師、2個旅另10個團", "8個師", "10個團"],
      en: ["Two divisions and eight regiments", "Four divisions, two brigades and ten regiments", "Eight divisions", "Ten regiments"],
    },
    answer: 1,
    explain: {
      zh: "从1935年1月19日离遵义到5月9日渡过金沙江，共歼灭和击溃敌4个师、2个旅另10个团，俘敌3600余人。",
      tw: "從1935年1月19日離遵義到5月9日渡過金沙江，共殲滅和擊潰敵4個師、2個旅另10個團，俘敵3600餘人。",
      en: "From leaving Zunyi on 19 Jan to crossing the Jinsha on 9 May, the Red Army destroyed or routed four divisions, two brigades and ten regiments, capturing over 3,600 men.",
    },
    source: "国防部 mod.gov.cn",
  },
  {
    id: "force-ratio",
    q: { zh: "四渡赤水时，红军约有多少人，面对多少敌军？", tw: "四渡赤水時，紅軍約有多少人，面對多少敵軍？", en: "How large was the Red Army against how many enemy troops?" },
    options: {
      zh: ["红军8万，敌军10万", "红军3万余人，敌军约40万", "红军1万，敌军5万", "红军5万，敌军20万"],
      tw: ["紅軍8萬，敵軍10萬", "紅軍3萬餘人，敵軍約40萬", "紅軍1萬，敵軍5萬", "紅軍5萬，敵軍20萬"],
      en: ["80,000 vs 100,000", "About 30,000 vs about 400,000", "10,000 vs 50,000", "50,000 vs 200,000"],
    },
    answer: 1,
    explain: {
      zh: "当时中央红军只有3万余人，蒋介石调集约40万兵力围堵。",
      tw: "當時中央紅軍只有3萬餘人，蔣介石調集約40萬兵力圍堵。",
      en: "The Central Red Army numbered only about 30,000 against roughly 400,000 enemy troops.",
    },
    source: "中国教育报 jyb.cn",
  },
];

export const QUIZ_MAP: Record<string, QuizQuestion> = Object.fromEntries(
  QUIZ_BANK.map((q) => [q.id, q]),
) as Record<string, QuizQuestion>;

// ---------- 战史图鉴 ----------
export type CodexCat = "figure" | "battle" | "ferry";

export interface CodexCard {
  id: string;
  cat: CodexCat;
  title: Record<Lang3, string>;
  lines: Record<Lang3, string[]>;
  source: string;
  unlockHint: Record<Lang3, string>;
}

export const CODEX_CARDS: CodexCard[] = [
  {
    id: "mao",
    cat: "figure",
    title: { zh: "毛泽东", tw: "毛澤東", en: "Mao Zedong" },
    lines: {
      zh: [
        "四渡赤水的实际指挥者，提出高度灵活的运动战方针。",
        "遵义会议后，事实上确立了他在党中央和红军的领导地位。",
        "他后来称四渡赤水是军事生涯中的“得意之笔”。",
      ],
      tw: [
        "四渡赤水的實際指揮者，提出高度靈活的運動戰方針。",
        "遵義會議後，事實上確立了他在黨中央和紅軍的領導地位。",
        "他後來稱四渡赤水是軍事生涯中的「得意之筆」。",
      ],
      en: [
        "The commander behind the Four Crossings and its flexible mobile-warfare doctrine.",
        "After Zunyi, his leadership of the Party and the Red Army was established in fact.",
        "He later called the Four Crossings the masterstroke of his military career.",
      ],
    },
    source: "四渡赤水纪念馆 neac.gov.cn",
    unlockHint: { zh: "开局即拥有", tw: "開局即擁有", en: "Unlocked at the start" },
  },
  {
    id: "zhou",
    cat: "figure",
    title: { zh: "周恩来", tw: "周恩來", en: "Zhou Enlai" },
    lines: {
      zh: [
        "遵义会议后，周恩来是党内委托的对于军事上下最后决心的负责者。",
        "1935年3月中旬，毛泽东、周恩来、王稼祥组成新的“三人团”，周恩来为团长，负责指挥全军军事行动。",
      ],
      tw: [
        "遵義會議後，周恩來是黨內委託的對於軍事上下最後決心的負責者。",
        "1935年3月中旬，毛澤東、周恩來、王稼祥組成新的「三人團」，周恩來為團長，負責指揮全軍軍事行動。",
      ],
      en: [
        "After Zunyi, Zhou was entrusted with the final say on military matters.",
        "In mid-March 1935 a new three-man group was formed — Mao, Zhou and Wang Jiaxiang — with Zhou as its head, directing all military operations.",
      ],
    },
    source: "中国科学院 cas.cn",
    unlockHint: { zh: "二渡后重占遵义", tw: "二渡後重佔遵義", en: "Retake Zunyi after the second crossing" },
  },
  {
    id: "zhu",
    cat: "figure",
    title: { zh: "朱德", tw: "朱德", en: "Zhu De" },
    lines: {
      zh: [
        "红军总司令。",
        "土城战斗中，朱德和总参谋长刘伯承亲临一线指挥。",
        "遵义会议决定，仍由朱德、周恩来指挥军事。",
      ],
      tw: [
        "紅軍總司令。",
        "土城戰鬥中，朱德和總參謀長劉伯承親臨一線指揮。",
        "遵義會議決定，仍由朱德、周恩來指揮軍事。",
      ],
      en: [
        "Commander-in-chief of the Red Army.",
        "At Tucheng, Zhu and chief of staff Liu Bocheng directed the battle from the front line.",
        "After Zunyi, military command remained with Zhu De and Zhou Enlai.",
      ],
    },
    source: "中国军网 81.cn",
    unlockHint: { zh: "伏击取胜", tw: "伏擊取勝", en: "Win an ambush" },
  },
  {
    id: "liu",
    cat: "figure",
    title: { zh: "刘伯承", tw: "劉伯承", en: "Liu Bocheng" },
    lines: {
      zh: [
        "红军总参谋长。",
        "巧渡金沙江时任渡江指挥部司令员，率先遣队一昼夜行军100余公里夺取皎平渡。",
        "渡江时共找到7只木船，其中6只可用，37名船工昼夜摆渡。",
      ],
      tw: [
        "紅軍總參謀長。",
        "巧渡金沙江時任渡江指揮部司令員，率先遣隊一晝夜行軍100餘公里奪取皎平渡。",
        "渡江時共找到7隻木船，其中6隻可用，37名船工晝夜擺渡。",
      ],
      en: [
        "Chief of staff of the Red Army.",
        "As crossing commander at the Jinsha, he led the vanguard on a 100-kilometre day-and-night march to seize Jiaopingdu.",
        "Seven boats were found, six usable, with 37 boatmen ferrying day and night.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "跳出包围圈（胜利）", tw: "跳出包圍圈（勝利）", en: "Break out (win the game)" },
  },
  {
    id: "tucheng",
    cat: "battle",
    title: { zh: "土城战役", tw: "土城戰役", en: "Battle of Tucheng" },
    lines: {
      zh: [
        "1935年1月28日，红军在土城青杠坡与川军郭勋祺部激战。",
        "情报有误：以为川军2个团，实际是2个旅4个团，另有2个旅正在增援。",
        "双方损失各约3000人；当晚中央政治局开会，决定撤出战斗，一渡赤水。",
      ],
      tw: [
        "1935年1月28日，紅軍在土城青杠坡與川軍郭勛祺部激戰。",
        "情報有誤：以為川軍2個團，實際是2個旅4個團，另有2個旅正在增援。",
        "雙方損失各約3000人；當晚中央政治局開會，決定撤出戰鬥，一渡赤水。",
      ],
      en: [
        "On 28 Jan 1935 the Red Army fought Guo Xunqi's Sichuan force at Qinggangpo, Tucheng.",
        "Intelligence was wrong: two regiments were expected, but two brigades of four regiments were waiting, with two more brigades on the way.",
        "Both sides lost about 3,000 men; that night the Politburo met and decided to break off and cross the Chishui.",
      ],
    },
    source: "中国军网 81.cn",
    unlockHint: { zh: "完成一渡", tw: "完成一渡", en: "Complete the first crossing" },
  },
  {
    id: "loushanguan",
    cat: "battle",
    title: { zh: "娄山关大捷", tw: "婁山關大捷", en: "Victory at Loushan Pass" },
    lines: {
      zh: [
        "1935年2月25–28日，彭德怀指挥红三军团夺下娄山关，再占遵义。",
        "五天内连下桐梓、娄山关、遵义，歼灭和击溃敌军两个师又八个团，毙伤2400余人，俘敌约3000人。",
        "这是中央红军长征以来取得的最大的一次胜利；毛泽东写下《忆秦娥·娄山关》。",
      ],
      tw: [
        "1935年2月25–28日，彭德懷指揮紅三軍團奪下婁山關，再佔遵義。",
        "五天內連下桐梓、婁山關、遵義，殲滅和擊潰敵軍兩個師又八個團，斃傷2400餘人，俘敵約3000人。",
        "這是中央紅軍長征以來取得的最大的一次勝利；毛澤東寫下《憶秦娥·婁山關》。",
      ],
      en: [
        "On 25–28 Feb 1935 Peng Dehuai's Third Army Corps stormed Loushan Pass and retook Zunyi.",
        "In five days the Red Army took Tongzi, the pass and Zunyi, destroying or routing two divisions and eight regiments, killing or wounding over 2,400 and capturing about 3,000.",
        "It was the Red Army's greatest victory of the Long March so far; Mao wrote 'Loushan Pass' after the battle.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "夺回娄山关或重占遵义", tw: "奪回婁山關或重佔遵義", en: "Retake Loushan Pass or Zunyi" },
  },
  {
    id: "zunyi-meeting",
    cat: "battle",
    title: { zh: "遵义会议", tw: "遵義會議", en: "Zunyi Conference" },
    lines: {
      zh: [
        "1935年1月15–17日，中共中央政治局扩大会议在遵义召开。",
        "会议增选毛泽东为中央政治局常委，事实上确立了他在党中央和红军的领导地位。",
        "遵义会议是中国革命生死攸关的转折点。",
      ],
      tw: [
        "1935年1月15–17日，中共中央政治局擴大會議在遵義召開。",
        "會議增選毛澤東為中央政治局常委，事實上確立了他在黨中央和紅軍的領導地位。",
        "遵義會議是中國革命生死攸關的轉折點。",
      ],
      en: [
        "On 15–17 Jan 1935 the enlarged Politburo met in Zunyi.",
        "Mao Zedong was elected to the Standing Committee, establishing his leadership in fact.",
        "The conference was the life-or-death turning point of the Chinese revolution.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "二渡后重占遵义", tw: "二渡後重佔遵義", en: "Retake Zunyi after the second crossing" },
  },
  {
    id: "jinsha",
    cat: "battle",
    title: { zh: "巧渡金沙江", tw: "巧渡金沙江", en: "Crossing the Jinsha" },
    lines: {
      zh: [
        "1935年5月3–9日，红军主力从皎平渡巧渡金沙江。",
        "仅凭6条木船、37名船工，七天七夜，3万余人全部渡过，不费一枪一弹。",
        "渡江指挥部司令员刘伯承，政委陈云。",
      ],
      tw: [
        "1935年5月3–9日，紅軍主力從皎平渡巧渡金沙江。",
        "僅憑6條木船、37名船工，七天七夜，3萬餘人全部渡過，不費一槍一彈。",
        "渡江指揮部司令員劉伯承，政委陳雲。",
      ],
      en: [
        "On 3–9 May 1935 the main force slipped across the Jinsha at Jiaopingdu.",
        "Six boats and 37 boatmen ferried over 30,000 men in seven days and nights, without firing a shot.",
        "Liu Bocheng commanded the crossing; Chen Yun was political commissar.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "跳出包围圈（胜利）", tw: "跳出包圍圈（勝利）", en: "Break out (win the game)" },
  },
  {
    id: "yuanhou",
    cat: "ferry",
    title: { zh: "元厚渡口", tw: "元厚渡口", en: "Yuanhou Ferry" },
    lines: {
      zh: [
        "一渡赤水的主要渡口，1935年1月29日。",
        "旧称猿猴场，今属贵州习水。",
        "红军从这里西渡赤水河，进入川南。",
      ],
      tw: [
        "一渡赤水的主要渡口，1935年1月29日。",
        "舊稱猿猴場，今屬貴州習水。",
        "紅軍從這裡西渡赤水河，進入川南。",
      ],
      en: [
        "The main ferry of the first crossing, 29 Jan 1935.",
        "Then called Yuanhouchang, in today's Xishui, Guizhou.",
        "The Red Army crossed west here into southern Sichuan.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "完成一渡", tw: "完成一渡", en: "Complete the first crossing" },
  },
  {
    id: "taipingdu",
    cat: "ferry",
    title: { zh: "太平渡", tw: "太平渡", en: "Taipingdu Ferry" },
    lines: {
      zh: [
        "二渡（2月18–21日）与四渡（3月21–22日）的渡口。",
        "位于赤水河畔，今属贵州习水。",
      ],
      tw: [
        "二渡（2月18–21日）與四渡（3月21–22日）的渡口。",
        "位於赤水河畔，今屬貴州習水。",
      ],
      en: [
        "Ferry for the second crossing (18–21 Feb) and the fourth (21–22 Mar).",
        "On the Chishui, in today's Xishui, Guizhou.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "完成二渡", tw: "完成二渡", en: "Complete the second crossing" },
  },
  {
    id: "erlangtan",
    cat: "ferry",
    title: { zh: "二郎滩", tw: "二郎灘", en: "Erlangtan Ferry" },
    lines: {
      zh: [
        "二渡与四渡的渡口之一。",
        "四渡前夜，先头部队夺取太平渡、林滩等渡口，架起浮桥等候主力。",
      ],
      tw: [
        "二渡與四渡的渡口之一。",
        "四渡前夜，先頭部隊奪取太平渡、林灘等渡口，架起浮橋等候主力。",
      ],
      en: [
        "A ferry for the second and fourth crossings.",
        "On the eve of the fourth crossing, advance units seized Taipingdu and Lintan and built pontoon bridges for the main force.",
      ],
    },
    source: "四川省地方志 scdfz.sc.gov.cn",
    unlockHint: { zh: "完成二渡", tw: "完成二渡", en: "Complete the second crossing" },
  },
  {
    id: "maotai",
    cat: "ferry",
    title: { zh: "茅台渡口", tw: "茅台渡口", en: "Maotai Ferry" },
    lines: {
      zh: [
        "三渡赤水的渡口，1935年3月16日晚。",
        "红军在此大张旗鼓架设浮桥，三渡赤水，西进古蔺、叙永。",
        "今贵州仁怀茅台镇。",
      ],
      tw: [
        "三渡赤水的渡口，1935年3月16日晚。",
        "紅軍在此大張旗鼓架設浮橋，三渡赤水，西進古藺、敘永。",
        "今貴州仁懷茅台鎮。",
      ],
      en: [
        "Ferry of the third crossing, the night of 16 Mar 1935.",
        "The Red Army built pontoon bridges here in full view, crossed west, and pushed on to Gulin and Xuyong.",
        "Today's Maotai town, Renhuai, Guizhou.",
      ],
    },
    source: "国防部 mod.gov.cn",
    unlockHint: { zh: "完成三渡", tw: "完成三渡", en: "Complete the third crossing" },
  },
];

export const CODEX_MAP: Record<string, CodexCard> = Object.fromEntries(
  CODEX_CARDS.map((c) => [c.id, c]),
) as Record<string, CodexCard>;

// ---------- 成就与军衔 ----------
export interface AchievementDef {
  id: string;
  name: Record<Lang3, string>;
  desc: Record<Lang3, string>;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first-win",
    name: { zh: "首胜", tw: "首勝", en: "First Breakout" },
    desc: { zh: "赢下一局，跳出包围圈", tw: "贏下一局，跳出包圍圈", en: "Win a game and break out" },
  },
  {
    id: "speed-15",
    name: { zh: "速胜", tw: "速勝", en: "Swift Victory" },
    desc: { zh: "15 回合内脱险", tw: "15 回合內脫險", en: "Escape within 15 turns" },
  },
  {
    id: "no-combat",
    name: { zh: "不战而胜", tw: "不戰而勝", en: "Bloodless Breakout" },
    desc: { zh: "一场伏击都不打就赢了", tw: "一場伏擊都不打就贏了", en: "Win without a single ambush" },
  },
  {
    id: "quiz-perfect",
    name: { zh: "博古通今", tw: "博古通今", en: "History Buff" },
    desc: { zh: "本局问答全部答对（至少 3 道）", tw: "本局問答全部答對（至少 3 道）", en: "Answer every quiz question right (at least 3)" },
  },
  {
    id: "hard-win",
    name: { zh: "绝境逢生", tw: "絕境逢生", en: "Against All Odds" },
    desc: { zh: "在困难难度下脱险", tw: "在困難難度下脫險", en: "Escape on Hard difficulty" },
  },
  {
    id: "codex-full",
    name: { zh: "战史通", tw: "戰史通", en: "Complete Collection" },
    desc: { zh: "集齐全部 12 张战史图鉴", tw: "集齊全部 12 張戰史圖鑑", en: "Collect all 12 history cards" },
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENT_DEFS.map((a) => [a.id, a]),
) as Record<string, AchievementDef>;

export const RANK_NAMES: Record<RankId, Record<Lang3, string>> = {
  mastermind: { zh: "神机妙算", tw: "神機妙算", en: "Mastermind" },
  steady: { zh: "稳扎稳打", tw: "穩紮穩打", en: "Steady Hand" },
  narrow: { zh: "险中求胜", tw: "險中求勝", en: "Narrow Escape" },
  escaped: { zh: "突围成功", tw: "突圍成功", en: "Breakout" },
  failed: { zh: "功败垂成", tw: "功敗垂成", en: "So Close" },
};

// ---------- 界面文案 ----------
export const STR: Record<string, Record<Lang3, string>> = {
  startSubtitle: {
    zh: "1935年1月—5月 · 长征途中",
    tw: "1935年1月—5月 · 長征途中",
    en: "January–May 1935 · The Long March",
  },
  startIntro: {
    zh: "红军三万余人，被约四十万敌军围堵。你是红军的指挥者：四渡赤水，跳出包围圈。每一回合都要做决定——走多快、打不打、救不救。每一渡，都有一段真实的历史等你回答。",
    tw: "紅軍三萬餘人，被約四十萬敵軍圍堵。你是紅軍的指揮者：四渡赤水，跳出包圍圈。每一回合都要做決定——走多快、打不打、救不救。每一渡，都有一段真實的歷史等你回答。",
    en: "About 30,000 Red Army soldiers face some 400,000 enemy troops. You are the commander: cross the Chishui four times and break out. Every turn demands a decision — how fast to march, whether to fight, whom to save. And every crossing brings a real question from history.",
  },
  difficultyTitle: {
    zh: "选择难度",
    tw: "選擇難度",
    en: "Choose Difficulty",
  },
  startButton: {
    zh: "开始行军",
    tw: "開始行軍",
    en: "Start the March",
  },
  howTitle: { zh: "怎么玩", tw: "怎麼玩", en: "How to Play" },
  rule1: {
    zh: "每回合选一种行军方式，再点地图上的地点移动。",
    tw: "每回合選一種行軍方式，再點地圖上的地點移動。",
    en: "Each turn, pick a march mode, then tap a place on the map to move.",
  },
  rule2: {
    zh: "敌军每回合都会前进——看清它们的意图再行动。",
    tw: "敵軍每回合都會前進——看清它們的意圖再行動。",
    en: "The enemy advances every turn — read their telegraphed intent before you move.",
  },
  rule3: {
    zh: "每渡一次赤水，都有一道史实问答；答对有奖励。",
    tw: "每渡一次赤水，都有一道史實問答；答對有獎勵。",
    en: "Every crossing brings a history quiz question; correct answers earn a bonus.",
  },
  rule4: {
    zh: "集齐战史图鉴，完成四渡，跳出包围圈。",
    tw: "集齊戰史圖鑑，完成四渡，跳出包圍圈。",
    en: "Collect the history cards, finish all four crossings, and break out.",
  },
  bestLabel: { zh: "最佳战绩", tw: "最佳戰績", en: "Best Record" },
  turnLabel: { zh: "回合", tw: "回合", en: "Turn" },
  moraleLabel: { zh: "士气", tw: "士氣", en: "Morale" },
  suppliesLabel: { zh: "粮草", tw: "糧草", en: "Supplies" },
  crossingsLabel: { zh: "渡河", tw: "渡河", en: "Crossings" },
  battlesLabel: { zh: "歼敌", tw: "殲敵", en: "Columns Routed" },
  scoreLabel: { zh: "分数", tw: "分數", en: "Score" },
  moveTitle: { zh: "行军方式", tw: "行軍方式", en: "March Mode" },
  modeSteady: { zh: "稳步行军", tw: "穩步行軍", en: "Steady March" },
  modeSteadyDesc: {
    zh: "前进 1 格 · 士气 +2 · 粮草 −3",
    tw: "前進 1 格 · 士氣 +2 · 糧草 −3",
    en: "Move 1 node · morale +2 · supplies −3",
  },
  modeRush: { zh: "急行军", tw: "急行軍", en: "Forced March" },
  modeRushDesc: {
    zh: "前进 2 格 · 士气 −5 · 粮草 −6",
    tw: "前進 2 格 · 士氣 −5 · 糧草 −6",
    en: "Move 2 nodes · morale −5 · supplies −6",
  },
  modeRest: { zh: "就地休整", tw: "就地休整", en: "Rest in Place" },
  modeRestDesc: {
    zh: "原地不动 · 士气 +8 · 粮草 −2 · 敌军照常前进",
    tw: "原地不動 · 士氣 +8 · 糧草 −2 · 敵軍照常前進",
    en: "Stay put · morale +8 · supplies −2 · the enemy still advances",
  },
  moveHint: {
    zh: "先选行军方式，再点地图上的地点",
    tw: "先選行軍方式，再點地圖上的地點",
    en: "Pick a march mode, then tap a place on the map",
  },
  restDanger: {
    zh: "敌军就在附近，休整很危险",
    tw: "敵軍就在附近，休整很危險",
    en: "An enemy column is right next to you — resting here is dangerous",
  },
  cancelMove: { zh: "取消选择", tw: "取消選擇", en: "Cancel" },
  combatTitle: { zh: "遭遇敌军", tw: "遭遇敵軍", en: "Enemy Encounter" },
  combatDefenseTitle: { zh: "遭遇战！", tw: "遭遇戰！", en: "Meeting Engagement!" },
  combatDefenseText: {
    zh: "敌军扑到你脸上了，没有伏击地利，胜算较低。打赢可将其击退；打输则被俘。",
    tw: "敵軍撲到你臉上了，沒有伏擊地利，勝算較低。打贏可將其擊退；打輸則被俘。",
    en: "The enemy is right on top of you — no ambush advantage, and the odds are worse. Win and you drive them back; lose and you are captured.",
  },
  combatAmbush: { zh: "打伏击", tw: "打伏擊", en: "Ambush" },
  combatEvade: { zh: "避战溜开", tw: "避戰溜開", en: "Slip Away" },
  combatChance: { zh: "胜算", tw: "勝算", en: "Win Chance" },
  combatAmbushDesc: {
    zh: "士气 −3；胜：敌军后撤两格，士气 +5，缴获粮草 +8；败：士气 −8，粮草 −6",
    tw: "士氣 −3；勝：敵軍後撤兩格，士氣 +5，繳獲糧草 +8；敗：士氣 −8，糧草 −6",
    en: "Morale −3; win: the column falls back two nodes, morale +5, +8 supplies captured; lose: morale −8, supplies −6",
  },
  combatEvadeDesc: {
    zh: "退回上一个地点，不打这一仗",
    tw: "退回上一個地點，不打這一仗",
    en: "Fall back to where you came from — no fight",
  },
  combatWin: { zh: "伏击成功！", tw: "伏擊成功！", en: "Ambush succeeded!" },
  combatLose: { zh: "伏击受挫", tw: "伏擊受挫", en: "Ambush failed" },
  eventTitle: { zh: "突发事件", tw: "突發事件", en: "Event" },
  quizTitle: { zh: "史实问答", tw: "史實問答", en: "History Quiz" },
  quizBonus: {
    zh: "答对奖励：士气 +5，粮草 +5",
    tw: "答對獎勵：士氣 +5，糧草 +5",
    en: "Correct answer: morale +5, supplies +5",
  },
  quizCorrect: { zh: "答对了！", tw: "答對了！", en: "Correct!" },
  quizWrong: {
    zh: "答错了，正确答案是",
    tw: "答錯了，正確答案是",
    en: "Not quite — the correct answer is",
  },
  quizContinue: { zh: "继续", tw: "繼續", en: "Continue" },
  codexTitle: { zh: "战史图鉴", tw: "戰史圖鑑", en: "History Collection" },
  codexLocked: { zh: "未解锁", tw: "未解鎖", en: "Locked" },
  codexCatFigure: { zh: "人物", tw: "人物", en: "People" },
  codexCatBattle: { zh: "战役", tw: "戰役", en: "Battles" },
  codexCatFerry: { zh: "渡口", tw: "渡口", en: "Ferries" },
  codexNew: { zh: "新卡片解锁！", tw: "新卡片解鎖！", en: "New card unlocked!" },
  decoyLabel: { zh: "分兵疑敌", tw: "分兵疑敵", en: "Send a Decoy" },
  decoyDesc: {
    zh: "士气 −6 · 选一支敌军调开 2 回合（默认最近的一支）",
    tw: "士氣 −6 · 選一支敵軍調開 2 回合（預設最近的一支）",
    en: "Morale −6 · draw one enemy column away for 2 turns (nearest by default)",
  },
  feintLabel: { zh: "佯攻贵阳", tw: "佯攻貴陽", en: "Feint at Guiyang" },
  feintDesc: {
    zh: "仅限一次 · 敌军被调开，停步 2 回合",
    tw: "僅限一次 · 敵軍被調開，停步 2 回合",
    en: "Once per game · enemy columns are drawn away and halt for 2 turns",
  },
  usedUp: { zh: "已用过", tw: "已用過", en: "Used" },
  reviewTitle: { zh: "战后复盘", tw: "戰後覆盤", en: "After-Action Review" },
  yourRoute: { zh: "你的路线", tw: "你的路線", en: "Your Route" },
  histRoute: { zh: "史实路线", tw: "史實路線", en: "Historical Route" },
  reviewTurns: { zh: "回合数", tw: "回合數", en: "Turns Used" },
  reviewHistTime: {
    zh: "史实：1935年1月19日–5月9日，共 101 天",
    tw: "史實：1935年1月19日–5月9日，共 101 天",
    en: "History: 19 Jan – 9 May 1935, 101 days",
  },
  reviewScore: { zh: "战绩评分", tw: "戰績評分", en: "Campaign Score" },
  reviewRank: { zh: "评价", tw: "評價", en: "Verdict" },
  reviewTimeline: { zh: "四渡时间线", tw: "四渡時間線", en: "The Four Crossings" },
  diffSameRoute: {
    zh: "你基本沿着史实路线行军。",
    tw: "你基本沿著史實路線行軍。",
    en: "You marched more or less along the historical route.",
  },
  diffOtherRoute: {
    zh: "你的路线与史实路线不同——多走了一些弯路。",
    tw: "你的路線與史實路線不同——多走了一些彎路。",
    en: "Your route differed from the historical one — a few detours along the way.",
  },
  diffBattles: {
    zh: "你打了伏击，歼敌 {battles} 支。",
    tw: "你打了伏擊，殲敵 {battles} 支。",
    en: "You fought ambushes and routed {battles} columns.",
  },
  diffNoBattles: {
    zh: "你一场伏击都没打，全靠运动甩开追兵。",
    tw: "你一場伏擊都沒打，全靠運動甩開追兵。",
    en: "You fought no ambushes at all — pure movement, like the real campaign.",
  },
  diffQuiz: {
    zh: "问答答对 {correct} / {total} 道。",
    tw: "問答答對 {correct} / {total} 道。",
    en: "Quiz: {correct} of {total} correct.",
  },
  playAgain: { zh: "再来一局", tw: "再來一局", en: "Play Again" },
  newGame: { zh: "重新开始", tw: "重新開始", en: "New Game" },
  achievementsTitle: { zh: "成就", tw: "成就", en: "Achievements" },
  achievementsLocked: { zh: "未获得", tw: "未獲得", en: "Not earned" },
  winTitle: { zh: "跳出包围圈！", tw: "跳出包圍圈！", en: "Out of the Encirclement!" },
  loseTitle: { zh: "未能脱险", tw: "未能脫險", en: "The Breakout Failed" },
  logTitle: { zh: "行军日志", tw: "行軍日誌", en: "March Log" },
  intentChase: { zh: "追击红军", tw: "追擊紅軍", en: "Pursuing the Red Army" },
  intentBlock: { zh: "堵截渡口", tw: "堵截渡口", en: "Blocking the ferry" },
  intentPatrol: { zh: "巡逻", tw: "巡邏", en: "Patrolling" },
  intentHold: { zh: "固守", tw: "固守", en: "Holding position" },
  intentRetreat: { zh: "后撤", tw: "後撤", en: "Falling back" },
  mapHint: {
    zh: "点击高亮地点移动；虚线是敌军下一步去向",
    tw: "點選高亮地點移動；虛線是敵軍下一步去向",
    en: "Tap a highlighted place to move; dashed lines show where the enemy will go next",
  },
  codexHint: {
    zh: "点击卡片查看详情",
    tw: "點選卡片檢視詳情",
    en: "Tap a card for details",
  },
  startNote: {
    zh: "史实内容参考：国防部 mod.gov.cn · 国史网 dswxyjy.org.cn · 四渡赤水纪念馆 neac.gov.cn",
    tw: "史實內容參考：國防部 mod.gov.cn · 國史網 dswxyjy.org.cn · 四渡赤水紀念館 neac.gov.cn",
    en: "History sources: Ministry of National Defense (mod.gov.cn), CPC History (dswxyjy.org.cn), Four Crossings Memorial (neac.gov.cn)",
  },
  riverLabel: { zh: "赤水河", tw: "赤水河", en: "Chishui River" },
  legendArmy: { zh: "红军", tw: "紅軍", en: "Red Army" },
  noteTitle: { zh: "战史小注", tw: "戰史小注", en: "History Note" },
  kindStart: { zh: "起点", tw: "起點", en: "Start" },
  kindTown: { zh: "城镇", tw: "城鎮", en: "Town" },
  kindFord: { zh: "渡口", tw: "渡口", en: "Ferry" },
  kindPass: { zh: "隘口", tw: "隘口", en: "Pass" },
  kindRiver: { zh: "渡江", tw: "渡江", en: "River" },
  kindEscape: { zh: "出口", tw: "出口", en: "Escape" },
  enemyDist: { zh: "最近敌军", tw: "最近敵軍", en: "Nearest enemy" },
  crossingsDone: { zh: "四渡完成", tw: "四渡完成", en: "Four crossings done" },
  yunnanLockedHint: {
    zh: "金沙江渡口尚未打通：完成四渡（{n}/4）后才能南下云南。",
    tw: "金沙江渡口尚未打通：完成四渡（{n}/4）後才能南下雲南。",
    en: "The Jinsha River crossing is not open yet: finish all four crossings ({n}/4) before heading south to Yunnan.",
  },
  bestNone: { zh: "暂无战绩", tw: "暫無戰績", en: "No record yet" },
  diffEasyDesc: {
    zh: "敌军行动较慢，事件较少，适合先熟悉玩法。",
    tw: "敵軍行動較慢，事件較少，適合先熟悉玩法。",
    en: "Slower enemies and fewer events — good for learning the game.",
  },
  diffHistDesc: {
    zh: "还原原版平衡：三路敌军，约 17 回合可沿史实路线脱险。",
    tw: "還原原版平衡：三路敵軍，約 17 回合可沿史實路線脫險。",
    en: "The original balance: three enemy columns, winnable in about 17 turns on the historical route.",
  },
  diffHardDesc: {
    zh: "中央军逼近时双倍追击，川军每回合都动，滇军也会来增援。",
    tw: "中央軍逼近時雙倍追擊，川軍每回合都動，滇軍也會來增援。",
    en: "The Central Army double-moves when close, the Sichuan Army moves every turn, and Yunnan reinforcements arrive.",
  },
  combatPincer: {
    zh: "注意：还有另一支敌军在附近，打赢这一仗也可能被它追上。",
    tw: "注意：還有另一支敵軍在附近，打贏這一仗也可能被它追上。",
    en: "Warning: another enemy column is right next to you — even if you win this fight, it may catch you.",
  },
  enemyBehaviorCentral: {
    zh: "中央军：一路追击红军，困难难度下逼近时会双倍追击。",
    tw: "中央軍：一路追擊紅軍，困難難度下逼近時會雙倍追擊。",
    en: "Central Army: pursues the Red Army relentlessly; on Hard it double-moves when close.",
  },
  enemyBehaviorChuan: {
    zh: "川军：行动缓慢，堵截离红军最近的渡口。",
    tw: "川軍：行動緩慢，堵截離紅軍最近的渡口。",
    en: "Sichuan Army: slow, but moves to block the ferry nearest the Red Army.",
  },
  enemyBehaviorQian: {
    zh: "黔军：沿固定路线巡逻，红军进入两格内才追击。",
    tw: "黔軍：沿固定路線巡邏，紅軍進入兩格內才追擊。",
    en: "Guizhou Army: patrols a fixed route, and only pursues when the Red Army comes within two nodes.",
  },
  enemyBehaviorDian: {
    zh: "滇军：增援而来，一路追击红军（仅困难难度出现）。",
    tw: "滇軍：增援而來，一路追擊紅軍（僅困難難度出現）。",
    en: "Yunnan Army: arrives as reinforcements and pursues the Red Army (Hard only).",
  },
};

// ---------- 渡河小注（沿用原版） ----------
export const HISTORY_NOTES: Record<
  number,
  Record<Lang3, { title: string; text: string }>
> = {
  1: {
    zh: {
      title: "一渡赤水 · 1935年1月29日",
      text: "红军从土城、元厚一渡赤水河，向西进入川南，随后在云南扎西集结整编。",
    },
    tw: {
      title: "一渡赤水 · 1935年1月29日",
      text: "紅軍從土城、元厚一渡赤水河，向西進入川南，隨後在雲南扎西集結整編。",
    },
    en: {
      title: "First Crossing · 29 Jan 1935",
      text: "The Red Army crossed the Chishui from Tucheng and Yuanhou, pushed west into southern Sichuan, and regrouped at Zhaxi in Yunnan.",
    },
  },
  2: {
    zh: {
      title: "二渡赤水 · 1935年2月18–21日",
      text: "红军从太平渡、二郎滩二渡赤水，重入贵州；随后取桐梓、夺娄山关、再占遵义，歼敌两个师又八个团，取得长征以来最大的一次胜利。",
    },
    tw: {
      title: "二渡赤水 · 1935年2月18–21日",
      text: "紅軍從太平渡、二郎灘二渡赤水，重入貴州；隨後取桐梓、奪婁山關、再佔遵義，殲敵兩個師又八個團，取得長征以來最大的一次勝利。",
    },
    en: {
      title: "Second Crossing · 18–21 Feb 1935",
      text: "The Red Army recrossed at Taipingdu and Erlangtan, re-entered Guizhou, then took Tongzi, stormed Loushan Pass and retook Zunyi, wiping out two enemy divisions and eight regiments — its greatest victory of the Long March so far.",
    },
  },
  3: {
    zh: {
      title: "三渡赤水 · 1935年3月16–17日",
      text: "红军从茅台三渡赤水，西进古蔺、叙永，佯作北渡长江，调动敌军北上布防。",
    },
    tw: {
      title: "三渡赤水 · 1935年3月16–17日",
      text: "紅軍從茅台三渡赤水，西進古藺、敘永，佯作北渡長江，調動敵軍北上布防。",
    },
    en: {
      title: "Third Crossing · 16–17 Mar 1935",
      text: "The Red Army crossed west again from Maotai toward Gulin and Xuyong, pretending to force the Yangtze, and drew the enemy north to block the river.",
    },
  },
  4: {
    zh: {
      title: "四渡赤水 · 1935年3月21日晚–22日",
      text: "红军从二郎滩、太平渡四渡赤水，再入黔北；随即南渡乌江、佯攻贵阳、巧渡金沙江，跳出数十万敌军的包围圈。",
    },
    tw: {
      title: "四渡赤水 · 1935年3月21日晚–22日",
      text: "紅軍從二郎灘、太平渡四渡赤水，再入黔北；隨即南渡烏江、佯攻貴陽、巧渡金沙江，跳出數十萬敵軍的包圍圈。",
    },
    en: {
      title: "Fourth Crossing · night of 21–22 Mar 1935",
      text: "The Red Army crossed east again at Erlangtan and Taipingdu, back into northern Guizhou, then forced the Wu River, feinted at Guiyang and slipped across the Jinsha, breaking out of the encirclement of hundreds of thousands.",
    },
  },
};

export const LOUSHANGUAN_NOTE: Record<Lang3, { title: string; text: string }> = {
  zh: {
    title: "娄山关大捷 · 1935年2月25–28日",
    text: "红军夺娄山关、再占遵义，歼敌两个师又八个团，俘敌3000余人。这是中央红军长征以来取得的最大的一次胜利，士气大振。",
  },
  tw: {
    title: "婁山關大捷 · 1935年2月25–28日",
    text: "紅軍奪婁山關、再佔遵義，殲敵兩個師又八個團，俘敵3000餘人。這是中央紅軍長征以來取得的最大的一次勝利，士氣大振。",
  },
  en: {
    title: "Victory at Loushan Pass · 25–28 Feb 1935",
    text: "The Red Army stormed Loushan Pass and retook Zunyi, destroying two divisions and eight regiments and capturing over 3,000 men — its greatest victory of the Long March so far. Morale soars.",
  },
};

export const LOSE_TEXT: Record<LoseReason, Record<Lang3, string>> = {
  caught: {
    zh: "红军被敌军追上了。历史上，红军靠不断运动甩开追兵——停下来，就会被合围。",
    tw: "紅軍被敵軍追上了。歷史上，紅軍靠不斷運動甩開追兵——停下來，就會被合圍。",
    en: "An enemy column caught up with the Red Army. In history, the Red Army survived by never stopping — stand still, and the net closes.",
  },
  morale: {
    zh: "士气涣散，队伍走不动了。行军、渡河都在消耗士气，记得夺回娄山关提振士气、及时休整。",
    tw: "士氣渙散，隊伍走不動了。行軍、渡河都在消耗士氣，記得奪回婁山關提振士氣、及時休整。",
    en: "Morale collapsed and the column could march no further. Marching and crossing wear morale down — retake Loushan Pass to lift it, and rest when you can.",
  },
  supplies: {
    zh: "粮草断绝，队伍走不动了。进城镇补给，别在野地里绕远路。",
    tw: "糧草斷絕，隊伍走不動了。進城鎮補給，別在野地裡繞遠路。",
    en: "Supplies ran out and the column could march no further. Resupply in the towns, and don't wander the back country.",
  },
};

export const HINT_TEXT: Record<
  "notAdjacent" | "occupied" | "locked" | "blockedFerry" | "noPath",
  Record<Lang3, string>
> = {
  notAdjacent: {
    zh: "只能移动到相邻地点。",
    tw: "只能移動到相鄰地點。",
    en: "You can only move to an adjacent place.",
  },
  occupied: {
    zh: "该处有敌军，无法进入。",
    tw: "該處有敵軍，無法進入。",
    en: "An enemy column holds that place — you can't move in.",
  },
  locked: {
    zh: "须先完成四渡，方可南下云南。",
    tw: "須先完成四渡，方可南下雲南。",
    en: "Finish all four crossings before heading south to Yunnan.",
  },
  blockedFerry: {
    zh: "该渡口暂时封锁。",
    tw: "該渡口暫時封鎖。",
    en: "That ferry is blocked for now.",
  },
  noPath: {
    zh: "急行军没有可行的路。",
    tw: "急行軍沒有可行的路。",
    en: "No route for a forced march.",
  },
};

/** 中文数字（渡河小注用）。 */
export const CN_NUM: Record<number, string> = { 1: "一", 2: "二", 3: "三", 4: "四" };

// ---------- 日志 ----------
export function formatLog(e: LogEntry, lang: Lang3): string {
  const nm = (id: NodeId) => NODE_MAP[id].name[lang];
  const turn = `T${e.turn}`;
  switch (e.kind) {
    case "move": {
      const mode = e.mode === "rush"
        ? lang === "en" ? "forced march" : lang === "tw" ? "急行軍" : "急行军"
        : lang === "en" ? "steady march" : lang === "tw" ? "穩步行軍" : "稳步行军";
      return lang === "en"
        ? `${turn} · Red Army ${mode}: ${nm(e.from)} → ${nm(e.to)}`
        : lang === "tw"
          ? `${turn} · 紅軍${mode}：${nm(e.from)} → ${nm(e.to)}`
          : `${turn} · 红军${mode}：${nm(e.from)} → ${nm(e.to)}`;
    }
    case "cross": {
      if (lang === "en") {
        return e.n <= 4
          ? `${turn} · Crossing! Red Army forded ${nm(e.from)} → ${nm(e.to)} — crossing ${e.n} of 4`
          : `${turn} · Red Army forded ${nm(e.from)} → ${nm(e.to)} (four crossings already done)`;
      }
      const label = e.n <= 4 ? `——第${CN_NUM[e.n]}渡` : "（四渡已完成，此为多余一渡）";
      const verb = lang === "tw" ? "紅軍由" : "红军由";
      return `${turn} · 渡河！${verb}${nm(e.from)}渡至${nm(e.to)}${label}`;
    }
    case "rest":
      return lang === "en"
        ? `${turn} · Rested in place: morale +8, supplies −2`
        : lang === "tw"
          ? `${turn} · 原地休整：士氣+8，糧草−2`
          : `${turn} · 原地休整：士气+8，粮草−2`;
    case "feint":
      return lang === "en"
        ? `${turn} · Feint at Guiyang! The enemy columns were drawn away`
        : lang === "tw"
          ? `${turn} · 佯攻貴陽！敵軍被調動，撲向貴陽方向`
          : `${turn} · 佯攻贵阳！敌军被调动，扑向贵阳方向`;
    case "decoy":
      return lang === "en"
        ? `${turn} · Decoy detachment sent: ${ENEMY_NAMES[e.enemy].en} drawn away`
        : lang === "tw"
          ? `${turn} · 分兵疑敵：${ENEMY_NAMES[e.enemy][lang]}被調開`
          : `${turn} · 分兵疑敌：${ENEMY_NAMES[e.enemy][lang]}被调开`;
    case "evade":
      return lang === "en"
        ? `${turn} · Slipped away from ${ENEMY_NAMES[e.enemy].en}: fell back ${nm(e.from)} → ${nm(e.to)}`
        : lang === "tw"
          ? `${turn} · 避戰${ENEMY_NAMES[e.enemy][lang]}，退回${nm(e.to)}`
          : `${turn} · 避战${ENEMY_NAMES[e.enemy][lang]}，退回${nm(e.to)}`;
    case "gameEvent": {
      const def = EVENT_DEFS[e.eventId];
      const opt = def.options[e.option];
      return lang === "en"
        ? `${turn} · ${def.title.en} — ${opt.label.en}`
        : lang === "tw"
          ? `${turn} · ${def.title.tw}——${opt.label.tw}`
          : `${turn} · ${def.title.zh}——${opt.label.zh}`;
    }
    case "combat": {
      const kind = e.defense
        ? lang === "en" ? "Meeting engagement" : lang === "tw" ? "遭遇戰" : "遭遇战"
        : lang === "en" ? "Ambush" : lang === "tw" ? "伏擊" : "伏击";
      return lang === "en"
        ? e.won
          ? `${turn} · ${kind}! ${ENEMY_NAMES[e.enemy].en} routed — captured supplies +8`
          : e.defense
            ? `${turn} · ${kind} lost against ${ENEMY_NAMES[e.enemy].en} — captured`
            : `${turn} · ${kind} failed against ${ENEMY_NAMES[e.enemy].en}`
        : lang === "tw"
          ? e.won
            ? `${turn} · ${kind}成功！${ENEMY_NAMES[e.enemy][lang]}被擊潰，繳獲糧草+8`
            : e.defense
              ? `${turn} · ${kind}失利，${ENEMY_NAMES[e.enemy][lang]}撲上來了`
              : `${turn} · ${kind}受挫，${ENEMY_NAMES[e.enemy][lang]}未能擊潰`
          : e.won
            ? `${turn} · ${kind}成功！${ENEMY_NAMES[e.enemy][lang]}被击溃，缴获粮草+8`
            : e.defense
              ? `${turn} · ${kind}失利，${ENEMY_NAMES[e.enemy][lang]}扑上来了`
              : `${turn} · ${kind}受挫，${ENEMY_NAMES[e.enemy][lang]}未能击溃`;
    }
    case "quiz": {
      const q = QUIZ_MAP[e.question];
      return lang === "en"
        ? e.correct
          ? `${turn} · Quiz correct: ${q.q.en} — morale +5, supplies +5`
          : `${turn} · Quiz missed: ${q.q.en}`
        : lang === "tw"
          ? e.correct
            ? `${turn} · 問答答對：${q.q.tw}——士氣+5，糧草+5`
            : `${turn} · 問答答錯：${q.q.tw}`
          : e.correct
            ? `${turn} · 问答答对：${q.q.zh}——士气+5，粮草+5`
            : `${turn} · 问答答错：${q.q.zh}`;
    }
    case "codex": {
      const c = CODEX_MAP[e.cardId];
      return lang === "en"
        ? `${turn} · New history card: ${c.title.en}`
        : lang === "tw"
          ? `${turn} · 解鎖圖鑑：${c.title.tw}`
          : `${turn} · 解锁图鉴：${c.title.zh}`;
    }
    case "event":
      if (e.event === "supply") {
        return lang === "en"
          ? `${turn} · Entered ${nm(e.node)}: resupplied +12`
          : lang === "tw"
            ? `${turn} · 進入${nm(e.node)}，補充糧草+12`
            : `${turn} · 进入${nm(e.node)}，补充粮草+12`;
      }
      return lang === "en"
        ? `${turn} · Victory at Loushan Pass! Morale +20`
        : lang === "tw"
          ? `${turn} · 婁山關大捷！士氣+20`
          : `${turn} · 娄山关大捷！士气+20`;
    case "enemy":
      return lang === "en"
        ? `${turn} · Enemy moved: ${e.moves.map((m) => `${ENEMY_NAMES[m.enemy].en} → ${nm(m.to)}`).join("; ")}`
        : `${turn} · ${lang === "tw" ? "敵軍動向" : "敌军动向"}：${e.moves.map((m) => `${ENEMY_NAMES[m.enemy][lang]}至${nm(m.to)}`).join("、")}`;
    case "info":
      if (e.key === "start") {
        return lang === "en"
          ? "January 1935: the Red Army stands at Tucheng with its back to the river. West lies the only way out."
          : lang === "tw"
            ? "1935年1月：紅軍背靠赤水河立於土城，向西是唯一的出路。"
            : "1935年1月：红军背靠赤水河立于土城，向西是唯一的出路。";
      }
      if (e.key === "crossSkip") {
        return lang === "en"
          ? `${turn} · The enemy could not find boats and did not follow across`
          : lang === "tw"
            ? `${turn} · 渡河之後，敵軍一時找不到船，未能跟進`
            : `${turn} · 渡河之后，敌军一时找不到船，未能跟进`;
      }
      return lang === "en"
        ? `${turn} · The enemy columns rushed toward Guiyang and did not advance`
        : lang === "tw"
          ? `${turn} · 敵軍撲向貴陽，未能跟進`
          : `${turn} · 敌军扑向贵阳，未能跟进`;
    case "win":
      return lang === "en"
        ? `${turn} · The Red Army reached Yunnan — out of the encirclement!`
        : lang === "tw"
          ? `${turn} · 紅軍抵達雲南，跳出包圍圈！`
          : `${turn} · 红军抵达云南，跳出包围圈！`;
    case "lose":
      if (e.reason === "caught") {
        return lang === "en"
          ? `${turn} · Caught by an enemy column at ${e.node ? nm(e.node) : ""}`
          : lang === "tw"
            ? `${turn} · 紅軍在${e.node ? nm(e.node) : ""}被敵軍追上`
            : `${turn} · 红军在${e.node ? nm(e.node) : ""}被敌军追上`;
      }
      return lang === "en"
        ? e.reason === "morale"
          ? `${turn} · Morale collapsed`
          : `${turn} · Supplies ran out`
        : lang === "tw"
          ? e.reason === "morale"
            ? `${turn} · 士氣渙散`
            : `${turn} · 糧草斷絕`
          : e.reason === "morale"
            ? `${turn} · 士气涣散`
            : `${turn} · 粮草断绝`;
  }
}
