"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { fileToBytes, formatBytes } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import { DropZone, StatusLine, downloadBlob } from "./shared";

interface MergeItem {
  id: number;
  file: File;
  pageCount: number | null;
  bad?: boolean;
}

export default function MergeTool({ d }: { d: PdfDict }) {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);

  const totalPages = items.reduce((n, it) => n + (it.pageCount ?? 0), 0);

  async function addFiles(files: File[]) {
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name)
    );
    for (const file of pdfs) {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, file, pageCount: null }]);
      try {
        const bytes = await fileToBytes(file);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, pageCount: doc.getPageCount() } : it))
        );
      } catch {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, pageCount: 0, bad: true } : it))
        );
      }
    }
  }

  function move(idx: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  async function doMerge() {
    if (items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = await PDFDocument.load(await fileToBytes(it.file), {
          ignoreEncryption: true,
        });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        "merged.pdf"
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.merge.desc}</p>
      <DropZone
        accept="application/pdf,.pdf"
        multiple
        onFiles={(fs) => void addFiles(fs)}
        hint={d.dropPdfHint}
        clickLabel={d.dropClick}
      />
      {items.length === 0 ? (
        <p className="pdf-hint">{d.merge.empty}</p>
      ) : (
        <>
          <ul className="pdf-filelist">
            {items.map((it, idx) => (
              <li className="pdf-fileitem" key={it.id}>
                <span className="pdf-filemain">
                  <span className="pdf-filename">{it.file.name}</span>
                  <span className="pdf-filemeta">
                    {formatBytes(it.file.size)}
                    {it.pageCount !== null &&
                      ` · ${d.pagesUnit.replace("{n}", String(it.pageCount))}`}
                    {it.bad ? ` · ${d.failed}` : ""}
                  </span>
                </span>
                <span className="pdf-filebtns">
                  <button type="button" className="btn small" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    ↑ {d.moveUp}
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                  >
                    ↓ {d.moveDown}
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                  >
                    {d.remove}
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className="pdf-actions">
            <span className="pdf-count">
              {d.merge.outLabel
                .replace("{files}", String(items.length))
                .replace("{pages}", String(totalPages))}
            </span>
            <button type="button" className="btn primary" onClick={() => void doMerge()} disabled={busy}>
              {busy ? d.processing : d.merge.btn}
            </button>
          </div>
        </>
      )}
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
