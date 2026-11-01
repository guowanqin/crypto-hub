"use client";

import { useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { baseName, getPdfJs } from "@/lib/pdfcore";
import type { PdfDict } from "@/lib/pdfbox-i18n";
import { DropZone, StatusLine, downloadBlob, loadPdfSource } from "./shared";

interface PageItem {
  id: number;
  kind: "page" | "blank";
  /** 原 PDF 中的页序号（0 基），blank 时为 -1 */
  srcIndex: number;
  /** 在原页旋转角之上额外叠加的旋转（0/90/180/270） */
  extraRot: number;
  /** 页面逻辑尺寸（pt，未旋转） */
  width: number;
  height: number;
  thumb: string | null;
}

export default function PagesTool({ d }: { d: PdfDict }) {
  const [srcName, setSrcName] = useState("");
  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [items, setItems] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);
  const tokenRef = useRef(0);
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    if (items.length > 0 && !window.confirm(d.pages.confirmReset)) return;
    setError(null);
    setLoading(true);
    const token = ++tokenRef.current;
    try {
      const src = await loadPdfSource(f);
      const lib = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const sizes = lib.getPages().map((p) => {
        const s = p.getSize();
        return { width: s.width, height: s.height, rot: p.getRotation().angle };
      });
      const initial: PageItem[] = sizes.map((s, i) => ({
        id: ++idRef.current,
        kind: "page",
        srcIndex: i,
        extraRot: 0,
        width: s.width,
        height: s.height,
        thumb: null,
      }));
      setSrcName(f.name);
      setSrcBytes(src.bytes);
      setItems(initial);

      // 逐页渲染缩略图（pdf.js）；token 防止旧任务回写
      const pdfjs = await getPdfJs();
      const pdf = await pdfjs.getDocument({ data: src.bytes.slice() }).promise;
      try {
        for (let i = 0; i < pdf.numPages; i++) {
          if (tokenRef.current !== token) return;
          const page = await pdf.getPage(i + 1);
          const totalRot = (sizes[i].rot + 0) % 360;
          const base = page.getViewport({ scale: 1, rotation: totalRot });
          const scale = 168 / base.width;
          const viewport = page.getViewport({ scale, rotation: totalRot });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const url = canvas.toDataURL("image/jpeg", 0.72);
          if (tokenRef.current !== token) return;
          setItems((prev) =>
            prev.map((it) => (it.srcIndex === i && it.kind === "page" ? { ...it, thumb: url } : it))
          );
        }
      } finally {
        void pdf.destroy();
      }
    } catch {
      setError(d.failed);
    } finally {
      if (tokenRef.current === token) setLoading(false);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  function dropTo(target: number) {
    const from = dragIdx.current;
    dragIdx.current = null;
    setOverIdx(null);
    if (from === null || from === target) return;
    setItems((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(target, 0, it);
      return next;
    });
  }

  async function doExport() {
    if (!srcBytes || items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      // 先一次性复制所有用到的源页，再按编排序列取用
      const srcIdxs = items.filter((it) => it.kind === "page").map((it) => it.srcIndex);
      const copied = await out.copyPages(srcDoc, srcIdxs);
      const bySrc = new Map<number, (typeof copied)[number]>();
      srcIdxs.forEach((s, i) => bySrc.set(s, copied[i]));
      const used = new Set<number>();
      for (const it of items) {
        if (it.kind === "blank") {
          out.addPage([it.width, it.height]);
        } else {
          // 同一源页在编排中只出现一次（删除/重排模型），直接取用
          const p = bySrc.get(it.srcIndex)!;
          if (used.has(it.srcIndex)) {
            // 极端情况下重复出现时再复制一份
            const [extra] = await out.copyPages(srcDoc, [it.srcIndex]);
            extra.setRotation(degrees((extra.getRotation().angle + it.extraRot) % 360));
            out.addPage(extra);
          } else {
            used.add(it.srcIndex);
            p.setRotation(degrees((p.getRotation().angle + it.extraRot) % 360));
            out.addPage(p);
          }
        }
      }
      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${baseName(srcName)}-pages.pdf`
      );
    } catch {
      setError(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="pdf-desc">{d.pages.desc}</p>
      <DropZone
        accept="application/pdf,.pdf"
        onFiles={(fs) => void onFile(fs)}
        hint={d.dropPdfHint}
        clickLabel={d.dropClick}
      />
      {loading && <p className="pdf-busy">{d.pages.loadingThumbs}</p>}
      {items.length > 0 && (
        <>
          <div className="pdf-pagegrid">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className={`pdf-pagecell${overIdx === idx ? " over" : ""}`}
                draggable
                onDragStart={() => {
                  dragIdx.current = idx;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIdx(idx);
                }}
                onDragLeave={() => setOverIdx((v) => (v === idx ? null : v))}
                onDrop={(e) => {
                  e.preventDefault();
                  dropTo(idx);
                }}
              >
                <div className="pdf-thumbwrap">
                  {it.kind === "blank" ? (
                    <div className="pdf-blankthumb">{d.pages.blank}</div>
                  ) : it.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.thumb}
                      alt=""
                      className="pdf-thumb"
                      style={{
                        transform: `rotate(${it.extraRot}deg)`,
                        maxWidth: it.extraRot % 180 !== 0 ? "72%" : undefined,
                      }}
                    />
                  ) : (
                    <div className="pdf-blankthumb">…</div>
                  )}
                </div>
                <div className="pdf-pageno">
                  {idx + 1}
                  {it.kind === "page" && (
                    <span className="pdf-pageorig">
                      {" "}
                      · #{it.srcIndex + 1}
                      {it.extraRot ? ` · ${it.extraRot}°` : ""}
                    </span>
                  )}
                </div>
                <div className="pdf-pagebtns">
                  <button type="button" className="btn small" onClick={() => move(idx, -1)} disabled={idx === 0} title={d.moveUp}>
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    title={d.moveDown}
                  >
                    →
                  </button>
                  {it.kind === "page" && (
                    <button
                      type="button"
                      className="btn small"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === it.id ? { ...x, extraRot: (x.extraRot + 90) % 360 } : x
                          )
                        )
                      }
                    >
                      ⟳ {d.pages.rotate}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn small"
                    onClick={() =>
                      setItems((prev) => {
                        const anchor = prev[idx];
                        const blank: PageItem = {
                          id: ++idRef.current,
                          kind: "blank",
                          srcIndex: -1,
                          extraRot: 0,
                          width: anchor.width,
                          height: anchor.height,
                          thumb: null,
                        };
                        const next = [...prev];
                        next.splice(idx + 1, 0, blank);
                        return next;
                      })
                    }
                  >
                    ＋ {d.pages.insertBlank}
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                  >
                    {d.pages.del}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pdf-actions">
            <span className="pdf-count">{d.pagesUnit.replace("{n}", String(items.length))}</span>
            <button type="button" className="btn primary" onClick={() => void doExport()} disabled={busy}>
              {busy ? d.processing : d.pages.btn}
            </button>
          </div>
        </>
      )}
      <StatusLine busy={false} busyText="" error={error} />
    </div>
  );
}
