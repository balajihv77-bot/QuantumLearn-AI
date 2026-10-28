"""
QuantumLearn AI - Learning Module Model
Stores structured quantum computing lessons, objectives, and interactive curriculum metadata.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(String(50), primary_key=True, index=True)  # e.g., 'mod-1', 'mod-2'
    module_number = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False, default="Fundamentals")
    level = Column(String(50), nullable=False, default="Beginner")
    duration_minutes = Column(Integer, default=25, nullable=False)
    description = Column(Text, nullable=False)
    beginner_explanation = Column(Text, nullable=True)
    content_json = Column(Text, nullable=True)  # JSON-encoded learning objectives, examples, interactive demos

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    progress_records = relationship("UserProgress", back_populates="module", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LearningModule id='{self.id}' number={self.module_number} title='{self.title}'>"
