#!/usr/bin/env python3
"""Fetch the public resource directory of X account @li18875786
('付费资源分享') at https://zy.zcw20241221.workers.dev/ and write
data/li18875786.json for the 18btc.cc in-site tool 'quark-resources'.

Second source (added 2026-11-19, site-owner decision): the Telegram
channel of X account @FLMdongtianfudi (t.me/FLMdongtianfudi, public
preview https://t.me/s/FLMdongtianfudi), where he actually posts his
Quark shares — his X feed is mostly other promotions. Same board
rules, plus one filter the owner set for this source: adult/erotic
items are excluded (ADULT_BLOCKLIST below); films and cracked games
are collected like any other item. His posts may wrap the Quark link
in his own domain pan.fanglmshare.com/s/<id>, which redirects to the
same pan.quark.cn share id. The TG source fails soft: if it cannot be
fetched, the directory source still updates on its own.

Stdlib only. No login, no API key — the directory page is a single
static HTML file fetchable with a normal browser User-Agent.

Board rules (fixed, disclosed on the page):
- One item per Quark Drive link (pan.quark.cn/s/<id>); items that only
  carry a Baidu link are NOT collected.
- Deduplicated by Quark id, kept in the site's own order (newest first).
- Titles are the site's originals, never rewritten.
- The site gives no per-item date, so none is invented; the dataset
  only records the fetch date.
- Category is assigned by a fixed keyword table matched against the
  title (CATEGORY_RULES below, first match wins, fallback 其他). The
  site's own <span class="tag"> is almost always just '资源' and is
  not used for classification.

Usage:
    python3 scripts/update-li18875786.py [--out data/li18875786.json]

Exit code 0 on success. On fetch failure or an empty parse it prints
a clear error to stderr and exits non-zero WITHOUT touching the old
data file (the GitHub Action then fails visibly and old data stays).
"""

import argparse
import html as html_mod
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

BASE_URL = "https://zy.zcw20241221.workers.dev/"
ACCOUNT = "@li18875786"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
REPO_ROOT = Path(__file__).resolve().parent.parent

QUARK_RE = re.compile(r"pan\.quark\.cn/s/([A-Za-z0-9]+)")

TG_URL = "https://t.me/s/FLMdongtianfudi"
WRAPPED_RE = re.compile(r"fanglmshare\.com/s/([A-Za-z0-9]+)")

# Adult/erotic filter for the TG source only (owner decision
# 2026-11-19: filter adult content; films and cracked games are OK).
# Matched against title + message text; first hit excludes the item.
ADULT_BLOCKLIST = [
    "成人", "少妇", "色情", "情色", "无码", "里番", "偷拍", "街拍",
    "小姐姐", "约炮", "三级片", "毛片", "黄片", "擦边", "美女合集",
    "福利姬", "onlyfans", "OnlyFans", "女优", "裸聊",
]

# --- auto-classification: ordered (category, keywords); first match wins.
# Keywords are plain substrings of the title unless the entry is a regex
# (marked by a leading 're:'). Keep the table explainable: it is the
# exact rule the page discloses.
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("中小学教辅", [
        "小学", "初中", "高中", "中考", "高考", "小升初", "年级", "幼儿",
        "幼儿园", "儿童绘本", "绘本", "看图写话", "文言文", "古诗词", "培优",
        "同步教学", "同步专项", "真题", "押题", "少年", "乐高", "启蒙",
        "数学", "语文", "物理", "化学",
    ]),
    ("英语学习", [
        "英语", "英文", "德语", "日语", "韩语", "法语", "新概念", "背单词",
        "单词", "同传", "听说训练营",
    ]),
    ("考试考证", [
        "国省考", "省考", "国考", "行测", "申论", "事业单位", "三支一扶",
        "公基", "时政", "言语", "政治理论", "教资", "法考", "建造师",
        "造价师", "消防工程师", "安全工程师", "软考", "四六级", "上岸村",
        "公务员", "网络工程师", "综应", "超格", "高照", "资料分析", "判断",
    ]),
    ("电商运营", [
        "电商", "淘宝", "拼多多", "抖音小店", "抖店", "小店带货", "带货",
        "Shopee", "虾皮", "亚马逊", "跨境", "外贸", "独立站", "京东",
        "店群", "无货源", "LAZADA", "广告投放", "Google Ads", "千川",
    ]),
    ("编程开发", [
        "编程", "开发", "Python", "python", "Java", "Go语言", "C语言",
        "C++", "Linux", "运维", "前端", "后端", "爬虫", "架构", "DevOps",
        "Docker", "Kubernetes", "K8s", "数据库", "Redis", "redis",
        "Flask", "Vue", "Node", "Unity", "UE4", "逆向", "嵌入式", "算法",
        "数据结构", "CMake", "Quartz", "微服务", "ElasticStack", "代码",
        "靶机", "游戏开发", "小游戏制作", "EDR",
    ]),
    ("职场财会", [
        "财务", "财会", "会计", "审计", "Excel", "职场", "报表", "WPS",
        "PPT", "办公", "升职", "求职", "简历", "面试", "管理", "销售",
        "HR", "沟通技巧", "办事能力", "人情世故", "财商", "理财", "股票",
        "交易系统", "波段", "江恩", "波浪理论", "产品经理", "企业", "职业",
        "实盘",
    ]),
    ("AI课程", [
        "re:(?<![A-Za-z])AI(?![A-Za-z])", "人工智能", "大模型", "智能体",
        "数字人", "生成式", "Seedance", "即梦", "Midjourney",
        "Nano Banana", "Codex", "codex", "WorkBuddy", "OpenClaw",
        "Hermes", "GPT", "漫剧",
    ]),
    ("剪辑摄影", [
        "剪辑", "摄影", "调色", "分镜", "剪映", "Premiere", "达芬奇",
        "LUT", "lut", "修图", "设计", "动画", "素材", "3D", "Blender",
        "Belnder", "C4D", "电影感", "动效",
        "re:(?<![A-Za-z])AE(?![A-Za-z])", "re:(?<![A-Za-z])[Pp][Ss](?![A-Za-z])",
    ]),
    ("自媒体", [
        "自媒体", "抖音", "快手", "视频号", "小红书", "公众号", "直播",
        "主播", "油管", "YouTube", "TikTok", "Tiktok", "短视频", "涨粉",
        "起号", "流量", "获客", "副业", "兼职", "导流", "截流", "知乎",
        "写作", "全媒体", "变现",
    ]),
    ("生活技能", [
        "小吃", "咖啡", "烹饪", "炒菜", "家常菜", "配方", "瑜伽", "健身",
        "瘦身", "塑身", "减肥", "康复", "护肤", "变美", "养颜", "脱发",
        "中医", "倪海厦", "维修", "吉他", "乐器", "哨笛", "书法", "绘画",
        "手绘", "速写", "舞蹈", "学舞", "太极", "柔术", "散打", "八极拳",
        "心意拳", "拳", "恋爱", "情感", "婚恋", "育儿", "家庭教育", "父母",
        "孩子", "风水", "断宅", "识人术", "厚黑学", "心理", "相处",
    ]),
    ("软件工具", [
        "工具", "软件", "插件", "录屏", "下载助手", "工具箱", "字体",
    ]),
    ("电子书", [
        "电子书", "电子版", ".pdf", "PDF", "丛书", "县志", "古籍",
        "付费文章", "文集",
    ]),
    ("影视合集", [
        "电视剧", "充电视频", "大闹天宫", "歌曲库", "车载音乐",
    ]),
]

FALLBACK_CATEGORY = "其他"


def classify(title: str) -> str:
    for category, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw.startswith("re:"):
                if re.search(kw[3:], title):
                    return category
            elif kw in title:
                return category
    return FALLBACK_CATEGORY


def fetch_page(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status != 200:
                raise RuntimeError(f"HTTP {resp.status} for {url}")
            return resp.read().decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001 - report and fail loudly
        raise RuntimeError(f"fetch failed for {url}: {exc}") from exc


TITLE_OVERRIDES_PATH = REPO_ROOT / "data" / "li18875786-titles.json"


def load_title_overrides() -> dict:
    """AI-polished SEO titles keyed by Quark id (maintained by Muse).

    Items without an override fall back to clean_title(). The overrides
    file lives in the repo so the daily Action keeps applying them.
    """
    try:
        with open(TITLE_OVERRIDES_PATH, encoding="utf-8") as fh:
            data = json.load(fh)
        return {str(k): str(v) for k, v in data.items() if v}
    except FileNotFoundError:
        return {}
    except Exception as exc:  # noqa: BLE001 - never let titles break the run
        print(f"WARN: title overrides unreadable: {exc}", file=sys.stderr)
        return {}


_SIZE_RE = re.compile(r"[【\[][^】\]]*\d+(\.\d+)?\s*(GB|MB|G|M)[】\]]", re.I)
_LEAD_JUNK_RE = re.compile(r"^[\s\u2600-\u27bf\U0001f300-\U0001faff✅🔥⭐✨]+")
  

def clean_title(title: str) -> str:
    """Conservative cleanup for new items that have no AI override yet."""
    t = _SIZE_RE.sub("", title)
    t = _LEAD_JUNK_RE.sub("", t)
    t = re.sub(r"\s+", " ", t).strip(" \t|｜·-—")
    return t or title


def parse_cards(page_html: str) -> list[dict]:
    """Extract raw cards: title + all outbound share links, in site order."""
    blocks = re.split(r'(?=<li class="card")', page_html)[1:]
    cards = []
    for block in blocks:
        tm = re.search(r"<h2>(.*?)</h2>", block, re.S)
        if not tm:
            continue
        title = html_mod.unescape(re.sub(r"<[^>]+>", "", tm.group(1)))
        title = re.sub(r"\s+", " ", title).strip()
        links = re.findall(r'href="(https?://[^"]+)"', block)
        cards.append({"title": title, "links": links})
    return cards


def build_items(
    cards: list[dict],
    prev_added: dict | None = None,
    today: str = "",
) -> tuple[list[dict], list[tuple[str, str]]]:
    """Keep one item per Quark id (site order); report skipped cards.

    `added` is the date THIS SITE first collected the item (the source
    directory publishes no per-item dates). Dates are carried over from
    the previous data file; brand-new ids get `today`.
    """
    overrides = load_title_overrides()
    prev_added = prev_added or {}
    seen: set[str] = set()
    items: list[dict] = []
    skipped: list[tuple[str, str]] = []
    for card in cards:
        quark_id = None
        for link in card["links"]:
            m = QUARK_RE.search(link)
            if m:
                quark_id = m.group(1)
                break
        if quark_id is None:
            skipped.append((card["title"], "只有百度链接或无夸克链接"))
            continue
        if quark_id in seen:
            skipped.append((card["title"], f"夸克 ID 重复 {quark_id}"))
            continue
        if not card["title"]:
            skipped.append(("(无标题)", "无标题"))
            continue
        seen.add(quark_id)
        items.append(
            {
                "id": quark_id,
                "title": overrides.get(quark_id) or clean_title(card["title"]),
                "added": prev_added.get(quark_id) or today,
                "url": f"https://pan.quark.cn/s/{quark_id}",
                "category": classify(card["title"]),
            }
        )
    return items, skipped


def is_adult(text: str) -> bool:
    return any(kw in text for kw in ADULT_BLOCKLIST)


def parse_tg_messages(page_html: str) -> list[dict]:
    """Extract channel messages: quark id + title + datetime.

    t.me/s renders each message as a .tgme_widget_message block with
    the text in .tgme_widget_message_text (<br> = line break; the
    first line is the resource title) and a <time datetime=...> stamp.
    Blocks are returned newest first.
    """
    blocks = re.split(r'(?=tgme_widget_message )', page_html)[1:]
    out: list[dict] = []
    for block in blocks:
        m = QUARK_RE.search(block) or WRAPPED_RE.search(block)
        if not m:
            continue
        tm = re.search(r'tgme_widget_message_text[^>]*>(.*?)</div>', block, re.S)
        if not tm:
            continue
        raw = re.sub(r"<br\s*/?>", "\n", tm.group(1))
        raw = html_mod.unescape(re.sub(r"<[^>]+>", "", raw))
        lines = [ln.strip() for ln in raw.split("\n") if ln.strip()]
        if not lines:
            continue
        title = lines[0]
        # Drop a trailing link line that got merged into the title.
        title = re.split(r"🔗|https?://", title)[0].strip()
        dt = re.search(r'<time datetime="([^"]+)"', block)
        out.append(
            {
                "id": m.group(1),
                "title": title,
                "text": " ".join(lines),
                "datetime": dt.group(1) if dt else "",
            }
        )
    out.reverse()  # page order is oldest first; we keep newest first
    return out


def build_tg_items(
    messages: list[dict],
    prev_added: dict,
    today: str,
) -> tuple[list[dict], list[tuple[str, str]]]:
    """Turn TG messages into board items (adult filtered, deduped)."""
    overrides = load_title_overrides()
    seen: set[str] = set()
    items: list[dict] = []
    skipped: list[tuple[str, str]] = []
    for msg in messages:
        qid = msg["id"]
        if qid in seen:
            continue
        seen.add(qid)
        if is_adult(msg["title"] + " " + msg["text"]):
            skipped.append((msg["title"], "成人内容过滤"))
            continue
        if not msg["title"]:
            skipped.append((qid, "无标题"))
            continue
        items.append(
            {
                "id": qid,
                "title": overrides.get(qid) or clean_title(msg["title"]),
                "added": prev_added.get(qid) or today,
                "url": f"https://pan.quark.cn/s/{qid}",
                "category": classify(msg["title"]),
            }
        )
    return items, skipped


def fetch_tg_items(prev_added: dict, today: str):
    """Fetch the TG channel (2 preview pages) and build items.

    Fails soft: returns (items, skipped, error_or_None); on a fetch or
    parse failure the caller proceeds with the directory source only.
    """
    try:
        page1 = fetch_page(TG_URL)
        messages = parse_tg_messages(page1)
        # One extra page back, in case of a high-volume day.
        ids = re.findall(r'data-post="FLMdongtianfudi/(\d+)"', page1)
        if ids:
            try:
                page0 = fetch_page(f"{TG_URL}?before={min(int(i) for i in ids)}")
                older = parse_tg_messages(page0)
                known = {m["id"] for m in messages}
                messages = messages + [m for m in older if m["id"] not in known]
            except RuntimeError:
                pass
        if not messages:
            return [], [], "TG preview parsed 0 quark messages"
        items, skipped = build_tg_items(messages, prev_added, today)
        return items, skipped, None
    except RuntimeError as exc:
        return [], [], str(exc)

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/li18875786.json")
    args = ap.parse_args()

    try:
        page_html = fetch_page(BASE_URL)
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = REPO_ROOT / out_path
    prev_added: dict = {}
    if out_path.exists():
        try:
            prev = json.loads(out_path.read_text(encoding="utf-8"))
            prev_added = {
                it["id"]: it["added"]
                for it in prev.get("items", [])
                if it.get("id") and it.get("added")
            }
        except Exception as exc:  # noqa: BLE001 - dates are best-effort
            print(f"WARN: previous data unreadable: {exc}", file=sys.stderr)

    today_str = time.strftime("%Y-%m-%d")
    cards = parse_cards(page_html)
    items, skipped = build_items(cards, prev_added, today_str)
    if not items:
        print(
            f"ERROR: parsed {len(cards)} cards but kept 0 items; "
            "refusing to overwrite data with an empty set",
            file=sys.stderr,
        )
        return 1

    # Second source: @FLMdongtianfudi's Telegram channel (fails soft).
    tg_items, tg_skipped, tg_err = fetch_tg_items(prev_added, today_str)
    if tg_err:
        print(f"WARN: TG source skipped: {tg_err}", file=sys.stderr)
    dir_ids = {it["id"] for it in items}
    new_tg = [
        it for it in tg_items if it["id"] not in prev_added and it["id"] not in dir_ids
    ]
    # Carry over previously collected TG items that are in neither the
    # directory nor today's channel page, so nothing ever drops out.
    merged_ids = dir_ids | {it["id"] for it in new_tg}
    carry = []
    if out_path.exists():
        try:
            prev = json.loads(out_path.read_text(encoding="utf-8"))
            carry = [
                it
                for it in prev.get("items", [])
                if it.get("id") and it["id"] not in merged_ids
            ]
        except Exception:  # noqa: BLE001 - carry-over is best-effort
            carry = []
    items = new_tg + items + carry
    skipped = skipped + tg_skipped
    print(
        f"TG source: kept {len(tg_items)} items "
        f"({len(new_tg)} new), skipped {len(tg_skipped)}, carried {len(carry)}"
    )

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = REPO_ROOT / out_path
    today = time.strftime("%Y-%m-%d")
    payload = {
        "updated": today,
        "items": items,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    counts: dict[str, int] = {}
    for item in items:
        counts[item["category"]] = counts.get(item["category"], 0) + 1
    print(f"parsed {len(cards)} cards, kept {len(items)} items, skipped {len(skipped)}")
    for title, reason in skipped:
        print(f"  skipped [{reason}]: {title}")
    print("categories:")
    for name, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {name}: {count}")
    print(f"wrote {out_path} (updated {today})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
