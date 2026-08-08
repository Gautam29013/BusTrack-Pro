'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import useI18nStore from '../../../store/i18nStore';

export default function JourneyHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18nStore();

  useEffect(() => {
    api.get('/users/history')
      .then((res) => {
        if (res.data.success) {
          setHistory(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ animation: 'spin 1s linear infinite', fontSize: '24px' }}>⏳</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('journey_history')}</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Review your past travels and tracked routes.</p>
      </div>

      {history.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚏</div>
          <p>{t('no_history')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: trip.route_color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                {trip.route_number || 'B'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
                  {trip.route_name || 'Unknown Route'}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{trip.from_stop_name || 'Start'}</span>
                  <span>→</span>
                  <span>{trip.to_stop_name || 'End'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {new Date(trip.created_at).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  {new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
