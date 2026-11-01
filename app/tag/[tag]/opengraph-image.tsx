import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TAGS, getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";

// 每个标签一张专属 OG 分享图：米白底 + 哑光金 + 吉祥物图 + 标签中英名大字 + 工具数量 + 站名。
// 分享 /tag/[tag] 到微信 / X 时，抓到的就是这一张独立卡片。

export const alt = "18btc 币圈工具导航 · 分类工具分享图";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TAGS.map((t) => ({ tag: t.id }));
}

type Props = { params: Promise<{ tag: string }> };

async function loadAssets() {
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

export default async function Image({ params }: Props) {
  const { tag: tagId } = await params;
  const tag = getTag(tagId) ?? TAGS[0];
  const count = toolsByTag(tag.id).length;
  const { fonts, mascotSrc } = await loadAssets();

  const GOLD = "#B8912B";
  const GOLD_DARK = "#8A6D1F";
  const INK = "#292524";
  const MUTED = "#78716C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#FAF6ED",
          fontFamily: "NotoSC",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* 金色边框 */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "3px solid #B8912B",
            borderRadius: 28,
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mascotSrc}
          width={330}
          height={330}
          alt=""
          style={{ borderRadius: 36, marginRight: 54 }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: GOLD_DARK,
                letterSpacing: 6,
                display: "flex",
              }}
            >
              18btc 币圈工具导航
            </div>
          </div>
          <div
            style={{
              fontSize: 118,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.15,
              marginTop: 34,
              display: "flex",
            }}
          >
            {tag.name.zh}
          </div>
          <div
            style={{
              fontSize: 42,
              color: GOLD,
              fontWeight: 700,
              marginTop: 10,
              display: "flex",
            }}
          >
            {tag.name.en}
          </div>
          <div
            style={{
              fontSize: 34,
              color: MUTED,
              marginTop: 40,
              display: "flex",
            }}
          >
            {`收录 ${count} 个工具 · 18btc 实测导航`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
