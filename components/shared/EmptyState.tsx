export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg className="w-16 h-16 text-muted/50 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <p className="text-muted text-sm">上传题目图片或输入文字描述，开始物理分析</p>
      <p className="text-muted/60 text-xs mt-1">支持斜面、滑轮、弹簧、摩擦力等各种力学场景</p>
    </div>
  );
}
