"use client";

import { useEffect, useState } from "react";
import { downloadBlob } from "@/lib/engine";
import {
  canvasToBlob,
  computeTileRects,
  FORMAT_EXT,
  makeCanvas,
  outputName,
  type OutFormat,
} from "@/lib/imagebox-utils";
import {
  DropZone,
  Field,
  FileThumbs,
  ZipButton,
  useImgDict,
  type ImgResult,
} from "./shared";
import { useImageList } from "./useImageList";

export default function GridCutTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tiles, setTiles] = useState<ImgResult[]>([]);
  const [tileUrls, setTileUrls] = useState<string[]>([]);

  const item = list.items[0];

  useEffect(() => {
    let cancelled = false;
    setTiles([]);
    setTileUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return [];
    });
    if (!item) return;
    void (async () => {
      const mime: OutFormat =
        item.file.type === "image/png"
          ? "image/png"
          : item.file.type === "image/webp"
            ? "image/webp"
            : "image/jpeg";
      const rects = computeTileRects(
        item.img.naturalWidth,
        item.img.naturalHeight,
        rows,
        cols
      );
      const out: ImgResult[] = [];
      for (const r of rects) {
        const canvas = makeCanvas(r.w, r.h);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(item.img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : 0.92);
        out.push({
          name: outputName(item.file.name, `-${String(r.index).padStart(2, "0")}`, FORMAT_EXT[mime]),
          blob,
        });
      }
      if (cancelled) return;
      setTiles(out);
      setTileUrls(out.map((o) => URL.createObjectURL(o.blob)));
    })();
    return () => {
      cancelled = true;
    };
  }, [item, rows, cols]);

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.grid.desc}</p>
      <DropZone multiple={false} onFiles={(f) => void list.setSingle(f)} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={t.grid.rows}>
          <select value={rows} onChange={(e) => setRows(Number(e.target.value))}>
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.grid.cols}>
          <select value={cols} onChange={(e) => setCols(Number(e.target.value))}>
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {!item && <p className="imgbox-empty">{t.grid.needImage}</p>}
      {item && tiles.length > 0 && (
        <>
          <p className="imgbox-note">{t.grid.orderNote}</p>
          <div
            className="imgbox-grid-preview"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {tiles.map((tile, i) => (
              <button
                type="button"
                className="imgbox-tile"
                key={tile.name}
                onClick={() => downloadBlob(tile.blob, tile.name)}
                title={tile.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tileUrls[i]} alt={tile.name} />
                <span className="imgbox-tile-no">{i + 1}</span>
                <span className="imgbox-tile-dl">⬇</span>
              </button>
            ))}
          </div>
          <div className="imgbox-actions">
            <ZipButton results={tiles} zipName="grid-tiles.zip" />
          </div>
        </>
      )}
    </div>
  );
}
