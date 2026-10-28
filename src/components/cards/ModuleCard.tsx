import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { QuantumModule } from '../../types/quantum';
import { GlassCard } from '../common/GlassCard';
import { Button3D } from '../common/Button3D';
import { progressService } from '../../services/progressService';

export interface ModuleCardProps {
  module: QuantumModule;
  onSelect: (module: QuantumModule) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onSelect }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(() =>
    progressService.isModuleCompleted(module.id)
  );

  useEffect(() => {
    const check = () => setIsCompleted(progressService.isModuleCompleted(module.id));
    check();
    return progressService.subscribe(check);
  }, [module.id]);

  const percentComplete = isCompleted ? 100 : 0;

  return (
    <GlassCard hoverEffect className="p-6 flex flex-col justify-between group">
      <div>
        {/* Unboxed clean metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
          <span className="font-mono text-cyan-400 font-bold">Module {module.moduleNumber}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{module.category}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums">{module.durationMinutes} min</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
          {module.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
          {module.description}
        </p>

        {/* Topics preview */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            <span className="text-slate-400 font-medium">Core Concepts: </span>
            <span className="text-slate-400">
              {module.topicsCovered.slice(0, 2).join(' · ')}
              {module.topicsCovered.length > 2 && ' · more'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tabular-nums">{isCompleted ? 'Completed' : 'Not started'}</span>
          </span>
          <span className="font-mono tabular-nums text-slate-300">{percentComplete}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* 3D Action Button */}
        <Button3D
          variant={isCompleted ? 'dark' : 'cyan'}
          size="sm"
          fullWidth
          onClick={() => onSelect(module)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          leftIcon={isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : undefined}
        >
          {isCompleted ? 'Review Lesson' : 'Start Module'}
        </Button3D>
      </div>
    </GlassCard>
  );
};

