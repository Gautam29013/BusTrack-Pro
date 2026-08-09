'use client';
import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function createStopIcon(isSelected = false) {
  const size = isSelected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${isSelected ? '#f59e0b' : '#1e293b'}" stroke="${isSelected ? '#fbbf24' : '#f59e0b'}" stroke-width="2.5"/>
      <text x="16" y="21" text-anchor="middle" font-size="14" fill="${isSelected ? '#1e293b' : '#f59e0b'}">🚏</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  });
}

export default function StopMarkersLayer({ stops = [], selectedStopId, onStopSelect }) {
  if (!stops.length) return null;

  return (
    <>
      {stops.map(stop => {
        if (!stop.latitude || !stop.longitude) return null;
        const isSelected = stop.id === selectedStopId;
        return (
          <Marker
            key={stop.id}
            position={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
            icon={createStopIcon(isSelected)}
            zIndexOffset={isSelected ? 900 : 100}
            eventHandlers={{
              click: () => onStopSelect?.(stop),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '140px', padding: '4px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                  🚏 {stop.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                  {stop.address || 'Bus Stop'}
                </div>
                <button
                  onClick={() => onStopSelect?.(stop)}
                  style={{
                    width: '100%', padding: '5px 8px', background: '#f59e0b', color: '#1e293b',
                    border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '11px', cursor: 'pointer',
                  }}
                >
                  View Arrivals →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
