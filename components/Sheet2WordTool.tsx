"use client";

// Sheet2Word 工具本体：从 excel-to-word 独立站 Tool.tsx 移植。
// 语言跟随导航站全站切换（LangProvider），样式并入本主题（globals.css 的 .tool-* 规则）。
import { useCallback, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { TOOL_DICT } from "@/lib/tool-i18n";
import {
  downloadBlob,
  extractPlaceholders,
  parseExcel,
  renderDocument,
  sanitizeFileName,
  type ExcelData,
} from "@/lib/engine";
import {
  sampleExcelArrayBuffer,
  sampleExcelBlob,
  sampleTemplateArrayBuffer,
  sampleTemplateBlob,
} from "@/lib/samples";
import { useLang } from "./LangProvider";

interface GeneratedFile {
  name: string;
  blob: Blob;
}

export default function Sheet2WordTool() {
  const { lang } = useLang();
  const t = TOOL_DICT[lang];

  const [templateBuf, setTemplateBuf] = useState<ArrayBuffer | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [templateError, setTemplateError] = useState("");

  const [excel, setExcel] = useState<ExcelData | null>(null);
  const [excelName, setExcelName] = useState("");
  const [excelError, setExcelError] = useState("");

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [nameMode, setNameMode] = useState<"column" | "seq">("column");
  const [nameColumn, setNameColumn] = useState("");

  const [results, setResults] = useState<GeneratedFile[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const templateInput = useRef<HTMLInputElement>(null);
  const excelInput = useRef<HTMLInputElement>(null);

  const autoMap = useCallback((phs: string[], headers: string[]) => {
    setMapping((prev) => {
      const next: Record<string, string> = {};
      for (const ph of phs) {
        if (prev[ph] && headers.includes(prev[ph])) next[ph] = prev[ph];
        else next[ph] = headers.includes(ph) ? ph : "";
      }
      return next;
    });
  }, []);

  const loadTemplate = useCallback(
    async (buf: ArrayBuffer, name: string) => {
      setResults(null);
      setGenError("");
      try {
        const phs = extractPlaceholders(buf);
        if (phs.length === 0) {
          setTemplateBuf(null);
          setPlaceholders([]);
          setTemplateName("");
          setTemplateError(t.errNoPlaceholders);
          return;
        }
        setTemplateBuf(buf);
        setTemplateName(name);
        setPlaceholders(phs);
        setTemplateError("");
        if (excel) autoMap(phs, excel.headers);
      } catch {
        setTemplateBuf(null);
        setPlaceholders([]);
        setTemplateError(t.errBadDocx);
      }
    },
    [autoMap, excel, t]
  );

  const loadExcel = useCallback(
    async (buf: ArrayBuffer, name: string) => {
      setResults(null);
      setGenError("");
      try {
        const data = parseExcel(buf);
        if (data.rows.length === 0) {
          setExcel(null);
          setExcelError(t.errEmptyExcel);
          return;
        }
        setExcel(data);
        setExcelName(name);
        setExcelError("");
        setNameColumn((prev) => (prev && data.headers.includes(prev) ? prev : data.headers[0]));
        if (placeholders.length > 0) autoMap(placeholders, data.headers);
      } catch {
        setExcel(null);
        setExcelError(t.errBadExcel);
      }
    },
    [autoMap, placeholders, t]
  );

  const unmapped = useMemo(
    () => placeholders.filter((ph) => !mapping[ph]),
    [placeholders, mapping]
  );

  const ready = templateBuf !== null && excel !== null && placeholders.length > 0;
  const rowCount = excel?.rows.length ?? 0;

  const generate = async () => {
    if (!templateBuf || !excel) return;
    if (unmapped.length > 0) {
      setGenError(`${t.errUnmapped}：${unmapped.map((p) => `{{${p}}}`).join("、")}`);
      return;
    }
    setGenerating(true);
    setGenError("");
    try {
      const base = templateName.replace(/\.docx$/i, "") || "document";
      const used = new Map<string, number>();
      const files: GeneratedFile[] = excel.rows.map((row, i) => {
        const data: Record<string, string> = {};
        for (const ph of placeholders) data[ph] = row[mapping[ph]] ?? "";
        const blob = renderDocument(templateBuf, data);
        let stem: string;
        if (nameMode === "column" && nameColumn) {
          stem = sanitizeFileName(row[nameColumn] || `${base}-${i + 1}`);
        } else {
          stem = sanitizeFileName(`${base}-${i + 1}`);
        }
        const count = (used.get(stem) ?? 0) + 1;
        used.set(stem, count);
        if (count > 1) stem = `${stem}-${count}`;
        return { name: `${stem}.docx`, blob };
      });
      setResults(files);
    } catch (e) {
      setGenError(`${t.errGenerate}：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadAll = async () => {
    if (!results) return;
    const zip = new JSZip();
    for (const f of results) zip.file(f.name, f.blob);
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "documents.zip");
  };

  const onDrop = (kind: "template" | "excel") => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void file.arrayBuffer().then((buf) =>
      kind === "template" ? loadTemplate(buf, file.name) : loadExcel(buf, file.name)
    );
  };

  const loadSamples = async () => {
    const tbuf = await sampleTemplateArrayBuffer();
    await loadTemplate(tbuf, lang === "zh" ? "录用通知书-示例模板.docx" : "sample-template.docx");
    const ebuf = sampleExcelArrayBuffer();
    await loadExcel(ebuf, lang === "zh" ? "员工名单-示例.xlsx" : "sample-data.xlsx");
  };

  return (
    <div className="tool-embed">
      <div className="badges">
        {t.badges.map((b) => (
          <span className="badge badge-embedded" key={b}>
            {b}
          </span>
        ))}
      </div>
      <p className="privacy-note">🔒 {t.privacyNote}</p>

      {/* 步骤 1：模板 */}
      <section className="card tool-card-in">
        <h2>
          <span className="step-no">1</span>
          {t.step1Title}
        </h2>
        <p className="card-desc">{t.step1Desc}</p>
        <div
          className="dropzone"
          onClick={() => templateInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop("template")}
        >
          {templateBuf ? (
            <span>
              ✅ {t.templateLoaded}：{templateName}
            </span>
          ) : (
            <span>{t.dropTemplate}</span>
          )}
        </div>
        <input
          ref={templateInput}
          type="file"
          accept=".docx"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void f.arrayBuffer().then((buf) => loadTemplate(buf, f.name));
            e.target.value = "";
          }}
        />
        {templateError && <p className="error">⚠️ {templateError}</p>}
        {placeholders.length > 0 && (
          <div className="chips-row">
            <span className="chips-label">
              {t.placeholdersFound}（{placeholders.length}）：
            </span>
            {placeholders.map((ph) => (
              <code className="chip" key={ph}>
                {`{{${ph}}}`}
              </code>
            ))}
          </div>
        )}
        <details className="how">
          <summary>{t.howTitle}</summary>
          <p>{t.howBody}</p>
        </details>
        <div className="sample-row">
          <button
            className="btn ghost"
            onClick={() => void sampleTemplateBlob().then((b) => downloadBlob(b, "sample-template.docx"))}
          >
            ⬇ {t.sampleTemplate}
          </button>
          <button
            className="btn ghost"
            onClick={() => downloadBlob(sampleExcelBlob(), "sample-data.xlsx")}
          >
            ⬇ {t.sampleExcel}
          </button>
          <button className="btn ghost" onClick={() => void loadSamples()}>
            ▶ {t.loadSamples}
          </button>
        </div>
      </section>

      {/* 步骤 2：数据 */}
      <section className="card tool-card-in">
        <h2>
          <span className="step-no">2</span>
          {t.step2Title}
        </h2>
        <p className="card-desc">{t.step2Desc}</p>
        <div
          className="dropzone"
          onClick={() => excelInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop("excel")}
        >
          {excel ? (
            <span>
              ✅ {t.excelLoaded}：{excelName}（{t.totalRows.replace("{n}", String(rowCount))}）
            </span>
          ) : (
            <span>{t.dropExcel}</span>
          )}
        </div>
        <input
          ref={excelInput}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void f.arrayBuffer().then((buf) => loadExcel(buf, f.name));
            e.target.value = "";
          }}
        />
        {excelError && <p className="error">⚠️ {excelError}</p>}

        {excel && (
          <>
            <h3 className="sub-title">{t.previewTitle}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {excel.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excel.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {excel.headers.map((h) => (
                        <td key={h}>{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {excel && placeholders.length > 0 && (
          <>
            <h3 className="sub-title">{t.mappingTitle}</h3>
            <div className="mapping">
              {placeholders.map((ph) => (
                <div className="mapping-row" key={ph}>
                  <code className="chip">{`{{${ph}}}`}</code>
                  <span className="mapping-arrow">→</span>
                  <select
                    value={mapping[ph] ?? ""}
                    className={!mapping[ph] ? "select-warn" : ""}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [ph]: e.target.value }))
                    }
                  >
                    <option value="">{t.unmappedOption}</option>
                    {excel.headers.map((h) => (
                      <option value={h} key={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {unmapped.length > 0 && (
              <p className="error">
                ⚠️ {t.errUnmapped}：{unmapped.map((p) => `{{${p}}}`).join("、")}
              </p>
            )}
          </>
        )}
      </section>

      {/* 步骤 3：生成 */}
      <section className="card tool-card-in">
        <h2>
          <span className="step-no">3</span>
          {t.step3Title}
        </h2>
        <p className="card-desc">{t.step3Desc}</p>
        <div className="naming">
          <span className="naming-label">{t.fileNameRule}：</span>
          <label>
            <input
              type="radio"
              name="sw-name-mode"
              checked={nameMode === "column"}
              onChange={() => setNameMode("column")}
            />
            {t.fileNameByColumn}
          </label>
          {nameMode === "column" && excel && (
            <select value={nameColumn} onChange={(e) => setNameColumn(e.target.value)}>
              {excel.headers.map((h) => (
                <option value={h} key={h}>
                  {h}
                </option>
              ))}
            </select>
          )}
          <label>
            <input
              type="radio"
              name="sw-name-mode"
              checked={nameMode === "seq"}
              onChange={() => setNameMode("seq")}
            />
            {t.fileNameBySeq}
          </label>
        </div>
        <div className="generate-row">
          <button className="btn primary" disabled={!ready || generating} onClick={() => void generate()}>
            {generating ? t.generating : t.generate}
          </button>
          {ready && <span className="will-gen">{t.willGenerate.replace("{n}", String(rowCount))}</span>}
        </div>
        {genError && <p className="error">⚠️ {genError}</p>}
        {results && (
          <>
            <p className="ok">✅ {t.generatedOk.replace("{n}", String(results.length))}</p>
            <button className="btn primary" onClick={() => void downloadAll()}>
              ⬇ {t.downloadAll}
            </button>
            <ul className="results">
              {results.map((f) => (
                <li key={f.name}>
                  <span className="result-name">{f.name}</span>
                  <button className="btn small" onClick={() => downloadBlob(f.blob, f.name)}>
                    {t.downloadOne}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
