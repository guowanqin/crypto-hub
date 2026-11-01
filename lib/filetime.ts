// 照片 EXIF 时间的读取与写回（纯前端，浏览器本地处理）。
//
// 口径：本工具改的是照片文件**内嵌的 EXIF 时间**——拍摄时间 DateTimeOriginal、
// 创建时间 DateTimeDigitized、修改时间 ModifyDate，三者同步写为同一时刻；
// 其余 EXIF（GPS、设备、方向等）原样保留。网页无法修改用户硬盘上已有文件的
// 系统创建时间/修改时间，下载回去的文件其系统「修改时间」为下载时刻。
import exifr from "exifr";
import piexif from "piexifjs";

export interface PhotoTimes {
  /** 拍摄时间 DateTimeOriginal，EXIF 字符串 "YYYY:MM:DD HH:MM:SS"，无则 null */
  original: string | null;
  /** 创建时间 DateTimeDigitized */
  digitized: string | null;
  /** 修改时间 ModifyDate（IFD0 的 DateTime） */
  modify: string | null;
}

const EXIF_PARSE_OPTS = {
  jfif: false,
  icc: false,
  xmp: false,
  iptc: false,
  ihdr: false,
  // 关键：不要把时间字符串复活成 Date 对象（exifr 按 UTC 构造，会带来时区偏差），
  // 直接拿原始 "YYYY:MM:DD HH:MM:SS" 字符串，显示与计算都按墙钟时间处理。
  reviveValues: false,
} as const;

function asExifString(v: unknown): string | null {
  return typeof v === "string" && /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(v)
    ? v
    : null;
}

/** 读取一张 JPEG 的三个 EXIF 时间字段；非 JPEG / 解析失败返回全 null。 */
export async function readPhotoTimes(file: File | Blob): Promise<PhotoTimes> {
  const empty: PhotoTimes = { original: null, digitized: null, modify: null };
  try {
    const data = (await exifr.parse(file, EXIF_PARSE_OPTS)) as
      | Record<string, unknown>
      | undefined;
    if (!data) return empty;
    return {
      original: asExifString(data.DateTimeOriginal),
      digitized: asExifString(data.CreateDate),
      modify: asExifString(data.ModifyDate),
    };
  } catch {
    return empty;
  }
}

/** "YYYY:MM:DD HH:MM:SS" → 本地 Date（墙钟时间，不做时区换算）；非法返回 null。 */
export function parseExifString(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(se)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 本地 Date → EXIF 字符串 "YYYY:MM:DD HH:MM:SS"。 */
export function formatExifString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}:${p(d.getMonth() + 1)}:${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

/** 墙钟时间的「朴素毫秒」：用 UTC 通道承载本地分量，只用于做差值（偏移量）计算。 */
function naiveMs(d: Date): number {
  return Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds()
  );
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(head)?.[1] ?? "image/jpeg";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

type ExifDict = ReturnType<typeof piexif.load>;

function emptyExifDict(): ExifDict {
  return {
    "0th": {},
    Exif: {},
    GPS: {},
    Interop: {},
    "1st": {},
    thumbnail: null,
  } as unknown as ExifDict;
}

/**
 * 把一张 JPEG 的三个 EXIF 时间字段同步改为 newTime，返回新的 Blob。
 * - 原图其余 EXIF（GPS、设备、方向等）保留；
 * - 若原图带 GPS 日期/时间戳（UTC），按「新旧本地时间之差」同步平移，
 *   使本地时间与 GPS 时间的相对关系不变，时间线不自相矛盾；
 * - 无 EXIF 的 JPEG 会新插入这三个字段。
 */
export async function writePhotoTime(
  file: File,
  newTime: Date
): Promise<Blob> {
  const dataUrl = await fileToDataUrl(file);
  let exifObj: ExifDict;
  try {
    exifObj = piexif.load(dataUrl);
  } catch {
    // 无 EXIF 段或 EXIF 损坏：用空字典新插入时间段。
    exifObj = emptyExifDict();
  }

  const newStr = formatExifString(newTime);
  const zeroth = exifObj["0th"] as Record<number, unknown>;
  const exif = exifObj["Exif"] as Record<number, unknown>;
  const gps = exifObj["GPS"] as Record<number, unknown>;

  // GPS 同步：在覆盖本地时间字段之前，先算偏移量（新本地 − 旧本地）。
  const oldBasisStr =
    asExifString(exif[piexif.ExifIFD.DateTimeOriginal]) ??
    asExifString(zeroth[piexif.ImageIFD.DateTime]);
  const oldBasis = oldBasisStr ? parseExifString(oldBasisStr) : null;
  const gpsDateStamp = gps?.[piexif.GPSIFD.GPSDateStamp];
  const gpsTimeStamp = gps?.[piexif.GPSIFD.GPSTimeStamp] as
    | [number, number][]
    | undefined;
  if (oldBasis && typeof gpsDateStamp === "string" && Array.isArray(gpsTimeStamp)) {
    const dm = /^(\d{4}):(\d{2}):(\d{2})$/.exec(gpsDateStamp);
    if (dm) {
      const frac = (r: [number, number] | undefined) =>
        r && r[1] ? r[0] / r[1] : 0;
      const gpsOldMs =
        Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3])) +
        (frac(gpsTimeStamp[0]) * 3600 +
          frac(gpsTimeStamp[1]) * 60 +
          frac(gpsTimeStamp[2])) *
          1000;
      const shifted = new Date(gpsOldMs + (naiveMs(newTime) - naiveMs(oldBasis)));
      const p = (n: number) => String(n).padStart(2, "0");
      gps[piexif.GPSIFD.GPSDateStamp] =
        `${shifted.getUTCFullYear()}:${p(shifted.getUTCMonth() + 1)}:${p(shifted.getUTCDate())}`;
      gps[piexif.GPSIFD.GPSTimeStamp] = [
        [shifted.getUTCHours(), 1],
        [shifted.getUTCMinutes(), 1],
        [shifted.getUTCSeconds(), 1],
      ];
    }
  }

  exif[piexif.ExifIFD.DateTimeOriginal] = newStr;
  exif[piexif.ExifIFD.DateTimeDigitized] = newStr;
  zeroth[piexif.ImageIFD.DateTime] = newStr;

  const exifBytes = piexif.dump(exifObj);
  const outUrl = piexif.insert(exifBytes, dataUrl);
  return dataUrlToBlob(outUrl);
}

/** 输出文件名：原名 + 可选后缀（插在扩展名之前）。 */
export function outputFileName(name: string, suffix: string): string {
  if (!suffix) return name;
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return name + suffix;
  return name.slice(0, dot) + suffix + name.slice(dot);
}

export function isJpegFile(file: File): boolean {
  return (
    file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name)
  );
}
