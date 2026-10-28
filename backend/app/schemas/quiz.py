"""
QuantumLearn AI - Quiz Schemas
Pydantic models for submitting quiz answers and viewing score results.
"""

from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field, ConfigDict


class QuizSubmitRequest(BaseModel):
    quiz_id: str = Field(..., description="Target quiz ID (e.g. 'quiz-superposition')")
    answers: Dict[str, str] = Field(..., description="Map of question ID to chosen option ID")


class QuizResultResponse(BaseModel):
    id: int
    quiz_id: str
    user_id: int
    score: int
    total_questions: int
    percentage: float
    passed: bool
    xp_earned: int
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)
