from fastapi import APIRouter, HTTPException
from app.schemas.risk import RiskComputeRequest, RiskComputeResponse
from app.models.fusion_model import compute_fused_risk
import json
import os
from datetime import datetime

router = APIRouter(prefix="/api/v1/risk", tags=["Risk Computation"])

GEO_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "shared", "geo", "villages.json")

def load_villages_db():
    if os.path.exists(GEO_FILE):
        try:
            with open(GEO_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {"features": []}

@router.post("/compute", response_model=RiskComputeResponse)
def compute_risk(req: RiskComputeRequest):
    villages = load_villages_db()
    target_feature = None
    for feat in villages.get("features", []):
        if feat["properties"]["id"] == req.village_id:
            target_feature = feat["properties"]
            break
            
    if not target_feature:
        # Default properties if village ID is custom or not in geojson
        target_feature = {
            "name": f"Village {req.village_id}",
            "slope_angle_deg": req.slope_angle_deg or 35.0,
            "cohesion_kpa": 12.0,
            "friction_angle_deg": 28.0,
            "baseline_river_stage_m": 2.0,
            "critical_river_stage_m": 6.5,
            "historical_landslides": req.historical_landslides or 3
        }
        
    res = compute_fused_risk(
        village_id=req.village_id,
        rainfall_1h_mm=req.rainfall_1h_mm,
        rainfall_3h_mm=req.rainfall_3h_mm,
        rainfall_24h_mm=req.rainfall_24h_mm,
        soil_moisture_pct=req.soil_moisture_pct,
        slope_angle_deg=req.slope_angle_deg or target_feature.get("slope_angle_deg", 35.0),
        cohesion_kpa=target_feature.get("cohesion_kpa", 12.0),
        friction_angle_deg=target_feature.get("friction_angle_deg", 28.0),
        river_stage_m=req.river_stage_m or target_feature.get("baseline_river_stage_m", 2.0),
        baseline_river_stage_m=target_feature.get("baseline_river_stage_m", 2.0),
        critical_river_stage_m=target_feature.get("critical_river_stage_m", 6.5),
        historical_landslides=req.historical_landslides or target_feature.get("historical_landslides", 3),
        tilt_mm_m=req.tilt_mm_per_m or 0.0
    )
    
    return RiskComputeResponse(
        village_id=req.village_id,
        village_name=target_feature.get("name", f"Village {req.village_id}"),
        risk_score=res["risk_score"],
        risk_tier=res["risk_tier"],
        factor_of_safety=res["factor_of_safety"],
        runoff_mm=res["runoff_mm"],
        river_surge_pct=res["river_surge_pct"],
        explainability=res["explainability"],
        contributing_factors=res["contributing_factors"],
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@router.get("/villages")
def list_villages():
    data = load_villages_db()
    results = []
    for feat in data.get("features", []):
        props = feat["properties"]
        results.append({
            "id": props["id"],
            "name": props["name"],
            "district": props["district"],
            "state": props["state"],
            "population": props["population"],
            "slope_angle_deg": props["slope_angle_deg"],
            "soil_type": props["soil_type"],
            "river_name": props["river_name"],
            "relief_camp": props["relief_camp"]
        })
    return {"count": len(results), "villages": results}
