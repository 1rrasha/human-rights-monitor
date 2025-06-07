from app.models.case import Case
from app.models.incident_report import IncidentReport
from app.schemas.analytics import ViolationCount, GeoDataPoint, TimelinePoint, AnalyticsResponse
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
from beanie.operators import RegEx
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import io
import base64
import json
import logging

# LaTeX dependencies for PDF generation
from datetime import datetime

async def get_violation_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> AnalyticsResponse:
    try:
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

        # Unified pipeline with $unionWith
        union_with_pipeline = [
            {
                "$project": {
                    "violation_types": {
                        "$cond": [
                            {"$isArray": "$incident_details.violation_types"},
                            "$incident_details.violation_types",
                            []
                        ]
                    },
                    "date_reported": "$incident_details.date",
                    "location": "$incident_details.location"
                }
            }
        ]
        if match_stage:
            union_with_pipeline.insert(0, {"$match": match_stage})

        pipeline = [
            {
                "$unionWith": {
                    "coll": "incident_reports",
                    "pipeline": union_with_pipeline
                }
            }
        ]
        if match_stage:
            pipeline.append({"$match": match_stage})
        pipeline.extend([
            {
                "$project": {
                    "violation_types": {
                        "$cond": [
                            {"$isArray": "$violation_types"},
                            "$violation_types",
                            []
                        ]
                    }
                }
            },
            {"$unwind": {"path": "$violation_types", "preserveNullAndEmptyArrays": True}},
            {"$match": {"violation_types": {"$ne": None}}},
            {"$group": {"_id": "$violation_types", "count": {"$sum": 1}}},
            {"$project": {"violation_type": "$_id", "count": 1, "_id": 0}},
            {"$sort": {"count": -1}}
        ])

        # Log the pipeline for debugging
        logging.debug(f"Violation analytics pipeline: {json.dumps(pipeline, default=str)}")

        result = await Case.aggregate(pipeline).to_list()

        data = [ViolationCount(violation_type=item["violation_type"], count=item["count"]) for item in result]

        # Generate Plotly bar chart
        chart_spec = {}
        if data:
            df = pd.DataFrame([d.dict() for d in data])
            fig = px.bar(
                df,
                x="violation_type",
                y="count",
                title="Violations by Type",
                labels={"violation_type": "Violation Type", "count": "Count"},
                color="count",
                color_continuous_scale="Blues"
            )
            fig.update_layout(showlegend=False)
            chart_spec = json.loads(fig.to_json())
        else:
            chart_spec = {
                "data": [],
                "layout": {
                    "title": {"text": "Violations by Type"},
                    "xaxis": {"title": "Violation Type"},
                    "yaxis": {"title": "Count"},
                    "showlegend": False
                }
            }

        return AnalyticsResponse(data=data, chart_spec=chart_spec)
    except Exception as e:
        logging.error(f"Error in get_violation_analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process violation analytics: {str(e)}")

async def get_geodata_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None
) -> AnalyticsResponse:
    try:
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

        # Unified pipeline with $unionWith
        union_with_pipeline = [
            {
                "$project": {
                    "location": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$incident_details.location", None]},
                                {"$ne": ["$incident_details.location.country", None]}
                            ]},
                            "$incident_details.location",
                            {}
                        ]
                    },
                    "date_reported": "$incident_details.date"
                }
            }
        ]
        if match_stage:
            union_with_pipeline.insert(0, {"$match": match_stage})

        pipeline = [
            {
                "$unionWith": {
                    "coll": "incident_reports",
                    "pipeline": union_with_pipeline
                }
            }
        ]
        if match_stage:
            pipeline.append({"$match": match_stage})
        pipeline.extend([
            {
                "$project": {
                    "country": {
                        "$ifNull": ["$location.country", None]
                    },
                    "coordinates": {
                        "$ifNull": ["$location.coordinates", None]
                    }
                }
            },
            {"$match": {"country": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$country",
                    "count": {"$sum": 1},
                    "coordinates": {
                        "$first": {
                            "$cond": [
                                {"$and": [
                                    {"$ne": ["$coordinates", None]},
                                    {"$ne": ["$coordinates.lat", None]},
                                    {"$ne": ["$coordinates.lon", None]}
                                ]},
                                "$coordinates",
                                None
                            ]
                        }
                    }
                }
            },
            {"$project": {
                "country": "$_id",
                "count": 1,
                "coordinates": 1,
                "_id": 0
            }},
            {"$sort": {"count": -1}}
        ])

        # Log the pipeline for debugging
        logging.debug(f"Geodata analytics pipeline: {json.dumps(pipeline, default=str)}")

        result = await Case.aggregate(pipeline).to_list()

        # Log raw coordinates for debugging
        for item in result:
            logging.debug(f"Geodata item: {item}")

        data = [
            GeoDataPoint(
                country=item["country"],
                count=item["count"],
                coordinates=item["coordinates"]
            ) for item in result
        ]

        # Generate Plotly scatter map
        chart_spec = {}
        if data:
            df = pd.DataFrame([
                {
                    "country": d.country,
                    "count": d.count,
                    "lat": d.coordinates.get("lat") if d.coordinates else None,
                    "lon": d.coordinates.get("lon") if d.coordinates else None
                } for d in data
            ])
            df = df.dropna(subset=["lat", "lon"])  # Drop entries with missing coordinates
            if not df.empty:
                fig = px.scatter_geo(
                    df,
                    lat="lat",
                    lon="lon",
                    size="count",
                    hover_name="country",
                    title="Violations by Country",
                    projection="natural earth",
                    color="count",
                    color_continuous_scale="Reds"
                )
                fig.update_layout(showlegend=False)
                chart_spec = json.loads(fig.to_json())
            else:
                chart_spec = {
                    "data": [],
                    "layout": {
                        "title": {"text": "Violations by Country"},
                        "geo": {"projection": {"type": "natural earth"}},
                        "showlegend": False
                    }
                }
        else:
            chart_spec = {
                "data": [],
                "layout": {
                    "title": {"text": "Violations by Country"},
                    "geo": {"projection": {"type": "natural earth"}},
                    "showlegend": False
                }
            }

        return AnalyticsResponse(data=data, chart_spec=chart_spec)
    except Exception as e:
        logging.error(f"Error in get_geodata_analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process geodata analytics: {str(e)}")

async def get_timeline_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> AnalyticsResponse:
    try:
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

        # Unified pipeline with $unionWith
        union_with_pipeline = [
            {
                "$project": {
                    "date_reported": "$incident_details.date",
                    "violation_types": "$incident_details.violation_types",
                    "location": "$incident_details.location"
                }
            }
        ]
        if match_stage:
            union_with_pipeline.insert(0, {"$match": match_stage})

        pipeline = [
            {
                "$unionWith": {
                    "coll": "incident_reports",
                    "pipeline": union_with_pipeline
                }
            }
        ]
        if match_stage:
            pipeline.append({"$match": match_stage})
        pipeline.extend([
            {
                "$project": {
                    "date": {
                        "$ifNull": ["$date_reported", "$incident_details.date", None]
                    }
                }
            },
            {"$match": {"date": {"$ne": None}}},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$project": {"date": "$_id", "count": 1, "_id": 0}},
            {"$sort": {"date": 1}}
        ])

        # Log the pipeline for debugging
        logging.debug(f"Timeline analytics pipeline: {json.dumps(pipeline, default=str)}")

        result = await Case.aggregate(pipeline).to_list()

        # Log raw results for debugging
        logging.debug(f"Timeline results: {result}")

        data = [
            TimelinePoint(date=datetime.strptime(item["date"], "%Y-%m-%d"), count=item["count"])
            for item in result
        ]

        # Generate Plotly line chart
        chart_spec = {}
        if data:
            df = pd.DataFrame([{"date": d.date, "count": d.count} for d in data])
            fig = px.line(
                df,
                x="date",
                y="count",
                title="Violations Over Time",
                labels={"date": "Date", "count": "Count"},
                markers=True,
                line_shape="spline"
            )
            fig.update_traces(line_color="#1f77b4")
            chart_spec = json.loads(fig.to_json())
        else:
            chart_spec = {
                "data": [],
                "layout": {
                    "title": {"text": "Violations Over Time"},
                    "xaxis": {"title": "Date"},
                    "yaxis": {"title": "Count"},
                    "showlegend": False
                }
            }

        return AnalyticsResponse(data=data, chart_spec=chart_spec)
    except Exception as e:
        logging.error(f"Error in get_timeline_analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process timeline analytics: {str(e)}")
async def generate_report(
    report_type: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    country: Optional[str] = None,
    violation_type: Optional[str] = None
) -> bytes:
    try:
        # Fetch data from analytics endpoints
        violations = await get_violation_analytics(start_date, end_date, country, violation_type)
        geodata = await get_geodata_analytics(start_date, end_date, country)
        timeline = await get_timeline_analytics(start_date, end_date, country, violation_type)

        if report_type == "pdf":
            # Generate LaTeX-based PDF
            buffer = io.BytesIO()
            latex_content = generate_latex_report(violations, geodata, timeline, start_date, end_date, country, violation_type)
            # Note: LaTeX compilation is handled by latexmk in the backend
            buffer.write(latex_content.encode("utf-8"))
            pdf = buffer.getvalue()
            buffer.close()
            return pdf

        elif report_type == "excel":
            # Generate Excel report
            df_violations = pd.DataFrame([d.dict() for d in violations.data])
            df_geodata = pd.DataFrame([d.dict() for d in geodata.data])
            df_timeline = pd.DataFrame([{"date": d.date.isoformat(), "count": d.count} for d in timeline.data])

            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
                # Write Violations sheet
                if not df_violations.empty:
                    df_violations.to_excel(writer, sheet_name="Violations", index=False)
                    worksheet = writer.sheets["Violations"]
                    for idx, col in enumerate(df_violations.columns, 1):
                        worksheet.column_dimensions[chr(64 + idx)].width = 20
                else:
                    pd.DataFrame({"Message": ["No violation data available"]}).to_excel(writer, sheet_name="Violations", index=False)

                # Write Geodata sheet
                if not df_geodata.empty:
                    df_geodata.to_excel(writer, sheet_name="Geodata", index=False)
                    worksheet = writer.sheets["Geodata"]
                    for idx, col in enumerate(df_geodata.columns, 1):
                        worksheet.column_dimensions[chr(64 + idx)].width = 20
                else:
                    pd.DataFrame({"Message": ["No geodata available"]}).to_excel(writer, sheet_name="Geodata", index=False)

                # Write Timeline sheet
                if not df_timeline.empty:
                    df_timeline.to_excel(writer, sheet_name="Timeline", index=False)
                    worksheet = writer.sheets["Timeline"]
                    for idx, col in enumerate(df_timeline.columns, 1):
                        worksheet.column_dimensions[chr(64 + idx)].width = 20
                else:
                    pd.DataFrame({"Message": ["No timeline data available"]}).to_excel(writer, sheet_name="Timeline", index=False)

            excel = buffer.getvalue()
            buffer.close()
            return excel

        else:
            raise HTTPException(status_code=400, detail="Invalid report type")
    except Exception as e:
        logging.error(f"Error in generate_report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

def generate_latex_report(
    violations: AnalyticsResponse,
    geodata: AnalyticsResponse,
    timeline: AnalyticsResponse,
    start_date: Optional[datetime],
    end_date: Optional[datetime],
    country: Optional[str],
    violation_type: Optional[str]
) -> str:
    # Generating LaTeX document
    title = "Human Rights Violations Report"
    filters = []
    if start_date:
        filters.append(f"Start Date: {start_date.strftime('%Y-%m-%d')}")
    if end_date:
        filters.append(f"End Date: {end_date.strftime('%Y-%m-%d')}")
    if country:
        filters.append(f"Country: {country}")
    if violation_type:
        filters.append(f"Violation Type: {violation_type}")
    filter_str = ", ".join(filters) if filters else "No filters applied"

    # Violations table
    violations_table = "\\begin{tabular}{|l|r|}\n\\hline\n\\textbf{Violation Type} & \\textbf{Count} \\\\ \\hline\n"
    for item in violations.data:
        violations_table += f"{item.violation_type} & {item.count} \\\\ \\hline\n"
    violations_table += "\\end{tabular}"

    # Geodata table
    geodata_table = "\\begin{tabular}{|l|r|}\n\\hline\n\\textbf{Country} & \\textbf{Count} \\\\ \\hline\n"
    for item in geodata.data:
        geodata_table += f"{item.country} & {item.count} \\\\ \\hline\n"
    geodata_table += "\\end{tabular}"

    # Timeline table
    timeline_table = "\\begin{tabular}{|l|r|}\n\\hline\n\\textbf{Date} & \\textbf{Count} \\\\ \\hline\n"
    for item in timeline.data:
        timeline_table += f"{item.date.strftime('%Y-%m-%d')} & {item.count} \\\\ \\hline\n"
    timeline_table += "\\end{tabular}"

    # LaTeX document
    latex_content = f"""
\\documentclass[a4paper,12pt]{{article}}
\\usepackage{{geometry}}
\\usepackage{{booktabs}}
\\usepackage{{pdflscape}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}
\\usepackage{{graphicx}}
\\usepackage{{multirow}}
\\usepackage{{color}}
\\usepackage{{enumitem}}
\\usepackage{{hyperref}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{noto}}  % Using Noto font for compatibility

\\geometry{{margin=1in}}
\\title{{{title}}}
\\author{{}}
\\date{{}}

\\begin{{document}}

\\maketitle

\\section*{{Summary}}
This report provides an analysis of human rights violations based on the following filters: {filter_str}.

\\section*{{Violations by Type}}
The following table summarizes the count of violations by type:

{violations_table}

\\section*{{Violations by Country}}
The following table shows the distribution of violations by country:

{geodata_table}

\\section*{{Violations Over Time}}
The following table tracks violations over time:

{timeline_table}

\\end{{document}}
"""
    return latex_content