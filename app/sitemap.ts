import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TAGS } from "@/lib/tags";
import { TOOLS } from "@/lib/tools";

// 收录：首页 + 全部 /tag/* + 全部 /tool/*。
// SITE_URL 留空期间 url 为站内路径（仅本地核对用）；域名定了填入 SITE_URL 即自动变绝对地址。
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", lastModified: now },
  ];
  for (const tag of TAGS) {
    entries.push({ url: `${SITE_URL}/tag/${tag.id}`, lastModified: now });
  }
  for (const tool of TOOLS) {
    entries.push({ url: `${SITE_URL}/tool/${tool.slug}`, lastModified: now });
  }
  return entries;
}
