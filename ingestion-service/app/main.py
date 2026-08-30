from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from app.connectors.rainfall_imd import poll_imd_rainfall
from app.routers import ingest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Data Ingestion & Sensor Connector Service",
    description="Microservice responsible for pulling IMD radar, ISRO Bhuvan satellite rasters, and IoT telemetry over MQTT.",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)

scheduler = BackgroundScheduler()

@app.on_event("startup")
def start_scheduler():
    logger.info("Starting background ingestion scheduler...")
    # Run IMD poll every 10 minutes
    scheduler.add_job(poll_imd_rainfall, 'interval', minutes=10, id="imd_rainfall_job")
    scheduler.start()

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()

@app.get("/")
def root():
    return {
        "service": "ingestion-service",
        "status": "online",
        "connectors": ["IMD Radar/AWS", "ISRO Bhuvan", "MQTT IoT Broker"],
        "docs": "/docs"
    }
