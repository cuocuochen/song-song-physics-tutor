'use client';
import { SVG_COLORS } from '../ForceColors';

interface PulleyProps {
  cx: number; cy: number;
  radius?: number;
}

export function Pulley({ cx, cy, radius = 18 }: PulleyProps) {
  return (
    <>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={SVG_COLORS.body} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill={SVG_COLORS.body} />
      <line x1={cx - radius - 4} y1={cy - radius + 4} x2={cx + radius + 4} y2={cy - radius + 4} stroke={SVG_COLORS.body} strokeWidth="1.5" />
      <line x1={cx} y1={cy - radius + 4} x2={cx} y2={cy - radius - 6} stroke={SVG_COLORS.body} strokeWidth="1.5" />
    </>
  );
}
