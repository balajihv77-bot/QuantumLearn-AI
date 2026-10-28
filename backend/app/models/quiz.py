"""
QuantumLearn AI - Quiz Results and Challenge Submissions Models
Stores student assessments, challenge attempts, and performance metrics.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(String(100), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    answers_json = Column(Text, nullable=True)  # JSON-encoded array of chosen option IDs

    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="quiz_results")

    def __repr__(self):
        return f"<QuizResult id={self.id} user={self.user_id} quiz='{self.quiz_id}' score={self.score}/{self.total_questions}>"


class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(String(100), nullable=False, index=True)
    circuit_json = Column(Text, nullable=False)
    status = Column(String(50), default="completed", nullable=False)  # completed, failed, pending
    passed = Column(Boolean, default=False, nullable=False)
    execution_time_ms = Column(Float, default=0.0, nullable=False)

    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="challenge_submissions")

    def __repr__(self):
        return f"<ChallengeSubmission id={self.id} user={self.user_id} challenge='{self.challenge_id}' passed={self.passed}>"
