"""
QuantumLearn AI - Circuit Schemas
Pydantic models for saving, editing, and listing user-designed circuits.
"""

from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class CircuitCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Circuit descriptive title")
    description: Optional[str] = Field(None, description="Optional explanation of algorithm")
    num_qubits: int = Field(..., ge=1, le=5, description="Number of qubit wires (1 to 5)")
    num_steps: int = Field(..., ge=1, le=12, description="Number of discrete time steps")
    grid: List[List[Optional[str]]] = Field(..., description="2D array of gate IDs or null slots")
    is_public: bool = Field(False, description="Public visibility flag")


class CircuitResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    num_qubits: int
    num_steps: int
    grid: List[List[Optional[str]]]
    is_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CircuitListResponse(BaseModel):
    total: int
    circuits: List[CircuitResponse]
