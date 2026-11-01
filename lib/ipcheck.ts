// IP 检测的服务端取数与判定（被 /api/ip-check 调用）。
// 数据源：ipwho.is（地理 / ASN / 运营商）+ 标记源（proxy / hosting / mobile）：
// ip-api.com 为主源（免费档只有 HTTP 端点）；其无应答时降级 proxycheck.io（HTTPS，
// 用 proxy 标记与其 type 分类映射出 hosting / mobile）。实际供数源记入 sources 并
// 在页面与证据文案中如实标注。域名经 DNS-over-HTTPS（Google 主、Cloudflare 备）
// 解析，Whois 走 RDAP（rdap.org 跳权威源；需带 UA，否则 403）。
// 单源失败只降级对应字段并记入 errors，绝不编造。
// 风险评分是「基于公开信号的透明规则评分」：规则与权重写死在本文件并印在页面上，
// 它衡量的是「这个 IP 像不像代理 / 机房出口」，不是商业风控库的欺诈分。

export interface IpIntel {
  ip: string;
  version: number; // 4 | 6
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  asn: string | null; // 如 "AS15169"
  asName: string | null; // 如 "GOOGLE"
  isp: string | null;
  org: string | null;
  reverse: string | null;
  flags: {
    proxy: boolean | null;
    hosting: boolean | null;
    mobile: boolean | null;
  };
  /** 标记实际供数源：证据文案与页面来源标注都按它走 */
  flagsSource: "ip-api" | "proxycheck.io" | null;
  sources: { ipwho: boolean; ipapi: boolean; proxycheck: boolean };
}

export interface ScoreItem {
  id: "proxy" | "hosting" | "cloudAsn" | "mobile";
  points: number; // 命中时的分值（可为负，表示减分项）
  hit: boolean | null; // null = 无数据
  evidence: { zh: string; en: string } | null;
}

export type IpTypeKey = "idc" | "residential" | "mobile" | "unknown";
export type RiskBand = "low" | "mid" | "high";

export interface IpVerdict {
  type: IpTypeKey;
  typeEvidence: { zh: string; en: string }[];
  score: number; // 0–100
  band: RiskBand;
  items: ScoreItem[];
  nativeKey: "likely" | "anycast" | "mismatch" | "unknown";
  nativeEvidence: { zh: string; en: string }[];
}

export interface WhoisSummary {
  kind: "ip" | "domain";
  target: string;
  name: string | null; // IP：网段名；域名：ldhName
  org: string | null; // IP：注册组织（RDAP 实体 fn）
  registrar: string | null; // 域名：注册商
  country: string | null;
  range: string | null; // IP：起止地址或 CIDR
  registered: string | null;
  expires: string | null;
  status: string[];
  source: string | null; // 实际应答的 RDAP 主机
}

export interface IpCheckPayload {
  ok: boolean;
  error: string | null;
  query: {
    input: string; // 用户原始输入（自查时为空串）
    kind: "self" | "ip" | "domain";
    ip: string | null; // 实际查询的 IP（域名为解析结果）
    domain: string | null; // 域名查询时的域名
    selfPrivate: boolean; // 自查且出口为本机/内网地址（本地环境）
  };
  intel: IpIntel | null;
  verdict: IpVerdict | null;
  whois: WhoisSummary | null;
  errors: { intel?: string; ipapi?: string; whois?: string; dns?: string };
  fetchedAt: string;
}

// 知名云厂商 / 机房 ASN 关键词（asname 或 org 大写后子串匹配）——辅助信号，只 +15。
const CLOUD_KEYWORDS = [
  "GOOGLE",
  "AMAZON",
  "MICROSOFT",
  "AZURE",
  "CLOUDFLARE",
  "OVH",
  "HETZNER",
  "DIGITALOCEAN",
  "ALIBABA",
  "TENCENT",
  "ORACLE",
  "LINODE",
  "AKAMAI",
  "CHOOPA",
  "VULTR",
  "HUAWEI",
  "BAIDU",
  "UCLOUD",
  "LEASEWEB",
  "M247",
  "DATACAMP",
  "PSYCHZ",
];

// 全球 Anycast 网络：地理只是接入点位置，不能据此谈原生/广播。
// 按 asname 或组织名匹配（ipwho 只给组织名时靠 org 命中）。
const ANYCAST_KEYWORDS = ["GOOGLE", "CLOUDFLARE"];

function matchCloud(asName: string | null, org: string | null): string | null {
  const hay = `${asName ?? ""} ${org ?? ""}`.toUpperCase();
  for (const kw of CLOUD_KEYWORDS) {
    if (hay.includes(kw)) return kw;
  }
  return null;
}

async function fetchJson(
  url: string,
  ms = 8000,
  headers?: Record<string, string>
): Promise<{ json: unknown; finalUrl: string }> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        accept: "application/json",
        // rdap.org / Verisign RDAP 对无 UA 的请求直接 403，必须带 UA
        "user-agent": "Mozilla/5.0 (compatible; 18btc-ip-check/1.0; +https://18btc.cc/tag/ip-check)",
        ...(headers ?? {}),
      },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as unknown;
    return { json, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

/** 域名 → IP：Google DoH 主源、Cloudflare DoH 备源；A 优先、其次 AAAA。 */
export async function resolveDomain(
  domain: string
): Promise<{ ip: string; via: string } | null> {
  const providers: { name: string; url: (n: string, t: string) => string }[] = [
    {
      name: "Google DoH",
      url: (n, t) => `https://dns.google/resolve?name=${encodeURIComponent(n)}&type=${t}`,
    },
    {
      name: "Cloudflare DoH",
      url: (n, t) =>
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(n)}&type=${t}`,
    },
  ];
  for (const p of providers) {
    for (const type of ["A", "AAAA"]) {
      try {
        const { json } = await fetchJson(p.url(domain, type), 6000);
        const answers = (json as { Answer?: { type: number; data: string }[] }).Answer ?? [];
        const want = type === "A" ? 1 : 28;
        const hit = answers.find((a) => a.type === want && a.data);
        if (hit) return { ip: hit.data, via: p.name };
      } catch {
        // 换下一个源 / 记录类型
      }
    }
  }
  return null;
}

interface RawIntel {
  intel: IpIntel;
  flagsOk: boolean;
  flagsError?: string;
}

/** 情报合并：ipwho.is 给地理/ASN；标记走 ip-api 主源、proxycheck.io 兜底。 */
export async function fetchIntel(ip: string): Promise<RawIntel> {
  const intel: IpIntel = {
    ip,
    version: ip.includes(":") ? 6 : 4,
    country: null,
    countryCode: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
    timezone: null,
    asn: null,
    asName: null,
    isp: null,
    org: null,
    reverse: null,
    flags: { proxy: null, hosting: null, mobile: null },
    flagsSource: null,
    sources: { ipwho: false, ipapi: false, proxycheck: false },
  };

  const [whoRes, apiRes] = await Promise.allSettled([
    fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`, 8000),
    fetchJson(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
      8000
    ),
  ]);

  if (whoRes.status === "fulfilled") {
    const j = whoRes.value.json as Record<string, unknown>;
    if (j && j.success === true) {
      intel.sources.ipwho = true;
      intel.country = (j.country as string) ?? null;
      intel.countryCode = (j.country_code as string) ?? null;
      intel.region = (j.region as string) ?? null;
      intel.city = (j.city as string) ?? null;
      intel.latitude = typeof j.latitude === "number" ? j.latitude : null;
      intel.longitude = typeof j.longitude === "number" ? j.longitude : null;
      const tz = j.timezone as { id?: string } | undefined;
      intel.timezone = tz?.id ?? null;
      const conn = j.connection as
        | { asn?: number; org?: string; isp?: string }
        | undefined;
      if (conn) {
        intel.asn = conn.asn ? `AS${conn.asn}` : null;
        intel.org = conn.org ?? null;
        intel.isp = conn.isp ?? null;
      }
    }
  }

  let flagsError: string | undefined;
  if (apiRes.status === "fulfilled") {
    const j = apiRes.value.json as Record<string, unknown>;
    if (j && j.status === "success") {
      intel.sources.ipapi = true;
      intel.flagsSource = "ip-api";
      intel.flags.proxy = typeof j.proxy === "boolean" ? j.proxy : null;
      intel.flags.hosting = typeof j.hosting === "boolean" ? j.hosting : null;
      intel.flags.mobile = typeof j.mobile === "boolean" ? j.mobile : null;
      intel.asName = (j.asname as string) ?? null;
      intel.reverse = (j.reverse as string) || null;
      // ipwho 缺失时用 ip-api 兜底地理/ASN 字段
      if (!intel.sources.ipwho) {
        intel.country = (j.country as string) ?? intel.country;
        intel.countryCode = (j.countryCode as string) ?? intel.countryCode;
        intel.region = (j.regionName as string) ?? intel.region;
        intel.city = (j.city as string) ?? intel.city;
        intel.isp = (j.isp as string) ?? intel.isp;
        intel.org = (j.org as string) ?? intel.org;
        const asStr = (j.as as string) ?? "";
        const m = asStr.match(/^AS\d+/);
        intel.asn = m ? m[0] : intel.asn;
      }
    } else {
      flagsError = `ip-api: ${(j?.message as string) ?? "fail"}`;
    }
  } else {
    flagsError = `ip-api: ${String(apiRes.reason).slice(0, 120)}`;
  }

  // ip-api 无应答 → proxycheck.io 兜底标记：proxy 用其 proxy 标记，
  // hosting / mobile 由其 type 分类映射（Datacenter/Hosting→hosting，
  // Wireless→mobile，其余已知类型→两者皆 false），映射口径如实标注来源。
  if (!intel.sources.ipapi) {
    try {
      const { json } = await fetchJson(
        `https://proxycheck.io/v2/${encodeURIComponent(ip)}?vpn=1&asn=1`,
        8000
      );
      const root = json as Record<string, unknown>;
      const d = root[ip] as Record<string, unknown> | undefined;
      if (root.status === "ok" && d) {
        intel.sources.proxycheck = true;
        intel.flagsSource = "proxycheck.io";
        intel.flags.proxy = d.proxy === "yes" ? true : d.proxy === "no" ? false : null;
        const type = typeof d.type === "string" ? d.type : "";
        if (/datacenter|hosting/i.test(type)) {
          intel.flags.hosting = true;
          intel.flags.mobile = false;
        } else if (/residential|wireless/i.test(type)) {
          intel.flags.hosting = false;
          intel.flags.mobile = /wireless/i.test(type);
        } else if (type) {
          // Business 等其余分类：不是移动网络可以确定，hosting 不下结论
          intel.flags.mobile = false;
        }
        if (!intel.asn && typeof d.asn === "string") intel.asn = d.asn;
        if (!intel.reverse && typeof d.hostname === "string") intel.reverse = d.hostname;
        flagsError = undefined;
      }
    } catch (e) {
      flagsError = `${flagsError ?? ""} | proxycheck: ${String(e).slice(0, 80)}`;
    }
  }

  if (!intel.sources.ipwho && !intel.sources.ipapi && !intel.sources.proxycheck) {
    throw new Error("ipwho.is、ip-api 与 proxycheck 均无应答");
  }
  return { intel, flagsOk: intel.flagsSource !== null, flagsError };
}

/** 类型判定 + 风险评分 + 原生 IP 参考判断（规则与页面规则表一一对应）。 */
export function judgeIntel(intel: IpIntel, whois: WhoisSummary | null): IpVerdict {
  const { proxy, hosting, mobile } = intel.flags;
  const cloudHit = matchCloud(intel.asName, intel.org ?? intel.isp);
  const src = intel.flagsSource ?? "ip-api";

  const items: ScoreItem[] = [
    {
      id: "proxy",
      points: 45,
      hit: proxy,
      evidence:
        proxy === null
          ? null
          : {
              zh: `${src} 标记 proxy=${proxy}（该 IP 被识别为代理/VPN 类出口时为 true）`,
              en: `${src} flags proxy=${proxy} (true when the IP is recognised as a proxy/VPN-style exit)`,
            },
    },
    {
      id: "hosting",
      points: 35,
      hit: hosting,
      evidence:
        hosting === null
          ? null
          : {
              zh:
                intel.flagsSource === "proxycheck.io"
                  ? `proxycheck.io 的 type 分类映射为 hosting=${hosting}（其分类为 Datacenter/Hosting 类时记 true）`
                  : `ip-api 标记 hosting=${hosting}（IP 属于托管/机房网段时为 true）`,
              en:
                intel.flagsSource === "proxycheck.io"
                  ? `proxycheck.io's type classification maps to hosting=${hosting} (true when it classifies the IP as Datacenter/Hosting)`
                  : `ip-api flags hosting=${hosting} (true when the IP sits in a hosting/datacenter range)`,
            },
    },
    {
      id: "cloudAsn",
      points: 15,
      hit: cloudHit !== null ? true : intel.asName || intel.org ? false : null,
      evidence: cloudHit
        ? {
            zh: `ASN/组织名命中云厂商名单：${cloudHit}（${intel.asn ?? ""} ${intel.asName ?? intel.org ?? ""}）`,
            en: `ASN/org name matches the cloud-provider list: ${cloudHit} (${intel.asn ?? ""} ${intel.asName ?? intel.org ?? ""})`,
          }
        : null,
    },
    {
      id: "mobile",
      points: -20,
      hit: mobile,
      evidence:
        mobile === null
          ? null
          : {
              zh:
                intel.flagsSource === "proxycheck.io"
                  ? `proxycheck.io 的 type 分类映射为 mobile=${mobile}（其分类为 Wireless 时记 true）`
                  : `ip-api 标记 mobile=${mobile}（移动网络出口更像真实用户网络，命中减分）`,
              en:
                intel.flagsSource === "proxycheck.io"
                  ? `proxycheck.io's type classification maps to mobile=${mobile} (true when it classifies the IP as Wireless)`
                  : `ip-api flags mobile=${mobile} (a mobile-carrier exit looks like a real user network, so a hit subtracts)`,
            },
    },
  ];

  let score = 0;
  for (const it of items) {
    if (it.hit === true) score += it.points;
  }
  score = Math.max(0, Math.min(100, score));
  const band: RiskBand = score >= 60 ? "high" : score >= 30 ? "mid" : "low";

  // ---- 类型判定 ----
  const typeEvidence: { zh: string; en: string }[] = [];
  let type: IpTypeKey = "unknown";
  if (mobile === true) {
    type = "mobile";
    typeEvidence.push({
      zh: `${src} 标记 mobile=true，属于移动运营商网络`,
      en: `${src} flags mobile=true — a mobile carrier network`,
    });
  } else if (hosting === true || cloudHit) {
    type = "idc";
    if (hosting === true)
      typeEvidence.push({
        zh: `${src} 标记 hosting=true，IP 位于托管/机房网段`,
        en: `${src} flags hosting=true — the IP sits in a hosting/datacenter range`,
      });
    if (cloudHit)
      typeEvidence.push({
        zh: `ASN/组织命中云厂商名单：${cloudHit}`,
        en: `ASN/org matches the cloud-provider list: ${cloudHit}`,
      });
  } else if (hosting === false && mobile === false) {
    type = "residential";
    typeEvidence.push({
      zh: `${src} 标记 hosting=false、mobile=false，未见机房/代理托管信号`,
      en: `${src} flags hosting=false and mobile=false — no datacenter signals seen`,
    });
    if (proxy === false)
      typeEvidence.push({
        zh: `${src} 标记 proxy=false`,
        en: `${src} flags proxy=false`,
      });
  } else {
    typeEvidence.push({
      zh: "关键标记源暂无数据，仅凭地理与 ASN 无法可靠判定类型",
      en: "The flag sources have no data, so geography and ASN alone cannot settle the type",
    });
  }
  if (proxy === true && type !== "idc") {
    typeEvidence.push({
      zh: `另注意：${src} 标记 proxy=true，该 IP 带有代理出口特征`,
      en: `Also note: ${src} flags proxy=true — this IP shows proxy-exit traits`,
    });
  }

  // ---- 原生 IP 参考判断（只给证据，不确证）----
  const nativeEvidence: { zh: string; en: string }[] = [];
  let nativeKey: IpVerdict["nativeKey"] = "unknown";
  const asnHay = `${intel.asName ?? ""} ${intel.org ?? ""} ${intel.isp ?? ""}`.toUpperCase();
  if (ANYCAST_KEYWORDS.some((a) => asnHay.includes(a))) {
    nativeKey = "anycast";
    nativeEvidence.push({
      zh: `${intel.asn ?? ""} ${intel.asName ?? intel.org ?? ""} 是全球 Anycast 网络：你在各地查到的地理位置是就近接入点，不是 IP 的注册归属地，「原生/广播」之分对它不成立。`,
      en: `${intel.asn ?? ""} ${intel.asName ?? intel.org ?? ""} is a global anycast network: the location you see is the nearest point of presence, not the IP's registered home, so the native-vs-broadcast distinction does not apply.`,
    });
  } else if (whois?.country && intel.countryCode) {
    if (whois.country.toUpperCase() === intel.countryCode.toUpperCase()) {
      nativeKey = "likely";
      nativeEvidence.push({
        zh: `IP 地理归属国（${intel.countryCode}）与 RDAP 网段注册国（${whois.country}）一致——符合「原生 IP」的常见特征，但公开数据只能支持到参考判断，无法确证。`,
        en: `The IP's geo country (${intel.countryCode}) matches the RDAP netblock's registered country (${whois.country}) — consistent with a "native IP", but public data only supports this as a reference judgement, never proof.`,
      });
    } else {
      nativeKey = "mismatch";
      nativeEvidence.push({
        zh: `IP 地理归属国（${intel.countryCode}）与 RDAP 网段注册国（${whois.country}）不一致——更像广播/租用 IP 的特征，但 Anycast 与数据库误差同样可能造成不一致，只能作参考。`,
        en: `The IP's geo country (${intel.countryCode}) differs from the RDAP netblock's registered country (${whois.country}) — more typical of a broadcast/leased IP, though anycast and database error can cause the same mismatch. Reference only.`,
      });
    }
  } else {
    nativeEvidence.push({
      zh: "缺少 RDAP 注册国或地理数据，无法给出原生 IP 参考判断。",
      en: "RDAP country or geo data is missing, so no native-IP reference judgement can be made.",
    });
  }

  return { type, typeEvidence, score, band, items, nativeKey, nativeEvidence };
}

// ---------- RDAP ----------

interface RdapEntity {
  roles?: string[];
  handle?: string;
  vcardArray?: unknown;
  entities?: RdapEntity[];
}

function vcardFn(vcardArray: unknown): string | null {
  if (!Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) return null;
  for (const row of vcardArray[1] as unknown[]) {
    if (Array.isArray(row) && row[0] === "fn" && typeof row[3] === "string" && row[3]) {
      return row[3] as string;
    }
  }
  return null;
}

function collectEntities(list: RdapEntity[] | undefined, out: { roles: string[]; fn: string }[]) {
  if (!list) return;
  for (const e of list) {
    const fn = vcardFn(e.vcardArray);
    if (fn) out.push({ roles: e.roles ?? [], fn });
    if (e.entities) collectEntities(e.entities, out);
  }
}

function pickOrg(entities: RdapEntity[] | undefined, prefer: string[]): string | null {
  const flat: { roles: string[]; fn: string }[] = [];
  collectEntities(entities, flat);
  for (const role of prefer) {
    const hit = flat.find((f) => f.roles.includes(role));
    if (hit) return hit.fn;
  }
  return flat.length ? flat[0].fn : null;
}

function eventDate(
  events: { eventAction?: string; eventDate?: string }[] | undefined,
  action: string
): string | null {
  const hit = (events ?? []).find((e) => e.eventAction === action);
  return hit?.eventDate ? hit.eventDate.slice(0, 10) : null;
}

/** RDAP 摘要：跟随 rdap.org 跳转到权威 RDAP，只摘关键字段。 */
export async function fetchWhois(
  kind: "ip" | "domain",
  target: string
): Promise<WhoisSummary> {
  const url =
    kind === "ip"
      ? `https://rdap.org/ip/${encodeURIComponent(target)}`
      : `https://rdap.org/domain/${encodeURIComponent(target)}`;
  const { json, finalUrl } = await fetchJson(url, 10000, {
    accept: "application/rdap+json",
  });
  const j = json as Record<string, unknown>;
  let source: string | null = null;
  try {
    source = new URL(finalUrl).host;
  } catch {
    source = null;
  }

  const events = j.events as
    | { eventAction?: string; eventDate?: string }[]
    | undefined;
  const entities = j.entities as RdapEntity[] | undefined;
  const status = Array.isArray(j.status) ? (j.status as string[]) : [];

  if (kind === "domain") {
    return {
      kind,
      target,
      name: (j.ldhName as string) ?? target,
      org: null,
      registrar: pickOrg(entities, ["registrar"]),
      country: null,
      range: null,
      registered: eventDate(events, "registration"),
      expires: eventDate(events, "expiration"),
      status,
      source,
    };
  }

  const cidrs = (j.cidr0_cidrs as { v4prefix?: string; v6prefix?: string; length?: number }[]) ?? [];
  let range: string | null = null;
  if (cidrs.length) {
    const c = cidrs[0];
    const prefix = c.v4prefix ?? c.v6prefix;
    if (prefix && typeof c.length === "number") range = `${prefix}/${c.length}`;
  }
  if (!range && j.startAddress && j.endAddress) {
    range = `${j.startAddress as string} – ${j.endAddress as string}`;
  }
  return {
    kind,
    target,
    name: (j.name as string) ?? null,
    org: pickOrg(entities, ["registrant", "administrative", "technical", "abuse"]),
    registrar: null,
    country: (j.country as string) ?? null,
    range,
    registered: eventDate(events, "registration"),
    expires: null,
    status,
    source,
  };
}

/** 是否为本机 / 内网 / 保留地址（自查时标注，不外查）。 */
export function isPrivateIp(ip: string): boolean {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) {
    const [a, b] = v4.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  return false;
}

export function normalizeIp(ip: string): string {
  return ip.startsWith("::ffff:") && /^\d+\.\d+\.\d+\.\d+$/.test(ip.slice(7))
    ? ip.slice(7)
    : ip;
}
