"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadBlob } from "@/lib/engine";
import { canvasToBlob, outputName } from "@/lib/imagebox-utils";
import { DropZone, Field, FileThumbs, useImgDict } from "./shared";
import { useImageList } from "./useImageList";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 把原图某个区域像素化画到 ctx 上（采样源始终是原图，重复渲染不叠加劣化） */
function pixelateRect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: Rect,
  block: number
) {
  const tw = Math.max(1, Math.round(rect.w / block));
  const th = Math.max(1, Math.round(rect.h / block));
  const tmp = document.createElement("canvas");
  tmp.width = tw;
  tmp.height = th;
  const tctx = tmp.getContext("2d")!;
  tctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, tw, th);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, tw, th, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

export default function MosaicTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const item = list.items[0];
  const [rects, setRects] = useState<Rect[]>([]);
  const [block, setBlock] = useState(16);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; cur: Rect } | null>(null);

  const render = useCallback(
    (extra?: Rect | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !item) return;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(item.img, 0, 0);
      const all = extra ? [...rects, extra] : rects;
      for (const r of all) pixelateRect(ctx, item.img, r, block);
      if (extra) {
        ctx.save();
        ctx.strokeStyle = "#b8912b";
        ctx.lineWidth = Math.max(2, item.img.naturalWidth / 300);
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(extra.x, extra.y, extra.w, extra.h);
        ctx.restore();
      }
    },
    [item, rects, block]
  );

  useEffect(() => {
    setRects([]);
  }, [item]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !item) return;
    canvas.width = item.img.naturalWidth;
    canvas.height = item.img.naturalHeight;
    render();
  }, [item, render]);

  const toCanvasCoords = (e: React.PointerEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * canvas.width,
      y: ((e.clientY - box.top) / box.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!item) return;
    const p = toCanvasCoords(e);
    dragRef.current = { startX: p.x, startY: p.y, cur: { x: p.x, y: p.y, w: 0, h: 0 } };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !item) return;
    const p = toCanvasCoords(e);
    const x = Math.min(drag.startX, p.x);
    const y = Math.min(drag.startY, p.y);
    drag.cur = {
      x,
      y,
      w: Math.abs(p.x - drag.startX),
      h: Math.abs(p.y - drag.startY),
    };
    render(drag.cur);
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || !item) return;
    const r = drag.cur;
    if (r.w >= 4 && r.h >= 4) {
      setRects((prev) => [
        ...prev,
        {
          x: Math.max(0, Math.round(r.x)),
          y: Math.max(0, Math.round(r.y)),
          w: Math.min(item.img.naturalWidth, Math.round(r.w)),
          h: Math.min(item.img.naturalHeight, Math.round(r.h)),
        },
      ]);
    } else {
      render();
    }
  };

  const exportImg = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !item) return;
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, outputName(item.file.name, "-mosaic", "png"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.mosaic.desc}</p>
      <DropZone multiple={false} onFiles={(f) => void list.setSingle(f)} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={`${t.mosaic.blockSize}：${block}px`}>
          <input
            type="range"
            min={6}
            max={48}
            step={2}
            value={block}
            onChange={(e) => setBlock(Number(e.target.value))}
          />
        </Field>
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {!item && <p className="imgbox-empty">{t.mosaic.needImage}</p>}
      {item && (
        <>
          <div className="imgbox-preview">
            <canvas
              ref={canvasRef}
              className="imgbox-canvas-preview imgbox-mosaic-canvas"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
          <div className="imgbox-actions">
            <span className="imgbox-note">
              {rects.length} {t.mosaic.rectsUnit}
            </span>
            <button
              type="button"
              className="btn ghost"
              disabled={rects.length === 0}
              onClick={() => setRects((prev) => prev.slice(0, -1))}
            >
              {t.mosaic.undo}
            </button>
            <button
              type="button"
              className="btn ghost"
              disabled={rects.length === 0}
              onClick={() => setRects([])}
            >
              {t.mosaic.clearRects}
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={busy || rects.length === 0}
              onClick={() => void exportImg()}
            >
              {busy ? t.processing : t.mosaic.exportBtn}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
