'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  onImageReady: (base64: string) => void;
  isLoading: boolean;
}

export function ImageUpload({ onImageReady, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreview(dataUrl);
      onImageReady(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${isDragOver ? 'border-blue-400 bg-blue-950' : 'border-border hover:border-primary/50 bg-surface'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        className="hidden"
      />
      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt="题目预览" className="max-h-48 mx-auto rounded-lg object-contain" />
          <p className="text-xs text-muted">点击更换图片</p>
        </div>
      ) : (
        <div className="py-8 space-y-2">
          <svg className="w-10 h-10 mx-auto text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-foreground font-medium">拖拽或点击上传题目图片</p>
          <p className="text-xs text-muted">支持 PNG / JPG 格式 · 多题图片将自动拆分</p>
        </div>
      )}
    </div>
  );
}
