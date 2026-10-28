"""
QuantumLearn AI - Schemas Package
Exports all Pydantic request/response schemas.
"""

from backend.app.schemas.auth import RegisterRequest, LoginRequest, Token, TokenData
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.schemas.module import ModuleResponse, ModuleListResponse
from backend.app.schemas.progress import ProgressUpdateRequest, ProgressResponse, AllProgressResponse
from backend.app.schemas.circuit import CircuitCreateRequest, CircuitResponse, CircuitListResponse
from backend.app.schemas.simulation import (
    SimulationRunRequest,
    SimulationResultResponse,
    AmplitudeEntrySchema,
    IndividualQubitStateSchema,
)
from backend.app.schemas.quiz import QuizSubmitRequest, QuizResultResponse
from backend.app.schemas.ai import AIChatRequestSchema, AIChatResponseSchema, AICodeSnippetSchema
from backend.app.schemas.interview import (
    InterviewQuestionSchema,
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    QuestionBreakdownSchema,
    InterviewReportSchema,
    InterviewFinishResponse,
    InterviewSessionSummarySchema,
    InterviewHistoryResponse,
    InterviewHealthResponse,
)

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "Token",
    "TokenData",
    "UserResponse",
    "UserUpdate",
    "ModuleResponse",
    "ModuleListResponse",
    "ProgressUpdateRequest",
    "ProgressResponse",
    "AllProgressResponse",
    "CircuitCreateRequest",
    "CircuitResponse",
    "CircuitListResponse",
    "SimulationRunRequest",
    "SimulationResultResponse",
    "AmplitudeEntrySchema",
    "IndividualQubitStateSchema",
    "QuizSubmitRequest",
    "QuizResultResponse",
    "AIChatRequestSchema",
    "AIChatResponseSchema",
    "AICodeSnippetSchema",
    "InterviewQuestionSchema",
    "InterviewStartRequest",
    "InterviewSessionResponse",
    "InterviewAnswerRequest",
    "InterviewAnswerResponse",
    "QuestionBreakdownSchema",
    "InterviewReportSchema",
    "InterviewFinishResponse",
    "InterviewSessionSummarySchema",
    "InterviewHistoryResponse",
    "InterviewHealthResponse",
]
