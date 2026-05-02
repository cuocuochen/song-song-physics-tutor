'use client';
import { SVG_COLORS } from '../ForceColors';

interface AngleArcProps {
  cx: number; cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  label?: string;
  labelDx?: number;
  labelDy?: number;
  sweep?: 0 | 1;
}

export function AngleArc({ cx, cy, radius, startAngle, endAngle, label, labelDx = 0, labelDy = 0, sweep = 0 }: AngleArcProps) {
  const sa = (startAngle * Math.PI) / 180;
  const ea = (endAngle * Math.PI) / 180;
  const sx = cx + radius * Math.cos(sa);
  const sy = cy + radius * Math.sin(sa);
  const ex = cx + radius * Math.cos(ea);
  const ey = cy + radius * Math.sin(ea);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  const ma = (sa + ea) / 2;
  const lx = cx + (radius + 12) * Math.cos(ma) + labelDx;
  const ly = cy + (radius + 12) * Math.sin(ma) + labelDy;

  return (
    <>
      <path d={`M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${ex} ${ey}`} fill="none" stroke={SVG_COLORS.dim} strokeWidth="1.2" />
      {label && <text x={lx} y={ly} fill={SVG_COLORS.dim} fontSize="14">{label}</text>}
    </>
  );
}
