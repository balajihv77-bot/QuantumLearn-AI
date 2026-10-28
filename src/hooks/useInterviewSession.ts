import { useState, useEffect, useRef, useCallback } from 'react';
import {
  InterviewConfig,
  InterviewQuestion,
  InterviewEvaluationReport,
  InterviewProviderStatus
} from '../types/interview';
import {
  generateQuestionList,
  generateSampleReport
} from '../data/mockInterviewData';
import { InterviewApiClient } from '../services/interviewApiClient';

export type InterviewStage = 'setup' | 'room' | 'results';

export interface UseInterviewSessionReturn {
  // Session State
  stage: InterviewStage;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  currentIndex: number;
  currentQuestion: InterviewQuestion | null;
  userAnswers: Record<string, string>;
  currentAnswer: string;
  isSubmitting: boolean;
  timerSeconds: number;
  isTimerPaused: boolean;
  validationError: string | null;
  evaluationReport: InterviewEvaluationReport | null;
  progressPercentage: number;
  isLastQuestion: boolean;

  // Live AI / Provider Mode State
  providerStatus: InterviewProviderStatus | null;
  activeMode: 'live_ai' | 'demo';
  backendSessionId: string | null;
  lastFeedback: string | null;
  lastSuggestedFollowUp: string | null;
  lastEffectiveAnswerGuide: string | null;
  lastScore: number | null;

  // Actions
  setConfig: React.Dispatch<React.SetStateAction<InterviewConfig>>;
  setCurrentAnswer: (val: string | ((prev: string) => string)) => void;
  clearValidationError: () => void;
  startSession: (customConfig?: InterviewConfig) => Promise<boolean>;
  submitAnswer: (answerOverride?: string) => Promise<boolean>;
  moveToNextQuestion: () => void;
  moveToPreviousQuestion: () => void;
  endSession: () => Promise<void>;
  resetSession: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  prefillAnswer: () => void;
  refreshProviderStatus: () => Promise<void>;
}

export const INITIAL_CONFIG: InterviewConfig = {
  jobRole: null,
  experienceLevel: null,
  interviewType: null,
  difficulty: null,
  questionCount: 5
};

export function useInterviewSession(): UseInterviewSessionReturn {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [config, setConfig] = useState<InterviewConfig>(INITIAL_CONFIG);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [evaluationReport, setEvaluationReport] = useState<InterviewEvaluationReport | null>(null);

  // Live AI / Provider State
  const [providerStatus, setProviderStatus] = useState<InterviewProviderStatus | null>(null);
  const [activeMode, setActiveMode] = useState<'live_ai' | 'demo'>('demo');
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [lastSuggestedFollowUp, setLastSuggestedFollowUp] = useState<string | null>(null);
  const [lastEffectiveAnswerGuide, setLastEffectiveAnswerGuide] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load provider status on mount
  const refreshProviderStatus = useCallback(async () => {
    const status = await InterviewApiClient.getProviderStatus();
    setProviderStatus(status);
    setActiveMode(status.activeMode);
  }, []);

  useEffect(() => {
    refreshProviderStatus();
  }, [refreshProviderStatus]);

  // Cleanup timer interval safely
  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Timer lifecycle: runs while in room and unpaused, cleans up on stage change or unmount
  useEffect(() => {
    if (stage === 'room' && !isTimerPaused) {
      clearTimer();
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  }, [stage, isTimerPaused, clearTimer]);

  const currentQuestion = questions[currentIndex] || null;
  const progressPercentage = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;

  // Clear validation error helper
  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  // Start new interview session (integrates FastAPI backend with client fallback)
  const startSession = useCallback(async (customConfig?: InterviewConfig): Promise<boolean> => {
    const activeConfig = customConfig || config;

    if (!activeConfig.jobRole) {
      setValidationError('Please select a target job role.');
      return false;
    }
    if (!activeConfig.experienceLevel) {
      setValidationError('Please select your experience level.');
      return false;
    }
    if (!activeConfig.interviewType) {
      setValidationError('Please select an interview focus type.');
      return false;
    }
    if (!activeConfig.difficulty) {
      setValidationError('Please select an interview difficulty.');
      return false;
    }

    setValidationError(null);
    setIsSubmitting(true);

    let sessionQuestions: InterviewQuestion[] = [];
    let bSessionId: string | null = null;
    let mode: 'live_ai' | 'demo' = 'demo';

    // Attempt backend start session
    const backendStart = await InterviewApiClient.startSession(activeConfig);
    if (backendStart) {
      bSessionId = backendStart.sessionId;
      mode = backendStart.providerMode;
      // Seed with backend first question + remaining fallback pool
      const clientPool = generateQuestionList(
        activeConfig.jobRole,
        activeConfig.interviewType,
        activeConfig.difficulty,
        activeConfig.questionCount
      );
      sessionQuestions = [backendStart.firstQuestion, ...clientPool.slice(1)];
    } else {
      // Offline fallback
      sessionQuestions = generateQuestionList(
        activeConfig.jobRole,
        activeConfig.interviewType,
        activeConfig.difficulty,
        activeConfig.questionCount
      );
    }

    if (sessionQuestions.length === 0) {
      setIsSubmitting(false);
      setValidationError('No questions could be loaded for this combination. Please adjust selections.');
      return false;
    }

    setBackendSessionId(bSessionId);
    setActiveMode(mode);
    setQuestions(sessionQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setLastFeedback(null);
    setLastSuggestedFollowUp(null);
    setLastEffectiveAnswerGuide(null);
    setLastScore(null);

    const firstQ = sessionQuestions[0];
    if (firstQ.isCodingQuestion && firstQ.starterCode) {
      setCurrentAnswer(firstQ.starterCode);
    } else {
      setCurrentAnswer('');
    }

    setTimerSeconds(0);
    setIsTimerPaused(false);
    setIsSubmitting(false);
    setEvaluationReport(null);
    setStage('room');
    return true;
  }, [config]);

  // Submit Answer with rubric evaluation & dynamic question advancement
  const submitAnswer = useCallback(async (answerOverride?: string): Promise<boolean> => {
    if (isSubmitting) {
      return false;
    }

    const answerToValidate = (answerOverride !== undefined ? answerOverride : currentAnswer).trim();

    if (answerToValidate.length === 0) {
      setValidationError('Answer cannot be empty. Please enter your explanation or code before submitting.');
      return false;
    }

    if (!currentQuestion) {
      setValidationError('No active question found to submit.');
      return false;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: answerToValidate
    };
    setUserAnswers(updatedAnswers);

    // Call backend API if connected
    let nextServerQ: InterviewQuestion | undefined;
    let evalScore: number | null = null;
    let feedbackText: string | null = null;
    let followUpText: string | null = null;
    let effectiveGuideText: string | null = null;

    if (backendSessionId) {
      const codePart = currentQuestion.isCodingQuestion ? answerToValidate : undefined;
      const res = await InterviewApiClient.submitAnswer(
        backendSessionId,
        currentQuestion.id,
        answerToValidate,
        codePart
      );

      if (res) {
        nextServerQ = res.nextQuestion;
        evalScore = res.score ?? null;
        feedbackText = res.feedback ?? null;
        followUpText = res.suggestedFollowUp ?? null;
        effectiveGuideText = res.effectiveAnswerGuide ?? null;
      }
    } else {
      // Local demo delay
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setLastScore(evalScore);
    setLastFeedback(feedbackText);
    setLastSuggestedFollowUp(followUpText);
    setLastEffectiveAnswerGuide(effectiveGuideText);
    setIsSubmitting(false);

    // Advance to next question or complete session
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      let activeNextQ = questions[nextIdx];

      // If backend returned a dynamically generated live question, insert it
      if (nextServerQ) {
        activeNextQ = nextServerQ;
        setQuestions(prev => {
          const updated = [...prev];
          updated[nextIdx] = nextServerQ!;
          return updated;
        });
      }

      setCurrentIndex(nextIdx);
      if (updatedAnswers[activeNextQ.id]) {
        setCurrentAnswer(updatedAnswers[activeNextQ.id]);
      } else if (activeNextQ.isCodingQuestion && activeNextQ.starterCode) {
        setCurrentAnswer(activeNextQ.starterCode);
      } else {
        setCurrentAnswer('');
      }
    } else {
      // Completed all questions
      clearTimer();
      let finalReport: InterviewEvaluationReport | null = null;

      if (backendSessionId) {
        finalReport = await InterviewApiClient.finishSession(backendSessionId);
      }

      if (!finalReport && config.jobRole) {
        finalReport = generateSampleReport(config.jobRole, questions, updatedAnswers);
      }

      setEvaluationReport(finalReport);
      setStage('results');
    }

    return true;
  }, [isSubmitting, currentAnswer, currentQuestion, userAnswers, backendSessionId, currentIndex, questions, clearTimer, config.jobRole]);

  // Move to next question manually
  const moveToNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQ = questions[nextIdx];
      setCurrentAnswer(userAnswers[nextQ.id] || (nextQ.isCodingQuestion && nextQ.starterCode ? nextQ.starterCode : ''));
      setValidationError(null);
    }
  }, [currentIndex, questions, userAnswers]);

  // Move to previous question
  const moveToPreviousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = questions[prevIdx];
      setCurrentAnswer(userAnswers[prevQ.id] || '');
      setValidationError(null);
    }
  }, [currentIndex, questions, userAnswers]);

  // End Interview early
  const endSession = useCallback(async () => {
    clearTimer();

    const updatedAnswers = { ...userAnswers };
    if (currentQuestion && currentAnswer.trim().length > 0) {
      updatedAnswers[currentQuestion.id] = currentAnswer.trim();
      setUserAnswers(updatedAnswers);
    }

    let finalReport: InterviewEvaluationReport | null = null;
    if (backendSessionId) {
      finalReport = await InterviewApiClient.finishSession(backendSessionId);
    }

    if (!finalReport && config.jobRole) {
      finalReport = generateSampleReport(config.jobRole, questions, updatedAnswers);
    }

    setEvaluationReport(finalReport);
    setStage('results');
  }, [clearTimer, userAnswers, currentQuestion, currentAnswer, backendSessionId, config.jobRole, questions]);

  // Reset Session
  const resetSession = useCallback(() => {
    clearTimer();
    setStage('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setUserAnswers({});
    setCurrentAnswer('');
    setTimerSeconds(0);
    setIsTimerPaused(false);
    setIsSubmitting(false);
    setValidationError(null);
    setEvaluationReport(null);
    setBackendSessionId(null);
    setLastFeedback(null);
    setLastSuggestedFollowUp(null);
    setLastEffectiveAnswerGuide(null);
    setLastScore(null);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    setIsTimerPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsTimerPaused(false);
  }, []);

  // Pre-fill answer helper
  const prefillAnswer = useCallback(() => {
    if (!currentQuestion) return;

    if (currentQuestion.isCodingQuestion && currentQuestion.starterCode) {
      setCurrentAnswer(
        `${currentQuestion.starterCode}\n\n// Solution implementation:\n// Time Complexity: O(N) | Space Complexity: O(1)\n${currentQuestion.suggestedModelAnswer.slice(0, 180)}`
      );
    } else {
      setCurrentAnswer(
        `Technical Analysis:\n1. Core Principle: ${currentQuestion.suggestedModelAnswer.slice(0, 160)}...\n2. Edge Cases & Complexity: Addressed boundary limits, empty inputs, and thread-safety.\n3. Operational Reliability: Instrumented with structured metrics and error telemetry.`
      );
    }
    setValidationError(null);
  }, [currentQuestion]);

  return {
    stage,
    config,
    questions,
    currentIndex,
    currentQuestion,
    userAnswers,
    currentAnswer,
    isSubmitting,
    timerSeconds,
    isTimerPaused,
    validationError,
    evaluationReport,
    progressPercentage,
    isLastQuestion,

    providerStatus,
    activeMode,
    backendSessionId,
    lastFeedback,
    lastSuggestedFollowUp,
    lastEffectiveAnswerGuide,
    lastScore,

    setConfig,
    setCurrentAnswer,
    clearValidationError,
    startSession,
    submitAnswer,
    moveToNextQuestion,
    moveToPreviousQuestion,
    endSession,
    resetSession,
    pauseTimer,
    resumeTimer,
    prefillAnswer,
    refreshProviderStatus
  };
}
