import React from 'react';
import { Cpu, ArrowUpRight } from 'lucide-react';
import { QuantumAlgorithm } from '../../types/quantum';
import { GlassCard } from '../common/GlassCard';
import { Button3D } from '../common/Button3D';

export interface AlgorithmCardProps {
  algorithm: QuantumAlgorithm;
  onExplore: (algorithm: QuantumAlgorithm) => void;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ algorithm, onExplore }) => {
  return (
    <GlassCard hoverEffect className="p-6 flex flex-col justify-between group">
      <div>
        {/* Unboxed Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
          <span className="text-purple-400">{algorithm.quantumSpeedup}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{algorithm.difficulty}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{algorithm.inventor} ({algorithm.yearIntroduced})</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
          {algorithm.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
          {algorithm.summary}
        </p>

        {/* Complexity Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Classical</span>
            <span className="font-mono text-xs text-slate-300 tabular-nums">{algorithm.classicalComplexity}</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 block font-semibold">Quantum</span>
            <span className="font-mono text-xs text-cyan-300 font-bold tabular-nums">{algorithm.quantumComplexity}</span>
          </div>
        </div>

        {/* Qubit requirement */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{algorithm.qubitRequirement}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <Button3D
          variant="purple"
          size="sm"
          fullWidth
          onClick={() => onExplore(algorithm)}
          rightIcon={<ArrowUpRight className="w-4 h-4" />}
        >
          Explore Algorithm & Circuit
        </Button3D>
      </div>
    </GlassCard>
  );
};
