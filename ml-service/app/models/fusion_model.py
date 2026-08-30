from app.models.slope_stability import calculate_factor_of_safety
from app.models.hydrology_scs_cn import calculate_scs_cn_runoff
from typing import Dict, List, Tuple

def compute_fused_risk(
    village_id: str,
    rainfall_1h_mm: float,
    rainfall_3h_mm: float,
    rainfall_24h_mm: float,
    soil_moisture_pct: float,
    slope_angle_deg: float = 35.0,
    cohesion_kpa: float = 12.0,
    friction_angle_deg: float = 28.0,
    river_stage_m: float = 2.0,
    baseline_river_stage_m: float = 2.0,
    critical_river_stage_m: float = 6.0,
    historical_landslides: int = 4,
    tilt_mm_m: float = 0.0
) -> Dict:
    """
    Multi-source Risk Fusion Engine:
    Integrates 5 streams:
    1. Rainfall Intensity-Duration (I-D) Thresholds
    2. Slope Stability Factor of Safety (FoS)
    3. Hydrological SCS-CN Runoff & River Surge
    4. Antecedent Soil Saturation Index
    5. Historical Landslide Susceptibility Weight
    """
    # 1. Calculate Factor of Safety (FoS)
    fos = calculate_factor_of_safety(
        slope_angle_deg=slope_angle_deg,
        soil_moisture_pct=soil_moisture_pct,
        cohesion_kpa=cohesion_kpa,
        friction_angle_deg=friction_angle_deg,
        tilt_mm_m=tilt_mm_m
    )
    
    # 2. Calculate Hydrological Runoff
    scs_res = calculate_scs_cn_runoff(
        rainfall_3h_mm=rainfall_3h_mm,
        soil_moisture_pct=soil_moisture_pct
    )
    runoff_mm = scs_res["runoff_depth_mm"]
    
    # 3. River Stage Surge Ratio
    stage_span = max(critical_river_stage_m - baseline_river_stage_m, 1.0)
    river_surge_ratio = min(max((river_stage_m - baseline_river_stage_m) / stage_span, 0.0), 1.5)
    river_surge_pct = round(river_surge_ratio * 100.0, 1)
    
    # 4. Component Sub-scores (0 - 100)
    
    # A. Slope Stability Score (FoS lower = higher risk)
    if fos < 0.9:
        slope_score = 100.0
    elif fos < 1.1:
        slope_score = 85.0 + (1.1 - fos) * 75.0
    elif fos < 1.4:
        slope_score = 40.0 + (1.4 - fos) * 150.0
    else:
        slope_score = max(30.0 - (fos - 1.4) * 20.0, 0.0)
        
    # B. Rainfall Intensity-Duration Score (Cloudburst check: >50mm in 1h is extreme)
    if rainfall_1h_mm >= 50.0 or rainfall_3h_mm >= 100.0:
        rainfall_score = 100.0
    elif rainfall_1h_mm >= 30.0 or rainfall_3h_mm >= 60.0:
        rainfall_score = 80.0 + (rainfall_1h_mm - 30.0) * 1.0
    elif rainfall_3h_mm >= 30.0 or rainfall_24h_mm >= 90.0:
        rainfall_score = 50.0 + (rainfall_3h_mm - 30.0) * 1.0
    else:
        rainfall_score = min(rainfall_24h_mm * 0.5, 45.0)
        
    # C. Soil Saturation Score
    soil_score = min(max((soil_moisture_pct - 30.0) / 60.0 * 100.0, 0.0), 100.0)
    
    # D. River Surge Score
    river_score = min(river_surge_ratio * 100.0, 100.0)
    
    # E. Susceptibility Score (History + Tilt)
    history_score = min(historical_landslides * 8.0 + tilt_mm_m * 20.0, 100.0)
    
    # 5. Weighted Fusion Calculation
    # Weights: Rainfall 30%, Slope Stability 25%, Soil Saturation 20%, River Stage 15%, Susceptibility 10%
    fused_score = (
        (rainfall_score * 0.30) +
        (slope_score * 0.25) +
        (soil_score * 0.20) +
        (river_score * 0.15) +
        (history_score * 0.10)
    )
    
    fused_score = round(min(max(fused_score, 0.0), 100.0), 1)
    
    # 6. Assign Risk Tier
    if fused_score >= 75.0 or fos < 1.0 or rainfall_1h_mm >= 45.0:
        risk_tier = "Red"       # Evacuate
    elif fused_score >= 50.0 or fos < 1.2 or river_surge_pct >= 85.0:
        risk_tier = "Orange"    # Warning
    elif fused_score >= 25.0 or soil_moisture_pct >= 65.0:
        risk_tier = "Yellow"    # Advisory
    else:
        risk_tier = "Green"     # Watch
        
    # 7. Generate Plain-Language Explainability String & Factors
    contributing_factors = []
    if rainfall_1h_mm >= 30.0:
        contributing_factors.append(f"Intense cloudburst rainfall ({rainfall_1h_mm} mm/hr)")
    elif rainfall_3h_mm >= 50.0:
        contributing_factors.append(f"Heavy 3-hour accumulated rainfall ({rainfall_3h_mm} mm)")
        
    if fos < 1.1:
        contributing_factors.append(f"Critical slope instability (Factor of Safety {fos:.2f} < 1.1)")
    elif fos < 1.3:
        contributing_factors.append(f"Degraded slope stability (Factor of Safety {fos:.2f})")
        
    if soil_moisture_pct >= 80.0:
        contributing_factors.append(f"Near-total soil saturation ({soil_moisture_pct:.1f}%)")
        
    if river_surge_pct >= 80.0:
        contributing_factors.append(f"River stage near critical flood mark ({river_stage_m:.1f}m / {critical_river_stage_m:.1f}m)")
        
    if tilt_mm_m >= 1.0:
        contributing_factors.append(f"Active slope tilt movement ({tilt_mm_m:.1f} mm/m)")
        
    if not contributing_factors:
        contributing_factors.append("Normal hydrometeorological parameters across micro-watershed.")

    explainability_str = (
        f"Risk Score {fused_score:.1f}/100 [{risk_tier.upper()} TIER]. Primary triggers: " +
        "; ".join(contributing_factors) +
        f" [Est Runoff: {runoff_mm:.1f}mm, Slope FoS: {fos:.2f}]."
    )
    
    return {
        "risk_score": fused_score,
        "risk_tier": risk_tier,
        "factor_of_safety": fos,
        "runoff_mm": runoff_mm,
        "river_surge_pct": river_surge_pct,
        "explainability": explainability_str,
        "contributing_factors": contributing_factors
    }
