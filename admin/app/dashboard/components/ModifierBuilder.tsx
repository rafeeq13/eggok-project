'use client';
import { useState } from 'react';

export type Modifier = {
  id: number;
  name: string;
  price: number;
  isDefault: boolean;
};

export type ModifierGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: Modifier[];
};

type Props = {
  groups: ModifierGroup[];
  onChange: (groups: ModifierGroup[]) => void;
};

export default function ModifierBuilder({ groups, onChange }: Props) {
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const inputStyle = {
    padding: '8px 12px',
    background: '#0A0A0A',
    border: '1px solid #2A2A2A',
    borderRadius: '8px',
    color: '#FEFEFE',
    fontSize: '12px',
    width: '100%',
  };

  const addGroup = () => {
    const newGroup: ModifierGroup = {
      id: Date.now(),
      name: '',
      required: false,
      minSelections: 0,
      maxSelections: 1,
      modifiers: [],
    };
    const updated = [...groups, newGroup];
    onChange(updated);
    setExpandedGroup(newGroup.id);
  };

  const updateGroup = (id: number, field: string, value: unknown) => {
    onChange(groups.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const deleteGroup = (id: number) => {
    onChange(groups.filter(g => g.id !== id));
  };

  const addModifier = (groupId: number) => {
    const newMod: Modifier = { id: Date.now(), name: '', price: 0, isDefault: false };
    onChange(groups.map(g => g.id === groupId ? { ...g, modifiers: [...g.modifiers, newMod] } : g));
  };

  const updateModifier = (groupId: number, modId: number, field: string, value: unknown) => {
    onChange(groups.map(g => g.id === groupId ? {
      ...g,
      modifiers: g.modifiers.map(m => m.id === modId ? { ...m, [field]: value } : m)
    } : g));
  };

  const deleteModifier = (groupId: number, modId: number) => {
    onChange(groups.map(g => g.id === groupId ? {
      ...g,
      modifiers: g.modifiers.filter(m => m.id !== modId)
    } : g));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Modifier Groups</p>
        <button onClick={addGroup} style={{
          padding: '6px 14px', background: '#FED800',
          border: 'none', borderRadius: '6px',
          color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
        }}>+ Add Group</button>
      </div>

      {groups.length === 0 && (
        <div style={{ padding: '20px', background: '#0A0A0A', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888888' }}>No modifier groups yet. Add one above.</p>
        </div>
      )}

      {groups.map(group => (
        <div key={group.id} style={{
          background: '#0A0A0A', border: '1px solid #2A2A2A',
          borderRadius: '10px', marginBottom: '10px', overflow: 'hidden',
        }}>
          {/* Group Header */}
          <div style={{
            padding: '12px 14px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer',
          }} onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ color: '#888888', fontSize: '12px' }}>
                {expandedGroup === group.id ? '▼' : '▶'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: group.name ? '#FEFEFE' : '#888888' }}>
                {group.name || 'Unnamed Group'}
              </span>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                background: group.required ? '#FED80020' : '#2A2A2A',
                color: group.required ? '#FED800' : '#888888',
                border: `1px solid ${group.required ? '#FED80040' : '#3A3A3A'}`,
              }}>{group.required ? 'Required' : 'Optional'}</span>
              <span style={{ fontSize: '11px', color: '#888888' }}>
                {group.modifiers.length} options
              </span>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteGroup(group.id); }} style={{
              padding: '4px 10px', background: 'transparent',
              border: '1px solid #FC030130', borderRadius: '6px',
              color: '#FC0301', fontSize: '11px', cursor: 'pointer',
            }}>Delete</button>
          </div>

          {/* Group Body */}
          {expandedGroup === group.id && (
            <div style={{ padding: '14px', borderTop: '1px solid #2A2A2A' }}>

              {/* Group Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '5px' }}>Group Name *</p>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Choose Your Bread, Add Toppings"
                    value={group.name}
                    onChange={e => updateGroup(group.id, 'name', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>

                <div>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '5px' }}>Min Selections</p>
                  <input
                    type="number" min="0" style={inputStyle}
                    value={group.minSelections}
                    onChange={e => updateGroup(group.id, 'minSelections', Number(e.target.value))}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>

                <div>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '5px' }}>Max Selections</p>
                  <input
                    type="number" min="1" style={inputStyle}
                    value={group.maxSelections}
                    onChange={e => updateGroup(group.id, 'maxSelections', Number(e.target.value))}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
              </div>

              {/* Required Toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: '#111111', borderRadius: '8px', marginBottom: '14px',
              }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>Required</p>
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>Customer must select from this group</p>
                </div>
                <div onClick={() => updateGroup(group.id, 'required', !group.required)} style={{
                  width: '40px', height: '22px',
                  background: group.required ? '#FED800' : '#2A2A2A',
                  borderRadius: '11px', position: 'relative', cursor: 'pointer',
                }}>
                  <div style={{
                    position: 'absolute', top: '2px',
                    left: group.required ? '20px' : '2px',
                    width: '18px', height: '18px',
                    background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s',
                  }} />
                </div>
              </div>

              {/* Modifier Options */}
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Options</p>

                {group.modifiers.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#888888', padding: '10px 0' }}>No options yet. Add one below.</p>
                )}

                {group.modifiers.map(mod => (
                  <div key={mod.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px 32px',
                    gap: '8px', alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <input
                      style={inputStyle}
                      placeholder="Option name (e.g. Brioche Bun)"
                      value={mod.name}
                      onChange={e => updateModifier(group.id, mod.id, 'name', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <input
                      type="number" min="0" step="0.01"
                      style={inputStyle}
                      placeholder="Price"
                      value={mod.price}
                      onChange={e => updateModifier(group.id, mod.id, 'price', Number(e.target.value))}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div onClick={() => updateModifier(group.id, mod.id, 'isDefault', !mod.isDefault)} style={{
                        width: '34px', height: '20px',
                        background: mod.isDefault ? '#FED800' : '#2A2A2A',
                        borderRadius: '10px', position: 'relative', cursor: 'pointer', flexShrink: 0,
                      }}>
                        <div style={{
                          position: 'absolute', top: '2px',
                          left: mod.isDefault ? '16px' : '2px',
                          width: '16px', height: '16px',
                          background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s',
                        }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#888888' }}>Default</span>
                    </div>
                    <button onClick={() => deleteModifier(group.id, mod.id)} style={{
                      width: '32px', height: '32px', background: 'transparent',
                      border: '1px solid #FC030130', borderRadius: '6px',
                      color: '#FC0301', fontSize: '14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>
                ))}

                <button onClick={() => addModifier(group.id)} style={{
                  padding: '7px 14px', background: 'transparent',
                  border: '1px dashed #2A2A2A', borderRadius: '8px',
                  color: '#888888', fontSize: '12px', cursor: 'pointer',
                  width: '100%', marginTop: '4px',
                }}>+ Add Option</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}