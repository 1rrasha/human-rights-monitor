from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CaseStatusHistory(Document):
    case_id: str  # Reference to the case_id in the cases collection
    status: str  # The new status (e.g., "new", "under_investigation", "archived")
    changed_by: str  # User ID who made the change
    change_note: Optional[str] = None  # Optional note explaining the change
    changed_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "case_status_history"
        indexes = ["case_id"]