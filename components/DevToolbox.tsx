"use client";

// 开发者工具箱本体：20 件纯前端小工具，分 5 组，全部在浏览器本地运行。
// 语言跟随全站 LangProvider（不在此处另设语言切换）。功能与交互参考 it-tools 的工具盘点，实现与文案均为本站原创。
import { useEffect, useMemo, useState } from "react";
import { useLang } from "./LangProvider";
import type { Lang } from "@/lib/site";
import * as DT from "@/lib/devtools";

/* ---------------- 通用小组件 ---------------- */

function useL() {
  const { lang } = useLang();
  return (zh: string, en: string) => (lang === "zh" ? zh : en);
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const L = useL();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn small ghost"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* 剪贴板不可用时静默失败，用户可手动选中复制 */
        }
      }}
    >
      {copied ? L("已复制 ✓", "Copied ✓") : (label ?? L("复制", "Copy"))}
    </button>
  );
}

function OutBox({ value, rows = 4 }: { value: string; rows?: number }) {
  return (
    <div className="dt-outwrap">
      <textarea className="dt-ta dt-out" readOnly rows={rows} value={value} />
      <div className="dt-outtools">
        <CopyBtn text={value} />
      </div>
    </div>
  );
}

function ErrLine({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="error dt-err">{msg}</p>;
}

function ModeTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="dt-modes">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`dt-mode${value === o.id ? " on" : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- 1. Base64 ---------------- */

function Base64Tool() {
  const L = useL();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    const r = mode === "encode" ? DT.base64Encode(input) : DT.base64Decode(input);
    return r.ok
      ? { out: r.value, err: "" }
      : { out: "", err: L("解码失败：不是合法的 Base64（或解出内容不是 UTF-8 文本）", "Decode failed: not valid Base64 (or the result is not UTF-8 text)") };
  }, [input, mode, L]);
  return (
    <div>
      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "encode", label: L("编码 →", "Encode →") },
          { id: "decode", label: L("← 解码", "← Decode") },
        ]}
      />
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? L("输入任意文本（支持中文）", "Type any text (UTF-8 supported)") : "Base64…"}
      />
      <OutBox value={result.out} />
      <ErrLine msg={result.err} />
    </div>
  );
}

/* ---------------- 2. URL 编码 ---------------- */

function UrlCodecTool() {
  const L = useL();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    const r = mode === "encode" ? DT.urlEncode(input) : DT.urlDecode(input);
    return r.ok
      ? { out: r.value, err: "" }
      : { out: "", err: L("解码失败：% 转义序列不合法", "Decode failed: invalid % escape sequence") };
  }, [input, mode, L]);
  return (
    <div>
      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "encode", label: L("编码 →", "Encode →") },
          { id: "decode", label: L("← 解码", "← Decode") },
        ]}
      />
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "https://example.com/搜索?q=中文" : "https%3A%2F%2Fexample.com%2F…"}
      />
      <OutBox value={result.out} />
      <ErrLine msg={result.err} />
    </div>
  );
}

/* ---------------- 3. Unicode 转义 ---------------- */

function UnicodeTool() {
  const L = useL();
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [input, setInput] = useState("");
  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    if (mode === "escape") return { out: DT.unicodeEscape(input), err: "" };
    const r = DT.unicodeUnescape(input);
    return r.ok ? { out: r.value, err: "" } : { out: "", err: L("还原失败", "Unescape failed") };
  }, [input, mode, L]);
  return (
    <div>
      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "escape", label: L("转义 →", "Escape →") },
          { id: "unescape", label: L("← 还原", "← Unescape") },
        ]}
      />
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "escape" ? L("输入含中文的文本", "Text with non-ASCII characters") : "\\u4e2d\\u6587"}
      />
      <OutBox value={result.out} />
      <ErrLine msg={result.err} />
    </div>
  );
}

/* ---------------- 4. 进制转换 ---------------- */

const RADIX_BASES = [2, 8, 10, 16, 36];

function RadixTool() {
  const L = useL();
  const [input, setInput] = useState("255");
  const [from, setFrom] = useState(10);
  const results = useMemo(() => {
    if (!input.trim()) return null;
    return RADIX_BASES.map((b) => {
      const r = DT.convertRadix(input, from, b);
      return { base: b, value: r.ok ? r.value : null, error: r.ok ? "" : r.error };
    });
  }, [input, from]);
  const errMsg = results?.find((r) => r.error)?.error
    ? L("输入不合法：含超出所选进制的数字或字符", "Invalid input: digit out of range for the selected base")
    : "";
  return (
    <div>
      <div className="dt-row">
        <input
          className="dt-in dt-grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={L("输入数字（支持任意大整数）", "Enter a number (arbitrary precision)")}
        />
        <select className="dt-sel" value={from} onChange={(e) => setFrom(Number(e.target.value))}>
          {RADIX_BASES.map((b) => (
            <option key={b} value={b}>
              {b} {L("进制", "base")}
            </option>
          ))}
        </select>
      </div>
      <ErrLine msg={errMsg} />
      <div className="dt-kv">
        {results?.map((r) => (
          <div className="dt-kv-row" key={r.base}>
            <span className="dt-kv-k">
              {r.base} {L("进制", "base")}
            </span>
            <code className="dt-kv-v">{r.value ?? "—"}</code>
            {r.value ? <CopyBtn text={r.value} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 5. Hex ↔ 文本 ---------------- */

function HexTool() {
  const L = useL();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    if (mode === "encode") return { out: DT.textToHex(input), err: "" };
    const r = DT.hexToText(input);
    return r.ok
      ? { out: r.value, err: "" }
      : { out: "", err: L("解码失败：十六进制格式不合法或不是 UTF-8 文本", "Decode failed: invalid hex or not UTF-8 text") };
  }, [input, mode, L]);
  return (
    <div>
      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "encode", label: L("文本 → Hex", "Text → Hex") },
          { id: "decode", label: L("Hex → 文本", "Hex → Text") },
        ]}
      />
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? L("输入文本（按 UTF-8 字节转十六进制）", "Text (encoded as UTF-8 bytes)") : "e4 bd a0 e5 a5 bd"}
      />
      <OutBox value={result.out} />
      <ErrLine msg={result.err} />
    </div>
  );
}

/* ---------------- 6. 哈希计算 ---------------- */

function HashTool() {
  const L = useL();
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    if (!input) {
      setHashes({});
      return;
    }
    const md5v = DT.md5(input);
    Promise.all([
      DT.shaHash("SHA-1", input),
      DT.shaHash("SHA-256", input),
      DT.shaHash("SHA-512", input),
    ]).then(([s1, s256, s512]) => {
      if (alive) setHashes({ MD5: md5v, "SHA-1": s1, "SHA-256": s256, "SHA-512": s512 });
    });
    return () => {
      alive = false;
    };
  }, [input]);
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={L("输入要计算哈希的文本", "Text to hash")}
      />
      <div className="dt-kv">
        {["MD5", "SHA-1", "SHA-256", "SHA-512"].map((name) => (
          <div className="dt-kv-row" key={name}>
            <span className="dt-kv-k">{name}</span>
            <code className="dt-kv-v">{hashes[name] ?? "—"}</code>
            {hashes[name] ? <CopyBtn text={hashes[name]} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 7. JWT 解码 ---------------- */

function JwtTool() {
  const L = useL();
  const [input, setInput] = useState("");
  const result = useMemo(() => {
    if (!input.trim()) return null;
    const r = DT.jwtDecode(input);
    if (!r.ok) {
      return {
        err:
          r.error === "jwt-parts"
            ? L("格式不对：JWT 应是三段以点分隔的字符串", "Invalid format: a JWT has three dot-separated parts")
            : L("解码失败：header / payload 不是合法的 Base64Url JSON", "Decode failed: header / payload are not valid Base64Url JSON"),
        header: "",
        payload: "",
      };
    }
    return {
      err: "",
      header: JSON.stringify(r.value.header, null, 2),
      payload: JSON.stringify(r.value.payload, null, 2),
    };
  }, [input, L]);
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="eyJhbGciOi…"
      />
      <ErrLine msg={result?.err ?? ""} />
      {result && !result.err && (
        <>
          <p className="dt-label">Header</p>
          <OutBox value={result.header} rows={3} />
          <p className="dt-label">Payload</p>
          <OutBox value={result.payload} rows={6} />
        </>
      )}
      <p className="privacy-note">
        {L(
          "只解码不验签：签名是否有效请以发证方的公钥/密钥在后端校验，这里看到的内容任何人都能伪造，不要据此信任 token。",
          "Decoding only — no signature verification. Anyone can forge what you see here; always verify signatures server-side with the issuer's key."
        )}
      </p>
    </div>
  );
}

/* ---------------- 8. 密码强度 ---------------- */

const PW_LEVELS = [
  { zh: "很弱", en: "Very weak", color: "#dc2626" },
  { zh: "弱", en: "Weak", color: "#ea580c" },
  { zh: "中等", en: "Fair", color: "#ca8a04" },
  { zh: "强", en: "Strong", color: "#65a30d" },
  { zh: "很强", en: "Very strong", color: "#059669" },
];

function PasswordStrengthTool() {
  const { lang } = useLang();
  const L = useL();
  const [input, setInput] = useState("");
  const s = useMemo(() => DT.passwordStrength(input), [input]);
  const lv = PW_LEVELS[s.level];
  return (
    <div>
      <input
        className="dt-in dt-grow dt-full"
        type="text"
        autoComplete="off"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={L("输入要检测的密码（不会上传）", "Type a password to check (never uploaded)")}
      />
      {input && (
        <>
          <div className="dt-meter">
            <div
              className="dt-meter-fill"
              style={{ width: `${((s.level + 1) / 5) * 100}%`, background: lv.color }}
            />
          </div>
          <div className="dt-kv">
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("等级", "Level")}</span>
              <span className="dt-kv-v" style={{ color: lv.color, fontWeight: 700 }}>
                {lang === "zh" ? lv.zh : lv.en}
              </span>
            </div>
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("长度", "Length")}</span>
              <span className="dt-kv-v">{s.length}</span>
            </div>
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("字符类", "Char classes")}</span>
              <span className="dt-kv-v">
                {s.classes}/4（{L("小写", "lower")} {s.hasLower ? "✓" : "✗"} · {L("大写", "upper")} {s.hasUpper ? "✓" : "✗"} · {L("数字", "digit")} {s.hasDigit ? "✓" : "✗"} · {L("符号", "symbol")} {s.hasSymbol ? "✓" : "✗"}）
              </span>
            </div>
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("熵估算", "Entropy est.")}</span>
              <span className="dt-kv-v">≈ {s.entropy} bit</span>
            </div>
          </div>
          <p className="privacy-note">
            {L(
              "熵是按字符集大小的理论估算，不代表真实安全性：含生日、姓名、常见词的密码再长也容易被字典猜中。",
              "Entropy is a theoretical estimate from the character pool — it is not a security guarantee. Passwords containing birthdays, names or common words fall to dictionary attacks however long they are."
            )}
          </p>
        </>
      )}
    </div>
  );
}

/* ---------------- 9. UUID 生成 ---------------- */

function UuidTool() {
  const L = useL();
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>([]);
  const gen = (n: number) =>
    setList(Array.from({ length: Math.min(50, Math.max(1, n || 1)) }, () => DT.uuidV4()));
  useEffect(() => {
    gen(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div className="dt-row">
        <label className="dt-field">
          {L("数量", "Count")}
          <input
            className="dt-in dt-num"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <button type="button" className="btn primary" onClick={() => gen(count)}>
          {L("生成", "Generate")}
        </button>
        <CopyBtn text={list.join("\n")} label={L("复制全部", "Copy all")} />
      </div>
      <OutBox value={list.join("\n")} rows={6} />
    </div>
  );
}

/* ---------------- 10. 随机密码生成 ---------------- */

function RandomPasswordTool() {
  const L = useL();
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const gen = () => {
    const r = DT.generatePassword({ length, lower, upper, digits, symbols });
    if (r.ok) {
      setOutput(r.value);
      setErr("");
    } else {
      setErr(L("至少勾选一类字符", "Select at least one character class"));
    }
  };
  useEffect(() => {
    gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div className="dt-row dt-wrap">
        <label className="dt-field">
          {L("长度", "Length")}
          <input
            className="dt-in dt-num"
            type="number"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </label>
        <label className="dt-check">
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> a-z
        </label>
        <label className="dt-check">
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> A-Z
        </label>
        <label className="dt-check">
          <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} /> 0-9
        </label>
        <label className="dt-check">
          <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} /> {L("符号", "Symbols")}
        </label>
        <button type="button" className="btn primary" onClick={gen}>
          {L("生成", "Generate")}
        </button>
      </div>
      <ErrLine msg={err} />
      <OutBox value={output} rows={2} />
      <p className="privacy-note">
        {L("用 crypto.getRandomValues 生成，密码只出现在你的屏幕上。", "Generated with crypto.getRandomValues — the password only ever exists on your screen.")}
      </p>
    </div>
  );
}

/* ---------------- 11. 随机数生成 ---------------- */

function RandomNumberTool() {
  const L = useL();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [integer, setInteger] = useState(true);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const gen = () => {
    const r = DT.generateRandomNumbers(min, max, count, integer);
    if (r.ok) {
      setOutput(r.value.join("\n"));
      setErr("");
    } else {
      setOutput("");
      setErr(L("参数不合法：需要最大值 > 最小值、数量 1–1000", "Invalid parameters: max must exceed min, count 1–1000"));
    }
  };
  return (
    <div>
      <div className="dt-row dt-wrap">
        <label className="dt-field">
          {L("最小", "Min")}
          <input className="dt-in dt-num" type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
        </label>
        <label className="dt-field">
          {L("最大", "Max")}
          <input className="dt-in dt-num" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
        </label>
        <label className="dt-field">
          {L("数量", "Count")}
          <input className="dt-in dt-num" type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label className="dt-check">
          <input type="checkbox" checked={integer} onChange={(e) => setInteger(e.target.checked)} /> {L("整数", "Integers")}
        </label>
        <button type="button" className="btn primary" onClick={gen}>
          {L("生成", "Generate")}
        </button>
      </div>
      <ErrLine msg={err} />
      <OutBox value={output} rows={6} />
    </div>
  );
}

/* ---------------- 12. JSON 工具 ---------------- */

function JsonTool() {
  const L = useL();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const run = (mode: "format" | "minify" | "validate") => {
    const r = DT.jsonProcess(input, mode);
    if (r.ok) {
      setErr("");
      if (mode === "validate") {
        setOutput("");
        setOkMsg(L("✓ 合法 JSON", "✓ Valid JSON"));
      } else {
        setOkMsg("");
        setOutput(r.value);
      }
    } else {
      setOkMsg("");
      setOutput("");
      const e = (r as { error: DT.JsonError }).error;
      setErr(
        e.line
          ? `${L("语法错误", "Syntax error")}：${L("第", "line")} ${e.line} ${L("行第", ", column")} ${e.column} ${L("列附近", "")} — ${e.message}`
          : `${L("语法错误", "Syntax error")}：${e.message}`
      );
    }
  };
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"name":"18btc","tools":20}'
      />
      <div className="dt-row">
        <button type="button" className="btn primary" onClick={() => run("format")}>
          {L("格式化", "Format")}
        </button>
        <button type="button" className="btn" onClick={() => run("minify")}>
          {L("压缩", "Minify")}
        </button>
        <button type="button" className="btn" onClick={() => run("validate")}>
          {L("校验", "Validate")}
        </button>
      </div>
      {okMsg && <p className="ok">{okMsg}</p>}
      <ErrLine msg={err} />
      {output && <OutBox value={output} rows={8} />}
    </div>
  );
}

/* ---------------- 13. 时间戳转换 ---------------- */

function TimestampTool() {
  const L = useL();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const [tsInput, setTsInput] = useState("");
  const [unit, setUnit] = useState<"auto" | "s" | "ms">("auto");
  const [dtInput, setDtInput] = useState("");
  const tsResult = useMemo(() => {
    if (!tsInput.trim()) return null;
    const num = Number(tsInput.trim());
    if (!Number.isFinite(num)) return { err: L("不是合法数字", "Not a valid number") };
    const u = unit === "auto" ? DT.guessTsUnit(num) : unit;
    const r = DT.timestampToDate(num, u);
    if (!r.ok) return { err: L("超出可表示的日期范围", "Out of representable date range") };
    return { local: r.value.local, iso: r.value.iso, unitUsed: u };
  }, [tsInput, unit, L]);
  const dtResult = useMemo(() => {
    if (!dtInput) return null;
    const d = new Date(dtInput);
    if (Number.isNaN(d.getTime())) return null;
    return { s: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }, [dtInput]);
  return (
    <div>
      <div className="dt-kv">
        <div className="dt-kv-row">
          <span className="dt-kv-k">{L("当前时间戳（秒）", "Now (seconds)")}</span>
          <code className="dt-kv-v">{now ? Math.floor(now.getTime() / 1000) : "—"}</code>
          {now && <CopyBtn text={String(Math.floor(now.getTime() / 1000))} />}
        </div>
        <div className="dt-kv-row">
          <span className="dt-kv-k">{L("当前时间戳（毫秒）", "Now (milliseconds)")}</span>
          <code className="dt-kv-v">{now ? now.getTime() : "—"}</code>
          {now && <CopyBtn text={String(now.getTime())} />}
        </div>
      </div>
      <p className="dt-label">{L("时间戳 → 日期", "Timestamp → Date")}</p>
      <div className="dt-row">
        <input
          className="dt-in dt-grow"
          value={tsInput}
          onChange={(e) => setTsInput(e.target.value)}
          placeholder="1700000000"
        />
        <select className="dt-sel" value={unit} onChange={(e) => setUnit(e.target.value as "auto" | "s" | "ms")}>
          <option value="auto">{L("自动识别", "Auto")}</option>
          <option value="s">{L("秒", "Seconds")}</option>
          <option value="ms">{L("毫秒", "Milliseconds")}</option>
        </select>
      </div>
      {tsResult && "err" in tsResult && <ErrLine msg={tsResult.err ?? ""} />}
      {tsResult && "local" in tsResult && (
        <div className="dt-kv">
          <div className="dt-kv-row">
            <span className="dt-kv-k">
              {L("本地时间", "Local")}（{tsResult.unitUsed === "s" ? L("按秒", "as seconds") : L("按毫秒", "as ms")}）
            </span>
            <code className="dt-kv-v">{tsResult.local}</code>
            <CopyBtn text={tsResult.local ?? ""} />
          </div>
          <div className="dt-kv-row">
            <span className="dt-kv-k">ISO 8601 (UTC)</span>
            <code className="dt-kv-v">{tsResult.iso}</code>
            <CopyBtn text={tsResult.iso ?? ""} />
          </div>
        </div>
      )}
      <p className="dt-label">{L("日期 → 时间戳", "Date → Timestamp")}</p>
      <input
        className="dt-in dt-full"
        type="datetime-local"
        step={1}
        value={dtInput}
        onChange={(e) => setDtInput(e.target.value)}
      />
      {dtResult && (
        <div className="dt-kv">
          <div className="dt-kv-row">
            <span className="dt-kv-k">{L("秒", "Seconds")}</span>
            <code className="dt-kv-v">{dtResult.s}</code>
            <CopyBtn text={String(dtResult.s)} />
          </div>
          <div className="dt-kv-row">
            <span className="dt-kv-k">{L("毫秒", "Milliseconds")}</span>
            <code className="dt-kv-v">{dtResult.ms}</code>
            <CopyBtn text={String(dtResult.ms)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 14. 颜色转换 ---------------- */

function ColorTool() {
  const L = useL();
  const [rgb, setRgb] = useState<DT.Rgb>({ r: 184, g: 145, b: 43 });
  const [hexText, setHexText] = useState("#b8912b");
  const [hexErr, setHexErr] = useState("");
  const hsl = DT.rgbToHsl(rgb);
  const hex = DT.rgbToHex(rgb);
  const onHex = (v: string) => {
    setHexText(v);
    const r = DT.hexToRgb(v);
    if (r.ok) {
      setRgb(r.value);
      setHexErr("");
    } else if (v.trim().length >= 4) {
      setHexErr(L("不是合法的 HEX 颜色（#RGB 或 #RRGGBB）", "Invalid HEX color (#RGB or #RRGGBB)"));
    } else {
      setHexErr("");
    }
  };
  const setChannel = (k: "r" | "g" | "b", v: number) => {
    const next = { ...rgb, [k]: Math.max(0, Math.min(255, v || 0)) };
    setRgb(next);
    setHexText(DT.rgbToHex(next));
  };
  return (
    <div>
      <div className="dt-row">
        <div className="dt-swatch" style={{ background: hex }} />
        <input className="dt-in dt-grow" value={hexText} onChange={(e) => onHex(e.target.value)} placeholder="#b8912b" />
      </div>
      <ErrLine msg={hexErr} />
      {(["r", "g", "b"] as const).map((k) => (
        <div className="dt-row" key={k}>
          <span className="dt-kv-k" style={{ width: 24 }}>{k.toUpperCase()}</span>
          <input
            type="range"
            min={0}
            max={255}
            value={rgb[k]}
            onChange={(e) => setChannel(k, Number(e.target.value))}
            className="dt-grow"
          />
          <input
            className="dt-in dt-num"
            type="number"
            min={0}
            max={255}
            value={rgb[k]}
            onChange={(e) => setChannel(k, Number(e.target.value))}
          />
        </div>
      ))}
      <div className="dt-kv">
        <div className="dt-kv-row">
          <span className="dt-kv-k">HEX</span>
          <code className="dt-kv-v">{hex}</code>
          <CopyBtn text={hex} />
        </div>
        <div className="dt-kv-row">
          <span className="dt-kv-k">RGB</span>
          <code className="dt-kv-v">{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</code>
          <CopyBtn text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
        </div>
        <div className="dt-kv-row">
          <span className="dt-kv-k">HSL</span>
          <code className="dt-kv-v">{`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}</code>
          <CopyBtn text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- 15. 单位换算 ---------------- */

function UnitTool() {
  const { lang } = useLang();
  const [catId, setCatId] = useState("length");
  const cat = DT.UNIT_CATEGORIES.find((c) => c.id === catId) ?? DT.UNIT_CATEGORIES[0];
  const [value, setValue] = useState("1");
  const [fromId, setFromId] = useState(cat.units[2].id);
  const [toId, setToId] = useState(cat.units[3].id);
  const switchCat = (id: string) => {
    const c = DT.UNIT_CATEGORIES.find((x) => x.id === id) ?? DT.UNIT_CATEGORIES[0];
    setCatId(id);
    setFromId(c.units[0].id);
    setToId(c.units[Math.min(2, c.units.length - 1)].id);
  };
  const from = cat.units.find((u) => u.id === fromId) ?? cat.units[0];
  const to = cat.units.find((u) => u.id === toId) ?? cat.units[1];
  const num = Number(value);
  const result = value.trim() !== "" && Number.isFinite(num) ? DT.convertUnit(num, from, to) : null;
  return (
    <div>
      <div className="dt-row dt-wrap">
        <select className="dt-sel" value={catId} onChange={(e) => switchCat(e.target.value)}>
          {DT.UNIT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label[lang]}
            </option>
          ))}
        </select>
        <input className="dt-in dt-num dt-grow" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div className="dt-row">
        <select className="dt-sel dt-grow" value={fromId} onChange={(e) => setFromId(e.target.value)}>
          {cat.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label[lang]}
            </option>
          ))}
        </select>
        <span className="mapping-arrow">→</span>
        <select className="dt-sel dt-grow" value={toId} onChange={(e) => setToId(e.target.value)}>
          {cat.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label[lang]}
            </option>
          ))}
        </select>
      </div>
      <div className="dt-result">
        {result !== null ? (
          <>
            <code>
              {DT.formatNumber(num)} {from.id} = {DT.formatNumber(result)} {to.id}
            </code>
            <CopyBtn text={DT.formatNumber(result)} />
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

/* ---------------- 16. URL 参数解析 ---------------- */

function UrlParseTool() {
  const L = useL();
  const [input, setInput] = useState("");
  const [base, setBase] = useState<DT.ParsedUrl | null>(null);
  const [params, setParams] = useState<[string, string][]>([]);
  const [err, setErr] = useState("");
  const parse = () => {
    const r = DT.parseUrl(input);
    if (r.ok) {
      setBase(r.value);
      setParams(r.value.params.length ? r.value.params : [["", ""]]);
      setErr("");
    } else {
      setBase(null);
      setErr(L("不是合法的 URL（记得带 https:// 前缀）", "Not a valid URL (include the https:// prefix)"));
    }
  };
  const output = base ? DT.buildUrl(base, params) : "";
  const setParam = (i: number, idx: 0 | 1, v: string) => {
    setParams((prev) => prev.map((p, j) => (j === i ? ((idx === 0 ? [v, p[1]] : [p[0], v]) as [string, string]) : p)));
  };
  return (
    <div>
      <div className="dt-row">
        <input
          className="dt-in dt-grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?a=1&b=2#top"
        />
        <button type="button" className="btn primary" onClick={parse}>
          {L("解析", "Parse")}
        </button>
      </div>
      <ErrLine msg={err} />
      {base && (
        <>
          <div className="dt-kv">
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("协议", "Protocol")}</span>
              <code className="dt-kv-v">{base.protocol}</code>
            </div>
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("主机", "Host")}</span>
              <code className="dt-kv-v">{base.host}</code>
            </div>
            <div className="dt-kv-row">
              <span className="dt-kv-k">{L("路径", "Path")}</span>
              <code className="dt-kv-v">{base.pathname}</code>
            </div>
            {base.hash && (
              <div className="dt-kv-row">
                <span className="dt-kv-k">Hash</span>
                <code className="dt-kv-v">{base.hash}</code>
              </div>
            )}
          </div>
          <p className="dt-label">{L("查询参数（可编辑，下方链接实时拼回）", "Query params (editable — the URL below rebuilds live)")}</p>
          <div className="dt-params">
            {params.map((p, i) => (
              <div className="dt-row" key={i}>
                <input className="dt-in dt-grow" value={p[0]} onChange={(e) => setParam(i, 0, e.target.value)} placeholder="key" />
                <input className="dt-in dt-grow" value={p[1]} onChange={(e) => setParam(i, 1, e.target.value)} placeholder="value" />
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => setParams((prev) => prev.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="btn small" onClick={() => setParams((prev) => [...prev, ["", ""]])}>
              {L("＋ 加一行", "＋ Add row")}
            </button>
          </div>
          <OutBox value={output} rows={3} />
        </>
      )}
    </div>
  );
}

/* ---------------- 17. 字数统计 ---------------- */

function TextStatsTool() {
  const L = useL();
  const [input, setInput] = useState("");
  const s = useMemo(() => DT.textStats(input), [input]);
  const rows: [string, number][] = [
    [L("总字符", "Characters"), s.chars],
    [L("不计空格", "Without spaces"), s.charsNoSpace],
    [L("汉字", "Chinese chars"), s.chineseChars],
    [L("英文单词", "English words"), s.englishWords],
    [L("行数", "Lines"), s.lines],
    [L("段落", "Paragraphs"), s.paragraphs],
  ];
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={L("粘贴文本，实时统计", "Paste text — stats update live")}
      />
      <div className="dt-stats">
        {rows.map(([label, v]) => (
          <div className="dt-stat" key={label}>
            <span className="dt-stat-v">{v}</span>
            <span className="dt-stat-k">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 18. 大小写转换 ---------------- */

const CASE_MODES: { id: string; zh: string; en: string; example: string }[] = [
  { id: "upper", zh: "全大写", en: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lower", zh: "全小写", en: "lowercase", example: "hello world" },
  { id: "capitalize", zh: "句首大写", en: "Sentence case", example: "Hello world." },
  { id: "title", zh: "单词首字母大写", en: "Title Case", example: "Hello World" },
  { id: "camel", zh: "小驼峰", en: "camelCase", example: "helloWorld" },
  { id: "pascal", zh: "大驼峰", en: "PascalCase", example: "HelloWorld" },
  { id: "snake", zh: "下划线", en: "snake_case", example: "hello_world" },
  { id: "kebab", zh: "连字符", en: "kebab-case", example: "hello-world" },
];

function CaseTool() {
  const { lang } = useLang();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("camel");
  const output = useMemo(() => (input ? DT.convertCase(input, mode) : ""), [input, mode]);
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="hello world / helloWorld / hello_world"
      />
      <div className="dt-modes dt-wrap">
        {CASE_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`dt-mode${mode === m.id ? " on" : ""}`}
            onClick={() => setMode(m.id)}
            title={m.example}
          >
            {lang === "zh" ? m.zh : m.en}
          </button>
        ))}
      </div>
      <OutBox value={output} />
    </div>
  );
}

/* ---------------- 19. 行处理 ---------------- */

const LINE_OPS: { id: DT.LineOp; zh: string; en: string }[] = [
  { id: "dedupe", zh: "去重", en: "Dedupe" },
  { id: "sortAsc", zh: "升序排序", en: "Sort A→Z" },
  { id: "sortDesc", zh: "降序排序", en: "Sort Z→A" },
  { id: "removeEmpty", zh: "去空行", en: "Remove empty" },
  { id: "trim", zh: "去首尾空格", en: "Trim lines" },
  { id: "reverse", zh: "行序反转", en: "Reverse" },
];

function LinesTool() {
  const { lang } = useLang();
  const L = useL();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const apply = (op: DT.LineOp) => setOutput(DT.processLines(input, op));
  return (
    <div>
      <textarea
        className="dt-ta"
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={L("一行一条，粘贴进来处理", "One item per line")}
      />
      <div className="dt-row dt-wrap">
        {LINE_OPS.map((op) => (
          <button key={op.id} type="button" className="btn small" onClick={() => apply(op.id)}>
            {lang === "zh" ? op.zh : op.en}
          </button>
        ))}
      </div>
      {output !== "" && (
        <>
          <p className="privacy-note">
            {L("处理前", "Before")} {input === "" ? 0 : input.split("\n").length} {L("行 → 处理后", "lines → after")} {output.split("\n").length} {L("行", "lines")}
          </p>
          <OutBox value={output} rows={6} />
        </>
      )}
    </div>
  );
}

/* ---------------- 20. 文本对比 ---------------- */

function DiffTool() {
  const L = useL();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [diff, setDiff] = useState<DT.DiffLine[] | null>(null);
  return (
    <div>
      <div className="dt-diff-inputs">
        <textarea className="dt-ta" rows={6} value={a} onChange={(e) => setA(e.target.value)} placeholder={L("原文（左）", "Original (left)")} />
        <textarea className="dt-ta" rows={6} value={b} onChange={(e) => setB(e.target.value)} placeholder={L("新文（右）", "Revised (right)")} />
      </div>
      <div className="dt-row">
        <button type="button" className="btn primary" onClick={() => setDiff(DT.diffLines(a, b))}>
          {L("按行对比", "Compare lines")}
        </button>
        {diff && (
          <span className="privacy-note" style={{ margin: 0 }}>
            {L("删除", "Removed")} {diff.filter((d) => d.type === "remove").length} {L("行 · 新增", "· Added")} {diff.filter((d) => d.type === "add").length} {L("行", "lines")}
          </span>
        )}
      </div>
      {diff && (
        <div className="dt-diff">
          {diff.map((line, i) => (
            <div key={i} className={`dt-diff-line dt-diff-${line.type}`}>
              <span className="dt-diff-sign">{line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}</span>
              <span>{line.text || " "}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 工具目录与主组件 ---------------- */

interface ToolMeta {
  id: string;
  group: string;
  icon: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  kw: string; // 搜索关键词（中英混合，小写）
  Comp: () => React.ReactNode;
}

const GROUPS: { id: string; name: Record<Lang, string> }[] = [
  { id: "encoding", name: { zh: "编码转换", en: "Encoding" } },
  { id: "crypto", name: { zh: "加密与校验", en: "Hash & Verify" } },
  { id: "generators", name: { zh: "生成器", en: "Generators" } },
  { id: "format", name: { zh: "格式化与转换", en: "Format & Convert" } },
  { id: "text", name: { zh: "文本工具", en: "Text Tools" } },
];

const TOOL_META: ToolMeta[] = [
  { id: "base64", group: "encoding", icon: "🔤", name: { zh: "Base64 编码 / 解码", en: "Base64 Encode / Decode" }, desc: { zh: "文本与 Base64 互转，中文按 UTF-8 处理不乱码。", en: "Text ↔ Base64 with proper UTF-8 handling." }, kw: "base64 encode decode 编码 解码", Comp: Base64Tool },
  { id: "url-codec", group: "encoding", icon: "🔗", name: { zh: "URL 编码 / 解码", en: "URL Encode / Decode" }, desc: { zh: "encodeURIComponent 口径，处理链接里的中文与特殊字符。", en: "encodeURIComponent semantics for links with special characters." }, kw: "url encode decode 编码 解码 percent", Comp: UrlCodecTool },
  { id: "unicode", group: "encoding", icon: "🔣", name: { zh: "Unicode 转义互转", en: "Unicode Escape Converter" }, desc: { zh: "中文 ↔ \\uXXXX 转义，粘贴代码里的转义串也能还原。", en: "Text ↔ \\uXXXX escapes, both ways." }, kw: "unicode escape 转义 \\u", Comp: UnicodeTool },
  { id: "radix", group: "encoding", icon: "🔢", name: { zh: "进制转换", en: "Radix Converter" }, desc: { zh: "2 / 8 / 10 / 16 / 36 进制互转，BigInt 支持任意大整数。", en: "Base 2 / 8 / 10 / 16 / 36 with BigInt arbitrary precision." }, kw: "进制 radix binary hex decimal 进制转换", Comp: RadixTool },
  { id: "hex", group: "encoding", icon: "#️⃣", name: { zh: "Hex ↔ 文本", en: "Hex ↔ Text" }, desc: { zh: "文本按 UTF-8 字节转十六进制串，也能反向解回。", en: "Text to hex bytes (UTF-8) and back." }, kw: "hex hexadecimal 十六进制 文本", Comp: HexTool },
  { id: "hash", group: "crypto", icon: "🧬", name: { zh: "哈希计算", en: "Hash Calculator" }, desc: { zh: "MD5 / SHA-1 / SHA-256 / SHA-512 一次算齐，输入即出。", en: "MD5 / SHA-1 / SHA-256 / SHA-512, computed as you type." }, kw: "hash md5 sha 哈希 摘要", Comp: HashTool },
  { id: "jwt", group: "crypto", icon: "🎫", name: { zh: "JWT 解码", en: "JWT Decoder" }, desc: { zh: "拆开 header 与 payload 看内容，只解码、不验签。", en: "Inspect header and payload — decode only, no verification." }, kw: "jwt token decode 解码 bearer", Comp: JwtTool },
  { id: "pw-strength", group: "crypto", icon: "💪", name: { zh: "密码强度检测", en: "Password Strength Checker" }, desc: { zh: "长度、字符类与熵估算一起看，给等级不给绝对结论。", en: "Length, character classes and entropy estimate with a grade." }, kw: "password strength 密码 强度 熵 entropy", Comp: PasswordStrengthTool },
  { id: "uuid", group: "generators", icon: "🆔", name: { zh: "UUID 生成", en: "UUID Generator" }, desc: { zh: "v4 随机 UUID，一次最多生成 50 个，可整批复制。", en: "Random v4 UUIDs, up to 50 at a time." }, kw: "uuid guid 生成 v4", Comp: UuidTool },
  { id: "random-password", group: "generators", icon: "🔑", name: { zh: "随机密码生成", en: "Random Password Generator" }, desc: { zh: "长度与字符集可调，安全随机源生成，只出现在你屏幕上。", en: "Adjustable length and charset, generated with a secure RNG." }, kw: "random password 随机 密码 生成", Comp: RandomPasswordTool },
  { id: "random-number", group: "generators", icon: "🎲", name: { zh: "随机数生成", en: "Random Number Generator" }, desc: { zh: "指定范围批量出整数或小数，抽号、造测试数据都行。", en: "Batch integers or decimals in any range." }, kw: "random number 随机数 抽号", Comp: RandomNumberTool },
  { id: "json", group: "format", icon: "🧾", name: { zh: "JSON 格式化 / 校验", en: "JSON Formatter / Validator" }, desc: { zh: "美化、压缩、校验三合一，写错了指出第几行第几列。", en: "Format, minify and validate — errors pinpoint line and column." }, kw: "json format validate 格式化 压缩 校验", Comp: JsonTool },
  { id: "timestamp", group: "format", icon: "⏱️", name: { zh: "时间戳转换", en: "Timestamp Converter" }, desc: { zh: "秒 / 毫秒与日期时间互转，当前时间戳实时跳动。", en: "Seconds / milliseconds ↔ date-time, with a live current timestamp." }, kw: "timestamp unix 时间戳 日期 epoch", Comp: TimestampTool },
  { id: "color", group: "format", icon: "🎨", name: { zh: "颜色转换", en: "Color Converter" }, desc: { zh: "HEX / RGB / HSL 互转，滑杆调色、色块实时预览。", en: "HEX / RGB / HSL conversion with sliders and a live swatch." }, kw: "color hex rgb hsl 颜色 转换", Comp: ColorTool },
  { id: "unit", group: "format", icon: "📏", name: { zh: "单位换算", en: "Unit Converter" }, desc: { zh: "长度、重量、数据容量三类常用单位互转。", en: "Length, weight and data-size units." }, kw: "unit convert 单位 换算 长度 重量 容量", Comp: UnitTool },
  { id: "url-parse", group: "format", icon: "🧩", name: { zh: "URL 参数解析", en: "URL Parser" }, desc: { zh: "把链接拆成协议、主机、路径与参数表，改完实时拼回。", en: "Split a URL into protocol, host, path and an editable query table." }, kw: "url parse query params 解析 参数", Comp: UrlParseTool },
  { id: "text-stats", group: "text", icon: "🔢", name: { zh: "字数统计", en: "Text Counter" }, desc: { zh: "字符、汉字、英文单词、行数与段落，边打边数。", en: "Characters, Chinese chars, words, lines and paragraphs — live." }, kw: "字数 统计 count words chars", Comp: TextStatsTool },
  { id: "case", group: "text", icon: "🔠", name: { zh: "大小写转换", en: "Case Converter" }, desc: { zh: "全大 / 全小 / 句首 / 驼峰 / 下划线等八种写法互转。", en: "UPPER, lower, Sentence, camel, Pascal, snake, kebab and Title." }, kw: "case 大小写 camel snake 驼峰", Comp: CaseTool },
  { id: "lines", group: "text", icon: "📋", name: { zh: "行处理", en: "Line Tools" }, desc: { zh: "去重、排序、去空行、反转、去首尾空格，一键处理一列文本。", en: "Dedupe, sort, drop blanks, reverse and trim a list of lines." }, kw: "lines dedupe sort 行 去重 排序", Comp: LinesTool },
  { id: "diff", group: "text", icon: "🔀", name: { zh: "文本对比", en: "Text Diff" }, desc: { zh: "双栏粘贴，按行 diff 高亮新增与删除的行。", en: "Paste two texts — line diff with additions and removals highlighted." }, kw: "diff compare 对比 文本 差异", Comp: DiffTool },
];

export default function DevToolbox() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (m: ToolMeta) =>
    !q ||
    m.name.zh.toLowerCase().includes(q) ||
    m.name.en.toLowerCase().includes(q) ||
    m.kw.includes(q);
  const visible = TOOL_META.filter(matches);
  return (
    <div className="tool-embed devtools">
      <div className="badges">
        <span className="badge badge-embedded">
          🔒 {lang === "zh" ? "全部在浏览器本地运行，输入不上传" : "Everything runs locally in your browser — nothing is uploaded"}
        </span>
      </div>
      <div className="dt-searchrow">
        <input
          className="dt-in dt-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "zh" ? "搜索 20 件工具，如：哈希 / JSON / 时间戳…" : "Search 20 tools: hash / JSON / timestamp…"}
          aria-label="Search dev tools"
        />
      </div>
      <nav className="dt-nav" aria-label="dev tool groups">
        {GROUPS.map((g) => (
          <a key={g.id} className="dt-chip" href={`#dtg-${g.id}`}>
            {g.name[lang]} · {TOOL_META.filter((m) => m.group === g.id).length}
          </a>
        ))}
      </nav>
      {visible.length === 0 && (
        <p className="empty-note">{lang === "zh" ? "没有匹配的工具，换个词试试" : "No matching tools — try another keyword"}</p>
      )}
      {GROUPS.map((g) => {
        const items = visible.filter((m) => m.group === g.id);
        if (items.length === 0) return null;
        return (
          <section key={g.id} id={`dtg-${g.id}`} className="dt-group">
            <h2 className="section-title dt-group-title">{g.name[lang]}</h2>
            <div className="dt-grid">
              {items.map((m) => (
                <section key={m.id} className="card dt-card">
                  <h3 className="dt-card-title">
                    <span aria-hidden="true">{m.icon}</span> {m.name[lang]}
                  </h3>
                  <p className="card-desc">{m.desc[lang]}</p>
                  <m.Comp />
                </section>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
