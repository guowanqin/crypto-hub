"use client";

import { useEffect, useState } from "react";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { downloadBlob } from "@/lib/engine";
import { makeCanvas } from "@/lib/imagebox-utils";
import {
  DropZone,
  Field,
  FileThumbs,
  useImgDict,
} from "./shared";
import { useImageList } from "./useImageList";

// 图片转 GIF：gifenc 纯 JS 编码（无 worker、无外部请求），在本页主线程内完成。
export default function GifTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const [interval, setIntervalMs] = useState(500);
  const [frameWidth, setFrameWidth] = useState(480);
  const [gifUrl, setGifUrl] = useState("");
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const run = async () => {
    if (list.items.length < 2) {
      list.setError(t.gif.needTwo);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      // 让出主线程一帧，先把「处理中」画出来
      await new Promise((r) => setTimeout(r, 30));
      const first = list.items[0].img;
      const fw = frameWidth;
      const fh = Math.max(
        1,
        Math.round((first.naturalHeight * fw) / first.naturalWidth)
      );
      const canvas = makeCanvas(fw, fh);
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const gif = GIFEncoder();
      list.items.forEach((it, i) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, fw, fh);
        ctx.drawImage(it.img, 0, 0, fw, fh);
        const { data } = ctx.getImageData(0, 0, fw, fh);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        if (i === 0) {
          gif.writeFrame(index, fw, fh, { palette, first: true, repeat: 0, delay: interval });
        } else {
          gif.writeFrame(index, fw, fh, { palette, delay: interval });
        }
      });
      gif.finish();
      const bytes = gif.bytes();
      const exact = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([exact], { type: "image/gif" });
      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
    } catch {
      list.setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.gif.desc}</p>
      <DropZone onFiles={(f) => void list.addFiles(f)} label={list.items.length ? t.addImages : undefined} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      <div className="imgbox-controls">
        <Field label={`${t.gif.interval}：${interval}`}>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={interval}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
          />
        </Field>
        <Field label={t.gif.frameWidth}>
          <select value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))}>
            {[320, 480, 640].map((n) => (
              <option key={n} value={n}>
                {n}px
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="imgbox-actions">
        <button type="button" className="btn primary" disabled={busy} onClick={() => void run()}>
          {busy ? t.processing : t.gif.run}
        </button>
        {gifBlob && (
          <button
            type="button"
            className="btn"
            onClick={() => downloadBlob(gifBlob, "animation.gif")}
          >
            ⬇ {t.download} GIF
          </button>
        )}
      </div>
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {gifUrl && (
        <>
          <p className="imgbox-note">{t.gif.resultNote}</p>
          <div className="imgbox-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gifUrl} alt="animated gif" className="imgbox-big-preview" />
          </div>
        </>
      )}
    </div>
  );
}
