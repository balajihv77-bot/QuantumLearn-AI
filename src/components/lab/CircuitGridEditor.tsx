import React from 'react';
import { Plus, Minus, RotateCcw, Undo2, Redo2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { DEMO_GATES } from '../../data/demoData';
import { Button3D } from '../common/Button3D';
import { GlassCard } from '../common/GlassCard';

interface CircuitGridEditorProps {
  numQubits: number;
  numSteps: number;
  grid: (string | null)[][];
  selectedGate: string;
  onSelectGate: (gateId: string) => void;
  onCellClick: (qubitIdx: number, stepIdx: number) => void;
  onAddQubit: () => void;
  onRemoveQubit: () => void;
  onAddStep: () => void;
  onRemoveStep: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onReset: () => void;
  validationErrors: string[];
}

export const CircuitGridEditor: React.FC<CircuitGridEditorProps> = ({
  numQubits,
  numSteps,
  grid,
  selectedGate,
  onSelectGate,
  onCellClick,
  onAddQubit,
  onRemoveQubit,
  onAddStep,
  onRemoveStep,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onReset,
  validationErrors
}) => {
  return (
    <div className="space-y-6">
      
      {/* Gate Selection Toolbox Panel */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gate Selection Palette</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Select a gate, then click wire cell to place or remove
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DEMO_GATES.map((gate) => {
            const isSelected = selectedGate === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => onSelectGate(gate.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-500/25 scale-105'
                    : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={`${gate.name}: ${gate.description}`}
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs"
                  style={{ backgroundColor: `${gate.color}30`, color: gate.color }}
                >
                  {gate.symbol}
                </span>
                <span>{gate.name}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Circuit Grid Canvas & Wire Controls */}
      <GlassCard glow className="p-5 sm:p-7 overflow-x-auto">
        
        {/* Wire & Step Management Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800/80">
          
          {/* Qubit & Step Count Adjusters */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-semibold text-slate-400 px-2">Qubits:</span>
              <button
                onClick={onRemoveQubit}
                disabled={numQubits <= 1}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Remove lowest qubit wire"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-cyan-300 px-1">{numQubits}</span>
              <button
                onClick={onAddQubit}
                disabled={numQubits >= 5}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Add qubit wire (max 5)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-semibold text-slate-400 px-2">Time Steps:</span>
              <button
                onClick={onRemoveStep}
                disabled={numSteps <= 4}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Remove last time step"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-purple-300 px-1">{numSteps}</span>
              <button
                onClick={onAddStep}
                disabled={numSteps >= 10}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Add time step (max 10)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Undo / Redo / Reset Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Undo last gate action"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Redo action"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-rose-300 hover:border-rose-500/40 cursor-pointer transition-colors"
              title="Clear all gates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Banner */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Circuit Configuration Warning:</span>
              {validationErrors.map((err, i) => (
                <div key={i} className="text-amber-300/90 leading-relaxed">• {err}</div>
              ))}
            </div>
          </div>
        )}

        {/* The Grid Canvas */}
        <div style={{ minWidth: `${Math.max(480, numSteps * 75 + 100)}px` }}>
          
          {/* Timeline Step Headers */}
          <div className="flex items-center mb-3">
            <div className="w-20 shrink-0 text-xs font-mono font-semibold text-slate-500">Register</div>
            <div className="flex-1 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${numSteps}, minmax(0, 1fr))` }}>
              {Array.from({ length: numSteps }).map((_, stepIdx) => (
                <div key={stepIdx} className="text-center text-[11px] font-mono text-slate-400">
                  t{stepIdx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Qubit Wires */}
          <div className="space-y-5 relative">
            {Array.from({ length: numQubits }).map((_, qIdx) => (
              <div key={qIdx} className="relative flex items-center">
                
                {/* Qubit Wire Head */}
                <div className="w-20 shrink-0 flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400">q[{qIdx}]</span>
                  <span className="text-[11px] text-slate-500 font-mono">|0⟩</span>
                </div>

                {/* Horizontal Wire Line */}
                <div className="absolute left-20 right-0 h-0.5 bg-slate-700/80 z-0" />

                {/* Step Cells */}
                <div
                  className="flex-1 grid gap-2.5 relative z-10 pl-2"
                  style={{ gridTemplateColumns: `repeat(${numSteps}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: numSteps }).map((_, sIdx) => {
                    const cellGate = grid[qIdx]?.[sIdx] || null;

                    return (
                      <div
                        key={sIdx}
                        onClick={() => onCellClick(qIdx, sIdx)}
                        className={`h-13 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                          cellGate
                            ? 'border-cyan-400/60 bg-slate-900/95 shadow-md shadow-cyan-500/10 scale-102'
                            : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/40'
                        }`}
                        title={cellGate ? `Click to remove ${cellGate}` : `Click to place ${selectedGate}`}
                      >
                        {cellGate === 'CNOT_CTRL' && (
                          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                        )}
                        {cellGate === 'CNOT_TGT' && (
                          <div className="w-7 h-7 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-sm">
                            ⊕
                          </div>
                        )}
                        {cellGate && cellGate !== 'CNOT_CTRL' && cellGate !== 'CNOT_TGT' && (
                          <span
                            className="w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center text-white"
                            style={{
                              background: cellGate === 'H' ? 'linear-gradient(180deg, #06b6d4, #0284c7)' :
                                          cellGate === 'X' ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)' :
                                          cellGate === 'Y' ? 'linear-gradient(180deg, #8b5cf6, #6d28d9)' :
                                          cellGate === 'Z' ? 'linear-gradient(180deg, #ec4899, #be185d)' :
                                          cellGate === 'S' ? 'linear-gradient(180deg, #10b981, #047857)' :
                                          cellGate === 'T' ? 'linear-gradient(180deg, #f59e0b, #b45309)' :
                                          '#475569',
                              boxShadow: '0 2px 0 rgba(0,0,0,0.4)'
                            }}
                          >
                            {cellGate === 'M' ? '∡' : cellGate}
                          </span>
                        )}
                        {!cellGate && (
                          <span className="text-slate-800 text-xs font-mono select-none">+</span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Visual CNOT Connection Vertical Lines */}
        {/* Shown automatically via step indicators */}
      </GlassCard>

    </div>
  );
};
