"use client";

import { useCallback, useState } from "react";
import type {
  TweetData,
  TweetErrorKind,
  TweetMedia,
  TweetPayload,
} from "@/lib/tweet";
import {
  baseName,
  buildCsv,
  buildEpub,
  buildHtml,
  buildJson,
  buildMarkdown,
  buildPrintHtml,
  buildTxt,
  downloadBlob,
  downloadText,
} from "@/lib/tweet-export";
import { LOCALE, type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

export const TWEET_DICT: Record<
  Lang,
  {
    boardKicker: string;
    boardSub: string;
    inputPlaceholder: string;
    parseBtn: string;
    parsing: string;
    errors: Record<TweetErrorKind, string>;
    sourceLine: string; // {src} {time}
    srcSynd: string;
    srcFx: string;
    statsLabels: {
      likes: string;
      retweets: string;
      replies: string;
      views: string;
      bookmarks: string;
      quotes: string;
    };
    quotedTitle: string;
    mediaTitle: string;
    photoOrig: string; // {w} {h}
    openOrig: string;
    download: string;
    copyLink: string;
    copied: string;
    videoLabel: string; // {kind}
    gifLabel: string;
    bitrate: string; // {mbps}
    resUnknown: string;
    playlist: string;
    directNote: string;
    exportTitle: string;
    exportSub: string;
    pdfBtn: string;
    pdfBlocked: string;
    threadTitle: string; // {n}
    threadNote: string;
    threadExport: string;
    boundaryTitle: string;
    boundaryParas: string[];
    toolsTitle: string;
  }
> = {
  zh: {
    boardKicker: "推特下载工具箱 · 站内可用",
    boardSub:
      "粘贴一条公开推文的链接（twitter.com / x.com）或推文 ID，解析正文与全部媒体：图片给原图，视频逐档列出分辨率与码率的 MP4 直链，还能把推文或整串 Thread 导出成文件。",
    inputPlaceholder: "粘贴推文链接，如 https://x.com/NASA/status/… 或纯推文 ID",
    parseBtn: "解析推文",
    parsing: "正在解析…",
    errors: {
      badformat:
        "没认出这是推文链接：请粘贴 twitter.com / x.com 的单条推文链接（形如 …/status/数字），或直接粘贴推文 ID。",
      notfound:
        "这条推文不存在或已被删除：两个公开数据源都查不到它，请核对链接后再试。",
      private:
        "这条推文不可公开访问（私密账号或受限内容）：本工具只能处理公开推文。",
      sourcefail:
        "数据源暂时都连不上（推特嵌入接口与 FxTwitter 均失败），请稍等片刻再试。",
    },
    sourceLine: "数据由{src}返回 · 取数 {time}",
    srcSynd: "推特公开嵌入接口",
    srcFx: "FxTwitter 公开接口",
    statsLabels: {
      likes: "赞",
      retweets: "转推",
      replies: "回复",
      views: "浏览",
      bookmarks: "收藏",
      quotes: "引用",
    },
    quotedTitle: "引用推文",
    mediaTitle: "媒体下载",
    photoOrig: "原图 {w}×{h}",
    openOrig: "打开原图",
    download: "下载",
    copyLink: "复制直链",
    copied: "已复制",
    videoLabel: "视频",
    gifLabel: "GIF（MP4）",
    bitrate: "{mbps} Mbps",
    resUnknown: "分辨率未知",
    playlist: "HLS 播放列表（m3u8）",
    directNote:
      "下载走推特 CDN 直链，本站服务器不中转文件；个别浏览器点下载会先开始播放，长按或右键链接选「另存为」即可保存。",
    exportTitle: "导出这条推文",
    exportSub: "在本页本地生成文件，不经服务器。",
    pdfBtn: "PDF（打印另存）",
    pdfBlocked:
      "浏览器拦下了打印页弹窗，请允许弹窗后重试；也可以先导出 HTML 再自行打印为 PDF。",
    threadTitle: "Thread · 共 {n} 条",
    threadNote:
      "整串由数据源返回的同作者回复链组装，条数与完整性以数据源返回为准——它包含截至你粘贴这条为止的同作者串，其后的新条目不在内。",
    threadExport: "导出整串 Thread",
    boundaryTitle: "使用边界（先说清）",
    boundaryParas: [
      "仅限公开推文：私密账号、受限或已删除的内容，任何公开数据源都拿不到，本工具也不例外。",
      "请只下载你有权使用的内容：图片与视频的版权归原作者，下载保存不等于获得转载或商用授权。",
      "数据来自推特公开嵌入接口与 FxTwitter 公开接口（免登录），互动数等字段以源实际返回为准，源里没有的就不显示；Thread 为回复链组装结果，不承诺与官方 Thread 视图完全一致。",
    ],
    toolsTitle: "推特工具 · 本类工具",
  },
  en: {
    boardKicker: "Tweet Toolbox · Built-in",
    boardSub:
      "Paste a public tweet link (twitter.com / x.com) or a tweet ID to parse its text and all media: original-size photos, per-quality MP4 direct links for videos, and one-click exports of the tweet or a whole thread.",
    inputPlaceholder: "Paste a tweet link, e.g. https://x.com/NASA/status/… or a bare tweet ID",
    parseBtn: "Parse tweet",
    parsing: "Parsing…",
    errors: {
      badformat:
        "That doesn't look like a tweet link: paste a twitter.com / x.com post link (…/status/<digits>) or a bare tweet ID.",
      notfound:
        "This tweet doesn't exist or was deleted: neither public source can find it. Check the link and try again.",
      private:
        "This tweet isn't publicly accessible (protected account or restricted content): this tool only handles public tweets.",
      sourcefail:
        "Both data sources are unreachable right now (Twitter's embed endpoint and FxTwitter). Please try again shortly.",
    },
    sourceLine: "Data via {src} · fetched {time}",
    srcSynd: "Twitter's public embed endpoint",
    srcFx: "the FxTwitter public API",
    statsLabels: {
      likes: "Likes",
      retweets: "Reposts",
      replies: "Replies",
      views: "Views",
      bookmarks: "Bookmarks",
      quotes: "Quotes",
    },
    quotedTitle: "Quoted tweet",
    mediaTitle: "Media downloads",
    photoOrig: "Original {w}×{h}",
    openOrig: "Open original",
    download: "Download",
    copyLink: "Copy link",
    copied: "Copied",
    videoLabel: "Video",
    gifLabel: "GIF (MP4)",
    bitrate: "{mbps} Mbps",
    resUnknown: "Resolution unknown",
    playlist: "HLS playlist (m3u8)",
    directNote:
      "Downloads are direct links to Twitter's CDN — this site never relays the files. Some browsers start playing instead of downloading; long-press or right-click the link and choose “Save as”.",
    exportTitle: "Export this tweet",
    exportSub: "Files are generated locally on this page, never on a server.",
    pdfBtn: "PDF (print to save)",
    pdfBlocked:
      "The browser blocked the print-page popup. Allow popups and retry, or export the HTML and print it to PDF yourself.",
    threadTitle: "Thread · {n} posts",
    threadNote:
      "Assembled from the same-author reply chain the data source returns; count and completeness follow the source. It covers the author's chain up to the post you pasted — later additions are not included.",
    threadExport: "Export the whole thread",
    boundaryTitle: "Boundaries (up front)",
    boundaryParas: [
      "Public tweets only: protected accounts, restricted or deleted posts are unreachable through any public source, this tool included.",
      "Only download content you have the right to use: photos and videos remain the original authors' copyright; saving a file is not a licence to repost or use it commercially.",
      "Data comes from Twitter's public embed endpoint and the FxTwitter public API (no login). Fields such as engagement counts follow what the source actually returns — anything absent is simply not shown. Threads are reply-chain assemblies and may differ from the official thread view.",
    ],
    toolsTitle: "Twitter Tools · Tools in this shelf",
  },
  tw: {
    boardKicker: "推特下載工具箱 · 站內可用",
    boardSub: "貼上一條公開推文的連結（twitter.com / x.com）或推文 ID，解析正文與全部媒體：圖片給原圖，影片逐檔列出解析度與位元速率的 MP4 直鏈，還能把推文或整串 Thread 匯出成檔案。",
    inputPlaceholder: "貼上推文連結，如 https://x.com/NASA/status/… 或純推文 ID",
    parseBtn: "解析推文",
    parsing: "正在解析…",
    errors: {
      badformat: "沒認出這是推文連結：請貼上 twitter.com / x.com 的單條推文連結（形如 …/status/數字），或直接貼上推文 ID。",
      notfound: "這條推文不存在或已被刪除：兩個公開資料來源都查不到它，請核對連結後再試。",
      private: "這條推文不可公開訪問（私密賬號或受限內容）：本工具只能處理公開推文。",
      sourcefail: "資料來源暫時都連不上（推特嵌入介面與 FxTwitter 均失敗），請稍等片刻再試。",
    },
    sourceLine: "資料由{src}返回 · 取數 {time}",
    srcSynd: "推特公開嵌入介面",
    srcFx: "FxTwitter 公開介面",
    statsLabels: {
      likes: "贊",
      retweets: "轉推",
      replies: "回覆",
      views: "瀏覽",
      bookmarks: "收藏",
      quotes: "引用",
    },
    quotedTitle: "引用推文",
    mediaTitle: "媒體下載",
    photoOrig: "原圖 {w}×{h}",
    openOrig: "開啟原圖",
    download: "下載",
    copyLink: "複製直鏈",
    copied: "已複製",
    videoLabel: "影片",
    gifLabel: "GIF（MP4）",
    bitrate: "{mbps} Mbps",
    resUnknown: "解析度未知",
    playlist: "HLS 播放列表（m3u8）",
    directNote: "下載走推特 CDN 直鏈，本站伺服器不中轉檔案；個別瀏覽器點下載會先開始播放，長按或右鍵連結選「另存為」即可儲存。",
    exportTitle: "匯出這條推文",
    exportSub: "在本頁本地生成檔案，不經伺服器。",
    pdfBtn: "PDF（列印另存）",
    pdfBlocked: "瀏覽器攔下了列印頁彈窗，請允許彈窗後重試；也可以先匯出 HTML 再自行列印為 PDF。",
    threadTitle: "Thread · 共 {n} 條",
    threadNote: "整串由資料來源返回的同作者回復鏈組裝，條數與完整性以資料來源返回為準——它包含截至你貼上這條為止的同作者串，其後的新條目不在內。",
    threadExport: "匯出整串 Thread",
    boundaryTitle: "使用邊界（先說清）",
    boundaryParas: [
      "僅限公開推文：私密賬號、受限或已刪除的內容，任何公開資料來源都拿不到，本工具也不例外。",
      "請只下載你有權使用的內容：圖片與影片的版權歸原作者，下載儲存不等於獲得轉載或商用授權。",
      "資料來自推特公開嵌入介面與 FxTwitter 公開介面（免登入），互動數等欄位以源實際返回為準，源裡沒有的就不顯示；Thread 為回覆鏈組裝結果，不承諾與官方 Thread 檢視完全一致。",
    ],
    toolsTitle: "推特工具 · 本類工具",
  },
};

type Dict = (typeof TWEET_DICT)[Lang];

function fmtTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(LOCALE[lang], { hour12: false });
}

function CopyBtn({ url, d }: { url: string; d: Dict }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn tw-copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* 剪贴板不可用时静默：直链本身就在按钮旁可见 */
        }
      }}
    >
      {done ? d.copied : d.copyLink}
    </button>
  );
}

function MediaBlock({ m, d }: { m: TweetMedia; d: Dict }) {
  if (m.kind === "photo") {
    const preview = m.url.replace("name=orig", "name=medium");
    return (
      <div className="tw-media-item">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tw-media-img" src={preview} alt="" loading="lazy" />
        <div className="tw-media-actions">
          <span className="tw-media-meta">
            {d.photoOrig
              .replace("{w}", String(m.width ?? "?"))
              .replace("{h}", String(m.height ?? "?"))}
          </span>
          <a className="btn" href={m.url} target="_blank" rel="noreferrer">
            {d.openOrig}
          </a>
          <a className="btn" href={m.url} download target="_blank" rel="noreferrer">
            {d.download}
          </a>
          <CopyBtn url={m.url} d={d} />
        </div>
      </div>
    );
  }
  const label = m.kind === "gif" ? d.gifLabel : d.videoLabel;
  return (
    <div className="tw-media-item">
      {m.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tw-media-img" src={m.poster} alt="" loading="lazy" />
      )}
      <p className="tw-media-meta">
        {label}
        {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
        {m.durationMs
          ? ` · ${(m.durationMs / 1000).toFixed(1)}s`
          : ""}
      </p>
      <div className="tw-variant-list">
        {m.variants.map((v, i) => (
          <div className="tw-variant-row" key={i}>
            <span className="tw-variant-spec">
              {v.width && v.height ? `${v.width}×${v.height}` : d.resUnknown}
              {v.bitrate
                ? ` · ${d.bitrate.replace("{mbps}", (v.bitrate / 1_000_000).toFixed(2))}`
                : ""}
            </span>
            <span className="tw-variant-btns">
              <a className="btn" href={v.url} download target="_blank" rel="noreferrer">
                {d.download} MP4
              </a>
              <CopyBtn url={v.url} d={d} />
            </span>
          </div>
        ))}
        {m.playlistUrl && (
          <div className="tw-variant-row">
            <span className="tw-variant-spec">{d.playlist}</span>
            <span className="tw-variant-btns">
              <a className="btn" href={m.playlistUrl} target="_blank" rel="noreferrer">
                {d.openOrig}
              </a>
              <CopyBtn url={m.playlistUrl} d={d} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TweetCard({ t, d, lang }: { t: TweetData; d: Dict; lang: Lang }) {
  const s = t.stats;
  const statItems: [string, number][] = [];
  if (s.likes !== undefined) statItems.push([d.statsLabels.likes, s.likes]);
  if (s.retweets !== undefined)
    statItems.push([d.statsLabels.retweets, s.retweets]);
  if (s.replies !== undefined) statItems.push([d.statsLabels.replies, s.replies]);
  if (s.views !== undefined) statItems.push([d.statsLabels.views, s.views]);
  if (s.bookmarks !== undefined)
    statItems.push([d.statsLabels.bookmarks, s.bookmarks]);
  if (s.quotes !== undefined) statItems.push([d.statsLabels.quotes, s.quotes]);
  return (
    <div className="tw-tweet">
      <div className="tw-tweet-head">
        {t.author.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tw-avatar" src={t.author.avatarUrl} alt="" />
        )}
        <div>
          <p className="tw-author">
            {t.author.name}{" "}
            <span className="tw-handle">@{t.author.screenName}</span>
          </p>
          <p className="tw-time">{fmtTime(t.createdAt, lang)}</p>
        </div>
      </div>
      <p className="tw-text">{t.text}</p>
      {statItems.length > 0 && (
        <p className="tw-stats">
          {statItems.map(([label, n]) => `${label} ${n.toLocaleString()}`).join(" · ")}
        </p>
      )}
      {t.quoted && (
        <div className="tw-quoted">
          <p className="tw-quoted-title">
            {d.quotedTitle} · {t.quoted.author.name} @{t.quoted.author.screenName}
          </p>
          <p className="tw-quoted-text">{t.quoted.text}</p>
          <a href={t.quoted.url} target="_blank" rel="noreferrer">
            {t.quoted.url}
          </a>
        </div>
      )}
    </div>
  );
}

export default function TweetBoard() {
  const { lang } = useLang();
  const d = TWEET_DICT[lang];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<TweetPayload | null>(null);
  const [errorKind, setErrorKind] = useState<TweetErrorKind | null>(null);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [epubBusy, setEpubBusy] = useState(false);

  const parse = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setLoading(true);
    setErrorKind(null);
    setPayload(null);
    setPdfBlocked(false);
    try {
      const res = await fetch(`/api/tweet?q=${encodeURIComponent(q)}`);
      const j = (await res.json()) as TweetPayload;
      if (j.ok && j.tweet) {
        setPayload(j);
      } else {
        setErrorKind(j.error?.kind ?? "sourcefail");
      }
    } catch {
      setErrorKind("sourcefail");
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const tweet = payload?.tweet ?? null;
  const thread = payload?.thread ?? null;

  const openPdf = useCallback(() => {
    if (!tweet) return;
    const html = buildPrintHtml(tweet, thread);
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const w = window.open(url, "_blank");
    if (!w) {
      setPdfBlocked(true);
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [tweet, thread]);

  const exportEpub = useCallback(async () => {
    if (!tweet || epubBusy) return;
    setEpubBusy(true);
    try {
      const blob = await buildEpub(tweet, thread);
      downloadBlob(blob, `${baseName(tweet, thread)}.epub`);
    } finally {
      setEpubBusy(false);
    }
  }, [tweet, thread, epubBusy]);

  return (
    <>
      <section className="ft-board" aria-label={d.boardKicker}>
        <div className="burn-board-head">
          <h2 className="burn-board-title">{d.boardKicker}</h2>
          <p className="burn-board-meta">{d.boardSub}</p>
        </div>

        <form
          className="tw-form"
          onSubmit={(e) => {
            e.preventDefault();
            void parse();
          }}
        >
          <input
            className="ft-input tw-input"
            type="text"
            inputMode="url"
            placeholder={d.inputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={d.parseBtn}
          />
          <button type="submit" className="btn tw-parse-btn" disabled={loading}>
            {loading ? d.parsing : d.parseBtn}
          </button>
        </form>

        {errorKind && <p className="error">{d.errors[errorKind]}</p>}

        {payload && tweet && (
          <div className="tw-result">
            <p className="tw-source">
              {d.sourceLine
                .replace("{src}", payload.source === "fxtwitter" ? d.srcFx : d.srcSynd)
                .replace("{time}", fmtTime(payload.fetchedAt, lang))}
            </p>
            <TweetCard t={tweet} d={d} lang={lang} />

            {tweet.media.length > 0 && (
              <>
                <h3 className="tw-sec-title">{d.mediaTitle}</h3>
                <div className="tw-media-list">
                  {tweet.media.map((m, i) => (
                    <MediaBlock key={i} m={m} d={d} />
                  ))}
                </div>
                <p className="tw-note">{d.directNote}</p>
              </>
            )}

            <h3 className="tw-sec-title">{d.exportTitle}</h3>
            <p className="tw-note">{d.exportSub}</p>
            <div className="tw-actions">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadText(buildTxt(tweet, null), `${baseName(tweet, null)}.txt`, "text/plain")
                }
              >
                TXT
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadText(buildMarkdown(tweet, null), `${baseName(tweet, null)}.md`, "text/markdown")
                }
              >
                Markdown
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadText(buildHtml(tweet, null), `${baseName(tweet, null)}.html`, "text/html")
                }
              >
                HTML
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadText(buildJson(tweet, null), `${baseName(tweet, null)}.json`, "application/json")
                }
              >
                JSON
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadText(buildCsv(tweet, null), `${baseName(tweet, null)}.csv`, "text/csv")
                }
              >
                CSV
              </button>
              <button type="button" className="btn" onClick={openPdf}>
                {d.pdfBtn}
              </button>
            </div>
            {pdfBlocked && <p className="error">{d.pdfBlocked}</p>}

            {thread && (
              <div className="tw-thread">
                <h3 className="tw-sec-title">
                  {d.threadTitle.replace("{n}", String(thread.length))}
                </h3>
                <p className="tw-note">{d.threadNote}</p>
                <div className="tw-thread-list">
                  {thread.map((t, i) => (
                    <div className="tw-thread-item" key={t.id}>
                      <p className="tw-thread-meta">
                        {i + 1} · {fmtTime(t.createdAt, lang)}
                        {t.media.length > 0 ? ` · ${t.media.length} media` : ""}
                      </p>
                      <p className="tw-thread-text">{t.text}</p>
                    </div>
                  ))}
                </div>
                <h4 className="tw-sec-subtitle">{d.threadExport}</h4>
                <div className="tw-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      downloadText(buildTxt(tweet, thread), `${baseName(tweet, thread)}.txt`, "text/plain")
                    }
                  >
                    TXT
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      downloadText(buildMarkdown(tweet, thread), `${baseName(tweet, thread)}.md`, "text/markdown")
                    }
                  >
                    Markdown
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      downloadText(buildJson(tweet, thread), `${baseName(tweet, thread)}.json`, "application/json")
                    }
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void exportEpub()}
                    disabled={epubBusy}
                  >
                    EPUB
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="burn-notes">
        <div className="card">
          <h2>{d.boundaryTitle}</h2>
          {d.boundaryParas.map((p, i) => (
            <p
              className="body-text"
              key={i}
              style={i > 0 ? { marginTop: 10 } : undefined}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
