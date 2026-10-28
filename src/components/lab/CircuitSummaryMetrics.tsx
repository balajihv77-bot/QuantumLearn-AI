import React, { useState } from 'react';
import { Cpu, Layers, Sparkles, CheckCircle2, ShieldCheck, Timer, TestTube, Check, X } from 'lucide-react';
import { SimulationResult } from '../../types/quantum';
import { GlassCard } from '../common/GlassCard';
import { Button3D } from '../common/Button3D';
import { QuantumSimulatorEngine } from '../../services/quantumSimulator';

interface CircuitSummaryMetricsProps {
  simulation: SimulationResult | null;
}

export const CircuitSummaryMetrics: React.FC<CircuitSummaryMetricsProps> = ({ simulation }) => {
  const [selfTestResults, setSelfTestResults] = useState<{ name: string; passed: boolean; details: string }[] | null>(null);

  const handleRunSelfTests = () => {
    const results = QuantumSimulatorEngine.runSelfTests();
    setSelfTestResults(results);
  };

  if (!simulation) {
    return null;
  }

  const { numQubits, totalGates, multiQubitGates, circuitDepth, isEntangled, executionTimeMs } = simulation;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Qubit Wires</span>
          <div className="text-xl font-mono font-bold text-cyan-300 mt-1 tabular-nums">{numQubits}</div>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Total Gates</span>
          <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">{totalGates}</div>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">2-Qubit Gates</span>
          <div className="text-xl font-mono font-bold text-purple-300 mt-1 tabular-nums">{multiQubitGates}</div>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Circuit Depth</span>
          <div className="text-xl font-mono font-bold text-slate-200 mt-1 tabular-nums">{circuitDepth} steps</div>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Quantum State</span>
          <div className="text-xs font-mono font-bold mt-2 tabular-nums">
            {isEntangled ? (
              <span className="text-purple-400">Entangled</span>
            ) : (
              <span className="text-emerald-400">Separable</span>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Engine Latency</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1 tabular-nums">{executionTimeMs} ms</div>
        </GlassCard>
      </div>

      {/* Simulator Self-Test Verification Banner */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <TestTube className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Verify Simulator Engine: Run mathematical self-tests against known Bell states, Hadamard superposition, Pauli gates, and GHZ states.
          </span>
        </div>

        <Button3D
          variant="dark"
          size="sm"
          onClick={handleRunSelfTests}
          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          className="shrink-0"
        >
          Run Engine Self-Tests
        </Button3D>
      </GlassCard>

      {/* Self-Test Output Drawer */}
      {selfTestResults && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 animate-fade-in text-xs">
          <div className="flex justify-between items-center font-bold text-slate-200">
            <span className="text-cyan-400 uppercase tracking-wider text-[11px]">Reproducible Simulator Test Suite</span>
            <span className="text-emerald-400 font-mono">
              {selfTestResults.filter((t) => t.passed).length} / {selfTestResults.length} Passed
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {selfTestResults.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  {t.passed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-slate-200 font-medium">{t.name}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{t.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
