"use client";

import Link from "next/link";
import type { TagDef } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME, type Lang } from "@/lib/site";
import ToolCard from "./ToolCard";
import AdSlot from "./AdSlot";
import PdfToolbox from "./PdfToolbox";
import { useLang } from "./LangProvider";

const DICT: Record<
  Lang,
  {
    boardKicker: string;
    boardSub: string;
    aboutTitle: string;
    aboutParas: string[];
    scopeTitle: string;
    scopeParas: string[];
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "PDF 工具箱 · 站内可用",
    boardSub:
      "八个子工具都在这一页跑：选页签、传文件、下载结果。文件只在你的浏览器里处理，不经过任何服务器。",
    aboutTitle: "和信创 PDF 工具箱是什么关系",
    aboutParas: [
      "这个站内工具箱参考信创 PDF 工具箱（纯前端、离线运行的单文件 HTML 工具）的功能集整理实现：合并、拆分、页面重排与删除、插入空白页、水印、页码、骑缝章、批注、图片与 PDF 互转这些日常功能都齐了。做法也一样——纯前端、本地处理：合同、证件、财务单据这类不该上传的文件，打开页面就能处理，断网也照常工作。",
      "实现上有个细节值得一提：水印、中文页码和批注文字都是先在浏览器里绘成高清图片再贴进 PDF 的，所以中文不会出现字体缺失的豆腐块；纯数字页码则以矢量文字写入，缩放打印都清晰。",
    ],
    scopeTitle: "一期边界（不做的事，先说清）",
    scopeParas: [
      "PDF 转 Word / Excel 不做：纯前端无法把 PDF 的版式与表格可靠还原成可编辑文档，做出来也是废文件，不如不做。OCR 文字识别不做，需要云端或大型模型，已有专门的识别工具。骑缝章是按传统骑缝方式把印章图片切片盖到各页边缘，是图片盖章，不具 CA 电子签章的法律效力，正式电子签约请用有资质的电子签平台。",
      "另外两点如实说明：处理大文件时浏览器内存占用会明显上升，几百页的大文档建议先拆分再处理；带打开密码的加密 PDF 无法读取，需要先在原软件里解除密码。",
    ],
    toolsTitle: "PDF 工具 · 本类工具",
  },
  en: {
    boardKicker: "PDF Toolbox · Built-in",
    boardSub:
      "All eight sub-tools run on this page: pick a tab, drop your files, download the result. Files are processed only in your browser and never pass through a server.",
    aboutTitle: "How this relates to the Xinchuang PDF toolbox",
    aboutParas: [
      "This built-in toolbox follows the feature set of the Xinchuang PDF toolbox (a pure front-end, offline, single-file HTML tool): merge, split, page reordering and deletion, blank-page insertion, watermarks, page numbers, cross-page seals, annotations and image↔PDF conversion are all here. The approach is the same too — pure front-end, local processing: contracts, ID scans and financial documents that should not be uploaded can be handled right on this page, network cable optional.",
      "One implementation detail is worth mentioning: watermark text, Chinese page numbers and annotation text are first drawn as high-resolution images in the browser and then placed into the PDF, so CJK characters never turn into missing-glyph boxes; purely numeric page numbers are written as vector text and stay crisp at any zoom or print size.",
    ],
    scopeTitle: "Phase-one boundaries (what it does not do)",
    scopeParas: [
      "No PDF→Word/Excel: a pure front-end cannot faithfully rebuild editable documents with layout and tables from a PDF — the output would be unusable, so we don't pretend. No OCR either; that needs cloud services or large models, and dedicated recognition tools exist. The cross-page seal stamps the seal image across page edges the traditional perforation way — it is image stamping and carries no legal weight of a CA e-signature; use a qualified e-signature platform for formal contracts.",
      "Two more honest notes: very large files use noticeably more browser memory — for documents of several hundred pages, split first, then process. Password-protected (encrypted) PDFs cannot be read; remove the password in your original software first.",
    ],
    toolsTitle: "PDF Tools · Tools in this shelf",
  },
  tw: {
    boardKicker: "PDF 工具箱 · 站內可用",
    boardSub: "八個子工具都在這一頁跑：選頁籤、傳檔案、下載結果。檔案只在你的瀏覽器裡處理，不經過任何伺服器。",
    aboutTitle: "和信創 PDF 工具箱是什麼關係",
    aboutParas: [
      "這個站內工具箱參考信創 PDF 工具箱（純前端、離線執行的單檔案 HTML 工具）的功能集整理實現：合併、拆分、頁面重排與刪除、插入空白頁、水印、頁碼、騎縫章、批註、圖片與 PDF 互轉這些日常功能都齊了。做法也一樣——純前端、本地處理：合同、證件、財務單據這類不該上傳的檔案，開啟頁面就能處理，斷網也照常工作。",
      "實現上有個細節值得一提：水印、中文頁碼和批註文字都是先在瀏覽器裡繪成高畫質圖片再貼進 PDF 的，所以中文不會出現字型缺失的豆腐塊；純數字頁碼則以向量文字寫入，縮放列印都清晰。",
    ],
    scopeTitle: "一期邊界（不做的事，先說清）",
    scopeParas: [
      "PDF 轉 Word / Excel 不做：純前端無法把 PDF 的版式與表格可靠還原成可編輯文件，做出來也是廢檔案，不如不做。OCR 文字識別不做，需要雲端或大型模型，已有專門的識別工具。騎縫章是按傳統騎縫方式把印章圖片切片蓋到各頁邊緣，是圖片蓋章，不具 CA 電子簽章的法律效力，正式電子簽約請用有資質的電子籤平臺。",
      "另外兩點如實說明：處理大檔案時瀏覽器記憶體佔用會明顯上升，幾百頁的大文件建議先拆分再處理；帶開啟密碼的加密 PDF 無法讀取，需要先在原軟體裡解除密碼。",
    ],
    toolsTitle: "PDF 工具 · 本類工具",
  },
};

export default function PdfClient({
  tag,
  adsPreview = false,
}: {
  tag: TagDef;
  adsPreview?: boolean;
}) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const d = DICT[lang];
  const list = toolsByTag(tag.id);
  const otherLang = lang === "en" ? "zh" : "en";

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
      </p>
      <section className="tag-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="tag-mascot" />
        <div>
          <p className="tag-kicker">
            {t.tagPageIntro} · {t.toolsCount.replace("{n}", String(list.length))}
          </p>
          <h1 className="tag-title">
            {tag.name[lang]}
            <span className="tag-title-alt">{tag.name[otherLang]}</span>
          </h1>
          <p className="tag-intro">{tag.intro[lang]}</p>
        </div>
      </section>

      {/* 广告位：标签页顶部横幅 */}
      <AdSlot id="tag_top" preview={adsPreview} />

      <section className="ft-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">{d.boardSub}</p>
        </div>
        <PdfToolbox />
      </section>

      <div className="burn-notes">
        <div className="card">
          <h2>{d.aboutTitle}</h2>
          {d.aboutParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
          <p className="body-text" style={{ marginTop: 10 }}>
            {t.disclaimer}
          </p>
        </div>
        <div className="card">
          <h2>{d.scopeTitle}</h2>
          {d.scopeParas.map((p, i) => (
            <p className="body-text" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {list.length > 0 && (
        <section className="section">
          <h2 className="section-title">{d.toolsTitle}</h2>
          <div className="card-grid">
            {list.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* 广告位：页脚上方横幅 */}
      <AdSlot id="footer_top" preview={adsPreview} />
    </main>
  );
}
