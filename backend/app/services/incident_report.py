from app.models.incident_report import IncidentReport, ReportEvidenceDocument
from app.schemas.incident_report import AssignedUser, IncidentReportCreate, IncidentReportUpdate, ReportAnalyticsOut, IncidentReportOut, ReportEvidence
from app.utils.file_handler import FileHandler
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie import PydanticObjectId
from beanie.operators import In, RegEx
import httpx

from app.models.user import User

async def geocode_location(location: dict) -> dict:
    async with httpx.AsyncClient() as client:
        query = f"{location.get('city', '')}, {location['country']}"
        response = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": query, "format": "json", "limit": 1}
        )
        if response.status_code == 200 and response.json():
            result = response.json()[0]
            return {
                "type": "Point",
                "coordinates": [float(result["lon"]), float(result["lat"])]
            }
    return None

async def create_incident_report(report: IncidentReportCreate, user_id: Optional[str] = None) -> IncidentReportOut:
    existing_report = await IncidentReport.find_one({"report_id": report.report_id})
    if existing_report:
        raise HTTPException(status_code=400, detail="Report ID already exists")

    valid_violation_types = ["discrimination", "violence", "harassment"]
    if not all(vt in valid_violation_types for vt in report.incident_details.violation_types):
        raise HTTPException(status_code=400, detail="Invalid violation type")

    if report.incident_details.location:
        coordinates = await geocode_location(report.incident_details.location.dict())
        if coordinates:
            report.incident_details.location.coordinates = coordinates

    report_data = report.model_dump(exclude={"evidence"})
    if user_id and not report.anonymous:
        report_data["created_by"] = user_id
        report_data["assigned_to"] = PydanticObjectId(user_id)
    report_data["created_at"] = datetime.utcnow()
    report_data["updated_at"] = datetime.utcnow()

    db_report = IncidentReport(**report_data)
    await db_report.insert()

    for evidence in report.evidence:
        evidence_doc = ReportEvidenceDocument(
            report_id=report.report_id,
            type=evidence.type,
            url=evidence.url,
            description=evidence.description,
            date_captured=evidence.date_captured
        )
        await evidence_doc.insert()

    evidence_docs = await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report.report_id).to_list()
    evidence = [ReportEvidence(
        type=doc.type,
        url=doc.url,
        description=doc.description,
        date_captured=doc.date_captured
    ) for doc in evidence_docs]

    assigned_user = None
    if db_report.assigned_to:
        user = await db_report.assigned_to.fetch()
        assigned_user = AssignedUser(
            id=str(user.id),
            name=user.full_name,
            email=user.email
        )

    # Prepare report_data, excluding assigned_to to avoid conflict
    report_data = db_report.dict(exclude={"assigned_to"})
    report_data["_id"] = str(db_report.id)  # Set _id for alias
    return IncidentReportOut(
        **report_data,
        evidence=evidence,
        assigned_to=assigned_user
    )

async def get_incident_report(report_id: str) -> IncidentReportOut:
    report = await IncidentReport.find_one(IncidentReport.report_id == report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    evidence_docs = await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report_id).to_list()
    evidence = [ReportEvidence(
        type=doc.type,
        url=doc.url,
        description=doc.description,
        date_captured=doc.date_captured
    ) for doc in evidence_docs]
    
    assigned_user = None
    if report.assigned_to:
        user = await report.assigned_to.fetch()
        assigned_user = AssignedUser(
            id=str(user.id),
            name=user.name,
            email=user.email
        )

    report_data = report.dict(exclude={"assigned_to"})
    report_data["_id"] = str(report.id)
    return IncidentReportOut(
        **report_data,
        evidence=evidence,
        assigned_to=assigned_user
    )
async def list_incident_reports(
    status: Optional[str] = None,
    location: Optional[str] = None,
    violation_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
) -> List[IncidentReportOut]:
    filters = []
    if status:
        filters.append(IncidentReport.status == status)
    if location:
        filters.append(RegEx(IncidentReport.incident_details.location.country, location, "i"))
    if violation_type:
        filters.append(In(IncidentReport.incident_details.violation_types, [violation_type]))

    query = IncidentReport.find(*filters) if filters else IncidentReport.find()
    reports = await query.sort(-IncidentReport.created_at).skip(skip).limit(limit).to_list()
    
    result = []
    for report in reports:
        evidence_docs = await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report.report_id).to_list()
        evidence = [ReportEvidence(
            type=doc.type,
            url=doc.url,
            description=doc.description,
            date_captured=doc.date_captured
        ) for doc in evidence_docs]
        
        assigned_user = None
        if report.assigned_to:
            user = await report.assigned_to.fetch()
            assigned_user = AssignedUser(
                id=str(user.id),
                name=user.full_name,
                email=user.email
            )

        report_data = report.dict(exclude={"assigned_to"})
        report_data["_id"] = str(report.id)
        result.append(IncidentReportOut(
            **report_data,
            evidence=evidence,
            assigned_to=assigned_user
        ))
    
    return result
async def update_incident_report(report_id: str, report_update: IncidentReportUpdate) -> IncidentReportOut:
    report = await IncidentReport.find_one(IncidentReport.report_id == report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    update_data = report_update.model_dump(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            if field == "incident_details":
                if value.location:
                    coordinates = await geocode_location(value.location.dict())
                    if coordinates:
                        value.location.coordinates = coordinates
                for subfield, subvalue in value.dict().items():
                    setattr(report.incident_details, subfield, subvalue)
            elif field == "evidence":
                old_evidence = await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report_id).to_list()
                for doc in old_evidence:
                    FileHandler.delete_file(doc.url)
                await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report_id).delete()
                
                for evidence in value:
                    evidence_doc = ReportEvidenceDocument(
                        report_id=report_id,
                        type=evidence.type,
                        url=evidence.url,
                        description=evidence.description,
                        date_captured=evidence.date_captured
                    )
                    await evidence_doc.insert()
            elif field == "assigned_to":
                if value:
                    report.assigned_to = PydanticObjectId(value)
                else:
                    report.assigned_to = None
            else:
                setattr(report, field, value)

        report.updated_at = datetime.utcnow()
        await report.save()

    evidence_docs = await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report_id).to_list()
    evidence = [ReportEvidence(
        type=doc.type,
        url=doc.url,
        description=doc.description,
        date_captured=doc.date_captured
    ) for doc in evidence_docs]
    
    assigned_user = None
    if report.assigned_to:
        user = await report.assigned_to.fetch()
        assigned_user = {
            "id": str(user.id),
            "name": user.name,
            "email": user.email
        }

    return IncidentReportOut(
        **report.dict(exclude={"_id"}),
        evidence=evidence,
        id=str(report.id),
        assigned_to=assigned_user
    )

async def get_report_analytics() -> List[ReportAnalyticsOut]:
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}, "created_at": {"$first": "$created_at"}}},
        {"$project": {"violation_type": "$_id", "count": 1, "created_at": 1, "_id": 0}},
        {"$sort": {"created_at": -1}}
    ]
    results = await IncidentReport.aggregate(pipeline).to_list()
    return [ReportAnalyticsOut(**result) for result in results]