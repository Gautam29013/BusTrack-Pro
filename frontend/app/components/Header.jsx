'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import useThemeStore from '../store/useThemeStore';
import useI18nStore from '../store/i18nStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useBusStore from '../store/busStore';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const isConnected = useBusStore((s) => s.isConnected);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { theme, setTheme } = useThemeStore();
  const { lang, setLang, t } = useI18nStore();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    router.push('/');
  }

  // Update theme dynamically
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header style={{
      height: '60px',
      background: 'rgba(13,20,36,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Sidebar toggle */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🚌</div>
        <span style={{ fontWeight: 700, fontSize: '16px', color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}>BusTrackPro</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', gap: '20px', marginLeft: '32px' }}>
        <Link href="/analytics" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f1f5f9'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
          {t('analytics')} 📊
        </Link>
        <Link href="/admin" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f1f5f9'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
          Admin Dashboard 🛠️
        </Link>
        <Link href="/driver" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f1f5f9'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
          Driver Portal 🚍
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '16px' }}>
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', outline: 'none' }}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="hi">HI</option>
        </select>
        <select 
          value={theme} 
          onChange={handleThemeChange}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', outline: 'none' }}
        >
          <option value="dark">🌙 Dark</option>
          <option value="light">☀️ Light</option>
          <option value="high-contrast">👁️ Contrast</option>
        </select>
      </div>

      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isConnected ? '#10b981' : '#94a3b8' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isConnected ? '#10b981' : '#475569', boxShadow: isConnected ? '0 0 8px #10b981' : 'none' }} />
        {isConnected ? 'Live' : 'Connecting…'}
      </div>

      {/* User actions */}
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/profile" id="profile-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
          </Link>
          <button id="logout-btn" onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>Sign out</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/login" className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>Sign in</Link>
          <Link href="/signup" className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Sign up</Link>
        </div>
      )}
    </header>
  );
}
