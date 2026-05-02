'use client';
import { SVG_COLORS } from '../ForceColors';

interface PointProps {
  x: number; y: number;
  radius?: number;
  label?: string;
  labelDx?: number;
  labelDy?: number;
  fill?: string;
}

export function Point({ x, y, radius = 4, label, labelDx = 8, labelDy = 5, fill = SVG_COLORS.body }: PointProps) {
  return (
    <>
      <circle cx={x} cy={y} r={radius} fill={fill} />
      {label && <text x={x + labelDx} y={y + labelDy} fill={SVG_COLORS.text} fontSize="15" fontWeight="600">{label}</text>}
    </>
  );
}
