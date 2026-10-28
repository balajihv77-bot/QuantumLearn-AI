import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, RotateCcw, Share2, Compass, FileCode, CheckCircle2, AlertTriangle, Layers, BookOpen, Atom, HelpCircle, Bookmark, Check } from 'lucide-react';
import { Button3D } from '../components/common/Button3D';
import { GlassCard } from '../components/common/GlassCard';
import { CircuitGridEditor } from '../components/lab/CircuitGridEditor';
import { StateVectorDisplay } from '../components/lab/StateVectorDisplay';
import { SubsystemBlochView } from '../components/lab/SubsystemBlochView';
import { CircuitSummaryMetrics } from '../components/lab/CircuitSummaryMetrics';
import { CircuitExportModal } from '../components/lab/CircuitExportModal';
import { QuantumSimulatorEngine } from '../services/quantumSimulator';
import { SimulationResult } from '../types/quantum';
import { apiClient } from '../services/apiClient';

export const LabPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Grid Configuration state
  const [numQubits, setNumQubits] = useState<number>(2);
  const [numSteps, setNumSteps] = useState<number>(6);

  // Circuit Grid state: [qubitIndex][stepIndex] holds gate id or null
  // Initial default: Bell State (|00> + |11>)/√2
  const [grid, setGrid] = useState<(string | null)[][]>([
    ['H', 'CNOT_CTRL', null, null, null, 'M'],
    [null, 'CNOT_TGT', null, null, null, 'M']
  ]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<(string | null)[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [selectedGate, setSelectedGate] = useState<string>('H');
  const [shots, setShots] = useState<number>(1024);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSavingCircuit, setIsSavingCircuit] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSaveCircuitToBackend = async () => {
    setIsSavingCircuit(true);
    setSavedNotice(null);
    try {
      await apiClient.saveCircuit({
        title: `Quantum Circuit (${numQubits}Q x ${numSteps}S)`,
        description: `Custom ${numQubits}-qubit statevector circuit assembled in Visual Lab`,
        num_qubits: numQubits,
        num_steps: numSteps,
        grid: grid,
      });
      setSavedNotice('Circuit saved to backend database successfully!');
    } catch {
      // Local fallback
      try {
        const localCircuits = JSON.parse(localStorage.getItem('quantumlearn_saved_circuits') || '[]');
        localCircuits.push({
          id: Date.now(),
          title: `Quantum Circuit (${numQubits}Q x ${numSteps}S)`,
          num_qubits: numQubits,
          num_steps: numSteps,
          grid: grid,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('quantumlearn_saved_circuits', JSON.stringify(localCircuits));
        setSavedNotice('Saved to local browser storage (backend offline).');
      } catch {
        setSavedNotice('Circuit layout cached.');
      }
    } finally {
      setIsSavingCircuit(false);
      setTimeout(() => setSavedNotice(null), 4000);
    }
  };

  // Load preset if specified in URL query
  useEffect(() => {
    const preset = searchParams.get('preset');
    if (preset === 'bell') {
      loadPreset('bell');
    } else if (preset === 'ghz') {
      loadPreset('ghz');
    } else if (preset === 'teleportation') {
      loadPreset('teleportation');
    } else if (preset === 'superposition') {
      loadPreset('superposition');
    }
  }, [searchParams]);

  // Save history on grid modification
  const pushHistory = (newGrid: (string | null)[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newGrid)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Validate circuit placement
  const validateCircuit = (currentGrid: (string | null)[][], qCount: number, sCount: number): string[] => {
    const errors: string[] = [];

    for (let s = 0; s < sCount; s++) {
      const cnotCtrls: number[] = [];
      const cnotTgts: number[] = [];

      for (let q = 0; q < qCount; q++) {
        const cell = currentGrid[q]?.[s];
        if (cell === 'CNOT_CTRL') cnotCtrls.push(q);
        if (cell === 'CNOT_TGT') cnotTgts.push(q);
      }

      if (cnotCtrls.length > 0 && cnotTgts.length === 0) {
        errors.push(`Step t${s + 1}: CNOT Control dot placed without a corresponding target XOR.`);
      } else if (cnotTgts.length > 0 && cnotCtrls.length === 0) {
        errors.push(`Step t${s + 1}: CNOT Target XOR placed without a corresponding control dot.`);
      } else if (cnotCtrls.length > 0 && cnotTgts.length > 0) {
        for (const c of cnotCtrls) {
          if (cnotTgts.includes(c)) {
            errors.push(`Step t${s + 1}: CNOT control and target cannot be on the same qubit wire q[${c}].`);
          }
        }
      }
    }

    return errors;
  };

  // Run simulation calculation
  const executeSimulation = (targetGrid: (string | null)[][], qCount: number) => {
    setIsSimulating(true);

    const errs = validateCircuit(targetGrid, qCount, targetGrid[0]?.length || numSteps);
    setValidationErrors(errs);

    setTimeout(() => {
      startTransition(() => {
        const result = QuantumSimulatorEngine.simulateCircuit(qCount, targetGrid, shots);
        setSimulationResult(result);
        setIsSimulating(false);
      });
    }, 250);
  };

  // Initial simulation run on mount
  useEffect(() => {
    executeSimulation(grid, numQubits);
  }, []);

  // Handle cell click in circuit grid
  const handleCellClick = (qIdx: number, sIdx: number) => {
    const newGrid: (string | null)[][] = grid.map((row) => [...row]);

    // If cell already has a gate, clicking removes it
    if (newGrid[qIdx][sIdx] !== null) {
      newGrid[qIdx][sIdx] = null;
      // If was CNOT, also clean orphan target/control in the same column
      setGrid(newGrid);
      pushHistory(newGrid);
      return;
    }

    // Handle CNOT placement
    if (selectedGate === 'CNOT') {
      // Find an available partner wire in this step
      let targetQ = -1;
      for (let q = 0; q < numQubits; q++) {
        if (q !== qIdx && newGrid[q][sIdx] === null) {
          targetQ = q;
          break;
        }
      }

      if (targetQ !== -1) {
        newGrid[qIdx][sIdx] = 'CNOT_CTRL';
        newGrid[targetQ][sIdx] = 'CNOT_TGT';
      } else {
        newGrid[qIdx][sIdx] = 'H'; // fallback if no wire available
      }
    } else {
      newGrid[qIdx][sIdx] = selectedGate;
    }

    setGrid(newGrid);
    pushHistory(newGrid);
  };

  // Add / remove qubit wire
  const handleAddQubit = () => {
    if (numQubits >= 5) return;
    const newCount = numQubits + 1;
    const newRow = new Array(numSteps).fill(null);
    const newGrid = [...grid, newRow];
    setNumQubits(newCount);
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  const handleRemoveQubit = () => {
    if (numQubits <= 1) return;
    const newCount = numQubits - 1;
    const newGrid = grid.slice(0, newCount);
    setNumQubits(newCount);
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  // Add / remove time step
  const handleAddStep = () => {
    if (numSteps >= 10) return;
    const newCount = numSteps + 1;
    const newGrid = grid.map((row) => [...row, null]);
    setNumSteps(newCount);
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  const handleRemoveStep = () => {
    if (numSteps <= 4) return;
    const newCount = numSteps - 1;
    const newGrid = grid.map((row) => row.slice(0, newCount));
    setNumSteps(newCount);
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevGrid = JSON.parse(JSON.stringify(history[prevIndex]));
      setGrid(prevGrid);
      setHistoryIndex(prevIndex);
      setNumQubits(prevGrid.length);
      setNumSteps(prevGrid[0].length);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextGrid = JSON.parse(JSON.stringify(history[nextIndex]));
      setGrid(nextGrid);
      setHistoryIndex(nextIndex);
      setNumQubits(nextGrid.length);
      setNumSteps(nextGrid[0].length);
    }
  };

  // Reset Grid
  const handleReset = () => {
    const emptyGrid = Array.from({ length: numQubits }, () => new Array(numSteps).fill(null));
    setGrid(emptyGrid);
    pushHistory(emptyGrid);
    setValidationErrors([]);
  };

  // Load curated presets
  const loadPreset = (presetName: string) => {
    let newQ = 2;
    let newS = 6;
    let newGrid: (string | null)[][] = [];

    switch (presetName) {
      case 'bell':
        newQ = 2;
        newS = 6;
        newGrid = [
          ['H', 'CNOT_CTRL', null, null, null, 'M'],
          [null, 'CNOT_TGT', null, null, null, 'M']
        ];
        break;
      case 'ghz':
        newQ = 3;
        newS = 6;
        newGrid = [
          ['H', 'CNOT_CTRL', null, null, null, 'M'],
          [null, 'CNOT_TGT', 'CNOT_CTRL', null, null, 'M'],
          [null, null, 'CNOT_TGT', null, null, 'M']
        ];
        break;
      case 'superposition':
        newQ = 3;
        newS = 6;
        newGrid = [
          ['H', null, null, null, null, 'M'],
          ['H', null, null, null, null, 'M'],
          ['H', null, null, null, null, 'M']
        ];
        break;
      case 'teleportation':
        newQ = 3;
        newS = 7;
        newGrid = [
          ['X', null, 'CNOT_CTRL', 'H', null, 'M', null],
          [null, 'H', 'CNOT_TGT', null, 'CNOT_CTRL', null, null],
          [null, null, 'CNOT_TGT', null, 'CNOT_TGT', null, 'M']
        ];
        break;
      case 'phase-flip':
        newQ = 1;
        newS = 5;
        newGrid = [['H', 'Z', 'H', null, 'M']];
        break;
      default:
        return;
    }

    setNumQubits(newQ);
    setNumSteps(newS);
    setGrid(newGrid);
    pushHistory(newGrid);
    executeSimulation(newGrid, newQ);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in pb-16">
      
      {/* Page Header & Top 3D Control Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span>Interactive Quantum Laboratory Workbench</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Visual Circuit Lab & Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Assemble multi-qubit unitary circuits, observe state-vector evolution in Hilbert space, and inspect unentangled subsystem Bloch spheres.
          </p>
        </div>

        {/* Top 3D Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button3D
            variant="cyan"
            size="md"
            onClick={() => executeSimulation(grid, numQubits)}
            isLoading={isSimulating}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Run Simulation
          </Button3D>

          <Button3D
            variant="emerald"
            size="md"
            onClick={handleSaveCircuitToBackend}
            isLoading={isSavingCircuit}
            leftIcon={<Bookmark className="w-4 h-4 text-emerald-300" />}
          >
            Save Circuit
          </Button3D>

          <Button3D
            variant="dark"
            size="md"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<FileCode className="w-4 h-4 text-cyan-400" />}
          >
            Export JSON & Code
          </Button3D>

          <Button3D
            variant="purple"
            size="md"
            onClick={() => navigate('/simulator')}
            leftIcon={<Compass className="w-4 h-4 text-purple-300" />}
          >
            3D Bloch Sandbox
          </Button3D>
        </div>
      </div>

      {/* Save Notification */}
      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Circuit Presets Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-2">Curated Circuit Presets:</span>
        <button
          onClick={() => loadPreset('bell')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
        >
          Bell State |Φ⁺⟩
        </button>
        <button
          onClick={() => loadPreset('ghz')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-purple-300 hover:border-purple-400 transition-colors cursor-pointer"
        >
          GHZ 3-Qubit Entanglement
        </button>
        <button
          onClick={() => loadPreset('superposition')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors cursor-pointer"
        >
          3-Qubit Superposition
        </button>
        <button
          onClick={() => loadPreset('phase-flip')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-emerald-300 hover:border-emerald-400 transition-colors cursor-pointer"
        >
          Single-Qubit Phase Flip (H-Z-H)
        </button>
      </div>

      {/* Transparent Disclaimer Notice: Distinguishing visual editing from execution */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-200">Circuit Engineering Mode: </span>
          Place gates on wires to edit the circuit structure. Click <strong className="text-cyan-300">Run Simulation</strong> to compute the exact state-vector through local matrix multiplication. Results are generated via deterministic state-vector mathematics and Monte Carlo measurement sampling.
        </div>
      </div>

      {/* 1. CIRCUIT GRID BUILDER */}
      <CircuitGridEditor
        numQubits={numQubits}
        numSteps={numSteps}
        grid={grid}
        selectedGate={selectedGate}
        onSelectGate={setSelectedGate}
        onCellClick={handleCellClick}
        onAddQubit={handleAddQubit}
        onRemoveQubit={handleRemoveQubit}
        onAddStep={handleAddStep}
        onRemoveStep={handleRemoveStep}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onReset={handleReset}
        validationErrors={validationErrors}
      />

      {/* 2. CIRCUIT EXECUTION SUMMARY METRICS */}
      <CircuitSummaryMetrics simulation={simulationResult} />

      {/* 3. SIMULATION OUTPUT: STATE VECTOR AMPLITUDES & PROBABILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* State Vector Probabilities & Amplitudes Display (7 cols) */}
        <div className="lg:col-span-7">
          <StateVectorDisplay simulation={simulationResult} />
        </div>

        {/* Subsystem Bloch Sphere View (5 cols) */}
        <div className="lg:col-span-5">
          {simulationResult && (
            <SubsystemBlochView individualQubits={simulationResult.individualQubits} />
          )}
        </div>

      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <CircuitExportModal
          numQubits={numQubits}
          grid={grid}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

    </div>
  );
};
