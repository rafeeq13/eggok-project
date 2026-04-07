'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const pickupSteps = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'];

const statusLabel: Record<string, string> = {
  pending: 'Order Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};

const statusDesc: Record<string, string> = {
  pending: 'We received your order',
  confirmed: 'Restaurant confirmed your order',
  preparing: 'Kitchen is working on it',
  ready: 'Your order is ready',
  out_for_delivery: 'On the way to you',
  delivered: 'Enjoy your meal!',
  picked_up: 'Enjoy your meal!',
  cancelled: 'This order was cancelled',
};

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) { setError('No order ID provided'); setLoading(false); return; }

    const fetchOrder = () => {
      fetch(`${API}/orders/${orderId}`)
        .then(r => { if (!r.ok) throw new Error('Order not found'); return r.json(); })
        .then(data => { setOrder(data); setLoading(false); })
        .catch(() => { setError('Order not found'); setLoading(false); });
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: '16px' }}>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#888', fontSize: '16px' }}>{error || 'Order not found'}</p>
        <Link href="/" style={{ color: '#FED800', fontSize: '14px', textDecoration: 'none' }}>Back to Home</Link>
      </div>
    );
  }

  const isDelivery = order.orderType === 'delivery';
  const steps = isDelivery ? statusSteps : pickupSteps;
  const currentIdx = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#FEFEFE', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E1E', height: '64px', display: 'flex', alignItems: 'center', padding: '0 28px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</span>
        </Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px 20px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: isCancelled ? '#FC030120' : '#FED80020', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {isCancelled ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FC0301" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Order #{order.orderNumber}</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>
            {isCancelled ? 'This order was cancelled' : statusDesc[order.status] || 'Processing'}
          </p>
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div style={{ background: '#111', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #1E1E1E' }}>
            {steps.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: i < steps.length - 1 ? '20px' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: done ? '#FED800' : '#1A1A1A',
                      border: active ? '2px solid #FED800' : done ? 'none' : '2px solid #2A2A2A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: '2px', height: '20px', background: done ? '#FED800' : '#2A2A2A', marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '3px' }}>
                    <p style={{ fontSize: '14px', fontWeight: active ? '700' : '500', color: done ? '#FEFEFE' : '#555', margin: 0 }}>{statusLabel[step]}</p>
                    {active && <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>{statusDesc[step]}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery Tracking */}
        {isDelivery && order.deliveryProvider && (
          <div style={{ background: '#A78BFA10', border: '1px solid #A78BFA30', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#A78BFA20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>Delivery In Progress</p>
                <p style={{ fontSize: '12px', color: '#A78BFA', margin: 0 }}>via {order.deliveryProvider === 'uber_direct' ? 'Uber Direct' : order.deliveryProvider}</p>
              </div>
            </div>
            {order.deliveryDriverName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Driver</span>
                <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600' }}>{order.deliveryDriverName}</span>
              </div>
            )}
            {order.deliveryDriverPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Driver Phone</span>
                <a href={`tel:${order.deliveryDriverPhone}`} style={{ fontSize: '13px', color: '#60A5FA', textDecoration: 'none', fontWeight: '600' }}>{order.deliveryDriverPhone}</a>
              </div>
            )}
            {order.deliveryEta && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>ETA</span>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{new Date(order.deliveryEta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            )}
            {order.deliveryTrackingUrl && (
              <a href={order.deliveryTrackingUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', textAlign: 'center', padding: '12px', marginTop: '12px',
                background: '#A78BFA', borderRadius: '10px', color: '#000',
                fontSize: '14px', fontWeight: '700', textDecoration: 'none',
              }}>
                Track Your Delivery Live
              </a>
            )}
          </div>
        )}

        {/* Order Details */}
        <div style={{ background: '#111', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #1E1E1E' }}>
          <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Order Details</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A' }}>
            <span style={{ fontSize: '13px', color: '#888' }}>Type</span>
            <span style={{ fontSize: '13px', color: '#FEFEFE', textTransform: 'capitalize' }}>{order.orderType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A' }}>
            <span style={{ fontSize: '13px', color: '#888' }}>{isDelivery ? 'Deliver To' : 'Pickup At'}</span>
            <span style={{ fontSize: '13px', color: '#FEFEFE', maxWidth: '60%', textAlign: 'right' }}>
              {isDelivery ? order.deliveryAddress : '3517 Lancaster Ave, Philadelphia PA 19104'}
            </span>
          </div>

          {/* Items */}
          <div style={{ marginTop: '14px' }}>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A' }}>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>{item.quantity}x {item.name}</span>
                <span style={{ fontSize: '13px', color: '#FED800' }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '2px solid #FED800' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#FED800' }}>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/order" style={{ padding: '14px 32px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#000', textDecoration: 'none' }}>
            Order Again
          </Link>
          <Link href="/" style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#888', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
