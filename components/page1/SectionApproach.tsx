import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  readingAndModeling: string;
  physicsConcepts: string;
  generalSteps: string[];
}

export function SectionApproach({ readingAndModeling, physicsConcepts, generalSteps }: Props) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">解题思路</h3>
      <div className="space-y-3">
        <div className="bg-green-950 rounded-xl p-4 border border-green-800">
          <p className="text-xs font-semibold text-green-300 mb-1">审题与建模</p>
          <FormulaBlock text={readingAndModeling} />
        </div>
        <div className="bg-purple-950 rounded-xl p-4 border border-purple-800">
          <p className="text-xs font-semibold text-purple-300 mb-1">物理观念与规律</p>
          <FormulaBlock text={physicsConcepts} />
        </div>
        {generalSteps.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs font-semibold text-gray-300 mb-2">通用解题步骤</p>
            <ol className="list-decimal list-inside space-y-1">
              {generalSteps.map((s, i) => (
                <li key={i} className="text-sm text-foreground">{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
