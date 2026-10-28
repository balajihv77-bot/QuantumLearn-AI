import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, CheckCircle2, Sliders, ArrowRight, Eye, Atom, Zap } from 'lucide-react';
import { Button3D } from '../common/Button3D';
import { GlassCard } from '../common/GlassCard';
import { DEMO_GATES } from '../../data/demoData';

interface InteractiveDemoProps {
  demoType: string;
  title: string;
  instruction: string;
}

export const ModuleInteractiveDemonstrations: React.FC<InteractiveDemoProps> = ({
  demoType,
  title,
  instruction
}) => {
  // Demo 1: Exponential Scaling Explorer
  const [numQubitsScale, setNumQubitsScale] = useState<number>(10);

  // Demo 2: Bits vs Qubits
  const [classicalBit, setClassicalBit] = useState<0 | 1>(0);
  const [qubitTheta, setQubitTheta] = useState<number>(Math.PI / 3);

  // Demo 3: Bloch Sphere state coordinates
  const [sphereLat, setSphereLat] = useState<number>(60); // degrees
  const [sphereLong, setSphereLong] = useState<number>(45);

  // Demo 4: Superposition Spinner
  const [spinnerPhase, setSpinnerPhase] = useState<number>(0);
  const [isSuperpositionPlaying, setIsSuperpositionPlaying] = useState<boolean>(false);

  // Demo 5: Entanglement Bell pair
  const [entangledPair, setEntangledPair] = useState<{
    created: boolean;
    aliceMeasured: boolean;
    bobMeasured: boolean;
    aliceVal: number | null;
    bobVal: number | null;
  }>({
    created: false,
    aliceMeasured: false,
    bobMeasured: false,
    aliceVal: null,
    bobVal: null
  });

  // Demo 6: Measurement Collapse
  const [collapseState, setCollapseState] = useState<'superposition' | 'collapsed-0' | 'collapsed-1'>('superposition');
  const [measurementCounts, setMeasurementCounts] = useState<{ zeroes: number; ones: number }>({ zeroes: 0, ones: 0 });

  // Demo 7: Gates Sandbox
  const [activeGateId, setActiveGateId] = useState<string>('H');

  // Demo 8: Circuit Builder mini
  const [wire0Gate, setWire0Gate] = useState<string | null>('H');
  const [wire1Gate, setWire1Gate] = useState<string | null>('CNOT_TGT');

  // Demo 9: Algorithm Complexity Race
  const [searchSize, setSearchSize] = useState<number>(10000);

  // Handlers
  const handleEntangleCreate = () => {
    setEntangledPair({
      created: true,
      aliceMeasured: false,
      bobMeasured: false,
      aliceVal: null,
      bobVal: null
    });
  };

  const handleMeasureAlice = () => {
    if (!entangledPair.created || entangledPair.aliceMeasured) return;
    const outcome = Math.random() < 0.5 ? 0 : 1;
    setEntangledPair({
      created: true,
      aliceMeasured: true,
      bobMeasured: true, // Instantly collapses Bob due to Bell state!
      aliceVal: outcome,
      bobVal: outcome
    });
  };

  const handleResetEntangle = () => {
    setEntangledPair({
      created: false,
      aliceMeasured: false,
      bobMeasured: false,
      aliceVal: null,
      bobVal: null
    });
  };

  const handlePerformMeasurement = () => {
    const outcome = Math.random() < 0.5 ? 0 : 1;
    setCollapseState(outcome === 0 ? 'collapsed-0' : 'collapsed-1');
    setMeasurementCounts((prev) => ({
      zeroes: outcome === 0 ? prev.zeroes + 1 : prev.zeroes,
      ones: outcome === 1 ? prev.ones + 1 : prev.ones
    }));
  };

  const handleResetMeasurement = () => {
    setCollapseState('superposition');
  };

  return (
    <GlassCard glow className="p-5 sm:p-7 border border-cyan-500/30">
      
      {/* Demo Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Laboratory Demonstration</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{title}</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Live Client-Side Simulation
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <span className="font-semibold text-cyan-300">Instruction: </span>
        {instruction}
      </p>

      {/* RENDER DEMO BY TYPE */}

      {/* 1. INTRO SCALE DEMO */}
      {demoType === 'intro-scale' && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-medium text-slate-300">Number of Qubits in Quantum Register (N):</span>
              <span className="font-mono text-cyan-400 font-bold text-base tabular-nums">{numQubitsScale} Qubits</span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              value={numQubitsScale}
              onChange={(e) => setNumQubitsScale(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                Classical Bits Required to Describe State
              </span>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-slate-200 mt-2 break-all tabular-nums">
                2^{numQubitsScale} ≈ {numQubitsScale <= 30 ? Math.pow(2, numQubitsScale).toLocaleString() : `1.15 × 10^${Math.round(numQubitsScale * 0.30103)}`}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {numQubitsScale <= 10 && 'Easily stored on a basic calculator (1,024 values).'}
                {numQubitsScale > 10 && numQubitsScale <= 25 && 'Requires megabytes of classical RAM to track state vectors.'}
                {numQubitsScale > 25 && numQubitsScale <= 45 && 'Requires terabytes to petabytes — only high-performance supercomputers can simulate this.'}
                {numQubitsScale > 45 && 'Exceeds the total storage capacity of all computers on Earth combined!'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                Physical Quantum Hardware Register
              </span>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-cyan-300 mt-2 tabular-nums">
                {numQubitsScale} Physical Qubits
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                A single coherent register of {numQubitsScale} superconducting or ion-trap qubits naturally holds all 2^{numQubitsScale} complex amplitudes in parallel superposition.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. BITS VS QUBITS DEMO */}
      {demoType === 'bits-vs-qubits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Classical Bit Column */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Classical Bit (Discrete Switch)
              </span>
              <div className="flex items-center justify-center my-6">
                <button
                  onClick={() => setClassicalBit(classicalBit === 0 ? 1 : 0)}
                  className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-mono text-3xl font-bold transition-all cursor-pointer ${
                    classicalBit === 1
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border-2 border-amber-300'
                      : 'bg-slate-900 text-slate-400 border-2 border-slate-800'
                  }`}
                >
                  <span>{classicalBit}</span>
                  <span className="text-[10px] font-sans font-medium uppercase mt-1">
                    {classicalBit === 1 ? 'State: ON' : 'State: OFF'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Click switch to toggle between strictly 0 and strictly 1. No intermediate states exist.
              </p>
            </div>

            {/* Qubit Column */}
            <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-3">
                Qubit Vector (Continuous State)
              </span>
              
              {/* Amplitudes calculation */}
              {(() => {
                const alpha = Math.cos(qubitTheta / 2);
                const beta = Math.sin(qubitTheta / 2);
                const p0 = Math.round(alpha * alpha * 100);
                const p1 = Math.round(beta * beta * 100);

                return (
                  <div className="space-y-4 my-3">
                    <div className="font-mono text-xs text-cyan-200 font-semibold p-2 bg-slate-950/60 rounded-lg">
                      |ψ⟩ = {alpha.toFixed(2)}|0⟩ + {beta.toFixed(2)}|1⟩
                    </div>

                    <div className="space-y-2 text-left text-xs">
                      <div className="flex justify-between">
                        <span className="font-mono text-slate-300">P(|0⟩) = |α|²:</span>
                        <span className="font-mono text-cyan-300 font-bold tabular-nums">{p0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${p0}%` }} />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="font-mono text-slate-300">P(|1⟩) = |β|²:</span>
                        <span className="font-mono text-purple-300 font-bold tabular-nums">{p1}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400" style={{ width: `${p1}%` }} />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Rotate State Vector Angle θ:</label>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI}
                        step="0.05"
                        value={qubitTheta}
                        onChange={(e) => setQubitTheta(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* 3. BLOCH SPHERE COORDINATES */}
      {demoType === 'qubit-state-sphere' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Latitude θ (0° = North |0⟩, 180° = South |1⟩):
              </label>
              <input
                type="range"
                min="0"
                max="180"
                value={sphereLat}
                onChange={(e) => setSphereLat(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>0° (|0⟩)</span>
                <span>90° (Equator)</span>
                <span>180° (|1⟩)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Longitude φ (Azimuthal Relative Phase):
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={sphereLong}
                onChange={(e) => setSphereLong(parseInt(e.target.value, 10))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>0° (+X)</span>
                <span>90° (+Y)</span>
                <span>180° (-X)</span>
                <span>360°</span>
              </div>
            </div>
          </div>

          {/* Coordinate Output Card */}
          {(() => {
            const radTheta = (sphereLat * Math.PI) / 180;
            const radPhi = (sphereLong * Math.PI) / 180;
            const prob0 = Math.round(Math.pow(Math.cos(radTheta / 2), 2) * 100);
            const prob1 = 100 - prob0;

            return (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Coordinates</span>
                  <span className="font-mono text-sm text-slate-200 mt-1 block">
                    θ = {sphereLat}°, φ = {sphereLong}°
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-cyan-400 uppercase tracking-wider block font-semibold">Measurement P(|0⟩)</span>
                  <span className="font-mono text-lg font-bold text-cyan-300 mt-1 block tabular-nums">{prob0}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-purple-400 uppercase tracking-wider block font-semibold">Measurement P(|1⟩)</span>
                  <span className="font-mono text-lg font-bold text-purple-300 mt-1 block tabular-nums">{prob1}%</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. SUPERPOSITION SPINNER */}
      {demoType === 'superposition-spinner' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full border-4 border-dashed border-cyan-400 flex items-center justify-center font-mono text-xl font-bold text-white transition-transform duration-300 ${isSuperpositionPlaying ? 'animate-spin' : ''}`}>
                |+⟩
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-3">
              <Button3D
                variant="cyan"
                size="sm"
                onClick={() => setIsSuperpositionPlaying(!isSuperpositionPlaying)}
              >
                {isSuperpositionPlaying ? 'Pause Rotation' : 'Spin Superposition State'}
              </Button3D>
              <Button3D
                variant="dark"
                size="sm"
                onClick={() => setSpinnerPhase((prev) => (prev + 90) % 360)}
              >
                Shift Phase (+90°)
              </Button3D>
            </div>

            <div className="mt-4 text-xs font-mono text-slate-300">
              Current relative phase: <span className="text-cyan-400 font-bold">{spinnerPhase}°</span> | State: (1/√2)|0⟩ + e^(i{spinnerPhase}°)(1/√2)|1⟩
            </div>
          </div>
        </div>
      )}

      {/* 5. ENTANGLEMENT BELL DEMO */}
      {demoType === 'entanglement-bell' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Alice Qubit */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                Qubit A (Alice in Tokyo)
              </span>
              <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center font-mono text-2xl font-bold bg-slate-900 border border-slate-700 my-3">
                {entangledPair.aliceVal !== null ? (
                  <span className="text-cyan-300">|{entangledPair.aliceVal}⟩</span>
                ) : entangledPair.created ? (
                  <span className="text-purple-400 text-sm animate-pulse">Entangled</span>
                ) : (
                  <span className="text-slate-600">|0⟩</span>
                )}
              </div>
              <Button3D
                variant="cyan"
                size="sm"
                disabled={!entangledPair.created || entangledPair.aliceMeasured}
                onClick={handleMeasureAlice}
              >
                {entangledPair.aliceMeasured ? 'Measured' : 'Measure Qubit A'}
              </Button3D>
            </div>

            {/* Bob Qubit */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-center">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                Qubit B (Bob on Mars)
              </span>
              <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center font-mono text-2xl font-bold bg-slate-900 border border-slate-700 my-3">
                {entangledPair.bobVal !== null ? (
                  <span className="text-purple-300">|{entangledPair.bobVal}⟩</span>
                ) : entangledPair.created ? (
                  <span className="text-purple-400 text-sm animate-pulse">Entangled</span>
                ) : (
                  <span className="text-slate-600">|0⟩</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block pt-1.5">
                {entangledPair.bobMeasured ? 'Instantly collapsed to match Qubit A!' : 'Awaiting correlation collapse'}
              </span>
            </div>

          </div>

          <div className="flex justify-center gap-3">
            <Button3D
              variant="purple"
              size="md"
              disabled={entangledPair.created}
              onClick={handleEntangleCreate}
              leftIcon={<Atom className="w-4 h-4" />}
            >
              Generate Bell Pair (|00⟩ + |11⟩)/√2
            </Button3D>
            <Button3D
              variant="dark"
              size="md"
              onClick={handleResetEntangle}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Entangled Pair
            </Button3D>
          </div>
        </div>
      )}

      {/* 6. MEASUREMENT COLLAPSE DEMO */}
      {demoType === 'measurement-collapse' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qubit State Vector Before / After Measurement</div>
            <div className="p-3 max-w-sm mx-auto font-mono text-sm text-cyan-300 bg-slate-900 rounded-xl mb-4 font-semibold">
              {collapseState === 'superposition' && '|ψ⟩ = (|0⟩ + |1⟩) / √2'}
              {collapseState === 'collapsed-0' && '|ψ⟩ = |0⟩ (Collapsed onto ground state)'}
              {collapseState === 'collapsed-1' && '|ψ⟩ = |1⟩ (Collapsed onto excited state)'}
            </div>

            <div className="flex justify-center gap-3">
              <Button3D
                variant="cyan"
                size="md"
                onClick={handlePerformMeasurement}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Perform Projective Measurement
              </Button3D>
              <Button3D
                variant="dark"
                size="md"
                onClick={handleResetMeasurement}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset to Superposition
              </Button3D>
            </div>
          </div>

          {/* Histogram tallies */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-xs text-slate-400 font-mono">Count of |0⟩ Outcomes</span>
              <span className="text-2xl font-bold font-mono text-cyan-300 block mt-1 tabular-nums">
                {measurementCounts.zeroes}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono">Count of |1⟩ Outcomes</span>
              <span className="text-2xl font-bold font-mono text-purple-300 block mt-1 tabular-nums">
                {measurementCounts.ones}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. GATES SANDBOX DEMO */}
      {demoType === 'gates-sandbox' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_GATES.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGateId(g.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeGateId === g.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-500/20 scale-105'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {(() => {
            const gate = DEMO_GATES.find((g) => g.id === activeGateId) || DEMO_GATES[0];
            return (
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-mono">{gate.name} ({gate.symbol})</span>
                  <span className="text-xs text-cyan-400">{gate.category}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{gate.description}</p>
                
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Unitary Matrix:</span>
                  <div className="font-mono text-xs text-cyan-300 p-2.5 bg-slate-900 rounded-lg inline-block border border-slate-800">
                    {gate.matrix.map((row, i) => (
                      <div key={i}>[ {row.join(' , ')} ]</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 8. CIRCUITS BUILDER DEMO */}
      {demoType === 'circuits-builder' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">2-Qubit Bell Circuit Assembly</div>
            
            {/* Wires */}
            <div className="space-y-4 relative">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-cyan-400 w-10">q[0]:</span>
                <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center">
                  <div className="px-3 py-1 rounded bg-cyan-600 text-white font-mono text-xs font-bold shadow-md ml-6">
                    {wire0Gate || 'None'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-purple-400 w-10">q[1]:</span>
                <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center">
                  <div className="px-3 py-1 rounded bg-purple-600 text-white font-mono text-xs font-bold shadow-md ml-24">
                    {wire1Gate || 'None'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400">Resulting State Vector:</span>
              <span className="font-mono font-bold text-cyan-300">|Ψ⟩ = (|00⟩ + |11⟩) / √2</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. ALGORITHMS COMPARISON DEMO */}
      {demoType === 'algorithms-comparison' && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-medium text-slate-300">Unstructured Database Elements (N):</span>
              <span className="font-mono text-cyan-400 font-bold text-base tabular-nums">{searchSize.toLocaleString()} Items</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000000"
              step="1000"
              value={searchSize}
              onChange={(e) => setSearchSize(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Classical Linear Search Queries
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-200 mt-2 tabular-nums">
                {Math.round(searchSize / 2).toLocaleString()} <span className="text-xs font-sans text-slate-500">avg queries</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Complexity: O(N)</span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <span className="text-[11px] uppercase tracking-wider text-purple-400 font-bold block">
                Quantum Grover Search Queries
              </span>
              <div className="font-mono text-2xl font-extrabold text-purple-300 mt-2 tabular-nums">
                {Math.round((Math.PI / 4) * Math.sqrt(searchSize)).toLocaleString()} <span className="text-xs font-sans text-purple-300">queries</span>
              </div>
              <span className="text-[11px] text-purple-400 font-mono mt-1 block">
                Complexity: O(√N) — Quadratic Acceleration
              </span>
            </div>
          </div>
        </div>
      )}

    </GlassCard>
  );
};
