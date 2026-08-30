import random
import requests
import os
import logging

logger = logging.getLogger(__name__)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:5000")

def poll_imd_rainfall():
    """
    Simulates polling IMD Radar / INSAT-3D GPM rainfall nowcasts every 15 minutes
    for 10 tracked micro-watershed polygons.
    Pushes fresh data to ML Service to recalculate risk scores.
    """
    logger.info("Executing scheduled 15-minute IMD AWS/Radar rainfall pull...")
    village_ids = [f"VIL-00{i}" for i in range(1, 10)] + ["VIL-010"]
    
    updated_scores = []
    
    for vid in village_ids:
        # Generate semi-realistic rainfall fluctuations
        rf_1h = round(random.uniform(2.0, 48.0), 1)
        rf_3h = round(rf_1h * random.uniform(1.8, 2.5), 1)
        rf_24h = round(rf_3h + random.uniform(20.0, 90.0), 1)
        soil_moisture = round(random.uniform(55.0, 94.0), 1)
        river_stage = round(random.uniform(2.0, 7.8), 2)
        tilt = round(random.uniform(0.0, 2.1), 2)
        
        payload = {
            "village_id": vid,
            "rainfall_1h_mm": rf_1h,
            "rainfall_3h_mm": rf_3h,
            "rainfall_24h_mm": rf_24h,
            "soil_moisture_pct": soil_moisture,
            "river_stage_m": river_stage,
            "tilt_mm_per_m": tilt
        }
        
        try:
            resp = requests.post(f"{ML_SERVICE_URL}/api/v1/risk/compute", json=payload, timeout=5)
            if resp.status_code == 200:
                score_data = resp.json()
                updated_scores.append(score_data)
                
                # Notify Express Gateway of risk update
                try:
                    requests.post(f"{GATEWAY_URL}/api/v1/villages/risk-update", json=score_data, timeout=3)
                except Exception:
                    pass
        except Exception as e:
            logger.warning(f"Could not compute risk for {vid}: {e}")
            
    return updated_scores
