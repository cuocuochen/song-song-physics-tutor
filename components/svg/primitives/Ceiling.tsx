'use client';

interface CeilingProps {
  x1: number; x2: number; y: number;
  height?: number;
}

export function Ceiling({ x1, x2, y, height = 20 }: CeilingProps) {
  return (
    <>
      <rect x={x1} y={y - height} width={x2 - x1} height={height} fill="url(#hatch)" stroke="#94a3b8" strokeWidth="0.5" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#334155" strokeWidth="2" />
    </>
  );
}
