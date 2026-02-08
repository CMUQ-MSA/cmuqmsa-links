from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    SECRET_KEY: str = "change-me"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./data/links.db"
    ADMIN_PASSWORD: str = "changeme123"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
