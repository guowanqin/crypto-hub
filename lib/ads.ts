// ============================================================
// 广告位配置中心（统一调度）
// ============================================================
// 以后投放广告，只需要给下面某个广告位的 `ad` 字段填上内容即可上线，
// 不需要修改任何组件代码，也不需要改页面。
//
// 广告内容支持两种形态（二选一）：
// 1) 图片广告：{ image, href, alt, label? }
//    - image: 广告图地址（可用站内路径如 "/ads/xxx.png"，或外链图床）
//    - href:  点击跳转地址
//    - alt:   图片替代文字（无障碍/SEO）
//    - label: 可选，左上角小标识文案；不填时默认显示「广告 / Ad」
// 2) 第三方代码：{ html }
//    - html: 广告联盟/第三方给的嵌入代码（脚本或 HTML 片段），原样注入
//
// 把 `ad` 改回 null 即可下线该广告位，页面上不会留任何痕迹（不占位、无空白框）。
//
// 预览：在任意页面 URL 后加 ?ads=preview，可把所有未投放的广告位显示为
// 虚线占位框（标注广告位 id、位置与建议尺寸），方便检查全站广告位分布。
// ============================================================

import type { Lang } from "./site";

/** 图片广告：图片 + 跳转链接 */
export interface ImageAd {
  image: string;
  href: string;
  alt: string;
  /** 左上角小标识文案，不填默认「广告 / Ad」 */
  label?: string;
}

/** 第三方代码广告：原样注入的 HTML/脚本片段 */
export interface HtmlAd {
  html: string;
}

export type AdContent = ImageAd | HtmlAd;

export function isHtmlAd(ad: AdContent): ad is HtmlAd {
  return "html" in ad;
}

export type AdSlotId = "home_top" | "home_mid" | "tag_top" | "tool_bottom" | "footer_top";

export interface AdSlotDef {
  id: AdSlotId;
  /** 位置说明（占位框与维护文档用，中英） */
  placement: Record<Lang, string>;
  /** 建议尺寸：桌面端 */
  desktopSize: string;
  /** 建议尺寸：移动端 */
  mobileSize: string;
  /** 当前投放内容；null = 未投放（正式页面上完全不渲染） */
  ad: AdContent | null;
}

/** 横幅类广告位统一建议尺寸：桌面 1200×160 / 移动 750×200 */
const BANNER_SIZE = { desktopSize: "1200×160", mobileSize: "750×200" } as const;

export const AD_SLOTS: Record<AdSlotId, AdSlotDef> = {
  home_top: {
    id: "home_top",
    placement: { zh: "首页顶部横幅", en: "Homepage top banner" },
    ...BANNER_SIZE,
    ad: null,
  },
  home_mid: {
    id: "home_mid",
    placement: { zh: "首页中部横幅", en: "Homepage mid banner" },
    ...BANNER_SIZE,
    ad: null,
  },
  tag_top: {
    id: "tag_top",
    placement: { zh: "标签页顶部横幅", en: "Tag page top banner" },
    ...BANNER_SIZE,
    ad: null,
  },
  tool_bottom: {
    id: "tool_bottom",
    placement: { zh: "工具页底部横幅", en: "Tool page bottom banner" },
    ...BANNER_SIZE,
    ad: null,
  },
  footer_top: {
    id: "footer_top",
    placement: { zh: "页脚上方横幅", en: "Above-footer banner" },
    ...BANNER_SIZE,
    ad: null,
  },
};

export function getAdSlot(id: AdSlotId): AdSlotDef {
  return AD_SLOTS[id];
}
