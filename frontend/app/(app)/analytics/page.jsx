'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '../../lib/api';
import { PunctualityChart, RidershipChart } from '../../components/AnalyticsCharts';

const AnalyticsHeatmap = dynamic(() => import('../../components/AnalyticsHeatmap'), { ssr: false });

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}>⏳</div>
          <div>Loading Analytics...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '8px' }}>
            System Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Real-time insights and historical performance metrics.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Avg Punctuality', value: '86%', trend: '+2.4%', good: true, icon: '⏱️' },
            { label: 'Daily Ridership', value: '14.2k', trend: '+12%', good: true, icon: '👥' },
            { label: 'Active Routes', value: data.routes.length, trend: '0%', good: true, icon: '🚌' },
            { label: 'Congestion Alerts', value: '12', trend: '-3', good: true, icon: '⚠️' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', marginTop: '8px', color: stat.good ? 'var(--accent-emerald)' : 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {stat.trend.startsWith('+') ? '↑' : stat.trend.startsWith('-') ? '↓' : '→'} {stat.trend.replace(/[+-]/, '')} from last week
                </div>
              </div>
              <div style={{ fontSize: '24px', opacity: 0.8 }}>{stat.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* Punctuality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Punctuality Dashboard</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>On-time performance across routes (Last 7 Days)</p>
            </div>
            <PunctualityChart data={data.punctuality} routes={data.routes} />
          </motion.div>

          {/* Ridership */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Ridership Stats</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Passenger volume (Peak Hours)</p>
            </div>
            <RidershipChart data={data.ridership} routes={data.routes} />
          </motion.div>
        </div>

        {/* Heatmap Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ padding: '24px', height: '500px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Congestion Heatmap</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Live passenger density at stops</p>
          </div>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
            <AnalyticsHeatmap heatmapData={data.heatmap} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
