import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  scenarioAndProcess: string;
  modelAndConditions: string;
}

export function SectionCharacteristic({ scenarioAndProcess, modelAndConditions }: Props) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">题目特征</h3>
      <div className="space-y-3">
        <div className="bg-red-950 rounded-xl p-4 border border-red-800">
          <p className="text-xs font-semibold text-red-300 mb-1">情境与过程特征</p>
          <FormulaBlock text={scenarioAndProcess} />
        </div>
        <div className="bg-blue-950 rounded-xl p-4 border border-blue-800">
          <p className="text-xs font-semibold text-blue-300 mb-1">模型与条件特征</p>
          <FormulaBlock text={modelAndConditions} />
        </div>
      </div>
    </div>
  );
}
