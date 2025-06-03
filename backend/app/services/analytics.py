from app.models.case import Case
from app.models.incident_report import IncidentReport
from app.schemas.analytics import ViolationCount, GeoDataPoint, TimelinePoint, AnalyticsResponse
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie.operators import RegEx, In
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
import base64
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def get_violation_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> AnalyticsResponse:
    # Build match stage for filters
    match_stage = {}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        match_stage["$or"] = [
            {"date_reported": date_filter},
            {"incident_details.date": date_filter}
        ]
    if country:
        match_stage["$or"] = match_stage.get("$or", []) + [
            {"location.country": RegEx(country, "i")},
            {"incident_details.location.country": RegEx(country, "i")}
        ]
    if violation_type:
        match_stage["$or"] = match_stage.get("$or", []) + [
            {"violation_types": violation_type},
            {"incident_details.violation_types": violation_type}
        ]

    # Aggregation pipeline for cases and reports
    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})
    pipeline.extend([
        {"$project": {
            "violation_types": {
                "$ifNull": ["$violation_types", "$incident_details.violation_types"]
            }
        }},
        {"$unwind": "$violation_types"},
        {"$group": {"_id": "$violation_types", "count": {"$sum": 1}}},
        {"$project": {"violation_type": "$_id", "count": 1, "_id": 0}}
    ])

    # Run aggregation on both collections
    cases_result = await Case.aggregate(pipeline).to_list()
    reports_result = await IncidentReport.aggregate(pipeline).to_list()
    logger.debug(f"Cases result: {cases_result}")
    logger.debug(f"Reports result: {reports_result}")

    # Combine results
    violation_counts = {}
    for item in cases_result + reports_result:
        vt = item["violation_type"]
        violation_counts[vt] = violation_counts.get(vt, 0) + item["count"]

    data = [ViolationCount(violation_type=k, count=v) for k, v in violation_counts.items()]
    logger.debug(f"Violation data: {data}")

    # Generate Plotly bar chart
    if data:
        df = pd.DataFrame([d.dict() for d in data])
        logger.debug(f"Violations DataFrame columns: {df.columns}")
        fig = px.bar(df, x="violation_type", y="count", title="Violations by Type")
        chart_spec = json.loads(fig.to_json())
    else:
        chart_spec = {
            "data": [],
            "layout": {"title": {"text": "Violations by Type"}, "xaxis": {"title": "Violation Type"}, "yaxis": {"title": "Count"}}
        }

    return AnalyticsResponse(data=data, chart_spec=chart_spec)

async def get_geodata_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None
) -> AnalyticsResponse:
    match_stage = {}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        match_stage["$or"] = [
            {"date_reported": date_filter},
            {"incident_details.date": date_filter}
        ]
    if country:
        match_stage["$or"] = match_stage.get("$or", []) + [
            {"location.country": RegEx(country, "i")},
            {"incident_details.location.country": RegEx(country, "i")}
        ]

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})
    pipeline.extend([
        {"$project": {
            "country": {
                "$ifNull": ["$location.country", "$incident_details.location.country"]
            },
            "coordinates": {
                "$ifNull": ["$location.coordinates", "$incident_details.location.coordinates"]
            }
        }},
        {"$group": {"_id": "$country", "count": {"$sum": 1}, "coordinates": {"$first": "$coordinates"}}},
        {"$project": {"country": "$_id", "count": 1, "coordinates": 1, "_id": 0}}
    ])

    cases_result = await Case.aggregate(pipeline).to_list()
    reports_result = await IncidentReport.aggregate(pipeline).to_list()
    logger.debug(f"Geodata cases result: {cases_result}")
    logger.debug(f"Geodata reports result: {reports_result}")

    geo_counts = {}
    for item in cases_result + reports_result:
        country = item["country"]
        if country not in geo_counts:
            geo_counts[country] = {"count": 0, "coordinates": item.get("coordinates")}
        geo_counts[country]["count"] += item["count"]

    data = [GeoDataPoint(country=k, count=v["count"], coordinates=v["coordinates"]) for k, v in geo_counts.items()]
    logger.debug(f"Geodata: {data}")

    # Generate Plotly scatter map
    if data:
        df = pd.DataFrame([d.dict() for d in data])
        logger.debug(f"Geodata DataFrame columns: {df.columns}")
        fig = px.scatter_geo(
            df,
            locations="country",
            locationmode="country names",
            size="count",
            title="Violations by Country",
            projection="natural earth"
        )
        chart_spec = json.loads(fig.to_json())
    else:
        chart_spec = {
            "data": [],
            "layout": {
                "title": {"text": "Violations by Country"},
                "geo": {"projection": {"type": "natural earth"}}
            }
        }

    return AnalyticsResponse(data=data, chart_spec=chart_spec)

async def get_timeline_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> AnalyticsResponse:
    match_stage = {}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        match_stage["$or"] = [
            {"date_reported": date_filter},
            {"incident_details.date": date_filter}
        ]
    if country:
        match_stage["$or"] = match_stage.get("$or", []) + [
            {"location.country": RegEx(country, "i")},
            {"incident_details.location.country": RegEx(country, "i")}
        ]
    if violation_type:
        match_stage["$or"] = match_stage.get("$or", []) + [
            {"violation_types": violation_type},
            {"incident_details.violation_types": violation_type}
        ]

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})
    pipeline.extend([
        {"$project": {
            "date": {
                "$ifNull": ["$date_reported", "$incident_details.date"]
            }
        }},
        {"$group": {
            "_id": {
                "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
            },
            "count": {"$sum": 1}
        }},
        {"$project": {"date": "$_id", "count": 1, "_id": 0}},
        {"$sort": {"date": 1}}
    ])

    cases_result = await Case.aggregate(pipeline).to_list()
    reports_result = await IncidentReport.aggregate(pipeline).to_list()
    logger.debug(f"Timeline cases result: {cases_result}")
    logger.debug(f"Timeline reports result: {reports_result}")

    timeline_counts = {}
    for item in cases_result + reports_result:
        date = item["date"]
        timeline_counts[date] = timeline_counts.get(date, 0) + item["count"]

    data = [TimelinePoint(date=datetime.strptime(k, "%Y-%m-%d"), count=v) for k, v in timeline_counts.items()]
    logger.debug(f"Timeline data: {data}")

    # Generate Plotly line chart
    if data:
        df = pd.DataFrame([{"date": d.date, "count": d.count} for d in data])
        logger.debug(f"Timeline DataFrame columns: {df.columns}")
        fig = px.line(df, x="date", y="count", title="Violations Over Time")
        chart_spec = json.loads(fig.to_json())
    else:
        chart_spec = {
            "data": [],
            "layout": {"title": {"text": "Violations Over Time"}, "xaxis": {"title": "Date"}, "yaxis": {"title": "Count"}}
        }

    return AnalyticsResponse(data=data, chart_spec=chart_spec)

async def generate_report(
    report_type: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> bytes:
    # Get data from analytics endpoints
    violations = await get_violation_analytics(start_date, end_date, country, violation_type)
    geodata = await get_geodata_analytics(start_date, end_date, country)
    timeline = await get_timeline_analytics(start_date, end_date, country, violation_type)

    if report_type == "pdf":
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph("Human Rights Violations Report", styles["Title"]))

        # Violations Table
        violation_data = [["Violation Type", "Count"]] + [[d.violation_type, d.count] for d in violations.data]
        table = Table(violation_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("GRID", (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)

        # Save chart as image
        fig = go.Figure(violations.chart_spec)
        img_buffer = BytesIO()
        fig.write_image(img_buffer, format="png")
        img_buffer.seek(0)
        elements.append(Image(img_buffer, width=400, height=200))

        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    elif report_type == "excel":
        df_violations = pd.DataFrame([d.dict() for d in violations.data])
        df_geodata = pd.DataFrame([d.dict() for d in geodata.data])
        df_timeline = pd.DataFrame([{"date": d.date, "count": d.count} for d in timeline.data])

        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df_violations.to_excel(writer, sheet_name="Violations", index=False)
            df_geodata.to_excel(writer, sheet_name="Geodata", index=False)
            df_timeline.to_excel(writer, sheet_name="Timeline", index=False)
        excel = buffer.getvalue()
        buffer.close()
        return excel

    else:
        raise HTTPException(status_code=400, detail="Invalid report type")