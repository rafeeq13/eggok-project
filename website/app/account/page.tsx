'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

type View = 'login' | 'register' | 'account';

type Order = { id: string; date: string; items: string; total: string; status: string };

export default function AccountPage() {
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eggok_token') ? 'account' : 'login';
    }
    return 'login';
  });
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Account data
  const [savedFirstName, setSavedFirstName] = useState('');
  const [savedLastName, setSavedLastName] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState('Bronze');
  const [userTotalOrders, setUserTotalOrders] = useState(0);
  const [userJoinDate, setUserJoinDate] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('eggok_token');
    if (token) {
      loadProfile(token);
    }
  }, []);

  const loadProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        // Token expired or invalid
        localStorage.removeItem('eggok_token');
        localStorage.removeItem('eggok_user');
        setView('login');
        return;
      }
      const profile = await res.json();
      const [first, ...rest] = (profile.name || '').split(' ');
      setSavedFirstName(first || '');
      setSavedLastName(rest.join(' ') || '');
      setSavedEmail(profile.email || '');
      setSavedPhone(profile.phone || '');
      setUserPoints(profile.points || 0);
      setUserTier(profile.tier || 'Bronze');
      setUserTotalOrders(profile.totalOrders || 0);
      setUserJoinDate(profile.joinDate || '');

      // Store user data for checkout pre-fill
      localStorage.setItem('eggok_user', JSON.stringify(profile));

      // Load order history
      loadOrders(token);
    } catch {
      // Silent fail
    }
  };

  const loadOrders = async (token: string) => {
    try {
      const userData = localStorage.getItem('eggok_user');
      if (!userData) return;
      const user = JSON.parse(userData);
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const allOrders = await res.json();
      // Filter orders by user email
      const userOrders = allOrders
        .filter((o: any) => o.customerEmail === user.email)
        .slice(0, 20)
        .map((o: any) => ({
          id: o.orderNumber,
          date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          items: Array.isArray(o.items) ? o.items.map((it: any) => it.name).join(', ') : '',
          total: `$${Number(o.total).toFixed(2)}`,
          status: o.status === 'delivered' ? 'Delivered' : o.status === 'picked_up' ? 'Picked Up' : o.status === 'cancelled' ? 'Cancelled' : 'Preparing',
        }));
      setOrders(userOrders);
      setUserTotalOrders(userOrders.length);
    } catch {
      // Silent fail
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setLoginError('Please fill in all fields'); return; }
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || 'Invalid email or password');
        setLoading(false);
        return;
      }
      localStorage.setItem('eggok_token', data.token);
      localStorage.setItem('eggok_user', JSON.stringify(data.user));
      await loadProfile(data.token);
      setView('account');
    } catch {
      setLoginError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regPhone || !regPassword) { setRegError('Please fill in all fields'); return; }
    if (regPassword !== regConfirm) { setRegError('Passwords do not match'); return; }
    if (regPassword.length < 8) { setRegError('Password must be at least 8 characters'); return; }
    if (!agreeTerms) { setRegError('Please agree to the terms'); return; }
    setRegError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('eggok_token', data.token);
      localStorage.setItem('eggok_user', JSON.stringify(data.user));
      setSavedFirstName(regFirstName);
      setSavedLastName(regLastName);
      setSavedEmail(regEmail);
      setSavedPhone(regPhone);
      setUserPoints(50);
      setView('account');
    } catch {
      setRegError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('eggok_token');
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {
        name: `${savedFirstName} ${savedLastName}`,
        email: savedEmail,
        phone: savedPhone,
      };
      if (newPassword && currentPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showSuccess(data.message || 'Failed to update profile');
        setLoading(false);
        return;
      }
      localStorage.setItem('eggok_user', JSON.stringify(data));
      setCurrentPassword('');
      setNewPassword('');
      showSuccess('Profile updated successfully');
    } catch {
      showSuccess('Failed to update profile');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('eggok_token');
    localStorage.removeItem('eggok_user');
    setView('login');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const formatJoinDate = () => {
    if (!userJoinDate) return 'Recently';
    const d = new Date(userJoinDate);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#111111', border: '1px solid #1A1A1A',
    borderRadius: '10px', color: '#FEFEFE',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const,
    color: '#CACACA', display: 'block' as const,
    marginBottom: '6px',
  };

  const statusColor: Record<string, string> = {
    Delivered: '#22C55E',
    'Picked Up': '#22C55E',
    Preparing: '#F59E0B',
    Cancelled: '#FC0301',
  };

  const Nav = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E1E', height: '64px', display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/logo.svg" alt="Eggs Ok" style={{ width: '38px', height: '38px', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FED800', letterSpacing: '0.5px', lineHeight: '1' }}>EGGS OK</div>
          <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Philadelphia</div>
        </div>
      </Link>
      <Link href="/order" style={{ padding: '8px 16px', background: '#FED800', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
        Order Now
      </Link>
    </div>
  );

  // ── LOGIN VIEW ──
  if (view === 'login') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', margin: '0 auto 16px', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.svg" alt="Eggs Ok" style={{ width: '56px', height: '56px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#FEFEFE', marginBottom: '6px', letterSpacing: '-0.5px' }}>WELCOME BACK</h1>
            <p style={{ fontSize: '14px', color: '#888' }}>Sign in to your Eggs Ok account</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" style={inputStyle} placeholder="john@gmail.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showLoginPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '48px' }}
                  placeholder="••••••••"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                  {showLoginPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'transparent', border: 'none', color: '#FED800', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Forgot password?
              </button>
            </div>
            {loginError && (
              <div style={{ padding: '12px 16px', background: '#2A0A0A', border: '1px solid #FC030140', borderRadius: '10px', color: '#FC0301', fontSize: '13px' }}>
                {loginError}
              </div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#1A1A1A' : '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: loading ? '#555' : '#000', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '4px' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1A1A1A' }} />
            <span style={{ fontSize: '13px', color: '#888' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#1A1A1A' }} />
          </div>

          <button onClick={() => setView('register')} style={{ width: '100%', padding: '15px', background: 'transparent', border: '2px solid #FED800', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#FED800', cursor: 'pointer' }}>
            Create New Account
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
            Continue as{' '}
            <Link href="/order" style={{ color: '#FED800', fontWeight: '600' }}>Guest</Link>
            {' '}— no account needed
          </p>
        </div>
      </div>
    );
  }

  // ── REGISTER VIEW ──
  if (view === 'register') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Nav />
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <button onClick={() => setView('login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '14px', marginBottom: '28px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Sign In
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#FEFEFE', marginBottom: '6px', letterSpacing: '-0.5px' }}>CREATE ACCOUNT</h1>
            <p style={{ fontSize: '14px', color: '#888' }}>Join Eggs Ok for faster ordering and loyalty rewards</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '28px' }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, text: 'Order History' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>, text: 'Loyalty Points' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, text: 'Fast Checkout' },
            ].map((b, i) => (
              <div key={i} style={{ padding: '14px 8px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {b.icon}
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{b.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} placeholder="John" value={regFirstName} onChange={e => setRegFirstName(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} placeholder="Smith" value={regLastName} onChange={e => setRegLastName(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" style={inputStyle} placeholder="john@gmail.com" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input type="tel" style={inputStyle} placeholder="215-555-0100" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
            </div>
            <div>
              <label style={labelStyle}>Password * (min 8 characters)</label>
              <div style={{ position: 'relative' }}>
                <input type={showRegPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '48px' }}
                  placeholder="Create a strong password"
                  value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                  {showRegPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              {regPassword && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: regPassword.length > i * 2 + 2 ? (regPassword.length < 6 ? '#FC0301' : regPassword.length < 10 ? '#F59E0B' : '#22C55E') : '#1A1A1A' }} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <input type="password" style={inputStyle} placeholder="Repeat password"
                value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
              {regConfirm && regPassword !== regConfirm && (
                <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '4px' }}>Passwords do not match</p>
              )}
            </div>

            <div onClick={() => setAgreeTerms(!agreeTerms)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px', background: '#111111', borderRadius: '10px', border: '1px solid #1A1A1A' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${agreeTerms ? '#FED800' : '#3A3A3A'}`, background: agreeTerms ? '#FED800' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                {agreeTerms && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.5', margin: 0 }}>
                I agree to the <span style={{ color: '#FED800' }}>Terms of Service</span> and <span style={{ color: '#FED800' }}>Privacy Policy</span>. I consent to receiving order updates via email.
              </p>
            </div>

            {regError && (
              <div style={{ padding: '12px 16px', background: '#2A0A0A', border: '1px solid #FC030140', borderRadius: '10px', color: '#FC0301', fontSize: '13px' }}>
                {regError}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#1A1A1A' : '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: loading ? '#555' : '#000', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '4px' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
            Already have an account?{' '}
            <button onClick={() => setView('login')} style={{ background: 'transparent', border: 'none', color: '#FED800', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Sign In</button>
          </p>
        </div>
      </div>
    );
  }

  // ── ACCOUNT DASHBOARD ──
  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Nav />

      {successMsg && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
          {successMsg}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 48px' }}>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '24px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', color: '#000', flexShrink: 0 }}>
            {savedFirstName.charAt(0)}{savedLastName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FEFEFE', marginBottom: '4px', letterSpacing: '-0.3px' }}>{savedFirstName.toUpperCase()} {savedLastName.toUpperCase()}</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{savedEmail} · Member since {formatJoinDate()}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ padding: '10px 16px', background: '#FED80015', border: '1px solid #FED80030', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#FED800', margin: 0 }}>{userPoints}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Points</p>
            </div>
            <div style={{ padding: '10px 16px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>{userTotalOrders}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Orders</p>
            </div>
            <div style={{ padding: '10px 16px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>{userTier}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Tier</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1A1A1A' }}>
          {[
            { id: 'orders', label: 'Order History' },
            { id: 'profile', label: 'My Profile' },
            { id: 'addresses', label: 'Saved Addresses' },
            { id: 'loyalty', label: 'Loyalty & Rewards' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', background: activeTab === tab.id ? '#FED800' : 'transparent', color: activeTab === tab.id ? '#000' : '#888', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{orders.length} orders</p>
              <Link href="/order" style={{ padding: '8px 16px', background: '#FED800', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Order Again</Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: '40px 20px', background: '#111111', border: '1px dashed #2A2A2A', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', marginBottom: '6px' }}>No orders yet</p>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Place your first order to see it here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ padding: '16px 20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#FED800', margin: 0 }}>{order.id}</p>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[order.status]}20`, color: statusColor[order.status], border: `1px solid ${statusColor[order.status]}40` }}>{order.status}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#888', margin: '0 0 2px' }}>{order.date}</p>
                      <p style={{ fontSize: '13px', color: '#CACACA', margin: 0 }}>{order.items}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '8px' }}>{order.total}</p>
                      <button style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Reorder</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px' }}>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', marginBottom: '20px' }}>Personal Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input style={inputStyle} value={savedFirstName} onChange={e => setSavedFirstName(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={inputStyle} value={savedLastName} onChange={e => setSavedLastName(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" style={inputStyle} value={savedEmail} onChange={e => setSavedEmail(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" style={inputStyle} value={savedPhone} onChange={e => setSavedPhone(e.target.value)}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
              </div>
              <div style={{ paddingTop: '8px', borderTop: '1px solid #1A1A1A' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px' }}>Change Password</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="password" style={inputStyle} placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                  <input type="password" style={inputStyle} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={loading} style={{ padding: '14px', background: loading ? '#1A1A1A' : '#FED800', borderRadius: '10px', color: loading ? '#555' : '#000', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ADDRESSES */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Saved delivery addresses</p>
              <button style={{ padding: '8px 16px', background: '#FED800', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>+ Add Address</button>
            </div>
            <div style={{ padding: '40px 20px', background: '#111111', border: '1px dashed #2A2A2A', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', marginBottom: '6px' }}>No saved addresses yet</p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Add your delivery address for faster checkout</p>
            </div>
          </div>
        )}

        {/* LOYALTY */}
        {activeTab === 'loyalty' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #FED800, #E5C200)', borderRadius: '16px', padding: '28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#00000080', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Points Balance</p>
              <p style={{ fontSize: '56px', fontWeight: '900', color: '#000', lineHeight: '1', marginBottom: '8px' }}>{userPoints}</p>
              <p style={{ fontSize: '14px', color: '#00000070', marginBottom: '16px' }}>{userTier} Member · {Math.max(0, 500 - userPoints)} points to {userTier === 'Bronze' ? 'Silver' : userTier === 'Silver' ? 'Gold' : 'Platinum'}</p>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '3px' }}>
                <div style={{ width: `${Math.min(100, (userPoints / 500) * 100)}%`, height: '100%', background: '#000', borderRadius: '3px' }} />
              </div>
            </div>

            <p style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', marginBottom: '14px' }}>Available Rewards</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {[
                { name: 'Free Delivery', points: 150, available: true },
                { name: '$5 Off Your Order', points: 200, available: true },
                { name: 'Free Signature Sandwich', points: 500, available: false },
                { name: '$10 Off Your Order', points: 400, available: false },
              ].map((reward, i) => (
                <div key={i} style={{ padding: '16px', background: '#111111', border: `1px solid ${reward.available ? '#FED80040' : '#1A1A1A'}`, borderRadius: '12px', opacity: reward.available ? 1 : 0.6 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{reward.name}</p>
                  <p style={{ fontSize: '12px', color: '#FED800', marginBottom: '10px' }}>{reward.points} points</p>
                  <button disabled={!reward.available} style={{ width: '100%', padding: '8px', background: reward.available ? '#FED800' : '#2A2A2A', border: 'none', borderRadius: '8px', color: reward.available ? '#000' : '#888', fontSize: '12px', fontWeight: '700', cursor: reward.available ? 'pointer' : 'not-allowed' }}>
                    {reward.available ? 'Redeem' : `Need ${reward.points - userPoints} more pts`}
                  </button>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', marginBottom: '14px' }}>Points History</p>
            <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
              {[
                { desc: 'Order #EO-1042', points: '+11', date: 'Mar 20', color: '#22C55E' },
                { desc: 'Order #EO-1038', points: '+20', date: 'Mar 18', color: '#22C55E' },
                { desc: 'Sign-up Bonus', points: '+50', date: 'Mar 15', color: '#FED800' },
                { desc: 'Order #EO-1024', points: '+26', date: 'Mar 12', color: '#22C55E' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < 3 ? '1px solid #1A1A1A' : 'none' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#FEFEFE', margin: 0 }}>{h.desc}</p>
                    <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{h.date}</p>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: h.color }}>{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          style={{ marginTop: '24px', marginBottom: '48px', width: '100%', padding: '13px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '12px', color: '#888', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#FED800'; b.style.color = '#FED800'; }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#2A2A2A'; b.style.color = '#888'; }}
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}