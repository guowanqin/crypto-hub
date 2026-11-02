"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import { downloadBlob } from "@/lib/engine";
import type { Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

/**
 * 本地 OCR 工具（Tesseract.js，浏览器内识别，图片不上传）。
 * 模型来源（显式常量，版本与 package.json 的 tesseract.js 对齐）：
 * - worker 脚本与 WASM 核心：unpkg 上的 tesseract.js / tesseract.js-core 固定版本
 *   （与库默认的 jsdelivr 是同一份 npm 产物；选 unpkg 是因为实测在本环境里
 *    浏览器经出网代理对 jsdelivr 建隧道不通、unpkg 与 tessdata 均可达）；
 * - 语言包（chi_sim / eng）：tessdata 官方 4.0.0 目录（两个语种同目录，适配 langPath 拼接）。
 * 首次使用从上述 CDN 下载（合计几十 MB），浏览器缓存后可离线复用。
 */
export const TESSERACT_PATHS = {
  workerPath: "https://unpkg.com/tesseract.js@7.0.0/dist/worker.min.js",
  corePath: "https://unpkg.com/tesseract.js-core@7.0.0",
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
};

const MAX_FILES = 20;

type LangMode = "mix" | "chi" | "eng";
const MODE_LANGS: Record<LangMode, string> = {
  mix: "chi_sim+eng",
  chi: "chi_sim",
  eng: "eng",
};

export interface OcrLineData {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

type ItemStatus = "queued" | "running" | "done" | "error";

interface OcrItem {
  id: number;
  file: File;
  name: string;
  baseName: string;
  url: string;
  width: number;
  height: number;
  status: ItemStatus;
  progress: number;
  lines: OcrLineData[];
  error: string | null;
}

interface TessLine {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}
interface TessWorker {
  recognize: (
    image: File,
    options?: Record<string, unknown>,
    output?: Record<string, unknown>
  ) => Promise<{
    data: {
      text: string;
      blocks: Array<{ paragraphs: Array<{ lines: TessLine[] }> }> | null;
    };
  }>;
  terminate: () => Promise<unknown>;
}
type TessModule = {
  createWorker: (
    langs: string,
    oem: unknown,
    options: Record<string, unknown>
  ) => Promise<TessWorker>;
};

export const OCR_DICT: Record<
  Lang,
  {
    toolsTitle: string;
    dropHint: string;
    dropClick: string;
    dropExtra: string;
    modeLabel: string;
    modes: Record<LangMode, string>;
    start: string;
    cancel: string;
    clear: string;
    retry: string;
    remove: string;
    engineIdle: string;
    engineLoading: string;
    engineReady: string;
    engineError: string;
    loadStage: Record<string, string>;
    recognizing: string;
    statusText: Record<ItemStatus, string>;
    queueNote: string;
    tooMany: string;
    skipped: string;
    previewHint: string;
    linesTitle: string;
    linesEmpty: string;
    noLines: string;
    conf: string;
    exportTitle: string;
    expTxtOne: string;
    expMdAll: string;
    expTxtAll: string;
    expDocxAll: string;
    expZipAll: string;
    notesTitle: string;
    notes: string[];
    failedMsg: string;
    resultPlaceholder: string;
  }
> = {
  zh: {
    toolsTitle: "文字识别 · 本类工具",
    dropHint: "把图片拖到这里，或",
    dropClick: "点击选择图片",
    dropExtra: `也可以直接粘贴截图（Ctrl+V）。一次最多 ${MAX_FILES} 张，支持 PNG / JPG / WebP / BMP 等常见格式。`,
    modeLabel: "识别语言",
    modes: { mix: "中英混合", chi: "纯中文（简体）", eng: "纯英文" },
    start: "开始识别",
    cancel: "取消识别",
    clear: "清空全部",
    retry: "重试",
    remove: "移除",
    engineIdle: "识别引擎待命：首次识别时会先下载模型（WASM 核心 + 语言包，几十 MB），下载完成并缓存后可离线使用。",
    engineLoading: "正在准备识别引擎（首次需下载模型，请稍候）…",
    engineReady: "识别引擎已就绪（模型已缓存，断网也能用）。",
    engineError: "识别引擎加载失败：请检查网络后重试（模型来自 CDN，首次必须联网）。",
    loadStage: {
      "loading tesseract core": "下载识别引擎核心",
      "initializing tesseract": "初始化识别引擎",
      "loading language traineddata": "下载语言模型",
      "initializing api": "初始化识别接口",
    },
    recognizing: "识别中",
    statusText: { queued: "排队中", running: "识别中", done: "已完成", error: "失败" },
    queueNote: "已加入 {n} 张图片，正在逐张识别，页面可继续操作。",
    tooMany: `一次最多处理 ${MAX_FILES} 张图片，多出的已忽略。`,
    skipped: "有 {n} 个文件不是图片，已跳过。",
    previewHint: "点右侧任意一行，这里会把这一行在原图上框出来。",
    linesTitle: "识别结果（按行）",
    linesEmpty: "还没有识别结果。导入图片后会自动开始识别。",
    noLines: "这一张没有识别出文字行（可能是图里没有文字，或文字太小/太模糊）。",
    conf: "置信度",
    exportTitle: "导出",
    expTxtOne: "当前图 TXT",
    expMdAll: "全部 Markdown",
    expTxtAll: "全部 TXT 合集",
    expDocxAll: "全部 Word (.docx)",
    expZipAll: "按图打包 ZIP",
    notesTitle: "隐私与边界（先说清）",
    notes: [
      "图片不离开浏览器：识别全程在你设备的 Web Worker 里完成，本站服务器不接收、不保存任何图片。",
      "首次使用要联网从 CDN 下载识别模型（合计几十 MB），浏览器缓存后，后续打开可离线识别。",
      "效果边界：印刷体、截图、单据类图片是主场；手写字、复杂表格版面、严重模糊或倾斜的图片，效果明显弱于云端大厂 OCR，重要内容请逐行对照原图核对（点行高亮就是为这个准备的）。",
      "识别结果为机器自动生成，可能出错；金额、编号、日期这类关键信息务必人工复核后再使用。",
    ],
    failedMsg: "这一张识别失败了，可以重试；若反复失败，可能是图片格式不受支持或图片过大。",
    resultPlaceholder: "识别完成后，结果会按行出现在这里，点击行可在原图上定位。",
  },
  en: {
    toolsTitle: "OCR · Tools in this shelf",
    dropHint: "Drop images here, or",
    dropClick: "click to choose images",
    dropExtra: `You can also paste a screenshot (Ctrl+V). Up to ${MAX_FILES} images at a time; PNG / JPG / WebP / BMP and other common formats.`,
    modeLabel: "Language",
    modes: { mix: "Chinese + English", chi: "Chinese (Simplified)", eng: "English only" },
    start: "Start OCR",
    cancel: "Cancel",
    clear: "Clear all",
    retry: "Retry",
    remove: "Remove",
    engineIdle: "Engine on standby: the first run downloads the models first (WASM core + language packs, tens of MB); once cached it works offline.",
    engineLoading: "Preparing the OCR engine (first run downloads the models)…",
    engineReady: "Engine ready (models cached — works offline).",
    engineError: "Engine failed to load: check your connection and retry (models come from a CDN; the first run needs internet).",
    loadStage: {
      "loading tesseract core": "Downloading OCR core",
      "initializing tesseract": "Initialising engine",
      "loading language traineddata": "Downloading language models",
      "initializing api": "Initialising API",
    },
    recognizing: "Recognising",
    statusText: { queued: "Queued", running: "Running", done: "Done", error: "Failed" },
    queueNote: "{n} image(s) added — recognising one by one; the page stays usable.",
    tooMany: `Up to ${MAX_FILES} images at a time; extras were ignored.`,
    skipped: "{n} file(s) were not images and were skipped.",
    previewHint: "Click any line on the right and it gets boxed on the original image here.",
    linesTitle: "Results (by line)",
    linesEmpty: "No results yet. Recognition starts automatically once images are added.",
    noLines: "No text lines were found in this image (maybe there is no text, or it is too small/blurry).",
    conf: "confidence",
    exportTitle: "Export",
    expTxtOne: "This image as TXT",
    expMdAll: "All as Markdown",
    expTxtAll: "All as one TXT",
    expDocxAll: "All as Word (.docx)",
    expZipAll: "ZIP, one TXT per image",
    notesTitle: "Privacy & limits (up front)",
    notes: [
      "Images never leave your browser: recognition runs entirely in a Web Worker on your device; this site's servers never receive or store any image.",
      "The first run downloads the recognition models from a CDN (tens of MB in total). Once cached by the browser, later runs work offline.",
      "Limits: print, screenshots and forms are the strong suit. Handwriting, complex table layouts and badly blurred or skewed images are clearly weaker than big-cloud OCR — proofread key lines against the original (the click-to-highlight box is there for exactly that).",
      "Results are machine-generated and can be wrong; always double-check amounts, numbers and dates by hand before relying on them.",
    ],
    failedMsg: "This image failed to recognise. You can retry; repeated failures may mean an unsupported format or an oversized image.",
    resultPlaceholder: "When recognition finishes, results appear here line by line — click a line to locate it on the image.",
  },
  tw: {
    toolsTitle: "文字識別 · 本類工具",
    dropHint: "把圖片拖到這裡，或",
    dropClick: "點選選擇圖片",
    dropExtra: `也可以直接貼上截圖（Ctrl+V）。一次最多 ${MAX_FILES} 張，支援 PNG / JPG / WebP / BMP 等常見格式。`,
    modeLabel: "識別語言",
    modes: { mix: "中英混合", chi: "純中文（簡體）", eng: "純英文" },
    start: "開始識別",
    cancel: "取消識別",
    clear: "清空全部",
    retry: "重試",
    remove: "移除",
    engineIdle: "識別引擎待命：首次識別時會先下載模型（WASM 核心 + 語言包，幾十 MB），下載完成並快取後可離線使用。",
    engineLoading: "正在準備識別引擎（首次需下載模型，請稍候）…",
    engineReady: "識別引擎已就緒（模型已快取，斷網也能用）。",
    engineError: "識別引擎載入失敗：請檢查網路後重試（模型來自 CDN，首次必須聯網）。",
    loadStage: {
      "loading tesseract core": "下載識別引擎核心",
      "initializing tesseract": "初始化識別引擎",
      "loading language traineddata": "下載語言模型",
      "initializing api": "初始化識別介面",
    },
    recognizing: "識別中",
    statusText: { queued: "排隊中", running: "識別中", done: "已完成", error: "失敗" },
    queueNote: "已加入 {n} 張圖片，正在逐張識別，頁面可繼續操作。",
    tooMany: `一次最多處理 ${MAX_FILES} 張圖片，多出的已忽略。`,
    skipped: "有 {n} 個檔案不是圖片，已跳過。",
    previewHint: "點右側任意一行，這裡會把這一行在原圖上框出來。",
    linesTitle: "識別結果（按行）",
    linesEmpty: "還沒有識別結果。匯入圖片後會自動開始識別。",
    noLines: "這一張沒有識別出文字行（可能是圖裡沒有文字，或文字太小/太模糊）。",
    conf: "置信度",
    exportTitle: "匯出",
    expTxtOne: "當前圖 TXT",
    expMdAll: "全部 Markdown",
    expTxtAll: "全部 TXT 合集",
    expDocxAll: "全部 Word (.docx)",
    expZipAll: "按圖打包 ZIP",
    notesTitle: "隱私與邊界（先說清）",
    notes: [
      "圖片不離開瀏覽器：識別全程在你裝置的 Web Worker 裡完成，本站伺服器不接收、不儲存任何圖片。",
      "首次使用要聯網從 CDN 下載識別模型（合計幾十 MB），瀏覽器快取後，後續開啟可離線識別。",
      "效果邊界：印刷體、截圖、單據類圖片是主場；手寫字、複雜表格版面、嚴重模糊或傾斜的圖片，效果明顯弱於雲端大廠 OCR，重要內容請逐行對照原圖核對（點行高亮就是為這個準備的）。",
      "識別結果為機器自動生成，可能出錯；金額、編號、日期這類關鍵資訊務必人工複核後再使用。",
    ],
    failedMsg: "這一張識別失敗了，可以重試；若反覆失敗，可能是圖片格式不受支援或圖片過大。",
    resultPlaceholder: "識別完成後，結果會按行出現在這裡，點選行可在原圖上定位。",
  },
};

let nextId = 1;

function baseNameOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function linesToText(lines: OcrLineData[]): string {
  return lines.map((l) => l.text).join("\n");
}

export default function OcrTool() {
  const { lang } = useLang();
  const d = OCR_DICT[lang];

  const [items, setItems] = useState<OcrItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [mode, setMode] = useState<LangMode>("mix");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [enginePhase, setEnginePhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadStage, setLoadStage] = useState<string>("");
  const [loadProgress, setLoadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const itemsRef = useRef<OcrItem[]>([]);
  itemsRef.current = items;
  const workerRef = useRef<TessWorker | null>(null);
  const workerModeRef = useRef<LangMode | null>(null);
  const processingRef = useRef(false);
  const cancelRef = useRef(false);
  const runningIdRef = useRef<number | null>(null);
  const modeRef = useRef<LangMode>(mode);
  modeRef.current = mode;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null;
  const doneItems = items.filter((i) => i.status === "done");
  const queuedCount = items.filter((i) => i.status === "queued").length;

  const patchItem = useCallback((id: number, patch: Partial<OcrItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const destroyWorker = useCallback(async () => {
    const w = workerRef.current;
    workerRef.current = null;
    workerModeRef.current = null;
    if (w) {
      try {
        await w.terminate();
      } catch {
        /* 忽略终止异常 */
      }
    }
  }, []);

  const ensureWorker = useCallback(async (): Promise<TessWorker> => {
    if (workerRef.current && workerModeRef.current === modeRef.current) {
      return workerRef.current;
    }
    await destroyWorker();
    setEnginePhase("loading");
    setLoadStage("");
    setLoadProgress(0);
    const Tesseract = (await import("tesseract.js")) as unknown as TessModule;
    const worker = await Tesseract.createWorker(MODE_LANGS[modeRef.current], undefined, {
      ...TESSERACT_PATHS,
      cacheMethod: "write",
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text") {
          const rid = runningIdRef.current;
          if (rid != null) patchItem(rid, { progress: m.progress });
        } else {
          setLoadStage(m.status);
          setLoadProgress(m.progress);
        }
      },
      errorHandler: () => {
        /* 单个 job 的错误在 recognize 的 catch 中处理 */
      },
    });
    workerRef.current = worker;
    workerModeRef.current = modeRef.current;
    setEnginePhase("ready");
    return worker;
  }, [destroyWorker, patchItem]);

  const recognizeItem = useCallback(
    async (item: OcrItem) => {
      runningIdRef.current = item.id;
      patchItem(item.id, { status: "running", progress: 0, error: null });
      try {
        const worker = await ensureWorker();
        if (cancelRef.current) throw new Error("cancelled");
        const { data } = await worker.recognize(item.file, {}, { text: true, blocks: true });
        const lines: OcrLineData[] = [];
        for (const block of data.blocks ?? []) {
          for (const para of block.paragraphs ?? []) {
            for (const line of para.lines ?? []) {
              const text = (line.text ?? "").replace(/\s+$/u, "");
              if (text.trim() !== "") {
                lines.push({ text, bbox: line.bbox, confidence: line.confidence });
              }
            }
          }
        }
        patchItem(item.id, { status: "done", progress: 1, lines });
      } catch {
        if (cancelRef.current) {
          patchItem(item.id, { status: "queued", progress: 0 });
        } else {
          patchItem(item.id, { status: "error", error: "failed" });
        }
      } finally {
        runningIdRef.current = null;
      }
    },
    [ensureWorker, patchItem]
  );

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      for (;;) {
        if (cancelRef.current) break;
        const next = itemsRef.current.find((i) => i.status === "queued");
        if (!next) break;
        await recognizeItem(next);
        if (cancelRef.current) break;
        const failedHard = itemsRef.current.some(
          (i) => i.id === next.id && i.status === "error"
        );
        void failedHard;
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [recognizeItem]);

  const kick = useCallback(() => {
    cancelRef.current = false;
    void processQueue();
  }, [processQueue]);

  // 卸载时回收 worker 与对象 URL
  useEffect(() => {
    return () => {
      void destroyWorker();
      for (const i of itemsRef.current) URL.revokeObjectURL(i.url);
    };
  }, [destroyWorker]);

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter(
        (f) => f.type.startsWith("image/") || /\.(bmp|png|jpe?g|webp|gif|tiff?)$/i.test(f.name)
      );
      const skippedCount = files.length - images.length;
      const room = Math.max(0, MAX_FILES - itemsRef.current.length);
      const accepted = images.slice(0, room);
      const notes: string[] = [];
      if (images.length > room) notes.push(d.tooMany);
      if (skippedCount > 0) notes.push(d.skipped.replace("{n}", String(skippedCount)));
      setNotice(notes.length > 0 ? notes.join(" ") : null);
      if (accepted.length === 0) return;
      const created: OcrItem[] = accepted.map((file) => ({
        id: nextId++,
        file,
        name: file.name || `pasted-${nextId}.png`,
        baseName: baseNameOf(file.name || `image-${nextId}`),
        url: URL.createObjectURL(file),
        width: 0,
        height: 0,
        status: "queued" as ItemStatus,
        progress: 0,
        lines: [],
        error: null,
      }));
      for (const it of created) {
        const img = new Image();
        img.onload = () => patchItem(it.id, { width: img.naturalWidth, height: img.naturalHeight });
        img.src = it.url;
      }
      setItems((prev) => [...prev, ...created]);
      setSelectedId((prev) => prev ?? created[0].id);
      setSelectedLine(null);
      // 入队后自动开跑
      setTimeout(kick, 0);
    },
    [d, kick, patchItem]
  );

  // 粘贴导入（在输入框里粘贴时不劫持）
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("input, textarea, [contenteditable]")) return;
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const onCancel = useCallback(async () => {
    cancelRef.current = true;
    await destroyWorker();
    setEnginePhase("idle");
    const rid = runningIdRef.current;
    if (rid != null) patchItem(rid, { status: "queued", progress: 0 });
  }, [destroyWorker, patchItem]);

  const onClear = useCallback(async () => {
    cancelRef.current = true;
    await destroyWorker();
    setEnginePhase("idle");
    for (const i of itemsRef.current) URL.revokeObjectURL(i.url);
    setItems([]);
    setSelectedId(null);
    setSelectedLine(null);
    setNotice(null);
    cancelRef.current = false;
  }, [destroyWorker]);

  const onModeChange = useCallback(
    (m: LangMode) => {
      setMode(m);
      modeRef.current = m;
      // 语言变了：销毁旧 worker，下次识别按新语言重建（已完成的结果保留）
      void destroyWorker();
      setEnginePhase("idle");
    },
    [destroyWorker]
  );

  const removeItem = useCallback(
    (id: number) => {
      const it = itemsRef.current.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedLine(null);
      }
    },
    [selectedId]
  );

  const retryItem = useCallback(
    (id: number) => {
      patchItem(id, { status: "queued", progress: 0, error: null });
      setTimeout(kick, 0);
    },
    [kick, patchItem]
  );

  const editLine = useCallback(
    (itemId: number, idx: number, text: string) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, lines: i.lines.map((l, li) => (li === idx ? { ...l, text } : l)) }
            : i
        )
      );
    },
    []
  );

  // ---------- 导出 ----------
  const exportTxtOne = () => {
    if (!selected || selected.status !== "done") return;
    downloadBlob(
      new Blob([linesToText(selected.lines)], { type: "text/plain;charset=utf-8" }),
      `${selected.baseName}.txt`
    );
  };

  const allTextSections = () =>
    doneItems.map((i) => ({ name: i.name, baseName: i.baseName, text: linesToText(i.lines) }));

  const exportMdAll = () => {
    const parts = allTextSections().map((s) => `## ${s.name}\n\n${s.text}`);
    downloadBlob(
      new Blob([`# OCR\n\n${parts.join("\n\n")}\n`], { type: "text/markdown;charset=utf-8" }),
      "ocr-results.md"
    );
  };

  const exportTxtAll = () => {
    const parts = allTextSections().map((s) => `===== ${s.name} =====\n${s.text}`);
    downloadBlob(
      new Blob([parts.join("\n\n")], { type: "text/plain;charset=utf-8" }),
      "ocr-results.txt"
    );
  };

  const exportZipAll = async () => {
    const zip = new JSZip();
    const used = new Set<string>();
    for (const s of allTextSections()) {
      let fname = `${s.baseName}.txt`;
      let n = 2;
      while (used.has(fname)) {
        fname = `${s.baseName} (${n++}).txt`;
      }
      used.add(fname);
      zip.file(fname, s.text);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "ocr-texts.zip");
  };

  const exportDocxAll = async () => {
    const children: Paragraph[] = [];
    for (const s of allTextSections()) {
      children.push(new Paragraph({ text: s.name, heading: HeadingLevel.HEADING_2 }));
      const lines = s.text === "" ? [""] : s.text.split("\n");
      for (const line of lines) children.push(new Paragraph({ text: line }));
    }
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, "ocr-results.docx");
  };

  const activeLine =
    selected && selectedLine != null ? selected.lines[selectedLine] ?? null : null;

  return (
    <div className="ocr-tool">
      {/* 导入区 */}
      <div
        className={`ocr-drop${dragging ? " dragging" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files ?? []));
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <p className="ocr-drop-main">
          {d.dropHint} <span className="ocr-drop-link">{d.dropClick}</span>
        </p>
        <p className="ocr-drop-sub">{d.dropExtra}</p>
      </div>

      {/* 控制条 */}
      <div className="ocr-controls">
        <div className="ocr-seg" role="tablist" aria-label={d.modeLabel}>
          <span className="ocr-seg-label">{d.modeLabel}</span>
          {(Object.keys(d.modes) as LangMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              disabled={processing}
              className={`ocr-seg-btn${mode === m ? " active" : ""}`}
              onClick={() => onModeChange(m)}
            >
              {d.modes[m]}
            </button>
          ))}
        </div>
        <div className="ocr-actions">
          {queuedCount > 0 && !processing && (
            <button type="button" className="btn primary" onClick={kick}>
              {d.start}
              {queuedCount > 0 ? ` (${queuedCount})` : ""}
            </button>
          )}
          {processing && (
            <button type="button" className="btn" onClick={() => void onCancel()}>
              {d.cancel}
            </button>
          )}
          {items.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => void onClear()}>
              {d.clear}
            </button>
          )}
        </div>
      </div>

      {/* 引擎状态 */}
      <div className="ocr-engine" aria-live="polite">
        {enginePhase === "loading" ? (
          <>
            <p className="ocr-engine-text">
              {d.engineLoading}
              {loadStage && d.loadStage[loadStage]
                ? ` · ${d.loadStage[loadStage]} ${Math.round(loadProgress * 100)}%`
                : ""}
            </p>
            <div className="ocr-progress">
              <div className="ocr-progress-fill" style={{ width: `${Math.round(loadProgress * 100)}%` }} />
            </div>
          </>
        ) : enginePhase === "error" ? (
          <p className="ocr-engine-text ocr-engine-error">{d.engineError}</p>
        ) : enginePhase === "ready" ? (
          <p className="ocr-engine-text">{d.engineReady}</p>
        ) : (
          <p className="ocr-engine-text">{d.engineIdle}</p>
        )}
        {notice && <p className="ocr-engine-text ocr-notice">{notice}</p>}
        {items.length > 0 && (
          <p className="ocr-engine-text">{d.queueNote.replace("{n}", String(items.length))}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="ocr-empty">{d.resultPlaceholder}</div>
      ) : (
        <div className="ocr-main">
          {/* 左：图片列表 + 预览 */}
          <div className="ocr-left">
            <div className="ocr-thumbs">
              {items.map((i) => (
                <div
                  key={i.id}
                  className={`ocr-thumb${selected && i.id === selected.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedId(i.id);
                    setSelectedLine(null);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.url} alt={i.name} className="ocr-thumb-img" />
                  <div className="ocr-thumb-meta">
                    <span className="ocr-thumb-name" title={i.name}>
                      {i.name}
                    </span>
                    <span className={`ocr-status st-${i.status}`}>
                      {i.status === "running"
                        ? `${d.statusText.running} ${Math.round(i.progress * 100)}%`
                        : d.statusText[i.status]}
                    </span>
                  </div>
                  <div className="ocr-thumb-btns">
                    {i.status === "error" && (
                      <button
                        type="button"
                        className="ocr-mini-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryItem(i.id);
                        }}
                      >
                        {d.retry}
                      </button>
                    )}
                    <button
                      type="button"
                      className="ocr-mini-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(i.id);
                      }}
                    >
                      {d.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="ocr-preview-wrap">
                <div className="ocr-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.url} alt={selected.name} className="ocr-preview-img" />
                  {activeLine && selected.width > 0 && (
                    <div
                      className="ocr-highlight"
                      style={{
                        left: `${(activeLine.bbox.x0 / selected.width) * 100}%`,
                        top: `${(activeLine.bbox.y0 / selected.height) * 100}%`,
                        width: `${((activeLine.bbox.x1 - activeLine.bbox.x0) / selected.width) * 100}%`,
                        height: `${((activeLine.bbox.y1 - activeLine.bbox.y0) / selected.height) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <p className="ocr-preview-hint">{d.previewHint}</p>
              </div>
            )}
          </div>

          {/* 右：按行结果 */}
          <div className="ocr-right">
            <h3 className="ocr-lines-title">
              {d.linesTitle}
              {selected ? ` · ${selected.name}` : ""}
            </h3>
            {!selected || selected.status === "queued" || selected.status === "running" ? (
              <p className="ocr-lines-empty">
                {selected && selected.status === "running"
                  ? `${d.recognizing} ${Math.round(selected.progress * 100)}%`
                  : d.linesEmpty}
              </p>
            ) : selected.status === "error" ? (
              <p className="ocr-lines-empty">{d.failedMsg}</p>
            ) : selected.lines.length === 0 ? (
              <p className="ocr-lines-empty">{d.noLines}</p>
            ) : (
              <div className="ocr-lines">
                {selected.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`ocr-line${selectedLine === idx ? " active" : ""}`}
                    onClick={() => setSelectedLine(idx)}
                  >
                    <span className="ocr-line-no">{idx + 1}</span>
                    <input
                      className="ocr-line-input"
                      value={line.text}
                      onChange={(e) => editLine(selected.id, idx, e.target.value)}
                      onFocus={() => setSelectedLine(idx)}
                      aria-label={`line ${idx + 1}`}
                    />
                    <span className="ocr-line-conf" title={d.conf}>
                      {Math.round(line.confidence)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 导出栏 */}
            <div className="ocr-exports">
              <span className="ocr-exports-title">{d.exportTitle}</span>
              <button
                type="button"
                className="btn small"
                disabled={!selected || selected.status !== "done"}
                onClick={exportTxtOne}
              >
                {d.expTxtOne}
              </button>
              <button type="button" className="btn small" disabled={doneItems.length === 0} onClick={exportMdAll}>
                {d.expMdAll}
              </button>
              <button type="button" className="btn small" disabled={doneItems.length === 0} onClick={exportTxtAll}>
                {d.expTxtAll}
              </button>
              <button
                type="button"
                className="btn small"
                disabled={doneItems.length === 0}
                onClick={() => void exportDocxAll()}
              >
                {d.expDocxAll}
              </button>
              <button
                type="button"
                className="btn small"
                disabled={doneItems.length === 0}
                onClick={() => void exportZipAll()}
              >
                {d.expZipAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐私与边界卡 */}
      <section className="card ocr-notes">
        <h2>{d.notesTitle}</h2>
        <ul className="ocr-notes-list">
          {d.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
