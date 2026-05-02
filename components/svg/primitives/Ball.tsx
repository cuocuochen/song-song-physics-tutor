'use client';
import { SVG_COLORS } from '../ForceColors';

interface BallProps {
  cx: number; cy: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function Ball({ cx, cy, radius, fill = 'none', stroke = SVG_COLORS.body, strokeWidth = 1.5 }: BallProps) {
  return <circle cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
