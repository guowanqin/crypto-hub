import TagImage from "../[tag]/opengraph-image";

// /tag/poetry 是静态专属路由，不走 [tag] 段；OG 图沿用全站标签分享图的同一
// 生成逻辑（米白底 + 哑光金 + 吉祥物 + 标签名「古籍诗词」），固定以 poetry 渲染。
export const alt = "18btc 币圈工具导航 · 分类工具分享图";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return TagImage({ params: Promise.resolve({ tag: "poetry" }) });
}
