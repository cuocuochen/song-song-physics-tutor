import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        results: [],
        message: 'Firecrawl API key 未配置。以下是本地生成的同类题。',
      });
    }

    const resp = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${query} 高中物理 题目`,
        limit: 5,
      }),
    });

    if (!resp.ok) {
      return NextResponse.json({ results: [], message: '搜索服务不可用' });
    }

    const data = await resp.json();

    const results = Array.isArray(data?.data)
      ? data.data.slice(0, 3).map((item: Record<string, unknown>) => ({
          title: item.title ?? '',
          snippet: item.snippet ?? item.description ?? '',
          url: item.url ?? '',
          source: item.source ?? 'web',
        }))
      : [];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], message: '搜索失败' });
  }
}
