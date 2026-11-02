// 标签 → emoji 图标映射：工具卡片左侧的图标块按工具的第一个标签取图标。
// 覆盖 lib/tags.ts 的全部标签 id；查不到时用 DEFAULT_TAG_ICON 兜底。

export const TAG_ICONS: Record<string, string> = {
  market: "📈",
  onchain: "⛓️",
  defi: "🏦",
  wallet: "👛",
  security: "🛡️",
  burn: "🔥",
  "btc-bottom": "🎯",
  crcl: "⭕",
  qqqi: "💰",
  qqq: "📊",
  flows: "🌊",
  "chain-dau": "👥",
  filetime: "🕐",
  pdf: "📕",
  ocr: "🔤",
  video: "🎬",
  slang: "🗣️",
  office: "🗂️",
  "ip-check": "🌐",
  poetry: "📜",
  "twitter-tools": "🐦",
};

export const DEFAULT_TAG_ICON = "🧰";

export function tagIcon(tagId: string | undefined): string {
  return (tagId && TAG_ICONS[tagId]) || DEFAULT_TAG_ICON;
}

// 卡片图标块底色：与米白主题（#FAF6ED / #FFFDF8 / 哑金）协调的柔和色板，
// 按 slug 哈希稳定取色——同一个工具每次渲染颜色一致。
const ICON_BG_PALETTE = [
  "#f6e7bd", // 哑金浅
  "#e9f0d8", // 嫩绿
  "#fbe7d2", // 浅杏
  "#dff0e9", // 薄荷
  "#e7e3f5", // 浅紫
  "#fbe0dd", // 浅粉
  "#e2ecf7", // 浅蓝
  "#f3ecd9", // 米黄
  "#e8f3e0", // 青柠浅
  "#f7e3ef", // 藕粉
];

export function iconBgForSlug(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return ICON_BG_PALETTE[h % ICON_BG_PALETTE.length];
}
