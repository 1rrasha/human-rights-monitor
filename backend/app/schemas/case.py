from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Any, Dict
from bson import ObjectId
from pydantic_core import core_schema
from pydantic import GetCoreSchemaHandler
from app.models.case import Case

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler) -> core_schema.CoreSchema:
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(cls.validate),
            ],
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class Location(BaseModel):
    country: str
    region: Optional[str] = None
    coordinates: Optional[dict] = None

class Evidence(BaseModel):
    type: str
    url: str
    description: Optional[str] = None
    date_captured: Optional[datetime] = None

class Perpetrator(BaseModel):
    name: str
    type: str

class UserInfo(BaseModel):
    user_id: str
    full_name: str
    email: EmailStr

class CaseCreate(BaseModel):
    case_id: str
    title: str
    description: str
    violation_types: List[str]
    status: str = "new"
    priority: str = "medium"
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str] = []
    perpetrators: List[Perpetrator] = []
    evidence: List[Evidence] = []

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    violation_types: Optional[List[str]] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    location: Optional[Dict[str, Any]] = None  # Flexible to handle coordinates
    date_occurred: Optional[datetime] = None
    date_reported: Optional[datetime] = None
    victims: Optional[List[str]] = None
    perpetrators: Optional[List[Dict[str, str]]] = None
    evidence: Optional[List[Dict[str, Any]]] = None

class CaseOut(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    case_id: str
    title: str
    description: str
    violation_types: List[str]
    status: str
    priority: str
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str]
    perpetrators: List[Perpetrator]
    evidence: List[Evidence]
    created_by: str
    created_at: datetime
    updated_at: datetime
    created_by_user: UserInfo

    @classmethod
    def from_document(cls, doc: Case | Dict) -> "CaseOut":
        """Convert from Document or dict to Pydantic model"""
        if isinstance(doc, dict):
            doc_dict = doc
        else:
            doc_dict = doc.dict()
            doc_dict["_id"] = str(doc.id)
        return cls(**doc_dict)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
            PyObjectId: str
        }