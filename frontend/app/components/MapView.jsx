'use client';
import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import useThemeStore from '../store/useThemeStore';

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
  const theme = useThemeStore((s) => s.theme);
  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi
  const DEFAULT_ZOOM = 13;

  const selectedBus = selectedBusId ? buses.find(b => (b.busId || b.id) === selectedBusId) : null;
  const distanceToBus = (selectedBus && userLocation) 
    ? getDistance(userLocation, { lat: selectedBus.lat || selectedBus.latitude, lng: selectedBus.lng || selectedBus.longitude })
    : null;

  const mapRef = useRef(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [routePath, setRoutePath] = useState(null);

  // Fetch actual road route from OSRM between user and bus
  useEffect(() => {
    if (userLocation && selectedBus) {
      const fetchRoute = async () => {
        try {
          const start = `${userLocation.lng},${userLocation.lat}`;
          const end = `${selectedBus.lng || selectedBus.longitude},${selectedBus.lat || selectedBus.latitude}`;
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
          const data = await res.json();
          
          if (data && data.routes && data.routes.length > 0) {
            // OSRM returns coordinates as [lng, lat], Leaflet needs [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePath(coords);
          } else {
            setRoutePath(null);
          }
        } catch (err) {
          console.error('Failed to fetch route:', err);
          setRoutePath(null);
        }
      };
      fetchRoute();
    } else {
      setRoutePath(null);
    }
  }, [userLocation, selectedBus]);

  useEffect(() => {
    // Auto-center on user location on first load with animation
    if (userLocation && mapRef.current && !hasCentered) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1.5 });
      setHasCentered(true);
    }
  }, [userLocation, hasCentered]);

  const handleLocateMe = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  };

  let nearestBus = null;
  let minBusDist = Infinity;
  let nearestStop = null;
  let minStopDist = Infinity;

  if (userLocation) {
    buses.forEach(b => {
      const d = getDistance(userLocation, { lat: b.lat || b.latitude, lng: b.lng || b.longitude });
      if (d < minBusDist) {
        minBusDist = d;
        nearestBus = b;
      }
    });

    stops.forEach(s => {
      const d = getDistance(userLocation, { lat: s.latitude || s.lat, lng: s.longitude || s.lng });
      if (d < minStopDist) {
        minStopDist = d;
        nearestStop = s;
      }
    });
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        ref={mapRef}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; CARTO'
        />

        {/* User location */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy || 50}
              pathOptions={{ color: 'var(--accent-blue)', fillColor: 'var(--accent-blue)', fillOpacity: 0.15, weight: 1 }}
            />
            {/* 2km Radius indicating nearby area */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={2000}
              pathOptions={{ color: 'var(--accent-emerald)', fillOpacity: 0.03, weight: 1, dashArray: '5, 5' }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={6}
              pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
            />
          </>
        )}

        {/* Nearest Bus Connection */}
        {userLocation && nearestBus && !selectedBusId && (
          <Polyline 
            positions={[
              [userLocation.lat, userLocation.lng], 
              [nearestBus.lat || nearestBus.latitude, nearestBus.lng || nearestBus.longitude]
            ]}
            pathOptions={{ color: 'var(--accent-emerald)', weight: 2, opacity: 0.7, dashArray: '5, 8' }}
          >
            <Tooltip permanent direction="center" className="distance-tooltip" offset={[0, 0]}>
              <div style={{ background: 'var(--accent-emerald)', color: 'white', padding: '2px 6px', borderRadius: '6px', fontWeight: 600, fontSize: '11px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                Nearest Bus: {minBusDist < 1 ? `${Math.round(minBusDist * 1000)}m` : `${minBusDist.toFixed(1)}km`}
              </div>
            </Tooltip>
          </Polyline>
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
            positions={routePath || [
              [userLocation.lat, userLocation.lng], 
              [selectedBus.lat || selectedBus.latitude, selectedBus.lng || selectedBus.longitude]
            ]}
            pathOptions={{ color: 'var(--accent-blue)', weight: 5, opacity: 0.8 }}
          >
            <Tooltip permanent direction="center" className="distance-tooltip" offset={[0, 0]}>
              <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
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
