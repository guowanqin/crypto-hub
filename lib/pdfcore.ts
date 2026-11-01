// PDF 工具箱核心工具函数：pdf.js 懒加载、文件读取、Canvas 文字转 PNG。
// 全部只在浏览器端调用；本模块无顶层副作用，pdf.js 仅在首次真正用到时才加载。

import type * as PdfJsTypes from "pdfjs-dist";

let pdfjsPromise: Promise<typeof PdfJsTypes> | null = null;

/** 懒加载 pdfjs-dist 并挂好 worker（官方推荐的 new URL 写法）。 */
export function getPdfJs(): Promise<typeof PdfJsTypes> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function fileToBytes(file: File | Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** 文件名去掉扩展名（用于生成导出文件名）。 */
export function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

export interface TextPng {
  bytes: Uint8Array;
  /** 贴入 PDF 时的逻辑尺寸（pt），已含旋转后的外接框 */
  widthPt: number;
  heightPt: number;
}

/**
 * 把一行文字绘到 Canvas 上生成透明 PNG（可带旋转与不透明度）。
 * 用途：水印、中文页码、批注——绕开 pdf-lib 标准字体不支持中文的问题，
 * 中文在用户本机字体下天然可绘。fontSizePt 为 PDF 逻辑字号，内部按 4 倍渲染保清晰。
 */
export function renderTextPng(
  text: string,
  opts: {
    fontSizePt: number;
    color: string; // CSS 颜色，如 "#c0392b"
    opacity?: number; // 0–1
    rotateDeg?: number; // 顺时针为负数方向由调用方约定；此处按 canvas 角度（弧度制换算）旋转
    bold?: boolean;
    paddingPt?: number;
  }
): TextPng {
  const SCALE = 4;
  const fontPx = opts.fontSizePt * SCALE;
  const padPx = (opts.paddingPt ?? 2) * SCALE;
  const font = `${opts.bold ? "700 " : ""}${fontPx}px -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;

  // 先量宽
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const textW = measure.measureText(text).width;
  const textH = fontPx * 1.3;

  const w0 = Math.ceil(textW + padPx * 2);
  const h0 = Math.ceil(textH + padPx * 2);

  // 未旋转画布
  const c0 = document.createElement("canvas");
  c0.width = w0;
  c0.height = h0;
  const g0 = c0.getContext("2d")!;
  g0.font = font;
  g0.fillStyle = opts.color;
  g0.globalAlpha = opts.opacity ?? 1;
  g0.textBaseline = "middle";
  g0.fillText(text, padPx, h0 / 2);

  const deg = opts.rotateDeg ?? 0;
  let out = c0;
  let outW = w0;
  let outH = h0;
  if (deg !== 0) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    outW = Math.ceil(w0 * cos + h0 * sin);
    outH = Math.ceil(w0 * sin + h0 * cos);
    out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const g = out.getContext("2d")!;
    g.translate(outW / 2, outH / 2);
    g.rotate(rad);
    g.drawImage(c0, -w0 / 2, -h0 / 2);
  }

  const dataUrl = out.toDataURL("image/png");
  const b64 = dataUrl.split(",")[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, widthPt: outW / SCALE, heightPt: outH / SCALE };
}

/** 把 Blob 读成 HTMLImageElement（供骑缝章切片、图片转 PDF 前处理用）。 */
export function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

/** Canvas → PNG bytes。 */
export function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error("canvas export failed"));
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}

export const A4: { width: number; height: number } = { width: 595.28, height: 841.89 };

export const mmToPt = (mm: number) => (mm * 72) / 25.4;
