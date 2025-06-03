from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ViolationCount(BaseModel):
    violation_type: str
    count: int

class GeoDataPoint(BaseModel):
    country: str
    coordinates: Optional[Dict] = None  # GeoJSON: {"type": "Point", "coordinates": [lon, lat]}
    count: int

class TimelinePoint(BaseModel):
    date: datetime
    count: int

class AnalyticsResponse(BaseModel):
    data: List[Any]  # ViolationCount, GeoDataPoint, or TimelinePoint
    chart_spec: Dict  # Plotly JSON specification