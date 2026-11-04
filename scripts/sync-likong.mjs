#!/usr/bin/env node
/**
 * 利空出尽指数 · GDELT 数据同步脚本
 *
 * 流程：逐组向本站的 GDELT 取数代理（/api/likong-src，白名单见
 * lib/likong-config.ts）串行取 timelinevol 日序列，把各组对齐到同一条
 * 连续日轴（缺日补 0），写 lib/data/likong-index.json 后随代码提交。
 *
 * 为什么绕代理：GDELT 对来源 IP 限流（约 1 次 / 5 秒的共享额度），
 * 本机等多数网络直连会被拒；Vercel 出口可用且代理带 6 小时缓存。
 * 本脚本因此严格串行、每次请求间隔 ≥6 秒、失败重试 2 次（退避 30 秒）。
 *
 * 用法：
 *   node scripts/sync-likong.mjs               # 默认拉 24m（约两年）
 *   LIKONG_TIMESPAN=12m node scripts/sync-likong.mjs
 *   LIKONG_SRC_BASE=http://localhost:3000 node scripts/sync-likong.mjs
 *     # 代理尚未上线时，可先本地 `npm run build && npm run start`
 *     # 再指到本地实例做首版引导（走的是同一份代理路由代码）。
 *
 * 词组清单与 lib/likong-config.ts 保持一致（此处只用 id 请数、
 * query 仅写进 meta 存档）；改词组时两边一起改。
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const GROUPS = [
  { id: "main", query: "利空出尽" },
  { id: "land", query: "利空落地" },
  { id: "badnews", query: "坏消息出尽" },
  { id: "gaidie", query: "该跌不跌" },
  { id: "gerou2", query: "割肉离场" },
  { id: "baocang2", query: "爆仓潮" },
];

const BASE = (process.env.LIKONG_SRC_BASE || "https://18btc.cc").replace(/\/$/, "");
const TIMESPAN = process.env.LIKONG_TIMESPAN || "24m";
const GAP_MS = 6500;
const RETRY_WAIT_MS = 30000;
const MAX_ATTEMPTS = 3; // 首试 + 重试 2 次

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "lib", "data", "likong-index.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 断点续传缓存：GDELT 限流时单个词组要反复试很多轮才成一次，全量重跑
// 会把已成功组的配额白白浪费。每组成功后把日序列落到临时目录，24 小时
// 内的重跑直接复用（历史区间的 GDELT 日值在一天尺度上视为不变）。
// 目录可用 LIKONG_SCRATCH 覆盖；缓存只是加速，不影响结果口径。
const SCRATCH = process.env.LIKONG_SCRATCH || join(tmpdir(), "likong-sync-cache");
mkdirSync(SCRATCH, { recursive: true });
const CACHE_FRESH_MS = 24 * 3600 * 1000;

function cacheRead(id) {
  const p = join(SCRATCH, `${id}-${TIMESPAN}.json`);
  try {
    if (Date.now() - statSync(p).mtimeMs > CACHE_FRESH_MS) return null;
    const pts = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(pts) && pts.length ? pts : null;
  } catch {
    return null;
  }
}

function cacheWrite(id, points) {
  try {
    writeFileSync(
      join(SCRATCH, `${id}-${TIMESPAN}.json`),
      JSON.stringify(points),
    );
  } catch {
    /* 缓存写失败不影响主流程 */
  }
}

async function fetchGroup(id) {
  const cached = cacheRead(id);
  if (cached) {
    console.log(`  [${id}] cached (${cached.length} points)`);
    return cached;
  }
  const url = `${BASE}/api/likong-src?g=${encodeURIComponent(id)}&timespan=${TIMESPAN}`;
  let lastErr = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "18btc-likong-sync/1.0" },
        signal: AbortSignal.timeout(120000),
      });
      const text = await res.text();
      if (res.ok && text.startsWith("{")) {
        const j = JSON.parse(text);
        const data = j?.timeline?.[0]?.data;
        if (!Array.isArray(data)) throw new Error("timeline missing in response");
        const points = data.map((p) => ({
          date: `${String(p.date).slice(0, 4)}-${String(p.date).slice(4, 6)}-${String(p.date).slice(6, 8)}`,
          value: Number(p.value) || 0,
        }));
        cacheWrite(id, points);
        return points;
      }
      lastErr = `HTTP ${res.status}: ${text.slice(0, 120)}`;
    } catch (e) {
      lastErr = String(e);
    }
    console.warn(`  [${id}] attempt ${attempt} failed: ${lastErr}`);
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_WAIT_MS);
  }
  throw new Error(`group ${id} failed after ${MAX_ATTEMPTS} attempts: ${lastErr}`);
}

function dayAxis(start, end) {
  const days = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

async function main() {
  console.log(`likong sync: base=${BASE} timespan=${TIMESPAN} groups=${GROUPS.length}`);
  const raw = new Map();
  for (const g of GROUPS) {
    const t0 = Date.now();
    const points = await fetchGroup(g.id);
    raw.set(g.id, new Map(points.map((p) => [p.date, p.value])));
    const nz = points.filter((p) => p.value > 0).length;
    const sum = points.reduce((a, p) => a + p.value, 0);
    console.log(
      `  [${g.id}] ${points.length} points, nonzero ${nz}, sum ${sum.toFixed(4)}, ` +
        `${points[0]?.date ?? "-"} .. ${points[points.length - 1]?.date ?? "-"}`,
    );
    const elapsed = Date.now() - t0;
    if (elapsed < GAP_MS) await sleep(GAP_MS - elapsed);
  }

  // 连续日轴：全体组的最早首日 → 最晚末日，缺日补 0
  let start = null;
  let end = null;
  for (const m of raw.values()) {
    for (const date of m.keys()) {
      if (start == null || date < start) start = date;
      if (end == null || date > end) end = date;
    }
  }
  if (!start || !end) throw new Error("no data from any group");
  const days = dayAxis(start, end);
  const round6 = (v) => Math.round(v * 1e6) / 1e6;
  const groups = GROUPS.map((g) => {
    const m = raw.get(g.id);
    return { id: g.id, values: days.map((d) => round6(m.get(d) ?? 0)) };
  });

  // 社交采样预留：已有文件里若有内容，原样保留，不覆盖
  let socialSample = [];
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      if (Array.isArray(prev.socialSample)) socialSample = prev.socialSample;
    } catch {
      /* 旧文件损坏则按空处理 */
    }
  }

  const meta = {
    source:
      "GDELT DOC 2.0 timelinevol (Volume Intensity: share of all monitored news volume, %)",
    generatedAt: new Date().toISOString(),
    timespan: TIMESPAN,
    coverageStart: start,
    coverageEnd: end,
    queries: Object.fromEntries(GROUPS.map((g) => [g.id, g.query])),
  };

  // 紧凑序列化：标量走 JSON.stringify，长数组单行，避免仓库文件膨胀
  const arr = (xs) => `[${xs.join(",")}]`;
  const groupJson = groups
    .map((g) => `    {"id": ${JSON.stringify(g.id)}, "values": ${arr(g.values)}}`)
    .join(",\n");
  const text =
    `{\n  "meta": ${JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ")},\n` +
    `  "days": ${arr(days.map((d) => JSON.stringify(d)))},\n` +
    `  "groups": [\n${groupJson}\n  ],\n` +
    `  "socialSample": ${JSON.stringify(socialSample)}\n}\n`;
  writeFileSync(OUT, text);
  console.log(`wrote ${OUT} (${(text.length / 1024).toFixed(1)} KB, ${days.length} days)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
