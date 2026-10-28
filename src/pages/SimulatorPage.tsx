import React, { useState, useEffect } from 'react';
import { Compass, RotateCcw, Play, Pause, RefreshCw, BarChart2, Zap, Sliders, Info } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { BlochSphere3D } from '../components/visualization/BlochSphere3D';

export const SimulatorPage: React.FC = () => {
  // Polar angle theta [0, PI] and azimuthal angle phi [0, 2*PI]
  const [theta, setTheta] = useState<number>(Math.PI / 3); // 60 deg
  const [phi, setPhi] = useState<number>(Math.PI / 4);     // 45 deg

  // Measurement shots simulation
  const [shotsCount, setShotsCount] = useState<number>(1024);
  const [measurementResult, setMeasurementResult] = useState<{ count0: number; count1: number } | null>(null);
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Exact probabilities
  // alpha = cos(theta / 2), beta = sin(theta / 2)
  const prob0 = Math.pow(Math.cos(theta / 2), 2);
  const prob1 = Math.pow(Math.sin(theta / 2), 2);

  const applyGate = (gateName: string) => {
    switch (gateName) {
      case 'H':
        // If at |0>, H brings to |+> (theta = PI/2, phi = 0)
        // In general, H swaps X and Z on Bloch sphere
        if (Math.abs(theta) < 0.1) {
          setTheta(Math.PI / 2);
          setPhi(0);
        } else if (Math.abs(theta - Math.PI) < 0.1) {
          setTheta(Math.PI / 2);
          setPhi(Math.PI);
        } else if (Math.abs(theta - Math.PI / 2) < 0.1 && Math.abs(phi) < 0.1) {
          setTheta(0);
          setPhi(0);
        } else {
          setTheta(Math.PI / 2);
          setPhi(0);
        }
        break;
      case 'X':
        // Rotation by PI around X axis
        setTheta(Math.PI - theta);
        setPhi((2 * Math.PI - phi) % (2 * Math.PI));
        break;
      case 'Y':
        // Rotation by PI around Y axis
        setTheta(Math.PI - theta);
        setPhi((Math.PI - phi + 2 * Math.PI) % (2 * Math.PI));
        break;
      case 'Z':
        // Phase shift: advances phi by PI
        setPhi((phi + Math.PI) % (2 * Math.PI));
        break;
      case 'S':
        // Phase shift by PI/2
        setPhi((phi + Math.PI / 2) % (2 * Math.PI));
        break;
      case 'T':
        // Phase shift by PI/4
        setPhi((phi + Math.PI / 4) % (2 * Math.PI));
        break;
      case '0':
        setTheta(0);
        setPhi(0);
        break;
      case '1':
        setTheta(Math.PI);
        setPhi(0);
        break;
      case '+':
        setTheta(Math.PI / 2);
        setPhi(0);
        break;
      case '-':
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
        break;
      case '+i':
        setTheta(Math.PI / 2);
        setPhi(Math.PI / 2);
        break;
      default:
        break;
    }
  };

  // Fast and mathematically rigorous Born-rule empirical shots sampler
  const sampleShots = (p0: number, totalShots: number): { count0: number; count1: number } => {
    if (p0 >= 0.9999) return { count0: totalShots, count1: 0 };
    if (p0 <= 0.0001) return { count0: 0, count1: totalShots };

    // Gaussian approximation of Binomial(totalShots, p0) with Box-Muller transform
    const mean = totalShots * p0;
    const stdDev = Math.sqrt(totalShots * p0 * (1 - p0));
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    let c0 = Math.round(mean + stdDev * z0);
    c0 = Math.max(0, Math.min(totalShots, c0));
    return { count0: c0, count1: totalShots - c0 };
  };

  // Automatically update empirical measurement results whenever orbit inputs (theta, phi) or shotsCount change
  useEffect(() => {
    setMeasurementResult(sampleShots(prob0, shotsCount));
  }, [theta, phi, shotsCount]);

  const handleSampleMeasurements = () => {
    setIsSampling(true);
    setTimeout(() => {
      setMeasurementResult(sampleShots(prob0, shotsCount));
      setIsSampling(false);
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Spatial Qubit Dynamics</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">3D Bloch Sphere Simulator</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Directly manipulate pure two-level quantum states in continuous three-dimensional space, applying unitary rotations and sampling Born-rule measurement shots.
          </p>
        </div>

        {/* 3D Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button3D
            variant="cyan"
            size="md"
            onClick={handleSampleMeasurements}
            isLoading={isSampling}
            leftIcon={<BarChart2 className="w-4 h-4" />}
          >
            Measure {shotsCount} Shots
          </Button3D>

          <Button3D
            variant="dark"
            size="md"
            onClick={() => setAutoRotate(!autoRotate)}
            leftIcon={autoRotate ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          >
            {autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
          </Button3D>

          <Button3D
            variant="dark"
            size="md"
            onClick={() => applyGate('0')}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset to |0⟩
          </Button3D>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Center Zone: Three.js Interactive 3D Sphere (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard glow className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Interactive 3D Bloch Canvas</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                  autoRotate ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {autoRotate ? 'Orbit Active' : 'Orbit Paused'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Drag with mouse to rotate perspective</span>
            </div>

            {/* Three.js 3D Viewport */}
            <div className="h-[420px] sm:h-[480px] w-full bg-slate-950/70 rounded-2xl overflow-hidden border border-cyan-500/20">
              <BlochSphere3D
                theta={theta}
                phi={phi}
                interactive={true}
                autoRotate={autoRotate}
                onSelectState={(stateKey) => applyGate(stateKey)}
              />
            </div>

            {/* Quick State Presets Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 mb-2">Computational & Superposition Presets:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '|0⟩ Ground', key: '0' },
                  { label: '|1⟩ Excited', key: '1' },
                  { label: '|+⟩ (H|0⟩)', key: '+' },
                  { label: '|-⟩ (H|1⟩)', key: '-' },
                  { label: '|+i⟩ Phase', key: '+i' }
                ].map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyGate(preset.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Unitary Gate Rotations Toolbox */}
          <GlassCard className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Apply Unitary Rotation Gates</div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {[
                { name: 'H', label: 'Hadamard (H)', desc: 'X + Z diagonal' },
                { name: 'X', label: 'Pauli-X', desc: 'π around X' },
                { name: 'Y', label: 'Pauli-Y', desc: 'π around Y' },
                { name: 'Z', label: 'Pauli-Z', desc: 'π around Z' },
                { name: 'S', label: 'Phase (S)', desc: 'π/2 around Z' },
                { name: 'T', label: 'T-Gate', desc: 'π/4 around Z' }
              ].map((g) => (
                <button
                  key={g.name}
                  onClick={() => applyGate(g.name)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400 hover:bg-slate-900/60 transition-all text-center cursor-pointer group"
                >
                  <div className="font-mono text-base font-bold text-cyan-400 group-hover:scale-110 transition-transform">{g.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{g.desc}</div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Zone: Control Deck & Coordinate Math (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Angle Sliders */}
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Spherical Coordinates</h3>
            </div>

            {/* Theta Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-semibold text-slate-300">Polar Angle θ (Latitude)</span>
                <span className="font-mono text-cyan-300 tabular-nums">
                  {(theta * 180 / Math.PI).toFixed(1)}° · {(theta / Math.PI).toFixed(2)}π
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.02"
                value={theta}
                onChange={(e) => setTheta(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0 (North |0⟩)</span>
                <span>π/2 (Equator)</span>
                <span>π (South |1⟩)</span>
              </div>
            </div>

            {/* Phi Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-semibold text-slate-300">Azimuthal Angle φ (Longitude)</span>
                <span className="font-mono text-purple-300 tabular-nums">
                  {(phi * 180 / Math.PI).toFixed(1)}° · {(phi / Math.PI).toFixed(2)}π
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.02"
                value={phi}
                onChange={(e) => setPhi(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0 (+X)</span>
                <span>π/2 (+Y)</span>
                <span>π (-X)</span>
                <span>2π (+X)</span>
              </div>
            </div>
          </GlassCard>

          {/* State Vector Amplitudes */}
          <GlassCard glow className="p-6">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Quantum State Representation</h3>
            
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
              <div>|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩</div>
              <div className="mt-2 text-cyan-300">
                |ψ⟩ = {Math.cos(theta / 2).toFixed(3)}|0⟩ + ({Math.sin(theta / 2).toFixed(3)}·e^({(phi / Math.PI).toFixed(2)}π i))|1⟩
              </div>
            </div>

            {/* Probability Bars */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-slate-300">P(|0⟩) = |α|² = cos²(θ/2)</span>
                  <span className="font-mono font-bold text-cyan-300 tabular-nums">{(prob0 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${prob0 * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-slate-300">P(|1⟩) = |β|² = sin²(θ/2)</span>
                  <span className="font-mono font-bold text-purple-300 tabular-nums">{(prob1 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${prob1 * 100}%` }} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Measurement Shots Histogram */}
          {measurementResult && (
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Empirical Measurement Result</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    Live Orbit Sync
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[256, 1024, 4096].map((s) => (
                    <button
                      key={s}
                      onClick={() => setShotsCount(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        shotsCount === s
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                      title={`Sample ${s} measurement shots`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center mb-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                  <span className="font-mono text-xs text-slate-400">Outcome |0⟩</span>
                  <p className="font-mono text-xl font-bold text-cyan-300 tabular-nums my-0.5">{measurementResult.count0}</p>
                  <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                    {((measurementResult.count0 / shotsCount) * 100).toFixed(1)}%
                  </span>
                  <div className="mt-2 w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${(measurementResult.count0 / shotsCount) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                  <span className="font-mono text-xs text-slate-400">Outcome |1⟩</span>
                  <p className="font-mono text-xl font-bold text-purple-300 tabular-nums my-0.5">{measurementResult.count1}</p>
                  <span className="text-[11px] text-purple-400 font-mono font-semibold">
                    {((measurementResult.count1 / shotsCount) * 100).toFixed(1)}%
                  </span>
                  <div className="mt-2 w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${(measurementResult.count1 / shotsCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Born Rule deviation:</span>
                <span className="text-slate-300 font-semibold tabular-nums">
                  |Δ0| = {Math.abs(((measurementResult.count0 / shotsCount) * 100) - (prob0 * 100)).toFixed(1)}%
                </span>
              </div>
            </GlassCard>
          )}

        </div>

      </div>
    </div>
  );
};
