"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  canvasToBlob,
  FORMAT_EXT,
  outputName,
  type OutFormat,
} from "@/lib/imagebox-utils";
import {
  DropZone,
  Field,
  FileThumbs,
  ResultList,
  ZipButton,
  useImgDict,
  type ImgResult,
} from "./shared";
import { useImageList } from "./useImageList";

interface WmParams {
  text: string;
  pos: number; // 0-8 九宫格
  opacity: number;
  sizePct: number; // 字号占图宽百分比
  color: string;
}

function renderWatermark(img: HTMLImageElement, p: WmParams): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const text = p.text.trim();
  if (text) {
    const fontPx = Math.max(10, Math.round((canvas.width * p.sizePct) / 100));
    ctx.font = `700 ${fontPx}px sans-serif`;
    const pad = Math.round(fontPx * 0.7);
    const tw = ctx.measureText(text).width;
    const col = p.pos % 3;
    const row = Math.floor(p.pos / 3);
    let x = pad;
    if (col === 1) x = (canvas.width - tw) / 2;
    if (col === 2) x = canvas.width - tw - pad;
    let y = pad;
    if (row === 1) y = (canvas.height - fontPx) / 2;
    if (row === 2) y = canvas.height - fontPx - pad;
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.max(2, fontPx / 8);
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  return canvas;
}

export default function WatermarkTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [params, setParams] = useState<WmParams>({
    text: "",
    pos: 8,
    opacity: 0.6,
    sizePct: 4,
    color: "#ffffff",
  });
  const [results, setResults] = useState<ImgResult[]>([]);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const first = list.items[0];

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !first) return;
    const rendered = renderWatermark(first.img, params);
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    canvas.getContext("2d")!.drawImage(rendered, 0, 0);
  }, [first, params]);

  const exportAll = useCallback(async () => {
    if (list.items.length === 0) {
      list.setError(t.watermark.needImage);
      return;
    }
    if (!params.text.trim()) {
      list.setError(t.watermark.textPlaceholder);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      const out: ImgResult[] = [];
      for (const it of list.items) {
        const canvas = renderWatermark(it.img, params);
        const mime: OutFormat =
          it.file.type === "image/png"
            ? "image/png"
            : it.file.type === "image/webp"
              ? "image/webp"
              : "image/jpeg";
        const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : 0.92);
        out.push({
          name: outputName(it.file.name, "-wm", FORMAT_EXT[mime]),
          blob,
          origSize: it.file.size,
        });
      }
      setResults(out);
    } catch {
      list.setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  }, [list, params, t]);

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.watermark.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={t.watermark.text}>
          <input
            type="text"
            value={params.text}
            placeholder={t.watermark.textPlaceholder}
            onChange={(e) => setParams((p) => ({ ...p, text: e.target.value }))}
          />
        </Field>
        <Field label={t.watermark.position}>
          <select
            value={params.pos}
            onChange={(e) => setParams((p) => ({ ...p, pos: Number(e.target.value) }))}
          >
            {t.watermark.positions.map((name, i) => (
              <option value={i} key={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${t.watermark.opacity}：${Math.round(params.opacity * 100)}%`}>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={params.opacity}
            onChange={(e) => setParams((p) => ({ ...p, opacity: Number(e.target.value) }))}
          />
        </Field>
        <Field label={`${t.watermark.fontSize}：${params.sizePct}%`}>
          <input
            type="range"
            min={1.5}
            max={12}
            step={0.5}
            value={params.sizePct}
            onChange={(e) => setParams((p) => ({ ...p, sizePct: Number(e.target.value) }))}
          />
        </Field>
        <Field label={t.watermark.color}>
          <input
            type="color"
            value={params.color}
            onChange={(e) => setParams((p) => ({ ...p, color: e.target.value }))}
          />
        </Field>
      </div>
      {first ? (
        <div className="imgbox-preview">
          <canvas ref={previewRef} className="imgbox-canvas-preview" />
        </div>
      ) : (
        <p className="imgbox-empty">{t.watermark.needImage}</p>
      )}
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void exportAll()}>
          {busy ? t.processing : t.watermark.exportAll}
        </button>
        <ZipButton results={results} zipName="watermarked-images.zip" />
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      <ResultList results={results} />
    </div>
  );
}
