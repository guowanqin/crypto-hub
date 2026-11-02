import { GROUP_BY_TAG } from "./groups";
import { getTool } from "./tools";

// 全站视觉插画映射（素材方案见 crypto-hub-launch/visual-assets/plan.md）：
// L1 大类主图 7 张是全站视觉锚点——首页大类区块头用原图小方图，
// 标签页 / 工具页页头用同一张图的横版裁切（CSS object-fit: cover + 下方 position 定焦），
// 新工具按其首个标签自动归图，零新增素材成本。PNG 母版存仓库外，站内只用 WebP。
export interface GroupImage {
  src: string;
  /** 横版裁切时的纵向焦点（object-position 的 Y 值），按各图构图逐张定 */
  position: string;
}

export const GROUP_IMAGES: Record<string, GroupImage> = {
  // 行情数据：吉祥物居左、K 线居右，焦点取中下部（脸 + K 线中段）
  "cat-market": { src: "/visual/group-market.webp", position: "55%" },
  // 链上与资金：节点链斜贯画面，焦点取中部（节点 + 小币流）
  "cat-onchain": { src: "/visual/group-onchain.webp", position: "58%" },
  // 美股定投：焦点取阶梯中段 + 吉祥物脸，顺带避开底部小短腿
  "cat-us": { src: "/visual/group-us-stocks.webp", position: "52%" },
  // 钱包与安全：焦点取脸 + 盾牌上沿
  "cat-wallet": { src: "/visual/group-wallet.webp", position: "55%" },
  // 办公效率：焦点取文档 + 齿轮中部
  "cat-office": { src: "/visual/group-office.webp", position: "50%" },
  // 推特工具：焦点取小鸟 + 气泡一带
  "cat-twitter": { src: "/visual/group-twitter.webp", position: "45%" },
  // 生活娱乐：吉祥物居中，焦点取正中（脸 + 卷轴/播放键）
  "cat-life": { src: "/visual/group-life.webp", position: "50%" },
};

/** 首页 Hero 横版主视觉 */
export const HERO_IMAGE = "/visual/hero-main.webp";
/** 举牌吉祥物：空状态 / 404 引导图（牌面无字，文案一律 HTML 呈现） */
export const SIGN_IMAGE = "/visual/mascot-sign.webp";

/** 细标签 id → 所属大类主图 */
export function groupImageForTag(tagId: string): GroupImage | undefined {
  const group = GROUP_BY_TAG[tagId];
  return group ? GROUP_IMAGES[group.id] : undefined;
}

/** 工具 slug → 按其标签顺序取第一张能命中的大类主图 */
export function groupImageForToolSlug(slug: string): GroupImage | undefined {
  const tool = getTool(slug);
  if (!tool) return undefined;
  for (const tagId of tool.tags) {
    const img = groupImageForTag(tagId);
    if (img) return img;
  }
  return undefined;
}
