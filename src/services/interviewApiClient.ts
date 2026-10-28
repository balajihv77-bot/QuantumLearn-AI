/**
 * QuantumLearn AI - Interview Backend API Client
 * Connects frontend UI to FastAPI `/api/interviews/*` endpoints.
 * Provides live AI question generation, rubric scoring, follow-ups,
 * and seamless fallback handling.
 */

import {
  InterviewConfig,
  InterviewQuestion,
  InterviewEvaluationReport,
  InterviewProviderStatus,
  QuestionFeedback
} from '../types/interview';

const API_BASE = '/api/interviews';

function getAuthHeader(): Record<string, string> {
  const token =
    localStorage.getItem('quantumlearn_auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class InterviewApiClient {
  /**
   * Checks backend live AI availability, configured model, and active mode (live_ai vs demo).
   */
  static async getProviderStatus(): Promise<InterviewProviderStatus> {
    try {
      const res = await fetch(`${API_BASE}/provider-status`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend unreachable or offline
    }
    return {
      providerConfigured: false,
      providerName: 'QuantumLearn Curated Engine',
      modelName: 'offline_curated_bank',
      activeMode: 'demo',
      rubricsSupported: ['Technical', 'HR', 'Coding', 'Mixed'],
      safetyGuardrailsActive: true,
      statusMessage: 'Curated Question Bank Mode (Demo Fallback)'
    };
  }

  /**
   * Starts a new session on the backend.
   */
  static async startSession(config: InterviewConfig): Promise<{
    sessionId: string;
    firstQuestion: InterviewQuestion;
    providerMode: 'live_ai' | 'demo';
    isLiveAI: boolean;
    totalQuestions: number;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          role: config.jobRole,
          experience_level: config.experienceLevel,
          interview_type: config.interviewType,
          difficulty: config.difficulty,
          question_count: config.questionCount
        })
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const q = data.current_question;
      return {
        sessionId: data.session_id,
        firstQuestion: {
          id: q.id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          hint: q.hint || '',
          suggestedModelAnswer: q.model_answer || '',
          keyEvaluationPoints: q.key_points || [],
          isCodingQuestion: q.is_coding_question,
          starterCode: q.starter_code,
          codingLanguage: q.coding_language,
          followUpHint: q.follow_up_hint,
          effectiveAnswerGuide: q.effective_answer_guide,
          evaluationCriteria: q.evaluation_criteria
        },
        providerMode: data.provider_mode || 'demo',
        isLiveAI: Boolean(data.is_live_ai),
        totalQuestions: data.total_questions
      };
    } catch {
      return null;
    }
  }

  /**
   * Submits candidate answer to the backend for evaluation and advances to next question.
   */
  static async submitAnswer(
    sessionId: string,
    questionId: string,
    answerText: string,
    codeAnswer?: string
  ): Promise<{
    isCompleted: boolean;
    nextQuestion?: InterviewQuestion;
    score?: number;
    feedback?: string;
    suggestedFollowUp?: string;
    effectiveAnswerGuide?: string;
    rubricBreakdown?: Record<string, any>;
    practiceEstimateNotice?: string;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          question_id: questionId,
          answer_text: answerText,
          code_answer: codeAnswer || null
        })
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      let nextQuestion: InterviewQuestion | undefined;
      if (data.next_question) {
        const nq = data.next_question;
        nextQuestion = {
          id: nq.id,
          question: nq.question,
          category: nq.category,
          difficulty: nq.difficulty,
          hint: nq.hint || '',
          suggestedModelAnswer: nq.model_answer || '',
          keyEvaluationPoints: nq.key_points || [],
          isCodingQuestion: nq.is_coding_question,
          starterCode: nq.starter_code,
          codingLanguage: nq.coding_language,
          followUpHint: nq.follow_up_hint,
          effectiveAnswerGuide: nq.effective_answer_guide,
          evaluationCriteria: nq.evaluation_criteria
        };
      }

      return {
        isCompleted: data.is_completed,
        nextQuestion,
        score: data.score,
        feedback: data.feedback,
        suggestedFollowUp: data.suggested_follow_up,
        effectiveAnswerGuide: data.effective_answer_guide,
        rubricBreakdown: data.rubric_breakdown,
        practiceEstimateNotice: data.practice_estimate_notice
      };
    } catch {
      return null;
    }
  }

  /**
   * Concludes the interview and fetches the comprehensive diagnostic report.
   */
  static async finishSession(sessionId: string): Promise<InterviewEvaluationReport | null> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const r = data.report;
      if (!r) return null;

      const feedbacks: QuestionFeedback[] = (r.question_breakdowns || []).map((qb: any) => ({
        questionId: qb.question_id,
        questionText: qb.question_text,
        userAnswer: qb.user_answer,
        score: qb.score,
        clarityScore: Math.max(60, qb.score - 5),
        technicalScore: qb.score,
        modelAnswer: qb.model_answer,
        strengths: qb.feedback ? [qb.feedback] : ['Demonstrated domain knowledge'],
        improvements: qb.effective_answer_guide ? [qb.effective_answer_guide] : ['Elaborate on production telemetry'],
        suggestedFollowUp: qb.suggested_follow_up,
        effectiveAnswerGuide: qb.effective_answer_guide,
        rubricBreakdown: qb.rubric_breakdown
      }));

      return {
        overallScore: r.overall_score,
        technicalCorrectness: r.technical_correctness,
        answerRelevance: r.answer_relevance,
        clarity: r.clarity,
        problemSolving: r.problem_solving,
        strengths: r.strengths || [],
        areasForImprovement: r.areas_for_improvement || [],
        questionFeedbacks: feedbacks,
        practiceEstimateNotice: r.practice_estimate_notice,
        providerMode: r.provider_mode,
        isLiveAI: r.is_live_ai,
        evaluationRubricUsed: r.evaluation_rubric_used,
        rubricWeights: r.rubric_weights,
        summary: r.summary
      };
    } catch {
      return null;
    }
  }
}
