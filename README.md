# 18btc 币圈工具导航（18btc Crypto Tools Navigator）

金币吉祥物领衔的「18btc 币圈工具导航」站：按分类收录自研工具与实测过的第三方工具，
每个工具一个独立介绍页，每个分类一个可独立分享的标签落地页（各自带专属 OG 分享图）。

## 结构

- `/` 首页：吉祥物 hero + 搜索 + 按 6 个分类分区陈列工具卡片
- `/tag/[tag]` 标签落地页：独立 title / description / keywords / OG，
  分享图由 `app/tag/[tag]/opengraph-image.tsx` 用 next/og 按标签动态生成
- `/tool/[slug]` 工具介绍页：一句话定位、详细介绍、适合谁、「实测短评」；
  访问按钮经 `/go/[slug]` 跳转
- `/tool/sheet2word` 自研工具 Sheet2Word 专属页：**内嵌可直接使用的 Excel 批量生成 Word 工具本体**
  （逻辑移植自 excel-to-word 独立站：lib/engine.ts、lib/samples.ts、components/Sheet2WordTool.tsx）
- `/go/[slug]` 302 跳转：第三方与自研官网直达，sheet2word 跳站内可用页（点击计数暂未做）

## 数据

工具注册表集中在 `lib/tools.ts`，标签定义在 `lib/tags.ts`：
新增工具只改注册表，首页分区、标签页、介绍页、sitemap、/go 跳转自动跟随。

## 广告位

全站预埋 5 个广告位，统一在 `lib/ads.ts` 配置调度（组件为 `components/AdSlot.tsx`）：
`home_top`（首页顶部）、`home_mid`（首页第 3 个分类后）、`tag_top`（标签页顶部）、
`tool_bottom`（工具页底部）、`footer_top`（页脚上方）。
投放时只需给对应广告位的 `ad` 字段填内容（图片+链接 `{ image, href, alt, label? }`
或第三方代码 `{ html }`），不用改任何组件；`ad` 为 null 时页面上完全不渲染、不占位。
任意页面 URL 加 `?ads=preview` 可预览全部广告位的分布（虚线占位框）。

## 域名

正式域名：`https://18btc.cc`（`lib/site.ts` 的 `SITE_URL` 已填入）。
各页 canonical / og:url 与 sitemap 的绝对地址自动生效。

## 开发

```bash
npm run dev    # 本地开发
npm run build  # 生产构建
npm run start  # 生产服务
```

## 资产

- 吉祥物原图：`public/mascot-avatar.webp`（主形象）、`public/mascot-pose.webp`（动态版），源文件在 ~/workspace/crypto-hub-launch/
- OG 图专用：`assets/mascot-og.png`（吉祥物小图）、`assets/fonts/noto-sc-{bold,regular}.ttf`
  （Noto Sans CJK SC 子集字体，仅含分享图用到的汉字，供 next/og 渲染中文）
