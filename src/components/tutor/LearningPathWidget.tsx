import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, CheckCircle2, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';
import { progressService } from '../../services/progressService';
import { DEMO_MODULES, DEMO_ALGORITHMS } from '../../data/demoData';
import { GlassCard } from '../common/GlassCard';

interface LearningPathWidgetProps {
  onAskTutorTopic: (topic: string) => void;
}

export const LearningPathWidget: React.FC<LearningPathWidgetProps> = ({ onAskTutorTopic }) => {
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>(progressService.getCompletedModuleIds());

  useEffect(() => {
    const unsubscribe = progressService.subscribe(() => {
      setCompletedIds(progressService.getCompletedModuleIds());
    });
    return unsubscribe;
  }, []);

  const totalModules = DEMO_MODULES.length;
  const progressPercent = Math.round((completedIds.length / totalModules) * 100);

  // Find the first uncompleted module
  const nextModule = DEMO_MODULES.find((m) => !completedIds.includes(m.id)) || DEMO_MODULES[0];

  // Find a suggested algorithm corresponding to current level
  const suggestedAlgo = completedIds.includes('mod-5')
    ? DEMO_ALGORITHMS.find((a) => a.id === 'grover-search') || DEMO_ALGORITHMS[0]
    : DEMO_ALGORITHMS.find((a) => a.id === 'bell-state') || DEMO_ALGORITHMS[0];

  return (
    <GlassCard glow className="p-4 sm:p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Personalized Learning Roadmap</h4>
            <div className="text-sm font-bold text-white">Your Quantum Path</div>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{completedIds.length} of {totalModules} modules mastered</span>
          <span className="font-semibold text-slate-300">{totalModules - completedIds.length} remaining</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Recommended Next Module Card */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Recommended Lesson
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            {nextModule.level}
          </span>
        </div>

        <div className="text-xs font-bold text-white leading-tight">
          Module {nextModule.moduleNumber}: {nextModule.title}
        </div>

        <p className="text-[11px] text-slate-400 line-clamp-2">
          {nextModule.description}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onAskTutorTopic(`Help me understand Module ${nextModule.moduleNumber}: ${nextModule.title}. What are the key concepts?`)}
            className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 transition-colors cursor-pointer text-center"
          >
            Ask Tutor About This
          </button>

          <button
            onClick={() => navigate(`/modules?module=${nextModule.id}`)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            title="Open Module Lesson"
          >
            <span>Open</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggested Algorithm Pairing */}
      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            Algorithm Spotlight
          </span>
          <span className="text-[10px] font-mono text-purple-400">{suggestedAlgo.difficulty}</span>
        </div>

        <div className="text-xs font-semibold text-purple-100">
          {suggestedAlgo.title}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onAskTutorTopic(`Explain ${suggestedAlgo.title} and give me the core quantum circuit walkthrough.`)}
            className="text-[11px] text-purple-300 hover:text-purple-200 hover:underline cursor-pointer font-medium"
          >
            Explain with Math & Code →
          </button>
        </div>
      </div>

    </GlassCard>
  );
};
