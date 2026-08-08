'use client';
import { useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

const CROWD_LABELS = {
  empty: { label: 'Empty 🟢', color: '#10b981' },
  moderate: { label: 'Moderate 🟡', color: '#f59e0b' },
  full: { label: 'Full 🔴', color: '#f43f5e' },
  unknown: { label: 'Unknown', color: '#475569' },
};

function getColor(index) {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

function createBusIcon(color, isSelected, isDeviated) {
  const size = isSelected ? 48 : 40;
  const pulseRing = isDeviated
    ? `<circle cx="20" cy="20" r="18" fill="none" stroke="#f43f5e" stroke-opacity="0.5" stroke-width="8">
        <animate attributeName="r" from="18" to="26" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite"/>
       </circle>`
    : `<circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-opacity="0.4" stroke-width="${isSelected ? 8 : 6}"/>`;

  const bgColor = isDeviated ? '#f43f5e' : color;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
      ${pulseRing}
      <circle cx="20" cy="20" r="18" fill="${bgColor}" fill-opacity="${isSelected || isDeviated ? 1 : 0.9}" stroke="white" stroke-width="2.5"/>
      <text x="20" y="26" text-anchor="middle" font-size="18" fill="white">${isDeviated ? '⚠️' : '🚌'}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  });
}

function MapCenterOnSelected({ buses, selectedBusId }) {
  const map = useMap();
  const prevId = useRef(null);

  useEffect(() => {
    if (!selectedBusId || selectedBusId === prevId.current) return;
    const bus = buses.find(b => b.busId === selectedBusId || b.id === selectedBusId);
    if (bus?.latitude && bus?.longitude) {
      map.flyTo([bus.latitude, bus.longitude], 15, { animate: true, duration: 1 });
      prevId.current = selectedBusId;
    }
  }, [selectedBusId, buses, map]);

  return null;
}

export default function BusMarkersLayer({ buses, selectedBusId, onBusSelect }) {
  return (
    <>
      <MapCenterOnSelected buses={buses} selectedBusId={selectedBusId} />
      {buses.map((bus, i) => {
        if (!bus.latitude || !bus.longitude) return null;
        const isSelected = bus.busId === selectedBusId || bus.id === selectedBusId;
        const isDeviated = bus.isDeviated || false;
        const color = getColor(i);
        const crowd = CROWD_LABELS[bus.crowdLevel || 'unknown'];

        return (
          <Marker
            key={bus.busId || bus.id}
            position={[bus.latitude, bus.longitude]}
            icon={createBusIcon(color, isSelected, isDeviated)}
            eventHandlers={{
              click: () => onBusSelect?.(bus.busId || bus.id),
            }}
            zIndexOffset={isDeviated ? 1100 : isSelected ? 1000 : 0}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px', padding: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    Bus #{bus.busNumber || bus.number}
                  </div>
                  {isDeviated && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '2px 6px', borderRadius: '99px', border: '1px solid rgba(244,63,94,0.3)' }}>
                      ⚠️ Off-route
                    </span>
                  )}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  {bus.routeName || 'Route N/A'}
                </div>

                {/* Crowd level */}
                <div style={{ marginBottom: '8px', padding: '5px 8px', background: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#374151' }}>Crowd</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: crowd.color }}>{crowd.label}</span>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#374151' }}>
                  <span>🚀 {Math.round(bus.speed || 0)} km/h</span>
                  <span>🧭 {Math.round(bus.heading || 0)}°</span>
                  {bus.eta_minutes && <span>⏱ {bus.eta_minutes} min</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
