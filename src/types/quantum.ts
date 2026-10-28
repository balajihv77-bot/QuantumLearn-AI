export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ModuleObjective {
  id: string;
  text: string;
}

export interface ModuleExample {
  title: string;
  analogy?: string;
  explanation: string;
  formulaOrCode?: string;
}

export interface ModuleInteractiveDemo {
  type: 
    | 'intro-scale' 
    | 'bits-vs-qubits' 
    | 'qubit-state-sphere' 
    | 'superposition-spinner' 
    | 'entanglement-bell' 
    | 'measurement-collapse' 
    | 'gates-sandbox' 
    | 'circuits-builder' 
    | 'algorithms-comparison';
  title: string;
  instruction: string;
}

export interface QuantumModule {
  id: string;
  moduleNumber: number;
  title: string;
  slug: string;
  category: 'Fundamentals' | 'Gates & Circuits' | 'Algorithms' | 'Error Correction' | 'Hardware';
  level: DifficultyLevel;
  durationMinutes: number;
  description: string;
  beginnerExplanation: string;
  learningObjectives: string[];
  example: ModuleExample;
  interactiveDemo: ModuleInteractiveDemo;
  knowledgeCheck: QuizQuestion[];
  prerequisites: string[];
  topicsCovered: string[];
  featured?: boolean;
}

export interface CircuitGateNode {
  qubit: number;
  step: number;
  symbol: string;
  name: string;
  isControl?: boolean;
  targetQubit?: number;
}

export interface CircuitRepresentation {
  numQubits: number;
  qubitLabels: string[];
  gates: CircuitGateNode[];
  measurementSteps?: number[];
  notes?: string;
}

export interface QuantumAlgorithm {
  id: string;
  title: string;
  slug: string;
  purpose: string;
  inventor: string;
  yearIntroduced: number;
  difficulty: DifficultyLevel;
  quantumSpeedup: string;
  classicalComplexity: string;
  quantumComplexity: string;
  qubitRequirement: string;
  summary: string;
  coreConcepts: string[];
  circuitRepresentation: CircuitRepresentation;
  codeExamples: {
    language: 'python' | 'pseudocode';
    label: string;
    code: string;
  }[];
  expectedBehavior: {
    initialState: string;
    finalStateVector: string;
    measurementOutcomes: { state: string; probability: number; description: string }[];
    notes: string;
  };
  simulationPreset?: string;
  applications: string[];
  circuitOverview: {
    gatesUsed: string[];
    steps: {
      stepNumber: number;
      label: string;
      description: string;
    }[];
  };
}

export interface QuantumGate {
  id: string;
  symbol: string;
  name: string;
  description: string;
  matrix: string[][];
  color: string;
  category: 'Single-Qubit' | 'Phase' | 'Multi-Qubit' | 'Measurement';
}

export interface ComplexNumber {
  r: number;
  i: number;
}

export interface AmplitudeEntry {
  basis: string;
  real: number;
  imag: number;
  magnitude: number;
  probability: number;
  phaseRad: number;
  phaseDeg: number;
}

export interface IndividualQubitState {
  qubitIndex: number;
  isEntangled: boolean;
  purity: number; // 0.5 to 1.0 (1.0 = pure, < 1.0 = mixed/entangled)
  theta: number;  // 0 to PI
  phi: number;    // 0 to 2*PI
  prob0: number;
  prob1: number;
  blochVector: { x: number; y: number; z: number };
}

export interface SimulationResult {
  numQubits: number;
  totalSteps: number;
  circuitDepth: number;
  totalGates: number;
  multiQubitGates: number;
  isEntangled: boolean;
  stateVector: AmplitudeEntry[];
  diracNotation: string;
  probabilities: Record<string, number>;
  measurementCounts: Record<string, number>;
  shots: number;
  executionTimeMs: number;
  individualQubits: IndividualQubitState[];
  hasMeasurement: boolean;
  unsupportedGatesDetected?: string[];
}

export interface QubitCircuitState {
  numQubits: number;
  grid: (string | null)[][]; // [qubitIndex][stepIndex]
  probabilities: { [basisState: string]: number };
  stateVectorString: string;
}

export interface BlochAngles {
  theta: number; // 0 to PI
  phi: number;   // 0 to 2*PI
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  category: string;
  difficulty: DifficultyLevel;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Undergraduate Student' | 'Quantum Curious' | 'Researcher' | 'Self-Taught Developer';
  institution: string;
  streakDays: number;
  xpPoints: number;
  level: number;
  circuitsSimulated: number;
  quizzesCompleted: number;
  joinedDate: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
}
