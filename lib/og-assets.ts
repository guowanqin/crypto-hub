import { readFile } from "node:fs/promises";
import path from "node:path";

// OG 分享图的共享素材（字体 + 吉祥物）与配色：标签页 OG 图（app/tag/[tag]/opengraph-image）
// 是第一份实现；工具页与首页 OG 图（P0-1）复用同一套素材，保证全站分享图风格一致。

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  gold: "#B8912B",
  goldDark: "#8A6D1F",
  ink: "#292524",
  muted: "#78716C",
  bg: "#FAF6ED",
};

export async function loadOgAssets() {
  const [bold, regular, mascot] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/noto-sc-bold.ttf")),
    readFile(path.join(process.cwd(), "assets/fonts/noto-sc-regular.ttf")),
    readFile(path.join(process.cwd(), "assets/mascot-og.png")),
  ]);
  return {
    fonts: [
      { name: "NotoSC", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "NotoSC", data: regular, weight: 400 as const, style: "normal" as const },
    ],
    mascotSrc: `data:image/png;base64,${mascot.toString("base64")}`,
  };
}
