'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MemoryData } from '@/lib/types/analysis';

interface Props {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryPanel({ studentId, isOpen, onClose }: Props) {
  const [data, setData] = useState<MemoryData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMemory = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/memory?studentId=${encodeURIComponent(studentId)}`);
      if (resp.ok) setData(await resp.json());
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => {
    if (isOpen) fetchMemory();
  }, [isOpen, fetchMemory]);

  const handleDelete = async (logId: string) => {
    setDeleting(logId);
    try {
      await fetch(`/api/memory?studentId=${encodeURIComponent(studentId)}&logId=${encodeURIComponent(logId)}`, { method: 'DELETE' });
      setData(prev => prev ? { ...prev, logs: prev.logs.filter(l => l.id !== logId) } : null);
    } catch { /* non-critical */ }
    finally { setDeleting(null); }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清除全部学习记录吗？此操作不可恢复。')) return;
    try {
      await fetch(`/api/memory?studentId=${encodeURIComponent(studentId)}&all=true`, { method: 'DELETE' });
      setData(null);
    } catch { /* non-critical */ }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-surface border-l border-border z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">学习记录</h3>
            {data?.profile && (
              <p className="text-xs text-muted mt-0.5">
                {data.profile.totalSessions > 0
                  ? `共 ${data.profile.totalSessions} 次学习`
                  : '暂无记录'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-700 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && (
            <p className="text-sm text-muted text-center py-8">加载中...</p>
          )}

          {!loading && (!data || data.logs.length === 0) && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-sm text-muted">还没有学习记录</p>
              <p className="text-xs text-muted mt-1">完成一次"学懂了吗"后自动生成</p>
            </div>
          )}

          {data?.logs.map(log => (
            <div
              key={log.id}
              className="rounded-xl border border-border bg-gray-800/50 overflow-hidden transition-all"
            >
              {/* Row summary */}
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-muted">
                      {new Date(log.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    {log.knowledgePoints.slice(0, 2).map((kp, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">
                        {kp}
                      </span>
                    ))}
                  </div>
                  {log.keyTakeaway && (
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                      {log.keyTakeaway}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted flex-shrink-0 mt-0.5">
                  {expandedId === log.id ? '▴' : '▾'}
                </span>
              </button>

              {/* Expanded detail */}
              {expandedId === log.id && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  <div>
                    <p className="text-xs text-muted font-medium mb-1">题目预览</p>
                    <p className="text-sm text-foreground/80">{log.problemPreview || '（原题未保存）'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium mb-1">学习总结</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{log.sessionSummary}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deleting === log.id}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    {deleting === log.id ? '删除中...' : '删除此记录'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer: profile summary + clear all */}
        {data && data.logs.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            {/* Public profile summary */}
            {data.profile.summary && (
              <div className="bg-blue-950 rounded-lg px-4 py-3 border border-blue-800">
                <p className="text-xs text-blue-300 font-medium mb-1">学习档案</p>
                <p className="text-sm text-blue-100 leading-relaxed">{data.profile.summary}</p>
                {data.profile.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.profile.strengths.map((s, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-green-900 text-green-300">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleClearAll}
              className="w-full py-2 rounded-lg border border-red-800 text-xs text-red-400 hover:bg-red-950 transition-colors"
            >
              清除全部记录
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
