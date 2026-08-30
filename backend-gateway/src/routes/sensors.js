const express = require('express');
const router = express.Router();

// Simulated IoT sensor mesh health monitor
router.get('/health', (req, res) => {
  const sensorNodes = [
    { id: "SN-BHT-01", type: "Soil Piezometer", location: "Bhatwari Ridge", village_id: "VIL-001", battery_pct: 94, status: "ONLINE", last_ping: "12s ago", signal_rssi: "-68 dBm" },
    { id: "SN-MNR-02", type: "Slope Tiltmeter", location: "Maneri Cut", village_id: "VIL-002", battery_pct: 88, status: "ONLINE", last_ping: "45s ago", signal_rssi: "-72 dBm" },
    { id: "SN-GNG-03", type: "River Stage Radar", location: "Assi Ganga Bridge", village_id: "VIL-003", battery_pct: 100, status: "ONLINE", last_ping: "5s ago", signal_rssi: "-55 dBm" },
    { id: "SN-DHR-04", type: "AWS Rain Gauge", location: "Dharali Top", village_id: "VIL-004", battery_pct: 42, status: "ONLINE", last_ping: "1m ago", signal_rssi: "-84 dBm" },
    { id: "SN-HRS-05", type: "Soil Piezometer", location: "Harsil Sector B", village_id: "VIL-005", battery_pct: 91, status: "ONLINE", last_ping: "18s ago", signal_rssi: "-62 dBm" },
    { id: "SN-UTK-06", type: "CCTV Water Level Vision", location: "Bhagirathi Ghat", village_id: "VIL-006", battery_pct: 76, status: "ONLINE", last_ping: "3s ago", signal_rssi: "-58 dBm" },
    { id: "SN-MND-07", type: "Slope Tiltmeter", location: "Mando Upper Scree", village_id: "VIL-007", battery_pct: 19, status: "LOW_BATTERY", last_ping: "4m ago", signal_rssi: "-91 dBm" },
    { id: "SN-KNK-08", type: "AWS Rain Gauge", location: "Kankrari Slope", village_id: "VIL-008", battery_pct: 85, status: "ONLINE", last_ping: "32s ago", signal_rssi: "-70 dBm" },
    { id: "SN-BRK-09", type: "River Stage Radar", location: "Yamuna Ridge Bridge", village_id: "VIL-009", battery_pct: 96, status: "ONLINE", last_ping: "8s ago", signal_rssi: "-60 dBm" },
    { id: "SN-PRL-10", type: "Soil Piezometer", location: "Purola Basin", village_id: "VIL-010", battery_pct: 89, status: "ONLINE", last_ping: "22s ago", signal_rssi: "-65 dBm" }
  ];

  res.json({
    total_nodes: sensorNodes.length,
    online_count: sensorNodes.filter(s => s.status === 'ONLINE').length,
    low_battery_count: sensorNodes.filter(s => s.status === 'LOW_BATTERY').length,
    offline_count: 0,
    sensors: sensorNodes
  });
});

module.exports = router;
