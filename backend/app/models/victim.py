from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Dict
from bson import ObjectId

class ContactInfo(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    secure_messaging: Optional[str] = None  # e.g., "signal", "telegram"

class Demographics(BaseModel):
    gender: Optional[str] = None
    age: Optional[int] = None
    ethnicity: Optional[str] = None
    occupation: Optional[str] = None

class RiskAssessment(BaseModel):
    level: str  # e.g., "low", "medium", "high"
    threats: List[str] = []  # e.g., ["intimidation", "surveillance"]
    protection_needed: bool = False

class SupportService(BaseModel):
    type: str  # e.g., "legal", "medical"
    provider: str
    status: str  # e.g., "active", "completed"

class Victim(Document):
    type: str  # e.g., "victim", "witness"
    anonymous: bool = False
    pseudonym: Optional[str] = None  # Used if anonymous=True
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None  # Marked for encryption
    cases_involved: List[str] = []  # References Case.case_id
    risk_assessment: Optional[RiskAssessment] = None
    support_services: List[SupportService] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "victims"
        indexes = ["cases_involved"]

class VictimRiskAssessment(Document):
    victim_id: str  # References Victim.id
    level: str
    threats: List[str] = []
    protection_needed: bool = False
    assessed_at: datetime = Field(default_factory=datetime.utcnow)
    assessed_by: str  # References User.id

    class Settings:
        name = "victim_risk_assessments"
        indexes = ["victim_id"]