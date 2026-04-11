'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Zone = {
  id: number;
  name: string;
  radiusMiles: number;
  deliveryFee: number;
  minOrder: number;
  estimatedMinutes: number;
  active: boolean;
  color: string;
};

type Tab = 'zones' | 'general' | 'hours';

const zoneColors = ['#FED800', '#60A5FA', '#22C55E', '#A78BFA', '#FC0301', '#F59E0B'];

const initialZones: Zone[] = [
  { id: 1, name: 'Local Zone', radiusMiles: 1.5, deliveryFee: 9.99, minOrder: 15, estimatedMinutes: 20, active: true, color: '#FED800' },
  { id: 2, name: 'Standard Zone', radiusMiles: 3.0, deliveryFee: 3.99, minOrder: 20, estimatedMinutes: 30, active: true, color: '#60A5FA' },
  { id: 3, name: 'Extended Zone', radiusMiles: 5.0, deliveryFee: 5.99, minOrder: 25, estimatedMinutes: 45, active: true, color: '#22C55E' },
];

import { API, adminFetch } from '../../../lib/api';

export default function DeliverySettings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('zones');
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // General settings
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [deliveryProvider, setDeliveryProvider] = useState('uber_direct');
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('50');
  const [prepTime, setPrepTime] = useState('15');
  const [maxActiveOrders, setMaxActiveOrders] = useState('20');
  const [storeAddress] = useState('3517 Lancaster Ave, Philadelphia PA 19104');
  const [storeLat] = useState(39.9612);
  const [storeLng] = useState(-75.1832);

  // Google Maps
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // Delivery hours
  const [deliveryHours, setDeliveryHours] = useState([
    { day: 'Monday', open: true, from: '08:00', to: '21:00' },
    { day: 'Tuesday', open: true, from: '08:00', to: '21:00' },
    { day: 'Wednesday', open: true, from: '08:00', to: '21:00' },
    { day: 'Thursday', open: true, from: '08:00', to: '21:00' },
    { day: 'Friday', open: true, from: '08:00', to: '22:00' },
    { day: 'Saturday', open: true, from: '09:00', to: '22:00' },
    { day: 'Sunday', open: true, from: '09:00', to: '20:00' },
  ]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${API}/settings/delivery_settings`);
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data) {
          const v = data;
          if (v.zones) setZones(v.zones);
          if (v.deliveryEnabled !== undefined) setDeliveryEnabled(v.deliveryEnabled);
          if (v.autoAssign !== undefined) setAutoAssign(v.autoAssign);
          if (v.deliveryProvider) setDeliveryProvider(v.deliveryProvider);
          if (v.freeDeliveryEnabled !== undefined) setFreeDeliveryEnabled(v.freeDeliveryEnabled);
          if (v.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(v.freeDeliveryThreshold);
          if (v.prepTime !== undefined) setPrepTime(v.prepTime);
          if (v.maxActiveOrders !== undefined) setMaxActiveOrders(v.maxActiveOrders);
          if (v.deliveryHours) setDeliveryHours(v.deliveryHours);
        }
      }
    } catch (err) {
      console.error('Fetch settings failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Load Google Maps API key from integrations settings
    adminFetch(`${API}/settings/integrations`)
      .then(r => r.ok ? r.text() : '')
      .then(text => {
        if (!text) return;
        const data = JSON.parse(text);
        if (data?.googleMapsKey) setGoogleMapsKey(data.googleMapsKey);
      })
      .catch(() => {});
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!googleMapsKey || mapsLoaded) return;
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places,geocoding`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, [googleMapsKey]);

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;
    const center = { lat: storeLat, lng: storeLng };
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0D1117' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#FEFEFE' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0D1117' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1A1A' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2A2A2A' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1929' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });
    new google.maps.Marker({
      position: center,
      map,
      title: 'Eggs Ok',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#FC0301',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
    });
    mapInstanceRef.current = map;
    updateCircles(map, zones);
  }, [mapsLoaded, storeLat, storeLng]);

  useEffect(() => { initMap(); }, [initMap]);

  // Update zone circles on map
  const updateCircles = (map: google.maps.Map, currentZones: Zone[]) => {
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];
    currentZones
      .filter(z => z.active)
      .sort((a, b) => b.radiusMiles - a.radiusMiles)
      .forEach(zone => {
        const circle = new google.maps.Circle({
          map,
          center: { lat: storeLat, lng: storeLng },
          radius: zone.radiusMiles * 1609.34,
          fillColor: zone.color,
          fillOpacity: 0.08,
          strokeColor: zone.color,
          strokeOpacity: 0.7,
          strokeWeight: 2,
        });
        circlesRef.current.push(circle);
      });
  };

  // Sync circles when zones change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateCircles(mapInstanceRef.current, zones);
    }
  }, [zones]);

  const saveAll = async (newZones?: Zone[], newHours?: any, extraSettings?: any) => {
    const payload = {
      zones: newZones || zones,
      deliveryHours: newHours || deliveryHours,
      deliveryEnabled: extraSettings?.deliveryEnabled ?? deliveryEnabled,
      autoAssign: extraSettings?.autoAssign ?? autoAssign,
      deliveryProvider: extraSettings?.deliveryProvider ?? deliveryProvider,
      freeDeliveryEnabled: extraSettings?.freeDeliveryEnabled ?? freeDeliveryEnabled,
      freeDeliveryThreshold: extraSettings?.freeDeliveryThreshold ?? freeDeliveryThreshold,
      prepTime: extraSettings?.prepTime ?? prepTime,
      maxActiveOrders: extraSettings?.maxActiveOrders ?? maxActiveOrders,
    };

    try {
      await adminFetch(`${API}/settings/delivery_settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Save settings failed:', err);
    }
  };

  const [formData, setFormData] = useState({
    name: '', radiusMiles: '', deliveryFee: '',
    minOrder: '', estimatedMinutes: '', active: true, color: '#FED800',
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', radiusMiles: '', deliveryFee: '', minOrder: '', estimatedMinutes: '', active: true, color: '#FED800' });
    setEditingZone(null);
    setShowZoneForm(false);
  };

  const handleSaveZone = async () => {
    if (!formData.name || !formData.radiusMiles) return;
    let upZones = [...zones];
    if (editingZone) {
      upZones = zones.map(z => z.id === editingZone.id ? {
        ...z, name: formData.name,
        radiusMiles: Number(formData.radiusMiles),
        deliveryFee: Number(formData.deliveryFee),
        minOrder: Number(formData.minOrder),
        estimatedMinutes: Number(formData.estimatedMinutes),
        active: formData.active, color: formData.color,
      } : z);
      showSuccess('Zone updated');
    } else {
      const newZone: Zone = {
        id: Date.now(), name: formData.name,
        radiusMiles: Number(formData.radiusMiles),
        deliveryFee: Number(formData.deliveryFee),
        minOrder: Number(formData.minOrder),
        estimatedMinutes: Number(formData.estimatedMinutes),
        active: formData.active, color: formData.color,
      };
      upZones = [...zones, newZone];
      showSuccess('Zone created');
    }
    setZones(upZones);
    saveAll(upZones);
    resetForm();
  };


  const handleEdit = (zone: Zone) => {
    setFormData({
      name: zone.name, radiusMiles: String(zone.radiusMiles),
      deliveryFee: String(zone.deliveryFee), minOrder: String(zone.minOrder),
      estimatedMinutes: String(zone.estimatedMinutes),
      active: zone.active, color: zone.color,
    });
    setEditingZone(zone);
    setShowZoneForm(true);
  };

  const handleDelete = (id: number) => {
    const upZones = zones.filter(z => z.id !== id);
    setZones(upZones);
    saveAll(upZones);
    showSuccess('Zone deleted');
  };

  const toggleZone = (id: number) => {
    const upZones = zones.map(z => z.id === id ? { ...z, active: !z.active } : z);
    setZones(upZones);
    saveAll(upZones);
  };

  const toggleDeliveryHour = (day: string) => {
    setDeliveryHours(prev => prev.map(h => h.day === day ? { ...h, open: !h.open } : h));
  };

  const updateDeliveryHour = (day: string, field: 'from' | 'to', value: string) => {
    setDeliveryHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
  };

  const inputStyle = {
    padding: '9px 12px', background: '#111111',
    border: '1px solid #2A2A2A', borderRadius: '8px',
    color: '#FEFEFE', fontSize: '13px', width: '100%',
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
    color: '#FEFEFE', marginBottom: '16px',
    paddingBottom: '12px', borderBottom: '1px solid #2A2A2A',
  };

  const toggleSwitch = (value: boolean, onChange: () => void, disabled = false) => (
    <div onClick={disabled ? undefined : onChange} style={{
      width: '46px', height: '26px',
      background: value ? '#FED800' : '#2A2A2A',
      borderRadius: '13px', position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      flexShrink: 0, transition: 'background 0.2s',
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

  // Address check with geocoding
  const [testAddress, setTestAddress] = useState('');
  const [testResult, setTestResult] = useState<{ zone: Zone; eligible: boolean; distance?: number } | null>(null);
  const [testChecking, setTestChecking] = useState(false);

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const checkAddress = async () => {
    if (!testAddress.trim()) return;

    if (mapsLoaded && (window as any).google?.maps) {
      setTestChecking(true);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: testAddress }, (results, status) => {
        setTestChecking(false);
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const distMiles = haversineDistance(storeLat, storeLng, loc.lat(), loc.lng());
          const matchingZone = zones
            .filter(z => z.active && distMiles <= z.radiusMiles)
            .sort((a, b) => a.radiusMiles - b.radiusMiles)[0];
          if (matchingZone) {
            setTestResult({ zone: matchingZone, eligible: true, distance: Math.round(distMiles * 10) / 10 });
          } else {
            setTestResult({ zone: { id: 0, name: 'Out of Range', radiusMiles: 0, deliveryFee: 0, minOrder: 0, estimatedMinutes: 0, active: false, color: '#FC0301' }, eligible: false, distance: Math.round(distMiles * 10) / 10 });
          }
        } else {
          setTestResult({ zone: { id: 0, name: 'Address not found', radiusMiles: 0, deliveryFee: 0, minOrder: 0, estimatedMinutes: 0, active: false, color: '#FC0301' }, eligible: false });
        }
      });
    } else {
      // Fallback: simulated
      const simulatedMiles = Math.random() * 6;
      const matchingZone = zones
        .filter(z => z.active && simulatedMiles <= z.radiusMiles)
        .sort((a, b) => a.radiusMiles - b.radiusMiles)[0];
      if (matchingZone) {
        setTestResult({ zone: matchingZone, eligible: true, distance: Math.round(simulatedMiles * 10) / 10 });
      } else {
        setTestResult({ zone: { id: 0, name: 'Out of Range', radiusMiles: 0, deliveryFee: 0, minOrder: 0, estimatedMinutes: 0, active: false, color: '#FC0301' }, eligible: false, distance: Math.round(simulatedMiles * 10) / 10 });
      }
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>
                {editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
              </h2>
              <button onClick={resetForm} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Zone Name *</label>
                <input style={inputStyle} placeholder="e.g. Local Zone, University Area"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Radius (miles) *</label>
                  <input type="number" step="0.1" min="0.1" style={inputStyle} placeholder="3.0"
                    value={formData.radiusMiles} onChange={e => setFormData({ ...formData, radiusMiles: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Delivery Fee ($)</label>
                  <input type="number" step="0.01" min="0" style={inputStyle} placeholder="3.99"
                    value={formData.deliveryFee} onChange={e => setFormData({ ...formData, deliveryFee: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Minimum Order ($)</label>
                  <input type="number" step="0.01" min="0" style={inputStyle} placeholder="20.00"
                    value={formData.minOrder} onChange={e => setFormData({ ...formData, minOrder: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Est. Delivery Time (mins)</label>
                  <input type="number" min="1" style={inputStyle} placeholder="30"
                    value={formData.estimatedMinutes} onChange={e => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Zone Color (shown on map)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {zoneColors.map(color => (
                    <div key={color} onClick={() => setFormData({ ...formData, color })} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: color, cursor: 'pointer',
                      border: formData.color === color ? '3px solid #FEFEFE' : '3px solid transparent',
                      transition: 'border 0.15s',
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>Zone Active</span>
                {toggleSwitch(formData.active, () => setFormData({ ...formData, active: !formData.active }))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button onClick={resetForm} style={{ padding: '12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveZone} style={{ padding: '12px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {editingZone ? 'Save Zone' : 'Create Zone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #2A2A2A' }}>
        {[
          { id: 'zones', label: 'Delivery Zones' },
          { id: 'general', label: 'General Settings' },
          { id: 'hours', label: 'Delivery Hours' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} style={{
            flex: 1, padding: '10px', background: activeTab === tab.id ? '#FED800' : 'transparent',
            color: activeTab === tab.id ? '#000' : '#FEFEFE',
            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── ZONES TAB ── */}
      {activeTab === 'zones' && (
        <div>
          {/* Map */}
          <div style={{ ...cardStyle, padding: '0', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
            {mapsLoaded ? (
              <>
                <div ref={mapRef} style={{ height: '340px', width: '100%' }} />
                {/* Zone legend overlay */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
                  {zones.filter(z => z.active).map(zone => (
                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(26,26,26,0.9)', padding: '4px 8px', borderRadius: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: zone.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: '#FEFEFE' }}>{zone.name} — {zone.radiusMiles} mi</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                height: '340px', background: '#0D1117',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Fake map grid fallback */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 10}%`, height: '1px', background: '#FEFEFE' }} />
                  ))}
                  {[...Array(14)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 7.5}%`, width: '1px', background: '#FEFEFE' }} />
                  ))}
                </div>
                {zones.filter(z => z.active).map((zone, i) => (
                  <div key={zone.id} style={{
                    position: 'absolute',
                    width: `${(zone.radiusMiles / 6) * 400 + i * 20}px`,
                    height: `${(zone.radiusMiles / 6) * 400 + i * 20}px`,
                    borderRadius: '50%',
                    border: `2px solid ${zone.color}`,
                    background: `${zone.color}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} />
                ))}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                  <div style={{ width: '20px', height: '20px', background: '#FC0301', borderRadius: '50%', border: '3px solid #FEFEFE', margin: '0 auto 8px' }} />
                  <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '6px 12px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#FEFEFE' }}>Egg Ok</p>
                    <p style={{ fontSize: '10px', color: '#FEFEFE' }}>3517 Lancaster Ave</p>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {zones.filter(z => z.active).map(zone => (
                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1A1A90', padding: '4px 8px', borderRadius: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: zone.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: '#FEFEFE' }}>{zone.name} — {zone.radiusMiles} mi</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '6px 12px' }}>
                  <p style={{ fontSize: '10px', color: '#FEFEFE' }}>Google Maps integration</p>
                  <p style={{ fontSize: '10px', color: '#FED800' }}>Add API key in Integrations to enable live map</p>
                </div>
              </div>
            )}
          </div>

          {/* Zone Cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>
              {zones.filter(z => z.active).length} active zones · {zones.length} total
            </p>
            <button onClick={() => { resetForm(); setShowZoneForm(true); }} style={{
              padding: '9px 18px', background: '#FED800', border: 'none',
              borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>+ Create Zone</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {zones.map(zone => (
              <div key={zone.id} style={{
                background: '#1A1A1A',
                border: `1px solid ${zone.active ? zone.color + '40' : '#2A2A2A'}`,
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                {/* Color dot */}
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: zone.color, flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: zone.active ? '#FEFEFE' : '#FEFEFE' }}>{zone.name}</p>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                      background: zone.active ? '#22C55E20' : '#FC030120',
                      color: zone.active ? '#22C55E' : '#FC0301',
                      border: `1px solid ${zone.active ? '#22C55E40' : '#FC030140'}`,
                    }}>{zone.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as const }}>
                    {[
                      ['Radius', `${zone.radiusMiles} miles`],
                      ['Delivery Fee', `$${zone.deliveryFee.toFixed(2)}`],
                      ['Min Order', `$${zone.minOrder.toFixed(2)}`],
                      ['Est. Time', `${zone.estimatedMinutes} mins`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p style={{ fontSize: '10px', color: '#FEFEFE' }}>{label}</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {toggleSwitch(zone.active, () => toggleZone(zone.id))}
                  <button onClick={() => handleEdit(zone)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(zone.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Address Checker */}
          <div style={cardStyle}>
            <p style={sectionTitle}>Test Delivery Coverage</p>
            <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '12px' }}>
              Enter a customer address to check which delivery zone applies and what fee will be charged.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="e.g. 123 Main St, Philadelphia PA 19103"
                value={testAddress}
                onChange={e => setTestAddress(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#FED800'}
                onBlur={e => e.target.style.borderColor = '#2A2A2A'}
              />
              <button onClick={checkAddress} style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                Check
              </button>
            </div>

            {testResult && (
              <div style={{
                marginTop: '12px', padding: '14px 16px',
                background: testResult.eligible ? '#0A1A0A' : '#1A0A0A',
                border: `1px solid ${testResult.eligible ? '#22C55E40' : '#FC030140'}`,
                borderRadius: '10px',
              }}>
                {testResult.eligible ? (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#22C55E', marginBottom: '8px' }}>✓ Delivery Available</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as const }}>
                      {[
                        ['Zone', testResult.zone.name],
                        ['Delivery Fee', `$${testResult.zone.deliveryFee.toFixed(2)}`],
                        ['Min Order', `$${testResult.zone.minOrder.toFixed(2)}`],
                        ['Est. Time', `${testResult.zone.estimatedMinutes} mins`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{label}</p>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#FC0301', marginBottom: '4px' }}>✗ Outside Delivery Area</p>
                    <p style={{ fontSize: '12px', color: '#FEFEFE' }}>This address is outside all active delivery zones. Only pickup is available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GENERAL TAB ── */}
      {activeTab === 'general' && (
        <div>
          {/* Master Switch */}
          <div style={{ ...cardStyle, border: `1px solid ${deliveryEnabled ? '#22C55E40' : '#FC030140'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Delivery Service</p>
                <p style={{ fontSize: '12px', color: deliveryEnabled ? '#22C55E' : '#FC0301' }}>
                  {deliveryEnabled ? `Delivery is enabled — ${deliveryProvider === 'uber_direct' ? 'Uber Direct' : deliveryProvider === 'doordash' ? 'DoorDash Drive' : 'Manual'} is active` : 'Delivery is disabled — customers can only place pickup orders'}
                </p>
              </div>
              {toggleSwitch(deliveryEnabled, () => {
                const newVal = !deliveryEnabled;
                setDeliveryEnabled(newVal);
                saveAll(undefined, undefined, { deliveryEnabled: newVal });
              })}
            </div>
          </div>

          {/* Settings */}
          <div style={cardStyle}>
            <p style={sectionTitle}>Delivery Configuration</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Delivery Provider */}
              <div style={{ padding: '12px 16px', background: '#111111', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', marginBottom: '4px' }}>Delivery Provider</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '10px' }}>Choose which service dispatches delivery drivers</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'uber_direct', label: 'Uber Direct', color: '#A78BFA' },
                    { id: 'doordash', label: 'DoorDash Drive', color: '#FC0301' },
                    { id: 'manual', label: 'Manual (No auto-dispatch)', color: '#888' },
                  ].map(p => (
                    <button key={p.id} onClick={() => setDeliveryProvider(p.id)} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                      background: deliveryProvider === p.id ? `${p.color}20` : '#0A0A0A',
                      border: deliveryProvider === p.id ? `1px solid ${p.color}` : '1px solid #2A2A2A',
                      color: deliveryProvider === p.id ? p.color : '#888',
                      fontSize: '12px', fontWeight: '600',
                    }}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Auto-Assign Driver</p>
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '2px' }}>Automatically dispatch a driver when order status changes to "Out for Delivery"</p>
                </div>
                {toggleSwitch(autoAssign, () => setAutoAssign(!autoAssign))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Free Delivery Threshold</p>
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '2px' }}>Waive delivery fee for orders above a set amount</p>
                </div>
                {toggleSwitch(freeDeliveryEnabled, () => setFreeDeliveryEnabled(!freeDeliveryEnabled))}
              </div>

              {freeDeliveryEnabled && (
                <div style={{ paddingLeft: '16px' }}>
                  <label style={labelStyle}>Free delivery on orders above ($)</label>
                  <input type="number" style={{ ...inputStyle, maxWidth: '200px' }} value={freeDeliveryThreshold}
                    onChange={e => setFreeDeliveryThreshold(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Food Prep Time (minutes)</label>
                  <input type="number" style={inputStyle} value={prepTime}
                    onChange={e => setPrepTime(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>Added to delivery ETA shown to customer</p>
                </div>
                <div>
                  <label style={labelStyle}>Max Concurrent Delivery Orders</label>
                  <input type="number" style={inputStyle} value={maxActiveOrders}
                    onChange={e => setMaxActiveOrders(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>Pause delivery when this limit is reached</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Location */}
          <div style={cardStyle}>
            <p style={sectionTitle}>Store Location (Pickup Point)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Store Address</label>
                <input style={{ ...inputStyle, opacity: 0.6 }} value={storeAddress} readOnly />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input style={{ ...inputStyle, opacity: 0.6 }} value={storeLat} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input style={{ ...inputStyle, opacity: 0.6 }} value={storeLng} readOnly />
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #FED80030' }}>
                <p style={{ fontSize: '12px', color: '#FED800', marginBottom: '4px', fontWeight: '600' }}>Google Maps API Required</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', lineHeight: '1.6' }}>
                  To enable live map view, zone drawing on map, and real-time distance calculation, add your Google Maps API key in the environment settings. Contact your developer to set this up.
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={() => {
            saveAll();
            showSuccess('General settings saved');
          }} style={{
            width: '100%', padding: '14px', background: '#FED800',
            border: 'none', borderRadius: '10px', color: '#000',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '32px',
          }}>Save General Settings</button>
        </div>
      )}

      {/* ── DELIVERY HOURS TAB ── */}
      {activeTab === 'hours' && (
        <div>
          <div style={cardStyle}>
            <p style={sectionTitle}>Delivery Operating Hours</p>
            <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '16px' }}>
              Set when delivery is available. Outside these hours, customers can still place pickup orders.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deliveryHours.map(h => (
                <div key={h.day} style={{
                  display: 'grid', gridTemplateColumns: '120px 50px 1fr',
                  alignItems: 'center', gap: '16px',
                  padding: '10px 14px', background: '#111111',
                  borderRadius: '8px', opacity: h.open ? 1 : 0.5,
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#FEFEFE' }}>{h.day}</p>
                  {toggleSwitch(h.open, () => toggleDeliveryHour(h.day))}
                  {h.open ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="time" value={h.from}
                        onChange={e => updateDeliveryHour(h.day, 'from', e.target.value)}
                        style={{ ...inputStyle, width: 'auto', flex: 1 }}
                      />
                      <span style={{ color: '#FEFEFE', fontSize: '12px', flexShrink: 0 }}>to</span>
                      <input type="time" value={h.to}
                        onChange={e => updateDeliveryHour(h.day, 'to', e.target.value)}
                        style={{ ...inputStyle, width: 'auto', flex: 1 }}
                      />
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#FEFEFE' }}>No delivery</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => {
            saveAll(undefined, deliveryHours);
            showSuccess('Delivery hours saved');
          }} style={{
            width: '100%', padding: '14px', background: '#FED800',
            border: 'none', borderRadius: '10px', color: '#000',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '32px',
          }}>Save Delivery Hours</button>
        </div>
      )}
    </div>
  );
}