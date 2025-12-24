from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router
from app.db.session import test_db_connection
from app.db.session import get_db


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
        return {"db": "ok"}

    # Health check
    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    # API routes
    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
