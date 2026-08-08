'use client';
import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useSystemAlerts } from '../hooks/useSystemAlerts';
import Header from '../components/Header';
import useUIStore from '../store/uiStore';

export default function AppLayout({ children }) {
  // Initialize socket connection for all app pages
  useSocket();
  useSystemAlerts();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0f1e' }}>
      <Header />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
