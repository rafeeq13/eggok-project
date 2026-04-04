'use client';
import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Transaction = {
  id: string;
  date: string;
  time: string;
  customer: string;
  type: 'Pickup' | 'Delivery';
  orderTotal: number;
  stripeFee: number;
  deliveryFee: number;
  netRevenue: number;
  status: 'Paid' | 'Refunded' | 'Partial Refund';
  refundAmount: number;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const monthlyData = [
  { month: 'Oct', revenue: 12400, fees: 620, delivery: 1240, profit: 10540 },
  { month: 'Nov', revenue: 14800, fees: 740, delivery: 1480, profit: 12580 },
  { month: 'Dec', revenue: 18900, fees: 945, delivery: 1890, profit: 16065 },
  { month: 'Jan', revenue: 15200, fees: 760, delivery: 1520, profit: 12920 },
  { month: 'Feb', revenue: 16800, fees: 840, delivery: 1680, profit: 14280 },
  { month: 'Mar', revenue: 14300, fees: 715, delivery: 1430, profit: 12155 },
];

const statusColor: Record<string, string> = {
  Paid: '#22C55E',
  Refunded: '#FC0301',
  'Partial Refund': '#F59E0B',
};

export default function Payments() {
  const [data, setData] = useState<{ transactions: Transaction[], stats: any }>({ transactions: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo] = useState('2026-03-20');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeChart, setActiveChart] = useState<'revenue' | 'profit'>('revenue');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [txRes, statsRes] = await Promise.all([
        fetch(`${API}/payments/transactions`),
        fetch(`${API}/payments/stats`)
      ]);
      const transactions = await txRes.json();
      const stats = await statsRes.json();

      if (!Array.isArray(transactions)) {
        setData({ transactions: [], stats });
        return;
      }

      const mapped = transactions.map((t: any) => ({
        id: t.id,
        date: new Date(t.date).toISOString().split('T')[0],
        time: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customer: t.customer,
        type: t.type,
        orderTotal: Number(t.orderTotal),
        stripeFee: Number(t.stripeFee),
        deliveryFee: Number(t.deliveryFee),
        netRevenue: Number(t.netRevenue),
        status: t.status,
        refundAmount: Number(t.refundAmount),
      }));

      setData({ transactions: mapped, stats });
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [dateFrom, dateTo]);

  const filtered = data.transactions.filter(t => {
    const matchSearch = !search ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchFrom = !dateFrom || t.date >= dateFrom;
    const matchTo = !dateTo || t.date <= dateTo;
    return matchSearch && matchStatus && matchType && matchFrom && matchTo;
  });

  const totalRevenue = filtered.reduce((a, t) => a + t.orderTotal, 0);
  const totalStripeFees = filtered.reduce((a, t) => a + t.stripeFee, 0);
  const totalDeliveryFees = filtered.reduce((a, t) => a + t.deliveryFee, 0);
  const totalRefunds = filtered.reduce((a, t) => a + t.refundAmount, 0);
  const totalNet = filtered.reduce((a, t) => a + t.netRevenue, 0);
  const totalProfit = totalRevenue - totalStripeFees - totalDeliveryFees - totalRefunds;
  const stripePct = totalRevenue > 0 ? ((totalStripeFees / totalRevenue) * 100).toFixed(1) : '0';

  const inputStyle = {
    padding: '8px 12px', background: '#111111',
    border: '1px solid #2A2A2A', borderRadius: '8px',
    color: '#FEFEFE', fontSize: '12px',
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Customer', 'Type', 'Order Total', 'Stripe Fee', 'Delivery Fee', 'Refund', 'Net Revenue', 'Status'];
    const rows = filtered.map(t => [
      t.id, t.date, t.time, t.customer, t.type,
      `$${t.orderTotal.toFixed(2)}`, `$${t.stripeFee.toFixed(2)}`,
      `$${t.deliveryFee.toFixed(2)}`, `$${t.refundAmount.toFixed(2)}`,
      `$${t.netRevenue.toFixed(2)}`, t.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eggok-payments-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const rows = filtered.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.date}</td>
        <td>${t.time}</td>
        <td>${t.customer}</td>
        <td>${t.type}</td>
        <td>$${t.orderTotal.toFixed(2)}</td>
        <td style="color:#c0392b">-$${t.stripeFee.toFixed(2)}</td>
        <td style="color:#e67e22">${t.deliveryFee > 0 ? `-$${t.deliveryFee.toFixed(2)}` : '—'}</td>
        <td style="color:#c0392b">${t.refundAmount > 0 ? `-$${t.refundAmount.toFixed(2)}` : '—'}</td>
        <td style="color:#27ae60;font-weight:bold">$${t.netRevenue.toFixed(2)}</td>
        <td style="color:${t.status === 'Paid' ? '#27ae60' : t.status === 'Refunded' ? '#c0392b' : '#e67e22'}">${t.status}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Eggs Ok — Payment Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
          .header { background: #000; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
          .brand { color: #FED800; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
          .brand-sub { color: #aaa; font-size: 11px; margin-top: 4px; }
          .report-meta { text-align: right; color: #aaa; font-size: 11px; line-height: 1.8; }
          .content { padding: 24px 32px; }
          .section-title { font-size: 14px; font-weight: 700; color: #111; margin: 20px 0 10px; border-bottom: 2px solid #FED800; padding-bottom: 6px; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
          .summary-card { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
          .summary-label { font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
          .summary-value { font-size: 20px; font-weight: 700; }
          .profit-card { background: #000; color: #FED800; border-radius: 8px; padding: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .profit-label { font-size: 13px; color: #aaa; }
          .profit-value { font-size: 28px; font-weight: 900; color: #FED800; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          thead tr { background: #000; color: #FED800; }
          thead th { padding: 8px 10px; text-align: left; font-size: 10px; letter-spacing: 0.5px; }
          tbody tr:nth-child(even) { background: #f9f9f9; }
          tbody td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">EGGS OK</div>
            <div class="brand-sub">Payment & Revenue Report</div>
            <div class="brand-sub">3517 Lancaster Ave, Philadelphia PA 19104</div>
          </div>
          <div class="report-meta">
            <div>Period: ${dateFrom} to ${dateTo}</div>
            <div>Generated: ${new Date().toLocaleDateString()}</div>
            <div>RestoRise Business Solutions</div>
          </div>
        </div>
        <div class="content">
          <div class="section-title">Financial Summary</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Gross Revenue</div>
              <div class="summary-value" style="color:#FED800">$${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Stripe Fees</div>
              <div class="summary-value" style="color:#c0392b">-$${totalStripeFees.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Delivery Fees</div>
              <div class="summary-value" style="color:#e67e22">-$${totalDeliveryFees.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Refunds</div>
              <div class="summary-value" style="color:#c0392b">-$${totalRefunds.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Net Revenue</div>
              <div class="summary-value" style="color:#27ae60">$${totalNet.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Stripe Rate</div>
              <div class="summary-value" style="color:#888">${stripePct}%</div>
            </div>
          </div>
          <div class="profit-card">
            <div>
              <div class="profit-label">NET PROFIT</div>
              <div style="font-size:11px;color:#888;margin-top:4px">After all deductions · ${filtered.length} transactions</div>
            </div>
            <div class="profit-value">$${totalProfit.toFixed(2)}</div>
          </div>
          <div class="section-title">Transaction Details</div>
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th><th>DATE</th><th>TIME</th><th>CUSTOMER</th>
                <th>TYPE</th><th>TOTAL</th><th>STRIPE FEE</th>
                <th>DELIVERY</th><th>REFUND</th><th>NET</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">
            This report was generated by RestoRise Business Solutions for Eggs Ok Restaurant. All figures are in USD.
            Stripe fees calculated at 2.9% + $0.30 per transaction.
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ fontSize: '13px', fontWeight: '600', color: p.color }}>
              {p.name}: ${p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1000px' }}>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FEFEFE' }}>{selectedTx.id}</h2>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[selectedTx.status]}20`, color: statusColor[selectedTx.status], border: `1px solid ${statusColor[selectedTx.status]}40` }}>
                  {selectedTx.status}
                </span>
              </div>
              <button onClick={() => setSelectedTx(null)} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Customer', selectedTx.customer],
                ['Date', `${selectedTx.date} at ${selectedTx.time}`],
                ['Order Type', selectedTx.type],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#111111', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888888' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#111111', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
              <p style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Payment Breakdown</p>
              {[
                ['Order Total', `$${selectedTx.orderTotal.toFixed(2)}`, '#FEFEFE'],
                ['Stripe Fee (2.9% + $0.30)', `-$${selectedTx.stripeFee.toFixed(2)}`, '#FC0301'],
                ['Delivery Fee', selectedTx.deliveryFee > 0 ? `-$${selectedTx.deliveryFee.toFixed(2)}` : 'N/A', '#F59E0B'],
                ['Refund Issued', selectedTx.refundAmount > 0 ? `-$${selectedTx.refundAmount.toFixed(2)}` : 'None', '#FC0301'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888888' }}>{label}</span>
                  <span style={{ fontSize: '12px', color: color as string, fontWeight: '600' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2A2A2A', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Net Revenue</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#FED800' }}>${selectedTx.netRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
        {[
          { label: 'Gross Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: `${filtered.length} transactions`, color: '#FED800' },
          { label: 'Stripe Fees Paid', value: `$${totalStripeFees.toFixed(2)}`, sub: `${stripePct}% of gross revenue`, color: '#FC0301' },
          { label: 'Delivery Fees Paid', value: `$${totalDeliveryFees.toFixed(2)}`, sub: 'DoorDash Drive charges', color: '#F59E0B' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: '#888888' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Refunds', value: `$${totalRefunds.toFixed(2)}`, sub: `${filtered.filter(t => t.status !== 'Paid').length} refund transactions`, color: '#FC0301' },
          { label: 'Net Revenue', value: `$${totalNet.toFixed(2)}`, sub: 'After fees, before refunds', color: '#22C55E' },
          { label: 'Net Profit', value: `$${totalProfit.toFixed(2)}`, sub: 'After all deductions', color: '#FED800' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: i === 2 ? '#1A1A00' : '#1A1A1A', border: `1px solid ${i === 2 ? '#FED80030' : '#2A2A2A'}`, borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: '#888888' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Monthly Revenue vs Profit</h3>
          <div style={{ display: 'flex', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
            {(['revenue', 'profit'] as const).map(c => (
              <button key={c} onClick={() => setActiveChart(c)} style={{
                padding: '6px 14px', background: activeChart === c ? '#FED800' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: activeChart === c ? '700' : '400',
                color: activeChart === c ? '#000' : '#888888', textTransform: 'capitalize',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {activeChart === 'revenue' ? (
              <Bar dataKey="revenue" fill="#FED800" radius={[4, 4, 0, 0]} name="revenue" />
            ) : (
              <Bar dataKey="profit" fill="#22C55E" radius={[4, 4, 0, 0]} name="profit" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters + Download */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input placeholder="Search order ID or customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
          onFocus={e => e.target.style.borderColor = '#FED800'}
          onBlur={e => e.target.style.borderColor = '#2A2A2A'}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Refunded">Refunded</option>
          <option value="Partial Refund">Partial Refund</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="Pickup">Pickup</option>
          <option value="Delivery">Delivery</option>
        </select>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
        />
        <button onClick={downloadCSV} style={{
          padding: '8px 14px', background: 'transparent', border: '1px solid #2A2A2A',
          borderRadius: '8px', color: '#888888', fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>⬇ CSV</button>
        <button onClick={downloadPDF} style={{
          padding: '8px 14px', background: '#FED800', border: 'none',
          borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>⬇ PDF Report</button>
      </div>

      <p style={{ fontSize: '12px', color: '#888888', marginBottom: '12px' }}>
        Showing {filtered.length} transactions · Net Profit: <span style={{ color: '#FED800', fontWeight: '600' }}>${totalProfit.toFixed(2)}</span>
      </p>

      {/* Transactions Table */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Order ID', 'Date', 'Customer', 'Type', 'Total', 'Stripe Fee', 'Delivery', 'Refund', 'Net', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#888888', fontSize: '13px' }}>No transactions found</td></tr>
              ) : filtered.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '700', color: '#FED800' }}>{tx.id}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{tx.date}</p>
                    <p style={{ fontSize: '10px', color: '#888888', marginTop: '1px' }}>{tx.time}</p>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: '#FEFEFE' }}>{tx.customer}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: tx.type === 'Delivery' ? '#0A1628' : '#1A1A00', color: tx.type === 'Delivery' ? '#60A5FA' : '#FED800', border: `1px solid ${tx.type === 'Delivery' ? '#1E3A5F' : '#3A3A00'}` }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>${tx.orderTotal.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: '#FC0301' }}>-${tx.stripeFee.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: tx.deliveryFee > 0 ? '#F59E0B' : '#888888' }}>
                    {tx.deliveryFee > 0 ? `-$${tx.deliveryFee.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: tx.refundAmount > 0 ? '#FC0301' : '#888888' }}>
                    {tx.refundAmount > 0 ? `-$${tx.refundAmount.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '700', color: '#22C55E' }}>${tx.netRevenue.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[tx.status]}20`, color: statusColor[tx.status], border: `1px solid ${statusColor[tx.status]}40` }}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <button onClick={() => setSelectedTx(tx)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888888', fontSize: '10px', cursor: 'pointer' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}