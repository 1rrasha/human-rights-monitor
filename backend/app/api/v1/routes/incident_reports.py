from fastapi import APIRouter, Depends, Query
from app.schemas.incident_report import IncidentReportCreate, IncidentReportOut, IncidentReportUpdate, ReportAnalyticsOut
from app.services.incident_report import create_incident_report, get_incident_report, list_incident_reports, update_incident_report, get_report_analytics
from app.models.user import User
from app.core.security import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/reports", tags=["Incident Reports"])

@router.post("/", response_model=IncidentReportOut)
async def submit_incident_report(
    report: IncidentReportCreate,
    current_user: Optional[User] = Depends(get_current_user, use_cache=False)
):
    user_id = str(current_user.id) if current_user and not report.anonymous else None
    db_report = await create_incident_report(report, user_id)
    return IncidentReportOut.from_document(db_report)

@router.get("/analytics", response_model=List[ReportAnalyticsOut])
async def get_incident_report_analytics():
    analytics = await get_report_analytics()
    return analytics

@router.get("/{report_id}", response_model=IncidentReportOut)
async def get_specific_incident_report(report_id: str):
    report = await get_incident_report(report_id)
    return IncidentReportOut.from_document(report)

@router.get("/", response_model=List[IncidentReportOut])
async def list_all_incident_reports(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    reports = await list_incident_reports(status, location, violation_type, skip, limit)
    return [IncidentReportOut.from_document(report) for report in reports]

@router.patch("/{report_id}", response_model=IncidentReportOut)
async def update_incident_report_status(
    report_id: str,
    report_update: IncidentReportUpdate,
    current_user: User = Depends(get_current_user)
):
    report = await update_incident_report(report_id, report_update)
    return IncidentReportOut.from_document(report)

