import HomeClient from "@/components/HomeClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string; q?: string }>;
}) {
  const { ads, q } = await searchParams;
  // ?q= 是结构化数据 WebSite SearchAction 的目标（SEO 审计 P1-2），带词进来直接呈现搜索结果
  return <HomeClient adsPreview={ads === "preview"} initialQuery={q ?? ""} />;
}
