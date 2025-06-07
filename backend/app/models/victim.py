from beanie import Document, Link
from pydantic import BaseModel, Field, EmailStr, constr
from datetime import datetime
from typing import List, Optional
from app.models.case import Case

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
    level: constr(pattern="^(low|medium|high)$")
    threats: List[str] = []
    protection_needed: bool = False

class VictimRiskAssessment(Document):
    victim_id: str
    level: str
    threats: List[str] = []
    protection_needed: bool = False
    assessed_at: datetime = Field(default_factory=datetime.utcnow)
    assessed_by: str

    class Settings:
        name = "victim_risk_assessments"
        indexes = ["victim_id"]
        
class SupportService(BaseModel):
    type: str
    provider: str
    status: str

class Victim(Document):
    type: str
    anonymous: bool = False
    pseudonym: Optional[str] = None
    demographics: Optional[Demographics] = None
    contact_info: Optional[ContactInfo] = None
    cases_involved: List[Link[Case]] = []
    risk_assessment: Optional[RiskAssessment] = None
    support_services: List[SupportService] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "victims"
        indexes = ["cases_involved"]