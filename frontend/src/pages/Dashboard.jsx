import React, { useState, useEffect } from 'react';
import RiskMap from '../components/RiskMap';
import SensorHealthCard from '../components/SensorHealthCard';
import AlertConsole from '../components/AlertConsole';
import VillageDetailModal from '../components/VillageDetailModal';
import { fetchVillages, fetchVillageDetail, fetchActiveAlerts, fetchAlertHistory, fetchSensorHealth, triggerManualAlert } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard({ socket, activeAlerts, setActiveAlerts, lastPulsedVillageId }) {
  const [geoData, setGeoData] = useState(null);
  const [sensorHealth, setSensorHealth] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [selectedVillageDetail, setSelectedVillageDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [villagesResp, activeResp, historyResp, sensorsResp] = await Promise.all([
        fetchVillages(),
        fetchActiveAlerts(),
        fetchAlertHistory(),
        fetchSensorHealth()
      ]);

      setGeoData(villagesResp);
      setActiveAlerts(activeResp.alerts || []);
      setAlertHistory(historyResp.alerts || []);
      setSensorHealth(sensorsResp);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('risk-score-updated', (data) => {
        // Refresh GeoJSON features with new risk score
        loadData();
      });

      socket.on('emergency-alert-triggered', (alertData) => {
        setActiveAlerts(prev => [alertData, ...prev.filter(a => a.village_id !== alertData.village_id)]);
        setAlertHistory(prev => [alertData, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('risk-score-updated');
        socket.off('emergency-alert-triggered');
      }
    };
  }, [socket]);

  const handleSelectVillage = async (villageId) => {
    try {
      const detail = await fetchVillageDetail(villageId);
      setSelectedVillageDetail(detail);
    } catch (e) {
      console.error("Error loading village detail:", e);
    }
  };

  const handleManualDispatch = async (payload) => {
    try {
      await triggerManualAlert(payload);
      loadData();
    } catch (e) {
      console.error("Error issuing manual alert:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-60px)] flex items-center justify-center font-mono text-signal-cyan space-x-3">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Initializing Topographic Command Instrument Panel...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono overflow-hidden">
      
      {/* LEFT / CENTER COLUMN (8 cols): Topographic Risk Map & Alert Console */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
        {/* TOPOGRAPHIC RISK MAP CENTERPIECE (65% height) */}
        <div className="flex-1 min-h-[360px] h-[62%]">
          <RiskMap
            geoData={geoData}
            onSelectVillage={handleSelectVillage}
            lastPulsedVillageId={lastPulsedVillageId}
          />
        </div>

        {/* MULTI-CHANNEL ALERT DISPATCH CONSOLE (38% height) */}
        <div className="h-[38%] min-h-[180px]">
          <AlertConsole alertHistory={alertHistory} />
        </div>
      </div>

      {/* RIGHT COLUMN (4 cols): Sensor Mesh Health & Active Alert Stream */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden">
        {/* IoT SENSOR TELEMETRY MESH (50% height) */}
        <div className="h-[48%] min-h-[220px]">
          <SensorHealthCard sensorData={sensorHealth} />
        </div>

        {/* ACTIVE EMERGENCY ALERTS PANEL (52% height) */}
        <div className="h-[52%] bg-command-card rounded border border-command-border p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-command-border pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-risk-red animate-pulse" />
              <h2 className="font-bold text-sm text-command-text font-display tracking-wider">
                ACTIVE EVACUATION / WARNING ORDERS ({activeAlerts.length})
              </h2>
            </div>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-command-muted text-xs">
                No active Warning or Evacuation orders in progress across Uttarkashi district.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => handleSelectVillage(alert.village_id)}
                  className={`p-2.5 rounded border cursor-pointer hover:border-signal-cyan transition-colors text-xs ${
                    alert.tier === 'Red'
                      ? 'bg-risk-red/15 border-risk-red text-command-text'
                      : alert.tier === 'Orange'
                      ? 'bg-risk-orange/15 border-risk-orange text-command-text'
                      : 'bg-risk-yellow/15 border-risk-yellow text-command-text'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{alert.village_name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-command-bg border border-current">
                      {alert.tier}
                    </span>
                  </div>

                  <p className="text-[11px] text-command-muted line-clamp-2 font-body">
                    {alert.headline}
                  </p>

                  <div className="text-[9px] text-command-muted mt-1.5 flex items-center justify-between">
                    <span>Score: {alert.score}/100</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Village Detail Modal */}
      {selectedVillageDetail && (
        <VillageDetailModal
          detailData={selectedVillageDetail}
          onClose={() => setSelectedVillageDetail(null)}
          onManualDispatch={handleManualDispatch}
        />
      )}

    </div>
  );
}
