'use client';
import { SVG_COLORS } from '../ForceColors';

interface GroundProps {
  x1: number; x2: number; y: number;
  strokeWidth?: number;
}

export function Ground({ x1, x2, y, strokeWidth = 1.5 }: GroundProps) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={SVG_COLORS.body} strokeWidth={strokeWidth} />;
}
