"use client";

import { useEffect, useState } from "react";
import {
  canvasToBlob,
  drawCover,
  makeCanvas,
  type OutFormat,
} from "@/lib/imagebox-utils";
import {
  DropZone,
  Field,
  FileThumbs,
  ResultList,
  useImgDict,
  type ImgResult,
} from "./shared";
import { useImageList } from "./useImageList";

const CELL = 480;

export default function CollageTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(8);
  const [bg, setBg] = useState("#ffffff");
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [results, setResults] = useState<ImgResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const run = async () => {
    if (list.items.length < 2) {
      list.setError(t.collage.needTwo);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      const n = list.items.length;
      const rows = Math.ceil(n / cols);
      const w = cols * CELL + (cols + 1) * gap;
      const h = rows * CELL + (rows + 1) * gap;
      const canvas = makeCanvas(w, h);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      list.items.forEach((it, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        drawCover(ctx, it.img, gap + c * (CELL + gap), gap + r * (CELL + gap), CELL, CELL);
      });
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.92);
      setResults([
        {
          name: format === "image/png" ? "collage.png" : "collage.jpg",
          blob,
        },
      ]);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      list.setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.collage.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={t.collage.cols}>
          <select value={cols} onChange={(e) => setCols(Number(e.target.value))}>
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${t.collage.gap}：${gap}`}>
          <input
            type="range"
            min={0}
            max={60}
            step={2}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
        </Field>
        <Field label={t.collage.bg}>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
        </Field>
        <Field label={t.compress.format}>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </Field>
      </div>
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void run()}>
          {busy ? t.processing : t.collage.exportBtn}
        </button>
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {previewUrl && (
        <div className="imgbox-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="collage" className="imgbox-big-preview" />
        </div>
      )}
      <ResultList results={results} />
    </div>
  );
}
