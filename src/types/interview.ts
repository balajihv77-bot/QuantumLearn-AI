export type JobRole =
  | 'Python Developer'
  | 'Java Developer'
  | 'C Programmer'
  | 'Frontend Developer'
  | 'Full-Stack Developer'
  | 'Data Analyst'
  | 'AI/ML Engineer';

export type ExperienceLevel =
  | 'Fresher'
  | 'Beginner'
  | 'Intermediate'
  | 'Experienced';

export type InterviewType =
  | 'Technical'
  | 'HR'
  | 'Coding'
  | 'Mixed';

export type InterviewDifficulty =
  | 'Easy'
  | 'Medium'
  | 'Hard';

export type QuestionCount = 5 | 10 | 15;

export interface InterviewConfig {
  jobRole: JobRole | null;
  experienceLevel: ExperienceLevel | null;
  interviewType: InterviewType | null;
  difficulty: InterviewDifficulty | null;
  questionCount: QuestionCount;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: InterviewDifficulty;
  hint: string;
  suggestedModelAnswer: string;
  keyEvaluationPoints: string[];
  isCodingQuestion?: boolean;
  starterCode?: string;
  codingLanguage?: string;
  followUpHint?: string;
  effectiveAnswerGuide?: string;
  evaluationCriteria?: string[];
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number;
  clarityScore: number;
  technicalScore: number;
  modelAnswer: string;
  strengths: string[];
  improvements: string[];
  suggestedFollowUp?: string;
  effectiveAnswerGuide?: string;
  rubricBreakdown?: Record<string, any>;
}

export interface InterviewEvaluationReport {
  overallScore: number;
  technicalCorrectness: number;
  answerRelevance: number;
  clarity: number;
  problemSolving: number;
  strengths: string[];
  areasForImprovement: string[];
  questionFeedbacks: QuestionFeedback[];
  practiceEstimateNotice?: string;
  providerMode?: 'live_ai' | 'demo';
  isLiveAI?: boolean;
  evaluationRubricUsed?: string;
  rubricWeights?: Record<string, number>;
  summary?: string;
}

export interface InterviewProviderStatus {
  providerConfigured: boolean;
  providerName: string;
  modelName: string;
  activeMode: 'live_ai' | 'demo';
  rubricsSupported: string[];
  safetyGuardrailsActive: boolean;
  statusMessage: string;
}
