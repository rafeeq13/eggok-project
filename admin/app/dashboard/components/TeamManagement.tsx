'use client';
import { useState, useEffect } from 'react';

type Role = 'Super Admin' | 'Manager' | 'Staff';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Invited' | 'Suspended';
  joinDate: string;
  lastActive: string;
};

const initialTeam: TeamMember[] = [
  { id: '1', name: 'Muhammad Usama', email: 'admin@eggok.com', role: 'Super Admin', status: 'Active', joinDate: '2026-01-01', lastActive: 'Today' },
  { id: '2', name: 'Berry', email: 'berry@eggok.com', role: 'Manager', status: 'Active', joinDate: '2026-03-01', lastActive: 'Today' },
  { id: '3', name: 'Steven', email: 'steven@eggok.com', role: 'Manager', status: 'Active', joinDate: '2026-03-01', lastActive: 'Yesterday' },
];

const rolePermissions: Record<Role, string[]> = {
  'Super Admin': ['Full access', 'Team management', 'Menu management', 'Orders', 'Promotions', 'Store settings', 'Analytics', 'Customer data'],
  'Manager': ['Menu management', 'Orders', 'Promotions', 'Store settings', 'Analytics'],
  'Staff': ['View orders', 'Update order status'],
};

const roleColor: Record<Role, string> = {
  'Super Admin': '#E5B800',
  'Manager': '#60A5FA',
  'Staff': '#22C55E',
};

const statusColor: Record<string, string> = {
  Active: '#22C55E',
  Invited: '#F59E0B',
  Suspended: '#FC0301',
};

import { API, adminFetch } from '../../../lib/api';

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPermissions, setShowPermissions] = useState<Role | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff' as Role,
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${API}/users`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setTeam([]);
        return;
      }
      setTeam(data.map((m: any) => ({
        ...m,
        id: m.id, // backend UUID
        joinDate: new Date(m.joinDate).toISOString().split('T')[0],
        lastActive: m.lastActive ? new Date(m.lastActive).toLocaleDateString() : 'Not yet'
      })));
    } catch (err) {
      console.error('Failed to fetch team:', err);
      setErrorMsg('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    try {
      const saved = localStorage.getItem('admin_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) setCurrentUserId(parsed.id);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  useEffect(() => {
    if (!showProfileForm) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeProfileForm(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showProfileForm]);

  useEffect(() => {
    if (!showInviteForm) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') resetForm(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showInviteForm]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'Staff' });
    setEditingMember(null);
    setShowInviteForm(false);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    if (!isValidEmail(formData.email)) { setErrorMsg('Please enter a valid email address'); setTimeout(() => setErrorMsg(''), 3000); return; }
    try {
      if (editingMember) {
        const res = await adminFetch(`${API}/users/${editingMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showSuccess('Team member updated');
          fetchTeam();
        }
      } else {
        const res = await adminFetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, status: 'Invited' }),
        });
        if (res.ok) {
          showSuccess(`Invite sent to ${formData.email}`);
          fetchTeam();
        }
      }
      resetForm();
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg('Failed to save team member'); setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({ name: member.name, email: member.email, role: member.role });
    setEditingMember(member);
    setShowInviteForm(true);
  };

  const openProfileForm = (member: TeamMember) => {
    setProfileForm({ name: member.name, email: member.email, password: '', confirmPassword: '' });
    setShowProfileForm(true);
  };

  const closeProfileForm = () => {
    setShowProfileForm(false);
    setProfileForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleProfileSave = async () => {
    if (!currentUserId) return;
    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    if (!name || !email) {
      setErrorMsg('Name and email are required'); setTimeout(() => setErrorMsg(''), 3000); return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address'); setTimeout(() => setErrorMsg(''), 3000); return;
    }
    if (profileForm.password || profileForm.confirmPassword) {
      if (profileForm.password.length < 8) {
        setErrorMsg('Password must be at least 8 characters'); setTimeout(() => setErrorMsg(''), 3000); return;
      }
      if (profileForm.password !== profileForm.confirmPassword) {
        setErrorMsg('Passwords do not match'); setTimeout(() => setErrorMsg(''), 3000); return;
      }
    }
    const body: Record<string, string> = { name, email };
    if (profileForm.password) body.password = profileForm.password;
    try {
      setProfileSaving(true);
      const res = await adminFetch(`${API}/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.message || 'Failed to update profile'); setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
      try {
        const saved = localStorage.getItem('admin_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('admin_user', JSON.stringify({ ...parsed, name, email }));
        }
      } catch {
        // ignore
      }
      showSuccess('Profile updated');
      closeProfileForm();
      fetchTeam();
    } catch (err) {
      console.error('Profile update failed:', err);
      setErrorMsg('Failed to update profile'); setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSuspend = async (member: TeamMember) => {
    if (member.role === 'Super Admin') return;
    const newStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      const res = await adminFetch(`${API}/users/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showSuccess(newStatus === 'Active' ? 'Member reactivated' : 'Member suspended');
        fetchTeam();
      }
    } catch (err) {
      console.error('Suspend failed:', err);
      setErrorMsg('Failed to update member status'); setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (member.role === 'Super Admin') return;
    if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;
    try {
      const res = await adminFetch(`${API}/users/${member.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showSuccess('Member removed');
        fetchTeam();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setErrorMsg('Failed to remove team member'); setTimeout(() => setErrorMsg(''), 3000);
    }
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

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#22C55E', color: '#000', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600',
        }}>{successMsg}</div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#FC0301', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600',
        }}>{errorMsg}</div>
      )}

      {/* Invite / Edit Modal */}
      {showInviteForm && (
        <div role="dialog" aria-modal="true" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '460px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>
                {editingMember ? 'Edit Team Member' : 'Invite Team Member'}
              </h2>
              <button onClick={resetForm} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. John Smith"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email" style={inputStyle}
                  placeholder="e.g. john@eggok.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div>
                <label style={labelStyle}>Role *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(['Manager', 'Staff'] as Role[]).map(role => (
                    <div
                      key={role}
                      onClick={() => setFormData({ ...formData, role })}
                      style={{
                        padding: '12px 16px',
                        background: formData.role === role ? '#1A1A00' : '#111111',
                        border: `1px solid ${formData.role === role ? '#E5B800' : '#2A2A2A'}`,
                        borderRadius: '8px', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: formData.role === role ? '#E5B800' : '#FEFEFE', marginBottom: '4px' }}>{role}</p>
                          <p style={{ fontSize: '11px', color: '#FEFEFE' }}>
                            {role === 'Manager' ? 'Menu, orders, promotions, store settings' : 'View and update orders only'}
                          </p>
                        </div>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: `2px solid ${formData.role === role ? '#E5B800' : '#2A2A2A'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {formData.role === role && (
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E5B800' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!editingMember && (
                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', color: '#FEFEFE', lineHeight: '1.6' }}>
                    An invitation email will be sent to this address. The team member will need to set their password before they can log in.
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button onClick={resetForm} style={{
                  padding: '12px', background: 'transparent',
                  border: '1px solid #2A2A2A', borderRadius: '8px',
                  color: '#FEFEFE', fontSize: '13px', cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={handleSave} style={{
                  padding: '12px', background: '#E5B800',
                  border: 'none', borderRadius: '8px',
                  color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>{editingMember ? 'Save Changes' : 'Send Invite'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileForm && (
        <div role="dialog" aria-modal="true" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '460px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>Edit Your Profile</h2>
              <button onClick={closeProfileForm} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email" style={inputStyle}
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#E5B800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              <div style={{ height: '1px', background: '#2A2A2A', margin: '4px 0' }} />

              <p style={{ fontSize: '12px', color: '#FEFEFE' }}>
                Change password (leave blank to keep current)
              </p>

              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showProfilePassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    placeholder="At least 8 characters"
                    value={profileForm.password}
                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <button type="button" onClick={() => setShowProfilePassword(!showProfilePassword)}
                    aria-label={showProfilePassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                    {showProfilePassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showProfileConfirmPassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    placeholder="Re-enter new password"
                    value={profileForm.confirmPassword}
                    onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <button type="button" onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                    aria-label={showProfileConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                    {showProfileConfirmPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button onClick={closeProfileForm} disabled={profileSaving} style={{
                  padding: '12px', background: 'transparent',
                  border: '1px solid #2A2A2A', borderRadius: '8px',
                  color: '#FEFEFE', fontSize: '13px', cursor: profileSaving ? 'not-allowed' : 'pointer',
                  opacity: profileSaving ? 0.6 : 1,
                }}>Cancel</button>
                <button onClick={handleProfileSave} disabled={profileSaving} style={{
                  padding: '12px', background: '#E5B800',
                  border: 'none', borderRadius: '8px',
                  color: '#000', fontSize: '13px', fontWeight: '700', cursor: profileSaving ? 'not-allowed' : 'pointer',
                  opacity: profileSaving ? 0.6 : 1,
                }}>{profileSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Modal */}
      {showPermissions && (
        <div role="dialog" aria-modal="true" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '400px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>
                {showPermissions} Permissions
              </h2>
              <button onClick={() => setShowPermissions(null)} style={{ background: 'transparent', color: '#FEFEFE', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rolePermissions[showPermissions].map((perm, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#111111', borderRadius: '8px' }}>
                  <span style={{ color: '#22C55E', fontSize: '14px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Members', value: String(team.length), color: '#E5B800' },
          { label: 'Active', value: String(team.filter(m => m.status === 'Active').length), color: '#22C55E' },
          { label: 'Pending Invites', value: String(team.filter(m => m.status === 'Invited').length), color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{team.length} team members</p>
        <button onClick={() => { setEditingMember(null); setFormData({ name: '', email: '', role: 'Staff' }); setShowInviteForm(true); }}
          style={{ padding: '9px 18px', background: '#E5B800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          + Invite Member
        </button>
      </div>

      {/* Role Legend */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
        {(Object.keys(rolePermissions) as Role[]).map(role => (
          <button key={role} onClick={() => setShowPermissions(role)} style={{
            padding: '5px 12px', background: `${roleColor[role]}15`,
            border: `1px solid ${roleColor[role]}40`,
            borderRadius: '20px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '600', color: roleColor[role],
          }}>
            {role} — view permissions
          </button>
        ))}
      </div>

      {/* Team Table */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
              {['Member', 'Email', 'Role', 'Status', 'Last Active', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.map((member, i) => (
              <tr key={member.id} style={{ borderBottom: i < team.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: roleColor[member.role] + '30',
                      border: `1px solid ${roleColor[member.role]}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: '700', color: roleColor[member.role], flexShrink: 0,
                    }}>
                      {member.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#FEFEFE' }}>{member.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600',
                    background: `${roleColor[member.role]}15`,
                    color: roleColor[member.role],
                    border: `1px solid ${roleColor[member.role]}40`,
                  }}>{member.role}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600',
                    background: `${statusColor[member.status]}20`,
                    color: statusColor[member.status],
                    border: `1px solid ${statusColor[member.status]}40`,
                  }}>{member.status}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#FEFEFE' }}>{member.lastActive}</td>
                <td style={{ padding: '14px 16px' }}>
                  {member.role === 'Super Admin' ? (
                    member.id === currentUserId ? (
                      <button onClick={() => openProfileForm(member)} style={{
                        padding: '5px 10px', background: 'transparent',
                        border: '1px solid #E5B80040', borderRadius: '6px',
                        color: '#E5B800', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      }}>Edit Profile</button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#FEFEFE' }}>Owner account</span>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(member)} style={{
                        padding: '5px 10px', background: 'transparent',
                        border: '1px solid #2A2A2A', borderRadius: '6px',
                        color: '#FEFEFE', fontSize: '11px', cursor: 'pointer',
                      }}>Edit</button>
                      <button onClick={() => handleSuspend(member)} style={{
                        padding: '5px 10px', background: 'transparent',
                        border: `1px solid ${member.status === 'Suspended' ? '#22C55E30' : '#F59E0B30'}`,
                        borderRadius: '6px',
                        color: member.status === 'Suspended' ? '#22C55E' : '#F59E0B',
                        fontSize: '11px', cursor: 'pointer',
                      }}>{member.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</button>
                      <button onClick={() => handleDelete(member)} style={{
                        padding: '5px 10px', background: 'transparent',
                        border: '1px solid #FC030130', borderRadius: '6px',
                        color: '#FC0301', fontSize: '11px', cursor: 'pointer',
                      }}>Remove</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}