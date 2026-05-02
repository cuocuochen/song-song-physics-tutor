/** Physics force vector color palette (前端展示用) */
export const FORCE_COLORS = {
  gravity: '#ef4444',   // 重力 G — 红色
  normal: '#3b82f6',    // 支持力 N — 蓝色
  friction: '#f97316',  // 摩擦力 f — 橙色
  tension: '#22c55e',   // 拉力 T — 绿色
} as const;

export type ForceColor = keyof typeof FORCE_COLORS;

/** Neutral SVG colors (dark theme) */
export const SVG_COLORS = {
  body: '#cbd5e1',      // 物体轮廓
  text: '#e2e8f0',      // 标签文字
  dim: '#64748b',        // 辅助线/虚线
  surface: '#334155',    // 地面/天花板填充
  accent: '#60a5fa',     // 滑轮/节点高亮
} as const;

export type SvgColor = keyof typeof SVG_COLORS;
