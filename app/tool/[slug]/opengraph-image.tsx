import { ImageResponse } from "next/og";
import { TOOLS, getTool } from "@/lib/tools";
import { OG_COLORS, OG_SIZE, loadOgAssets } from "@/lib/og-assets";

// 每个工具一张专属 OG 分享图（SEO 审计 P0-1）：米白底 + 哑光金 + 吉祥物图 + 工具中英名大字
// + 一句话定位 + 站名。与标签页 OG 图（app/tag/[tag]/opengraph-image）同一视觉体系。
// 有专属静态页的工具不在此生成静态参数，各自在 app/tool/<slug>/opengraph-image 包装一份
// （与 DEDICATED_PAGES 保持同步，清单与 app/tool/[slug]/page.tsx 一致）。

export const alt = "18btc 币圈工具导航 · 工具分享图";
export const size = OG_SIZE;
export const contentType = "image/png";

const DEDICATED_PAGES = new Set([
  "sheet2word",
  "pershare",
  "imagebox",
  "foldervault",
  "crcl-panel",
  "qqqi-panel",
  "qqq-panel",
  "flows-panel",
  "chain-dau-panel",
  "uni-burn",
  "btc-cycle",
  "filetime",
  "pdfbox",
  "ocr-tool",
  "slang-dict",
  "ip-check",
  "poetry",
  "tweetbox",
  "devtools",
  "niuma-clock",
]);

export function generateStaticParams() {
  return TOOLS.filter((t) => !DEDICATED_PAGES.has(t.slug)).map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug) ?? TOOLS[0];
  const { fonts, mascotSrc } = await loadOgAssets();
  const { gold, goldDark, ink, muted, bg } = OG_COLORS;
  const nameSize = tool.name.zh.length > 10 ? 76 : 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: bg,
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
              fontSize: 34,
              fontWeight: 700,
              color: goldDark,
              letterSpacing: 6,
              display: "flex",
            }}
          >
            18btc 币圈工具导航
          </div>
          <div
            style={{
              fontSize: nameSize,
              fontWeight: 700,
              color: ink,
              lineHeight: 1.15,
              marginTop: 30,
              display: "flex",
            }}
          >
            {tool.name.zh}
          </div>
          <div
            style={{
              fontSize: 40,
              color: gold,
              fontWeight: 700,
              marginTop: 10,
              display: "flex",
            }}
          >
            {tool.name.en}
          </div>
          <div
            style={{
              fontSize: 32,
              color: muted,
              marginTop: 36,
              lineHeight: 1.45,
              display: "flex",
            }}
          >
            {tool.oneLiner.zh}
          </div>
          <div
            style={{
              fontSize: 28,
              color: goldDark,
              marginTop: 26,
              display: "flex",
            }}
          >
            {tool.embedded ? "站内可用 · 打开即用" : "第三方工具 · 实测收录介绍"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
