from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Any
from bson import ObjectId
from pydantic_core import core_schema
from pydantic import GetCoreSchemaHandler

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
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    violation_types: Optional[List[str]] = None
    perpetrators: Optional[List[Perpetrator]] = None
    evidence: Optional[List[Evidence]] = None

class CaseOut(BaseModel):
    id: str = Field(..., alias="_id")
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

    @classmethod
    def from_document(cls, doc):
        """Convert from Document to Pydantic model"""
        doc_dict = doc.dict()
        doc_dict["_id"] = str(doc.id)
        return cls(**doc_dict)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}