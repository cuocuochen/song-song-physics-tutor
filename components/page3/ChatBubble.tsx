import { FormulaBlock } from '@/components/shared/FormulaBlock';

interface Props {
  role: 'teacher' | 'student';
  content: string;
}

export function ChatBubble({ role, content }: Props) {
  const isTeacher = role === 'teacher';
  return (
    <div className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed
          ${isTeacher
            ? 'bg-surface border border-border text-foreground rounded-tl-sm'
            : 'bg-primary text-white rounded-tr-sm'
          }`}
      >
        {isTeacher ? <FormulaBlock text={content} /> : <p>{content}</p>}
      </div>
    </div>
  );
}
