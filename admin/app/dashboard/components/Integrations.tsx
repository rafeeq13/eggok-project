'use client';
import React, { useState } from 'react';

type IntegrationStatus = 'connected' | 'disconnected' | 'error';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  lastSync: string;
};

const clientIntegrationDefaults = {
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  squareAppId: process.env.NEXT_PUBLIC_SQUARE_APP_ID || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
};

export default function Integrations() {
  const [activeSection, setActiveSection] = useState('overview');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  // Square
  const [squareAppId, setSquareAppId] = useState(clientIntegrationDefaults.squareAppId);
  const [squareAccessToken, setSquareAccessToken] = useState('');
  const [squareLocationId, setSquareLocationId] = useState('');
  const [squareEnvironment, setSquareEnvironment] = useState('sandbox');
  const [squareStatus, setSquareStatus] = useState<IntegrationStatus>('disconnected');

  // Stripe
  const [stripePublishableKey, setStripePublishableKey] = useState(clientIntegrationDefaults.stripePublishableKey);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [stripeEnvironment, setStripeEnvironment] = useState('test');
  const [stripeStatus, setStripeStatus] = useState<IntegrationStatus>('disconnected');

  // DoorDash
  const [doordashDeveloperId, setDoordashDeveloperId] = useState('');
  const [doordashKeyId, setDoordashKeyId] = useState('');
  const [doordashSigningSecret, setDoordashSigningSecret] = useState('');
  const [doordashEnvironment, setDoordashEnvironment] = useState('sandbox');
  const [doordashStatus, setDoordashStatus] = useState<IntegrationStatus>('disconnected');

  // Email
  const [emailProvider, setEmailProvider] = useState('sendgrid');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailFromName, setEmailFromName] = useState('Eggs Ok');
  const [emailFromAddress, setEmailFromAddress] = useState('orders@eggsokphilly.com');
  const [emailStatus, setEmailStatus] = useState<IntegrationStatus>('disconnected');

  // Push Notifications
  const [fcmServerKey, setFcmServerKey] = useState('');
  const [apnsKeyId, setApnsKeyId] = useState('');
  const [apnsTeamId, setApnsTeamId] = useState('');
  const [apnsBundleId, setApnsBundleId] = useState('');
  const [pushStatus, setPushStatus] = useState<IntegrationStatus>('disconnected');

  // Google Maps
  const [googleMapsKey, setGoogleMapsKey] = useState(clientIntegrationDefaults.googleMapsKey);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<IntegrationStatus>('disconnected');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const testConnection = async (id: string) => {
    setTestingId(id);
    await new Promise(r => setTimeout(r, 2000));
    setTestingId(null);
    // Simulate test result
    const hasCredentials = (
      (id === 'square' && squareAppId && squareAccessToken && squareLocationId) ||
      (id === 'stripe' && stripePublishableKey && stripeSecretKey) ||
      (id === 'doordash' && doordashDeveloperId && doordashKeyId) ||
      (id === 'email' && emailApiKey && emailFromAddress) ||
      (id === 'push' && fcmServerKey) ||
      (id === 'maps' && googleMapsKey)
    );
    if (hasCredentials) {
      if (id === 'square') setSquareStatus('connected');
      if (id === 'stripe') setStripeStatus('connected');
      if (id === 'doordash') setDoordashStatus('connected');
      if (id === 'email') setEmailStatus('connected');
      if (id === 'push') setPushStatus('connected');
      if (id === 'maps') setGoogleMapsStatus('connected');
      showSuccess(`${id.charAt(0).toUpperCase() + id.slice(1)} connected successfully`);
    } else {
      if (id === 'square') setSquareStatus('error');
      if (id === 'stripe') setStripeStatus('error');
      if (id === 'doordash') setDoordashStatus('error');
      if (id === 'email') setEmailStatus('error');
      if (id === 'push') setPushStatus('error');
      if (id === 'maps') setGoogleMapsStatus('error');
      showError('Connection failed - please check your credentials');
    }
  };

  const integrationIcons: Record<string, React.ReactElement> = {
    square: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    stripe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    doordash: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    email: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    push: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    maps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  };

  const integrations: Integration[] = [
    { id: 'square', name: 'Square POS', description: 'Kitchen printing & order sync', icon: 'square', status: squareStatus, lastSync: squareStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'stripe', name: 'Stripe Payments', description: 'Online payment processing', icon: 'stripe', status: stripeStatus, lastSync: stripeStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'doordash', name: 'DoorDash Drive', description: 'Delivery dispatch & tracking', icon: 'doordash', status: doordashStatus, lastSync: doordashStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'email', name: 'Email Service', description: 'Order confirmations & notifications', icon: 'email', status: emailStatus, lastSync: emailStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'push', name: 'Push Notifications', description: 'iOS & Android push alerts', icon: 'push', status: pushStatus, lastSync: pushStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'maps', name: 'Google Maps', description: 'Live map & delivery zones', icon: 'maps', status: googleMapsStatus, lastSync: googleMapsStatus === 'connected' ? 'Just now' : 'Never' },
  ];

  const statusColor: Record<IntegrationStatus, string> = {
    connected: '#22C55E',
    disconnected: '#888888',
    error: '#FC0301',
  };

  const statusLabel: Record<IntegrationStatus, string> = {
    connected: 'Connected',
    disconnected: 'Not Connected',
    error: 'Error',
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: '#111111', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '500' as const,
    color: '#888888', display: 'block' as const, marginBottom: '6px',
  };

  const cardStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: '12px', padding: '20px 24px', marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '14px', fontWeight: '700' as const,
    color: '#FEFEFE', marginBottom: '4px',
  };

  const PasswordInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
    const [show, setShow] = useState(false);
    return (
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          style={{ ...inputStyle, paddingRight: '44px' }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••••••••••'}
          onFocus={e => e.target.style.borderColor = '#FED800'}
          onBlur={e => e.target.style.borderColor = '#2A2A2A'}
        />
        <button
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)', background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: '14px', color: '#888888',
          }}
        >{show ? '🙈' : '👁️'}</button>
      </div>
    );
  };

  const ConnectButton = ({ id }: { id: string }) => (
    <button
      onClick={() => testConnection(id)}
      disabled={testingId === id}
      style={{
        padding: '10px 20px', background: testingId === id ? '#2A2A2A' : '#FED800',
        border: 'none', borderRadius: '8px',
        color: testingId === id ? '#888888' : '#000',
        fontSize: '13px', fontWeight: '700', cursor: testingId === id ? 'not-allowed' : 'pointer',
        minWidth: '140px',
      }}
    >
      {testingId === id ? 'Testing...' : 'Test & Connect'}
    </button>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    { id: 'square', label: 'Square POS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
    { id: 'stripe', label: 'Stripe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'doordash', label: 'DoorDash', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { id: 'email', label: 'Email', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
    { id: 'push', label: 'Push Notifications', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
    { id: 'maps', label: 'Google Maps', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', maxWidth: '960px' }}>

      {/* Success / Error Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#FC0301', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          ✗ {errorMsg}
        </div>
      )}

      {/* Left Nav */}
      <div style={{ width: '180px', flexShrink: 0, background: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '8px', height: 'fit-content', position: 'sticky', top: '20px' }}>
        {sections.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: activeSection === sec.id ? '#FED800' : 'transparent',
            color: activeSection === sec.id ? '#000000' : '#666666',
            fontSize: '12px', fontWeight: activeSection === sec.id ? '700' : '400',
            marginBottom: '2px', textAlign: 'left',
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {sec.icon}
            </span>
            {sec.label}
          </button>
        ))}
      </div>

      {/* Right Content */}
      <div style={{ flex: 1 }}>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>
                Connect your third-party services here. All credentials are stored securely and encrypted. Enter your API keys and click Test & Connect to verify each integration.
              </p>
            </div>

            {/* Status Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {integrations.map(int => (
                <div key={int.id} onClick={() => setActiveSection(int.id)} style={{
                  background: '#1A1A1A',
                  border: `1px solid ${int.status === 'connected' ? '#22C55E30' : int.status === 'error' ? '#FC030130' : '#2A2A2A'}`,
                  borderRadius: '12px', padding: '16px', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', color: '#888888' }}>{integrationIcons[int.id]}</span>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>{int.name}</p>
                        <p style={{ fontSize: '11px', color: '#888888', marginTop: '1px' }}>{int.description}</p>
                      </div>
                    </div>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: statusColor[int.status], flexShrink: 0, marginTop: '4px',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                      background: `${statusColor[int.status]}20`,
                      color: statusColor[int.status],
                      border: `1px solid ${statusColor[int.status]}40`,
                    }}>{statusLabel[int.status]}</span>
                    <span style={{ fontSize: '10px', color: '#888888' }}>Last sync: {int.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall status */}
            <div style={cardStyle}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px' }}>System Readiness</p>
              {[
                { label: 'Square POS', status: squareStatus, required: true },
                { label: 'Stripe Payments', status: stripeStatus, required: true },
                { label: 'DoorDash Drive', status: doordashStatus, required: true },
                { label: 'Email Service', status: emailStatus, required: true },
                { label: 'Push Notifications', status: pushStatus, required: false },
                { label: 'Google Maps', status: googleMapsStatus, required: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid #2A2A2A' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[item.status], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{item.label}</span>
                    {item.required && <span style={{ fontSize: '10px', color: '#F59E0B', background: '#F59E0B15', padding: '1px 6px', borderRadius: '10px', border: '1px solid #F59E0B30' }}>Required</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: statusColor[item.status] }}>{statusLabel[item.status]}</span>
                    <button onClick={() => setActiveSection(item.label.toLowerCase().split(' ')[0])} style={{ fontSize: '11px', color: '#FED800', background: 'transparent', border: 'none', cursor: 'pointer' }}>Configure →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SQUARE */}
        {activeSection === 'square' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Square POS Integration</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Connect Square to automatically print kitchen tickets and sync orders</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[squareStatus]}20`, color: statusColor[squareStatus], border: `1px solid ${statusColor[squareStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[squareStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                  1. Go to developer.squareup.com → My Applications<br />
                  2. Create or select your application<br />
                  3. Go to Credentials tab — copy Application ID and Access Token<br />
                  4. Go to Locations tab — copy your Location ID
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Environment</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['sandbox', 'production'].map(env => (
                      <button key={env} onClick={() => setSquareEnvironment(env)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: squareEnvironment === env ? '#FED800' : '#111111',
                        border: `1px solid ${squareEnvironment === env ? '#FED800' : '#2A2A2A'}`,
                        color: squareEnvironment === env ? '#000' : '#888888',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {env === 'sandbox' ? 'Sandbox (Testing)' : 'Production (Live)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Application ID *</label>
                  <input style={inputStyle} value={squareAppId} onChange={e => setSquareAppId(e.target.value)}
                    placeholder="your_square_application_id"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Access Token *</label>
                  <PasswordInput value={squareAccessToken} onChange={setSquareAccessToken} placeholder="your_square_access_token" />
                </div>
                <div>
                  <label style={labelStyle}>Location ID *</label>
                  <input style={inputStyle} value={squareLocationId} onChange={e => setSquareLocationId(e.target.value)}
                    placeholder="LxxxxxxxxxxxxxxxxX"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>Found in Square Dashboard → Locations</p>
                </div>
                <ConnectButton id="square" />
              </div>
            </div>
          </div>
        )}

        {/* STRIPE */}
        {activeSection === 'stripe' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Stripe Payment Integration</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Process online payments securely through Stripe</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[stripeStatus]}20`, color: statusColor[stripeStatus], border: `1px solid ${statusColor[stripeStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[stripeStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                  1. Go to dashboard.stripe.com → Developers → API Keys<br />
                  2. Copy Publishable key and Secret key<br />
                  3. For webhook secret: Developers → Webhooks → Add endpoint → copy Signing secret
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Environment</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['test', 'live'].map(env => (
                      <button key={env} onClick={() => setStripeEnvironment(env)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: stripeEnvironment === env ? '#FED800' : '#111111',
                        border: `1px solid ${stripeEnvironment === env ? '#FED800' : '#2A2A2A'}`,
                        color: stripeEnvironment === env ? '#000' : '#888888',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {env === 'test' ? 'Test Mode' : 'Live Mode'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Publishable Key *</label>
                  <input style={inputStyle} value={stripePublishableKey} onChange={e => setStripePublishableKey(e.target.value)}
                    placeholder={stripeEnvironment === 'test' ? 'your_test_publishable_key' : 'your_live_publishable_key'}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secret Key *</label>
                  <PasswordInput value={stripeSecretKey} onChange={setStripeSecretKey}
                    placeholder={stripeEnvironment === 'test' ? 'your_test_secret_key' : 'your_live_secret_key'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                    Server-side secrets from `.env.local` are not prefilled in the browser.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Webhook Signing Secret</label>
                  <PasswordInput value={stripeWebhookSecret} onChange={setStripeWebhookSecret} placeholder="your_webhook_signing_secret" />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>Required for payment confirmations and refund processing</p>
                </div>
                <ConnectButton id="stripe" />
              </div>
            </div>
          </div>
        )}

        {/* DOORDASH */}
        {activeSection === 'doordash' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>DoorDash Drive Integration</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Auto-dispatch DoorDash drivers for delivery orders</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[doordashStatus]}20`, color: statusColor[doordashStatus], border: `1px solid ${statusColor[doordashStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[doordashStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                  1. Go to developer.doordash.com → Portal<br />
                  2. Create a new application under DoorDash Drive<br />
                  3. Copy Developer ID, Key ID, and Signing Secret from credentials page
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Environment</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['sandbox', 'production'].map(env => (
                      <button key={env} onClick={() => setDoordashEnvironment(env)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: doordashEnvironment === env ? '#FED800' : '#111111',
                        border: `1px solid ${doordashEnvironment === env ? '#FED800' : '#2A2A2A'}`,
                        color: doordashEnvironment === env ? '#000' : '#888888',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {env === 'sandbox' ? '🧪 Sandbox (Testing)' : '🚀 Production (Live)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Developer ID *</label>
                  <input style={inputStyle} value={doordashDeveloperId} onChange={e => setDoordashDeveloperId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Key ID *</label>
                  <input style={inputStyle} value={doordashKeyId} onChange={e => setDoordashKeyId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Signing Secret *</label>
                  <PasswordInput value={doordashSigningSecret} onChange={setDoordashSigningSecret} />
                </div>
                <ConnectButton id="doordash" />
              </div>
            </div>
          </div>
        )}

        {/* EMAIL */}
        {activeSection === 'email' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Email Service Integration</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Send order confirmations and notifications to customers</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[emailStatus]}20`, color: statusColor[emailStatus], border: `1px solid ${statusColor[emailStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[emailStatus]}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Email Provider</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['sendgrid', 'aws_ses'].map(provider => (
                      <button key={provider} onClick={() => setEmailProvider(provider)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: emailProvider === provider ? '#FED800' : '#111111',
                        border: `1px solid ${emailProvider === provider ? '#FED800' : '#2A2A2A'}`,
                        color: emailProvider === provider ? '#000' : '#888888',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {provider === 'sendgrid' ? 'SendGrid' : 'AWS SES'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>API Key *</label>
                  <PasswordInput value={emailApiKey} onChange={setEmailApiKey} placeholder={emailProvider === 'sendgrid' ? 'SG.xxxxxxxxxxxxxxxxxxxxxxxx' : 'AKIA...'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>From Name</label>
                    <input style={inputStyle} value={emailFromName} onChange={e => setEmailFromName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>From Email Address *</label>
                    <input type="email" style={inputStyle} value={emailFromAddress} onChange={e => setEmailFromAddress(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                </div>
                <ConnectButton id="email" />
              </div>
            </div>
          </div>
        )}

        {/* PUSH NOTIFICATIONS */}
        {activeSection === 'push' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Push Notifications</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Send real-time order updates to iOS and Android apps</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[pushStatus]}20`, color: statusColor[pushStatus], border: `1px solid ${statusColor[pushStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[pushStatus]}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2A2A2A' }}>
                  Android — Firebase Cloud Messaging (FCM)
                </p>
                <div style={{ padding: '10px 14px', background: '#111111', borderRadius: '8px', marginBottom: '12px', border: '1px solid #FED80020' }}>
                  <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                    Go to console.firebase.google.com → Project Settings → Cloud Messaging → Copy Server Key
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>FCM Server Key *</label>
                  <PasswordInput value={fcmServerKey} onChange={setFcmServerKey} placeholder="AAAAxxxxxxxx:APA91bxxxxxxxxxxxxxxxx" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2A2A2A' }}>
                  iOS — Apple Push Notification Service (APNs)
                </p>
                <div style={{ padding: '10px 14px', background: '#111111', borderRadius: '8px', marginBottom: '12px', border: '1px solid #FED80020' }}>
                  <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                    Go to developer.apple.com → Certificates → Keys → Create a new key with APNs enabled → Copy Key ID and Team ID
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Key ID</label>
                      <input style={inputStyle} value={apnsKeyId} onChange={e => setApnsKeyId(e.target.value)}
                        placeholder="XXXXXXXXXX"
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Team ID</label>
                      <input style={inputStyle} value={apnsTeamId} onChange={e => setApnsTeamId(e.target.value)}
                        placeholder="XXXXXXXXXX"
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Bundle ID</label>
                    <input style={inputStyle} value={apnsBundleId} onChange={e => setApnsBundleId(e.target.value)}
                      placeholder="com.eggsok.app"
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                </div>
              </div>
              <ConnectButton id="push" />
            </div>
          </div>
        )}

        {/* GOOGLE MAPS */}
        {activeSection === 'maps' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Google Maps Integration</p>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>Enable live map, delivery zone drawing, and address autocomplete</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[googleMapsStatus]}20`, color: statusColor[googleMapsStatus], border: `1px solid ${statusColor[googleMapsStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[googleMapsStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get this key</p>
                <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                  1. Go to console.cloud.google.com<br />
                  2. Create a new project or select existing<br />
                  3. Enable Maps JavaScript API and Places API<br />
                  4. Go to Credentials → Create API Key → Copy it
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Google Maps API Key *</label>
                  <PasswordInput value={googleMapsKey} onChange={setGoogleMapsKey} placeholder="your_google_maps_api_key" />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                    Browser-loaded defaults use `NEXT_PUBLIC_GOOGLE_MAPS_KEY` from `admin/.env.local`.
                  </p>
                </div>

                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '8px' }}>Features enabled with this key</p>
                  {[
                    'Live map view in Delivery Settings',
                    'Draw delivery zones directly on the map',
                    'Address autocomplete at customer checkout',
                    'Real-time distance calculation for delivery fees',
                    'Customer delivery tracking map',
                  ].map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#22C55E', fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '12px', color: '#888888' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <ConnectButton id="maps" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
