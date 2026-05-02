import { NextResponse } from 'next/server';
import { getMemory, deleteLog, clearAll } from '@/lib/storage/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: '缺少 studentId' }, { status: 400 });

    const memory = await getMemory(studentId);
    return NextResponse.json({
      profile: memory.profile.public,
      logs: memory.logs,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : '读取失败' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: '缺少 studentId' }, { status: 400 });

    const all = searchParams.get('all');
    if (all === 'true') {
      await clearAll(studentId);
      return NextResponse.json({ ok: true });
    }

    const logId = searchParams.get('logId');
    if (!logId) return NextResponse.json({ error: '缺少 logId 或 all=true' }, { status: 400 });

    await deleteLog(studentId, logId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : '删除失败' }, { status: 500 });
  }
}
