'use client';
import { SVG_COLORS } from '../ForceColors';

interface BlockProps {
  cx: number; cy: number;
  width: number; height: number;
  angle?: number;
  label?: string;
  fill?: string;
  rx?: number;
}

export function Block({ cx, cy, width, height, angle = 0, label, fill = 'none', rx = 2 }: BlockProps) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${-angle})`}>
      <rect x={-width / 2} y={-height / 2} width={width} height={height} fill={fill} stroke={SVG_COLORS.body} strokeWidth="1.5" rx={rx} />
      {label && <text x="0" y="5" textAnchor="middle" fill={SVG_COLORS.text} fontSize="15">{label}</text>}
    </g>
  );
}
