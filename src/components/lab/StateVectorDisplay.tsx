import React, { useState } from 'react';
import { BarChart3, Atom, Eye, Layers, Percent } from 'lucide-react';
import { SimulationResult, AmplitudeEntry } from '../../types/quantum';
import { GlassCard } from '../common/GlassCard';

interface StateVectorDisplayProps {
  simulation: SimulationResult | null;
}

export const StateVectorDisplay: React.FC<StateVectorDisplayProps> = ({ simulation }) => {
  const [viewTab, setViewTab] = useState<'probabilities' | 'amplitudes' | 'shots'>('probabilities');

  if (!simulation) {
    return (
      <GlassCard className="p-8 text-center text-slate-400">
        <Atom className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
        <p className="text-sm font-medium">Click "Run Simulation" to execute the quantum state vector calculation.</p>
      </GlassCard>
    );
  }

  const { stateVector, diracNotation, probabilities, measurementCounts, shots, numQubits } = simulation;

  return (
    <GlassCard glow className="p-5 sm:p-7 space-y-6">
      
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">Quantum State Analysis</span>
          <h3 className="text-base font-bold text-white mt-0.5">Simulation State Output</h3>
        </div>

        <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setViewTab('probabilities')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewTab === 'probabilities'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Probabilities
          </button>
          <button
            onClick={() => setViewTab('amplitudes')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewTab === 'amplitudes'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Complex Amplitudes
          </button>
          <button
            onClick={() => setViewTab('shots')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewTab === 'shots'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {shots} Measurement Shots
          </button>
        </div>
      </div>

      {/* Dirac Bra-Ket Notation Representation */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
          Normalized State Vector |Ψ⟩
        </span>
        <div className="font-mono text-sm sm:text-base font-bold text-cyan-200 break-all leading-relaxed">
          |Ψ⟩ = {diracNotation}
        </div>
      </div>

      {/* 1. BORN RULE PROBABILITIES VIEW */}
      {viewTab === 'probabilities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Computational Basis |x⟩</span>
            <span>Theoretical Probability P(|x⟩)</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stateVector.map((entry) => {
              const probPercent = (entry.probability * 100).toFixed(1);
              const isSignificant = entry.probability > 0.001;

              return (
                <div
                  key={entry.basis}
                  className={`p-3 rounded-xl border transition-all ${
                    isSignificant
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-slate-950/20 border-slate-900/60 opacity-40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span>|{entry.basis}⟩</span>
                      {isSignificant && (
                        <span className="text-[10px] text-cyan-400 font-sans font-normal">
                          (mag: {entry.magnitude.toFixed(3)})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-cyan-300 tabular-nums">{probPercent}%</span>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${probPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. COMPLEX AMPLITUDES TABLE VIEW */}
      {viewTab === 'amplitudes' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2 px-3">Basis |x⟩</th>
                <th className="py-2 px-3">Real (α_r)</th>
                <th className="py-2 px-3">Imag (α_i)</th>
                <th className="py-2 px-3">Magnitude |α|</th>
                <th className="py-2 px-3">Phase (Rad / Deg)</th>
                <th className="py-2 px-3">Probability |α|²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {stateVector.map((entry) => (
                <tr
                  key={entry.basis}
                  className={`hover:bg-slate-900/30 transition-colors ${
                    entry.magnitude > 0.001 ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-cyan-300">|{entry.basis}⟩</td>
                  <td className="py-2 px-3 tabular-nums">{entry.real.toFixed(4)}</td>
                  <td className="py-2 px-3 tabular-nums">{entry.imag.toFixed(4)}</td>
                  <td className="py-2 px-3 font-bold tabular-nums text-purple-300">{entry.magnitude.toFixed(4)}</td>
                  <td className="py-2 px-3 tabular-nums text-slate-400">
                    {entry.phaseRad.toFixed(2)} rad ({entry.phaseDeg.toFixed(0)}°)
                  </td>
                  <td className="py-2 px-3 font-bold text-cyan-400 tabular-nums">
                    {(entry.probability * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. MEASUREMENT SHOTS HISTOGRAM */}
      {viewTab === 'shots' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Sampling across {shots} simulated quantum shots</span>
            <span className="font-mono text-cyan-400">Monte Carlo Born Sampling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(measurementCounts).map(([basis, count]) => {
              const empiricalPercent = ((count / shots) * 100).toFixed(1);
              const theoreticalPercent = ((probabilities[basis] || 0) * 100).toFixed(1);
              const isSignificant = count > 0;

              return (
                <div
                  key={basis}
                  className={`p-3.5 rounded-xl border ${
                    isSignificant
                      ? 'bg-slate-950/70 border-slate-800'
                      : 'bg-slate-950/30 border-slate-900/60 opacity-30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-slate-200 text-xs">|{basis}⟩</span>
                    <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
                      {count} shots ({empiricalPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                      style={{ width: `${empiricalPercent}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Theoretical: {theoreticalPercent}%</span>
                    <span>Δ: {Math.abs(parseFloat(empiricalPercent) - parseFloat(theoreticalPercent)).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </GlassCard>
  );
};
