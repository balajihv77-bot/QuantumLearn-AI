import React, { useState } from 'react';
import { Compass, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { IndividualQubitState } from '../../types/quantum';
import { BlochSphere3D } from '../visualization/BlochSphere3D';
import { GlassCard } from '../common/GlassCard';

interface SubsystemBlochViewProps {
  individualQubits: IndividualQubitState[];
}

export const SubsystemBlochView: React.FC<SubsystemBlochViewProps> = ({ individualQubits }) => {
  const [selectedQubitIdx, setSelectedQubitIdx] = useState<number>(0);

  if (!individualQubits || individualQubits.length === 0) {
    return null;
  }

  const currentQubit = individualQubits[selectedQubitIdx] || individualQubits[0];

  return (
    <GlassCard glow className="p-5 sm:p-7 space-y-6">
      
      {/* Header & Qubit Wire Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Single-Qubit Subsystem Geometry</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">Reduced State & Bloch Representation</h3>
        </div>

        {/* Wire Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-medium">
          {individualQubits.map((q) => (
            <button
              key={q.qubitIndex}
              onClick={() => setSelectedQubitIdx(q.qubitIndex)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedQubitIdx === q.qubitIndex
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>q[{q.qubitIndex}]</span>
              {q.isEntangled ? (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Entangled Subsystem" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Pure State" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MATHEMATICAL RIGOR: Distinction between Pure Separable state and Entangled Mixed state */}
      {currentQubit.isEntangled ? (
        /* Entangled Mixed Subsystem Alert */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Qubit q[{currentQubit.qubitIndex}] is in an Entangled Mixed State</span>
            </div>
            <p className="leading-relaxed text-purple-200/90">
              This qubit is entangled with other circuit qubits. According to quantum mechanics, an entangled subsystem cannot be described by a pure state vector on the surface of the Bloch sphere (|r| &lt; 1).
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-purple-300">
              <span>Purity Tr(ρ²): {currentQubit.purity.toFixed(3)} (Max mixed = 0.50)</span>
              <span>Bloch Vector Length |r|: {Math.sqrt(currentQubit.blochVector.x ** 2 + currentQubit.blochVector.y ** 2 + currentQubit.blochVector.z ** 2).toFixed(3)}</span>
            </div>
          </div>

          {/* Reduced Density Matrix Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Reduced Density Matrix ρ[{currentQubit.qubitIndex}] (Partial Trace):</span>
              <span className="text-cyan-400">P(|0⟩): {(currentQubit.prob0 * 100).toFixed(1)}% | P(|1⟩): {(currentQubit.prob1 * 100).toFixed(1)}%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-slate-300 flex justify-center">
              <div className="space-y-1">
                <div>[ {currentQubit.prob0.toFixed(3)} , {(currentQubit.blochVector.x / 2).toFixed(3)} - {(currentQubit.blochVector.y / 2).toFixed(3)}i ]</div>
                <div>[ {(currentQubit.blochVector.x / 2).toFixed(3)} + {(currentQubit.blochVector.y / 2).toFixed(3)}i , {currentQubit.prob1.toFixed(3)} ]</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center pt-1">
              * A pure single-qubit Bloch sphere is omitted here to preserve physical accuracy and avoid false representation of non-separable states.
            </div>
          </div>
        </div>
      ) : (
        /* Pure Separable State - Render 3D Bloch Sphere */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* 3D Bloch Sphere Viewport (7 cols) */}
          <div className="md:col-span-7">
            <div className="h-[360px] w-full rounded-2xl bg-slate-950/90 border border-cyan-500/20 overflow-hidden relative">
              <BlochSphere3D
                theta={currentQubit.theta}
                phi={currentQubit.phi}
                interactive={true}
                autoRotate={false}
              />
            </div>
          </div>

          {/* Coordinates & Angles Information (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Pure Separable Subsystem (Purity: {currentQubit.purity.toFixed(3)})</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-400 uppercase text-[10px] font-bold">Spherical Coordinates</div>
              <div className="text-slate-200">Polar Angle θ: {(currentQubit.theta * 180 / Math.PI).toFixed(1)}° ({(currentQubit.theta / Math.PI).toFixed(2)}π)</div>
              <div className="text-slate-200">Azimuth Angle φ: {(currentQubit.phi * 180 / Math.PI).toFixed(1)}° ({(currentQubit.phi / Math.PI).toFixed(2)}π)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-400 uppercase text-[10px] font-bold">Bloch Vector (x, y, z)</div>
              <div className="text-cyan-300">
                x = {currentQubit.blochVector.x.toFixed(3)}, y = {currentQubit.blochVector.y.toFixed(3)}, z = {currentQubit.blochVector.z.toFixed(3)}
              </div>
              <div className="text-slate-400 text-[11px]">Radius |r| = 1.000 (Pure State Surface)</div>
            </div>
          </div>

        </div>
      )}

    </GlassCard>
  );
};
