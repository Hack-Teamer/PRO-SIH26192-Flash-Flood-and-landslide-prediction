from fastapi import APIRouter
from app.connectors.rainfall_imd import poll_imd_rainfall

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingestion Controls"])

@router.post("/trigger-imd-poll")
def trigger_poll():
    results = poll_imd_rainfall()
    return {
        "status": "success",
        "message": "Polled IMD rainfall APIs and updated micro-watershed risk scores.",
        "updated_villages_count": len(results),
        "data": results
    }
