'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart, cartTotal, orderType, getPrice,
    deliveryAddress, deliveryApt, setDeliveryApt,
    deliveryInstructions, setDeliveryInstructions,
    scheduleType, scheduleDate, scheduleTime,
  } = useCart();

  const [placing, setPlacing] = useState(false);

  // Customer details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Tip — persisted in localStorage
  const [tipMode, setTipMode] = useState<'preset' | 'custom'>('preset');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [showCustomTipModal, setShowCustomTipModal] = useState(false);

  // Load tip from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('eggok_tip_mode');
    const savedPercent = localStorage.getItem('eggok_tip_percent');
    const savedCustom = localStorage.getItem('eggok_tip_custom');
    if (savedMode === 'custom' && savedCustom) {
      setTipMode('custom');
      setCustomTipAmount(savedCustom);
      setCustomTipPercent(subtotal > 0 ? ((parseFloat(savedCustom) / subtotal) * 100).toFixed(0) : '');
    } else if (savedMode === 'preset' && savedPercent) {
      setTipMode('preset');
      setTipPercent(parseInt(savedPercent));
    }
  }, []);

  const subtotal = cartTotal;
  const taxes = subtotal * 0.08;
  const deliveryFee = orderType === 'delivery' ? 3.99 : 0;
  const discount = promoApplied ? subtotal * 0.10 : 0;

  const tipAmount = tipMode === 'custom' && customTipAmount && parseFloat(customTipAmount) > 0
    ? parseFloat(customTipAmount)
    : (subtotal * tipPercent) / 100;

  const total = subtotal + taxes + deliveryFee - discount + tipAmount;

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#0A0A0A', border: '1px solid #3A3A3A',
    borderRadius: '10px', color: '#FEFEFE',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const,
    color: '#CACACA', display: 'block' as const,
    marginBottom: '6px',
  };

  const cardStyle = {
    background: '#111111', border: '1px solid #1E1E1E',
    borderRadius: '14px', padding: '20px', marginBottom: '20px',
  };

  const sectionTitle = {
    fontSize: '16px', fontWeight: '800' as const,
    color: '#FEFEFE', marginBottom: '16px',
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePlaceOrder = async () => {
  setPlacing(true);
  try {
    const response = await fetch('http://localhost:3002/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        orderType,
        scheduleType,
        scheduledDate: scheduleDate || null,
        scheduledTime: scheduleTime || null,
        deliveryAddress: deliveryAddress || null,
        deliveryApt: deliveryApt || null,
        deliveryInstructions: deliveryInstructions || null,
        items: cart.map(c => ({
          id: c.item.id,
          name: c.item.name,
          price: getPrice(c.item),
          quantity: c.quantity,
          specialInstructions: c.specialInstructions || null,
        })),
        subtotal,
        tax: taxes,
        deliveryFee,
        tip: tipAmount,
        total,
        promoCode: promoApplied ? promoCode : null,
        discount,
      }),
    });
    const order = await response.json();
    localStorage.setItem('eggok_last_order', JSON.stringify(order));
    router.push('/confirmation');
  } catch (err) {
    console.error('Order failed:', err);
    setPlacing(false);
  }
};

  const getScheduleLabel = () => {
    if (scheduleType === 'asap') return 'ASAP · ~15 min';
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      return { value: d.toISOString().split('T')[0], label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });
    const dayLabel = days.find(d => d.value === scheduleDate)?.label || 'Today';
    const [h, m] = scheduleTime.split(':').map(Number);
    const timeLabel = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} EDT`;
    return `${dayLabel}, ${timeLabel}`;
  };

  const selectPresetTip = (t: number) => {
    setTipMode('preset');
    setTipPercent(t);
    setCustomTipAmount('');
    setCustomTipPercent('');
    localStorage.setItem('eggok_tip_mode', 'preset');
    localStorage.setItem('eggok_tip_percent', String(t));
    localStorage.removeItem('eggok_tip_custom');
  };

  const applyCustomTip = () => {
    if (!customTipAmount || parseFloat(customTipAmount) <= 0) return;
    setTipMode('custom');
    localStorage.setItem('eggok_tip_mode', 'custom');
    localStorage.setItem('eggok_tip_custom', customTipAmount);
    localStorage.removeItem('eggok_tip_percent');
    setShowCustomTipModal(false);
  };

  const isFormValid = firstName && lastName && email && phone;
  const isPaymentValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3;
  const canPlaceOrder = isFormValid && isPaymentValid;

  const isPreset = (t: number) => tipMode === 'preset' && tipPercent === t;
  const isCustomActive = tipMode === 'custom';

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#FEFEFE', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Back */}
        <Link href="/order" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888888', fontSize: '14px', marginBottom: '28px', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#888888'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Menu
        </Link>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', color: '#FEFEFE', marginBottom: '32px', letterSpacing: '-0.5px' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'flex-start' }}>

          {/* ── LEFT ── */}
          <div>

            {/* SECTION 1: Order Details */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{orderType === 'pickup' ? 'Pickup details' : 'Delivery details'}</p>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ fontSize: '14px', color: '#FEFEFE', flex: 1 }}>
                  {orderType === 'pickup' ? '3517 Lancaster Ave, Philadelphia PA 19104' : deliveryAddress || 'No address — go back to set one'}
                </span>
                <Link href="/order" style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>Change</Link>
              </div>

              {/* Schedule */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: orderType === 'delivery' ? '10px' : '0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: '14px', color: '#FEFEFE', flex: 1 }}>{getScheduleLabel()}</span>
                <Link href="/order" style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>Change</Link>
              </div>

              {/* Delivery extras */}
              {orderType === 'delivery' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    <input placeholder="Apt / Suite / Floor (optional)" value={deliveryApt} onChange={e => setDeliveryApt(e.target.value)}
                      style={{ ...inputStyle, background: 'transparent', border: 'none', padding: '0', flex: 1 }} />
                  </div>
                  <div style={{ padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A' }}>
                    <input placeholder="Delivery instructions (optional)" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)}
                      style={{ ...inputStyle, background: 'transparent', border: 'none', padding: '0', width: '100%' }} />
                  </div>
                </>
              )}
            </div>

            {/* SECTION 2: Tip */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Tip</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[10, 15, 20, 25].map(t => (
                  <button key={t} onClick={() => selectPresetTip(t)} style={{
                    padding: '12px 8px', borderRadius: '10px',
                    background: isPreset(t) ? '#FED80015' : '#0A0A0A',
                    border: `1.5px solid ${isPreset(t) ? '#FED800' : '#2A2A2A'}`,
                    color: isPreset(t) ? '#FED800' : '#888888',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' as const,
                  }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>${((subtotal * t) / 100).toFixed(2)}</p>
                    <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.7 }}>{t}%</p>
                  </button>
                ))}
                <button onClick={() => setShowCustomTipModal(true)} style={{
                  padding: '12px 8px', borderRadius: '10px',
                  background: isCustomActive ? '#FED80015' : '#0A0A0A',
                  border: `1.5px solid ${isCustomActive ? '#FED800' : '#2A2A2A'}`,
                  color: isCustomActive ? '#FED800' : '#888888',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' as const,
                }}>
                  {isCustomActive && customTipAmount ? (
                    <>
                      <p style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>${parseFloat(customTipAmount).toFixed(2)}</p>
                      <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.7 }}>Custom</p>
                    </>
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>Custom</p>
                  )}
                </button>
              </div>
            </div>

            {/* SECTION 3: Your Information */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Your information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Mobile number *</label>
                  <input type="tel" style={inputStyle} placeholder="(215) 555-0100" value={phone} onChange={e => setPhone(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>First name *</label>
                    <input style={inputStyle} placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name *</label>
                    <input style={inputStyle} placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email address *</label>
                  <input type="email" style={inputStyle} placeholder="john@gmail.com" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                </div>
              </div>
            </div>

            {/* SECTION 4: Payment */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Payment</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #22C55E20', marginBottom: '16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: '12px', color: '#22C55E' }}>Secured by Stripe — 256-bit SSL encryption</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Card number *</label>
                  <input style={inputStyle} placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Expiry date *</label>
                    <input style={inputStyle} placeholder="MM / YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Security code *</label>
                    <input style={inputStyle} placeholder="CVC" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <button onClick={handlePlaceOrder} disabled={!canPlaceOrder || placing} style={{
              width: '100%', padding: '16px',
              background: canPlaceOrder && !placing ? '#FED800' : '#1A1A1A',
              color: canPlaceOrder && !placing ? '#000' : '#555',
              borderRadius: '12px', border: 'none',
              fontSize: '16px', fontWeight: '800',
              cursor: canPlaceOrder && !placing ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', marginBottom: '12px',
            }}>
              {placing ? 'Placing Order...' : `Place order · $${total.toFixed(2)}`}
            </button>
            <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', lineHeight: '1.6' }}>
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* ── RIGHT — Summary ── */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E1E1E' }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>Order summary</p>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', color: '#FEFEFE' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>Taxes & fees</span>
                    <span style={{ fontSize: '14px', color: '#FEFEFE' }}>${taxes.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#888' }}>Delivery</span>
                      <span style={{ fontSize: '14px', color: '#FEFEFE' }}>$3.99</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#888' }}>Tip</span>
                      <span style={{ fontSize: '14px', color: '#FEFEFE' }}>${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {promoApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#22C55E' }}>Discount (10%)</span>
                      <span style={{ fontSize: '14px', color: '#22C55E' }}>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Promo */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Add coupon or gift card"
                      value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoApplied(false); }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                    <button onClick={applyPromo} style={{ padding: '12px 14px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', flexShrink: 0 }}>Apply</button>
                  </div>
                  {promoApplied && <p style={{ fontSize: '12px', color: '#22C55E', marginTop: '6px' }}>✓ WELCOME10 applied — 10% off!</p>}
                  {promoError && <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '6px' }}>{promoError}</p>}
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1E1E1E', marginBottom: '20px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#FED800' }}>${total.toFixed(2)}</span>
                </div>

                {/* Cart Items */}
                <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: '16px' }}>
                  {cart.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', padding: '10px 0' }}>No items in cart</p>
                  ) : cart.map((cartItem, i) => (
                    <div key={cartItem.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < cart.length - 1 ? '14px' : '0', paddingBottom: i < cart.length - 1 ? '14px' : '0', borderBottom: i < cart.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#1A1A1A', border: '1px solid #2A2A2A', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cartItem.item.image
                          ? <img src={cartItem.item.image} alt={cartItem.item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <svg width="20" height="20" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#2A2A2A" strokeWidth="1.5"/></svg>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', margin: 0, lineHeight: '1.3' }}>{cartItem.item.name}</p>
                        {cartItem.specialInstructions && <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>{cartItem.specialInstructions}</p>}
                        <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>Qty: {cartItem.quantity}</p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', flexShrink: 0 }}>${(getPrice(cartItem.item) * cartItem.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tip Modal */}
      {showCustomTipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowCustomTipModal(false)}>
          <div style={{ background: '#111', borderRadius: '20px', width: '100%', maxWidth: '400px', border: '1px solid #1E1E1E', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>Custom tip</h2>
              <button onClick={() => setShowCustomTipModal(false)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#FED800', fontWeight: '700', fontSize: '14px' }}>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customTipAmount}
                    onChange={e => {
                      setCustomTipAmount(e.target.value);
                      if (subtotal > 0 && e.target.value) {
                        setCustomTipPercent(((parseFloat(e.target.value) / subtotal) * 100).toFixed(0));
                      } else {
                        setCustomTipPercent('');
                      }
                    }}
                    autoFocus
                    style={{ ...inputStyle, paddingLeft: '28px' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'}
                  />
                </div>
              </div>
              <span style={{ color: '#444', fontSize: '18px', marginTop: '20px' }}>=</span>
              <div>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Percent</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    placeholder="0"
                    value={customTipPercent}
                    onChange={e => {
                      setCustomTipPercent(e.target.value);
                      if (subtotal > 0 && e.target.value) {
                        setCustomTipAmount(((parseFloat(e.target.value) / 100) * subtotal).toFixed(2));
                      } else {
                        setCustomTipAmount('');
                      }
                    }}
                    style={{ ...inputStyle, paddingRight: '28px' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '14px' }}>%</span>
                </div>
              </div>
            </div>

            <button onClick={applyCustomTip} disabled={!customTipAmount || parseFloat(customTipAmount) <= 0}
              style={{ width: '100%', padding: '14px', background: customTipAmount && parseFloat(customTipAmount) > 0 ? '#FED800' : '#1A1A1A', border: 'none', borderRadius: '12px', color: customTipAmount && parseFloat(customTipAmount) > 0 ? '#000' : '#555', fontSize: '15px', fontWeight: '800', cursor: customTipAmount && parseFloat(customTipAmount) > 0 ? 'pointer' : 'not-allowed' }}>
              Done →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}