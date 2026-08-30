const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { evaluateRiskUpdate } = require('../rulesEngine/riskTierRules');

const GEO_FILE = path.join(__dirname, '..', '..', '..', 'shared', 'geo', 'villages.json');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// In-memory current village risk states
const villageRiskStates = new Map();

function loadGeoData() {
  if (fs.existsSync(GEO_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(GEO_FILE, 'utf8'));
    } catch (e) {
      console.error("Error reading villages geojson:", e);
    }
  }
  return { features: [] };
}

// GET all villages with GeoJSON and current risk score
router.get('/', async (req, res) => {
  const geoData = loadGeoData();
  
  const featuresWithRisk = geoData.features.map(feat => {
    const vid = feat.properties.id;
    const currentRisk = villageRiskStates.get(vid) || {
      risk_score: 18.5,
      risk_tier: 'Green',
      factor_of_safety: 1.45,
      runoff_mm: 4.2,
      river_surge_pct: 35.0,
      explainability: 'Normal hydrometeorological parameters across micro-watershed.',
      contributing_factors: ['Normal hydrometeorological parameters across micro-watershed.'],
      timestamp: new Date().toISOString()
    };
    
    return {
      ...feat,
      properties: {
        ...feat.properties,
        risk: currentRisk
      }
    };
  });

  res.json({
    type: "FeatureCollection",
    features: featuresWithRisk
  });
});

// GET single village details with risk analysis
router.get('/:id', async (req, res) => {
  const vid = req.params.id;
  const geoData = loadGeoData();
  const feat = geoData.features.find(f => f.properties.id === vid);

  if (!feat) {
    return res.status(404).json({ error: 'Village polygon not found' });
  }

  const currentRisk = villageRiskStates.get(vid) || {
    risk_score: 18.5,
    risk_tier: 'Green',
    factor_of_safety: 1.45,
    runoff_mm: 4.2,
    river_surge_pct: 35.0,
    explainability: 'Normal hydrometeorological parameters across micro-watershed.',
    contributing_factors: ['Normal hydrometeorological parameters across micro-watershed.'],
    timestamp: new Date().toISOString()
  };

  // Fetch forecast from ML service if available
  let nowcastData = null;
  try {
    const nowcastResp = await axios.get(`${ML_SERVICE_URL}/api/v1/nowcast/${vid}`, { timeout: 2000 });
    nowcastData = nowcastResp.data;
  } catch (e) {
    console.warn(`Could not reach ML service for nowcast on ${vid}`);
  }

  res.json({
    village: feat.properties,
    geometry: feat.geometry,
    risk: currentRisk,
    nowcast: nowcastData
  });
});

// POST receive risk update from Ingestion / ML service
router.post('/risk-update', (req, res) => {
  const scoreData = req.body;
  const io = req.app.get('io');

  if (!scoreData || !scoreData.village_id) {
    return res.status(400).json({ error: 'Invalid score payload' });
  }

  villageRiskStates.set(scoreData.village_id, scoreData);
  const evalResult = evaluateRiskUpdate(scoreData, io);

  res.json({
    status: 'RECEIVED',
    evaluated_tier: scoreData.risk_tier,
    tier_changed: evalResult.tierChanged
  });
});

module.exports = router;
