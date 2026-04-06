'use client';
import { useState, useEffect, useMemo } from 'react';

type Submission = {
  id: number;
  type: 'hiring' | 'catering' | 'contact';
  name: string;
  email: string;
  phone: string;
  data: any;
  status: string;
  adminNotes: string;
  createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const typeColor: Record<string, string> = { hiring: '#A78BFA', catering: '#F59E0B', contact: '#60A5FA' };
const typeLabel: Record<string, string> = { hiring: 'Job Application', catering: 'Catering Inquiry', contact: 'Contact Message' };
const statusColor: Record<string, string> = { new: '#FED800', reviewed: '#22C55E', archived: '#888888' };

export default function Submissions() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [counts, setCounts] = useState({ hiring: 0, catering: 0, contact: 0, total: 0 });
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'hiring' | 'catering' | 'contact'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'archived'>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Type-specific filters
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterGuestCount, setFilterGuestCount] = useState('all');
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterHasResume, setFilterHasResume] = useState<'all' | 'yes' | 'no'>('all');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/submissions`);
      if (res.ok) setAllSubmissions(await res.json());
    } catch (err) { console.error('Failed to fetch submissions:', err); }
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch(`${API}/submissions/counts`);
      if (res.ok) setCounts(await res.json());
    } catch {}
  };

  useEffect(() => { fetchAll(); fetchCounts(); }, []);

  // Extract unique values for dynamic filter dropdowns
  const uniquePositions = useMemo(() => [...new Set(allSubmissions.filter(s => s.type === 'hiring' && s.data?.position).map(s => s.data.position))], [allSubmissions]);
  const uniqueEventTypes = useMemo(() => [...new Set(allSubmissions.filter(s => s.type === 'catering' && s.data?.eventType).map(s => s.data.eventType))], [allSubmissions]);
  const uniqueSubjects = useMemo(() => [...new Set(allSubmissions.filter(s => s.type === 'contact' && s.data?.subject).map(s => s.data.subject))], [allSubmissions]);

  // Client-side filtering
  const filteredSubmissions = useMemo(() => {
    let list = [...allSubmissions];

    // Type
    if (filterType !== 'all') list = list.filter(s => s.type === filterType);
    // Status
    if (filterStatus !== 'all') list = list.filter(s => s.status === filterStatus);
    // Search (name, email, phone)
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.data?.message && s.data.message.toLowerCase().includes(q)) ||
        (s.data?.position && s.data.position.toLowerCase().includes(q)) ||
        (s.data?.subject && s.data.subject.toLowerCase().includes(q))
      );
    }
    // Date from
    if (filterDateFrom) list = list.filter(s => s.createdAt >= filterDateFrom);
    // Date to
    if (filterDateTo) {
      const toEnd = filterDateTo + 'T23:59:59';
      list = list.filter(s => s.createdAt <= toEnd);
    }
    // Hiring-specific
    if (filterType === 'hiring' || filterType === 'all') {
      if (filterPosition !== 'all') list = list.filter(s => s.type !== 'hiring' || s.data?.position === filterPosition);
      if (filterExperience !== 'all') list = list.filter(s => s.type !== 'hiring' || s.data?.experience === filterExperience);
      if (filterHasResume !== 'all') list = list.filter(s => s.type !== 'hiring' || (filterHasResume === 'yes' ? s.data?.hasResume : !s.data?.hasResume));
    }
    // Catering-specific
    if (filterType === 'catering' || filterType === 'all') {
      if (filterGuestCount !== 'all') list = list.filter(s => s.type !== 'catering' || s.data?.guestCount === filterGuestCount);
      if (filterEventType !== 'all') list = list.filter(s => s.type !== 'catering' || s.data?.eventType === filterEventType);
    }
    // Contact-specific
    if (filterType === 'contact' || filterType === 'all') {
      if (filterSubject !== 'all') list = list.filter(s => s.type !== 'contact' || s.data?.subject === filterSubject);
    }
    // Sort
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [allSubmissions, filterType, filterStatus, filterSearch, filterDateFrom, filterDateTo, sortBy, filterPosition, filterExperience, filterHasResume, filterGuestCount, filterEventType, filterSubject]);

  const activeFilterCount = [
    filterType !== 'all', filterStatus !== 'all', filterSearch.trim(), filterDateFrom, filterDateTo,
    filterPosition !== 'all', filterExperience !== 'all', filterHasResume !== 'all',
    filterGuestCount !== 'all', filterEventType !== 'all', filterSubject !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterType('all'); setFilterStatus('all'); setFilterSearch(''); setFilterDateFrom(''); setFilterDateTo('');
    setSortBy('newest'); setFilterPosition('all'); setFilterExperience('all'); setFilterHasResume('all');
    setFilterGuestCount('all'); setFilterEventType('all'); setFilterSubject('all');
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/submissions/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
        if (selected?.id === id) setSelected(updated);
        showSuccess(`Marked as ${status}`);
        fetchCounts();
      }
    } catch {}
  };

  const deleteSubmission = async (id: number) => {
    try {
      await fetch(`${API}/submissions/${id}`, { method: 'DELETE' });
      setAllSubmissions(prev => prev.filter(s => s.id !== id));
      if (selected?.id === id) setSelected(null);
      showSuccess('Deleted');
      fetchCounts();
    } catch {}
  };

  const cardStyle: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' };
  const selectStyle: React.CSSProperties = { padding: '7px 10px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '12px', cursor: 'pointer' };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderDetail = (sub: Submission) => {
    const rows: [string, string][] = [['Name', sub.name], ['Email', sub.email], ['Phone', sub.phone || '—']];
    if (sub.type === 'hiring') {
      rows.push(['Position', sub.data?.position || '—'], ['Experience', sub.data?.experience || '—']);
      if (sub.data?.message) rows.push(['Message', sub.data.message]);
      if (sub.data?.hasResume) rows.push(['Resume', 'Attached (sent via email)']);
    } else if (sub.type === 'catering') {
      rows.push(['Event Date', sub.data?.eventDate || '—'], ['Guests', sub.data?.guestCount || '—'], ['Event Type', sub.data?.eventType || '—']);
      if (sub.data?.location) rows.push(['Location', sub.data.location]);
      if (sub.data?.message) rows.push(['Details', sub.data.message]);
    } else {
      if (sub.data?.subject) rows.push(['Subject', sub.data.subject]);
      if (sub.data?.message) rows.push(['Message', sub.data.message]);
    }
    return rows;
  };

  return (
    <div style={{ maxWidth: '960px' }}>

      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'All New', count: counts.total, color: '#FED800', type: 'all' as const },
          { label: 'Applications', count: counts.hiring, color: typeColor.hiring, type: 'hiring' as const },
          { label: 'Catering', count: counts.catering, color: typeColor.catering, type: 'catering' as const },
          { label: 'Contact', count: counts.contact, color: typeColor.contact, type: 'contact' as const },
        ].map(c => (
          <div key={c.label} onClick={() => { setFilterType(c.type); setFilterStatus(c.type === 'all' ? 'new' : 'all'); }} style={{ ...cardStyle, padding: '14px 16px', textAlign: 'center', cursor: 'pointer', border: filterType === c.type ? `1px solid ${c.color}` : '1px solid #2A2A2A' }}>
            <p style={{ fontSize: '22px', fontWeight: '800', color: c.color, margin: '0 0 4px' }}>{c.count}</p>
            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Type Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '4px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #2A2A2A' }}>
        {(['all', 'hiring', 'catering', 'contact'] as const).map(tab => (
          <button key={tab} onClick={() => { setFilterType(tab); setSelected(null); setFilterPosition('all'); setFilterExperience('all'); setFilterHasResume('all'); setFilterGuestCount('all'); setFilterEventType('all'); setFilterSubject('all'); }} style={{
            flex: 1, padding: '10px', background: filterType === tab ? '#FED800' : 'transparent',
            color: filterType === tab ? '#000' : '#888', border: 'none', borderRadius: '8px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>{tab === 'all' ? 'All Types' : typeLabel[tab]}</button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ ...cardStyle, padding: '14px 16px', marginBottom: '14px' }}>
        {/* Row 1: Search + Status + Sort + Date */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search name, email, message..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
              style={{ ...selectStyle, paddingLeft: '30px', width: '100%' }}
              onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#2A2A2A'}
            />
          </div>

          {/* Status */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} style={selectStyle}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={selectStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Date From */}
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ ...selectStyle, width: '140px' }} title="From date" />
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ ...selectStyle, width: '140px' }} title="To date" />
        </div>

        {/* Row 2: Type-specific filters */}
        {(filterType === 'hiring' || (filterType === 'all' && allSubmissions.some(s => s.type === 'hiring'))) && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600' }}>Hiring:</span>
            <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} style={selectStyle}>
              <option value="all">All Positions</option>
              {uniquePositions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterExperience} onChange={e => setFilterExperience(e.target.value)} style={selectStyle}>
              <option value="all">All Experience</option>
              <option value="none">No experience</option>
              <option value="1">Less than 1 year</option>
              <option value="1-3">1-3 years</option>
              <option value="3+">3+ years</option>
            </select>
            <select value={filterHasResume} onChange={e => setFilterHasResume(e.target.value as any)} style={selectStyle}>
              <option value="all">Resume: Any</option>
              <option value="yes">Has Resume</option>
              <option value="no">No Resume</option>
            </select>
          </div>
        )}

        {(filterType === 'catering' || (filterType === 'all' && allSubmissions.some(s => s.type === 'catering'))) && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '600' }}>Catering:</span>
            <select value={filterEventType} onChange={e => setFilterEventType(e.target.value)} style={selectStyle}>
              <option value="all">All Event Types</option>
              {uniqueEventTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterGuestCount} onChange={e => setFilterGuestCount(e.target.value)} style={selectStyle}>
              <option value="all">All Guest Counts</option>
              <option value="10-25">10-25</option>
              <option value="25-50">25-50</option>
              <option value="50-100">50-100</option>
              <option value="100+">100+</option>
            </select>
          </div>
        )}

        {(filterType === 'contact' || (filterType === 'all' && allSubmissions.some(s => s.type === 'contact'))) && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: '600' }}>Contact:</span>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={selectStyle}>
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Active filters + clear */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #2A2A2A' }}>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active · Showing {filteredSubmissions.length} of {allSubmissions.length}
            </span>
            <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#FED800', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>

        {/* List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSubmissions.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#888', fontSize: '14px' }}>{allSubmissions.length === 0 ? 'No submissions yet' : 'No results match your filters'}</p>
              {allSubmissions.length > 0 && (
                <button onClick={clearAllFilters} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#FED800', fontSize: '13px', cursor: 'pointer' }}>Clear filters</button>
              )}
            </div>
          )}
          {filteredSubmissions.map(sub => (
            <div key={sub.id} onClick={() => setSelected(sub)} style={{
              ...cardStyle, padding: '14px 16px', cursor: 'pointer',
              border: selected?.id === sub.id ? '1px solid #FED800' : '1px solid #2A2A2A',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[sub.status] || '#888', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>{sub.name}</p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                  background: `${typeColor[sub.type]}20`, color: typeColor[sub.type],
                  border: `1px solid ${typeColor[sub.type]}40`,
                }}>{typeLabel[sub.type]}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                {sub.email} · {formatDate(sub.createdAt)}
              </p>
              {sub.type === 'hiring' && sub.data?.position && (
                <p style={{ fontSize: '11px', color: '#A78BFA', margin: '4px 0 0' }}>Position: {sub.data.position}{sub.data?.experience ? ` · ${sub.data.experience}` : ''}{sub.data?.hasResume ? ' · Resume attached' : ''}</p>
              )}
              {sub.type === 'catering' && sub.data?.eventDate && (
                <p style={{ fontSize: '11px', color: '#F59E0B', margin: '4px 0 0' }}>Event: {sub.data.eventDate} · {sub.data.guestCount} guests{sub.data?.eventType ? ` · ${sub.data.eventType}` : ''}</p>
              )}
              {sub.type === 'contact' && sub.data?.subject && (
                <p style={{ fontSize: '11px', color: '#60A5FA', margin: '4px 0 0' }}>Subject: {sub.data.subject}</p>
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: '380px', flexShrink: 0 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', margin: '0 0 4px' }}>{selected.name}</p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                      background: `${typeColor[selected.type]}20`, color: typeColor[selected.type],
                      border: `1px solid ${typeColor[selected.type]}40`,
                    }}>{typeLabel[selected.type]}</span>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                      background: `${statusColor[selected.status]}20`, color: statusColor[selected.status],
                      border: `1px solid ${statusColor[selected.status]}40`,
                    }}>{selected.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {renderDetail(selected).map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontSize: '13px', color: '#FEFEFE', margin: 0, wordBreak: 'break-word' }}>{value}</p>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Received</p>
                  <p style={{ fontSize: '13px', color: '#FEFEFE', margin: 0 }}>{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {['new', 'reviewed', 'archived'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${statusColor[s]}40`,
                    background: selected.status === s ? `${statusColor[s]}20` : 'transparent',
                    color: selected.status === s ? statusColor[s] : '#888',
                    fontSize: '11px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
                  }}>{s}</button>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`mailto:${selected.email}`} style={{
                  flex: 1, padding: '9px', textAlign: 'center', background: '#FED80015', border: '1px solid #FED80040',
                  borderRadius: '8px', color: '#FED800', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                }}>Reply via Email</a>
                <button onClick={() => { if (confirm('Delete this submission?')) deleteSubmission(selected.id); }} style={{
                  padding: '9px 14px', background: '#FC030115', border: '1px solid #FC030140',
                  borderRadius: '8px', color: '#FC0301', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
