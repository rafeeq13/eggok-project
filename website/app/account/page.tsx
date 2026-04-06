'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useGoogleMaps, initAutocomplete } from '../../hooks/useGoogleMaps';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

type View = 'login' | 'register' | 'account' | 'forgot' | 'forgot-sent';

type Order = { id: string; date: string; items: string; total: string; status: string; rawItems: any[] };

export default function AccountPage() {
  const { user, loading: authLoading, login: contextLogin, logout: contextLogout, updateUser: contextUpdateUser } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [view, setView] = useState<View>('login');
  const [isRendered, setIsRendered] = useState(false);
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

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');

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

  // Saved Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addrForm, setAddrForm] = useState({ label: '', address: '', apt: '', instructions: '' });

  // Loyalty
  const [rewards, setRewards] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  // Google Maps for address autocomplete
  const mapsLoaded = useGoogleMaps();
  const addrInputRef = useRef<HTMLInputElement>(null);
  const addrCleanupRef = useRef<(() => void) | null>(null);
  const [addrFormKey, setAddrFormKey] = useState(0);

  useEffect(() => {
    if (!mapsLoaded || !addrInputRef.current || !showAddressForm) return;
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!addrInputRef.current) return;
      addrCleanupRef.current?.();
      addrCleanupRef.current = initAutocomplete(addrInputRef.current, (place) => {
        setAddrForm(prev => ({ ...prev, address: place.address }));
        if (addrInputRef.current) addrInputRef.current.value = place.address;
      });
    }, 100);
    return () => { clearTimeout(timer); addrCleanupRef.current?.(); addrCleanupRef.current = null; };
  }, [mapsLoaded, showAddressForm, addrFormKey]);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setIsRendered(true);
    if (!authLoading) {
      if (user) {
        setView('account');
        const [first, ...rest] = (user.name || '').split(' ');
        setSavedFirstName(first || '');
        setSavedLastName(rest.join(' ') || '');
        setSavedEmail(user.email || '');
        setSavedPhone(user.phone || '');
        setUserPoints(user.points || 0);
        setUserTier(user.tier || 'Bronze');
        setUserTotalOrders(user.totalOrders || 0);
        setUserJoinDate(user.joinDate || '');

        const token = localStorage.getItem('eggok_token');
        if (token) {
          loadOrders(token);
          loadAddresses(token);
          loadRewards();
          loadPointsHistory(token);
        }
      } else {
        setView('login');
      }
    }
  }, [user, authLoading]);



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
          rawItems: Array.isArray(o.items) ? o.items : [],
        }));
      setOrders(userOrders);
      setUserTotalOrders(userOrders.length);
    } catch {
      // Silent fail
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.rawItems || order.rawItems.length === 0) {
      router.push('/order');
      return;
    }
    order.rawItems.forEach((item: any) => {
      const menuItem = {
        id: item.id || Date.now(),
        categoryId: item.categoryId || 0,
        name: item.name,
        description: item.description || '',
        pickupPrice: item.price || 0,
        deliveryPrice: item.price || 0,
        image: item.image || '',
        modifiers: item.modifiers || [],
      };
      addToCart(menuItem, item.quantity || 1, item.selectedModifiers || {}, item.specialInstructions || '');
    });
    setSuccessMsg(`${order.rawItems.length} item${order.rawItems.length > 1 ? 's' : ''} added to cart!`);
    setTimeout(() => { setSuccessMsg(''); router.push('/order'); }, 1500);
  };

  const loadAddresses = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/addresses`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAddresses(await res.json());
    } catch {}
  };

  const saveAddresses = async (newAddresses: any[]) => {
    const token = localStorage.getItem('eggok_token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/auth/addresses`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ addresses: newAddresses }),
      });
      setAddresses(newAddresses);
    } catch {}
  };

  const handleSaveAddress = () => {
    if (!addrForm.address.trim()) return;
    let updated;
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? { ...editingAddress, ...addrForm } : a);
    } else {
      updated = [...addresses, { id: Date.now(), ...addrForm, isDefault: addresses.length === 0 }];
    }
    saveAddresses(updated);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddrForm({ label: '', address: '', apt: '', instructions: '' });
    setSuccessMsg(editingAddress ? 'Address updated' : 'Address saved');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const deleteAddress = (id: number) => {
    saveAddresses(addresses.filter(a => a.id !== id));
    setSuccessMsg('Address removed');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const setDefaultAddress = (id: number) => {
    saveAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const loadRewards = async () => {
    try {
      const res = await fetch(`${API_URL}/loyalty/rewards`);
      if (res.ok) setRewards(await res.json());
    } catch {}
  };

  const loadPointsHistory = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/points-history`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setPointsHistory(await res.json());
    } catch {}
  };

  const handleRedeem = async (rewardId: number) => {
    const token = localStorage.getItem('eggok_token');
    if (!token) return;
    setRedeemingId(rewardId);
    try {
      const res = await fetch(`${API_URL}/auth/redeem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) { setSuccessMsg(data.message || 'Redemption failed'); setTimeout(() => setSuccessMsg(''), 3000); return; }
      setUserPoints(data.remainingPoints);
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadPointsHistory(token);
    } catch {
      setSuccessMsg('Failed to redeem');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setRedeemingId(null);
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
      contextLogin(data.token, data.user);
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
      contextLogin(data.token, data.user);
      setView('account');
    } catch {
      setRegError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotError('Please enter your email address'); return; }
    setForgotError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setForgotError(data.message || 'Failed to send reset link. Please try again.');
        setLoading(false);
        return;
      }
      setView('forgot-sent');
    } catch {
      setForgotError('Unable to connect. Please try again.');
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
      contextUpdateUser(data);
      setCurrentPassword('');
      setNewPassword('');
      showSuccess('Profile updated successfully');
    } catch {
      showSuccess('Failed to update profile');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    contextLogout();
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
    borderRadius: '10px', color: '#ffffff',
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



  if (!isRendered) {
    return <div style={{ background: '#000', minHeight: '100vh' }} />;
  }

  // ── LOGIN VIEW ──
  if (view === 'login') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Header />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{  borderRadius: '16px', overflow: 'hidden', margin: '0 auto 16px', display: 'none', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.svg" alt="Eggs Ok" style={{ width: '135px', height: '80px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px' }}>WELCOME BACK</h1>
            <p style={{ fontSize: '14px', color: '#ffffff' }}>Sign in to your Eggs Ok account</p>
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
              <button type="button" onClick={() => { setForgotEmail(loginEmail); setForgotError(''); setView('forgot'); }}
                style={{ background: 'transparent', border: 'none', color: '#FED800', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#ffffff' }}>
            Continue as{' '}
            <Link href="/order" style={{ color: '#FED800', fontWeight: '600' }}>Guest</Link>
            {' '}— no account needed
          </p>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD VIEW ──
  if (view === 'forgot') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Header />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <button onClick={() => setView('login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '14px', marginBottom: '28px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Sign In
          </button>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#111111', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.5px' }}>FORGOT PASSWORD?</h1>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>Enter your email and we'll send you a link to reset your password.</p>
          </div>
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" style={inputStyle} placeholder="john@gmail.com"
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'} />
            </div>
            {forgotError && (
              <div style={{ padding: '12px 16px', background: '#2A0A0A', border: '1px solid #FC030140', borderRadius: '10px', color: '#FC0301', fontSize: '13px' }}>
                {forgotError}
              </div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#1A1A1A' : '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: loading ? '#555' : '#000', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD SENT VIEW ──
  if (view === 'forgot-sent') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Header />
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', marginBottom: '12px', letterSpacing: '-0.5px' }}>CHECK YOUR EMAIL</h1>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.7', marginBottom: '8px' }}>
              If an account exists for <span style={{ color: '#FED800' }}>{forgotEmail}</span>, we've sent a password reset link.
            </p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', marginBottom: '32px' }}>
              The link expires in 1 hour. Check your spam folder if you don't see it.
            </p>
            <button onClick={() => setView('login')} style={{ width: '100%', padding: '15px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#000', cursor: 'pointer', border: 'none' }}>
              Back to Sign In
            </button>
            <button onClick={() => { setForgotError(''); setView('forgot'); }} style={{ width: '100%', padding: '15px', background: 'transparent', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#888', cursor: 'pointer', border: 'none', marginTop: '8px' }}>
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── REGISTER VIEW ──
  if (view === 'register') {
    return (
      <div style={{ background: '#000', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Header />
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '96px 24px 48px' }}>
          <button onClick={() => setView('login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '14px', marginBottom: '28px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Sign In
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px' }}>CREATE ACCOUNT</h1>
            <p style={{ fontSize: '14px', color: '#ffffff' }}>Join Eggs Ok for faster ordering and loyalty rewards</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '28px' }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, text: 'Order History' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>, text: 'Loyalty Points' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, text: 'Fast Checkout' },
            ].map((b, i) => (
              <div key={i} style={{ padding: '14px 8px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {b.icon}
                <p style={{ fontSize: '11px', color: '#ffffff', margin: 0 }}>{b.text}</p>
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
              <p style={{ fontSize: '13px', color: '#ffffff', lineHeight: '1.5', margin: 0 }}>
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

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#ffffff' }}>
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
      <Header />

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
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.3px' }}>{savedFirstName.toUpperCase()} {savedLastName.toUpperCase()}</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{savedEmail} · Member since {formatJoinDate()}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ padding: '10px 16px', background: '#FED80015', border: '1px solid #FED80030', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#FED800', margin: 0 }}>{userPoints}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Points</p>
            </div>
            <div style={{ padding: '10px 16px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{userTotalOrders}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Orders</p>
            </div>
            <div style={{ padding: '10px 16px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{userTier}</p>
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
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '6px' }}>No orders yet</p>
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
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>{order.total}</p>
                      <button onClick={() => handleReorder(order)} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FED800'; e.currentTarget.style.color = '#FED800'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#888'; }}>Reorder</button>
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
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '20px' }}>Personal Information</p>
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
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Change Password</p>
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
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
              <button onClick={() => { setEditingAddress(null); setAddrForm({ label: '', address: '', apt: '', instructions: '' }); setShowAddressForm(true); setAddrFormKey(k => k + 1); }} style={{ padding: '8px 16px', background: '#FED800', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>+ Add Address</button>
            </div>

            {/* Address Form Modal */}
            {showAddressForm && (
              <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>{editingAddress ? 'Edit Address' : 'New Address'}</p>
                  <button onClick={() => setShowAddressForm(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input placeholder="Label (e.g. Home, Work)" value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} style={{ padding: '10px 14px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff', fontSize: '13px' }} />
                  <input ref={addrInputRef} placeholder="Street address *" defaultValue={addrForm.address} onChange={e => setAddrForm(prev => ({ ...prev, address: e.target.value }))} style={{ padding: '10px 14px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff', fontSize: '13px' }} />
                  <input placeholder="Apt / Suite / Floor (optional)" value={addrForm.apt} onChange={e => setAddrForm({ ...addrForm, apt: e.target.value })} style={{ padding: '10px 14px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff', fontSize: '13px' }} />
                  <input placeholder="Delivery instructions (optional)" value={addrForm.instructions} onChange={e => setAddrForm({ ...addrForm, instructions: e.target.value })} style={{ padding: '10px 14px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff', fontSize: '13px' }} />
                  <button onClick={handleSaveAddress} style={{ padding: '10px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showAddressForm && (
              <div style={{ padding: '40px 20px', background: '#111', border: '1px dashed #2A2A2A', borderRadius: '12px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>No saved addresses yet</p>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Add your delivery address for faster checkout</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {addresses.map((addr: any) => (
                <div key={addr.id} style={{ padding: '16px', background: '#111', border: addr.isDefault ? '1px solid #FED80040' : '1px solid #2A2A2A', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{addr.label || 'Address'}</p>
                      {addr.isDefault && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#FED80020', color: '#FED800', border: '1px solid #FED80040', fontWeight: '600' }}>Default</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingAddress(addr); setAddrForm({ label: addr.label || '', address: addr.address, apt: addr.apt || '', instructions: addr.instructions || '' }); setShowAddressForm(true); setAddrFormKey(k => k + 1); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#FC0301', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px', paddingLeft: '24px' }}>{addr.address}</p>
                  {addr.apt && <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px', paddingLeft: '24px' }}>Apt: {addr.apt}</p>}
                  {addr.instructions && <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px', paddingLeft: '24px' }}>{addr.instructions}</p>}
                  {!addr.isDefault && <button onClick={() => setDefaultAddress(addr.id)} style={{ marginTop: '6px', marginLeft: '24px', background: 'none', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 10px', color: '#888', fontSize: '11px', cursor: 'pointer' }}>Set as default</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOYALTY */}
        {activeTab === 'loyalty' && (
          <div>
            {/* Points Card */}
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

            {/* Rewards */}
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>Available Rewards</p>
            {rewards.filter((r: any) => r.active).length === 0 ? (
              <div style={{ padding: '24px', background: '#111', border: '1px dashed #2A2A2A', borderRadius: '12px', textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No rewards available right now. Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {rewards.filter((r: any) => r.active).map((reward: any) => {
                  const canRedeem = userPoints >= reward.pointsCost;
                  const isRedeeming = redeemingId === reward.id;
                  return (
                    <div key={reward.id} style={{ padding: '16px', background: '#111', border: `1px solid ${canRedeem ? '#FED80040' : '#1A1A1A'}`, borderRadius: '12px', opacity: canRedeem ? 1 : 0.6 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{reward.name}</p>
                      {reward.description && <p style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{reward.description}</p>}
                      <p style={{ fontSize: '12px', color: '#FED800', marginBottom: '10px' }}>{reward.pointsCost} points</p>
                      <button onClick={() => canRedeem && handleRedeem(reward.id)} disabled={!canRedeem || isRedeeming} style={{
                        width: '100%', padding: '8px', background: canRedeem ? '#FED800' : '#2A2A2A',
                        border: 'none', borderRadius: '8px', color: canRedeem ? '#000' : '#888',
                        fontSize: '12px', fontWeight: '700', cursor: canRedeem ? 'pointer' : 'not-allowed',
                        opacity: isRedeeming ? 0.6 : 1,
                      }}>
                        {isRedeeming ? 'Redeeming...' : canRedeem ? 'Redeem' : `Need ${reward.pointsCost - userPoints} more pts`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Points History */}
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>Points History</p>
            <div style={{ background: '#111', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
              {pointsHistory.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No points activity yet. Place an order to start earning!</p>
                </div>
              ) : (
                pointsHistory.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < pointsHistory.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#fff', margin: 0 }}>{h.description}</p>
                      <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{h.date ? new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</p>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: h.type === 'redeemed' ? '#FC0301' : '#22C55E' }}>
                      {h.points > 0 ? '+' : ''}{h.points}
                    </span>
                  </div>
                ))
              )}
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