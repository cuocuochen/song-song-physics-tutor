/** Student learning profile — AI-maintained mental model of the student */
export interface LearningProfile {
  /** Public version — shown to student, focuses on strengths and progress */
  public: {
    summary: string; // "你在受力分析方面表现扎实，完成了5次学习..."
    strengths: string[]; // ["力的平衡", "牛顿第二定律"]
    totalSessions: number;
    lastTopic: string; // "斜面摩擦力"
  };
  /** Private version — AI only, contains weaknesses and error patterns for personalized teaching */
  private: {
    weaknesses: Array<{ topic: string; frequency: number }>;
    mistakeExamples: string[]; // ["将静摩擦方向画反", "混淆作用力与反作用力"]
    lastQuestionContext: string; // "上次讨论了斜面体摩擦力的方向问题..."
  };
  updatedAt: string;
}

export interface ProfileUpdate {
  strengthsToAdd: string[];
  weaknessesToMerge: Array<{ topic: string; errorExample: string }>;
  newPublicSummary: string;
  newPrivateSummary: string;
  lastQuestionContext: string;
}

/** One learning session log entry — human browsable */
export interface LearningLogEntry {
  id: string;
  createdAt: string;
  problemPreview: string;
  knowledgePoints: string[];
  totalQuestions: number;
  sessionSummary: string; // AI complete.content
  keyTakeaway: string; // one-sentence精华
  publicSnapshot: string; // profile.public.summary at time of session
}

/** Complete memory file stored on server per student */
export interface MemoryFile {
  profile: LearningProfile;
  logs: LearningLogEntry[];
  version: 1;
}
