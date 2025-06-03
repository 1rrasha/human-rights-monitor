# from pydantic import BaseModel, Field
# from typing import List, Optional, Dict
# from datetime import datetime
# from bson import ObjectId
# from app.schemas.case import PyObjectId, ContactInfo

# class Demographics(BaseModel):
#     gender: Optional[str] = None
#     age: Optional[int] = None
#     ethnicity: Optional[str] = None
#     occupation: Optional[str] = None

# class RiskAssessment(BaseModel):
#     level: str
#     threats: List[str]
#     protection_needed: bool

# class SupportService(BaseModel):
#     type: str
#     provider: str
#     status: str

# class VictimCreate(BaseModel):
#     type: str
#     anonymous: bool
#     demographics: Optional[Demographics] = None
#     contact_info: Optional[ContactInfo] = None
#     cases_involved: Optional[List[str]] = None
#     risk_assessment: Optional[RiskAssessment] = None
#     support_services: Optional[List[SupportService]] = None

# class VictimResponse(BaseModel):
#     id: PyObjectId = Field(..., alias="_id")
#     type: str
#     anonymous: bool
#     demographics: Optional[Demographics]
#     contact_info: Optional[ContactInfo]
#     cases_involved: List[str]
#     risk_assessment: Optional[RiskAssessment]
#     support_services: List[SupportService]
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         arbitrary_types_allowed = True
#         json_encoders = {ObjectId: str}