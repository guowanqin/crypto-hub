#!/usr/bin/env python3
"""Fetch upcoming token cliff unlocks from the Tokenomist API and write
data/unlocks.json for the 18btc.cc in-site tool 'unlocks-board'.

API (verified against docs.tokenomist.ai on 2026-11-18):
    GET https://api.tokenomist.ai/v5/unlock/events/upcoming
    Header: x-api-key: <key>   (key read from env TOKENOMIST_API_KEY only;
    never hard-code a key in this repo)
    Params: start / end (YYYY-MM-DD), page, pageSize.
    Each item is one token's NEXT cliff unlock, with
    upcomingEvent.cliffUnlocks { totalCliffAmount, totalCliffValue,
    valueToMarketCap, allocationBreakdown[] }.

Free-trial limits (docs, 2026-11-18): 1,000 credits/month, 120 req/min,
50 trial tokens, upcoming unlocks only up to 7 days ahead (a wider window
is refused with 422). So this script refreshes the 7-day window only;
the 30-day total is set to null in API mode (the page says the free tier
does not provide it) instead of keeping a stale snapshot number.

One more step before this works in production (site owner):
    1. Request a free trial at tokenomist.ai and get an API key.
    2. Add it to the GitHub repo as Actions secret TOKENOMIST_API_KEY
       (Settings -> Secrets and variables -> Actions).
    The daily workflow (.github/workflows/update-unlocks.yml) then picks
    it up automatically.

Behaviour: with no key, on any HTTP/API error, or on an empty result,
the script prints the reason to stderr and exits non-zero WITHOUT
touching data/unlocks.json (the board keeps the seed snapshot / last
good data). It never writes empty or partial data.

Usage:
    TOKENOMIST_API_KEY=... python3 scripts/update-unlocks.py [--out data/unlocks.json]
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

API_URL = "https://api.tokenomist.ai/v5/unlock/events/upcoming"
REPO_ROOT = Path(__file__).resolve().parent.parent
PAGE_SIZE = 100

# Tokenomist standardAllocationName -> board label (归属方).
ALLOC_LABELS = {
    "Founder / Team": "团队",
    "Private Investors": "私募投资者",
    "Public Investors": "公募投资者",
    "Community": "社区",
    "Reserve": "储备",
    "Others": "其他",
}

# MON (Monad) 口径分歧注：无论快照还是 API 模式，只要 MON 上榜就带上，
# 把两个口径都标清（页面口径公开的一部分）。
MON_NOTE = (
    "口径分歧：本行金额与占比为 Tokenomist 口径；DefiLlama 2026-11-17 快照"
    "口径约 $2.52 亿、占流通量 144.89%（约 166 亿–171 亿枚）。Monad 未公布"
    "完整解锁时间表，两家统计口径不同。"
)


def fetch_page(key: str, start: str, end: str, page: int) -> dict:
    qs = urllib.parse.urlencode(
        {"start": start, "end": end, "page": page, "pageSize": PAGE_SIZE}
    )
    req = urllib.request.Request(
        f"{API_URL}?{qs}",
        headers={"x-api-key": key, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status != 200:
                raise RuntimeError(f"HTTP {resp.status} from Tokenomist API")
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(
            f"Tokenomist API HTTP {exc.code} (page {page}): {body}"
        ) from exc
    except Exception as exc:  # noqa: BLE001 - report and fail loudly
        raise RuntimeError(f"Tokenomist API fetch failed (page {page}): {exc}") from exc


def fetch_window(key: str, start: str, end: str) -> list[dict]:
    """Fetch all pages of the upcoming window; raise on any failure."""
    first = fetch_page(key, start, end, 1)
    if not first.get("status"):
        raise RuntimeError(f"Tokenomist API status=false: {str(first)[:300]}")
    rows = list(first.get("data") or [])
    total_pages = int((first.get("metadata") or {}).get("totalPages") or 1)
    for page in range(2, total_pages + 1):
        time.sleep(0.6)  # stay far below the 120 req/min rate limit
        payload = fetch_page(key, start, end, page)
        if not payload.get("status"):
            raise RuntimeError(
                f"Tokenomist API status=false on page {page}: {str(payload)[:300]}"
            )
        rows.extend(payload.get("data") or [])
    return rows


def alloc_label(row: dict) -> str:
    """归属方：allocationBreakdown 的标准归属去重后拼接；没给就空串（页面标未披露）。"""
    names: list[str] = []
    for part in row.get("allocationBreakdown") or []:
        label = ALLOC_LABELS.get(part.get("standardAllocationName") or "") or (
            part.get("allocationName") or ""
        )
        if label and label not in names:
            names.append(label)
    return "、".join(names)


def to_item(row: dict) -> dict | None:
    event = row.get("upcomingEvent") or {}
    cliff = event.get("cliffUnlocks") or {}
    unlock_date = (event.get("unlockDate") or "")[:10]
    symbol = row.get("tokenSymbol") or ""
    if not unlock_date or not symbol:
        return None
    is_mon = (row.get("tokenId") or "") == "monad" or symbol == "MON"
    return {
        "tokenId": row.get("tokenId") or symbol.lower(),
        "symbol": symbol,
        "name": row.get("tokenName") or symbol,
        "date": unlock_date,
        "dateEnd": None,
        "amount": cliff.get("totalCliffAmount"),
        "valueUsd": cliff.get("totalCliffValue"),
        # valueToMarketCap = 解锁额 / 当前市值 %，同一价格下与解锁量 / 流通量等价。
        "pctCirc": cliff.get("valueToMarketCap"),
        "allocations": alloc_label(cliff),
        "type": "cliff",
        "pinned": is_mon,
        "note": MON_NOTE if is_mon else "",
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/unlocks.json")
    args = ap.parse_args()

    key = os.environ.get("TOKENOMIST_API_KEY", "").strip()
    if not key:
        print(
            "ERROR: TOKENOMIST_API_KEY is not set. Get a free-trial key at "
            "tokenomist.ai and add it as the GitHub Actions secret "
            "TOKENOMIST_API_KEY. Keeping existing data/unlocks.json untouched.",
            file=sys.stderr,
        )
        return 2

    today = date.today()
    start = today.isoformat()
    # Free trial: upcoming window is at most 7 days ahead; if the API
    # refuses +7d with 422, retry once with +6d before giving up.
    rows: list[dict] = []
    last_exc: Exception | None = None
    for span in (7, 6):
        end = (today + timedelta(days=span)).isoformat()
        try:
            rows = fetch_window(key, start, end)
            break
        except RuntimeError as exc:
            last_exc = exc
            if "422" not in str(exc):
                break
    if not rows:
        print(
            f"ERROR: no unlock rows fetched ({last_exc}). "
            "Keeping existing data/unlocks.json untouched.",
            file=sys.stderr,
        )
        return 1

    items = [it for it in (to_item(r) for r in rows) if it is not None]
    if not items:
        print(
            "ERROR: API returned rows but none parsed into items. "
            "Keeping existing data/unlocks.json untouched.",
            file=sys.stderr,
        )
        return 1
    items.sort(key=lambda it: (not it["pinned"], it["date"], -(it["valueUsd"] or 0)))

    total_7d = sum(it["valueUsd"] or 0 for it in items)
    payload = {
        "updated": today.isoformat(),
        "source": "tokenomist",
        "sourceLabel": "Tokenomist API（免费试用，未来 7 天）",
        "totals": {
            # upcoming 端点每币只给下一次悬崖解锁，合计即窗口内各币下一次解锁之和。
            "next7dUsd": round(total_7d, 2),
            # 免费档不提供 30 天窗口，如实置空，页面会注明待升级。
            "next30dUsd": None,
        },
        "items": items,
    }
    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = REPO_ROOT / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"fetched {len(items)} upcoming unlocks for {start}..{end}")
    print(f"wrote {out_path} (updated {payload['updated']}, source tokenomist)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
