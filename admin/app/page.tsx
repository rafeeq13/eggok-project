'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      if (saved && JSON.parse(saved)) {
        router.push('/dashboard');
        return;
      }
    } catch {}
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
        return;
      }
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Unable to connect to server');
      setLoading(false);
    }
  };

  if (checking) return <div style={{ minHeight: '100vh', background: '#000' }} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo Area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-block',
            width: '160px',
            height: '80px',
            overflow: 'hidden',
            marginBottom: '12px',
            position: 'relative',
          }}>
            <Image
              src="/logo.svg"
              alt="Eggs Ok Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>
          <p style={{
            color: '#888888',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '0',
          }}>Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          padding: '36px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '8px',
          }}>Welcome back</h2>
          <p style={{
            color: '#888888',
            fontSize: '14px',
            marginBottom: '28px',
          }}>Sign in to manage your restaurant</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#CACACA',
                marginBottom: '8px',
              }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@eggok.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#111111',
                  border: '1px solid #2A2A2A',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                }}
                onFocus={e => e.target.style.borderColor = '#FED800'}
                onBlur={e => e.target.style.borderColor = '#2A2A2A'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#CACACA',
                marginBottom: '8px',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#111111',
                  border: '1px solid #2A2A2A',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                }}
                onFocus={e => e.target.style.borderColor = '#FED800'}
                onBlur={e => e.target.style.borderColor = '#2A2A2A'}
              />
            </div>

            {error && (
              <div style={{
                background: '#2A0A0A',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#EF4444',
                fontSize: '13px',
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#888888' : '#FED800',
                color: '#000000',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button onClick={() => setShowForgot(true)} type="button" style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </form>

          {/* Forgot Password Modal */}
          {showForgot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
              <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Reset Password</h3>
                  <button onClick={() => { setShowForgot(false); setForgotMsg(''); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Enter your email and we'll send you a password reset link.</p>
                <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#fff', fontSize: '14px', marginBottom: '12px' }}
                  onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
                {forgotMsg && <p style={{ fontSize: '13px', color: forgotMsg.includes('sent') ? '#22C55E' : '#FC0301', marginBottom: '12px' }}>{forgotMsg}</p>}
                <button disabled={forgotLoading || !forgotEmail.trim()} onClick={async () => {
                  setForgotLoading(true); setForgotMsg('');
                  try {
                    const res = await fetch(`${API}/users/forgot-password`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail }),
                    });
                    const data = await res.json();
                    setForgotMsg(data.message || 'Reset link sent if account exists.');
                  } catch { setForgotMsg('Failed to send. Try again.'); }
                  finally { setForgotLoading(false); }
                }} style={{
                  width: '100%', padding: '12px', background: forgotLoading ? '#888' : '#FED800',
                  border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700',
                  cursor: forgotLoading ? 'not-allowed' : 'pointer',
                }}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </div>
          )}

        </div>

        <p style={{
          textAlign: 'center',
          color: '#444444',
          fontSize: '12px',
          marginTop: '24px',
        }}>
          RestoRise Business Solutions © 2026
        </p>
      </div>
    </div>
  );
}