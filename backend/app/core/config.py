from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./datastraw_crm.db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()