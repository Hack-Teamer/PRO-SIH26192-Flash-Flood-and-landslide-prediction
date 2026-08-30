import React from 'react';
import { Activity, AlertTriangle, Shield, Smartphone, RefreshCw, UserCheck } from 'lucide-react';

export default function Navbar({
  isConnected,
  activeAlerts,
  activeView,
  setActiveView,
  onTriggerSimulation,
  isSimulating,
  currentUser,
  onOpenLogin
}) {
  const redCount = activeAlerts.filter(a => a.tier === 'Red').length;
  const orangeCount = activeAlerts.filter(a => a.tier === 'Orange').length;
  const yellowCount = activeAlerts.filter(a => a.tier === 'Yellow').length;
  const greenCount = 10 - (redCount + orangeCount + yellowCount);

  return (
    <header className="bg-command-card border-b border-command-border sticky top-0 z-40 px-4 py-2.5">
      {/* Red Alert Flash Banner if active Red alert */}
      {redCount > 0 && (
        <div className="mb-2 bg-risk-red/20 border border-risk-red text-risk-red px-3 py-1.5 rounded flex items-center justify-between text-xs font-mono animate-flash-alert">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span className="font-bold uppercase tracking-wider">
              [CRITICAL EMERGENCY] {redCount} Micro-watershed(s) under EVACUATE Order!
            </span>
          </div>
          <span className="underline cursor-pointer">View Evacuation Protocols &rarr;</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Title & Organization */}
        <div className="flex items-center space-x-3">
          <div className="bg-command-border p-2 rounded border border-command-muted/20">
            <Shield className="w-6 h-6 text-signal-cyan" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-wider text-command-text flex items-center gap-2">
              FLASH FLOOD & LANDSLIDE EARLY WARNING SYSTEM
              <span className="text-xs px-2 py-0.5 rounded bg-command-bg border border-command-border font-mono text-signal-cyan">
                SIH-NDRF / MHA
              </span>
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Uttarkashi District Command Instrument • Micro-watershed Polygon Scale
            </p>
          </div>
        </div>

        {/* Live Risk Tier persist strip */}
        <div className="flex items-center space-x-1.5 font-mono text-xs bg-command-bg p-1.5 rounded border border-command-border">
          <span className="text-command-muted px-1.5 uppercase tracking-wider">Status:</span>
          <span className="px-2 py-0.5 rounded bg-risk-green/20 text-risk-green border border-risk-green/40">
            GREEN: {greenCount}
          </span>
          <span className="px-2 py-0.5 rounded bg-risk-yellow/20 text-risk-yellow border border-risk-yellow/40">
            YEL: {yellowCount}
          </span>
          <span className="px-2 py-0.5 rounded bg-risk-orange/20 text-risk-orange border border-risk-orange/40">
            ORG: {orangeCount}
          </span>
          <span className="px-2 py-0.5 rounded bg-risk-red/20 text-risk-red border border-risk-red/40">
            RED: {redCount}
          </span>
        </div>

        {/* Actions & Connection Indicator */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* WebSocket Status */}
          <div className="flex items-center space-x-1.5 bg-command-bg px-2.5 py-1.5 rounded border border-command-border">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-signal-cyan animate-pulse' : 'bg-risk-red'}`} />
            <span className="text-command-muted">
              {isConnected ? 'LIVE WS' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Trigger Weather Poll Simulator */}
          <button
            onClick={onTriggerSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 bg-command-border hover:bg-command-hover text-command-text px-3 py-1.5 rounded border border-command-border transition-colors font-mono disabled:opacity-50"
            title="Simulate fresh IMD rainfall telemetry push"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-signal-cyan ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Sensor Event'}</span>
          </button>

          {/* View Switcher: Command Console vs Citizen PWA */}
          <div className="bg-command-bg p-0.5 rounded border border-command-border flex items-center">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                activeView === 'dashboard'
                  ? 'bg-command-border text-signal-cyan font-semibold'
                  : 'text-command-muted hover:text-command-text'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Command Console</span>
            </button>
            <button
              onClick={() => setActiveView('citizen')}
              className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                activeView === 'citizen'
                  ? 'bg-command-border text-signal-cyan font-semibold'
                  : 'text-command-muted hover:text-command-text'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Citizen PWA</span>
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1 bg-command-bg hover:bg-command-border text-command-muted hover:text-command-text px-2.5 py-1.5 rounded border border-command-border transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-signal-cyan" />
            <span className="truncate max-w-[100px]">{currentUser ? currentUser.role : 'Login'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
