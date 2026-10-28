"""
QuantumLearn AI - User Service Layer
Retrieves user profiles and updates user progression stats.
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.core.security import oauth2_scheme, decode_access_token
from backend.app.database.connection import get_db


class UserService:
    @staticmethod
    def get_current_user(
        token: Optional[str] = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
    ) -> User:
        """
        FastAPI dependency that extracts and validates the authenticated user from the Bearer token.
        """
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please include a valid Bearer token.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account associated with this token does not exist."
            )

        return user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_user_profile(db: Session, user: User, update_data: UserUpdate) -> User:
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.institution is not None:
            user.institution = update_data.institution

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def add_xp(db: Session, user: User, xp_points: int) -> User:
        user.xp += xp_points
        # Level up every 1000 XP
        user.level = max(1, 1 + (user.xp // 1000))
        db.commit()
        db.refresh(user)
        return user
