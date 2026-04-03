'use client';
import React, { useState, useEffect } from 'react';
import SingleDatePicker from './SingleDatePicker';

const API = 'http://localhost:3002/api';

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Store status
  const [storeOpen, setStoreOpen] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [pickupWait, setPickupWait] = useState('15');
  const [minOrder, setMinOrder] = useState('10');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('3.99');
  const [closedMessage, setClosedMessage] = useState('Closed Now');
  const [storePhone, setStorePhone] = useState('215-948-9902');
  const [storeEmail, setStoreEmail] = useState('orders@eggsokphilly.com');

  // Hours — keyed by day
  const [hours, setHours] = useState(
    dayKeys.map(day => ({ day, open: true, from: '08:00', to: '21:00' }))
  );

  const [specialHours, setSpecialHours] = useState<{
    id: number; date: string; label: string; closed: boolean; from: string; to: string;
  }[]>([]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Load hours from backend on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [hoursRes, storeRes] = await Promise.all([
          fetch(`${API}/settings/hours`),
          fetch(`${API}/settings/store`)
        ]);

        if (hoursRes.ok) {
          const hoursData = await hoursRes.json();
          if (hoursData) {
            setHours(dayKeys.map(day => ({
              day,
              open: hoursData[day]?.isOpen ?? true,
              from: hoursData[day]?.open ?? '08:00',
              to: hoursData[day]?.close ?? '21:00',
            })));
            if (hoursData.special) setSpecialHours(hoursData.special);
          }
        }

        if (storeRes.ok) {
          const data = await storeRes.json();
          if (data) {
            const v = data;
            setStoreOpen(v.storeOpen ?? true);
            setDeliveryEnabled(v.deliveryEnabled ?? true);
            setPickupEnabled(v.pickupEnabled ?? true);
            setPickupWait(String(v.pickupWait || '15'));
            setMinOrder(String(v.minOrder || '10'));
            setDeliveryRadius(String(v.deliveryRadius || '5'));
            setDeliveryFee(String(v.deliveryFee || '3.99'));
            setClosedMessage(v.closedMessage || 'Closed Now');
            setStorePhone(v.storePhone || '215-948-9902');
            setStoreEmail(v.storeEmail || 'orders@eggsokphilly.com');
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleDay = (day: string) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, open: !h.open } : h));
  };

  const updateHour = (day: string, field: 'from' | 'to', value: string) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build hours object for API
      const hoursPayload: any = {};
      hours.forEach(h => {
        hoursPayload[h.day] = {
          open: h.from,
          close: h.to,
          isOpen: h.open,
        };
      });
      hoursPayload.special = specialHours;

      const storePayload = {
        storeOpen, deliveryEnabled, pickupEnabled, pickupWait: Number(pickupWait),
        minOrder: Number(minOrder), deliveryRadius: Number(deliveryRadius),
        deliveryFee: Number(deliveryFee), closedMessage, storePhone, storeEmail
      };

      await Promise.all([
        fetch(`${API}/settings/hours`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hoursPayload),
        }),
        fetch(`${API}/settings/store`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storePayload),
        })
      ]);

      showSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save:', err);
      showSuccess('Error saving settings');
    } finally {
      setSaving(false);
    }
  };


  const inputStyle = {
    padding: '9px 12px',
    background: '#111111',
    border: '1px solid #2A2A2A',
    borderRadius: '8px',
    color: '#FEFEFE',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500' as const,
    color: '#888888',
    display: 'block' as const,
    marginBottom: '6px',
  };

  const cardStyle = {
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '14px',
    fontWeight: '700' as const,
    color: '#FEFEFE',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2A2A2A',
  };

  const toggleSwitch = (value: boolean, onChange: () => void) => (
    <div onClick={onChange} style={{
      width: '46px', height: '26px',
      background: value ? '#FED800' : '#2A2A2A',
      borderRadius: '13px', position: 'relative',
      cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '20px', height: '20px',
        background: '#FEFEFE', borderRadius: '50%',
        transition: 'left 0.2s',
      }} />
    </div>
  );

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    const ampm = hour < 12 ? 'AM' : 'PM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const val = `${String(hour).padStart(2, '0')}:${min}`;
    const label = `${h12}:${min} ${ampm}`;
    return { val, label };
  });

  if (loading) {
    return <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '760px' }}>

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: successMsg.includes('Error') ? '#FC0301' : '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {successMsg}
        </div>
      )}

      {/* Store Status */}
      <div style={{ ...cardStyle, border: `1px solid ${storeOpen ? '#22C55E40' : '#FC030140'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Store Status</p>
            <p style={{ fontSize: '12px', color: storeOpen ? '#22C55E' : '#FC0301' }}>
              {storeOpen ? 'Your store is open — accepting orders' : 'Your store is closed — not accepting orders'}
            </p>
          </div>
          {toggleSwitch(storeOpen, () => setStoreOpen(!storeOpen))}
        </div>
        {!storeOpen && (
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Message shown to customers when closed</label>
            <textarea value={closedMessage} onChange={e => setClosedMessage(e.target.value)}
              style={{ ...inputStyle, height: '70px', resize: 'none' as const }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#2A2A2A'} />
          </div>
        )}
      </div>

      {/* Order Types */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Order Types</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Pickup Orders</p>
              <p style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>Customers order online and pick up in store</p>
            </div>
            {toggleSwitch(pickupEnabled, () => setPickupEnabled(!pickupEnabled))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Delivery Orders</p>
              <p style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>DoorDash Drive handles all deliveries</p>
            </div>
            {toggleSwitch(deliveryEnabled, () => setDeliveryEnabled(!deliveryEnabled))}
          </div>
        </div>
      </div>

      {/* Order Settings */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Order Settings</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { label: 'Pickup Wait Time (minutes)', value: pickupWait, set: setPickupWait, hint: 'Shown to customer after placing pickup order' },
            { label: 'Minimum Order Amount ($)', value: minOrder, set: setMinOrder, hint: 'Applied to both pickup and delivery orders' },
            { label: 'Delivery Radius (miles)', value: deliveryRadius, set: setDeliveryRadius, hint: 'Max distance for DoorDash delivery' },
            { label: 'Delivery Fee ($)', value: deliveryFee, set: setDeliveryFee, hint: 'Charged to customer at checkout' },
          ].map(({ label, value, set, hint }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input type="number" value={value} onChange={e => set(e.target.value)} style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
              <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Store Info */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Store Information</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Store Name</label>
            <input value="Egg Ok" readOnly style={{ ...inputStyle, opacity: 0.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input value={storePhone} onChange={e => setStorePhone(e.target.value)} style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input value={storeEmail} onChange={e => setStoreEmail(e.target.value)} style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input value="3517 Lancaster Ave, Philadelphia PA 19104" readOnly style={{ ...inputStyle, opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Operating Hours</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button onClick={() => {
            const first = hours[0];
            setHours(prev => prev.map(h => ({ ...h, open: first.open, from: first.from, to: first.to })));
          }} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '12px', cursor: 'pointer' }}>
            Copy Monday to All Days
          </button>
        </div>

        {hours.map((h, idx) => (
          <div key={h.day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#111111', borderRadius: '10px', marginBottom: '8px', border: h.open ? '1px solid #2A2A2A' : '1px solid #FC030120' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', width: '100px', flexShrink: 0 }}>{dayLabels[idx]}</p>
            <div onClick={() => toggleDay(h.day)} style={{ width: '42px', height: '24px', background: h.open ? '#FED800' : '#2A2A2A', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: '3px', left: h.open ? '21px' : '3px', width: '18px', height: '18px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
            </div>
            {h.open ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <select value={h.from} onChange={e => updateHour(h.day, 'from', e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1, cursor: 'pointer', colorScheme: 'dark' } as React.CSSProperties}>
                  {timeOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
                <span style={{ color: '#888888', fontSize: '12px', flexShrink: 0 }}>to</span>
                <select value={h.to} onChange={e => updateHour(h.day, 'to', e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1, cursor: 'pointer', colorScheme: 'dark' } as React.CSSProperties}>
                  {timeOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#FC0301', flex: 1 }}>Closed</p>
            )}
          </div>
        ))}

        {/* Special Hours */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>Special Hours & Holidays</p>
            <button onClick={() => setSpecialHours(prev => [...prev, { id: Date.now(), date: '', label: '', closed: false, from: '09:00', to: '17:00' }])}
              style={{ padding: '6px 14px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              + Add Special Day
            </button>
          </div>
          {specialHours.length === 0 ? (
            <div style={{ padding: '20px', background: '#111111', borderRadius: '10px', textAlign: 'center', border: '1px dashed #2A2A2A' }}>
              <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>No special hours added yet</p>
              <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>Add holidays, special events or temporary closures</p>
            </div>
          ) : specialHours.map(sh => (
            <div key={sh.id} style={{ padding: '14px 16px', background: '#111111', borderRadius: '10px', marginBottom: '8px', border: `1px solid ${sh.closed ? '#FC030130' : '#FED80030'}` }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <SingleDatePicker value={sh.date} onChange={date => setSpecialHours(prev => prev.map(s => s.id === sh.id ? { ...s, date } : s))} placeholder="Select date" />
                </div>
                <input placeholder="Label e.g. Christmas Day" value={sh.label}
                  onChange={e => setSpecialHours(prev => prev.map(s => s.id === sh.id ? { ...s, label: e.target.value } : s))}
                  style={{ ...inputStyle, flex: 2, minWidth: '160px' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: '#888888' }}>Closed</span>
                  <div onClick={() => setSpecialHours(prev => prev.map(s => s.id === sh.id ? { ...s, closed: !s.closed } : s))}
                    style={{ width: '36px', height: '20px', background: sh.closed ? '#FC0301' : '#2A2A2A', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: sh.closed ? '18px' : '2px', width: '16px', height: '16px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
                  </div>
                </div>
                {!sh.closed && (
                  <>
                    <select value={sh.from} onChange={e => setSpecialHours(prev => prev.map(s => s.id === sh.id ? { ...s, from: e.target.value } : s))} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
                      {timeOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                    </select>
                    <span style={{ color: '#888888', fontSize: '12px' }}>to</span>
                    <select value={sh.to} onChange={e => setSpecialHours(prev => prev.map(s => s.id === sh.id ? { ...s, to: e.target.value } : s))} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
                      {timeOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                    </select>
                  </>
                )}
                <button onClick={() => setSpecialHours(prev => prev.filter(s => s.id !== sh.id))}
                  style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', background: saving ? '#888' : '#FED800', color: '#000000', borderRadius: '10px', fontSize: '14px', fontWeight: '700', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '32px' }}>
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
}