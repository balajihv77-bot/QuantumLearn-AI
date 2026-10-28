import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '../../types/quantum';
import { Button3D } from '../common/Button3D';
import { GlassCard } from '../common/GlassCard';
import { progressService } from '../../services/progressService';

interface ModuleKnowledgeCheckProps {
  moduleId: string;
  questions: QuizQuestion[];
  onQuizPassed?: () => void;
}

export const ModuleKnowledgeCheck: React.FC<ModuleKnowledgeCheckProps> = ({
  moduleId,
  questions,
  onQuizPassed
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    progressService.saveModuleQuizScore(moduleId, correctCount, questions.length);

    if (correctCount === questions.length && onQuizPassed) {
      onQuizPassed();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <GlassCard className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Award className="w-4 h-4" />
            <span>Formative Knowledge Verification</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Concept Mastery Check</h3>
        </div>
        {isSubmitted && (
          <div className="font-mono text-sm px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold tabular-nums">
            Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];

          return (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-xs text-cyan-400 mt-0.5">
                  Q{qIndex + 1}.
                </span>
                <p className="text-sm font-semibold text-slate-100 leading-snug">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1 pl-6">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrect = opt.id === q.correctOptionId;
                  const isWrong = isSubmitted && isSelected && !isCorrect;

                  let styleClass = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

                  if (isSelected && !isSubmitted) {
                    styleClass = 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-sm';
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      styleClass = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 font-semibold';
                    } else if (isWrong) {
                      styleClass = 'border-rose-500 bg-rose-950/30 text-rose-200';
                    } else {
                      styleClass = 'opacity-50 border-slate-900 bg-slate-950/40 text-slate-500';
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${styleClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold uppercase w-5 h-5 rounded flex items-center justify-center bg-slate-900 text-slate-400 text-[11px] shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isWrong && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Scientific Explanation after Submission */}
              {isSubmitted && (
                <div className="ml-6 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Scientific Context:</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        {!isSubmitted ? (
          <Button3D
            variant="cyan"
            size="md"
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            Check Answers
          </Button3D>
        ) : (
          <Button3D
            variant="dark"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retake Verification
          </Button3D>
        )}
      </div>

    </GlassCard>
  );
};
