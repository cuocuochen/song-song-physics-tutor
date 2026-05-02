'use client';
import { SVG_COLORS } from '../ForceColors';

interface DashedLineProps {
  x1: number; y1: number;
  x2: number; y2: number;
  strokeWidth?: number;
  opacity?: number;
}

export function DashedLine({ x1, y1, x2, y2, strokeWidth = 1.5, opacity = 0.75 }: DashedLineProps) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SVG_COLORS.dim} strokeWidth={strokeWidth} strokeDasharray="5 4" opacity={opacity} />
  );
}
