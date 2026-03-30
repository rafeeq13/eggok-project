'use client';
import { useState } from 'react';

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
  { id: 3, name: 'Gold', minPoints: 1500, color: '#FED800', perks: ['2 points per $1 spent', 'Double birthday bonus', 'Free delivery every week', 'Exclusive Gold menu items', 'Monthly surprise reward'] },
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
  Gold: '#FED800',
};

export default function Loyalty() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'customers' | 'settings'>('overview');
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

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

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', pointsCost: '', type: 'discount', value: '', active: true });
    setEditingReward(null);
    setShowRewardForm(false);
  };

  const handleSaveReward = () => {
    if (!formData.name || !formData.pointsCost) return;
    if (editingReward) {
      setRewards(prev => prev.map(r => r.id === editingReward.id ? {
        ...r, name: formData.name, description: formData.description,
        pointsCost: Number(formData.pointsCost), type: formData.type,
        value: formData.value, active: formData.active,
      } : r));
      showSuccess('Reward updated');
    } else {
      setRewards(prev => [...prev, {
        id: Date.now(), name: formData.name, description: formData.description,
        pointsCost: Number(formData.pointsCost), type: formData.type,
        value: formData.value, active: formData.active, redemptions: 0,
      }]);
      showSuccess('Reward created');
    }
    resetForm();
  };

  const handleEditReward = (reward: Reward) => {
    setFormData({ name: reward.name, description: reward.description, pointsCost: String(reward.pointsCost), type: reward.type, value: reward.value, active: reward.active });
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const toggleReward = (id: number) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteReward = (id: number) => {
    setRewards(prev => prev.filter(r => r.id !== id));
    showSuccess('Reward deleted');
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

  const cardStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: '12px', padding: '20px 24px', marginBottom: '16px',
  };

  const toggleSwitch = (value: boolean, onChange: () => void) => (
    <div onClick={onChange} style={{ width: '46px', height: '26px', background: value ? '#FED800' : '#2A2A2A', borderRadius: '13px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
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
              <button onClick={resetForm} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Reward Name *</label>
                  <input style={inputStyle} placeholder="e.g. Free Delivery"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input style={inputStyle} placeholder="e.g. Free delivery on your next order"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Points Required *</label>
                    <input type="number" style={inputStyle} placeholder="200"
                      value={formData.pointsCost} onChange={e => setFormData({ ...formData, pointsCost: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
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
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>Active — customers can redeem</span>
                  {toggleSwitch(formData.active, () => setFormData({ ...formData, active: !formData.active }))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={resetForm} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveReward} style={{ padding: '11px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                {editingReward ? 'Save Reward' : 'Create Reward'}
              </button>
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
            flex: 1, padding: '10px', background: activeTab === tab.id ? '#FED800' : 'transparent',
            color: activeTab === tab.id ? '#000' : '#888888',
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
                  {loyaltyEnabled ? 'Active — customers are earning and redeeming points' : 'Disabled — loyalty program is paused'}
                </p>
              </div>
              {toggleSwitch(loyaltyEnabled, () => setLoyaltyEnabled(!loyaltyEnabled))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Members', value: String(loyaltyCustomers.length), color: '#FED800' },
              { label: 'Points in Circulation', value: totalPoints.toLocaleString(), color: '#60A5FA' },
              { label: 'Total Redemptions', value: String(totalRedemptions), color: '#22C55E' },
              { label: 'Active Rewards', value: String(rewards.filter(r => r.active).length), color: '#FECE86' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tiers */}
          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Membership Tiers</p>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>Customers automatically advance tiers based on lifetime points earned</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {tiers.map(tier => (
                <div key={tier.id} style={{ background: '#111111', border: `1px solid ${tier.color}30`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${tier.color}20`, border: `2px solid ${tier.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⭐</div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: tier.color }}>{tier.name}</p>
                      <p style={{ fontSize: '11px', color: '#888888' }}>{tier.minPoints}+ points</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tier.perks.map((perk, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: tier.color, fontSize: '10px', flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '11px', color: '#888888' }}>{perk}</span>
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
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FED800' }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{reward.name}</p>
                    <p style={{ fontSize: '11px', color: '#888888' }}>{reward.pointsCost} points</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#888888' }}>{rewards.filter(r => r.active).length} active · {rewards.length} total</p>
            <button onClick={() => { setEditingReward(null); setShowRewardForm(true); }} style={{ padding: '9px 18px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              + Create Reward
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rewards.map(reward => (
              <div key={reward.id} style={{ background: '#1A1A1A', border: `1px solid ${reward.active ? '#2A2A2A' : '#FC030120'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: reward.active ? '#FEFEFE' : '#888888' }}>{reward.name}</p>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: reward.type === 'freeItem' ? '#22C55E20' : reward.type === 'freeDelivery' ? '#60A5FA20' : '#FED80020', color: reward.type === 'freeItem' ? '#22C55E' : reward.type === 'freeDelivery' ? '#60A5FA' : '#FED800' }}>
                      {reward.type === 'freeItem' ? 'Free Item' : reward.type === 'freeDelivery' ? 'Free Delivery' : 'Discount'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{reward.description}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#FED800', fontWeight: '600' }}>{reward.pointsCost} pts</span>
                    <span style={{ fontSize: '12px', color: '#888888' }}>{reward.redemptions} redeemed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {toggleSwitch(reward.active, () => toggleReward(reward.id))}
                  <button onClick={() => handleEditReward(reward)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888888', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {tiers.map(tier => (
              <div key={tier.id} style={{ background: '#1A1A1A', border: `1px solid ${tier.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: tier.color, fontWeight: '600', marginBottom: '6px' }}>{tier.name}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: tier.color }}>{loyaltyCustomers.filter(c => c.tier === tier.name).length}</p>
                <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>members</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['Member', 'Tier', 'Current Points', 'Total Earned', 'Redemptions', 'Last Active'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loyaltyCustomers.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < loyaltyCustomers.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${tierColor[c.tier]}20`, border: `1px solid ${tierColor[c.tier]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: tierColor[c.tier], flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{c.name}</p>
                          <p style={{ fontSize: '11px', color: '#888888' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${tierColor[c.tier]}20`, color: tierColor[c.tier], border: `1px solid ${tierColor[c.tier]}40` }}>
                        {c.tier}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '700', color: '#FED800' }}>{c.points.toLocaleString()}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#888888' }}>{c.totalEarned.toLocaleString()}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#22C55E', fontWeight: '600' }}>{c.redemptions}</td>
                    <td style={{ padding: '13px 16px', fontSize: '11px', color: '#888888' }}>{c.lastActivity}</td>
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
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2A2A2A' }}>Tier Thresholds</p>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>Points needed for each tier are based on lifetime total points earned</p>
            {tiers.map(tier => (
              <div key={tier.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111111', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${tier.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: tier.color }}>{tier.name}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#888888' }}>{tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints.toLocaleString()}+ points`}</span>
              </div>
            ))}
          </div>

          <button onClick={() => showSuccess('Loyalty settings saved')} style={{ width: '100%', padding: '13px', background: '#FED800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '32px' }}>
            Save Loyalty Settings
          </button>
        </div>
      )}
    </div>
  );
}