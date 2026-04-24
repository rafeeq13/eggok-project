'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API, adminFetch } from '../../../lib/api';

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  items: any[];
  subtotal: string;
  tax: string;
  deliveryFee: string;
  tip: string;
  total: string;
  notes: string;
  status: string;
  deliveryAddress?: string;
  scheduleType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printedIds, setPrintedIds] = useState<Set<number>>(new Set());
  const [autoPrint, setAutoPrint] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderIdsRef = useRef<Set<number>>(new Set());
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  const playAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/kitchendispalynotification.mp3');
        audioRef.current.preload = 'auto';
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  const generateTicketHtml = useCallback((order: Order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const TZ = 'America/New_York';
    const time = new Date(order.createdAt).toLocaleTimeString('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
    const date = new Date(order.createdAt).toLocaleDateString('en-US', { timeZone: TZ });

    return `<!DOCTYPE html>
<html><head><style>
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; width: 80mm; padding: 3mm; color: #000; font-size: 12px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .big { font-size: 18px; font-weight: bold; }
  .huge { font-size: 24px; font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; }
  .item-name { font-weight: bold; font-size: 13px; }
  .mod { padding-left: 12px; font-size: 11px; color: #333; }
  .note { font-style: italic; padding-left: 12px; font-size: 11px; }
  .type-badge { display: inline-block; padding: 4px 12px; border: 2px solid #000; font-size: 16px; font-weight: bold; margin: 4px 0; }
</style></head><body>
  <div class="center bold" style="font-size:16px;">EGGS OK</div>
  <div class="center" style="font-size:10px;">3517 Lancaster Ave, Philadelphia</div>
  <div class="divider"></div>

  <div class="center huge">${order.orderNumber}</div>
  <div class="center"><span class="type-badge">${order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'}</span></div>
  <div class="center" style="font-size:11px;">${date} ${time}</div>
  ${order.scheduleType === 'scheduled' ? `<div class="center bold" style="color:red;">SCHEDULED: ${order.scheduledDate} ${order.scheduledTime || ''}</div>` : ''}

  <div class="divider"></div>
  <div class="bold">Customer: ${order.customerName}</div>
  <div>Phone: ${order.customerPhone}</div>
  ${order.orderType === 'delivery' && order.deliveryAddress ? `<div class="bold">Deliver to: ${order.deliveryAddress}</div>` : ''}

  <div class="divider"></div>
  <div class="row"><span class="bold">ITEMS</span><span class="bold">QTY</span></div>
  <div class="divider"></div>

  ${items.map(item => `
    <div class="row">
      <span class="item-name">${item.name}</span>
      <span class="bold">x${item.quantity || 1}</span>
    </div>
    ${(item.modifiers || []).map((m: any) => `<div class="mod">+ ${m.name}</div>`).join('')}
    ${item.specialInstructions ? `<div class="note">Note: ${item.specialInstructions}</div>` : ''}
  `).join('')}

  <div class="divider"></div>
  <div class="row"><span>Subtotal</span><span>$${Number(order.subtotal).toFixed(2)}</span></div>
  <div class="row"><span>Tax</span><span>$${Number(order.tax).toFixed(2)}</span></div>
  ${Number(order.deliveryFee) > 0 ? `<div class="row"><span>Delivery Fee</span><span>$${Number(order.deliveryFee).toFixed(2)}</span></div>` : ''}
  ${Number(order.tip) > 0 ? `<div class="row"><span>Tip</span><span>$${Number(order.tip).toFixed(2)}</span></div>` : ''}
  <div class="divider"></div>
  <div class="row big"><span>TOTAL</span><span>$${Number(order.total).toFixed(2)}</span></div>

  ${order.notes ? `<div class="divider"></div><div class="bold">NOTES:</div><div>${order.notes}</div>` : ''}

  <div class="divider"></div>
  <div class="center" style="font-size:10px;">Powered by EggOk Online Ordering</div>
  <div style="height:10mm;"></div>
</body></html>`;
  }, []);

  const printOrder = useCallback((order: Order) => {
    const html = generateTicketHtml(order);
    let iframe = printFrameRef.current;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      printFrameRef.current = iframe;
    }
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe!.contentWindow?.print();
        setPrintedIds(prev => new Set([...prev, order.id]));
      }, 300);
    }
  }, [generateTicketHtml]);

  // Fetch active orders every 8 seconds
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await adminFetch(`${API}/orders/active`);
        if (!res.ok) return;
        const data = await res.json();
        const activeOrders = Array.isArray(data) ? data : (data.data || []);
        setOrders(activeOrders);

        // Detect new orders
        const currentIds = new Set(activeOrders.map((o: Order) => o.id));
        const newOrders = activeOrders.filter((o: Order) => !prevOrderIdsRef.current.has(o.id));

        if (newOrders.length > 0 && prevOrderIdsRef.current.size > 0) {
          playAlert();
          if (autoPrint) {
            newOrders.forEach((o: Order) => {
              if (!printedIds.has(o.id)) printOrder(o);
            });
          }
        }
        prevOrderIdsRef.current = currentIds;
      } catch {}
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [autoPrint, soundEnabled, playAlert, printOrder, printedIds]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending_payment: { bg: '#6B728015', text: '#9CA3AF', border: '#6B728040' },
    paid: { bg: '#10B98115', text: '#10B981', border: '#10B98140' },
    sent_to_kitchen: { bg: '#E5B80015', text: '#E5B800', border: '#E5B80040' },
    pending: { bg: '#E5B80015', text: '#E5B800', border: '#E5B80040' },
    confirmed: { bg: '#3B82F615', text: '#3B82F6', border: '#3B82F640' },
    preparing: { bg: '#F59E0B15', text: '#F59E0B', border: '#F59E0B40' },
    ready: { bg: '#22C55E15', text: '#22C55E', border: '#22C55E40' },
    out_for_delivery: { bg: '#8B5CF615', text: '#8B5CF6', border: '#8B5CF640' },
  };

  const getTimeSince = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>LIVE</span>
          <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>{orders.length} active order{orders.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
            background: soundEnabled ? '#22C55E18' : '#1A1A1A', color: soundEnabled ? '#22C55E' : '#888',
            border: `1px solid ${soundEnabled ? '#22C55E40' : '#2A2A2A'}`,
          }}>
            {soundEnabled ? 'Sound ON' : 'Sound OFF'}
          </button>
          <button onClick={() => setAutoPrint(!autoPrint)} style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
            background: autoPrint ? '#E5B80018' : '#1A1A1A', color: autoPrint ? '#E5B800' : '#888',
            border: `1px solid ${autoPrint ? '#E5B80040' : '#2A2A2A'}`,
          }}>
            {autoPrint ? 'Auto-Print ON' : 'Auto-Print OFF'}
          </button>
          <button onClick={toggleFullscreen} style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
            background: '#1A1A1A', color: '#FEFEFE', border: '1px solid #2A2A2A',
          }}>
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🍳</div>
          <p style={{ fontSize: '16px', color: '#888', fontWeight: '600' }}>No active orders</p>
          <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>New orders will appear here automatically</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {orders.map(order => {
            const sc = statusColors[order.status] || statusColors.pending;
            const items = Array.isArray(order.items) ? order.items : [];
            const isPrinted = printedIds.has(order.id);

            return (
              <div key={order.id} style={{
                background: '#1A1A1A', border: `1px solid ${order.status === 'pending' ? '#E5B80060' : '#2A2A2A'}`,
                borderRadius: '12px', overflow: 'hidden',
                animation: order.status === 'pending' ? 'glow 2s infinite' : 'none',
              }}>
                {/* Header */}
                <div style={{
                  padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid #2A2A2A', background: order.status === 'pending' ? '#E5B80008' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#E5B800' }}>{order.orderNumber}</span>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700',
                      background: order.orderType === 'delivery' ? '#3B82F618' : '#E5B80018',
                      color: order.orderType === 'delivery' ? '#3B82F6' : '#E5B800',
                      border: `1px solid ${order.orderType === 'delivery' ? '#3B82F640' : '#E5B80040'}`,
                    }}>
                      {order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700',
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                    textTransform: 'uppercase',
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Customer */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #2A2A2A' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{order.customerName}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{order.customerPhone}</div>
                  {order.orderType === 'delivery' && order.deliveryAddress && (
                    <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px' }}>{order.deliveryAddress}</div>
                  )}
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{getTimeSince(order.createdAt)}</div>
                </div>

                {/* Items */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #2A2A2A' }}>
                  {items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: i < items.length - 1 ? '8px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>{item.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#E5B800', flexShrink: 0, marginLeft: '8px' }}>x{item.quantity || 1}</span>
                      </div>
                      {(item.modifiers || []).map((m: any, mi: number) => (
                        <div key={mi} style={{ fontSize: '11px', color: '#888', paddingLeft: '8px' }}>+ {m.name}</div>
                      ))}
                      {item.specialInstructions && (
                        <div style={{ fontSize: '11px', color: '#F59E0B', paddingLeft: '8px', fontStyle: 'italic' }}>Note: {item.specialInstructions}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #2A2A2A', background: '#F59E0B08' }}>
                    <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '600' }}>Notes: {order.notes}</div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE' }}>${Number(order.total).toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isPrinted && <span style={{ fontSize: '10px', color: '#22C55E', alignSelf: 'center' }}>Printed</span>}
                    <button onClick={() => printOrder(order)} style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      background: '#FEFEFE', color: '#000', border: 'none',
                    }}>
                      Print
                    </button>
                    <button onClick={() => setSelectedOrder(order)} style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      background: '#E5B800', color: '#000', border: 'none',
                    }}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1A1A1A', borderRadius: '12px', maxWidth: '400px', width: '100%',
            maxHeight: '90vh', overflow: 'auto', border: '1px solid #2A2A2A',
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#E5B800' }}>{selectedOrder.orderNumber}</span>
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: '700', marginLeft: '10px',
                  background: selectedOrder.orderType === 'delivery' ? '#3B82F618' : '#E5B80018',
                  color: selectedOrder.orderType === 'delivery' ? '#3B82F6' : '#E5B800',
                  border: `1px solid ${selectedOrder.orderType === 'delivery' ? '#3B82F640' : '#E5B80040'}`,
                }}>
                  {selectedOrder.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>x</button>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{selectedOrder.customerPhone}</div>
                {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                  <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '4px' }}>{selectedOrder.deliveryAddress}</div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '12px' }}>
                {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>{item.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#E5B800' }}>x{item.quantity || 1}</span>
                    </div>
                    {(item.modifiers || []).map((m: any, mi: number) => (
                      <div key={mi} style={{ fontSize: '12px', color: '#888', paddingLeft: '8px' }}>+ {m.name}{m.price > 0 ? ` ($${m.price})` : ''}</div>
                    ))}
                    {item.specialInstructions && (
                      <div style={{ fontSize: '12px', color: '#F59E0B', paddingLeft: '8px' }}>Note: {item.specialInstructions}</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#888', fontSize: '12px' }}>Subtotal</span><span style={{ color: '#FEFEFE', fontSize: '12px' }}>${Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#888', fontSize: '12px' }}>Tax</span><span style={{ color: '#FEFEFE', fontSize: '12px' }}>${Number(selectedOrder.tax).toFixed(2)}</span></div>
                {Number(selectedOrder.deliveryFee) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#888', fontSize: '12px' }}>Delivery</span><span style={{ color: '#FEFEFE', fontSize: '12px' }}>${Number(selectedOrder.deliveryFee).toFixed(2)}</span></div>}
                {Number(selectedOrder.tip) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#888', fontSize: '12px' }}>Tip</span><span style={{ color: '#FEFEFE', fontSize: '12px' }}>${Number(selectedOrder.tip).toFixed(2)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2A2A2A' }}>
                  <span style={{ color: '#FEFEFE', fontSize: '16px', fontWeight: '800' }}>TOTAL</span>
                  <span style={{ color: '#E5B800', fontSize: '16px', fontWeight: '800' }}>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#F59E0B10', borderRadius: '8px', border: '1px solid #F59E0B30' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#F59E0B' }}>Notes: {selectedOrder.notes}</div>
                </div>
              )}

              <button onClick={() => { printOrder(selectedOrder); setSelectedOrder(null); }} style={{
                width: '100%', marginTop: '16px', padding: '12px', borderRadius: '8px',
                background: '#E5B800', color: '#000', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: 'pointer',
              }}>
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #E5B80020; }
          50% { box-shadow: 0 0 20px #E5B80040; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
