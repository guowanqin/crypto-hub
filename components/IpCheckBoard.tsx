"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IpCheckPayload } from "@/lib/ipcheck";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

export const IPCHECK_DICT: Record<
  Lang,
  {
    boardKicker: string;
    boardSub: string;
    placeholder: string;
    queryBtn: string;
    selfBtn: string;
    querying: string;
    loadingSelf: string;
    selfPrivateNote: string;
    resultFor: string; // {ip}
    kindSelf: string;
    kindIp: string;
    kindDomain: string; // {domain} → {ip}
    fetchedAt: string; // {t}
    statCountry: string;
    statCity: string;
    statAsn: string;
    statIsp: string;
    statOrg: string;
    statTimezone: string;
    statCoords: string;
    statReverse: string;
    sourceNote: string; // {src}
    secVerdict: string;
    typeLabel: string;
    types: Record<string, string>;
    evidenceTitle: string;
    scoreLabel: string;
    bands: Record<string, string>;
    scoreItemsTitle: string;
    colRule: string;
    colHit: string;
    colPoints: string;
    hitYes: string;
    hitNo: string;
    hitNa: string;
    itemNames: Record<string, string>;
    nativeTitle: string;
    secRules: string;
    rulesIntro: string;
    rulesRows: { rule: string; points: string; desc: string }[];
    rulesNote: string;
    secWhois: string;
    whoisLabels: Record<string, string>;
    whoisSource: string; // {src}
    whoisFail: string;
    secRtc: string;
    rtcIntro: string;
    rtcRunning: string;
    rtcPublic: string;
    rtcNone: string;
    rtcSame: string; // {ip}
    rtcDiff: string; // {ips}
    rtcNoSelf: string;
    rtcMdns: string;
    rtcLocalOnly: string;
    rerun: string;
    secEnv: string;
    envIntro: string;
    envLabels: Record<string, string>;
    secPing: string;
    pingIntro: string;
    pingRun: string;
    pingRunning: string;
    pingPending: string;
    pingFail: string;
    pingEndpoints: Record<string, string>;
    secNotes: string;
    notes: string[];
    toolsTitle: string;
    queryErrorFallback: string;
  }
> = {
  zh: {
    boardKicker: "IP 风险检测 · 网络环境自查",
    boardSub:
      "打开页面先自动查你自己的出口 IP；也可以输入任意 IP 或域名。地理、ASN 与风险标记由服务端多源调取，WebRTC、浏览器环境与延迟测试全部在你的浏览器本地完成、不上传。",
    placeholder: "输入 IP 或域名，如 8.8.8.8 或 github.com",
    queryBtn: "查询",
    selfBtn: "查我自己",
    querying: "查询中…",
    loadingSelf: "正在自查你的出口 IP…",
    selfPrivateNote:
      "当前读到的出口地址是本机/内网地址（多见于本地测试环境），公网环境下打开本页会直接显示你的真实出口 IP 与完整报告。",
    resultFor: "查询结果 · {ip}",
    kindSelf: "自查（你的出口 IP）",
    kindIp: "IP 查询",
    kindDomain: "域名 {domain} → 解析为 {ip}",
    fetchedAt: "取数时间 {t}",
    statCountry: "国家 / 地区",
    statCity: "城市",
    statAsn: "ASN",
    statIsp: "运营商 / ISP",
    statOrg: "组织",
    statTimezone: "时区",
    statCoords: "经纬度（约）",
    statReverse: "反向解析",
    sourceNote: "情报来源：{src}；地理库之间存在误差，城市一级仅供参考。",
    secVerdict: "01 · 属性判定与风险评分",
    typeLabel: "网络类型",
    types: {
      idc: "IDC 机房",
      residential: "家宽住宅",
      mobile: "移动网络",
      unknown: "无法确定",
    },
    evidenceTitle: "判定证据",
    scoreLabel: "风险分（0–100，越高越像代理/机房出口）",
    bands: { low: "低", mid: "中", high: "高" },
    scoreItemsTitle: "评分明细",
    colRule: "规则",
    colHit: "命中",
    colPoints: "分值",
    hitYes: "命中",
    hitNo: "未命中",
    hitNa: "无数据",
    itemNames: {
      proxy: "代理标记 proxy",
      hosting: "机房标记 hosting",
      cloudAsn: "云厂商 ASN 名单",
      mobile: "移动网络 mobile（减分项）",
    },
    nativeTitle: "原生 IP 参考判断",
    secRules: "评分规则（全公开）",
    rulesIntro:
      "本站的风险分是基于公开信号的规则评分，衡量「像不像代理/机房出口」，不是商业风控库的欺诈评分。规则就这四条，权重如下，页面上的每一分都能对回这里：",
    rulesRows: [
      { rule: "代理标记 proxy = true", points: "+45", desc: "该 IP 被标记源（ip-api 主源、proxycheck.io 兜底）识别为代理 / VPN 类出口" },
      { rule: "机房标记 hosting = true", points: "+35", desc: "IP 位于托管 / IDC 机房网段（兜底源由其 type 分类映射）" },
      { rule: "ASN / 组织名命中云厂商名单", points: "+15", desc: "Google、Amazon、Microsoft、Cloudflare、OVH、Hetzner、阿里云、腾讯云等（辅助信号）" },
      { rule: "移动标记 mobile = true", points: "−20", desc: "移动运营商出口更像真实用户网络，命中减分" },
    ],
    rulesNote:
      "总分夹在 0–100：0–29 低、30–59 中、60–100 高。Tor 出口节点没有可靠的免费标记源，本站不计 Tor、不假装能测。分数高只说明机房/代理特征强——很多正规服务（公共 DNS、CDN、公司 VPN）天然就是机房 IP，不等于「有问题」。",
    secWhois: "02 · Whois（RDAP）",
    whoisLabels: {
      name: "网段名 / 域名",
      org: "注册组织",
      registrar: "注册商",
      country: "注册国家",
      range: "网段范围",
      registered: "注册日期",
      expires: "到期日期",
      status: "状态",
    },
    whoisSource: "来源：RDAP（经 rdap.org 跳转至权威注册局 {src}）",
    whoisFail: "RDAP 暂时没有返回该对象的注册信息，稍后再试；不影响上面的情报与评分。",
    secRtc: "03 · WebRTC 泄露检测（本地）",
    rtcIntro:
      "WebRTC 会通过 STUN 拿到你的公网映射地址：如果你挂了代理/VPN，这里露出的地址和浏览器 HTTP 出口不一致，就说明 WebRTC 正在绕过代理泄露真实出口。检测只在本机浏览器内进行，结果不上传。",
    rtcRunning: "正在收集 ICE candidate…",
    rtcPublic: "WebRTC 看到的公网地址",
    rtcNone:
      "没有收集到公网（srflx）candidate：可能被浏览器设置、扩展或网络策略挡住，这本身就是一种防泄露状态，不代表出错。",
    rtcSame: "与本站读到的你的出口 IP 一致（{ip}）：WebRTC 没有泄露出别的出口。",
    rtcDiff:
      "注意：WebRTC 露出的公网地址（{ips}）与本站读到的你的出口 IP 不一致——如果你在用代理/VPN，这就是典型的 WebRTC 泄露，真实出口可能已暴露。",
    rtcNoSelf: "暂时拿不到你的出口 IP 基准（自查未完成），先只列出 WebRTC 公网地址，不做对比结论。",
    rtcMdns: "浏览器用 mDNS 隐藏了本地地址（candidate 为 *.local），这是现代浏览器的默认隐私保护。",
    rtcLocalOnly: "全程本地检测，不上传服务器。",
    rerun: "重新检测",
    secEnv: "04 · 浏览器环境（本地）",
    envIntro:
      "网站能被动读到的浏览器环境如下——时区、语言与 IP 地理对不上，是很多风控系统眼里的异常信号，自查时可以顺手核对。全程本地读取，不上传。",
    envLabels: {
      timezone: "时区",
      language: "语言",
      languages: "语言列表",
      ua: "User-Agent",
      platform: "平台",
      screen: "屏幕分辨率",
      viewport: "窗口尺寸",
      colorDepth: "色彩深度",
      webgl: "WebGL 渲染器",
      cores: "CPU 核数",
      memory: "设备内存（约）",
      touch: "触摸点数",
      cookies: "Cookie 启用",
      dnt: "Do Not Track",
      online: "联网状态",
    },
    secPing: "05 · 延迟测试（HTTP，非 ICMP Ping）",
    pingIntro:
      "浏览器发不了 ICMP 包，所以这里测的是向各端点发 HTTP 请求的往返耗时（每端点测 5 次取中位），和系统 ping 不是一回事，但足够横向比较你到各地的网络通畅程度。",
    pingRun: "开始测速",
    pingRunning: "测试中…",
    pingPending: "待测",
    pingFail: "无响应",
    pingEndpoints: {
      site: "本站（18btc.cc）",
      cloudflare: "Cloudflare（全球 Anycast）",
      google: "Google（全球）",
      github: "GitHub（美国）",
    },
    secNotes: "口径与边界",
    notes: [
      "地理位置来自公开库的合并结果（ipwho.is 为主源；标记由 ip-api 主源、proxycheck.io 兜底提供，实际供数源标在结果上方），不同库对同一 IP 的城市定位经常不一致，精确到城市的结果只当参考；国家与 ASN 一般可靠。",
      "风险评分只用页面上列出的四条公开规则，不接商业风控库：它能识别「机房 / 代理特征强不强」，识别不了「这个 IP 干没干过坏事」——后者需要付费的威胁情报名单，本站不做也不装。",
      "原生 IP 只能给参考判断：公开数据能比对的只有地理归属与 RDAP 注册国是否一致、是否 Anycast，任何声称能「确证原生」的免费工具都是在猜。",
      "本页的服务端查询会把待查 IP/域名发给上述公开情报源（这是查询的必要代价）；WebRTC、浏览器环境、延迟三节则完全在本地，不经过服务器。页面结构参考了 pingip.co 的自查思路，数据源与评分规则为本站自建并在上方全量公开。",
    ],
    toolsTitle: "IP 检测 · 本类工具",
    queryErrorFallback: "查询失败，请稍后重试。",
  },
  en: {
    boardKicker: "IP Risk Check · Network Self-Audit",
    boardSub:
      "Opening this page checks your own exit IP first; you can also query any IP or domain. Geography, ASN and risk flags are fetched server-side from multiple public sources, while the WebRTC, browser-environment and latency sections run entirely in your browser and upload nothing.",
    placeholder: "Enter an IP or domain, e.g. 8.8.8.8 or github.com",
    queryBtn: "Check",
    selfBtn: "Check my IP",
    querying: "Checking…",
    loadingSelf: "Checking your exit IP…",
    selfPrivateNote:
      "The exit address read here is a local/private one (typical of a local test environment). Open this page on the public internet and your real exit IP with the full report appears directly.",
    resultFor: "Result · {ip}",
    kindSelf: "Self-check (your exit IP)",
    kindIp: "IP lookup",
    kindDomain: "Domain {domain} → resolved to {ip}",
    fetchedAt: "Fetched at {t}",
    statCountry: "Country / Region",
    statCity: "City",
    statAsn: "ASN",
    statIsp: "ISP",
    statOrg: "Organisation",
    statTimezone: "Timezone",
    statCoords: "Coordinates (approx.)",
    statReverse: "Reverse DNS",
    sourceNote: "Intel sources: {src}. Geo databases disagree with each other; treat city-level results as approximate.",
    secVerdict: "01 · Type Verdict & Risk Score",
    typeLabel: "Network type",
    types: {
      idc: "Datacenter (IDC)",
      residential: "Residential broadband",
      mobile: "Mobile network",
      unknown: "Undetermined",
    },
    evidenceTitle: "Evidence",
    scoreLabel: "Risk score (0–100; higher = looks more like a proxy/datacenter exit)",
    bands: { low: "Low", mid: "Medium", high: "High" },
    scoreItemsTitle: "Score breakdown",
    colRule: "Rule",
    colHit: "Hit",
    colPoints: "Points",
    hitYes: "Hit",
    hitNo: "No",
    hitNa: "No data",
    itemNames: {
      proxy: "Proxy flag",
      hosting: "Hosting flag",
      cloudAsn: "Cloud-provider ASN list",
      mobile: "Mobile flag (subtracts)",
    },
    nativeTitle: "Native-IP reference judgement",
    secRules: "Scoring rules (fully public)",
    rulesIntro:
      "This risk score is a rule score over public signals — it measures how much an IP looks like a proxy/datacenter exit. It is not a commercial fraud score. There are exactly four rules, weighted as follows, and every point above traces back here:",
    rulesRows: [
      { rule: "Proxy flag = true", points: "+45", desc: "The flag source (ip-api primary, proxycheck.io fallback) recognises the IP as a proxy / VPN-style exit" },
      { rule: "Hosting flag = true", points: "+35", desc: "The IP sits in a hosting / datacenter range (the fallback source maps this from its type classification)" },
      { rule: "ASN / org name matches the cloud list", points: "+15", desc: "Google, Amazon, Microsoft, Cloudflare, OVH, Hetzner, Alibaba Cloud, Tencent Cloud… (supporting signal)" },
      { rule: "Mobile flag = true", points: "−20", desc: "A mobile-carrier exit looks like a real user network, so a hit subtracts" },
    ],
    rulesNote:
      "The total is clamped to 0–100: 0–29 low, 30–59 medium, 60–100 high. There is no reliable free marker for Tor exits, so Tor is not scored and not faked. A high score only means strong datacenter/proxy traits — plenty of legitimate services (public DNS, CDNs, corporate VPNs) are datacenter IPs by nature; it does not mean 'bad'.",
    secWhois: "02 · Whois (RDAP)",
    whoisLabels: {
      name: "Netname / Domain",
      org: "Registrant organisation",
      registrar: "Registrar",
      country: "Country",
      range: "Range",
      registered: "Registered",
      expires: "Expires",
      status: "Status",
    },
    whoisSource: "Source: RDAP (via rdap.org to the authoritative registry {src})",
    whoisFail: "RDAP returned no registration data for this object right now; try again later. The intel and score above are unaffected.",
    secRtc: "03 · WebRTC Leak Check (local)",
    rtcIntro:
      "WebRTC uses STUN to learn your public mapped address. If you are behind a proxy/VPN and the address shown here differs from your browser's HTTP exit, WebRTC is bypassing the proxy and leaking your real exit. This runs inside your browser only; nothing is uploaded.",
    rtcRunning: "Collecting ICE candidates…",
    rtcPublic: "Public address(es) WebRTC sees",
    rtcNone:
      "No public (srflx) candidate was collected: browser settings, an extension or network policy may be blocking it — that is itself a leak-resistant state, not an error.",
    rtcSame: "Matches the exit IP this site reads for you ({ip}): WebRTC is not leaking a different exit.",
    rtcDiff:
      "Careful: the public address WebRTC exposes ({ips}) differs from the exit IP this site reads for you — if you are on a proxy/VPN this is the classic WebRTC leak, and your real exit may be exposed.",
    rtcNoSelf: "Your exit-IP baseline is not available yet (self-check incomplete), so only the WebRTC public addresses are listed, with no comparison verdict.",
    rtcMdns: "The browser hides local addresses behind mDNS (candidates end in *.local) — the default privacy behaviour of modern browsers.",
    rtcLocalOnly: "Runs fully locally; nothing is uploaded to a server.",
    rerun: "Run again",
    secEnv: "04 · Browser Environment (local)",
    envIntro:
      "This is the browser environment any website can passively read. A timezone or language that clashes with your IP's geography is an anomaly signal to many risk systems — worth a glance while you self-check. Read locally only; nothing is uploaded.",
    envLabels: {
      timezone: "Timezone",
      language: "Language",
      languages: "Languages",
      ua: "User-Agent",
      platform: "Platform",
      screen: "Screen resolution",
      viewport: "Viewport size",
      colorDepth: "Colour depth",
      webgl: "WebGL renderer",
      cookies: "Cookies enabled",
      dnt: "Do Not Track",
      online: "Online",
      cores: "CPU cores",
      memory: "Device memory (approx.)",
      touch: "Touch points",
    },
    secPing: "05 · Latency Test (HTTP, not ICMP ping)",
    pingIntro:
      "A browser cannot send ICMP packets, so this measures HTTP round-trip time to each endpoint (5 tries per endpoint, median shown). It is not system ping, but it compares how reachable each destination is from your network.",
    pingRun: "Run test",
    pingRunning: "Testing…",
    pingPending: "Pending",
    pingFail: "No response",
    pingEndpoints: {
      site: "This site (18btc.cc)",
      cloudflare: "Cloudflare (global anycast)",
      google: "Google (global)",
      github: "GitHub (US)",
    },
    secNotes: "Method & limits",
    notes: [
      "Geography merges public databases (ipwho.is primary; flags from ip-api, with proxycheck.io as fallback — the source that actually answered is named above the results). Databases often disagree on the city for the same IP — treat city-level results as approximate; country and ASN are generally reliable.",
      "The risk score uses only the four public rules printed above and no commercial risk database: it can tell how strong the datacenter/proxy traits are, not whether an IP has misbehaved — that takes paid threat-intel feeds, which this site neither has nor pretends to have.",
      "Native-IP status is a reference judgement only: public data can compare geo country against the RDAP registered country and flag anycast, nothing more. Any free tool claiming to 'certify' a native IP is guessing.",
      "Server-side queries necessarily send the IP/domain you look up to the public intel sources above. The WebRTC, environment and latency sections never leave your browser. This page follows pingip.co's self-check layout idea; the data sources and scoring rules are this site's own and are fully published above.",
    ],
    toolsTitle: "IP Check · Tools in this shelf",
    queryErrorFallback: "The check failed. Please try again shortly.",
  },
};

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

interface RtcResult {
  state: "running" | "done";
  srflx: string[];
  mdns: boolean;
}

interface PingRow {
  key: string;
  ms: number | null;
  state: "idle" | "running" | "done" | "fail";
}

const PING_ENDPOINTS: { key: string; url: string | null; cors: boolean }[] = [
  { key: "site", url: null, cors: true }, // 运行时用 location.origin 拼
  { key: "cloudflare", url: "https://cp.cloudflare.com/generate_204", cors: false },
  { key: "google", url: "https://www.google.com/generate_204", cors: false },
  { key: "github", url: "https://github.com", cors: false },
];

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  return Math.round(s[Math.floor(s.length / 2)]);
}

export default function IpCheckBoard() {
  const { lang } = useLang();
  const d = IPCHECK_DICT[lang];

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<IpCheckPayload | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [selfIp, setSelfIp] = useState<string | null>(null);
  const selfDoneRef = useRef(false);

  const runQuery = useCallback(async (target: string, isSelf: boolean) => {
    setLoading(true);
    setFatal(null);
    try {
      const res = await fetch(
        `/api/ip-check${target ? `?target=${encodeURIComponent(target)}` : ""}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as IpCheckPayload;
      setPayload(data);
      if (isSelf && data.query.ip && !data.query.selfPrivate) setSelfIp(data.query.ip);
      if (data.error && !data.intel && !data.whois) setFatal(data.error);
    } catch {
      setFatal(d.queryErrorFallback);
    } finally {
      setLoading(false);
    }
  }, [d.queryErrorFallback]);

  // 打开页面先自查（自动调取数据）
  useEffect(() => {
    if (selfDoneRef.current) return;
    selfDoneRef.current = true;
    void runQuery("", true);
  }, [runQuery]);

  // ---------- WebRTC（本地） ----------
  const [rtc, setRtc] = useState<RtcResult>({ state: "running", srflx: [], mdns: false });
  const rtcRunRef = useRef(0);

  const runRtc = useCallback(async () => {
    const runId = ++rtcRunRef.current;
    setRtc({ state: "running", srflx: [], mdns: false });
    const srflx = new Set<string>();
    let mdns = false;
    try {
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pc.createDataChannel("ipc");
      pc.onicecandidate = (e) => {
        const cand = e.candidate?.candidate ?? "";
        if (!cand) return;
        const parts = cand.split(" ");
        const addr = parts[4];
        const typ = parts[parts.indexOf("typ") + 1];
        if (addr?.endsWith(".local")) mdns = true;
        if (typ === "srflx" && addr) srflx.add(addr);
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await new Promise((r) => setTimeout(r, 4000));
      pc.close();
    } catch {
      // WebRTC 不可用：按「无 candidate」呈现
    }
    if (rtcRunRef.current === runId) {
      setRtc({ state: "done", srflx: [...srflx], mdns });
    }
  }, []);

  useEffect(() => {
    void runRtc();
  }, [runRtc]);

  // ---------- 浏览器环境（本地） ----------
  const [env, setEnv] = useState<[string, string][]>([]);
  useEffect(() => {
    const L = IPCHECK_DICT[lang].envLabels;
    const rows: [string, string][] = [];
    try {
      rows.push([L.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone || "—"]);
    } catch {
      rows.push([L.timezone, "—"]);
    }
    rows.push([L.language, navigator.language || "—"]);
    rows.push([L.languages, (navigator.languages ?? []).join(", ") || "—"]);
    rows.push([L.ua, navigator.userAgent || "—"]);
    const navAny = navigator as Navigator & { userAgentData?: { platform?: string } };
    rows.push([L.platform, navAny.userAgentData?.platform || navigator.platform || "—"]);
    rows.push([L.screen, `${screen.width} × ${screen.height}`]);
    rows.push([L.viewport, `${window.innerWidth} × ${window.innerHeight}`]);
    rows.push([L.colorDepth, `${screen.colorDepth} bit`]);
    let glStr = "—";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        glStr = ext
          ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
          : String(gl.getParameter(gl.RENDERER));
      }
    } catch {
      glStr = "—";
    }
    rows.push([L.webgl, glStr]);
    rows.push([L.cores, navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : "—"]);
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    rows.push([L.memory, mem ? `${mem} GB` : "—"]);
    rows.push([L.touch, String(navigator.maxTouchPoints ?? 0)]);
    rows.push([L.cookies, navigator.cookieEnabled ? "true" : "false"]);
    rows.push([L.dnt, navigator.doNotTrack ?? "—"]);
    rows.push([L.online, navigator.onLine ? "true" : "false"]);
    setEnv(rows);
  }, [lang]);

  // ---------- 延迟测试（本地，HTTP 往返） ----------
  const [pingRows, setPingRows] = useState<PingRow[]>(
    PING_ENDPOINTS.map((e) => ({ key: e.key, ms: null, state: "idle" }))
  );
  const [pingRunning, setPingRunning] = useState(false);
  const pingRunRef = useRef(0);

  const runPing = useCallback(async () => {
    const runId = ++pingRunRef.current;
    setPingRunning(true);
    setPingRows(PING_ENDPOINTS.map((e) => ({ key: e.key, ms: null, state: "running" })));
    for (const ep of PING_ENDPOINTS) {
      const url = ep.url ?? `${location.origin}/api/ip-check?ping=1`;
      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        const t0 = performance.now();
        try {
          await fetch(url, {
            mode: ep.cors ? "cors" : "no-cors",
            cache: "no-store",
          });
          times.push(performance.now() - t0);
        } catch {
          // 单次失败忽略，5 次全失败才记无响应
        }
      }
      if (pingRunRef.current !== runId) return;
      const ms = median(times);
      setPingRows((rows) =>
        rows.map((r) =>
          r.key === ep.key ? { ...r, ms, state: ms === null ? "fail" : "done" } : r
        )
      );
    }
    if (pingRunRef.current === runId) setPingRunning(false);
  }, []);

  const pingAutoRef = useRef(false);
  useEffect(() => {
    if (pingAutoRef.current) return;
    pingAutoRef.current = true;
    void runPing();
  }, [runPing]);

  // ---------- 渲染 ----------
  const q = payload?.query;
  const intel = payload?.intel ?? null;
  const verdict = payload?.verdict ?? null;
  const whois = payload?.whois ?? null;

  const kindText = q
    ? q.kind === "self"
      ? d.kindSelf
      : q.kind === "domain"
        ? d.kindDomain.replace("{domain}", q.domain ?? "").replace("{ip}", q.ip ?? "")
        : d.kindIp
    : "";

  const srcNames: string[] = [];
  if (intel?.sources.ipwho) srcNames.push("ipwho.is");
  if (intel?.sources.ipapi) srcNames.push("ip-api.com");
  if (intel?.sources.proxycheck) srcNames.push("proxycheck.io");

  const rtcVerdict = (() => {
    if (rtc.state !== "done") return null;
    if (!rtc.srflx.length) return d.rtcNone;
    if (!selfIp) return d.rtcNoSelf;
    if (rtc.srflx.includes(selfIp)) return d.rtcSame.replace("{ip}", selfIp);
    return d.rtcDiff.replace("{ips}", rtc.srflx.join(", "));
  })();

  return (
    <>
      <section className="crcl-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">{d.boardSub}</p>
        </div>

        <form
          className="ipc-form"
          onSubmit={(e) => {
            e.preventDefault();
            void runQuery(input.trim(), input.trim() === "");
          }}
        >
          <input
            className="ipc-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={d.placeholder}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? d.querying : d.queryBtn}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={loading}
            onClick={() => {
              setInput("");
              void runQuery("", true);
            }}
          >
            {d.selfBtn}
          </button>
        </form>

        {!payload && loading && <p className="burn-note">{d.loadingSelf}</p>}
        {fatal && <p className="burn-note">{fatal}</p>}

        {payload && q && (
          <>
            <div className="ipc-head">
              <p className="ipc-kind">{kindText}</p>
              <p className="ipc-bigip">{q.ip ?? "—"}</p>
              <p className="ipc-fetched">
                {d.fetchedAt.replace(
                  "{t}",
                  new Date(payload.fetchedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")
                )}
              </p>
            </div>

            {q.selfPrivate && <p className="burn-note">{d.selfPrivateNote}</p>}

            {intel && (
              <>
                <div className="burn-grid crcl-stats">
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.statCountry}</p>
                    <p className="burn-stat-value">
                      {intel.country ?? "—"}
                      {intel.countryCode ? ` (${intel.countryCode})` : ""}
                    </p>
                    <p className="burn-stat-sub">{intel.region ?? ""}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.statCity}</p>
                    <p className="burn-stat-value">{intel.city ?? "—"}</p>
                    <p className="burn-stat-sub">{d.statTimezone}: {intel.timezone ?? "—"}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.statAsn}</p>
                    <p className="burn-stat-value">{intel.asn ?? "—"}</p>
                    <p className="burn-stat-sub">{intel.asName ?? ""}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.statIsp}</p>
                    <p className="burn-stat-value ipc-stat-small">{intel.isp ?? "—"}</p>
                    <p className="burn-stat-sub">{d.statOrg}: {intel.org ?? "—"}</p>
                  </div>
                  <div className="burn-stat">
                    <p className="burn-stat-label">{d.statCoords}</p>
                    <p className="burn-stat-value">
                      {intel.latitude !== null && intel.longitude !== null
                        ? `${intel.latitude.toFixed(2)}, ${intel.longitude.toFixed(2)}`
                        : "—"}
                    </p>
                    <p className="burn-stat-sub">
                      {intel.reverse ? `${d.statReverse}: ${intel.reverse}` : ""}
                    </p>
                  </div>
                  {verdict && (
                    <div className="burn-stat">
                      <p className="burn-stat-label">{d.typeLabel}</p>
                      <p className="burn-stat-value">{d.types[verdict.type]}</p>
                      <p className="burn-stat-sub">
                        {d.scoreLabel.split("（")[0].split(" (")[0]}: {verdict.score} · {d.bands[verdict.band]}
                      </p>
                    </div>
                  )}
                </div>
                {srcNames.length > 0 && (
                  <p className="burn-note">{d.sourceNote.replace("{src}", srcNames.join(" + "))}</p>
                )}
                {payload.errors.ipapi && <p className="burn-note">ip-api: {payload.errors.ipapi}</p>}
              </>
            )}

            {verdict && (
              <div className="ipc-block">
                <h3 className="ipc-sec-title">{d.secVerdict}</h3>
                <div className="ipc-score-row">
                  <div className="ipc-score-num">
                    {verdict.score}
                    <span className={`ipc-band ipc-band-${verdict.band}`}>{d.bands[verdict.band]}</span>
                  </div>
                  <div className="ipc-score-side">
                    <p className="ipc-score-label">{d.scoreLabel}</p>
                    <div className="ipc-bar">
                      <span
                        className={`ipc-bar-fill ipc-band-bg-${verdict.band}`}
                        style={{ width: `${verdict.score}%` }}
                      />
                    </div>
                    <p className="ipc-score-type">
                      {d.typeLabel}：<strong>{d.types[verdict.type]}</strong>
                    </p>
                  </div>
                </div>

                <h4 className="ipc-sub-title">{d.evidenceTitle}</h4>
                <ul className="ipc-evidence">
                  {verdict.typeEvidence.map((e, i) => (
                    <li key={i}>{e[lang]}</li>
                  ))}
                </ul>

                <h4 className="ipc-sub-title">{d.scoreItemsTitle}</h4>
                <div className="burn-table-wrap">
                  <table className="burn-table">
                    <thead>
                      <tr>
                        <th>{d.colRule}</th>
                        <th>{d.colHit}</th>
                        <th>{d.colPoints}</th>
                        <th>{d.evidenceTitle}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verdict.items.map((it) => (
                        <tr key={it.id}>
                          <td>{d.itemNames[it.id]}</td>
                          <td>{it.hit === null ? d.hitNa : it.hit ? d.hitYes : d.hitNo}</td>
                          <td>{it.hit ? (it.points > 0 ? `+${it.points}` : `${it.points}`) : "0"}</td>
                          <td>{it.evidence ? it.evidence[lang] : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 className="ipc-sub-title">{d.nativeTitle}</h4>
                <ul className="ipc-evidence">
                  {verdict.nativeEvidence.map((e, i) => (
                    <li key={i}>{e[lang]}</li>
                  ))}
                </ul>

                <h4 className="ipc-sub-title">{d.secRules}</h4>
                <p className="body-text">{d.rulesIntro}</p>
                <div className="burn-table-wrap">
                  <table className="burn-table">
                    <thead>
                      <tr>
                        <th>{d.colRule}</th>
                        <th>{d.colPoints}</th>
                        <th>{d.evidenceTitle}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.rulesRows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.rule}</td>
                          <td>{r.points}</td>
                          <td>{r.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="burn-note">{d.rulesNote}</p>
              </div>
            )}

            <div className="ipc-block">
              <h3 className="ipc-sec-title">{d.secWhois}</h3>
              {whois ? (
                <>
                  <dl className="ipc-kv">
                    {whois.name && (
                      <div>
                        <dt>{d.whoisLabels.name}</dt>
                        <dd>{whois.name}</dd>
                      </div>
                    )}
                    {whois.org && (
                      <div>
                        <dt>{d.whoisLabels.org}</dt>
                        <dd>{whois.org}</dd>
                      </div>
                    )}
                    {whois.registrar && (
                      <div>
                        <dt>{d.whoisLabels.registrar}</dt>
                        <dd>{whois.registrar}</dd>
                      </div>
                    )}
                    {whois.country && (
                      <div>
                        <dt>{d.whoisLabels.country}</dt>
                        <dd>{whois.country}</dd>
                      </div>
                    )}
                    {whois.range && (
                      <div>
                        <dt>{d.whoisLabels.range}</dt>
                        <dd>{whois.range}</dd>
                      </div>
                    )}
                    {whois.registered && (
                      <div>
                        <dt>{d.whoisLabels.registered}</dt>
                        <dd>{whois.registered}</dd>
                      </div>
                    )}
                    {whois.expires && (
                      <div>
                        <dt>{d.whoisLabels.expires}</dt>
                        <dd>{whois.expires}</dd>
                      </div>
                    )}
                    {whois.status.length > 0 && (
                      <div>
                        <dt>{d.whoisLabels.status}</dt>
                        <dd>{whois.status.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                  {whois.source && (
                    <p className="burn-note">{d.whoisSource.replace("{src}", whois.source)}</p>
                  )}
                </>
              ) : (
                <p className="burn-note">{d.whoisFail}</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* WebRTC：本地 */}
      <section className="card ipc-card">
        <h2>{d.secRtc}</h2>
        <p className="body-text">{d.rtcIntro}</p>
        {rtc.state === "running" ? (
          <p className="burn-note">{d.rtcRunning}</p>
        ) : (
          <>
            {rtc.srflx.length > 0 && (
              <p className="body-text">
                {d.rtcPublic}: <strong>{rtc.srflx.join(", ")}</strong>
              </p>
            )}
            {rtcVerdict && <p className="body-text">{rtcVerdict}</p>}
            {rtc.mdns && <p className="burn-note">{d.rtcMdns}</p>}
          </>
        )}
        <p className="burn-note">{d.rtcLocalOnly}</p>
        <button type="button" className="btn ghost small" onClick={() => void runRtc()}>
          {d.rerun}
        </button>
      </section>

      {/* 浏览器环境：本地 */}
      <section className="card ipc-card">
        <h2>{d.secEnv}</h2>
        <p className="body-text">{d.envIntro}</p>
        <dl className="ipc-kv">
          {env.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd className="ipc-kv-long">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 延迟测试：本地 HTTP 往返 */}
      <section className="card ipc-card">
        <h2>{d.secPing}</h2>
        <p className="body-text">{d.pingIntro}</p>
        <dl className="ipc-kv">
          {pingRows.map((r) => (
            <div key={r.key}>
              <dt>{d.pingEndpoints[r.key]}</dt>
              <dd>
                {r.state === "done" && r.ms !== null
                  ? `${r.ms} ms`
                  : r.state === "fail"
                    ? d.pingFail
                    : r.state === "running"
                      ? d.pingRunning
                      : d.pingPending}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="btn ghost small"
          disabled={pingRunning}
          onClick={() => void runPing()}
        >
          {pingRunning ? d.pingRunning : d.pingRun}
        </button>
      </section>

      {/* 口径与边界 */}
      <div className="burn-notes">
        <div className="card">
          <h2>{d.secNotes}</h2>
          {d.notes.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
