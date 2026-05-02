interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ title = '解析出错', message, onRetry }: ErrorCardProps) {
  return (
    <div className="rounded-2xl border border-red-800 bg-red-950 p-6 text-center">
      <svg className="w-10 h-10 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-semibold text-red-300 mb-1">{title}</p>
      <p className="text-sm text-red-300 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
}
