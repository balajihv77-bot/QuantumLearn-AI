import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Lightbulb,
  Check,
  RefreshCw,
  StopCircle,
  Pause,
  PlayCircle
} from 'lucide-react';
import { Button3D } from '../components/common/Button3D';
import { GlassCard } from '../components/common/GlassCard';
import { CodeAnswerEditor } from '../components/interview/CodeAnswerEditor';
import {
  JobRole,
  ExperienceLevel,
  InterviewType,
  InterviewDifficulty,
  QuestionCount,
  InterviewConfig
} from '../types/interview';
import { ROLE_DESCRIPTIONS } from '../data/mockInterviewData';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useVoiceInterview } from '../hooks/useVoiceInterview';
import { VoiceInputControl } from '../components/interview/VoiceInputControl';
import { SpokenQuestionControl } from '../components/interview/SpokenQuestionControl';

const JOB_ROLES: JobRole[] = [
  'Python Developer',
  'Java Developer',
  'C Programmer',
  'Frontend Developer',
  'Full-Stack Developer',
  'Data Analyst',
  'AI/ML Engineer'
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Fresher',
  'Beginner',
  'Intermediate',
  'Experienced'
];

const INTERVIEW_TYPES: InterviewType[] = [
  'Technical',
  'HR',
  'Coding',
  'Mixed'
];

const DIFFICULTIES: InterviewDifficulty[] = [
  'Easy',
  'Medium',
  'Hard'
];

const QUESTION_COUNTS: QuestionCount[] = [5, 10, 15];

export const AIMockInterviewPage: React.FC = () => {
  // Leverage our reusable client-side interview session logic hook (Requirements 1-15)
  const {
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
    prefillAnswer
  } = useInterviewSession();

  // Voice Features (Part 6): Speech recognition & Speech synthesis
  const voice = useVoiceInterview({
    onTranscriptReceived: (chunk, isFinal) => {
      if (isFinal) {
        setCurrentAnswer((prev: string) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${chunk}` : chunk;
        });
        clearValidationError();
      }
    }
  });

  // Local UI-only helper states
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showEffectiveGuide, setShowEffectiveGuide] = useState<boolean>(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<{
    role?: string;
    exp?: string;
    type?: string;
    diff?: string;
  }>({});

  // Stop recording/speaking on question transition or unmount, auto-read if enabled
  useEffect(() => {
    voice.stopListening();
    voice.stopSpeaking();
    voice.clearTranscripts();

    if (stage === 'room' && currentQuestion && voice.autoReadQuestions && voice.spokenQuestionsEnabled) {
      const timer = setTimeout(() => {
        voice.speakQuestion(currentQuestion.question);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion?.id, stage]);

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup form validation
  const handleValidateAndStart = () => {
    const errors: { role?: string; exp?: string; type?: string; diff?: string } = {};
    if (!config.jobRole) errors.role = 'Please select a target job role.';
    if (!config.experienceLevel) errors.exp = 'Please select your experience level.';
    if (!config.interviewType) errors.type = 'Please select an interview focus type.';
    if (!config.difficulty) errors.diff = 'Please select an interview difficulty.';

    setFormFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      voice.stopListening();
      voice.stopSpeaking();
      startSession();
      setShowHint(false);
      setShowEffectiveGuide(false);
    }
  };

  // Quick preset loader for 1-click preview
  const handleLoadSampleScenario = () => {
    const presetConfig: InterviewConfig = {
      jobRole: 'Python Developer',
      experienceLevel: 'Intermediate',
      interviewType: 'Technical',
      difficulty: 'Medium',
      questionCount: 5
    };
    setConfig(presetConfig);
    setFormFieldErrors({});
  };

  // Handle submit response action
  const handleFormSubmit = async () => {
    voice.stopListening();
    voice.stopSpeaking();
    const success = await submitAnswer();
    if (success) {
      setShowHint(false);
      setShowEffectiveGuide(false);
    }
  };

  // Handle early end action
  const handleEndEarly = async () => {
    voice.stopListening();
    voice.stopSpeaking();
    await endSession();
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 lg:px-8 quantum-grid-bg">
      <div className="max-w-6xl mx-auto">
        
        {/* ========================================================================= */}
        {/* VIEW 1: INTERVIEW SETUP FORM (Requirement 1 & 2)                          */}
        {/* ========================================================================= */}
        {stage === 'setup' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / Intro */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold shadow-sm">
                {activeMode === 'live_ai' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-emerald-300 font-medium">Google Gemini Live AI Integration</span>
                    <span className="text-slate-500 font-mono text-[10px]">({providerStatus?.modelName || 'gemini-3.8-flash'})</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                    <span className="text-amber-300 font-medium">Curated Demo Mode</span>
                    <span className="text-slate-400 text-[10px]">(Question Bank Active · Practice Estimate)</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-outfit tracking-tight">
                Calibrated Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Mock Interview</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Practice technical, coding, and behavioral interviews across modern software roles. Structured question progression, real-time stopwatch, and comprehensive benchmark model answers.
              </p>
              
              {/* Quick load sample preset */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadSampleScenario}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Click to Load Recommended Practice Preset (Python · Intermediate · 5 Questions)</span>
                </button>
              </div>
            </div>

            {/* Validation Error Summary if triggered */}
            {(Object.keys(formFieldErrors).length > 0 || validationError) && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Please complete all required selections:</div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-red-300/90">
                    {validationError && <li>{validationError}</li>}
                    {Object.values(formFieldErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Main Setup Glass Card */}
            <GlassCard glow className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: Job Role */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">1</span>
                    Target Job Role
                    <span className="text-cyan-400">*</span>
                  </label>
                  {formFieldErrors.role && (
                    <span className="text-xs text-red-400 font-medium">{formFieldErrors.role}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {JOB_ROLES.map(role => {
                    const info = ROLE_DESCRIPTIONS[role];
                    const isSelected = config.jobRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setConfig(prev => ({ ...prev, jobRole: role }));
                          setFormFieldErrors(prev => ({ ...prev, role: undefined }));
                          clearValidationError();
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between h-full ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500/80 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="text-2xl">{info.icon}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className={`text-sm font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {role}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {info.highlight}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Experience Level */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">2</span>
                    Experience Level
                    <span className="text-cyan-400">*</span>
                  </label>
                  {formFieldErrors.exp && (
                    <span className="text-xs text-red-400 font-medium">{formFieldErrors.exp}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EXPERIENCE_LEVELS.map(level => {
                    const isSelected = config.experienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setConfig(prev => ({ ...prev, experienceLevel: level }));
                          setFormFieldErrors(prev => ({ ...prev, exp: undefined }));
                          clearValidationError();
                        }}
                        className={`py-3 px-4 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-semibold ring-1 ring-purple-400'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:bg-slate-850'
                        }`}
                      >
                        <div className="text-sm font-medium">{level}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Interview Type & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                
                {/* Interview Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">3</span>
                      Interview Focus Type
                      <span className="text-cyan-400">*</span>
                    </label>
                    {formFieldErrors.type && (
                      <span className="text-xs text-red-400 font-medium">{formFieldErrors.type}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {INTERVIEW_TYPES.map(type => {
                      const isSelected = config.interviewType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setConfig(prev => ({ ...prev, interviewType: type }));
                            setFormFieldErrors(prev => ({ ...prev, type: undefined }));
                            clearValidationError();
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400'
                              : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {type} {type === 'Coding' && '💻'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">4</span>
                      Difficulty
                      <span className="text-cyan-400">*</span>
                    </label>
                    {formFieldErrors.diff && (
                      <span className="text-xs text-red-400 font-medium">{formFieldErrors.diff}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {DIFFICULTIES.map(diff => {
                      const isSelected = config.difficulty === diff;
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => {
                            setConfig(prev => ({ ...prev, difficulty: diff }));
                            setFormFieldErrors(prev => ({ ...prev, diff: undefined }));
                            clearValidationError();
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {diff}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 4: Question Count */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">5</span>
                  Question Count
                </label>
                <div className="flex items-center gap-3">
                  {QUESTION_COUNTS.map(count => {
                    const isSelected = config.questionCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, questionCount: count }))}
                        className={`flex-1 py-2.5 px-4 rounded-xl border text-center transition-all text-xs font-semibold ${
                          isSelected
                            ? 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-sm ring-1 ring-blue-400'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {count} Questions {count === 5 && '(Fast Track)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Voice Features Option */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Hands-Free Voice Interaction (Optional)</span>
                    <p className="text-[11px] text-slate-400">
                      Spoken questions and speech-to-text dictation. Text-only workflow is always available as fallback.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={voice.autoReadQuestions}
                    onChange={(e) => voice.setAutoReadQuestions(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                  />
                  <span>Auto-read questions aloud</span>
                </label>
              </div>

              {/* Mode Notice & Start Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span>Local Demo Mode: Questions are calibrated from domain banks without live AI API tokens.</span>
                </div>

                <Button3D
                  variant="cyan"
                  size="lg"
                  onClick={handleValidateAndStart}
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  className="w-full sm:w-auto px-8"
                >
                  Start Interview
                </Button3D>
              </div>

            </GlassCard>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INTERVIEW ROOM (Requirements 3-12 & 15)                           */}
        {/* ========================================================================= */}
        {stage === 'room' && currentQuestion && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Bar: Progress, Live Stopwatch, Early Exit */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Session in Progress</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{config.jobRole}</span>
                  <span>·</span>
                  <span>{config.interviewType}</span>
                  <span>·</span>
                  <span className="text-purple-300">{config.difficulty}</span>
                </div>
              </div>

              {/* Timer and Action Controls (Requirement 11 & 12) */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-cyan-300 font-mono text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{formatTime(timerSeconds)}</span>
                  <button
                    type="button"
                    onClick={isTimerPaused ? resumeTimer : pauseTimer}
                    className="text-[10px] text-slate-400 hover:text-slate-200 uppercase ml-1.5 font-sans px-1 rounded bg-slate-800/80"
                    title={isTimerPaused ? 'Resume timer' : 'Pause timer'}
                  >
                    {isTimerPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>

                {/* Early Ending Button (Requirement 12) */}
                <Button3D
                  variant="dark"
                  size="sm"
                  onClick={handleEndEarly}
                  leftIcon={<StopCircle className="w-3.5 h-3.5 text-slate-400" />}
                >
                  End Interview Early
                </Button3D>
              </div>
            </div>

            {/* Mode Notice & Practice Estimate Disclaimer */}
            <div className={`px-4 py-2.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
              activeMode === 'live_ai'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-purple-950/30 border-purple-500/30 text-purple-200'
            }`}>
              <div className="flex items-center gap-2">
                {activeMode === 'live_ai' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span>
                      <strong>Google Gemini Live AI Mode:</strong> Dynamic single-question sequencing & live rubric scoring active.
                      <span className="ml-2 text-emerald-300/80 font-mono text-[11px]">(Practice Estimate only)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>
                      <strong>Curated Demo Mode:</strong> Questions & benchmarks delivered via calibrated offline question bank.
                      <span className="ml-2 text-purple-300/80 font-mono text-[11px]">(Practice Estimate only)</span>
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={prefillAnswer}
                className="shrink-0 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                Pre-fill Sample Answer
              </button>
            </div>

            {/* Previous Question AI Feedback & Follow-up Card (if evaluated) */}
            {(lastFeedback || lastSuggestedFollowUp) && (
              <GlassCard className="p-4 sm:p-5 border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-purple-950/20 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Interviewer Real-time Assessment</span>
                    {lastScore !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[11px]">
                        Practice Score: {lastScore}/100
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {activeMode === 'live_ai' ? 'Gemini AI Evaluator' : 'Curated Rubric Engine'}
                  </span>
                </div>

                {lastFeedback && (
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <span className="font-semibold text-cyan-400">Feedback: </span>
                    {lastFeedback}
                  </div>
                )}

                {lastSuggestedFollowUp && (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-cyan-300">Targeted Follow-up Question: </span>
                      {lastSuggestedFollowUp}
                    </div>
                  </div>
                )}

                {lastEffectiveAnswerGuide && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Effective Answer Standard: </strong>
                      {lastEffectiveAnswerGuide}
                    </span>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Validation Error Banner if blank answer or issue (Requirement 7) */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold">{validationError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearValidationError}
                  className="text-red-300 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Question & Response Card */}
            <GlassCard glow className="p-6 sm:p-8 space-y-6">
              
              {/* Question Header & Interviewer Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  {/* Interviewer Avatar */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-950 to-purple-900 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <Sparkles className="w-7 h-7 text-cyan-300 animate-pulse" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Engineering Interview Panel</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                        Active Evaluator
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>Evaluating question response</span>
                    </div>
                  </div>
                </div>

                {/* Question progress counter (Requirement 10) */}
                <div className="text-right">
                  <div className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length} ({progressPercentage}%)
                  </div>
                  <div className="w-40 h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5 border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Text & Guidance Hint */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-cyan-300 font-mono border border-slate-700">
                    {currentQuestion.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-purple-300 font-mono border border-slate-700">
                    {currentQuestion.difficulty} Difficulty
                  </span>
                  {currentQuestion.isCodingQuestion && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-500/30">
                      Coding Challenge
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white font-outfit leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Guidance toggles & Spoken Question Controls (Part 6) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Guidance Hint' : 'Need a Guidance Hint?'}</span>
                    </button>

                    {currentQuestion.effectiveAnswerGuide && (
                      <button
                        type="button"
                        onClick={() => setShowEffectiveGuide(!showEffectiveGuide)}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>{showEffectiveGuide ? 'Hide Answer Strategy' : 'What an Effective Answer Should Include'}</span>
                      </button>
                    )}
                  </div>

                  {/* Browser Speech Synthesis: Read Question Aloud */}
                  <SpokenQuestionControl
                    questionText={currentQuestion.question}
                    isSynthesisSupported={voice.isSynthesisSupported}
                    isSpeaking={voice.isSpeaking}
                    isPaused={voice.isPaused}
                    spokenQuestionsEnabled={voice.spokenQuestionsEnabled}
                    autoReadQuestions={voice.autoReadQuestions}
                    speechRate={voice.speechRate}
                    onPlay={(txt) => voice.speakQuestion(txt)}
                    onPause={voice.pauseSpeaking}
                    onResume={voice.resumeSpeaking}
                    onStop={voice.stopSpeaking}
                    onToggleEnabled={voice.setSpokenQuestionsEnabled}
                    onToggleAutoRead={voice.setAutoReadQuestions}
                    onChangeRate={voice.setSpeechRate}
                  />
                </div>

                {showHint && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed animate-in fade-in">
                    <span className="font-semibold text-amber-300">Interviewer Tip: </span>
                    {currentQuestion.hint}
                  </div>
                )}

                {showEffectiveGuide && currentQuestion.effectiveAnswerGuide && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 text-cyan-200/90 text-xs leading-relaxed animate-in fade-in space-y-1">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>What an Effective Answer Should Include:</span>
                    </div>
                    <p className="text-slate-300">{currentQuestion.effectiveAnswerGuide}</p>
                    {currentQuestion.followUpHint && (
                      <p className="text-cyan-300/80 text-[11px] pt-1 border-t border-cyan-500/20">
                        <strong>Expected Follow-up Probe: </strong>
                        {currentQuestion.followUpHint}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Input Section (Part 6) */}
              <div className="pt-2 border-t border-slate-800/80">
                <VoiceInputControl
                  isRecognitionSupported={voice.isRecognitionSupported}
                  inputState={voice.inputState}
                  isListening={voice.isListening}
                  isProcessing={voice.isProcessing}
                  permissionDenied={voice.permissionDenied}
                  recognitionError={voice.recognitionError}
                  interimTranscript={voice.interimTranscript}
                  lastFinalTranscript={voice.lastFinalTranscript}
                  currentAnswer={currentAnswer}
                  onStartListening={voice.startListening}
                  onStopListening={voice.stopListening}
                  onClearError={voice.clearRecognitionError}
                  onAppendText={(txt) => {
                    setCurrentAnswer((prev: string) => (prev.trim() ? `${prev.trim()} ${txt}` : txt));
                    clearValidationError();
                  }}
                  onReplaceText={(txt) => {
                    setCurrentAnswer(txt);
                    clearValidationError();
                  }}
                  onClearTranscript={voice.clearTranscripts}
                />
              </div>

              {/* Answer Input Section: Interactive Code Editor vs Formatted Textarea (Requirement 5) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label htmlFor="interview-answer" className="font-semibold text-slate-300">
                    {currentQuestion.isCodingQuestion ? 'Code Implementation & Analysis' : 'Your Response'}
                  </label>
                  <span>
                    {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words · {currentAnswer.length} characters
                  </span>
                </div>

                {currentQuestion.isCodingQuestion ? (
                  <CodeAnswerEditor
                    value={currentAnswer}
                    onChange={(val) => {
                      setCurrentAnswer(val);
                      if (validationError) clearValidationError();
                    }}
                    language={currentQuestion.codingLanguage || 'python'}
                    starterCode={currentQuestion.starterCode}
                    placeholder="Write your algorithmic solution here..."
                  />
                ) : (
                  <div className="relative rounded-xl border border-cyan-500/25 bg-slate-950/70 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                    <textarea
                      id="interview-answer"
                      rows={8}
                      value={currentAnswer}
                      onChange={(e) => {
                        setCurrentAnswer(e.target.value);
                        if (validationError) clearValidationError();
                      }}
                      placeholder="Structure your response clearly: state your primary methodology, analyze computational trade-offs, mention edge cases, and describe monitoring or testing strategies..."
                      className="w-full bg-transparent p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-y font-sans leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons: Prev, Clear, Submit (Requirements 6-9 & 15) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {currentIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        voice.stopListening();
                        voice.stopSpeaking();
                        moveToPreviousQuestion();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700 transition-colors"
                    >
                      ← Previous Question
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentAnswer('')}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
                  >
                    Clear Editor
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button3D
                    variant="cyan"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={handleFormSubmit}
                    rightIcon={<Send className="w-4 h-4" />}
                    className="w-full sm:w-auto px-6"
                  >
                    {isLastQuestion ? 'Submit & Complete Session' : 'Submit Answer'}
                  </Button3D>
                </div>
              </div>

            </GlassCard>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: RESULTS PAGE UI (Requirements 13 & 14)                             */}
        {/* ========================================================================= */}
        {stage === 'results' && evaluationReport && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Header & Clear Labeling */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold shadow-sm">
                {evaluationReport.isLiveAI || evaluationReport.providerMode === 'live_ai' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-emerald-300 font-medium">Google Gemini Live AI Evaluated</span>
                    <span className="text-slate-500 font-mono text-[10px]">(Practice Estimate)</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium">Curated Demo Mode Report</span>
                    <span className="text-slate-500 font-mono text-[10px]">(Calibrated Rubric)</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
                Interview Performance Summary
              </h1>
              <p className="text-sm text-slate-300">
                Diagnostic summary for <strong>{config.jobRole}</strong> ({config.interviewType} track · {config.difficulty} difficulty).
              </p>
              
              {/* Practice Estimate Notice */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/25 text-xs text-cyan-200/90 max-w-2xl mx-auto">
                <span className="font-semibold text-cyan-300">Practice Estimate Notice: </span>
                {evaluationReport.practiceEstimateNotice || 'Scores and feedback are practice estimates generated by QuantumLearn AI for mock interview preparation.'}
              </div>
            </div>

            {/* Overall Score & Primary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Overall Practice Score Gauge Card */}
              <GlassCard glow className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Overall Practice Score</div>
                
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - evaluationReport.overallScore / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white font-outfit">
                      {evaluationReport.overallScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-200">
                  {evaluationReport.overallScore >= 85
                    ? '🌟 Strong Candidate Performance'
                    : evaluationReport.overallScore >= 70
                    ? '👍 Solid Technical Competency'
                    : '📖 Foundational Review Recommended'}
                </div>

                <div className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Session duration: <strong className="text-slate-200">{formatTime(timerSeconds)}</strong> across {questions.length} questions.
                </div>
              </GlassCard>

              {/* 4 Diagnostic Metrics Breakdown */}
              <GlassCard className="lg:col-span-7 p-6 sm:p-8 space-y-5">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Evaluative Competency Matrix
                </div>

                <div className="space-y-4">
                  {/* Technical Correctness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">Technical Correctness</span>
                      <span className="font-mono text-cyan-300 font-bold">{evaluationReport.technicalCorrectness}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${evaluationReport.technicalCorrectness}%` }}
                      />
                    </div>
                  </div>

                  {/* Answer Relevance */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">Answer Relevance</span>
                      <span className="font-mono text-purple-300 font-bold">{evaluationReport.answerRelevance}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${evaluationReport.answerRelevance}%` }}
                      />
                    </div>
                  </div>

                  {/* Clarity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">Clarity & Communication</span>
                      <span className="font-mono text-emerald-300 font-bold">{evaluationReport.clarity}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${evaluationReport.clarity}%` }}
                      />
                    </div>
                  </div>

                  {/* Problem Solving */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">Problem-Solving & Edge Cases</span>
                      <span className="font-mono text-amber-300 font-bold">{evaluationReport.problemSolving}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${evaluationReport.problemSolving}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Rubric: <strong className="text-slate-200">{config.interviewType === 'HR' ? 'HR Behavioral Rubric (35/30/20/15)' : 'Technical Practice Rubric (40/25/20/15)'}</strong>
                  </span>
                  <span className="text-emerald-400 font-medium">Practice Calibrated</span>
                </div>
              </GlassCard>
            </div>

            {/* Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <GlassCard className="p-6 space-y-4 border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths</span>
                </div>
                <ul className="space-y-2.5">
                  {evaluationReport.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Areas for Improvement */}
              <GlassCard className="p-6 space-y-4 border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Target className="w-4 h-4" />
                  <span>Actionable Areas for Improvement</span>
                </div>
                <ul className="space-y-2.5">
                  {evaluationReport.areasForImprovement.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Suggested Model Answers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-outfit">
                    Question Review & Suggested Model Answers
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compare your practice answers against benchmark responses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedQuestionId(expandedQuestionId ? null : questions[0]?.id)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {expandedQuestionId ? 'Collapse All' : 'Expand First'}
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isExpanded = expandedQuestionId === q.id;
                  const userAnswer = userAnswers[q.id]?.trim();
                  return (
                    <GlassCard key={q.id} className="overflow-hidden transition-all border-slate-800">
                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              {q.question}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                              <span>{q.category}</span>
                              <span>·</span>
                              <span className="text-purple-300">{q.difficulty}</span>
                              <span>·</span>
                              <span className={userAnswer ? 'text-emerald-400' : 'text-amber-400'}>
                                {userAnswer ? 'Answered' : 'Skipped / Unanswered'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 shrink-0 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-slate-950/60 border-t border-slate-800/80 space-y-4 animate-in fade-in">
                          {/* Candidate Answer */}
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Your Practice Response:</span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                              {userAnswer || (
                                <span className="italic text-slate-500">
                                  No response submitted for this question during the session.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Benchmark Model Answer */}
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Suggested Benchmark Model Answer:</span>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200/90 leading-relaxed font-sans">
                              {q.suggestedModelAnswer}
                            </div>
                          </div>

                          {/* Key Evaluation Points */}
                          <div className="space-y-1 pt-1">
                            <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                              Key Evaluation Points:
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                              {q.keyEvaluationPoints.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Try Again & Retake (Requirement 14) */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Want to practice another role, level, or difficulty track?
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button3D
                  variant="cyan"
                  size="md"
                  onClick={resetSession}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="w-full sm:w-auto px-6"
                >
                  Try Again
                </Button3D>

                <Button3D
                  variant="dark"
                  size="md"
                  onClick={() => {
                    startSession();
                  }}
                  leftIcon={<RefreshCw className="w-4 h-4 text-purple-400" />}
                  className="w-full sm:w-auto px-6"
                >
                  Retake Same Interview
                </Button3D>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
