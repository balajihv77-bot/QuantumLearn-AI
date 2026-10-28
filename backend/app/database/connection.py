"""
QuantumLearn AI - Database Engine and Session Factory
Configures SQLAlchemy with MySQL (or SQLite development fallback), connection pooling, and Base model.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for all SQLAlchemy declarative models
Base = declarative_base()

def get_engine():
    """
    Initializes SQLAlchemy database engine.
    Supports MySQL 8.0 via PyMySQL with connection pooling.
    Falls back to SQLite for zero-setup local dev/testing if configured or if MySQL is unreachable.
    """
    db_url = settings.DATABASE_URL
    connect_args = {}

    if settings.USE_SQLITE_FALLBACK or db_url.startswith("sqlite"):
        db_url = settings.SQLITE_URL
        connect_args = {"check_same_thread": False}
        return create_engine(
            db_url,
            connect_args=connect_args,
            echo=settings.DEBUG and False
        )

    # MySQL Engine with pool recycling and health pre-ping
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            connect_args=connect_args,
            echo=settings.DEBUG and False
        )
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(
            f"Failed to connect to MySQL database at {db_url}: {e}. "
            f"Falling back to local SQLite engine."
        )
        return create_engine(
            settings.SQLITE_URL,
            connect_args={"check_same_thread": False}
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a thread-local SQLAlchemy database session.
    Automatically closes session upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
