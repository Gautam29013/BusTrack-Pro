'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import useBusStore, { useFilteredBuses } from '../../store/busStore';
import useUIStore from '../../store/uiStore';
import { useBusTracking } from '../../hooks/useBusTracking';
import { useLocation } from '../../hooks/useLocation';
import BusList from '../../components/BusList';
import ETACard from '../../components/ETACard';
import StopPanel from '../../components/StopPanel';
import TripPlanner from '../../components/TripPlanner';
import SavedStopsPanel from '../../components/SavedStopsPanel';
import NotificationBanner from '../../components/NotificationBanner';
import { useBusProximityAlerts } from '../../hooks/useNotifications';
import api from '../../lib/api';

// Dynamic import for SSR safety (Leaflet)
const MapView = dynamic(() => import('../../components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
        <p style={{ fontSize: '14px' }}>Loading map…</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stops, setStops] = useState([]);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const isConnected = useBusStore((s) => s.isConnected);
  const { buses } = useBusTracking();
  const { location: userLocation } = useLocation();
  const busList = useFilteredBuses();

  const selectedBus = selectedBusId
    ? (busList.find(b => (b.busId || b.id) === selectedBusId) || null)
    : null;

  // Watch selected bus for ETA push notifications (≤ 2 min away)
  useBusProximityAlerts(selectedBusId);

  // Fetch stops on mount
  useEffect(() => {
    api.get('/stops').then(({ data }) => {
      if (data.success) setStops(data.data);
    }).catch(() => {});
  }, []);

  // Clicking a bus clears any open stop panel
  function handleBusSelect(busId) {
    setSelectedBusId(busId);
    setSelectedStop(null);
  }

  // Clicking a stop clears bus selection
  function handleStopSelect(stop) {
    setSelectedStop(stop);
    setSelectedBusId(null);
  }

  // Deviated buses count for stat bar
  const deviatedCount = busList.filter(b => b.isDeviated).length;
  const fullBuses = busList.filter(b => b.crowdLevel === 'full').length;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          overflow: 'hidden',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-glass)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sidebar header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '4px' }}>Active Buses</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isConnected ? '🟢 Connected · Real-time updates' : '⚪ Connecting…'}
            </p>
          </div>

          {/* ETA Card */}
          <div style={{ padding: '12px' }}>
            <ETACard bus={selectedBus} />
          </div>

          {/* Bus List */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <BusList onSelect={handleBusSelect} selectedId={selectedBusId} />
          </div>
        </div>
      </motion.div>

      {/* Map area */}
      <div style={{ flex: 1, padding: '12px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        
        {/* Sidebar Toggle Rail / Handle */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            width: '12px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            color: 'transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { 
            e.target.style.background = 'var(--bg-glass-hover)'; 
            e.target.style.color = 'var(--text-primary)'; 
            e.target.style.width = '24px';
            e.target.style.border = '1px solid var(--border)';
            e.target.style.borderLeft = 'none';
            e.target.style.borderRadius = '0 8px 8px 0';
            e.target.style.boxShadow = '4px 0 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => { 
            e.target.style.background = 'transparent'; 
            e.target.style.color = 'transparent';
            e.target.style.width = '12px';
            e.target.style.border = 'none';
            e.target.style.boxShadow = 'none';
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Map fills the rest of the column */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <MapView
            buses={busList}
            stops={stops}
            selectedBusId={selectedBusId}
            onBusSelect={handleBusSelect}
            selectedStopId={selectedStop?.id}
            onStopSelect={handleStopSelect}
            userLocation={userLocation}
          />
        </div>

        {/* Stop arrivals panel — overlays top-right of map */}
        {selectedStop && (
          <StopPanel
            stop={selectedStop}
            onClose={() => setSelectedStop(null)}
          />
        )}

        {/* Trip Planner overlay */}
        <AnimatePresence>
          {showPlanner && (
            <TripPlanner
              stops={stops}
              buses={busList}
              onClose={() => setShowPlanner(false)}
            />
          )}
        </AnimatePresence>

        {/* Saved Stops overlay */}
        <AnimatePresence>
          {showSaved && (
            <SavedStopsPanel
              onSelectStop={handleStopSelect}
              onClose={() => setShowSaved(false)}
            />
          )}
        </AnimatePresence>

        {/* FAB Buttons for Map */}
        <div style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 900, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => { setShowPlanner(!showPlanner); setShowSaved(false); }}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: showPlanner ? '#8b5cf6' : 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
            title="Trip Planner"
          >
            🗺️
          </button>
          <button
            onClick={() => { setShowSaved(!showSaved); setShowPlanner(false); }}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: showSaved ? '#f59e0b' : 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
            title="Saved Stops"
          >
            ⭐
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 500,
          pointerEvents: 'none',
        }}>
          {[
            { label: 'Buses Online', value: busList.filter(b => b.speed > 0).length, color: 'var(--accent-emerald)' },
            { label: 'Total Active', value: busList.length, color: 'var(--accent-blue)' },
            { label: 'Avg Speed', value: `${Math.round(busList.reduce((a, b) => a + (b.speed || 0), 0) / (busList.length || 1))} km/h`, color: '#f59e0b' },
            ...(deviatedCount > 0 ? [{ label: 'Deviated ⚠️', value: deviatedCount, color: 'var(--accent-rose)' }] : []),
            ...(fullBuses > 0 ? [{ label: 'Full 🔴', value: fullBuses, color: 'var(--accent-rose)' }] : []),
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(13,20,36,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
              minWidth: '90px',
              pointerEvents: 'auto',
            }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <NotificationBanner />
    </div>
  );
}
