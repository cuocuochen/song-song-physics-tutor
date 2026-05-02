import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/callAI';
import { parseAIResponse } from '@/lib/ai/parseResponse';
import { ANALYZE_PROMPT } from '@/lib/prompts/analyze';
import type { AnalysisResult } from '@/lib/types/analysis';
import type OpenAI from 'openai';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { type, content, problemIndex } = await req.json();

    if (!type || !content) {
      return NextResponse.json({ error: '缺少题目数据' }, { status: 400 });
    }

    const model = type === 'image' ? 'qwen-vl-max' : 'qwen-turbo';

    const userMsg: string | OpenAI.Chat.Completions.ChatCompletionContentPart[] = type === 'image'
      ? [
          { type: 'text', text: problemIndex !== undefined ? `请解析图片中第${problemIndex}道物理题。` : '请解析图片中的物理题。' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${content}` } },
        ]
      : content as string;

    const raw = await callAI(ANALYZE_PROMPT, userMsg, {
      model,
      temperature: 0.3,
      maxTokens: 3000,
      timeout: 28000,
      retries: 0,
    });

    const r = parseAIResponse(raw) as Record<string, unknown>;
    const ch = (r.characteristic ?? {}) as Record<string, unknown>;
    const ap = (r.approach ?? {}) as Record<string, unknown>;
    const s1 = ((r.solution as Record<string, unknown> ?? {}).step1 ?? {}) as Record<string, unknown>;
    const s2 = ((r.solution as Record<string, unknown> ?? {}).step2 ?? {}) as Record<string, unknown>;
    const s3 = ((r.solution as Record<string, unknown> ?? {}).step3 ?? {}) as Record<string, unknown>;

    const analysis: AnalysisResult = {
      characteristic: {
        scenarioAndProcess: String(ch.scenarioAndProcess ?? ''),
        modelAndConditions: String(ch.modelAndConditions ?? ''),
      },
      approach: {
        readingAndModeling: String(ap.readingAndModeling ?? ''),
        physicsConcepts: String(ap.physicsConcepts ?? ''),
        generalSteps: Array.isArray(ap.generalSteps) ? ap.generalSteps.map(String) : [],
      },
      solution: {
        step1: {
          description: String(s1.description ?? ''),
          diagramSpec: s1.diagramSpec as AnalysisResult['solution']['step1']['diagramSpec'],
        },
        step2: {
          description: String(s2.description ?? ''),
          equations: Array.isArray(s2.equations) ? s2.equations.map(String) : [],
        },
        step3: {
          description: String(s3.description ?? ''),
          finalAnswer: String(s3.finalAnswer ?? ''),
        },
      },
      coreKnowledgePoints: Array.isArray(r.coreKnowledgePoints) ? r.coreKnowledgePoints.map(String) : [],
    };

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
