from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    PROJECT_NAME: str = "TuberCool"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000"]'
    FIRST_SUPERUSER_EMAIL: str = "admin@tbdiagnosis.ng"
    FIRST_SUPERUSER_PASSWORD: str = "Admin@123"

    @property
    def cors_origins(self) -> List[str]:
        return json.loads(self.BACKEND_CORS_ORIGINS)

    class Config:
        env_file = ".env"


settings = Settings()
