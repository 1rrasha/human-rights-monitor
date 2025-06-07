from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics import get_violation_analytics, get_geodata_analytics, get_timeline_analytics, generate_report
from datetime import datetime
from typing import Optional
from io import BytesIO

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/violations", response_model=AnalyticsResponse)
async def get_violations(
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    country: Optional[str] = Query(None, description="Filter by country"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type")
):
    try:
        return await get_violation_analytics(start_date, end_date, country, violation_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch violation analytics: {str(e)}")

@router.get("/geodata", response_model=AnalyticsResponse)
async def get_geodata(
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    country: Optional[str] = Query(None, description="Filter by country")
):
    try:
        return await get_geodata_analytics(start_date, end_date, country)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch geodata analytics: {str(e)}")

@router.get("/timeline", response_model=AnalyticsResponse)
async def get_timeline(
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    country: Optional[str] = Query(None, description="Filter by country"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type")
):
    try:
        return await get_timeline_analytics(start_date, end_date, country, violation_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline analytics: {str(e)}")

@router.get("/report")
async def generate_report_endpoint(
    report_type: str = Query(..., enum=["pdf", "excel"], description="Report format"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering"),
    country: Optional[str] = Query(None, description="Filter by country"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type")
):
    try:
        report_data = await generate_report(report_type, start_date, end_date, country, violation_type)
        media_type = "application/pdf" if report_type == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        # Dynamic filename based on filters
        filename_parts = ["violations"]
        if start_date:
            filename_parts.append(start_date.strftime("%Y-%m-%d"))
        if end_date:
            filename_parts.append(end_date.strftime("%Y-%m-%d"))
        if country:
            filename_parts.append(country.replace(" ", "_"))
        if violation_type:
            filename_parts.append(violation_type.replace(" ", "_"))
        filename = f"{'_'.join(filename_parts)}.{report_type}"
        return StreamingResponse(
            BytesIO(report_data),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")