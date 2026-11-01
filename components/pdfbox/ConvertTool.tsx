"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { A4, baseName, blobToImage, canvasToPngBytes, getPdfJs } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import {
  DropZone,
  Field,
  StatusLine,
  downloadBlob,
  loadPdfSource,
  formatBytes,
  type PdfSource,
} from "./shared";

interface ImgItem {
  id: number;
  file: File;
}

export default function ConvertTool({ d }: { d: PdfDict }) {
  const [mode, setMode] = useState<"img2pdf" | "pdf2img">("img2pdf");

  // —— 图片转 PDF ——
  const [images, setImages] = useState<ImgItem[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "orig">("a4");
  const idRef = useRef(0);

  // —— PDF 转图片 ——
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [scale, setScale] = useState(2);
  const [fmt, setFmt] = useState<"png" | "jpg">("png");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addImages(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [
      ...prev,
      ...imgs.map((file) => ({ id: ++idRef.current, file })),
    ]);
  }

  async function buildPdf() {
    if (images.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.create();
      for (const item of images) {
        const f = item.file;
        let embedded;
        let iw: number;
        let ih: number;
        if (f.type === "image/jpeg") {
          const bytes = new Uint8Array(await f.arrayBuffer());
          embedded = await doc.embedJpg(bytes);
          iw = embedded.width;
          ih = embedded.height;
        } else if (f.type === "image/png") {
          const bytes = new Uint8Array(await f.arrayBuffer());
          embedded = await doc.embedPng(bytes);
          iw = embedded.width;
          ih = embedded.height;
        } else {
          // 其它格式（WebP/GIF/BMP…）先经 Canvas 归一成 PNG 再嵌入
          const img = await blobToImage(f);
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          embedded = await doc.embedPng(await canvasToPngBytes(canvas));
          iw = img.naturalWidth;
          ih = img.naturalHeight;
        }
        if (pageSize === "orig") {
          const page = doc.addPage([iw, ih]);
          page.drawImage(embedded, { x: 0, y: 0, width: iw, height: ih });
        } else {
          const page = doc.addPage([A4.width, A4.height]);
          const margin = 36;
          const s = Math.min((A4.width - margin * 2) / iw, (A4.height - margin * 2) / ih);
          const w = iw * s;
          const h = ih * s;
          page.drawImage(embedded, {
            x: (A4.width - w) / 2,
            y: (A4.height - h) / 2,
            width: w,
            height: h,
          });
        }
      }
      const bytes = await doc.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "images.pdf");
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  async function onPdf(files: File[]) {
    const f = files[0];
    if (!f) return;
    setError(null);
    try {
      setSrc(await loadPdfSource(f));
    } catch {
      setError(d.failed);
    }
  }

  async function buildImages() {
    if (!src || busy) return;
    setBusy(true);
    setError(null);
    try {
      const pdfjs = await getPdfJs();
      const pdf = await pdfjs.getDocument({ data: src.bytes.slice() }).promise;
      const zip = new JSZip();
      const base = baseName(src.file.name);
      try {
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d")!;
          if (fmt === "jpg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, fmt === "png" ? "image/png" : "image/jpeg", 0.92)
          );
          if (!blob) throw new Error("render failed");
          zip.file(`${base}-p${i}.${fmt}`, new Uint8Array(await blob.arrayBuffer()));
        }
      } finally {
        void pdf.destroy();
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${base}-images.zip`);
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.convert.desc}</p>
      <div className="pdf-modes" role="tablist" aria-label={d.tabs.convert}>
        <button
          type="button"
          className={`pdf-mode-btn${mode === "img2pdf" ? " active" : ""}`}
          onClick={() => setMode("img2pdf")}
        >
          {d.convert.modeImg2Pdf}
        </button>
        <button
          type="button"
          className={`pdf-mode-btn${mode === "pdf2img" ? " active" : ""}`}
          onClick={() => setMode("pdf2img")}
        >
          {d.convert.modePdf2Img}
        </button>
      </div>

      {mode === "img2pdf" ? (
        <>
          <DropZone
            accept="image/*"
            multiple
            onFiles={addImages}
            hint={d.dropImgHint}
            clickLabel={d.dropClick}
          />
          {images.length === 0 ? (
            <p className="pdf-hint">{d.convert.emptyImg}</p>
          ) : (
            <ul className="pdf-filelist">
              {images.map((it) => (
                <li className="pdf-fileitem" key={it.id}>
                  <span className="pdf-filemain">
                    <span className="pdf-filename">{it.file.name}</span>
                    <span className="pdf-filemeta">{formatBytes(it.file.size)}</span>
                  </span>
                  <span className="pdf-filebtns">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setImages((prev) => prev.filter((x) => x.id !== it.id))}
                    >
                      {d.remove}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="pdf-controls">
            <Field label={d.convert.sizeLabel}>
              <select className="pdf-input" value={pageSize} onChange={(e) => setPageSize(e.target.value as "a4" | "orig")}>
                <option value="a4">{d.convert.sizeA4}</option>
                <option value="orig">{d.convert.sizeOrig}</option>
              </select>
            </Field>
          </div>
          <div className="pdf-actions">
            <button type="button" className="btn primary" onClick={() => void buildPdf()} disabled={busy || images.length === 0}>
              {busy ? d.processing : d.convert.btnImg}
            </button>
          </div>
        </>
      ) : (
        <>
          <DropZone
            accept="application/pdf,.pdf"
            onFiles={(fs) => void onPdf(fs)}
            hint={d.dropPdfHint}
            clickLabel={d.dropClick}
          />
          {src && (
            <p className="pdf-hint">
              {src.file.name} · {d.pagesUnit.replace("{n}", String(src.pageCount))}
            </p>
          )}
          <div className="pdf-controls">
            <div className="pdf-controls-row">
              <Field label={d.convert.scaleLabel}>
                <select className="pdf-input" value={scale} onChange={(e) => setScale(Number(e.target.value))}>
                  <option value={1}>1×</option>
                  <option value={1.5}>1.5×</option>
                  <option value={2}>2×</option>
                  <option value={3}>3×</option>
                </select>
              </Field>
              <Field label={d.convert.fmtLabel}>
                <select className="pdf-input" value={fmt} onChange={(e) => setFmt(e.target.value as "png" | "jpg")}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="pdf-actions">
            <button type="button" className="btn primary" onClick={() => void buildImages()} disabled={busy || !src}>
              {busy ? d.processing : d.convert.btnPdf}
            </button>
          </div>
        </>
      )}
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
