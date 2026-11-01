"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { baseName, renderTextPng } from "@/lib/pdfcore";
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

export default function WatermarkTool({ d }: { d: PdfDict }) {
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [text, setText] = useState("");
  const [size, setSize] = useState(36);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(-30);
  const [layout, setLayout] = useState<"tile" | "center">("tile");
  const [scope, setScope] = useState<"all" | "range">("all");
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setError(null);
    try {
      setSrc(await loadPdfSource(f));
    } catch {
      setError(d.failed);
    }
  }

  async function apply() {
    if (!src || busy) return;
    if (!text.trim()) {
      setError(d.watermark.textLabel);
      return;
    }
    let targets: number[] | null = null;
    if (scope === "range") {
      targets = parsePageRange(range, src.pageCount);
      if (!targets) {
        setError(d.split.invalidRange);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      // 文字先绘成透明 PNG 再贴入：中文不依赖 PDF 内嵌字体，天然不乱码。
      const png = renderTextPng(text.trim(), {
        fontSizePt: size,
        color: "#8a8a8a",
        opacity,
        rotateDeg: layout === "tile" ? angle : angle,
        bold: true,
      });
      const img = await doc.embedPng(png.bytes);
      const targetSet = targets ? new Set(targets) : null;
      doc.getPages().forEach((page, i) => {
        if (targetSet && !targetSet.has(i)) return;
        const { width: pw, height: ph } = page.getSize();
        if (layout === "center") {
          page.drawImage(img, {
            x: (pw - png.widthPt) / 2,
            y: (ph - png.heightPt) / 2,
            width: png.widthPt,
            height: png.heightPt,
          });
        } else {
          const gapX = png.widthPt + size * 1.4;
          const gapY = png.heightPt + size * 2.2;
          for (let x = -png.widthPt; x < pw + png.widthPt; x += gapX) {
            for (let y = -png.heightPt; y < ph + png.heightPt; y += gapY) {
              page.drawImage(img, { x, y, width: png.widthPt, height: png.heightPt });
            }
          }
        }
      });
      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(src.file.name)}-watermark.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.watermark.desc}</p>
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
      <div className="pdf-controls">
        <Field label={d.watermark.textLabel}>
          <input className="pdf-input" type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="pdf-controls-row">
          <Field label={d.watermark.sizeLabel}>
            <input
              className="pdf-input"
              type="number"
              min={8}
              max={120}
              value={size}
              onChange={(e) => setSize(Number(e.target.value) || 36)}
            />
          </Field>
          <Field label={d.watermark.opacityLabel}>
            <input
              className="pdf-input"
              type="number"
              min={0.05}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Math.min(1, Math.max(0.05, Number(e.target.value) || 0.25)))}
            />
          </Field>
          <Field label={d.watermark.angleLabel}>
            <input
              className="pdf-input"
              type="number"
              min={-90}
              max={90}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value) || 0)}
            />
          </Field>
        </div>
        <div className="pdf-controls-row">
          <Field label={d.watermark.layoutLabel}>
            <select className="pdf-input" value={layout} onChange={(e) => setLayout(e.target.value as "tile" | "center")}>
              <option value="tile">{d.watermark.layoutTile}</option>
              <option value="center">{d.watermark.layoutCenter}</option>
            </select>
          </Field>
          <Field label={d.watermark.scopeLabel}>
            <select className="pdf-input" value={scope} onChange={(e) => setScope(e.target.value as "all" | "range")}>
              <option value="all">{d.watermark.scopeAll}</option>
              <option value="range">{d.watermark.scopeRange}</option>
            </select>
          </Field>
          {scope === "range" && (
            <Field label={d.watermark.rangeLabel}>
              <input
                className="pdf-input"
                type="text"
                value={range}
                placeholder={d.split.rangePlaceholder}
                onChange={(e) => setRange(e.target.value)}
              />
            </Field>
          )}
        </div>
      </div>
      <div className="pdf-actions">
        <button type="button" className="btn primary" onClick={() => void apply()} disabled={busy || !src}>
          {busy ? d.processing : d.watermark.btn}
        </button>
      </div>
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
