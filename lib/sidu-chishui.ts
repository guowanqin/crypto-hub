// 四渡赤水小游戏：纯逻辑（无 React），地图、走法、敌军、资源、胜负判定。
// 史实口径（来源：国防部 mod.gov.cn、国史网 dswxyjy.org.cn、维基百科「四渡赤水」）：
// 一渡 1935-01-29 土城/元厚；二渡 1935-02-18~21 太平渡/二郎滩，随后取桐梓、
// 夺娄山关、再占遵义；三渡 1935-03-16~17 茅台；四渡 1935-03-21 晚~22 太平渡/
// 二郎滩；随后南渡乌江、佯攻贵阳，1935-05-09 巧渡金沙江脱险。

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
  { a: "maotai", b: "xuyong", crossing: true },
  { a: "maotai", b: "renhuai" },
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

export type EnemyId = "chuan" | "qian" | "central";

export const ENEMY_NAMES: Record<EnemyId, Record<Lang3, string>> = {
  chuan: { zh: "川军", tw: "川軍", en: "Sichuan Army" },
  qian: { zh: "黔军", tw: "黔軍", en: "Guizhou Army" },
  central: { zh: "中央军", tw: "中央軍", en: "Central Army" },
};

export const ENEMY_MARK: Record<EnemyId, string> = {
  chuan: "川",
  qian: "黔",
  central: "中",
};

export const START_MORALE = 70;
export const START_SUPPLIES = 45;
export const MOVE_MORALE_COST = 2;
export const MOVE_SUPPLIES_COST = 3;
export const CROSS_MORALE_COST = 3;
export const CROSS_SUPPLIES_COST = 8;
export const SUPPLY_BONUS = 12;
export const REST_MORALE = 8;
export const REST_SUPPLIES_COST = 2;
export const LOUSHANGUAN_BONUS = 20;
export const FEINT_SKIP_TURNS = 2;

export type LoseReason = "caught" | "morale" | "supplies";

export type LogEntry =
  | { id: number; turn: number; kind: "move"; from: NodeId; to: NodeId }
  | { id: number; turn: number; kind: "cross"; from: NodeId; to: NodeId; n: number }
  | { id: number; turn: number; kind: "rest" }
  | { id: number; turn: number; kind: "feint" }
  | { id: number; turn: number; kind: "event"; event: "supply" | "loushanguan"; node: NodeId }
  | { id: number; turn: number; kind: "enemy"; moves: { enemy: EnemyId; to: NodeId }[] }
  | { id: number; turn: number; kind: "info"; key: "start" | "crossSkip" | "feintSkip" }
  | { id: number; turn: number; kind: "win" }
  | { id: number; turn: number; kind: "lose"; reason: LoseReason; node?: NodeId };

export interface EnemyState {
  id: EnemyId;
  node: NodeId;
}

export interface GameState {
  phase: "start" | "playing" | "won" | "lost";
  player: NodeId;
  prevPlayer: NodeId;
  turn: number;
  morale: number;
  supplies: number;
  crossings: number;
  enemies: EnemyState[];
  visitedSupply: NodeId[];
  feintUsed: boolean;
  feintTurnsLeft: number;
  loushanguanDone: boolean;
  log: LogEntry[];
  loseReason?: LoseReason;
  /** 最近一次渡河对应的战史小注编号（1–4），0 表示暂无 */
  lastNote: number;
}

export function initialState(): GameState {
  return {
    phase: "start",
    player: "tucheng",
    prevPlayer: "tucheng",
    turn: 0,
    morale: START_MORALE,
    supplies: START_SUPPLIES,
    crossings: 0,
    enemies: [
      { id: "chuan", node: "chishui" },
      { id: "qian", node: "tongzi" },
      { id: "central", node: "renhuai" },
    ],
    visitedSupply: [],
    feintUsed: false,
    feintTurnsLeft: 0,
    loushanguanDone: false,
    log: [{ id: 0, turn: 0, kind: "info", key: "start" }],
    lastNote: 0,
  };
}

const NO_YUNNAN: ReadonlySet<NodeId> = new Set(["yunnan"]);

export function enemyAt(s: GameState, id: NodeId): EnemyState | undefined {
  return s.enemies.find((e) => e.node === id);
}

export type MoveProblem = "notAdjacent" | "occupied" | "locked";

/** 走法校验（组件与模拟共用）：相邻、未被敌军占据、四渡未完成时不得南下云南。 */
export function validateMove(s: GameState, target: NodeId): MoveProblem | null {
  if (target === s.player) return "notAdjacent";
  if (!ADJ[s.player].includes(target)) return "notAdjacent";
  if (enemyAt(s, target)) return "occupied";
  if (target === "yunnan" && s.crossings < 4) return "locked";
  return null;
}

export function minEnemyDistance(s: GameState): number | null {
  let best: number | null = null;
  for (const e of s.enemies) {
    const d = bfsDistance(e.node, s.player, NO_YUNNAN);
    if (d !== null && (best === null || d < best)) best = d;
  }
  return best;
}

let logSeq = 1;
function nextLogId(): number {
  return logSeq++;
}

/**
 * 敌军行动：每支敌军向玩家上一回合所在位置逼近一格（总是慢一步）；
 * 若敌军正站在玩家刚离开的位置，则改向玩家当前位置追击。
 * 玩家本回合渡河时，敌军一时找不到船，停一回合；佯攻贵阳生效期内同样停步。
 */
function moveEnemies(s: GameState, crossed: boolean): GameState {
  const log = [...s.log];
  if (crossed) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "info", key: "crossSkip" });
    return { ...s, log };
  }
  if (s.feintTurnsLeft > 0) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "info", key: "feintSkip" });
    return { ...s, log, feintTurnsLeft: s.feintTurnsLeft - 1 };
  }
  const enemies = s.enemies.map((e) => {
    const target = e.node === s.prevPlayer ? s.player : s.prevPlayer;
    const step = nextStep(e.node, target, NO_YUNNAN);
    return step ? { ...e, node: step } : e;
  });
  const moves = enemies
    .filter((e, i) => e.node !== s.enemies[i].node)
    .map((e) => ({ enemy: e.id, to: e.node }));
  if (moves.length > 0) {
    log.push({ id: nextLogId(), turn: s.turn, kind: "enemy", moves });
  }
  return { ...s, enemies, log };
}

export function doMove(s: GameState, target: NodeId): GameState {
  const from = s.player;
  const crossing = isCrossingEdge(from, target);
  const turn = s.turn + 1;
  let morale = s.morale - MOVE_MORALE_COST;
  let supplies = s.supplies - MOVE_SUPPLIES_COST;
  let crossings = s.crossings;
  let lastNote = s.lastNote;
  let visitedSupply = s.visitedSupply;
  let loushanguanDone = s.loushanguanDone;
  const log: LogEntry[] = [...s.log];
  if (crossing) {
    morale -= CROSS_MORALE_COST;
    supplies -= CROSS_SUPPLIES_COST;
    crossings += 1;
    if (crossings <= 4) lastNote = crossings;
    log.push({ id: nextLogId(), turn, kind: "cross", from, to: target, n: crossings });
  } else {
    log.push({ id: nextLogId(), turn, kind: "move", from, to: target });
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
  let ns: GameState = {
    ...s,
    player: target,
    prevPlayer: from,
    turn,
    morale,
    supplies,
    crossings,
    visitedSupply,
    loushanguanDone,
    lastNote,
    log,
  };
  if (target === "yunnan") {
    return {
      ...ns,
      phase: "won",
      log: [...ns.log, { id: nextLogId(), turn, kind: "win" }],
    };
  }
  if (morale <= 0) {
    return {
      ...ns,
      phase: "lost",
      loseReason: "morale",
      log: [...ns.log, { id: nextLogId(), turn, kind: "lose", reason: "morale" }],
    };
  }
  if (supplies <= 0) {
    return {
      ...ns,
      phase: "lost",
      loseReason: "supplies",
      log: [...ns.log, { id: nextLogId(), turn, kind: "lose", reason: "supplies" }],
    };
  }
  ns = moveEnemies(ns, crossing);
  if (ns.enemies.some((e) => e.node === ns.player)) {
    return {
      ...ns,
      phase: "lost",
      loseReason: "caught",
      log: [
        ...ns.log,
        { id: nextLogId(), turn, kind: "lose", reason: "caught", node: ns.player },
      ],
    };
  }
  return ns;
}

export function doRest(s: GameState): GameState {
  const turn = s.turn + 1;
  const morale = Math.min(100, s.morale + REST_MORALE);
  const supplies = s.supplies - REST_SUPPLIES_COST;
  let ns: GameState = {
    ...s,
    prevPlayer: s.player,
    turn,
    morale,
    supplies,
    log: [...s.log, { id: nextLogId(), turn, kind: "rest" }],
  };
  if (supplies <= 0) {
    return {
      ...ns,
      phase: "lost",
      loseReason: "supplies",
      log: [...ns.log, { id: nextLogId(), turn, kind: "lose", reason: "supplies" }],
    };
  }
  ns = moveEnemies(ns, false);
  if (ns.enemies.some((e) => e.node === ns.player)) {
    return {
      ...ns,
      phase: "lost",
      loseReason: "caught",
      log: [
        ...ns.log,
        { id: nextLogId(), turn, kind: "lose", reason: "caught", node: ns.player },
      ],
    };
  }
  return ns;
}

/** 佯攻贵阳：一次性免费行动，把每支敌军调到离玩家最远的地点，并让敌军停两回合。 */
export function doFeint(s: GameState): GameState {
  if (s.feintUsed || s.phase !== "playing") return s;
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
    return best ? { ...e, node: best } : e;
  });
  return {
    ...s,
    feintUsed: true,
    feintTurnsLeft: FEINT_SKIP_TURNS,
    enemies,
    log: [...s.log, { id: nextLogId(), turn: s.turn, kind: "feint" }],
  };
}

// ---------- 文案（三语，tw 为静态写死，不运行时转换） ----------

export interface GameStrings {
  intro: string;
  rulesTitle: string;
  rules: string[];
  start: string;
  restart: string;
  crossings: string;
  crossingsDone: string;
  morale: string;
  supplies: string;
  turn: string;
  enemyDist: string;
  feint: string;
  feintDone: string;
  rest: string;
  restBlocked: string;
  logTitle: string;
  noteTitle: string;
  winTitle: string;
  winText: string;
  loseTitle: string;
  moveHint: string;
  riverLabel: string;
  bestNone: string;
  bestLine: string;
  legendArmy: string;
  kindLabel: Record<NodeKind, string>;
}

export const STR: Record<Lang3, GameStrings> = {
  zh: {
    intro:
      "1935年1月，中央红军离开遵义，国民党40万大军围追堵截。红军四渡赤水，声东击西、忽东忽西，三个月后跳出包围圈，巧渡金沙江。在这盘棋里，你就是红军的指挥员：带队伍走对每一步，渡过四次赤水河，南下云南，活着走出去。",
    rulesTitle: "怎么玩",
    rules: [
      "每回合你移动一格（点相邻地点）；随后敌军向你逼近一格。",
      "渡河只能走渡口连线（蓝色虚线）；每渡一次耗粮草，渡完四次才能南下云南。",
      "士气或粮草归零即失败；被敌军追上也失败。进城镇可补给粮草。",
      "夺回娄山关、重占遵义可提振士气；佯攻贵阳一生只能用一次，能把敌军调开。",
      "渡河后敌军一时找不到船，会停一回合——善用这个空当。",
    ],
    start: "开始长征",
    restart: "再来一局",
    crossings: "渡河",
    crossingsDone: "四渡已完成",
    morale: "士气",
    supplies: "粮草",
    turn: "回合",
    enemyDist: "敌军最近距离",
    feint: "佯攻贵阳",
    feintDone: "已用过",
    rest: "原地休整",
    restBlocked: "敌军逼近，无法休整",
    logTitle: "行军日志",
    noteTitle: "战史小注",
    winTitle: "跳出包围圈！",
    winText:
      "1935年5月9日，中央红军巧渡金沙江，摆脱了数十万敌军的围追堵截。四渡赤水历时三个多月，共歼灭和击溃敌军4个师、2个旅另10个团。——你走完了这段路。",
    loseTitle: "长征中断",
    moveHint: "点地图上相邻的地点移动红军；金色光圈是可以走的地方。",
    riverLabel: "赤水河",
    bestNone: "暂无战绩，来走第一局。",
    bestLine: "最佳战绩：{turns} 回合脱险 · 共胜 {wins} 局",
    legendArmy: "红军",
    kindLabel: {
      start: "起点",
      town: "城镇",
      ford: "渡口",
      pass: "关隘",
      river: "江河",
      escape: "终点",
    },
  },
  tw: {
    intro:
      "1935年1月，中央紅軍離開遵義，國民黨40萬大軍圍追堵截。紅軍四渡赤水，聲東擊西、忽東忽西，三個月後跳出包圍圈，巧渡金沙江。在這盤棋裡，你就是紅軍的指揮員：帶隊伍走對每一步，渡過四次赤水河，南下雲南，活著走出去。",
    rulesTitle: "怎麼玩",
    rules: [
      "每回合你移動一格（點相鄰地點）；隨後敵軍向你逼近一格。",
      "渡河只能走渡口連線（藍色虛線）；每渡一次耗糧草，渡完四次才能南下雲南。",
      "士氣或糧草歸零即失敗；被敵軍追上也失敗。進城鎮可補給糧草。",
      "奪回婁山關、重佔遵義可提振士氣；佯攻貴陽一生只能用一次，能把敵軍調開。",
      "渡河後敵軍一時找不到船，會停一回合——善用這個空當。",
    ],
    start: "開始長征",
    restart: "再來一局",
    crossings: "渡河",
    crossingsDone: "四渡已完成",
    morale: "士氣",
    supplies: "糧草",
    turn: "回合",
    enemyDist: "敵軍最近距離",
    feint: "佯攻貴陽",
    feintDone: "已用過",
    rest: "原地休整",
    restBlocked: "敵軍逼近，無法休整",
    logTitle: "行軍日誌",
    noteTitle: "戰史小注",
    winTitle: "跳出包圍圈！",
    winText:
      "1935年5月9日，中央紅軍巧渡金沙江，擺脫了數十萬敵軍的圍追堵截。四渡赤水歷時三個多月，共殲滅和擊潰敵軍4個師、2個旅另10個團。——你走完了這段路。",
    loseTitle: "長征中斷",
    moveHint: "點地圖上相鄰的地點移動紅軍；金色光圈是可以走的地方。",
    riverLabel: "赤水河",
    bestNone: "暫無戰績，來走第一局。",
    bestLine: "最佳戰績：{turns} 回合脫險 · 共勝 {wins} 局",
    legendArmy: "紅軍",
    kindLabel: {
      start: "起點",
      town: "城鎮",
      ford: "渡口",
      pass: "關隘",
      river: "江河",
      escape: "終點",
    },
  },
  en: {
    intro:
      "January 1935. The Central Red Army has left Zunyi, and some 400,000 Nationalist troops are closing in. The Red Army crossed the Chishui River four times — feinting east, striking west — and three months later slipped the encirclement and crossed the Jinsha River. In this game you are the commander: move wisely, cross the river four times, head south to Yunnan, and get out alive.",
    rulesTitle: "How to play",
    rules: [
      "Each turn you move one node (click an adjacent place); then the enemy columns advance one node toward you.",
      "The river can only be crossed on ferry links (blue dashes). Every crossing costs supplies; only after four crossings can you head south to Yunnan.",
      "If morale or supplies hit zero, you lose — and so do you if an enemy column catches you. Entering a town resupplies you.",
      "Retaking Loushan Pass and Zunyi lifts morale; the feint on Guiyang can be used once, and it draws the enemy away.",
      "After you cross the river, the enemy cannot find boats and skips a turn — use that opening.",
    ],
    start: "Start the March",
    restart: "Play again",
    crossings: "Crossings",
    crossingsDone: "Four crossings done",
    morale: "Morale",
    supplies: "Supplies",
    turn: "Turn",
    enemyDist: "Nearest enemy",
    feint: "Feint at Guiyang",
    feintDone: "Used",
    rest: "Rest in place",
    restBlocked: "Enemy too close to rest",
    logTitle: "March log",
    noteTitle: "History note",
    winTitle: "Out of the encirclement!",
    winText:
      "On 9 May 1935 the Central Red Army crossed the Jinsha River and broke free of hundreds of thousands of pursuers. The four crossings took over three months and destroyed four enemy divisions, two brigades and ten more regiments. — You walked that road.",
    loseTitle: "The march is broken",
    moveHint: "Click an adjacent place on the map to move. Gold rings mark where you can go.",
    riverLabel: "Chishui River",
    bestNone: "No record yet — play your first game.",
    bestLine: "Best: escaped in {turns} turns · {wins} wins",
    legendArmy: "Red Army",
    kindLabel: {
      start: "Start",
      town: "Town",
      ford: "Ferry",
      pass: "Pass",
      river: "River",
      escape: "Escape",
    },
  },
};

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
  "notAdjacent" | "occupied" | "locked",
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
};

const CN_NUM = ["", "一", "二", "三", "四"];

export function formatLog(e: LogEntry, lang: Lang3): string {
  const nm = (id: NodeId) => NODE_MAP[id].name[lang];
  const turn = `T${e.turn}`;
  switch (e.kind) {
    case "move":
      return lang === "en"
        ? `${turn} · Red Army marched ${nm(e.from)} → ${nm(e.to)}`
        : `${turn} · 红军由${nm(e.from)}行至${nm(e.to)}`.replace("红军", lang === "tw" ? "紅軍" : "红军");
    case "cross": {
      if (lang === "en") {
        return e.n <= 4
          ? `${turn} · Crossing! Red Army forded ${nm(e.from)} → ${nm(e.to)} — crossing ${e.n} of 4`
          : `${turn} · Red Army forded ${nm(e.from)} → ${nm(e.to)} (four crossings already done)`;
      }
      const label = e.n <= 4 ? `——第${CN_NUM[e.n]}渡` : "（四渡已完成，此为多余一渡）";
      const verb = lang === "tw" ? "紅軍由" : "红军由";
      const cross = lang === "tw" ? "渡河！" : "渡河！";
      return `${turn} · ${cross}${verb}${nm(e.from)}渡至${nm(e.to)}${label}`;
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
        ? `${turn} · Enemy moved: ${e.moves.map((m) => `${ENEMY_NAMES[m.enemy].en} → ${nm(m.to)}`).join("； ")}`
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
