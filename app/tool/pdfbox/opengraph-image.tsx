import ToolImage from "../[slug]/opengraph-image";

// /tool/pdfbox 是静态专属路由，不走 [slug] 段；OG 图沿用全站工具分享图的同一
// 生成逻辑（米白底 + 哑光金 + 吉祥物 + 工具名 + 一句话定位），固定以 pdfbox 渲染。
export const alt = "18btc 币圈工具导航 · 工具分享图";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ToolImage({ params: Promise.resolve({ slug: "pdfbox" }) });
}
