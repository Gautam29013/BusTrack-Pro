'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';

/**
 * NotificationBanner — prompts user to enable notifications
 * Shows once, remembers dismissal in localStorage.
 */
export default function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | asking | granted | denied
  const { requestPermission } = useNotifications();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    const dismissed = localStorage.getItem('notif-banner-dismissed');
    if (!dismissed) {
      // Show after 3 second delay
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  async function handleEnable() {
    setStatus('asking');
    const result = await requestPermission();
    setStatus(result);
    if (result === 'granted') {
      setTimeout(() => setShow(false), 2000);
    }
    localStorage.setItem('notif-banner-dismissed', '1');
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('notif-banner-dismissed', '1');
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(420px, calc(100vw - 32px))',
            background: 'rgba(13,20,36,0.97)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '16px',
            padding: '16px 20px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.08)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
            🔔
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', fontFamily: 'Space Grotesk, sans-serif' }}>
              {status === 'granted' ? '✅ Notifications enabled!' : 'Get bus arrival alerts'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {status === 'granted'
                ? "You'll be notified when your bus is 2 min away."
                : 'We\'ll notify you when your bus is 2 stops away.'}
            </div>
          </div>

          {status === 'idle' && (
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleDismiss}
                style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
              >
                Later
              </button>
              <button
                onClick={handleEnable}
                style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Enable
              </button>
            </div>
          )}

          {status === 'asking' && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>Waiting…</div>
          )}

          {status === 'granted' && (
            <div style={{ fontSize: '20px', flexShrink: 0 }}>🎉</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
