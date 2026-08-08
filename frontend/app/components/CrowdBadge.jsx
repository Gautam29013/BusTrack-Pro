'use client';
import { motion } from 'framer-motion';

const CROWD_CONFIG = {
  empty: {
    label: 'Empty',
    color: 'var(--accent-emerald)',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    icon: '🟢',
    bars: 1,
  },
  moderate: {
    label: 'Moderate',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    icon: '🟡',
    bars: 2,
  },
  full: {
    label: 'Full',
    color: 'var(--accent-rose)',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.3)',
    icon: '🔴',
    bars: 3,
  },
  unknown: {
    label: 'Unknown',
    color: 'var(--text-muted)',
    bg: 'rgba(71,85,105,0.12)',
    border: 'rgba(71,85,105,0.3)',
    icon: '⚪',
    bars: 0,
  },
};

/**
 * CrowdBadge — displays crowd level as a small badge.
 * @param {string} level - 'empty' | 'moderate' | 'full' | 'unknown'
 * @param {'badge'|'full'} variant - compact badge or expanded bar display
 */
export default function CrowdBadge({ level = 'unknown', variant = 'badge', passengerCount }) {
  const cfg = CROWD_CONFIG[level] || CROWD_CONFIG.unknown;

  if (variant === 'badge') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  }

  // Full variant — shows label + 3-bar indicator
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Crowd Level</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>
            {cfg.label}{passengerCount !== undefined ? ` · ${passengerCount} pax` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '99px',
                background: i <= cfg.bars ? cfg.color : 'rgba(255,255,255,0.08)',
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
