import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY || '',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
  }
  return client;
}
