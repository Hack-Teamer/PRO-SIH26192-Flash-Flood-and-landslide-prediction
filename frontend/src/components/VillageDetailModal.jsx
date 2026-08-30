import React, { useState } from 'react';
import { X, AlertOctagon, TrendingUp, CloudRain, Mountain, Waves, Compass, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const tierBadgeStyles = {
  Green: 'bg-risk-green/20 text-risk-green border-risk-green',
  Yellow: 'bg-risk-yellow/20 text-risk-yellow border-risk-yellow',
  Orange: 'bg-risk-orange/20 text-risk-orange border-risk-orange',
  Red: 'bg-risk-red/20 text-risk-red border-risk-red'
};

export default function VillageDetailModal({ detailData, onClose, onManualDispatch }) {
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideTier, setOverrideTier] = useState('Red');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!detailData) return null;

  const { village, risk, nowcast } = detailData;
  const tier = risk.risk_tier || 'Green';

  // Prepare chart data for 0-6 hour nowcast
  const chartData = nowcast?.predicted_rainfall_mm?.map((rf, idx) => ({
    hour: `+${idx + 1}h`,
    rainfall: rf,
    risk: nowcast.predicted_risk_scores[idx]
  })) || [
    { hour: '+1h', rainfall: 12, risk: 25 },
    { hour: '+2h', rainfall: 24, risk: 45 },
    { hour: '+3h', rainfall: 38, risk: 72 },
    { hour: '+4h', rainfall: 28, risk: 65 },
    { hour: '+5h', rainfall: 15, risk: 40 },
    { hour: '+6h', rainfall: 8, risk: 28 }
  ];

  const handleSendManual = () => {
    onManualDispatch({
      village_id: village.id,
      village_name: village.name,
      tier: overrideTier,
      reason: overrideReason || 'Manual protection dispatch order by District Command Officer.'
    });
    setIsConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-command-card h-full border-l border-command-border flex flex-col font-mono overflow-y-auto p-5 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-command-border pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-display text-command-text tracking-wide">
                {village.name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${tierBadgeStyles[tier]}`}>
                {tier.toUpperCase()} TIER
              </span>
            </div>
            <p className="text-xs text-command-muted mt-1">
              Polygon ID: {village.id} • {village.district}, {village.state} • Pop: {village.population}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-command-muted hover:text-command-text hover:bg-command-border rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainability Callout Box */}
        <div className="bg-command-bg p-3.5 rounded border border-command-border mb-4">
          <span className="text-[10px] font-bold text-signal-cyan uppercase tracking-wider block mb-1">
            PHYSICAL MODEL EXPLAINABILITY & RISK BREAKDOWN
          </span>
          <p className="text-xs text-command-text leading-relaxed font-body">
            {risk.explainability}
          </p>
        </div>

        {/* Core Physical Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Slope FoS */}
          <div className="bg-command-bg p-3 rounded border border-command-border">
            <div className="flex items-center space-x-1.5 text-command-muted text-xs mb-1">
              <Mountain className="w-3.5 h-3.5 text-signal-cyan" />
              <span>Slope FoS (Factor of Safety)</span>
            </div>
            <div className="text-lg font-bold text-command-text">
              {risk.factor_of_safety}{' '}
              <span className="text-xs font-normal text-command-muted">
                ({village.slope_angle_deg}° slope)
              </span>
            </div>
            <div className="text-[10px] text-command-muted mt-1">
              FoS &lt; 1.0 = Landslide Failure Critical
            </div>
          </div>

          {/* SCS-CN Estimated Runoff */}
          <div className="bg-command-bg p-3 rounded border border-command-border">
            <div className="flex items-center space-x-1.5 text-command-muted text-xs mb-1">
              <CloudRain className="w-3.5 h-3.5 text-signal-cyan" />
              <span>Est. SCS-CN Runoff</span>
            </div>
            <div className="text-lg font-bold text-command-text">
              {risk.runoff_mm} <span className="text-xs font-normal text-command-muted">mm depth</span>
            </div>
            <div className="text-[10px] text-command-muted mt-1">
              Soil Type: {village.soil_type}
            </div>
          </div>

          {/* River Stage Surge */}
          <div className="bg-command-bg p-3 rounded border border-command-border">
            <div className="flex items-center space-x-1.5 text-command-muted text-xs mb-1">
              <Waves className="w-3.5 h-3.5 text-signal-cyan" />
              <span>River Stage Surge</span>
            </div>
            <div className="text-lg font-bold text-command-text">
              {risk.river_surge_pct}% <span className="text-xs font-normal text-command-muted">capacity</span>
            </div>
            <div className="text-[10px] text-command-muted mt-1">
              {village.river_name}
            </div>
          </div>

          {/* Relief Camp Info */}
          <div className="bg-command-bg p-3 rounded border border-command-border">
            <div className="flex items-center space-x-1.5 text-command-muted text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-signal-cyan" />
              <span>High-Ground Shelter</span>
            </div>
            <div className="text-xs font-bold text-command-text truncate">
              {village.relief_camp?.name || 'High Ground School'}
            </div>
            <div className="text-[10px] text-command-muted mt-1">
              Cap: {village.relief_camp?.capacity || 500} persons
            </div>
          </div>
        </div>

        {/* 0-6 Hour Radar Nowcast Trajectory Chart */}
        <div className="bg-command-bg p-3.5 rounded border border-command-border mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-command-text font-display tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-signal-cyan" />
              0–6 HOUR RADAR NOWCAST TRAJECTORY
            </span>
            <span className="text-[10px] text-command-muted">Rainfall (mm/hr) vs Risk Score</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="hour" stroke="#8A99A6" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A99A6" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1B2327', borderColor: '#2A363D', fontSize: '11px', color: '#E1E7ED' }}
                />
                <Line type="monotone" dataKey="risk" stroke="#3FD0C9" strokeWidth={2} dot={{ r: 3 }} name="Risk Score (0-100)" />
                <Line type="monotone" dataKey="rainfall" stroke="#D97F35" strokeWidth={2} strokeDasharray="3 3" name="Rainfall (mm/hr)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Emergency Alert Dispatch Panel */}
        <div className="mt-auto border-t border-command-border pt-4">
          <h3 className="text-xs font-bold text-command-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-risk-red" />
            MANUAL EMERGENCY OVERRIDE & ALERT DISPATCH
          </h3>

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              className="w-full bg-risk-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded border border-risk-red flex items-center justify-center space-x-2 transition-colors text-xs uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>Issue Immediate Evacuation Order to {village.name}</span>
            </button>
          ) : (
            <div className="bg-command-bg p-3 rounded border border-risk-red space-y-3">
              <span className="text-xs font-bold text-risk-red block">
                CONFIRMATION SAFETY LOCK: SELECT TIER & REASON
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {['Yellow', 'Orange', 'Red'].map(t => (
                  <button
                    key={t}
                    onClick={() => setOverrideTier(t)}
                    className={`py-1.5 px-2 rounded border text-center font-bold ${
                      overrideTier === t ? tierBadgeStyles[t] : 'bg-command-card text-command-muted border-command-border'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="Reason (e.g. Active slope crack observed by field patrol)"
                className="w-full bg-command-card border border-command-border rounded p-2 text-xs text-command-text focus:outline-none focus:border-signal-cyan font-mono"
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSendManual}
                  className="flex-1 bg-risk-red text-white py-2 rounded text-xs font-bold hover:bg-red-700 transition-colors uppercase"
                >
                  Confirm & Broadcast Alert
                </button>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="bg-command-card text-command-muted py-2 px-3 rounded text-xs border border-command-border hover:text-command-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
