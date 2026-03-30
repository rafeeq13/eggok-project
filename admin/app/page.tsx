'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    if (email === 'admin@eggok.com' && password === 'admin123') {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
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
            color: '#FEFEFE',
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
                  color: '#FEFEFE',
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
                  color: '#FEFEFE',
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
          </form>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#111111',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '12px', color: '#888888' }}>
              Demo: <span style={{ color: '#FED800' }}>admin@eggok.com</span> / <span style={{ color: '#FED800' }}>admin123</span>
            </p>
          </div>
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