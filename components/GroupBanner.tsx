import { groupImageForTag, groupImageForToolSlug } from "@/lib/visuals";

/**
 * 大类主图横版横幅（视觉方案 L1 派生）：标签页 / 工具页页头统一挂所属大类主图，
 * CSS object-fit: cover 裁切、焦点由 lib/visuals.ts 逐图指定，零新增素材。
 * 纯装饰图：alt="" + aria-hidden，不承载任何文案（三语切换不受影响）。
 * 传 tagId 用于标签页，传 slug 用于工具页（二选一，tagId 优先）。
 */
export default function GroupBanner({
  tagId,
  slug,
  small = false,
}: {
  tagId?: string;
  slug?: string;
  small?: boolean;
}) {
  const img = tagId
    ? groupImageForTag(tagId)
    : slug
      ? groupImageForToolSlug(slug)
      : undefined;
  if (!img) return null;
  return (
    <div className={`group-banner${small ? " group-banner-sm" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        alt=""
        width={800}
        height={800}
        loading="lazy"
        style={{ objectPosition: `50% ${img.position}` }}
      />
    </div>
  );
}
