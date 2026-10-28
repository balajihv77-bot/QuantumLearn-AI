"""
QuantumLearn AI - Users API Endpoints
GET /api/users/me - Retrieve current authenticated student profile
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current student profile"
)
def get_me(current_user: User = Depends(UserService.get_current_user)):
    """Returns the authenticated student's profile, XP points, and level."""
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current student profile"
)
def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """Updates profile attributes such as full name or institution."""
    return UserService.update_user_profile(db, current_user, update_data)
