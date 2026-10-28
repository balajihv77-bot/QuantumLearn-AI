"""
QuantumLearn AI - User Progress Model
Tracks student completion status, score, and timestamps for each learning module.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(50), ForeignKey("learning_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, default=100, nullable=False)
    
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "module_id", name="uq_user_module_progress"),
    )

    # Relationships
    user = relationship("User", back_populates="progress_records")
    module = relationship("LearningModule", back_populates="progress_records")

    def __repr__(self):
        return f"<UserProgress user={self.user_id} module='{self.module_id}' completed={self.is_completed}>"
