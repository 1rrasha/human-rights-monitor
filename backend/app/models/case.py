from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

# These should be BaseModel, not Document (they're embedded documents)
class Location(BaseModel):
    country: str
    region: Optional[str] = None
    coordinates: Optional[dict] = None  # GeoJSON Point: {"type": "Point", "coordinates": [lon, lat]}

class Evidence(BaseModel):
    type: str  # e.g., "photo", "video"
    url: str
    description: Optional[str] = None
    date_captured: Optional[datetime] = None

class Perpetrator(BaseModel):
    name: str
    type: str  # e.g., "military_unit", "individual"

# This should be a Document (main collection)
class Case(Document):
    case_id: str = Field(..., unique=True)  # e.g., "HRM-2023-0425"
    title: str
    description: str
    violation_types: List[str]
    status: str = "new"  # e.g., "new", "under_investigation", "resolved"
    priority: str = "medium"  # e.g., "low", "medium", "high"
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str] = []  # Changed from PydanticObjectId to str for simplicity
    perpetrators: List[Perpetrator] = []
    evidence: List[Evidence] = []
    created_by: str  # Changed from PydanticObjectId to str for simplicity
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "cases"
        indexes = ["case_id"]