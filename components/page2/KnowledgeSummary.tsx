import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  text: string;
}

export function KnowledgeSummary({ text }: Props) {
  return (
    <div className="rounded-2xl bg-blue-950 border border-blue-800 p-5">
      <h3 className="font-semibold text-blue-200 text-sm mb-2">核心知识点</h3>
      <FormulaBlock text={text} />
    </div>
  );
}
