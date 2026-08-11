'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['', '#ef4444', '#f59e0b', 'var(--accent-blue)', 'var(--accent-emerald)', 'var(--accent-emerald)'];
  if (!password) return null;
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= score ? colors[score] : 'var(--border-bright)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: '11px', color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to BusTrackPro 🚌');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ width: '100%', maxWidth: '420px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>🚌</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '6px' }}>Create account</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Join BusTrackPro today</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
            <input id="signup-name" type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required autoComplete="name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
            <input id="signup-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
            <input id="signup-password" type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            <PasswordStrength password={form.password} />
          </div>

          <button id="signup-submit" type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '6px', width: '100%', padding: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ padding: '0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>Or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <button
          onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/google`; }}
          style={{ width: '100%', padding: '12px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-emerald)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
