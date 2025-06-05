from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from bson import ObjectId


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
class Case(Document):
    case_id: str = Field(..., unique=True) 
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
    created_by: str 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "cases"
        indexes = ["case_id"]