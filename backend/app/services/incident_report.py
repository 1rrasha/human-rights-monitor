from app.models.incident_report import IncidentReport, ReportEvidenceDocument
from app.schemas.incident_report import IncidentReportCreate, IncidentReportUpdate, ReportAnalyticsOut
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie import PydanticObjectId
from beanie.operators import In, RegEx

async def create_incident_report(report: IncidentReportCreate, user_id: Optional[str] = None) -> IncidentReport:
    # Check if report ID already exists
    existing_report = await IncidentReport.find_one({"report_id": report.report_id})
    if existing_report:
        raise HTTPException(status_code=400, detail="Report ID already exists")

    # Prepare report data
    report_data = report.model_dump()
    if user_id and not report.anonymous:
        report_data["created_by"] = user_id
    report_data["created_at"] = datetime.utcnow()
    report_data["updated_at"] = datetime.utcnow()

    # Create and save the report
    db_report = IncidentReport(**report_data)
    await db_report.insert()

    # Save evidence to report_evidence collection
    for evidence in report.evidence:
        evidence_doc = ReportEvidenceDocument(
            report_id=report.report_id,
            type=evidence.type,
            url=evidence.url,
            description=evidence.description
        )
        await evidence_doc.insert()

    return db_report


async def get_incident_report(report_id: str) -> IncidentReport:
    report = await IncidentReport.find_one(IncidentReport.report_id == report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

async def list_incident_reports(
    status: Optional[str] = None,
    location: Optional[str] = None,
    violation_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
) -> List[IncidentReport]:
    filters = []
    if status:
        filters.append(IncidentReport.status == status)
    if location:
        filters.append(RegEx(IncidentReport.incident_details.location.country, location, "i"))
    if violation_type:
        filters.append(In(IncidentReport.incident_details.violation_types, [violation_type]))

    query = IncidentReport.find(*filters) if filters else IncidentReport.find()
    reports = await query.skip(skip).limit(limit).to_list()
    return reports

async def update_incident_report(report_id: str, report_update: IncidentReportUpdate) -> IncidentReport:
    report = await IncidentReport.find_one(IncidentReport.report_id == report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    update_data = report_update.model_dump(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            if field == "incident_details":
                for subfield, subvalue in value.items():
                    setattr(report.incident_details, subfield, subvalue)
            elif field == "evidence":
                report.evidence = value
                # Update report_evidence collection
                await ReportEvidenceDocument.find(ReportEvidenceDocument.report_id == report_id).delete()
                for evidence in value:
                    evidence_doc = ReportEvidenceDocument(
                        report_id=report_id,
                        type=evidence.type,
                        url=evidence.url,
                        description=evidence.description
                    )
                    await evidence_doc.insert()
            else:
                setattr(report, field, value)

        report.updated_at = datetime.utcnow()
        await report.save()

    return report

async def get_report_analytics() -> List[ReportAnalyticsOut]:
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}},
        {"$project": {"violation_type": "$_id", "count": 1, "_id": 0}}
    ]
    results = await IncidentReport.aggregate(pipeline).to_list()
    return [ReportAnalyticsOut(**result) for result in results]