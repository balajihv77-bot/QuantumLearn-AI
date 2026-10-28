import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Clock, Lightbulb, Compass, Share2 } from 'lucide-react';
import { QuantumModule } from '../../types/quantum';
import { Button3D } from '../common/Button3D';
import { GlassCard } from '../common/GlassCard';
import { ModuleInteractiveDemonstrations } from './ModuleInteractiveDemonstrations';
import { ModuleKnowledgeCheck } from './ModuleKnowledgeCheck';
import { progressService } from '../../services/progressService';

interface ModuleLessonViewProps {
  module: QuantumModule;
  allModules: QuantumModule[];
  onNavigateModule: (moduleSlug: string) => void;
  onBackToList: () => void;
}

export const ModuleLessonView: React.FC<ModuleLessonViewProps> = ({
  module,
  allModules,
  onNavigateModule,
  onBackToList
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setIsCompleted(progressService.isModuleCompleted(module.id));

    const unsubscribe = progressService.subscribe(() => {
      setIsCompleted(progressService.isModuleCompleted(module.id));
    });

    return () => unsubscribe();
  }, [module.id]);

  const currentIndex = allModules.findIndex((m) => m.id === module.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  const handleToggleComplete = () => {
    const updated = progressService.toggleModuleCompletion(module.id);
    setIsCompleted(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBackToList}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Modules</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-cyan-400 font-bold tabular-nums">
            Module {module.moduleNumber} of {allModules.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>{module.durationMinutes} min read</span>
        </div>
      </div>

      {/* Module Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
          <span>{module.category}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 font-normal">{module.level} Level</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          {module.title}
        </h1>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          {module.description}
        </p>
      </div>

      {/* 1. Learning Objectives */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>Learning Objectives</span>
        </div>
        <ul className="space-y-2">
          {module.learningObjectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
              <span className="leading-relaxed">{obj}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* 2. Beginner-Friendly Explanation */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Conceptual Breakdown</span>
        </div>

        <div className="text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {module.beginnerExplanation}
        </div>
      </GlassCard>

      {/* 3. Concrete Example & Real-World Analogy */}
      <GlassCard className="p-6 sm:p-8 border border-purple-500/20 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
          <Lightbulb className="w-4 h-4" />
          <span>Concrete Example & Physical Intuition</span>
        </div>

        <h3 className="text-lg font-bold text-white">{module.example.title}</h3>

        {module.example.analogy && (
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
            <span className="font-bold text-purple-300">Analogy: </span>
            {module.example.analogy}
          </div>
        )}

        <p className="text-xs text-slate-300 leading-relaxed">
          {module.example.explanation}
        </p>

        {module.example.formulaOrCode && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
            {module.example.formulaOrCode}
          </div>
        )}
      </GlassCard>

      {/* 4. Interactive Demonstration */}
      <ModuleInteractiveDemonstrations
        demoType={module.interactiveDemo.type}
        title={module.interactiveDemo.title}
        instruction={module.interactiveDemo.instruction}
      />

      {/* 5. Knowledge-Check Questions */}
      <ModuleKnowledgeCheck
        moduleId={module.id}
        questions={module.knowledgeCheck}
        onQuizPassed={() => setIsCompleted(true)}
      />

      {/* Mark As Completed Action Banner */}
      <GlassCard glow className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-500/40">
        <div>
          <h4 className="text-base font-bold text-white">
            {isCompleted ? 'Module Completed! 🎉' : 'Ready to verify this topic?'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCompleted
              ? 'This module is recorded in your local student progress ledger.'
              : 'Mark as completed to update your learning streak and unlock scholar XP.'}
          </p>
        </div>

        <Button3D
          variant={isCompleted ? 'emerald' : 'cyan'}
          size="md"
          onClick={handleToggleComplete}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          className="shrink-0"
        >
          {isCompleted ? 'Completed (Click to Unmark)' : 'Mark as Completed'}
        </Button3D>
      </GlassCard>

      {/* Lesson Step Navigation Footer (Previous & Next) */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
        {prevModule ? (
          <Button3D
            variant="dark"
            size="md"
            onClick={() => onNavigateModule(prevModule.slug)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous: Module {prevModule.moduleNumber}
          </Button3D>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Button3D
            variant="cyan"
            size="md"
            onClick={() => onNavigateModule(nextModule.slug)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next: Module {nextModule.moduleNumber}
          </Button3D>
        ) : (
          <Button3D
            variant="purple"
            size="md"
            onClick={onBackToList}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Finish Curriculum
          </Button3D>
        )}
      </div>

    </div>
  );
};
