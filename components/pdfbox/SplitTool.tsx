"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { baseName } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import {
  DropZone,
  Field,
  StatusLine,
  downloadBlob,
  loadPdfSource,
  parsePageRange,
  type PdfSource,
} from "./shared";

export default function SplitTool({ d }: { d: PdfDict }) {
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [mode, setMode] = useState<"range" | "each">("range");
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setError(null);
    setBusy(true);
    try {
      setSrc(await loadPdfSource(f));
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  async function doRange() {
    if (!src || busy) return;
    const idxs = parsePageRange(range, src.pageCount);
    if (!idxs) {
      setError(d.split.invalidRange);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const srcDoc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(srcDoc, idxs);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(src.file.name)}-extract.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  async function doEach() {
    if (!src || busy) return;
    setBusy(true);
    setError(null);
    try {
      const srcDoc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const zip = new JSZip();
      const base = baseName(src.file.name);
      for (let i = 0; i < src.pageCount; i++) {
        const out = await PDFDocument.create();
        const [p] = await out.copyPages(srcDoc, [i]);
        out.addPage(p);
        const bytes = await out.save();
        zip.file(`${base}-p${i + 1}.pdf`, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${base}-split.zip`);
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.split.desc}</p>
      <DropZone
        accept="application/pdf,.pdf"
        onFiles={(fs) => void onFile(fs)}
        hint={d.dropPdfHint}
        clickLabel={d.dropClick}
      />
      {src && (
        <p className="pdf-hint">
          {src.file.name} · {d.pagesUnit.replace("{n}", String(src.pageCount))}
        </p>
      )}
      <div className="pdf-modes" role="tablist" aria-label={d.tabs.split}>
        <button
          type="button"
          className={`pdf-mode-btn${mode === "range" ? " active" : ""}`}
          onClick={() => setMode("range")}
        >
          {d.split.modeRange}
        </button>
        <button
          type="button"
          className={`pdf-mode-btn${mode === "each" ? " active" : ""}`}
          onClick={() => setMode("each")}
        >
          {d.split.modeEach}
        </button>
      </div>
      {mode === "range" ? (
        <div className="pdf-controls">
          <Field label={d.split.rangeLabel}>
            <input
              className="pdf-input"
              type="text"
              value={range}
              placeholder={d.split.rangePlaceholder}
              onChange={(e) => setRange(e.target.value)}
            />
          </Field>
          <p className="pdf-hint">{d.split.rangeHint}</p>
          <div className="pdf-actions">
            <button type="button" className="btn primary" onClick={() => void doRange()} disabled={busy || !src}>
              {busy ? d.processing : d.split.btnRange}
            </button>
          </div>
        </div>
      ) : (
        <div className="pdf-actions">
          <button type="button" className="btn primary" onClick={() => void doEach()} disabled={busy || !src}>
            {busy ? d.processing : d.split.btnEach}
          </button>
        </div>
      )}
      <StatusLine busy={false} busyText="" error={error ?? (!src ? null : null)} />
      {!src && <p className="pdf-hint">{d.split.needFile}</p>}
    </div>
  );
}
