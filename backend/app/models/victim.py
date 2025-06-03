# from beanie import Document, Indexed
# from pydantic import BaseModel, Field
# from typing import List, Optional
# from datetime import datetime
# from bson import ObjectId

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

# class Victim(Document):
#     type: str
#     anonymous: bool
#     demographics: Optional[Demographics] = None
#     contact_info: Optional[ContactInfo] = None
#     cases_involved: List[ObjectId] = []
#     risk_assessment: Optional[RiskAssessment] = None
#     support_services: List[SupportService] = []
#     created_at: datetime
#     updated_at: datetime

#     class Settings:
#         name = "individuals"
#         indexes = [
#             [("cases_involved", 1)],
#             [("risk_assessment.level", 1)]
#         ]