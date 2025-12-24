from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,                 # detects stale MySQL connections
    pool_size=settings.db_pool_size,    # like Sequelize pool.max
    max_overflow=settings.db_max_overflow,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_db_connection() -> None:
    # Similar to sequelize.authenticate()
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
