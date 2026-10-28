import { QuantumModule, QuantumAlgorithm, QuantumGate, QuizQuestion, UserProfile } from '../types/quantum';

export const DEMO_MODULES: QuantumModule[] = [
  {
    id: 'mod-1',
    moduleNumber: 1,
    title: 'Introduction to Quantum Computing',
    slug: 'intro-to-quantum-computing',
    category: 'Fundamentals',
    level: 'Beginner',
    durationMinutes: 25,
    description: 'Discover why quantum computing represents a paradigm shift from classical computation, and where quantum advantage originates.',
    beginnerExplanation: `Imagine traditional computing as walking through a vast maze. A classical computer explores one path at a time; if it hits a dead end, it backtracks and tests the next branch.

A quantum computer harnesses fundamental quantum mechanics — physical laws that govern the universe at atomic scales. By using quantum states, it can assess vast solution spaces simultaneously through constructive interference, cancelling out incorrect paths and amplifying the correct one.

Quantum computers are not simply "faster laptops" for browsing or gaming; they are specialized machines built to solve problems with astronomical complexity: simulating complex molecules for medicine, optimizing clean energy grids, and solving mathematical factorizations.`,
    learningObjectives: [
      'Understand the fundamental physics motivation behind quantum computation',
      'Distinguish problems suited for quantum computers vs classical computers',
      'Identify the physical requirements of quantum hardware (superconductivity, ion traps, dilution refrigerators)'
    ],
    example: {
      title: 'The Nitrogenase Enzyme Simulation Problem',
      analogy: 'Why classical supercomputers fail at molecular chemistry',
      explanation: 'To simulate the nitrogenase molecule for synthetic fertilizer, a classical computer needs to track all electron orbital interactions. For just a few dozen orbitals, the classical memory required exceeds all atoms in the observable universe. A quantum computer maps each orbital directly to a qubit.',
      formulaOrCode: 'Classical States needed: 2^N (for N=100 orbitals, 2^100 ≈ 1.27 × 10^30 variables)'
    },
    interactiveDemo: {
      type: 'intro-scale',
      title: 'Exponential Scaling Explorer',
      instruction: 'Drag the slider to see how classical computation memory explodes exponentially while quantum state registers scale linearly.'
    },
    knowledgeCheck: [
      {
        id: 'qc-1-1',
        question: 'What is the primary physical reason quantum computers outperform classical computers on certain specialized problems?',
        options: [
          { id: 'a', text: 'They use faster clock frequencies than modern silicon CPUs' },
          { id: 'b', text: 'They leverage superposition and interference across complex probability amplitudes' },
          { id: 'c', text: 'They possess infinitely large classical hard drives' },
          { id: 'd', text: 'They do not require electrical power to operate' }
        ],
        correctOptionId: 'b',
        explanation: 'Quantum advantage arises from quantum superposition, entanglement, and wave interference that amplifies correct solutions, not raw gigahertz clock rates.',
        category: 'Quantum Fundamentals',
        difficulty: 'Beginner'
      },
      {
        id: 'qc-1-2',
        question: 'Which of the following problems is best suited for a quantum computer rather than a classical computer?',
        options: [
          { id: 'a', text: 'Rendering 4K streaming video' },
          { id: 'b', text: 'Simulating complex molecular electron orbitals for drug discovery' },
          { id: 'c', text: 'Typing and formatting a word document' },
          { id: 'd', text: 'Storing large relational database backups' }
        ],
        correctOptionId: 'b',
        explanation: 'Simulating quantum mechanical systems (like chemical bond orbitals) requires exponential classical memory, but maps naturally to qubits.',
        category: 'Quantum Applications',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['High School Mathematics', 'Basic Computer Concepts'],
    topicsCovered: ['Quantum Advantage', 'Exponential State Spaces', 'Physical Qubit Platforms', 'NISQ Era Overview'],
    featured: true
  },
  {
    id: 'mod-2',
    moduleNumber: 2,
    title: 'Classical Bits vs Quantum Bits',
    slug: 'bits-vs-qubits',
    category: 'Fundamentals',
    level: 'Beginner',
    durationMinutes: 30,
    description: 'Contrast binary switches (0 or 1) with qubits that live on the continuous surface of the Bloch sphere.',
    beginnerExplanation: `A classical bit is like a standard light switch: it is strictly OFF (0) or ON (1). Every classical file, photo, and software application is constructed from strings of these binary switches.

A quantum bit (qubit) is like a sphere. A qubit can be at the North Pole (|0⟩), at the South Pole (|1⟩), or at any point on the spherical surface. 

While a classical bit represents one definite value at any instant, an unmeasured qubit contains complex amplitudes for both 0 and 1. When measured, however, it must always collapse into a definite 0 or 1.`,
    learningObjectives: [
      'Compare discrete binary states {0, 1} with two-dimensional complex Hilbert spaces',
      'Understand the mathematical representation |0⟩ and |1⟩ in Dirac bra-ket notation',
      'Explain the difference between classical probability and quantum complex amplitudes'
    ],
    example: {
      title: 'A Coin on a Table vs a Spun Coin',
      analogy: 'Static state vs dynamic continuum',
      explanation: 'A coin resting flat on a table is definitively Heads (1) or Tails (0). A coin spinning on its edge has a chance of landing Heads or Tails depending on its orientation angle when stopped.',
      formulaOrCode: 'Classical: b ∈ {0, 1}   vs   Quantum: |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1'
    },
    interactiveDemo: {
      type: 'bits-vs-qubits',
      title: 'Bit vs Qubit Comparator',
      instruction: 'Toggle between a discrete classical bit and a continuous qubit vector to observe amplitude changes.'
    },
    knowledgeCheck: [
      {
        id: 'qc-2-1',
        question: 'In Dirac notation, what does the symbol |0⟩ represent?',
        options: [
          { id: 'a', text: 'The number zero divided by absolute value' },
          { id: 'b', text: 'The computational ground basis state vector [1, 0]ᵀ' },
          { id: 'c', text: 'An empty memory address with no qubits' },
          { id: 'd', text: 'A qubit that has been permanently turned off' }
        ],
        correctOptionId: 'b',
        explanation: 'In quantum information, |0⟩ is the ket vector [1, 0]ᵀ representing the standard basis state for 0.',
        category: 'Quantum States',
        difficulty: 'Beginner'
      },
      {
        id: 'qc-2-2',
        question: 'How many complex numbers describe the pure state of an isolated single qubit |ψ⟩ = α|0⟩ + β|1⟩?',
        options: [
          { id: 'a', text: 'Only 1 real integer' },
          { id: 'b', text: '2 complex probability amplitudes (α and β)' },
          { id: 'c', text: '256 floating point numbers' },
          { id: 'd', text: 'Infinite classical integers' }
        ],
        correctOptionId: 'b',
        explanation: 'A single qubit state is parameterized by two complex numbers α and β, normalized such that |α|² + |β|² = 1.',
        category: 'State Vectors',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['Basic Algebra', 'Vectors'],
    topicsCovered: ['Binary Switches', 'Dirac Bra-Ket Notation', 'Complex Amplitudes', 'Normalization Constraint'],
    featured: true
  },
  {
    id: 'mod-3',
    moduleNumber: 3,
    title: 'Qubits and Quantum States',
    slug: 'qubits-and-quantum-states',
    category: 'Fundamentals',
    level: 'Beginner',
    durationMinutes: 35,
    description: 'Explore the geometric beauty of the Bloch sphere, polar coordinates (θ, φ), and basis state transformations.',
    beginnerExplanation: `Because any single pure qubit state is normalized (|α|² + |β|² = 1) and global phases are unobservable, every pure qubit state can be mapped to a point on a 3-dimensional unit sphere called the **Bloch Sphere**.

The state is parameterized by two spherical angles:
- θ (theta): The polar angle (latitude), controlling the balance between |0⟩ and |1⟩.
- φ (phi): The azimuthal angle (longitude), representing the relative phase between the states.

This allows us to visualize quantum states as arrows pointing from the center of the sphere to its surface.`,
    learningObjectives: [
      'Navigate the Bloch sphere coordinates: poles, equator, and meridian circles',
      'Calculate the probability of measuring |0⟩ and |1⟩ given angles θ and φ',
      'Distinguish relative phase (physically measurable) from global phase (unobservable)'
    ],
    example: {
      title: 'Geographic Analogy of the Bloch Sphere',
      analogy: 'Earth coordinates and qubit states',
      explanation: 'The North Pole represents |0⟩ (θ = 0). The South Pole represents |1⟩ (θ = π). Cities on the equator (θ = π/2) represent 50/50 superpositions; the city longitude φ determines the relative phase.',
      formulaOrCode: '|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩'
    },
    interactiveDemo: {
      type: 'qubit-state-sphere',
      title: 'Bloch Sphere Angle Controller',
      instruction: 'Adjust latitude θ and longitude φ to rotate the state vector and calculate exact Born probabilities.'
    },
    knowledgeCheck: [
      {
        id: 'qc-3-1',
        question: 'Which state corresponds to the North Pole of the Bloch sphere (θ = 0)?',
        options: [
          { id: 'a', text: 'State |1⟩' },
          { id: 'b', text: 'State |0⟩' },
          { id: 'c', text: 'State |+⟩ = (|0⟩ + |1⟩)/√2' },
          { id: 'd', text: 'State |-⟩ = (|0⟩ - |1⟩)/√2' }
        ],
        correctOptionId: 'b',
        explanation: 'When θ = 0, cos(0/2) = 1 and sin(0/2) = 0, so |ψ⟩ = 1|0⟩ + 0|1⟩ = |0⟩.',
        category: 'Bloch Sphere',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['Trigonometry', 'Vectors'],
    topicsCovered: ['Bloch Sphere Geometry', 'Polar Angle θ', 'Azimuthal Phase φ', 'State Normalization'],
    featured: true
  },
  {
    id: 'mod-4',
    moduleNumber: 4,
    title: 'Superposition',
    slug: 'superposition',
    category: 'Fundamentals',
    level: 'Beginner',
    durationMinutes: 40,
    description: 'Understand linear combinations of basis states, the Hadamard transform, and constructive/destructive interference.',
    beginnerExplanation: `Superposition is often mistakenly described as "being in both states at the same time." In physics, superposition is a linear combination of states with specific phase relationships.

Just like two water ripples can overlap to form a bigger wave (constructive interference) or cancel each other out into stillness (destructive interference), quantum amplitudes can add together or subtract.

The famous Hadamard gate (H) places a qubit into an equal superposition:
H|0⟩ = |+⟩ = (|0⟩ + |1⟩) / √2
When measured, this state produces 0 with 50% probability and 1 with 50% probability.`,
    learningObjectives: [
      'Define superposition mathematically as a linear combination of basis vectors',
      'Explain how the Hadamard gate generates equal superposition states |+⟩ and |-⟩',
      'Understand wave interference: constructive (+1) and destructive (-1) phase cancellation'
    ],
    example: {
      title: 'Noise-Cancelling Headphones vs Quantum Interference',
      analogy: 'Acoustic wave cancellation',
      explanation: 'Noise-cancelling headphones emit an inverted sound wave (180° out of phase) to cancel background noise. In quantum algorithms, we use destructive interference to eliminate incorrect solution paths.',
      formulaOrCode: '|+⟩ = (|0⟩ + |1⟩)/√2,   |-⟩ = (|0⟩ - |1⟩)/√2. Notice: H|+⟩ = |0⟩ and H|-⟩ = |1⟩!'
    },
    interactiveDemo: {
      type: 'superposition-spinner',
      title: 'Superposition Phase & Amplitude Mixer',
      instruction: 'Vary the probability balance α and β to see the superposition wave and outcome likelihood.'
    },
    knowledgeCheck: [
      {
        id: 'qc-4-1',
        question: 'If a qubit is in state |+⟩ = (|0⟩ + |1⟩)/√2, what happens if we apply another Hadamard gate H to it?',
        options: [
          { id: 'a', text: 'It remains in state |+⟩' },
          { id: 'b', text: 'It returns to the pure basis state |0⟩' },
          { id: 'c', text: 'It flips to state |1⟩' },
          { id: 'd', text: 'The qubit decoheres and disappears' }
        ],
        correctOptionId: 'b',
        explanation: 'Because H is self-inverse (H² = I), applying H to |+⟩ = H|0⟩ yields H(H|0⟩) = |0⟩ via constructive interference on 0 and destructive interference on 1.',
        category: 'Superposition',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['Bits vs Qubits', 'Unitary Operations'],
    topicsCovered: ['Linear Combinations', 'Hadamard Transform', 'Interference Patterns', 'State |+⟩ and |-⟩'],
    featured: true
  },
  {
    id: 'mod-5',
    moduleNumber: 5,
    title: 'Entanglement',
    slug: 'entanglement',
    category: 'Fundamentals',
    level: 'Intermediate',
    durationMinutes: 45,
    description: 'Explore Einstein\'s "spooky action at a distance", Bell states, and why entangled states cannot be factored into independent qubits.',
    beginnerExplanation: `When two qubits become entangled, their physical properties become inextricably linked. You cannot describe the state of one qubit without referencing the state of the other, no matter how far apart they are separated in space.

Consider the Bell state:
|Φ⁺⟩ = (|00⟩ + |11⟩) / √2

Before measurement, neither qubit has a definite value. But the moment you measure qubit 1:
- If qubit 1 collapses to 0, qubit 2 INSTANTLY collapses to 0.
- If qubit 1 collapses to 1, qubit 2 INSTANTLY collapses to 1.

Entanglement does NOT allow faster-than-light communication (the No-Communication Theorem), because local measurement results are completely random until classical correlation data is sent.`,
    learningObjectives: [
      'Define entanglement via tensor product non-separability (|ψ⟩ ≠ |q1⟩ ⊗ |q2⟩)',
      'Construct the four maximally entangled Bell states using H and CNOT gates',
      'Explain the No-Communication Theorem and why entanglement respects Einstein\'s relativity'
    ],
    example: {
      title: 'The Magic Matching Shoes Analogy',
      analogy: 'Correlated pairs without pre-determined values',
      explanation: 'Imagine a box with two magic shoes. You take one to Mars and leave one in Paris. The shoe in Paris has no fixed color until opened. If you open Paris and see a blue shoe, the shoe on Mars instantly becomes blue.',
      formulaOrCode: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2,  |Φ⁻⟩ = (|00⟩ - |11⟩)/√2,  |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2,  |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2'
    },
    interactiveDemo: {
      type: 'entanglement-bell',
      title: 'Bell State Entanglement Generator',
      instruction: 'Create an entangled pair, measure qubit A, and observe instantaneous correlated collapse of qubit B.'
    },
    knowledgeCheck: [
      {
        id: 'qc-5-1',
        question: 'Which of the following two-qubit states is entangled (non-separable)?',
        options: [
          { id: 'a', text: '|00⟩' },
          { id: 'b', text: '(|00⟩ + |01⟩) / √2' },
          { id: 'c', text: '(|00⟩ + |11⟩) / √2' },
          { id: 'd', text: '(|00⟩ + |01⟩ + |10⟩ + |11⟩) / 2' }
        ],
        correctOptionId: 'c',
        explanation: 'State (|00⟩ + |11⟩)/√2 cannot be written as (a|0⟩ + b|1⟩) ⊗ (c|0⟩ + d|1⟩). The other options can be factored into independent product states.',
        category: 'Entanglement',
        difficulty: 'Intermediate'
      }
    ],
    prerequisites: ['Superposition', 'Tensor Products'],
    topicsCovered: ['Bell States', 'Non-Separability', 'EPR Paradox', 'No-Communication Theorem'],
    featured: true
  },
  {
    id: 'mod-6',
    moduleNumber: 6,
    title: 'Quantum Measurement',
    slug: 'quantum-measurement',
    category: 'Fundamentals',
    level: 'Beginner',
    durationMinutes: 35,
    description: 'Demystify wave function collapse, the Born rule, and why observing a quantum state irreversibly alters it.',
    beginnerExplanation: `In classical physics, observing an object does not change its state: looking at a parked car does not alter its position or speed.

In quantum computing, **measurement is active and destructive**. When you measure a qubit in superposition:
1. The continuous wave function instantly collapses to one of the measurement basis states ({|0⟩, |1⟩}).
2. All delicate phase information (φ) and superposition amplitudes are lost.
3. The probability of collapsing to state |x⟩ is given by the Born Rule: P(x) = |⟨x|ψ⟩|² = |amplitude|².

Once collapsed, subsequent measurements will always yield the same collapsed outcome with 100% certainty until another unitary gate is applied.`,
    learningObjectives: [
      'Apply the Born rule to calculate outcome probabilities from complex state vectors',
      'Explain projective measurement and state vector collapse into computational eigenstates',
      'Understand why measurement is non-unitary and irreversible'
    ],
    example: {
      title: 'Sampling from |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩',
      analogy: 'Calculating Born rule probabilities',
      explanation: 'The amplitude for 0 is 1/2. The amplitude for 1 is √3/2. Measuring will produce 0 with (1/2)² = 25% chance and 1 with (√3/2)² = 75% chance.',
      formulaOrCode: 'P(0) = |1/2|² = 0.25 (25%),   P(1) = |√3/2|² = 3/4 = 0.75 (75%)'
    },
    interactiveDemo: {
      type: 'measurement-collapse',
      title: 'State Collapse & Histogram Sampler',
      instruction: 'Trigger individual quantum measurements to watch continuous amplitudes collapse into classical binary bits.'
    },
    knowledgeCheck: [
      {
        id: 'qc-6-1',
        question: 'What happens to a qubit in state (|0⟩ + |1⟩)/√2 after it is measured and yields outcome 1?',
        options: [
          { id: 'a', text: 'It remains in equal superposition (|0⟩ + |1⟩)/√2' },
          { id: 'b', text: 'Its state collapses irreversibly to |1⟩' },
          { id: 'c', text: 'It resets automatically to |0⟩' },
          { id: 'd', text: 'The qubit ceases to exist' }
        ],
        correctOptionId: 'b',
        explanation: 'Measurement is projective: the wave function collapses onto the measured eigenstate |1⟩. Immediately repeating the measurement will yield 1 with 100% probability.',
        category: 'Measurement',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['Qubits & Quantum States', 'Superposition'],
    topicsCovered: ['Wave Function Collapse', 'Born Rule', 'Projective Operators', 'Post-Measurement State'],
    featured: true
  },
  {
    id: 'mod-7',
    moduleNumber: 7,
    title: 'Quantum Gates: X, Y, Z, H, S, T and CNOT',
    slug: 'quantum-gates-library',
    category: 'Gates & Circuits',
    level: 'Beginner',
    durationMinutes: 50,
    description: 'Master the fundamental toolbox of single-qubit and two-qubit unitary transformation matrices.',
    beginnerExplanation: `Quantum gates are the building blocks of quantum circuits, analogous to classical logic gates (AND, OR, NOT). However, unlike classical gates, all quantum gates (except measurement) are **unitary and reversible**: you can always run the gate backward to recover the input!

Core Gates:
- **Pauli-X**: Quantum NOT gate. Flips |0⟩ ↔ |1⟩ (π rotation around X).
- **Pauli-Z**: Phase flip gate. Flips phase of |1⟩: |1⟩ → -|1⟩ (π rotation around Z).
- **Pauli-Y**: Combines bit-flip and phase-flip.
- **Hadamard (H)**: Creates superposition: |0⟩ → |+⟩, |1⟩ → |-⟩.
- **Phase (S)**: Adds a π/2 (90°) phase shift to |1⟩: |1⟩ → i|1⟩.
- **T-Gate**: Adds a π/4 (45°) phase shift to |1⟩: essential for universal fault-tolerant computation.
- **CNOT (CX)**: Two-qubit gate. Flips target qubit if and only if control qubit is 1.`,
    learningObjectives: [
      'Understand unitary operations as length-preserving matrix multiplications (U†U = I)',
      'Apply single-qubit rotations (X, Y, Z, H, S, T) to state vectors',
      'Explain the entangling capability of the two-qubit CNOT gate'
    ],
    example: {
      title: 'Pauli-X Gate Matrix Multiplication',
      analogy: 'Flipping basis vectors',
      explanation: 'Multiplying vector [1, 0]ᵀ by X matrix [[0, 1], [1, 0]] yields [0, 1]ᵀ (state |1⟩).',
      formulaOrCode: 'X = [[0, 1], [1, 0]],   H = 1/√2 [[1, 1], [1, -1]],   CNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]'
    },
    interactiveDemo: {
      type: 'gates-sandbox',
      title: 'Unitary Gate Matrix Transformer',
      instruction: 'Click any gate button to see its matrix, its 3D axis rotation, and how it transforms input state |0⟩.'
    },
    knowledgeCheck: [
      {
        id: 'qc-7-1',
        question: 'Which quantum gate is equivalent to a π/2 (90-degree) rotation around the Z-axis, satisfying S² = Z?',
        options: [
          { id: 'a', text: 'Pauli-X gate' },
          { id: 'b', text: 'Phase S gate' },
          { id: 'c', text: 'Hadamard gate' },
          { id: 'd', text: 'CNOT gate' }
        ],
        correctOptionId: 'b',
        explanation: 'The S gate is the square root of Pauli-Z: S² = Z. It applies an e^(iπ/2) = i phase shift to |1⟩.',
        category: 'Quantum Gates',
        difficulty: 'Beginner'
      }
    ],
    prerequisites: ['Matrix Multiplication', 'Qubits & Quantum States'],
    topicsCovered: ['Pauli Operators (X, Y, Z)', 'Hadamard Superposition', 'Phase Rotations (S, T)', 'Controlled-NOT (CNOT)'],
    featured: true
  },
  {
    id: 'mod-8',
    moduleNumber: 8,
    title: 'Quantum Circuits',
    slug: 'quantum-circuits',
    category: 'Gates & Circuits',
    level: 'Intermediate',
    durationMinutes: 45,
    description: 'Learn how to read, compose, and execute quantum circuit diagrams consisting of wires, gates, and measurement barriers.',
    beginnerExplanation: `A quantum circuit diagram is a schematic representation of quantum computation through time:
- **Horizontal lines (wires)**: Each line represents a single qubit moving from left (time t = 0) to right (time t = final).
- **Boxes on wires**: Represent single-qubit quantum gates applied at that time step.
- **Vertical connections**: Represent multi-qubit interactions like CNOT (control dot connected to target ⊕).
- **Double lines**: Represent classical bits carrying measurement outcome values after measurement.

Circuit Depth is the number of sequential gate steps required, while Circuit Width is the total number of qubits used. Minimizing circuit depth is critical on today's noisy quantum hardware to prevent decoherence!`,
    learningObjectives: [
      'Read and write quantum circuit schematics from left to right',
      'Calculate multi-qubit composite state vectors via tensor products (⊗)',
      'Analyze circuit depth, gate counts, and parallel vs sequential execution'
    ],
    example: {
      title: 'The Bell State Circuit',
      analogy: 'Composing H followed by CNOT',
      explanation: 'Step 1: Qubit 0 gets an H gate (creates |+⟩|0⟩). Step 2: CNOT with Qubit 0 as control and Qubit 1 as target entangles them into (|00⟩ + |11⟩)/√2.',
      formulaOrCode: 'Initial: |00⟩  → (H ⊗ I) → (|00⟩ + |10⟩)/√2  → CNOT → (|00⟩ + |11⟩)/√2'
    },
    interactiveDemo: {
      type: 'circuits-builder',
      title: 'Interactive 2-Qubit Circuit Assembly',
      instruction: 'Drag gates onto the two wires to watch the step-by-step tensor product evolution.'
    },
    knowledgeCheck: [
      {
        id: 'qc-8-1',
        question: 'In a quantum circuit diagram, what does the horizontal direction from left to right represent?',
        options: [
          { id: 'a', text: 'Physical distance inside the dilution refrigerator' },
          { id: 'b', text: 'Progression of time from circuit start to measurement' },
          { id: 'c', text: 'Increasing energy frequency in gigahertz' },
          { id: 'd', text: 'Classical memory storage addresses' }
        ],
        correctOptionId: 'b',
        explanation: 'Quantum circuits read left-to-right as a timeline: qubits are initialized on the left, gates are applied in sequence, and measurements occur on the right.',
        category: 'Quantum Circuits',
        difficulty: 'Intermediate'
      }
    ],
    prerequisites: ['Quantum Gates', 'Tensor Products'],
    topicsCovered: ['Circuit Schematics', 'Circuit Depth & Width', 'Measurement Barriers', 'Composite State Tracking'],
    featured: true
  },
  {
    id: 'mod-9',
    moduleNumber: 9,
    title: 'Quantum Algorithms',
    slug: 'quantum-algorithms-overview',
    category: 'Algorithms',
    level: 'Intermediate',
    durationMinutes: 50,
    description: 'Discover how superposition, entanglement, and phase kickback combine to solve problems fundamentally faster than classical computers.',
    beginnerExplanation: `A quantum algorithm is not simply classical code compiled for quantum hardware; it is a specially crafted mathematical choreography of wave interference.

All quantum algorithms follow a three-stage recipe:
1. **State Initialization & Equal Superposition**: Apply Hadamard gates to create a vast superposition across all possible inputs (2^n states).
2. **Oracle & Phase Marking**: Evaluate the problem function into the relative phases of the states using phase kickback.
3. **Constructive Interference & Amplification**: Transform phase differences back into amplitude differences so that the correct answer has an overwhelming probability of being observed upon measurement!

Examples include Grover's search, Shor's factoring, and the Quantum Fourier Transform.`,
    learningObjectives: [
      'Recognize the universal 3-stage structure of quantum algorithms',
      'Explain Phase Kickback: using an ancilla qubit in |-⟩ to write values into phases',
      'Distinguish polynomial vs exponential quantum speedups'
    ],
    example: {
      title: 'Database Search Comparison',
      analogy: 'Searching 1,000,000 items in an unindexed phone book',
      explanation: 'A classical search requires an average of 500,000 checks (O(N)). Grover\'s quantum algorithm requires only approximately 1,000 queries (O(√N)), a massive quadratic acceleration!',
      formulaOrCode: 'Classical queries: N/2 = 500,000   vs   Quantum Grover queries: (π/4)√N ≈ 785 queries'
    },
    interactiveDemo: {
      type: 'algorithms-comparison',
      title: 'Classical vs Quantum Complexity Race',
      instruction: 'Compare query scaling between classical exhaustive search and Grover quantum search for expanding database sizes.'
    },
    knowledgeCheck: [
      {
        id: 'qc-9-1',
        question: 'What is the role of constructive interference in quantum algorithms?',
        options: [
          { id: 'a', text: 'It creates extra physical qubits when the CPU runs out of memory' },
          { id: 'b', text: 'It amplifies the probability amplitude of the correct answer while cancelling out incorrect ones' },
          { id: 'c', text: 'It protects the computer from room-temperature heat' },
          { id: 'd', text: 'It replaces classical power supply cables' }
        ],
        correctOptionId: 'b',
        explanation: 'Quantum algorithms orchestrate phases so that amplitude paths leading to the correct solution add constructively, while incorrect paths cancel out destructively.',
        category: 'Quantum Algorithms',
        difficulty: 'Intermediate'
      }
    ],
    prerequisites: ['Quantum Circuits', 'Superposition', 'Entanglement'],
    topicsCovered: ['Phase Kickback', 'Amplitude Amplification', 'Oracle Functions', 'Quantum Complexity Classes'],
    featured: true
  }
];

export const DEMO_ALGORITHMS: QuantumAlgorithm[] = [
  {
    id: 'algo-bell-state',
    title: 'Bell State Preparation',
    slug: 'bell-state-preparation',
    purpose: 'Generates maximally entangled two-qubit EPR pairs that form the foundation for teleportation, superdense coding, and quantum key distribution.',
    inventor: 'John Stewart Bell',
    yearIntroduced: 1964,
    difficulty: 'Beginner',
    quantumSpeedup: 'Entanglement Foundation',
    classicalComplexity: 'Separable states only',
    quantumComplexity: '2 gates (Depth 2)',
    qubitRequirement: '2 qubits',
    summary: 'Constructs the canonical entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 using a single Hadamard gate and a Controlled-NOT (CNOT) gate.',
    coreConcepts: [
      'Initialization of two qubits in computational ground state |00⟩',
      'Hadamard gate on control qubit Q0 to create equal superposition (|0⟩ + |1⟩)/√2',
      'CNOT with Q0 as control and Q1 as target, entangling the two qubits into non-separable state',
      'Correlated measurement outcomes: 50% chance of 00 and 50% chance of 11'
    ],
    circuitRepresentation: {
      numQubits: 2,
      qubitLabels: ['q[0]', 'q[1]'],
      gates: [
        { qubit: 0, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 0, step: 2, symbol: '●', name: 'CNOT Control', isControl: true, targetQubit: 1 },
        { qubit: 1, step: 2, symbol: '⊕', name: 'CNOT Target' }
      ],
      measurementSteps: [3],
      notes: 'Produces maximally entangled Bell pair |Φ⁺⟩'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit (Python)',
        code: `from qiskit import QuantumCircuit, Aer, execute

# 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)

# Step 1: Put qubit 0 into superposition
qc.h(0)

# Step 2: Entangle qubit 0 with qubit 1
qc.cx(0, 1)

# Step 3: Measure both qubits
qc.measure([0, 1], [0, 1])

# Execute on local QASM simulator
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1024)
result = job.result()
print("Measurement counts:", result.get_counts(qc))`
      },
      {
        language: 'pseudocode',
        label: 'Mathematical Formulation',
        code: `Algorithm: BellStatePreparation(q0, q1)
Input: |0⟩ on wire q0, |0⟩ on wire q1  -> State: |00⟩
Step 1: Apply H to q0
        |ψ₁⟩ = (H ⊗ I) |00⟩ = (|00⟩ + |10⟩) / √2
Step 2: Apply CNOT(q0 -> q1)
        If q0 is 0 -> q1 stays 0 (|00⟩)
        If q0 is 1 -> q1 flips to 1 (|11⟩)
        |ψ₂⟩ = (|00⟩ + |11⟩) / √2 = |Φ⁺⟩
Output: Maximally entangled state |Φ⁺⟩`
      }
    ],
    expectedBehavior: {
      initialState: '|00⟩',
      finalStateVector: '(|00⟩ + |11⟩) / √2  ≈ 0.707|00⟩ + 0.707|11⟩',
      measurementOutcomes: [
        { state: '|00⟩', probability: 50, description: 'Both qubits collapse to 0 simultaneously' },
        { state: '|11⟩', probability: 50, description: 'Both qubits collapse to 1 simultaneously' },
        { state: '|01⟩', probability: 0, description: 'Strictly prohibited by entanglement correlation' },
        { state: '|10⟩', probability: 0, description: 'Strictly prohibited by entanglement correlation' }
      ],
      notes: 'Outcomes 01 and 10 have zero probability. Demonstrates non-locality without violating relativity.'
    },
    simulationPreset: 'bell',
    applications: [
      'Quantum Teleportation protocol',
      'Superdense coding for quantum communications',
      'Quantum Key Distribution (E91 QKD Protocol)',
      'Tests of Bell inequalities & local hidden variables'
    ],
    circuitOverview: {
      gatesUsed: ['H', 'CNOT', 'Measure'],
      steps: [
        { stepNumber: 1, label: 'Superposition', description: 'Apply Hadamard H to qubit 0: maps |00⟩ to (|00⟩ + |10⟩)/√2.' },
        { stepNumber: 2, label: 'Entanglement', description: 'Apply CNOT with qubit 0 controlling qubit 1: produces (|00⟩ + |11⟩)/√2.' },
        { stepNumber: 3, label: 'Measurement', description: 'Measure in computational basis: outcomes 00 and 11 appear with equal 50% probability.' }
      ]
    }
  },
  {
    id: 'algo-teleportation',
    title: 'Quantum Teleportation',
    slug: 'quantum-teleportation',
    purpose: 'Transfers an unknown arbitrary quantum state from sender (Alice) to receiver (Bob) without physically transmitting the qubit itself, using entanglement and 2 classical bits.',
    inventor: 'Charles Bennett, Gilles Brassard et al.',
    yearIntroduced: 1993,
    difficulty: 'Intermediate',
    quantumSpeedup: 'Information Transfer Protocol',
    classicalComplexity: 'Impossible without measuring & destroying state',
    quantumComplexity: '2 classical bits + 1 EPR pair',
    qubitRequirement: '3 qubits (1 state, 2 channel)',
    summary: 'Disassembles state |ψ⟩ via Bell-basis measurement and reconstructs it faithfully at the receiver node using classical feed-forward Pauli corrections.',
    coreConcepts: [
      'No-Cloning Theorem prevents copying unknown quantum states',
      'Shared entangled Bell pair distributed between Alice and Bob',
      'Joint Bell measurement by Alice entangles her unknown state with her half of the EPR pair',
      'Alice transmits 2 classical bits; Bob applies Pauli corrections Z^(m0) X^(m1) to recover exact |ψ⟩'
    ],
    circuitRepresentation: {
      numQubits: 3,
      qubitLabels: ['q[0] (State |ψ⟩)', 'q[1] (Alice EPR)', 'q[2] (Bob EPR)'],
      gates: [
        { qubit: 1, step: 1, symbol: 'H', name: 'EPR Prep H' },
        { qubit: 1, step: 2, symbol: '●', name: 'EPR CNOT Ctrl', isControl: true, targetQubit: 2 },
        { qubit: 2, step: 2, symbol: '⊕', name: 'EPR CNOT Tgt' },
        { qubit: 0, step: 3, symbol: '●', name: 'Bell Measure CNOT', isControl: true, targetQubit: 1 },
        { qubit: 1, step: 3, symbol: '⊕', name: 'Bell Measure Target' },
        { qubit: 0, step: 4, symbol: 'H', name: 'Alice H' }
      ],
      measurementSteps: [5],
      notes: 'Transfers state from q[0] onto q[2] after classical feed-forward'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit (Python)',
        code: `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

qr = QuantumRegister(3, 'q')
cr0 = ClassicalRegister(1, 'c0')
cr1 = ClassicalRegister(1, 'c1')
qc = QuantumCircuit(qr, cr0, cr1)

# Step 1: Create entangled Bell pair between Alice (q1) and Bob (q2)
qc.h(qr[1])
qc.cx(qr[1], qr[2])

# Step 2: Alice entangles her unknown state (q0) with q1
qc.cx(qr[0], qr[1])
qc.h(qr[0])

# Step 3: Alice measures her two qubits
qc.measure(qr[0], cr0)
qc.measure(qr[1], cr1)

# Step 4: Bob applies classical feed-forward corrections
# (In real quantum hardware: dynamic circuit conditional gates)
# if cr1 == 1: apply X to q2
# if cr0 == 1: apply Z to q2`
      },
      {
        language: 'pseudocode',
        label: 'Protocol Pseudocode',
        code: `Protocol QuantumTeleportation:
Input: Unknown state |ψ⟩ = α|0⟩ + β|1⟩ on qubit A
Channel: Entangled Bell pair |Φ⁺⟩ on qubits (A_entangled, B)
1. Alice entangles A with A_entangled: Apply CNOT(A -> A_entangled), then H(A)
2. Alice measures A (outcome m0 ∈ {0,1}) and A_entangled (outcome m1 ∈ {0,1})
3. Alice transmits 2 classical bits (m0, m1) to Bob
4. Bob receives bits and applies conditional Pauli gates:
   - If m1 == 1: Bob applies Pauli-X to qubit B
   - If m0 == 1: Bob applies Pauli-Z to qubit B
Output: Qubit B is now exactly α|0⟩ + β|1⟩!`
      }
    ],
    expectedBehavior: {
      initialState: '|ψ⟩ ⊗ |00⟩',
      finalStateVector: 'Bob holds exact state |ψ⟩ = α|0⟩ + β|1⟩',
      measurementOutcomes: [
        { state: 'Alice bits: 00', probability: 25, description: 'Bob applies Identity (no correction needed)' },
        { state: 'Alice bits: 01', probability: 25, description: 'Bob applies Pauli-X' },
        { state: 'Alice bits: 10', probability: 25, description: 'Bob applies Pauli-Z' },
        { state: 'Alice bits: 11', probability: 25, description: 'Bob applies Pauli-Z followed by Pauli-X' }
      ],
      notes: 'State on Alice qubit A is destroyed during measurement, satisfying the No-Cloning Theorem.'
    },
    simulationPreset: 'teleportation',
    applications: [
      'Quantum network repeaters and quantum internet routers',
      'Distributed quantum computing clusters',
      'Fault-tolerant gate teleportation in surface code architectures'
    ],
    circuitOverview: {
      gatesUsed: ['H', 'CNOT', 'Bell Measurement', 'Feed-Forward X/Z'],
      steps: [
        { stepNumber: 1, label: 'EPR Pair Distribution', description: 'Create entangled pair (|00⟩ + |11⟩)/√2 between Alice and Bob.' },
        { stepNumber: 2, label: 'Alice Interaction', description: 'Alice entangles unknown state |ψ⟩ with her half of EPR pair using CNOT and H.' },
        { stepNumber: 3, label: 'Bell Measurement', description: 'Alice measures her two qubits, yielding classical bits (m0, m1).' },
        { stepNumber: 4, label: 'Bob Correction', description: 'Bob applies Z^(m0) X^(m1) to reconstruct exact state |ψ⟩.' }
      ]
    }
  },
  {
    id: 'algo-deutsch-jozsa',
    title: 'Deutsch-Jozsa Algorithm',
    slug: 'deutsch-jozsa',
    purpose: 'Determines deterministically with 100% confidence whether a hidden black-box Boolean function f(x) is constant or balanced in a single quantum query.',
    inventor: 'David Deutsch & Richard Jozsa',
    yearIntroduced: 1992,
    difficulty: 'Beginner',
    quantumSpeedup: 'Exponential Query Separation',
    classicalComplexity: 'O(2^(n-1) + 1) queries in worst case',
    quantumComplexity: '1 quantum oracle query (O(1))',
    qubitRequirement: 'n input qubits + 1 ancilla qubit',
    summary: 'The historic first algorithm to demonstrate a provable exponential separation between classical deterministic queries and quantum queries using phase kickback.',
    coreConcepts: [
      'A Boolean function f: {0,1}^n → {0,1} is either constant (all 0s or all 1s) or balanced (equal 0s and 1s)',
      'Classical deterministic algorithm requires evaluating 2^(n-1) + 1 inputs in worst case',
      'Phase kickback: Ancilla initialized in |-⟩ = (|0⟩ - |1⟩)/√2 converts f(x) evaluation into (-1)^f(x) phase',
      'Interference decoding: H gates bring constructive interference to |00...0⟩ if constant, destructive if balanced'
    ],
    circuitRepresentation: {
      numQubits: 3,
      qubitLabels: ['q[0] (Input)', 'q[1] (Input)', 'q[2] (Ancilla)'],
      gates: [
        { qubit: 2, step: 1, symbol: 'X', name: 'Ancilla NOT' },
        { qubit: 0, step: 2, symbol: 'H', name: 'Hadamard' },
        { qubit: 1, step: 2, symbol: 'H', name: 'Hadamard' },
        { qubit: 2, step: 2, symbol: 'H', name: 'Ancilla H' },
        { qubit: 0, step: 3, symbol: 'Uf', name: 'Oracle U_f' },
        { qubit: 0, step: 4, symbol: 'H', name: 'Decode H' },
        { qubit: 1, step: 4, symbol: 'H', name: 'Decode H' }
      ],
      measurementSteps: [5],
      notes: 'Measures |00⟩ if f is constant, any other state if f is balanced'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit (Python)',
        code: `from qiskit import QuantumCircuit

# For n = 2 input qubits + 1 ancilla qubit
n = 2
qc = QuantumCircuit(n + 1, n)

# Step 1: Initialize ancilla to |-⟩
qc.x(n)
qc.h(n)

# Step 2: Initialize input qubits to equal superposition
for i in range(n):
    qc.h(i)

# Step 3: Apply Oracle (Example: Balanced oracle via CNOT)
qc.cx(0, n)
qc.cx(1, n)

# Step 4: Apply Hadamard to input qubits
for i in range(n):
    qc.h(i)

# Step 5: Measure input qubits
qc.measure(range(n), range(n))
print(qc.draw())`
      },
      {
        language: 'pseudocode',
        label: 'Oracle Pseudocode',
        code: `Algorithm DeutschJozsa(Oracle U_f, n qubits):
1. Initialize |ψ₀⟩ = |0⟩^⊗n ⊗ |1⟩
2. Apply H^(⊗n+1):
   |ψ₁⟩ = (1/√2^n ∑ |x⟩) ⊗ |-⟩
3. Apply Oracle U_f:
   U_f(|x⟩|-⟩) = (-1)^f(x) |x⟩|-⟩
   |ψ₂⟩ = (1/√2^n ∑ (-1)^f(x) |x⟩) ⊗ |-⟩
4. Apply H^(⊗n) to input register:
   Amplitude of |0...0⟩ is (1/2^n) ∑ (-1)^f(x)
   - If f is constant: sum = ±1 -> Measure |0...0⟩ with 100% certainty!
   - If f is balanced: sum = 0  -> Probability of |0...0⟩ is 0%!
5. Measure input qubits`
      }
    ],
    expectedBehavior: {
      initialState: '|00⟩|1⟩',
      finalStateVector: 'If constant: ±|00⟩|-⟩   |   If balanced: orthogonal to |00⟩',
      measurementOutcomes: [
        { state: '|00⟩', probability: 100, description: 'Observed if and only if function f is CONSTANT' },
        { state: 'Any non-zero bitstring', probability: 100, description: 'Observed if and only if function f is BALANCED' }
      ],
      notes: 'Requires strictly 1 query to resolve a problem requiring up to 2^(n-1)+1 classical queries.'
    },
    simulationPreset: 'deutsch-jozsa',
    applications: [
      'Foundational proof of quantum computational separation',
      'Blueprint for Bernstein-Vazirani algorithm and Simon\'s algorithm',
      'Theory of oracle query complexity'
    ],
    circuitOverview: {
      gatesUsed: ['X', 'H', 'Oracle U_f', 'H', 'Measure'],
      steps: [
        { stepNumber: 1, label: 'Superposition & Kickback', description: 'Initialize inputs to |0⟩, ancilla to |1⟩; apply H to all qubits.' },
        { stepNumber: 2, label: 'Oracle Evaluation', description: 'Evaluate U_f which writes (-1)^f(x) directly onto the input amplitudes.' },
        { stepNumber: 3, label: 'Interference Decoding', description: 'Apply Hadamard H to input register to convert phase differences to basis states.' },
        { stepNumber: 4, label: 'Deterministic Readout', description: 'Measure input register: |00...0⟩ indicates constant; any other result indicates balanced.' }
      ]
    }
  },
  {
    id: 'algo-grover',
    title: 'Grover\'s Search Algorithm',
    slug: 'grovers-search',
    purpose: 'Searches an unstructured database or solution space of N items with a quadratic speedup in O(√N) queries instead of classical O(N).',
    inventor: 'Lov Grover',
    yearIntroduced: 1996,
    difficulty: 'Intermediate',
    quantumSpeedup: 'Quadratic Speedup',
    classicalComplexity: 'O(N) queries (average N/2)',
    quantumComplexity: 'O(√N) queries (≈ (π/4)√N)',
    qubitRequirement: 'n qubits for N = 2^n elements',
    summary: 'Amplifies the quantum probability amplitude of marked target states through alternating oracle phase inversion and geometric diffusion reflections.',
    coreConcepts: [
      'Uniform superposition over all N = 2^n states created with Hadamard transform',
      'Phase Oracle U_w flips the sign of target item: |w⟩ → -|w⟩',
      'Diffusion operator D = 2|s⟩⟨s| - I reflects all amplitudes about their mean',
      'Target amplitude increases by ≈ 2/√N each iteration until reaching ≈ 100% at (π/4)√N steps'
    ],
    circuitRepresentation: {
      numQubits: 3,
      qubitLabels: ['q[0]', 'q[1]', 'q[2]'],
      gates: [
        { qubit: 0, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 1, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 2, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 0, step: 2, symbol: 'Uw', name: 'Phase Oracle' },
        { qubit: 0, step: 3, symbol: 'H', name: 'Diffusion H' },
        { qubit: 1, step: 3, symbol: 'H', name: 'Diffusion H' },
        { qubit: 2, step: 3, symbol: 'H', name: 'Diffusion H' },
        { qubit: 0, step: 4, symbol: 'X', name: 'Diffusion X' },
        { qubit: 1, step: 4, symbol: 'X', name: 'Diffusion X' },
        { qubit: 2, step: 4, symbol: 'X', name: 'Diffusion X' }
      ],
      measurementSteps: [5],
      notes: 'Repeats Oracle + Diffusion ≈ (π/4)√N times'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit (Python)',
        code: `from qiskit import QuantumCircuit

# 2-qubit Grover searching for target state |11⟩
qc = QuantumCircuit(2, 2)

# Step 1: Initialize into equal superposition
qc.h([0, 1])

# Step 2: Phase Oracle for target |11⟩ (Controlled-Z)
qc.cz(0, 1)

# Step 3: Diffusion Operator (Inversion about mean)
qc.h([0, 1])
qc.x([0, 1])
qc.cz(0, 1)
qc.x([0, 1])
qc.h([0, 1])

# Step 4: Measure
qc.measure([0, 1], [0, 1])
print(qc.draw())`
      },
      {
        language: 'pseudocode',
        label: 'Grover Iteration Algorithm',
        code: `Algorithm GroverSearch(Oracle U_w, N = 2^n):
1. Prepare |s⟩ = (1/√N) ∑_{x=0}^{N-1} |x⟩ via H^(⊗n)
2. Compute optimal iteration count k ≈ round((π/4)√N)
3. For step = 1 to k:
   a. Apply Oracle: U_w = I - 2|w⟩⟨w|
      (Target amplitude α_w becomes negative: α_w -> -α_w)
   b. Apply Diffusion: D = 2|s⟩⟨s| - I
      (Reflects all amplitudes about the mean amplitude μ)
      New amplitude α_i' = 2μ - α_i
4. Measure in computational basis -> Yields target |w⟩ with probability > 95%`
      }
    ],
    expectedBehavior: {
      initialState: '|000⟩',
      finalStateVector: 'Target state amplitude amplified to ≈ 0.96 |target⟩',
      measurementOutcomes: [
        { state: '|Target⟩ (e.g. |11⟩)', probability: 94.5, description: 'Marked solution state amplified via constructive reflection' },
        { state: 'Non-marked items', probability: 5.5, description: 'Residual amplitudes suppressed by destructive interference' }
      ],
      notes: 'Quadratic speedup provably optimal for unsorted quantum search (Bennett-Bernstein-Brassard-Vazirani theorem).'
    },
    simulationPreset: 'grover',
    applications: [
      'Unstructured database search and dictionary lookup',
      'Boolean satisfiability (SAT) solver speedup',
      'Collision and preimage resistance analysis in cryptographic hashing',
      'Constraint satisfaction and optimization'
    ],
    circuitOverview: {
      gatesUsed: ['H', 'Oracle U_w', 'H', 'X', 'Multi-Controlled Z', 'X', 'H', 'Measure'],
      steps: [
        { stepNumber: 1, label: 'Superposition', description: 'Initialize all n qubits in |0⟩ and apply Hadamard H to produce equal superposition.' },
        { stepNumber: 2, label: 'Oracle Marking', description: 'Negate the phase of target solution state: |x⟩ → -|x⟩ if x = target.' },
        { stepNumber: 3, label: 'Diffusion Operator', description: 'Apply 2|s⟩⟨s| - I to reflect amplitudes about the average, boosting the solution probability.' },
        { stepNumber: 4, label: 'Measurement', description: 'Measure in computational basis; high probability of obtaining the correct marked item.' }
      ]
    }
  },
  {
    id: 'algo-qft',
    title: 'Quantum Fourier Transform (QFT)',
    slug: 'quantum-fourier-transform',
    purpose: 'Performs the discrete Fourier transform on quantum amplitudes exponentially faster than the classical Fast Fourier Transform (FFT).',
    inventor: 'Don Coppersmith',
    yearIntroduced: 1994,
    difficulty: 'Intermediate',
    quantumSpeedup: 'Exponential Speedup vs FFT',
    classicalComplexity: 'O(N log N) = O(n 2^n) gates for N = 2^n',
    quantumComplexity: 'O(n^2) gates for n qubits',
    qubitRequirement: 'n qubits',
    summary: 'The mathematical core of exponential quantum algorithms, mapping computational basis states into phase-encoded states via controlled rotations and Hadamards.',
    coreConcepts: [
      'Maps computational state |j⟩ to (1/√2^n) ∑_k exp(2πi j k / 2^n) |k⟩',
      'Deconstructs Fourier transform into single-qubit Hadamards and controlled-phase rotations R_k',
      'Qubit order reversal using SWAP gate network at circuit termination',
      'Key subroutine for Quantum Phase Estimation (QPE), order-finding, and Shor\'s factoring'
    ],
    circuitRepresentation: {
      numQubits: 3,
      qubitLabels: ['q[0]', 'q[1]', 'q[2]'],
      gates: [
        { qubit: 0, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 1, step: 2, symbol: '●', name: 'Control R2', isControl: true, targetQubit: 0 },
        { qubit: 0, step: 2, symbol: 'R2', name: 'Phase R2 (π/2)' },
        { qubit: 2, step: 3, symbol: '●', name: 'Control R3', isControl: true, targetQubit: 0 },
        { qubit: 0, step: 3, symbol: 'R3', name: 'Phase R3 (π/4)' },
        { qubit: 1, step: 4, symbol: 'H', name: 'Hadamard' },
        { qubit: 2, step: 5, symbol: '●', name: 'Control R2', isControl: true, targetQubit: 1 },
        { qubit: 1, step: 5, symbol: 'R2', name: 'Phase R2 (π/2)' },
        { qubit: 2, step: 6, symbol: 'H', name: 'Hadamard' }
      ],
      notes: 'Followed by SWAP(q0, q2) network'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit (Python)',
        code: `import numpy as np
from qiskit import QuantumCircuit

def qft(n):
    qc = QuantumCircuit(n)
    for i in range(n):
        qc.h(i)
        for j in range(i + 1, n):
            # Controlled phase rotation by 2*pi / 2^(j - i + 1)
            angle = np.pi / (2 ** (j - i))
            qc.cp(angle, j, i)
    # Reorder qubits
    for i in range(n // 2):
        qc.swap(i, n - i - 1)
    return qc

print(qft(3).draw())`
      },
      {
        language: 'pseudocode',
        label: 'Mathematical Deconstruction',
        code: `Algorithm QFT(n qubits):
For i = 0 to n - 1:
   Apply H to qubit i
   For j = i + 1 to n - 1:
      Apply Controlled-R_k(control: j, target: i) with phase θ = 2π / 2^(j - i + 1)
For i = 0 to floor(n / 2) - 1:
   Apply SWAP(i, n - 1 - i)
Output: State vector mapped to frequency domain`
      }
    ],
    expectedBehavior: {
      initialState: '|j⟩ (Computational basis state)',
      finalStateVector: 'Equal superposition of all basis states with phase proportional to j·k',
      measurementOutcomes: [
        { state: 'Equally distributed across computational basis', probability: 100, description: 'Phases carry Fourier transform data' }
      ],
      notes: 'Requires O(n²) quantum gates compared to classical FFT which requires O(n 2^n) arithmetic operations.'
    },
    simulationPreset: 'qft',
    applications: [
      'Quantum Phase Estimation (QPE)',
      'Shor\'s Factoring Algorithm & Discrete Logarithms',
      'Harrow-Hassidim-Lloyd (HHL) quantum matrix equation solver',
      'Period finding in finite Abelian groups'
    ],
    circuitOverview: {
      gatesUsed: ['H', 'Controlled-R_k (Phase)', 'SWAP'],
      steps: [
        { stepNumber: 1, label: 'Hadamard Cascade', description: 'Create equal phase superposition on the most significant qubit.' },
        { stepNumber: 2, label: 'Controlled Phase Rotations', description: 'Apply controlled-R_k rotations with decreasing phase angles π/2^(k-1).' },
        { stepNumber: 3, label: 'Recursive Iteration', description: 'Repeat Hadamard and phase rotation cascade for qubits 1 through n-1.' },
        { stepNumber: 4, label: 'SWAP Bit-Reversal', description: 'Apply SWAP gates to reorder qubits from least to most significant.' }
      ]
    }
  },
  {
    id: 'algo-shor',
    title: 'Shor\'s Factoring Algorithm',
    slug: 'shors-factoring',
    purpose: 'Factors composite integers in polynomial time O((log N)³), rendering classical RSA and Diffie-Hellman public-key cryptography insecure.',
    inventor: 'Peter Shor',
    yearIntroduced: 1994,
    difficulty: 'Advanced',
    quantumSpeedup: 'Exponential Speedup',
    classicalComplexity: 'O(exp(c (log N)^(1/3))) via Number Field Sieve',
    quantumComplexity: 'O((log N)² (log log N)) polynomial',
    qubitRequirement: '≈ 2n + 3 qubits for n-bit integer N',
    summary: 'Reduces integer factoring to modular period-finding, using Quantum Phase Estimation and the Inverse QFT to extract periods exponentially faster than any classical algorithm.',
    coreConcepts: [
      'Number Theory Reduction: Factoring N reduces to finding the period r of f(x) = a^x mod N where gcd(a, N) = 1',
      'Once period r is even, factors of N are found classically via gcd(a^(r/2) ± 1, N)',
      'Quantum Phase Estimation evaluates modular exponentiation across an entangled superposition register',
      'Inverse QFT converts periodic entanglement into sharp constructive interference peaks at multiples of 1/r'
    ],
    circuitRepresentation: {
      numQubits: 4,
      qubitLabels: ['q[0] (Count)', 'q[1] (Count)', 'q[2] (Work)', 'q[3] (Work)'],
      gates: [
        { qubit: 0, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 1, step: 1, symbol: 'H', name: 'Hadamard' },
        { qubit: 2, step: 1, symbol: 'X', name: 'Work Init' },
        { qubit: 0, step: 2, symbol: 'Ua^1', name: 'Ctrl ModExp', isControl: true, targetQubit: 2 },
        { qubit: 1, step: 3, symbol: 'Ua^2', name: 'Ctrl ModExp', isControl: true, targetQubit: 3 },
        { qubit: 0, step: 4, symbol: 'QFT†', name: 'Inverse QFT' },
        { qubit: 1, step: 4, symbol: 'QFT†', name: 'Inverse QFT' }
      ],
      measurementSteps: [5],
      notes: 'Measures counting register to extract phase s/r'
    },
    codeExamples: [
      {
        language: 'python',
        label: 'Qiskit Conceptual Skeleton',
        code: `# Shor's algorithm high-level workflow
import math
from qiskit import QuantumCircuit

def shors_step(N, a):
    # Classical check: is gcd(a, N) already a factor?
    if math.gcd(a, N) > 1:
        return math.gcd(a, N)

    # Setup quantum circuit for modular order finding
    # QPE register + Modular Exponentiation |x⟩|a^x mod N⟩
    # + Inverse QFT on counting register
    print(f"Executing quantum period finding for a={a}, N={N}...")
    # Extracted period r gives non-trivial factors:
    # factor1 = math.gcd(a**(r//2) - 1, N)
    # factor2 = math.gcd(a**(r//2) + 1, N)
    return "Quantum Period finding active"`
      },
      {
        language: 'pseudocode',
        label: 'Complete Algorithm Pseudocode',
        code: `Algorithm ShorFactorization(Composite Integer N):
1. Pick random integer a such that 1 < a < N
2. If gcd(a, N) > 1, return gcd(a, N) (trivial factor found!)
3. Quantum Subroutine: Find period r of f(x) = a^x mod N:
   a. Prepare counting register in equal superposition via H^(⊗t)
   b. Compute controlled modular exponentiation: ∑ |x⟩|a^x mod N⟩
   c. Apply Inverse QFT to counting register
   d. Measure counting register -> yields phase s/r with high confidence
   e. Use classical Continued Fractions algorithm to extract period r
4. If r is odd or a^(r/2) ≡ -1 (mod N), go back to step 1
5. Compute factors:
   p = gcd(a^(r/2) - 1, N)
   q = gcd(a^(r/2) + 1, N)
6. Return {p, q}`
      }
    ],
    expectedBehavior: {
      initialState: '|00...0⟩|1⟩',
      finalStateVector: 'Counting register concentrates probability around integer multiples of 2^t / r',
      measurementOutcomes: [
        { state: 'Phase peaks near k · (2^t / r)', probability: 92.0, description: 'Directly yields period r via continued fractions' }
      ],
      notes: 'Exponentially outpaces the classical General Number Field Sieve (GNFS), which would take centuries for 2048-bit keys.'
    },
    simulationPreset: 'shor',
    applications: [
      'Cryptanalysis of RSA public key infrastructure',
      'Breaking Diffie-Hellman & Elliptic Curve Cryptography (ECC)',
      'Direct motivation for Post-Quantum Cryptography (NIST PQC standards)'
    ],
    circuitOverview: {
      gatesUsed: ['H', 'Controlled Modular Exponentiation (U_a)', 'Inverse QFT', 'Measurement'],
      steps: [
        { stepNumber: 1, label: 'Superposition', description: 'Apply Hadamards to create a uniform superposition in the counting register.' },
        { stepNumber: 2, label: 'Controlled ModExp', description: 'Compute entangled state |x⟩|a^x mod N⟩ using modular multipliers.' },
        { stepNumber: 3, label: 'Inverse QFT', description: 'Apply inverse QFT to convert periodic entanglement into constructive interference.' },
        { stepNumber: 4, label: 'Continued Fractions', description: 'Extract period r classically and compute gcd(a^(r/2) ± 1, N).' }
      ]
    }
  }
];

export const DEMO_GATES: QuantumGate[] = [
  {
    id: 'H',
    symbol: 'H',
    name: 'Hadamard',
    description: 'Creates equal superposition. Maps |0⟩ to (|0⟩+|1⟩)/√2 and |1⟩ to (|0⟩-|1⟩)/√2.',
    matrix: [['1/√2', '1/√2'], ['1/√2', '-1/√2']],
    color: '#06b6d4',
    category: 'Single-Qubit'
  },
  {
    id: 'X',
    symbol: 'X',
    name: 'Pauli-X (NOT)',
    description: 'Quantum bit flip. Rotates π radians around X-axis. Maps |0⟩ to |1⟩ and |1⟩ to |0⟩.',
    matrix: [['0', '1'], ['1', '0']],
    color: '#3b82f6',
    category: 'Single-Qubit'
  },
  {
    id: 'Y',
    symbol: 'Y',
    name: 'Pauli-Y',
    description: 'Bit and phase flip. Rotates π radians around Y-axis. Maps |0⟩ to i|1⟩ and |1⟩ to -i|0⟩.',
    matrix: [['0', '-i'], ['i', '0']],
    color: '#8b5cf6',
    category: 'Single-Qubit'
  },
  {
    id: 'Z',
    symbol: 'Z',
    name: 'Pauli-Z (Phase Flip)',
    description: 'Phase flip. Leaves |0⟩ unchanged and maps |1⟩ to -|1⟩.',
    matrix: [['1', '0'], ['0', '-1']],
    color: '#ec4899',
    category: 'Phase'
  },
  {
    id: 'S',
    symbol: 'S',
    name: 'Phase Gate (S / √Z)',
    description: 'Adds a π/2 phase shift to |1⟩. Maps |1⟩ to i|1⟩.',
    matrix: [['1', '0'], ['0', 'i']],
    color: '#10b981',
    category: 'Phase'
  },
  {
    id: 'T',
    symbol: 'T',
    name: 'T-Gate (π/8)',
    description: 'Adds a π/4 phase shift to |1⟩. Essential for universal fault-tolerant quantum computation.',
    matrix: [['1', '0'], ['0', 'e^(iπ/4)']],
    color: '#f59e0b',
    category: 'Phase'
  },
  {
    id: 'CNOT',
    symbol: '⊕',
    name: 'Controlled NOT (CX)',
    description: 'Flips target qubit if and only if control qubit is in state |1⟩. Generates entanglement.',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '0', '1'],
      ['0', '0', '1', '0']
    ],
    color: '#0284c7',
    category: 'Multi-Qubit'
  },
  {
    id: 'M',
    symbol: '∡',
    name: 'Measurement',
    description: 'Projects quantum state onto computational basis {|0⟩, |1⟩} according to Born rule probabilities.',
    matrix: [['|0⟩⟨0|', '|1⟩⟨1|']],
    color: '#64748b',
    category: 'Measurement'
  }
];

export const DEMO_QUIZZES: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'What is the resulting quantum state when a Hadamard gate (H) is applied to the basis state |0⟩?',
    options: [
      { id: 'a', text: '|1⟩' },
      { id: 'b', text: '(|0⟩ + |1⟩) / √2' },
      { id: 'c', text: '(|0⟩ - |1⟩) / √2' },
      { id: 'd', text: 'i|0⟩' }
    ],
    correctOptionId: 'b',
    explanation: 'The Hadamard gate maps computational basis state |0⟩ to the symmetric superposition state |+⟩ = (|0⟩ + |1⟩) / √2, with equal 50% probability of measuring 0 or 1.',
    category: 'Quantum Fundamentals',
    difficulty: 'Beginner'
  },
  {
    id: 'q-2',
    question: 'If a single qubit is in state |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩, what is the probability of measuring the state |1⟩ upon projective measurement?',
    options: [
      { id: 'a', text: '50% (0.50)' },
      { id: 'b', text: '25% (0.25)' },
      { id: 'c', text: '75% (0.75)' },
      { id: 'd', text: '86.6% (0.866)' }
    ],
    correctOptionId: 'c',
    explanation: 'According to the Born rule, the probability of obtaining outcome |1⟩ is the squared magnitude of its complex amplitude: |√3/2|² = 3/4 = 75%.',
    category: 'Born Rule & Measurement',
    difficulty: 'Beginner'
  },
  {
    id: 'q-3',
    question: 'Why can\'t quantum entanglement be used to transmit classical messages faster than the speed of light?',
    options: [
      { id: 'a', text: 'Because entanglement only works across microscopic distances' },
      { id: 'b', text: 'Because the no-communication theorem shows local measurement outcomes remain completely random without a classical channel' },
      { id: 'c', text: 'Because quantum decoherence destroys all photons instantly' },
      { id: 'd', text: 'Because qubits require superconducting cables to connect' }
    ],
    correctOptionId: 'b',
    explanation: 'The No-Communication Theorem proves that measuring one qubit of an entangled pair yields a completely random result locally. Alice cannot choose Bob\'s outcome; Bob can only interpret correlations once Alice transmits classical bits (bounded by the speed of light).',
    category: 'Entanglement & Non-Locality',
    difficulty: 'Intermediate'
  },
  {
    id: 'q-4',
    question: 'What is the primary role of the Diffusion Operator in Grover\'s search algorithm?',
    options: [
      { id: 'a', text: 'To delete all incorrect database entries permanently' },
      { id: 'b', text: 'To invert quantum amplitudes about their average, amplifying the marked solution state' },
      { id: 'c', text: 'To execute a classical bubble sort across qubits' },
      { id: 'd', text: 'To reset the QPU temperature to absolute zero' }
    ],
    correctOptionId: 'b',
    explanation: 'After the oracle flips the phase of the solution state below zero, the diffusion operator (2|s⟩⟨s| - I) performs an inversion about the mean amplitude, driving the marked state\'s amplitude positive and substantially higher than non-marked items.',
    category: 'Quantum Algorithms',
    difficulty: 'Intermediate'
  },
  {
    id: 'q-5',
    question: 'In Shor\'s algorithm, which mathematical transformation provides the exponential speedup over classical factoring?',
    options: [
      { id: 'a', text: 'Discrete Fourier Transform executed on qubit amplitudes via Quantum Fourier Transform (QFT)' },
      { id: 'b', text: 'Classical Gaussian Elimination' },
      { id: 'c', text: 'Newton-Raphson approximation iterations' },
      { id: 'd', text: 'Monte Carlo random walk sampling' }
    ],
    correctOptionId: 'a',
    explanation: 'The Quantum Fourier Transform extracts the period r of modular exponentiation in O(n²) quantum gate steps, whereas the best known classical methods require super-polynomial/exponential subroutines like the General Number Field Sieve.',
    category: 'Advanced Algorithms',
    difficulty: 'Advanced'
  }
];

export const DEMO_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@quantumlearn.edu',
  role: 'Undergraduate Student',
  institution: 'Dept. of Physics & Computer Science',
  streakDays: 14,
  xpPoints: 3420,
  level: 4,
  circuitsSimulated: 48,
  quizzesCompleted: 19,
  joinedDate: 'September 2026',
  badges: [
    {
      id: 'b-1',
      name: 'Superposition Pioneer',
      description: 'Completed all single-qubit rotation exercises and achieved 100% on Bloch sphere orientation.',
      icon: 'Atom',
      unlockedAt: 'Oct 2, 2026'
    },
    {
      id: 'b-2',
      name: 'Entanglement Weaver',
      description: 'Successfully prepared all 4 Bell states on the visual quantum lab circuit workbench.',
      icon: 'Share2',
      unlockedAt: 'Oct 5, 2026'
    },
    {
      id: 'b-3',
      name: 'Grover Navigator',
      description: 'Constructed an optimal 3-qubit Grover oracle with 94.5% detection probability.',
      icon: 'Search',
      unlockedAt: 'Oct 8, 2026'
    },
    {
      id: 'b-4',
      name: 'Code Breaker Novice',
      description: 'Understood period extraction principles in Quantum Phase Estimation.',
      icon: 'Key',
      unlockedAt: 'Oct 9, 2026'
    }
  ]
};

export const AI_TUTOR_STARTER_PROMPTS = [
  'Explain quantum superposition using a coin toss analogy.',
  'Why does Grover\'s algorithm achieve O(√N) instead of O(log N)?',
  'What is the physical meaning of the Bloch sphere coordinates (θ, φ)?',
  'How do we create the Bell state (|00⟩ + |11⟩)/√2 from scratch?',
  'What is the difference between a qubit and a classical bit in terms of state space?'
];
