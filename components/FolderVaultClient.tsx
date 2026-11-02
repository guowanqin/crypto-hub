"use client";

import Link from "next/link";
import { getTool } from "@/lib/tools";
import { TAG_MAP } from "@/lib/tags";
import { HUB_DICT } from "@/lib/i18n";
import { MASCOT_NAME, SITE_NAME } from "@/lib/site";
import FolderVault from "./FolderVault";
import AdSlot from "./AdSlot";
import { useLang } from "./LangProvider";

const tool = getTool("foldervault")!;
const desktopTool = getTool("folderlock")!;

const DIFF: Record<
  "zh" | "tw" | "en",
  { title: string; body: string; linkLabel: string }
> = {
  zh: {
    title: "和桌面版 FolderLock 的区别",
    body: "这个网页版走的是「保险箱文件」路线：加密产物是一个 .vault 文件，你自己保管、自己传回页面解锁。桌面版 FolderLock 能做的原地锁定（文件夹留在原位置、资源管理器里双击解锁）、右键菜单一键加密、系统托盘常驻，网页受浏览器沙箱限制都做不到——那是装在电脑上的软件才有的能力。反过来，网页版不用安装、任何系统打开页面就能用，适合临时给一批文件打包加密、换设备时靠 .vault 文件和密码（或恢复密钥）取回。",
    linkLabel: "看桌面版 FolderLock 介绍",
  },
  en: {
    title: "How this differs from the desktop FolderLock",
    body: "This web version works as a “vault file”: the encrypted output is a single .vault file that you keep and bring back to this page to unlock. What the desktop FolderLock does — locking a folder in place (double-click it in Explorer to unlock), right-click encryption and a system-tray presence — is beyond a browser sandbox; only installed software can do that. In return, the web version needs no installation and works on any system with a browser: handy for encrypting a batch of files on the spot and retrieving them on another device with just the .vault file and your password (or recovery key).",
    linkLabel: "See the desktop FolderLock page",
  },
  tw: {
    title: "和桌面版 FolderLock 的區別",
    body: "這個網頁版走的是「保險箱檔案」路線：加密產物是一個 .vault 檔案，你自己保管、自己傳回頁面解鎖。桌面版 FolderLock 能做的原地鎖定（資料夾留在原位置、資源管理器裡雙擊解鎖）、右鍵選單一鍵加密、系統托盤常駐，網頁受瀏覽器沙箱限制都做不到——那是裝在電腦上的軟體才有的能力。反過來，網頁版不用安裝、任何系統開啟頁面就能用，適合臨時給一批檔案打包加密、換裝置時靠 .vault 檔案和密碼（或恢復金鑰）取回。",
    linkLabel: "看桌面版 FolderLock 介紹",
  },
};

const SAFETY: Record<"zh" | "tw" | "en", { title: string; items: string[] }> = {
  zh: {
    title: "使用与安全说明",
    items: [
      "全程本地处理：文件不上传任何服务器，关掉页面不留任何数据；密码和恢复密钥也只在你的浏览器里参与计算。",
      "密码忘了、恢复密钥也丢了，保险箱就永远打不开——包括本站在内，没有任何人能帮你找回。建箱后先把恢复密钥离线记好。",
      "加密不能替代备份：.vault 文件损坏或丢失，内容同样找不回，重要数据请另外保留一份原件备份。",
      "本工具的加密流程采用业界标准的信封加密与 AES-256-GCM + Argon2id 组合，但未经独立第三方安全审计；极敏感的唯一副本请先小规模试用再决定。",
      "下载 .vault 后建议先试开箱一次（用密码或恢复密钥各验一遍）再删原件，确认流程无误。",
    ],
  },
  en: {
    title: "Usage & safety notes",
    items: [
      "Fully local: files are never uploaded to any server, and closing the page leaves nothing behind. Your password and recovery key are only ever computed with inside your browser.",
      "Forget the password and lose the recovery key, and the vault can never be opened again — nobody, including this site, can recover it for you. Write the recovery key down offline right after creating a vault.",
      "Encryption is not a backup: if the .vault file is damaged or lost, so is its content. Keep a separate copy of anything important.",
      "The design follows standard practice — envelope encryption with AES-256-GCM and Argon2id — but it has not had an independent third-party security audit. Try it on a small scale first before trusting it with the only copy of something sensitive.",
      "After downloading a .vault, test-open it once (try both the password and the recovery key) before deleting any originals.",
    ],
  },
  tw: {
    title: "使用與安全說明",
    items: [
      "全程本地處理：檔案不上傳任何伺服器，關掉頁面不留任何資料；密碼和恢復金鑰也只在你的瀏覽器裡參與計算。",
      "密碼忘了、恢復金鑰也丟了，保險箱就永遠打不開——包括本站在內，沒有任何人能幫你找回。建箱後先把恢復金鑰離線記好。",
      "加密不能替代備份：.vault 檔案損壞或丟失，內容同樣找不回，重要資料請另外保留一份原件備份。",
      "本工具的加密流程採用業界標準的信封加密與 AES-256-GCM + Argon2id 組合，但未經獨立第三方安全審計；極敏感的唯一副本請先小規模試用再決定。",
      "下載 .vault 後建議先試開箱一次（用密碼或恢復金鑰各驗一遍）再刪原件，確認流程無誤。",
    ],
  },
};

export default function FolderVaultClient({ adsPreview = false }: { adsPreview?: boolean }) {
  const { lang } = useLang();
  const t = HUB_DICT[lang];
  const diff = DIFF[lang];
  const safety = SAFETY[lang];

  return (
    <main className="page">
      <p className="crumb">
        <Link href="/">{t.backHome}</Link>
        <span className="crumb-sep">·</span>
        <Link href="/tag/security">{TAG_MAP.security.name[lang]}</Link>
      </p>

      <section className="detail-head">
        <div className="tool-badges">
          <span className="badge badge-embedded">{t.embeddedBadge}</span>
        </div>
        <h1 className="detail-title">{tool.name[lang]}</h1>
        <p className="detail-oneliner">{tool.oneLiner[lang]}</p>
      </section>

      {/* 工具本体：站内直接使用 */}
      <FolderVault />

      <section className="card">
        <h2>{diff.title}</h2>
        <p className="body-text">{diff.body}</p>
        <p className="body-text">
          <Link href={`/tool/${desktopTool.slug}`}>{diff.linkLabel} →</Link>
        </p>
      </section>

      <section className="card">
        <h2>{safety.title}</h2>
        <ul className="fv-safety-list">
          {safety.items.map((item, i) => (
            <li key={i} className="body-text">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>{t.detailTitle}</h2>
        <p className="body-text">{tool.detail[lang]}</p>
        <h3 className="sub-title">{t.audienceTitle}</h3>
        <p className="body-text">{tool.audience[lang]}</p>
      </section>

      <section className="card take-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot-avatar.webp" alt={MASCOT_NAME[lang]} className="take-avatar" />
        <div>
          <h2 className="take-heading">
            {SITE_NAME[lang]} · {t.takeTitle}
          </h2>
          <p className="take-quote">“{tool.take[lang]}”</p>
        </div>
      </section>

      {/* 广告位：工具页底部横幅（介绍内容下方、页脚上方） */}
      <AdSlot id="tool_bottom" preview={adsPreview} />
    </main>
  );
}
