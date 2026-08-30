from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import risk_score, nowcast, forecast

app = FastAPI(
    title="Flash Flood & Landslide Risk ML Engine",
    description="Microservices API computing hyper-local physical slope stability, SCS-CN flash flood runoff, and multi-source fused risk scores for hilly villages.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_score.router)
app.include_router(nowcast.router)
app.include_router(forecast.router)

@app.get("/")
def root():
    return {
        "service": "ml-service",
        "status": "online",
        "system": "Flash Flood & Landslide Early Warning Engine",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
