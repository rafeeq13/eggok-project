import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

type Period = 'daily' | 'weekly' | 'monthly';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A', border: '1px solid #2A2A2A',
        borderRadius: '8px', padding: '10px 14px',
      }}>
        <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: '13px', fontWeight: '600', color: p.color }}>
            {p.name === 'revenue' ? '$' : ''}{p.value.toLocaleString()} {p.name === 'orders' ? 'orders' : p.name === 'revenue' ? '' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('daily');
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders'>('revenue');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      const diffDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
      const res = await fetch(`${API}/orders/stats/historical?days=${diffDays}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading || !stats) {
    return <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>Loading analytics...</div>;
  }

  const chartData = stats.chartData || [];
  const topItems = stats.topItems || [];
  const orderTypeData = stats.orderTypeData || [];
  const peakHoursData = stats.peakHoursData || [];
  const customerData = stats.customerData || [];

  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0';
  const avgDailyRevenue = chartData.length > 0 ? (totalRevenue / chartData.length).toFixed(0) : '0';

  const inputStyle = {
    padding: '8px 12px', background: '#111111',
    border: '1px solid #2A2A2A', borderRadius: '8px',
    color: '#FEFEFE', fontSize: '12px',
  };


  return (
    <div style={{ maxWidth: '1000px' }}>

      {/* Period Filter */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        flexWrap: 'wrap' as const, alignItems: 'center',
      }}>
        <div style={{ display: 'flex', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '8px 16px', background: period === p ? '#FED800' : 'transparent',
              border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              color: period === p ? '#000' : '#888888',
              textTransform: 'capitalize' as const,
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
          />
        </div>
        <button onClick={() => fetchStats()} style={{
          padding: '8px 16px', background: '#FED800', border: 'none',
          borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
        }}>Apply Filter</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: `$${avgDailyRevenue} avg per ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}`, color: '#FED800' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), sub: `${(totalOrders / (chartData.length || 1)).toFixed(0)} avg per ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}`, color: '#22C55E' },
          { label: 'Avg Order Value', value: `$${avgOrderValue}`, sub: 'Per transaction', color: '#60A5FA' },
          { label: 'Top Item', value: topItems[0]?.name || 'N/A', sub: topItems[0] ? `${topItems[0].orders} orders this period` : 'No data', color: '#FECE86' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{kpi.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: '#888888' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue / Orders Chart */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Revenue & Orders Overview</h3>
          <div style={{ display: 'flex', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
            {(['revenue', 'orders'] as const).map(c => (
              <button key={c} onClick={() => setActiveChart(c)} style={{
                padding: '6px 14px', background: activeChart === c ? '#FED800' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '12px',
                color: activeChart === c ? '#000' : '#888888',
                fontWeight: activeChart === c ? '700' : '400',
                textTransform: 'capitalize' as const,
              }}>{c}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FED800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FED800" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="date" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {activeChart === 'revenue' ? (
              <Area type="monotone" dataKey="revenue" stroke="#FED800" strokeWidth={2} fill="url(#colorRevenue)" name="revenue" />
            ) : (
              <Area type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={2} fill="url(#colorOrders)" name="orders" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours + Order Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '20px' }}>

        {/* Peak Hours */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px' }}>Peak Ordering Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHoursData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#888888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#FED800" radius={[4, 4, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Type Split */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px' }}>Order Type Split</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {orderTypeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {orderTypeData.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '12px', color: '#888888' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Behavior */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '16px' }}>Customer Behavior</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {customerData.map((item, i) => (
            <div key={i} style={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px' }}>{item.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: item.color, marginBottom: '4px' }}>{item.value}</p>
              <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.4' }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Item Performance</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '11px', background: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40', padding: '3px 10px', borderRadius: '20px' }}>↑ Trending Up</span>
            <span style={{ fontSize: '11px', background: '#FC030120', color: '#FC0301', border: '1px solid #FC030140', padding: '3px 10px', borderRadius: '20px' }}>↓ Dropping</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
              {['Rank', 'Item Name', 'Total Orders', 'Revenue', 'Trend', 'Change'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: i < topItems.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: i < 3 ? '#FED80020' : '#2A2A2A',
                    border: `1px solid ${i < 3 ? '#FED80040' : '#3A3A3A'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    color: i < 3 ? '#FED800' : '#888888',
                  }}>{i + 1}</div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{item.name}</td>
                <td style={{ padding: '13px 16px', fontSize: '13px', color: '#FEFEFE' }}>{item.orders.toLocaleString()}</td>
                <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '600', color: '#FED800' }}>${item.revenue.toLocaleString()}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{
                    fontSize: '16px',
                    color: item.trend === 'up' ? '#22C55E' : '#FC0301',
                  }}>{item.trend === 'up' ? '↑' : '↓'}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '600',
                    color: item.trend === 'up' ? '#22C55E' : '#FC0301',
                  }}>{item.change}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}