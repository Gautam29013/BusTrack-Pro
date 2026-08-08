'use client';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFavoritesStore from '../store/favoritesStore';

export default function SavedStopsPanel({ onSelectStop, onClose }) {
  const savedStopsMap = useFavoritesStore((s) => s.savedStops);
  const savedStops = useMemo(() => Object.values(savedStopsMap), [savedStopsMap]);
  const removeStop = useFavoritesStore((s) => s.removeStop);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      style={{
        position: 'absolute',
        bottom: '60px',
        left: '12px',
        width: '280px',
        background: 'rgba(13,20,36,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⭐</span>
          <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>Saved Stops</span>
          {savedStops.length > 0 && (
            <span style={{ fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '1px 6px', borderRadius: '99px', border: '1px solid rgba(245,158,11,0.2)' }}>
              {savedStops.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '5px 7px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>✕</button>
      </div>

      <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '10px' }}>
        {savedStops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚏</div>
            <p style={{ fontSize: '12px' }}>No saved stops yet</p>
            <p style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>Click ⭐ on any stop to save it</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <AnimatePresence>
              {savedStops.map((stop) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => { onSelectStop?.(stop); onClose?.(); }}
                  whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div style={{ fontSize: '18px', flexShrink: 0 }}>🚏</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stop.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stop.address || 'Bus Stop'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeStop(stop.id); }}
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: '#f43f5e', fontSize: '12px', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {savedStops.length > 0 && (
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => useFavoritesStore.getState().clearAll()}
            style={{ width: '100%', padding: '6px', background: 'none', border: 'none', color: '#475569', fontSize: '11px', cursor: 'pointer' }}
          >
            Clear all saved stops
          </button>
        </div>
      )}
    </motion.div>
  );
}
