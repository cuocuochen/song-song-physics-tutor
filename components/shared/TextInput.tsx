'use client';

import { useState } from 'react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function TextInput({ onSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSubmit(text.trim());
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入物理题目描述，例如：&#10;如图所示，质量为 m 的物块放在倾角为 θ 的斜面上，物块与斜面间的动摩擦因数为 μ，求物块沿斜面下滑的加速度。"
        rows={5}
        className="w-full border border-border rounded-xl p-4 text-sm resize-none bg-surface text-foreground placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !text.trim()}
        className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm transition-all
          hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            正在分析物理过程...
          </span>
        ) : (
          '开始解析'
        )}
      </button>
    </div>
  );
}
