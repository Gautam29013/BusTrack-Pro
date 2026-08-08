'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrowdBadge from './CrowdBadge';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/api';

function ETADisplay({ minutes }) {
  const isNear = minutes <= 2;
  const isVeryNear = minutes <= 1;
  const color = isVeryNear ? '#f43f5e' : isNear ? '#f59e0b' : '#3b82f6';

  return (
    <motion.div
      animate={isNear ? { scale: [1, 1.04, 1] } : {}}
      transition={isNear ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : {}}
    >
      <div style={{
        fontSize: '42px',
        fontWeight: 800,
        fontFamily: 'Space Grotesk, sans-serif',
        color,
        lineHeight: 1,
        textShadow: isNear ? `0 0 20px ${color}60` : 'none',
      }}>
        {minutes}
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
        min{minutes !== 1 ? 's' : ''} away
      </div>
    </motion.div>
  );
}

function DeviationAlert({ deviationKm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: 'rgba(244,63,94,0.12)',
        border: '1px solid rgba(244,63,94,0.35)',
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        style={{ fontSize: '18px', flexShrink: 0 }}
      >
        ⚠️
      </motion.div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#f43f5e' }}>Route Deviation Detected</div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
          Bus is {deviationKm ? `${(deviationKm * 1000).toFixed(0)}m` : ''} off its scheduled route
        </div>
      </div>
    </motion.div>
  );
}

export default function ETACard({ bus, selectedStop, onClose }) {
  const { user, isAuthenticated } = useAuthStore();
  const [showSmsInput, setShowSmsInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAlerting, setIsAlerting] = useState(false);

  if (!bus) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#475569' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚌</div>
        <p style={{ fontSize: '13px' }}>Select a bus to see ETA</p>
      </div>
    );
  }

  const etaMinutes = bus.eta_minutes ?? null;
  const crowdLevel = bus.crowdLevel || 'unknown';
  const passengerCount = bus.passengerCount;
  const isDeviated = bus.isDeviated || false;
  const deviationKm = bus.deviationKm || 0;

  // Progress bar: 100% when bus is here (0 min), 0% when 20+ min away
  const arrivalProgress = etaMinutes !== null
    ? Math.max(5, 100 - (etaMinutes / 20 * 100))
    : 0;

  return (
    <motion.div
      key={bus.busId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow bg */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Now Tracking</div>
          <div style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>Bus #{bus.busNumber || bus.number}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{bus.routeName || 'City Route'}</div>
        </div>
        <span className="badge badge-green">● Live</span>
      </div>

      {/* Deviation alert */}
      <AnimatePresence>
        {isDeviated && <DeviationAlert deviationKm={deviationKm} />}
      </AnimatePresence>

      {/* ETA row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
        {etaMinutes !== null
          ? <ETADisplay minutes={etaMinutes} />
          : <div className="shimmer" style={{ width: '60px', height: '60px', borderRadius: '8px' }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Arrival progress</div>
          <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${arrivalProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            />
          </div>
          {etaMinutes !== null && (
            <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
              {etaMinutes <= 1 ? 'Arriving now' : `${etaMinutes} min estimated`}
            </div>
          )}
        </div>
      </div>

      {/* Crowd Level */}
      <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CrowdBadge level={crowdLevel} variant="full" passengerCount={passengerCount} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[
          { label: 'Speed', value: `${Math.round(bus.speed || 0)}`, unit: 'km/h', icon: '🚀' },
          { label: 'Heading', value: `${Math.round(bus.heading || 0)}`, unit: '°', icon: '🧭' },
          { label: isDeviated ? 'Off-route' : 'On-route', value: isDeviated ? '⚠️' : '✅', unit: '', icon: '📍' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center', padding: '10px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px solid ${isDeviated && stat.label === 'Off-route' ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{stat.value}<span style={{ fontSize: '10px', color: '#475569' }}>{stat.unit}</span></div>
            <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Log Trip Button */}
      {isAuthenticated && (
        <button
          onClick={async () => {
            try {
              await api.post('/users/history', { 
                busId: bus.id, 
                routeId: bus.routeId, 
                fromStopId: selectedStop?.id 
              });
              toast.success('Trip saved to Journey History!');
            } catch (e) {
              toast.error('Failed to save trip');
            }
          }}
          style={{ width: '100%', marginTop: '12px', padding: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(59,130,246,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(59,130,246,0.1)'}
        >
          Track & Log Journey
        </button>
      )}

      {/* SMS Alert Section */}
      <div style={{ marginTop: '12px' }}>
        {!showSmsInput ? (
          <button
            onClick={() => setShowSmsInput(true)}
            style={{ width: '100%', padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(16,185,129,0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(16,185,129,0.1)'}
          >
            🔔 Alert me via SMS
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Enter phone number for ETA alert:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-field"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              />
              <button
                disabled={isAlerting}
                onClick={async () => {
                  if (!phoneNumber) return toast.error('Enter a valid number');
                  setIsAlerting(true);
                  try {
                    await api.post('/alerts/subscribe', {
                      phoneNumber,
                      busId: bus.id,
                      stopName: selectedStop?.name || 'your stop',
                      threshold: 5
                    });
                    toast.success('SMS Alert Set!');
                    setShowSmsInput(false);
                  } catch (e) {
                    toast.error('Failed to set alert');
                  } finally {
                    setIsAlerting(false);
                  }
                }}
                className="btn-primary"
                style={{ padding: '8px 12px', fontSize: '13px' }}
              >
                {isAlerting ? '...' : 'Set'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
