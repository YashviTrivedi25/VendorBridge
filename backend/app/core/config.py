from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "VendorBridge"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # JWT
    SECRET_KEY: str = "change-this-secret-key-before-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database — set in .env file
    # Format: postgresql+asyncpg://user:password@host:5432/dbname
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/vendorbridge"
    )

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
