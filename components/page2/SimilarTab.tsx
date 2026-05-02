'use client';

import { useState, useEffect } from 'react';
import { KnowledgeSummary } from './KnowledgeSummary';
import { SimilarProblemCard } from './SimilarProblemCard';
import { FirecrawlResults } from './FirecrawlResults';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorCard } from '@/components/shared/ErrorCard';
import type { AnalysisResult, SimilarProblemsResult } from '@/lib/types/analysis';

interface Props {
  result: AnalysisResult;
  onGoBack: () => void;
  onGoToLearn: () => void;
  refreshToken?: number;
}

export function SimilarTab({ result, onGoBack, onGoToLearn, refreshToken }: Props) {
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [similarResult, setSimilarResult] = useState<SimilarProblemsResult | null>(null);
  const [firecrawlResults, setFirecrawlResults] = useState<Array<{ title: string; snippet: string; url: string; source: string }>>([]);
  const [firecrawlMsg, setFirecrawlMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSimilar = async () => {
      setState('loading');
      setError('');
      try {
        const resp = await fetch('/api/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledgePoints: result.coreKnowledgePoints ?? [],
            originalProblem: result.characteristic?.scenarioAndProcess ?? '',
          }),
        });

        if (!resp.ok) {
          const e = await resp.json().catch(() => ({ error: '请求失败' }));
          throw new Error(e.error || '生成失败');
        }

        const data: SimilarProblemsResult = await resp.json();
        setSimilarResult(data);
        setState('done');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '生成失败');
        setState('error');
      }
    };

    fetchSimilar();
  }, [result, refreshToken]);

  const handleSearch = async () => {
    const kp = result.coreKnowledgePoints.join(',');
    if (!kp) return;
    setIsSearching(true);
    try {
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: kp }),
      });
      const data = await resp.json();
      setFirecrawlResults(data.results ?? []);
      setFirecrawlMsg(data.message ?? '');
    } catch {
      setFirecrawlMsg('搜索服务不可用');
    } finally {
      setIsSearching(false);
    }
  };

  if (state === 'loading') return <LoadingSpinner step={2} />;
  if (state === 'error') return <ErrorCard message={error} />;

  return (
    <div className="space-y-6">
      {similarResult && (
        <>
          <KnowledgeSummary text={similarResult.knowledgeSummary} />

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">同类题（3道）</h3>
            {similarResult.similarProblems.map((p, i) => (
              <SimilarProblemCard
                key={i}
                index={i + 1}
                problem={p.problem}
                briefAnswer={p.briefAnswer}
                difficulty={p.difficulty}
                keyHint={p.keyHint}
              />
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              {isSearching ? '检索中...' : '搜索更多同类真题'}
            </button>
            <FirecrawlResults results={firecrawlResults} message={firecrawlMsg} />
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onGoBack}
          className="px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors"
        >
          ← 返回解析
        </button>
        <button
          onClick={onGoToLearn}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          检验学习效果 →
        </button>
      </div>
    </div>
  );
}
