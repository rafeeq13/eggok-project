'use client';
import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
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
  tip: number;
  netRevenue: number;
  status: 'Paid' | 'Refunded' | 'Partial Refund';
  refundAmount: number;
};

import { API, adminFetch } from '../../../lib/api';

// monthlyData is computed from real transactions below

const statusColor: Record<string, string> = {
  Paid: '#22C55E',
  Refunded: '#FC0301',
  'Partial Refund': '#F59E0B',
};

export default function Payments() {
  const [data, setData] = useState<{ transactions: Transaction[], stats: any }>({ transactions: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeChart, setActiveChart] = useState<'revenue' | 'profit'>('revenue');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [txRes, statsRes] = await Promise.all([
        adminFetch(`${API}/payments/transactions`),
        adminFetch(`${API}/payments/stats`)
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
        tip: Number(t.tip || 0),
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

  const totalRevenue = filtered.reduce((a: number, t: any) => a + t.orderTotal, 0);
  const totalStripeFees = filtered.reduce((a: number, t: any) => a + t.stripeFee, 0);
  const totalDeliveryFees = filtered.reduce((a: number, t: any) => a + t.deliveryFee, 0);
  const totalRefunds = filtered.reduce((a: number, t: any) => a + t.refundAmount, 0);
  const totalTips = filtered.reduce((a: number, t: any) => a + t.tip, 0);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTx, setRefundTx] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState('');

  const handleRefund = async () => {
    if (!refundTx || !refundAmount) return;
    setRefundLoading(true);
    setRefundError('');
    try {
      const res = await adminFetch(`${API}/payments/refund/${encodeURIComponent(refundTx.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(refundAmount) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Refund failed');
      }
      setShowRefundModal(false);
      setRefundTx(null);
      setRefundAmount('');
      setSelectedTx(null);
      fetchPayments();
    } catch (err: any) {
      setRefundError(err.message || 'Refund failed');
    } finally {
      setRefundLoading(false);
    }
  };

  // Build monthly chart data from real transactions
  const monthlyMap: Record<string, { revenue: number; fees: number; delivery: number; profit: number }> = {};
  data.transactions.forEach((t: any) => {
    const d = new Date(t.date);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, fees: 0, delivery: 0, profit: 0 };
    monthlyMap[key].revenue += t.orderTotal;
    monthlyMap[key].fees += t.stripeFee;
    monthlyMap[key].delivery += t.deliveryFee;
    monthlyMap[key].profit += t.netRevenue;
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, d]) => ({
    month, revenue: Math.round(d.revenue), fees: Math.round(d.fees), delivery: Math.round(d.delivery), profit: Math.round(d.profit),
  }));
  const totalNet = filtered.reduce((a, t) => a + t.netRevenue, 0);
  const totalProfit = totalRevenue - totalStripeFees - totalDeliveryFees - totalRefunds;
  const stripePct = totalRevenue > 0 ? ((totalStripeFees / totalRevenue) * 100).toFixed(1) : '0';

  const inputStyle = {
    padding: '8px 12px', background: '#111111',
    border: '1px solid #2A2A2A', borderRadius: '8px',
    color: '#FEFEFE', fontSize: '12px',
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Customer', 'Type', 'Order Total', 'Tip', 'Stripe Fee', 'Delivery Fee', 'Refund', 'Net Revenue', 'Status'];
    const rows = filtered.map(t => [
      t.id, t.date, t.time, t.customer, t.type,
      `$${t.orderTotal.toFixed(2)}`, `$${t.tip.toFixed(2)}`, `$${t.stripeFee.toFixed(2)}`,
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
        <td style="color:#22C55E">${t.tip > 0 ? `$${t.tip.toFixed(2)}` : '—'}</td>
        <td style="color:#c0392b">-$${t.stripeFee.toFixed(2)}</td>
        <td style="color:#e67e22">${t.deliveryFee > 0 ? `-$${t.deliveryFee.toFixed(2)}` : '—'}</td>
        <td style="color:#c0392b">${t.refundAmount > 0 ? `-$${t.refundAmount.toFixed(2)}` : '—'}</td>
        <td style="color:#27ae60;font-weight:bold">$${t.netRevenue.toFixed(2)}</td>
        <td style="color:${t.status === 'Paid' ? '#27ae60' : t.status === 'Refunded' ? '#c0392b' : '#e67e22'}">${t.status}</td>
      </tr>
    `).join('');

    const logoImg = `<img src="https://eggsokpa.com/logo.webp" alt="Eggs Ok" style="height:50px;object-fit:contain;" />`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Eggs Ok Payment Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
          .header { background: #000; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
          .brand-logo { display: flex; align-items: center; gap: 14px; }
          .brand { color: #E5B800; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
          .brand-sub { color: #aaa; font-size: 11px; margin-top: 4px; }
          .report-meta { text-align: right; color: #aaa; font-size: 11px; line-height: 1.8; }
          .content { padding: 24px 32px; }
          .section-title { font-size: 14px; font-weight: 700; color: #111; margin: 20px 0 10px; border-bottom: 2px solid #E5B800; padding-bottom: 6px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
          .summary-card { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
          .summary-label { font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
          .summary-value { font-size: 20px; font-weight: 700; }
          .profit-card { background: #000; color: #E5B800; border-radius: 8px; padding: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .profit-label { font-size: 13px; color: #aaa; }
          .profit-value { font-size: 28px; font-weight: 900; color: #E5B800; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          thead tr { background: #000; color: #E5B800; }
          thead th { padding: 6px 8px; text-align: left; font-size: 9px; letter-spacing: 0.5px; }
          tbody tr:nth-child(even) { background: #f9f9f9; }
          tbody td { padding: 6px 8px; border-bottom: 1px solid #eee; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #aaa; text-align: center; }
          .footer-logo { display: flex; justify-content: center; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-logo">
            ${logoImg}
            <div>
              <div class="brand-sub" style="font-size:13px;color:#E5B800;font-weight:700;margin-bottom:4px;">Payment & Revenue Report</div>
              <div class="brand-sub">3517 Lancaster Ave, Philadelphia, PA 19104, United States</div>
            </div>
          </div>
          <div class="report-meta">
            <div>Period: ${dateFrom} to ${dateTo}</div>
            <div>Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div class="content">
          <div class="section-title">Financial Summary</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Gross Revenue</div>
              <div class="summary-value" style="color:#E5B800">$${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Tips Collected</div>
              <div class="summary-value" style="color:#22C55E">$${totalTips.toFixed(2)}</div>
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
            <div class="summary-card">
              <div class="summary-label">Transactions</div>
              <div class="summary-value" style="color:#888">${filtered.length}</div>
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
                <th>TYPE</th><th>TOTAL</th><th>TIP</th><th>STRIPE FEE</th>
                <th>DELIVERY</th><th>REFUND</th><th>NET</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">
            <div class="footer-logo">${logoImg}</div>
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
          <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '6px' }}>{label}</p>
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
              <button onClick={() => setSelectedTx(null)} style={{ background: 'transparent', color: '#FEFEFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Customer', selectedTx.customer],
                ['Date', `${selectedTx.date} at ${selectedTx.time}`],
                ['Order Type', selectedTx.type],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#111111', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#111111', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
              <p style={{ fontSize: '11px', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Payment Breakdown</p>
              {[
                ['Order Total', `$${selectedTx.orderTotal.toFixed(2)}`, '#FEFEFE'],
                ['Tip', selectedTx.tip > 0 ? `$${selectedTx.tip.toFixed(2)}` : 'None', '#22C55E'],
                ['Stripe Fee (2.9% + $0.30)', `-$${selectedTx.stripeFee.toFixed(2)}`, '#FC0301'],
                ['Delivery Fee', selectedTx.deliveryFee > 0 ? `-$${selectedTx.deliveryFee.toFixed(2)}` : 'N/A', '#F59E0B'],
                ['Refund Issued', selectedTx.refundAmount > 0 ? `-$${selectedTx.refundAmount.toFixed(2)}` : 'None', '#FC0301'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{label}</span>
                  <span style={{ fontSize: '12px', color: color as string, fontWeight: '600' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2A2A2A', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Net Revenue</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#E5B800' }}>${selectedTx.netRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Refund Button */}
            {selectedTx.status !== 'Refunded' && (
              <button onClick={() => { setRefundTx(selectedTx); setRefundAmount(''); setRefundError(''); setShowRefundModal(true); }} style={{
                width: '100%', padding: '12px', marginTop: '12px',
                background: 'transparent', border: '1px solid #FC030140',
                borderRadius: '10px', color: '#FC0301', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer',
              }}>
                Issue Refund
              </button>
            )}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FEFEFE' }}>Issue Refund</h2>
              <button onClick={() => setShowRefundModal(false)} style={{ background: 'transparent', color: '#FEFEFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>

            <div style={{ background: '#111111', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Order {refundTx.id}</p>
              <p style={{ fontSize: '14px', color: '#FEFEFE', fontWeight: '600' }}>{refundTx.customer}</p>
              <p style={{ fontSize: '13px', color: '#E5B800', marginTop: '4px' }}>Total: ${refundTx.orderTotal.toFixed(2)}</p>
              {refundTx.refundAmount > 0 && (
                <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '2px' }}>Already refunded: ${refundTx.refundAmount.toFixed(2)}</p>
              )}
            </div>

            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Refund Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={refundTx.orderTotal - refundTx.refundAmount}
              placeholder={`Max $${(refundTx.orderTotal - refundTx.refundAmount).toFixed(2)}`}
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '14px', marginBottom: '8px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#E5B800'}
              onBlur={e => e.target.style.borderColor = '#2A2A2A'}
            />
            <button
              onClick={() => setRefundAmount((refundTx.orderTotal - refundTx.refundAmount).toFixed(2))}
              style={{ fontSize: '11px', color: '#E5B800', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
            >
              Full refund (${(refundTx.orderTotal - refundTx.refundAmount).toFixed(2)})
            </button>

            {refundError && <p style={{ fontSize: '12px', color: '#FC0301', marginBottom: '8px' }}>{refundError}</p>}

            <button onClick={handleRefund} disabled={refundLoading || !refundAmount || parseFloat(refundAmount) <= 0} style={{
              width: '100%', padding: '12px',
              background: refundLoading ? '#1A1A1A' : '#FC0301',
              color: refundLoading ? '#555' : '#fff',
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700',
              cursor: refundLoading ? 'not-allowed' : 'pointer',
            }}>
              {refundLoading ? 'Processing...' : `Refund $${refundAmount || '0.00'}`}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
        {[
          { label: 'Gross Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: `${filtered.length} transactions`, color: '#E5B800' },
          { label: 'Tips Collected', value: `$${totalTips.toFixed(2)}`, sub: `Included in gross revenue`, color: '#22C55E' },
          { label: 'Stripe Fees Paid', value: `$${totalStripeFees.toFixed(2)}`, sub: `${stripePct}% of gross revenue`, color: '#FC0301' },
          { label: 'Delivery Fees Paid', value: `$${totalDeliveryFees.toFixed(2)}`, sub: 'DoorDash Drive charges', color: '#F59E0B' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Refunds', value: `$${totalRefunds.toFixed(2)}`, sub: `${filtered.filter(t => t.status !== 'Paid').length} refund transactions`, color: '#FC0301' },
          { label: 'Net Revenue', value: `$${totalNet.toFixed(2)}`, sub: 'After fees, before refunds', color: '#22C55E' },
          { label: 'Net Profit', value: `$${totalProfit.toFixed(2)}`, sub: 'After all deductions', color: '#E5B800' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: i === 2 ? '#1A1A00' : '#1A1A1A', border: `1px solid ${i === 2 ? '#E5B80030' : '#2A2A2A'}`, borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{kpi.sub}</p>
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
                padding: '6px 14px', background: activeChart === c ? '#E5B800' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: activeChart === c ? '700' : '400',
                color: activeChart === c ? '#000' : '#FEFEFE', textTransform: 'capitalize',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#FEFEFE', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#FEFEFE', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {activeChart === 'revenue' ? (
              <Bar dataKey="revenue" fill="#E5B800" radius={[4, 4, 0, 0]} name="revenue" />
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
          onFocus={e => e.target.style.borderColor = '#E5B800'}
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
          borderRadius: '8px', color: '#FEFEFE', fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}><Download size={12} /> CSV</button>
        <button onClick={downloadPDF} style={{
          padding: '8px 14px', background: '#E5B800', border: 'none',
          borderRadius: '8px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}><Download size={12} /> PDF Report</button>
      </div>

      <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '12px' }}>
        Showing {filtered.length} transactions · Net Profit: <span style={{ color: '#E5B800', fontWeight: '600' }}>${totalProfit.toFixed(2)}</span>
      </p>

      {/* Transactions Table */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Order ID', 'Date', 'Customer', 'Type', 'Total', 'Tip', 'Stripe Fee', 'Delivery', 'Refund', 'Net', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#FEFEFE', fontSize: '13px' }}>No transactions found</td></tr>
              ) : filtered.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '700', color: '#E5B800' }}>{tx.id}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <p style={{ fontSize: '11px', color: '#FEFEFE' }}>{tx.date}</p>
                    <p style={{ fontSize: '10px', color: '#FEFEFE', marginTop: '1px' }}>{tx.time}</p>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: '#FEFEFE' }}>{tx.customer}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: tx.type === 'Delivery' ? '#0A1628' : '#1A1A00', color: tx.type === 'Delivery' ? '#60A5FA' : '#E5B800', border: `1px solid ${tx.type === 'Delivery' ? '#1E3A5F' : '#3A3A00'}` }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>${tx.orderTotal.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: tx.tip > 0 ? '#22C55E' : '#555' }}>
                    {tx.tip > 0 ? `$${tx.tip.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: '#FC0301' }}>-${tx.stripeFee.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: tx.deliveryFee > 0 ? '#F59E0B' : '#FEFEFE' }}>
                    {tx.deliveryFee > 0 ? `-$${tx.deliveryFee.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: tx.refundAmount > 0 ? '#FC0301' : '#FEFEFE' }}>
                    {tx.refundAmount > 0 ? `-$${tx.refundAmount.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: '700', color: '#22C55E' }}>${tx.netRevenue.toFixed(2)}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[tx.status]}20`, color: statusColor[tx.status], border: `1px solid ${statusColor[tx.status]}40` }}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <button onClick={() => setSelectedTx(tx)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#FEFEFE', fontSize: '10px', cursor: 'pointer' }}>
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