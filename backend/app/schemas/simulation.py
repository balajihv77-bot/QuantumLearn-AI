"""
QuantumLearn AI - Quantum Simulation Schemas
Pydantic models for circuit execution requests, exact state vectors, amplitudes, and subsystem purity.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class SimulationRunRequest(BaseModel):
    num_qubits: int = Field(..., ge=1, le=5, description="Number of qubits (1-5)")
    grid: List[List[Optional[str]]] = Field(..., description="2D circuit grid [qubit][step]")
    shots: int = Field(1024, ge=1, le=10000, description="Monte Carlo measurement sampling shots")


class AmplitudeEntrySchema(BaseModel):
    basis: str
    real: float
    imag: float
    magnitude: float
    probability: float
    phase_rad: float
    phase_deg: float


class IndividualQubitStateSchema(BaseModel):
    qubit_index: int
    is_entangled: bool
    purity: float
    theta: float
    phi: float
    prob0: float
    prob1: float
    bloch_vector: Dict[str, float]


class SimulationResultResponse(BaseModel):
    num_qubits: int
    total_steps: int
    circuit_depth: int
    total_gates: int
    multi_qubit_gates: int
    is_entangled: bool
    dirac_notation: str
    state_vector: List[AmplitudeEntrySchema]
    probabilities: Dict[str, float]
    measurement_counts: Dict[str, int]
    shots: int
    execution_time_ms: float
    individual_qubits: List[IndividualQubitStateSchema]
    has_measurement: bool
    unsupported_gates_detected: Optional[List[str]] = None
    engine: str = Field("statevector_local_tensor", description="Simulation engine type")
