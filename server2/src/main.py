from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router
from app.api.routes.auth import router as auth_router
from app.api.routes.address import router as address_router
from app.db.session import test_db_connection
from app.db.session import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import Depends
import sys


def create_app() -> FastAPI:
    app = FastAPI(
        title="Akubata Server",
        version="1.0.0",
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS: allow your React dev server(s)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        test_db_connection()

    @app.get("/db-check")
    def db_check(db: Session = Depends(get_db)) -> dict:
        db.execute(text("SELECT 1"))
        return {"db": "online"}

    # Health check
    @app.get("/health")
    def health() -> dict:
        return {"status": "Ok"}
    
    @app.get("/python-version")
    def python_version():
        return {"python_version": sys.version}

    # API routes
    app.include_router(api_router, prefix="/api")
    app.include_router(auth_router, prefix="/auth")
    app.include_router(address_router, prefix="/address")

    return app


app = create_app()
