import type { Lang } from "./site";

export type PdfTabId =
  | "merge"
  | "split"
  | "pages"
  | "watermark"
  | "numbers"
  | "seal"
  | "convert"
  | "annotate";

export interface PdfDict {
  tabs: Record<PdfTabId, string>;
  localNote: string;
  dropPdfHint: string;
  dropImgHint: string;
  dropSealHint: string;
  dropClick: string;
  pagesUnit: string; // "{n}" 页 / pages
  remove: string;
  moveUp: string;
  moveDown: string;
  clear: string;
  processing: string;
  download: string;
  addMore: string;
  failed: string;
  tooBig: string;
  merge: {
    desc: string;
    empty: string;
    btn: string;
    outLabel: string;
  };
  split: {
    desc: string;
    modeRange: string;
    modeEach: string;
    rangeLabel: string;
    rangePlaceholder: string;
    rangeHint: string;
    invalidRange: string;
    btnRange: string;
    btnEach: string;
    needFile: string;
  };
  pages: {
    desc: string;
    rotate: string;
    del: string;
    insertBlank: string;
    blank: string;
    btn: string;
    loadingThumbs: string;
    confirmReset: string;
  };
  watermark: {
    desc: string;
    textLabel: string;
    sizeLabel: string;
    opacityLabel: string;
    angleLabel: string;
    layoutLabel: string;
    layoutTile: string;
    layoutCenter: string;
    scopeLabel: string;
    scopeAll: string;
    scopeRange: string;
    rangeLabel: string;
    btn: string;
  };
  numbers: {
    desc: string;
    posLabel: string;
    pos: Record<"tl" | "tc" | "tr" | "bl" | "bc" | "br", string>;
    fmtLabel: string;
    fmtNum: string;
    fmtOf: string;
    fmtZh: string;
    sizeLabel: string;
    startLabel: string;
    btn: string;
    note: string;
  };
  seal: {
    desc: string;
    pdfLabel: string;
    sealLabel: string;
    heightLabel: string;
    heightHint: string;
    btn: string;
    info: string; // {pages}
  };
  convert: {
    desc: string;
    modeImg2Pdf: string;
    modePdf2Img: string;
    sizeLabel: string;
    sizeA4: string;
    sizeOrig: string;
    scaleLabel: string;
    fmtLabel: string;
    btnImg: string;
    btnPdf: string;
    emptyImg: string;
  };
  annotate: {
    desc: string;
    pageLabel: string; // {cur} {total}
    textLabel: string;
    textPlaceholder: string;
    sizeLabel: string;
    colorLabel: string;
    clickHint: string;
    listTitle: string;
    listEmpty: string;
    markAt: string; // {x} {y}
    btn: string;
    needMark: string;
  };
}

export const PDF_DICT: Record<Lang, PdfDict> = {
  zh: {
    tabs: {
      merge: "合并",
      split: "拆分",
      pages: "页面管理",
      watermark: "水印",
      numbers: "页码",
      seal: "骑缝章",
      convert: "转换",
      annotate: "批注",
    },
    localNote: "全部处理在你的浏览器本地完成，文件不会上传到任何服务器；大文件请耐心等待进度完成。",
    dropPdfHint: "把 PDF 拖到这里，或",
    dropImgHint: "把图片拖到这里，或",
    dropSealHint: "把印章图片（PNG 透明底）拖到这里，或",
    dropClick: "点击选择文件",
    pagesUnit: "{n} 页",
    remove: "移除",
    moveUp: "上移",
    moveDown: "下移",
    clear: "清空",
    processing: "处理中…",
    download: "下载",
    addMore: "继续添加",
    failed: "处理失败",
    tooBig: "文件较大（{size}），处理可能较慢，请耐心等待。",
    merge: {
      desc: "上传多个 PDF，用上移/下移调整顺序，合并成一个文件下载。",
      empty: "还没有添加 PDF。可以一次多选，也可以分批添加。",
      btn: "合并并下载",
      outLabel: "当前共 {files} 个文件、{pages} 页",
    },
    split: {
      desc: "把一个 PDF 按页码范围提取成新文件，或逐页拆成多个文件打包下载。",
      modeRange: "按范围提取",
      modeEach: "逐页拆分",
      rangeLabel: "页码范围",
      rangePlaceholder: "如 1-3,5,8-10",
      rangeHint: "页码从 1 开始；范围按你写的顺序提取，重复页会被保留。",
      invalidRange: "范围写法有误或超出总页数，请检查。",
      btnRange: "提取并下载",
      btnEach: "逐页拆分并打包 ZIP",
      needFile: "先添加一个 PDF。",
    },
    pages: {
      desc: "以缩略图查看每一页：删除、旋转、调整顺序、插入同尺寸空白页，满意后导出新 PDF。",
      rotate: "旋转90°",
      del: "删除",
      insertBlank: "其后插入空白页",
      blank: "空白页",
      btn: "导出新 PDF",
      loadingThumbs: "正在渲染缩略图…",
      confirmReset: "重新选择文件会丢弃当前页面编排，继续？",
    },
    watermark: {
      desc: "把文字水印盖到每一页：内容、字号、透明度、倾斜角度可调，可平铺整页或只盖居中一枚。文字以图片形式贴入，中文不会乱码。",
      textLabel: "水印文字",
      sizeLabel: "字号（pt）",
      opacityLabel: "透明度",
      angleLabel: "倾斜角度（°）",
      layoutLabel: "版式",
      layoutTile: "平铺整页",
      layoutCenter: "居中一枚",
      scopeLabel: "盖印范围",
      scopeAll: "全部页",
      scopeRange: "指定页码",
      rangeLabel: "页码范围",
      btn: "加水印并下载",
    },
    numbers: {
      desc: "给每一页添加页码：六个位置可选，格式可选纯数字、「X / N」或中文「第 X 页 共 N 页」。",
      posLabel: "位置",
      pos: {
        tl: "左上",
        tc: "上中",
        tr: "右上",
        bl: "左下",
        bc: "下中",
        br: "右下",
      },
      fmtLabel: "格式",
      fmtNum: "纯数字（3）",
      fmtOf: "X / N（3 / 10）",
      fmtZh: "中文（第 3 页 共 10 页）",
      sizeLabel: "字号（pt）",
      startLabel: "起始页码",
      btn: "加页码并下载",
      note: "数字格式以矢量文字写入；中文格式以高清图片贴入，打印同样清晰。",
    },
    seal: {
      desc: "上传印章图（建议透明底 PNG）：按总页数把章纵向均分切片，第几页盖第几片、都贴在页面右侧边缘垂直居中——打印出来把纸页错开对齐，拼出的就是完整一枚章。注意：这是图片盖章，不具 CA 电子签章的法律效力。",
      pdfLabel: "待盖章 PDF",
      sealLabel: "印章图片",
      heightLabel: "章高（mm）",
      heightHint: "按这个高度等比缩放整枚章，再均分切片；常见公章直径 40mm 左右。",
      btn: "盖骑缝章并下载",
      info: "共 {pages} 页，每页将盖 1 片（第 i 页盖第 i 片）。",
    },
    convert: {
      desc: "图片与 PDF 互转：多张图片合成为一个 PDF，或把 PDF 逐页渲染成图片打包下载。",
      modeImg2Pdf: "图片转 PDF",
      modePdf2Img: "PDF 转图片",
      sizeLabel: "页面大小",
      sizeA4: "A4（图片居中适配）",
      sizeOrig: "按图片原尺寸",
      scaleLabel: "渲染倍率",
      fmtLabel: "图片格式",
      btnImg: "生成 PDF 并下载",
      btnPdf: "转图片并打包 ZIP",
      emptyImg: "还没有添加图片。支持 JPG、PNG、WebP 等常见格式，可多选。",
    },
    annotate: {
      desc: "在指定页上添加文字标注：先选页，在预览图上点击要标注的位置，再填文字、选字号与颜色，标注会以图片形式写入该页（中文不乱码）。",
      pageLabel: "第 {cur} / {total} 页",
      textLabel: "标注文字",
      textPlaceholder: "如：此处需盖章",
      sizeLabel: "字号（pt）",
      colorLabel: "颜色",
      clickHint: "在预览图上点击，确定标注的左上角位置。",
      listTitle: "已添加的标注",
      listEmpty: "还没有标注。在预览图上点一下就会记下位置。",
      markAt: "位置 x {x} · y {y}（pt，原点为页面左上）",
      btn: "写入标注并下载",
      needMark: "先在预览图上点击定一个位置。",
    },
  },
  en: {
    tabs: {
      merge: "Merge",
      split: "Split",
      pages: "Pages",
      watermark: "Watermark",
      numbers: "Page Numbers",
      seal: "Cross-page Seal",
      convert: "Convert",
      annotate: "Annotate",
    },
    localNote: "Everything runs locally in your browser — files are never uploaded. Large files may take a while; please wait for the progress to finish.",
    dropPdfHint: "Drop PDFs here, or",
    dropImgHint: "Drop images here, or",
    dropSealHint: "Drop the seal image (transparent PNG) here, or",
    dropClick: "click to choose files",
    pagesUnit: "{n} pages",
    remove: "Remove",
    moveUp: "Move up",
    moveDown: "Move down",
    clear: "Clear",
    processing: "Processing…",
    download: "Download",
    addMore: "Add more",
    failed: "Something went wrong",
    tooBig: "Large file ({size}) — processing may be slow, please be patient.",
    merge: {
      desc: "Upload several PDFs, reorder them with the up/down buttons, and merge them into one download.",
      empty: "No PDFs yet. Select several at once, or add them in batches.",
      btn: "Merge & download",
      outLabel: "{files} files, {pages} pages in total",
    },
    split: {
      desc: "Extract a page range from one PDF into a new file, or split it page by page into a ZIP.",
      modeRange: "Extract by range",
      modeEach: "Split every page",
      rangeLabel: "Page range",
      rangePlaceholder: "e.g. 1-3,5,8-10",
      rangeHint: "Pages start at 1. Pages are extracted in the order you write; duplicates are kept.",
      invalidRange: "The range looks wrong or exceeds the page count — please check.",
      btnRange: "Extract & download",
      btnEach: "Split all pages into a ZIP",
      needFile: "Add a PDF first.",
    },
    pages: {
      desc: "See every page as a thumbnail: delete, rotate, reorder, insert a blank page of the same size, then export a new PDF.",
      rotate: "Rotate 90°",
      del: "Delete",
      insertBlank: "Insert blank after",
      blank: "Blank page",
      btn: "Export new PDF",
      loadingThumbs: "Rendering thumbnails…",
      confirmReset: "Choosing a new file discards the current page arrangement. Continue?",
    },
    watermark: {
      desc: "Stamp a text watermark on every page: set the text, size, opacity and tilt, tiled across the page or one in the centre. The text is placed as an image, so CJK text renders correctly.",
      textLabel: "Watermark text",
      sizeLabel: "Font size (pt)",
      opacityLabel: "Opacity",
      angleLabel: "Tilt angle (°)",
      layoutLabel: "Layout",
      layoutTile: "Tile the page",
      layoutCenter: "One in the centre",
      scopeLabel: "Apply to",
      scopeAll: "All pages",
      scopeRange: "Page range",
      rangeLabel: "Page range",
      btn: "Add watermark & download",
    },
    numbers: {
      desc: "Add a page number to every page: six positions, formatted as a plain number, 'X / N', or the Chinese 'page X of N' style.",
      posLabel: "Position",
      pos: {
        tl: "Top left",
        tc: "Top centre",
        tr: "Top right",
        bl: "Bottom left",
        bc: "Bottom centre",
        br: "Bottom right",
      },
      fmtLabel: "Format",
      fmtNum: "Number (3)",
      fmtOf: "X / N (3 / 10)",
      fmtZh: "Chinese (第 3 页 共 10 页)",
      sizeLabel: "Font size (pt)",
      startLabel: "Start at",
      btn: "Add page numbers & download",
      note: "Numeric formats are written as vector text; the Chinese format is placed as a high-resolution image — equally crisp in print.",
    },
    seal: {
      desc: "Upload a seal image (transparent PNG works best): the toolbox slices it vertically into as many strips as there are pages and stamps strip i on the right edge of page i, vertically centred — fan the printed pages and the strips reassemble into one whole seal. Note: this is image stamping, not a legally binding CA e-signature.",
      pdfLabel: "PDF to stamp",
      sealLabel: "Seal image",
      heightLabel: "Seal height (mm)",
      heightHint: "The whole seal is scaled to this height, then sliced evenly; a typical round company seal is about 40 mm across.",
      btn: "Stamp cross-page seal & download",
      info: "{pages} pages in total — one strip per page (strip i goes on page i).",
    },
    convert: {
      desc: "Convert between images and PDF: combine several images into one PDF, or render every PDF page to an image in a ZIP.",
      modeImg2Pdf: "Images to PDF",
      modePdf2Img: "PDF to images",
      sizeLabel: "Page size",
      sizeA4: "A4 (image centred to fit)",
      sizeOrig: "Original image size",
      fmtLabel: "Image format",
      scaleLabel: "Render scale",
      btnImg: "Build PDF & download",
      btnPdf: "Convert to images (ZIP)",
      emptyImg: "No images yet. JPG, PNG, WebP and other common formats are fine; multiple selection allowed.",
    },
    annotate: {
      desc: "Add a text note to a chosen page: pick the page, click on the preview where the note should start, then set the text, size and colour. Notes are written into the page as images, so CJK text is safe.",
      pageLabel: "Page {cur} of {total}",
      textLabel: "Note text",
      textPlaceholder: "e.g. Seal here",
      sizeLabel: "Font size (pt)",
      colorLabel: "Colour",
      clickHint: "Click on the preview to set the note's top-left corner.",
      listTitle: "Notes added",
      listEmpty: "No notes yet — click the preview to place one.",
      markAt: "at x {x} · y {y} (pt, from the page's top-left)",
      btn: "Write notes & download",
      needMark: "Click the preview to place the note first.",
    },
  },
};
