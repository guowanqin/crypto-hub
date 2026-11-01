/**
 * UNI 销毁数据（以太坊主网链上口径）
 *
 * 口径说明（2026-11-01 实测核定）：
 * - UNI 合约没有会减少 totalSupply 的 burn 函数：合约 totalSupply 恒为 1,000,000,000。
 *   官方销毁（UNIfication 协议费销毁 + 2025-12-28 一次性金库销毁）都是把 UNI 转入
 *   销毁地址 0x000000000000000000000000000000000000dEaD。
 * - 因此：累计销毁 = balanceOf(dEaD)；有效供应 = totalSupply − 累计销毁。
 *   （与 DeFiBurn 的累计口径一致：其实测 113.64M 与 balanceOf(dEaD) 完全吻合。）
 * - 近 24h / 7d / 30d 销毁量 = 主网 UNI 合约 Transfer(→ dEaD) 事件按入账时间求和，
 *   与 DeFiBurn 按「销毁发生日」的多链记账口径有 1–7 天入账时滞差异，页面已标注。
 *
 * 取数方式：公共 RPC（多端点容错）。eth_call 多家可用；eth_getLogs 大范围扫描
 * 目前以 rpc.mevblocker.io 为主（免费端点中实测可查 21.6 万区块范围），
 * 失败时按 9000 区块分段扫其余端点兜底。服务端路由层做 30 分钟缓存。
 */

export const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
export const GENESIS_SUPPLY = 1_000_000_000;

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const DEAD_TOPIC = "0x" + DEAD_ADDRESS.slice(2).padStart(64, "0");

/** eth_call / 区块读取端点（实测可用顺序） */
const CALL_RPCS = [
  "https://rpc.mevblocker.io",
  "https://eth.drpc.org",
  "https://eth-mainnet.public.blastapi.io",
  "https://ethereum-rpc.publicnode.com",
  "https://gateway.tenderly.co/public/mainnet",
];
/** eth_getLogs 端点（大范围优先）：mevblocker 可整段直查 21.6 万区块；
 *  Tenderly 网关单次上限 1 万区块，供 9000 块分段兜底（均 2026-11-01 实测）。 */
const LOG_RPCS = [
  "https://rpc.mevblocker.io",
  "https://gateway.tenderly.co/public/mainnet",
  "https://ethereum-rpc.publicnode.com",
  "https://eth.drpc.org",
];

export interface BurnEvent {
  txHash: string;
  from: string;
  blockNumber: number;
  /** ISO 时间（UTC） */
  timestamp: string;
  amountUni: number;
}

export interface UniBurnData {
  fetchedAt: string;
  latestBlock: number;
  /** 合约 totalSupply（恒为 10 亿） */
  totalSupply: number;
  /** 累计销毁 = 销毁地址余额 */
  totalBurned: number;
  /** 累计销毁占初始供应比例（%） */
  burnedPctOfGenesis: number;
  /** 有效供应 = totalSupply − 累计销毁 */
  effectiveSupply: number;
  burn24h: number | null;
  burn7d: number | null;
  burn30d: number | null;
  /** 30 天年化销毁量 = burn30d × 365/30 */
  annualizedBurn: number | null;
  /** 年化销毁量占有效供应比例（%） */
  annualizedRatePct: number | null;
  recentBurns: BurnEvent[];
  source: string;
}

/* ---------------- RPC 基础 ---------------- */

let rpcId = 0;

async function rpcCall(
  url: string,
  method: string,
  params: unknown[],
  timeoutMs = 25000,
): Promise<unknown> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
      signal: ctl.signal,
      cache: "no-store",
    });
    const j = (await r.json()) as {
      result?: unknown;
      error?: { message?: string };
    };
    if (j.error) throw new Error(j.error.message ?? "RPC error");
    return j.result;
  } finally {
    clearTimeout(t);
  }
}

/** 在多个端点间容错执行同一只读调用 */
async function rpcAny(
  urls: string[],
  method: string,
  params: unknown[],
): Promise<unknown> {
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      return await rpcCall(url, method, params);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("all RPC endpoints failed");
}

function hexToBigInt(v: unknown): bigint {
  return BigInt(String(v));
}

const WEI_PER_UNI = BigInt("1000000000000000000");
const WEI_FRAC_STEP = BigInt("1000000000000");

/** wei(BigInt) → UNI 数（整数/小数拆分换算，避免大数 float 精度损失，精确到 1e-6） */
function weiToUni(wei: bigint): number {
  const whole = wei / WEI_PER_UNI;
  const frac = (wei % WEI_PER_UNI) / WEI_FRAC_STEP;
  return Number(whole) + Number(frac) / 1e6;
}

async function ethCall(data: string): Promise<bigint> {
  const res = await rpcAny(CALL_RPCS, "eth_call", [
    { to: UNI_ADDRESS, data },
    "latest",
  ]);
  return hexToBigInt(res);
}

const blockTsCache = new Map<number, number>();

async function blockTimestamp(block: number): Promise<number> {
  const hit = blockTsCache.get(block);
  if (hit !== undefined) return hit;
  const b = (await rpcAny(CALL_RPCS, "eth_getBlockByNumber", [
    "0x" + block.toString(16),
    false,
  ])) as { timestamp: string };
  const ts = parseInt(b.timestamp, 16);
  blockTsCache.set(block, ts);
  return ts;
}

/** 找到时间戳 >= target 的最早区块（二分逼近：先按 12 秒/块估算，再校正两轮） */
async function blockAtOrAfter(
  targetTs: number,
  latest: number,
  latestTs: number,
): Promise<number> {
  let guess = latest - Math.max(0, Math.round((latestTs - targetTs) / 12));
  if (guess < 0) guess = 0;
  for (let i = 0; i < 3; i++) {
    const ts = await blockTimestamp(guess);
    const diff = targetTs - ts;
    if (Math.abs(diff) <= 12) break;
    guess += Math.round(diff / 12);
    if (guess < 0) guess = 0;
    if (guess > latest) {
      guess = latest;
      break;
    }
  }
  return guess;
}

/* ---------------- 日志扫描 ---------------- */

interface RawLog {
  blockNumber: string;
  transactionHash: string;
  topics: string[];
  data: string;
}

async function getLogsRange(
  url: string,
  from: number,
  to: number,
): Promise<RawLog[]> {
  const res = await rpcCall(url, "eth_getLogs", [
    {
      address: UNI_ADDRESS,
      fromBlock: "0x" + from.toString(16),
      toBlock: "0x" + to.toString(16),
      topics: [TRANSFER_TOPIC, null, DEAD_TOPIC],
    },
  ]);
  return res as RawLog[];
}

/** 扫描 [from, to] 的全部销毁入账日志：先整段直查，失败再分段（9000 块/段）兜底 */
async function scanBurnLogs(from: number, to: number): Promise<RawLog[]> {
  for (const url of LOG_RPCS) {
    try {
      return await getLogsRange(url, from, to);
    } catch {
      /* 换下一个端点 */
    }
  }
  const CHUNK = 9000;
  for (const url of LOG_RPCS) {
    try {
      const out: RawLog[] = [];
      for (let s = from; s <= to; s += CHUNK) {
        const e = Math.min(s + CHUNK - 1, to);
        out.push(...(await getLogsRange(url, s, e)));
      }
      return out;
    } catch {
      /* 换下一个端点 */
    }
  }
  throw new Error("eth_getLogs unavailable on all endpoints");
}

/* ---------------- 组装 ---------------- */

const DAY = 86400;
/** 扫描窗口：30 天 + 1 天冗余（边界按时间戳精确切分） */
const SCAN_BLOCKS = 225_000;

export async function fetchUniBurn(): Promise<UniBurnData> {
  const latest = Number(
    hexToBigInt(await rpcAny(CALL_RPCS, "eth_blockNumber", [])),
  );
  const [totalSupplyWei, deadWei, latestTs] = await Promise.all([
    ethCall("0x18160ddd"), // totalSupply()
    ethCall("0x70a08231" + DEAD_ADDRESS.slice(2).padStart(64, "0")), // balanceOf(dEaD)
    blockTimestamp(latest),
  ]);

  const totalSupply = weiToUni(totalSupplyWei);
  const totalBurned = weiToUni(deadWei);
  const effectiveSupply = totalSupply - totalBurned;

  let burn24h: number | null = null;
  let burn7d: number | null = null;
  let burn30d: number | null = null;
  let annualizedBurn: number | null = null;
  let annualizedRatePct: number | null = null;
  let recentBurns: BurnEvent[] = [];
  let source = "ethereum-mainnet-rpc";

  try {
    const fromBlock = Math.max(0, latest - SCAN_BLOCKS);
    const logs = await scanBurnLogs(fromBlock, latest);

    const [cut24, cut7d, cut30] = await Promise.all([
      blockAtOrAfter(latestTs - DAY, latest, latestTs),
      blockAtOrAfter(latestTs - 7 * DAY, latest, latestTs),
      blockAtOrAfter(latestTs - 30 * DAY, latest, latestTs),
    ]);

    const sumFrom = (cut: number): number => {
      let acc = BigInt(0);
      for (const l of logs) {
        if (parseInt(l.blockNumber, 16) >= cut) acc += BigInt(l.data);
      }
      return weiToUni(acc);
    };
    burn24h = sumFrom(cut24);
    burn7d = sumFrom(cut7d);
    burn30d = sumFrom(cut30);
    annualizedBurn = (burn30d * 365) / 30;
    annualizedRatePct =
      effectiveSupply > 0 ? (annualizedBurn / effectiveSupply) * 100 : null;

    const recent = [...logs]
      .sort((a, b) => parseInt(b.blockNumber, 16) - parseInt(a.blockNumber, 16))
      .slice(0, 12);
    recentBurns = await Promise.all(
      recent.map(async (l) => {
        const bn = parseInt(l.blockNumber, 16);
        const ts = await blockTimestamp(bn);
        return {
          txHash: l.transactionHash,
          from: "0x" + l.topics[1].slice(26),
          blockNumber: bn,
          timestamp: new Date(ts * 1000).toISOString(),
          amountUni: weiToUni(BigInt(l.data)),
        };
      }),
    );
  } catch {
    source = "ethereum-mainnet-rpc (totals only; log scan unavailable)";
  }

  return {
    fetchedAt: new Date().toISOString(),
    latestBlock: latest,
    totalSupply,
    totalBurned,
    burnedPctOfGenesis: (totalBurned / GENESIS_SUPPLY) * 100,
    effectiveSupply,
    burn24h,
    burn7d,
    burn30d,
    annualizedBurn,
    annualizedRatePct,
    recentBurns,
    source,
  };
}
