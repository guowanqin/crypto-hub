import type { Lang } from "./site";

// Sheet2Word 内嵌工具的双语文案（从 excel-to-word 独立站移植，口径一致）。
export interface ToolDict {
  badges: string[];
  privacyNote: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  dropTemplate: string;
  dropExcel: string;
  sampleTemplate: string;
  sampleExcel: string;
  loadSamples: string;
  templateLoaded: string;
  excelLoaded: string;
  placeholdersFound: string;
  errNoPlaceholders: string;
  errBadDocx: string;
  errBadExcel: string;
  errEmptyExcel: string;
  errUnmapped: string;
  mappingTitle: string;
  unmappedOption: string;
  previewTitle: string;
  totalRows: string;
  fileNameRule: string;
  fileNameByColumn: string;
  fileNameBySeq: string;
  willGenerate: string;
  generate: string;
  generating: string;
  downloadAll: string;
  downloadOne: string;
  generatedOk: string;
  errGenerate: string;
  howTitle: string;
  howBody: string;
}

export const TOOL_DICT: Record<Lang, ToolDict> = {
  zh: {
    badges: ["完全免费", "无行数限制", "免注册", "文件不离开浏览器"],
    privacyNote: "全部处理都在你的浏览器本地完成，模板和数据不会上传到任何服务器。",
    step1Title: "上传 Word 模板",
    step1Desc:
      "在模板里用双花括号写占位符，例如 {{姓名}}、{{金额}}。占位符名称与 Excel 表头对应即可。",
    step2Title: "上传 Excel 数据",
    step2Desc: "支持 .xlsx / .xls / .csv，第一行必须是表头，每一行数据将生成一份文档。",
    step3Title: "生成并下载",
    step3Desc: "按行批量生成 .docx，可打包成 ZIP 一次下载，也可以逐个下载。",
    dropTemplate: "点击选择 .docx 模板，或把文件拖到这里",
    dropExcel: "点击选择 Excel 文件，或把文件拖到这里",
    sampleTemplate: "下载示例模板",
    sampleExcel: "下载示例 Excel",
    loadSamples: "一键载入示例试一下",
    templateLoaded: "模板已载入",
    excelLoaded: "数据已载入",
    placeholdersFound: "检测到占位符",
    errNoPlaceholders:
      "这个模板里没有检测到 {{占位符}}。请先在 Word 里把要替换的位置写成 {{列名}} 的形式再上传。",
    errBadDocx: "模板读取失败，请确认文件是有效的 .docx 格式。",
    errBadExcel: "Excel 读取失败，请确认文件是 .xlsx / .xls / .csv 格式。",
    errEmptyExcel: "这份 Excel 没有数据行（只有表头或完全为空），请检查后再上传。",
    errUnmapped: "以下占位符还没有对应的 Excel 列",
    mappingTitle: "占位符与列的对应关系（按名称自动匹配，可手动调整）",
    unmappedOption: "（未对应）",
    previewTitle: "数据预览（前 5 行）",
    totalRows: "共 {n} 行数据",
    fileNameRule: "生成文件命名",
    fileNameByColumn: "用某一列的值命名",
    fileNameBySeq: "模板名 + 序号",
    willGenerate: "将生成 {n} 个文件",
    generate: "开始批量生成",
    generating: "生成中…",
    downloadAll: "打包下载全部（ZIP）",
    downloadOne: "下载",
    generatedOk: "已生成 {n} 个文件",
    errGenerate: "生成失败",
    howTitle: "占位符怎么写？",
    howBody:
      "在 Word 模板中，把需要按行替换的位置写成 {{列名}}，例如通知书里写「尊敬的 {{姓名}}：」，Excel 里就要有一列叫「姓名」。生成时每一行的数据会替换掉对应占位符，模板原有的字体、排版、页眉页脚都会原样保留。",
  },
  en: {
    badges: ["Completely free", "No row limit", "No sign-up", "Files never leave your browser"],
    privacyNote:
      "Everything runs locally in your browser. Your template and data are never uploaded to any server.",
    step1Title: "Upload your Word template",
    step1Desc:
      "Mark the spots to fill with double curly braces, e.g. {{Name}} or {{Amount}}. Placeholder names should match your Excel column headers.",
    step2Title: "Upload your Excel data",
    step2Desc:
      ".xlsx / .xls / .csv are supported. The first row must be headers; each data row becomes one document.",
    step3Title: "Generate & download",
    step3Desc: "Generate one .docx per row, download everything as a single ZIP, or grab files one by one.",
    dropTemplate: "Click to choose a .docx template, or drop the file here",
    dropExcel: "Click to choose an Excel file, or drop the file here",
    sampleTemplate: "Download sample template",
    sampleExcel: "Download sample Excel",
    loadSamples: "Load the samples & try it",
    templateLoaded: "Template loaded",
    excelLoaded: "Data loaded",
    placeholdersFound: "Placeholders detected",
    errNoPlaceholders:
      "No {{placeholders}} were found in this template. Please write the spots to replace as {{ColumnName}} in Word, then upload again.",
    errBadDocx: "Could not read the template. Please make sure it is a valid .docx file.",
    errBadExcel: "Could not read the Excel file. Please make sure it is .xlsx / .xls / .csv.",
    errEmptyExcel: "This Excel file has no data rows (header only, or completely empty). Please check it and upload again.",
    errUnmapped: "These placeholders have no matching Excel column yet",
    mappingTitle: "Placeholder → column mapping (auto-matched by name, adjustable)",
    unmappedOption: "(not mapped)",
    previewTitle: "Data preview (first 5 rows)",
    totalRows: "{n} data rows in total",
    fileNameRule: "File naming",
    fileNameByColumn: "Name files by a column value",
    fileNameBySeq: "Template name + number",
    willGenerate: "{n} files will be generated",
    generate: "Generate all documents",
    generating: "Generating…",
    downloadAll: "Download all (ZIP)",
    downloadOne: "Download",
    generatedOk: "{n} files generated",
    errGenerate: "Generation failed",
    howTitle: "How do placeholders work?",
    howBody:
      "In your Word template, write {{ColumnName}} wherever a value should be filled in — for example “Dear {{Name}}:” in a letter — and make sure your Excel sheet has a column called “Name”. Each row replaces the matching placeholders, while your template's fonts, layout, headers and footers are preserved exactly.",
  },
  tw: {
    badges: ["完全免費", "無行數限制", "免註冊", "檔案不離開瀏覽器"],
    privacyNote: "全部處理都在你的瀏覽器本地完成，模板和資料不會上傳到任何伺服器。",
    step1Title: "上傳 Word 模板",
    step1Desc: "在模板裡用雙花括號寫佔位符，例如 {{姓名}}、{{金額}}。佔位符名稱與 Excel 表頭對應即可。",
    step2Title: "上傳 Excel 資料",
    step2Desc: "支援 .xlsx / .xls / .csv，第一行必須是表頭，每一行資料將生成一份文件。",
    step3Title: "生成並下載",
    step3Desc: "按行批次生成 .docx，可打包成 ZIP 一次下載，也可以逐個下載。",
    dropTemplate: "點選選擇 .docx 模板，或把檔案拖到這裡",
    dropExcel: "點選選擇 Excel 檔案，或把檔案拖到這裡",
    sampleTemplate: "下載示例模板",
    sampleExcel: "下載示例 Excel",
    loadSamples: "一鍵載入示例試一下",
    templateLoaded: "模板已載入",
    excelLoaded: "資料已載入",
    placeholdersFound: "檢測到佔位符",
    errNoPlaceholders: "這個模板裡沒有檢測到 {{佔位符}}。請先在 Word 裡把要替換的位置寫成 {{列名}} 的形式再上傳。",
    errBadDocx: "模板讀取失敗，請確認檔案是有效的 .docx 格式。",
    errBadExcel: "Excel 讀取失敗，請確認檔案是 .xlsx / .xls / .csv 格式。",
    errEmptyExcel: "這份 Excel 沒有資料行（只有表頭或完全為空），請檢查後再上傳。",
    errUnmapped: "以下佔位符還沒有對應的 Excel 列",
    mappingTitle: "佔位符與列的對應關係（按名稱自動匹配，可手動調整）",
    unmappedOption: "（未對應）",
    previewTitle: "資料預覽（前 5 行）",
    totalRows: "共 {n} 行資料",
    fileNameRule: "生成檔案命名",
    fileNameByColumn: "用某一列的值命名",
    fileNameBySeq: "模板名 + 序號",
    willGenerate: "將生成 {n} 個檔案",
    generate: "開始批次生成",
    generating: "生成中…",
    downloadAll: "打包下載全部（ZIP）",
    downloadOne: "下載",
    generatedOk: "已生成 {n} 個檔案",
    errGenerate: "生成失敗",
    howTitle: "佔位符怎麼寫？",
    howBody: "在 Word 模板中，把需要按行替換的位置寫成 {{列名}}，例如通知書裡寫「尊敬的 {{姓名}}：」，Excel 裡就要有一列叫「姓名」。生成時每一行的資料會替換掉對應占位符，模板原有的字型、排版、頁首頁尾都會原樣保留。",
  },
};
