// 推文导出：全部在浏览器本地由解析结果生成，不经服务器。
// TXT/Markdown/HTML/JSON/CSV 为纯文本拼装；EPUB 用 JSZip 组装标准
// EPUB 3 结构；PDF 走「排版好的文章页 + 浏览器打印另存」路径——
// 新开一个只含文章本体的打印页并自动调起打印，用户在打印对话框里
// 选「另存为 PDF」即得文件（无头验证时对该页直接出 PDF 核对内容）。

import JSZip from "jszip";
import type { TweetData, TweetMedia } from "./tweet";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { hour12: false });
}

function statsLine(t: TweetData): string {
  const s = t.stats;
  const parts: string[] = [];
  if (s.likes !== undefined) parts.push(`赞 ${s.likes}`);
  if (s.retweets !== undefined) parts.push(`转推 ${s.retweets}`);
  if (s.replies !== undefined) parts.push(`回复 ${s.replies}`);
  if (s.views !== undefined) parts.push(`浏览 ${s.views}`);
  if (s.bookmarks !== undefined) parts.push(`收藏 ${s.bookmarks}`);
  if (s.quotes !== undefined) parts.push(`引用 ${s.quotes}`);
  return parts.join(" · ");
}

function mediaLines(m: TweetMedia): string[] {
  if (m.kind === "photo") return [`[图片 ${m.width ?? "?"}×${m.height ?? "?"}] ${m.url}`];
  const head = m.kind === "gif" ? "GIF" : "视频";
  const lines = m.variants.map(
    (v) =>
      `[${head} ${v.width ?? "?"}×${v.height ?? "?"}${v.bitrate ? ` · ${(v.bitrate / 1_000_000).toFixed(2)} Mbps` : ""}] ${v.url}`,
  );
  if (m.playlistUrl) lines.push(`[${head} HLS 播放列表] ${m.playlistUrl}`);
  return lines;
}

function mediaUrls(m: TweetMedia): string[] {
  if (m.kind === "photo") return [m.url];
  const urls = m.variants.map((v) => v.url);
  if (m.playlistUrl) urls.push(m.playlistUrl);
  return urls;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escXml(s: string): string {
  return esc(s).replace(/'/g, "&apos;");
}

function tweetsOf(tweet: TweetData, thread: TweetData[] | null): TweetData[] {
  return thread && thread.length >= 2 ? thread : [tweet];
}

// ---------- TXT ----------

export function buildTxt(tweet: TweetData, thread: TweetData[] | null): string {
  const list = tweetsOf(tweet, thread);
  const out: string[] = [];
  if (list.length >= 2) {
    out.push(
      `Thread 共 ${list.length} 条（自同作者回复链组装，以数据源返回为准）`,
      `${list[0].author.name}（@${list[0].author.screenName}）`,
      "",
    );
  }
  list.forEach((t, i) => {
    if (list.length >= 2) out.push(`—— 第 ${i + 1} 条 ——`);
    out.push(
      `${t.author.name}（@${t.author.screenName}）`,
      `时间：${fmtTime(t.createdAt)}`,
      `原推：${t.url}`,
    );
    const sl = statsLine(t);
    if (sl) out.push(`互动：${sl}`);
    out.push("", t.text);
    for (const m of t.media) out.push(...mediaLines(m));
    if (t.quoted) {
      out.push(
        "",
        `引用推文：${t.quoted.author.name}（@${t.quoted.author.screenName}）`,
        t.quoted.text,
        t.quoted.url,
      );
    }
    out.push("", "");
  });
  return out.join("\n").trim() + "\n";
}

// ---------- Markdown ----------

export function buildMarkdown(
  tweet: TweetData,
  thread: TweetData[] | null,
): string {
  const list = tweetsOf(tweet, thread);
  const out: string[] = [];
  const head = list[0];
  out.push(
    list.length >= 2
      ? `# Thread · ${head.author.name}（@${head.author.screenName}）`
      : `# ${head.author.name}（@${head.author.screenName}）的推文`,
    "",
  );
  if (list.length >= 2)
    out.push(
      `> 共 ${list.length} 条，自同作者回复链组装，以数据源返回为准。`,
      "",
    );
  list.forEach((t, i) => {
    if (list.length >= 2) out.push(`## 第 ${i + 1} 条`, "");
    out.push(
      `**${t.author.name}**（[@${t.author.screenName}](${t.url})） · ${fmtTime(t.createdAt)}`,
      "",
    );
    const sl = statsLine(t);
    if (sl) out.push(`互动：${sl}`, "");
    out.push(t.text, "");
    for (const m of t.media) {
      if (m.kind === "photo") {
        out.push(`![](${m.url})`, "");
      } else {
        for (const line of mediaLines(m)) out.push(`- ${line}`);
        out.push("");
      }
    }
    if (t.quoted) {
      out.push(
        `> 引用推文：${t.quoted.author.name}（@${t.quoted.author.screenName}）`,
        `> ${t.quoted.text.replace(/\n/g, "\n> ")}`,
        `> ${t.quoted.url}`,
        "",
      );
    }
  });
  return out.join("\n").trim() + "\n";
}

// ---------- HTML（下载版文章页，与打印版共用本体） ----------

function articleBody(tweet: TweetData, thread: TweetData[] | null): string {
  const list = tweetsOf(tweet, thread);
  const parts: string[] = [];
  if (list.length >= 2) {
    parts.push(
      `<p class="meta">Thread 共 ${list.length} 条 · 自同作者回复链组装，以数据源返回为准</p>`,
    );
  }
  list.forEach((t, i) => {
    parts.push(`<article>`);
    if (list.length >= 2) parts.push(`<h2>第 ${i + 1} 条</h2>`);
    parts.push(
      `<p class="byline"><strong>${esc(t.author.name)}</strong>（<a href="${esc(t.url)}">@${esc(t.author.screenName)}</a>） · ${esc(fmtTime(t.createdAt))}</p>`,
    );
    const sl = statsLine(t);
    if (sl) parts.push(`<p class="meta">${esc(sl)}</p>`);
    parts.push(
      `<p class="text">${esc(t.text).replace(/\n/g, "<br/>")}</p>`,
    );
    for (const m of t.media) {
      if (m.kind === "photo") {
        parts.push(
          `<figure><img src="${esc(m.url)}" alt=""/><figcaption><a href="${esc(m.url)}">原图 ${m.width ?? "?"}×${m.height ?? "?"}</a></figcaption></figure>`,
        );
      } else {
        if (m.poster)
          parts.push(`<figure><img src="${esc(m.poster)}" alt=""/></figure>`);
        parts.push(`<ul>`);
        for (const line of mediaLines(m)) parts.push(`<li>${esc(line)}</li>`);
        parts.push(`</ul>`);
      }
    }
    if (t.quoted) {
      parts.push(
        `<blockquote><p>引用推文：${esc(t.quoted.author.name)}（@${esc(t.quoted.author.screenName)}）</p><p>${esc(t.quoted.text).replace(/\n/g, "<br/>")}</p><p><a href="${esc(t.quoted.url)}">${esc(t.quoted.url)}</a></p></blockquote>`,
      );
    }
    parts.push(`</article>`);
  });
  return parts.join("\n");
}

const ARTICLE_CSS = `
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #292524; max-width: 720px; margin: 24px auto; padding: 0 16px; line-height: 1.7; }
  h1 { font-size: 22px; } h2 { font-size: 17px; margin-top: 28px; }
  .byline { color: #57534e; font-size: 14px; }
  .meta { color: #78716c; font-size: 13px; }
  .text { font-size: 16px; white-space: normal; }
  figure { margin: 12px 0; } img { max-width: 100%; border-radius: 8px; }
  figcaption { font-size: 12px; color: #78716c; }
  blockquote { border-left: 3px solid #b8912b; margin: 12px 0; padding: 4px 12px; background: #f7f1e2; }
  a { color: #8a6d1f; }
  .print-hint { background: #f3eddc; border: 1px solid #e6dbc2; border-radius: 10px; padding: 10px 14px; font-size: 14px; }
  @media print { .print-hint { display: none; } body { margin: 0 auto; } }
`;

export function buildHtml(tweet: TweetData, thread: TweetData[] | null): string {
  const title = `${tweet.author.name}（@${tweet.author.screenName}）的推文`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>${ARTICLE_CSS}</style>
</head>
<body>
<h1>${esc(title)}</h1>
${articleBody(tweet, thread)}
</body>
</html>
`;
}

/** PDF 路径：返回可直接写入新窗口的打印页（自动调起打印另存 PDF）。 */
export function buildPrintHtml(
  tweet: TweetData,
  thread: TweetData[] | null,
): string {
  const title = `${tweet.author.name}（@${tweet.author.screenName}）的推文`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>${ARTICLE_CSS}</style>
</head>
<body>
<p class="print-hint">打印已调起：在对话框里选「另存为 PDF」即可保存；若未自动弹出，请按 Ctrl/Cmd + P。</p>
<h1>${esc(title)}</h1>
${articleBody(tweet, thread)}
<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},350);});</script>
</body>
</html>
`;
}

// ---------- JSON / CSV ----------

export function buildJson(tweet: TweetData, thread: TweetData[] | null): string {
  const list = tweetsOf(tweet, thread);
  return (
    JSON.stringify(
      list.length >= 2 ? { thread: list, count: list.length } : list[0],
      null,
      2,
    ) + "\n"
  );
}

function csvCell(v: string | number | undefined): string {
  const s = v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildCsv(tweet: TweetData, thread: TweetData[] | null): string {
  const list = tweetsOf(tweet, thread);
  const head = [
    "index",
    "id",
    "author",
    "screen_name",
    "created_at",
    "text",
    "likes",
    "retweets",
    "replies",
    "views",
    "media_urls",
    "url",
  ].join(",");
  const rows = list.map((t, i) =>
    [
      csvCell(i + 1),
      csvCell(t.id),
      csvCell(t.author.name),
      csvCell(t.author.screenName),
      csvCell(t.createdAt),
      csvCell(t.text),
      csvCell(t.stats.likes),
      csvCell(t.stats.retweets),
      csvCell(t.stats.replies),
      csvCell(t.stats.views),
      csvCell(t.media.flatMap(mediaUrls).join(" ")),
      csvCell(t.url),
    ].join(","),
  );
  return [head, ...rows].join("\r\n") + "\r\n";
}

// ---------- EPUB（Thread 或单条） ----------

export async function buildEpub(
  tweet: TweetData,
  thread: TweetData[] | null,
): Promise<Blob> {
  const list = tweetsOf(tweet, thread);
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.folder("META-INF")?.file(
    "container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`,
  );
  const oebps = zip.folder("OEBPS")!;
  const bookTitle =
    list.length >= 2
      ? `Thread · ${list[0].author.name}（@${list[0].author.screenName}）`
      : `${list[0].author.name}（@${list[0].author.screenName}）的推文`;
  const uid = `tweet-${list[list.length - 1].id}`;

  const manifestItems: string[] = [];
  const spineItems: string[] = [];
  list.forEach((t, i) => {
    const fileName = `chapter-${i + 1}.xhtml`;
    const idAttr = `ch${i + 1}`;
    manifestItems.push(
      `<item id="${idAttr}" href="${fileName}" media-type="application/xhtml+xml"/>`,
    );
    spineItems.push(`<itemref idref="${idAttr}"/>`);
    const mediaHtml = t.media
      .map((m) => {
        if (m.kind === "photo")
          return `<figure><img src="${escXml(m.url)}" alt=""/><figcaption><a href="${escXml(m.url)}">原图 ${m.width ?? "?"}×${m.height ?? "?"}</a></figcaption></figure>`;
        const links = mediaLines(m)
          .map((line) => `<li>${escXml(line)}</li>`)
          .join("");
        return `${m.poster ? `<figure><img src="${escXml(m.poster)}" alt=""/></figure>` : ""}<ul>${links}</ul>`;
      })
      .join("\n");
    const sl = statsLine(t);
    oebps.file(
      fileName,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
<head><title>第 ${i + 1} 条</title></head>
<body>
${list.length >= 2 ? `<h1>第 ${i + 1} 条</h1>` : ""}
<p><strong>${escXml(t.author.name)}</strong>（@${escXml(t.author.screenName)}） · ${escXml(fmtTime(t.createdAt))}</p>
${sl ? `<p>${escXml(sl)}</p>` : ""}
<p>${escXml(t.text).replace(/\n/g, "<br/>")}</p>
${mediaHtml}
<p><a href="${escXml(t.url)}">原推链接</a></p>
</body>
</html>
`,
    );
  });

  oebps.file(
    "nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
<head><title>目录</title></head>
<body>
<nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops">
<h1>目录</h1>
<ol>
${list.map((t, i) => `<li><a href="chapter-${i + 1}.xhtml">第 ${i + 1} 条 · ${escXml(fmtTime(t.createdAt))}</a></li>`).join("\n")}
</ol>
</nav>
</body>
</html>
`,
  );
  manifestItems.push(
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
  );

  oebps.file(
    "content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escXml(uid)}</dc:identifier>
    <dc:title>${escXml(bookTitle)}</dc:title>
    <dc:creator>${escXml(list[0].author.name)}</dc:creator>
    <dc:language>zh-CN</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
${manifestItems.join("\n")}
  </manifest>
  <spine>
${spineItems.join("\n")}
  </spine>
</package>
`,
  );

  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

// ---------- 下载小工具（组件共用） ----------

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 4000);
}

export function downloadText(
  text: string,
  filename: string,
  mime: string,
): void {
  downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

export function baseName(tweet: TweetData, thread: TweetData[] | null): string {
  return thread && thread.length >= 2
    ? `thread-${tweet.author.screenName}-${tweet.id}`
    : `tweet-${tweet.id}`;
}
