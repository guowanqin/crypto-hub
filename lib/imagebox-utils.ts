// 图片工具箱共用工具：纯函数（尺寸/切分计算）+ 浏览器端 Canvas 辅助。
// 全部处理只在本机浏览器完成，不调用任何外部接口。

export type OutFormat = "image/jpeg" | "image/png" | "image/webp";

export const FORMAT_EXT: Record<OutFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** 去掉原扩展名，拼上后缀与新扩展名 */
export function outputName(origName: string, suffix: string, ext: string): string {
  const stem = origName.replace(/\.[^.]+$/, "") || "image";
  return `${stem}${suffix}.${ext}`;
}

/** 浏览器是否能编码该格式（canvas.toBlob 对不支持的格式会静默回退 PNG，这里显式探测） */
export function formatWritable(mime: OutFormat): boolean {
  if (typeof document === "undefined") return true;
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  try {
    return c.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

/** resize 子工具的尺寸计算（纯函数，可单测） */
export function computeTargetSize(
  natW: number,
  natH: number,
  mode: "width" | "height" | "exact",
  targetW: number,
  targetH: number
): { w: number; h: number } {
  if (natW <= 0 || natH <= 0) return { w: 1, h: 1 };
  if (mode === "width") {
    const w = Math.max(1, Math.round(targetW));
    return { w, h: Math.max(1, Math.round((natH * w) / natW)) };
  }
  if (mode === "height") {
    const h = Math.max(1, Math.round(targetH));
    return { w: Math.max(1, Math.round((natW * h) / natH)), h };
  }
  return {
    w: Math.max(1, Math.round(targetW)),
    h: Math.max(1, Math.round(targetH)),
  };
}

export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
  index: number; // 1 起，按行优先（发布顺序）
}

/** 九宫格切分（纯函数）：边界用累计取整，相邻块严丝合缝、不重不漏 */
export function computeTileRects(
  width: number,
  height: number,
  rows: number,
  cols: number
): TileRect[] {
  const rects: TileRect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.round((c * width) / cols);
      const y = Math.round((r * height) / rows);
      const w = Math.round(((c + 1) * width) / cols) - x;
      const h = Math.round(((r + 1) * height) / rows) - y;
      rects.push({ x, y, w, h, index: r * cols + c + 1 });
    }
  }
  return rects;
}

/** 从 File 加载图片元素（调用方负责 revokeObjectURL） */
export function loadImageFromFile(
  file: Blob
): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
      mime,
      quality
    );
  });
}

/** 把图片按 cover 方式（裁切填满）画进目标矩形 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export interface LoadedImage {
  file: File;
  img: HTMLImageElement;
  url: string;
}

/** 批量加载图片文件；单个失败时回调 onError 并跳过 */
export async function loadFiles(
  files: File[],
  onError?: (f: File) => void
): Promise<LoadedImage[]> {
  const out: LoadedImage[] = [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      onError?.(f);
      continue;
    }
    try {
      const { img, url } = await loadImageFromFile(f);
      out.push({ file: f, img, url });
    } catch {
      onError?.(f);
    }
  }
  return out;
}

export function revokeAll(items: LoadedImage[]) {
  for (const it of items) URL.revokeObjectURL(it.url);
}
