import OpenAI from 'openai';
import { getAIClient } from './client';

interface CallAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
}

export async function callAI(
  systemPrompt: string,
  userMessage: string | OpenAI.Chat.Completions.ChatCompletionContentPart[],
  options: CallAIOptions = {}
): Promise<string> {
  const {
    model = 'qwen-turbo',
    temperature = 0.3,
    maxTokens = 3000,
    timeout = 30000,
    retries = 2,
  } = options;

  const client = getAIClient();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await client.chat.completions.create(
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
        },
        { signal: controller.signal }
      );

      clearTimeout(timer);

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('AI returned empty response');
      return content;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('AI call failed');
}
