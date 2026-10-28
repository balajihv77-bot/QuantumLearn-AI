"""
QuantumLearn AI - Authentication Service Layer
Handles user registration, authentication verification, and JWT issuance.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.schemas.auth import RegisterRequest, LoginRequest, Token
from backend.app.core.security import get_password_hash, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register_user(db: Session, req: RegisterRequest) -> Token:
        # Check if email is already registered
        existing_email = db.query(User).filter(User.email == req.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )

        # Check if username is already taken
        existing_username = db.query(User).filter(User.username == req.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken. Please choose another."
            )

        # Hash password securely with bcrypt
        hashed_pw = get_password_hash(req.password)

        new_user = User(
            email=req.email,
            username=req.username,
            hashed_password=hashed_pw,
            full_name=req.full_name or req.username,
            institution=req.institution or "Quantum Computing Student",
            role=req.role or "Student",
            xp=100,  # Registration bonus XP
            level=1,
            streak_days=1
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create JWT access token
        access_token = create_access_token(
            data={"sub": str(new_user.id), "email": new_user.email, "username": new_user.username}
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=new_user.id,
            username=new_user.username,
            email=new_user.email
        )

    @staticmethod
    def authenticate_user(db: Session, req: LoginRequest) -> Token:
        identifier = req.username_or_email or req.email
        if not identifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username is required."
            )

        user = db.query(User).filter(
            (User.email == identifier) | (User.username == identifier)
        ).first()

        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. Please verify your email/username and password.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "username": user.username}
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username,
            email=user.email
        )
