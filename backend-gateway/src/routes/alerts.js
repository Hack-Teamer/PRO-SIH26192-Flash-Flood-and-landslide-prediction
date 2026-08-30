const express = require('express');
const router = express.Router();
const { getActiveAlerts, getAlertHistory, evaluateRiskUpdate } = require('../rulesEngine/riskTierRules');

// GET active alerts
router.get('/active', (req, res) => {
  res.json({
    active_count: getActiveAlerts().length,
    alerts: getActiveAlerts()
  });
});

// GET alert history
router.get('/history', (req, res) => {
  res.json({
    total_logged: getAlertHistory().length,
    alerts: getAlertHistory()
  });
});

// POST manual evacuation order / override by NDRF or District Magistrate
router.post('/manual-trigger', (req, res) => {
  const { village_id, village_name, tier, reason, target_channel } = req.body;
  const io = req.app.get('io');

  if (!village_id || !tier) {
    return res.status(400).json({ error: 'village_id and tier are required' });
  }

  const manualScoreData = {
    village_id,
    village_name: village_name || `Village ${village_id}`,
    risk_score: tier === 'Red' ? 95.0 : (tier === 'Orange' ? 65.0 : 40.0),
    risk_tier: tier,
    factor_of_safety: tier === 'Red' ? 0.85 : 1.15,
    runoff_mm: 85.0,
    river_surge_pct: 90.0,
    explainability: `[MANUAL EMERGENCY OVERRIDE BY COMMAND OFFICER]: ${reason || 'Immediate flood/landslide protection order.'}`,
    contributing_factors: [`Manual trigger: ${reason || 'Command Center Order'}`],
    timestamp: new Date().toISOString()
  };

  const evalResult = evaluateRiskUpdate(manualScoreData, io);

  res.json({
    status: 'MANUAL_ALERT_ISSUED',
    tier,
    alert: evalResult.alert
  });
});

module.exports = router;
