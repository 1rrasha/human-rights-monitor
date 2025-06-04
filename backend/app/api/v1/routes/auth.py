from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserOut, Token
from app.services.user import create_user, authenticate_user
from app.core.security import create_access_token, get_current_user
from app.core.config import settings
from datetime import timedelta
from app.models.user import User

router = APIRouter(tags=["Auth"])

@router.post("/auth/signup", response_model=UserOut)
async def signup_user(user: UserCreate):
    db_user = await create_user(user)
    return db_user

@router.post("/auth/login_session", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserOut)
async def get_current_user_details(current_user: User = Depends(get_current_user)):
    return UserOut(
        _id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )