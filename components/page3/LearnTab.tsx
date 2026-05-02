'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressIndicator } from './ProgressIndicator';
import { ChatBubble } from './ChatBubble';
import { FeedbackMessage } from './FeedbackMessage';
import { ChatInput } from './ChatInput';
import { MemoryPanel } from './MemoryPanel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorCard } from '@/components/shared/ErrorCard';
import type { AnalysisResult, LearnMessage, MemoryData } from '@/lib/types/analysis';

interface Props {
  result: AnalysisResult;
  onGoBack: () => void;
  onGoToSimilar: () => void;
  onComplete?: () => void;
}

interface ChatItem {
  role: 'teacher' | 'student';
  content: string;
}

interface FeedbackData {
  studentSaid?: string;
  referenceAnswer?: string;
  diff?: string;
  continuePrompt?: string;
}

export function LearnTab({ result, onGoBack, onGoToSimilar, onComplete }: Props) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 3 });
  const [state, setState] = useState<'loading' | 'active' | 'feedback' | 'complete' | 'error'>('loading');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);

  // Memory system
  const [studentId, setStudentId] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [learningProfile, setLearningProfile] = useState<MemoryData['profile'] | null>(null);

  // Restore student name from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('physics_student_name');
      if (saved) {
        setNameInput(saved);
        setStudentId(saved);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch memory from server when studentId is set
  const fetchMemory = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const resp = await fetch(`/api/memory?studentId=${encodeURIComponent(id)}`);
      if (resp.ok) {
        const data: MemoryData = await resp.json();
        setLearningProfile(data.profile);
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    if (studentId) fetchMemory(studentId);
  }, [studentId, fetchMemory]);

  const handleSetName = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setStudentId(trimmed);
    try { localStorage.setItem('physics_student_name', trimmed); } catch { /* ignore */ }
  }, [nameInput]);

  // Start learning session (requires studentId first)
  useEffect(() => {
    if (!studentId) return;
    setState('loading');
    setError('');
    setChats([]);
    setFeedback(null);
    setNextQuestion(null);

    const start = async () => {
      try {
        const resp = await fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            context: {
              knowledgePoints: result.coreKnowledgePoints ?? [],
              originalProblem: result.characteristic?.scenarioAndProcess ?? '',
            },
            studentId,
          }),
        });

        if (!resp.ok) {
          const e = await resp.json().catch(() => ({ error: '请求失败' }));
          throw new Error(e.error || '启动学习会话失败');
        }

        const data: LearnMessage = await resp.json();
        setChats([{ role: 'teacher', content: data.content }]);
        setProgress(data.progress ?? { current: 1, total: 3 });
        setState('active');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '启动失败');
        setState('error');
      }
    };
    start();
  }, [result, studentId]); // restart when result or studentId changes

  const handleSubmit = async (answer: string) => {
    setChats(prev => [...prev, { role: 'student', content: answer }]);
    setIsSubmitting(true);

    try {
      const resp = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          context: {
            knowledgePoints: result.coreKnowledgePoints ?? [],
            originalProblem: result.characteristic?.scenarioAndProcess ?? '',
          },
          userAnswer: answer,
          questionIndex: progress.current,
          studentId,
        }),
      });

      if (!resp.ok) throw new Error('提交失败');

      const data: LearnMessage = await resp.json();

      if (data.type === 'feedback' || data.type === 'skip_feedback') {
        setFeedback({
          studentSaid: data.studentSaid,
          referenceAnswer: data.referenceAnswer,
          diff: data.diff ?? data.content,
          continuePrompt: data.continuePrompt,
        });
        setNextQuestion(data.content ?? null);
        if (data.progress) setProgress(data.progress);
        setState('feedback');
      } else if (data.type === 'complete') {
        setChats(prev => [...prev, { role: 'teacher', content: data.content }]);
        if (data.progress) setProgress(data.progress);
        setState('complete');

        // Update local profile from AI-generated profileUpdate
        if (data.profileUpdate) {
          const pu = data.profileUpdate;
          setLearningProfile(prev => ({
            summary: pu.newPublicSummary || prev?.summary || '',
            strengths: [...new Set([...(prev?.strengths ?? []), ...pu.strengthsToAdd])],
            totalSessions: (prev?.totalSessions ?? 0) + 1,
            lastTopic: pu.lastQuestionContext || prev?.lastTopic || '',
          }));
        }

        // Refresh memory from server (picks up the new log)
        if (studentId) fetchMemory(studentId);

        // Notify parent — learning profile updated, similar tab may need refresh
        onComplete?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '提交失败');
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          context: {
            knowledgePoints: result.coreKnowledgePoints ?? [],
            originalProblem: result.characteristic?.scenarioAndProcess ?? '',
          },
          questionIndex: progress.current,
          studentId,
        }),
      });

      if (!resp.ok) throw new Error('请求失败');

      const data: LearnMessage = await resp.json();

      if (data.type === 'skip_feedback') {
        setFeedback({
          studentSaid: '（已跳过）',
          referenceAnswer: data.referenceAnswer,
          diff: data.content,
        });
        setNextQuestion(data.content ?? null);
        if (data.progress) setProgress(data.progress);
        setState('feedback');
      } else if (data.type === 'complete') {
        setChats(prev => [...prev, { role: 'teacher', content: data.content }]);
        if (data.progress) setProgress(data.progress);
        setState('complete');
        if (studentId) fetchMemory(studentId);
        onComplete?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '请求失败');
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (nextQuestion) {
      setChats(prev => [...prev, { role: 'teacher', content: nextQuestion }]);
    }
    setFeedback(null);
    setNextQuestion(null);
    setState('active');
  };

  // Show name input if not yet set
  if (!studentId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-4xl">👋</p>
        <div>
          <h3 className="text-lg font-bold text-foreground text-center mb-1">输入你的名字</h3>
          <p className="text-sm text-muted text-center">学习记录会保存在云端，下次换设备也能找回</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSetName(); }}
            placeholder="你的名字"
            className="w-48 px-4 py-2 rounded-xl bg-gray-800 border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary"
            autoFocus
          />
          <button
            onClick={handleSetName}
            disabled={!nameInput.trim()}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            开始
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') return <LoadingSpinner step={3} />;
  if (state === 'error') return <ErrorCard message={error} />;

  return (
    <div className="space-y-6">
      {/* Top bar: student name + memory button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">👤 {studentId}</span>
          <button
            onClick={() => { setStudentId(''); setNameInput(''); setLearningProfile(null); }}
            className="text-xs text-muted hover:text-red-400 transition-colors"
          >
            (切换)
          </button>
        </div>
        <button
          onClick={() => setMemoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:border-gray-500 transition-all"
        >
          📝 学习记录
        </button>
      </div>

      <ProgressIndicator current={progress.current} total={progress.total} />

      <div className="space-y-4">
        {chats.map((c, i) => (
          <ChatBubble key={i} role={c.role} content={c.content} />
        ))}
      </div>

      {state === 'feedback' && feedback && (
        <div className="space-y-4">
          <FeedbackMessage
            studentSaid={feedback.studentSaid}
            referenceAnswer={feedback.referenceAnswer}
            diff={feedback.diff}
            continuePrompt={feedback.continuePrompt}
          />
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm
              hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            继续
          </button>
        </div>
      )}

      {state === 'complete' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-950 border border-green-800 p-6 text-center">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-green-200 mt-2 mb-1">学习完成！</h3>
            <p className="text-sm text-green-300">
              你已经完成了全部 {progress.total} 道检验题。继续保持！
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onGoBack}
              className="flex-1 py-3 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              返回解析
            </button>
            <button
              onClick={onGoToSimilar}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              再做同类题
            </button>
          </div>
        </div>
      )}

      {state === 'active' && (
        <div className="space-y-3">
          <ChatInput
            onSubmit={handleSubmit}
            disabled={isSubmitting}
            placeholder="输入你的答案，怎么简单怎么来..."
          />
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted
              hover:text-foreground hover:border-gray-500 hover:bg-gray-800/50
              disabled:opacity-40 transition-all active:scale-[0.99]"
          >
            我已掌握，直接看答案 →
          </button>
        </div>
      )}

      {isSubmitting && <LoadingSpinner />}

      <MemoryPanel
        studentId={studentId}
        isOpen={memoryOpen}
        onClose={() => setMemoryOpen(false)}
      />
    </div>
  );
}
