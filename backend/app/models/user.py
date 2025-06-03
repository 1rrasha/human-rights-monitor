from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime

class User(Document):
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email"]