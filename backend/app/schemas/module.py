"""
QuantumLearn AI - Module Schemas
Pydantic models for quantum course modules and curriculum serialization.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ModuleResponse(BaseModel):
    id: str
    module_number: int
    title: str
    slug: str
    category: str
    level: str
    duration_minutes: int
    description: str
    beginner_explanation: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ModuleListResponse(BaseModel):
    total: int
    modules: List[ModuleResponse]
