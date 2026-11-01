"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/engine";
import { fileToBytes, formatBytes } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";

export { downloadBlob, formatBytes };

/** 一个已加载的源 PDF（字节 + 页数），多个子工具共用。 */
export interface PdfSource {
  file: File;
  bytes: Uint8Array;
  pageCount: number;
}

export async function loadPdfSource(file: File): Promise<PdfSource> {
  const bytes = await fileToBytes(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return { file, bytes, pageCount: doc.getPageCount() };
}

/** 拖放 / 点击上传区（样式沿用 pdf-drop）。 */
export function DropZone({
  accept,
  multiple,
  onFiles,
  hint,
  clickLabel,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint: string;
  clickLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  }

  return (
    <div
      className={`pdf-drop${dragging ? " dragging" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="pdf-drop-text">
        {hint}
        <span className="pdf-drop-link">{clickLabel}</span>
      </p>
    </div>
  );
}

/** 忙碌/错误行：处理时显示转圈文案，出错显示红色提示。 */
export function StatusLine({
  busy,
  busyText,
  error,
}: {
  busy: boolean;
  busyText: string;
  error: string | null;
}) {
  if (error) return <p className="pdf-error">{error}</p>;
  if (busy) return <p className="pdf-busy">{busyText}</p>;
  return null;
}

/** 解析页码范围串 "1-3,5,8-10" → 0 基页序号数组（按书写顺序，允许重复）。非法返回 null。 */
export function parsePageRange(spec: string, total: number): number[] | null {
  const out: number[] = [];
  const parts = spec.split(/[,，、\s]+/).filter(Boolean);
  if (parts.length === 0) return null;
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    if (a < 1 || b < a || b > total) return null;
    for (let p = a; p <= b; p++) out.push(p - 1);
  }
  return out.length > 0 ? out : null;
}

/** 常用表单控件行（label + children），样式与全站表单口径一致。 */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="pdf-field">
      <span className="pdf-field-label">{label}</span>
      {children}
    </label>
  );
}

export type { PdfDict };
