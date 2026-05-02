import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/callAI';
import { parseAIResponse } from '@/lib/ai/parseResponse';
import { DETECT_PROMPT } from '@/lib/prompts/detect';
import type OpenAI from 'openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 });
    }

    const userMsg: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
    ];

    const raw = await callAI(DETECT_PROMPT, userMsg, {
      model: 'qwen-vl-max', temperature: 0.2, maxTokens: 1000, timeout: 28000, retries: 0,
    });

    const result = parseAIResponse(raw) as Record<string, unknown>;

    const count = typeof result.count === 'number' ? result.count : 1;
    const problems = Array.isArray(result.problems) ? result.problems : [];

    return NextResponse.json({
      count,
      problems: problems.map((p: Record<string, unknown>) => ({
        index: p.index ?? 1,
        description: p.description ?? '未知题目',
        confidence: typeof p.confidence === 'number' ? p.confidence : 0.8,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
