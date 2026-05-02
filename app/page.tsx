'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageShell } from '@/components/Layout/PageShell';
import { NavTabs, type TabKey } from '@/components/Layout/NavTabs';
import { InputArea } from '@/components/page1/InputArea';
import { ProblemSelector } from '@/components/page1/ProblemSelector';
import { AnalysisCard } from '@/components/page1/AnalysisCard';
import { SimilarTab } from '@/components/page2/SimilarTab';
import { LearnTab } from '@/components/page3/LearnTab';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorCard } from '@/components/shared/ErrorCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { AnalysisResult, ProblemDetectResult } from '@/lib/types/analysis';

type Step = 'input' | 'detecting' | 'selecting' | 'analyzing' | 'done' | 'error';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('analyze');
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [detectedProblems, setDetectedProblems] = useState<ProblemDetectResult['problems']>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [inputType, setInputType] = useState<'image' | 'text'>('image');

  // Lazy tab mounting — first-visit trigger, then CSS hidden/shown for zero-lag switching
  const [tabMounted, setTabMounted] = useState<Record<TabKey, boolean>>({
    analyze: true,
    similar: false,
    learn: false,
  });
  const [similarRefreshToken, setSimilarRefreshToken] = useState(0);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    if (!tabMounted[tab]) {
      setTabMounted(prev => ({ ...prev, [tab]: true }));
    }
  }, [tabMounted]);

  // When learn completes, mark similar as needing refresh
  const handleLearnComplete = useCallback(() => {
    setSimilarRefreshToken(t => t + 1);
  }, []);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('physics_analysis');
      if (stored) {
        const data = JSON.parse(stored) as AnalysisResult;
        setAnalysisResult(data);
        setStep('done');
        const img = sessionStorage.getItem('physics_image');
        if (img) {
          setImageBase64(img);
          setInputType('image');
        } else {
          setInputType('text');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Handle image upload
  const handleImageReady = useCallback(async (base64: string) => {
    setImageBase64(base64);
    setInputType('image');
    setStep('detecting');
    setError('');

    try {
      const resp = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: '请求失败' }));
        throw new Error(err.error || '检测失败');
      }
      const data: ProblemDetectResult = await resp.json();
      if (data.count > 1 && data.problems.length > 1) {
        setDetectedProblems(data.problems);
        setStep('selecting');
      } else {
        await runAnalysis('image', base64, undefined);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '检测失败');
      setStep('error');
    }
  }, []);

  const handleTextSubmit = useCallback(async (text: string) => {
    setTextContent(text);
    setInputType('text');
    await runAnalysis('text', text, undefined);
  }, []);

  const handleSelectProblem = useCallback(async (index: number) => {
    await runAnalysis('image', imageBase64, index);
  }, [imageBase64]);

  const handleSelectAll = useCallback(async () => {
    await runAnalysis('image', imageBase64, 1);
  }, [imageBase64]);

  const runAnalysis = useCallback(async (
    type: 'image' | 'text',
    content: string,
    problemIndex?: number,
  ) => {
    setStep('analyzing');
    setError('');
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, problemIndex }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: '分析失败' }));
        throw new Error(err.error || '分析失败');
      }
      const data: AnalysisResult = await resp.json();
      setAnalysisResult(data);
      try {
        sessionStorage.setItem('physics_analysis', JSON.stringify(data));
        sessionStorage.setItem('physics_original', type === 'text' ? content : '');
        if (type === 'image') sessionStorage.setItem('physics_image', content);
      } catch { /* non-critical */ }
      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '分析失败');
      setStep('error');
    }
  }, []);

  const handleGoToSimilar = useCallback(() => setActiveTab('similar'), []);
  const handleGoToLearn = useCallback(() => setActiveTab('learn'), []);

  const handleRetry = useCallback(() => {
    setStep('input');
    setError('');
    setActiveTab('analyze');
  }, []);

  // ===== Tab: Analyze =====
  const renderAnalyze = () => (
    <>
      {step === 'input' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">物理题目解析</h1>
            <p className="text-sm text-muted">上传题目图片或输入文字，获得详细解题分析</p>
          </div>
          <InputArea onImageReady={handleImageReady} onTextSubmit={handleTextSubmit} isLoading={false} />
          <EmptyState />
        </>
      )}
      {step === 'detecting' && <LoadingSpinner step={0} />}
      {step === 'selecting' && (
        <ProblemSelector
          problems={detectedProblems}
          onSelect={handleSelectProblem}
          onSelectAll={handleSelectAll}
          isLoading={false}
        />
      )}
      {step === 'analyzing' && <LoadingSpinner step={1} />}
      {step === 'done' && analysisResult && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">解析结果</h1>
              <p className="text-sm text-muted">{inputType === 'image' ? '图片识别解析' : '文字题目解析'}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              解析新题
            </button>
          </div>
          <AnalysisCard result={analysisResult} onGoToSimilar={handleGoToSimilar} />
        </>
      )}
      {step === 'error' && <ErrorCard message={error} onRetry={handleRetry} />}
    </>
  );

  // ===== Tab: Similar =====
  const renderSimilar = () => {
    if (!analysisResult) {
      return (
        <div className="text-center py-20">
          <p className="text-muted">请先在解题助手页完成题目解析</p>
          <button onClick={() => setActiveTab('analyze')} className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">前往解析</button>
        </div>
      );
    }
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">同类题练习</h1>
          <p className="text-sm text-muted">基于核心知识点生成的变式训练</p>
        </div>
        <SimilarTab result={analysisResult} onGoBack={() => setActiveTab('analyze')} onGoToLearn={handleGoToLearn} refreshToken={similarRefreshToken} />
      </>
    );
  };

  // ===== Tab: Learn =====
  const renderLearn = () => {
    if (!analysisResult) {
      return (
        <div className="text-center py-20">
          <p className="text-muted">请先在解题助手页完成题目解析</p>
          <button onClick={() => setActiveTab('analyze')} className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">前往解析</button>
        </div>
      );
    }
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">你真的学懂了吗？</h1>
          <p className="text-sm text-muted">回答以下问题，检验你的理解</p>
        </div>
        <LearnTab result={analysisResult} onGoBack={() => setActiveTab('analyze')} onGoToSimilar={() => handleTabChange('similar')} onComplete={handleLearnComplete} />
      </>
    );
  };

  return (
    <PageShell>
      {/* NavTabs inside page for direct state control */}
      <div className="flex justify-center mb-6">
        <NavTabs activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className={activeTab === 'analyze' ? '' : 'hidden'}>
        {tabMounted.analyze && renderAnalyze()}
      </div>
      <div className={activeTab === 'similar' ? '' : 'hidden'}>
        {tabMounted.similar && renderSimilar()}
      </div>
      <div className={activeTab === 'learn' ? '' : 'hidden'}>
        {tabMounted.learn && renderLearn()}
      </div>
    </PageShell>
  );
}
