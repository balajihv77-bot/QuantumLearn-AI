"""
QuantumLearn AI - Learning Curriculum API Endpoints
GET /api/learning/modules - List all quantum curriculum modules
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.module import ModuleListResponse
from backend.app.services.learning_service import LearningService

router = APIRouter(prefix="/learning", tags=["Learning Modules"])


@router.get(
    "/modules",
    response_model=ModuleListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all curriculum learning modules"
)
def get_modules(db: Session = Depends(get_db)):
    """Returns all 9 quantum learning modules ordered by progression sequence."""
    return LearningService.get_all_modules(db)
