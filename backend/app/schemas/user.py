"""
QuantumLearn AI - User Schemas
Pydantic models for user profile serialization and updates.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    institution: Optional[str] = None
    role: str
    xp: int
    level: int
    streak_days: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
