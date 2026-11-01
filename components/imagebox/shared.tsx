"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { downloadBlob } from "@/lib/engine";
import { IMGBOX_DICT, type ImgBoxDict } from "@/lib/imagebox-i18n";
import { formatBytes, type LoadedImage } from "@/lib/imagebox-utils";
import { useLang } from "../LangProvider";

export function useImgDict(): { lang: "zh" | "en"; t: ImgBoxDict } {
  const { lang } = useLang();
  return { lang, t: IMGBOX_DICT[lang] };
}

/* ---------------- 上传区 ---------------- */

export function DropZone({
  multiple = true,
  onFiles,
  label,
}: {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
}) {
  const { t } = useImgDict();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name)
    );
    if (arr.length > 0) onFiles(multiple ? arr : arr.slice(0, 1));
  };

  return (
    <div
      className={`imgbox-drop${dragging ? " dragging" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
    >
      <span>
        🖼️ {t.dropHint}
        <span className="imgbox-drop-link">{label ?? t.dropImages}</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ---------------- 已添加图片缩略图条 ---------------- */

export function FileThumbs({
  items,
  onRemove,
  onClear,
}: {
  items: LoadedImage[];
  onRemove: (index: number) => void;
  onClear: () => void;
}) {
  const { t } = useImgDict();
  if (items.length === 0) return null;
  return (
    <div className="imgbox-thumbs-wrap">
      <div className="imgbox-thumbs">
        {items.map((it, i) => (
          <figure className="imgbox-thumb" key={it.url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt={it.file.name} />
            <figcaption>
              <span className="imgbox-thumb-name">
                {i + 1}. {it.file.name}
              </span>
              <span className="imgbox-thumb-size">{formatBytes(it.file.size)}</span>
            </figcaption>
            <button
              type="button"
              className="imgbox-thumb-x"
              aria-label="remove"
              onClick={() => onRemove(i)}
            >
              ×
            </button>
          </figure>
        ))}
      </div>
      <button type="button" className="btn ghost imgbox-clear" onClick={onClear}>
        {t.clear}（{items.length} {t.filesUnit}）
      </button>
    </div>
  );
}

/* ---------------- 结果行 ---------------- */

export interface ImgResult {
  name: string;
  blob: Blob;
  origSize?: number;
}

export function ResultThumb({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="imgbox-result-thumb" src={url} alt="" />;
}

export function ResultList({ results }: { results: ImgResult[] }) {
  const { t } = useImgDict();
  if (results.length === 0) return null;
  return (
    <ul className="imgbox-results">
      {results.map((r, i) => (
        <li key={`${r.name}-${i}`}>
          <ResultThumb blob={r.blob} />
          <span className="imgbox-result-name">{r.name}</span>
          <span className="imgbox-result-size">
            {r.origSize !== undefined && (
              <>
                {formatBytes(r.origSize)} → {formatBytes(r.blob.size)}
                {r.origSize > 0 && r.blob.size < r.origSize && (
                  <em>
                    {" "}
                    · {t.savedRatio} {Math.round((1 - r.blob.size / r.origSize) * 100)}%
                  </em>
                )}
              </>
            )}
            {r.origSize === undefined && formatBytes(r.blob.size)}
          </span>
          <button
            type="button"
            className="btn small"
            onClick={() => downloadBlob(r.blob, r.name)}
          >
            ⬇ {t.download}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ZipButton({
  results,
  zipName,
}: {
  results: ImgResult[];
  zipName: string;
}) {
  const { t } = useImgDict();
  const [busy, setBusy] = useState(false);
  if (results.length < 2) return null;
  return (
    <button
      type="button"
      className="btn primary"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void (async () => {
          try {
            const zip = new JSZip();
            const used = new Map<string, number>();
            for (const r of results) {
              let name = r.name;
              const n = (used.get(name) ?? 0) + 1;
              used.set(name, n);
              if (n > 1) name = name.replace(/(\.[^.]+)$/, `-${n}$1`);
              zip.file(name, r.blob);
            }
            const blob = await zip.generateAsync({ type: "blob" });
            downloadBlob(blob, zipName);
          } finally {
            setBusy(false);
          }
        })();
      }}
    >
      {busy ? t.processing : `⬇ ${t.downloadZip}`}
    </button>
  );
}

/* ---------------- 表单小件 ---------------- */

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="imgbox-field">
      <span className="imgbox-field-label">{label}</span>
      {children}
    </label>
  );
}
