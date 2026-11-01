# 币圈工具导航（Crypto Tools Navigator）

品牌 IP「金币君」领衔的币圈工具导航站：按分类收录自研工具与实测过的第三方工具，
每个工具一个独立介绍页，每个分类一个可独立分享的标签落地页（各自带专属 OG 分享图）。

## 结构

- `/` 首页：金币君 hero + 搜索 + 按 6 个分类分区陈列工具卡片
- `/tag/[tag]` 标签落地页：独立 title / description / keywords / OG，
  分享图由 `app/tag/[tag]/opengraph-image.tsx` 用 next/og 按标签动态生成
- `/tool/[slug]` 工具介绍页：一句话定位、详细介绍、适合谁、「金币君说」短评；
  访问按钮经 `/go/[slug]` 跳转
- `/tool/sheet2word` 自研工具 Sheet2Word 专属页：**内嵌可直接使用的 Excel 批量生成 Word 工具本体**
  （逻辑移植自 excel-to-word 独立站：lib/engine.ts、lib/samples.ts、components/Sheet2WordTool.tsx）
- `/go/[slug]` 302 跳转：第三方与自研官网直达，sheet2word 跳站内可用页（点击计数暂未做）

## 数据

工具注册表集中在 `lib/tools.ts`，标签定义在 `lib/tags.ts`：
新增工具只改注册表，首页分区、标签页、介绍页、sitemap、/go 跳转自动跟随。

## 域名（待定）

`lib/site.ts` 的 `SITE_URL` 暂留空：填入正式域名后，各页 canonical / og:url 与
sitemap 的绝对地址自动生效（留空时不输出 canonical；sitemap 为站内路径，仅供本地核对）。

## 开发

```bash
npm run dev    # 本地开发
npm run build  # 生产构建
npm run start  # 生产服务
```

## 资产

- 吉祥物原图：`public/jinbijun-avatar.webp`（主形象）、`public/jinbijun-pose.webp`（动态版），源文件在 ~/workspace/crypto-hub-launch/
- OG 图专用：`assets/jinbijun-og.png`（金币君小图）、`assets/fonts/noto-sc-{bold,regular}.ttf`
  （Noto Sans CJK SC 子集字体，仅含分享图用到的汉字，供 next/og 渲染中文）
