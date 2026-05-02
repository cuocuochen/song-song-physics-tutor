import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/callAI';
import { parseAIResponse } from '@/lib/ai/parseResponse';
import { normalizeStudentInput } from '@/lib/ai/normalize';
import { LEARN_PROMPT } from '@/lib/prompts/learn';
import { addLog, updateProfile, getMemory } from '@/lib/storage/store';
import type { LearnMessage } from '@/lib/types/analysis';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { action, context, userAnswer, questionIndex, studentId } = await req.json();

    // Normalize student input: u→μ, theta→θ, ^2→², etc.
    const normalizedAnswer = userAnswer ? normalizeStudentInput(String(userAnswer)) : '';

    const lines = [
      `action: ${action}`,
      '',
      '题目分析上下文：',
      `知识点：${Array.isArray(context?.knowledgePoints) ? context.knowledgePoints.join('、') : '未知'}`,
      `原题：${context?.originalProblem || '未提供'}`,
    ];

    // Fetch learning profile from server store for personalized teaching
    if (studentId) {
      const memory = await getMemory(studentId);
      const p = memory.profile;
      if (p.public.totalSessions > 0) {
        lines.push('');
        lines.push('学生学习画像：');
        lines.push(`公开画像摘要：${p.public.summary || '暂无'}`);
        lines.push(`强项知识点：${p.public.strengths?.join('、') || '暂无'}`);
        lines.push(`累计学习次数：${p.public.totalSessions || 0}`);
        const weakList = p.private.weaknesses
          ?.map(w => `${w.topic}(出错${w.frequency}次)`)
          .join('、');
        lines.push(`薄弱知识点：${weakList || '暂无'}`);
        lines.push(`错误例子：${p.private.mistakeExamples?.join('、') || '暂无'}`);
        if (p.private.lastQuestionContext) {
          lines.push(`上次对话语境：${p.private.lastQuestionContext}`);
        }
      }
    }

    if (normalizedAnswer) {
      lines.push('');
      lines.push(`学生回答（已标准化符号）：${normalizedAnswer}`);
      lines.push(`学生原始输入：${userAnswer}`);
    }

    if (questionIndex !== undefined) {
      lines.push(`当前第${questionIndex}题`);
    }

    const userMsg = lines.join('\n');

    const raw = await callAI(LEARN_PROMPT, userMsg, {
      model: 'qwen-turbo',
      temperature: 0.5,
      maxTokens: 1500,
      timeout: 25000,
    });

    const r = parseAIResponse(raw) as Record<string, unknown>;

    const message: LearnMessage = {
      type: (r.type as LearnMessage['type']) ?? 'question',
      content: String(r.content ?? ''),
      questionScope: r.questionScope ? String(r.questionScope) : undefined,
      referenceAnswer: r.referenceAnswer ? String(r.referenceAnswer) : undefined,
      studentSaid: r.studentSaid ? String(r.studentSaid) : undefined,
      diff: r.diff ? String(r.diff) : undefined,
      continuePrompt: r.continuePrompt ? String(r.continuePrompt) : undefined,
      progress: r.progress ? {
        current: Number((r.progress as Record<string, number>).current ?? 1),
        total: Number((r.progress as Record<string, number>).total ?? 3),
      } : undefined,
      keyTakeaway: r.keyTakeaway ? String(r.keyTakeaway) : undefined,
      profileUpdate: r.profileUpdate ? {
        strengthsToAdd: Array.isArray((r.profileUpdate as Record<string, unknown>).strengthsToAdd)
          ? ((r.profileUpdate as Record<string, unknown>).strengthsToAdd as string[])
          : [],
        weaknessesToMerge: Array.isArray((r.profileUpdate as Record<string, unknown>).weaknessesToMerge)
          ? ((r.profileUpdate as Record<string, unknown>).weaknessesToMerge as Array<{ topic: string; errorExample: string }>)
          : [],
        newPublicSummary: String((r.profileUpdate as Record<string, unknown>).newPublicSummary ?? ''),
        newPrivateSummary: String((r.profileUpdate as Record<string, unknown>).newPrivateSummary ?? ''),
        lastQuestionContext: String((r.profileUpdate as Record<string, unknown>).lastQuestionContext ?? ''),
      } : undefined,
    };

    // Persist: when complete, update profile and add log entry
    if (message.type === 'complete' && studentId) {
      const problemPreview = String(context?.originalProblem ?? '').slice(0, 50);
      const knowledgePoints = Array.isArray(context?.knowledgePoints)
        ? context.knowledgePoints.slice(0, 5)
        : [];

      // Persist log entry (fire-and-forget)
      addLog(studentId, {
        problemPreview,
        knowledgePoints,
        totalQuestions: message.progress?.total ?? 3,
        sessionSummary: message.content,
        keyTakeaway: message.keyTakeaway ?? '',
        publicSnapshot: message.profileUpdate?.newPublicSummary ?? '',
      }).catch(() => { /* non-critical */ });

      // Update profile (fire-and-forget)
      if (message.profileUpdate) {
        updateProfile(studentId, message.profileUpdate).catch(() => { /* non-critical */ });
      }
    }

    return NextResponse.json(message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
