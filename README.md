# ⛰️ Flash Flood & Landslide Early Warning System for Hilly Regions
> **Smart India Hackathon (SIH 2026) — Ministry of Home Affairs | NDRF & Disaster Management Division**
> 
> *A hyper-local multi-source risk fusion system that predicts flash floods and landslides at micro-watershed and village levels, providing actionable lead time and automated multi-channel alerts.*

---

## 📌 Executive Summary & Core Problem

In hilly states like Uttarakhand and Kerala, traditional disaster management relies on single-source rainfall bulletins aggregated at the **district level**. This aggregation is **too coarse and too slow** for hilly topography where a micro-cloudburst in one ravine can trigger a catastrophic debris flow or flash flood within minutes, while neighboring valleys remain dry.

Our solution fuses 5 distinct hydrometeorological and geological data streams into a continuous **0–100 Risk Score** per village/ward polygon, updated every 5–15 minutes, triggering automated tiered emergency protocols (**Watch → Advisory → Warning → Evacuate**).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. DATA SOURCES LAYER                            │
│   IMD Radar/AWS  │  ISRO Bhuvan Rasters  │  IoT Sensors  │ GSI Susceptibility│
└──────────────────────┬─────────────────────────┬────────────────────────────┘
                       │                         │
                       ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                2. DATA INGESTION SERVICE (FastAPI - Port 8001)              │
│   - Automated 15-min IMD AWS / Radar telemetry puller                       │
│   - MQTT broker listener (soil moisture, piezometer, tilt, river stage)     │
│   - Background scheduler (APScheduler) for continuous telemetry ingest      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              3. ML & PHYSICAL MODEL ENGINE (FastAPI - Port 8000)             │
│   - Infinite Slope Stability Model: Factor of Safety (FoS) calculation      │
│   - Hydrology Model: SCS-CN (Curve Number) flash flood runoff depth (mm)    │
│   - Multi-Source Risk Fusion Model: Fuses 5 streams into 0-100 Risk Score    │
│   - Radar Nowcasting (0–6 hr) + Short-range NWP Forecasting (6–24 hr)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            4. API GATEWAY & RULES ENGINE (Express.js - Port 5000)           │
│   - Real-time Socket.io WebSocket Alert Server                              │
│   - JWT Auth & Role-Based Access Control (SUPER_ADMIN, DISTRICT_ADMIN, CITIZEN)│
│   - Alert Rules Engine: Evaluates tier escalation & de-duplication          │
│   - Integrations: NDMA Sachet CAP 1.2 XML feed, SMS/WhatsApp & IoT Siren     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               5. FRONTEND PRESENTATION LAYER (React 18 - Port 3000)         │
│   - Command Console: Topographic Contour Map + IoT Mesh Monitor + Alert Log │
│   - Physical Model Explainability Drawer (FoS, Runoff, Nowcast Chart)       │
│   - Citizen Mobile PWA: Offline-capable, English/Hindi, Evacuation Routes   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Data & Event Flow

```
[IoT Sensors / IMD Radar] 
        │
        ▼ (Telemetry Pushed via MQTT / REST Poll)
[FastAPI Ingestion Service]
        │
        ▼ (POST /api/v1/risk/compute)
[FastAPI ML & Physics Engine] 
        │  ├── Calculates Slope Factor of Safety (FoS)
        │  ├── Calculates SCS-CN Runoff Depth (mm)
        │  └── Computes Fused Risk Score (0-100) & Tier (Green/Yellow/Orange/Red)
        │
        ▼ (Risk Payload Emitted)
[Express.js Gateway Rules Engine]
        │
        ├──► Socket.io WebSocket Broadcast ──► [React Command Dashboard & Citizen PWA]
        │
        └──► [Warning / Evacuate Tier Escalation]
                 ├── Generator: NDMA Sachet CAP 1.2 XML Feed
                 ├── Broadcast: Multi-Language SMS & WhatsApp
                 └── Trigger: High-Decibel IoT Village Siren Relay
```

---

## 🛠️ Technology Stack & Justification ("Why Used")

| Component | Technology | Why This Specific Tech Was Chosen |
|---|---|---|
| **ML & Physical Engine** | **FastAPI (Python 3.11)** | **Native Scientific & Geospatial Ecosystem:** Python provides unmatched native access to scientific computation (`NumPy`, `SciPy`, `GeoPandas`, `rasterio`, `GDAL`, `scikit-learn`, `PyTorch`). FastAPI was selected over Flask/Django because it is asynchronous (`asyncio`), ultra-high throughput for sensor telemetry ingestion, and automatically generates interactive OpenAPI/Swagger docs (`/docs`). |
| **Data Ingestion Engine** | **FastAPI + APScheduler + Paho-MQTT** | **IoT Protocol Support & Async Polling:** High-frequency IoT sensors in remote hilly terrain transmit small, low-power telemetry packets over MQTT (LoRaWAN bridges). `Paho-MQTT` handles low-bandwidth connection management, while `APScheduler` guarantees reliable background polling of IMD weather API endpoints every 10–15 minutes. |
| **API Gateway & Orchestration** | **Express.js (Node.js)** | **Real-time Event Loops & Integration Gateway:** Node.js excels at high-concurrency event-driven operations, specifically maintaining thousands of concurrent WebSocket connections (`Socket.io`) for instant alert push to command consoles and citizen mobile apps. Express acts as a lightweight Backend-for-Frontend (BFF), orchestrating Python microservices while managing JWT RBAC authentication and third-party API dispatches. |
| **Real-time Alert Engine** | **Socket.io** | **Bi-directional Low-Latency Fallbacks:** Socket.io handles automatic reconnection, fallback polling over bad network connections in remote hill areas, and room-based broadcasting to specific micro-watershed polygon channels. |
| **Frontend Framework** | **React 18 + Vite** | **Component Modularization & Fast HMR:** React's virtual DOM efficiently re-renders interactive map layers and live telemetry heartbeats without full DOM redraws. Vite provides instant module bundling and optimized production builds. |
| **Map & Geospatial Visualization** | **Leaflet.js + React-Leaflet** | **Lightweight GIS Rendering:** Leaflet handles GeoJSON polygon overlays, custom topographic contour strokes, and vector styling without requiring full GPU-heavy WebGL setup, making it fast even on low-spec field responder mobile devices. |
| **Styling & Design System** | **Tailwind CSS** | **Custom Token Control:** Enables direct implementation of our custom **"Topographic Instrument Panel"** design system (deep slate `#12181B` base, `#3F5C4C` terrain fill, `#3FD0C9` signal cyan, monospace data formatting, and pulse animations) without fighting generic default UI library templates. |
| **Containerization & Storage** | **Docker Compose + PostGIS + Redis + Mosquitto** | **Production Reproducibility:** PostgreSQL + PostGIS provides native spatial queries (`ST_Contains`, `ST_Intersects`) for micro-watershed boundaries; Redis acts as high-speed cache and pub/sub broker; Mosquitto serves as the IoT MQTT broker. Docker Compose wires all 7 containers together with single-command orchestration. |

---

## 🎨 Frontend Design Direction — "Topographic Instrument Panel"

Rather than a generic SaaS dashboard with rounded cards and stock blue accents, the UI is styled as a **live 24/7 disaster monitoring instrument panel**:

- **Palette**: Deep slate/charcoal (`#12181B`) command console background, muted forest moss (`#3F5C4C`) terrain map fill, signal cyan (`#3FD0C9`) for active connection pulses.
- **Risk Tier Data Language**: Used consistently across maps, badges, and status strips:
  - 🟢 **Green** (`#4C9A6A`): Watch / Normal
  - 🟡 **Yellow** (`#D9B44A`): Advisory / Elevated
  - 🟠 **Orange** (`#D97F35`): Warning / High Risk
  - 🔴 **Red** (`#C43D3D`): EVACUATE IMMEDIATELY
- **Typography**: `Barlow Condensed` / `IBM Plex Sans Condensed` for display headers; `JetBrains Mono` for all numerical data outputs (timestamps, coordinates, sensor readings, risk scores); `Inter` for readable body text.
- **Signature Map Element**: Interactive Leaflet map rendering village polygons over topographic contour strokes with a single-event animated pulse ring radiating outward whenever a polygon's risk tier updates.

---

## 💡 Physics & Mathematical Models Explained

### 1. Infinite Slope Stability Model — Factor of Safety ($\text{FoS}$)
The physical slope stability engine computes the Factor of Safety ($\text{FoS}$) for infinite planar sliding in saturated colluvial soils:

$$\text{FoS} = \frac{c' + (\gamma_{\text{sat}} - m \cdot \gamma_w) \cdot z \cdot \cos^2\theta \cdot \tan\phi'}{\gamma_{\text{sat}} \cdot z \cdot \sin\theta \cdot \cos\theta}$$

- $c'$ = Soil Cohesion (kPa)
- $\phi'$ = Internal Friction Angle (degrees)
- $\theta$ = Slope Angle (degrees)
- $z$ = Soil Depth (meters)
- $m$ = Relative Soil Saturation Ratio ($\text{soil\_moisture\_pct} / 100$)
- $\gamma_{\text{sat}}, \gamma_w$ = Saturated Soil and Water Unit Weights ($\text{kN/m}^3$)

*Interpretation:*
- $\text{FoS} < 1.0$: Slope failure / landslide is **imminently critical**.
- $1.0 \le \text{FoS} < 1.3$: Slope is **conditionally unstable**.
- $\text{FoS} \ge 1.3$: Slope is **stable**.

### 2. SCS-CN Hydrological Flash Flood Model
Estimates direct runoff depth $Q$ (in mm) based on antecedent soil moisture conditions (AMC I/II/III):

$$Q = \frac{(P - I_a)^2}{P - I_a + S} \quad \text{for } P > I_a$$

- $P$ = 3-hour accumulated rainfall (mm)
- $S$ = Potential maximum retention after runoff begins $= \frac{25400}{CN} - 254$
- $I_a$ = Initial abstraction $= 0.2 \cdot S$
- $CN$ = Curve Number dynamically adjusted for soil saturation AMC level.

---

## 🚦 Quick Start Guide

### Option A: Local Development Server Mode

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Hack-Teamer/PRO-SIH26192-Flash-Flood-and-landslide-prediction.git
   cd PRO-SIH26192-Flash-Flood-and-landslide-prediction
   ```

2. **Start ML Engine (FastAPI - Port 8000)**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Start Ingestion Service (FastAPI - Port 8001)**:
   ```bash
   cd ingestion-service
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```

4. **Start API Gateway (Express.js - Port 5000)**:
   ```bash
   cd backend-gateway
   npm install
   node src/server.js
   ```

5. **Start Frontend (React + Vite - Port 3000)**:
   ```bash
   cd frontend
   npm install
   npx vite --host
   ```

### Option B: Production Docker Compose Deployment

```bash
docker-compose up --build
```

---

## 🌐 Endpoints & Active Access Points

- **Command Center & Citizen PWA**: [http://localhost:3000](http://localhost:3000)
- **Express API Gateway**: [http://localhost:5000](http://localhost:5000)
- **FastAPI ML Service OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Ingestion Service OpenAPI Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 📄 License & Team Credits

Built for **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH 26192** (Ministry of Home Affairs / NDRF). Designed for high-risk disaster management across Indian hilly states (Uttarakhand, Himachal Pradesh, Jammu & Kashmir, Sikkim, Kerala).
