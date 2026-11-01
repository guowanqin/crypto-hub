"use client";

// 图片工具箱本体：顶部子工具页签切换，十个子工具全部纯前端本地处理。
// 语言跟随全站 LangProvider（不在此处另设语言切换）。
import { useState } from "react";
import { useImgDict } from "./imagebox/shared";
import CompressTool from "./imagebox/CompressTool";
import ResizeTool from "./imagebox/ResizeTool";
import WatermarkTool from "./imagebox/WatermarkTool";
import GridCutTool from "./imagebox/GridCutTool";
import CollageTool from "./imagebox/CollageTool";
import StitchTool from "./imagebox/StitchTool";
import QrTool from "./imagebox/QrTool";
import ExifTool from "./imagebox/ExifTool";
import MosaicTool from "./imagebox/MosaicTool";
import GifTool from "./imagebox/GifTool";

const TAB_KEYS = [
  "compress",
  "resize",
  "watermark",
  "grid",
  "collage",
  "stitch",
  "qrcode",
  "exif",
  "mosaic",
  "gif",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const TAB_ICONS: Record<TabKey, string> = {
  compress: "🗜️",
  resize: "↔️",
  watermark: "©️",
  grid: "🔲",
  collage: "🧩",
  stitch: "🧵",
  qrcode: "🔳",
  exif: "🧹",
  mosaic: "🎭",
  gif: "🎞️",
};

export default function ImageToolbox() {
  const { t } = useImgDict();
  const [tab, setTab] = useState<TabKey>("compress");

  return (
    <div className="tool-embed imgbox">
      <div className="badges">
        <span className="badge badge-embedded">🔒 {t.privacyNote}</span>
      </div>
      <nav className="imgbox-tabs" aria-label="image tools">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`imgbox-tab${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            <span aria-hidden="true">{TAB_ICONS[key]}</span> {t.tabs[key]}
          </button>
        ))}
      </nav>
      <section className="card tool-card-in imgbox-panel">
        {tab === "compress" && <CompressTool />}
        {tab === "resize" && <ResizeTool />}
        {tab === "watermark" && <WatermarkTool />}
        {tab === "grid" && <GridCutTool />}
        {tab === "collage" && <CollageTool />}
        {tab === "stitch" && <StitchTool />}
        {tab === "qrcode" && <QrTool />}
        {tab === "exif" && <ExifTool />}
        {tab === "mosaic" && <MosaicTool />}
        {tab === "gif" && <GifTool />}
      </section>
    </div>
  );
}
