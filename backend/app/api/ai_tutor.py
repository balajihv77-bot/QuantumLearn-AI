"""
QuantumLearn AI - AI Tutor API Endpoints
POST /api/ai/chat - Ask quantum questions, generate Qiskit code, and receive debugging assistance
"""

from fastapi import APIRouter, status
from backend.app.schemas.ai import AIChatRequestSchema, AIChatResponseSchema
from backend.app.services.ai_service import AITutorService

router = APIRouter(prefix="/ai", tags=["AI Tutor"])


@router.post(
    "/chat",
    response_model=AIChatResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Pedagogical conversation with AI Quantum Tutor"
)
async def chat(req: AIChatRequestSchema):
    """
    Synthesizes pedagogical quantum explanations, mathematical proofs,
    code snippets in Python/Qiskit, and debug guidance.
    Uses Google Gemini when configured; otherwise falls back to verified
    curated pedagogical responses with clear source metadata.
    """
    return await AITutorService.generate_response(req)
