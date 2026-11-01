// 推特工具箱取数：双源解析公开推文。
// 主源：推特公开嵌入接口 cdn.syndication.twimg.com/tweet-result（免登录，
// token 按其公开算法由推文 ID 派生）；备源：api.fxtwitter.com 公开接口。
// 任一源成功即返回；字段以实际返回为准——源里没有的互动数/字段一律留空，
// 不编造。Thread 不走官方 API：只能沿「回复链」向上组装同作者自回复串，
// 拿不到完整串时上层只给单条并明说（见 fetchTweetPayload 的 thread 口径）。

export interface TweetAuthor {
  name: string;
  screenName: string;
  avatarUrl: string;
}

export interface TweetStats {
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
  bookmarks?: number;
  quotes?: number;
}

export interface VideoVariant {
  url: string;
  bitrate?: number;
  width?: number;
  height?: number;
}

export type TweetMedia =
  | {
      kind: "photo";
      url: string; // 原图（name=orig）
      width?: number;
      height?: number;
      altText?: string;
    }
  | {
      kind: "video" | "gif";
      poster?: string;
      durationMs?: number;
      width?: number;
      height?: number;
      variants: VideoVariant[]; // MP4 变体，按码率从高到低
      playlistUrl?: string; // m3u8（如有）
    };

export interface QuotedSummary {
  id: string;
  url: string;
  text: string;
  author: TweetAuthor;
}

export interface TweetData {
  id: string;
  url: string;
  text: string;
  createdAt: string; // ISO
  author: TweetAuthor;
  stats: TweetStats;
  media: TweetMedia[];
  quoted: QuotedSummary | null;
}

export type TweetSource = "syndication" | "fxtwitter";
export type TweetErrorKind = "badformat" | "notfound" | "private" | "sourcefail";

export interface TweetPayload {
  ok: boolean;
  error: { kind: TweetErrorKind } | null;
  tweet: TweetData | null;
  // 同作者回复链组装（含主推，时间序）；凑不出 ≥2 条时为 null（单条模式）
  thread: TweetData[] | null;
  source: TweetSource | null;
  errors: { syndication?: string; fxtwitter?: string };
  fetchedAt: string;
}

const FETCH_TIMEOUT_MS = 9000;
const THREAD_MAX = 30;

// ---------- 输入解析 ----------

/** 从链接或纯 ID 里解析推文 ID；解析不出返回 null（上层报 badformat）。 */
export function parseTweetInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{1,25}$/.test(s)) return s;
  const m = s.match(/status(?:es)?\/(\d{1,25})/i);
  if (m && /(twitter\.com|x\.com)/i.test(s)) return m[1];
  return null;
}

// ---------- 通用小工具 ----------

function syndToken(id: string): string {
  // 推特嵌入组件公开算法：token 由 ID 派生（与官方 widget 同一公式）。
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

function parseResFromUrl(url: string): { width?: number; height?: number } {
  const m = url.match(/\/(\d{2,5})x(\d{2,5})\//);
  if (!m) return {};
  return { width: Number(m[1]), height: Number(m[2]) };
}

function sortVariants(vs: VideoVariant[]): VideoVariant[] {
  return [...vs].sort((a, b) => {
    const ba = a.bitrate ?? (a.width && a.height ? a.width * a.height : 0);
    const bb = b.bitrate ?? (b.width && b.height ? b.width * b.height : 0);
    return bb - ba;
  });
}

function origPhotoUrl(u: string): string {
  if (/[?&]name=/.test(u)) return u.replace(/([?&])name=[^&]+/, "$1name=orig");
  return u + (u.includes("?") ? "&" : "?") + "name=orig";
}

function sliceByRange(
  text: string,
  range: [number, number] | undefined | null,
): string {
  if (!range || range.length !== 2) return text;
  const [a, b] = range;
  if (a === 0 && b > 0 && b <= text.length && b < text.length) {
    return text.slice(a, b).trimEnd();
  }
  return text;
}

class SourceError extends Error {
  kind: TweetErrorKind;
  constructor(kind: TweetErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

async function fetchJson(url: string): Promise<{ status: number; json: unknown }> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      accept: "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

// ---------- 主源：syndication ----------

interface RawOne {
  data: TweetData;
  parentId: string | null;
  source: TweetSource;
}

function normalizeSynd(j: Record<string, unknown>): TweetData {
  const user = (j.user ?? {}) as Record<string, unknown>;
  const author: TweetAuthor = {
    name: String(user.name ?? ""),
    screenName: String(user.screen_name ?? ""),
    avatarUrl: String(user.profile_image_url_https ?? ""),
  };
  // 长推文（note tweet）优先用全文
  const note = j.note_tweet as Record<string, unknown> | undefined;
  const noteResult = (note?.note_tweet_results as Record<string, unknown>)
    ?.result as Record<string, unknown> | undefined;
  const noteText = typeof noteResult?.text === "string" ? noteResult.text : null;
  const rawText = noteText ?? String(j.text ?? "");
  const text = noteText
    ? noteText
    : sliceByRange(rawText, j.display_text_range as [number, number]);

  const stats: TweetStats = {};
  if (typeof j.favorite_count === "number") stats.likes = j.favorite_count;
  if (typeof j.retweet_count === "number") stats.retweets = j.retweet_count;
  if (typeof j.reply_count === "number") stats.replies = j.reply_count;
  else if (typeof j.conversation_count === "number")
    stats.replies = j.conversation_count;

  const media: TweetMedia[] = [];
  const details = Array.isArray(j.mediaDetails) ? j.mediaDetails : [];
  for (const d of details as Record<string, unknown>[]) {
    const type = String(d.type ?? "");
    const orig = (d.original_info ?? {}) as Record<string, unknown>;
    const w = typeof orig.width === "number" ? orig.width : undefined;
    const h = typeof orig.height === "number" ? orig.height : undefined;
    if (type === "photo") {
      media.push({
        kind: "photo",
        url: origPhotoUrl(String(d.media_url_https ?? "")),
        width: w,
        height: h,
      });
    } else if (type === "video" || type === "animated_gif") {
      const vi = (d.video_info ?? {}) as Record<string, unknown>;
      const rawVariants = Array.isArray(vi.variants) ? vi.variants : [];
      const variants: VideoVariant[] = [];
      let playlistUrl: string | undefined;
      for (const v of rawVariants as Record<string, unknown>[]) {
        const url = String(v.url ?? "");
        if (!url) continue;
        if (v.content_type === "video/mp4") {
          variants.push({
            url,
            bitrate:
              typeof v.bitrate === "number" ? v.bitrate : undefined,
            ...parseResFromUrl(url),
          });
        } else if (
          String(v.content_type ?? "").includes("mpegURL") &&
          !playlistUrl
        ) {
          playlistUrl = url;
        }
      }
      if (variants.length === 0 && playlistUrl === undefined) continue;
      // 只有一个变体且 URL 里没分辨率时，用 original_info 补
      if (variants.length === 1 && !variants[0].width && w && h) {
        variants[0] = { ...variants[0], width: w, height: h };
      }
      media.push({
        kind: type === "animated_gif" ? "gif" : "video",
        poster: d.media_url_https ? String(d.media_url_https) : undefined,
        durationMs:
          typeof vi.duration_millis === "number"
            ? vi.duration_millis
            : undefined,
        width: w,
        height: h,
        variants: sortVariants(variants),
        playlistUrl,
      });
    }
  }

  let quoted: QuotedSummary | null = null;
  const q = j.quoted_tweet as Record<string, unknown> | undefined;
  if (q && typeof q === "object" && q.id_str) {
    const qu = (q.user ?? {}) as Record<string, unknown>;
    quoted = {
      id: String(q.id_str),
      url: `https://x.com/${String(qu.screen_name ?? "i")}/status/${String(q.id_str)}`,
      text: String(q.text ?? ""),
      author: {
        name: String(qu.name ?? ""),
        screenName: String(qu.screen_name ?? ""),
        avatarUrl: String(qu.profile_image_url_https ?? ""),
      },
    };
  }

  const id = String(j.id_str ?? "");
  return {
    id,
    url: `https://x.com/${author.screenName || "i"}/status/${id}`,
    text,
    createdAt: String(j.created_at ?? ""),
    author,
    stats,
    media,
    quoted,
  };
}

async function fetchSyndication(id: string): Promise<RawOne> {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${syndToken(id)}&lang=en`;
  const { status, json } = await fetchJson(url);
  if (status === 404) throw new SourceError("notfound", `syndication HTTP 404`);
  if (status !== 200) throw new Error(`syndication HTTP ${status}`);
  const j = json as Record<string, unknown> | null;
  if (!j || typeof j !== "object") throw new Error("syndication non-JSON");
  if (!j.id_str) {
    // 空对象：推文存在但不可公开嵌入（私密/受限）时常见
    throw new SourceError("private", "syndication empty object");
  }
  const data = normalizeSynd(j);
  const parentId =
    typeof j.in_reply_to_status_id_str === "string" &&
    j.in_reply_to_status_id_str
      ? j.in_reply_to_status_id_str
      : null;
  return { data, parentId, source: "syndication" };
}

// ---------- 备源：fxtwitter ----------

function normalizeFx(t: Record<string, unknown>): TweetData {
  const au = (t.author ?? {}) as Record<string, unknown>;
  const author: TweetAuthor = {
    name: String(au.name ?? ""),
    screenName: String(au.screen_name ?? ""),
    avatarUrl: String(au.avatar_url ?? ""),
  };
  const raw = (t.raw_text ?? {}) as Record<string, unknown>;
  const rawText =
    typeof raw.text === "string" && raw.text ? raw.text : String(t.text ?? "");
  const text = sliceByRange(
    rawText,
    raw.display_text_range as [number, number] | undefined,
  );

  const stats: TweetStats = {};
  if (typeof t.likes === "number") stats.likes = t.likes;
  if (typeof t.retweets === "number") stats.retweets = t.retweets;
  if (typeof t.replies === "number") stats.replies = t.replies;
  if (typeof t.views === "number") stats.views = t.views;
  if (typeof t.bookmarks === "number") stats.bookmarks = t.bookmarks;
  if (typeof t.quotes === "number") stats.quotes = t.quotes;

  const media: TweetMedia[] = [];
  const m = (t.media ?? {}) as Record<string, unknown>;
  const photos = Array.isArray(m.photos) ? m.photos : [];
  for (const p of photos as Record<string, unknown>[]) {
    media.push({
      kind: "photo",
      url: origPhotoUrl(String(p.url ?? "")),
      width: typeof p.width === "number" ? p.width : undefined,
      height: typeof p.height === "number" ? p.height : undefined,
      altText: typeof p.altText === "string" ? p.altText : undefined,
    });
  }
  const videos = Array.isArray(m.videos) ? m.videos : [];
  for (const v of videos as Record<string, unknown>[]) {
    const formats = Array.isArray(v.formats) ? v.formats : [];
    const variants: VideoVariant[] = [];
    let playlistUrl: string | undefined;
    for (const f of formats as Record<string, unknown>[]) {
      const url = String(f.url ?? "");
      if (!url) continue;
      if (f.container === "mp4") {
        variants.push({
          url,
          bitrate: typeof f.bitrate === "number" ? f.bitrate : undefined,
          ...parseResFromUrl(url),
        });
      } else if (f.container === "m3u8" && !playlistUrl) {
        playlistUrl = url;
      }
    }
    if (variants.length === 0 && typeof v.url === "string" && v.url) {
      variants.push({
        url: v.url,
        width: typeof v.width === "number" ? v.width : undefined,
        height: typeof v.height === "number" ? v.height : undefined,
      });
    }
    media.push({
      kind: v.type === "gif" ? "gif" : "video",
      poster:
        typeof v.thumbnail_url === "string" ? v.thumbnail_url : undefined,
      durationMs:
        typeof v.duration === "number"
          ? Math.round(v.duration * 1000)
          : undefined,
      width: typeof v.width === "number" ? v.width : undefined,
      height: typeof v.height === "number" ? v.height : undefined,
      variants: sortVariants(variants),
      playlistUrl,
    });
  }

  let quoted: QuotedSummary | null = null;
  const q = t.quote as Record<string, unknown> | undefined;
  if (q && typeof q === "object" && q.id) {
    const qa = (q.author ?? {}) as Record<string, unknown>;
    quoted = {
      id: String(q.id),
      url: String(q.url ?? `https://x.com/i/status/${String(q.id)}`),
      text: String(q.text ?? ""),
      author: {
        name: String(qa.name ?? ""),
        screenName: String(qa.screen_name ?? ""),
        avatarUrl: String(qa.avatar_url ?? ""),
      },
    };
  }

  const createdRaw = String(t.created_at ?? "");
  const parsed = Date.parse(createdRaw);
  return {
    id: String(t.id ?? ""),
    url:
      String(t.url ?? "") ||
      `https://x.com/${author.screenName || "i"}/status/${String(t.id ?? "")}`,
    text,
    createdAt: Number.isNaN(parsed) ? createdRaw : new Date(parsed).toISOString(),
    author,
    stats,
    media,
    quoted,
  };
}

async function fetchFx(id: string): Promise<RawOne> {
  const { status, json } = await fetchJson(
    `https://api.fxtwitter.com/status/${id}`,
  );
  const j = json as Record<string, unknown> | null;
  if (!j) throw new Error(`fxtwitter HTTP ${status} non-JSON`);
  const code = typeof j.code === "number" ? j.code : status;
  if (code === 404) throw new SourceError("notfound", "fxtwitter 404");
  if (code === 401 || code === 403)
    throw new SourceError("private", `fxtwitter ${code}`);
  const t = j.tweet as Record<string, unknown> | null;
  if (code !== 200 || !t) throw new Error(`fxtwitter code ${code}`);
  const data = normalizeFx(t);
  const parentId =
    typeof t.replying_to_status === "string" && t.replying_to_status
      ? t.replying_to_status
      : null;
  return { data, parentId, source: "fxtwitter" };
}

// ---------- 双源合并与 Thread 组装 ----------

async function fetchOne(
  id: string,
  errors: TweetPayload["errors"],
): Promise<RawOne> {
  let syndKind: TweetErrorKind | null = null;
  try {
    return await fetchSyndication(id);
  } catch (e) {
    if (e instanceof SourceError) syndKind = e.kind;
    errors.syndication = e instanceof Error ? e.message : String(e);
  }
  try {
    return await fetchFx(id);
  } catch (e) {
    errors.fxtwitter = e instanceof Error ? e.message : String(e);
    if (e instanceof SourceError) {
      // 分类优先级：任一源明确说不存在 → notfound；说不可见 → private
      if (e.kind === "notfound" || syndKind === "notfound")
        throw new SourceError("notfound", "both sources: not found");
      if (e.kind === "private" || syndKind === "private")
        throw new SourceError("private", "both sources: not public");
      throw e;
    }
    if (syndKind) throw new SourceError(syndKind, "syndication classified");
    throw new SourceError("sourcefail", "both sources failed");
  }
}

export async function fetchTweetPayload(id: string): Promise<TweetPayload> {
  const base: TweetPayload = {
    ok: false,
    error: null,
    tweet: null,
    thread: null,
    source: null,
    errors: {},
    fetchedAt: new Date().toISOString(),
  };
  let first: RawOne;
  try {
    first = await fetchOne(id, base.errors);
  } catch (e) {
    base.error = {
      kind: e instanceof SourceError ? e.kind : "sourcefail",
    };
    return base;
  }
  base.ok = true;
  base.tweet = first.data;
  base.source = first.source;

  // Thread：沿回复链向上，只收与主推同作者的连续自回复（含主推）。
  // 链断了、换作者了、或源拿不到祖先，就停在已组装处——这只是「截至
  // 本条的同作者串」，可能不含其后的条目；页面与导出都会如实标注。
  const chain: TweetData[] = [first.data];
  const seen = new Set<string>([id]);
  let parentId = first.parentId;
  const myName = first.data.author.screenName.toLowerCase();
  while (parentId && chain.length < THREAD_MAX && !seen.has(parentId)) {
    seen.add(parentId);
    let parent: RawOne;
    try {
      parent = await fetchOne(parentId, {});
    } catch {
      break;
    }
    if (parent.data.author.screenName.toLowerCase() !== myName) break;
    chain.unshift(parent.data);
    parentId = parent.parentId;
  }
  if (chain.length >= 2) base.thread = chain;
  return base;
}
