'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const ROUTE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

/**
 * Haversine distance between two lat/lng points in km
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find best bus route(s) between two stops.
 * Returns direct matches first, then suggests transfers.
 */
function planTrip(fromStop, toStop, stops, buses) {
  if (!fromStop || !toStop) return [];

  const results = [];

  // Find all buses and check if any serve both stops on the same route
  const routeStopMap = {}; // routeId -> [stops on that route]
  stops.forEach((s) => {
    if (s.routeId) {
      if (!routeStopMap[s.routeId]) routeStopMap[s.routeId] = [];
      routeStopMap[s.routeId].push(s);
    }
  });

  // Group buses by route
  const busesByRoute = {};
  buses.forEach((b) => {
    if (b.routeId) {
      if (!busesByRoute[b.routeId]) busesByRoute[b.routeId] = [];
      busesByRoute[b.routeId].push(b);
    }
  });

  // Direct route: same routeId for from/to (using nearby stops)
  const fromLat = parseFloat(fromStop.latitude);
  const fromLng = parseFloat(fromStop.longitude);
  const toLat = parseFloat(toStop.latitude);
  const toLng = parseFloat(toStop.longitude);

  // Find closest active bus to the origin stop
  const nearbyBuses = buses
    .filter((b) => b.latitude && b.longitude)
    .map((b) => ({
      ...b,
      distToFrom: haversine(parseFloat(b.latitude), parseFloat(b.longitude), fromLat, fromLng),
    }))
    .sort((a, b) => a.distToFrom - b.distToFrom)
    .slice(0, 5);

  nearbyBuses.forEach((bus, idx) => {
    const totalDist = haversine(fromLat, fromLng, toLat, toLng);
    const eta = bus.eta_minutes || Math.round((totalDist / Math.max(5, bus.speed || 20)) * 60 + 2);
    const walkMinutes = Math.round(bus.distToFrom * 12); // ~5 km/h walking

    results.push({
      id: `route-${idx}`,
      type: 'direct',
      legs: [
        {
          type: 'walk',
          label: `Walk to nearest stop`,
          duration: Math.max(1, walkMinutes),
          icon: '🚶',
        },
        {
          type: 'bus',
          busNumber: bus.busNumber || bus.number,
          busId: bus.busId || bus.id,
          routeName: bus.routeName || 'City Route',
          routeColor: ROUTE_COLORS[idx % ROUTE_COLORS.length],
          from: fromStop.name,
          to: toStop.name,
          duration: eta,
          crowdLevel: bus.crowdLevel || 'unknown',
          eta_minutes: bus.eta_minutes || eta,
          icon: '🚌',
        },
      ],
      totalMinutes: Math.max(1, walkMinutes) + eta,
    });
  });

  // If no buses found, show a placeholder suggestion
  if (results.length === 0) {
    const dist = haversine(fromLat, fromLng, toLat, toLng);
    results.push({
      id: 'walk-only',
      type: 'walk',
      legs: [{ type: 'walk', label: 'Walk entire route', duration: Math.round(dist * 12), icon: '🚶' }],
      totalMinutes: Math.round(dist * 12),
    });
  }

  return results.slice(0, 3); // Top 3 options
}

const CROWD_COLOR = { empty: '#10b981', moderate: '#f59e0b', full: '#f43f5e', unknown: '#475569' };

function StopSelector({ label, value, onChange, stops, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => stops.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [stops, query]
  );

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <div
        onClick={() => setOpen(true)}
        style={{
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          color: value ? '#f1f5f9' : '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '16px' }}>{label.includes('From') ? '📍' : '🏁'}</span>
        {value ? value.name : placeholder}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: 'rgba(13,20,36,0.99)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                zIndex: 999,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '10px' }}>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stops..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filtered.map((stop) => (
                  <div
                    key={stop.id}
                    onClick={() => { onChange(stop); setOpen(false); setQuery(''); }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🚏</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{stop.name}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{stop.address}</div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>No stops found</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TripCard({ trip, idx }) {
  const totalMin = trip.totalMinutes;
  const colors = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      style={{
        padding: '14px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${idx === 0 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {idx === 0 && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          fontSize: '10px', fontWeight: 700, color: '#3b82f6',
          background: 'rgba(59,130,246,0.12)', padding: '2px 8px',
          borderRadius: '99px', border: '1px solid rgba(59,130,246,0.2)',
        }}>
          ⭐ Fastest
        </div>
      )}

      {/* Total time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: colors[idx] || '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}>
          {totalMin} min
        </div>
        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Legs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {trip.legs.map((leg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: leg.type === 'bus' ? `${leg.routeColor}20` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${leg.type === 'bus' ? leg.routeColor + '40' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0,
            }}>
              {leg.icon}
            </div>
            <div style={{ flex: 1 }}>
              {leg.type === 'bus' ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: leg.routeColor }}>
                    Bus #{leg.busNumber} · {leg.routeName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {leg.from} → {leg.to} · {leg.duration} min
                  </div>
                  <div style={{ fontSize: '11px', color: CROWD_COLOR[leg.crowdLevel], marginTop: '2px' }}>
                    Crowd: {leg.crowdLevel}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: '#94a3b8' }}>{leg.label}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{leg.duration} min</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function TripPlanner({ stops = [], buses = [], onClose }) {
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [results, setResults] = useState([]);
  const [planned, setPlanned] = useState(false);

  const handlePlan = useCallback(() => {
    if (!fromStop || !toStop) return;
    const trips = planTrip(fromStop, toStop, stops, buses);
    setResults(trips);
    setPlanned(true);
  }, [fromStop, toStop, stops, buses]);

  const handleSwap = () => {
    setFromStop(toStop);
    setToStop(fromStop);
    setPlanned(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        width: '320px',
        background: 'rgba(13,20,36,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        zIndex: 1000,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🗺️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>Trip Planner</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>Find the best route</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}>✕</button>
      </div>

      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* Stop selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          <StopSelector label="From Stop" value={fromStop} onChange={(s) => { setFromStop(s); setPlanned(false); }} stops={stops} placeholder="Select origin stop" />

          {/* Swap button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSwap}
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', color: '#8b5cf6', fontSize: '12px', fontWeight: 600 }}
            >
              ⇅ Swap
            </button>
          </div>

          <StopSelector label="To Stop" value={toStop} onChange={(s) => { setToStop(s); setPlanned(false); }} stops={stops} placeholder="Select destination stop" />
        </div>

        {/* Plan button */}
        <button
          onClick={handlePlan}
          disabled={!fromStop || !toStop || fromStop.id === toStop?.id}
          style={{
            width: '100%',
            padding: '12px',
            background: !fromStop || !toStop || fromStop.id === toStop?.id
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            border: 'none',
            borderRadius: '10px',
            color: !fromStop || !toStop ? '#475569' : 'white',
            fontWeight: 700,
            fontSize: '14px',
            cursor: !fromStop || !toStop || fromStop.id === toStop?.id ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          🗺️ Find Best Route
        </button>

        {/* Results */}
        <AnimatePresence>
          {planned && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                {results.length} route{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((trip, idx) => (
                <TripCard key={trip.id} trip={trip} idx={idx} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
