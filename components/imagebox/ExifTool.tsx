"use client";

import { useEffect, useState } from "react";
import exifr from "exifr";
import { downloadBlob } from "@/lib/engine";
import {
  canvasToBlob,
  FORMAT_EXT,
  makeCanvas,
  outputName,
  type OutFormat,
} from "@/lib/imagebox-utils";
import { DropZone, FileThumbs, useImgDict } from "./shared";
import { useImageList } from "./useImageList";

interface ExifSummary {
  make?: string;
  model?: string;
  takenAt?: string;
  software?: string;
  gps: boolean;
  hasAny: boolean;
}

// 只解析 TIFF 系的真实照片 EXIF（IFD0/Exif/GPS），排除 JFIF 头与 ICC 色彩描述：
// 后者是编码器给每张图都写的标准字段（如 Chrome canvas 导出的 sRGB ICC），
// 不含设备/时间/位置信息，不能算作 EXIF 残留。
const EXIF_PARSE_OPTS = {
  jfif: false,
  icc: false,
  xmp: false,
  iptc: false,
  ihdr: false,
} as const;

async function readSummary(blob: Blob): Promise<ExifSummary> {
  try {
    const data: Record<string, unknown> | undefined = await exifr.parse(blob, EXIF_PARSE_OPTS);
    if (!data) return { gps: false, hasAny: false };
    const keys = Object.keys(data);
    const gps =
      data.latitude !== undefined ||
      data.longitude !== undefined ||
      data.GPSLatitude !== undefined ||
      data.GPSLongitude !== undefined;
    const taken = data.DateTimeOriginal ?? data.CreateDate ?? data.ModifyDate;
    return {
      make: typeof data.Make === "string" ? data.Make : undefined,
      model: typeof data.Model === "string" ? data.Model : undefined,
      takenAt:
        taken instanceof Date
          ? taken.toLocaleString()
          : typeof taken === "string"
            ? taken
            : undefined,
      software: typeof data.Software === "string" ? data.Software : undefined,
      gps,
      hasAny: keys.length > 0,
    };
  } catch {
    return { gps: false, hasAny: false };
  }
}

export default function ExifTool() {
  const { t } = useImgDict();
  const list = useImageList();
  const item = list.items[0];
  const [summary, setSummary] = useState<ExifSummary | null>(null);
  const [clean, setClean] = useState<{ blob: Blob; name: string; verified: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSummary(null);
    setClean(null);
    if (!item) return;
    let cancelled = false;
    void readSummary(item.file).then((s) => {
      if (!cancelled) setSummary(s);
    });
    return () => {
      cancelled = true;
    };
  }, [item]);

  const strip = async () => {
    if (!item) {
      list.setError(t.exif.needImage);
      return;
    }
    setBusy(true);
    list.setError("");
    try {
      const mime: OutFormat =
        item.file.type === "image/png"
          ? "image/png"
          : item.file.type === "image/webp"
            ? "image/webp"
            : "image/jpeg";
      const canvas = makeCanvas(item.img.naturalWidth, item.img.naturalHeight);
      const ctx = canvas.getContext("2d")!;
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(item.img, 0, 0);
      const blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : 0.95);
      // 导出后复查：再解析一次导出图，确认 EXIF 已清空
      const check = await readSummary(blob);
      setClean({
        blob,
        name: outputName(item.file.name, "-clean", FORMAT_EXT[mime]),
        verified: !check.hasAny,
      });
    } catch {
      list.setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.exif.desc}</p>
      <DropZone multiple={false} onFiles={(f) => void list.setSingle(f)} />
      <FileThumbs items={list.items} onRemove={list.remove} onClear={list.clearAll} />
      {list.error && <p className="error">⚠️ {list.error}</p>}
      {!item && <p className="imgbox-empty">{t.exif.needImage}</p>}
      {item && summary && (
        <div className="imgbox-exif-box">
          <h3 className="sub-title">{t.exif.summaryTitle}</h3>
          {summary.hasAny ? (
            <dl className="imgbox-exif-list">
              {summary.make && (
                <>
                  <dt>{t.exif.make}</dt>
                  <dd>{summary.make}</dd>
                </>
              )}
              {summary.model && (
                <>
                  <dt>{t.exif.model}</dt>
                  <dd>{summary.model}</dd>
                </>
              )}
              {summary.takenAt && (
                <>
                  <dt>{t.exif.takenAt}</dt>
                  <dd>{summary.takenAt}</dd>
                </>
              )}
              {summary.software && (
                <>
                  <dt>{t.exif.software}</dt>
                  <dd>{summary.software}</dd>
                </>
              )}
              <dt>{t.exif.gps}</dt>
              <dd className={summary.gps ? "imgbox-gps-warn" : ""}>
                {summary.gps ? `⚠️ ${t.exif.gpsYes}` : t.exif.gpsNo}
              </dd>
              <dt>{t.exif.dimensions}</dt>
              <dd>
                {item.img.naturalWidth} × {item.img.naturalHeight}
              </dd>
            </dl>
          ) : (
            <p className="imgbox-note">{t.exif.noExif}</p>
          )}
        </div>
      )}
      {item && (
        <div className="imgbox-actions">
          <button type="button" className="btn primary" disabled={busy} onClick={() => void strip()}>
            {busy ? t.processing : t.exif.stripBtn}
          </button>
          {clean && (
            <button
              type="button"
              className="btn"
              onClick={() => downloadBlob(clean.blob, clean.name)}
            >
              ⬇ {t.exif.downloadClean}（{clean.name}）
            </button>
          )}
        </div>
      )}
      {clean && (
        <p className={clean.verified ? "ok" : "error"}>
          {clean.verified ? `✅ ${t.exif.verifyOk}` : `⚠️ ${t.exif.verifyFail}`}
        </p>
      )}
    </div>
  );
}
