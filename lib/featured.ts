import { TOOL_MAP, type ToolDef } from "./tools";

// 首页「热门精选」与工具页「同类工具」补位共用的置顶工具（按 slug，顺序即展示顺序）
export const FEATURED_SLUGS: string[] = [
  "pershare",
  "flows-panel",
  "chain-dau-panel",
  "btc-cycle",
];

export const FEATURED_TOOLS: ToolDef[] = FEATURED_SLUGS.map((s) => TOOL_MAP[s]).filter(
  (t): t is ToolDef => Boolean(t)
);
