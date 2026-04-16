'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

function SetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to set password');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch {
      setError('Unable to connect to server');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#111111',
    border: '1px solid #2A2A2A',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
  };

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

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-block',
            width: '160px',
            height: '80px',
            overflow: 'hidden',
            marginBottom: '12px',
            position: 'relative',
          }}>
            <Image src="/logo.svg" alt="Eggs Ok Logo" fill style={{ objectFit: 'contain', objectPosition: 'center' }} />
          </div>
          <p style={{ color: '#FEFEFE', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '0' }}>Admin Dashboard</p>
        </div>

        <div style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          padding: '36px',
        }}>
          {success ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Account activated</h2>
                <p style={{ color: '#FEFEFE', fontSize: '14px' }}>Your password has been set. Redirecting to sign in...</p>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Set your password</h2>
              <p style={{ color: '#FEFEFE', fontSize: '14px', marginBottom: '28px' }}>Create a password to activate your team account</p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#CACACA', marginBottom: '8px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      {showPassword
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#CACACA', marginBottom: '8px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      minLength={8}
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      {showConfirmPassword
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
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
                  disabled={loading || !token}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: loading || !token ? '#FEFEFE' : '#E5B800',
                    color: '#000000',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    border: 'none',
                    cursor: loading || !token ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Setting password...' : 'Activate Account'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#444444', fontSize: '12px', marginTop: '24px' }}>
          {/* RestoRise Business Solutions &copy; 2026 */}
        </p>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div style={{background:"#000",minHeight:"100vh"}} />}>
      <SetPasswordContent />
    </Suspense>
  );
}
