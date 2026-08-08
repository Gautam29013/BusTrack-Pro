'use client';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

// Dynamic layers
const BusMarkersLayer = dynamic(() => import('./BusMarkersLayer'), { ssr: false });
const StopMarkersLayer = dynamic(() => import('./StopMarkersLayer'), { ssr: false });

export default function MapView({ buses = [], stops = [], selectedBusId, onBusSelect, onStopSelect, selectedStopId, userLocation }) {
  const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi
  const DEFAULT_ZOOM = 13;

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        {/* User location */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocation.accuracy || 50}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}
          />
        )}

        {/* Stop markers — rendered below buses */}
        <StopMarkersLayer
          stops={stops}
          selectedStopId={selectedStopId}
          onStopSelect={onStopSelect}
        />

        {/* Bus markers */}
        <BusMarkersLayer
          buses={buses}
          selectedBusId={selectedBusId}
          onBusSelect={onBusSelect}
        />
      </MapContainer>

      {/* Map legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'rgba(13,20,36,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        fontSize: '12px',
        color: '#94a3b8',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span>On route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
          <span>Deviated ⚠️</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>🚏</span>
          <span>Bus stop</span>
        </div>
        {buses.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '6px', fontWeight: 600, color: '#f1f5f9' }}>
            {buses.length} active
          </div>
        )}
      </div>
    </div>
  );
}
