from pydantic import BaseModel, Field, root_validator
from datetime import datetime
from typing import List, Optional, Dict, Any

class ViolationCount(BaseModel):
    violation_type: str
    count: int

class GeoDataPoint(BaseModel):
    country: str
    count: int
    coordinates: Optional[Dict[str, float]] = None  # Expecting {"lat": float, "lon": float}

    @root_validator(pre=True)
    def normalize_coordinates(cls, values):
        coordinates = values.get("coordinates")
        if coordinates:
            # Handle GeoJSON Point
            if isinstance(coordinates, dict) and coordinates.get("type") == "Point":
                coords = coordinates.get("coordinates", [])
                if len(coords) == 2:
                    values["coordinates"] = {"lon": coords[0], "lat": coords[1]}
                else:
                    values["coordinates"] = None
            # Handle [lon, lat] list
            elif isinstance(coordinates, list) and len(coordinates) == 2:
                try:
                    values["coordinates"] = {"lon": float(coordinates[0]), "lat": float(coordinates[1])}
                except (ValueError, TypeError):
                    values["coordinates"] = None
            # Handle invalid formats
            else:
                values["coordinates"] = None
        return values

class TimelinePoint(BaseModel):
    date: datetime
    count: int

class AnalyticsResponse(BaseModel):
    data: List[Any]  # Union[ViolationCount, GeoDataPoint, TimelinePoint]
    chart_spec: Dict[str, Any]  # Plotly chart specification