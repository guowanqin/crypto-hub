import type { Lang } from "./site";

export type { Lang };

export interface HubDict {
  navHome: string;
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  searchResults: string; // {n} {q}
  noResults: string;
  allTags: string;
  toolsCount: string; // {n}
  thirdPartyBadge: string;
  embeddedBadge: string;
  filterBuiltin: string;
  filterThird: string;
  filterEmpty: string;
  viewIntro: string;
  visitTool: string;
  openStandalone: string;
  backHome: string;
  backToTag: string;
  tagPageIntro: string; // 标签页副标题前缀
  audienceTitle: string;
  takeTitle: string;
  detailTitle: string;
  tagsTitle: string;
  disclaimer: string;
  footerNote: string;
  categoriesTitle: string;
  allTagsTitle: string;
  newestTitle: string;
  showAllTools: string; // {n}
  hideTools: string;
  moreTags: string;
  lessTags: string;
  relatedTitle: string;
  guideTitle: string;
  faqTitle: string;
  exploreTitle: string;
}

export const HUB_DICT: Record<Lang, HubDict> = {
  zh: {
    navHome: "首页",
    heroTitle: "18btc 币圈工具导航",
    heroSub: "18btc 替你淘遍币圈好工具：实测、分类、导航——站内工具直接用，第三方工具每个都有原创介绍。",
    searchPlaceholder: "搜索工具：试试「钱包」「行情」「Excel」…",
    searchResults: "找到 {n} 个与「{q}」相关的工具",
    noResults: "没有找到相关工具，换个关键词试试。",
    allTags: "全部",
    toolsCount: "{n} 个工具",
    thirdPartyBadge: "第三方",
    embeddedBadge: "站内可用",
    filterBuiltin: "独立可用",
    filterThird: "第三方",
    filterEmpty: "没有符合筛选的工具，换个组合试试。",
    viewIntro: "查看介绍",
    visitTool: "访问工具",
    openStandalone: "在独立站打开完整版 →",
    backHome: "← 返回首页",
    backToTag: "← 返回「{tag}」",
    tagPageIntro: "分类",
    audienceTitle: "适合谁",
    takeTitle: "实测短评",
    detailTitle: "详细介绍",
    tagsTitle: "所属标签",
    disclaimer: "本站仅做工具收录与介绍，不构成投资建议。第三方工具由其运营方提供，使用前请自行核实官网地址。",
    footerNote: "18btc 币圈工具导航 · 实测收录 · 工具介绍均为原创，数据与功能以各工具官网为准",
    categoriesTitle: "按分类逛",
    allTagsTitle: "全部标签",
    newestTitle: "最新上架",
    showAllTools: "展开全部 {n} 个 ▾",
    hideTools: "收起 ▴",
    moreTags: "更多分类 ▾",
    lessTags: "收起 ▴",
    relatedTitle: "同类工具",
    guideTitle: "选购指南",
    faqTitle: "常见问题",
    exploreTitle: "继续逛逛",
  },
  en: {
    navHome: "Home",
    heroTitle: "18btc Crypto Tools Navigator",
    heroSub: "18btc hunts down the best crypto tools for you — field-tested, categorized, navigable. Built-in tools run right here; every third-party tool gets an original intro.",
    searchPlaceholder: "Search tools: try “wallet”, “market”, “Excel”…",
    searchResults: "{n} tools matching “{q}”",
    noResults: "No tools found — try another keyword.",
    allTags: "All",
    toolsCount: "{n} tools",
    thirdPartyBadge: "Third-party",
    embeddedBadge: "Built-in",
    filterBuiltin: "Built-in",
    filterThird: "Third-party",
    filterEmpty: "No tools match these filters — try another combination.",
    viewIntro: "View intro",
    visitTool: "Visit tool",
    openStandalone: "Open the full standalone version →",
    backHome: "← Back to home",
    backToTag: "← Back to “{tag}”",
    tagPageIntro: "Category",
    audienceTitle: "Who it's for",
    takeTitle: "Our Take",
    detailTitle: "Details",
    tagsTitle: "Tags",
    disclaimer: "This site only catalogs and introduces tools; nothing here is investment advice. Third-party tools are run by their own operators — always verify the official URL before use.",
    footerNote: "18btc Crypto Tools Navigator · Field-tested picks · All intros are original; features and data follow each tool's official site",
    categoriesTitle: "Browse by category",
    allTagsTitle: "All tags",
    newestTitle: "Newest",
    showAllTools: "Show all {n} ▾",
    hideTools: "Show less ▴",
    moreTags: "More categories ▾",
    lessTags: "Show less ▴",
    relatedTitle: "Related tools",
    guideTitle: "Buying Guide",
    faqTitle: "FAQ",
    exploreTitle: "Keep exploring",
  },
  tw: {
    navHome: "首頁",
    heroTitle: "18btc 幣圈工具導航",
    heroSub: "18btc 替你淘遍幣圈好工具：實測、分類、導航——站內工具直接用，第三方工具每個都有原創介紹。",
    searchPlaceholder: "搜尋工具：試試「錢包」「行情」「Excel」…",
    searchResults: "找到 {n} 個與「{q}」相關的工具",
    noResults: "沒有找到相關工具，換個關鍵詞試試。",
    allTags: "全部",
    toolsCount: "{n} 個工具",
    thirdPartyBadge: "第三方",
    embeddedBadge: "站內可用",
    filterBuiltin: "獨立可用",
    filterThird: "第三方",
    filterEmpty: "沒有符合篩選的工具，換個組合試試。",
    viewIntro: "檢視介紹",
    visitTool: "訪問工具",
    openStandalone: "在獨立站開啟完整版 →",
    backHome: "← 返回首頁",
    backToTag: "← 返回「{tag}」",
    tagPageIntro: "分類",
    audienceTitle: "適合誰",
    takeTitle: "實測短評",
    detailTitle: "詳細介紹",
    tagsTitle: "所屬標籤",
    disclaimer: "本站僅做工具收錄與介紹，不構成投資建議。第三方工具由其運營方提供，使用前請自行核實官網地址。",
    footerNote: "18btc 幣圈工具導航 · 實測收錄 · 工具介紹均為原創，資料與功能以各工具官網為準",
    categoriesTitle: "按分類逛",
    allTagsTitle: "全部標籤",
    newestTitle: "最新上架",
    showAllTools: "展開全部 {n} 個 ▾",
    hideTools: "收起 ▴",
    moreTags: "更多分類 ▾",
    lessTags: "收起 ▴",
    relatedTitle: "同類工具",
    guideTitle: "選購指南",
    faqTitle: "常見問題",
    exploreTitle: "繼續逛逛",
  },
};
