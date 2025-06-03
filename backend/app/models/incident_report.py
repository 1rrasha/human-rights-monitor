from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Dict
from bson import ObjectId

class ContactInfo(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_contact: Optional[str] = None  # e.g., "email", "phone"

class IncidentLocation(BaseModel):
    country: str
    city: Optional[str] = None
    coordinates: Optional[Dict] = None  # GeoJSON Point: {"type": "Point", "coordinates": [lon, lat]}

class IncidentDetails(BaseModel):
    date: datetime
    location: IncidentLocation
    description: str
    violation_types: List[str]

class ReportEvidence(BaseModel):
    type: str  # e.g., "video", "photo", "document"
    url: str
    description: Optional[str] = None

class IncidentReport(Document):
    report_id: str = Field(..., unique=True)  # e.g., "IR-2023-0789"
    reporter_type: str  # e.g., "victim", "witness"
    anonymous: bool = False
    contact_info: Optional[ContactInfo] = None
    incident_details: IncidentDetails
    evidence: List[ReportEvidence] = []
    status: str = "new"  # e.g., "new", "under_review", "closed"
    assigned_to: Optional[str] = None  # PydanticObjectId to str for simplicity
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "incident_reports"
        indexes = ["report_id"]

class ReportEvidenceDocument(Document):
    report_id: str  # References IncidentReport.report_id
    type: str
    url: str
    description: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "report_evidence"
        indexes = ["report_id"]