# from pydantic import BaseModel, Field
# from typing import List, Optional, Dict
# from datetime import datetime
# from bson import ObjectId
# from app.schemas.case import PyObjectId, Location, Evidence

# class ContactInfo(BaseModel):
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     preferred_contact: Optional[str] = None

# class IncidentDetails(BaseModel):
#     date: datetime
#     location: Location
#     description: str
#     violation_types: List[str]

# class IncidentReportCreate(BaseModel):
#     reporter_type: str
#     anonymous: bool
#     contact_info: Optional[ContactInfo] = None
#     incident_details: IncidentDetails
#     evidence: Optional[List[Evidence]] = None

# class IncidentReportResponse(BaseModel):
#     id: PyObjectId = Field(..., alias="_id")
#     report_id: str
#     reporter_type: str
#     anonymous: bool
#     contact_info: Optional[ContactInfo]
#     incident_details: IncidentDetails
#     evidence: List[Evidence]
#     status: str
#     assigned_to: Optional[str] = None
#     created_at: datetime

#     class Config:
#         arbitrary_types_allowed = True
#         json_encoders = {ObjectId: str}