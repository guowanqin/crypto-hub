// 开发者工具箱的纯函数库：全部在浏览器本地运行，不调任何外部接口。
// 实现均为本站原创（MD5 按 RFC 1321 规范实现，哈希 SHA 系列走 WebCrypto）。

/* ---------------- 通用 ---------------- */

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function err<T>(e: unknown): Result<T> {
  return { ok: false, error: e instanceof Error ? e.message : String(e) };
}

/* ---------------- Base64（支持 UTF-8 中文） ---------------- */

export function base64Encode(text: string): Result<string> {
  try {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { ok: true, value: btoa(bin) };
  } catch (e) {
    return err(e);
  }
}

export function base64Decode(b64: string): Result<string> {
  try {
    const clean = b64.replace(/\s+/g, "");
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ok: true, value: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch (e) {
    return { ok: false, error: "invalid-base64" };
  }
}

/* ---------------- URL 编码 ---------------- */

export function urlEncode(text: string): Result<string> {
  try {
    return { ok: true, value: encodeURIComponent(text) };
  } catch (e) {
    return err(e);
  }
}

export function urlDecode(text: string): Result<string> {
  try {
    return { ok: true, value: decodeURIComponent(text.trim()) };
  } catch {
    return { ok: false, error: "invalid-url-encoding" };
  }
}

/* ---------------- Unicode 转义 ---------------- */

/** 把非 ASCII 字符转成 \uXXXX 转义（按 UTF-16 码元，代理对拆成两个转义，与 JS 字符串字面量一致）。 */
export function unicodeEscape(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      out += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      out += text[i];
    }
  }
  return out;
}

/** 还原 \uXXXX 转义序列。 */
export function unicodeUnescape(text: string): Result<string> {
  try {
    const value = text.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    ).replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    return { ok: true, value };
  } catch (e) {
    return err(e);
  }
}

/* ---------------- 十六进制 ↔ 文本 ---------------- */

export function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" ");
}

export function hexToText(hex: string): Result<string> {
  try {
    const clean = hex.replace(/0x/gi, "").replace(/[\s,;:]+/g, "");
    if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) {
      return { ok: false, error: "invalid-hex" };
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    }
    return { ok: true, value: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: "invalid-hex-utf8" };
  }
}

/* ---------------- 进制转换（BigInt，支持大数与 2–36 任意进制） ---------------- */

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

export function convertRadix(input: string, fromBase: number, toBase: number): Result<string> {
  const raw = input.trim().toLowerCase();
  if (!raw) return { ok: false, error: "empty" };
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    return { ok: false, error: "base-range" };
  }
  const negative = raw.startsWith("-");
  const digits = negative ? raw.slice(1) : raw;
  if (!digits) return { ok: false, error: "empty" };
  try {
    const from = BigInt(fromBase);
    let value = BigInt(0);
    for (const ch of digits) {
      const d = DIGITS.indexOf(ch);
      if (d < 0 || d >= fromBase) return { ok: false, error: "invalid-digit" };
      value = value * from + BigInt(d);
    }
    if (value === BigInt(0)) return { ok: true, value: "0" };
    const to = BigInt(toBase);
    let out = "";
    let v = value;
    while (v > BigInt(0)) {
      out = DIGITS[Number(v % to)] + out;
      v = v / to;
    }
    return { ok: true, value: (negative ? "-" : "") + out };
  } catch (e) {
    return err(e);
  }
}

/* ---------------- MD5（RFC 1321） ---------------- */

const MD5_S: number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K: number[] = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)
);

function leftRotate(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

/** MD5 摘要（十六进制小写）。输入先按 UTF-8 编码。 */
export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;

  // 填充：0x80 + 0x00 至长度 ≡ 56 (mod 64)，再接 64 位小端位长
  const paddedLen = (((bytes.length + 8) >> 6) + 1) << 6;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, bitLen >>> 0, true);
  view.setUint32(paddedLen - 4, Math.floor(bitLen / 4294967296) >>> 0, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89 | 0;
  let c0 = 0x98badcfe | 0;
  let d0 = 0x10325476;

  const M = new Int32Array(16);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let j = 0; j < 16; j++) M[j] = view.getInt32(offset + j * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + MD5_K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, MD5_S[i])) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const out = new DataView(new ArrayBuffer(16));
  out.setInt32(0, a0, true);
  out.setInt32(4, b0, true);
  out.setInt32(8, c0, true);
  out.setInt32(12, d0, true);
  return Array.from(new Uint8Array(out.buffer), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

/* ---------------- SHA（WebCrypto） ---------------- */

export async function shaHash(
  algo: "SHA-1" | "SHA-256" | "SHA-512",
  text: string
): Promise<string> {
  const digest = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

/* ---------------- JWT 解码（不验签） ---------------- */

function base64UrlDecode(segment: string): string {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export interface JwtDecoded {
  header: unknown;
  payload: unknown;
  signature: string;
}

export function jwtDecode(token: string): Result<JwtDecoded> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false, error: "jwt-parts" };
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { ok: true, value: { header, payload, signature: parts[2] } };
  } catch {
    return { ok: false, error: "jwt-decode" };
  }
}

/* ---------------- 密码强度 ---------------- */

export interface PasswordStrength {
  length: number;
  classes: number; // 命中的字符类数量（小写/大写/数字/符号）
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  entropy: number; // 估算熵（bit），= 长度 × log2(字符池大小)
  level: 0 | 1 | 2 | 3 | 4;
}

export function passwordStrength(pw: string): PasswordStrength {
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSymbol) pool += 33;
  const entropy = pool > 0 ? Math.round(pw.length * Math.log2(pool)) : 0;
  let level: PasswordStrength["level"] = 0;
  if (entropy >= 28) level = 1;
  if (entropy >= 50) level = 2;
  if (entropy >= 75) level = 3;
  if (entropy >= 110) level = 4;
  return {
    length: pw.length,
    classes,
    hasLower,
    hasUpper,
    hasDigit,
    hasSymbol,
    entropy,
    level,
  };
}

/* ---------------- 随机与生成 ---------------- */

function randomIntBelow(maxExclusive: number): number {
  // 拒绝采样，避免取模偏差
  const max = 0xffffffff;
  const limit = max - (max % maxExclusive);
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % maxExclusive;
}

export function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
}

export function generatePassword(opts: PasswordOptions): Result<string> {
  let charset = "";
  if (opts.lower) charset += "abcdefghijklmnopqrstuvwxyz";
  if (opts.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.digits) charset += "0123456789";
  if (opts.symbols) charset += "!@#$%^&*()-_=+[]{}<>?";
  if (!charset) return { ok: false, error: "charset-empty" };
  if (opts.length < 1 || opts.length > 256) return { ok: false, error: "length-range" };
  let out = "";
  for (let i = 0; i < opts.length; i++) {
    out += charset[randomIntBelow(charset.length)];
  }
  return { ok: true, value: out };
}

export function generateRandomNumbers(
  min: number,
  max: number,
  count: number,
  integer: boolean
): Result<number[]> {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return { ok: false, error: "range" };
  }
  if (count < 1 || count > 1000) return { ok: false, error: "count-range" };
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    if (integer) {
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      if (hi < lo) return { ok: false, error: "range" };
      out.push(lo + randomIntBelow(hi - lo + 1));
    } else {
      out.push(Math.round((min + Math.random() * (max - min)) * 1e6) / 1e6);
    }
  }
  return { ok: true, value: out };
}

/* ---------------- JSON 格式化 / 压缩 / 校验 ---------------- */

export interface JsonError {
  message: string;
  position?: number;
  line?: number;
  column?: number;
}

/** 轻量 JSON 语法扫描：返回首个语法错误的位置（字符下标），合法时返回 -1。
 *  新版 V8 的 JSON.parse 报错不再带 position，用它兜底定位。 */
export function findJsonError(text: string): number {
  let i = 0;
  const n = text.length;
  const ws = () => {
    while (i < n && (text[i] === " " || text[i] === "\t" || text[i] === "\n" || text[i] === "\r")) i++;
  };
  function parseString(): boolean {
    // text[i] === '"'
    i++;
    while (i < n) {
      const c = text[i];
      if (c === '"') {
        i++;
        return true;
      }
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c < " ") return false;
      i++;
    }
    return false;
  }
  function parseNumber(): boolean {
    const re = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/y;
    re.lastIndex = i;
    const m = re.exec(text);
    if (!m || m.index !== i) return false;
    i += m[0].length;
    return true;
  }
  function parseLiteral(word: string): boolean {
    if (text.startsWith(word, i)) {
      i += word.length;
      return true;
    }
    return false;
  }
  function parseValue(): boolean {
    ws();
    if (i >= n) return false;
    const c = text[i];
    if (c === "{") return parseObject();
    if (c === "[") return parseArray();
    if (c === '"') return parseString();
    if (c === "t") return parseLiteral("true");
    if (c === "f") return parseLiteral("false");
    if (c === "n") return parseLiteral("null");
    return parseNumber();
  }
  function parseObject(): boolean {
    i++; // {
    ws();
    if (text[i] === "}") {
      i++;
      return true;
    }
    for (;;) {
      ws();
      if (text[i] !== '"' || !parseString()) return false;
      ws();
      if (text[i] !== ":") return false;
      i++;
      if (!parseValue()) return false;
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "}") {
        i++;
        return true;
      }
      return false;
    }
  }
  function parseArray(): boolean {
    i++; // [
    ws();
    if (text[i] === "]") {
      i++;
      return true;
    }
    for (;;) {
      if (!parseValue()) return false;
      ws();
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "]") {
        i++;
        return true;
      }
      return false;
    }
  }
  if (!parseValue()) return i;
  ws();
  return i < n ? i : -1;
}

export function jsonProcess(
  text: string,
  mode: "format" | "minify" | "validate"
): { ok: true; value: string } | { ok: false; error: JsonError } {
  try {
    const parsed = JSON.parse(text);
    if (mode === "validate") return { ok: true, value: "valid" };
    return {
      ok: true,
      value: mode === "format" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const m = /position\s+(\d+)/i.exec(message);
    let position: number | undefined;
    if (m) {
      position = parseInt(m[1], 10);
    } else {
      const found = findJsonError(text);
      if (found >= 0) position = found;
    }
    if (position !== undefined) {
      const before = text.slice(0, position);
      const line = before.split("\n").length;
      const column = position - before.lastIndexOf("\n");
      return { ok: false, error: { message, position, line, column } };
    }
    return { ok: false, error: { message } };
  }
}

/* ---------------- 时间戳 ---------------- */

export function formatDateTime(d: Date): { local: string; iso: string } {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  const local = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  return { local, iso: d.toISOString() };
}

export function timestampToDate(ts: number, unit: "s" | "ms"): Result<{ local: string; iso: string }> {
  if (!Number.isFinite(ts)) return { ok: false, error: "nan" };
  const ms = unit === "s" ? ts * 1000 : ts;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return { ok: false, error: "invalid-date" };
  return { ok: true, value: formatDateTime(d) };
}

/** 猜测时间戳单位：绝对值 ≥ 1e12 视为毫秒，否则视为秒。 */
export function guessTsUnit(ts: number): "s" | "ms" {
  return Math.abs(ts) >= 1e12 ? "ms" : "s";
}

/* ---------------- 颜色转换 ---------------- */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Result<Rgb> {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return { ok: false, error: "invalid-hex-color" };
  return {
    ok: true,
    value: {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    },
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let rp = 0, gp = 0, bp = 0;
  if (hn < 60) [rp, gp, bp] = [c, x, 0];
  else if (hn < 120) [rp, gp, bp] = [x, c, 0];
  else if (hn < 180) [rp, gp, bp] = [0, c, x];
  else if (hn < 240) [rp, gp, bp] = [0, x, c];
  else if (hn < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/* ---------------- 单位换算 ---------------- */

export interface UnitDef {
  id: string;
  label: Record<"zh" | "tw" | "en", string>;
  /** 换算到基准单位的倍率 */
  factor: number;
}

export interface UnitCategory {
  id: string;
  label: Record<"zh" | "tw" | "en", string>;
  units: UnitDef[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: { zh: "长度", en: "Length",
    tw: "長度" },
    units: [
      { id: "mm", label: { zh: "毫米 mm", en: "Millimeter (mm)",
      tw: "毫米 mm" }, factor: 0.001 },
      { id: "cm", label: { zh: "厘米 cm", en: "Centimeter (cm)",
      tw: "釐米 cm" }, factor: 0.01 },
      { id: "m", label: { zh: "米 m", en: "Meter (m)",
      tw: "米 m" }, factor: 1 },
      { id: "km", label: { zh: "千米 km", en: "Kilometer (km)",
      tw: "千米 km" }, factor: 1000 },
      { id: "in", label: { zh: "英寸 in", en: "Inch (in)",
      tw: "英寸 in" }, factor: 0.0254 },
      { id: "ft", label: { zh: "英尺 ft", en: "Foot (ft)",
      tw: "英尺 ft" }, factor: 0.3048 },
      { id: "yd", label: { zh: "码 yd", en: "Yard (yd)",
      tw: "碼 yd" }, factor: 0.9144 },
      { id: "mi", label: { zh: "英里 mi", en: "Mile (mi)",
      tw: "英里 mi" }, factor: 1609.344 },
    ],
  },
  {
    id: "weight",
    label: { zh: "重量", en: "Weight",
    tw: "重量" },
    units: [
      { id: "mg", label: { zh: "毫克 mg", en: "Milligram (mg)",
      tw: "毫克 mg" }, factor: 0.001 },
      { id: "g", label: { zh: "克 g", en: "Gram (g)",
      tw: "克 g" }, factor: 1 },
      { id: "kg", label: { zh: "千克 kg", en: "Kilogram (kg)",
      tw: "千克 kg" }, factor: 1000 },
      { id: "t", label: { zh: "吨 t", en: "Tonne (t)",
      tw: "噸 t" }, factor: 1_000_000 },
      { id: "oz", label: { zh: "盎司 oz", en: "Ounce (oz)",
      tw: "盎司 oz" }, factor: 28.349523125 },
      { id: "lb", label: { zh: "磅 lb", en: "Pound (lb)",
      tw: "磅 lb" }, factor: 453.59237 },
    ],
  },
  {
    id: "data",
    label: { zh: "数据容量（1024 进制）", en: "Data size (1024-based)",
    tw: "資料容量（1024 進位制）" },
    units: [
      { id: "bit", label: { zh: "比特 bit", en: "Bit",
      tw: "位元 bit" }, factor: 1 },
      { id: "B", label: { zh: "字节 B", en: "Byte (B)",
      tw: "位元組 B" }, factor: 8 },
      { id: "KB", label: { zh: "KB", en: "KB",
      tw: "KB" }, factor: 8 * 1024 },
      { id: "MB", label: { zh: "MB", en: "MB",
      tw: "MB" }, factor: 8 * 1024 ** 2 },
      { id: "GB", label: { zh: "GB", en: "GB",
      tw: "GB" }, factor: 8 * 1024 ** 3 },
      { id: "TB", label: { zh: "TB", en: "TB",
      tw: "TB" }, factor: 8 * 1024 ** 4 },
      { id: "PB", label: { zh: "PB", en: "PB",
      tw: "PB" }, factor: 8 * 1024 ** 5 },
    ],
  },
];

export function convertUnit(value: number, from: UnitDef, to: UnitDef): number {
  return (value * from.factor) / to.factor;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "-";
  if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(6);
  return String(Math.round(n * 1e10) / 1e10);
}

/* ---------------- 文本工具 ---------------- */

export interface TextStats {
  chars: number; // 全部字符（按码元计）
  charsNoSpace: number;
  chineseChars: number;
  englishWords: number;
  lines: number;
  paragraphs: number;
}

export function textStats(text: string): TextStats {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
  const englishWords = (text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
  return { chars, charsNoSpace, chineseChars, englishWords, lines, paragraphs };
}

export function convertCase(text: string, mode: string): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "capitalize": // 每句首字母大写（按 . ! ? 分隔，粗略实现）
      return text.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, (m) => m.toUpperCase());
    case "title": // 每个单词首字母大写
      return text.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
    case "camel": {
      const words = splitWords(text);
      return words.map((w, i) => (i === 0 ? w : capitalizeWord(w))).join("");
    }
    case "pascal": {
      return splitWords(text).map(capitalizeWord).join("");
    }
    case "snake": {
      return splitWords(text).join("_");
    }
    case "kebab": {
      return splitWords(text).join("-");
    }
    default:
      return text;
  }
}

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function capitalizeWord(w: string): string {
  return w ? w[0].toUpperCase() + w.slice(1) : w;
}

export type LineOp = "dedupe" | "sortAsc" | "sortDesc" | "removeEmpty" | "reverse" | "trim";

export function processLines(text: string, op: LineOp): string {
  let lines = text.split("\n");
  switch (op) {
    case "dedupe": {
      const seen = new Set<string>();
      lines = lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
      break;
    }
    case "sortAsc":
      lines = [...lines].sort((a, b) => a.localeCompare(b));
      break;
    case "sortDesc":
      lines = [...lines].sort((a, b) => b.localeCompare(a));
      break;
    case "removeEmpty":
      lines = lines.filter((l) => l.trim() !== "");
      break;
    case "reverse":
      lines = [...lines].reverse();
      break;
    case "trim":
      lines = lines.map((l) => l.trim());
      break;
  }
  return lines.join("\n");
}

/* ---------------- 文本对比（按行 LCS diff） ---------------- */

export type DiffLineType = "same" | "add" | "remove";
export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export function diffLines(a: string, b: string): DiffLine[] {
  const A = a === "" ? [] : a.split("\n");
  const B = b === "" ? [] : b.split("\n");
  // 规模保护：行数过大时退化为整段增删，避免 O(n·m) 爆炸
  if (A.length > 800 || B.length > 800 || A.length * B.length > 640000) {
    return [
      ...A.map((text) => ({ type: "remove" as const, text })),
      ...B.map((text) => ({ type: "add" as const, text })),
    ];
  }
  const n = A.length, m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ type: "same", text: A[i] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "remove", text: A[i] });
      i++;
    } else {
      out.push({ type: "add", text: B[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "remove", text: A[i++] });
  while (j < m) out.push({ type: "add", text: B[j++] });
  return out;
}

/* ---------------- URL 参数解析 ---------------- */

export interface ParsedUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  params: [string, string][];
}

export function parseUrl(raw: string): Result<ParsedUrl> {
  try {
    const u = new URL(raw.trim());
    return {
      ok: true,
      value: {
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash,
        params: Array.from(u.searchParams.entries()),
      },
    };
  } catch {
    return { ok: false, error: "invalid-url" };
  }
}

export function buildUrl(base: ParsedUrl, params: [string, string][]): string {
  const origin = `${base.protocol}//${base.host}`;
  const qs = new URLSearchParams();
  for (const [k, v] of params) {
    if (k !== "") qs.append(k, v);
  }
  const q = qs.toString();
  return `${origin}${base.pathname}${q ? `?${q}` : ""}${base.hash}`;
}
