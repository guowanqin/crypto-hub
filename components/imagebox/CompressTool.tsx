"use client";

import { useState } from "react";
import {
  canvasToBlob,
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

export default function CompressTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
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
        const canvas = makeCanvas(it.img.naturalWidth, it.img.naturalHeight);
        const ctx = canvas.getContext("2d")!;
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(it.img, 0, 0);
        const blob = await canvasToBlob(
          canvas,
          format,
          format === "image/png" ? undefined : quality
        );
        out.push({
          name: outputName(it.file.name, "-min", FORMAT_EXT[format]),
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
      <p className="imgbox-desc">{t.compress.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={`${t.compress.quality}：${Math.round(quality * 100)}%`}>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </Field>
        <Field label={t.compress.format}>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </Field>
      </div>
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void run()}>
          {busy ? t.processing : t.compress.run}
        </button>
        <ZipButton results={results} zipName="compressed-images.zip" />
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {results.length > 0 ? (
        <ResultList results={results} />
      ) : (
        <p className="imgbox-empty">{t.compress.empty}</p>
      )}
    </div>
  );
}
