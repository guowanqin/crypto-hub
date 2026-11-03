import { NextResponse } from "next/server";
import {
  detectChain,
  fetchWalletWatch,
  formatFitsChain,
  type WalletWatchPayload,
  type WatchChain,
} from "@/lib/walletwatch";

export const dynamic = "force-dynamic";

// 缓存（沿用本站 /api 规范）：同一地址的成功结果短缓存 60 秒（链上数据变得快，
// 但同一地址被反复查询时没必要每次重打上游）；失败结果只短路 30 秒，源恢复即重试。
// 地址只进内存缓存键，不落盘、不外传：本站不保存用户查询过的地址。
const OK_TTL_MS = 60 * 1000;
const FAIL_TTL_MS = 30 * 1000;

const cache = new Map<string, { at: number; payload: WalletWatchPayload }>();
const failCache = new Map<string, { at: number; payload: WalletWatchPayload }>();

function errPayload(
  address: string,
  error: string,
  errorCode: WalletWatchPayload["errorCode"]
): WalletWatchPayload {
  return {
    ok: false,
    error,
    errorCode,
    chain: null,
    chainName: null,
    symbol: null,
    address,
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("address") ?? "").trim();
  const chainParam = (url.searchParams.get("chain") ?? "auto").trim().toLowerCase();

  if (!raw) {
    return NextResponse.json(errPayload("", "请输入要查询的公开地址。", "bad-format"));
  }
  if (raw.length > 200) {
    return NextResponse.json(errPayload(raw, "输入过长，请输入单个公开地址。", "bad-format"));
  }

  let chain: WatchChain | null = null;
  if (chainParam === "btc" || chainParam === "eth" || chainParam === "sol") {
    chain = chainParam;
    if (!formatFitsChain(chain, raw)) {
      return NextResponse.json(
        errPayload(raw, "该地址格式与所选链不符，请核对地址或改用自动识别。", "bad-format")
      );
    }
  } else {
    const detected = detectChain(raw);
    if (detected === "xpub") {
      return NextResponse.json(
        errPayload(
          raw,
          "本页暂不支持 xpub / 扩展公钥批量监控，请输入单个公开地址（BTC / ETH / SOL）。",
          "xpub"
        )
      );
    }
    if (!detected) {
      return NextResponse.json(
        errPayload(
          raw,
          "无法识别这个地址：支持 Bitcoin、Ethereum、Solana 的公开地址，请核对是否粘贴完整。",
          "bad-format"
        )
      );
    }
    chain = detected;
  }

  const key = `${chain}:${raw.toLowerCase()}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < OK_TTL_MS) return NextResponse.json(hit.payload);
  const fail = failCache.get(key);
  if (fail && now - fail.at < FAIL_TTL_MS) {
    if (hit) return NextResponse.json(hit.payload);
    return NextResponse.json(fail.payload);
  }

  try {
    const payload = await fetchWalletWatch(chain, raw);
    if (payload.ok) {
      cache.set(key, { at: Date.now(), payload });
      failCache.delete(key);
    } else {
      failCache.set(key, { at: Date.now(), payload });
      if (hit) return NextResponse.json(hit.payload);
    }
    return NextResponse.json(payload);
  } catch (err) {
    const p = errPayload(raw, `链上数据暂时拉取失败：${String(err).slice(0, 140)}`, "upstream");
    if (hit) return NextResponse.json(hit.payload);
    failCache.set(key, { at: Date.now(), payload: p });
    return NextResponse.json(p);
  }
}
