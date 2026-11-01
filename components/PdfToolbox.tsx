"use client";

import { useState } from "react";
import { PDF_DICT, type PdfTabId } from "@/lib/pdfbox-i18n";
import { useLang } from "./LangProvider";
import MergeTool from "./pdfbox/MergeTool";
import SplitTool from "./pdfbox/SplitTool";
import PagesTool from "./pdfbox/PagesTool";
import WatermarkTool from "./pdfbox/WatermarkTool";
import PageNumbersTool from "./pdfbox/PageNumbersTool";
import SealTool from "./pdfbox/SealTool";
import ConvertTool from "./pdfbox/ConvertTool";
import AnnotateTool from "./pdfbox/AnnotateTool";

const TAB_ORDER: PdfTabId[] = [
  "merge",
  "split",
  "pages",
  "watermark",
  "numbers",
  "seal",
  "convert",
  "annotate",
];

export default function PdfToolbox() {
  const { lang } = useLang();
  const d = PDF_DICT[lang];
  const [tab, setTab] = useState<PdfTabId>("merge");

  return (
    <div className="pdf-toolbox">
      <div className="pdf-tabs" role="tablist" aria-label="PDF">
        {TAB_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`pdf-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {d.tabs[id]}
          </button>
        ))}
      </div>
      <p className="pdf-localnote">{d.localNote}</p>
      <div className="pdf-panel">
        {tab === "merge" && <MergeTool d={d} />}
        {tab === "split" && <SplitTool d={d} />}
        {tab === "pages" && <PagesTool d={d} />}
        {tab === "watermark" && <WatermarkTool d={d} />}
        {tab === "numbers" && <PageNumbersTool d={d} />}
        {tab === "seal" && <SealTool d={d} />}
        {tab === "convert" && <ConvertTool d={d} />}
        {tab === "annotate" && <AnnotateTool d={d} />}
      </div>
    </div>
  );
}
