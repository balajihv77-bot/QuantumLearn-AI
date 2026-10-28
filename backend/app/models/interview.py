"""
QuantumLearn AI - Interview Models for MySQL Persistence
Defines SQLAlchemy models for InterviewSession, InterviewQuestion,
InterviewAnswer, and InterviewReport with relationships, indexes,
and foreign key constraints.
"""

from datetime import datetime, timezone
import json
from typing import List, Dict, Any, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship, synonym
from backend.app.database.connection import Base


class InterviewSession(Base):
    """
    Tracks an interview practice session tailored to job role, experience level,
    track type, difficulty, status, and completion timestamps.
    """
    __tablename__ = "interview_sessions"

    session_id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    role = Column(String(100), nullable=False)
    experience_level = Column(String(50), nullable=False)
    interview_type = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=False)
    total_questions = Column(Integer, nullable=False, default=5)
    status = Column(String(50), nullable=False, default="in_progress", index=True)
    current_question_index = Column(Integer, nullable=False, default=0)
    provider_mode = Column(String(50), nullable=False, default="demo")
    is_live_ai = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Synonyms for flexible property access
    id = synonym("session_id")
    start_time = synonym("created_at")
    completion_time = synonym("completed_at")

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        order_by="InterviewQuestion.question_order",
        cascade="all, delete-orphan"
    )
    answers = relationship(
        "InterviewAnswer",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    report = relationship(
        "InterviewReport",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_interview_user_created", "user_id", "created_at"),
        Index("idx_interview_status_created", "status", "created_at"),
    )

    def __repr__(self):
        return f"<InterviewSession id='{self.session_id}' role='{self.role}' status='{self.status}'>"


class InterviewQuestion(Base):
    """
    Individual questions presented to the candidate in an interview session.
    """
    __tablename__ = "interview_questions"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(
        String(64),
        ForeignKey("interview_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False, default="technical")
    question_order = Column(Integer, nullable=False, default=0, index=True)
    category = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)
    hint = Column(Text, nullable=True)
    is_coding_question = Column(Boolean, default=False, nullable=False)
    coding_language = Column(String(50), nullable=True)
    starter_code = Column(Text, nullable=True)
    follow_up_hint = Column(Text, nullable=True)
    effective_answer_guide = Column(Text, nullable=True)
    model_answer = Column(Text, nullable=True)
    evaluation_criteria_json = Column(Text, nullable=True)
    key_points_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Synonyms
    question_id = synonym("id")

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship(
        "InterviewAnswer",
        back_populates="question",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_session_question_order", "session_id", "question_order"),
    )

    def get_evaluation_criteria(self) -> List[str]:
        if not self.evaluation_criteria_json:
            return []
        try:
            return json.loads(self.evaluation_criteria_json)
        except Exception:
            return []

    def get_key_points(self) -> List[str]:
        if not self.key_points_json:
            return []
        try:
            return json.loads(self.key_points_json)
        except Exception:
            return []

    def __repr__(self):
        return f"<InterviewQuestion id='{self.id}' session_id='{self.session_id}' order={self.question_order}>"


class InterviewAnswer(Base):
    """
    Submitted response from candidate for a question, along with
    rubric evaluation breakdown, scores, and feedback.
    """
    __tablename__ = "interview_answers"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(
        String(64),
        ForeignKey("interview_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id = Column(
        String(64),
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    answer_text = Column(Text, nullable=False)
    code_answer = Column(Text, nullable=True)
    correctness_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    problem_solving_score = Column(Integer, nullable=True)
    overall_score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    suggested_follow_up = Column(Text, nullable=True)
    effective_answer_guide = Column(Text, nullable=True)
    rubric_breakdown_json = Column(Text, nullable=True)
    strengths_json = Column(Text, nullable=True)
    gaps_json = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Synonyms
    answer_id = synonym("id")

    # Relationships
    session = relationship("InterviewSession", back_populates="answers")
    question = relationship("InterviewQuestion", back_populates="answers")

    def get_rubric_breakdown(self) -> Dict[str, Any]:
        if not self.rubric_breakdown_json:
            return {}
        try:
            return json.loads(self.rubric_breakdown_json)
        except Exception:
            return {}

    def __repr__(self):
        return f"<InterviewAnswer id='{self.id}' question_id='{self.question_id}' score={self.overall_score}>"


class InterviewReport(Base):
    """
    Final performance and diagnostic evaluation report for a finished interview session.
    """
    __tablename__ = "interview_reports"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(
        String(64),
        ForeignKey("interview_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    overall_practice_score = Column(Integer, nullable=False)
    technical_correctness = Column(Integer, nullable=True)
    answer_relevance = Column(Integer, nullable=True)
    clarity = Column(Integer, nullable=True)
    problem_solving = Column(Integer, nullable=True)
    strengths = Column(Text, nullable=True)
    improvement_areas = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    total_duration_seconds = Column(Integer, nullable=False, default=0)
    evaluation_rubric_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Synonyms
    report_id = synonym("id")
    report_creation_timestamp = synonym("created_at")

    # Relationships
    session = relationship("InterviewSession", back_populates="report")

    def get_strengths(self) -> List[str]:
        if not self.strengths:
            return []
        try:
            parsed = json.loads(self.strengths)
            return parsed if isinstance(parsed, list) else [self.strengths]
        except Exception:
            return [s.strip() for s in self.strengths.split("\n") if s.strip()]

    def get_improvement_areas(self) -> List[str]:
        if not self.improvement_areas:
            return []
        try:
            parsed = json.loads(self.improvement_areas)
            return parsed if isinstance(parsed, list) else [self.improvement_areas]
        except Exception:
            return [s.strip() for s in self.improvement_areas.split("\n") if s.strip()]

    def get_recommendations(self) -> List[str]:
        if not self.recommendations:
            return []
        try:
            parsed = json.loads(self.recommendations)
            return parsed if isinstance(parsed, list) else [self.recommendations]
        except Exception:
            return [s.strip() for s in self.recommendations.split("\n") if s.strip()]

    def __repr__(self):
        return f"<InterviewReport id='{self.id}' session_id='{self.session_id}' score={self.overall_practice_score}>"
