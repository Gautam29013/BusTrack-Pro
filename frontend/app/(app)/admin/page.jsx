'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Alert Broadcast state
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data } = await api.get('/routes');
      if (data.success) setRoutes(data.data);
    } catch (e) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      await api.post('/admin/broadcast', { message: alertMessage, severity: alertSeverity });
      toast.success('Broadcast sent globally!');
      setAlertMessage('');
    } catch (e) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      setRoutes(r => r.filter(route => route.id !== id));
      toast.success('Route deleted');
    } catch (e) {
      toast.error('Failed to delete route');
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Admin Dashboard</h1>

      {/* Broadcast Alert Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📢</span> Broadcast Alert
        </h2>
        <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="e.g. Route 5 delayed due to accident..."
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ width: '120px' }}
            value={alertSeverity}
            onChange={(e) => setAlertSeverity(e.target.value)}
          >
            <option value="info">Info</option>
            <option value="error">Critical</option>
          </select>
          <button type="submit" className="btn-primary" disabled={isBroadcasting}>
            {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
          </button>
        </form>
      </div>

      {/* Route Management Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Route Management</h2>
          <button className="btn-primary" onClick={() => toast('Route creation modal coming soon!')}>+ Add Route</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Number</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Name</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Color</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{route.number}</td>
                  <td style={{ padding: '12px 8px' }}>{route.name}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: route.color || 'var(--accent-blue)' }} />
                      {route.color}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }}>Edit</button>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }} onClick={() => handleDeleteRoute(route.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No routes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
