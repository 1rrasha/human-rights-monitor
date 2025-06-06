import random
from fastapi import APIRouter, Depends, Form, Query, HTTPException, UploadFile, File
from app.schemas.incident_report import IncidentReportCreate, IncidentReportOut, IncidentReportUpdate, ReportAnalyticsOut, ReportEvidence
from app.services.incident_report import create_incident_report, get_incident_report, list_incident_reports, update_incident_report, get_report_analytics
from app.models.user import User
from app.core.security import get_current_user
from app.utils.file_handler import FileHandler
from typing import List, Optional
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Incident Reports"])

def generate_case_id():
    first_part = random.randint(100, 999)
    second_part = random.randint(1000, 9999)
    return f"IR-{first_part}-{second_part}"


@router.post("/", response_model=IncidentReportOut)
async def submit_incident_report(
    report: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    current_user: Optional[User] = Depends(get_current_user, use_cache=False)
):
    logger.info(f"Received report: {report}")
    logger.info(f"Received files: {[file.filename for file in files] if files else 'No files'}")

    try:
        report_data = json.loads(report)
    except json.JSONDecodeError:
        logger.error("Invalid JSON in report field")
        raise HTTPException(status_code=400, detail="Invalid JSON in report field")

    report_id = generate_case_id()
    logger.info(f"Generated report_id: {report_id}")

    report_data["report_id"] = report_id

    try:
        report_obj = IncidentReportCreate(**report_data)
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

    if report_obj.anonymous and report_obj.contact_info:
        raise HTTPException(status_code=400, detail="Contact info must be empty for anonymous reports")

    evidence = []
    if files:
        for file in files:
            file_metadata = await FileHandler.upload_file(file, report_id)
            evidence.append(ReportEvidence(**file_metadata))
    
    report_obj.evidence = evidence
    user_id = str(current_user.id) if current_user else None
    db_report = await create_incident_report(report_obj, user_id)
    return db_report

@router.get("/analytics", response_model=List[ReportAnalyticsOut])
async def get_incident_report_analytics():
    analytics = await get_report_analytics()
    return analytics

@router.get("/{report_id}", response_model=IncidentReportOut)
async def get_specific_incident_report(report_id: str):
    report = await get_incident_report(report_id)
    return report

@router.get("/", response_model=List[IncidentReportOut])
async def list_all_incident_reports(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    reports = await list_incident_reports(status, location, violation_type, skip, limit)
    return reports

@router.patch("/{report_id}", response_model=IncidentReportOut)
async def update_incident_report_status(
    report_id: str,
    report: str = Form(...),  # Expect a JSON string in the 'report' field
    files: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Received report: {report}")
    logger.info(f"Received files: {[file.filename for file in files] if files else 'No files'}")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update reports")

    # Parse the JSON string from the 'report' field
    try:
        report_data = json.loads(report)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in report field: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Invalid JSON in report field: {str(e)}. Please ensure the report is a valid JSON string."
        )

    # Validate the parsed JSON against IncidentReportUpdate schema
    try:
        report_update = IncidentReportUpdate(**report_data)
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

    # Handle evidence: Combine existing evidence (if any) with new files
    new_evidence = report_update.evidence or []
    for file in files:
        try:
            file_metadata = await FileHandler.upload_file(file, report_id)
            new_evidence.append(ReportEvidence(**file_metadata))
        except Exception as e:
            logger.error(f"Failed to upload file {file.filename}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to upload file {file.filename}: {str(e)}")

    if new_evidence:
        report_update.evidence = new_evidence

    # Update the report
    report = await update_incident_report(report_id, report_update)
    return report