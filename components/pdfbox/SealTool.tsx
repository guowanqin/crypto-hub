"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { baseName, blobToImage, canvasToPngBytes, mmToPt } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import {
  DropZone,
  Field,
  StatusLine,
  downloadBlob,
  loadPdfSource,
  type PdfSource,
} from "./shared";

export default function SealTool({ d }: { d: PdfDict }) {
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [sealFile, setSealFile] = useState<File | null>(null);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [heightMm, setHeightMm] = useState(40);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function onSeal(files: File[]) {
    const f = files[0];
    if (!f) return;
    setSealFile(f);
    setSealUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  async function apply() {
    if (!src || !sealFile || busy) return;
    setBusy(true);
    setError(null);
    try {
      const img = await blobToImage(sealFile);
      const n = src.pageCount;
      const fullH = mmToPt(heightMm); // 整枚章的显示高度（pt）
      const fullW = fullH * (img.naturalWidth / img.naturalHeight);

      // 把章图按页数在 x 方向均分切片：第 i 片取源图 [x_i, x_{i+1})，
      // 边界按累计比例取整，保证切片首尾相接、拼起来无缝。
      const bounds: number[] = [];
      for (let i = 0; i <= n; i++) bounds.push(Math.round((img.naturalWidth * i) / n));

      const doc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      for (let i = 0; i < n; i++) {
        const sx = bounds[i];
        const sw = Math.max(1, bounds[i + 1] - bounds[i]);
        const strip = document.createElement("canvas");
        strip.width = sw;
        strip.height = img.naturalHeight;
        const g = strip.getContext("2d")!;
        g.drawImage(img, sx, 0, sw, img.naturalHeight, 0, 0, sw, img.naturalHeight);
        const pngBytes = await canvasToPngBytes(strip);
        const embedded = await doc.embedPng(pngBytes);
        const page = pages[i];
        const { width: pw, height: ph } = page.getSize();
        const stripW = (fullW * sw) / img.naturalWidth;
        page.drawImage(embedded, {
          x: pw - stripW, // 贴页面右边缘
          y: (ph - fullH) / 2, // 垂直居中
          width: stripW,
          height: fullH,
        });
      }
      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(src.file.name)}-sealed.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.seal.desc}</p>
      <div className="pdf-controls-row">
        <div className="pdf-half">
          <p className="pdf-field-label">{d.seal.pdfLabel}</p>
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
        </div>
        <div className="pdf-half">
          <p className="pdf-field-label">{d.seal.sealLabel}</p>
          <DropZone
            accept="image/png,image/*"
            onFiles={onSeal}
            hint={d.dropSealHint}
            clickLabel={d.dropClick}
          />
          {sealUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sealUrl} alt="" className="pdf-seal-preview" />
          )}
        </div>
      </div>
      <div className="pdf-controls">
        <Field label={d.seal.heightLabel}>
          <input
            className="pdf-input"
            type="number"
            min={10}
            max={120}
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value) || 40)}
          />
        </Field>
        <p className="pdf-hint">{d.seal.heightHint}</p>
        {src && <p className="pdf-hint">{d.seal.info.replace("{pages}", String(src.pageCount))}</p>}
      </div>
      <div className="pdf-actions">
        <button type="button" className="btn primary" onClick={() => void apply()} disabled={busy || !src || !sealFile}>
          {busy ? d.processing : d.seal.btn}
        </button>
      </div>
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
