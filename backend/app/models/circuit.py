"""
QuantumLearn AI - Quantum Circuit Model
Stores custom circuits designed by users in the Visual Circuit Lab.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class QuantumCircuit(Base):
    __tablename__ = "quantum_circuits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    num_qubits = Column(Integer, default=2, nullable=False)
    num_steps = Column(Integer, default=6, nullable=False)
    grid_json = Column(Text, nullable=False)  # JSON-encoded 2D grid matrix of gate symbols
    is_public = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="circuits")

    def __repr__(self):
        return f"<QuantumCircuit id={self.id} user={self.user_id} title='{self.title}'>"
