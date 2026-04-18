'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStoreSettings } from '../../hooks/useStoreSettings';

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

const FONT_BODY = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_HEAD = "'Playfair Display', Georgia, 'Times New Roman', serif";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { storeAddress } = useStoreSettings();
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
    let pollCount = 0;
    const maxPolls = 120;
    const interval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) { clearInterval(interval); return; }
      fetchOrder();
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY }}>
        <p style={{ color: '#777777', fontSize: '16px', fontWeight: 500 }}>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', fontFamily: FONT_BODY }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: '28px', fontWeight: 700, color: '#0D0D0D', margin: 0 }}>Order Not Found</h1>
        <p style={{ color: '#4D4D4D', fontSize: '16px', fontWeight: 500, margin: 0 }}>{error || 'We could not locate this order.'}</p>
        <Link href="/" style={{ padding: '10px 20px', background: '#E3BF22', color: '#0D0D0D', fontSize: '16.94px', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Back to Home <span style={{ fontSize: '20px', lineHeight: 1 }}>›</span>
        </Link>
      </div>
    );
  }

  const isDelivery = order.orderType === 'delivery';
  const steps = isDelivery ? statusSteps : pickupSteps;
  const currentIdx = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isComplete = order.status === 'delivered' || order.status === 'picked_up';

  // Hero icon/color based on status
  const heroColor = isCancelled ? '#FC0301' : isComplete ? '#22C55E' : '#000';
  const heroBg = isCancelled ? '#ffffff' : isComplete ? '#ffffff' : '#ffffff';

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', color: '#4D4D4D', fontFamily: FONT_BODY, fontWeight: 500 }}>

      {/* Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '1px solid #E5E5E5', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.webp" alt="Eggs Ok" style={{ height: '80px', width: '100px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Link>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 20px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `2px solid rgb(224 220 220)` }}>
            {isCancelled ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={heroColor} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : isComplete ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={heroColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={heroColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            )}
          </div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#777777', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Order Tracking</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'var(--font-family)'", color: '#0D0D0D', marginBottom: '10px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>Order #{order.orderNumber}</h1>
          <p style={{ fontSize: '16px', color: '#4D4D4D', fontWeight: 500, margin: 0 }}>
            {isCancelled ? 'This order was cancelled' : statusDesc[order.status] || 'Processing'}
          </p>
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#0D0D0D', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px' }}>Order Progress</p>
            {steps.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: i < steps.length - 1 ? '20px' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: done ? '#E3BF22' : '#F8F9FA',
                      border: active ? '2px solid #E3BF22' : done ? 'none' : '2px solid #E5E5E5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: '2px', height: '22px', background: done ? '#E3BF22' : '#E5E5E5', marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '3px', flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: active ? 700 : 500, color: done ? '#0D0D0D' : '#AAAAAA', margin: 0, fontFamily: FONT_BODY }}>{statusLabel[step]}</p>
                    {active && <p style={{ fontSize: '14px', color: '#777777', margin: '2px 0 0', fontWeight: 500 }}>{statusDesc[step]}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery Tracking */}
        {isDelivery && order.deliveryProvider && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderLeft: '4px solid #3B82F6', borderRadius: '16px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D', margin: 0, fontFamily: FONT_HEAD }}>Delivery In Progress</p>
                <p style={{ fontSize: '13px', color: '#777777', margin: 0, fontWeight: 500 }}>via {order.deliveryProvider === 'uber_direct' ? 'Uber Direct' : order.deliveryProvider}</p>
              </div>
            </div>
            {order.deliveryDriverName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '14px', color: '#777777', fontWeight: 500 }}>Driver</span>
                <span style={{ fontSize: '14px', color: '#0D0D0D', fontWeight: 600 }}>{order.deliveryDriverName}</span>
              </div>
            )}
            {order.deliveryDriverPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '14px', color: '#777777', fontWeight: 500 }}>Driver Phone</span>
                <a href={`tel:${order.deliveryDriverPhone}`} style={{ fontSize: '14px', color: '#0D0D0D', textDecoration: 'underline', fontWeight: 600 }}>{order.deliveryDriverPhone}</a>
              </div>
            )}
            {order.deliveryEta && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '14px', color: '#777777', fontWeight: 500 }}>ETA</span>
                <span style={{ fontSize: '14px', color: '#0D0D0D', fontWeight: 600 }}>{new Date(order.deliveryEta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            )}
            {order.deliveryTrackingUrl && (
              <a href={order.deliveryTrackingUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                textAlign: 'center', padding: '10px 18px', marginTop: '14px',
                background: '#E3BF22', borderRadius: '8px', color: '#0D0D0D',
                fontSize: '16.94px', fontWeight: 600, textDecoration: 'none',
                fontFamily: FONT_BODY,
              }}>
                Track Your Delivery Live <span style={{ fontSize: '20px', lineHeight: 1 }}>›</span>
              </a>
            )}
          </div>
        )}

        {/* Order Details */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#777777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Order Details</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
            <span style={{ fontSize: '14px', color: '#777777', fontWeight: 500 }}>Type</span>
            <span style={{ fontSize: '14px', color: '#0D0D0D', textTransform: 'capitalize', fontWeight: 600 }}>{order.orderType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#777777', fontWeight: 500, flexShrink: 0 }}>{isDelivery ? 'Deliver To' : 'Pickup At'}</span>
            <span style={{ fontSize: '14px', color: '#0D0D0D', maxWidth: '65%', textAlign: 'right', fontWeight: 500 }}>
              {isDelivery ? order.deliveryAddress : storeAddress}
            </span>
          </div>

          {/* Items */}
          <div style={{ marginTop: '18px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#777777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Items</p>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '14px', color: '#0D0D0D', fontWeight: 500 }}>{item.quantity}x {item.name}</span>
                <span style={{ fontSize: '14px', color: '#0D0D0D', fontWeight: 600 }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '2px solid #E3BF22' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONT_HEAD, color: '#0D0D0D' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONT_HEAD, color: '#0D0D0D' }}>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/order" style={{ padding: '8px 20px', background: '#E3BF22', borderRadius: '8px', fontSize: '16.94px', fontWeight: 600, color: '#0D0D0D', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: FONT_BODY }}>
            Order Again <span style={{ fontSize: '20px', lineHeight: 1 }}>›</span>
          </Link>
          <Link href="/" style={{ padding: '8px 20px', background: 'transparent', border: '2px solid #1A1A1A', borderRadius: '8px', fontSize: '16.94px', fontWeight: 600, color: '#1A1A1A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: FONT_BODY }}>
            Back to Home <span style={{ fontSize: '20px', lineHeight: 1 }}>›</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#F8F9FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY }}>
        <p style={{ color: '#777777', fontSize: '16px', fontWeight: 500 }}>Loading...</p>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
