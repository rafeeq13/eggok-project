'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: '#111111', border: '1px solid #1A1A1A',
    borderRadius: '10px', color: '#FEFEFE',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600,
    color: '#CACACA', display: 'block',
    marginBottom: '6px',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) { setError('Please fill in both fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to reset password. The link may have expired.');
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  const Nav = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E1E', height: '64px', display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/logo.svg" alt="Eggs Ok" style={{ width: '38px', height: '38px', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FED800', letterSpacing: '0.5px', lineHeight: '1' }}>EGGS OK</div>
          <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Philadelphia</div>
        </div>
      </Link>
      <Link href="/order" style={{ padding: '8px 16px', background: '#FED800', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
        Order Now
      </Link>
    </div>
  );

  if (!token) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2A0A0A', border: '2px solid #FC030140', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FC0301" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FEFEFE', marginBottom: '12px' }}>INVALID LINK</h1>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link href="/account" style={{ display: 'block', padding: '15px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: 700, color: '#000', textDecoration: 'none', textAlign: 'center' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#FEFEFE', marginBottom: '12px', letterSpacing: '-0.5px' }}>PASSWORD UPDATED</h1>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link href="/account" style={{ display: 'block', padding: '15px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: 700, color: '#000', textDecoration: 'none', textAlign: 'center' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Nav />
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#111111', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#FEFEFE', marginBottom: '8px', letterSpacing: '-0.5px' }}>SET NEW PASSWORD</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{ ...inputStyle, paddingRight: '48px' }}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: password.length > i * 2 + 2 ? (password.length < 6 ? '#FC0301' : password.length < 10 ? '#F59E0B' : '#22C55E') : '#1A1A1A' }} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                style={{ ...inputStyle, paddingRight: '48px' }}
                placeholder="Repeat your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                {showConfirmPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>
            {confirm && password !== confirm && (
              <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '4px' }}>Passwords do not match</p>
            )}
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#2A0A0A', border: '1px solid #FC030140', borderRadius: '10px', color: '#FC0301', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#1A1A1A' : '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: 700, color: loading ? '#555' : '#000', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '4px' }}>
            {loading ? 'Updating Password...' : 'Set New Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
          <Link href="/account" style={{ color: '#FED800', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
