"use client";

import { getAdSlot, isHtmlAd, type AdSlotId } from "@/lib/ads";
import { useLang } from "./LangProvider";

/**
 * 广告位组件：按 slot id 从 lib/ads.ts 读取配置渲染。
 * - 未投放（ad 为 null）且非预览模式：什么都不渲染，不占位、不留空白框。
 * - 预览模式（preview=true，由页面在 URL 带 ?ads=preview 时传入）：
 *   未投放的广告位渲染为虚线占位框，标注 id、位置说明与建议尺寸。
 * - 已投放：图片广告 / 第三方 HTML 代码两种形态，左上角带小号「广告」标识。
 */
export default function AdSlot({
  id,
  preview = false,
}: {
  id: AdSlotId;
  preview?: boolean;
}) {
  const { lang } = useLang();
  const slot = getAdSlot(id);
  const { ad } = slot;

  if (!ad) {
    if (!preview) return null;
    return (
      <div className="ad-slot" data-ad-slot={slot.id} aria-hidden="true">
        <div className="ad-banner ad-placeholder">
          <span>
            {slot.id} · {slot.placement[lang]} ·{" "}
            {lang === "zh"
              ? `建议 ${slot.desktopSize} / 移动端 ${slot.mobileSize}`
              : lang === "tw"
                ? `建議 ${slot.desktopSize} / 行動端 ${slot.mobileSize}`
                : `Recommended ${slot.desktopSize} / mobile ${slot.mobileSize}`}
          </span>
        </div>
      </div>
    );
  }

  const badge = !isHtmlAd(ad) && ad.label ? ad.label : lang === "zh" ? "广告" : lang === "tw" ? "廣告" : "Ad";

  return (
    <div className="ad-slot" data-ad-slot={slot.id}>
      <span className="ad-label">{badge}</span>
      {isHtmlAd(ad) ? (
        <div className="ad-html" dangerouslySetInnerHTML={{ __html: ad.html }} />
      ) : (
        <a
          className="ad-banner ad-link"
          href={ad.href}
          target="_blank"
          rel="sponsored noopener"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.image} alt={ad.alt} loading="lazy" />
        </a>
      )}
    </div>
  );
}
