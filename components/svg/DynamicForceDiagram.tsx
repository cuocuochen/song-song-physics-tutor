'use client';
import { ForceArrow } from './primitives/ForceArrow';
import { Block } from './primitives/Block';
import { Ball } from './primitives/Ball';
import { Ground } from './primitives/Ground';
import { Ceiling } from './primitives/Ceiling';
import { Wedge } from './primitives/Wedge';
import { Rope } from './primitives/Rope';
import { Pulley } from './primitives/Pulley';
import { Spring } from './primitives/Spring';
import { DashedLine } from './primitives/DashedLine';
import { AngleArc } from './primitives/AngleArc';
import { Point } from './primitives/Point';
import { FORCE_COLORS } from './ForceColors';
import type { DiagramSpec, ForceSpec } from '@/lib/types/analysis';

const DEFAULT_WIDTH = 680;
const DEFAULT_HEIGHT = 440;

/** Compute force arrow coordinates from a force spec */
function resolveForcePos(
  force: ForceSpec,
  objects: DiagramSpec['objects']
): { x1: number; y1: number; x2: number; y2: number } {
  // If explicit coordinates given, use them
  if (force.x1 !== undefined && force.y1 !== undefined && force.x2 !== undefined && force.y2 !== undefined) {
    return { x1: force.x1, y1: force.y1, x2: force.x2, y2: force.y2 };
  }

  // Find the main object center
  let cx = DEFAULT_WIDTH / 2;
  let cy = DEFAULT_HEIGHT / 2;
  const mainObj = objects.find(o => o.type === 'block' || o.type === 'ball');
  if (mainObj) {
    cx = mainObj.cx ?? DEFAULT_WIDTH / 2;
    cy = mainObj.cy ?? DEFAULT_HEIGHT / 2;
  }

  const len = 50;

  // Resolve from anchor point
  if (force.from) {
    if (force.from === 'block_center' || force.from === 'object_center') {
      cx = cx; cy = cy;
    }
  }

  // Direction-based
  if (force.direction) {
    let dx = 0, dy = 0;
    switch (force.direction) {
      case 'down': dy = len; break;
      case 'up': dy = -len; break;
      case 'left': dx = -len; break;
      case 'right': dx = len; break;
      case 'up_slope': {
        // Assume slope angle from a wedge object
        const wedge = objects.find(o => o.type === 'wedge');
        const angle = wedge?.angle ?? 30;
        const rad = (angle * Math.PI) / 180;
        dx = -len * Math.cos(rad);
        dy = -len * Math.sin(rad);
        break;
      }
      case 'down_slope': {
        const wedge = objects.find(o => o.type === 'wedge');
        const angle = wedge?.angle ?? 30;
        const rad = (angle * Math.PI) / 180;
        dx = len * Math.cos(rad);
        dy = len * Math.sin(rad);
        break;
      }
      case 'normal_up': dy = -len; dx = 0; break;
      case 'normal_down': dy = len; dx = 0; break;
    }
    return { x1: cx, y1: cy, x2: cx + dx, y2: cy + dy };
  }

  // Explicit angle
  if (force.angle !== undefined) {
    const rad = (force.angle * Math.PI) / 180;
    return { x1: cx, y1: cy, x2: cx + len * Math.cos(rad), y2: cy + len * Math.sin(rad) };
  }

  // Default: straight down from center
  return { x1: cx, y1: cy, x2: cx, y2: cy + len };
}

export function DynamicForceDiagram({ spec }: { spec: DiagramSpec }) {
  const vw = spec.viewBox?.width ?? DEFAULT_WIDTH;
  const vh = spec.viewBox?.height ?? DEFAULT_HEIGHT;

  if (!spec.objects || spec.objects.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface p-8 text-center" style={{ maxWidth: vw }}>
        <p className="text-sm text-muted">受力图规格数据为空</p>
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} width="100%" style={{ maxWidth: vw }} xmlns="http://www.w3.org/2000/svg" className="rounded-xl" fill="none">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7">
          <path d="M0,7 L7,0" stroke="#94a3b8" strokeWidth="0.6" opacity="0.5" />
        </pattern>
        {Object.entries(FORCE_COLORS).map(([k, c]) => (
          <marker key={k} id={`ar_${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
          </marker>
        ))}
      </defs>

      {/* Render objects */}
      {spec.objects.map((obj, i) => {
        switch (obj.type) {
          case 'ground':
            return <Ground key={i} x1={obj.x1 ?? 60} x2={obj.x2 ?? vw - 60} y={obj.y ?? vh - 60} />;
          case 'ceiling':
            return <Ceiling key={i} x1={obj.x1 ?? 60} x2={obj.x2 ?? vw - 60} y={obj.y ?? 60} />;
          case 'block':
            return (
              <Block
                key={i}
                cx={obj.cx ?? vw / 2}
                cy={obj.cy ?? vh / 2}
                width={obj.width ?? 64}
                height={obj.height ?? 36}
                angle={obj.angle ?? 0}
                label={obj.label}
                fill={obj.fill}
              />
            );
          case 'ball':
            return <Ball key={i} cx={obj.cx ?? vw / 2} cy={obj.cy ?? vh / 2} radius={obj.radius ?? 20} fill={obj.fill} />;
          case 'wedge':
            return (
              <Wedge
                key={i}
                tipX={obj.tipX ?? vw / 2}
                tipY={obj.tipY ?? 80}
                width={obj.width ?? 200}
                height={obj.height ?? 300}
                fill={obj.fill}
              />
            );
          case 'rope':
            return <Rope key={i} x1={obj.x1 ?? 0} y1={obj.y1 ?? 0} x2={obj.x2 ?? vw / 2} y2={obj.y2 ?? vh / 2} color={obj.color} />;
          case 'pulley':
            return <Pulley key={i} cx={obj.cx ?? vw / 2} cy={obj.cy ?? 100} radius={obj.radius ?? 18} />;
          case 'spring':
            return <Spring key={i} x1={obj.x1 ?? 0} y1={obj.y1 ?? 0} x2={obj.x2 ?? vw / 2} y2={obj.y2 ?? vh / 2} coils={obj.coils ?? 8} color={obj.color} />;
          default:
            return null;
        }
      })}

      {/* Render forces */}
      {spec.forces.map((f, i) => {
        const pos = resolveForcePos(f, spec.objects);
        return (
          <ForceArrow
            key={`f-${i}`}
            x1={pos.x1} y1={pos.y1}
            x2={pos.x2} y2={pos.y2}
            label={f.magnitude ? `${f.label}=${f.magnitude}` : f.label}
            color={f.color}
          />
        );
      })}

      {/* Render angle marks */}
      {spec.angle_marks?.map((a, i) => (
        <AngleArc
          key={`a-${i}`}
          cx={a.cx} cy={a.cy}
          radius={a.radius}
          startAngle={a.startAngle}
          endAngle={a.endAngle}
          label={a.label}
          sweep={a.sweep}
        />
      ))}

      {/* Render labels */}
      {spec.labels?.map((l, i) => (
        <text key={`l-${i}`} x={l.x} y={l.y} fill="#334155" fontSize={l.fontSize ?? 14} fontWeight="500">{l.text}</text>
      ))}

      {/* Render dashed lines for construction */}
      {spec.objects.filter(o => o.type === 'ground' || o.type === 'ceiling').map((obj, i) => {
        if (obj.type === 'ground') {
          const wedge = spec.objects.find(o => o.type === 'wedge');
          if (wedge?.tipX !== undefined && wedge?.tipY !== undefined) {
            return <DashedLine key={`dl-${i}`} x1={wedge.tipX} y1={wedge.tipY} x2={wedge.tipX} y2={obj.y ?? vh - 60} />;
          }
        }
        return null;
      })}
    </svg>
  );
}
