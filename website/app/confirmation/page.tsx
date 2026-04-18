'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../../hooks/useStoreSettings';

export default function ConfirmationPage() {
  const { cart, cartTotal, orderType, getPrice, scheduleType, scheduleTime, deliveryAddress, deliveryFee: cartDeliveryFee } = useCart();
  const { taxRate, storeName, storeAddress } = useStoreSettings();
  const [visible, setVisible] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);

  const subtotal = cartTotal;
  const taxes = subtotal * taxRate;
  const deliveryFee = orderType === 'delivery' ? (cartDeliveryFee || 0) : 0;
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

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
    const saved = localStorage.getItem('eggok_last_order');
    if (saved) {
      try {
        const order = JSON.parse(saved);
        setLastOrder(order);
        setOrderNumber(order.orderNumber);

        if (order.id) {
          // Poll order from API to get latest status + delivery fields
          const poll = () => {
            fetch(`${API}/orders/${order.id}`)
              .then(r => r.ok ? r.json() : null)
              .then(freshOrder => {
                if (!freshOrder) return;
                setLastOrder(freshOrder);
                // Update tracking from order fields
                if (freshOrder.deliveryProvider) {
                  setDeliveryTracking({
                    status: freshOrder.status,
                    driverName: freshOrder.deliveryDriverName,
                    driverPhone: freshOrder.deliveryDriverPhone,
                    eta: freshOrder.deliveryEta,
                    trackingUrl: freshOrder.deliveryTrackingUrl,
                  });
                }
                // Also poll live delivery status if dispatched
                if (freshOrder.deliveryQuoteId) {
                  fetch(`${API}/orders/${order.id}/delivery-status`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                      if (data && data.status !== 'no_dispatch') setDeliveryTracking(data);
                    })
                    .catch(() => {});
                }
              })
              .catch(() => {});
          };
          poll();
          const finalStatuses = ['delivered', 'picked_up', 'cancelled'];
          let pollCount = 0;
          const maxPolls = 120; // Stop after 30 minutes (120 * 15s)
          const interval = setInterval(() => {
            pollCount++;
            if (pollCount >= maxPolls) { clearInterval(interval); return; }
            poll();
          }, 15000);
          return () => clearInterval(interval);
        }
      } catch {
        setOrderNumber('EO-0000');
      }
    } else {
      setOrderNumber('EO-0000');
    }
  }, []);

  const displayItems = lastOrder?.items || cart;
  const displayTotal = lastOrder ? Number(lastOrder.total) : total;
  const displayOrderType = lastOrder?.orderType || orderType;

  // Map new backend statuses to display-friendly tracking steps
  const rawStatus = lastOrder?.status || 'pending_payment';
  const statusDisplayMap: Record<string, string> = {
    pending_payment: 'pending',
    paid: 'confirmed',
    sent_to_kitchen: 'confirmed',
    pending: 'pending',
    confirmed: 'confirmed',
    preparing: 'preparing',
    ready: 'ready',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    picked_up: 'picked_up',
    cancelled: 'cancelled',
  };
  const orderStatus = statusDisplayMap[rawStatus] || rawStatus;
  const pickupSteps = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'];
  const deliverySteps = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentSteps = displayOrderType === 'pickup' ? pickupSteps : deliverySteps;
  const currentIdx = currentSteps.indexOf(orderStatus);

  const stepLabels: Record<string, [string, string]> = {
    pending: ['Order Received', 'We got your order'],
    confirmed: ['Confirmed', 'Restaurant confirmed'],
    preparing: ['Preparing', 'Kitchen is working on it'],
    ready: ['Ready', displayOrderType === 'pickup' ? 'Come pick it up!' : 'Waiting for driver'],
    out_for_delivery: ['Out for Delivery', 'On the way to you'],
    delivered: ['Delivered', 'Enjoy your meal!'],
    picked_up: ['Picked Up', 'Enjoy your meal!'],
  };

  const steps = currentSteps.slice(0, displayOrderType === 'pickup' ? 4 : 5).map((s, i) => ({
    label: stepLabels[s]?.[0] || s,
    desc: stepLabels[s]?.[1] || '',
    done: i <= currentIdx,
    active: i === currentIdx,
  }));

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#4D4D4D', fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500 }}>

      {/* NAV */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #E0E0E0', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.webp" alt="Eggs Ok" style={{ height: '40px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '96px 24px 48px', textAlign: 'center' }}>

        {/* Success Icon */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #E5B800, #E5C200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 60px #E5B80040',
          transform: visible ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}>

          <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', marginBottom: '8px', letterSpacing: '-1px' }}>
            Order <span style={{ color: '#1A1A1A' }}>Confirmed!</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#1A1A1A', marginBottom: '32px' }}>
            Thank you! Your order has been received and we are getting started right away.
          </p>

          {/* Order Info Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '24px', marginBottom: '20px', textAlign: 'left' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E5E5E5' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#1A1A1A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Order Number</p>
                <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', letterSpacing: '2px', margin: '4px 0 0' }}>{orderNumber || '...'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#1A1A1A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Est. {displayOrderType === 'delivery' ? 'Delivery' : 'Ready'}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', letterSpacing: '1px', margin: '4px 0 0' }}>{getEstimatedTime()}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#1A1A1A', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Items Ordered</p>
              {displayItems.length === 0 ? (
                <p style={{ fontSize: '16px', color: '#AAAAAA' }}>No items</p>
              ) : displayItems.map((item: any, i: number) => {
                const isCartItem = 'item' in item;
                const name = isCartItem ? item.item.name : item.name;
                const qty = isCartItem ? item.quantity : item.quantity;
                const price = isCartItem ? getPrice(item.item) * item.quantity : item.price * item.quantity;
                const note = isCartItem ? item.specialInstructions : item.specialInstructions;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < displayItems.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', margin: 0 }}>{qty}x {name}</p>

                      {/* Modifiers for lastOrder items */}
                      {!isCartItem && item.modifiers && item.modifiers.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {item.modifiers.map((mod: any, mi: number) => (
                            <div key={mi} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                              <p style={{ fontSize: '12px', color: '#777777', margin: 0 }}>+ {mod.name}</p>
                              <p style={{ fontSize: '12px', color: '#777777', margin: 0 }}>${(Number(mod.price) * qty).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Modifiers for cart fallback items */}
                      {isCartItem && item.item.modifiers && (
                        <div style={{ marginTop: '4px' }}>
                          {item.item.modifiers.map((group: any) => {
                            const selectedIds = item.selectedModifiers[group.id] || [];
                            return selectedIds.map((optId: number) => {
                              const opt = group.options.find((o: any) => o.id === optId);
                              if (!opt) return null;
                              return (
                                <div key={`${group.id}-${optId}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                                  <p style={{ fontSize: '12px', color: '#777777', margin: 0 }}>+ {opt.name}</p>
                                  <p style={{ fontSize: '12px', color: '#777777', margin: 0 }}>${(opt.price * qty).toFixed(2)}</p>
                                </div>
                              );
                            });
                          })}
                        </div>
                      )}

                      {note && <p style={{ fontSize: '12px', color: '#1A1A1A', margin: '2px 0 0' }}>{note}</p>}
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', flexShrink: 0, margin: 0 }}>${Number(price).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Bill */}
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Subtotal</span>
                <span style={{ fontSize: '14px', color: '#1A1A1A' }}>${lastOrder ? Number(lastOrder.subtotal).toFixed(2) : subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Taxes & fees</span>
                <span style={{ fontSize: '14px', color: '#1A1A1A' }}>${lastOrder ? Number(lastOrder.tax).toFixed(2) : taxes.toFixed(2)}</span>
              </div>
              {displayOrderType === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Delivery fee</span>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>${lastOrder ? Number(lastOrder.deliveryFee).toFixed(2) : deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Tip</span>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>${lastOrder ? Number(lastOrder.tip).toFixed(2) : tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E5E5E5', marginTop: '4px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A' }}>Total Paid</span>
                <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A' }}>${displayTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#1A1A1A', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Order Status</p>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '2px', background: '#E5E5E5', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', width: '33%', height: '2px', background: '#E5B800', zIndex: 1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step.done ? '#22C55E' : step.active ? '#E5B800' : '#F0F0F0', border: `2px solid ${step.done ? '#22C55E' : step.active ? '#E5B800' : '#D0D0D0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : step.active ? (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#000' }} />
                      ) : (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A1A1A' }} />
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: step.done ? '#22C55E' : step.active ? '#1A1A1A' : '#1A1A1A', margin: 0 }}>{step.label}</p>
                      <p style={{ fontSize: '12px', color: '#1A1A1A', marginTop: '2px' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pickup / Delivery */}
          <div style={{ background: '#E5B80010', border: '1px solid #E5B80030', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E5B80020', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>
                {displayOrderType === 'pickup' ? 'Pickup Location' : 'Delivering To'}
              </p>
              <p style={{ fontSize: '14px', color: '#1A1A1A', margin: 0 }}>
                {displayOrderType === 'pickup' ? storeAddress : (lastOrder?.deliveryAddress || deliveryAddress || '—')}
              </p>
              {displayOrderType === 'pickup' && orderNumber && (
                <p style={{ fontSize: '12px', color: '#1A1A1A', marginTop: '4px', fontWeight: '600' }}>Show order #{orderNumber} at the counter</p>
              )}
            </div>
          </div>

          {/* Delivery Tracking */}
          {deliveryTracking && displayOrderType === 'delivery' && (
            <div style={{ background: '#A78BFA10', border: '1px solid #A78BFA30', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#A78BFA20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>Delivery In Progress</p>
                  <p style={{ fontSize: '12px', color: '#A78BFA', margin: 0 }}>via Uber Direct</p>
                </div>
              </div>
              {deliveryTracking.driverName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #D0D0D0' }}>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Driver</span>
                  <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: '600' }}>{deliveryTracking.driverName}</span>
                </div>
              )}
              {deliveryTracking.driverPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #D0D0D0' }}>
                  <span style={{ fontSize: '14px', color: '#777777' }}>Driver Phone</span>
                  <a href={`tel:${deliveryTracking.driverPhone}`} style={{ fontSize: '14px', color: '#60A5FA', textDecoration: 'none', fontWeight: '600' }}>{deliveryTracking.driverPhone}</a>
                </div>
              )}
              {deliveryTracking.eta && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #D0D0D0' }}>
                  <span style={{ fontSize: '14px', color: '#777777' }}>ETA</span>
                  <span style={{ fontSize: '14px', color: '#1A1A1A' }}>{new Date(deliveryTracking.eta).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              )}
              {deliveryTracking.trackingUrl && (
                <a href={deliveryTracking.trackingUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '8px 12px', marginTop: '12px',
                  background: '#A78BFA', borderRadius: '10px', color: '#000',
                  fontSize: '16px', fontWeight: '700', textDecoration: 'none',
                }}>
                  Track Your Delivery Live
                </a>
              )}
            </div>
          )}

          {/* Email note */}
          <div style={{ padding: '14px', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#1A1A1A', margin: 0 }}>
              A confirmation has been sent to your email. Check your inbox for order details and updates.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/order" style={{ padding: '14px 32px', background: '#E5B800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: '#000', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" />
              </svg>
              Order Again
            </Link>
            {lastOrder?.id && (
              <Link href={`/order-tracking?id=${lastOrder.id}`} style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #D0D0D0', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: '#1A1A1A', textDecoration: 'none' }}>
                Track Order
              </Link>
            )}
            <Link href="/" style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #D0D0D0', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: '#777777', textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
