'use client';
import { FORCE_COLORS, type ForceColor } from '../ForceColors';

interface ForceArrowProps {
  x1: number; y1: number;
  x2: number; y2: number;
  label: string;
  color: ForceColor;
  labelDx?: number;
  labelDy?: number;
  strokeWidth?: number;
}

export function ForceArrow({ x1, y1, x2, y2, label, color, labelDx = 0, labelDy = 0, strokeWidth = 1.8 }: ForceArrowProps) {
  const c = FORCE_COLORS[color];
  const markerId = `ar_${color}`;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const lx = x2 + nx * 12 + labelDx;
  const ly = y2 + ny * 12 + labelDy;

  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={strokeWidth} markerEnd={`url(#${markerId})`} />
      <text x={lx} y={ly} fill={c} fontSize="13" fontWeight="500">{label}</text>
    </>
  );
}
