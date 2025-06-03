from fastapi import UploadFile, HTTPException
from app.models.incident_report import IncidentReport
from app.schemas.incident_report import IncidentReportCreate, IncidentReportResponse
from datetime import datetime
from bson import ObjectId
import os
import shutil
from typing import List, Optional

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class IncidentReportService:
    @staticmethod
    async def create_report(report: IncidentReportCreate) -> IncidentReportResponse:
        report_dict = report.dict()
        report_dict["report_id"] = f"IR-{datetime.now().year}-{str(ObjectId())[-4:]}"
        report_dict["status"] = "new"
        report_dict["created_at"] = datetime.utcnow()
        report_doc = IncidentReport(**report_dict)
        await report_doc.insert()
        return IncidentReportResponse.from_orm(report_doc)

    @staticmethod
    async def get_report(report_id: str) -> IncidentReportResponse:
        report = await IncidentReport.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return IncidentReportResponse.from_orm(report)

    @staticmethod
    async def list_reports(status: Optional[str] = None, violation_type: Optional[str] = None) -> List[IncidentReportResponse]:
        query = {}
        if status:
            query["status"] = status
        if violation_type:
            query["incident_details.violation_types"] = violation_type
        reports = await IncidentReport.find(query).to_list()
        return [IncidentReportResponse.from_orm(report) for report in reports]

    @staticmethod
    async def update_report(report_id: str, update: dict) -> IncidentReportResponse:
        report = await IncidentReport.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        update["updated_at"] = datetime.utcnow()
        await report.update({"$set": update})
        updated_report = await IncidentReport.get(report_id)
        return IncidentReportResponse.from_orm(updated_report)

    @staticmethod
    async def get_analytics() -> dict:
        pipeline = [
            {"$unwind": "$incident_details.violation_types"},
            {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        result = await IncidentReport.aggregate(pipeline).to_list()
        return {item["_id"]: item["count"] for item in result}

    @staticmethod
    async def upload_evidence(report_id: str, file: UploadFile) -> dict:
        report = await IncidentReport.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        file_ext = file.filename.split(".")[-1]
        file_name = f"{report_id}_{str(ObjectId())}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        evidence = {
            "type": file.content_type.split("/")[0],
            "url": f"/{UPLOAD_DIR}/{file_name}",
            "description": file.filename,
            "date_captured": datetime.utcnow()
        }
        await report.update({"$push": {"evidence": evidence}})
        return {"message": "Evidence uploaded", "url": evidence["url"]}