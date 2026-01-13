from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.address import router as address_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(address_router, prefix="/address", tags=["address"])
