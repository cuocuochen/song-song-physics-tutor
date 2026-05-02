import { kv } from '@vercel/kv';
import { readFile, writeFile, mkdir, unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { MemoryFile, LearningProfile, LearningLogEntry, ProfileUpdate } from './types';

const MAX_LOGS = 50;
const STUDENTS_SET = 'students';
const DATA_DIR = join(process.cwd(), 'data', 'memory');

function sanitize(name: string): string {
  return name.replace(/[<>:"/\\|?*.\s]+/g, '_').slice(0, 64) || 'unknown';
}

function kvKey(studentId: string): string {
  return `memory:${sanitize(studentId)}`;
}

const EMPTY_PROFILE: LearningProfile = {
  public: { summary: '', strengths: [], totalSessions: 0, lastTopic: '' },
  private: { weaknesses: [], mistakeExamples: [], lastQuestionContext: '' },
  updatedAt: '',
};

function emptyMemory(): MemoryFile {
  return { profile: EMPTY_PROFILE, logs: [], version: 1 };
}

// ---- Detect KV availability ----

let kvAvailable: boolean | null = null;
async function hasKV(): Promise<boolean> {
  if (kvAvailable !== null) return kvAvailable;
  try {
    await kv.get('__ping__');
    kvAvailable = true;
  } catch {
    kvAvailable = false;
  }
  return kvAvailable;
}

// ================ FILESYSTEM FALLBACK ================

function fsPath(studentId: string): string {
  return join(DATA_DIR, `${sanitize(studentId)}.json`);
}

async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function fsGet(studentId: string): Promise<MemoryFile> {
  await ensureDir();
  try {
    const raw = await readFile(fsPath(studentId), 'utf-8');
    return JSON.parse(raw) as MemoryFile;
  } catch {
    return emptyMemory();
  }
}

async function fsSet(studentId: string, data: MemoryFile): Promise<void> {
  await ensureDir();
  await writeFile(fsPath(studentId), JSON.stringify(data, null, 2), 'utf-8');
}

async function fsDel(studentId: string): Promise<void> {
  try { await unlink(fsPath(studentId)); } catch { /* nothing to delete */ }
  try { await unlink(fsPath(studentId) + '.bak'); } catch { /* nothing to delete */ }
}

async function fsList(): Promise<string[]> {
  await ensureDir();
  try {
    const files = await readdir(DATA_DIR);
    return files
      .filter(f => f.endsWith('.json') && !f.endsWith('.bak'))
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

// ================ PUBLIC API ================

export async function getMemory(studentId: string): Promise<MemoryFile> {
  if (await hasKV()) {
    try {
      const data = await kv.get<MemoryFile>(kvKey(studentId));
      if (data && data.profile && data.logs) return data;
    } catch { /* fall through */ }
  }
  return fsGet(studentId);
}

export async function saveMemory(studentId: string, data: MemoryFile): Promise<void> {
  if (await hasKV()) {
    try {
      await kv.set(kvKey(studentId), data);
      await kv.sadd(STUDENTS_SET, sanitize(studentId));
      return;
    } catch { /* fall through */ }
  }
  await fsSet(studentId, data);
}

export async function addLog(
  studentId: string,
  entry: Omit<LearningLogEntry, 'id' | 'createdAt'>,
): Promise<LearningLogEntry> {
  const memory = await getMemory(studentId);
  const log: LearningLogEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  memory.logs.unshift(log);
  if (memory.logs.length > MAX_LOGS) {
    memory.logs = memory.logs.slice(0, MAX_LOGS);
  }
  await saveMemory(studentId, memory);
  return log;
}

export async function deleteLog(studentId: string, logId: string): Promise<void> {
  const memory = await getMemory(studentId);
  memory.logs = memory.logs.filter(l => l.id !== logId);
  await saveMemory(studentId, memory);
}

export async function clearAll(studentId: string): Promise<void> {
  if (await hasKV()) {
    try {
      await kv.del(kvKey(studentId));
      await kv.srem(STUDENTS_SET, sanitize(studentId));
      return;
    } catch { /* fall through */ }
  }
  await fsDel(studentId);
}

export async function updateProfile(
  studentId: string,
  update: ProfileUpdate,
): Promise<LearningProfile> {
  const memory = await getMemory(studentId);
  const p = memory.profile;

  const existingStrengths = new Set(p.public.strengths);
  for (const s of update.strengthsToAdd) existingStrengths.add(s);

  const weakMap = new Map<string, number>();
  for (const w of p.private.weaknesses) weakMap.set(w.topic, w.frequency);
  for (const w of update.weaknessesToMerge) {
    weakMap.set(w.topic, (weakMap.get(w.topic) ?? 0) + 1);
  }

  const mistakes = [...new Set([
    ...p.private.mistakeExamples,
    ...update.weaknessesToMerge.map(w => w.errorExample).filter(Boolean),
  ])].slice(0, 10);

  const updated: LearningProfile = {
    public: {
      summary: update.newPublicSummary || p.public.summary,
      strengths: [...existingStrengths].slice(0, 20),
      totalSessions: p.public.totalSessions + 1,
      lastTopic: update.lastQuestionContext || p.public.lastTopic,
    },
    private: {
      weaknesses: [...weakMap.entries()]
        .map(([topic, frequency]) => ({ topic, frequency }))
        .sort((a, b) => b.frequency - a.frequency),
      mistakeExamples: mistakes,
      lastQuestionContext: update.lastQuestionContext || p.private.lastQuestionContext,
    },
    updatedAt: new Date().toISOString(),
  };

  memory.profile = updated;
  await saveMemory(studentId, memory);
  return updated;
}

export async function listStudents(): Promise<string[]> {
  if (await hasKV()) {
    try {
      const members = await kv.smembers(STUDENTS_SET);
      return members.filter((m): m is string => typeof m === 'string');
    } catch { /* fall through */ }
  }
  return fsList();
}
