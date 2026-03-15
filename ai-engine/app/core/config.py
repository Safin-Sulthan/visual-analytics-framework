from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_TTL: int = 3600
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
