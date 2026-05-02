interface Props {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted font-medium">{current}/{total}</span>
    </div>
  );
}
