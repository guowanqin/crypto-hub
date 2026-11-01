/**
 * 文件夹加密保险箱（/tool/foldervault）核心：.vault 文件格式与加解密。
 *
 * 信封加密设计（参考桌面版 FolderLock 的路子，WebCrypto 实现）：
 * - 每个保险箱生成一把随机 256 位主密钥，文件内容与清单（文件名/目录结构）都用它加密。
 * - 主密钥被两把 KEK 分别包裹：密码派生的一把、恢复密钥派生的一把——忘密码可用恢复密钥解锁。
 * - KEK 派生首选 Argon2id（hash-wasm）；不可用时退化 PBKDF2-SHA256 600k 次，实际用的
 *   KDF 与参数写在文件头里，解锁时按记录执行。
 * - 文件按 2 MiB 分块、逐块 AES-GCM 认证加密，逐块读写 Blob 分片，不把大文件整体载入内存。
 * - 错误密码/恢复密钥会在解包主密钥时被 GCM 认证拒绝，不会产出损坏文件。
 * 全程只在浏览器本地运行，不调用任何外部 API。
 */

const MAGIC = "FVLT";
const VERSION = 1;
export const CHUNK_SIZE = 2 * 1024 * 1024;
const GCM_TAG = 16;

const ARGON2 = { iterations: 3, memoryKiB: 65536, parallelism: 1 };
const PBKDF2_ITERATIONS = 600_000;

export class VaultError extends Error {
  code: "bad-secret" | "bad-format" | "corrupt";
  constructor(code: VaultError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/* ---------- 小工具：base64 / base32 / 字节 ---------- */

function b64encode(bytes: Uint8Array): string {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(s);
}

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function b32encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function b32decode(s: string): Uint8Array {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

/* ---------- 密钥派生 ---------- */

type KdfRecord =
  | { type: "argon2id"; iterations: number; memoryKiB: number; parallelism: number }
  | { type: "pbkdf2"; iterations: number };

interface WrappedKey {
  kind: "password" | "recovery";
  salt: string; // b64, 16 bytes
  kdf: KdfRecord;
  iv: string; // b64, 12 bytes
  data: string; // b64，包裹后的主密钥密文
}

async function deriveKekBytes(
  secret: Uint8Array,
  salt: Uint8Array,
  kdf: KdfRecord,
): Promise<Uint8Array> {
  if (kdf.type === "argon2id") {
    const { argon2id } = await import("hash-wasm");
    return argon2id({
      password: secret,
      salt,
      iterations: kdf.iterations,
      memorySize: kdf.memoryKiB,
      parallelism: kdf.parallelism,
      hashLength: 32,
      outputType: "binary",
    });
  }
  const base = await crypto.subtle.importKey("raw", secret as BufferSource, "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: kdf.iterations },
    base,
    256,
  );
  return new Uint8Array(bits);
}

/** 优先 Argon2id；hash-wasm 加载/执行失败时退化 PBKDF2，并如实返回所用记录。 */
async function deriveKekWithFallback(
  secret: Uint8Array,
  salt: Uint8Array,
): Promise<{ kek: Uint8Array; kdf: KdfRecord }> {
  try {
    const kdf: KdfRecord = { type: "argon2id", ...ARGON2 };
    const kek = await deriveKekBytes(secret, salt, kdf);
    return { kek, kdf };
  } catch {
    const kdf: KdfRecord = { type: "pbkdf2", iterations: PBKDF2_ITERATIONS };
    const kek = await deriveKekBytes(secret, salt, kdf);
    return { kek, kdf };
  }
}

async function importAesKey(raw: Uint8Array, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, usages);
}

async function wrapMasterKey(
  kind: WrappedKey["kind"],
  secret: Uint8Array,
  masterRaw: Uint8Array,
): Promise<WrappedKey> {
  const salt = randomBytes(16);
  const { kek, kdf } = await deriveKekWithFallback(secret, salt);
  const kekKey = await importAesKey(kek, ["encrypt"]);
  const iv = randomBytes(12);
  const data = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, kekKey, masterRaw as BufferSource),
  );
  return { kind, salt: b64encode(salt), kdf, iv: b64encode(iv), data: b64encode(data) };
}

async function unwrapMasterKey(entry: WrappedKey, secret: Uint8Array): Promise<Uint8Array> {
  const kek = await deriveKekBytes(secret, b64decode(entry.salt), entry.kdf);
  const kekKey = await importAesKey(kek, ["decrypt"]);
  try {
    const raw = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64decode(entry.iv) as BufferSource },
      kekKey,
      b64decode(entry.data) as BufferSource,
    );
    return new Uint8Array(raw);
  } catch {
    throw new VaultError("bad-secret", "secret rejected by GCM authentication");
  }
}

/* ---------- 格式 ---------- */

interface VaultHeader {
  v: number;
  wrapped: WrappedKey[];
  manifestIv: string; // b64 12B
  manifestLen: number; // 清单密文字节数（含 GCM tag）
  chunkNoncePrefix: string; // b64 8B
}

export interface VaultManifestFile {
  path: string;
  size: number;
  chunks: number;
  lastModified: number;
}

export interface VaultManifest {
  name: string;
  createdAt: number;
  chunkSize: number;
  files: VaultManifestFile[];
}

export interface VaultFileInput {
  file: File;
  /** 保险箱内相对路径（文件夹结构） */
  path: string;
}

function chunkNonce(prefix: Uint8Array, globalIndex: number): Uint8Array {
  const nonce = new Uint8Array(12);
  nonce.set(prefix, 0);
  new DataView(nonce.buffer).setUint32(8, globalIndex, true);
  return nonce;
}

/* ---------- 建箱 ---------- */

export interface CreateVaultResult {
  blob: Blob;
  /** 恢复密钥（分组展示形），仅在建箱时返回这一次 */
  recoveryKey: string;
  fileCount: number;
  totalSize: number;
}

function formatRecoveryKey(rawBytes: Uint8Array): string {
  const s = b32encode(rawBytes);
  return (s.match(/.{1,4}/g) ?? []).join("-");
}

export async function createVault(
  inputs: VaultFileInput[],
  password: string,
  vaultName: string,
  onProgress?: (doneBytes: number, totalBytes: number) => void,
): Promise<CreateVaultResult> {
  if (inputs.length === 0) throw new VaultError("bad-format", "no files");
  const totalSize = inputs.reduce((a, f) => a + f.file.size, 0);

  // 主密钥 + 恢复密钥
  const masterRaw = randomBytes(32);
  const masterKey = await importAesKey(masterRaw, ["encrypt", "decrypt"]);
  const recoveryRaw = randomBytes(20);

  const passwordBytes = new TextEncoder().encode(password);
  const wrappedPw = await wrapMasterKey("password", passwordBytes, masterRaw);
  const wrappedRec = await wrapMasterKey("recovery", recoveryRaw, masterRaw);

  // 清单（加密后放头部之后）
  const manifest: VaultManifest = {
    name: vaultName,
    createdAt: Date.now(),
    chunkSize: CHUNK_SIZE,
    files: inputs.map((f) => ({
      path: f.path,
      size: f.file.size,
      chunks: Math.max(1, Math.ceil(f.file.size / CHUNK_SIZE)),
      lastModified: f.file.lastModified,
    })),
  };
  const manifestIv = randomBytes(12);
  const manifestCipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: manifestIv as BufferSource },
      masterKey,
      new TextEncoder().encode(JSON.stringify(manifest)) as BufferSource,
    ),
  );

  const noncePrefix = randomBytes(8);
  const header: VaultHeader = {
    v: VERSION,
    wrapped: [wrappedPw, wrappedRec],
    manifestIv: b64encode(manifestIv),
    manifestLen: manifestCipher.length,
    chunkNoncePrefix: b64encode(noncePrefix),
  };
  const headerJson = new TextEncoder().encode(JSON.stringify(header));
  const prefix = new Uint8Array(9);
  prefix.set(new TextEncoder().encode(MAGIC), 0);
  prefix[4] = VERSION;
  new DataView(prefix.buffer).setUint32(5, headerJson.length, true);

  const parts: BlobPart[] = [prefix as BlobPart, headerJson as BlobPart, manifestCipher as BlobPart];

  // 逐文件逐块流式加密
  let globalChunk = 0;
  let done = 0;
  for (const input of inputs) {
    const { file } = input;
    if (file.size === 0) {
      // 空文件也占一个加密块（0 字节明文），保证块索引与清单一致
      const cipher = new Uint8Array(
        await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: chunkNonce(noncePrefix, globalChunk) as BufferSource },
          masterKey,
          new Uint8Array(0) as BufferSource,
        ),
      );
      parts.push(cipher as BlobPart);
      globalChunk++;
      continue;
    }
    for (let off = 0; off < file.size; off += CHUNK_SIZE) {
      const plain = new Uint8Array(await file.slice(off, off + CHUNK_SIZE).arrayBuffer());
      const cipher = new Uint8Array(
        await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: chunkNonce(noncePrefix, globalChunk) as BufferSource },
          masterKey,
          plain as BufferSource,
        ),
      );
      parts.push(cipher as BlobPart);
      globalChunk++;
      done += plain.length;
      onProgress?.(done, totalSize);
    }
  }
  onProgress?.(totalSize, totalSize);

  return {
    blob: new Blob(parts, { type: "application/octet-stream" }),
    recoveryKey: formatRecoveryKey(recoveryRaw),
    fileCount: inputs.length,
    totalSize,
  };
}

/* ---------- 开箱 ---------- */

export interface UnlockedVault {
  manifest: VaultManifest;
  /** 解出第 index 个文件（按清单顺序），返回原始内容 Blob */
  extractFile: (index: number, onProgress?: (done: number, total: number) => void) => Promise<Blob>;
}

export async function unlockVault(
  data: Blob,
  secret: { type: "password" | "recovery"; value: string },
): Promise<UnlockedVault> {
  const head = new Uint8Array(await data.slice(0, 9).arrayBuffer());
  if (head.length < 9 || new TextDecoder().decode(head.subarray(0, 4)) !== MAGIC) {
    throw new VaultError("bad-format", "not a .vault file");
  }
  const headerLen = new DataView(head.buffer, head.byteOffset, head.byteLength).getUint32(5, true);
  const headerBytes = new Uint8Array(await data.slice(9, 9 + headerLen).arrayBuffer());
  let header: VaultHeader;
  try {
    header = JSON.parse(new TextDecoder().decode(headerBytes)) as VaultHeader;
    if (header.v !== VERSION || !Array.isArray(header.wrapped)) throw new Error("bad header");
  } catch {
    throw new VaultError("bad-format", "corrupt vault header");
  }

  const entry = header.wrapped.find((w) => w.kind === secret.type);
  if (!entry) throw new VaultError("bad-format", "vault lacks this unlock method");

  const secretBytes =
    secret.type === "password"
      ? new TextEncoder().encode(secret.value)
      : b32decode(secret.value);
  if (secret.type === "recovery" && secretBytes.length !== 20) {
    throw new VaultError("bad-secret", "recovery key has wrong length");
  }
  const masterRaw = await unwrapMasterKey(entry, secretBytes);
  const masterKey = await importAesKey(masterRaw, ["decrypt"]);

  const manifestStart = 9 + headerLen;
  const manifestCipher = await data
    .slice(manifestStart, manifestStart + header.manifestLen)
    .arrayBuffer();
  let manifest: VaultManifest;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64decode(header.manifestIv) as BufferSource },
      masterKey,
      manifestCipher,
    );
    manifest = JSON.parse(new TextDecoder().decode(plain)) as VaultManifest;
  } catch {
    throw new VaultError("corrupt", "manifest failed authentication");
  }

  const noncePrefix = b64decode(header.chunkNoncePrefix);
  const dataStart = manifestStart + header.manifestLen;
  const chunkSize = manifest.chunkSize || CHUNK_SIZE;

  // 预计算每个文件的块在数据区中的起始偏移与全局块序号
  interface FileLayout {
    startChunk: number;
    startOffset: number;
  }
  const layouts: FileLayout[] = [];
  {
    let chunk = 0;
    let offset = 0;
    for (const f of manifest.files) {
      layouts.push({ startChunk: chunk, startOffset: offset });
      for (let c = 0; c < f.chunks; c++) {
        const plainLen =
          f.size === 0 ? 0 : c < f.chunks - 1 ? chunkSize : f.size - chunkSize * (f.chunks - 1);
        offset += plainLen + GCM_TAG;
        chunk++;
      }
    }
  }

  async function extractFile(
    index: number,
    onProgress?: (done: number, total: number) => void,
  ): Promise<Blob> {
    const f = manifest.files[index];
    const layout = layouts[index];
    const parts: BlobPart[] = [];
    let pos = dataStart + layout.startOffset;
    let doneBytes = 0;
    for (let c = 0; c < f.chunks; c++) {
      const plainLen =
        f.size === 0 ? 0 : c < f.chunks - 1 ? chunkSize : f.size - chunkSize * (f.chunks - 1);
      const cipherLen = plainLen + GCM_TAG;
      const cipher = await data.slice(pos, pos + cipherLen).arrayBuffer();
      let plain: ArrayBuffer;
      try {
        plain = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: chunkNonce(noncePrefix, layout.startChunk + c) as BufferSource,
          },
          masterKey,
          cipher,
        );
      } catch {
        throw new VaultError("corrupt", `chunk authentication failed for ${f.path}`);
      }
      parts.push(plain);
      pos += cipherLen;
      doneBytes += plainLen;
      onProgress?.(doneBytes, f.size);
    }
    return new Blob(parts);
  }

  return { manifest, extractFile };
}

/** 恢复密钥输入归一化校验：去掉分隔符后应为 32 个 base32 字符。 */
export function looksLikeRecoveryKey(value: string): boolean {
  return value.toUpperCase().replace(/[^A-Z2-7]/g, "").length === 32;
}
