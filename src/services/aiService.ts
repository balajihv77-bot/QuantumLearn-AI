/**
 * AI Tutor & Code Assistant Service
 * QuantumLearn AI - Architecture-isolated AI Service Layer
 * 
 * DESIGN PRINCIPLES:
 * 1. Provider Isolation: AI calls are decoupled from UI components.
 * 2. Secure Backend Preparation: Directs live requests to POST /api/ai/chat (FastAPI backend).
 * 3. Zero Frontend Secrets: No API keys are embedded or required in frontend code.
 * 4. Transparent Truth: Never pretends a live AI request succeeded if the backend is unreachable.
 * 5. High-Fidelity Curated Fallback: Rich offline pedagogical knowledge base for quantum mechanics,
 *    step-by-step mathematical proofs, Qiskit/Cirq code generation, and debugging assistance.
 */

import { AIChatRequest, AIChatResponse, AIChatMessage, BackendHealthStatus, SuggestedQuestion } from '../types/ai';

const BACKEND_ENDPOINT = (import.meta.env.VITE_AI_BACKEND_URL as string) || '/api/ai/chat';
const REQUEST_TIMEOUT_MS = 8000;

export interface IAIService {
  checkBackendHealth(): Promise<BackendHealthStatus>;
  sendMessage(request: AIChatRequest, preferLive?: boolean): Promise<AIChatResponse>;
  getCuratedResponse(request: AIChatRequest): AIChatResponse;
  getSuggestedQuestions(): SuggestedQuestion[];
}

export class AIServiceImpl implements IAIService {
  private endpoint: string;

  constructor(endpoint: string = BACKEND_ENDPOINT) {
    this.endpoint = endpoint;
  }

  /**
   * Health check to detect whether a live FastAPI backend is responding
   */
  async checkBackendHealth(): Promise<BackendHealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          isAvailable: true,
          endpoint: this.endpoint,
          message: 'Connected to live FastAPI backend.',
          checkedAt: new Date().toLocaleTimeString()
        };
      } else {
        return {
          isAvailable: false,
          endpoint: this.endpoint,
          message: `Backend returned status ${response.status}. Live LLM synthesis inactive.`,
          checkedAt: new Date().toLocaleTimeString()
        };
      }
    } catch {
      return {
        isAvailable: false,
        endpoint: this.endpoint,
        message: 'No live backend detected at ' + this.endpoint + '. Using offline pedagogical knowledge base.',
        checkedAt: new Date().toLocaleTimeString()
      };
    }
  }

  /**
   * Sends a message to the AI Tutor.
   * If preferLive is true, attempts live backend POST /api/ai/chat.
   * If live backend is unavailable or fails, throws error or returns transparent error,
   * never faking a live response.
   */
  async sendMessage(request: AIChatRequest, preferLive: boolean = false): Promise<AIChatResponse> {
    // 1. Validation
    const trimmed = request.message?.trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty. Please enter a quantum query.');
    }

    if (trimmed.length > 2000) {
      throw new Error('Message exceeds 2000 character limit. Please shorten your query.');
    }

    // 2. If live mode is requested, attempt POST /api/ai/chat
    if (preferLive) {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(
            `Live AI backend returned error (${response.status}): ${errorText || response.statusText}. Check server logs.`
          );
        }

        const data = await response.json();
        const latencyMs = Math.round(performance.now() - startTime);

        return {
          reply: data.reply || data.content || 'Response received from live AI assistant.',
          codeSnippets: data.codeSnippets || [],
          suggestedFollowUps: data.suggestedFollowUps || [],
          recommendedModuleId: data.recommendedModuleId,
          recommendedAlgorithmId: data.recommendedAlgorithmId,
          source: 'live_backend',
          latencyMs
        };
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') {
          throw new Error(`Connection to ${this.endpoint} timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Live backend did not respond.`);
        }
        // Explicitly report error without pretending it succeeded
        throw new Error(
          `Failed to connect to live AI backend at ${this.endpoint}: ${error.message || 'Network unreachable'}. Please check if the FastAPI server is running.`
        );
      }
    }

    // 3. Curated Pedagogical Knowledge Base (Demo Mode)
    // Add realistic pedagogical delay
    await new Promise((resolve) => setTimeout(resolve, 550));
    return this.getCuratedResponse(request);
  }

  /**
   * Comprehensive curated pedagogical response engine
   */
  getCuratedResponse(request: AIChatRequest): AIChatResponse {
    const q = request.message.toLowerCase();
    const completedIds = request.context?.completedModuleIds || [];

    // --- 1. SUPERPOSITION & COIN ANALOGY ---
    if (q.includes('superposition') || q.includes('coin toss') || q.includes('coin')) {
      return {
        reply: `### Understanding Quantum Superposition\n\nIn classical physics, a coin at rest is strictly in one state: **Heads (0)** or **Tails (1)**.\n\nIn quantum mechanics, when a qubit is placed into superposition (e.g. by applying a **Hadamard gate** $H$), it does not merely represent "imperfect information" about a coin that is already heads or tails. Instead, it enters a coherent linear combination of both basis states simultaneously:\n\n$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$\n\nwhere $\\alpha$ and $\\beta$ are complex probability amplitudes satisfying the normalization constraint:\n\n$$|\\alpha|^2 + |\\beta|^2 = 1$$\n\n**The Spinning Coin Analogy:**\n* A coin spinning rapidly on a tabletop exists in a dynamic continuum that is neither fixed heads nor tails.\n* Only when you slap your hand down onto the spinning coin (**quantum measurement**) does the state probabilistically collapse into $0$ (with probability $|\\alpha|^2$) or $1$ (with probability $|\\beta|^2$) according to the **Born Rule**.\n* Crucially, prior to measurement, the amplitudes can experience constructive and destructive **quantum interference**!`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Qiskit: Creating Superposition with Hadamard',
            code: `from qiskit import QuantumCircuit\n\n# Create a 1-qubit circuit with 1 classical bit\nqc = QuantumCircuit(1, 1)\n\n# Apply Hadamard gate to create (|0> + |1>)/sqrt(2)\nqc.h(0)\n\n# Measure into classical register\nqc.measure(0, 0)\nprint(qc.draw(output='text'))`
          }
        ],
        suggestedFollowUps: [
          'Show step-by-step matrix derivation of the Hadamard gate',
          'How does superposition look on the 3D Bloch sphere?',
          'What happens if I apply two Hadamard gates in a row?'
        ],
        recommendedModuleId: 'mod-4',
        recommendedAlgorithmId: 'bell-state',
        source: 'curated_demo'
      };
    }

    // --- 2. STEP-BY-STEP MATHEMATICAL EXPLANATIONS (Hadamard Matrix, Bell state, Born rule) ---
    if (
      q.includes('matrix') ||
      q.includes('step-by-step') ||
      q.includes('derivation') ||
      q.includes('mathematical') ||
      q.includes('proof') ||
      q.includes('unitary')
    ) {
      return {
        reply: `### Step-by-Step Mathematical Derivation: Hadamard Evolution\n\nLet us compute the exact algebraic transformation of state $|0\\rangle$ under the unitary Hadamard operator $H$.\n\n#### 1. Matrix Representation of Basis States\nIn Hilbert space $\\mathbb{C}^2$, the computational basis states are defined as column vectors:\n\n$$|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}, \\quad |1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$$\n\n#### 2. The Hadamard Unitary Matrix\nThe Hadamard gate is represented by the Hermitian, unitary matrix:\n\n$$H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$\n\n#### 3. Matrix-Vector Multiplication\nApplying $H$ to ground state $|0\\rangle$:\n\n$$H |0\\rangle = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} (1)(1) + (1)(0) \\\\ (1)(1) + (-1)(0) \\end{pmatrix} = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$$\n\nExpanding back into Dirac bra-ket notation:\n\n$$H |0\\rangle = \\frac{1}{\\sqrt{2}} |0\\rangle + \\frac{1}{\\sqrt{2}} |1\\rangle = |+\\rangle$$\n\n#### 4. Applying Born's Probability Rule\nThe probability $P(m)$ of measuring outcome $m \\in \\{0, 1\\}$ is the squared modulus of the projection:\n\n$$P(0) = |\\langle 0 | + \\rangle|^2 = \\left| \\frac{1}{\\sqrt{2}} \\right|^2 = \\frac{1}{2} = 50\\%$$\n$$P(1) = |\\langle 1 | + \\rangle|^2 = \\left| \\frac{1}{\\sqrt{2}} \\right|^2 = \\frac{1}{2} = 50\\%$$\n\nBecause $H^2 = H H^\\dagger = I$, applying Hadamard twice returns the state identically to $|0\\rangle$ via destructive interference of the $|1\\rangle$ component!`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Verifying Matrix Operation in NumPy',
            code: `import numpy as np\n\nH = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]])\nket0 = np.array([1, 0])\n\n# Compute transformation\nket_plus = H @ ket0\nprint("State Vector:", ket_plus)  # [0.70710678, 0.70710678]\nprint("P(0) =", np.abs(ket_plus[0])**2)  # 0.5\nprint("P(1) =", np.abs(ket_plus[1])**2)  # 0.5`
          }
        ],
        suggestedFollowUps: [
          'Show the 4x4 matrix derivation for the CNOT gate',
          'Calculate the partial trace and subsystem purity for Bell state',
          'Explain why unitary matrices preserve inner products'
        ],
        recommendedModuleId: 'mod-7',
        recommendedAlgorithmId: 'bell-state',
        source: 'curated_demo'
      };
    }

    // --- 3. ENTANGLEMENT & BELL STATE ---
    if (q.includes('bell') || q.includes('entangle') || q.includes('epr')) {
      return {
        reply: `### Entanglement & Bell State Preparation\n\nA **Bell State** (or EPR pair) is a maximally entangled two-qubit quantum state. In an entangled state, the composite system cannot be factored into the tensor product of individual qubit state vectors ($|\\psi\\rangle \\neq |q_0\\rangle \\otimes |q_1\\rangle$).\n\n#### Canonical Bell State $|\\Phi^+\\rangle$:\n$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\n\n#### Circuit Construction (2 Steps):\n1. **Step 1 (Hadamard on $q_0$):**\n   $$(H \\otimes I) |00\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$$\n2. **Step 2 (CNOT with control $q_0$, target $q_1$):**\n   * If $q_0 = |0\\rangle$, $q_1$ remains $|0\\rangle \\implies |00\\rangle$\n   * If $q_0 = |1\\rangle$, $q_1$ is flipped from $|0\\rangle$ to $|1\\rangle \\implies |11\\rangle$\n\nResult: $\\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$!\n\n**Subsystem Purity:**\nNotice that if you trace out qubit 1, the reduced density matrix of qubit 0 is $\\rho_0 = \\frac{1}{2}I_2$, which has purity $\\text{Tr}(\\rho_0^2) = 0.50$ (maximally mixed). This is why a single-qubit Bloch sphere cannot represent this entangled subsystem on its surface!`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Qiskit: Bell State |Φ+⟩ Circuit',
            code: `from qiskit import QuantumCircuit, Aer, execute\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)          # Create superposition on control\nqc.cx(0, 1)      # Entangle with CNOT\nqc.measure([0, 1], [0, 1])\n\n# Expected outcomes: ~50% '00' and ~50% '11'\nprint(qc.draw(output='text'))`
          },
          {
            language: 'qasm',
            title: 'OpenQASM 2.0 Representation',
            code: `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0], q[1];\nmeasure q -> c;`
          }
        ],
        suggestedFollowUps: [
          'What are the other 3 Bell states (|Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩)?',
          'Open Bell state preset in the Quantum Lab',
          'Why does entanglement not violate special relativity?'
        ],
        recommendedModuleId: 'mod-5',
        recommendedAlgorithmId: 'bell-state',
        source: 'curated_demo'
      };
    }

    // --- 4. GROVER'S SEARCH ALGORITHM ---
    if (q.includes('grover') || q.includes('diffusion') || q.includes('search') || q.includes('oracle')) {
      return {
        reply: `### Grover's Quantum Search Algorithm\n\nGrover's algorithm searches an unstructured database of $N = 2^n$ elements in **$O(\\sqrt{N})$** queries, offering a quadratic speedup over classical brute-force search ($O(N)$).\n\n#### Core Mechanism:\n1. **Uniform Superposition:**\n   Initialize all $n$ qubits into $|s\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{x=0}^{N-1} |x\\rangle$ using Hadamard gates on each wire.\n2. **Phase Inversion Oracle ($U_w$):**\n   Marks the target state $|w\\rangle$ by inverting its phase:\n   $$U_w |x\\rangle = \\begin{cases} -|x\\rangle & \\text{if } x = w \\\\ |x\\rangle & \\text{if } x \\neq w \\end{cases}$$\n3. **Grover Diffusion Operator ($2|s\\rangle\\langle s| - I$):**\n   Inverts all amplitudes around their mean. Because the target amplitude was flipped negative, the mean is slightly reduced. Inversion about this reduced mean boosts the marked state into a large positive amplitude while depressing all unmarked states!\n4. **Optimal Iterations:**\n   Repeat steps 2 and 3 approximately $R \\approx \\frac{\\pi}{4}\\sqrt{N}$ times. (Running past this optimal point causes amplitude over-rotation and reduces success probability!).`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Qiskit: 2-Qubit Grover Search (Target |11⟩)',
            code: `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\n\n# 1. Superposition\nqc.h([0, 1])\n\n# 2. Phase Oracle for |11> (Controlled-Z)\nqc.cz(0, 1)\n\n# 3. Diffusion Operator\nqc.h([0, 1])\nqc.x([0, 1])\nqc.cz(0, 1)\nqc.x([0, 1])\nqc.h([0, 1])\n\nqc.measure([0, 1], [0, 1])\nprint(qc.draw(output='text'))`
          }
        ],
        suggestedFollowUps: [
          'Why does Grover over-rotate if we apply too many iterations?',
          'How does the CZ gate act as an oracle for |11⟩?',
          'Compare Grover complexity with Classical Linear Search'
        ],
        recommendedModuleId: 'mod-9',
        recommendedAlgorithmId: 'grover-search',
        source: 'curated_demo'
      };
    }

    // --- 5. BLOCH SPHERE GEOMETRY & ANGLES ---
    if (q.includes('bloch') || q.includes('theta') || q.includes('phi') || q.includes('sphere')) {
      return {
        reply: `### The Bloch Sphere: Geometrical State Space\n\nThe **Bloch Sphere** represents the pure state space of any two-level quantum system (single qubit) as a unit sphere in $\\mathbb{R}^3$.\n\n#### Parametrization:\nAny normalized single-qubit pure state can be written up to an unobservable global phase as:\n\n$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$\n\nwhere:\n* $\\theta \\in [0, \\pi]$ is the **polar angle** (latitude from the North Pole).\n* $\\phi \\in [0, 2\\pi)$ is the **azimuthal angle** (longitude / relative phase).\n\n#### Key Landmarks:\n* **North Pole ($\\theta = 0$):** Ground state $|0\\rangle$.\n* **South Pole ($\\theta = \\pi$):** Excited state $|1\\rangle$.\n* **Equator ($\\theta = \\pi/2$):** Equal superpositions with varied relative phases:\n  * $\\phi = 0 \\implies |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$ (+X axis)\n  * $\\phi = \\pi \\implies |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ (-X axis)\n  * $\\phi = \\pi/2 \\implies |+i\\rangle = \\frac{|0\\rangle + i|1\\rangle}{\\sqrt{2}}$ (+Y axis)\n  * $\\phi = 3\\pi/2 \\implies |-i\\rangle = \\frac{|0\\rangle - i|1\\rangle}{\\sqrt{2}}$ (-Y axis)\n\nSingle-qubit quantum gates act as rigid 3D spatial rotations of the Bloch vector!`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Converting (theta, phi) to Bloch Vector (x, y, z)',
            code: `import numpy as np\n\ndef bloch_coordinates(theta, phi):\n    x = np.sin(theta) * np.cos(phi)\n    y = np.sin(theta) * np.sin(phi)\n    z = np.cos(theta)\n    return np.array([x, y, z])\n\n# Example: |+> state (theta = pi/2, phi = 0)\nprint("Bloch Vector |+>:", bloch_coordinates(np.pi/2, 0)) # [1, 0, 0]`
          }
        ],
        suggestedFollowUps: [
          'Open interactive 3D Bloch Sandbox',
          'Why does theta have a factor of 1/2 in cos(theta/2)?',
          'How does the Pauli-Y gate rotate the Bloch vector?'
        ],
        recommendedModuleId: 'mod-3',
        recommendedAlgorithmId: 'bell-state',
        source: 'curated_demo'
      };
    }

    // --- 6. DEBUGGING ASSISTANCE (Circuit bugs, Qiskit ordering, phase kickback, premature measurement) ---
    if (
      q.includes('debug') ||
      q.includes('error') ||
      q.includes('why is my') ||
      q.includes('not working') ||
      q.includes('bug') ||
      q.includes('wrong outcome') ||
      q.includes('pitfall')
    ) {
      return {
        reply: `### Quantum Circuit Debugger & Pitfall Analysis\n\nHere are the four most frequent bugs encountered by students when building quantum circuits:\n\n#### 1. Qiskit Bit-Ordering (Little-Endian vs Big-Endian)\n* **Symptom:** You expect outcome \`|10⟩\` but measure \`|01⟩\`.\n* **Cause:** Qiskit formats measurement bitstrings as $q_{n-1} \\dots q_1 q_0$ (little-endian). This means \`q[0]\` is the **rightmost** digit in the returned bitstring, whereas most textbooks list \`q[0]\` on the left!\n\n#### 2. Phase Kickback Without Target in $|-\\rangle$ State\n* **Symptom:** Controlled gates (like CNOT or Deutsch-Jozsa oracle) do not alter the phase of the control qubit as intended.\n* **Cause:** Phase kickback requires the target qubit to be prepared in the eigenstate $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ ($X$ followed by $H$). If the target is in $|0\\rangle$, no phase is kicked back!\n\n#### 3. Premature Measurement Collapsing Superposition\n* **Symptom:** Circuits exhibit purely classical deterministic behavior and zero entanglement.\n* **Cause:** Placing a measurement gate before a multi-qubit CNOT collapses the state, destroying quantum coherence.\n\n#### 4. Disconnected CNOT Control/Target\n* **Symptom:** Syntax errors or unentangled states in the circuit grid.\n* **Fix:** Ensure every control dot has a corresponding target $\\oplus$ on a distinct wire in the exact same time column!`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Debugging Qiskit Endianness with Statevector',
            code: `# In Qiskit:\n# qc.x(0) prepares qubit 0 in state |1>\n# When measured, counts show: {'1': 1024}\n# For 2 qubits:\nqc.x(0)  # q0 = 1, q1 = 0\n# The bitstring key will be '01' (q1=0, q0=1)!\n# To reverse in code: outcome[::-1]`
          }
        ],
        suggestedFollowUps: [
          'How do I test my circuit in the Visual Lab?',
          'Explain Phase Kickback in Deutsch-Jozsa',
          'What happens if I try to copy a qubit (No-Cloning Theorem)?'
        ],
        recommendedModuleId: 'mod-7',
        recommendedAlgorithmId: 'deutsch-jozsa',
        source: 'curated_demo'
      };
    }

    // --- 7. QUANTUM CODE GENERATION (Qiskit, Cirq, OpenQASM) ---
    if (
      q.includes('code') ||
      q.includes('qiskit') ||
      q.includes('cirq') ||
      q.includes('python') ||
      q.includes('qasm') ||
      q.includes('generate')
    ) {
      return {
        reply: `### Quantum Code Generation: Complete Qiskit Pipeline\n\nHere is a production-ready, beginner-friendly Python script using **Qiskit** to prepare an entangled Bell pair, simulate it locally with the statevector engine, and extract measurement statistics.\n\n*Note: Code is presented for review and learning; never executed automatically in the browser.*`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Qiskit Python: Bell State Simulation',
            code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\n\ndef run_bell_circuit(shots=1024):\n    # 1. Allocate 2 qubits and 2 classical bits\n    qc = QuantumCircuit(2, 2)\n    \n    # 2. Add quantum gates\n    qc.h(0)         # Put q[0] in superposition\n    qc.cx(0, 1)     # Entangle q[0] and q[1]\n    qc.measure([0, 1], [0, 1])\n    \n    # 3. Simulate locally with Aer\n    simulator = AerSimulator()\n    compiled_circuit = transpile(qc, simulator)\n    job = simulator.run(compiled_circuit, shots=shots)\n    result = job.result()\n    counts = result.get_counts()\n    \n    print("Measurement Counts:", counts)\n    return counts\n\nif __name__ == '__main__':\n    run_bell_circuit()`
          },
          {
            language: 'cirq',
            title: 'Google Cirq Equivalent',
            code: `import cirq\n\n# Create two qubits\nq0, q1 = cirq.LineQubit.range(2)\n\n# Assemble circuit\ncircuit = cirq.Circuit(\n    cirq.H(q0),\n    cirq.CNOT(q0, q1),\n    cirq.measure(q0, q1, key='result')\n)\n\n# Simulate\nsim = cirq.Simulator()\nresult = sim.run(circuit, repetitions=1000)\nprint(result.histogram(key='result'))`
          }
        ],
        suggestedFollowUps: [
          'Explain each line of this Qiskit code',
          'How do I run this on real IBM Quantum hardware?',
          'Generate OpenQASM 2.0 code for this circuit'
        ],
        recommendedModuleId: 'mod-8',
        recommendedAlgorithmId: 'bell-state',
        source: 'curated_demo'
      };
    }

    // --- 8. QUANTUM TELEPORTATION ---
    if (q.includes('teleport') || q.includes('teleportation')) {
      return {
        reply: `### Quantum Teleportation Protocol\n\nQuantum Teleportation allows transmitting an unknown quantum state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ from Alice to Bob using:\n1. A pre-shared **Bell pair** between Alice and Bob.\n2. **Two classical bits** sent over a classical channel.\n\n#### Protocol Steps:\n1. **State Preparation:** Alice has $|\\psi\\rangle$ (qubit $A$) and shares Bell pair $|\\Phi^+\\rangle_{AB}$ with Bob.\n2. **Alice's Bell Measurement:** Alice performs a CNOT between $A$ and her half of the Bell pair, followed by a Hadamard on $A$. She then measures both qubits, obtaining two classical bits $(c_0, c_1)$.\n3. **Classical Communication:** Alice sends $(c_0, c_1)$ to Bob.\n4. **Bob's Correction:** Based on the two bits received, Bob applies conditional gates to his qubit:\n   * $00 \\implies I$ (do nothing)\n   * $01 \\implies X$ (bit flip)\n   * $10 \\implies Z$ (phase flip)\n   * $11 \\implies Z X$ (bit and phase flip)\n\nResult: Bob's qubit is transformed exactly into $|\\psi\\rangle$! Notice that Alice's original state was destroyed during measurement, strictly adhering to the **No-Cloning Theorem**.`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Qiskit: Quantum Teleportation Circuit',
            code: `from qiskit import QuantumCircuit\n\n# 3 qubits: q0 (Alice payload), q1 (Alice EPR), q2 (Bob EPR)\nqc = QuantumCircuit(3, 2)\n\n# 1. Prepare Bell pair between Alice (q1) and Bob (q2)\nqc.h(1)\nqc.cx(1, 2)\n\n# 2. Alice interacts payload q0 with EPR half q1\nqc.cx(0, 1)\nqc.h(0)\n\n# 3. Alice measures q0 and q1\nqc.measure(0, 0)\nqc.measure(1, 1)\n\n# 4. Bob applies conditional corrections (represented in circuit)\nprint(qc.draw(output='text'))`
          }
        ],
        suggestedFollowUps: [
          'Why is classical communication required in teleportation?',
          'Open Teleportation preset in the Visual Lab',
          'Explain the No-Cloning theorem proof'
        ],
        recommendedModuleId: 'mod-5',
        recommendedAlgorithmId: 'quantum-teleportation',
        source: 'curated_demo'
      };
    }

    // --- 9. LEARNING ROADMAP & RECOMMENDATIONS ---
    if (
      q.includes('next') ||
      q.includes('recommend') ||
      q.includes('roadmap') ||
      q.includes('where to start') ||
      q.includes('curriculum')
    ) {
      let nextMsg = 'Module 2: Classical Bits vs Quantum Bits';
      let nextId = 'mod-2';
      let algoRec = 'bell-state';

      if (!completedIds.includes('mod-1')) {
        nextMsg = 'Module 1: Introduction to Quantum Computing';
        nextId = 'mod-1';
      } else if (!completedIds.includes('mod-2')) {
        nextMsg = 'Module 2: Classical Bits vs Quantum Bits';
        nextId = 'mod-2';
      } else if (!completedIds.includes('mod-3')) {
        nextMsg = 'Module 3: Qubits and Quantum States (Bloch Sphere)';
        nextId = 'mod-3';
      } else if (!completedIds.includes('mod-4')) {
        nextMsg = 'Module 4: Superposition & Hadamard Transformation';
        nextId = 'mod-4';
      } else if (!completedIds.includes('mod-5')) {
        nextMsg = 'Module 5: Quantum Entanglement & Bell States';
        nextId = 'mod-5';
        algoRec = 'bell-state';
      } else if (!completedIds.includes('mod-7')) {
        nextMsg = 'Module 7: Quantum Gates (X, Y, Z, H, S, T, CNOT)';
        nextId = 'mod-7';
      } else {
        nextMsg = 'Module 9: Quantum Algorithms (Grover & Deutsch-Jozsa)';
        nextId = 'mod-9';
        algoRec = 'grover-search';
      }

      return {
        reply: `### Personalized Learning Recommendations\n\nBased on your active study profile (${completedIds.length} modules completed):\n\n#### Recommended Next Step:\n**${nextMsg}**\n\n#### Why This Fits Your Progression:\nQuantum computing is cumulative. Mastering state vectors and unitary rotations before delving into multi-qubit entanglement or phase oracles guarantees you understand the physical and mathematical reasons behind quantum algorithmic speedup.\n\n* **Interactive Step:** Complete the interactive demonstration in **${nextMsg}**.\n* **Lab Experiment:** Open the **Visual Quantum Lab** and test the circuits with real state-vector evaluation.\n* **Algorithm Spotlight:** Explore **${algoRec === 'grover-search' ? "Grover's Search" : 'Bell State Preparation'}** in our library.`,
        suggestedFollowUps: [
          `Tell me about ${nextMsg}`,
          'What are the mathematical prerequisites for quantum computing?',
          'How does the Quantum Lab calculate state vectors?'
        ],
        recommendedModuleId: nextId,
        recommendedAlgorithmId: algoRec,
        source: 'curated_demo'
      };
    }

    // --- 10. DEFAULT BALANCED TUTOR RESPONSE ---
    return {
      reply: `### Quantum AI Pedagogical Insight\n\nThank you for asking about **"${request.message}"**.\n\nIn quantum computing, three core principles govern all physical dynamics:\n\n1. **Linear Superposition:** Physical states inhabit a complex vector space $\\mathcal{H}$ where linear combinations of basis states form legitimate states.\n2. **Unitary Evolution:** Closed quantum systems evolve under reversible transformations governed by unitary operators $U$ ($U^\\dagger U = I$).\n3. **Born Rule Measurement:** Projective measurements collapse the state vector with probability $P(i) = |\\langle i | \\psi \\rangle|^2$.\n\nHow would you like to explore this topic further? I can provide:\n* **A step-by-step mathematical proof or matrix calculation**\n* **A complete Qiskit or Cirq Python code example**\n* **A visual schematic you can build directly in the Quantum Lab**\n* **Troubleshooting guidance for common beginner bugs**`,
      suggestedFollowUps: [
        'Explain this with step-by-step mathematics',
        'Generate Python Qiskit code for this concept',
        'What are the common beginner pitfalls to avoid?',
        'Recommend the best module to learn this'
      ],
      recommendedModuleId: completedIds.includes('mod-1') ? 'mod-4' : 'mod-1',
      recommendedAlgorithmId: 'bell-state',
      source: 'curated_demo'
    };
  }

  /**
   * Curated list of suggested questions across categories
   */
  getSuggestedQuestions(): SuggestedQuestion[] {
    return [
      {
        id: 'sq-1',
        category: 'Beginner',
        question: 'Explain quantum superposition using the spinning coin analogy.',
        badge: 'Intuition'
      },
      {
        id: 'sq-2',
        category: 'Beginner',
        question: 'What is the physical difference between a classical bit and a qubit?',
        badge: 'Fundamentals'
      },
      {
        id: 'sq-3',
        category: 'Mathematics',
        question: 'Show step-by-step matrix derivation of the Hadamard gate on |0⟩.',
        badge: 'Linear Algebra'
      },
      {
        id: 'sq-4',
        category: 'Mathematics',
        question: 'What is the geometric meaning of the Bloch sphere coordinates (θ, φ)?',
        badge: 'Geometry'
      },
      {
        id: 'sq-5',
        category: 'Code & Qiskit',
        question: 'Generate Qiskit code to prepare and measure the Bell state |Φ+⟩.',
        badge: 'Qiskit Python'
      },
      {
        id: 'sq-6',
        category: 'Code & Qiskit',
        question: 'How do I build the Grover diffusion operator in Python?',
        badge: 'Algorithms'
      },
      {
        id: 'sq-7',
        category: 'Debugging',
        question: 'Why does Qiskit return measurement bitstrings in reverse (endianness)?',
        badge: 'Debugger'
      },
      {
        id: 'sq-8',
        category: 'Debugging',
        question: 'What is phase kickback and why did my Deutsch-Jozsa circuit fail?',
        badge: 'Troubleshooting'
      },
      {
        id: 'sq-9',
        category: 'Roadmap',
        question: 'What module should I study next based on my current progress?',
        badge: 'Personalized'
      }
    ];
  }
}

// Singleton export
export const aiService = new AIServiceImpl();
