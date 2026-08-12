'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { use } from 'react';
import useBusStore, { useFilteredBuses } from '../../../store/busStore';
import { useBusTracking } from '../../../hooks/useBusTracking';
import { useLocation } from '../../../hooks/useLocation';
import ETACard from '../../../components/ETACard';
import Link from 'next/link';

const MapView = dynamic(() => import('../../../components/MapView'), { ssr: false, loading: () => (
  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-secondary)', borderRadius:'12px' }}>
    <p style={{ color:'var(--text-muted)' }}>Loading map…</p>
  </div>
)});

export default function TrackingPage({ params }) {
  const { busId } = use(params);
  const { selectedBus } = useBusTracking(busId);
  const { location: userLocation } = useLocation();
  const buses = useFilteredBuses();
  const bus = selectedBus || buses.find(b => (b.busId || b.id) === busId);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, background: 'rgba(13,20,36,0.98)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
          ← Back
        </Link>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {bus ? `Tracking Bus #${bus.busNumber || bus.number}` : 'Bus Tracking'}
          </h1>
          {bus?.routeName && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{bus.routeName}</p>}
        </div>
        {bus && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>● Live</span>}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', gap: '12px', padding: '12px', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <MapView
            buses={bus ? [bus] : []}
            selectedBusId={busId}
            userLocation={userLocation}
          />
        </div>

        {/* Info panel */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          <ETACard bus={bus} />

          {/* Live coordinates */}
          {bus?.latitude && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '16px' }}
            >
              <h3 style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GPS Coordinates</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Latitude', value: bus.latitude?.toFixed(6) },
                  { label: 'Longitude', value: bus.longitude?.toFixed(6) },
                  { label: 'Speed', value: `${Math.round(bus.speed || 0)} km/h` },
                  { label: 'Heading', value: `${Math.round(bus.heading || 0)}°` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Share */}
          <button
            id="share-trip-btn"
            onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            📤 Share Tracking Link
          </button>
        </div>
      </div>
    </div>
  );
}
