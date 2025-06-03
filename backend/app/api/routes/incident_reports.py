# from fastapi import APIRouter, HTTPException, Depends
# from app.database import get_db
# from app.schemas.incident_report import IncidentReportCreate, IncidentReportResponse
# from bson import ObjectId
# from datetime import datetime

# router = APIRouter(prefix="/reports", tags=["Incident Reports"])

# @router.post("/", response_model=IncidentReportResponse)
# async def create_report(report: IncidentReportCreate, db=Depends(get_db)):
#     report_dict = report.dict()
#     report_dict["report_id"] = f"IR-{datetime.now().year}-{str(ObjectId())[-4:]}"
#     report_dict["status"] = "new"
#     report_dict["created_at"] = datetime.utcnow()
#     result = db.incident_reports.insert_one(report_dict)
#     report_dict["_id"] = result.inserted_id
#     return IncidentReportResponse(**report_dict)

# @router.get("/", response_model=List[IncidentReportResponse])
# async def list_reports(db=Depends(get_db)):
#     reports = db.incident_reports.find()
#     return [IncidentReportResponse(**report) for report in reports]

# @router.patch("/{report_id}", response_model=IncidentReportResponse)
# async def update_report(report_id: str, update: dict, db=Depends(get_db)):
#     update["updated_at"] = datetime.utcnow()
#     result = db.incident_reports.find_one_and_update(
#         {"_id": ObjectId(report_id)},
#         {"$set": update},
#         return_document=True
#     )
#     if not result:
#         raise HTTPException(status_code=404, detail="Report not found")
#     return IncidentReportResponse(**result)