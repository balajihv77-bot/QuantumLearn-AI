"""
QuantumLearn AI - Circuit Service Layer
Manages saving, retrieving, and serializing quantum circuits designed by students.
"""

import json
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.models.circuit import QuantumCircuit
from backend.app.schemas.circuit import CircuitCreateRequest, CircuitResponse, CircuitListResponse


class CircuitService:
    @staticmethod
    def create_circuit(db: Session, user: User, req: CircuitCreateRequest) -> CircuitResponse:
        grid_json = json.dumps(req.grid)

        circuit = QuantumCircuit(
            user_id=user.id,
            title=req.title,
            description=req.description,
            num_qubits=req.num_qubits,
            num_steps=req.num_steps,
            grid_json=grid_json,
            is_public=req.is_public
        )

        db.add(circuit)
        db.commit()
        db.refresh(circuit)

        return CircuitResponse(
            id=circuit.id,
            user_id=circuit.user_id,
            title=circuit.title,
            description=circuit.description,
            num_qubits=circuit.num_qubits,
            num_steps=circuit.num_steps,
            grid=json.loads(circuit.grid_json),
            is_public=circuit.is_public,
            created_at=circuit.created_at,
            updated_at=circuit.updated_at
        )

    @staticmethod
    def get_user_circuits(db: Session, user: User) -> CircuitListResponse:
        circuits = db.query(QuantumCircuit).filter(
            QuantumCircuit.user_id == user.id
        ).order_by(QuantumCircuit.updated_at.desc()).all()

        results = [
            CircuitResponse(
                id=c.id,
                user_id=c.user_id,
                title=c.title,
                description=c.description,
                num_qubits=c.num_qubits,
                num_steps=c.num_steps,
                grid=json.loads(c.grid_json),
                is_public=c.is_public,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
            for c in circuits
        ]

        return CircuitListResponse(total=len(results), circuits=results)

    @staticmethod
    def get_circuit_by_id(db: Session, circuit_id: int, user: Optional[User] = None) -> CircuitResponse:
        circuit = db.query(QuantumCircuit).filter(QuantumCircuit.id == circuit_id).first()
        if not circuit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quantum circuit #{circuit_id} not found."
            )

        if not circuit.is_public and (not user or circuit.user_id != user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this private circuit."
            )

        return CircuitResponse(
            id=circuit.id,
            user_id=circuit.user_id,
            title=circuit.title,
            description=circuit.description,
            num_qubits=circuit.num_qubits,
            num_steps=circuit.num_steps,
            grid=json.loads(circuit.grid_json),
            is_public=circuit.is_public,
            created_at=circuit.created_at,
            updated_at=circuit.updated_at
        )
