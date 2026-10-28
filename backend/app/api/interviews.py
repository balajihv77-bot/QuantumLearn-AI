"""
QuantumLearn AI - Mock Interview API Endpoints
Provides endpoints for starting sessions, submitting answers, retrieving questions,
finishing sessions, viewing history, and fetching evaluation reports.
Backed by MySQL persistence via SQLAlchemy.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.core.security import oauth2_scheme, decode_access_token
from backend.app.schemas.interview import (
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewFinishResponse,
    InterviewReportSchema,
    InterviewHistoryResponse,
    InterviewHealthResponse,
    InterviewProviderStatusResponse,
)
from backend.app.services.interview_service import InterviewService

router = APIRouter(prefix="/interviews", tags=["AI Mock Interview"])


@router.get(
    "/provider-status",
    response_model=InterviewProviderStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Check AI Provider status and active mode (Live AI vs Demo)"
)
def get_provider_status():
    """
    Returns whether live Gemini AI is configured, active model,
    supported rubrics, and active operational mode.
    """
    return InterviewService.provider_status()


def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts the authenticated user if a valid Bearer token is provided.
    Permits unauthenticated/guest sessions when token is absent.
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


@router.get(
    "/health",
    response_model=InterviewHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check Interview API availability and MySQL storage health"
)
def interview_health(db: Session = Depends(get_db)):
    """Returns the operational health and database readiness of the interview service."""
    return InterviewService.health_check(db=db)


@router.post(
    "/start",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new mock interview session"
)
def start_interview(
    req: InterviewStartRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Initializes a new interview session tailored to role, experience,
    interview type, difficulty, and question count, persisted in MySQL.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.start_interview(req, user_id=user_id, db=db)


@router.post(
    "/{session_id}/answer",
    response_model=InterviewAnswerResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit an answer to the current interview question"
)
def submit_answer(
    session_id: str,
    req: InterviewAnswerRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Records the candidate's answer (text and optional code), validates non-blank
    input, evaluates with live AI or calibrated rubric, and advances the session.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.submit_answer(session_id, req, user_id=user_id, db=db)


@router.get(
    "/history",
    response_model=InterviewHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="List past interview practice sessions"
)
def get_interview_history(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves chronological list of interview sessions.
    Strictly isolated: authenticated users only see their own private history.
    Unauthenticated users see only guest demo sessions.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.get_history(user_id=user_id, db=db)


@router.get(
    "/{session_id}",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get active interview session state and current question"
)
def get_interview_session(
    session_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves current session state, progress, and active question from MySQL.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.get_session(session_id, user_id=user_id, db=db)


@router.post(
    "/{session_id}/finish",
    response_model=InterviewFinishResponse,
    status_code=status.HTTP_200_OK,
    summary="Finish or end an interview session early"
)
def finish_interview(
    session_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Concludes the interview session, generates performance metrics,
    and produces and persists the evaluation report in MySQL.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.finish_interview(session_id, user_id=user_id, db=db)


@router.get(
    "/{session_id}/report",
    response_model=InterviewReportSchema,
    status_code=status.HTTP_200_OK,
    summary="Get diagnostic evaluation report for a finished interview"
)
def get_interview_report(
    session_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns detailed score breakdowns, candidate vs model answers,
    strengths, and actionable recommendations from MySQL.
    """
    user_id = current_user.id if current_user else None
    return InterviewService.get_report(session_id, user_id=user_id, db=db)
