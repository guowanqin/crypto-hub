"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  LikongAssetId,
  LikongBand,
  LikongPayload,
} from "@/lib/likong";
import { LIKONG_ASSETS, LIKONG_GROUP_MAP } from "@/lib/likong-config";
import { type Lang } from "@/lib/site";
import { useLang } from "./LangProvider";

const DICT_ZH = {
  "loading": "正在计算利空出尽指数…",
  "loadError": "数据暂时拉取失败，请稍后刷新重试。",
  "dataPending": "数据积累中：基线天数不足，指数暂不可用。",
  "kicker": "逆向情绪 · 新闻喊声热度",
  "indexLabel": "利空出尽指数",
  "asOf": "截至 {d}",
  "bandCalm": "平静",
  "bandWarming": "升温",
  "bandClimax": "高潮区",
  "bandLineCalm": "喊声还不高，离恐慌极值还远。",
  "bandLineWarming": "喊声正在升温，开始接近情绪极值区。",
  "bandLineClimax": "喊声已进入高潮区——历史上这种位置常靠近阶段底部，但假信号也出在这里，最终以下方事件表为准。",
  "deltaUp": "近 7 天又升了 {v} 点",
  "deltaDown": "近 7 天回落了 {v} 点",
  "deltaFlat": "近 7 天基本没动",
  "topPart": "当前喊得最响的是「{g}」（子指数 {v}）",
  "eventPart": "最近一次高潮峰值出现在 {d}",
  "secChart": "02 · 指数与价格走势",
  "chartNote": "金色面积为指数（0–100），红色带为高潮区（>70）。叠加的价格线按样本期内的高低点归一化到同一画面，只看形状、不比数值；圆点为高潮事件峰值日。",
  "assetNone": "不叠加",
  "climaxZone": "高潮区 >70",
  "warmZone": "升温区 40–70",
  "secGroups": "03 · 分词组热度",
  "groupsIntro": "每个词各有一条同算法单独计算的 0–100 子指数，看高潮到底是哪个词带起来的；合成权重：主词条 3，扩展词 2 / 1，绝望组 1。",
  "kindMain": "主词条",
  "kindExt": "扩展词",
  "kindDespair": "绝望组",
  "rawNow": "最新一日提及占比 {v}",
  "subNow": "子指数",
  "secEvents": "04 · 历史高潮事件",
  "eventsIntro": "一轮高潮（指数上穿 70 到回落到 70 以下）只取一个峰值，峰值相距不到 10 天的合并。下表列出样本期内全部事件，附各标的峰值日后 7 天 / 30 天的实际收盘涨跌；未到期或缺数据的格子留空，不进下方统计分母。",
  "colDate": "峰值日期",
  "colPeak": "峰值",
  "colAsset": "标的",
  "colMatured": "已满 30 天事件",
  "colUpShare30": "+30 天上涨占比",
  "colAvg30": "+30 天平均",
  "colAvg7": "+7 天平均",
  "noEvents": "样本期内暂无高潮事件。",
  "statsTitle": "事件后表现汇总（全部事件，不挑样本）",
  "priceErrorNote": "部分标的价格暂时拉取失败，对应涨跌留空。",
  "secCaliber": "05 · 口径说明",
  "caliber": [
    "数据来源：GDELT 全球新闻数据库（DOC 2.0）的提及量强度序列（timelinevol）——每个词组每天的报道量占 GDELT 全部监测新闻量的百分比。词组共 6 个：利空出尽（主词条）、利空落地、坏消息出尽、该跌不跌、割肉离场、爆仓潮。数据由同步脚本经本站服务端定期取回入库，本页展示的覆盖区间与生成时间见图上标注。",
    "这是新闻口径，不是社交媒体全量。微博、雪球没有开放的关键词计数接口；X（推特）的全量搜索需要付费 API，本版未接入。所以这个指数反映的是「媒体喊声」的热度，不是全网讨论量；日后有可靠的社交采样数据，会单独标注「社交采样（估算）」展示，绝不与新闻口径混算。",
    "算法：每组词先算当日提及占比相对过去 90 天基线的偏离（z 分数，基线不足 30 天不出值），按权重加权合成（利空出尽 3、利空落地与坏消息出尽 2、该跌不跌与绝望组 1），再映射为样本期内的分位值 0–100 并做 3 日平滑。低于 40 为平静，40–70 为升温，高于 70 为高潮。注意分位映射的性质：高潮区标记的是样本期内相对喊得最响的一批日子，不是某个绝对阈值。",
    "事件与收益口径：一轮高潮只取一个峰值日；收益按峰值日收盘价（当日非交易日取其后第一个交易日收盘）与 +7 / +30 个自然日后首个交易日收盘价之比计算。价格来源：BTC、ETH 为 Binance 日线，标普 500、纳斯达克综合为 Yahoo Finance 日线，均只用已收盘日线；统计未计交易成本与滑点。",
    "怎么看（实话）：阴跌里「利空出尽」会被反复喊，喊一次不一定就是底。这个工具的价值是把喊声量化，再和之后的真实涨跌摆在一起看——样本期约两年、单一数据源，结论只配当参考，不配当买卖依据。本页只做公开数据的统计与展示，不构成投资建议。",
  ],
  "socialTitle": "社交采样（估算）",
  "sourceLine": "数据来源：GDELT（新闻提及）· Binance / Yahoo Finance（价格）· 数据文件生成于 {t}",
  "secVerdict": "01 · 一眼看懂",
  "stop": "。",
};
type LikDict = typeof DICT_ZH;

const DICT: Record<Lang, LikDict> = {
  zh: DICT_ZH,
  tw: {
    "loading": "正在計算利空出盡指數…",
    "loadError": "資料暫時拉取失敗，請稍後重新整理重試。",
    "dataPending": "資料累積中：基線天數不足，指數暫不可用。",
    "kicker": "逆向情緒 · 新聞喊聲熱度",
    "indexLabel": "利空出盡指數",
    "asOf": "截至 {d}",
    "bandCalm": "平靜",
    "bandWarming": "升溫",
    "bandClimax": "高潮區",
    "bandLineCalm": "喊聲還不高，離恐慌極值還遠。",
    "bandLineWarming": "喊聲正在升溫，開始接近情緒極值區。",
    "bandLineClimax": "喊聲已進入高潮區——歷史上這種位置常靠近階段底部，但假訊號也出在這裡，最終以下方事件表為準。",
    "deltaUp": "近 7 天又升了 {v} 點",
    "deltaDown": "近 7 天回落了 {v} 點",
    "deltaFlat": "近 7 天基本沒動",
    "topPart": "目前喊得最響的是「{g}」（子指數 {v}）",
    "eventPart": "最近一次高潮峰值出現在 {d}",
    "secChart": "02 · 指數與價格走勢",
    "chartNote": "金色面積為指數（0–100），紅色帶為高潮區（>70）。疊加的價格線按樣本期內的高低點歸一化到同一畫面，只看形狀、不比數值；圓點為高潮事件峰值日。",
    "assetNone": "不疊加",
    "climaxZone": "高潮區 >70",
    "warmZone": "升溫區 40–70",
    "secGroups": "03 · 分詞組熱度",
    "groupsIntro": "每個詞各有一條同演算法單獨計算的 0–100 子指數，看高潮到底是哪個詞帶起來的；合成權重：主詞條 3，擴展詞 2 / 1，絕望組 1。",
    "kindMain": "主詞條",
    "kindExt": "擴展詞",
    "kindDespair": "絕望組",
    "rawNow": "最新一日提及佔比 {v}",
    "subNow": "子指數",
    "secEvents": "04 · 歷史高潮事件",
    "eventsIntro": "一輪高潮（指數上穿 70 到回落到 70 以下）只取一個峰值，峰值相距不到 10 天的合併。下表列出樣本期內全部事件，附各標的峰值日後 7 天 / 30 天的實際收盤漲跌；未到期或缺資料的格子留空，不進下方統計分母。",
    "colDate": "峰值日期",
    "colPeak": "峰值",
    "colAsset": "標的",
    "colMatured": "已滿 30 天事件",
    "colUpShare30": "+30 天上漲佔比",
    "colAvg30": "+30 天平均",
    "colAvg7": "+7 天平均",
    "noEvents": "樣本期內暫無高潮事件。",
    "statsTitle": "事件後表現彙總（全部事件，不挑樣本）",
    "priceErrorNote": "部分標的價格暫時拉取失敗，對應漲跌留空。",
    "secCaliber": "05 · 口徑說明",
    "caliber": [
      "資料來源：GDELT 全球新聞資料庫（DOC 2.0）的提及量強度序列（timelinevol）——每個詞組每天的報導量佔 GDELT 全部監測新聞量的百分比。詞組共 6 個：利空出盡（主詞條）、利空落地、壞消息出盡、該跌不跌、割肉離場、爆倉潮。資料由同步腳本經本站伺服器端定期取回入庫，本頁展示的覆蓋區間與生成時間見圖上標註。",
      "這是新聞口徑，不是社交媒體全量。微博、雪球沒有開放的關鍵詞計數介面；X（推特）的全量搜尋需要付費 API，本版未接入。所以這個指數反映的是「媒體喊聲」的熱度，不是全網討論量；日後有可靠的社交採樣資料，會單獨標註「社交採樣（估算）」展示，絕不與新聞口徑混算。",
      "演算法：每組詞先算當日提及佔比相對過去 90 天基線的偏離（z 分數，基線不足 30 天不出值），按權重加權合成（利空出盡 3、利空落地與壞消息出盡 2、該跌不跌與絕望組 1），再映射為樣本期內分位值 0–100 並做 3 日平滑。低於 40 為平靜，40–70 為升溫，高於 70 為高潮。注意分位映射的性質：高潮區標記的是樣本期內相對喊得最響的一批日子，不是某個絕對閾值。",
      "事件與收益口徑：一輪高潮只取一個峰值日；收益按峰值日收盤價（當日非交易日取其後第一個交易日收盤）與 +7 / +30 個自然日後首個交易日收盤價之比計算。價格來源：BTC、ETH 為 Binance 日線，標普 500、納斯達克綜合為 Yahoo Finance 日線，均只用已收盤日線；統計未計交易成本與滑點。",
      "怎麼看（實話）：陰跌裡「利空出盡」會被反覆喊，喊一次不一定就是底。這個工具的價值是把喊聲量化，再和之後的真實漲跌擺在一起看——樣本期約兩年、單一資料來源，結論只配當參考，不配當買賣依據。本頁只做公開資料的統計與展示，不構成投資建議。",
    ],
    "socialTitle": "社交採樣（估算）",
    "sourceLine": "資料來源：GDELT（新聞提及）· Binance / Yahoo Finance（價格）· 資料檔案生成於 {t}",
    "secVerdict": "01 · 一眼看懂",
  "stop": "。",
  },
  en: {
    "loading": "Computing the bad-news-exhaustion index…",
    "loadError": "Data failed to load — please refresh and try again.",
    "dataPending": "Still warming up: not enough baseline days, the index is not available yet.",
    "kicker": "Contrarian sentiment · News-volume heat",
    "indexLabel": "Bad-News Exhaustion Index",
    "asOf": "As of {d}",
    "bandCalm": "Calm",
    "bandWarming": "Warming",
    "bandClimax": "Climax zone",
    "bandLineCalm": "The chorus is still quiet — nowhere near a panic extreme.",
    "bandLineWarming": "The chorus is warming up, approaching the emotional-extreme zone.",
    "bandLineClimax": "The chorus has hit the climax zone — historically such spots often sit near a stage bottom, but false signals live here too; the event table below has the final say.",
    "deltaUp": "Up {v} pts over the last 7 days",
    "deltaDown": "Down {v} pts over the last 7 days",
    "deltaFlat": "Roughly flat over the last 7 days",
    "topPart": "Loudest right now: “{g}” (sub-index {v})",
    "eventPart": "The latest climax peaked on {d}",
    "secChart": "02 · Index & Price Overlay",
    "chartNote": "The gold area is the index (0–100); the red band is the climax zone (>70). An overlaid price line is min-max normalised over the sample window onto the same canvas — compare shapes, not values. Dots mark climax-event peak days.",
    "assetNone": "No overlay",
    "climaxZone": "Climax >70",
    "warmZone": "Warming 40–70",
    "secGroups": "03 · Heat by Phrase Group",
    "groupsIntro": "Each phrase gets its own 0–100 sub-index from the same algorithm, so you can see which phrase is driving a climax. Composite weights: main phrase 3, extensions 2 / 1, despair group 1.",
    "kindMain": "Main phrase",
    "kindExt": "Extension",
    "kindDespair": "Despair group",
    "rawNow": "Latest daily mention share {v}",
    "subNow": "Sub-index",
    "secEvents": "04 · Historical Climax Events",
    "eventsIntro": "One excursion of the index above 70 counts once, at its peak; peaks less than 10 days apart are merged. The table lists every event in the sample, with each asset's actual close-to-close change 7 and 30 days after the peak. Cells that have not matured or lack data stay blank and are excluded from the statistics below.",
    "colDate": "Peak date",
    "colPeak": "Peak",
    "colAsset": "Asset",
    "colMatured": "Events matured 30d",
    "colUpShare30": "+30d up share",
    "colAvg30": "+30d average",
    "colAvg7": "+7d average",
    "noEvents": "No climax events in the sample yet.",
    "statsTitle": "Post-event performance (all events, no cherry-picking)",
    "priceErrorNote": "Some asset prices failed to load; their return cells are blank.",
    "secCaliber": "05 · Methodology & Caveats",
    "caliber": [
      "Source: the GDELT global news database (DOC 2.0) volume-intensity series (timelinevol) — each phrase group's daily share of all news volume GDELT monitors, in percent. Six groups: the main phrase “bad news exhausted”, plus “bad news landed”, “all bad news out”, “won't fall when it should”, “cut losses and leave” and “liquidation wave”. A sync script fetches the data through this site's server on a schedule and stores it in the repo; the coverage window and generation time are shown with the chart.",
      "This is a news caliber, not full social-media coverage. Weibo and Xueqiu offer no open keyword-count API, and full X (Twitter) search needs a paid API, which this version does not use. The index therefore measures how loudly the media repeats these phrases — not total internet discussion. If a reliable social sample is ever added, it will be shown separately, labelled “social sample (estimate)”, and never blended into the news caliber.",
      "Method: for each group, the day's mention share is scored against its trailing 90-day baseline (a z-score; no value until 30 baseline days exist), the groups are combined by weight (main phrase 3; “landed” and “all out” 2; the rest 1), mapped to a 0–100 percentile over the sample and smoothed over 3 days. Below 40 is calm, 40–70 warming, above 70 climax. Note what a percentile means: the climax zone marks the relatively loudest days inside the sample, not an absolute threshold.",
      "Events and returns: each excursion contributes one peak day. Returns compare the close on the peak day (or the next trading day if it was not one) with the close on the first trading day at or after +7 / +30 calendar days. Prices: Binance daily candles for BTC and ETH, Yahoo Finance daily charts for the S&P 500 and Nasdaq Composite, closed candles only. Statistics exclude trading costs and slippage.",
      "How to read it, honestly: in a grinding downtrend people shout “the bad news is exhausted” again and again, and any single shout can be wrong. The point of this tool is to quantify the shouting and line it up with what prices actually did next — roughly two years of sample from a single source, fit for reference, not for buy/sell decisions. This page only compiles and presents public data; it is not investment advice.",
    ],
    "socialTitle": "Social sample (estimate)",
    "sourceLine": "Sources: GDELT (news mentions) · Binance / Yahoo Finance (prices) · Data file generated {t}",
    "secVerdict": "01 · At a Glance",
  "stop": ".",
  },
};

/* ---------------- 小工具 ---------------- */

function fmtRet(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(1)}%`;
}

function fmtRawShare(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v.toFixed(4)}%`;
}

function bandClass(band: LikongBand): string {
  return band === "climax"
    ? "lik-chip lik-chip-climax"
    : band === "warming"
      ? "lik-chip lik-chip-warming"
      : "lik-chip lik-chip-calm";
}

/* ---------------- 主图（指数面积 + 价格叠加） ---------------- */

const CW = 720;
const CH = 280;
const PAD = { l: 36, r: 10, t: 10, b: 22 };

function MainChart({
  payload,
  asset,
  d,
}: {
  payload: LikongPayload;
  asset: LikongAssetId | null;
  d: LikDict;
}) {
  const { points, pricePath, ticks, eventDots } = useMemo(() => {
    const series = payload.series;
    const firstIdx = series.findIndex((p) => p.value != null);
    const pts = firstIdx >= 0 ? series.slice(firstIdx) : [];
    const iw = CW - PAD.l - PAD.r;
    const ih = CH - PAD.t - PAD.b;
    const x = (i: number) => PAD.l + (pts.length <= 1 ? 0 : (i / (pts.length - 1)) * iw);
    const y = (v: number) => PAD.t + ih - (v / 100) * ih;

    let path = "";
    let area = "";
    let started = false;
    pts.forEach((p, i) => {
      if (p.value == null) {
        started = false;
        return;
      }
      const cmd = started ? "L" : "M";
      path += `${cmd}${x(i).toFixed(1)},${y(p.value).toFixed(1)} `;
      started = true;
    });
    if (path) {
      const lastI = pts.length - 1;
      area = `${path}L${x(lastI).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
    }

    // 价格叠加：样本窗口内高低点归一化到 0–100 画布，缺日按上一收盘前递
    let price = "";
    if (asset && pts.length > 1) {
      const closes = payload.prices[asset] ?? [];
      const byDate = new Map(closes.map((c) => [c.date, c.close]));
      const inWindow = closes.filter(
        (c) => c.date >= pts[0].date && c.date <= pts[pts.length - 1].date,
      );
      if (inWindow.length > 1) {
        const lo = Math.min(...inWindow.map((c) => c.close));
        const hi = Math.max(...inWindow.map((c) => c.close));
        const span = hi - lo || 1;
        let last: number | null = null;
        let pStarted = false;
        pts.forEach((p, i) => {
          const close = byDate.get(p.date);
          if (close != null) last = close;
          if (last == null) return;
          const nv = ((last - lo) / span) * 100;
          price += `${pStarted ? "L" : "M"}${x(i).toFixed(1)},${y(nv).toFixed(1)} `;
          pStarted = true;
        });
      }
    }

    const tickIdx = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) =>
      Math.min(pts.length - 1, Math.round(f * (pts.length - 1))),
    );
    const ticks = [...new Set(tickIdx)].map((i) => ({
      x: x(i),
      label: pts[i] ? pts[i].date.slice(0, 7) : "",
    }));
    const dateIdx = new Map(pts.map((p, i) => [p.date, i]));
    const dots = payload.events
      .map((e) => {
        const i = dateIdx.get(e.date);
        if (i == null) return null;
        return { x: x(i), y: y(e.peak), date: e.date };
      })
      .filter((v): v is { x: number; y: number; date: string } => v != null);
    return { points: { path, area, y }, pricePath: price, ticks, eventDots: dots };
  }, [payload, asset]);

  const { y } = points;
  return (
    <svg
      className="lik-chart"
      viewBox={`0 0 ${CW} ${CH}`}
      role="img"
      aria-label={d["indexLabel"]}
    >
      {/* 区间带 */}
      <rect x={PAD.l} y={y(100)} width={CW - PAD.l - PAD.r} height={y(70) - y(100)} fill="rgba(217,45,32,0.055)" />
      <rect x={PAD.l} y={y(70)} width={CW - PAD.l - PAD.r} height={y(40) - y(70)} fill="rgba(184,145,43,0.055)" />
      {/* 网格与刻度 */}
      {[0, 40, 70, 100].map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={CW - PAD.r} y1={y(v)} y2={y(v)} stroke="#E7DCC3" strokeWidth={v === 70 ? 1.2 : 0.7} strokeDasharray={v === 70 ? "5 4" : undefined} />
          <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#8A7B5C">
            {v}
          </text>
        </g>
      ))}
      <text x={CW - PAD.r} y={y(100) + 12} textAnchor="end" fontSize={10.5} fill="#C0392B">
        {d["climaxZone"]}
      </text>
      <text x={CW - PAD.r} y={y(70) + 14} textAnchor="end" fontSize={10.5} fill="#97791F">
        {d["warmZone"]}
      </text>
      {/* 指数面积与线 */}
      {points.area && <path d={points.area} fill="rgba(184,145,43,0.20)" />}
      {points.path && <path d={points.path} fill="none" stroke="#B8912B" strokeWidth={1.8} />}
      {/* 价格叠加线 */}
      {pricePath && <path d={pricePath} fill="none" stroke="#5B7A99" strokeWidth={1.6} />}
      {/* 事件峰值点 */}
      {eventDots.map((dot) => (
        <circle key={dot.date} cx={dot.x} cy={dot.y} r={3.2} fill="#C0392B" stroke="#FFFDF8" strokeWidth={1.2}>
          <title>{dot.date}</title>
        </circle>
      ))}
      {/* X 轴 */}
      {ticks.map((t, i) => (
        <text key={i} x={t.x} y={CH - 6} textAnchor="middle" fontSize={10.5} fill="#8A7B5C">
          {t.label}
        </text>
      ))}
      <line x1={PAD.l} x2={CW - PAD.r} y1={y(0)} y2={y(0)} stroke="#D9CCA6" strokeWidth={0.8} />
    </svg>
  );
}

/* ---------------- 子指数 sparkline ---------------- */

function Spark({ values }: { values: number[] }) {
  const { line, area } = useMemo(() => {
    if (values.length < 2) return { line: "", area: "" };
    const w = 260;
    const h = 36;
    const max = Math.max(...values, 0);
    const span = max > 0 ? max : 1;
    const px = (i: number) => (i / (values.length - 1)) * w;
    const py = (v: number) => h - 3 - (v / span) * (h - 6);
    let line = "";
    values.forEach((v, i) => {
      line += `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)} `;
    });
    return { line, area: `${line}L${w},${h} L0,${h} Z` };
  }, [values]);
  return (
    <svg className="lik-spark" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden>
      {area && <path d={area} fill="rgba(184,145,43,0.16)" />}
      {line && <path d={line} fill="none" stroke="#B8912B" strokeWidth={1.4} />}
    </svg>
  );
}

/* ---------------- 看板本体 ---------------- */

export default function LikongBoard() {
  const { lang } = useLang();
  const d = DICT[lang];
  const [payload, setPayload] = useState<LikongPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [asset, setAsset] = useState<LikongAssetId | null>("BTC");

  useEffect(() => {
    let alive = true;
    fetch("/api/likong")
      .then((r) => r.json())
      .then((j: LikongPayload) => {
        if (!alive) return;
        if (j && !j.error) setPayload(j);
        else setFailed(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <section className="card">
        <p className="lik-error">{d["loadError"]}</p>
      </section>
    );
  }
  if (!payload) {
    return (
      <section className="card">
        <p className="lik-loading">{d["loading"]}</p>
      </section>
    );
  }

  const cur = payload.current;
  const topGroup = cur?.topGroupId ? LIKONG_GROUP_MAP[cur.topGroupId] : null;
  const topState = cur?.topGroupId
    ? payload.groups.find((g) => g.id === cur.topGroupId)
    : null;

  const verdictParts: string[] = [];
  if (cur) {
    verdictParts.push(
      cur.band === "climax"
        ? d["bandLineClimax"]
        : cur.band === "warming"
          ? d["bandLineWarming"]
          : d["bandLineCalm"],
    );
    if (cur.delta7 != null) {
      verdictParts.push(
        Math.abs(cur.delta7) < 1
          ? d["deltaFlat"] + d["stop"]
          : cur.delta7 > 0
            ? d["deltaUp"].replace("{v}", String(cur.delta7)) + d["stop"]
            : d["deltaDown"].replace("{v}", String(Math.abs(cur.delta7))) + d["stop"],
      );
    }
    if (topGroup && topState?.value != null) {
      verdictParts.push(
        d["topPart"]
          .replace("{g}", topGroup.label[lang])
          .replace("{v}", String(topState?.value ?? "")) + d["stop"],
      );
    }
    if (cur.recentEventDate) {
      verdictParts.push(
        d["eventPart"].replace("{d}", cur.recentEventDate) + d["stop"],
      );
    }
  }

  const hasPriceError = Object.keys(payload.errors).length > 0;

  return (
    <>
      {/* 01 结论 */}
      <section className="card lik-hero">
        <div className="lik-hero-head">
          <span className="lik-kicker">{d["kicker"]}</span>
          <span className="lik-sec">{d["secVerdict"]}</span>
        </div>
        {cur ? (
          <>
            <div className="lik-hero-main">
              <div className="lik-hero-value">
                <span className="lik-hero-num">{cur.value.toFixed(1)}</span>
                <span className={bandClass(cur.band)}>
                  {cur.band === "climax"
                    ? d["bandClimax"]
                    : cur.band === "warming"
                      ? d["bandWarming"]
                      : d["bandCalm"]}
                </span>
              </div>
              <p className="lik-hero-sub">
                {d["indexLabel"]} · {d["asOf"].replace("{d}", cur.date)}
                {payload.coverage
                  ? ` · ${payload.coverage.start} ~ ${payload.coverage.end}`
                  : ""}
              </p>
            </div>
            <p className="lik-verdict">{verdictParts.join(lang === "en" ? " " : "")}</p>
          </>
        ) : (
          <p className="lik-verdict">{d["dataPending"]}</p>
        )}
      </section>

      {/* 02 主图 */}
      <section className="card lik-chart-card">
        <h2 className="lik-h2">{d["secChart"]}</h2>
        <div className="lik-asset-chips">
          <button
            type="button"
            className={`lik-chip-btn${asset == null ? " lik-chip-btn-on" : ""}`}
            onClick={() => setAsset(null)}
          >
            {d["assetNone"]}
          </button>
          {LIKONG_ASSETS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`lik-chip-btn${asset === a.id ? " lik-chip-btn-on" : ""}`}
              onClick={() => setAsset(a.id)}
            >
              {a.label[lang]}
            </button>
          ))}
        </div>
        <MainChart payload={payload} asset={asset} d={d} />
        <p className="lik-note">{d["chartNote"]}</p>
      </section>

      {/* 03 子指数 */}
      <section className="card">
        <h2 className="lik-h2">{d["secGroups"]}</h2>
        <p className="lik-note" style={{ marginTop: 0 }}>
          {d["groupsIntro"]}
        </p>
        <div className="lik-group-grid">
          {payload.groups.map((g) => {
            const def = LIKONG_GROUP_MAP[g.id];
            if (!def) return null;
            return (
              <div key={g.id} className="lik-group-card">
                <div className="lik-group-head">
                  <span className="lik-group-name">{def.label[lang]}</span>
                  <span className="lik-kind">
                    {g.kind === "main"
                      ? d["kindMain"]
                      : g.kind === "ext"
                        ? d["kindExt"]
                        : d["kindDespair"]}
                  </span>
                </div>
                <div className="lik-group-value">
                  <span className="lik-group-num">
                    {g.value != null ? g.value.toFixed(1) : "—"}
                  </span>
                  <span className="lik-group-unit">{d["subNow"]}</span>
                </div>
                <Spark values={g.spark.map((p) => p.value)} />
                <p className="lik-group-raw">
                  {d["rawNow"].replace("{v}", fmtRawShare(g.rawNow))}
                  {g.rawDate ? ` · ${g.rawDate}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 事件表 */}
      <section className="card">
        <h2 className="lik-h2">{d["secEvents"]}</h2>
        <p className="lik-note" style={{ marginTop: 0 }}>
          {d["eventsIntro"]}
        </p>
        {payload.events.length === 0 ? (
          <p className="lik-note">{d["noEvents"]}</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="lik-table">
                <thead>
                  <tr>
                    <th>{d["colDate"]}</th>
                    <th>{d["colPeak"]}</th>
                    {LIKONG_ASSETS.map((a) => (
                      <th key={a.id} colSpan={2}>
                        {a.short[lang]}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th />
                    <th />
                    {LIKONG_ASSETS.flatMap((a) => [
                      <th key={`${a.id}7`}>+7d</th>,
                      <th key={`${a.id}30`}>+30d</th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {payload.events.map((e) => (
                    <tr key={e.date}>
                      <td className="lik-td-date">{e.date}</td>
                      <td>{e.peak.toFixed(1)}</td>
                      {LIKONG_ASSETS.flatMap((a) => {
                        const r = e.returns[a.id];
                        return [
                          <td key={`${a.id}7`} className={r.d7 == null ? "" : r.d7 >= 0 ? "lik-pos" : "lik-neg"}>
                            {fmtRet(r.d7)}
                          </td>,
                          <td key={`${a.id}30`} className={r.d30 == null ? "" : r.d30 >= 0 ? "lik-pos" : "lik-neg"}>
                            {fmtRet(r.d30)}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="lik-h3">{d["statsTitle"]}</h3>
            <div className="table-wrap">
              <table className="lik-table">
                <thead>
                  <tr>
                    <th>{d["colAsset"]}</th>
                    <th>{d["colMatured"]}</th>
                    <th>{d["colUpShare30"]}</th>
                    <th>{d["colAvg30"]}</th>
                    <th>{d["colAvg7"]}</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.stats.map((s) => {
                    const def = LIKONG_ASSETS.find((a) => a.id === s.asset)!;
                    return (
                      <tr key={s.asset}>
                        <td className="lik-td-date">{def.label[lang]}</td>
                        <td>
                          {s.matured30} / {s.events}
                        </td>
                        <td>{s.upShare30 != null ? `${s.upShare30.toFixed(1)}%` : "—"}</td>
                        <td className={s.avg30 == null ? "" : s.avg30 >= 0 ? "lik-pos" : "lik-neg"}>
                          {fmtRet(s.avg30)}
                        </td>
                        <td className={s.avg7 == null ? "" : s.avg7 >= 0 ? "lik-pos" : "lik-neg"}>
                          {fmtRet(s.avg7)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hasPriceError && <p className="lik-note">{d["priceErrorNote"]}</p>}
          </>
        )}
      </section>

      {/* 社交采样（有数据才渲染） */}
      {payload.socialSample.length > 0 && (
        <section className="card">
          <h2 className="lik-h2">{d["socialTitle"]}</h2>
          <pre className="lik-social-raw">
            {JSON.stringify(payload.socialSample, null, 2)}
          </pre>
        </section>
      )}

      {/* 05 口径 */}
      <section className="card">
        <h2 className="lik-h2">{d["secCaliber"]}</h2>
        {d["caliber"].map((p, i) => (
          <p key={i} className="body-text">
            {p}
          </p>
        ))}
        {payload.dataGeneratedAt && (
          <p className="lik-note">
            {d["sourceLine"].replace(
              "{t}",
              payload.dataGeneratedAt.slice(0, 10),
            )}
          </p>
        )}
      </section>
    </>
  );
}
