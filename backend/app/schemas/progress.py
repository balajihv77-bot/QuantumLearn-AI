"""
QuantumLearn AI - Progress Schemas
Pydantic models for tracking and updating lesson completion status.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ProgressUpdateRequest(BaseModel):
    module_id: str = Field(..., description="Target module ID (e.g. 'mod-1')")
    is_completed: bool = Field(True, description="Completion toggle state")
    score: Optional[int] = Field(100, ge=0, le=100, description="Knowledge check score")


class ProgressResponse(BaseModel):
    module_id: str
    is_completed: bool
    score: int
    completed_at: Optional[datetime] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AllProgressResponse(BaseModel):
    user_id: int
    total_completed: int
    completed_module_ids: List[str]
    progress_records: List[ProgressResponse]
    user_xp: int
    user_level: int
