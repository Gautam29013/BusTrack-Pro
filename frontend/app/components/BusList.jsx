'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useBusStore, { useFilteredBuses } from '../store/busStore';
import CrowdBadge from './CrowdBadge';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const ROUTE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

function getAge(date) {
  if (!date) return 'No data';
  const secs = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  return `${Math.round(secs / 60)}m ago`;
}

export default function BusList({ onSelect, selectedId }) {
  const router = useRouter();
  const buses = useFilteredBuses();
  const searchQuery = useBusStore((s) => s.searchQuery);
  const setSearch = useBusStore((s) => s.setSearch);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id="bus-search"
            type="text"
            className="input-field"
            placeholder="Search bus or route..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Count */}
      <div style={{ padding: '10px 16px 6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
        {buses.length} buses active
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
        {buses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚌</div>
            <p style={{ fontSize: '14px' }}>No buses found</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {buses.map((bus, i) => {
                const isSelected = (bus.busId || bus.id) === selectedId;
                const color = ROUTE_COLORS[i % ROUTE_COLORS.length];

                return (
                  <motion.div
                    key={bus.busId || bus.id}
                    variants={itemVariants}
                    layout
                    onClick={() => onSelect?.(bus.busId || bus.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? `${color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{ scale: 1.01, background: isSelected ? `${color}20` : 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Color dot */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        🚌
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                            #{bus.busNumber || bus.number}
                          </span>
                          {bus.isDeviated && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)', padding: '1px 5px', borderRadius: '99px', border: '1px solid rgba(244,63,94,0.3)' }}>⚠️</span>
                          )}
                          <span className="badge badge-green" style={{ fontSize: '10px' }}>Live</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                          {bus.routeName || 'City Route'}
                        </div>
                        <CrowdBadge level={bus.crowdLevel || 'unknown'} variant="badge" />
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {bus.eta_minutes && (
                          <div style={{ fontSize: '14px', fontWeight: 800, color: bus.eta_minutes <= 2 ? 'var(--accent-rose)' : 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif' }}>
                            {bus.eta_minutes}<span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)' }}> min</span>
                          </div>
                        )}
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {Math.round(bus.speed || 0)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>km/h</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {getAge(bus.lastUpdated || bus.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Track button */}
                    {isSelected && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={(e) => { e.stopPropagation(); router.push(`/tracking/${bus.busId || bus.id}`); }}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '13px', background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                      >
                        🔍 Track this bus
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
