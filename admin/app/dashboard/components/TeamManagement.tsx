'use client';
import { useState } from 'react';

type Role = 'Super Admin' | 'Manager' | 'Staff';

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Invited' | 'Suspended';
  joinDate: string;
  lastActive: string;
};

const initialTeam: TeamMember[] = [
  { id: 1, name: 'Muhammad Usama', email: 'admin@eggok.com', role: 'Super Admin', status: 'Active', joinDate: '2026-01-01', lastActive: 'Today' },
  { id: 2, name: 'Berry', email: 'berry@eggok.com', role: 'Manager', status: 'Active', joinDate: '2026-03-01', lastActive: 'Today' },
  { id: 3, name: 'Steven', email: 'steven@eggok.com', role: 'Manager', status: 'Active', joinDate: '2026-03-01', lastActive: 'Yesterday' },
];

const rolePermissions: Record<Role, string[]> = {
  'Super Admin': ['Full access', 'Team management', 'Menu management', 'Orders', 'Promotions', 'Store settings', 'Analytics', 'Customer data'],
  'Manager': ['Menu management', 'Orders', 'Promotions', 'Store settings', 'Analytics'],
  'Staff': ['View orders', 'Update order status'],
};

const roleColor: Record<Role, string> = {
  'Super Admin': '#FED800',
  'Manager': '#60A5FA',
  'Staff': '#22C55E',
};

const statusColor: Record<string, string> = {
  Active: '#22C55E',
  Invited: '#F59E0B',
  Suspended: '#FC0301',
};

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPermissions, setShowPermissions] = useState<Role | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff' as Role,
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'Staff' });
    setEditingMember(null);
    setShowInviteForm(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    if (editingMember) {
      setTeam(prev => prev.map(m => m.id === editingMember.id ? {
        ...m, name: formData.name, email: formData.email, role: formData.role,
      } : m));
      showSuccess('Team member updated');
    } else {
      const newMember: TeamMember = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'Invited',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'Not yet',
      };
      setTeam(prev => [...prev, newMember]);
      showSuccess(`Invite sent to ${formData.email}`);
    }
    resetForm();
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({ name: member.name, email: member.email, role: member.role });
    setEditingMember(member);
    setShowInviteForm(true);
  };

  const handleSuspend = (member: TeamMember) => {
    if (member.role === 'Super Admin') return;
    setTeam(prev => prev.map(m => m.id === member.id ? {
      ...m, status: m.status === 'Suspended' ? 'Active' : 'Suspended',
    } : m));
    showSuccess(member.status === 'Suspended' ? 'Member reactivated' : 'Member suspended');
  };

  const handleDelete = (member: TeamMember) => {
    if (member.role === 'Super Admin') return;
    setTeam(prev => prev.filter(m => m.id !== member.id));
    showSuccess('Member removed');
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

      {/* Invite / Edit Modal */}
      {showInviteForm && (
        <div style={{
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
              <button onClick={resetForm} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. John Smith"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#FED800'}
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
                  onFocus={e => e.target.style.borderColor = '#FED800'}
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
                        border: `1px solid ${formData.role === role ? '#FED800' : '#2A2A2A'}`,
                        borderRadius: '8px', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: formData.role === role ? '#FED800' : '#FEFEFE', marginBottom: '4px' }}>{role}</p>
                          <p style={{ fontSize: '11px', color: '#888888' }}>
                            {role === 'Manager' ? 'Menu, orders, promotions, store settings' : 'View and update orders only'}
                          </p>
                        </div>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: `2px solid ${formData.role === role ? '#FED800' : '#2A2A2A'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {formData.role === role && (
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FED800' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!editingMember && (
                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', color: '#888888', lineHeight: '1.6' }}>
                    An invitation email will be sent to this address. The team member will need to set their password before they can log in.
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button onClick={resetForm} style={{
                  padding: '12px', background: 'transparent',
                  border: '1px solid #2A2A2A', borderRadius: '8px',
                  color: '#888888', fontSize: '13px', cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={handleSave} style={{
                  padding: '12px', background: '#FED800',
                  border: 'none', borderRadius: '8px',
                  color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>{editingMember ? 'Save Changes' : 'Send Invite'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Modal */}
      {showPermissions && (
        <div style={{
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
              <button onClick={() => setShowPermissions(null)} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
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
          { label: 'Total Members', value: String(team.length), color: '#FED800' },
          { label: 'Active', value: String(team.filter(m => m.status === 'Active').length), color: '#22C55E' },
          { label: 'Pending Invites', value: String(team.filter(m => m.status === 'Invited').length), color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#888888' }}>{team.length} team members</p>
        <button onClick={() => { setEditingMember(null); setFormData({ name: '', email: '', role: 'Staff' }); setShowInviteForm(true); }}
          style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
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
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
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
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{member.email}</td>
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
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{member.lastActive}</td>
                <td style={{ padding: '14px 16px' }}>
                  {member.role === 'Super Admin' ? (
                    <span style={{ fontSize: '11px', color: '#888888' }}>Owner account</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(member)} style={{
                        padding: '5px 10px', background: 'transparent',
                        border: '1px solid #2A2A2A', borderRadius: '6px',
                        color: '#888888', fontSize: '11px', cursor: 'pointer',
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