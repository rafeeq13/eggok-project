import React, { useEffect, useState } from 'react';
import { X, Star, Check } from 'lucide-react';

import { API, adminFetch } from '../../../lib/api';

type RewardTier = {
  id: number;
  name: string;
  minPoints: number;
  color: string;
  perks: string[];
};

type Reward = {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'freeItem' | 'freeDelivery';
  value: string;
  active: boolean;
  redemptions: number;
};

type LoyaltyCustomer = {
  id: number;
  name: string;
  email: string;
  points: number;
  totalEarned: number;
  tier: string;
  joinDate: string;
  lastActivity: string;
  redemptions: number;
};

const tiers: RewardTier[] = [
  { id: 1, name: 'Bronze', minPoints: 0, color: '#CD7F32', perks: ['1 point per $1 spent', 'Birthday bonus points', 'Early access to new menu items'] },
  { id: 2, name: 'Silver', minPoints: 500, color: '#C0C0C0', perks: ['1.5 points per $1 spent', 'Birthday bonus points', 'Free delivery once a month', 'Priority support'] },
  { id: 3, name: 'Gold', minPoints: 1500, color: '#E5B800', perks: ['2 points per $1 spent', 'Double birthday bonus', 'Free delivery every week', 'Exclusive Gold menu items', 'Monthly surprise reward'] },
];

const initialRewards: Reward[] = [
  { id: 1, name: '$5 Off Your Order', description: 'Get $5 off any order over $15', pointsCost: 200, type: 'discount', value: '$5', active: true, redemptions: 47 },
  { id: 2, name: '$10 Off Your Order', description: 'Get $10 off any order over $25', pointsCost: 400, type: 'discount', value: '$10', active: true, redemptions: 23 },
  { id: 3, name: 'Free Signature Sandwich', description: 'Get any signature breakfast sandwich free', pointsCost: 500, type: 'freeItem', value: 'Signature Sandwich', active: true, redemptions: 31 },
  { id: 4, name: 'Free Delivery', description: 'Free delivery on your next order', pointsCost: 150, type: 'freeDelivery', value: 'Free Delivery', active: true, redemptions: 89 },
  { id: 5, name: 'Free Specialty Drink', description: 'Any specialty latte or matcha drink free', pointsCost: 250, type: 'freeItem', value: 'Specialty Drink', active: true, redemptions: 56 },
  { id: 6, name: '20% Off Order', description: 'Get 20% off your entire order', pointsCost: 600, type: 'discount', value: '20%', active: false, redemptions: 12 },
];

const loyaltyCustomers: LoyaltyCustomer[] = [
  { id: 1, name: 'James Wilson', email: 'james@gmail.com', points: 2340, totalEarned: 4200, tier: 'Gold', joinDate: '2025-09-20', lastActivity: '2026-03-20', redemptions: 8 },
  { id: 2, name: 'Sophia Anderson', email: 'sophia@gmail.com', points: 1820, totalEarned: 3100, tier: 'Gold', joinDate: '2025-10-15', lastActivity: '2026-03-19', redemptions: 5 },
  { id: 3, name: 'Mike Johnson', email: 'mike@gmail.com', points: 980, totalEarned: 1800, tier: 'Silver', joinDate: '2025-11-01', lastActivity: '2026-03-20', redemptions: 4 },
  { id: 4, name: 'John Smith', email: 'john@gmail.com', points: 756, totalEarned: 1200, tier: 'Silver', joinDate: '2025-11-15', lastActivity: '2026-03-20', redemptions: 3 },
  { id: 5, name: 'Sarah Lee', email: 'sarah@gmail.com', points: 340, totalEarned: 620, tier: 'Bronze', joinDate: '2025-12-15', lastActivity: '2026-03-18', redemptions: 2 },
  { id: 6, name: 'Olivia Brown', email: 'olivia@gmail.com', points: 180, totalEarned: 280, tier: 'Bronze', joinDate: '2026-02-01', lastActivity: '2026-03-17', redemptions: 0 },
];

const tierColor: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#E5B800',
};

export default function Loyalty() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'customers' | 'settings'>('overview');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberAdjustAmount, setMemberAdjustAmount] = useState('');
  const [memberNewTier, setMemberNewTier] = useState('');
  const [memberSaving, setMemberSaving] = useState(false);

  const openMemberModal = (member: any) => {
    setSelectedMember(member);
    setMemberAdjustAmount('');
    setMemberNewTier(member.tier || 'Bronze');
  };

  const handleMemberAdjustPoints = async () => {
    if (!selectedMember || !memberAdjustAmount || isNaN(Number(memberAdjustAmount)) || Number(memberAdjustAmount) === 0) return;
    setMemberSaving(true);
    try {
      const newPoints = Math.max(0, selectedMember.points + Number(memberAdjustAmount));
      await adminFetch(`${API}/customers/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPoints }),
      });
      showSuccess(`${Number(memberAdjustAmount) > 0 ? '+' : ''}${memberAdjustAmount} points for ${selectedMember.name}`);
      setMemberAdjustAmount('');
      fetchData();
      setSelectedMember((prev: any) => prev ? { ...prev, points: newPoints } : null);
    } catch { showSuccess('Failed to adjust points'); }
    setMemberSaving(false);
  };

  const handleMemberChangeTier = async () => {
    if (!selectedMember || memberNewTier === selectedMember.tier) return;
    setMemberSaving(true);
    try {
      await adminFetch(`${API}/customers/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: memberNewTier }),
      });
      showSuccess(`${selectedMember.name} moved to ${memberNewTier}`);
      fetchData();
      setSelectedMember((prev: any) => prev ? { ...prev, tier: memberNewTier } : null);
    } catch { showSuccess('Failed to change tier'); }
    setMemberSaving(false);
  };

  const handleRevokeRewardCode = async (codeIndex: number) => {
    if (!selectedMember) return;
    const rewards = Array.isArray(selectedMember.redeemedRewards) ? [...selectedMember.redeemedRewards] : [];
    rewards.splice(codeIndex, 1);
    try {
      await adminFetch(`${API}/customers/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redeemedRewards: rewards }),
      });
      showSuccess('Reward code revoked');
      fetchData();
      setSelectedMember((prev: any) => prev ? { ...prev, redeemedRewards: rewards } : null);
    } catch { showSuccess('Failed to revoke'); }
  };

  // Members filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTierFilter, setMemberTierFilter] = useState('all');
  const [memberSort, setMemberSort] = useState<'points-desc' | 'points-asc' | 'name' | 'recent' | 'redemptions'>('points-desc');
  const [memberMinPoints, setMemberMinPoints] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Rewards filters
  const [rewardSearch, setRewardSearch] = useState('');
  const [rewardTypeFilter, setRewardTypeFilter] = useState('all');
  const [rewardStatusFilter, setRewardStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rewardSort, setRewardSort] = useState<'name' | 'points-asc' | 'points-desc' | 'popular'>('name');

  // Settings
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [pointsPerDollar, setPointsPerDollar] = useState('1');
  const [pointsExpiry, setPointsExpiry] = useState('12');
  const [signupBonus, setSignupBonus] = useState('50');
  const [birthdayBonus, setBirthdayBonus] = useState('100');
  const [minRedeemPoints, setMinRedeemPoints] = useState('100');
  const [referralBonus, setReferralBonus] = useState('75');

  const [formData, setFormData] = useState({
    name: '', description: '', pointsCost: '',
    type: 'discount' as Reward['type'], value: '', active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const safeJson = async (res: Response, fallback: any = []) => {
        if (!res.ok) return fallback;
        const text = await res.text();
        if (!text) return fallback;
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          return fallback;
        }
      };

      const [rewardsRes, membersRes, settingsRes] = await Promise.all([
        adminFetch(`${API}/loyalty/rewards`),
        adminFetch(`${API}/loyalty/members`),
        adminFetch(`${API}/settings/loyalty`)
      ]);

      const rewardsData = await safeJson(rewardsRes, []);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);

      const membersRaw = await safeJson(membersRes, []);
      const membersData = Array.isArray(membersRaw) ? membersRaw : (membersRaw.data || []);
      const mapped = membersData.map((c: any) => ({
        ...c,
        totalEarned: c.totalEarned ?? c.totalPointsEarned ?? 0,
        lastActivity: c.lastActivity || c.lastOrder || '',
      }));
      setLoyaltyCustomers(mapped);

      const settingsData = await safeJson(settingsRes, null);
      if (settingsData) {
        const v = settingsData;
        setLoyaltyEnabled(v.loyaltyEnabled ?? true);
        setPointsPerDollar(String(v.pointsPerDollar || '1'));
        setPointsExpiry(String(v.pointsExpiry || '12'));
        setSignupBonus(String(v.signupBonus || '50'));
        setBirthdayBonus(String(v.birthdayBonus || '100'));
        setMinRedeemPoints(String(v.minRedeemPoints || '100'));
        setReferralBonus(String(v.referralBonus || '75'));
      }
    } catch (err) {
      console.error('Failed to fetch loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered members
  const filteredMembers = (() => {
    let list = [...loyaltyCustomers];
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    if (memberTierFilter !== 'all') list = list.filter(c => c.tier === memberTierFilter);
    if (memberMinPoints) list = list.filter(c => c.points >= Number(memberMinPoints));
    if (memberStatusFilter === 'active') list = list.filter(c => c.lastActivity && new Date(c.lastActivity) > new Date(Date.now() - 30 * 86400000));
    if (memberStatusFilter === 'inactive') list = list.filter(c => !c.lastActivity || new Date(c.lastActivity) <= new Date(Date.now() - 30 * 86400000));
    if (memberSort === 'points-desc') list.sort((a, b) => b.points - a.points);
    else if (memberSort === 'points-asc') list.sort((a, b) => a.points - b.points);
    else if (memberSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (memberSort === 'recent') list.sort((a, b) => (b.lastActivity || '').localeCompare(a.lastActivity || ''));
    else if (memberSort === 'redemptions') list.sort((a, b) => b.redemptions - a.redemptions);
    return list;
  })();

  // Filtered rewards
  const filteredRewards = (() => {
    let list = [...rewards];
    if (rewardSearch.trim()) {
      const q = rewardSearch.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    }
    if (rewardTypeFilter !== 'all') list = list.filter(r => r.type === rewardTypeFilter);
    if (rewardStatusFilter === 'active') list = list.filter(r => r.active);
    if (rewardStatusFilter === 'inactive') list = list.filter(r => !r.active);
    if (rewardSort === 'points-asc') list.sort((a, b) => a.pointsCost - b.pointsCost);
    else if (rewardSort === 'points-desc') list.sort((a, b) => b.pointsCost - a.pointsCost);
    else if (rewardSort === 'popular') list.sort((a, b) => b.redemptions - a.redemptions);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  })();

  const memberFilterCount = [memberSearch.trim(), memberTierFilter !== 'all', memberMinPoints, memberStatusFilter !== 'all'].filter(Boolean).length;
  const rewardFilterCount = [rewardSearch.trim(), rewardTypeFilter !== 'all', rewardStatusFilter !== 'all'].filter(Boolean).length;

  const clearMemberFilters = () => { setMemberSearch(''); setMemberTierFilter('all'); setMemberSort('points-desc'); setMemberMinPoints(''); setMemberStatusFilter('all'); };
  const clearRewardFilters = () => { setRewardSearch(''); setRewardTypeFilter('all'); setRewardStatusFilter('all'); setRewardSort('name'); };

  const selectStyle: React.CSSProperties = { padding: '7px 10px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '12px', cursor: 'pointer' };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', pointsCost: '', type: 'discount', value: '', active: true });
    setEditingReward(null);
    setShowRewardForm(false);
  };

  const handleSaveReward = async () => {
    if (!formData.name || !formData.pointsCost) return;
    const payload = {
      name: formData.name,
      description: formData.description,
      pointsCost: Number(formData.pointsCost),
      type: formData.type,
      value: formData.value,
      active: formData.active,
    };

    try {
      if (editingReward) {
        await adminFetch(`${API}/loyalty/rewards/${editingReward.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showSuccess('Reward updated');
      } else {
        await adminFetch(`${API}/loyalty/rewards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showSuccess('Reward created');
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error('Save reward failed:', err);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setFormData({ name: reward.name, description: reward.description, pointsCost: String(reward.pointsCost), type: reward.type, value: reward.value, active: reward.active });
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const toggleReward = async (reward: Reward) => {
    try {
      await adminFetch(`${API}/loyalty/rewards/${reward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !reward.active }),
      });
      fetchData();
    } catch (err) {
      console.error('Toggle reward failed:', err);
    }
  };

  const deleteReward = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    try {
      await adminFetch(`${API}/loyalty/rewards/${id}`, {
        method: 'DELETE',
      });
      showSuccess('Reward deleted');
      fetchData();
    } catch (err) {
      console.error('Delete reward failed:', err);
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

  const cardStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: '12px', padding: '20px 24px', marginBottom: '16px',
  };

  const toggleSwitch = (value: boolean, onChange: () => void) => (
    <div onClick={onChange} style={{ width: '46px', height: '26px', background: value ? '#E5B800' : '#2A2A2A', borderRadius: '13px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '20px', height: '20px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
    </div>
  );

  const totalPoints = loyaltyCustomers.reduce((a, c) => a + c.points, 0);
  const totalRedemptions = rewards.reduce((a, r) => a + r.redemptions, 0);

  return (
    <div style={{ maxWidth: '900px' }}>

      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Reward Form Modal */}
      {showRewardForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>
                {editingReward ? 'Edit Reward' : 'Create Reward'}
              </h2>
              <button onClick={resetForm} style={{ background: 'transparent', color: '#FEFEFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Reward Name *</label>
                  <input style={inputStyle} placeholder="e.g. Free Delivery"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input style={inputStyle} placeholder="e.g. Free delivery on your next order"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Points Required *</label>
                    <input type="number" style={inputStyle} placeholder="200"
                      value={formData.pointsCost} onChange={e => setFormData({ ...formData, pointsCost: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Reward Type</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Reward['type'] })}>
                      <option value="discount">Discount ($)</option>
                      <option value="freeItem">Free Item</option>
                      <option value="freeDelivery">Free Delivery</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Reward Value</label>
                  <input style={inputStyle}
                    placeholder={formData.type === 'discount' ? 'e.g. $5 or 10%' : formData.type === 'freeItem' ? 'e.g. Signature Sandwich' : 'Free Delivery'}
                    value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>Active customers can redeem</span>
                  {toggleSwitch(formData.active, () => setFormData({ ...formData, active: !formData.active }))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={resetForm} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveReward} style={{ padding: '11px', background: '#E5B800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                {editingReward ? 'Save Reward' : 'Create Reward'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${tierColor[selectedMember.tier] || '#888'}20`, border: `1px solid ${tierColor[selectedMember.tier] || '#888'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: tierColor[selectedMember.tier] || '#888' }}>
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>{selectedMember.name}</p>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{selectedMember.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Points', value: selectedMember.points, color: '#E5B800' },
                  { label: 'Total Earned', value: selectedMember.totalEarned || selectedMember.totalPointsEarned || 0, color: '#22C55E' },
                  { label: 'Redemptions', value: selectedMember.redemptions || 0, color: '#60A5FA' },
                  { label: 'Tier', value: selectedMember.tier, color: tierColor[selectedMember.tier] || '#888' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#111', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #2A2A2A' }}>
                    <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: s.color, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Adjust Points */}
              <div style={{ background: '#111', borderRadius: '10px', padding: '16px', border: '1px solid #2A2A2A', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adjust Points</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" placeholder="e.g. 50 or -20" value={memberAdjustAmount} onChange={e => setMemberAdjustAmount(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <button onClick={handleMemberAdjustPoints} disabled={memberSaving || !memberAdjustAmount}
                    style={{ padding: '9px 18px', background: '#E5B800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer', opacity: memberSaving ? 0.5 : 1 }}>
                    {memberSaving ? '...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Change Tier */}
              <div style={{ background: '#111', borderRadius: '10px', padding: '16px', border: '1px solid #2A2A2A', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change Tier</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={memberNewTier} onChange={e => setMemberNewTier(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer' }}>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                  <button onClick={handleMemberChangeTier} disabled={memberSaving || memberNewTier === selectedMember.tier}
                    style={{ padding: '9px 18px', background: memberNewTier === selectedMember.tier ? '#2A2A2A' : '#E5B800', border: 'none', borderRadius: '8px', color: memberNewTier === selectedMember.tier ? '#555' : '#000', fontSize: '12px', fontWeight: '700', cursor: memberNewTier === selectedMember.tier ? 'not-allowed' : 'pointer' }}>
                    Update
                  </button>
                </div>
              </div>

              {/* Unused Reward Codes */}
              <div style={{ background: '#111', borderRadius: '10px', padding: '16px', border: '1px solid #2A2A2A', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Reward Codes ({(Array.isArray(selectedMember.redeemedRewards) ? selectedMember.redeemedRewards : []).filter((r: any) => !r.used).length} unused)
                </p>
                {(Array.isArray(selectedMember.redeemedRewards) ? selectedMember.redeemedRewards : []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>No redeemed rewards</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(Array.isArray(selectedMember.redeemedRewards) ? selectedMember.redeemedRewards : []).map((r: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: r.used ? '#0A0A0A' : '#22C55E10', border: `1px solid ${r.used ? '#1A1A1A' : '#22C55E30'}` }}>
                        <div>
                          <p style={{ fontSize: '12px', color: r.used ? '#555' : '#FEFEFE', fontWeight: '600', margin: 0 }}>
                            {r.rewardName} {r.used && <span style={{ color: '#555', fontWeight: '400' }}>(used)</span>}
                          </p>
                          <p style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: '2px' }}>{r.code}</p>
                        </div>
                        {!r.used && (
                          <button onClick={() => handleRevokeRewardCode(i)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '10px', cursor: 'pointer' }}>
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Points History */}
              <div style={{ background: '#111', borderRadius: '10px', padding: '16px', border: '1px solid #2A2A2A' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Points History</p>
                {(Array.isArray(selectedMember.pointsHistory) ? selectedMember.pointsHistory : []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>No history yet</p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {(Array.isArray(selectedMember.pointsHistory) ? selectedMember.pointsHistory : []).slice(0, 20).map((h: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#FEFEFE', margin: 0 }}>{h.description}</p>
                          <p style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{h.date ? new Date(h.date).toLocaleDateString() : ''}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: h.type === 'redeemed' ? '#FC0301' : '#22C55E' }}>
                          {h.points > 0 ? '+' : ''}{h.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #2A2A2A' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'rewards', label: 'Rewards' },
          { id: 'customers', label: 'Members' },
          { id: 'settings', label: 'Settings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} style={{
            flex: 1, padding: '10px', background: activeTab === tab.id ? '#E5B800' : 'transparent',
            color: activeTab === tab.id ? '#000' : '#FEFEFE',
            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Master toggle */}
          <div style={{ ...cardStyle, border: `1px solid ${loyaltyEnabled ? '#22C55E40' : '#FC030140'}`, marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Loyalty Program</p>
                <p style={{ fontSize: '12px', color: loyaltyEnabled ? '#22C55E' : '#FC0301' }}>
                  {loyaltyEnabled ? 'Active customers are earning and redeeming points' : 'Disabled loyalty program is paused'}
                </p>
              </div>
              {toggleSwitch(loyaltyEnabled, () => setLoyaltyEnabled(!loyaltyEnabled))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Members', value: String(loyaltyCustomers.length), color: '#E5B800' },
              { label: 'Points in Circulation', value: totalPoints.toLocaleString(), color: '#60A5FA' },
              { label: 'Total Redemptions', value: String(totalRedemptions), color: '#22C55E' },
              { label: 'Active Rewards', value: String(rewards.filter(r => r.active).length), color: '#FECE86' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tiers */}
          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Membership Tiers</p>
            <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '16px' }}>Customers automatically advance tiers based on lifetime points earned</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {tiers.map(tier => (
                <div key={tier.id} style={{ background: '#111111', border: `1px solid ${tier.color}30`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${tier.color}20`, border: `2px solid ${tier.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color }}><Star size={14} fill={tier.color} /></div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: tier.color }}>{tier.name}</p>
                      <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{tier.minPoints}+ points</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tier.perks.map((perk, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: tier.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}><Check size={10} /></span>
                        <span style={{ fontSize: '11px', color: '#FEFEFE' }}>{perk}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', padding: '6px 10px', background: `${tier.color}10`, borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: tier.color }}>
                      {loyaltyCustomers.filter(c => c.tier === tier.name).length} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Rewards */}
          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px' }}>Most Redeemed Rewards</p>
            {[...rewards].sort((a, b) => b.redemptions - a.redemptions).slice(0, 4).map((reward, i) => (
              <div key={reward.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid #2A2A2A' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#E5B80020', border: '1px solid #E5B80040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#E5B800' }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{reward.name}</p>
                    <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{reward.pointsCost} points</p>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#22C55E' }}>{reward.redemptions} redeemed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REWARDS */}
      {activeTab === 'rewards' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#FEFEFE' }}>{rewards.filter(r => r.active).length} active · {rewards.length} total</p>
            <button onClick={() => { setEditingReward(null); setShowRewardForm(true); }} style={{ padding: '9px 18px', background: '#E5B800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              + Create Reward
            </button>
          </div>

          {/* Rewards Filters */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 180px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search rewards..." value={rewardSearch} onChange={e => setRewardSearch(e.target.value)} style={{ ...selectStyle, paddingLeft: '30px', width: '100%' }} />
              </div>
              <select value={rewardTypeFilter} onChange={e => setRewardTypeFilter(e.target.value)} style={selectStyle}>
                <option value="all">All Types</option>
                <option value="discount">Discount</option>
                <option value="freeItem">Free Item</option>
                <option value="freeDelivery">Free Delivery</option>
              </select>
              <select value={rewardStatusFilter} onChange={e => setRewardStatusFilter(e.target.value as any)} style={selectStyle}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={rewardSort} onChange={e => setRewardSort(e.target.value as any)} style={selectStyle}>
                <option value="name">Name A-Z</option>
                <option value="points-asc">Points: Low to High</option>
                <option value="points-desc">Points: High to Low</option>
                <option value="popular">Most Redeemed</option>
              </select>
            </div>
            {rewardFilterCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>Showing {filteredRewards.length} of {rewards.length}</span>
                <button onClick={clearRewardFilters} style={{ background: 'none', border: 'none', color: '#E5B800', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Clear filters</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredRewards.map(reward => (
              <div key={reward.id} style={{ background: '#1A1A1A', border: `1px solid ${reward.active ? '#2A2A2A' : '#FC030120'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: reward.active ? '#FEFEFE' : '#FEFEFE' }}>{reward.name}</p>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: reward.type === 'freeItem' ? '#22C55E20' : reward.type === 'freeDelivery' ? '#60A5FA20' : '#E5B80020', color: reward.type === 'freeItem' ? '#22C55E' : reward.type === 'freeDelivery' ? '#60A5FA' : '#E5B800' }}>
                      {reward.type === 'freeItem' ? 'Free Item' : reward.type === 'freeDelivery' ? 'Free Delivery' : 'Discount'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>{reward.description}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#E5B800', fontWeight: '600' }}>{reward.pointsCost} pts</span>
                    <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{reward.redemptions} redeemed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {toggleSwitch(reward.active, () => toggleReward(reward))}
                  <button onClick={() => handleEditReward(reward)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteReward(reward.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS */}
      {activeTab === 'customers' && (
        <div>
          {/* Tier summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
            {tiers.map(tier => (
              <div key={tier.id} onClick={() => setMemberTierFilter(memberTierFilter === tier.name ? 'all' : tier.name)} style={{ background: '#1A1A1A', border: `1px solid ${memberTierFilter === tier.name ? tier.color : tier.color + '30'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <p style={{ fontSize: '12px', color: tier.color, fontWeight: '600', marginBottom: '6px' }}>{tier.name}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: tier.color }}>{loyaltyCustomers.filter(c => c.tier === tier.name).length}</p>
                <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>members</p>
              </div>
            ))}
          </div>

          {/* Members Filters */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 180px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search name or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ ...selectStyle, paddingLeft: '30px', width: '100%' }} />
              </div>
              <select value={memberTierFilter} onChange={e => setMemberTierFilter(e.target.value)} style={selectStyle}>
                <option value="all">All Tiers</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
              </select>
              <select value={memberStatusFilter} onChange={e => setMemberStatusFilter(e.target.value as any)} style={selectStyle}>
                <option value="all">All Activity</option>
                <option value="active">Active (30 days)</option>
                <option value="inactive">Inactive (30+ days)</option>
              </select>
              <select value={memberSort} onChange={e => setMemberSort(e.target.value as any)} style={selectStyle}>
                <option value="points-desc">Points: High to Low</option>
                <option value="points-asc">Points: Low to High</option>
                <option value="name">Name A-Z</option>
                <option value="recent">Most Recent</option>
                <option value="redemptions">Most Redemptions</option>
              </select>
              <input type="number" placeholder="Min points" value={memberMinPoints} onChange={e => setMemberMinPoints(e.target.value)} style={{ ...selectStyle, width: '110px' }} />
            </div>
            {memberFilterCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>Showing {filteredMembers.length} of {loyaltyCustomers.length} members</span>
                <button onClick={clearMemberFilters} style={{ background: 'none', border: 'none', color: '#E5B800', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Clear filters</button>
              </div>
            )}
          </div>

          {/* Members Table */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['Member', 'Tier', 'Current Points', 'Total Earned', 'Redemptions', 'Last Active', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                    {loyaltyCustomers.length === 0 ? 'No members yet' : 'No members match your filters'}
                    {memberFilterCount > 0 && <button onClick={clearMemberFilters} style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#E5B800', fontSize: '12px', cursor: 'pointer' }}>Clear filters</button>}
                  </td></tr>
                ) : filteredMembers.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filteredMembers.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${tierColor[c.tier] || '#888'}20`, border: `1px solid ${tierColor[c.tier] || '#888'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: tierColor[c.tier] || '#888', flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{c.name}</p>
                          <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${tierColor[c.tier] || '#888'}20`, color: tierColor[c.tier] || '#888', border: `1px solid ${tierColor[c.tier] || '#888'}40` }}>
                        {c.tier}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '700', color: '#E5B800' }}>{(c.points || 0).toLocaleString()}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#FEFEFE' }}>{(c.totalEarned || 0).toLocaleString()}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#22C55E', fontWeight: '600' }}>{c.redemptions || 0}</td>
                    <td style={{ padding: '13px 16px', fontSize: '11px', color: '#FEFEFE' }}>{c.lastActivity || '—'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openMemberModal(c)} style={{ padding: '4px 10px', background: '#E5B80015', border: '1px solid #E5B80030', borderRadius: '6px', color: '#E5B800', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>Manage</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'settings' && (
        <div>
          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>Points Configuration</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Points earned per $1 spent', value: pointsPerDollar, set: setPointsPerDollar, hint: 'Base rate for all customers' },
                { label: 'Points expiry (months)', value: pointsExpiry, set: setPointsExpiry, hint: 'Set 0 for no expiry' },
                { label: 'Sign-up bonus points', value: signupBonus, set: setSignupBonus, hint: 'Given when customer creates account' },
                { label: 'Birthday bonus points', value: birthdayBonus, set: setBirthdayBonus, hint: 'Given on customer birthday' },
                { label: 'Minimum points to redeem', value: minRedeemPoints, set: setMinRedeemPoints, hint: 'Minimum balance needed to redeem' },
                { label: 'Referral bonus points', value: referralBonus, set: setReferralBonus, hint: 'Given when customer refers a friend' },
              ].map(item => (
                <div key={item.label}>
                  <label style={labelStyle}>{item.label}</label>
                  <input type="number" style={inputStyle} value={item.value}
                    onChange={e => item.set(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '4px' }}>{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>Tier Thresholds</p>
            <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '16px' }}>Points needed for each tier are based on lifetime total points earned</p>
            {tiers.map(tier => (
              <div key={tier.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${tier.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: tier.color }}>{tier.name}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints.toLocaleString()}+ points`}</span>
              </div>
            ))}
          </div>

          <button onClick={async () => {
            const payload = {
              loyaltyEnabled, pointsPerDollar: Number(pointsPerDollar), pointsExpiry: Number(pointsExpiry),
              signupBonus: Number(signupBonus), birthdayBonus: Number(birthdayBonus),
              minRedeemPoints: Number(minRedeemPoints), referralBonus: Number(referralBonus)
            };
            try {
              await adminFetch(`${API}/settings/loyalty`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              showSuccess('Loyalty settings saved');
            } catch (err) {
              console.error('Failed to save loyalty settings:', err);
            }
          }} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '32px' }}>
            Save Loyalty Settings
          </button>
        </div>
      )}
    </div>
  );
}