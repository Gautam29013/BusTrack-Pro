'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import CrowdBadge from './CrowdBadge';
import useFavoritesStore from '../store/favoritesStore';

const ROUTE_COLORS = {
  'var(--accent-blue)': 'var(--accent-blue)',
  'var(--accent-emerald)': 'var(--accent-emerald)',
  '#f59e0b': '#f59e0b',
  '#8b5cf6': '#8b5cf6',
  '#06b6d4': '#06b6d4',
  'var(--accent-rose)': 'var(--accent-rose)',
};

function EtaChip({ minutes }) {
  const color = minutes <= 2 ? 'var(--accent-rose)' : minutes <= 5 ? '#f59e0b' : 'var(--accent-emerald)';
  return (
    <div style={{
      minWidth: '52px',
      textAlign: 'center',
      padding: '6px 10px',
      borderRadius: '10px',
      background: `${color}18`,
      border: `1px solid ${color}40`,
    }}>
      <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{minutes}</div>
      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>min</div>
    </div>
  );
}

export default function StopPanel({ stop, onClose }) {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isSaved = useFavoritesStore((s) => s.isSavedStop(stop?.id));
  const saveStop = useFavoritesStore((s) => s.saveStop);
  const removeStop = useFavoritesStore((s) => s.removeStop);

  const handleToggleSave = () => {
    if (!stop) return;
    if (isSaved) {
      removeStop(stop.id);
    } else {
      saveStop(stop);
    }
  };

  const fetchArrivals = useCallback(async () => {
    if (!stop?.id) return;
    try {
      const { data } = await api.get(`/stops/${stop.id}/arrivals`);
      if (data.success) {
        setArrivals(data.data.arrivals || []);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [stop?.id]);

  useEffect(() => {
    setLoading(true);
    setArrivals([]);
    fetchArrivals();
    // Refresh every 15 seconds
    const interval = setInterval(fetchArrivals, 15000);
    return () => clearInterval(interval);
  }, [fetchArrivals]);

  if (!stop) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={stop.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '300px',
          background: 'rgba(13,20,36,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                flexShrink: 0,
              }}>🚏</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stop.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {stop.address || 'Bus Stop'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleToggleSave}
              style={{
                background: isSaved ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isSaved ? 'rgba(245,158,11,0.2)' : 'transparent'}`,
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: isSaved ? '#f59e0b' : 'var(--text-secondary)',
                fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={isSaved ? "Remove from saved stops" : "Save stop"}
            >
              {isSaved ? '⭐' : '☆'}
            </button>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
              padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px',
            }}>✕</button>
          </div>
        </div>

        {/* Live arrivals list */}
        <div style={{ padding: '12px', maxHeight: '360px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Arrivals
            </span>
            {lastUpdated && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer" style={{ height: '60px', borderRadius: '10px' }} />
              ))}
            </div>
          ) : arrivals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚌</div>
              <p style={{ fontSize: '13px' }}>No buses serving this stop</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {arrivals.map((arrival, i) => (
                <motion.div
                  key={arrival.busId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {/* Route color strip */}
                  <div style={{ width: '4px', height: '40px', borderRadius: '99px', background: arrival.routeColor || 'var(--accent-blue)', flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>
                      Bus #{arrival.busNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {arrival.routeName}
                    </div>
                    <CrowdBadge level={arrival.crowdLevel} variant="badge" />
                  </div>

                  {/* ETA chip */}
                  <EtaChip minutes={arrival.eta_minutes || '?'} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Actions / Integrations */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=walking`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }}
          >
            🗺️ Walking Directions
          </a>
        </div>

        {/* Refresh hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#334155' }}>🔄 Auto-refreshes every 15 seconds</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
