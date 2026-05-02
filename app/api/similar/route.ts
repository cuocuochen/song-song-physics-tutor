import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/callAI';
import { parseAIResponse } from '@/lib/ai/parseResponse';
import { SIMILAR_PROMPT } from '@/lib/prompts/similar';
import type { SimilarProblemsResult } from '@/lib/types/analysis';

export async function POST(req: Request) {
  try {
    const { knowledgePoints, originalProblem } = await req.json();

    const userMsg = [
      '请根据以下信息生成同类题：',
      '',
      '知识点：' + (Array.isArray(knowledgePoints) ? knowledgePoints.join('、') : (knowledgePoints || '未知')),
      '',
      '原题：' + (originalProblem || '未提供原题'),
    ].join('\n');

    const raw = await callAI(SIMILAR_PROMPT, userMsg, {
      model: 'qwen-turbo',
      temperature: 0.5,
      maxTokens: 2500,
      timeout: 30000,
    });

    const result = parseAIResponse(raw) as Record<string, unknown>;

    const similarResult: SimilarProblemsResult = {
      knowledgeSummary: String(result.knowledgeSummary ?? ''),
      similarProblems: Array.isArray(result.similarProblems)
        ? result.similarProblems.map((p: Record<string, unknown>) => ({
            problem: String(p.problem ?? ''),
            briefAnswer: String(p.briefAnswer ?? ''),
            difficulty: (p.difficulty === 'easy' || p.difficulty === 'medium' || p.difficulty === 'hard'
              ? p.difficulty : 'medium') as 'easy' | 'medium' | 'hard',
            keyHint: String(p.keyHint ?? ''),
          }))
        : [],
    };

    return NextResponse.json(similarResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
