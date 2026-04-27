'use client';
import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

type ModifierOption = {
  id: number;
  name: string;
  price: number;
  isDefault: boolean;
};

type GlobalModifierGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
  linkedItemIds: number[];
};

type Props = {
  categories: { id: number; name: string }[];
  modifierGroups: GlobalModifierGroup[];
  initialData?: {
    name: string;
    description: string;
    pickupPrice: string;
    deliveryPrice: string;
    categoryId: number;
    available: boolean;
    imageUrl: string;
    linkedModifierIds: number[];
  };
  onSave: (data: {
    name: string;
    description: string;
    pickupPrice: string;
    deliveryPrice: string;
    categoryId: number;
    available: boolean;
    imageUrl: string;
    linkedModifierIds: number[];
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
};

export default function ItemForm({ categories, modifierGroups, initialData, onSave, onCancel, isEditing }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [pickupPrice, setPickupPrice] = useState(initialData?.pickupPrice || '');
  const [deliveryPrice, setDeliveryPrice] = useState(initialData?.deliveryPrice || '');
  const [syncPrices, setSyncPrices] = useState(initialData ? initialData.pickupPrice === initialData.deliveryPrice : true);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || 1);
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');
  const [linkedModifierIds, setLinkedModifierIds] = useState<number[]>(initialData?.linkedModifierIds || []);
  const [activeSection, setActiveSection] = useState<'basic' | 'modifiers'>('basic');
  const [modifierSearch, setModifierSearch] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: '#111111', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '500' as const,
    color: '#CACACA', display: 'block' as const, marginBottom: '6px',
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width;
        let h = img.height;
        if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
        else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressed);
        setImageUrl(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePickupPriceChange = (val: string) => {
    setPickupPrice(val);
    if (syncPrices) setDeliveryPrice(val);
  };

  const toggleModifier = (id: number) => {
    setLinkedModifierIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name || !pickupPrice) return;
    onSave({ name, description, pickupPrice, deliveryPrice: deliveryPrice || pickupPrice, categoryId, available, imageUrl, linkedModifierIds });
  };

  const toggleSwitch = (value: boolean, onChange: () => void) => (
    <div onClick={onChange} style={{ width: '42px', height: '24px', background: value ? '#E5B800' : '#2A2A2A', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '18px', height: '18px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>
            {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onCancel} style={{ background: 'transparent', color: '#FEFEFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
          {(['basic', 'modifiers'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveSection(tab)} style={{
              flex: 1, padding: '12px', background: 'transparent',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: activeSection === tab ? '#E5B800' : '#FEFEFE',
              borderBottom: activeSection === tab ? '2px solid #E5B800' : '2px solid transparent',
            }}>
              {tab === 'basic' ? 'Basic Info' : `Modifiers (${linkedModifierIds.length} linked)`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflow: 'auto', padding: '20px 24px', flex: 1 }}>

          {activeSection === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Image Upload */}
              <div>
                <label style={labelStyle}>Item Photo</label>
                <div style={{ border: '2px dashed #2A2A2A', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#111111', position: 'relative', transition: 'border-color 0.2s', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5B800'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <p style={{ fontSize: '12px', color: '#FEFEFE' }}>Upload photo 800x800px JPG/PNG</p>
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>Item Name *</label>
                <input style={inputStyle} placeholder="e.g. Signature Bacon Egg & Cheese"
                  value={name} onChange={e => setName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: '70px', resize: 'none' as const }}
                  placeholder="Describe the item..."
                  value={description} onChange={e => setDescription(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              {/* Pricing */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', border: '1px solid #2A2A2A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Pricing</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#FEFEFE' }}>Sync pickup & delivery price</span>
                    {toggleSwitch(syncPrices, () => setSyncPrices(!syncPrices))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Pickup Price (USD) *</label>
                    <input type="number" step="0.01" style={{ ...inputStyle, borderColor: '#E5B80040' }}
                      placeholder="0.00" value={pickupPrice}
                      onChange={e => handlePickupPriceChange(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#E5B80040'}
                    />
                    <p style={{ fontSize: '10px', color: '#FEFEFE', marginTop: '4px' }}>Price for in-store pickup</p>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, color: syncPrices ? '#FEFEFE' : '#CACACA' }}>Delivery Price (USD)</label>
                    <input type="number" step="0.01"
                      style={{ ...inputStyle, borderColor: '#FECE8640', opacity: syncPrices ? 0.5 : 1 }}
                      placeholder="0.00" value={deliveryPrice}
                      onChange={e => setDeliveryPrice(e.target.value)}
                      disabled={syncPrices}
                      onFocus={e => e.target.style.borderColor = '#FECE86'}
                      onBlur={e => e.target.style.borderColor = '#FECE8640'}
                    />
                    <p style={{ fontSize: '10px', color: '#FEFEFE', marginTop: '4px' }}>
                      {syncPrices ? 'Same as pickup price' : 'Price for delivery orders'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Available Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Available for ordering</p>
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '2px' }}>Customers can see and order this item</p>
                </div>
                {toggleSwitch(available, () => setAvailable(!available))}
              </div>

              <button onClick={() => setActiveSection('modifiers')} style={{ padding: '10px', background: 'transparent', border: '1px dashed #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Go to Modifiers tab to link modifier groups <ArrowRight size={12} />
              </button>
            </div>
          )}

          {activeSection === 'modifiers' && (
            <div>
              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', marginBottom: '12px', border: '1px solid #2A2A2A' }}>
                <p style={{ fontSize: '12px', color: '#FEFEFE', lineHeight: '1.6' }}>
                  Select modifier groups from your <span style={{ color: '#E5B800' }}>Global Modifier Library</span> to link to this item. Customers will see these options when ordering.
                </p>
              </div>

              {/* Search bar */}
              <input
                placeholder="Search modifier groups..."
                value={modifierSearch}
                onChange={e => setModifierSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '12px' }}
                onFocus={e => e.target.style.borderColor = '#E5B800'}
                onBlur={e => e.target.style.borderColor = '#2A2A2A'}
              />

              {/* Linked modifiers sequence */}
              {linkedModifierIds.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#E5B800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Linked drag to reorder
                  </p>
                  {linkedModifierIds.map((mid, index) => {
                    const group = modifierGroups.find(g => g.id === mid);
                    if (!group) return null;
                    return (
                      <div
                        key={mid}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('text/plain', String(index))}
                        onDragOver={e => { e.preventDefault(); setDragOverIndex(index); }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={e => {
                          e.preventDefault();
                          const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                          const toIndex = index;
                          if (fromIndex === toIndex) return;
                          const updated = [...linkedModifierIds];
                          const [moved] = updated.splice(fromIndex, 1);
                          updated.splice(toIndex, 0, moved);
                          setLinkedModifierIds(updated);
                          setDragOverIndex(null);
                        }}
                        onDragEnd={() => setDragOverIndex(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 14px', marginBottom: '6px',
                          background: dragOverIndex === index ? '#0D2A0D' : '#0A1A0A',
                          border: `1px solid ${dragOverIndex === index ? '#22C55E80' : '#22C55E30'}`,
                          borderRadius: '8px', cursor: 'grab',
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Drag handle */}
                        <div style={{ flexShrink: 0, color: '#FEFEFE', display: 'flex', flexDirection: 'column', gap: '3px', padding: '2px' }}>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FEFEFE' }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{group.name}</p>
                          <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{group.options.length} options · {group.required ? 'Required' : 'Optional'}</p>
                        </div>
                        <span style={{ fontSize: '11px', color: '#FEFEFE', flexShrink: 0 }}>#{index + 1}</span>
                        <button onClick={e => { e.stopPropagation(); toggleModifier(mid); }} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>Unlink</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All modifier groups — filtered */}
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                {modifierSearch ? 'Search Results' : 'All Modifier Groups'}
              </p>

              {modifierGroups.filter(g => g.name.toLowerCase().includes(modifierSearch.toLowerCase())).length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#111111', borderRadius: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#FEFEFE', marginBottom: '8px' }}>No modifier groups created yet.</p>
                  <p style={{ fontSize: '12px', color: '#FEFEFE' }}>Go to Menu Management, then Modifier Library to create groups first.</p>
                </div>
              ) : modifierGroups.filter(g => g.name.toLowerCase().includes(modifierSearch.toLowerCase())).map(group => {
                const isLinked = linkedModifierIds.includes(group.id);
                return (
                  <div key={group.id} onClick={() => toggleModifier(group.id)} style={{
                    padding: '14px 16px', marginBottom: '8px', cursor: 'pointer',
                    background: isLinked ? '#0A1A0A' : '#111111',
                    border: `1px solid ${isLinked ? '#22C55E40' : '#2A2A2A'}`,
                    borderRadius: '10px', transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: isLinked ? '#22C55E' : '#2A2A2A', border: `1px solid ${isLinked ? '#22C55E' : '#3A3A3A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isLinked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>{group.name}</p>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: group.required ? '#E5B80020' : '#2A2A2A', color: group.required ? '#E5B800' : '#FEFEFE' }}>
                            {group.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, paddingLeft: '30px' }}>
                          {group.options.slice(0, 4).map(opt => (
                            <span key={opt.id} style={{ fontSize: '11px', padding: '2px 8px', background: '#2A2A2A', borderRadius: '20px', color: '#FEFEFE' }}>
                              {opt.name}{opt.price > 0 ? ` +$${opt.price.toFixed(2)}` : ''}
                            </span>
                          ))}
                          {group.options.length > 4 && (
                            <span style={{ fontSize: '11px', color: '#FEFEFE' }}>+{group.options.length - 4} more</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: isLinked ? '#22C55E' : '#FEFEFE', flexShrink: 0, marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {isLinked ? <>Linked <Check size={12} /></> : 'Not linked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexShrink: 0 }}>
          <button onClick={onCancel} style={{ padding: '12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '12px', background: '#E5B800', border: 'none', borderRadius: '8px', color: '#000000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {isEditing ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}