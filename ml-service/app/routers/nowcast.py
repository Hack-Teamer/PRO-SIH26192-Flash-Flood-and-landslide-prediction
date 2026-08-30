from fastapi import APIRouter
from app.schemas.risk import NowcastResponse
import random

router = APIRouter(prefix="/api/v1/nowcast", tags=["Nowcasting"])

@router.get("/{village_id}", response_model=NowcastResponse)
def get_nowcast(village_id: str):
    # Simulated 0-6 hour extrapolation based on radar extrapolation
    # Generates hourly projected rainfall and risk trajectory
    base_rf = random.uniform(5.0, 35.0)
    rainfalls = []
    scores = []
    tiers = []
    
    current_rf = base_rf
    for h in range(1, 7):
        current_rf = max(0.0, current_rf + random.uniform(-8.0, 15.0))
        rainfalls.append(round(current_rf, 1))
        
        score = min(100.0, max(10.0, current_rf * 2.2 + random.uniform(5.0, 20.0)))
        scores.append(round(score, 1))
        
        if score >= 75:
            tiers.append("Red")
        elif score >= 50:
            tiers.append("Orange")
        elif score >= 25:
            tiers.append("Yellow")
        else:
            tiers.append("Green")
            
    max_idx = scores.index(max(scores))
    peak_hr = max_idx + 1
    peak_tier = tiers[max_idx]
    
    summary = (
        f"0-6 hour radar nowcast projects peak rainfall intensity at Hour +{peak_hr} "
        f"({rainfalls[max_idx]} mm/hr), pushing risk tier to {peak_tier}."
    )
    
    return NowcastResponse(
        village_id=village_id,
        village_name=f"Village {village_id}",
        horizon_hours=6,
        predicted_rainfall_mm=rainfalls,
        predicted_risk_scores=scores,
        predicted_risk_tiers=tiers,
        peak_risk_hour=peak_hr,
        peak_risk_tier=peak_tier,
        nowcast_summary=summary
    )
