"""
QuantumLearn AI - Learning Progress API Endpoints
GET  /api/learning/progress - Get current student module progress
POST /api/learning/progress - Update module completion status
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.schemas.progress import AllProgressResponse, ProgressResponse, ProgressUpdateRequest
from backend.app.services.user_service import UserService
from backend.app.services.progress_service import ProgressService

router = APIRouter(prefix="/learning/progress", tags=["Learning Progress"])


@router.get(
    "",
    response_model=AllProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user module progression"
)
def get_progress(
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the authenticated user's completed modules, progress records, and XP."""
    return ProgressService.get_user_progress(db, current_user)


@router.post(
    "",
    response_model=ProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Update module completion status"
)
def update_progress(
    req: ProgressUpdateRequest,
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a module as completed or in-progress and awards completion XP."""
    return ProgressService.update_progress(db, current_user, req)
