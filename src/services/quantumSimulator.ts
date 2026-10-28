/**
 * QuantumLearn AI - State-Vector Quantum Circuit Simulator
 * High-performance, exact tensor simulation engine for 1 to 5 qubits.
 * Supports H, X, Y, Z, S, T, CNOT gates, partial-trace density matrix purity analysis,
 * Bloch coordinates for unentangled subsystems, and Born-rule measurement sampling.
 * Isolated computation service ready for transition to FastAPI backend.
 */

import { ComplexNumber, AmplitudeEntry, IndividualQubitState, SimulationResult } from '../types/quantum';

// Complex Number Helper Functions
export const C = {
  zero: (): ComplexNumber => ({ r: 0, i: 0 }),
  one: (): ComplexNumber => ({ r: 1, i: 0 }),
  new: (r: number, i: number): ComplexNumber => ({ r, i }),
  add: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({ r: a.r + b.r, i: a.i + b.i }),
  sub: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({ r: a.r - b.r, i: a.i - b.i }),
  mul: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
    r: a.r * b.r - a.i * b.i,
    i: a.r * b.i + a.i * b.r
  }),
  scale: (a: ComplexNumber, s: number): ComplexNumber => ({ r: a.r * s, i: a.i * s }),
  conj: (a: ComplexNumber): ComplexNumber => ({ r: a.r, i: -a.i }),
  magSq: (a: ComplexNumber): number => a.r * a.r + a.i * a.i,
  mag: (a: ComplexNumber): number => Math.sqrt(a.r * a.r + a.i * a.i),
  arg: (a: ComplexNumber): number => Math.atan2(a.i, a.r)
};

const SQRT1_2 = Math.SQRT1_2; // 1 / √2 ≈ 0.70710678

// 2x2 Unitary Matrices for Supported Single-Qubit Gates
const GATES_2X2: Record<string, [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber]> = {
  H: [
    C.new(SQRT1_2, 0), C.new(SQRT1_2, 0),
    C.new(SQRT1_2, 0), C.new(-SQRT1_2, 0)
  ],
  X: [
    C.new(0, 0), C.new(1, 0),
    C.new(1, 0), C.new(0, 0)
  ],
  Y: [
    C.new(0, 0), C.new(0, -1),
    C.new(0, 1), C.new(0, 0)
  ],
  Z: [
    C.new(1, 0), C.new(0, 0),
    C.new(0, 0), C.new(-1, 0)
  ],
  S: [
    C.new(1, 0), C.new(0, 0),
    C.new(0, 0), C.new(0, 1) // e^(i*pi/2) = i
  ],
  T: [
    C.new(1, 0), C.new(0, 0),
    C.new(0, 0), C.new(SQRT1_2, SQRT1_2) // e^(i*pi/4) = cos(pi/4) + i*sin(pi/4)
  ]
};

export interface CircuitInstruction {
  gate: string;
  qubit: number;
  step: number;
  targetQubit?: number;
}

export class QuantumSimulatorEngine {
  /**
   * Simulates a quantum circuit grid on N qubits.
   */
  static simulateCircuit(
    numQubits: number,
    grid: (string | null)[][],
    shots: number = 1024
  ): SimulationResult {
    const startTime = performance.now();
    const totalSteps = grid[0]?.length || 0;
    const dim = 1 << numQubits;

    // 1. Initialize to |00...0>
    let state: ComplexNumber[] = new Array(dim);
    for (let i = 0; i < dim; i++) {
      state[i] = i === 0 ? C.one() : C.zero();
    }

    let totalGates = 0;
    let multiQubitGates = 0;
    let hasMeasurement = false;
    const unsupportedGates: string[] = [];
    const activeStepsSet = new Set<number>();

    // 2. Parse step by step across time
    for (let step = 0; step < totalSteps; step++) {
      let stepHadGates = false;

      // Identify CNOT connections in this step
      const cnotControls: number[] = [];
      const cnotTargets: number[] = [];

      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (!cell) continue;

        stepHadGates = true;
        if (cell === 'CNOT_CTRL') cnotControls.push(q);
        if (cell === 'CNOT_TGT') cnotTargets.push(q);
      }

      // Handle multi-qubit CNOT gates
      if (cnotControls.length > 0 && cnotTargets.length > 0) {
        // Pair up controls and targets
        for (let i = 0; i < Math.min(cnotControls.length, cnotTargets.length); i++) {
          const ctrl = cnotControls[i];
          const tgt = cnotTargets[i];
          if (ctrl !== tgt) {
            state = this.applyCNOT(state, numQubits, ctrl, tgt);
            totalGates++;
            multiQubitGates++;
          }
        }
      }

      // Handle single-qubit gates in this step
      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (!cell || cell === 'CNOT_CTRL' || cell === 'CNOT_TGT') continue;

        if (cell === 'M') {
          hasMeasurement = true;
          totalGates++;
          continue;
        }

        const gateMatrix = GATES_2X2[cell];
        if (gateMatrix) {
          state = this.applySingleQubitGate(state, numQubits, q, gateMatrix);
          totalGates++;
        } else {
          if (!unsupportedGates.includes(cell)) {
            unsupportedGates.push(cell);
          }
        }
      }

      if (stepHadGates) {
        activeStepsSet.add(step);
      }
    }

    // 3. Compute Probabilities & Amplitudes
    const amplitudes: AmplitudeEntry[] = [];
    const probabilities: Record<string, number> = {};

    for (let k = 0; k < dim; k++) {
      const basis = k.toString(2).padStart(numQubits, '0');
      const amp = state[k];
      const prob = C.magSq(amp);
      const mag = C.mag(amp);
      const phaseRad = C.arg(amp);
      let phaseDeg = (phaseRad * 180) / Math.PI;
      if (phaseDeg < 0) phaseDeg += 360;

      amplitudes.push({
        basis,
        real: amp.r,
        imag: amp.i,
        magnitude: mag,
        probability: Math.max(0, Math.min(1, prob)),
        phaseRad,
        phaseDeg
      });

      probabilities[basis] = prob;
    }

    // 4. Sample Measurements according to Born Rule
    const measurementCounts: Record<string, number> = {};
    for (let k = 0; k < dim; k++) {
      const basis = k.toString(2).padStart(numQubits, '0');
      measurementCounts[basis] = 0;
    }

    // Cumulative probability distribution for exact Monte Carlo sampling
    const cumProb: number[] = new Array(dim);
    let runningSum = 0;
    for (let k = 0; k < dim; k++) {
      runningSum += amplitudes[k].probability;
      cumProb[k] = runningSum;
    }

    for (let s = 0; s < shots; s++) {
      const r = Math.random();
      // binary search or linear search
      let selectedIdx = 0;
      for (let k = 0; k < dim; k++) {
        if (r <= cumProb[k] || k === dim - 1) {
          selectedIdx = k;
          break;
        }
      }
      const b = amplitudes[selectedIdx].basis;
      measurementCounts[b] = (measurementCounts[b] || 0) + 1;
    }

    // 5. Construct Dirac bra-ket notation string
    const significantAmps = amplitudes.filter((a) => a.magnitude > 0.001);
    let diracNotation = '';
    if (significantAmps.length === 0) {
      diracNotation = '|0⟩';
    } else {
      diracNotation = significantAmps
        .map((a, idx) => {
          const magStr = a.magnitude.toFixed(3);
          const sign = idx > 0 ? '+ ' : '';
          if (Math.abs(a.imag) < 0.001) {
            const coeff = a.real < 0 ? `-${Math.abs(a.real).toFixed(3)}` : (idx > 0 ? `+ ${a.real.toFixed(3)}` : a.real.toFixed(3));
            return `${coeff}|${a.basis}⟩`;
          }
          return `${sign}(${a.real.toFixed(2)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(2)}i)|${a.basis}⟩`;
        })
        .join(' ');
    }

    // 6. Reduced Density Matrix & Bloch Purity Analysis for Each Qubit
    const individualQubits: IndividualQubitState[] = [];
    let overallEntangled = false;

    for (let q = 0; q < numQubits; q++) {
      const mask = 1 << (numQubits - 1 - q);
      let rho00 = 0;
      let rho11 = 0;
      let rho01_r = 0;
      let rho01_i = 0;

      for (let k = 0; k < dim; k++) {
        if ((k & mask) === 0) {
          // bit q is 0
          const k1 = k | mask; // bit q is 1
          const a0 = state[k];
          const a1 = state[k1];

          rho00 += a0.r * a0.r + a0.i * a0.i;
          rho11 += a1.r * a1.r + a1.i * a1.i;

          // a0 * a1_conj = (a0.r + i a0.i) * (a1.r - i a1.i)
          rho01_r += a0.r * a1.r + a0.i * a1.i;
          rho01_i += a0.i * a1.r - a0.r * a1.i;
        }
      }

      // Bloch vector coordinates:
      // x = 2 * Re(rho01)
      // y = 2 * Im(rho01)
      // z = rho00 - rho11
      const x = 2 * rho01_r;
      const y = -2 * rho01_i;
      const z = rho00 - rho11;
      const r = Math.sqrt(x * x + y * y + z * z);

      // Purity = Tr(rho^2) = (1 + r^2) / 2.
      // Pure state has r ≈ 1 (Purity = 1).
      // Entangled subsystem has r < 1 (Purity < 1).
      const purity = (1 + r * r) / 2;
      const isEntangled = r < 0.99;

      if (isEntangled) {
        overallEntangled = true;
      }

      // Polar angles
      const clampedZ = Math.max(-1, Math.min(1, r > 0 ? z / r : z));
      const theta = Math.acos(clampedZ);
      let phi = Math.atan2(y, x);
      if (phi < 0) phi += 2 * Math.PI;

      individualQubits.push({
        qubitIndex: q,
        isEntangled,
        purity,
        theta,
        phi,
        prob0: rho00,
        prob1: rho11,
        blochVector: { x, y, z }
      });
    }

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      numQubits,
      totalSteps,
      circuitDepth: activeStepsSet.size,
      totalGates,
      multiQubitGates,
      isEntangled: overallEntangled,
      stateVector: amplitudes,
      diracNotation,
      probabilities,
      measurementCounts,
      shots,
      executionTimeMs,
      individualQubits,
      hasMeasurement,
      unsupportedGatesDetected: unsupportedGates.length > 0 ? unsupportedGates : undefined
    };
  }

  /**
   * Applies single-qubit unitary gate across entire state vector.
   */
  private static applySingleQubitGate(
    state: ComplexNumber[],
    numQubits: number,
    qubit: number,
    gate: [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber]
  ): ComplexNumber[] {
    const dim = 1 << numQubits;
    const newState: ComplexNumber[] = new Array(dim);
    const mask = 1 << (numQubits - 1 - qubit);
    const [u00, u01, u10, u11] = gate;

    for (let k = 0; k < dim; k++) {
      if ((k & mask) === 0) {
        const k0 = k;
        const k1 = k | mask;
        const a0 = state[k0];
        const a1 = state[k1];

        // new_a0 = u00*a0 + u01*a1
        newState[k0] = C.add(C.mul(u00, a0), C.mul(u01, a1));
        // new_a1 = u10*a0 + u11*a1
        newState[k1] = C.add(C.mul(u10, a0), C.mul(u11, a1));
      }
    }

    return newState;
  }

  /**
   * Applies CNOT gate with arbitrary control and target wires.
   */
  private static applyCNOT(
    state: ComplexNumber[],
    numQubits: number,
    controlQubit: number,
    targetQubit: number
  ): ComplexNumber[] {
    const dim = 1 << numQubits;
    const newState: ComplexNumber[] = [...state];
    const ctrlMask = 1 << (numQubits - 1 - controlQubit);
    const tgtMask = 1 << (numQubits - 1 - targetQubit);

    for (let k = 0; k < dim; k++) {
      // If control bit is 1, and target bit is 0, swap with paired state where target bit is 1
      if ((k & ctrlMask) !== 0 && (k & tgtMask) === 0) {
        const k_paired = k | tgtMask;
        const temp = newState[k];
        newState[k] = newState[k_paired];
        newState[k_paired] = temp;
      }
    }

    return newState;
  }

  /**
   * Generates Qiskit Python code corresponding to the visual grid.
   */
  static generateQiskitCode(numQubits: number, grid: (string | null)[][]): string {
    const lines: string[] = [
      'from qiskit import QuantumCircuit, Aer, execute',
      '',
      `# Initialize ${numQubits}-qubit quantum circuit`,
      `qc = QuantumCircuit(${numQubits}, ${numQubits})`,
      ''
    ];

    const totalSteps = grid[0]?.length || 0;
    for (let step = 0; step < totalSteps; step++) {
      // Check for CNOT
      const cnotControls: number[] = [];
      const cnotTargets: number[] = [];

      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (cell === 'CNOT_CTRL') cnotControls.push(q);
        if (cell === 'CNOT_TGT') cnotTargets.push(q);
      }

      if (cnotControls.length > 0 && cnotTargets.length > 0) {
        for (let i = 0; i < Math.min(cnotControls.length, cnotTargets.length); i++) {
          lines.push(`qc.cx(${cnotControls[i]}, ${cnotTargets[i]})`);
        }
      }

      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (!cell || cell === 'CNOT_CTRL' || cell === 'CNOT_TGT') continue;

        switch (cell) {
          case 'H':
            lines.push(`qc.h(${q})`);
            break;
          case 'X':
            lines.push(`qc.x(${q})`);
            break;
          case 'Y':
            lines.push(`qc.y(${q})`);
            break;
          case 'Z':
            lines.push(`qc.z(${q})`);
            break;
          case 'S':
            lines.push(`qc.s(${q})`);
            break;
          case 'T':
            lines.push(`qc.t(${q})`);
            break;
          case 'M':
            lines.push(`qc.measure(${q}, ${q})`);
            break;
          default:
            lines.push(`# Unsupported gate on wire ${q}: ${cell}`);
            break;
        }
      }
    }

    lines.push('');
    lines.push('# Simulate on statevector backend');
    lines.push("simulator = Aer.get_backend('statevector_simulator')");
    lines.push('job = execute(qc, simulator)');
    lines.push('result = job.result()');
    lines.push('print("Final statevector:", result.get_statevector())');

    return lines.join('\n');
  }

  /**
   * Generates OpenQASM 2.0 text corresponding to the visual grid.
   */
  static generateOpenQASM(numQubits: number, grid: (string | null)[][]): string {
    const lines: string[] = [
      'OPENQASM 2.0;',
      'include "qelib1.inc";',
      '',
      `qreg q[${numQubits}];`,
      `creg c[${numQubits}];`,
      ''
    ];

    const totalSteps = grid[0]?.length || 0;
    for (let step = 0; step < totalSteps; step++) {
      const cnotControls: number[] = [];
      const cnotTargets: number[] = [];

      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (cell === 'CNOT_CTRL') cnotControls.push(q);
        if (cell === 'CNOT_TGT') cnotTargets.push(q);
      }

      if (cnotControls.length > 0 && cnotTargets.length > 0) {
        for (let i = 0; i < Math.min(cnotControls.length, cnotTargets.length); i++) {
          lines.push(`cx q[${cnotControls[i]}], q[${cnotTargets[i]}];`);
        }
      }

      for (let q = 0; q < numQubits; q++) {
        const cell = grid[q][step];
        if (!cell || cell === 'CNOT_CTRL' || cell === 'CNOT_TGT') continue;

        switch (cell) {
          case 'H':
            lines.push(`h q[${q}];`);
            break;
          case 'X':
            lines.push(`x q[${q}];`);
            break;
          case 'Y':
            lines.push(`y q[${q}];`);
            break;
          case 'Z':
            lines.push(`z q[${q}];`);
            break;
          case 'S':
            lines.push(`s q[${q}];`);
            break;
          case 'T':
            lines.push(`t q[${q}];`);
            break;
          case 'M':
            lines.push(`measure q[${q}] -> c[${q}];`);
            break;
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Reproducible verification tests for known physical circuits.
   */
  static runSelfTests(): { name: string; passed: boolean; details: string }[] {
    const results: { name: string; passed: boolean; details: string }[] = [];

    // Test 1: Hadamard on |0> yields equal 50/50 superposition
    {
      const grid: (string | null)[][] = [['H']];
      const res = this.simulateCircuit(1, grid);
      const passed = Math.abs(res.probabilities['0'] - 0.5) < 0.001 && Math.abs(res.probabilities['1'] - 0.5) < 0.001;
      results.push({
        name: 'Hadamard Superposition (|0⟩ → |+⟩)',
        passed,
        details: `P(0) = ${res.probabilities['0'].toFixed(3)}, P(1) = ${res.probabilities['1'].toFixed(3)}`
      });
    }

    // Test 2: Pauli-X on |0> yields |1>
    {
      const grid: (string | null)[][] = [['X']];
      const res = this.simulateCircuit(1, grid);
      const passed = Math.abs(res.probabilities['1'] - 1.0) < 0.001;
      results.push({
        name: 'Pauli-X Bit Flip (|0⟩ → |1⟩)',
        passed,
        details: `P(1) = ${res.probabilities['1'].toFixed(3)}`
      });
    }

    // Test 3: Bell State |Φ+⟩ creation (H on q0, CNOT q0 -> q1)
    {
      const grid: (string | null)[][] = [
        ['H', 'CNOT_CTRL'],
        [null, 'CNOT_TGT']
      ];
      const res = this.simulateCircuit(2, grid);
      const p00 = res.probabilities['00'] || 0;
      const p11 = res.probabilities['11'] || 0;
      const p01 = res.probabilities['01'] || 0;
      const p10 = res.probabilities['10'] || 0;
      const passed =
        Math.abs(p00 - 0.5) < 0.001 &&
        Math.abs(p11 - 0.5) < 0.001 &&
        p01 < 0.001 &&
        p10 < 0.001 &&
        res.isEntangled;

      results.push({
        name: 'Bell State |Φ⁺⟩ Entanglement',
        passed,
        details: `P(00)=${p00.toFixed(2)}, P(11)=${p11.toFixed(2)}, P(01)=${p01.toFixed(2)}, Entangled=${res.isEntangled}`
      });
    }

    // Test 4: S^2 gate equals Pauli-Z
    {
      const grid1: (string | null)[][] = [['H', 'Z']];
      const grid2: (string | null)[][] = [['H', 'S', 'S']];
      const res1 = this.simulateCircuit(1, grid1);
      const res2 = this.simulateCircuit(1, grid2);
      const passed =
        Math.abs(res1.stateVector[1].real - res2.stateVector[1].real) < 0.001 &&
        Math.abs(res1.stateVector[1].imag - res2.stateVector[1].imag) < 0.001;
      results.push({
        name: 'Phase Gate Equivalence (S² = Z)',
        passed,
        details: `Amp1=${res1.stateVector[1].real.toFixed(3)}, Amp2=${res2.stateVector[1].real.toFixed(3)}`
      });
    }

    // Test 5: GHZ 3-Qubit Entanglement
    {
      const grid: (string | null)[][] = [
        ['H', 'CNOT_CTRL', null],
        [null, 'CNOT_TGT', 'CNOT_CTRL'],
        [null, null, 'CNOT_TGT']
      ];
      const res = this.simulateCircuit(3, grid);
      const p000 = res.probabilities['000'] || 0;
      const p111 = res.probabilities['111'] || 0;
      const passed = Math.abs(p000 - 0.5) < 0.001 && Math.abs(p111 - 0.5) < 0.001 && res.isEntangled;
      results.push({
        name: 'GHZ 3-Qubit Entanglement (|000⟩ + |111⟩)/√2',
        passed,
        details: `P(000)=${p000.toFixed(2)}, P(111)=${p111.toFixed(2)}, Entangled=${res.isEntangled}`
      });
    }

    return results;
  }
}
