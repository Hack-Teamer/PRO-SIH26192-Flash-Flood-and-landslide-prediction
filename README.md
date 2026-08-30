# Flash Flood & Landslide Early Warning System for Hilly Regions
### Smart India Hackathon — Ministry of Home Affairs | NDRF, DM Division

An end-to-end multi-source fusion system for micro-watershed and village-level early warning of landslides and flash floods in hilly terrain (e.g. Uttarkashi / Wayanad).

---

## 1. System Architecture & Dual Backend Setup

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA SOURCES LAYER                          │
│  IMD Radar/AWS │ ISRO Bhuvan │ IoT Sensors │ GSI Inventory │ CCTV    │
└──────────────┬─────────────┬──────────────┬────────────┬────────────┘
               │             │              │            │
               ▼             ▼              ▼            ▼
     ┌─────────────────────────────────────────────────────┐
     │  DATA INGESTION SERVICE (FastAPI - Port 8001)       │
     │  - Simulated IMD Radar/AWS 15-min rainfall puller   │
     │  - MQTT Listener/Broker bridge                      │
     └───────────────────────┬─────────────────────────────┘
                              ▼
     ┌─────────────────────────────────────────────────────┐
     │  ML & PHYSICAL MODEL SERVICE (FastAPI - Port 8000)  │
     │  - Infinite Slope Stability (Factor of Safety FoS)  │
     │  - SCS-CN Flash Flood Runoff Estimation             │
     │  - Multi-source Risk Fusion Model (0-100 score)     │
     │  - 0-6 hr Nowcast & 6-24 hr Short-range Forecast    │
     └───────────────────────┬─────────────────────────────┘
                              ▼
     ┌─────────────────────────────────────────────────────┐
     │  API GATEWAY & RULES ENGINE (Express.js - Port 5000)│
     │  - JWT Auth + RBAC (NDRF / SDMA / Citizen)          │
     │  - Socket.io Real-time WebSocket Alert Broadcast    │
     │  - NDMA Sachet CAP 1.2 XML Feed Generator           │
     │  - SMS / WhatsApp Gateway & IoT Village Siren Relay │
     └───────────────────────┬─────────────────────────────┘
                              ▼
     ┌─────────────────────────────────────────────────────┐
     │  FRONTEND APP (React 18 + Tailwind - Port 3000)     │
     │  - Command Console: Topographic Contour Risk Map    │
     │  - IoT Telemetry Mesh Health Monitor                │
     │  - Citizen Mobile PWA (Offline & Hindi/English)     │
     └─────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Features

- **Frontend**: React 18 + Vite + Tailwind CSS (`Topographic Instrument Panel` design tokens: `#12181B` deep slate base, `#3F5C4C` terrain fill, custom risk tier scale `#4C9A6A`/`#D9B44A`/`#D97F35`/`#C43D3D`, `#3FD0C9` signal cyan accent, Leaflet contour stroke maps, single-event pulse ring animation on tier change).
- **API Gateway**: Express.js (Node.js) with Socket.io WebSocket broadcasting, JWT authentication, and multi-channel alert rules engine.
- **ML / Physical Engine**: FastAPI (Python 3.11) computing:
  1. **Factor of Safety (FoS)**: Infinite slope shear strength model.
  2. **SCS-CN Runoff**: Soil Conservation Service Curve Number runoff depth (mm).
  3. **Multi-Source Risk Fusion**: Combines rainfall I-D, soil moisture %, slope FoS, river stage level, and historical landslide susceptibility into a 0–100 score and Watch/Advisory/Warning/Evacuate tier assignment.
- **Data Ingestion**: FastAPI (Python 3.11) with automated 10-minute IMD polling and MQTT sensor telemetry bridge.

---

## 3. How to Run Locally

### Option A: Docker Compose (Recommended for Full Production Deployment)
```bash
docker-compose up --build
```
Access points:
- **Command Dashboard & Citizen PWA**: http://localhost:3000
- **Express API Gateway**: http://localhost:5000
- **FastAPI ML Service OpenAPI Docs**: http://localhost:8000/docs
- **FastAPI Ingestion Service OpenAPI Docs**: http://localhost:8001/docs

### Option B: Local Standalone Development Mode

1. **Start ML Service (FastAPI)**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Ingestion Service (FastAPI)**:
   ```bash
   cd ingestion-service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8001
   ```

3. **Start Express Gateway**:
   ```bash
   cd backend-gateway
   npm install
   npm start
   ```

4. **Start Frontend (React + Vite)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 4. Demo Verification Flow

1. Open http://localhost:3000 in your browser to view the **NDRF Command Console**.
2. Observe the **Topographic Risk Map** with 10 micro-watershed polygons in Uttarkashi district.
3. Click on any polygon (e.g. `Bhatwari Village` or `Dharali Micro-watershed`) to open the **Physical Model Explainability Drawer** showing:
   - Slope Factor of Safety (FoS)
   - SCS-CN estimated runoff (mm)
   - 0-6 hour radar nowcast trajectory chart
   - Manual evacuation dispatch controls
4. Click **"Simulate Sensor Event"** in the top navbar to trigger a simulated IMD weather telemetry update:
   - Observe the live WebSocket update broadcast.
   - The polygon that experiences a tier change triggers a **single-event animated pulse ring**.
5. Switch to **"Citizen PWA"** view using the top navbar toggle:
   - Test the simplified mobile layout, English/Hindi language toggle, and step-by-step evacuation route sequence.
