"""
QuantumLearn AI - Progress Service Layer
Manages student lesson progression, marking modules as complete/incomplete, and awarding XP.
"""

from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.models.module import LearningModule
from backend.app.models.progress import UserProgress
from backend.app.schemas.progress import ProgressUpdateRequest, ProgressResponse, AllProgressResponse
from backend.app.services.user_service import UserService


class ProgressService:
    @staticmethod
    def get_user_progress(db: Session, user: User) -> AllProgressResponse:
        records = db.query(UserProgress).filter(UserProgress.user_id == user.id).all()
        
        completed_ids = [r.module_id for r in records if r.is_completed]
        
        return AllProgressResponse(
            user_id=user.id,
            total_completed=len(completed_ids),
            completed_module_ids=completed_ids,
            progress_records=[ProgressResponse.model_validate(r) for r in records],
            user_xp=user.xp,
            user_level=user.level
        )

    @staticmethod
    def update_progress(db: Session, user: User, req: ProgressUpdateRequest) -> ProgressResponse:
        # Verify module exists
        module = db.query(LearningModule).filter(LearningModule.id == req.module_id).first()
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Learning module '{req.module_id}' not found."
            )

        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user.id,
            UserProgress.module_id == req.module_id
        ).first()

        now = datetime.now(timezone.utc)

        if not progress:
            progress = UserProgress(
                user_id=user.id,
                module_id=req.module_id,
                is_completed=req.is_completed,
                score=req.score or 100,
                completed_at=now if req.is_completed else None
            )
            db.add(progress)
            if req.is_completed:
                UserService.add_xp(db, user, 150)
        else:
            was_completed = progress.is_completed
            progress.is_completed = req.is_completed
            progress.score = req.score or progress.score
            if req.is_completed and not was_completed:
                progress.completed_at = now
                UserService.add_xp(db, user, 150)
            elif not req.is_completed and was_completed:
                progress.completed_at = None
                # Deduct XP if marked incomplete
                user.xp = max(0, user.xp - 150)
                user.level = max(1, 1 + (user.xp // 1000))

        db.commit()
        db.refresh(progress)

        return ProgressResponse.model_validate(progress)
