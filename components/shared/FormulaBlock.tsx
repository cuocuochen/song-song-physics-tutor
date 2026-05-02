'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface FormulaBlockProps {
  text: string; // May contain $...$ (inline) and $$...$$ (block) LaTeX
}

export function FormulaBlock({ text }: FormulaBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    renderMath(ref.current, text);
  }, [text]);

  return <div ref={ref} className="formula-content text-sm leading-relaxed" />;
}

export function renderMath(container: HTMLElement, text: string) {
  // Split on $$...$$ first, then on $...$
  const parts: Array<{ type: 'text' | 'block' | 'inline'; content: string }> = [];
  let remaining = text;

  while (remaining.length > 0) {
    const blockIdx = remaining.indexOf('$$');
    if (blockIdx !== -1) {
      if (blockIdx > 0) parts.push({ type: 'text', content: remaining.slice(0, blockIdx) });
      remaining = remaining.slice(blockIdx + 2);
      const endIdx = remaining.indexOf('$$');
      if (endIdx !== -1) {
        parts.push({ type: 'block', content: remaining.slice(0, endIdx) });
        remaining = remaining.slice(endIdx + 2);
      } else {
        // Unclosed $$, treat as text
        parts.push({ type: 'text', content: '$$' + remaining });
        remaining = '';
      }
    } else {
      parts.push({ type: 'text', content: remaining });
      remaining = '';
    }
  }

  // Second pass: split text parts on $...$
  const finalParts: Array<{ type: 'text' | 'block' | 'inline'; content: string }> = [];
  for (const part of parts) {
    if (part.type !== 'text') {
      finalParts.push(part);
      continue;
    }
    let t = part.content;
    while (t.length > 0) {
      const inlineIdx = t.indexOf('$');
      if (inlineIdx !== -1) {
        if (inlineIdx > 0) finalParts.push({ type: 'text', content: t.slice(0, inlineIdx) });
        t = t.slice(inlineIdx + 1);
        const endIdx = t.indexOf('$');
        if (endIdx !== -1) {
          finalParts.push({ type: 'inline', content: t.slice(0, endIdx) });
          t = t.slice(endIdx + 1);
        } else {
          finalParts.push({ type: 'text', content: '$' + t });
          t = '';
        }
      } else {
        finalParts.push({ type: 'text', content: t });
        t = '';
      }
    }
  }

  // Render to DOM
  container.innerHTML = '';
  for (const fp of finalParts) {
    if (fp.type === 'text') {
      container.appendChild(document.createTextNode(fp.content));
    } else {
      const span = document.createElement('span');
      span.className = fp.type === 'block' ? 'block my-2 text-center' : 'inline';
      try {
        katex.render(fp.content, span, {
          throwOnError: false,
          displayMode: fp.type === 'block',
        });
      } catch {
        span.textContent = fp.content;
      }
      container.appendChild(span);
    }
  }
}
