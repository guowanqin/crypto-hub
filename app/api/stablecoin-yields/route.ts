import { NextResponse } from "next/server";
import {
  CURATED_POOLS,
  type YieldPool,
  type YieldsPayload,
} from "@/lib/stablecoin-yields";

export const dynamic = "force-dynamic";

// 缓存（与本站 /api/arc 同一套模式：命中直出、失败回退 stale）：
// - 看板缓存 10 分钟（DefiLlama 收益为日级数据，10 分钟足够新，页面口径卡如实标注）；
// - 失败绝不写入成功缓存：只记 60 秒失败短路，源恢复后至多 60 秒自动重试；
//   有 stale 成功数据时照常回退 stale；失败时 errors.pools 带来源诊断。
// 上游全量榜一次返回约 10.7MB、15,716 个池子，服务端取回后只保留本站精选
// 20 个池子的裁剪字段下发，浏览器不直接拉全量。
const BOARD_TTL_MS = 10 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 25_000;

let boardCache: { at: number; data: YieldsPayload } | null = null;
let boardFail: { at: number; error: string } | null = null;

const CURATED = new Map(CURATED_POOLS.map((p) => [p.id, p]));

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

async function fetchBoard(): Promise<YieldsPayload> {
  const res = await fetch("https://yields.llama.fi/pools", {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DefiLlama yields HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: Array<Record<string, unknown>>;
  };
  const all = Array.isArray(json.data) ? json.data : [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const p of all) {
    if (typeof p.pool === "string") byId.set(p.pool, p);
  }
  const pools: YieldPool[] = [];
  const missing: string[] = [];
  for (const meta of CURATED_POOLS) {
    const raw = byId.get(meta.id);
    if (!raw) {
      missing.push(meta.label);
      continue;
    }
    pools.push({
      id: meta.id,
      symbol: meta.symbol,
      project: meta.project,
      label: meta.label,
      chain: meta.chain,
      kind: meta.kind,
      volatile: meta.volatile,
      apy: num(raw.apy) ?? 0,
      apyBase: num(raw.apyBase),
      apyReward: num(raw.apyReward),
      apyMean30d: num(raw.apyMean30d),
      apyPct1D: num(raw.apyPct1D),
      apyPct7D: num(raw.apyPct7D),
      apyPct30D: num(raw.apyPct30D),
      tvlUsd: num(raw.tvlUsd) ?? 0,
      ilRisk: typeof raw.ilRisk === "string" ? raw.ilRisk : "",
      poolMeta: typeof raw.poolMeta === "string" ? raw.poolMeta : null,
    });
  }
  pools.sort((a, b) => b.apy - a.apy);
  return { fetchedAt: new Date().toISOString(), pools, missing, errors: {} };
}

async function getBoard(): Promise<{
  data: YieldsPayload | null;
  error?: string;
}> {
  const now = Date.now();
  if (boardCache && now - boardCache.at < BOARD_TTL_MS)
    return { data: boardCache.data };
  if (boardFail && now - boardFail.at < FAIL_TTL_MS) {
    if (boardCache) return { data: boardCache.data };
    return { data: null, error: boardFail.error };
  }
  try {
    const data = await fetchBoard();
    boardCache = { at: Date.now(), data };
    boardFail = null;
    return { data };
  } catch (err) {
    boardFail = { at: Date.now(), error: String(err) };
    if (boardCache) return { data: boardCache.data };
    return { data: null, error: boardFail.error };
  }
}

export async function GET() {
  const { data: board, error } = await getBoard();
  const payload: YieldsPayload = board ?? {
    fetchedAt: new Date().toISOString(),
    pools: null,
    missing: [],
    errors: error ? { pools: error } : {},
  };
  return NextResponse.json(payload);
}
