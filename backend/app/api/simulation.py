"""
QuantumLearn AI - Quantum Simulation API Endpoints
POST /api/simulation/run - Execute exact state-vector simulation of a quantum circuit
"""

from fastapi import APIRouter, status
from backend.app.schemas.simulation import SimulationRunRequest, SimulationResultResponse
from backend.app.services.simulation_service import QuantumSimulationService

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post(
    "/run",
    response_model=SimulationResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Run exact state-vector quantum circuit simulation"
)
def run_simulation(req: SimulationRunRequest):
    """
    Executes an exact tensor-product statevector simulation across 1 to 5 qubits.
    Computes basis amplitudes, probabilities, measurement shot distributions,
    Dirac bra-ket notation, and individual qubit reduced density matrix coordinates.
    """
    return QuantumSimulationService.run_simulation(req)
