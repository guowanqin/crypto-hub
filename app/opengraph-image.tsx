import { ImageResponse } from "next/og";
import { TOOLS } from "@/lib/tools";
import { OG_COLORS, OG_SIZE, loadOgAssets } from "@/lib/og-assets";

// 首页全站默认 OG 分享图（SEO 审计 P0-1）：米白底 + 哑光金 + 吉祥物图 + 站名大字 + 收录规模。
// 与标签页 / 工具页 OG 图同一视觉体系；各分类与工具页有各自的专属图，不走这一张。

export const alt = "18btc 币圈工具导航 · 实测收录的币圈工具导航站";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const { fonts, mascotSrc } = await loadOgAssets();
  const { gold, goldDark, ink, muted, bg } = OG_COLORS;

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
              fontSize: 92,
              fontWeight: 700,
              color: ink,
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            18btc 币圈工具导航
          </div>
          <div
            style={{
              fontSize: 40,
              color: gold,
              fontWeight: 700,
              marginTop: 14,
              display: "flex",
            }}
          >
            18btc Crypto Tools Navigator
          </div>
          <div
            style={{
              fontSize: 34,
              color: muted,
              marginTop: 42,
              lineHeight: 1.45,
              display: "flex",
            }}
          >
            {`实测收录 ${TOOLS.length} 个工具 · 行情数据 / 链上分析 / DeFi / 钱包安全 / 办公效率`}
          </div>
          <div
            style={{
              fontSize: 28,
              color: goldDark,
              marginTop: 26,
              display: "flex",
            }}
          >
            站内可用工具打开即用 · 第三方工具附实测短评
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
