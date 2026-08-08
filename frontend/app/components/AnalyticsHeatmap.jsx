'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet must be loaded client-side only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false });

export default function AnalyticsHeatmap({ heatmapData = [] }) {
  const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi
  const DEFAULT_ZOOM = 12;

  // Render a "heatmap" using overlaid circle markers with varying radius and colors
  // Red = high congestion (>75)
  // Amber = moderate congestion (35-75)
  // Green = low congestion (<35)
  const getCongestionColor = (volume) => {
    if (volume >= 75) return '#f43f5e';
    if (volume >= 35) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />

        {heatmapData.map((point) => {
          if (!point.latitude || !point.longitude) return null;
          const color = getCongestionColor(point.volume);
          const radius = Math.max(10, point.volume / 3); // Map 0-100 to roughly 10-33px

          return (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              pathOptions={{ 
                fillColor: color, 
                color: color, 
                weight: 2, 
                opacity: 0.8, 
                fillOpacity: 0.4 + (point.volume / 200) // 0.4 to 0.9
              }}
              radius={radius}
            >
              <Tooltip sticky className="custom-tooltip">
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{point.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    Congestion Level: <span style={{ fontWeight: 700, color }}>{point.volume}%</span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(13,20,36,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        backdropFilter: 'blur(12px)',
        fontSize: '11px',
        color: '#94a3b8',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '2px' }}>Stop Congestion</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(244,63,94,0.6)', border: '1px solid #f43f5e' }} />
          <span>Heavy (&gt;75%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(245,158,11,0.6)', border: '1px solid #f59e0b' }} />
          <span>Moderate (35-75%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(16,185,129,0.6)', border: '1px solid #10b981' }} />
          <span>Low (&lt;35%)</span>
        </div>
      </div>
      <style jsx global>{`
        .custom-tooltip {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          color: #1e293b;
          padding: 6px 10px;
        }
        .leaflet-tooltip-left::before { border-left-color: rgba(255,255,255,0.95); }
        .leaflet-tooltip-right::before { border-right-color: rgba(255,255,255,0.95); }
      `}</style>
    </div>
  );
}
