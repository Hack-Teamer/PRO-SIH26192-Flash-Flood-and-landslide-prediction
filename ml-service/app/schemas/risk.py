from pydantic import BaseModel, Field
from typing import List, Optional

class RiskComputeRequest(BaseModel):
    village_id: str = Field(..., example="VIL-001")
    rainfall_1h_mm: float = Field(..., example=35.0, description="1-hour rainfall in mm")
    rainfall_3h_mm: float = Field(..., example=85.0, description="3-hour accumulated rainfall in mm")
    rainfall_24h_mm: float = Field(..., example=160.0, description="24-hour accumulated rainfall in mm")
    soil_moisture_pct: float = Field(..., example=82.5, description="Soil saturation moisture percentage (0-100%)")
    slope_angle_deg: Optional[float] = Field(None, example=38.5, description="Slope angle in degrees")
    river_stage_m: Optional[float] = Field(None, example=6.8, description="Current river stage level in meters")
    historical_landslides: Optional[int] = Field(None, example=5, description="Historical landslide count in polygon")
    tilt_mm_per_m: Optional[float] = Field(0.0, example=1.2, description="Slope tilt meter reading in mm/m")

class RiskComputeResponse(BaseModel):
    village_id: str
    village_name: str
    risk_score: float = Field(..., description="Normalized risk score 0 - 100")
    risk_tier: str = Field(..., description="Green / Yellow / Orange / Red")
    factor_of_safety: float = Field(..., description="Slope stability Factor of Safety")
    runoff_mm: float = Field(..., description="SCS-CN estimated runoff depth in mm")
    river_surge_pct: float = Field(..., description="River level capacity utilization %")
    explainability: str = Field(..., description="Human-readable physical breakdown of the risk score")
    contributing_factors: List[str]
    timestamp: str

class NowcastResponse(BaseModel):
    village_id: str
    village_name: str
    horizon_hours: int = 6
    predicted_rainfall_mm: List[float]
    predicted_risk_scores: List[float]
    predicted_risk_tiers: List[str]
    peak_risk_hour: int
    peak_risk_tier: str
    nowcast_summary: str

class ForecastResponse(BaseModel):
    village_id: str
    village_name: str
    forecast_horizon_hours: int = 24
    intervals_3h: List[dict]
    summary: str
