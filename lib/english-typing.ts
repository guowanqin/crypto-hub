// 打字学英语 · 练习引擎：记忆曲线、经验等级、进度存储（全部本地完成）
// 界面文案三语：zh 手写，en 手写，tw 由 OpenCC s2twp 离线转换后写死（见仓库外脚本）。

export interface Tri {
  zh: string;
  tw: string;
  en: string;
}

export const ET_STR = {
  tabWords: { zh: "单词拼写", tw: "單詞拼寫", en: "Words" },
  tabSentences: { zh: "句子打字", tw: "句子打字", en: "Sentences" },
  tabReview: { zh: "记忆复习", tw: "記憶複習", en: "Review" },
  tabBook: { zh: "错词本", tw: "錯詞本", en: "Word Book" },
  tabMine: { zh: "我的词包", tw: "我的詞包", en: "My Packs" },
  tabStats: { zh: "学习报告", tw: "學習報告", en: "Report" },
  modeSpell: { zh: "跟读拼写", tw: "跟讀拼寫", en: "Spell it" },
  modeDict: { zh: "听写", tw: "聽寫", en: "Dictation" },
  modeSelf: { zh: "自测", tw: "自測", en: "Self-test" },
  modeSWord: { zh: "单词填空", tw: "單詞填空", en: "Word by word" },
  modeSChunk: { zh: "语块", tw: "語塊", en: "Chunk by chunk" },
  modeSFull: { zh: "整句默写", tw: "整句默寫", en: "Whole sentence" },
  startPractice: { zh: "开始练习", tw: "開始練習", en: "Start practice" },
  practiceFromHere: { zh: "从这里开始练", tw: "從這裡開始練", en: "Practice from here" },
  nextItem: { zh: "下一个", tw: "下一個", en: "Next" },
  checkAnswer: { zh: "检查", tw: "檢查", en: "Check" },
  showAnswer: { zh: "显示答案", tw: "顯示答案", en: "Show answer" },
  correct: { zh: "答对了", tw: "答對了", en: "Correct" },
  wrong: { zh: "答错了", tw: "答錯了", en: "Wrong" },
  correctIs: { zh: "正确答案是", tw: "正確答案是", en: "The correct answer is" },
  yourAnswer: { zh: "你的答案", tw: "你的答案", en: "Your answer" },
  hint: { zh: "提示", tw: "提示", en: "Hint" },
  showHint: { zh: "显示提示", tw: "顯示提示", en: "Show hint" },
  hideHint: { zh: "隐藏提示", tw: "隱藏提示", en: "Hide hint" },
  listen: { zh: "听发音", tw: "聽發音", en: "Listen" },
  listenAgain: { zh: "再听一次", tw: "再聽一次", en: "Listen again" },
  pronUnavailable: { zh: "发音暂不可用，已显示音标", tw: "發音暫不可用，已顯示音標", en: "Audio unavailable — phonetic shown instead" },
  listenFirst: { zh: "先听发音，再拼出这个单词", tw: "先聽發音，再拼出這個單詞", en: "Listen first, then spell the word" },
  typeWordHere: { zh: "输入这个单词", tw: "輸入這個單詞", en: "Type the word here" },
  typeChunkHere: { zh: "输入这个语块", tw: "輸入這個語塊", en: "Type this chunk here" },
  typeSentenceHere: { zh: "输入整句", tw: "輸入整句", en: "Type the whole sentence here" },
  meaningIs: { zh: "意思是", tw: "意思是", en: "It means" },
  example: { zh: "例句", tw: "例句", en: "Example" },
  grammarNote: { zh: "语法点", tw: "語法點", en: "Grammar note" },
  translation: { zh: "翻译", tw: "翻譯", en: "Translation" },
  gradeAgain: { zh: "再来一次", tw: "再來一次", en: "Again" },
  gradeHard: { zh: "困难", tw: "困難", en: "Hard" },
  gradeGood: { zh: "掌握了", tw: "掌握了", en: "Got it" },
  gradeHint: { zh: "给自己打个分，决定下次什么时候复习", tw: "給自己打個分，決定下次什麼時候複習", en: "Grade yourself — it decides when this comes back" },
  mastered: { zh: "已掌握", tw: "已掌握", en: "Mastered" },
  markMastered: { zh: "标记已掌握", tw: "標記已掌握", en: "Mark as mastered" },
  unmaster: { zh: "取消已掌握", tw: "取消已掌握", en: "Unmark mastered" },
  favorite: { zh: "收藏", tw: "收藏", en: "Favorite" },
  unfavorite: { zh: "取消收藏", tw: "取消收藏", en: "Unfavorite" },
  favorites: { zh: "收藏", tw: "收藏", en: "Favorites" },
  all: { zh: "全部", tw: "全部", en: "All" },
  notLearned: { zh: "未学", tw: "未學", en: "New" },
  learning: { zh: "学习中", tw: "學習中", en: "Learning" },
  wrongOnly: { zh: "错词", tw: "錯詞", en: "Wrong" },
  searchPh: { zh: "搜索单词或句子…", tw: "搜尋單詞或句子…", en: "Search words or sentences…" },
  noResult: { zh: "没有符合的结果", tw: "沒有符合的結果", en: "Nothing matches" },
  showMore: { zh: "显示更多", tw: "顯示更多", en: "Show more" },
  collapse: { zh: "收起", tw: "收起", en: "Collapse" },
  remaining: { zh: "剩余", tw: "剩餘", en: "remaining" },
  reviewDue: { zh: "到期复习", tw: "到期複習", en: "Due for review" },
  reviewEmpty: { zh: "今天没有到期的复习，好好休息一下。", tw: "今天沒有到期的複習，好好休息一下。", en: "Nothing is due today. Take a break." },
  reviewStart: { zh: "开始复习", tw: "開始複習", en: "Start review" },
  dueIn: { zh: "下次复习", tw: "下次複習", en: "Next review" },
  daysLater: { zh: "天后", tw: "天后", en: "days later" },
  todayDue: { zh: "今天到期", tw: "今天到期", en: "due today" },
  wordsUnit: { zh: "词", tw: "詞", en: "words" },
  sentencesUnit: { zh: "句", tw: "句", en: "sentences" },
  progressLabel: { zh: "进度", tw: "進度", en: "Progress" },
  todayItems: { zh: "今日已练", tw: "今日已練", en: "Done today" },
  accuracy: { zh: "正确率", tw: "正確率", en: "Accuracy" },
  xpLabel: { zh: "经验", tw: "經驗", en: "XP" },
  streakLabel: { zh: "连续天数", tw: "連續天數", en: "Day streak" },
  levelLabel: { zh: "等级", tw: "等級", en: "Level" },
  totalLabel: { zh: "累计已练", tw: "累計已練", en: "Total done" },
  weekTitle: { zh: "近 7 天", tw: "近 7 天", en: "Last 7 days" },
  weakest: { zh: "最弱单词", tw: "最弱單詞", en: "Weakest words" },
  weakestEmpty: { zh: "还没有错词，继续保持。", tw: "還沒有錯詞，繼續保持。", en: "No wrong words yet. Keep it up." },
  exportBtn: { zh: "导出进度", tw: "匯出進度", en: "Export progress" },
  importBtn: { zh: "导入进度", tw: "匯入進度", en: "Import progress" },
  exportDone: { zh: "已下载进度文件", tw: "已下載進度檔案", en: "Progress file downloaded" },
  importDone: { zh: "导入完成", tw: "匯入完成", en: "Import complete" },
  importFail: { zh: "导入失败：文件格式不对", tw: "匯入失敗：檔案格式不對", en: "Import failed: bad file format" },
  resetBtn: { zh: "清空进度", tw: "清空進度", en: "Reset progress" },
  resetConfirm: { zh: "确定要清空全部学习进度吗？", tw: "確定要清空全部學習進度嗎？", en: "Reset all learning progress?" },
  importTitle: { zh: "自定义导入", tw: "自定義匯入", en: "Custom import" },
  importDesc: { zh: "粘贴一段英文，逐句填上中文翻译，就能练自己的句子。", tw: "貼上一段英文，逐句填上中文翻譯，就能練自己的句子。", en: "Paste English text, add a Chinese translation per sentence, and practice your own sentences." },
  importPh: { zh: "粘贴英文文章或句子…", tw: "貼上英文文章或句子…", en: "Paste English text or sentences…" },
  importSplit: { zh: "拆分成句子", tw: "拆分成句子", en: "Split into sentences" },
  importNamePh: { zh: "词包名称，如：我的美剧台词", tw: "詞包名稱，如：我的美劇臺詞", en: "Pack name, e.g. My TV lines" },
  importSave: { zh: "保存为我的词包", tw: "儲存為我的詞包", en: "Save as my pack" },
  importEmpty: { zh: "请先粘贴英文", tw: "請先貼上英文", en: "Paste some English first" },
  importNeedName: { zh: "请给词包起个名字", tw: "請給詞包起個名字", en: "Give the pack a name" },
  noAiNote: { zh: "说明：本站 v1 没有 AI 自动翻译，翻译由你自己填写。", tw: "說明：本站 v1 沒有 AI 自動翻譯，翻譯由你自己填寫。", en: "Note: v1 has no AI auto-translation — you fill in the translations yourself." },
  myPacks: { zh: "我的词包", tw: "我的詞包", en: "My packs" },
  myPacksEmpty: { zh: "还没有自定义词包，上面粘贴一段英文就能建一个。", tw: "還沒有自定義詞包，上面貼上一段英文就能建一個。", en: "No custom packs yet — paste some English above to make one." },
  deletePack: { zh: "删除", tw: "刪除", en: "Delete" },
  deletePackConfirm: { zh: "确定删除这个词包吗？它的学习记录也会一起删掉。", tw: "確定刪除這個詞包嗎？它的學習記錄也會一起刪掉。", en: "Delete this pack? Its learning records go with it." },
  practicePack: { zh: "练这个包", tw: "練這個包", en: "Practice this pack" },
  sessionDone: { zh: "本轮完成", tw: "本輪完成", en: "Session complete" },
  sessionStats: { zh: "本轮答对", tw: "本輪答對", en: "Correct this session" },
  xpEarned: { zh: "获得经验", tw: "獲得經驗", en: "XP earned" },
  againBtn: { zh: "再练一轮", tw: "再練一輪", en: "Practice again" },
  backToList: { zh: "返回列表", tw: "返回列表", en: "Back to list" },
  removeWrong: { zh: "移出错词本", tw: "移出錯詞本", en: "Remove from book" },
  practiceWrong: { zh: "练错词", tw: "練錯詞", en: "Practice wrong ones" },
  wrongCount: { zh: "错", tw: "錯", en: "wrong" },
  timesUnit: { zh: "次", tw: "次", en: "times" },
  achTitle: { zh: "成就", tw: "成就", en: "Achievements" },
  achFirstPack: { zh: "完成第一个词包", tw: "完成第一個詞包", en: "Finished your first pack" },
  achStreak7: { zh: "连续学习 7 天", tw: "連續學習 7 天", en: "7-day streak" },
  ach100: { zh: "累计练满 100 个", tw: "累計練滿 100 個", en: "100 items done" },
  achPerfect: { zh: "一次练习全对", tw: "一次練習全對", en: "A perfect session" },
  achAllModes: { zh: "试过全部六种练法", tw: "試過全部六種練法", en: "Tried all six modes" },
  locked: { zh: "未解锁", tw: "未解鎖", en: "Locked" },
  unlocked: { zh: "已解锁", tw: "已解鎖", en: "Unlocked" },
  sourceNote: { zh: "玩法参考句乐部与开源项目 TypeWords，内容与实现均为本站原创。发音来自 dictionaryapi.dev 免费接口，取不到时用浏览器朗读或音标代替。", tw: "玩法參考句樂部與開源專案 TypeWords，內容與實現均為本站原創。發音來自 dictionaryapi.dev 免費介面，取不到時用瀏覽器朗讀或音標代替。", en: "Gameplay inspired by Julebu and the open-source project TypeWords; all content and code are original to this site. Pronunciation comes from dictionaryapi.dev's free API, falling back to browser speech or phonetics when unavailable." },
  ofTotal: { zh: "个", tw: "個", en: "" },
  chunkOf: { zh: "第", tw: "第", en: "" },
  chunkOf2: { zh: "段，共", tw: "段，共", en: "of" },
  chunkOf3: { zh: "段", tw: "段", en: "" },
  itemOf: { zh: "第", tw: "第", en: "" },
  itemOf2: { zh: "个，共", tw: "個，共", en: "of" },
  itemOf3: { zh: "个", tw: "個", en: "" },
  firstTry: { zh: "一次答对", tw: "一次答對", en: "First try" },
  needType: { zh: "请先输入答案", tw: "請先輸入答案", en: "Type your answer first" },
} as const;

export type EtStrKey = keyof typeof ET_STR;

// ---------- 进度数据 ----------

export type ItemStatus = "new" | "learning" | "mastered";

export interface ItemState {
  status: ItemStatus;
  wrong: number;
  fav: boolean;
  due: number; // 下次复习时间戳（毫秒），0 表示随时可复习
  interval: number; // 间隔天数
  seen: number;
  correct: number;
}

export interface DayStat {
  items: number;
  correct: number;
  seconds: number;
}

export interface CustomSentencePack {
  id: string;
  name: string;
  sentences: { en: string; zh: string; note: string }[];
}

export interface EtProgress {
  items: Record<string, ItemState>;
  xp: number;
  days: Record<string, DayStat>;
  streak: { last: string; count: number };
  customPacks: CustomSentencePack[];
  modesTried: string[];
  perfectSessions: number;
}

export const STORAGE_KEY = "et-progress-v1";

export function emptyProgress(): EtProgress {
  return {
    items: {},
    xp: 0,
    days: {},
    streak: { last: "", count: 0 },
    customPacks: [],
    modesTried: [],
    perfectSessions: 0,
  };
}

export function loadProgress(): EtProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw) as EtProgress;
    return { ...emptyProgress(), ...p };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: EtProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // 存储满了就忽略
  }
}

export function itemState(p: EtProgress, key: string): ItemState {
  return (
    p.items[key] ?? {
      status: "new",
      wrong: 0,
      fav: false,
      due: 0,
      interval: 0,
      seen: 0,
      correct: 0,
    }
  );
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

// ---------- 记忆曲线 ----------

/** 打分后算出新的间隔与到期时间（简化 SM-2：again=10 分钟后，hard=1 天起步，good=翻倍）。 */
export function gradeItem(
  st: ItemState,
  grade: "again" | "hard" | "good",
  now = Date.now()
): ItemState {
  if (grade === "again") {
    return { ...st, status: "learning", interval: 0, due: now + 10 * 60 * 1000 };
  }
  if (grade === "hard") {
    const iv = Math.max(1, Math.round((st.interval || 1) * 1.2));
    return { ...st, status: "learning", interval: iv, due: now + iv * 86400000 };
  }
  const iv = st.interval <= 0 ? 1 : Math.round(st.interval * 2.5);
  return {
    ...st,
    status: iv >= 7 ? "mastered" : "learning",
    interval: iv,
    due: now + iv * 86400000,
  };
}

// ---------- 经验与等级 ----------

export const LEVEL_XP = [0, 60, 150, 300, 500, 800, 1200, 1800, 2600, 3600];

export function levelOf(xp: number): number {
  let lv = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lv = i + 1;
  }
  return lv;
}

export function xpForNextLevel(xp: number): { cur: number; next: number | null } {
  const lv = levelOf(xp);
  if (lv >= LEVEL_XP.length) return { cur: xp, next: null };
  return { cur: xp - LEVEL_XP[lv - 1], next: LEVEL_XP[lv] - LEVEL_XP[lv - 1] };
}

// ---------- 文本规范化（判题用） ----------

export function normAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.!?。！？,，;；:：]+$/g, "")
    .replace(/\s+/g, " ");
}

/** 把句子切成语块：按逗号与 and 断开，再把过小的块合并，保证每块 2–6 个词。 */
export function splitChunks(sentence: string): string[] {
  const raw = sentence
    .split(/,\s*|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (const part of raw) {
    const words = part.split(/\s+/);
    if (chunks.length > 0 && words.length <= 2) {
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + ", " + part;
    } else if (words.length > 6) {
      // 过长的块按 5 词一切
      for (let i = 0; i < words.length; i += 5) {
        chunks.push(words.slice(i, i + 5).join(" "));
      }
    } else {
      chunks.push(part);
    }
  }
  return chunks.length > 0 ? chunks : [sentence];
}

/** 把英文拆成句子（自定义导入用）：按句号/问号/感叹号断句。 */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3 && /[a-zA-Z]/.test(s));
}

/** 句子首字母提示：每个词只留首字母，其余变下划线。 */
export function firstLetterHint(sentence: string): string {
  return sentence
    .split(/\s+/)
    .map((w) => {
      const m = w.match(/^([A-Za-z])([A-Za-z]*)([^A-Za-z]*)$/);
      if (!m) return w;
      return m[1] + "_".repeat(m[2].length) + m[3];
    })
    .join(" ");
}
