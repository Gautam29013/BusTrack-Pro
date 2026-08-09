'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [favorites, setFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/users/favorites').then(({ data }) => {
      if (data.success) setFavorites(data.data);
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data.data);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px', overflowY: 'auto', height: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontWeight: 800, fontSize: '24px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '24px' }}>Profile</h1>

        {/* Avatar + basic info */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-amber' : 'badge-blue'}`} style={{ marginTop: '6px' }}>{user?.role || 'user'}</span>
            </div>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                <input
                  id="profile-name-input"
                  className="input-field"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button id="save-profile-btn" className="btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: 1 }}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button id="edit-profile-btn" className="btn-secondary" onClick={() => setIsEditing(true)} style={{ width: '100%' }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Favorites */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>⭐ Favorite Routes</h3>
          {favorites.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>No favorite routes yet. Track buses to add favorites.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {favorites.map(route => (
                <div key={route.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: route.color || 'var(--accent-blue)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{route.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Route #{route.number}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/profile/history" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>🕰️ Journey History</Link>
            <Link href="/dashboard" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>🗺️ Go to Dashboard</Link>
            <button
              id="logout-profile-btn"
              className="btn-secondary"
              onClick={async () => { await logout(); window.location.href = '/'; }}
              style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.25)' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
