'use client';
import React, { useState, useEffect } from 'react';
import ItemForm from './ItemForm';

type Category = { id: number; name: string; active: boolean; sortOrder: number };
type ModifierOption = { id: number; name: string; price: number; isDefault: boolean };
type GlobalModifierGroup = { id: number; name: string; required: boolean; minSelections: number; maxSelections: number; options: ModifierOption[]; linkedItemIds: number[] };
type MenuItem = { id: number; categoryId: number; name: string; description: string; pickupPrice: string; deliveryPrice: string; available: boolean; imageUrl: string; linkedModifierIds: number[] };
type HistoryEntry = { id: number; action: string; target: string; detail: string; time: string };

const actionColor: Record<string, string> = {
  ADDED: '#22C55E', UPDATED: '#F59E0B', DELETED: '#FC0301',
  TOGGLED: '#60A5FA', LINKED: '#A78BFA', UNLINKED: '#FEFEFE',
};

import { API, adminFetch } from '../../../lib/api';

export default function MenuManagement() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'items' | 'modifiers' | 'history'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modifierGroups, setModifierGroups] = useState<GlobalModifierGroup[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchItems, setSearchItems] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [showModifierForm, setShowModifierForm] = useState(false);
  const [editingModifier, setEditingModifier] = useState<GlobalModifierGroup | null>(null);
  const [modName, setModName] = useState('');
  const [modRequired, setModRequired] = useState(false);
  const [modMin, setModMin] = useState(0);
  const [modMax, setModMax] = useState(1);
  const [modOptions, setModOptions] = useState<ModifierOption[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingModifierId, setLinkingModifierId] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PER_PAGE = 20;

  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('menuTab');
    if (saved && ['categories', 'items', 'modifiers', 'history'].includes(saved)) {
      setActiveTab(saved as any);
    }
    setMounted(true);
  }, []);

  const loadData = async () => {
    try {
      const [catsRes, itemsRes, modsRes] = await Promise.all([
        adminFetch(`${API}/menu/categories`).then(r => r.json()),
        adminFetch(`${API}/menu/items`).then(r => r.json()),
        adminFetch(`${API}/menu/modifier-groups`).then(r => r.json()),
      ]);
      setCategories(catsRes.map((c: any) => ({ id: c.id, name: c.name, active: c.isActive, sortOrder: c.sortOrder })));

      // Build item-modifier links from item's modifiers field (no extra API calls)
      const mappedItems = itemsRes.map((i: any) => ({
        id: i.id, categoryId: i.categoryId, name: i.name,
        description: i.description, pickupPrice: i.pickupPrice,
        deliveryPrice: i.deliveryPrice, available: i.isAvailable,
        imageUrl: i.image || '',
        linkedModifierIds: i.modifiers ? i.modifiers.map((m: any) => m.id) : [],
      }));
      setItems(mappedItems);

      // Build modifier->item links from items data (avoids N+1 API calls)
      const modLinksMap: Record<number, number[]> = {};
      mappedItems.forEach((item: any) => {
        (item.linkedModifierIds || []).forEach((modId: number) => {
          if (!modLinksMap[modId]) modLinksMap[modId] = [];
          modLinksMap[modId].push(item.id);
        });
      });

      setModifierGroups(modsRes.map((g: any) => ({
        id: g.id, name: g.name, required: g.required,
        minSelections: g.minSelections, maxSelections: g.maxSelections,
        options: (g.options || []).map((o: any) => ({ id: o.id, name: o.name, price: parseFloat(o.price), isDefault: o.isDefault })),
        linkedItemIds: modLinksMap[g.id] || [],
      })));
    } catch (e) { console.error('Load error:', e); }
  };

  useEffect(() => { loadData(); }, []);

  const switchTab = (tab: 'categories' | 'items' | 'modifiers' | 'history') => {
    setActiveTab(tab);
    localStorage.setItem('menuTab', tab);
  };

  const confirm = (title: string, message: string, onConfirm: () => void) => setConfirmDialog({ show: true, title, message, onConfirm });
  const addHistory = (action: string, target: string, detail: string) => {
    setHistory(prev => {
      const entry = { id: Date.now(), action, target, detail, time: new Date().toLocaleString() };
      const updated = [entry, ...prev].slice(0, 100); // keep last 100
      try { localStorage.setItem('menuHistory', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('menuHistory');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);
  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const inputStyle = { padding: '9px 12px', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', width: '100%' };

  const toggleSwitch = (value: boolean, onChange: () => void) => (
    <div onClick={onChange} style={{ width: '42px', height: '24px', background: value ? '#FED800' : '#2A2A2A', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '18px', height: '18px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
    </div>
  );

  // ── CATEGORY HANDLERS ──
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (editingCategory) {
      await adminFetch(`${API}/menu/categories/${editingCategory.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategoryName }) });
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName } : c));
      addHistory('UPDATED', 'Category', `${editingCategory.name} → ${newCategoryName}`);
      showSuccess('Category updated');
    } else {
      const res = await adminFetch(`${API}/menu/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategoryName, sortOrder: categories.length + 1 }) });
      const created = await res.json();
      setCategories(prev => [...prev, { id: created.id, name: created.name, active: created.isActive, sortOrder: created.sortOrder }]);
      addHistory('ADDED', 'Category', newCategoryName);
      showSuccess('Category added');
    }
    setNewCategoryName(''); setEditingCategory(null); setShowCategoryForm(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    const linkedCount = items.filter(i => i.categoryId === cat.id).length;
    confirm('Delete Category?', `Delete "${cat.name}"? ${linkedCount > 0 ? `⚠️ ${linkedCount} item(s) will become uncategorized.` : 'This cannot be undone.'}`,
      async () => {
        await adminFetch(`${API}/menu/categories/${cat.id}`, { method: 'DELETE' });
        setCategories(prev => prev.filter(c => c.id !== cat.id));
        addHistory('DELETED', 'Category', `${cat.name} — permanently deleted`);
        showSuccess('Category deleted');
        setConfirmDialog(null);
        loadData();
      }
    );
  };

  const toggleCategoryActive = async (cat: Category) => {
    await adminFetch(`${API}/menu/categories/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !cat.active }) });
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, active: !c.active } : c));
    addHistory('TOGGLED', 'Category', `${cat.name} — ${cat.active ? 'disabled' : 'enabled'}`);
  };

  // ── ITEM HANDLERS ──
  const handleSaveItem = async (data: any) => {
    const payload = {
      name: data.name, description: data.description,
      pickupPrice: parseFloat(data.pickupPrice),
      deliveryPrice: parseFloat(data.deliveryPrice),
      categoryId: Number(data.categoryId),
      isAvailable: data.available,
      image: data.imageUrl || null,
    };
    if (editingItem) {
      await adminFetch(`${API}/menu/items/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data, categoryId: Number(data.categoryId), available: data.available, imageUrl: data.imageUrl || '' } : i));
      addHistory('UPDATED', 'Item', `${editingItem.name} — edited`);
      showSuccess('Item updated');
    } else {
      const res = await adminFetch(`${API}/menu/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await res.json();
      setItems(prev => [...prev, { id: created.id, categoryId: created.categoryId, name: created.name, description: created.description, pickupPrice: created.pickupPrice, deliveryPrice: created.deliveryPrice, available: created.isAvailable, imageUrl: created.image || '', linkedModifierIds: [] }]);
      addHistory('ADDED', 'Item', data.name);
      showSuccess('Item added');
    }
    setShowItemForm(false); setEditingItem(null);
  };

  const handleDeleteItem = (item: MenuItem) => {
    confirm('Delete Item?', `Delete "${item.name}"? This cannot be undone.`,
      async () => {
        await adminFetch(`${API}/menu/items/${item.id}`, { method: 'DELETE' });
        setItems(prev => prev.filter(i => i.id !== item.id));
        setModifierGroups(prev => prev.map(g => ({ ...g, linkedItemIds: g.linkedItemIds.filter(id => id !== item.id) })));
        addHistory('DELETED', 'Item', `${item.name} — permanently deleted`);
        showSuccess('Item deleted');
        setConfirmDialog(null);
      }
    );
  };

  const toggleItemAvailable = async (item: MenuItem) => {
    await adminFetch(`${API}/menu/items/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: !item.available }) });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    addHistory('TOGGLED', 'Item', `${item.name} — ${item.available ? 'unavailable' : 'available'}`);
  };

  // ── MODIFIER HANDLERS ──
  const openNewModifier = () => { setModName(''); setModRequired(false); setModMin(0); setModMax(1); setModOptions([]); setEditingModifier(null); setShowModifierForm(true); };
  const openEditModifier = (group: GlobalModifierGroup) => { setModName(group.name); setModRequired(group.required); setModMin(group.minSelections); setModMax(group.maxSelections); setModOptions([...group.options]); setEditingModifier(group); setShowModifierForm(true); };
  const addOption = () => setModOptions(prev => [...prev, { id: Date.now(), name: '', price: 0, isDefault: false }]);
  const updateOption = (id: number, field: string, value: any) => setModOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  const deleteOption = (id: number) => setModOptions(prev => prev.filter(o => o.id !== id));

  const saveModifierGroup = async () => {
    if (!modName.trim() || modOptions.length === 0) return;
    const payload = { name: modName, required: modRequired, minSelections: modMin, maxSelections: modMax, options: modOptions };
    if (editingModifier) {
      const res = await adminFetch(`${API}/menu/modifier-groups/${editingModifier.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const updated = await res.json();
      const updatedGroup = { ...editingModifier, name: updated.name, required: updated.required, minSelections: updated.minSelections, maxSelections: updated.maxSelections, options: updated.options.map((o: any) => ({ id: o.id, name: o.name, price: parseFloat(o.price), isDefault: o.isDefault })) };
      setModifierGroups(prev => prev.map(g => g.id === editingModifier.id ? updatedGroup : g));
      for (const itemId of editingModifier.linkedItemIds) {
        const item = items.find(i => i.id === itemId);
        if (item) {
          const linkedMods = modifierGroups.filter(g => item.linkedModifierIds.includes(g.id)).map(g => g.id === editingModifier.id ? updatedGroup : g);
          await adminFetch(`${API}/menu/items/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modifiers: linkedMods }) });
        }
      }
      addHistory('UPDATED', 'Modifier Group', modName);
      showSuccess('Modifier group updated');
    } else {
      const res = await adminFetch(`${API}/menu/modifier-groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await res.json();
      setModifierGroups(prev => [...prev, { id: created.id, name: created.name, required: created.required, minSelections: created.minSelections, maxSelections: created.maxSelections, options: created.options.map((o: any) => ({ id: o.id, name: o.name, price: parseFloat(o.price), isDefault: o.isDefault })), linkedItemIds: [] }]);
      addHistory('ADDED', 'Modifier Group', `${modName} — ${modOptions.length} options`);
      showSuccess('Modifier group created');
    }
    setShowModifierForm(false);
  };

  const deleteModifierGroup = (id: number) => {
    const group = modifierGroups.find(g => g.id === id);
    confirm('Delete Modifier Group?', `Delete "${group?.name}"? This cannot be undone.`,
      async () => {
        await adminFetch(`${API}/menu/modifier-groups/${id}`, { method: 'DELETE' });
        setModifierGroups(prev => prev.filter(g => g.id !== id));
        setItems(prev => prev.map(i => ({ ...i, linkedModifierIds: i.linkedModifierIds.filter(mid => mid !== id) })));
        addHistory('DELETED', 'Modifier Group', `${group?.name} — permanently deleted`);
        showSuccess('Modifier deleted');
        setConfirmDialog(null);
      }
    );
  };

  const toggleLinkItem = async (modifierId: number, itemId: number) => {
    const group = modifierGroups.find(g => g.id === modifierId);
    const item = items.find(i => i.id === itemId);
    const isLinked = group?.linkedItemIds.includes(itemId);
    try {
      if (isLinked) {
        await adminFetch(`${API}/menu/items/${itemId}/modifiers/${modifierId}`, { method: 'DELETE' });
      } else {
        await adminFetch(`${API}/menu/items/${itemId}/modifiers/${modifierId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: 0 }) });
      }
      // Update local state only - junction table is already persisted by the POST/DELETE above
      setModifierGroups(prev => prev.map(g => g.id === modifierId ? { ...g, linkedItemIds: isLinked ? g.linkedItemIds.filter(id => id !== itemId) : [...g.linkedItemIds, itemId] } : g));
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, linkedModifierIds: isLinked ? i.linkedModifierIds.filter(mid => mid !== modifierId) : [...i.linkedModifierIds, modifierId] } : i));
      addHistory(isLinked ? 'UNLINKED' : 'LINKED', 'Modifier', `${group?.name} → ${item?.name}`);
    } catch (err) {
      console.error('Toggle link failed:', err);
      showSuccess('Failed to update modifier link');
    }
  };

  const filteredItems = items.filter(i => {
    const matchSearch = (i.name || '').toLowerCase().includes((searchItems || '').toLowerCase());
    const matchCategory = filterCategory === 'all' || i.categoryId === filterCategory;
    return matchSearch && matchCategory;
  });

  const filteredHistory = history.filter(entry => {
    if (historyFilter === 'all') return true;
    const entryDate = new Date(entry.time);
    const now = new Date();
    if (historyFilter === 'today') return entryDate.toDateString() === now.toDateString();
    if (historyFilter === 'week') return (now.getTime() - entryDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    if (historyFilter === 'month') return (now.getTime() - entryDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    return true;
  });
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);
  const totalHistoryPages = Math.ceil(filteredHistory.length / HISTORY_PER_PAGE);

  const tabs = [
    { id: 'categories', label: 'Categories', count: categories.length },
    { id: 'items', label: 'Items', count: items.length },
    { id: 'modifiers', label: 'Modifier Library', count: modifierGroups.length },
    { id: 'history', label: 'History', count: history.length },
  ] as const;

  const linkingGroup = modifierGroups.find(g => g.id === linkingModifierId);

  if (!mounted) return <div style={{ padding: '40px', textAlign: 'center', color: '#FEFEFE' }}>Loading...</div>;

  return (
    <div>
      {/* Confirmation Dialog */}
      {confirmDialog?.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE', marginBottom: '12px' }}>{confirmDialog.title}</h2>
            <p style={{ fontSize: '13px', color: '#FEFEFE', lineHeight: '1.6', marginBottom: '24px' }}>{confirmDialog.message}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setConfirmDialog(null)} style={{ padding: '12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDialog.onConfirm} style={{ padding: '12px', background: '#FC0301', border: 'none', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{successMsg}</div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemForm
          categories={categories}
          modifierGroups={modifierGroups}
          initialData={editingItem ? { name: editingItem.name, description: editingItem.description, pickupPrice: editingItem.pickupPrice, deliveryPrice: editingItem.deliveryPrice, categoryId: editingItem.categoryId, available: editingItem.available, imageUrl: editingItem.imageUrl, linkedModifierIds: editingItem.linkedModifierIds } : undefined}
          onSave={handleSaveItem}
          onCancel={() => { setShowItemForm(false); setEditingItem(null); }}
          isEditing={!!editingItem}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null); setNewCategoryName(''); }} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>Category Name *</p>
              <input style={inputStyle} placeholder="e.g. Desserts, Sides" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null); setNewCategoryName(''); }} style={{ padding: '12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveCategory} style={{ padding: '12px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{editingCategory ? 'Save Changes' : 'Add Category'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modifier Form Modal */}
      {showModifierForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FEFEFE' }}>{editingModifier ? 'Edit Modifier Group' : 'Create Modifier Group'}</h2>
              <button onClick={() => setShowModifierForm(false)} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflow: 'auto', padding: '20px 24px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>Group Name *</p>
                  <input style={inputStyle} placeholder="e.g. Choose Your Bread" value={modName} onChange={e => setModName(e.target.value)} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>Min Selections</p>
                    <input type="number" min="0" style={inputStyle} value={modMin} onChange={e => setModMin(Number(e.target.value))} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>Max Selections</p>
                    <input type="number" min="1" style={inputStyle} value={modMax} onChange={e => setModMax(Number(e.target.value))} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Required</p>
                    <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '2px' }}>Customer must select from this group</p>
                  </div>
                  {toggleSwitch(modRequired, () => setModRequired(!modRequired))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>Options *</p>
                    <button onClick={addOption} style={{ padding: '5px 12px', background: '#FED800', border: 'none', borderRadius: '6px', color: '#000', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>+ Add Option</button>
                  </div>
                  {modOptions.length === 0 && <p style={{ fontSize: '12px', color: '#FEFEFE', padding: '10px 0' }}>No options yet. Click Add Option.</p>}
                  {modOptions.map(opt => (
                    <div key={opt.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 30px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input style={inputStyle} placeholder="Option name" value={opt.name} onChange={e => updateOption(opt.id, 'name', e.target.value)} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                      <input type="number" step="0.01" min="0" style={{ ...inputStyle, width: 'auto' }} placeholder="Price" value={opt.price} onChange={e => updateOption(opt.id, 'price', Number(e.target.value))} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {toggleSwitch(opt.isDefault, () => updateOption(opt.id, 'isDefault', !opt.isDefault))}
                        <span style={{ fontSize: '10px', color: '#FEFEFE' }}>Default</span>
                      </div>
                      <button onClick={() => deleteOption(opt.id)} style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => setShowModifierForm(false)} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveModifierGroup} style={{ padding: '11px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{editingModifier ? 'Save Changes' : 'Create Group'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Items Modal */}
      {showLinkModal && linkingGroup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Link to Items</h2>
                <p style={{ fontSize: '12px', color: '#FEFEFE', marginTop: '3px' }}>{linkingGroup.name}</p>
              </div>
              <button onClick={() => setShowLinkModal(false)} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflow: 'auto', padding: '16px 24px', flex: 1 }}>
              {categories.map(cat => {
                const catItems = items.filter(i => i.categoryId === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.id} style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#FED800', textTransform: 'uppercase', marginBottom: '8px' }}>{cat.name}</p>
                    {catItems.map(item => {
                      const isLinked = linkingGroup.linkedItemIds.includes(item.id);
                      return (
                        <div key={item.id} onClick={() => toggleLinkItem(linkingGroup.id, item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: isLinked ? '#0A1A0A' : '#111111', border: `1px solid ${isLinked ? '#22C55E30' : '#2A2A2A'}`, borderRadius: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: isLinked ? '#22C55E' : '#2A2A2A', border: `1px solid ${isLinked ? '#22C55E' : '#3A3A3A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isLinked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{item.name}</p>
                          </div>
                          <span style={{ fontSize: '11px', color: isLinked ? '#22C55E' : '#FEFEFE', fontWeight: '600' }}>{isLinked ? 'Linked' : 'Not linked'}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', flexShrink: 0 }}>
              <button onClick={() => { setShowLinkModal(false); showSuccess('Links saved'); }} style={{ width: '100%', padding: '12px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '10px', border: '1px solid #2A2A2A', flex: 1 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => switchTab(tab.id)} style={{ flex: 1, padding: '10px 8px', background: activeTab === tab.id ? '#FED800' : 'transparent', color: activeTab === tab.id ? '#000000' : '#FEFEFE', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {tab.label}
              <span style={{ fontSize: '10px', fontWeight: '700', background: activeTab === tab.id ? '#00000020' : '#2A2A2A', color: activeTab === tab.id ? '#000' : '#FEFEFE', padding: '1px 6px', borderRadius: '10px' }}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{categories.filter(c => c.active).length} active · {categories.filter(c => !c.active).length} inactive</p>
            <button onClick={() => { setEditingCategory(null); setNewCategoryName(''); setShowCategoryForm(true); }} style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ Add Category</button>
          </div>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['Order', 'Category Name', 'Items', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#FEFEFE', fontSize: '13px' }}>No categories yet. Add your first one.</td></tr>
                  ) : categories.map((cat, i) => (
                    <tr key={cat.id} draggable
                      onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}
                      onDragOver={e => { e.preventDefault(); setDragOverCatIndex(i); }}
                      onDragLeave={() => setDragOverCatIndex(null)}
                      onDrop={e => {
                        e.preventDefault();
                        const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                        if (fromIndex === i) return;
                        const updated = [...categories];
                        const [moved] = updated.splice(fromIndex, 1);
                        updated.splice(i, 0, moved);
                        const reordered = updated.map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
        setCategories(reordered);
        setDragOverCatIndex(null);
        adminFetch(`${API}/menu/categories/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: reordered.map(c => c.id) }),
        });
        addHistory('REORDERED', 'Category', `${moved.name} moved to position ${i + 1}`);
                      }}
                      onDragEnd={() => setDragOverCatIndex(null)}
                      style={{ borderBottom: i < categories.length - 1 ? '1px solid #2A2A2A' : 'none', background: dragOverCatIndex === i ? '#1A1A00' : 'transparent', cursor: 'grab' }}
                    >
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#FEFEFE' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#FEFEFE' }} /><div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#FEFEFE' }} /></div>
                            <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#FEFEFE' }} /><div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#FEFEFE' }} /></div>
                          </div>
                          {cat.sortOrder}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: cat.active ? '#FEFEFE' : '#FEFEFE' }}>{cat.name}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#FED800', fontWeight: '600' }}>{items.filter(i => i.categoryId === cat.id).length}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: cat.active ? '#22C55E20' : '#FC030120', color: cat.active ? '#22C55E' : '#FC0301', border: `1px solid ${cat.active ? '#22C55E40' : '#FC030140'}` }}>{cat.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name); setShowCategoryForm(true); }} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => toggleCategoryActive(cat)} style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${cat.active ? '#FC030130' : '#22C55E30'}`, borderRadius: '6px', color: cat.active ? '#FC0301' : '#22C55E', fontSize: '11px', cursor: 'pointer' }}>{cat.active ? 'Disable' : 'Enable'}</button>
                          <button onClick={() => handleDeleteCategory(cat)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ITEMS TAB */}
      {activeTab === 'items' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
            <input placeholder="Search items..." value={searchItems} onChange={e => setSearchItems(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }} onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={{ ...inputStyle, minWidth: '180px', cursor: 'pointer' }}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
              {(['table', 'grid'] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{ padding: '8px 14px', background: viewMode === v ? '#FED800' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: viewMode === v ? '#000' : '#FEFEFE' }}>
                  {v === 'table' ? '☰ Table' : '⊞ Grid'}
                </button>
              ))}
            </div>
            <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ Add Item</button>
          </div>
          <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '12px' }}>Showing {filteredItems.length} of {items.length} items</p>
          {viewMode === 'table' && (
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                      {['Photo', 'Item Name', 'Category', 'Pickup Price', 'Delivery Price', 'Modifiers', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#FEFEFE', fontSize: '13px' }}>No items found</td></tr>
                    ) : filteredItems.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: i < filteredItems.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                        <td style={{ padding: '12px 16px' }}>
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} /> : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', marginBottom: '2px' }}>{item.name}</p>
                          <p style={{ fontSize: '11px', color: '#FEFEFE', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#FEFEFE' }}>{categories.find(c => c.id === item.categoryId)?.name || '—'}</td>
                        <td style={{ padding: '12px 16px' }}><p style={{ fontSize: '13px', fontWeight: '700', color: '#FED800' }}>${item.pickupPrice}</p><p style={{ fontSize: '10px', color: '#FEFEFE' }}>Pickup</p></td>
                        <td style={{ padding: '12px 16px' }}><p style={{ fontSize: '13px', fontWeight: '700', color: '#FECE86' }}>${item.deliveryPrice}</p><p style={{ fontSize: '10px', color: '#FEFEFE' }}>Delivery</p></td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: item.linkedModifierIds.length > 0 ? '#FED80020' : '#2A2A2A', color: item.linkedModifierIds.length > 0 ? '#FED800' : '#FEFEFE', border: `1px solid ${item.linkedModifierIds.length > 0 ? '#FED80040' : '#3A3A3A'}` }}>
                            {item.linkedModifierIds.length > 0 ? `${item.linkedModifierIds.length} groups` : 'None'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: item.available ? '#22C55E20' : '#FC030120', color: item.available ? '#22C55E' : '#FC0301', border: `1px solid ${item.available ? '#22C55E40' : '#FC030140'}` }}>{item.available ? 'Available' : 'Unavailable'}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                            <button onClick={async () => {
                              try {
                                const payload = { name: `${item.name} (Copy)`, description: item.description, pickupPrice: parseFloat(item.pickupPrice), deliveryPrice: parseFloat(item.deliveryPrice), categoryId: item.categoryId, isAvailable: item.available, image: item.imageUrl || null };
                                const res = await adminFetch(`${API}/menu/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                const created = await res.json();
                                // Copy modifier links
                                for (const modId of item.linkedModifierIds) {
                                  await adminFetch(`${API}/menu/items/${created.id}/modifiers/${modId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: 0 }) });
                                }
                                setItems(prev => [...prev, { id: created.id, categoryId: created.categoryId, name: created.name, description: created.description, pickupPrice: created.pickupPrice, deliveryPrice: created.deliveryPrice, available: created.isAvailable, imageUrl: created.image || '', linkedModifierIds: [...item.linkedModifierIds] }]);
                                addHistory('DUPLICATED', 'Item', `${item.name} → ${created.name}`);
                                showSuccess(`Duplicated "${item.name}"`);
                              } catch { showSuccess('Failed to duplicate'); }
                            }} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #FED80030', borderRadius: '6px', color: '#FED800', fontSize: '11px', cursor: 'pointer' }}>Duplicate</button>
                            <button onClick={() => toggleItemAvailable(item)} style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${item.available ? '#FC030130' : '#22C55E30'}`, borderRadius: '6px', color: item.available ? '#FC0301' : '#22C55E', fontSize: '11px', cursor: 'pointer' }}>{item.available ? 'Disable' : 'Enable'}</button>
                            <button onClick={() => handleDeleteItem(item)} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{ background: '#1A1A1A', border: `1px solid ${item.available ? '#2A2A2A' : '#FC030130'}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '140px', background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    {!item.available && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '12px', fontWeight: '700', color: '#FC0301', background: '#1A0000', padding: '4px 12px', borderRadius: '20px', border: '1px solid #FC030140' }}>UNAVAILABLE</span></div>}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '8px' }}>{categories.find(c => c.id === item.categoryId)?.name}</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1, background: '#111111', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#FEFEFE' }}>Pickup</p><p style={{ fontSize: '14px', fontWeight: '700', color: '#FED800' }}>${item.pickupPrice}</p></div>
                      <div style={{ flex: 1, background: '#111111', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#FEFEFE' }}>Delivery</p><p style={{ fontSize: '14px', fontWeight: '700', color: '#FECE86' }}>${item.deliveryPrice}</p></div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => toggleItemAvailable(item)} style={{ flex: 1, padding: '7px', background: 'transparent', border: `1px solid ${item.available ? '#FC030130' : '#22C55E30'}`, borderRadius: '6px', color: item.available ? '#FC0301' : '#22C55E', fontSize: '11px', cursor: 'pointer' }}>{item.available ? 'Disable' : 'Enable'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODIFIER LIBRARY TAB */}
      {activeTab === 'modifiers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{modifierGroups.length} modifier groups</p>
            <button onClick={openNewModifier} style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>+ Create Modifier Group</button>
          </div>
          {modifierGroups.length === 0 ? (
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#FEFEFE' }}>No modifier groups yet. Create your first one above.</p>
            </div>
          ) : modifierGroups.map(group => (
            <div key={group.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '18px 20px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE' }}>{group.name}</p>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: group.required ? '#FED80020' : '#2A2A2A', color: group.required ? '#FED800' : '#FEFEFE', border: `1px solid ${group.required ? '#FED80040' : '#3A3A3A'}` }}>{group.required ? 'Required' : 'Optional'}</span>
                    <span style={{ fontSize: '10px', color: '#FEFEFE' }}>Select {group.minSelections}–{group.maxSelections}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#FEFEFE' }}>{group.options.length} options · Linked to {group.linkedItemIds.length} items</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => { setLinkingModifierId(group.id); setShowLinkModal(true); }} style={{ padding: '6px 12px', background: '#FED80015', border: '1px solid #FED80040', borderRadius: '6px', color: '#FED800', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Link to Items ({group.linkedItemIds.length})</button>
                  <button onClick={() => openEditModifier(group)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteModifierGroup(group.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                {group.options.map(opt => (
                  <span key={opt.id} style={{ fontSize: '11px', padding: '4px 10px', background: opt.isDefault ? '#FED80020' : '#111111', border: `1px solid ${opt.isDefault ? '#FED80040' : '#2A2A2A'}`, borderRadius: '20px', color: opt.isDefault ? '#FED800' : '#FEFEFE' }}>
                    {opt.name}{opt.price > 0 ? ` +$${opt.price.toFixed(2)}` : ' (free)'}{opt.isDefault ? ' ★' : ''}
                  </span>
                ))}
              </div>
              {group.linkedItemIds.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '6px' }}>Linked to:</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    {group.linkedItemIds.map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      return item ? <span key={itemId} style={{ fontSize: '11px', padding: '3px 10px', background: '#22C55E15', border: '1px solid #22C55E30', borderRadius: '20px', color: '#22C55E' }}>{item.name}</span> : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' as const, gap: '10px' }}>
            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{filteredHistory.length} entries</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'today', 'week', 'month'] as const).map(f => (
                <button key={f} onClick={() => { setHistoryFilter(f); setHistoryPage(1); }} style={{ padding: '6px 12px', background: historyFilter === f ? '#FED800' : 'transparent', border: `1px solid ${historyFilter === f ? '#FED800' : '#2A2A2A'}`, borderRadius: '6px', color: historyFilter === f ? '#000' : '#FEFEFE', fontSize: '11px', cursor: 'pointer', fontWeight: historyFilter === f ? '700' : '400' }}>
                  {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
            {history.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: '#FEFEFE', fontSize: '13px' }}>No history yet</p>
            ) : paginatedHistory.map((entry, i) => (
              <div key={entry.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: i < paginatedHistory.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', flexShrink: 0, background: `${actionColor[entry.action]}20`, color: actionColor[entry.action], border: `1px solid ${actionColor[entry.action]}40` }}>{entry.action}</span>
                <span style={{ fontSize: '11px', color: '#FEFEFE', flexShrink: 0, minWidth: '80px' }}>{entry.target}</span>
                <span style={{ fontSize: '13px', color: '#FEFEFE', flex: 1 }}>{entry.detail}</span>
                <span style={{ fontSize: '11px', color: '#FEFEFE', flexShrink: 0 }}>{entry.time}</span>
              </div>
            ))}
          </div>
          {totalHistoryPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} style={{ padding: '6px 14px', background: historyPage === 1 ? '#111111' : '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', color: historyPage === 1 ? '#444' : '#FEFEFE', fontSize: '12px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
              <span style={{ fontSize: '12px', color: '#FEFEFE' }}>Page {historyPage} of {totalHistoryPages}</span>
              <button onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages} style={{ padding: '6px 14px', background: historyPage === totalHistoryPages ? '#111111' : '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', color: historyPage === totalHistoryPages ? '#444' : '#FEFEFE', fontSize: '12px', cursor: historyPage === totalHistoryPages ? 'not-allowed' : 'pointer' }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}