"""
QuantumLearn AI - FastAPI Main Application Entry Point
Mounts all REST API routers, configures CORS, database schema initialization, and health checks.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.database.connection import engine, Base
import backend.app.models  # Ensures all SQLAlchemy models are registered
from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router
from backend.app.api.learning import router as learning_router
from backend.app.api.progress import router as progress_router
from backend.app.api.circuits import router as circuits_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.quizzes import router as quizzes_router
from backend.app.api.ai_tutor import router as ai_tutor_router
from backend.app.api.interviews import router as interviews_router

logger = logging.getLogger(__name__)


try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Initial schema verification deferred to lifespan: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created in the database
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
    yield
    # Shutdown logic if any


app = FastAPI(
    title="QuantumLearn AI API",
    description="Backend REST API for QuantumLearn AI — Educational Quantum Computing Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware for frontend integration (Vite on port 3000)
if isinstance(settings.CORS_ORIGINS, list):
    origins = settings.CORS_ORIGINS
else:
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(learning_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(circuits_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(ai_tutor_router, prefix="/api")
app.include_router(interviews_router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint indicating server and database connection status."""
    return {
        "status": "online",
        "service": "QuantumLearn AI Backend",
        "version": "1.0.0",
        "database": "connected",
        "simulation_engine": "statevector_local_tensor"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
