'use client';
import React, { useEffect, useState } from 'react';

type IntegrationStatus = 'connected' | 'disconnected' | 'error';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  lastSync: string;
};

import { API, adminFetch } from '../../../lib/api';

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
  const [squareTerminalDeviceId, setSquareTerminalDeviceId] = useState('');
  const [squareWebhookSigningKey, setSquareWebhookSigningKey] = useState('');
  const [terminalDevices, setTerminalDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

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
  const [emailProvider, setEmailProvider] = useState('smtp');
  const [emailHost, setEmailHost] = useState('');
  const [emailPort, setEmailPort] = useState('587');
  const [emailSecure, setEmailSecure] = useState(false);
  const [emailUser, setEmailUser] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailFromName, setEmailFromName] = useState('Eggs Ok');
  const [emailFromAddress, setEmailFromAddress] = useState('orders@eggsokphilly.com');
  const [emailOwnerAddress, setEmailOwnerAddress] = useState('orders@eggsokphilly.com');
  const [emailStatus, setEmailStatus] = useState<IntegrationStatus>('disconnected');
  const [emailHasPassword, setEmailHasPassword] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailTestRecipient, setEmailTestRecipient] = useState('');

  // Push Notifications
  const [fcmServerKey, setFcmServerKey] = useState('');
  const [apnsKeyId, setApnsKeyId] = useState('');
  const [apnsTeamId, setApnsTeamId] = useState('');
  const [apnsBundleId, setApnsBundleId] = useState('');
  const [pushStatus, setPushStatus] = useState<IntegrationStatus>('disconnected');

  // Uber Direct
  const [uberDirectCustomerId, setUberDirectCustomerId] = useState('');
  const [uberDirectClientId, setUberDirectClientId] = useState('');
  const [uberDirectClientSecret, setUberDirectClientSecret] = useState('');
  const [uberDirectEnvironment, setUberDirectEnvironment] = useState('sandbox');
  const [uberDirectStatus, setUberDirectStatus] = useState<IntegrationStatus>('disconnected');

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

  const applyEmailPreset = (provider: string) => {
    setEmailProvider(provider);
    if (provider === 'sendgrid') {
      setEmailHost('smtp.sendgrid.net');
      setEmailPort('587');
      setEmailSecure(false);
      setEmailUser('apikey');
    }
    if (provider === 'smtp' && emailHost === 'smtp.sendgrid.net' && emailUser === 'apikey') {
      setEmailHost('');
      setEmailUser('');
    }
  };

  const applyEmailSettings = (settings: {
    provider?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    fromName?: string;
    fromEmail?: string;
    ownerEmail?: string;
    configured?: boolean;
    hasPassword?: boolean;
  }) => {
    setEmailProvider(settings.provider || 'smtp');
    setEmailHost(settings.host || '');
    setEmailPort(String(settings.port || 587));
    setEmailSecure(Boolean(settings.secure));
    setEmailUser(settings.user || '');
    setEmailFromName(settings.fromName || 'Eggs Ok');
    setEmailFromAddress(settings.fromEmail || 'orders@eggsokphilly.com');
    setEmailOwnerAddress(settings.ownerEmail || settings.fromEmail || 'orders@eggsokphilly.com');
    setEmailHasPassword(Boolean(settings.hasPassword));
    setEmailStatus(settings.configured ? 'connected' : 'disconnected');
  };

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const res = await adminFetch(`${API}/settings/integrations`);
        if (res.ok) {
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;
          if (data) {
            const v = data;
            if (v.squareAppId) setSquareAppId(v.squareAppId);
            if (v.squareAccessToken) setSquareAccessToken(v.squareAccessToken);
            if (v.squareLocationId) setSquareLocationId(v.squareLocationId);
            if (v.squareEnvironment) setSquareEnvironment(v.squareEnvironment);
            if (v.squareStatus) setSquareStatus(v.squareStatus);
            if (v.squareTerminalDeviceId) setSquareTerminalDeviceId(v.squareTerminalDeviceId);
            if (v.squareWebhookSigningKey) setSquareWebhookSigningKey(v.squareWebhookSigningKey);

            if (v.stripePublishableKey) setStripePublishableKey(v.stripePublishableKey);
            if (v.stripeSecretKey) setStripeSecretKey(v.stripeSecretKey);
            if (v.stripeWebhookSecret) setStripeWebhookSecret(v.stripeWebhookSecret);
            if (v.stripeEnvironment) setStripeEnvironment(v.stripeEnvironment);
            if (v.stripeStatus) setStripeStatus(v.stripeStatus);

            if (v.doordashDeveloperId) setDoordashDeveloperId(v.doordashDeveloperId);
            if (v.doordashKeyId) setDoordashKeyId(v.doordashKeyId);
            if (v.doordashSigningSecret) setDoordashSigningSecret(v.doordashSigningSecret);
            if (v.doordashEnvironment) setDoordashEnvironment(v.doordashEnvironment);
            if (v.doordashStatus) setDoordashStatus(v.doordashStatus);

            if (v.fcmServerKey) setFcmServerKey(v.fcmServerKey);
            if (v.apnsKeyId) setApnsKeyId(v.apnsKeyId);
            if (v.apnsTeamId) setApnsTeamId(v.apnsTeamId);
            if (v.apnsBundleId) setApnsBundleId(v.apnsBundleId);
            if (v.pushStatus) setPushStatus(v.pushStatus);

            if (v.uberDirectCustomerId) setUberDirectCustomerId(v.uberDirectCustomerId);
            if (v.uberDirectClientId) setUberDirectClientId(v.uberDirectClientId);
            if (v.uberDirectClientSecret) setUberDirectClientSecret(v.uberDirectClientSecret);
            if (v.uberDirectEnvironment) setUberDirectEnvironment(v.uberDirectEnvironment);
            if (v.uberDirectStatus) setUberDirectStatus(v.uberDirectStatus);

            if (v.googleMapsKey) setGoogleMapsKey(v.googleMapsKey);
            if (v.googleMapsStatus) setGoogleMapsStatus(v.googleMapsStatus);
          }
        }
      } catch (err) {
        console.error('Failed to load integrations:', err);
      }
    };

    const loadEmailSettings = async () => {
      try {
        setEmailLoading(true);
        const response = await adminFetch(`${API}/mail/settings`);
        if (!response.ok) throw new Error('Failed to load email settings');
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        applyEmailSettings(data);
      } catch (error) {
        console.error(error);
        setEmailStatus('error');
        showError('Unable to load email settings');
      } finally {
        setEmailLoading(false);
      }
    };

    loadAllSettings();
    loadEmailSettings();
  }, []);

  const saveIntegrations = async (statusUpdate?: any) => {
    const payload = {
      squareAppId, squareAccessToken, squareLocationId, squareEnvironment, squareTerminalDeviceId, squareWebhookSigningKey, squareStatus: statusUpdate?.squareStatus || squareStatus,
      stripePublishableKey, stripeSecretKey, stripeWebhookSecret, stripeEnvironment, stripeStatus: statusUpdate?.stripeStatus || stripeStatus,
      doordashDeveloperId, doordashKeyId, doordashSigningSecret, doordashEnvironment, doordashStatus: statusUpdate?.doordashStatus || doordashStatus,
      fcmServerKey, apnsKeyId, apnsTeamId, apnsBundleId, pushStatus: statusUpdate?.pushStatus || pushStatus,
      uberDirectCustomerId, uberDirectClientId, uberDirectClientSecret, uberDirectEnvironment, uberDirectStatus: statusUpdate?.uberDirectStatus || uberDirectStatus,
      googleMapsKey, googleMapsStatus: statusUpdate?.googleMapsStatus || googleMapsStatus
    };

    try {
      await adminFetch(`${API}/settings/integrations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to save integrations:', err);
    }
  };

  const buildEmailPayload = () => ({
    enabled: true,
    provider: emailProvider,
    host: emailHost.trim(),
    port: Number(emailPort) || 587,
    secure: emailSecure,
    user: emailUser.trim(),
    password: emailPassword.trim(),
    fromName: emailFromName.trim(),
    fromEmail: emailFromAddress.trim(),
    ownerEmail: (emailOwnerAddress || emailFromAddress).trim(),
  });

  const saveEmailSettings = async (showToast = true) => {
    setEmailSaving(true);
    try {
      const response = await adminFetch(`${API}/mail/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildEmailPayload()),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save email settings');
      }

      applyEmailSettings(data);
      setEmailPassword('');
      if (showToast) showSuccess('Email settings saved');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save email settings';
      setEmailStatus('error');
      showError(message);
      throw error;
    } finally {
      setEmailSaving(false);
    }
  };

  const sendTestEmail = async () => {
    setEmailTesting(true);
    try {
      await saveEmailSettings(false);
      const response = await adminFetch(`${API}/mail/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTestRecipient.trim() || emailOwnerAddress.trim() || emailFromAddress.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Test email failed');
      }
      setEmailStatus('connected');
      showSuccess('Test email sent successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Test email failed';
      setEmailStatus('error');
      showError(message);
    } finally {
      setEmailTesting(false);
    }
  };


  const testConnection = async (id: string) => {
    setTestingId(id);

    // Save credentials first so the backend has them for testing
    await saveIntegrations();

    // Integrations with real backend test endpoints
    const realTestEndpoints: Record<string, string> = {
      square: 'test-connection/square',
      stripe: 'test-connection/stripe',
      uberdirect: 'test-connection/uberdirect',
    };

    let newStatus: IntegrationStatus = 'error';
    let message = 'Connection failed - please check your credentials';

    if (realTestEndpoints[id]) {
      try {
        const res = await adminFetch(`${API}/settings/${realTestEndpoints[id]}`, { method: 'POST' });
        const data = await res.json().catch(() => ({ success: false, message: 'Invalid response' }));
        if (data.success) {
          newStatus = 'connected';
          message = data.message || 'Connected successfully';
        } else {
          newStatus = 'error';
          message = data.message || 'Connection failed';
        }
      } catch {
        newStatus = 'error';
        message = 'Could not reach the server';
      }
    } else {
      // Fallback for integrations without backend test (doordash, push, maps)
      const hasCredentials = (
        (id === 'doordash' && doordashDeveloperId && doordashKeyId) ||
        (id === 'push' && fcmServerKey) ||
        (id === 'maps' && googleMapsKey)
      );
      newStatus = hasCredentials ? 'connected' : 'error';
      message = hasCredentials ? 'Credentials saved' : 'Missing required credentials';
    }

    setTestingId(null);

    if (id === 'square') setSquareStatus(newStatus);
    if (id === 'stripe') setStripeStatus(newStatus);
    if (id === 'doordash') setDoordashStatus(newStatus);
    if (id === 'uberdirect') setUberDirectStatus(newStatus);
    if (id === 'push') setPushStatus(newStatus);
    if (id === 'maps') setGoogleMapsStatus(newStatus);

    if (newStatus === 'connected') {
      showSuccess(message);
    } else {
      showError(message);
    }

    // Persist the status change
    const update: any = {};
    if (id === 'square') update.squareStatus = newStatus;
    if (id === 'stripe') update.stripeStatus = newStatus;
    if (id === 'doordash') update.doordashStatus = newStatus;
    if (id === 'uberdirect') update.uberDirectStatus = newStatus;
    if (id === 'push') update.pushStatus = newStatus;
    if (id === 'maps') update.googleMapsStatus = newStatus;
    saveIntegrations(update);
  };


  const integrationIcons: Record<string, React.ReactElement> = {
    square: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    stripe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    doordash: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    email: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    push: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    uberdirect: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    maps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  };

  const integrations: Integration[] = [
    { id: 'square', name: 'Square POS', description: 'Kitchen printing, order sync & terminal display', icon: 'square', status: squareStatus, lastSync: squareStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'stripe', name: 'Stripe Payments', description: 'Online payment processing', icon: 'stripe', status: stripeStatus, lastSync: stripeStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'doordash', name: 'DoorDash Drive', description: 'Delivery dispatch & tracking', icon: 'doordash', status: doordashStatus, lastSync: doordashStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'uberdirect', name: 'Uber Direct', description: 'On-demand delivery via Uber', icon: 'uberdirect', status: uberDirectStatus, lastSync: uberDirectStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'email', name: 'Email Service', description: 'Order confirmations & notifications', icon: 'email', status: emailStatus, lastSync: emailStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'push', name: 'Push Notifications', description: 'iOS & Android push alerts', icon: 'push', status: pushStatus, lastSync: pushStatus === 'connected' ? 'Just now' : 'Never' },
    { id: 'maps', name: 'Google Maps', description: 'Live map & delivery zones', icon: 'maps', status: googleMapsStatus, lastSync: googleMapsStatus === 'connected' ? 'Just now' : 'Never' },
  ];

  const statusColor: Record<IntegrationStatus, string> = {
    connected: '#22C55E',
    disconnected: '#FEFEFE',
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
    color: '#FEFEFE', display: 'block' as const, marginBottom: '6px',
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
            border: 'none', cursor: 'pointer', fontSize: '14px', color: '#FEFEFE',
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
        color: testingId === id ? '#FEFEFE' : '#000',
        fontSize: '13px', fontWeight: '700', cursor: testingId === id ? 'not-allowed' : 'pointer',
        minWidth: '140px',
      }}
    >
      {testingId === id ? 'Testing...' : 'Test & Connect'}
    </button>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
    { id: 'square', label: 'Square POS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { id: 'stripe', label: 'Stripe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
    { id: 'doordash', label: 'DoorDash', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> },
    { id: 'uberdirect', label: 'Uber Direct', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
    { id: 'email', label: 'Email', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
    { id: 'push', label: 'Push Notifications', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg> },
    { id: 'maps', label: 'Google Maps', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg> },
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
            color: activeSection === sec.id ? '#000000' : '#FEFEFE',
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
              <p style={{ fontSize: '13px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                      <span style={{ display: 'flex', alignItems: 'center', color: '#FEFEFE' }}>{integrationIcons[int.id]}</span>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>{int.name}</p>
                        <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '1px' }}>{int.description}</p>
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
                    <span style={{ fontSize: '10px', color: '#FEFEFE' }}>Last sync: {int.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall status */}
            <div style={cardStyle}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px' }}>System Readiness</p>
              {[
                { id: 'square', label: 'Square POS', status: squareStatus, required: true },
                { id: 'stripe', label: 'Stripe Payments', status: stripeStatus, required: true },
                { id: 'doordash', label: 'DoorDash Drive', status: doordashStatus, required: true },
                { id: 'uberdirect', label: 'Uber Direct', status: uberDirectStatus, required: false },
                { id: 'email', label: 'Email Service', status: emailStatus, required: true },
                { id: 'push', label: 'Push Notifications', status: pushStatus, required: false },
                { id: 'maps', label: 'Google Maps', status: googleMapsStatus, required: false },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[item.status], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{item.label}</span>
                    {item.required && <span style={{ fontSize: '10px', color: '#F59E0B', background: '#F59E0B15', padding: '1px 6px', borderRadius: '10px', border: '1px solid #F59E0B30' }}>Required</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: statusColor[item.status] }}>{statusLabel[item.status]}</span>
                    <button onClick={() => setActiveSection(item.id)} style={{ fontSize: '11px', color: '#FED800', background: 'transparent', border: 'none', cursor: 'pointer' }}>Configure →</button>
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Connect Square to print kitchen tickets, sync orders & display on terminal</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[squareStatus]}20`, color: statusColor[squareStatus], border: `1px solid ${statusColor[squareStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[squareStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                        color: squareEnvironment === env ? '#000' : '#FEFEFE',
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
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>Found in Square Dashboard → Locations</p>
                </div>

                {/* Terminal Device */}
                <div style={{ padding: '14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FED800' }}>Square Terminal Device</p>
                      <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '2px' }}>Orders will be pushed to this terminal for POS display</p>
                    </div>
                    <button
                      onClick={async () => {
                        setLoadingDevices(true);
                        try {
                          const res = await adminFetch(`${API}/settings/square/terminal-devices`);
                          const data = await res.json();
                          setTerminalDevices(data.devices || []);
                          if (data.error) showError(data.error);
                        } catch { showError('Failed to fetch devices'); }
                        setLoadingDevices(false);
                      }}
                      disabled={loadingDevices || squareStatus !== 'connected'}
                      style={{
                        padding: '6px 14px', borderRadius: '6px', border: '1px solid #2A2A2A',
                        background: '#1A1A1A', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer',
                        opacity: squareStatus !== 'connected' ? 0.5 : 1,
                      }}
                    >
                      {loadingDevices ? 'Loading...' : 'Fetch Devices'}
                    </button>
                  </div>

                  {terminalDevices.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                      {terminalDevices.map((d: any) => (
                        <button
                          key={d.deviceId}
                          onClick={() => setSquareTerminalDeviceId(d.deviceId)}
                          style={{
                            padding: '8px 12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer',
                            background: squareTerminalDeviceId === d.deviceId ? '#FED80015' : '#0A0A0A',
                            border: `1px solid ${squareTerminalDeviceId === d.deviceId ? '#FED800' : '#2A2A2A'}`,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{d.name}</span>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                            background: d.status === 'CONNECTED' ? '#22C55E20' : '#FF444420',
                            color: d.status === 'CONNECTED' ? '#22C55E' : '#FF4444',
                          }}>
                            {d.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    style={inputStyle}
                    value={squareTerminalDeviceId}
                    onChange={e => setSquareTerminalDeviceId(e.target.value)}
                    placeholder="Device ID (select above or enter manually)"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>
                    {squareTerminalDeviceId ? `Terminal: ${squareTerminalDeviceId.slice(0, 20)}...` : 'No terminal selected — orders will sync to Square but won\'t appear on terminal'}
                  </p>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={labelStyle}>Webhook Signing Key</label>
                  <PasswordInput value={squareWebhookSigningKey} onChange={setSquareWebhookSigningKey} placeholder="your_square_webhook_signing_key" />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>
                    Webhook URL: <span style={{ color: '#FED800' }}>https://eggsokpa.com/api/square/webhook</span>
                  </p>
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Process online payments securely through Stripe</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[stripeStatus]}20`, color: statusColor[stripeStatus], border: `1px solid ${statusColor[stripeStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[stripeStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                        color: stripeEnvironment === env ? '#000' : '#FEFEFE',
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
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>
                    Server-side secrets from `.env.local` are not prefilled in the browser.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Webhook Signing Secret</label>
                  <PasswordInput value={stripeWebhookSecret} onChange={setStripeWebhookSecret} placeholder="whsec_..." />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>
                    Webhook URL: <span style={{ color: '#FED800' }}>https://eggsokpa.com/api/stripe/webhook</span>
                  </p>
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Auto-dispatch DoorDash drivers for delivery orders</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[doordashStatus]}20`, color: statusColor[doordashStatus], border: `1px solid ${statusColor[doordashStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[doordashStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                        color: doordashEnvironment === env ? '#000' : '#FEFEFE',
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

        {/* UBER DIRECT */}
        {activeSection === 'uberdirect' && (
          <div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={sectionTitle}>Uber Direct Integration</p>
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>On-demand delivery dispatch via Uber's courier network</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[uberDirectStatus]}20`, color: statusColor[uberDirectStatus], border: `1px solid ${statusColor[uberDirectStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[uberDirectStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get these credentials</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
                  1. Go to developer.uber.com → Dashboard<br />
                  2. Create a new app or select existing one<br />
                  3. Enable the Direct API scope<br />
                  4. Copy Customer ID, Client ID, and Client Secret from the app settings
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Environment</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['sandbox', 'production'].map(env => (
                      <button key={env} onClick={() => setUberDirectEnvironment(env)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: uberDirectEnvironment === env ? '#FED800' : '#111111',
                        border: `1px solid ${uberDirectEnvironment === env ? '#FED800' : '#2A2A2A'}`,
                        color: uberDirectEnvironment === env ? '#000' : '#FEFEFE',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {env === 'sandbox' ? 'Sandbox (Testing)' : 'Production (Live)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Customer ID *</label>
                  <input style={inputStyle} value={uberDirectCustomerId} onChange={e => setUberDirectCustomerId(e.target.value)}
                    placeholder="your_uber_customer_id"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Client ID *</label>
                  <input style={inputStyle} value={uberDirectClientId} onChange={e => setUberDirectClientId(e.target.value)}
                    placeholder="your_uber_client_id"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Client Secret *</label>
                  <PasswordInput value={uberDirectClientSecret} onChange={setUberDirectClientSecret} placeholder="your_uber_client_secret" />
                </div>

                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '8px' }}>Features enabled with Uber Direct</p>
                  {[
                    'On-demand courier dispatch for delivery orders',
                    'Real-time delivery tracking for customers',
                    'Automatic driver assignment and ETA updates',
                    'Proof of delivery with photo confirmation',
                    'Delivery cost estimation before dispatch',
                  ].map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#22C55E', fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <ConnectButton id="uberdirect" />
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Send order confirmations and notifications to customers</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[emailStatus]}20`, color: statusColor[emailStatus], border: `1px solid ${statusColor[emailStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[emailStatus]}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Email Setup</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { id: 'smtp', label: 'Custom SMTP' },
                      { id: 'sendgrid', label: 'SendGrid SMTP' },
                    ].map(provider => (
                      <button key={provider.id} onClick={() => applyEmailPreset(provider.id)} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: emailProvider === provider.id ? '#FED800' : '#111111',
                        border: `1px solid ${emailProvider === provider.id ? '#FED800' : '#2A2A2A'}`,
                        color: emailProvider === provider.id ? '#000' : '#FEFEFE',
                        fontSize: '13px', fontWeight: '600',
                      }}>
                        {provider.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>SMTP Host *</label>
                  <input style={inputStyle} value={emailHost} onChange={e => setEmailHost(e.target.value)}
                    placeholder={emailProvider === 'sendgrid' ? 'smtp.sendgrid.net' : 'smtp.your-provider.com'}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>SMTP Port *</label>
                    <input style={inputStyle} value={emailPort} onChange={e => setEmailPort(e.target.value.replace(/\D/g, ''))}
                      placeholder="587"
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Encryption</label>
                    <button onClick={() => setEmailSecure(!emailSecure)} style={{
                      ...inputStyle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}>
                      <span>{emailSecure ? 'SSL / TLS' : 'STARTTLS / Standard SMTP'}</span>
                      <span style={{ color: emailSecure ? '#FED800' : '#FEFEFE', fontWeight: '700' }}>{emailSecure ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>SMTP Username *</label>
                    <input style={inputStyle} value={emailUser} onChange={e => setEmailUser(e.target.value)}
                      placeholder={emailProvider === 'sendgrid' ? 'apikey' : 'username'}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>SMTP Password *</label>
                    <PasswordInput
                      value={emailPassword}
                      onChange={setEmailPassword}
                      placeholder={emailHasPassword ? 'Leave blank to keep saved password' : 'Enter SMTP password'}
                    />
                  </div>
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
                <div>
                  <label style={labelStyle}>Owner / Inbox Email *</label>
                  <input type="email" style={inputStyle} value={emailOwnerAddress} onChange={e => setEmailOwnerAddress(e.target.value)}
                    placeholder="Where website messages and order alerts should go"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Test Recipient</label>
                  <input type="email" style={inputStyle} value={emailTestRecipient} onChange={e => setEmailTestRecipient(e.target.value)}
                    placeholder="Optional - defaults to owner inbox"
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
                    This mail setup is used across the application for order confirmations, owner order alerts, contact page submissions, catering requests, hiring applications, and gift card emails.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => saveEmailSettings(true)}
                    disabled={emailSaving || emailLoading}
                    style={{
                      padding: '10px 20px',
                      background: emailSaving || emailLoading ? '#2A2A2A' : '#FED800',
                      border: 'none',
                      borderRadius: '8px',
                      color: emailSaving || emailLoading ? '#FEFEFE' : '#000',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: emailSaving || emailLoading ? 'not-allowed' : 'pointer',
                      minWidth: '140px',
                    }}
                  >
                    {emailSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                  <button
                    onClick={sendTestEmail}
                    disabled={emailTesting || emailLoading}
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px',
                      color: emailTesting || emailLoading ? '#555555' : '#FEFEFE',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: emailTesting || emailLoading ? 'not-allowed' : 'pointer',
                      minWidth: '140px',
                    }}
                  >
                    {emailTesting ? 'Sending Test...' : 'Send Test Email'}
                  </button>
                </div>
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Send real-time order updates to iOS and Android apps</p>
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
                  <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                  <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '4px' }}>Enable live map, delivery zone drawing, and address autocomplete</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[googleMapsStatus]}20`, color: statusColor[googleMapsStatus], border: `1px solid ${statusColor[googleMapsStatus]}40`, flexShrink: 0 }}>
                  {statusLabel[googleMapsStatus]}
                </span>
              </div>

              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FED80020' }}>
                <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600', marginBottom: '4px' }}>Where to get this key</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
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
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>
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
                      <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{feature}</span>
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
