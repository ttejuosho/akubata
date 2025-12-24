from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"
    port: int = 8000
    cors_origin: str = "http://localhost:5173"

    # DB pieces (mirror your Node config.db)
    db_name: str = "akubata"
    db_user: str = "postgres"
    db_password: str = "root"
    db_host: str = "localhost"
    db_port: int = 3306
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Auth
    jwt_secret: str = "supersecretkey"
    jwt_algorithm: str = "HS256"
    jwt_expires_in_minutes: int = 1440  # 1 day

    cookie_secure: bool = False  # set True in production
    cookie_samesite: str = "strict"
    cookie_name: str = "token"

    @property
    def database_url(self) -> str:
        # Use one driver. Choose ONE:
        return f"mysql+mysqldb://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        
    @field_validator("cors_origin")
    @classmethod
    def normalize_origin(cls, v: str) -> str:
        return v.rstrip("/")


settings = Settings()
