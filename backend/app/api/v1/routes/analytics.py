from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics import get_violation_analytics, get_geodata_analytics, get_timeline_analytics, generate_report
from datetime import datetime
from typing import Optional
from io import BytesIO

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/violations", response_model=AnalyticsResponse)
async def get_violations(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    country: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None)
):
    return await get_violation_analytics(start_date, end_date, country, violation_type)

@router.get("/geodata", response_model=AnalyticsResponse)
async def get_geodata(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    country: Optional[str] = Query(None)
):
    return await get_geodata_analytics(start_date, end_date, country)

@router.get("/timeline", response_model=AnalyticsResponse)
async def get_timeline(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    country: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None)
):
    return await get_timeline_analytics(start_date, end_date, country, violation_type)

@router.get("/report")
async def generate_report_endpoint(
    report_type: str = Query(..., enum=["pdf", "excel"]),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    country: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None)
):
    report_data = await generate_report(report_type, start_date, end_date, country, violation_type)
    media_type = "application/pdf" if report_type == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    filename = f"violations_report.{report_type}"
    return StreamingResponse(
        BytesIO(report_data),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )