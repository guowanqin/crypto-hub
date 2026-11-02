import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TagClient from "@/components/TagClient";
import { TagJsonLd } from "@/components/SeoJsonLd";
import { TAGS, getTag } from "@/lib/tags";
import { toolsByTag } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return TAGS.map((t) => ({ tag: t.id }));
}

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ ads?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagId } = await params;
  const tag = getTag(tagId);
  if (!tag) return {};
  const title = `${tag.name.zh}工具｜${SITE_NAME.zh}`;
  const description = tag.seoDescription.zh;
  const path = `/tag/${tag.id}`;
  const count = toolsByTag(tag.id).length;
  return {
    title,
    description,
    keywords: [...tag.keywords, "币圈工具导航", "18btc"],
    ...(SITE_URL !== ""
      ? { alternates: { canonical: SITE_URL + path } }
      : {}),
    openGraph: {
      type: "website",
      locale: "zh_CN",
      alternateLocale: ["en_US"],
      ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
      siteName: SITE_NAME.zh,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: { "tools:count": String(count) },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag: tagId } = await params;
  const { ads } = await searchParams;
  const tag = getTag(tagId);
  if (!tag) notFound();
  return (
    <>
      <TagClient tag={tag} adsPreview={ads === "preview"} />
      <TagJsonLd tagId={tag.id} />
    </>
  );
}
