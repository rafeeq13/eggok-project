'use client';
import { useState } from 'react';

type Promo = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  expiry: string;
  active: boolean;
};

const initialPromos: Promo[] = [
  { id: 1, code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 15, usageLimit: 100, usedCount: 23, expiry: '2026-12-31', active: true },
  { id: 2, code: 'EGGOK5', type: 'fixed', value: 5, minOrder: 20, usageLimit: 50, usedCount: 12, expiry: '2026-06-30', active: true },
  { id: 3, code: 'FIRSTORDER', type: 'percentage', value: 15, minOrder: 10, usageLimit: 200, usedCount: 87, expiry: '2026-12-31', active: false },
];

export default function Promotions() {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    usageLimit: '',
    expiry: '',
    active: true,
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ code: '', type: 'percentage', value: '', minOrder: '', usageLimit: '', expiry: '', active: true });
    setEditingPromo(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.code || !formData.value) return;
    if (editingPromo) {
      setPromos(prev => prev.map(p => p.id === editingPromo.id ? {
        ...p, code: formData.code.toUpperCase(), type: formData.type,
        value: Number(formData.value), minOrder: Number(formData.minOrder),
        usageLimit: Number(formData.usageLimit), expiry: formData.expiry, active: formData.active,
      } : p));
      showSuccess('Promo code updated');
    } else {
      const newPromo: Promo = {
        id: Date.now(), code: formData.code.toUpperCase(), type: formData.type,
        value: Number(formData.value), minOrder: Number(formData.minOrder),
        usageLimit: Number(formData.usageLimit), usedCount: 0,
        expiry: formData.expiry, active: formData.active,
      };
      setPromos(prev => [...prev, newPromo]);
      showSuccess('Promo code created');
    }
    resetForm();
  };

  const handleEdit = (promo: Promo) => {
    setFormData({
      code: promo.code, type: promo.type, value: String(promo.value),
      minOrder: String(promo.minOrder), usageLimit: String(promo.usageLimit),
      expiry: promo.expiry, active: promo.active,
    });
    setEditingPromo(promo);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setPromos(prev => prev.filter(p => p.id !== id));
    showSuccess('Promo code deleted');
  };

  const toggleActive = (id: number) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: '#111111', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '500' as const,
    color: '#888888', display: 'block' as const, marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#22C55E', color: '#000', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600',
        }}>{successMsg}</div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button onClick={resetForm} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Promo Code *</label>
                <input
                  style={inputStyle} placeholder="e.g. WELCOME10"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div>
                <label style={labelStyle}>Discount Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(['percentage', 'fixed'] as const).map(t => (
                    <button key={t} onClick={() => setFormData({ ...formData, type: t })} style={{
                      padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      background: formData.type === t ? '#FED800' : '#111111',
                      color: formData.type === t ? '#000000' : '#888888',
                      border: `1px solid ${formData.type === t ? '#FED800' : '#2A2A2A'}`,
                    }}>
                      {t === 'percentage' ? '% Percentage' : '$ Fixed Amount'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>
                    {formData.type === 'percentage' ? 'Discount (%)' : 'Discount ($)'} *
                  </label>
                  <input
                    type="number" style={inputStyle}
                    placeholder={formData.type === 'percentage' ? '10' : '5.00'}
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Minimum Order ($)</label>
                  <input
                    type="number" style={inputStyle} placeholder="15.00"
                    value={formData.minOrder}
                    onChange={e => setFormData({ ...formData, minOrder: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Usage Limit</label>
                  <input
                    type="number" style={inputStyle} placeholder="100"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input
                    type="date" style={inputStyle}
                    value={formData.expiry}
                    onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '13px', color: '#CACACA' }}>Active — customers can use this code</span>
                <div onClick={() => setFormData({ ...formData, active: !formData.active })} style={{
                  width: '42px', height: '24px',
                  background: formData.active ? '#FED800' : '#2A2A2A',
                  borderRadius: '12px', position: 'relative', cursor: 'pointer',
                }}>
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: formData.active ? '21px' : '3px',
                    width: '18px', height: '18px',
                    background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s',
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button onClick={resetForm} style={{
                  padding: '12px', background: 'transparent',
                  border: '1px solid #2A2A2A', borderRadius: '8px',
                  color: '#888888', fontSize: '13px', cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={handleSave} style={{
                  padding: '12px', background: '#FED800',
                  border: 'none', borderRadius: '8px',
                  color: '#000000', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>{editingPromo ? 'Save Changes' : 'Create Promo'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: '#888888', fontSize: '13px' }}>{promos.length} promo codes · {promos.filter(p => p.active).length} active</p>
        <button onClick={() => { setEditingPromo(null); setShowForm(true); }} style={{
          padding: '10px 20px', background: '#FED800',
          color: '#000000', borderRadius: '8px',
          fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer',
        }}>+ Create Promo Code</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Codes', value: String(promos.length), color: '#FED800' },
          { label: 'Active Codes', value: String(promos.filter(p => p.active).length), color: '#22C55E' },
          { label: 'Total Redemptions', value: String(promos.reduce((a, p) => a + p.usedCount, 0)), color: '#FECE86' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Promo List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {promos.map(promo => (
          <div key={promo.id} style={{
            background: '#1A1A1A',
            border: `1px solid ${promo.active ? '#2A2A2A' : '#FC030120'}`,
            borderRadius: '12px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '15px', fontWeight: '800',
                  color: promo.active ? '#FED800' : '#888888',
                  letterSpacing: '1px',
                }}>{promo.code}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                  background: promo.active ? '#22C55E20' : '#FC030120',
                  color: promo.active ? '#22C55E' : '#FC0301',
                  border: `1px solid ${promo.active ? '#22C55E40' : '#FC030140'}`,
                }}>{promo.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: '12px', color: '#888888' }}>
                  {promo.type === 'percentage' ? `${promo.value}% off` : `$${promo.value} off`}
                </span>
                <span style={{ fontSize: '12px', color: '#888888' }}>Min order: ${promo.minOrder}</span>
                <span style={{ fontSize: '12px', color: '#888888' }}>Used: {promo.usedCount}/{promo.usageLimit}</span>
                <span style={{ fontSize: '12px', color: '#888888' }}>Expires: {promo.expiry}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div onClick={() => toggleActive(promo.id)} style={{
                width: '42px', height: '24px',
                background: promo.active ? '#FED800' : '#2A2A2A',
                borderRadius: '12px', position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: promo.active ? '21px' : '3px',
                  width: '18px', height: '18px',
                  background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s',
                }} />
              </div>
              <button onClick={() => handleEdit(promo)} style={{
                padding: '6px 12px', background: 'transparent',
                border: '1px solid #2A2A2A', borderRadius: '6px',
                color: '#888888', fontSize: '12px', cursor: 'pointer',
              }}>Edit</button>
              <button onClick={() => handleDelete(promo.id)} style={{
                padding: '6px 12px', background: 'transparent',
                border: '1px solid #FC030130', borderRadius: '6px',
                color: '#FC0301', fontSize: '12px', cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}