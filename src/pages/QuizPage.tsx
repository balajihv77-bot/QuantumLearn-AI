import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Trophy } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { DEMO_QUIZZES } from '../data/demoData';

import { apiClient } from '../services/apiClient';
import { progressService } from '../services/progressService';

export const QuizPage: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  const currentQ = DEMO_QUIZZES[currentQuestionIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const updatedAnswers = { ...userAnswers, [currentQ.id]: selectedOptionId };
    setUserAnswers(updatedAnswers);

    if (selectedOptionId === currentQ.correctOptionId) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 < DEMO_QUIZZES.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
      // Persist results
      const finalAnswers = selectedOptionId ? { ...userAnswers, [currentQ.id]: selectedOptionId } : userAnswers;
      try {
        await apiClient.submitQuiz('quiz-fundamentals', finalAnswers);
        setSubmissionNotice('Result persisted to backend database (+XP awarded).');
      } catch {
        // Local persistence fallback
        progressService.saveQuizScore('quiz-fundamentals', score, DEMO_QUIZZES.length);
        setSubmissionNotice('Result saved to offline local storage.');
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Formative Assessment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Quantum Challenges & Quizzes</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Test your conceptual understanding of unitary gates, entanglement mechanics, Born rule measurements, and algorithmic speedups.
        </p>
      </div>

      {!isQuizComplete ? (
        <GlassCard glow className="p-6 sm:p-8">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6 text-xs text-slate-400">
            <div>
              <span>Question </span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {currentQuestionIndex + 1}
              </span>
              <span> of {DEMO_QUIZZES.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-purple-300 font-medium">{currentQ.category}</span>
              <span aria-hidden="true">·</span>
              <span>{currentQ.difficulty}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / DEMO_QUIZZES.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-snug">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === currentQ.correctOptionId;
              const isWrong = isAnswerSubmitted && isSelected && !isCorrect;

              let optionStyle = 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700';

              if (isSelected && !isAnswerSubmitted) {
                optionStyle = 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-md shadow-cyan-500/10';
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 font-semibold';
                } else if (isWrong) {
                  optionStyle = 'border-rose-500 bg-rose-950/30 text-rose-200';
                } else {
                  optionStyle = 'opacity-50 border-slate-900 bg-slate-950/40 text-slate-400';
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg font-mono text-xs font-bold uppercase flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                      {option.id}
                    </span>
                    <span className="text-sm">{option.text}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {isWrong && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Answer Explanation Banner (after submission) */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 mb-8 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>Concept Explanation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Current score: <span className="font-mono font-bold text-cyan-300 tabular-nums">{score}</span>
            </div>

            {!isAnswerSubmitted ? (
              <Button3D
                variant="cyan"
                size="md"
                disabled={!selectedOptionId}
                onClick={handleSubmitAnswer}
              >
                Submit Answer
              </Button3D>
            ) : (
              <Button3D
                variant={currentQuestionIndex + 1 < DEMO_QUIZZES.length ? 'cyan' : 'emerald'}
                size="md"
                onClick={handleNextQuestion}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {currentQuestionIndex + 1 < DEMO_QUIZZES.length ? 'Next Question' : 'Complete Challenge'}
              </Button3D>
            )}
          </div>

        </GlassCard>
      ) : (
        /* Quiz Complete Screen */
        <GlassCard glow className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-400/40 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Challenge Completed!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            You achieved <span className="font-mono font-bold text-cyan-300 tabular-nums">{score}</span> out of{' '}
            <span className="font-mono font-bold text-cyan-300 tabular-nums">{DEMO_QUIZZES.length}</span> correct answers.
          </p>

          <div className="p-4 max-w-xs mx-auto rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
            <div className="text-xs text-slate-400">Score percentage</div>
            <div className="text-3xl font-extrabold font-mono text-cyan-300 tabular-nums mt-1">
              {Math.round((score / DEMO_QUIZZES.length) * 100)}%
            </div>
          </div>

          {submissionNotice && (
            <div className="p-3 max-w-md mx-auto rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 mb-8 animate-fade-in">
              {submissionNotice}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button3D
              variant="cyan"
              size="md"
              onClick={handleRestartQuiz}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Retake Challenge
            </Button3D>
          </div>
        </GlassCard>
      )}

    </div>
  );
};
