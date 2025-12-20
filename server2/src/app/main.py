from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="FastAPI Starter",
        version="0.1.0",
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

    # Health check
    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    # API routes
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
