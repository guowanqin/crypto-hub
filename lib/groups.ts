import type { Lang } from "./site";
import { compareTools, toolsByTag, type ToolDef } from "./tools";

// 首页大类（方案一）：21 个细标签归并为 7 个大类。
// 大类只影响首页分组、首页分类筛选与页脚导航；标签本身、全部 /tag/* 页面、
// 工具的 tags 字段一律不变，标签页与 sitemap 照常保留。
export interface GroupDef {
  id: string;
  name: Record<Lang, string>;
  // 成员标签 id，顺序即组内工具的拼接顺序
  tags: string[];
}

export const GROUPS: GroupDef[] = [
  {
    id: "cat-market",
    name: { zh: "行情数据", en: "Market Data" },
    tags: ["market", "btc-bottom"],
  },
  {
    id: "cat-onchain",
    name: { zh: "链上与资金", en: "On-chain & Funds" },
    tags: ["onchain", "defi", "burn", "flows", "chain-dau"],
  },
  {
    id: "cat-us",
    name: { zh: "美股定投", en: "US Stocks & DCA" },
    tags: ["crcl", "qqqi", "qqq"],
  },
  {
    id: "cat-wallet",
    name: { zh: "钱包与安全", en: "Wallets & Security" },
    tags: ["wallet", "security", "ip-check"],
  },
  {
    id: "cat-office",
    name: { zh: "办公效率", en: "Office Tools" },
    tags: ["office", "pdf", "filetime", "ocr"],
  },
  {
    id: "cat-twitter",
    name: { zh: "推特工具", en: "Twitter Tools" },
    tags: ["twitter-tools"],
  },
  {
    id: "cat-life",
    name: { zh: "生活娱乐", en: "Life & Fun" },
    tags: ["video", "slang", "poetry"],
  },
];

export const GROUP_MAP: Record<string, GroupDef> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g])
);

// 反查：细标签 id → 所属大类（首页搜索按大类名命中工具时用）
export const GROUP_BY_TAG: Record<string, GroupDef> = Object.fromEntries(
  GROUPS.flatMap((g) => g.tags.map((tagId) => [tagId, g] as const))
);

// 组内工具：成员标签的工具拼接、按 slug 去重，最后按全站统一排序（compareTools）排定
export function toolsByGroup(group: GroupDef): ToolDef[] {
  const seen = new Set<string>();
  const list: ToolDef[] = [];
  for (const tagId of group.tags) {
    for (const tool of toolsByTag(tagId)) {
      if (!seen.has(tool.slug)) {
        seen.add(tool.slug);
        list.push(tool);
      }
    }
  }
  return list.sort(compareTools);
}
