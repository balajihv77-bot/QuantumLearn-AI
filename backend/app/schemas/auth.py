"""
QuantumLearn AI - Authentication Schemas
Pydantic models for user registration, login, and JWT token exchange.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Valid student email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=6, max_length=128, description="Account password")
    full_name: Optional[str] = Field(None, max_length=255, description="Student full name")
    institution: Optional[str] = Field(None, max_length=255, description="School, university, or self-study")
    role: Optional[str] = Field("Student", description="User role")


class LoginRequest(BaseModel):
    username_or_email: Optional[str] = Field(None, description="Registered username or email address")
    email: Optional[str] = Field(None, description="Registered email address")
    password: str = Field(..., description="Account password")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
