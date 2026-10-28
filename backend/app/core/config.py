"""
QuantumLearn AI - Core Application Configuration
Loads environment variables using Pydantic Settings with validation and defaults.
"""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = Field(
        default="mysql+pymysql://quantum_user:quantum_secret_pass@localhost:3306/quantumlearn_db",
        description="SQLAlchemy database connection string"
    )
    USE_SQLITE_FALLBACK: bool = Field(
        default=False,
        description="Automatically fallback to SQLite if MySQL connection fails or for tests"
    )
    SQLITE_URL: str = "sqlite:///./quantumlearn.db"

    # Security & JWT
    JWT_SECRET_KEY: str = Field(
        default="quantumlearn_default_jwt_secret_key_for_development_purposes_only",
        description="Secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI Integration
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-3.8-flash", description="Gemini model identifier")
    INTERVIEW_AI_ENABLED: bool = Field(default=True, description="Enable live AI model generation for mock interviews")

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173",
        description="Allowed frontend origin URLs for CORS"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
