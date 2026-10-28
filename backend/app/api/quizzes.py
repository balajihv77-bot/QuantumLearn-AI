"""
QuantumLearn AI - Quizzes & Challenges API Endpoints
POST /api/quizzes/submit - Submit quiz responses, calculate score and award XP
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.schemas.quiz import QuizSubmitRequest, QuizResultResponse
from backend.app.services.user_service import UserService
from backend.app.services.quiz_service import QuizService

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.post(
    "/submit",
    response_model=QuizResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit answers for a quantum knowledge quiz"
)
def submit_quiz(
    req: QuizSubmitRequest,
    current_user: User = Depends(UserService.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates submitted question answers against the answer key,
    computes percentage score, records history, and awards student XP points.
    """
    return QuizService.submit_quiz(db, current_user, req)
