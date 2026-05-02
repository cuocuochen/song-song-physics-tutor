'use client';

import { motion } from 'framer-motion';
import { SectionCharacteristic } from './SectionCharacteristic';
import { SectionApproach } from './SectionApproach';
import { SectionSolution } from './SectionSolution';
import { CARD_THEME, PHYSICS_COLORS } from '@/lib/utils/colors';
import type { AnalysisResult } from '@/lib/types/analysis';

interface AnalysisCardProps {
  result: AnalysisResult;
  onGoToSimilar: () => void;
}

export function AnalysisCard({ result, onGoToSimilar }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[24px] bg-surface border border-border p-6 md:p-8 space-y-8"
      style={{ boxShadow: CARD_THEME.shadow }}
    >
      <SectionCharacteristic
        scenarioAndProcess={result.characteristic.scenarioAndProcess}
        modelAndConditions={result.characteristic.modelAndConditions}
      />

      <hr className="border-border" />

      <SectionApproach
        readingAndModeling={result.approach.readingAndModeling}
        physicsConcepts={result.approach.physicsConcepts}
        generalSteps={result.approach.generalSteps}
      />

      <hr className="border-border" />

      <SectionSolution
        step1={result.solution.step1}
        step2={result.solution.step2}
        step3={result.solution.step3}
      />

      {/* Core knowledge points */}
      {result.coreKnowledgePoints.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {result.coreKnowledgePoints.map((kp, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: Object.values(PHYSICS_COLORS)[i % 4] + '18',
                color: Object.values(PHYSICS_COLORS)[i % 4],
              }}
            >
              {kp}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onGoToSimilar}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          生成同类题练习
        </button>
      </div>

      <p className="text-xs text-muted text-center">以上分析由AI生成，请核对物理过程是否正确</p>
    </motion.div>
  );
}
