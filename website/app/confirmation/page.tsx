'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function ConfirmationPage() {
  const { cart, cartTotal, orderType, getPrice, scheduleType, scheduleTime, deliveryAddress } = useCart();
  const [visible, setVisible] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [lastOrder, setLastOrder] = useState<any>(null);

  const subtotal = cartTotal;
  const taxes = subtotal * 0.08;
  const deliveryFee = orderType === 'delivery' ? 3.99 : 0;

  const getSavedTipAmount = () => {
    if (typeof window === 'undefined') return 0;
    const mode = localStorage.getItem('eggok_tip_mode');
    if (mode === 'custom') {
      const amt = localStorage.getItem('eggok_tip_custom');
      return amt ? parseFloat(amt) : 0;
    }
    const pct = localStorage.getItem('eggok_tip_percent');
    const percent = pct ? parseInt(pct) : 15;
    return (subtotal * percent) / 100;
  };

  const tipAmount = getSavedTipAmount();
  const total = subtotal + taxes + deliveryFee + tipAmount;

  const getEstimatedTime = () => {
    if (scheduleType === 'scheduled' && scheduleTime) {
      const [h, m] = scheduleTime.split(':').map(Number);
      return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const h = now.getHours();
    const m = now.getMinutes();
    return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    // Read real order from localStorage (saved by checkout)
    const saved = localStorage.getItem('eggok_last_order');
    if (saved) {
      try {
        const order = JSON.parse(saved);
        setLastOrder(order);
        setOrderNumber(order.orderNumber);
      } catch {
        setOrderNumber('EO-' + Math.floor(1000 + Math.random() * 9000));
      }
    } else {
      setOrderNumber('EO-' + Math.floor(1000 + Math.random() * 9000));
    }
  }, []);

  const displayItems = lastOrder?.items || cart;
  const displayTotal = lastOrder ? Number(lastOrder.total) : total;

  const steps = orderType === 'pickup'
    ? [
        { label: 'Order Received', desc: 'We got your order', done: true, active: false },
        { label: 'Preparing', desc: 'Kitchen is working on it', done: false, active: true },
        { label: 'Ready for Pickup', desc: 'Come pick it up!', done: false, active: false },
      ]
    : [
        { label: 'Order Received', desc: 'We got your order', done: true, active: false },
        { label: 'Preparing', desc: 'Kitchen is working on it', done: false, active: true },
        { label: 'Out for Delivery', desc: 'On the way to you', done: false, active: false },
      ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#FEFEFE', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* NAV */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E1E', height: '64px', display: 'flex', alignItems: 'center', padding: '0 28px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/logo.svg" alt="Eggs Ok" style={{ width: '38px', height: '38px', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#FED800', letterSpacing: '0.5px', lineHeight: '1' }}>EGGS OK</div>
            <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Philadelphia</div>
          </div>
        </Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '96px 24px 48px', textAlign: 'center' }}>

        {/* Success Icon */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FED800, #E5C200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 60px #FED80040',
          transform: visible ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}>

          <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', color: '#FEFEFE', marginBottom: '8px', letterSpacing: '-1px' }}>
            ORDER <span style={{ color: '#FED800' }}>CONFIRMED!</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#888888', marginBottom: '32px' }}>
            Thank you! Your order has been received and we are getting started right away.
          </p>

          {/* Order Info Card */}
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '24px', marginBottom: '20px', textAlign: 'left' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1A1A1A' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Order Number</p>
                <p style={{ fontSize: '26px', fontWeight: '900', color: '#FED800', letterSpacing: '2px', margin: '4px 0 0' }}>{orderNumber || '...'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Est. {orderType === 'delivery' ? 'Delivery' : 'Ready'}</p>
                <p style={{ fontSize: '26px', fontWeight: '900', color: '#FEFEFE', letterSpacing: '1px', margin: '4px 0 0' }}>{getEstimatedTime()}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Items Ordered</p>
              {displayItems.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#555' }}>No items</p>
              ) : displayItems.map((item: any, i: number) => {
                const isCartItem = 'item' in item;
                const name = isCartItem ? item.item.name : item.name;
                const qty = isCartItem ? item.quantity : item.quantity;
                const price = isCartItem ? getPrice(item.item) * item.quantity : item.price * item.quantity;
                const note = isCartItem ? item.specialInstructions : item.specialInstructions;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < displayItems.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', margin: 0 }}>{qty}x {name}</p>
                      {note && <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>{note}</p>}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FED800', flexShrink: 0, margin: 0 }}>${Number(price).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Bill */}
            <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Subtotal</span>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>${lastOrder ? Number(lastOrder.subtotal).toFixed(2) : subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Taxes & fees</span>
                <span style={{ fontSize: '13px', color: '#FEFEFE' }}>${lastOrder ? Number(lastOrder.tax).toFixed(2) : taxes.toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Delivery fee</span>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>$3.99</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Tip</span>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>${lastOrder ? Number(lastOrder.tip).toFixed(2) : tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #1A1A1A', marginTop: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE' }}>Total Paid</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#FED800' }}>${displayTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Order Status</p>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '2px', background: '#1A1A1A', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', width: '33%', height: '2px', background: '#FED800', zIndex: 1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step.done ? '#22C55E' : step.active ? '#FED800' : '#1A1A1A', border: `2px solid ${step.done ? '#22C55E' : step.active ? '#FED800' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : step.active ? (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#000' }} />
                      ) : (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: step.done ? '#22C55E' : step.active ? '#FED800' : '#888', margin: 0 }}>{step.label}</p>
                      <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pickup / Delivery */}
          <div style={{ background: '#FED80010', border: '1px solid #FED80030', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FED80020', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>
                {orderType === 'pickup' ? 'Pickup Location' : 'Delivering To'}
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                {orderType === 'pickup' ? '3517 Lancaster Ave, Philadelphia PA 19104' : deliveryAddress || '—'}
              </p>
              {orderType === 'pickup' && orderNumber && (
                <p style={{ fontSize: '12px', color: '#FED800', marginTop: '4px', fontWeight: '600' }}>Show order #{orderNumber} at the counter</p>
              )}
            </div>
          </div>

          {/* Email note */}
          <div style={{ padding: '14px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              A confirmation has been sent to your email. Check your inbox for order details and updates.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/order" style={{ padding: '14px 32px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#000', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
              </svg>
              Order Again
            </Link>
            <Link href="/" style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#888', textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}