/**
 * AI Tutor & Code Assistant Type Definitions
 * QuantumLearn AI - Pedagogical conversational assistant
 */

export type AIChatRole = 'user' | 'assistant' | 'system';

export interface AICodeSnippet {
  language: 'python' | 'qasm' | 'cirq' | 'text';
  code: string;
  title?: string;
  description?: string;
}

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  timestamp: string;
  codeSnippets?: AICodeSnippet[];
  suggestedFollowUps?: string[];
  recommendedModuleId?: string;
  recommendedAlgorithmId?: string;
  source: 'live_backend' | 'curated_demo';
  isError?: boolean;
}

export interface AIChatRequest {
  message: string;
  history?: { role: AIChatRole; content: string }[];
  context?: {
    completedModuleIds?: string[];
    currentModuleId?: string;
    currentTopic?: string;
    recentSimulations?: string[];
    mode?: 'general' | 'math' | 'code' | 'debug';
  };
}

export interface AIChatResponse {
  reply: string;
  codeSnippets?: AICodeSnippet[];
  suggestedFollowUps?: string[];
  recommendedModuleId?: string;
  recommendedAlgorithmId?: string;
  source: 'live_backend' | 'curated_demo';
  latencyMs?: number;
}

export interface BackendHealthStatus {
  isAvailable: boolean;
  endpoint: string;
  message: string;
  checkedAt: string;
}

export type QuestionCategory = 'Beginner' | 'Mathematics' | 'Code & Qiskit' | 'Debugging' | 'Roadmap';

export interface SuggestedQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  badge?: string;
}
