from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Dict, Any
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

class ContactInfo(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    secure_messaging: Optional[str] = None

class Demographics(BaseModel):
    gender: Optional[str] = None
    age: Optional[int] = None
    ethnicity: Optional[str] = None
    occupation: Optional[str] = None

class RiskAssessment(BaseModel):
    level: str
    threats: List[str] = []
    protection_needed: bool = False

class SupportService(BaseModel):
    type: str
    provider: str
    status: str

class VictimCreate(BaseModel):
    type: str
    anonymous: bool = False
    pseudonym: Optional[str] = None
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None
    cases_involved: List[str] = []
    risk_assessment: Optional[RiskAssessment] = None
    support_services: List[SupportService] = []

class VictimUpdate(BaseModel):
    risk_assessment: Optional[RiskAssessment] = None
    support_services: Optional[List[SupportService]] = None
    contact_info: Optional[ContactInfo] = None
    cases_involved: Optional[List[str]] = None

class VictimOut(BaseModel):
    id: str = Field(..., alias="_id")
    type: str
    anonymous: bool
    pseudonym: Optional[str] = None
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None  # Explicitly optional
    cases_involved: List[str]
    risk_assessment: Optional[RiskAssessment] = None
    support_services: List[SupportService]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_document(cls, doc, include_sensitive: bool = False):
        doc_dict = doc.dict()
        doc_dict["_id"] = str(doc.id)
        if not include_sensitive:
            doc_dict["contact_info"] = None  # Set to None instead of removing
        return cls(**doc_dict)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}