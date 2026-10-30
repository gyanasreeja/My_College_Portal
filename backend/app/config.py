from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/student_portal"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_minutes: int = 60
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    cors_origins: str = "http://localhost:5173"


settings = Settings()

