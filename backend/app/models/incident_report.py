from beanie import Document, Link, PydanticObjectId
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Dict

from app.models.user import User

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
    date_captured: Optional[datetime] = None

class IncidentReport(Document):
    report_id: str = Field(..., unique=True)
    reporter_type: str
    anonymous: bool = False
    contact_info: Optional[ContactInfo] = None
    incident_details: IncidentDetails
    status: str = "new"
    assigned_to: Optional[Link[User]] = None  # Link to User model
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "incident_reports"
        indexes = ["report_id"]

class ReportEvidenceDocument(Document):
    report_id: str
    type: str
    url: str
    description: Optional[str] = None
    date_captured: Optional[datetime] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "report_evidence"
        indexes = ["report_id"]