'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { TextInput } from '@/components/shared/TextInput';
import { motion, AnimatePresence } from 'framer-motion';

interface InputAreaProps {
  onImageReady: (base64: string) => void;
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export function InputArea({ onImageReady, onTextSubmit, isLoading }: InputAreaProps) {
  const [tab, setTab] = useState<'image' | 'text'>('image');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-surface rounded-xl p-1 border border-border w-fit">
        {(['image', 'text'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
          >
            {t === 'image' ? '📷 图片上传' : '✏️ 文字输入'}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'image' ? (
            <ImageUpload onImageReady={onImageReady} isLoading={isLoading} />
          ) : (
            <TextInput onSubmit={onTextSubmit} isLoading={isLoading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
