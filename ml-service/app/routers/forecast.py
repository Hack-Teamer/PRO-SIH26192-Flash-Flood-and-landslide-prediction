from fastapi import APIRouter
from app.schemas.risk import ForecastResponse
import random

router = APIRouter(prefix="/api/v1/forecast", tags=["Short-range Forecast"])

@router.get("/{village_id}", response_model=ForecastResponse)
def get_forecast(village_id: str):
    # Simulated 6-24 hour short-range NWP forecast in 3-hour blocks
    intervals = []
    for step in range(1, 9):
        hr_start = (step - 1) * 3
        hr_end = step * 3
        rf_3h = round(random.uniform(2.0, 45.0), 1)
        score = round(min(100.0, max(12.0, rf_3h * 1.8 + random.uniform(10.0, 30.0))), 1)
        
        if score >= 75:
            tier = "Red"
        elif score >= 50:
            tier = "Orange"
        elif score >= 25:
            tier = "Yellow"
        else:
            tier = "Green"
            
        intervals.append({
            "period": f"+{hr_start}h to +{hr_end}h",
            "rainfall_3h_mm": rf_3h,
            "projected_soil_saturation_pct": round(random.uniform(55.0, 95.0), 1),
            "projected_risk_score": score,
            "projected_risk_tier": tier
        })
        
    summary = (
        "24-hour NWP ensemble forecast indicates intermittent convective cells "
        "passing over the watershed, maintaining Elevated Alert status."
    )
    
    return ForecastResponse(
        village_id=village_id,
        village_name=f"Village {village_id}",
        forecast_horizon_hours=24,
        intervals_3h=intervals,
        summary=summary
    )
