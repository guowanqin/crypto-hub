"use client";

import { useState } from "react";
import {
  canvasToBlob,
  computeTargetSize,
  FORMAT_EXT,
  makeCanvas,
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

type Mode = "width" | "height" | "exact";

export default function ResizeTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [mode, setMode] = useState<Mode>("width");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [results, setResults] = useState<ImgResult[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (list.items.length === 0) {
      list.setError(t.errNoImages);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      const out: ImgResult[] = [];
      for (const it of list.items) {
        const { w, h } = computeTargetSize(
          it.img.naturalWidth,
          it.img.naturalHeight,
          mode,
          width,
          height
        );
        const canvas = makeCanvas(w, h);
        const ctx = canvas.getContext("2d")!;
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(it.img, 0, 0, w, h);
        const blob = await canvasToBlob(
          canvas,
          format,
          format === "image/png" ? undefined : quality
        );
        out.push({
          name: outputName(it.file.name, `-${w}x${h}`, FORMAT_EXT[format]),
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
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.resize.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={t.resize.mode}>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="width">{t.resize.modeWidth}</option>
            <option value="height">{t.resize.modeHeight}</option>
            <option value="exact">{t.resize.modeExact}</option>
          </select>
        </Field>
        {(mode === "width" || mode === "exact") && (
          <Field label={t.resize.width}>
            <input
              type="number"
              min={1}
              max={20000}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </Field>
        )}
        {(mode === "height" || mode === "exact") && (
          <Field label={t.resize.height}>
            <input
              type="number"
              min={1}
              max={20000}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </Field>
        )}
        <Field label={t.resize.format}>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </Field>
        <Field label={`${t.resize.quality}：${Math.round(quality * 100)}%`}>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </Field>
      </div>
      <p className="imgbox-note">{t.resize.keepRatioNote}</p>
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void run()}>
          {busy ? t.processing : t.resize.run}
        </button>
        <ZipButton results={results} zipName="resized-images.zip" />
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {results.length > 0 ? (
        <ResultList results={results} />
      ) : (
        <p className="imgbox-empty">{t.resize.empty}</p>
      )}
    </div>
  );
}
