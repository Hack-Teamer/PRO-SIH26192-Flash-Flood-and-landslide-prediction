const { dispatchSachetCapAlert } = require('../services/sachetCapService');
const { dispatchSmsWhatsAppAlert } = require('../services/smsWhatsappService');
const { triggerVillageSiren } = require('../services/sirenService');

// In-memory active alerts cache
const activeAlerts = new Map();
const alertHistory = [];

function evaluateRiskUpdate(scoreData, io) {
  const { village_id, village_name, risk_score, risk_tier, explainability } = scoreData;
  
  const existingAlert = activeAlerts.get(village_id);
  const previousTier = existingAlert ? existingAlert.tier : 'Green';

  // Check if tier escalated or changed meaningfully
  const tierChanged = previousTier !== risk_tier;

  const alertPayload = {
    id: `ALT-${village_id}-${Date.now().toString().slice(-6)}`,
    village_id,
    village_name,
    score: risk_score,
    tier: risk_tier,
    previous_tier: previousTier,
    headline: getTierHeadline(risk_tier, village_name),
    description: explainability,
    instruction: getTierInstruction(risk_tier),
    instruction_hi: getTierInstructionHindi(risk_tier),
    timestamp: new Date().toISOString()
  };

  if (risk_tier !== 'Green') {
    activeAlerts.set(village_id, alertPayload);
  } else {
    activeAlerts.delete(village_id);
  }

  alertHistory.unshift(alertPayload);
  if (alertHistory.length > 100) alertHistory.pop();

  // Socket.io broadcast to connected command dashboards and citizen PWAs
  if (io) {
    io.emit('risk-score-updated', {
      ...scoreData,
      tierChanged,
      alert: alertPayload
    });

    if (tierChanged && (risk_tier === 'Orange' || risk_tier === 'Red')) {
      io.emit('emergency-alert-triggered', alertPayload);
    }
  }

  // Trigger Multi-channel Dispatches if Warning or Evacuate tier
  if (risk_tier === 'Orange' || risk_tier === 'Red') {
    dispatchSachetCapAlert(alertPayload);
    dispatchSmsWhatsAppAlert(alertPayload);
    triggerVillageSiren(village_id, risk_tier);
  }

  return { tierChanged, alert: alertPayload };
}

function getTierHeadline(tier, villageName) {
  switch (tier) {
    case 'Red':
      return `IMMINENT FLASH FLOOD / LANDSLIDE RISK - IMMEDIATE EVACUATION ADVISED`;
    case 'Orange':
      return `SEVERE LANDSLIDE & FLASH FLOOD WARNING - PREPARE FOR EVACUATION`;
    case 'Yellow':
      return `HEAVY RAINFALL & SLOPE MOISTURE ADVISORY - STAY ALERT`;
    default:
      return `NORMAL MONITORING STATUS`;
  }
}

function getTierInstruction(tier) {
  switch (tier) {
    case 'Red':
      return `Move immediately to designated village high-ground relief shelter. Avoid nullahs, river banks, and steep cut slopes. Carry essential medication and ID.`;
    case 'Orange':
      return `Keep emergency grab-bag ready. Charge phones, stay tuned to official broadcasts, and prepare vulnerable family members for swift movement.`;
    case 'Yellow':
      return `Avoid non-essential hill road travel. Inspect drainage around property and monitor local stream water levels.`;
    default:
      return `No immediate protective action required. Monitor weather updates.`;
  }
}

function getTierInstructionHindi(tier) {
  switch (tier) {
    case 'Red':
      return `तुरंत निर्धारित उच्च-स्थान आश्रय स्थल पर जाएं। नदी के किनारों और ढलानों से दूर रहें। आवश्यक दवाएं साथ रखें।`;
    case 'Orange':
      return `आपदा किट तैयार रखें। मोबाइल चार्ज रखें और सुरक्षित स्थान पर जाने के लिए तैयार रहें।`;
    case 'Yellow':
      return `पहाड़ी रास्तों पर अनावश्यक यात्रा से बचें। स्थानीय नदी-नालों के जलस्तर पर नज़र रखें।`;
    default:
      return `कोई तत्काल खतरा नहीं। मौसम संबंधी अपडेट पर नज़र रखें।`;
  }
}

function getActiveAlerts() {
  return Array.from(activeAlerts.values());
}

function getAlertHistory() {
  return alertHistory;
}

module.exports = {
  evaluateRiskUpdate,
  getActiveAlerts,
  getAlertHistory,
  activeAlerts
};
