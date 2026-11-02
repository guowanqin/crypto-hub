"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { baseName, renderTextPng } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import {
  DropZone,
  Field,
  StatusLine,
  downloadBlob,
  loadPdfSource,
  type PdfSource,
} from "./shared";
import { useLang } from "../LangProvider";

type Pos = "tl" | "tc" | "tr" | "bl" | "bc" | "br";
type Fmt = "num" | "of" | "zh";

const MARGIN = 28;

export default function PageNumbersTool({ d }: { d: PdfDict }) {
  const { lang } = useLang();
  const [src, setSrc] = useState<PdfSource | null>(null);
  const [pos, setPos] = useState<Pos>("bc");
  const [fmt, setFmt] = useState<Fmt>("of");
  const [size, setSize] = useState(11);
  const [start, setStart] = useState(1);
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

  function label(n: number, total: number): string {
    if (fmt === "num") return `${n}`;
    if (fmt === "of") return `${n} / ${total}`;
    return lang === "tw" ? `第 ${n} 頁 共 ${total} 頁` : `第 ${n} 页 共 ${total} 页`;
  }

  async function apply() {
    if (!src || busy) return;
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const pages = doc.getPages();
      // 数字格式走矢量文字（Helvetica 画 ASCII）；中文格式走 Canvas PNG 贴图，
      // 两种都不依赖给 PDF 嵌入中文字体子集，中文不会变豆腐块。
      const font = fmt === "zh" ? null : await doc.embedFont(StandardFonts.Helvetica);
      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width: pw, height: ph } = page.getSize();
        const text = label(start + i, total);
        let w: number;
        let h: number;
        if (font) {
          w = font.widthOfTextAtSize(text, size);
          h = size;
        } else {
          const png = renderTextPng(text, { fontSizePt: size, color: "#333333" });
          const img = await doc.embedPng(png.bytes);
          w = png.widthPt;
          h = png.heightPt;
          const x = pos.endsWith("l") ? MARGIN : pos.endsWith("r") ? pw - MARGIN - w : (pw - w) / 2;
          const y = pos.startsWith("t") ? ph - MARGIN - h : MARGIN;
          page.drawImage(img, { x, y, width: w, height: h });
          continue;
        }
        const x = pos.endsWith("l") ? MARGIN : pos.endsWith("r") ? pw - MARGIN - w : (pw - w) / 2;
        const y = pos.startsWith("t") ? ph - MARGIN - h : MARGIN + 2;
        page.drawText(text, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
      }
      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(src.file.name)}-pagenumbers.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  const positions: Pos[] = ["tl", "tc", "tr", "bl", "bc", "br"];

  return (
    <div>
      <p className="pdf-desc">{d.numbers.desc}</p>
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
        <div className="pdf-controls-row">
          <Field label={d.numbers.posLabel}>
            <select className="pdf-input" value={pos} onChange={(e) => setPos(e.target.value as Pos)}>
              {positions.map((p) => (
                <option key={p} value={p}>
                  {d.numbers.pos[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={d.numbers.fmtLabel}>
            <select className="pdf-input" value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)}>
              <option value="num">{d.numbers.fmtNum}</option>
              <option value="of">{d.numbers.fmtOf}</option>
              <option value="zh">{d.numbers.fmtZh}</option>
            </select>
          </Field>
          <Field label={d.numbers.sizeLabel}>
            <input
              className="pdf-input"
              type="number"
              min={8}
              max={24}
              value={size}
              onChange={(e) => setSize(Number(e.target.value) || 11)}
            />
          </Field>
          <Field label={d.numbers.startLabel}>
            <input
              className="pdf-input"
              type="number"
              min={0}
              max={9999}
              value={start}
              onChange={(e) => setStart(Number(e.target.value) || 0)}
            />
          </Field>
        </div>
        <p className="pdf-hint">{d.numbers.note}</p>
      </div>
      <div className="pdf-actions">
        <button type="button" className="btn primary" onClick={() => void apply()} disabled={busy || !src}>
          {busy ? d.processing : d.numbers.btn}
        </button>
      </div>
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
