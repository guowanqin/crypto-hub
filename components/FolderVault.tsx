"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { downloadBlob } from "@/lib/engine";
import {
  createVault,
  unlockVault,
  looksLikeRecoveryKey,
  VaultError,
  type UnlockedVault,
  type VaultFileInput,
} from "@/lib/foldervault";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    tabCreate: string;
    tabUnlock: string;
    createDropHint: string;
    dropClickFiles: string;
    dropClickFolder: string;
    selectedTitle: string;
    totalSize: string;
    clearAll: string;
    remove: string;
    password: string;
    passwordPh: string;
    passwordConfirm: string;
    passwordConfirmPh: string;
    vaultName: string;
    vaultNamePh: string;
    createBtn: string;
    creating: string;
    pwTooShort: string;
    pwMismatch: string;
    createdTitle: string;
    createdMeta: string;
    downloadVault: string;
    recoveryTitle: string;
    recoveryHint: string;
    copy: string;
    copied: string;
    createAgain: string;
    sizeNote: string;
    unlockDropHint: string;
    unlockDropClick: string;
    unlockMethod: string;
    methodPassword: string;
    methodRecovery: string;
    secretPhPw: string;
    secretPhRec: string;
    unlockBtn: string;
    unlocking: string;
    unlockedTitle: string;
    downloadOne: string;
    downloadZip: string;
    zipping: string;
    extracting: string;
    badSecret: string;
    badFormat: string;
    corrupt: string;
    genericError: string;
    dropVaultOnly: string;
  }
> = {
  zh: {
    tabCreate: "创建保险箱",
    tabUnlock: "打开保险箱",
    createDropHint: "把文件或文件夹拖到这里，或",
    dropClickFiles: "选择文件",
    dropClickFolder: "选择文件夹",
    selectedTitle: "已选文件",
    totalSize: "合计",
    clearAll: "清空",
    remove: "移除",
    password: "设置密码",
    passwordPh: "至少 8 位，建议长一点",
    passwordConfirm: "再输一次密码",
    passwordConfirmPh: "与上面一致",
    vaultName: "保险箱名称",
    vaultNamePh: "例如：证件扫描件",
    createBtn: "加密并下载 .vault",
    creating: "正在加密…",
    pwTooShort: "密码至少 8 位。",
    pwMismatch: "两次输入的密码不一致。",
    createdTitle: "保险箱已生成",
    createdMeta: "共 {n} 个文件 · {size}",
    downloadVault: "下载 .vault 文件",
    recoveryTitle: "恢复密钥（只显示这一次）",
    recoveryHint:
      "把这串密钥抄下来或截图离线保存。忘记密码时只能靠它开箱；它和密码都丢了，里面的文件谁都打不开。下载完 .vault 后请再刷新页面之前记好它。",
    copy: "复制",
    copied: "已复制",
    createAgain: "再建一个",
    sizeNote:
      "保险箱在浏览器内存里组装，建议单个保险箱总大小控制在几百 MB 以内（设备内存越大越稳）；特别大的文件夹请分开建箱。",
    unlockDropHint: "把 .vault 文件拖到这里，或",
    unlockDropClick: "选择 .vault 文件",
    unlockMethod: "解锁方式",
    methodPassword: "密码",
    methodRecovery: "恢复密钥",
    secretPhPw: "输入建箱时设置的密码",
    secretPhRec: "输入恢复密钥（可带或不带短横线）",
    unlockBtn: "解锁",
    unlocking: "正在验证并解密清单…",
    unlockedTitle: "保险箱内容",
    downloadOne: "下载",
    downloadZip: "全部打包 ZIP 下载",
    zipping: "正在解密并打包…",
    extracting: "正在解密…",
    badSecret: "密码或恢复密钥不对，已被保险箱拒绝。注意区分大小写，恢复密钥可以连同短横线一起粘贴。",
    badFormat: "这不是有效的 .vault 保险箱文件。",
    corrupt: "文件校验失败：保险箱可能已损坏或被篡改，无法解出内容。",
    genericError: "处理失败，请重试。",
    dropVaultOnly: "请选择 .vault 文件。",
  },
  en: {
    tabCreate: "Create a vault",
    tabUnlock: "Open a vault",
    createDropHint: "Drop files or folders here, or",
    dropClickFiles: "pick files",
    dropClickFolder: "pick a folder",
    selectedTitle: "Selected files",
    totalSize: "Total",
    clearAll: "Clear",
    remove: "Remove",
    password: "Set a password",
    passwordPh: "At least 8 characters — longer is better",
    passwordConfirm: "Repeat the password",
    passwordConfirmPh: "Must match the one above",
    vaultName: "Vault name",
    vaultNamePh: "e.g. ID scans",
    createBtn: "Encrypt & download .vault",
    creating: "Encrypting…",
    pwTooShort: "Password must be at least 8 characters.",
    pwMismatch: "The two passwords do not match.",
    createdTitle: "Vault created",
    createdMeta: "{n} files · {size}",
    downloadVault: "Download the .vault file",
    recoveryTitle: "Recovery key (shown only this once)",
    recoveryHint:
      "Write this key down or screenshot it and keep it offline. If you forget the password, this key is the only way back in; lose both and nobody can open the vault. Note it down before leaving this page.",
    copy: "Copy",
    copied: "Copied",
    createAgain: "Create another",
    sizeNote:
      "The vault is assembled in browser memory — keep a single vault within a few hundred MB (more device memory is more forgiving); split very large folders into several vaults.",
    unlockDropHint: "Drop a .vault file here, or",
    unlockDropClick: "pick a .vault file",
    unlockMethod: "Unlock with",
    methodPassword: "Password",
    methodRecovery: "Recovery key",
    secretPhPw: "Enter the password you set when creating the vault",
    secretPhRec: "Enter the recovery key (dashes optional)",
    unlockBtn: "Unlock",
    unlocking: "Verifying and decrypting the manifest…",
    unlockedTitle: "Vault contents",
    downloadOne: "Download",
    downloadZip: "Download all as ZIP",
    zipping: "Decrypting and zipping…",
    extracting: "Decrypting…",
    badSecret:
      "Wrong password or recovery key — the vault rejected it. Mind the case; a recovery key can be pasted with or without dashes.",
    badFormat: "This is not a valid .vault file.",
    corrupt: "Integrity check failed: the vault looks damaged or tampered with and cannot be opened.",
    genericError: "Something went wrong. Please try again.",
    dropVaultOnly: "Please choose a .vault file.",
  },
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

let idSeq = 1;

interface PickedItem {
  id: number;
  file: File;
  path: string;
}

/** 递归展开拖放进来的文件夹条目 */
async function walkEntry(
  entry: FileSystemEntry,
  prefix: string,
  out: VaultFileInput[],
): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject),
    );
    out.push({ file, path: prefix + entry.name });
  } else if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      if (batch.length === 0) break;
      for (const child of batch) await walkEntry(child, `${prefix}${entry.name}/`, out);
    }
  }
}

async function filesFromDataTransfer(dt: DataTransfer): Promise<VaultFileInput[]> {
  const out: VaultFileInput[] = [];
  const items = Array.from(dt.items).filter((i) => i.kind === "file");
  const entries = items
    .map((i) => (typeof i.webkitGetAsEntry === "function" ? i.webkitGetAsEntry() : null))
    .filter((e): e is FileSystemEntry => e !== null);
  if (entries.length > 0) {
    for (const e of entries) await walkEntry(e, "", out);
    return out;
  }
  for (const f of Array.from(dt.files)) out.push({ file: f, path: f.name });
  return out;
}

export default function FolderVault() {
  const { lang } = useLang();
  const d = DICT[lang];

  const [tab, setTab] = useState<"create" | "unlock">("create");

  // ---- 建箱状态 ----
  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [draggingCreate, setDraggingCreate] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [vaultName, setVaultName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createError, setCreateError] = useState("");
  const [created, setCreated] = useState<{ blob: Blob; recoveryKey: string; name: string; meta: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ---- 开箱状态 ----
  const [vaultFile, setVaultFile] = useState<File | null>(null);
  const [draggingUnlock, setDraggingUnlock] = useState(false);
  const [method, setMethod] = useState<"password" | "recovery">("password");
  const [secret, setSecret] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlocked, setUnlocked] = useState<UnlockedVault | null>(null);
  const [extractingIdx, setExtractingIdx] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  const vaultInputRef = useRef<HTMLInputElement>(null);

  const totalPicked = picked.reduce((a, p) => a + p.file.size, 0);

  function addPicked(inputs: VaultFileInput[]) {
    setPicked((prev) => [
      ...prev,
      ...inputs.map((i) => ({ id: idSeq++, file: i.file, path: i.path })),
    ]);
  }

  function errorText(e: unknown): string {
    if (e instanceof VaultError) {
      if (e.code === "bad-secret") return d.badSecret;
      if (e.code === "bad-format") return d.badFormat;
      return d.corrupt;
    }
    return d.genericError;
  }

  async function handleCreate() {
    setCreateError("");
    if (password.length < 8) {
      setCreateError(d.pwTooShort);
      return;
    }
    if (password !== password2) {
      setCreateError(d.pwMismatch);
      return;
    }
    setCreateBusy(true);
    setCreateProgress(0);
    try {
      const name = vaultName.trim() || "vault";
      const result = await createVault(
        picked.map((p) => ({ file: p.file, path: p.path })),
        password,
        name,
        (done, total) => setCreateProgress(total > 0 ? done / total : 1),
      );
      setCreated({
        blob: result.blob,
        recoveryKey: result.recoveryKey,
        name,
        meta: d.createdMeta
          .replace("{n}", String(result.fileCount))
          .replace("{size}", fmtSize(result.totalSize)),
      });
      setCopied(false);
      // 建箱完成即自动下载一次，结果区按钮可重复下载
      downloadBlob(result.blob, `${name}.vault`);
    } catch (e) {
      setCreateError(errorText(e));
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleUnlock() {
    if (!vaultFile) return;
    if (method === "recovery" && !looksLikeRecoveryKey(secret)) {
      setUnlockError(d.badSecret);
      return;
    }
    setUnlockBusy(true);
    setUnlockError("");
    setUnlocked(null);
    try {
      const v = await unlockVault(vaultFile, { type: method, value: secret });
      setUnlocked(v);
    } catch (e) {
      setUnlockError(errorText(e));
    } finally {
      setUnlockBusy(false);
    }
  }

  async function downloadOne(idx: number) {
    if (!unlocked) return;
    setExtractingIdx(idx);
    try {
      const blob = await unlocked.extractFile(idx);
      const path = unlocked.manifest.files[idx].path;
      downloadBlob(blob, path.split("/").pop() || `file-${idx}`);
    } catch (e) {
      setUnlockError(errorText(e));
    } finally {
      setExtractingIdx(null);
    }
  }

  async function downloadZip() {
    if (!unlocked) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < unlocked.manifest.files.length; i++) {
        const blob = await unlocked.extractFile(i);
        zip.file(unlocked.manifest.files[i].path, blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      downloadBlob(out, `${unlocked.manifest.name || "vault"}.zip`);
    } catch (e) {
      setUnlockError(errorText(e));
    } finally {
      setZipping(false);
    }
  }

  function resetUnlockFile(f: File | null) {
    setVaultFile(f);
    setUnlocked(null);
    setUnlockError("");
  }

  return (
    <div className="fv-tool">
      <div className="fv-modes" role="tablist" aria-label="mode">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "create"}
          className={`fv-mode-btn${tab === "create" ? " active" : ""}`}
          onClick={() => setTab("create")}
        >
          {d.tabCreate}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "unlock"}
          className={`fv-mode-btn${tab === "unlock" ? " active" : ""}`}
          onClick={() => setTab("unlock")}
        >
          {d.tabUnlock}
        </button>
      </div>

      {tab === "create" && (
        <div>
          {!created ? (
            <>
              <div
                className={`fv-drop${draggingCreate ? " dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggingCreate(true);
                }}
                onDragLeave={() => setDraggingCreate(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDraggingCreate(false);
                  addPicked(await filesFromDataTransfer(e.dataTransfer));
                }}
              >
                {d.createDropHint}{" "}
                <button type="button" className="fv-drop-link" onClick={() => fileInputRef.current?.click()}>
                  {d.dropClickFiles}
                </button>
                {" / "}
                <button type="button" className="fv-drop-link" onClick={() => folderInputRef.current?.click()}>
                  {d.dropClickFolder}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    addPicked(files.map((f) => ({ file: f, path: f.name })));
                    e.target.value = "";
                  }}
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  hidden
                  // @ts-expect-error 非标准但主流浏览器支持的目录选择属性
                  webkitdirectory=""
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    addPicked(
                      files.map((f) => ({
                        file: f,
                        path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                      })),
                    );
                    e.target.value = "";
                  }}
                />
              </div>

              {picked.length > 0 && (
                <div className="fv-list-wrap">
                  <div className="fv-list-head">
                    <span>
                      {d.selectedTitle} · {picked.length} · {d.totalSize} {fmtSize(totalPicked)}
                    </span>
                    <button type="button" className="btn ghost small" onClick={() => setPicked([])}>
                      {d.clearAll}
                    </button>
                  </div>
                  <ul className="fv-list">
                    {picked.map((p) => (
                      <li key={p.id} className="fv-row">
                        <span className="fv-row-path">{p.path}</span>
                        <span className="fv-row-size">{fmtSize(p.file.size)}</span>
                        <button
                          type="button"
                          className="btn ghost small"
                          onClick={() => setPicked((prev) => prev.filter((x) => x.id !== p.id))}
                        >
                          {d.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="fv-controls">
                <label className="fv-field">
                  <span>{d.vaultName}</span>
                  <input
                    className="fv-input"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    placeholder={d.vaultNamePh}
                  />
                </label>
                <label className="fv-field">
                  <span>{d.password}</span>
                  <input
                    className="fv-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={d.passwordPh}
                    autoComplete="new-password"
                  />
                </label>
                <label className="fv-field">
                  <span>{d.passwordConfirm}</span>
                  <input
                    className="fv-input"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder={d.passwordConfirmPh}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              {createError && <p className="fv-error">{createError}</p>}
              <div className="fv-actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={picked.length === 0 || createBusy}
                  onClick={handleCreate}
                >
                  {createBusy ? `${d.creating} ${Math.round(createProgress * 100)}%` : d.createBtn}
                </button>
              </div>
              <p className="fv-note">{d.sizeNote}</p>
            </>
          ) : (
            <div className="fv-created">
              <h3 className="fv-created-title">🔐 {d.createdTitle}</h3>
              <p className="fv-note">{created.meta}</p>
              <div className="fv-actions">
                <button
                  type="button"
                  className="btn primary big"
                  onClick={() => downloadBlob(created.blob, `${created.name}.vault`)}
                >
                  {d.downloadVault}（{fmtSize(created.blob.size)}）
                </button>
              </div>
              <div className="fv-recovery">
                <p className="fv-recovery-title">{d.recoveryTitle}</p>
                <p className="fv-recovery-key" data-testid="recovery-key">{created.recoveryKey}</p>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(created.recoveryKey);
                      setCopied(true);
                    } catch {
                      /* 剪贴板不可用时忽略 */
                    }
                  }}
                >
                  {copied ? d.copied : d.copy}
                </button>
                <p className="fv-note">{d.recoveryHint}</p>
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setCreated(null);
                  setPicked([]);
                  setPassword("");
                  setPassword2("");
                }}
              >
                {d.createAgain}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "unlock" && (
        <div>
          <div
            className={`fv-drop${draggingUnlock ? " dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingUnlock(true);
            }}
            onDragLeave={() => setDraggingUnlock(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingUnlock(false);
              const f = e.dataTransfer.files?.[0];
              if (f && f.name.toLowerCase().endsWith(".vault")) resetUnlockFile(f);
              else setUnlockError(d.dropVaultOnly);
            }}
            onClick={() => vaultInputRef.current?.click()}
          >
            {vaultFile ? (
              <span className="fv-vault-name">
                {vaultFile.name} · {fmtSize(vaultFile.size)}
              </span>
            ) : (
              <>
                {d.unlockDropHint} <span className="fv-drop-link">{d.unlockDropClick}</span>
              </>
            )}
            <input
              ref={vaultInputRef}
              type="file"
              accept=".vault"
              hidden
              onChange={(e) => {
                resetUnlockFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>

          <div className="fv-controls">
            <label className="fv-field">
              <span>{d.unlockMethod}</span>
              <select
                className="fv-input"
                value={method}
                onChange={(e) => setMethod(e.target.value as "password" | "recovery")}
              >
                <option value="password">{d.methodPassword}</option>
                <option value="recovery">{d.methodRecovery}</option>
              </select>
            </label>
            <label className="fv-field fv-field-wide">
              <span>{method === "password" ? d.methodPassword : d.methodRecovery}</span>
              <input
                className="fv-input"
                type={method === "password" ? "password" : "text"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={method === "password" ? d.secretPhPw : d.secretPhRec}
                autoComplete="off"
              />
            </label>
          </div>

          {unlockError && <p className="fv-error">{unlockError}</p>}
          <div className="fv-actions">
            <button
              type="button"
              className="btn primary"
              disabled={!vaultFile || !secret || unlockBusy}
              onClick={handleUnlock}
            >
              {unlockBusy ? d.unlocking : d.unlockBtn}
            </button>
          </div>

          {unlocked && (
            <div className="fv-list-wrap">
              <div className="fv-list-head">
                <span>
                  {d.unlockedTitle} · {unlocked.manifest.files.length} · {d.totalSize}{" "}
                  {fmtSize(unlocked.manifest.files.reduce((a, f) => a + f.size, 0))}
                </span>
                <button type="button" className="btn primary small" disabled={zipping} onClick={downloadZip}>
                  {zipping ? d.zipping : d.downloadZip}
                </button>
              </div>
              <ul className="fv-list">
                {unlocked.manifest.files.map((f, i) => (
                  <li key={i} className="fv-row">
                    <span className="fv-row-path">{f.path}</span>
                    <span className="fv-row-size">{fmtSize(f.size)}</span>
                    <button
                      type="button"
                      className="btn ghost small"
                      disabled={extractingIdx !== null}
                      onClick={() => downloadOne(i)}
                    >
                      {extractingIdx === i ? d.extracting : d.downloadOne}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
