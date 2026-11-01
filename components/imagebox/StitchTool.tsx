"use client";

import { useEffect, useState } from "react";
import { canvasToBlob, makeCanvas, type OutFormat } from "@/lib/imagebox-utils";
import {
  DropZone,
  Field,
  FileThumbs,
  ResultList,
  useImgDict,
  type ImgResult,
} from "./shared";
import { useImageList } from "./useImageList";

type ScaleMode = "widest" | "narrowest" | "none";
type Align = "start" | "center" | "end";

export default function StitchTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [direction, setDirection] = useState<"v" | "h">("v");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("widest");
  const [align, setAlign] = useState<Align>("center");
  const [format, setFormat] = useState<OutFormat>("image/png");
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
      list.setError(t.stitch.needTwo);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      const vertical = direction === "v";
      // 主轴 = 纵向时的高、横向时的宽；副轴 = 纵向时的宽、横向时的高
      const cross = (it: (typeof list.items)[number]) =>
        vertical ? it.img.naturalWidth : it.img.naturalHeight;
      const main = (it: (typeof list.items)[number]) =>
        vertical ? it.img.naturalHeight : it.img.naturalWidth;

      let targetCross = Math.max(...list.items.map(cross));
      if (scaleMode === "narrowest") targetCross = Math.min(...list.items.map(cross));
      if (scaleMode === "none") targetCross = Math.max(...list.items.map(cross));

      const placed = list.items.map((it) => {
        const scale =
          scaleMode === "none" ? 1 : targetCross / cross(it);
        return {
          it,
          w: Math.round(it.img.naturalWidth * scale),
          h: Math.round(it.img.naturalHeight * scale),
          mainSize: Math.round(main(it) * scale),
          crossSize: Math.round(cross(it) * scale),
        };
      });
      const totalMain = placed.reduce((s, p) => s + p.mainSize, 0);
      const canvas = vertical
        ? makeCanvas(targetCross, totalMain)
        : makeCanvas(totalMain, targetCross);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let cursor = 0;
      for (const p of placed) {
        let off = 0;
        if (align === "center") off = Math.round((targetCross - p.crossSize) / 2);
        if (align === "end") off = targetCross - p.crossSize;
        if (vertical) ctx.drawImage(p.it.img, off, cursor, p.w, p.h);
        else ctx.drawImage(p.it.img, cursor, off, p.w, p.h);
        cursor += p.mainSize;
      }
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.92);
      const ext = format === "image/png" ? "png" : "jpg";
      setResults([{ name: `stitched.${ext}`, blob }]);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      list.setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.stitch.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={t.stitch.direction}>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "v" | "h")}>
            <option value="v">{t.stitch.vertical}</option>
            <option value="h">{t.stitch.horizontal}</option>
          </select>
        </Field>
        <Field label={t.stitch.scaleMode}>
          <select value={scaleMode} onChange={(e) => setScaleMode(e.target.value as ScaleMode)}>
            <option value="widest">{t.stitch.scaleWidest}</option>
            <option value="narrowest">{t.stitch.scaleNarrowest}</option>
            <option value="none">{t.stitch.scaleNone}</option>
          </select>
        </Field>
        <Field label={t.stitch.align}>
          <select value={align} onChange={(e) => setAlign(e.target.value as Align)}>
            <option value="start">{t.stitch.alignStart}</option>
            <option value="center">{t.stitch.alignCenter}</option>
            <option value="end">{t.stitch.alignEnd}</option>
          </select>
        </Field>
        <Field label={t.compress.format}>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
          </select>
        </Field>
      </div>
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void run()}>
          {busy ? t.processing : t.stitch.exportBtn}
        </button>
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {previewUrl && (
        <div className="imgbox-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="stitched" className="imgbox-big-preview" />
        </div>
      )}
      <ResultList results={results} />
    </div>
  );
}
