from fastapi import APIRouter

from app.api.deps import CurrentUserDep
from app.schemas.user import UserPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUserDep) -> UserPublic:
    return current_user
