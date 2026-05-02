const messages = [
  '正在分析物理过程...',
  '正在识别物理模型...',
  '正在建立方程...',
  '正在绘制受力图...',
];

interface LoadingSpinnerProps {
  step?: number; // 0-based index into messages, or random if omitted
}

export function LoadingSpinner({ step }: LoadingSpinnerProps) {
  const msg = step !== undefined && step < messages.length
    ? messages[step]
    : messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <svg className="w-10 h-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-muted">{msg}</p>
    </div>
  );
}
