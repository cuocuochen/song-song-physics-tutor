'use client';

interface ProblemSelectorProps {
  problems: Array<{ index: number; description: string; confidence: number }>;
  onSelect: (index: number) => void;
  onSelectAll: () => void;
  isLoading: boolean;
}

export function ProblemSelector({ problems, onSelect, onSelectAll, isLoading }: ProblemSelectorProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
      <div>
        <h3 className="font-semibold text-foreground text-lg">检测到 {problems.length} 道物理题</h3>
        <p className="text-sm text-muted mt-1">请选择要解析的题目</p>
      </div>
      <div className="grid gap-3">
        {problems.map((p) => (
          <button
            key={p.index}
            onClick={() => onSelect(p.index)}
            disabled={isLoading}
            className="text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-light/50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                {p.index}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">第{p.index}题</p>
                <p className="text-xs text-muted mt-0.5">{p.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onSelectAll}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl border border-border text-sm text-muted hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
      >
        全部解析（按顺序）
      </button>
    </div>
  );
}
