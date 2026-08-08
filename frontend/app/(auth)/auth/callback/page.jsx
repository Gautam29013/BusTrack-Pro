'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '../../../store/authStore';
import api from '../../../lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    if (error) {
      router.push('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // 1. Save token
      setToken(token);
      
      // 2. Fetch user profile with new token
      api.get('/auth/me').then(({ data }) => {
        if (data.success) {
          setUser(data.data);
          router.push('/dashboard');
        } else {
          router.push('/login?error=fetch_failed');
        }
      }).catch(() => {
        router.push('/login?error=fetch_failed');
      });
    } else {
      router.push('/login');
    }
  }, [token, error, router, setToken, setUser]);

  return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
      <div style={{ marginBottom: '16px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </div>
      <p style={{ fontSize: '15px' }}>Authenticating...</p>
      
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
