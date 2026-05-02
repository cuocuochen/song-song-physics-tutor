'use client';
import { SVG_COLORS } from '../ForceColors';

interface SpringProps {
  x1: number; y1: number;
  x2: number; y2: number;
  coils: number;
  strokeWidth?: number;
  color?: string;
}

export function Spring({ x1, y1, x2, y2, coils, strokeWidth = 1.8, color = SVG_COLORS.body }: SpringProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const seg = len / (coils * 2 + 2);
  let pts = `${x1},${y1}`;
  for (let i = 0; i < coils * 2; i++) {
    const t = (i + 1) / (coils * 2 + 1);
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const off = i % 2 === 0 ? seg : -seg;
    const perpX = (-dy / len) * off;
    const perpY = (dx / len) * off;
    pts += ` ${(px + perpX).toFixed(1)},${(py + perpY).toFixed(1)}`;
  }
  pts += ` ${x2},${y2}`;
  return <polyline points={pts} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />;
}
