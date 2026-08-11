'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useThemeStore from './store/useThemeStore';

const FEATURES = [
  { icon: '📍', title: 'Live GPS Tracking', desc: 'See every bus location update in real-time on an interactive map.' },
  { icon: '⏱️', title: 'Smart ETA', desc: 'Accurate arrival predictions using Haversine distance calculations.' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Get notified when your bus is approaching your stop.' },
  { icon: '🛡️', title: 'Secure Auth', desc: 'JWT-protected accounts with Google OAuth support.' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LandingPage() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', transition: 'background 0.3s ease' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚌</div>
          <span style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>BusTrackPro</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              color: 'var(--text-secondary)', 
              borderRadius: '50%', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '16px'
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '14px' }}>Sign in</Link>
          <Link href="/signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: '24px', fontSize: '13px', color: 'var(--accent-blue)', fontWeight: '500' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live tracking enabled
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>
            Track Every Bus.{' '}
            <span className="gradient-text">In Real Time.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Live GPS updates, smart ETA predictions, and smooth map animations — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              🗺️ Open Dashboard
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Create Account
            </Link>
          </div>
        </motion.div>

        {/* Map preview card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="glass-card glow-blue"
          style={{ padding: '2px', borderRadius: '20px', marginBottom: '80px', overflow: 'hidden' }}
        >
          <div style={{ height: '360px', borderRadius: '18px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Fake map grid lines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            {/* Bus markers demo */}
            {[
              { top: '30%', left: '25%', color: '#3b82f6', num: 'B101', delay: 0 },
              { top: '55%', left: '50%', color: '#10b981', num: 'B202', delay: 0.5 },
              { top: '25%', left: '65%', color: '#f59e0b', num: 'B303', delay: 1 },
              { top: '65%', left: '35%', color: '#8b5cf6', num: 'B404', delay: 1.5 },
              { top: '45%', left: '75%', color: '#06b6d4', num: 'B505', delay: 0.8 },
            ].map((bus) => (
              <motion.div
                key={bus.num}
                style={{ position: 'absolute', top: bus.top, left: bus.left }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: bus.delay + 0.5, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: bus.color, opacity: 0.2, animation: 'pulseRing 2s infinite' }} />
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: bus.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: `0 4px 20px ${bus.color}60` }}>🚌</div>
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px', background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{bus.num}</div>
                </div>
              </motion.div>
            ))}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              🗺️ Interactive live map
            </div>
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={itemVariants} className="glass-card" style={{ padding: '28px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        © {new Date().getFullYear()} BusTrackPro — Real-Time Bus Tracking System
      </footer>
    </div>
  );
}
