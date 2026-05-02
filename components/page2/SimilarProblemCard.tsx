import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  index: number;
  problem: string;
  briefAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keyHint: string;
}

const difficultyConfig = {
  easy: { label: '基础', bg: 'bg-green-950', text: 'text-green-300' },
  medium: { label: '中等', bg: 'bg-amber-950', text: 'text-amber-300' },
  hard: { label: '提高', bg: 'bg-red-950', text: 'text-red-300' },
};

export function SimilarProblemCard({ index, problem, briefAnswer, difficulty, keyHint }: Props) {
  const dc = difficultyConfig[difficulty];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${dc.bg} ${dc.text}`}>
          {dc.label}
        </span>
      </div>

      <div>
        <p className="text-xs text-muted font-medium mb-1">题目</p>
        <FormulaBlock text={problem} />
      </div>

      <div>
        <p className="text-xs text-muted font-medium mb-1">提示</p>
        <p className="text-sm text-amber-300 bg-amber-950 rounded-lg px-3 py-2">{keyHint}</p>
      </div>

      <details className="group">
        <summary className="text-sm text-primary font-medium cursor-pointer hover:underline">
          查看解答
        </summary>
        <div className="mt-2 p-3 bg-gray-800 rounded-lg">
          <FormulaBlock text={briefAnswer} />
        </div>
      </details>
    </div>
  );
}
