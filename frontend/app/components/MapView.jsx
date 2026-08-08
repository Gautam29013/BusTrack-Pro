'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false });

// Haversine distance
function getDistance(p1, p2) {
  const R = 6371; // km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Dynamic layers
const BusMarkersLayer = dynamic(() => import('./BusMarkersLayer'), { ssr: false });
const StopMarkersLayer = dynamic(() => import('./StopMarkersLayer'), { ssr: false });

export default function MapView({ buses = [], stops = [], selectedBusId, onBusSelect, onStopSelect, selectedStopId, userLocation }) {
  const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi
  const DEFAULT_ZOOM = 13;

  const selectedBus = selectedBusId ? buses.find(b => (b.busId || b.id) === selectedBusId) : null;
  const distanceToBus = (selectedBus && userLocation) 
    ? getDistance(userLocation, { lat: selectedBus.lat || selectedBus.latitude, lng: selectedBus.lng || selectedBus.longitude })
    : null;

  const mapRef = useRef(null);

  const handleLocateMe = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        ref={mapRef}
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
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy || 50}
              pathOptions={{ color: 'var(--accent-blue)', fillColor: 'var(--accent-blue)', fillOpacity: 0.15, weight: 1 }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={6}
              pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
            />
          </>
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

        {/* Distance Polyline between User and Selected Bus */}
        {userLocation && selectedBus && (
          <Polyline 
            positions={[
              [userLocation.lat, userLocation.lng], 
              [selectedBus.lat || selectedBus.latitude, selectedBus.lng || selectedBus.longitude]
            ]}
            pathOptions={{ color: 'var(--accent-emerald)', weight: 3, dashArray: '5, 10' }}
          >
            <Tooltip permanent direction="center" className="distance-tooltip" offset={[0, 0]}>
              <div style={{ background: 'rgba(16,185,129,0.9)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {distanceToBus < 1 ? `${Math.round(distanceToBus * 1000)} m` : `${distanceToBus.toFixed(1)} km`}
              </div>
            </Tooltip>
          </Polyline>
        )}
      </MapContainer>

      {/* Map legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-bright)',
        borderRadius: '10px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
          <span>On route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-rose)' }} />
          <span>Deviated ⚠️</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>🚏</span>
          <span>Bus stop</span>
        </div>
        {buses.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {buses.length} active
          </div>
        )}
      </div>

      {/* Locate Me Button */}
      {userLocation && (
        <button
          onClick={handleLocateMe}
          style={{
            position: 'absolute',
            bottom: '140px', // placed above the legend
            right: '16px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            color: 'var(--accent-blue)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--bg-glass-hover)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--bg-glass)'}
          title="Go to my location"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4 12H2" />
            <path d="M22 12h-2" />
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
      )}
    </div>
  );
}
