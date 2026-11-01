import HomeClient from "@/components/HomeClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return <HomeClient adsPreview={ads === "preview"} />;
}
