from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from bson import ObjectId

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[Literal["user", "admin", "case_worker"]] = "user"  # Optional, defaults to "user"

class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    full_name: str
    role: str  # Include role in output
    is_active: bool
    created_at: datetime

    @validator("id", pre=True)
    def convert_objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None