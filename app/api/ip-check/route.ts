import { NextResponse } from "next/server";
import { isIP } from "node:net";
import {
  fetchIntel,
  fetchWhois,
  isPrivateIp,
  judgeIntel,
  normalizeIp,
  resolveDomain,
  type IpCheckPayload,
} from "@/lib/ipcheck";

export const dynamic = "force-dynamic";

// 缓存（沿用本站 /api 规范：命中直出、失败回退 stale、失败绝不长缓存）：
// - 单个 IP/域名的完整查询结果短缓存 10 分钟（情报与 RDAP 都变得慢，没必要每次重打四家源）；
// - 情报全灭的失败结果只记 60 秒短路，源恢复后至多 60 秒自动重试；
// - 自查（target 留空）按实际出口 IP 走同一套缓存键，出口变了键就变了，不会串。
const OK_TTL_MS = 10 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

const cache = new Map<string, { at: number; payload: IpCheckPayload }>();
const failCache = new Map<string, { at: number; payload: IpCheckPayload }>();

const DOMAIN_RE =
  /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function basePayload(): IpCheckPayload {
  return {
    ok: false,
    error: null,
    query: { input: "", kind: "self", ip: null, domain: null, selfPrivate: false },
    intel: null,
    verdict: null,
    whois: null,
    errors: {},
    fetchedAt: new Date().toISOString(),
  };
}

function selfIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return normalizeIp(xri.trim());
  return null;
}

async function build(
  kind: "self" | "ip" | "domain",
  input: string,
  domain: string | null,
  ip: string
): Promise<IpCheckPayload> {
  const payload = basePayload();
  payload.query = { input, kind, ip, domain, selfPrivate: false };

  // 情报与两个 Whois（域名查时：IP 情报 + IP/域名两份 RDAP）并行，互不拖累。
  const [intelRes, ipWhoisRes, domWhoisRes] = await Promise.allSettled([
    fetchIntel(ip),
    fetchWhois("ip", ip),
    domain ? fetchWhois("domain", domain) : Promise.resolve(null),
  ]);

  let whoisIp = null as Awaited<ReturnType<typeof fetchWhois>> | null;
  if (ipWhoisRes.status === "fulfilled") whoisIp = ipWhoisRes.value;
  else payload.errors.whois = String(ipWhoisRes.reason).slice(0, 200);

  if (intelRes.status === "fulfilled") {
    payload.intel = intelRes.value.intel;
    if (!intelRes.value.flagsOk && intelRes.value.flagsError) {
      payload.errors.ipapi = intelRes.value.flagsError.slice(0, 200);
    }
    payload.verdict = judgeIntel(intelRes.value.intel, whoisIp);
  } else {
    payload.errors.intel = String(intelRes.reason).slice(0, 200);
  }

  // 展示哪份 Whois：域名查询优先展示域名 RDAP（注册商/到期日更有用），
  // 同时 IP 网段 RDAP 已用于原生判断；域名 RDAP 失败则回退 IP 的。
  if (domain && domWhoisRes.status === "fulfilled" && domWhoisRes.value) {
    payload.whois = domWhoisRes.value;
  } else if (whoisIp) {
    payload.whois = whoisIp;
  } else if (domain && domWhoisRes.status === "rejected" && !payload.errors.whois) {
    payload.errors.whois = String(domWhoisRes.reason).slice(0, 200);
  }

  payload.ok = Boolean(payload.intel || payload.whois);
  payload.fetchedAt = new Date().toISOString();
  return payload;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 延迟测试的本站端点：只回一个极小 JSON，计时即为 HTTP 往返。
  if (url.searchParams.get("ping") === "1") {
    return NextResponse.json({ ok: true, ts: Date.now() });
  }

  const raw = (url.searchParams.get("target") ?? "").trim();

  let kind: "self" | "ip" | "domain";
  let domain: string | null = null;
  let ip: string | null = null;
  let cacheKey: string;

  if (!raw) {
    kind = "self";
    ip = selfIp(req);
    if (!ip) {
      const p = basePayload();
      p.error = "无法从请求头读到你的出口 IP。";
      return NextResponse.json(p, { status: 200 });
    }
    if (isPrivateIp(ip)) {
      // 本地/内网环境：结构照常返回，标注本机地址，不拿内网地址去外查。
      const p = basePayload();
      p.ok = true;
      p.query = { input: "", kind: "self", ip, domain: null, selfPrivate: true };
      return NextResponse.json(p, { status: 200 });
    }
    cacheKey = `self:${ip}`;
  } else if (isIP(raw)) {
    kind = "ip";
    ip = normalizeIp(raw);
    cacheKey = `ip:${ip}`;
  } else if (DOMAIN_RE.test(raw)) {
    kind = "domain";
    domain = raw.toLowerCase();
    cacheKey = `domain:${domain}`;
  } else {
    const p = basePayload();
    p.query.input = raw;
    p.error = "无法识别输入：请输入合法的 IP 地址（如 8.8.8.8）或域名（如 github.com）。";
    return NextResponse.json(p, { status: 200 });
  }

  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < OK_TTL_MS) return NextResponse.json(hit.payload);
  const fail = failCache.get(cacheKey);
  if (fail && now - fail.at < FAIL_TTL_MS) {
    if (hit) return NextResponse.json(hit.payload);
    return NextResponse.json(fail.payload);
  }

  try {
    if (kind === "domain") {
      const resolved = await resolveDomain(domain!);
      if (!resolved) {
        const p = basePayload();
        p.query = { input: raw, kind, ip: null, domain, selfPrivate: false };
        p.error = `域名 ${domain} 解析失败：DoH 源没有返回 A/AAAA 记录，请核对域名是否正确。`;
        p.errors.dns = "Google DoH 与 Cloudflare DoH 均无记录";
        failCache.set(cacheKey, { at: now, payload: p });
        return NextResponse.json(p, { status: 200 });
      }
      ip = resolved.ip;
    }

    const payload = await build(kind, raw, domain, ip!);
    if (payload.intel) {
      cache.set(cacheKey, { at: Date.now(), payload });
      failCache.delete(cacheKey);
    } else {
      failCache.set(cacheKey, { at: Date.now(), payload });
      if (hit) return NextResponse.json(hit.payload);
    }
    return NextResponse.json(payload);
  } catch (err) {
    const p = basePayload();
    p.query = { input: raw, kind, ip, domain, selfPrivate: false };
    p.error = `查询失败：${String(err).slice(0, 160)}`;
    if (hit) return NextResponse.json(hit.payload);
    failCache.set(cacheKey, { at: Date.now(), payload: p });
    return NextResponse.json(p, { status: 200 });
  }
}
