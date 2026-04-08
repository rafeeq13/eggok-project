'use client';
import { useState, useEffect, useCallback } from 'react';
import DateRangePicker from './DateRangePicker';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'picked_up' | 'cancelled';
type OrderType = 'pickup' | 'delivery';

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  scheduleType: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  deliveryAddress: string | null;
  deliveryApt: string | null;
  deliveryInstructions: string | null;
  items: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  promoCode: string | null;
  discount: number;
  notes: string | null;
  deliveryProvider: string | null;
  deliveryQuoteId: string | null;
  deliveryTrackingUrl: string | null;
  deliveryDriverName: string | null;
  deliveryDriverPhone: string | null;
  deliveryEta: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusColor: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#60A5FA',
  preparing: '#60A5FA',
  ready: '#22C55E',
  out_for_delivery: '#A78BFA',
  delivered: '#888888',
  picked_up: '#888888',
  cancelled: '#FC0301',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};

const nextStatuses: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up', 'out_for_delivery'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  picked_up: [],
  cancelled: [],
};

const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
const historyStatuses = ['delivered', 'picked_up', 'cancelled'];

export default function OrdersManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'history'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [stats, setStats] = useState<any>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders/stats/today`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchStats]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      showSuccess(`Order ${updated.orderNumber} updated to ${statusLabel[status]}`);
      fetchStats();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, { method: 'PATCH' });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setSelectedOrder(null);
      showSuccess(`Order cancelled`);
      fetchStats();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const getTabOrders = () => {
    let filtered = orders;

    if (activeTab === 'active') {
      filtered = orders.filter(o => activeStatuses.includes(o.status) && o.scheduleType === 'asap');
    } else if (activeTab === 'scheduled') {
      filtered = orders.filter(o => o.scheduleType === 'scheduled' && activeStatuses.includes(o.status));
    } else {
      filtered = orders.filter(o => historyStatuses.includes(o.status));
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(o =>
          o.customerName.toLowerCase().includes(s) ||
          o.customerEmail.toLowerCase().includes(s) ||
          o.customerPhone.includes(s) ||
          o.orderNumber.toLowerCase().includes(s)
        );
      }
      if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
      if (typeFilter !== 'all') filtered = filtered.filter(o => o.orderType === typeFilter);
      if (dateFrom) filtered = filtered.filter(o => o.createdAt.split('T')[0] >= dateFrom);
      if (dateTo) filtered = filtered.filter(o => o.createdAt.split('T')[0] <= dateTo);
    }

    return filtered;
  };

  const displayOrders = getTabOrders();

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const inputStyle = {
    padding: '8px 12px', background: '#111111',
    border: '1px solid #2A2A2A', borderRadius: '8px',
    color: '#FEFEFE', fontSize: '12px', outline: 'none',
  };

  return (
    <div>
      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
          {successMsg}
        </div>
      )}

      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Auto-refreshes every 30 seconds</p>
        <button onClick={() => { fetchOrders(); fetchStats(); }} style={{ padding: '7px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FED800', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          ↻ Refresh Now
        </button>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>{selectedOrder.orderNumber}</h2>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[selectedOrder.status]}20`, color: statusColor[selectedOrder.status], border: `1px solid ${statusColor[selectedOrder.status]}40` }}>
                  {statusLabel[selectedOrder.status]}
                </span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: selectedOrder.orderType === 'delivery' ? '#0A1628' : '#1A1A00', color: selectedOrder.orderType === 'delivery' ? '#60A5FA' : '#FED800', border: `1px solid ${selectedOrder.orderType === 'delivery' ? '#1E3A5F' : '#3A3A00'}` }}>
                  {selectedOrder.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', color: '#888', fontSize: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ overflow: 'auto', padding: '20px 24px', flex: 1 }}>
              {/* Customer */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Customer</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    ['Name', selectedOrder.customerName],
                    ['Phone', selectedOrder.customerPhone],
                    ['Email', selectedOrder.customerEmail],
                    ['Order Type', selectedOrder.orderType === 'delivery' ? 'Delivery' : 'Pickup'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Order Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Date</p>
                    <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Time Placed</p>
                    <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>{formatTime(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Schedule</p>
                    <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>
                      {selectedOrder.scheduleType === 'asap' ? 'ASAP' : `${selectedOrder.scheduledDate} ${selectedOrder.scheduledTime}`}
                    </p>
                  </div>
                  {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Delivery Address</p>
                      <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>
                        {selectedOrder.deliveryAddress}{selectedOrder.deliveryApt ? `, ${selectedOrder.deliveryApt}` : ''}
                      </p>
                    </div>
                  )}
                  {selectedOrder.deliveryInstructions && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Delivery Instructions</p>
                      <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500', marginTop: '2px' }}>{selectedOrder.deliveryInstructions}</p>
                    </div>
                  )}
                  {selectedOrder.promoCode && (
                    <div>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Promo Code</p>
                      <p style={{ fontSize: '13px', color: '#22C55E', fontWeight: '500', marginTop: '2px' }}>{selectedOrder.promoCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Items Ordered</p>
                {(selectedOrder.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: i < selectedOrder.items.length - 1 ? '12px' : '0', marginBottom: i < selectedOrder.items.length - 1 ? '12px' : '0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', margin: 0 }}>{item.name} × {item.quantity}</p>
                      {item.specialInstructions && (
                        <p style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>{item.specialInstructions}</p>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FED800', margin: 0 }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                {[
                  ['Subtotal', `$${Number(selectedOrder.subtotal).toFixed(2)}`],
                  ['Tax', `$${Number(selectedOrder.tax).toFixed(2)}`],
                  ...(Number(selectedOrder.deliveryFee) > 0 ? [['Delivery Fee', `$${Number(selectedOrder.deliveryFee).toFixed(2)}`]] : []),
                  ...(Number(selectedOrder.tip) > 0 ? [['Tip', `$${Number(selectedOrder.tip).toFixed(2)}`]] : []),
                  ...(Number(selectedOrder.discount) > 0 ? [['Discount', `-$${Number(selectedOrder.discount).toFixed(2)}`]] : []),
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                    <span style={{ fontSize: '12px', color: label === 'Discount' ? '#22C55E' : '#FEFEFE' }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2A2A2A', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>Total</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#FED800' }}>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Dispatch Info */}
              {selectedOrder.orderType === 'delivery' && (selectedOrder.deliveryProvider || ['ready', 'out_for_delivery'].includes(selectedOrder.status)) && (
                <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', border: selectedOrder.deliveryTrackingUrl ? '1px solid #A78BFA40' : '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Delivery Dispatch</p>
                  {selectedOrder.deliveryProvider ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>Provider</span>
                        <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: '600' }}>{selectedOrder.deliveryProvider === 'uber_direct' ? 'Uber Direct' : selectedOrder.deliveryProvider}</span>
                      </div>
                      {selectedOrder.deliveryDriverName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#888' }}>Driver</span>
                          <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{selectedOrder.deliveryDriverName}</span>
                        </div>
                      )}
                      {selectedOrder.deliveryDriverPhone && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#888' }}>Driver Phone</span>
                          <a href={`tel:${selectedOrder.deliveryDriverPhone}`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>{selectedOrder.deliveryDriverPhone}</a>
                        </div>
                      )}
                      {selectedOrder.deliveryEta && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#888' }}>ETA</span>
                          <span style={{ fontSize: '12px', color: '#FEFEFE' }}>{new Date(selectedOrder.deliveryEta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {selectedOrder.deliveryTrackingUrl && (
                          <a href={selectedOrder.deliveryTrackingUrl} target="_blank" rel="noopener noreferrer" style={{
                            flex: 1, textAlign: 'center', padding: '8px', background: '#A78BFA20',
                            border: '1px solid #A78BFA40', borderRadius: '8px', color: '#A78BFA',
                            fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                          }}>Track</a>
                        )}
                        {selectedOrder.status !== 'delivered' && (
                          <button onClick={async () => {
                            if (!confirm('Cancel this delivery dispatch?')) return;
                            try {
                              const res = await fetch(`${API}/orders/${selectedOrder.id}/cancel-delivery`, { method: 'POST' });
                              const data = await res.json();
                              if (data.success) {
                                const fresh = await fetch(`${API}/orders/${selectedOrder.id}`).then(r => r.json());
                                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? fresh : o));
                                setSelectedOrder(fresh);
                                showSuccess('Delivery cancelled');
                              } else { showSuccess(data.message || 'Cancel failed'); }
                            } catch { showSuccess('Cancel failed'); }
                          }} style={{
                            padding: '8px 12px', background: '#FC030115', border: '1px solid #FC030140',
                            borderRadius: '8px', color: '#FC0301', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          }}>Cancel Delivery</button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Get Quote button */}
                      <button onClick={async () => {
                        try {
                          const res = await fetch(`${API}/orders/${selectedOrder.id}/delivery-quote`);
                          const data = await res.json();
                          if (data.error) { showSuccess(data.error); return; }
                          const eta = data.eta ? new Date(data.eta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';
                          showSuccess(`Uber quote: $${data.fee?.toFixed(2)} · ETA: ${eta}`);
                        } catch { showSuccess('Could not get quote'); }
                      }} style={{
                        width: '100%', padding: '8px', background: 'transparent',
                        border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      }}>Get Uber Quote</button>

                      {/* Dispatch button */}
                      <button onClick={async () => {
                        try {
                          const res = await fetch(`${API}/orders/${selectedOrder.id}/dispatch`, { method: 'POST' });
                          if (res.ok) {
                            const updated = await res.json();
                            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
                            setSelectedOrder(updated);
                            showSuccess('Delivery dispatched via Uber Direct');
                          } else {
                            const err = await res.json().catch(() => ({}));
                            showSuccess(err.message || 'Dispatch failed - check integration settings');
                          }
                        } catch { showSuccess('Dispatch failed'); }
                      }} style={{
                        width: '100%', padding: '10px', background: '#A78BFA20',
                        border: '1px solid #A78BFA40', borderRadius: '8px', color: '#A78BFA',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      }}>Dispatch via Uber Direct</button>
                    </div>
                  )}
                </div>
              )}

              {/* Status Actions */}
              {nextStatuses[selectedOrder.status]?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Update Status</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    {nextStatuses[selectedOrder.status].map(status => (
                      <button key={status} onClick={() => updateStatus(selectedOrder.id, status)} style={{
                        padding: '9px 16px', border: `1px solid ${statusColor[status]}40`,
                        borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                        background: status === 'cancelled' ? '#2A0A0A' : `${statusColor[status]}15`,
                        color: statusColor[status],
                      }}>
                        → {statusLabel[status]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #2A2A2A' }}>
        {[
          { id: 'active', label: 'Active Orders', count: orders.filter(o => activeStatuses.includes(o.status) && o.scheduleType === 'asap').length },
          { id: 'scheduled', label: 'Scheduled', count: orders.filter(o => o.scheduleType === 'scheduled' && activeStatuses.includes(o.status)).length },
          { id: 'history', label: 'Order History', count: orders.filter(o => historyStatuses.includes(o.status)).length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} style={{
            flex: 1, padding: '10px', background: activeTab === tab.id ? '#FED800' : 'transparent',
            color: activeTab === tab.id ? '#000' : '#888',
            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            {tab.label}
            <span style={{ fontSize: '10px', fontWeight: '700', background: activeTab === tab.id ? '#00000020' : '#2A2A2A', color: activeTab === tab.id ? '#000' : '#888', padding: '1px 6px', borderRadius: '10px' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={() => {
          const rows = [['Order #', 'Customer', 'Email', 'Phone', 'Type', 'Status', 'Total', 'Date']];
          displayOrders.forEach((o: any) => rows.push([o.orderNumber, o.customerName, o.customerEmail, o.customerPhone, o.orderType, o.status, `$${Number(o.total).toFixed(2)}`, new Date(o.createdAt).toLocaleDateString()]));
          const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `orders-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`; a.click();
        }} style={{ padding: '8px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      {activeTab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#F59E0B' },
            { label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length, color: '#60A5FA' },
            { label: 'Ready', count: orders.filter(o => o.status === 'ready').length, color: '#22C55E' },
            { label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length, color: '#A78BFA' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1A1A1A', border: `1px solid ${s.color}30`, borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: '700', color: s.color, margin: 0 }}>{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today Stats Bar */}
      {stats && activeTab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: "Today's Orders", value: stats.totalOrders },
            { label: "Today's Revenue", value: `$${stats.totalRevenue}` },
            { label: 'Avg Order', value: `$${stats.avgOrderValue}` },
            { label: 'Pending', value: stats.pendingOrders },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '12px 16px' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#FED800', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* History Filters */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
        
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="picked_up">Picked Up</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
          <DateRangePicker from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
          <button onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setDateFrom(''); setDateTo(''); }}
            style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
            Clear
          </button>
            <input placeholder="Search name, email, phone, order ID..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
        </div>
      )}

      {/* Orders Table */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>Loading orders...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ color: '#FEFEFE', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
              {activeTab === 'active' ? 'No active orders right now' : activeTab === 'scheduled' ? 'No scheduled orders' : 'No orders found'}
            </p>
            <p style={{ color: '#888', fontSize: '13px' }}>
              {activeTab === 'history' ? 'Try adjusting your search or date filters' : 'New orders will appear here automatically'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['Order ID', 'Customer', 'Type', activeTab === 'scheduled' ? 'Scheduled For' : 'Time', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: i < displayOrders.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#FED800' }}>{order.orderNumber}</span>
                      {order.deliveryProvider && <span style={{ marginLeft: '6px', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', background: '#A78BFA20', color: '#A78BFA', border: '1px solid #A78BFA40', fontWeight: '600', verticalAlign: 'middle' }}>UBER</span>}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', margin: 0 }}>{order.customerName}</p>
                      <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{order.customerPhone}</p>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: order.orderType === 'delivery' ? '#0A1628' : '#1A1A00', color: order.orderType === 'delivery' ? '#60A5FA' : '#FED800', border: `1px solid ${order.orderType === 'delivery' ? '#1E3A5F' : '#3A3A00'}` }}>
                        {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '12px', color: '#888' }}>
                      {activeTab === 'scheduled'
                        ? `${order.scheduledDate} ${order.scheduledTime}`
                        : formatTime(order.createdAt)}
                      <p style={{ fontSize: '11px', color: '#444', marginTop: '1px', margin: 0 }}>{formatDate(order.createdAt)}</p>
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '12px', color: '#888' }}>
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>${Number(order.total).toFixed(2)}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[order.status]}20`, color: statusColor[order.status], border: `1px solid ${statusColor[order.status]}40` }}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888', fontSize: '11px', cursor: 'pointer' }}>
                          View
                        </button>
                        {!historyStatuses.includes(order.status) && (
                          <button onClick={() => cancelOrder(order.id)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #FC030130', borderRadius: '6px', color: '#FC0301', fontSize: '11px', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}