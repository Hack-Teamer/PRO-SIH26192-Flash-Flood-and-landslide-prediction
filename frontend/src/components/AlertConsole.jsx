import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, Search } from 'lucide-react';

const tierBadgeStyles = {
  Green: 'bg-risk-green/20 text-risk-green border-risk-green/40',
  Yellow: 'bg-risk-yellow/20 text-risk-yellow border-risk-yellow/40',
  Orange: 'bg-risk-orange/20 text-risk-orange border-risk-orange/40',
  Red: 'bg-risk-red/20 text-risk-red border-risk-red/40'
};

export default function AlertConsole({ alertHistory }) {
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = (alertHistory || []).filter(alert => {
    const matchesTier = filterTier === 'ALL' || alert.tier === filterTier;
    const matchesSearch =
      alert.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="bg-command-card rounded border border-command-border p-3 flex flex-col h-full font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-command-border pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-signal-cyan" />
          <h2 className="font-bold text-sm text-command-text font-display tracking-wider">
            MULTI-CHANNEL ALERT LOG ({filteredAlerts.length})
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-command-muted" />
            <input
              type="text"
              placeholder="Search village..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-command-bg border border-command-border rounded pl-7 pr-2 py-1 text-xs text-command-text focus:outline-none focus:border-signal-cyan"
            />
          </div>

          <select
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
            className="bg-command-bg border border-command-border rounded px-2 py-1 text-xs text-command-text focus:outline-none focus:border-signal-cyan"
          >
            <option value="ALL">All Tiers</option>
            <option value="Red">Red Only</option>
            <option value="Orange">Orange Only</option>
            <option value="Yellow">Yellow Only</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="overflow-y-auto max-h-[220px] pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-command-muted text-xs">
            No dispatched alerts matching selected filter criteria.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-command-bg/70 p-2.5 rounded border border-command-border hover:border-command-muted/40 transition-colors text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierBadgeStyles[alert.tier]}`}>
                      {alert.tier.toUpperCase()}
                    </span>
                    <span className="font-bold text-command-text">{alert.village_name}</span>
                    <span className="text-[10px] text-command-muted">Score: {alert.score}</span>
                  </div>

                  <span className="text-[10px] text-command-muted whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-[11px] text-command-muted mt-1 line-clamp-1 font-body">
                  {alert.headline}
                </p>

                <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-command-muted">
                  <span className="text-signal-cyan flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-signal-cyan" />
                    Sachet CAP 1.2 Feed
                  </span>
                  <span>• SMS / WhatsApp Broadcast</span>
                  <span>• IoT Siren Relay Triggered</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
