'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, placeholder = '输入你的答案...' }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="flex gap-2 pt-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-surface text-foreground placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow
          disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="px-5 py-3 rounded-xl bg-primary text-white font-medium text-sm
          hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-[0.98] transition-all"
      >
        发送
      </button>
    </div>
  );
}
