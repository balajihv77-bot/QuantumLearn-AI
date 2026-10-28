import React, { useState } from 'react';
import { Lightbulb, Terminal, Binary, AlertCircle, Compass, Sparkles } from 'lucide-react';
import { QuestionCategory, SuggestedQuestion } from '../../types/ai';

interface SuggestedQuestionsPanelProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: string) => void;
}

export const SuggestedQuestionsPanel: React.FC<SuggestedQuestionsPanelProps> = ({
  questions,
  onSelectQuestion
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Beginner', 'Mathematics', 'Code & Qiskit', 'Debugging', 'Roadmap'];

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Beginner':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Mathematics':
        return <Binary className="w-3.5 h-3.5 text-purple-400" />;
      case 'Code & Qiskit':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Debugging':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Roadmap':
        return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 shadow-sm'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat !== 'All' && getCategoryIcon(cat)}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q.question)}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left hover:border-cyan-400/60 hover:bg-slate-900/90 transition-all group flex flex-col justify-between cursor-pointer space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                {getCategoryIcon(q.category)}
                <span>{q.category}</span>
              </span>
              {q.badge && (
                <span className="text-[10px] text-cyan-400/80 font-semibold font-mono">
                  #{q.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-200 font-medium group-hover:text-white leading-relaxed">
              {q.question}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
};
