import React from 'react';
import { Cpu, Wifi, Battery, AlertCircle } from 'lucide-react';

export default function SensorHealthCard({ sensorData }) {
  if (!sensorData || !sensorData.sensors) return null;

  const { sensors, online_count, low_battery_count, total_nodes } = sensorData;

  return (
    <div className="bg-command-card rounded border border-command-border p-3 flex flex-col h-full font-mono">
      <div className="flex items-center justify-between border-b border-command-border pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-signal-cyan" />
          <h2 className="font-bold text-sm text-command-text font-display tracking-wider">
            IoT TELEMETRY MESH ({total_nodes} NODES)
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-risk-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-green animate-pulse"></span>
            {online_count} ONLINE
          </span>
          {low_battery_count > 0 && (
            <span className="text-risk-yellow flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {low_battery_count} LOW BATT
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        {sensors.map((sensor) => {
          const isLowBatt = sensor.battery_pct < 30;
          return (
            <div
              key={sensor.id}
              className="bg-command-bg/70 p-2 rounded border border-command-border flex items-center justify-between text-xs hover:border-command-muted/40 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    sensor.status === 'ONLINE' ? 'bg-signal-cyan animate-heartbeat' : 'bg-risk-red'
                  }`}
                />
                <div>
                  <div className="font-bold text-command-text text-[11px] flex items-center gap-1.5">
                    {sensor.id}
                    <span className="text-[9px] text-command-muted font-normal">({sensor.type})</span>
                  </div>
                  <div className="text-[10px] text-command-muted">{sensor.location}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[10px]">
                {/* RSSI Signal */}
                <div className="flex items-center space-x-1 text-command-muted" title="LoRaWAN Signal RSSI">
                  <Wifi className="w-3 h-3 text-signal-cyan" />
                  <span>{sensor.signal_rssi}</span>
                </div>

                {/* Battery Bar */}
                <div className="flex items-center space-x-1" title={`Battery: ${sensor.battery_pct}%`}>
                  <Battery className={`w-3.5 h-3.5 ${isLowBatt ? 'text-risk-red animate-pulse' : 'text-risk-green'}`} />
                  <span className={isLowBatt ? 'text-risk-red font-bold' : 'text-command-muted'}>
                    {sensor.battery_pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
