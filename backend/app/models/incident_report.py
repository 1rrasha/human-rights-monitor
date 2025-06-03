# from beanie import Document, Indexed
# from pydantic import BaseModel, Field
# from typing import List, Optional, Dict
# from datetime import datetime
# from bson import ObjectId

# class ContactInfo(BaseModel):
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     preferred_contact: Optional[str] = None

# class IncidentDetails(BaseModel):
#     date: datetime
#     location: Location
#     description: str
#     violation_types: List[str]

# class IncidentReport(Document):
#     report_id: Indexed(str, unique=True)
#     reporter_type: str
#     anonymous: bool
#     contact_info: Optional[ContactInfo] = None
#     incident_details: IncidentDetails
#     evidence: List[Evidence] = []
#     status: str
#     assigned_to: Optional[ObjectId] = None
#     created_at: datetime

#     class Settings:
#         name = "incident_reports"
#         indexes = [
#             [("incident_details.location.coordinates", "2dsphere")],
#             [("status", 1)]
#         ]