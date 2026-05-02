'use client';
import { SVG_COLORS } from '../ForceColors';

interface RopeProps {
  x1: number; y1: number;
  x2: number; y2: number;
  strokeWidth?: number;
  color?: string;
}

export function Rope({ x1, y1, x2, y2, strokeWidth = 2.2, color = SVG_COLORS.body }: RopeProps) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth} />;
}
