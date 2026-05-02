'use client';

interface WedgeProps {
  tipX: number; tipY: number;
  width: number; height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function Wedge({ tipX, tipY, width, height, fill = '#fef3c7', stroke = '#f59e0b', strokeWidth = 1.8 }: WedgeProps) {
  const leftX = tipX - width / 2;
  const leftY = tipY + height;
  const rightX = tipX + width / 2;
  const rightY = tipY + height;
  return <polygon points={`${leftX},${leftY} ${rightX},${rightY} ${tipX},${tipY}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
