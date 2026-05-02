/** Diagram object specification from AI */
export interface DiagramObjectSpec {
  type: 'block' | 'ball' | 'ground' | 'ceiling' | 'wedge' | 'rope' | 'pulley' | 'spring';
  cx?: number; cy?: number;
  x1?: number; y1?: number;
  x2?: number; y2?: number;
  y?: number;
  width?: number; height?: number;
  radius?: number;
  angle?: number;
  label?: string;
  fill?: string;
  color?: string;
  coils?: number;
  tipX?: number; tipY?: number;
  length?: number;
}

/** Force arrow specification from AI */
export interface ForceSpec {
  x1?: number; y1?: number;
  x2?: number; y2?: number;
  from?: string; // "block_center", "object_center", "contact_point" etc.
  direction?: 'down' | 'up' | 'left' | 'right' | 'up_slope' | 'down_slope' | 'normal_up' | 'normal_down';
  angle?: number;
  label: string;
  color: 'gravity' | 'normal' | 'friction' | 'tension';
  magnitude?: string;
}

/** Angle mark specification */
export interface AngleMarkSpec {
  cx: number; cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  label: string;
  sweep?: 0 | 1;
}

/** Complete diagram specification from AI */
export interface DiagramSpec {
  type: 'forceDiagram';
  viewBox?: { width: number; height: number };
  objects: DiagramObjectSpec[];
  forces: ForceSpec[];
  angle_marks?: AngleMarkSpec[];
  labels?: Array<{ x: number; y: number; text: string; fontSize?: number }>;
}

/** Full analysis response from /api/analyze */
export interface AnalysisResult {
  characteristic: {
    scenarioAndProcess: string;
    modelAndConditions: string;
  };
  approach: {
    readingAndModeling: string;
    physicsConcepts: string;
    generalSteps: string[];
  };
  solution: {
    step1: {
      description: string;
      diagramSpec?: DiagramSpec;
    };
    step2: {
      description: string;
      equations: string[];
    };
    step3: {
      description: string;
      finalAnswer: string;
    };
  };
  coreKnowledgePoints: string[];
}

/** Multi-problem detection result */
export interface ProblemDetectResult {
  count: number;
  problems: Array<{
    index: number;
    description: string;
    confidence: number;
  }>;
}

/** Similar problems result */
export interface SimilarProblemsResult {
  knowledgeSummary: string;
  similarProblems: Array<{
    problem: string;
    briefAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    keyHint: string;
  }>;
}

/** Interactive learning message */
export interface LearnMessage {
  type: 'question' | 'feedback' | 'skip_feedback' | 'complete';
  content: string;
  questionScope?: string;
  referenceAnswer?: string;
  studentSaid?: string;
  diff?: string;
  continuePrompt?: string;
  progress?: { current: number; total: number };
  keyTakeaway?: string;
  profileUpdate?: {
    strengthsToAdd: string[];
    weaknessesToMerge: Array<{ topic: string; errorExample: string }>;
    newPublicSummary: string;
    newPrivateSummary: string;
    lastQuestionContext: string;
  };
}

/** Student-facing memory data (public profile + log entries) */
export interface MemoryData {
  profile: {
    summary: string;
    strengths: string[];
    totalSessions: number;
    lastTopic: string;
  };
  logs: Array<{
    id: string;
    createdAt: string;
    problemPreview: string;
    knowledgePoints: string[];
    totalQuestions: number;
    sessionSummary: string;
    keyTakeaway: string;
  }>;
}
