import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Center Fix Component
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [center, map]);
  return null;
}

const tierColors = {
  Green: '#4C9A6A',
  Yellow: '#D9B44A',
  Orange: '#D97F35',
  Red: '#C43D3D'
};

export default function RiskMap({ geoData, onSelectVillage, lastPulsedVillageId }) {
  const center = [30.78, 78.50]; // Uttarkashi district center coordinates

  const getFeatureStyle = (feature) => {
    const risk = feature.properties.risk || {};
    const tier = risk.risk_tier || 'Green';
    const color = tierColors[tier] || tierColors.Green;

    return {
      fillColor: color,
      weight: 2,
      opacity: 0.9,
      color: '#2A363D', // Contour stroke boundary
      dashArray: '3, 4', // Contour stroke pattern
      fillOpacity: 0.65
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const risk = props.risk || {};
    const tier = risk.risk_tier || 'Green';

    // Tooltip popup
    const popupContent = `
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #12181B; padding: 4px;">
        <strong style="font-size: 14px; color: #12181B;">${props.name}</strong><br/>
        District: ${props.district}<br/>
        Slope: ${props.slope_angle_deg}° | Soil: ${props.soil_type}<br/>
        <hr style="margin: 4px 0; border-top: 1px solid #ccc;"/>
        <strong>RISK SCORE: ${risk.risk_score || 18.5} / 100 [${tier}]</strong><br/>
        Slope FoS: ${risk.factor_of_safety || 1.45} | Runoff: ${risk.runoff_mm || 4.2}mm<br/>
        <span style="color: #666; font-size: 10px;">Click polygon for detailed physical breakdown</span>
      </div>
    `;

    layer.bindTooltip(popupContent, { sticky: true });

    layer.on({
      click: () => {
        onSelectVillage(props.id);
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3.5,
          color: '#3FD0C9',
          fillOpacity: 0.85
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(feature));
      }
    });
  };

  return (
    <div className="relative w-full h-full rounded border border-command-border overflow-hidden bg-command-card contour-bg">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-command-card/90 backdrop-blur-md px-3 py-2 rounded border border-command-border font-mono text-xs shadow-lg">
        <div className="font-bold font-display tracking-wider text-command-text text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse"></span>
          MICRO-WATERSHED TOPOGRAPHIC RISK MAP
        </div>
        <div className="text-command-muted text-[10px] flex items-center gap-3 mt-1">
          <span>Scale: 1:25,000</span>
          <span>SRTM DEM 30m / CartoDEM</span>
          <span>Refreshed: 5m</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-command-card/90 backdrop-blur-md px-3 py-2.5 rounded border border-command-border font-mono text-xs shadow-lg">
        <span className="text-[11px] font-bold text-command-muted block mb-1.5 uppercase">
          Risk Tier Scale
        </span>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: tierColors.Green }}></span>
            <span className="text-command-text">Green (Score &lt; 25) • Watch</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: tierColors.Yellow }}></span>
            <span className="text-command-text">Yellow (25-50) • Advisory</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: tierColors.Orange }}></span>
            <span className="text-command-text">Orange (50-75) • Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: tierColors.Red }}></span>
            <span className="text-command-text">Red (&gt; 75) • EVACUATE</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapRecenter center={center} />
        {/* Dark Matter / Terrain Base Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* GeoJSON Village Boundaries */}
        {geoData && geoData.features && (
          <GeoJSON
            key={JSON.stringify(geoData)}
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Pulsing Event Indicator Overlay if a village tier just changed */}
      {lastPulsedVillageId && (
        <div className="absolute top-16 left-3 z-[1000] bg-risk-red/90 text-white px-3 py-1.5 rounded font-mono text-xs flex items-center space-x-2 animate-bounce shadow-xl border border-risk-red">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>TIER ESCALATION PULSE DETECTED: Polygon {lastPulsedVillageId}</span>
        </div>
      )}
    </div>
  );
}
