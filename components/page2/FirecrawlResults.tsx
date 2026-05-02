interface FirecrawlResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface Props {
  results: FirecrawlResult[];
  message?: string;
}

export function FirecrawlResults({ results, message }: Props) {
  if (message && results.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">{message}</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted">以下题目来自动态检索</span>
      </div>
      {results.map((r, i) => (
        <a
          key={i}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-border bg-surface p-4 hover:border-primary/30 hover:shadow-sm transition-all no-underline"
        >
          <p className="text-sm font-medium text-foreground mb-1">{r.title}</p>
          <p className="text-xs text-muted line-clamp-2">{r.snippet}</p>
          <p className="text-xs text-muted/60 mt-1">{r.source}</p>
        </a>
      ))}
    </div>
  );
}
