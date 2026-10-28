"""
QuantumLearn AI - Learning Service Layer
Handles course module retrieval and database seeding for the curriculum.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.module import LearningModule
from backend.app.schemas.module import ModuleResponse, ModuleListResponse


DEFAULT_MODULES_SEED = [
    {
        "id": "mod-1",
        "module_number": 1,
        "title": "Introduction to Quantum Computing",
        "slug": "introduction-to-quantum-computing",
        "category": "Fundamentals",
        "level": "Beginner",
        "duration_minutes": 20,
        "description": "Understand why quantum computing represents an entirely distinct paradigm from classical computation.",
        "beginner_explanation": "Classical computers use switches called bits (0 or 1). Quantum computers exploit atomic-scale physics like superposition and interference."
    },
    {
        "id": "mod-2",
        "module_number": 2,
        "title": "Classical Bits vs Quantum Bits",
        "slug": "classical-bits-vs-quantum-bits",
        "category": "Fundamentals",
        "level": "Beginner",
        "duration_minutes": 25,
        "description": "Compare classical binary bits with quantum two-level systems and explore the exponential dimensionality of Hilbert space.",
        "beginner_explanation": "While N classical bits can represent only 1 of 2^N numbers at any instant, N qubits simultaneously encode a superposition across all 2^N states."
    },
    {
        "id": "mod-3",
        "module_number": 3,
        "title": "Qubits and Quantum States",
        "slug": "qubits-and-quantum-states",
        "category": "Fundamentals",
        "level": "Beginner",
        "duration_minutes": 35,
        "description": "Explore the geometric beauty of the Bloch sphere, polar coordinates (θ, φ), and basis state transformations.",
        "beginner_explanation": "A pure single-qubit state is a point on the surface of a 3D unit sphere, parameterized by polar angle θ and relative phase φ."
    },
    {
        "id": "mod-4",
        "module_number": 4,
        "title": "Quantum Superposition",
        "slug": "quantum-superposition",
        "category": "Fundamentals",
        "level": "Beginner",
        "duration_minutes": 30,
        "description": "Master linear combinations of quantum states and how the Hadamard gate creates constructive and destructive interference.",
        "beginner_explanation": "Superposition allows probability amplitudes to cancel out incorrect answers (destructive interference) and amplify correct ones (constructive interference)."
    },
    {
        "id": "mod-5",
        "module_number": 5,
        "title": "Quantum Entanglement",
        "slug": "quantum-entanglement",
        "category": "Fundamentals",
        "level": "Intermediate",
        "duration_minutes": 40,
        "description": "Explore non-local correlations, Bell states, EPR pairs, and why Einstein called it 'spooky action at a distance'.",
        "beginner_explanation": "When two qubits are entangled, their joint state cannot be factored into individual states; measuring one instantly determines the other."
    },
    {
        "id": "mod-6",
        "module_number": 6,
        "title": "Quantum Measurement & Collapse",
        "slug": "quantum-measurement",
        "category": "Fundamentals",
        "level": "Beginner",
        "duration_minutes": 25,
        "description": "Understand Born rule probabilities, projective measurement operators, and irreversible state collapse.",
        "beginner_explanation": "Measuring a quantum state forces it to collapse into a single classical outcome with probability proportional to the squared amplitude |α|²."
    },
    {
        "id": "mod-7",
        "module_number": 7,
        "title": "Quantum Gates: X, Y, Z, H, S, T and CNOT",
        "slug": "quantum-gates",
        "category": "Gates & Circuits",
        "level": "Beginner",
        "duration_minutes": 45,
        "description": "Examine single-qubit rotations, phase gates, and the two-qubit Controlled-NOT gate represented as unitary matrices.",
        "beginner_explanation": "Quantum gates are reversible 2x2 and 4x4 unitary matrix operations that manipulate qubit amplitudes without losing information."
    },
    {
        "id": "mod-8",
        "module_number": 8,
        "title": "Quantum Circuits",
        "slug": "quantum-circuits",
        "category": "Gates & Circuits",
        "level": "Intermediate",
        "duration_minutes": 35,
        "description": "Assemble sequential gate operations on multi-qubit registers, calculate circuit depth, and optimize gate synthesis.",
        "beginner_explanation": "A quantum circuit arranges qubit wires horizontally with gates applied in sequential time steps from left to right."
    },
    {
        "id": "mod-9",
        "module_number": 9,
        "title": "Quantum Algorithms",
        "slug": "quantum-algorithms",
        "category": "Algorithms",
        "level": "Advanced",
        "duration_minutes": 55,
        "description": "Survey the milestone quantum algorithms: Deutsch-Jozsa, Grover's Search, Shor's Factoring, and Quantum Phase Estimation.",
        "beginner_explanation": "Quantum algorithms choreograph interference patterns across superpositions to solve hard mathematical problems quadratically or exponentially faster."
    }
]


class LearningService:
    @staticmethod
    def seed_modules_if_empty(db: Session) -> None:
        """Seeds the 9 curriculum modules into the database if not present."""
        count = db.query(LearningModule).count()
        if count == 0:
            for item in DEFAULT_MODULES_SEED:
                mod = LearningModule(
                    id=item["id"],
                    module_number=item["module_number"],
                    title=item["title"],
                    slug=item["slug"],
                    category=item["category"],
                    level=item["level"],
                    duration_minutes=item["duration_minutes"],
                    description=item["description"],
                    beginner_explanation=item["beginner_explanation"]
                )
                db.add(mod)
            db.commit()

    @staticmethod
    def get_all_modules(db: Session) -> ModuleListResponse:
        LearningService.seed_modules_if_empty(db)
        modules = db.query(LearningModule).order_by(LearningModule.module_number.asc()).all()
        return ModuleListResponse(
            total=len(modules),
            modules=[ModuleResponse.model_validate(m) for m in modules]
        )

    @staticmethod
    def get_module_by_id(db: Session, module_id: str) -> Optional[LearningModule]:
        return db.query(LearningModule).filter(LearningModule.id == module_id).first()
