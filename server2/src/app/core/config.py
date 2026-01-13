from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    """
    Application configuration.
    Mirrors Node config/index.js structure.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Environment
    env: str = "development"

    # Server
    port: int = 8000
    cors_origins: List[str] = ["http://localhost:5173"]

    # Database (MySQL)
    db_name: str = "akubata"
    db_user: str = "root"
    db_password: str = "rootroot"
    db_host: str = "localhost"
    db_port: int = 3306
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Auth
    jwt_secret: str = "supersecretkey"
    jwt_algorithm: str = "HS256"
    jwt_expires_in: str = "1d"  # matches Node config

    # Cookies
    cookie_name: str = "token"
    cookie_secure: bool = False
    cookie_samesite: str = "strict"

    # Email (parity with Node, used later)
    email_host: str = "smtp.gmail.com"
    email_port: int = 587
    email_user: str = "ttejuosho@aol.com"
    email_password: str = "hcmyptkawrbdvtxq"
    email_secure: bool = False
    email_from: str = "Akubata <" + email_user + ">"

    @property
    def database_url(self) -> str:
        """
        SQLAlchemy database URL.
        Using PyMySQL driver.
        """
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def normalize_origins(cls, v):
        if isinstance(v, str):
            return [origin.rstrip("/") for origin in v.split(",")]
        return [origin.rstrip("/") for origin in v]

    @field_validator("cookie_secure", mode="before")
    @classmethod
    def set_cookie_secure(cls, v, info):
        """
        Force secure cookies in production.
        """
        env = info.data.get("env", "development")
        return True if env == "production" else v


settings = Settings()
