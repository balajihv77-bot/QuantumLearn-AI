"""
QuantumLearn AI - Circuit API Endpoints
POST /api/circuits - Save a student designed quantum circuit
GET  /api/circuits - List user designed circuits (and public templates)
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.schemas.circuit import CircuitCreateRequest, CircuitResponse, CircuitListResponse
from backend.app.services.user_service import UserService
from backend.app.services.circuit_service import CircuitService

router = APIRouter(prefix="/circuits", tags=["Quantum Circuits"])


@router.post(
    "",
    response_model=CircuitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a newly constructed quantum circuit"
)
def create_circuit(
    req: CircuitCreateRequest,
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves a student-constructed circuit layout, including qubit count,
    step depth, and gate matrix grid.
    """
    return CircuitService.create_circuit(db, current_user, req)


@router.get(
    "",
    response_model=CircuitListResponse,
    status_code=status.HTTP_200_OK,
    summary="List saved user quantum circuits"
)
def get_circuits(
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the student's saved circuits along with preset algorithm templates.
    """
    return CircuitService.get_user_circuits(db, current_user)
