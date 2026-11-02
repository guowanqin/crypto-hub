import type { Metadata } from "next";
import RelatedTools from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/SeoJsonLd";
import NiumaClockClient from "@/components/NiumaClockClient";
import { getTool } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 专属工具页：/tool/niuma-clock 站内直接使用牛马时钟（实时时钟 + 倒计时 + 工资秒表，纯本地计算）。
const tool = getTool("niuma-clock")!;
const path = "/tool/niuma-clock";

const TITLE = `牛马时钟｜下班倒计时、发薪日倒计时、工资秒表｜${SITE_NAME.zh}`;
const DESCRIPTION =
  "在 18btc 站内直接使用的牛马时钟：大字实时时钟、按你的上下班时间计算的今日牛马进度，距离下班、周末、发工资与下一个法定节假日四个倒计时同屏；填上月薪还有工资秒表按秒跳钱，日薪按当月应出勤天数折算（扣除 2026 年法定假期、计入调休补班日）。设置只保存在本机浏览器，免费免注册。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "牛马时钟",
    "下班倒计时",
    "距离下班还有多久",
    "发薪日倒计时",
    "工资秒表",
    "打工人时钟",
    "距离周末还有多久",
    "假期倒计时",
    "法定节假日倒计时",
    "上班倒计时",
    "摸鱼时钟",
    "niuma clock",
    "off work countdown",
    "payday countdown",
    "salary stopwatch",
    "币圈工具导航",
    "18btc",
  ],
  ...(SITE_URL !== "" ? { alternates: { canonical: SITE_URL + path } } : {}),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    ...(SITE_URL !== "" ? { url: SITE_URL + path } : {}),
    siteName: SITE_NAME.zh,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: tool.oneLiner.zh,
  },
};

export default async function NiumaClockPage({
  searchParams,
}: {
  searchParams: Promise<{ ads?: string }>;
}) {
  const { ads } = await searchParams;
  return (
    <>
      <NiumaClockClient adsPreview={ads === "preview"} />
      <RelatedTools slug="niuma-clock" />
      <ToolJsonLd slug="niuma-clock" />
    </>
  );
}
