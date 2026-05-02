import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  studentSaid?: string;
  referenceAnswer?: string;
  diff?: string;
  continuePrompt?: string;
}

export function FeedbackMessage({ studentSaid, referenceAnswer, diff, continuePrompt }: Props) {
  return (
    <div className="rounded-2xl p-5 border border-border bg-surface space-y-4">
      {/* Student answer recap */}
      {studentSaid && (
        <div>
          <p className="text-xs text-muted font-medium mb-1">你的回答</p>
          <div className="bg-gray-800 rounded-lg px-4 py-3">
            <p className="text-sm text-foreground">{studentSaid}</p>
          </div>
        </div>
      )}

      {/* Reference answer */}
      {referenceAnswer && (
        <div>
          <p className="text-xs text-muted font-medium mb-1">参考答案</p>
          <div className="bg-blue-950 rounded-lg px-4 py-3 border border-blue-800">
            <FormulaBlock text={referenceAnswer} />
          </div>
        </div>
      )}

      {/* Diff / teacher's commentary */}
      {diff && (
        <div className="bg-amber-950 rounded-lg px-4 py-3 border border-amber-800">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">💬</span>
            <div>
              <p className="text-xs text-amber-300 font-medium mb-1">老师点评</p>
              <p className="text-sm text-amber-100 leading-relaxed whitespace-pre-wrap">{diff}</p>
            </div>
          </div>
        </div>
      )}

      {/* Continue prompt */}
      {continuePrompt && (
        <p className="text-sm text-muted text-center italic">{continuePrompt}</p>
      )}
    </div>
  );
}
