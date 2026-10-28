"""
QuantumLearn AI - Authentication API Endpoints
POST /api/auth/register - Register new student account
POST /api/auth/login    - Authenticate student and issue JWT Bearer token
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.auth import RegisterRequest, LoginRequest, Token
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account"
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user account with hashed password and returns an access token."""
    return AuthService.register_user(db, req)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Login and acquire JWT Bearer token"
)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates credentials against bcrypt hash and issues JWT access token."""
    return AuthService.authenticate_user(db, req)
