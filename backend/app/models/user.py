from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime
from typing import Literal

class User(Document):
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: str
    role: Literal["user", "admin", "case_worker"] = "user"  # Default role is "user"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email"]