import { FormulaBlock } from '@/components/shared/FormulaBlock';
import { DynamicForceDiagram } from '@/components/svg/DynamicForceDiagram';
import type { DiagramSpec } from '@/lib/types/analysis';

interface Props {
  step1: { description: string; diagramSpec?: DiagramSpec };
  step2: { description: string; equations: string[] };
  step3: { description: string; finalAnswer: string };
}

export function SectionSolution({ step1, step2, step3 }: Props) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">答案解答</h3>
      <div className="space-y-4">
        {/* Step 1: 情境分析与图示化 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
            <p className="font-semibold text-sm text-foreground">情境分析与图示化</p>
          </div>
          <FormulaBlock text={step1.description} />
          {step1.diagramSpec && (
            <div className="mt-4 flex justify-center">
              <DynamicForceDiagram spec={step1.diagramSpec} />
            </div>
          )}
        </div>

        {/* Step 2: 规律应用与方程建立 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
            <p className="font-semibold text-sm text-foreground">规律应用与方程建立</p>
          </div>
          <FormulaBlock text={step2.description} />
          {step2.equations.length > 0 && (
            <div className="mt-3 space-y-2">
              {step2.equations.map((eq, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3 text-center">
                  <FormulaBlock text={eq} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: 数学求解与物理结论 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
            <p className="font-semibold text-sm text-foreground">数学求解与物理结论</p>
          </div>
          <FormulaBlock text={step3.description} />
          {step3.finalAnswer && (
            <div className="mt-3 bg-green-950 rounded-xl p-4 border border-green-800 text-center">
              <p className="text-xs text-green-300 mb-1 font-medium">最终答案</p>
              <FormulaBlock text={step3.finalAnswer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
