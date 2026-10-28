"""
QuantumLearn AI - AI Tutor Schemas
Pydantic models for chat conversations, code snippets, and follow-ups.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AICodeSnippetSchema(BaseModel):
    language: str
    code: str
    title: Optional[str] = None
    description: Optional[str] = None


class AIChatRequestSchema(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or query")
    history: Optional[List[Dict[str, str]]] = Field(default=None, description="Previous conversation messages")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Current student progress context")


class AIChatResponseSchema(BaseModel):
    reply: str
    codeSnippets: Optional[List[AICodeSnippetSchema]] = None
    suggestedFollowUps: Optional[List[str]] = None
    recommendedModuleId: Optional[str] = None
    recommendedAlgorithmId: Optional[str] = None
    source: str = Field(..., description="'live_backend' or 'curated_demo'")
    latencyMs: Optional[int] = None
