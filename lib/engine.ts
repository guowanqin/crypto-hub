import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import * as XLSX from "xlsx";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// 从一段 XML 里抽纯文本：占位符可能被 Word 拆进多个 <w:t> run，
// 先去掉全部标签再在拼接后的文本上找 {{...}}，即可正确识别被拆分的占位符。
function xmlToText(xml: string): string {
  return xml.replace(/<[^>]+>/g, "");
}

export function extractPlaceholders(templateBuf: ArrayBuffer): string[] {
  const zip = new PizZip(templateBuf);
  const names: string[] = [];
  const seen = new Set<string>();
  const parts = Object.keys(zip.files).filter((p) =>
    /^word\/(document|header\d*|footer\d*)\.xml$/.test(p)
  );
  for (const part of parts) {
    const file = zip.file(part);
    if (!file) continue;
    const text = xmlToText(file.asText());
    const re = /\{\{\s*([^{}]+?)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const name = m[1].trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
  }
  return names;
}

export interface ExcelData {
  headers: string[];
  rows: Record<string, string>[];
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    const y = v.getFullYear();
    const mo = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  return String(v);
}

export function parseExcel(buf: ArrayBuffer): ExcelData {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });
  if (aoa.length === 0) return { headers: [], rows: [] };
  const headers = (aoa[0] as unknown[]).map((h) => cellToString(h).trim()).filter((h) => h !== "");
  const rows: Record<string, string>[] = [];
  for (const raw of aoa.slice(1)) {
    const cells = raw as unknown[];
    const rec: Record<string, string> = {};
    let allEmpty = true;
    headers.forEach((h, i) => {
      const v = cellToString(cells[i]);
      rec[h] = v;
      if (v !== "") allEmpty = false;
    });
    if (!allEmpty) rows.push(rec);
  }
  return { headers, rows };
}

// 用一行数据渲染一份文档。注意：docxtemplater 默认分隔符是单花括号 { }，
// 必须显式设为 {{ }}；每次渲染都要用模板字节新建 PizZip（渲染会修改 zip）。
export function renderDocument(
  templateBuf: ArrayBuffer,
  data: Record<string, string>
): Blob {
  const zip = new PizZip(templateBuf);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });
  doc.render(data);
  return doc.getZip().generate({ type: "blob", mimeType: DOCX_MIME });
}

export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "_").trim();
  return cleaned === "" ? "document" : cleaned;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
