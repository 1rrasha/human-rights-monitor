from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import get_password_hash, verify_password
from fastapi import HTTPException

async def create_user(user: UserCreate) -> UserOut:
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role  # Set role from input, defaults to "user"
    )
    await db_user.insert()
    return UserOut(
        _id=str(db_user.id),
        email=db_user.email,
        full_name=db_user.full_name,
        role=db_user.role,
        is_active=db_user.is_active,
        created_at=db_user.created_at
    )

async def authenticate_user(email: str, password: str) -> User:
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user