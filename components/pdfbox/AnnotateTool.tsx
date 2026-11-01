"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import { baseName, getPdfJs, renderTextPng } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import {
  DropZone,
  Field,
  StatusLine,
  downloadBlob,
  loadPdfSource,
  type PdfSource,
} from "./shared";

interface Note {
  id: number;
  /** 0 基页序号 */
  page: number;
  /** PDF 坐标（原点左下）：标注文字图片的左上角锚点 */
  pdfX: number;
  pdfY: number;
  /** 预览上的相对位置（0–1），用于画标记点 */
  fx: number;
  fy: number;
  /** 供列表展示：距页面左上角的 pt 值 */
  xFromLeft: number;
  yFromTop: number;
  text: string;
  size: number;
  color: string;
}

const COLORS = ["#dc2626", "#1d4ed8", "#111111", "#059669", "#d97706"];

export default function AnnotateTool({ d }: { d: PdfDict }) {
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [size, setSize] = useState(14);
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const pageSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const idRef = useRef(0);
  const renderToken = useRef(0);

  async function renderPage(bytes: Uint8Array, pageNum1: number) {
    const token = ++renderToken.current;
    const pdfjs = await getPdfJs();
    if (!pdfRef.current) {
      pdfRef.current = await pdfjs.getDocument({ data: bytes.slice() }).promise;
    }
    const page = await pdfRef.current.getPage(pageNum1);
    const base = page.getViewport({ scale: 1 });
    pageSizeRef.current = { w: base.width, h: base.height };
    const scale = Math.min(740 / base.width, 2);
    const viewport = page.getViewport({ scale });
    viewportRef.current = viewport;
    const canvas = canvasRef.current;
    if (!canvas || renderToken.current !== token) return;
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  useEffect(() => {
    if (src) void renderPage(src.bytes, pageIdx + 1).catch(() => setError(d.failed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, pageIdx]);

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setError(null);
    try {
      if (pdfRef.current) {
        void pdfRef.current.destroy();
        pdfRef.current = null;
      }
      const loaded = await loadPdfSource(f);
      setSrc(loaded);
      setPageIdx(0);
      setNotes([]);
    } catch {
      setError(d.failed);
    }
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport || !src) return;
    if (!text.trim()) {
      setError(`${d.annotate.textLabel}: ${d.annotate.textPlaceholder}`);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const vx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const vy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const [pdfX, pdfY] = viewport.convertToPdfPoint(vx, vy);
    const { h } = pageSizeRef.current;
    const note: Note = {
      id: ++idRef.current,
      page: pageIdx,
      pdfX,
      pdfY,
      fx: vx / canvas.width,
      fy: vy / canvas.height,
      xFromLeft: Math.round(pdfX),
      yFromTop: Math.round(h - pdfY),
      text: text.trim(),
      size,
      color,
    };
    setNotes((prev) => [...prev, note]);
    setError(null);
  }

  async function apply() {
    if (!src || busy) return;
    if (notes.length === 0) {
      setError(d.annotate.needMark);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      for (const note of notes) {
        const png = renderTextPng(note.text, {
          fontSizePt: note.size,
          color: note.color,
          bold: true,
        });
        const img = await doc.embedPng(png.bytes);
        // pdfY 是文字左上角锚点（PDF 原点在左下），图片向下展开
        pages[note.page].drawImage(img, {
          x: note.pdfX,
          y: note.pdfY - png.heightPt,
          width: png.widthPt,
          height: png.heightPt,
        });
      }
      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(src.file.name)}-annotated.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  const pageNotes = notes.filter((n) => n.page === pageIdx);

  return (
    <div>
      <p className="pdf-desc">{d.annotate.desc}</p>
      <DropZone
        accept="application/pdf,.pdf"
        onFiles={(fs) => void onFile(fs)}
        hint={d.dropPdfHint}
        clickLabel={d.dropClick}
      />
      {src && (
        <>
          <div className="pdf-controls">
            <div className="pdf-controls-row">
              <Field label={d.annotate.textLabel}>
                <input
                  className="pdf-input"
                  type="text"
                  value={text}
                  placeholder={d.annotate.textPlaceholder}
                  onChange={(e) => setText(e.target.value)}
                />
              </Field>
              <Field label={d.annotate.sizeLabel}>
                <input
                  className="pdf-input"
                  type="number"
                  min={8}
                  max={48}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value) || 14)}
                />
              </Field>
              <Field label={d.annotate.colorLabel}>
                <span className="pdf-swatches">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`pdf-swatch${color === c ? " on" : ""}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                      aria-label={c}
                    />
                  ))}
                </span>
              </Field>
            </div>
          </div>
          <div className="pdf-pagenav">
            <button
              type="button"
              className="btn small"
              onClick={() => setPageIdx((v) => Math.max(0, v - 1))}
              disabled={pageIdx === 0}
            >
              ←
            </button>
            <span>
              {d.annotate.pageLabel
                .replace("{cur}", String(pageIdx + 1))
                .replace("{total}", String(src.pageCount))}
            </span>
            <button
              type="button"
              className="btn small"
              onClick={() => setPageIdx((v) => Math.min(src.pageCount - 1, v + 1))}
              disabled={pageIdx >= src.pageCount - 1}
            >
              →
            </button>
          </div>
          <p className="pdf-hint">{d.annotate.clickHint}</p>
          <div className="pdf-preview-wrap">
            <div className="pdf-preview-inner">
              <canvas ref={canvasRef} className="pdf-preview" onClick={onCanvasClick} />
              {pageNotes.map((n, i) => (
                <span
                  key={n.id}
                  className="pdf-mark"
                  style={{ left: `${n.fx * 100}%`, top: `${n.fy * 100}%`, background: n.color }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
          <h3 className="pdf-sub">{d.annotate.listTitle}</h3>
          {notes.length === 0 ? (
            <p className="pdf-hint">{d.annotate.listEmpty}</p>
          ) : (
            <ul className="pdf-filelist">
              {notes.map((n) => (
                <li className="pdf-fileitem" key={n.id}>
                  <span className="pdf-filemain">
                    <span className="pdf-filename">
                      #{n.page + 1} · {n.text}
                    </span>
                    <span className="pdf-filemeta">
                      {d.annotate.markAt
                        .replace("{x}", String(n.xFromLeft))
                        .replace("{y}", String(n.yFromTop))}
                    </span>
                  </span>
                  <span className="pdf-filebtns">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))}
                    >
                      {d.remove}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="pdf-actions">
            <button type="button" className="btn primary" onClick={() => void apply()} disabled={busy}>
              {busy ? d.processing : d.annotate.btn}
            </button>
          </div>
        </>
      )}
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
