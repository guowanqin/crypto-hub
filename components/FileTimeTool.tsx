"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { downloadBlob } from "@/lib/engine";
import {
  formatExifString,
  isJpegFile,
  outputFileName,
  parseExifString,
  readPhotoTimes,
  writePhotoTime,
  type PhotoTimes,
} from "@/lib/filetime";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

type Mode = "set" | "shift" | "step";

interface FtItem {
  id: number;
  file: File;
  name: string;
  size: number;
  isJpeg: boolean;
  thumbUrl: string | null;
  /** 文件系统修改时间（浏览器能读到的 lastModified） */
  fileTime: Date;
  times: PhotoTimes;
  hasExif: boolean;
  /** 平移模式的基准时间来源：exif = 原 EXIF 时间；file = 文件修改时间 */
  basisKind: "exif" | "file";
  status: "idle" | "busy" | "done" | "error";
}

const DICT: Record<
  Lang,
  {
    dropHint: string;
    dropClick: string;
    reading: string;
    clearAll: string;
    colFile: string;
    colFileTime: string;
    colExif: string;
    colNew: string;
    colAct: string;
    lblOriginal: string;
    lblDigitized: string;
    lblModify: string;
    noExif: string;
    noExifInsert: string;
    notJpeg: string;
    basisFile: string;
    remove: string;
    download: string;
    done: string;
    failed: string;
    modes: Record<Mode, string>;
    setLabel: string;
    shiftDays: string;
    shiftHours: string;
    shiftMinutes: string;
    shiftHint: string;
    stepStart: string;
    stepInterval: string;
    stepUnit: string;
    suffixLabel: string;
    suffixPlaceholder: string;
    zipDownload: string;
    zipBusy: string;
    countText: string; // {jpeg} {total}
    emptyState: string;
    localNote: string;
  }
> = {
  zh: {
    dropHint: "把照片拖到这里，或",
    dropClick: "点击选择文件",
    reading: "正在读取时间信息…",
    clearAll: "清空列表",
    colFile: "文件",
    colFileTime: "文件修改时间",
    colExif: "EXIF 时间（现状）",
    colNew: "新时间（导出值）",
    colAct: "操作",
    lblOriginal: "拍摄",
    lblDigitized: "创建",
    lblModify: "修改",
    noExif: "无 EXIF 时间",
    noExifInsert: "导出时新插入",
    notJpeg: "非 JPEG，仅显示",
    basisFile: "以文件时间为基准",
    remove: "移除",
    download: "下载",
    done: "已生成",
    failed: "处理失败，重试",
    modes: { set: "统一设置", shift: "整体平移", step: "按张递增" },
    setLabel: "把所有照片设为",
    shiftDays: "天",
    shiftHours: "时",
    shiftMinutes: "分",
    shiftHint: "在每张原时间上加减（可负）；无 EXIF 的照片以文件修改时间为基准。",
    stepStart: "第一张的时间",
    stepInterval: "每张间隔",
    stepUnit: "分钟",
    suffixLabel: "文件名后缀（可选）",
    suffixPlaceholder: "如 -fixed，默认原名",
    zipDownload: "打包 ZIP 下载全部",
    zipBusy: "正在生成…",
    countText: "共 {total} 个文件，其中 {jpeg} 张 JPEG 可改时间",
    emptyState: "还没有添加照片。支持批量多选，照片只在本页本地处理，不上传。",
    localNote: "全部处理在你的浏览器本地完成，照片不会上传到任何服务器。",
  },
  en: {
    dropHint: "Drop photos here, or",
    dropClick: "click to choose files",
    reading: "Reading timestamps…",
    clearAll: "Clear list",
    colFile: "File",
    colFileTime: "File modified",
    colExif: "EXIF times (current)",
    colNew: "New time (export)",
    colAct: "Action",
    lblOriginal: "Taken",
    lblDigitized: "Digitized",
    lblModify: "Modified",
    noExif: "No EXIF time",
    noExifInsert: "will be inserted on export",
    notJpeg: "Not JPEG, view only",
    basisFile: "based on file time",
    remove: "Remove",
    download: "Download",
    done: "Done",
    failed: "Failed, retry",
    modes: { set: "Set one time", shift: "Shift all", step: "Step by photo" },
    setLabel: "Set all photos to",
    shiftDays: "days",
    shiftHours: "hours",
    shiftMinutes: "min",
    shiftHint: "Added to each photo's own time (negatives allowed); photos without EXIF use their file modified time as the base.",
    stepStart: "Time of the first photo",
    stepInterval: "Interval per photo",
    stepUnit: "minutes",
    suffixLabel: "File name suffix (optional)",
    suffixPlaceholder: "e.g. -fixed; blank keeps names",
    zipDownload: "Download all as ZIP",
    zipBusy: "Building…",
    countText: "{total} files, {jpeg} of them JPEG with editable times",
    emptyState: "No photos yet. Multi-select is supported; everything is processed locally on this page, nothing is uploaded.",
    localNote: "All processing happens locally in your browser; photos are never uploaded to any server.",
  },
};

function toInputValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDisplay(s: string | null): string {
  if (!s) return "—";
  return s.replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3 ");
}

function fmtDateTime(d: Date | null): string {
  if (!d) return "—";
  return fmtDisplay(formatExifString(d));
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function FileTimeTool() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [items, setItems] = useState<FtItem[]>([]);
  const [mode, setMode] = useState<Mode>("shift");
  const [setValue, setSetValue] = useState(() => toInputValue(new Date()));
  const [shift, setShift] = useState({ days: "0", hours: "0", minutes: "0" });
  const [stepStart, setStepStart] = useState(() => toInputValue(new Date()));
  const [stepMinutes, setStepMinutes] = useState("10");
  const [suffix, setSuffix] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl);
      });
    };
    // 只在卸载时回收；items 引用变化不应重复回收
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || isJpegFile(f)
    );
    if (list.length === 0) return;
    setReading(true);
    try {
      const built: FtItem[] = [];
      for (const file of list) {
        const isJpeg = isJpegFile(file);
        const times: PhotoTimes = isJpeg
          ? await readPhotoTimes(file)
          : { original: null, digitized: null, modify: null };
        const hasExif = Boolean(times.original || times.digitized || times.modify);
        built.push({
          id: ++idRef.current,
          file,
          name: file.name,
          size: file.size,
          isJpeg,
          thumbUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
          fileTime: new Date(file.lastModified),
          times,
          hasExif,
          basisKind:
            times.original || times.digitized || times.modify ? "exif" : "file",
          status: "idle",
        });
      }
      setItems((prev) => [...prev, ...built]);
    } finally {
      setReading(false);
    }
  }

  function removeItem(id: number) {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.thumbUrl) URL.revokeObjectURL(target.thumbUrl);
      return prev.filter((it) => it.id !== id);
    });
  }

  function clearAll() {
    items.forEach((it) => {
      if (it.thumbUrl) URL.revokeObjectURL(it.thumbUrl);
    });
    setItems([]);
  }

  const shiftMs = useMemo(() => {
    const days = parseInt(shift.days, 10) || 0;
    const hours = parseInt(shift.hours, 10) || 0;
    const minutes = parseInt(shift.minutes, 10) || 0;
    return ((days * 24 + hours) * 60 + minutes) * 60_000;
  }, [shift]);

  /** 每行算出的新时间（导出值）；非 JPEG 或参数非法时为 null。 */
  const newTimes = useMemo(() => {
    const map = new Map<number, Date | null>();
    const setDate = setValue ? new Date(setValue) : null;
    const stepDate = stepStart ? new Date(stepStart) : null;
    const stepMs = (parseInt(stepMinutes, 10) || 0) * 60_000;
    let jpegIdx = 0;
    for (const it of items) {
      if (!it.isJpeg) {
        map.set(it.id, null);
        continue;
      }
      let t: Date | null = null;
      if (mode === "set") {
        t = setDate && !Number.isNaN(setDate.getTime()) ? setDate : null;
      } else if (mode === "shift") {
        const basis =
          parseExifString(it.times.original) ??
          parseExifString(it.times.digitized) ??
          parseExifString(it.times.modify) ??
          it.fileTime;
        t = new Date(basis.getTime() + shiftMs);
      } else {
        t =
          stepDate && !Number.isNaN(stepDate.getTime())
            ? new Date(stepDate.getTime() + jpegIdx * stepMs)
            : null;
      }
      jpegIdx++;
      map.set(it.id, t);
    }
    return map;
  }, [items, mode, setValue, stepStart, stepMinutes, shiftMs]);

  const jpegCount = items.filter((it) => it.isJpeg).length;
  const exportable = items.filter((it) => newTimes.get(it.id));

  async function downloadOne(item: FtItem) {
    const t = newTimes.get(item.id);
    if (!t || item.status === "busy") return;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: "busy" } : it))
    );
    try {
      const blob = await writePhotoTime(item.file, t);
      downloadBlob(blob, outputFileName(item.name, suffix.trim()));
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "done" } : it))
      );
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "error" } : it))
      );
    }
  }

  async function downloadZip() {
    if (zipping || exportable.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      for (const item of exportable) {
        const t = newTimes.get(item.id)!;
        try {
          const blob = await writePhotoTime(item.file, t);
          let name = outputFileName(item.name, suffix.trim());
          if (used.has(name)) {
            const dot = name.lastIndexOf(".");
            let n = 2;
            let candidate: string;
            do {
              candidate =
                dot > 0
                  ? `${name.slice(0, dot)}-${n}${name.slice(dot)}`
                  : `${name}-${n}`;
              n++;
            } while (used.has(candidate));
            name = candidate;
          }
          used.add(name);
          zip.file(name, blob);
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, status: "done" } : it))
          );
        } catch {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "error" } : it
            )
          );
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "photos-exif-time.zip");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="ft-tool">
      <div
        className={`ft-drop${dragging ? " dragging" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
      >
        {d.dropHint} <span className="ft-drop-link">{d.dropClick}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.jpg,.jpeg"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="ft-modes" role="tablist" aria-label="mode">
        {(Object.keys(d.modes) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`ft-mode-btn${mode === m ? " active" : ""}`}
            onClick={() => setMode(m)}
          >
            {d.modes[m]}
          </button>
        ))}
      </div>

      <div className="ft-controls">
        {mode === "set" && (
          <label className="ft-field">
            <span>{d.setLabel}</span>
            <input
              className="ft-input"
              type="datetime-local"
              value={setValue}
              onChange={(e) => setSetValue(e.target.value)}
            />
          </label>
        )}
        {mode === "shift" && (
          <>
            <label className="ft-field ft-field-num">
              <span>{d.shiftDays}</span>
              <input
                className="ft-input"
                type="number"
                value={shift.days}
                onChange={(e) => setShift({ ...shift, days: e.target.value })}
              />
            </label>
            <label className="ft-field ft-field-num">
              <span>{d.shiftHours}</span>
              <input
                className="ft-input"
                type="number"
                value={shift.hours}
                onChange={(e) => setShift({ ...shift, hours: e.target.value })}
              />
            </label>
            <label className="ft-field ft-field-num">
              <span>{d.shiftMinutes}</span>
              <input
                className="ft-input"
                type="number"
                value={shift.minutes}
                onChange={(e) =>
                  setShift({ ...shift, minutes: e.target.value })
                }
              />
            </label>
            <p className="ft-hint">{d.shiftHint}</p>
          </>
        )}
        {mode === "step" && (
          <>
            <label className="ft-field">
              <span>{d.stepStart}</span>
              <input
                className="ft-input"
                type="datetime-local"
                value={stepStart}
                onChange={(e) => setStepStart(e.target.value)}
              />
            </label>
            <label className="ft-field ft-field-num">
              <span>
                {d.stepInterval}（{d.stepUnit}）
              </span>
              <input
                className="ft-input"
                type="number"
                value={stepMinutes}
                onChange={(e) => setStepMinutes(e.target.value)}
              />
            </label>
          </>
        )}
        <label className="ft-field">
          <span>{d.suffixLabel}</span>
          <input
            className="ft-input"
            type="text"
            value={suffix}
            placeholder={d.suffixPlaceholder}
            onChange={(e) => setSuffix(e.target.value)}
          />
        </label>
      </div>

      {reading && <p className="ft-note">{d.reading}</p>}

      {items.length === 0 ? (
        <p className="ft-note">{d.emptyState}</p>
      ) : (
        <>
          <div className="ft-actions">
            <span className="ft-count">
              {d.countText
                .replace("{total}", String(items.length))
                .replace("{jpeg}", String(jpegCount))}
            </span>
            <span className="ft-actions-btns">
              <button type="button" className="btn ghost small" onClick={clearAll}>
                {d.clearAll}
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={zipping || exportable.length === 0}
                onClick={() => void downloadZip()}
              >
                {zipping ? d.zipBusy : d.zipDownload}
              </button>
            </span>
          </div>

          <div className="ft-table-wrap">
            <table className="ft-table">
              <thead>
                <tr>
                  <th>{d.colFile}</th>
                  <th>{d.colFileTime}</th>
                  <th>{d.colExif}</th>
                  <th>{d.colNew}</th>
                  <th>{d.colAct}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const nt = newTimes.get(it.id) ?? null;
                  return (
                    <tr key={it.id} className={it.isJpeg ? "" : "ft-row-off"}>
                      <td>
                        <div className="ft-filecell">
                          {it.thumbUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.thumbUrl} alt="" className="ft-thumb" />
                          )}
                          <span className="ft-filename">
                            <span className="ft-name">{it.name}</span>
                            <span className="ft-size">{fmtSize(it.size)}</span>
                            {!it.isJpeg && (
                              <span className="ft-badge">{d.notJpeg}</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="ft-mono">{fmtDateTime(it.fileTime)}</td>
                      <td>
                        {it.isJpeg ? (
                          it.hasExif ? (
                            <span className="ft-exif-lines">
                              <span>
                                {d.lblOriginal} {fmtDisplay(it.times.original)}
                              </span>
                              <span>
                                {d.lblDigitized} {fmtDisplay(it.times.digitized)}
                              </span>
                              <span>
                                {d.lblModify} {fmtDisplay(it.times.modify)}
                              </span>
                            </span>
                          ) : (
                            <span className="ft-badge">
                              {d.noExif} · {d.noExifInsert}
                            </span>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {it.isJpeg ? (
                          <span className="ft-newtime">
                            {fmtDateTime(nt)}
                            {mode === "shift" && it.basisKind === "file" && (
                              <span className="ft-badge">{d.basisFile}</span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className="ft-row-btns">
                          {it.isJpeg && (
                            <button
                              type="button"
                              className="btn small"
                              disabled={!nt || it.status === "busy"}
                              onClick={() => void downloadOne(it)}
                            >
                              {it.status === "done"
                                ? d.done
                                : it.status === "error"
                                  ? d.failed
                                  : d.download}
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn ghost small"
                            onClick={() => removeItem(it.id)}
                          >
                            {d.remove}
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="ft-note">{d.localNote}</p>
    </div>
  );
}
