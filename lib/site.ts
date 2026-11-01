// 站点正式地址：域名确定后填入（例如 "https://example.com"），
// 各页 canonical / og:url 与 sitemap 会随之生效。留空时不输出这些字段。
// 注意：必须显式标注 string 类型，否则字面量类型会让 layout 里的 !== "" 比较报错。
export const SITE_URL: string = "";

export type Lang = "zh" | "en";

export const SITE_NAME: Record<Lang, string> = {
  zh: "币圈工具导航",
  en: "Crypto Tools Navigator",
};

export const MASCOT_NAME: Record<Lang, string> = {
  zh: "金币君",
  en: "Jinbijun",
};

export const SITE_TITLE: Record<Lang, string> = {
  zh: "币圈工具导航｜金币君实测收录的币圈好工具",
  en: "Crypto Tools Navigator | Jinbijun's Field-Tested Crypto Tools",
};

export const SITE_DESCRIPTION: Record<Lang, string> = {
  zh: "金币君替你淘遍币圈好工具：行情数据、链上分析、DeFi 数据、钱包、安全工具与办公效率——自研工具加实测收录的第三方工具，每个工具都有原创介绍、适合人群和实测短评。",
  en: "Jinbijun hunts down the best crypto tools for you: market data, on-chain analytics, DeFi data, wallets, security and office tools — our own tools plus field-tested third-party picks, each with an original intro, who it's for, and a hands-on verdict.",
};
