// 钱包只读监控的服务端取数（被 /api/wallet-watch 调用）。
// 数据源全部免 key、走公开接口：
// - BTC：mempool.space 公共 API（地址统计 + 交易列表），与站内 btc-cycle 同源。
// - ETH：Blockscout 官方公共实例 eth.blockscout.com 的 API v2（地址余额 + 计数器 + 交易列表）。
// - SOL：Solana 公共 JSON-RPC（PublicNode 主源、api.mainnet-beta.solana.com 备源）：
//   getBalance + getSignaturesForAddress，再逐笔 getTransaction 用 pre/postBalances
//   算该地址的余额净变化；对方地址按「余额反向变动最大者」推断，复杂交易可能不准，
//   这一口径如实写在页面上。
// 口径红线：只统计原生币（BTC/ETH/SOL）转账；ETH 不含代币转账与内部交易；
// 金额一律是「该地址在该笔交易中的净变动」；取不到的字段留 null，绝不编造。
// 本站不保存查询过的地址：结果只经 API 路由的短时内存缓存（60 秒）回给请求者。

export type WatchChain = "btc" | "eth" | "sol";
export type WatchDirection = "in" | "out" | "self" | "unknown";

export interface WatchTx {
  hash: string;
  /** unix 秒；未确认交易为 null */
  time: number | null;
  confirmed: boolean;
  failed: boolean;
  direction: WatchDirection;
  /** 该地址在该笔中的净变动绝对值（原生币单位）；取不到为 null */
  amount: number | null;
  counterparty: string | null;
  explorerUrl: string;
}

export interface WalletWatchPayload {
  ok: boolean;
  error: string | null;
  errorCode: "bad-format" | "xpub" | "upstream" | null;
  chain: WatchChain | null;
  /** 链名保持英文标准名（AGENTS.md §8：数据原文不转换） */
  chainName: string | null;
  symbol: string | null;
  address: string;
  balance: number | null;
  /** 链上交易总笔数；源给不出（SOL）时为 null */
  txCount: number | null;
  listedCount: number;
  /** 以下汇总只基于本次列出的、金额可取到的交易 */
  inSum: number;
  outSum: number;
  netSum: number;
  amountKnownCount: number;
  txs: WatchTx[];
  /** 实际供数源（页面如实标注） */
  source: string | null;
  fetchedAt: string;
}

export const CHAIN_META: Record<
  WatchChain,
  { name: string; symbol: string; txBase: string; addrBase: string }
> = {
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    txBase: "https://mempool.space/tx/",
    addrBase: "https://mempool.space/address/",
  },
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    txBase: "https://eth.blockscout.com/tx/",
    addrBase: "https://eth.blockscout.com/address/",
  },
  sol: {
    name: "Solana",
    symbol: "SOL",
    txBase: "https://solscan.io/tx/",
    addrBase: "https://solscan.io/account/",
  },
};

export const LIST_LIMIT: Record<WatchChain, number> = { btc: 25, eth: 25, sol: 20 };

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

/** 地址格式识别：返回链、"xpub"（明确不支持并单独报错）或 null（无法识别）。 */
export function detectChain(input: string): WatchChain | "xpub" | null {
  const a = input.trim();
  if (/^(xpub|ypub|zpub|tpub|upub|vpub)/.test(a)) return "xpub";
  if (/^0x[a-fA-F0-9]{40}$/.test(a)) return "eth";
  if (/^bc1[0-9a-z]{39,59}$/i.test(a)) return "btc";
  if (/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(a)) return "btc";
  if (BASE58_RE.test(a) && a.length >= 32 && a.length <= 44) return "sol";
  return null;
}

/** 手动选链时校验地址格式是否与该链相符（宽松校验，最终以链上接口为准）。 */
export function formatFitsChain(chain: WatchChain, input: string): boolean {
  const a = input.trim();
  if (chain === "eth") return /^0x[a-fA-F0-9]{40}$/.test(a);
  if (chain === "btc")
    return (
      /^bc1[0-9a-z]{39,59}$/i.test(a) || /^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(a)
    );
  return BASE58_RE.test(a) && a.length >= 32 && a.length <= 44;
}

async function fetchJsonOnce(url: string, ms = 12000): Promise<unknown> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (compatible; 18btc-wallet-watch/1.0; +https://18btc.cc/tool/wallet-watch)",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

/** 公共接口偶发 5xx（如 Blockscout 瞬时 500）：5xx 与网络错误重试一次，4xx 不重试。 */
async function fetchJson(url: string, ms = 12000): Promise<unknown> {
  try {
    return await fetchJsonOnce(url, ms);
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status !== undefined && status < 500) throw e;
    await new Promise((r) => setTimeout(r, 800));
    return fetchJsonOnce(url, ms);
  }
}

function basePayload(): WalletWatchPayload {
  return {
    ok: false,
    error: null,
    errorCode: null,
    chain: null,
    chainName: null,
    symbol: null,
    address: "",
    balance: null,
    txCount: null,
    listedCount: 0,
    inSum: 0,
    outSum: 0,
    netSum: 0,
    amountKnownCount: 0,
    txs: [],
    source: null,
    fetchedAt: new Date().toISOString(),
  };
}

function summarize(p: WalletWatchPayload): WalletWatchPayload {
  let inSum = 0;
  let outSum = 0;
  let known = 0;
  for (const tx of p.txs) {
    if (tx.amount === null) continue;
    if (tx.direction === "in") {
      inSum += tx.amount;
      known++;
    } else if (tx.direction === "out") {
      outSum += tx.amount;
      known++;
    } else if (tx.direction === "self") {
      known++;
    }
  }
  p.inSum = inSum;
  p.outSum = outSum;
  p.netSum = inSum - outSum;
  p.amountKnownCount = known;
  p.listedCount = p.txs.length;
  p.ok = true;
  p.fetchedAt = new Date().toISOString();
  return p;
}

// ---------------- BTC（mempool.space） ----------------

interface MempoolAddrInfo {
  chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
  mempool_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
}

interface MempoolTx {
  txid: string;
  vin: { prevout?: { scriptpubkey_address?: string; value: number } | null }[];
  vout: { scriptpubkey_address?: string; value: number }[];
  status: { confirmed: boolean; block_time?: number };
}

async function fetchBtc(address: string): Promise<WalletWatchPayload> {
  const p = basePayload();
  p.chain = "btc";
  p.chainName = CHAIN_META.btc.name;
  p.symbol = "BTC";
  p.address = address;
  p.source = "mempool.space";

  let info: MempoolAddrInfo;
  try {
    info = (await fetchJson(
      `https://mempool.space/api/address/${encodeURIComponent(address)}`
    )) as MempoolAddrInfo;
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 400 || status === 404) {
      p.error = "该地址在 Bitcoin 链上不存在或格式不正确。";
      p.errorCode = "bad-format";
      return p;
    }
    throw e;
  }

  const sat =
    info.chain_stats.funded_txo_sum -
    info.chain_stats.spent_txo_sum +
    (info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum);
  p.balance = sat / 1e8;
  p.txCount = info.chain_stats.tx_count + info.mempool_stats.tx_count;

  const [confirmedRes, mempoolRes] = await Promise.allSettled([
    fetchJson(`https://mempool.space/api/address/${encodeURIComponent(address)}/txs`),
    fetchJson(
      `https://mempool.space/api/address/${encodeURIComponent(address)}/txs/mempool`
    ),
  ]);
  const confirmed =
    confirmedRes.status === "fulfilled" ? (confirmedRes.value as MempoolTx[]) : [];
  const pending =
    mempoolRes.status === "fulfilled" ? (mempoolRes.value as MempoolTx[]) : [];

  const seen = new Set<string>();
  const all = [...pending, ...confirmed].filter((t) => {
    if (seen.has(t.txid)) return false;
    seen.add(t.txid);
    return true;
  });

  p.txs = all.slice(0, LIST_LIMIT.btc).map((t) => {
    let received = 0;
    let sent = 0;
    for (const o of t.vout) {
      if (o.scriptpubkey_address === address) received += o.value;
    }
    for (const i of t.vin) {
      if (i.prevout?.scriptpubkey_address === address) sent += i.prevout.value;
    }
    const net = received - sent;
    let direction: WatchDirection = "unknown";
    let counterparty: string | null = null;
    if (net > 0) {
      direction = "in";
      const from = t.vin.find(
        (i) => i.prevout?.scriptpubkey_address && i.prevout.scriptpubkey_address !== address
      );
      counterparty = from?.prevout?.scriptpubkey_address ?? null;
    } else if (net < 0) {
      direction = "out";
      let best: { addr: string; value: number } | null = null;
      for (const o of t.vout) {
        if (o.scriptpubkey_address && o.scriptpubkey_address !== address) {
          if (!best || o.value > best.value)
            best = { addr: o.scriptpubkey_address, value: o.value };
        }
      }
      counterparty = best?.addr ?? null;
    } else {
      direction = sent > 0 || received > 0 ? "self" : "unknown";
    }
    return {
      hash: t.txid,
      time: t.status.confirmed ? (t.status.block_time ?? null) : null,
      confirmed: t.status.confirmed,
      failed: false,
      direction,
      amount: Math.abs(net) / 1e8,
      counterparty,
      explorerUrl: CHAIN_META.btc.txBase + t.txid,
    };
  });

  return summarize(p);
}

// ---------------- ETH（Blockscout 公共实例） ----------------

interface BlockscoutTx {
  hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  created_contract?: { hash: string } | null;
  value: string;
  status?: string;
  result?: string;
}

function weiToEth(wei: string): number {
  try {
    return Number(BigInt(wei)) / 1e18;
  } catch {
    const n = Number(wei);
    return Number.isFinite(n) ? n / 1e18 : 0;
  }
}

async function fetchEth(address: string): Promise<WalletWatchPayload> {
  const p = basePayload();
  p.chain = "eth";
  p.chainName = CHAIN_META.eth.name;
  p.symbol = "ETH";
  p.address = address;
  p.source = "eth.blockscout.com";

  const lower = address.toLowerCase();
  let addrJson: { coin_balance?: string };
  try {
    addrJson = (await fetchJson(
      `https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}`
    )) as { coin_balance?: string };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 400 || status === 404) {
      p.error = "该地址在 Ethereum 链上不存在或格式不正确。";
      p.errorCode = "bad-format";
      return p;
    }
    throw e;
  }
  p.balance = addrJson.coin_balance ? weiToEth(addrJson.coin_balance) : null;

  const [countersRes, txsRes] = await Promise.allSettled([
    fetchJson(
      `https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}/counters`
    ),
    fetchJson(
      `https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}/transactions`
    ),
  ]);

  if (countersRes.status === "fulfilled") {
    const c = countersRes.value as { transactions_count?: string };
    const n = c.transactions_count ? parseInt(c.transactions_count, 10) : NaN;
    p.txCount = Number.isFinite(n) ? n : null;
  }

  const items =
    txsRes.status === "fulfilled"
      ? ((txsRes.value as { items?: BlockscoutTx[] }).items ?? [])
      : [];

  p.txs = items.slice(0, LIST_LIMIT.eth).map((t) => {
    const fromMe = t.from.hash.toLowerCase() === lower;
    const toMe = t.to ? t.to.hash.toLowerCase() === lower : false;
    let direction: WatchDirection = "unknown";
    let counterparty: string | null = null;
    if (fromMe && toMe) {
      direction = "self";
      counterparty = address;
    } else if (fromMe) {
      direction = "out";
      counterparty = t.to?.hash ?? t.created_contract?.hash ?? null;
    } else if (toMe) {
      direction = "in";
      counterparty = t.from.hash;
    }
    const ts = Date.parse(t.timestamp);
    return {
      hash: t.hash,
      time: Number.isFinite(ts) ? Math.floor(ts / 1000) : null,
      confirmed: true,
      failed: t.status === "error" || t.result === "error",
      direction,
      amount: weiToEth(t.value ?? "0"),
      counterparty,
      explorerUrl: CHAIN_META.eth.txBase + t.hash,
    };
  });

  return summarize(p);
}

// ---------------- SOL（公共 JSON-RPC） ----------------

const SOL_RPCS: { url: string; label: string }[] = [
  { url: "https://solana-rpc.publicnode.com", label: "Solana 公共 RPC（PublicNode）" },
  { url: "https://api.mainnet-beta.solana.com", label: "Solana 公共 RPC（api.mainnet-beta）" },
];

async function solRpc<T>(
  method: string,
  params: unknown[],
  prefer = 0
): Promise<{ result: T; source: string }> {
  const order = [...SOL_RPCS.slice(prefer), ...SOL_RPCS.slice(0, prefer)];
  let lastErr: unknown = null;
  for (const ep of order) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        signal: ctl.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as { result?: T; error?: { message?: string } };
      if (j.error) throw new Error(j.error.message ?? "RPC error");
      if (j.result === undefined) throw new Error("empty RPC result");
      return { result: j.result, source: ep.label };
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error("all Solana RPC endpoints failed");
}

interface SolSig {
  signature: string;
  blockTime?: number | null;
  err: unknown;
}

interface SolTxDetail {
  meta: {
    preBalances: number[];
    postBalances: number[];
  } | null;
  transaction: {
    message: {
      accountKeys: ({ pubkey: string } | string)[];
    };
  };
}

async function fetchSol(address: string): Promise<WalletWatchPayload> {
  const p = basePayload();
  p.chain = "sol";
  p.chainName = CHAIN_META.sol.name;
  p.symbol = "SOL";
  p.address = address;

  let bal: { result: { value: number }; source: string };
  try {
    bal = await solRpc<{ value: number }>("getBalance", [address]);
  } catch (e) {
    if (/invalid param/i.test(String(e))) {
      p.error = "该地址在 Solana 链上格式不正确。";
      p.errorCode = "bad-format";
      return p;
    }
    throw e;
  }
  p.source = bal.source;
  p.balance = bal.result.value / 1e9;
  const prefer = SOL_RPCS.findIndex((r) => r.label === bal.source);

  const sigsRes = await solRpc<SolSig[]>("getSignaturesForAddress", [
    address,
    { limit: LIST_LIMIT.sol },
  ]).catch(() => null);
  const sigs = sigsRes?.result ?? [];

  const txs: WatchTx[] = [];
  const queue = [...sigs];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const sig = queue.shift()!;
      const base: WatchTx = {
        hash: sig.signature,
        time: sig.blockTime ?? null,
        confirmed: true,
        failed: sig.err !== null && sig.err !== undefined,
        direction: "unknown",
        amount: null,
        counterparty: null,
        explorerUrl: CHAIN_META.sol.txBase + sig.signature,
      };
      if (!base.failed) {
        try {
          const det = await solRpc<SolTxDetail | null>(
            "getTransaction",
            [
              sig.signature,
              { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" },
            ],
            prefer
          );
          const d = det.result;
          if (d?.meta) {
            const keys = d.transaction.message.accountKeys.map((k) =>
              typeof k === "string" ? k : k.pubkey
            );
            const idx = keys.indexOf(address);
            if (idx >= 0) {
              const delta =
                (d.meta.postBalances[idx] - d.meta.preBalances[idx]) / 1e9;
              base.amount = Math.abs(delta);
              base.direction = delta > 0 ? "in" : delta < 0 ? "out" : "self";
              // 对方：余额反向变动（符号相反）且绝对值最大的其他账户（推断口径）
              let bestIdx = -1;
              let bestAbs = 0;
              for (let i = 0; i < keys.length; i++) {
                if (i === idx) continue;
                const dd = (d.meta.postBalances[i] - d.meta.preBalances[i]) / 1e9;
                if (delta !== 0 && Math.sign(dd) === -Math.sign(delta) && Math.abs(dd) > bestAbs) {
                  bestAbs = Math.abs(dd);
                  bestIdx = i;
                }
              }
              base.counterparty = bestIdx >= 0 ? keys[bestIdx] : null;
            }
          }
        } catch {
          // 单笔取不到详情：金额留 null，列表照常展示签名与时间
        }
      }
      txs.push(base);
    }
  });
  await Promise.all(workers);
  // 并发抓取会打乱顺序，按时间倒序还原（无时间者垫底）
  txs.sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
  p.txs = txs;

  return summarize(p);
}

// ---------------- 入口 ----------------

export async function fetchWalletWatch(
  chain: WatchChain,
  address: string
): Promise<WalletWatchPayload> {
  if (chain === "btc") return fetchBtc(address);
  if (chain === "eth") return fetchEth(address);
  return fetchSol(address);
}
