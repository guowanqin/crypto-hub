import type { Lang } from "./site";

// 图片工具箱（ImageToolbox）界面字典：跟随全站 LangProvider，无独立语言切换。
export interface ImgBoxDict {
  privacyNote: string;
  dropHint: string;
  dropImages: string;
  addImages: string;
  clear: string;
  download: string;
  downloadZip: string;
  processing: string;
  process: string;
  original: string;
  result: string;
  savedRatio: string;
  errNotImage: string;
  errLoad: string;
  errNoImages: string;
  errGeneric: string;
  filesUnit: string;
  tabs: {
    compress: string;
    resize: string;
    watermark: string;
    grid: string;
    collage: string;
    stitch: string;
    qrcode: string;
    exif: string;
    mosaic: string;
    gif: string;
  };
  compress: {
    desc: string;
    quality: string;
    format: string;
    run: string;
    empty: string;
  };
  resize: {
    desc: string;
    mode: string;
    modeWidth: string;
    modeHeight: string;
    modeExact: string;
    width: string;
    height: string;
    format: string;
    quality: string;
    keepRatioNote: string;
    run: string;
    empty: string;
  };
  watermark: {
    desc: string;
    text: string;
    textPlaceholder: string;
    position: string;
    opacity: string;
    fontSize: string;
    color: string;
    positions: string[];
    exportAll: string;
    needImage: string;
  };
  grid: {
    desc: string;
    rows: string;
    cols: string;
    orderNote: string;
    needImage: string;
  };
  collage: {
    desc: string;
    cols: string;
    gap: string;
    bg: string;
    exportBtn: string;
    needTwo: string;
  };
  stitch: {
    desc: string;
    direction: string;
    vertical: string;
    horizontal: string;
    scaleMode: string;
    scaleWidest: string;
    scaleNarrowest: string;
    scaleNone: string;
    align: string;
    alignStart: string;
    alignCenter: string;
    alignEnd: string;
    exportBtn: string;
    needTwo: string;
  };
  qrcode: {
    desc: string;
    textLabel: string;
    textPlaceholder: string;
    size: string;
    downloadPng: string;
    errEmpty: string;
    errTooLong: string;
  };
  exif: {
    desc: string;
    summaryTitle: string;
    make: string;
    model: string;
    takenAt: string;
    software: string;
    gps: string;
    gpsYes: string;
    gpsNo: string;
    dimensions: string;
    noExif: string;
    stripBtn: string;
    verifyOk: string;
    verifyFail: string;
    downloadClean: string;
    needImage: string;
  };
  mosaic: {
    desc: string;
    blockSize: string;
    undo: string;
    clearRects: string;
    exportBtn: string;
    rectsUnit: string;
    needImage: string;
  };
  gif: {
    desc: string;
    interval: string;
    frameWidth: string;
    run: string;
    needTwo: string;
    resultNote: string;
  };
}

export const IMGBOX_DICT: Record<Lang, ImgBoxDict> = {
  zh: {
    privacyNote: "全部处理都在你的浏览器本地完成，图片不上传任何服务器。",
    dropHint: "把图片拖到这里，或",
    dropImages: "点击选择图片",
    addImages: "继续添加图片",
    clear: "清空",
    download: "下载",
    downloadZip: "全部打包 ZIP 下载",
    processing: "处理中…",
    process: "开始处理",
    original: "原图",
    result: "结果",
    savedRatio: "省",
    errNotImage: "请选择图片文件（JPG / PNG / WebP / GIF / BMP 等）。",
    errLoad: "这张图片读取失败，已跳过。",
    errNoImages: "先添加至少一张图片。",
    errGeneric: "处理失败，换一张图试试。",
    filesUnit: "张",
    tabs: {
      compress: "批量压缩",
      resize: "改尺寸/转格式",
      watermark: "加水印",
      grid: "九宫格切图",
      collage: "拼图",
      stitch: "长图拼接",
      qrcode: "二维码生成",
      exif: "EXIF 清除",
      mosaic: "标注打码",
      gif: "图片转 GIF",
    },
    compress: {
      desc: "多张图片一次压缩：调质量、选输出格式，逐张看体积变化，最后可打包一次下载。",
      quality: "压缩质量",
      format: "输出格式",
      run: "开始压缩",
      empty: "压缩结果会显示在这里。",
    },
    resize: {
      desc: "批量改尺寸并互转格式：按宽度、按高度等比缩放，或指定精确宽高。",
      mode: "缩放方式",
      modeWidth: "按宽度等比",
      modeHeight: "按高度等比",
      modeExact: "精确宽高",
      width: "宽度（px）",
      height: "高度（px）",
      format: "输出格式",
      quality: "质量",
      keepRatioNote: "等比模式下每张图按自己的比例缩放。",
      run: "开始处理",
      empty: "处理结果会显示在这里。",
    },
    watermark: {
      desc: "给图片加文字水印：内容、九宫格位置、透明度、字号、颜色都可调，预览满意后可批量导出。",
      text: "水印文字",
      textPlaceholder: "例如：© 我的账号名",
      position: "位置",
      opacity: "透明度",
      fontSize: "字号（占图宽 %）",
      color: "颜色",
      positions: ["左上", "上中", "右上", "左中", "居中", "右中", "左下", "下中", "右下"],
      exportAll: "批量导出全部",
      needImage: "先添加至少一张图片，水印会实时预览在第一张上。",
    },
    grid: {
      desc: "把一张图切成网格小图：默认 3×3 九宫格（行列 2–4 可选），小图带顺序编号，打包下载后按序号依次发布即可。",
      rows: "行数",
      cols: "列数",
      orderNote: "编号即发布顺序（从左到右、从上到下）。",
      needImage: "先选择一张图片。",
    },
    collage: {
      desc: "多张图片拼成一张网格大图：图片按封面方式裁切填满格子，列数、间距和背景色可调。",
      cols: "列数",
      gap: "间距（px）",
      bg: "背景色",
      exportBtn: "导出拼图",
      needTwo: "至少添加 2 张图片再拼图。",
    },
    stitch: {
      desc: "把多张截图或照片首尾拼成一张长图：纵向/横向可选，可先把宽度（或高度）等比统一。",
      direction: "方向",
      vertical: "纵向拼接",
      horizontal: "横向拼接",
      scaleMode: "尺寸统一",
      scaleWidest: "等比统一到最大",
      scaleNarrowest: "等比统一到最小",
      scaleNone: "不缩放（原尺寸）",
      align: "对齐",
      alignStart: "靠左/靠上",
      alignCenter: "居中",
      alignEnd: "靠右/靠下",
      exportBtn: "导出长图",
      needTwo: "至少添加 2 张图片再拼接。",
    },
    qrcode: {
      desc: "把文本或网址生成二维码 PNG：尺寸可选，下载后可直接打印或贴到海报上。",
      textLabel: "内容",
      textPlaceholder: "输入文本或网址，例如 https://18btc.cc",
      size: "尺寸（px）",
      downloadPng: "下载 PNG",
      errEmpty: "先输入要生成二维码的内容。",
      errTooLong: "内容太长，二维码装不下，缩短一点再试。",
    },
    exif: {
      desc: "查看照片的 EXIF 信息（设备、拍摄时间、GPS 有无），再一键重编码导出一张不带任何 EXIF 的干净图；导出后会自动复查验证。",
      summaryTitle: "EXIF 摘要",
      make: "品牌",
      model: "机型",
      takenAt: "拍摄时间",
      software: "软件",
      gps: "GPS 定位",
      gpsYes: "有（图片里带着位置信息，发出去前建议清除）",
      gpsNo: "无",
      dimensions: "尺寸",
      noExif: "这张图没有读到 EXIF 信息（截图、表情图通常如此）。",
      stripBtn: "清除 EXIF 并导出",
      verifyOk: "已复查：导出图不含 EXIF 信息。",
      verifyFail: "复查仍发现 EXIF 残留，请换个格式再试。",
      downloadClean: "下载干净图",
      needImage: "先选择一张图片。",
    },
    mosaic: {
      desc: "在图上按住鼠标拖出方框即可打码（马赛克像素化），可打多个框；导出为原图尺寸的成品图。",
      blockSize: "马赛克格子大小",
      undo: "撤销一个",
      clearRects: "清空打码",
      exportBtn: "导出成品图",
      rectsUnit: "个打码框",
      needImage: "先选择一张图片，再在图上拖框打码。",
    },
    gif: {
      desc: "把多张图片按顺序合成一张动图 GIF：帧间隔可调，宽度可选；帧序就是添加顺序。",
      interval: "帧间隔（毫秒）",
      frameWidth: "画面宽度（px）",
      run: "合成 GIF",
      needTwo: "至少添加 2 张图片再合成。",
      resultNote: "合成完成，预览如下（循环播放）：",
    },
  },
  en: {
    privacyNote: "Everything is processed locally in your browser — images are never uploaded to any server.",
    dropHint: "Drag images here, or",
    dropImages: "click to choose images",
    addImages: "Add more images",
    clear: "Clear",
    download: "Download",
    downloadZip: "Download all as ZIP",
    processing: "Processing…",
    process: "Process",
    original: "Original",
    result: "Result",
    savedRatio: "saved",
    errNotImage: "Please choose image files (JPG / PNG / WebP / GIF / BMP…).",
    errLoad: "One image failed to load and was skipped.",
    errNoImages: "Add at least one image first.",
    errGeneric: "Processing failed — try another image.",
    filesUnit: "files",
    tabs: {
      compress: "Compress",
      resize: "Resize / Convert",
      watermark: "Watermark",
      grid: "Grid Slice",
      collage: "Collage",
      stitch: "Long Stitch",
      qrcode: "QR Code",
      exif: "EXIF Scrub",
      mosaic: "Mosaic",
      gif: "Image to GIF",
    },
    compress: {
      desc: "Compress many images at once: tune quality, pick the output format, see each file's size change, then download individually or as one ZIP.",
      quality: "Quality",
      format: "Output format",
      run: "Compress",
      empty: "Compressed results will appear here.",
    },
    resize: {
      desc: "Resize images in batch and convert formats: scale by width or height keeping the aspect ratio, or set an exact size.",
      mode: "Resize mode",
      modeWidth: "By width (keep ratio)",
      modeHeight: "By height (keep ratio)",
      modeExact: "Exact size",
      width: "Width (px)",
      height: "Height (px)",
      format: "Output format",
      quality: "Quality",
      keepRatioNote: "In ratio modes each image scales by its own proportions.",
      run: "Process",
      empty: "Results will appear here.",
    },
    watermark: {
      desc: "Add a text watermark: content, 9-grid position, opacity, size and color are adjustable; preview on the first image, then export all.",
      text: "Watermark text",
      textPlaceholder: "e.g. © my handle",
      position: "Position",
      opacity: "Opacity",
      fontSize: "Font size (% of width)",
      color: "Color",
      positions: ["Top-left", "Top-center", "Top-right", "Middle-left", "Center", "Middle-right", "Bottom-left", "Bottom-center", "Bottom-right"],
      exportAll: "Export all",
      needImage: "Add at least one image — the watermark previews live on the first one.",
    },
    grid: {
      desc: "Slice one image into a grid — 3×3 by default (2–4 rows/columns). Tiles are numbered in posting order and packed into a ZIP.",
      rows: "Rows",
      cols: "Columns",
      orderNote: "Numbers show the posting order (left to right, top to bottom).",
      needImage: "Choose an image first.",
    },
    collage: {
      desc: "Combine many images into one grid collage: photos are cover-cropped into cells; columns, gap and background color are adjustable.",
      cols: "Columns",
      gap: "Gap (px)",
      bg: "Background",
      exportBtn: "Export collage",
      needTwo: "Add at least 2 images to build a collage.",
    },
    stitch: {
      desc: "Stitch screenshots or photos edge-to-edge into one long image: vertical or horizontal, with optional proportional size unification.",
      direction: "Direction",
      vertical: "Vertical",
      horizontal: "Horizontal",
      scaleMode: "Unify size",
      scaleWidest: "Scale to largest",
      scaleNarrowest: "Scale to smallest",
      scaleNone: "No scaling (original)",
      align: "Align",
      alignStart: "Start",
      alignCenter: "Center",
      alignEnd: "End",
      exportBtn: "Export stitched image",
      needTwo: "Add at least 2 images to stitch.",
    },
    qrcode: {
      desc: "Turn text or a URL into a QR code PNG: pick a size, download, print or drop it into a poster.",
      textLabel: "Content",
      textPlaceholder: "Enter text or a URL, e.g. https://18btc.cc",
      size: "Size (px)",
      downloadPng: "Download PNG",
      errEmpty: "Enter the content for the QR code first.",
      errTooLong: "Content is too long for a QR code — shorten it and retry.",
    },
    exif: {
      desc: "Inspect a photo's EXIF (device, capture time, GPS presence), then re-encode it into a clean copy with no EXIF at all — the export is re-checked automatically.",
      summaryTitle: "EXIF summary",
      make: "Make",
      model: "Model",
      takenAt: "Taken at",
      software: "Software",
      gps: "GPS location",
      gpsYes: "Present (this photo carries location data — scrub before sharing)",
      gpsNo: "None",
      dimensions: "Dimensions",
      noExif: "No EXIF found in this image (typical for screenshots and stickers).",
      stripBtn: "Scrub EXIF & export",
      verifyOk: "Verified: the exported image contains no EXIF.",
      verifyFail: "The re-check still found EXIF remnants — try another format.",
      downloadClean: "Download clean image",
      needImage: "Choose an image first.",
    },
    mosaic: {
      desc: "Drag rectangles over the image to pixelate them (mosaic). Multiple boxes allowed; export at the original resolution.",
      blockSize: "Mosaic block size",
      undo: "Undo one",
      clearRects: "Clear boxes",
      exportBtn: "Export image",
      rectsUnit: "mosaic boxes",
      needImage: "Choose an image first, then drag boxes over it.",
    },
    gif: {
      desc: "Combine multiple images into one animated GIF, in the order you added them: frame interval and width are adjustable.",
      interval: "Frame interval (ms)",
      frameWidth: "Frame width (px)",
      run: "Build GIF",
      needTwo: "Add at least 2 images to build a GIF.",
      resultNote: "Done — preview (looping):",
    },
  },
};
