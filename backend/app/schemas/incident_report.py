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
    preferred_contact: Optional[str] = None

class IncidentLocation(BaseModel):
    country: str
    city: Optional[str] = None
    coordinates: Optional[Dict] = None

class IncidentDetails(BaseModel):
    date: datetime
    location: IncidentLocation
    description: str
    violation_types: List[str]

class ReportEvidence(BaseModel):
    type: str
    url: str
    description: Optional[str] = None

class IncidentReportCreate(BaseModel):
    report_id: str
    reporter_type: str
    anonymous: bool = False
    contact_info: Optional[ContactInfo] = None
    incident_details: IncidentDetails
    evidence: List[ReportEvidence] = []

class IncidentReportUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    incident_details: Optional[IncidentDetails] = None
    evidence: Optional[List[ReportEvidence]] = None

class IncidentReportOut(BaseModel):
    id: str = Field(..., alias="_id")
    report_id: str
    reporter_type: str
    anonymous: bool
    contact_info: Optional[ContactInfo]
    incident_details: IncidentDetails
    evidence: List[ReportEvidence]
    status: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_document(cls, doc):
        doc_dict = doc.dict()
        doc_dict["_id"] = str(doc.id)
        return cls(**doc_dict)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReportAnalyticsOut(BaseModel):
    violation_type: str
    count: int