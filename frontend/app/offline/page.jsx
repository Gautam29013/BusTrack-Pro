'use client';
export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', textAlign: 'center', padding: '20px' }}>
      <div>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚌</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>You're Offline</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', maxWidth: '340px' }}>
          No internet connection. We're showing you the last-known bus positions from cache.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
