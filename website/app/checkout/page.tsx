'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { API_URL } from '../../lib/api';
import { useGoogleMaps, initAutocomplete, validateDeliveryAddress } from '../../hooks/useGoogleMaps';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const css = `
  *, *::before, *::after { box-sizing: border-box; }

  .checkout-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 32px;
    align-items: flex-start;
  }

  .summary-sticky {
    position: sticky;
    top: 24px;
  }

  .tip-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .name-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .payment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .checkout-wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  /* â•â•â•â• TABLET â‰¤ 1024px â•â•â•â• */
  @media (max-width: 1024px) {
    .checkout-grid {
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }
  }

  /* â•â•â•â• MOBILE â‰¤ 768px â•â•â•â• */
  @media (max-width: 768px) {
    .checkout-grid {
      grid-template-columns: 1fr;
      gap: 0;
    }

    /* Order summary moves to top on mobile */
    .summary-sticky {
      position: static;
      order: -1;
      margin-bottom: 20px;
    }

    .tip-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .checkout-wrap {
      padding: 20px 16px;
    }
  }

  /* â•â•â•â• SMALL â‰¤ 480px â•â•â•â• */
  @media (max-width: 480px) {
    .checkout-wrap {
      padding: 16px 12px;
    }

    .name-grid {
      grid-template-columns: 1fr;
    }

    .payment-grid {
      grid-template-columns: 1fr;
    }

    .tip-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* ══ MODALS ══ */
  .co-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .co-modal-close { width: 32px; height: 32px; border-radius: 50%; background: #1A1A1A; border: 1px solid #2A2A2A; color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
  .co-modal-close:hover { background: #252525; color: #fff; }
  .co-modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 1px; color: #fff; margin: 0; }

  .co-delivery-box { background: #111; border-radius: 20px; width: 100%; max-width: 460px; border: 1px solid #1E1E1E; box-shadow: 0 24px 64px rgba(0,0,0,0.7); max-height: 92vh; overflow-y: auto; }
  .co-delivery-inner { padding: 28px; }
  .co-delivery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .co-type-toggle { display: flex; background: #1A1A1A; border-radius: 999px; padding: 3px; margin-bottom: 20px; border: 1px solid #2A2A2A; }
  .co-type-btn { flex: 1; padding: 10px; border-radius: 999px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s; }
  .co-type-btn.active { background: #fff; color: #000; }
  .co-type-btn.inactive { background: transparent; color: #444; }
  .co-del-input-wrap { position: relative; }
  .co-del-input { width: 100%; padding: 13px 40px 13px 42px; background: #0A0A0A; border: 1.5px solid #FED800; border-radius: 12px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
  .co-del-input::placeholder { color: #444; }
  .co-del-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #444; cursor: pointer; font-size: 13px; font-weight: 600; }
  .co-del-clear:hover { color: #fff; }
  .co-del-suggestion { margin-top: 8px; background: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 12px; overflow: hidden; }
  .co-del-sug-row { padding: 14px 16px; cursor: pointer; transition: background 0.12s; }
  .co-del-sug-row:hover { background: #141414; }
  .co-del-addr-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #0A0A0A; border: 1.5px solid rgba(254,216,0,0.2); border-radius: 12px; }
  .co-del-addr-change { background: none; border: none; color: #FED800; font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
  .co-del-field-label { font-size: 12px; color: #666; display: block; margin-bottom: 6px; font-weight: 600; }
  .co-del-field-input { width: 100%; padding: 12px; background: #0A0A0A; border: 1px solid #2A2A2A; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
  .co-del-field-input:focus { border-color: #FED800; }
  .co-del-field-input::placeholder { color: #444; }
  .co-del-field-textarea { width: 100%; padding: 12px; background: #0A0A0A; border: 1px solid #2A2A2A; border-radius: 10px; color: #fff; font-size: 13px; outline: none; height: 80px; resize: none; box-sizing: border-box; transition: border-color 0.15s; }
  .co-del-field-textarea:focus { border-color: #FED800; }
  .co-del-field-textarea::placeholder { color: #444; }
  .co-del-from { padding: 14px 16px; background: #0A0A0A; border-radius: 12px; border: 1px solid #1A1A1A; }
  .co-btn-primary { width: 100%; padding: 14px; background: #FED800; border: none; border-radius: 12px; color: #000; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .co-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(254,216,0,0.25); }
  .co-btn-secondary { width: 100%; padding: 14px; background: transparent; border: 1.5px solid #2A2A2A; border-radius: 12px; color: #ccc; font-size: 15px; font-weight: 600; cursor: pointer; transition: border-color 0.15s; }
  .co-btn-secondary:hover { border-color: #3A3A3A; color: #fff; }

  .co-schedule-box { background: #111; border-radius: 20px; width: 100%; max-width: 420px; border: 1px solid #1E1E1E; box-shadow: 0 24px 64px rgba(0,0,0,0.7); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
  .co-schedule-header { padding: 20px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1A1A1A; flex-shrink: 0; }
  .co-schedule-dates { padding: 16px 24px 0; flex-shrink: 0; }
  .co-schedule-dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .co-schedule-date-btn { padding: 10px 14px; border-radius: 10px; border: 1px solid; cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s; background: #1A1A1A; }
  .co-schedule-date-btn.active { border-color: #FED800; background: rgba(254,216,0,0.08); }
  .co-schedule-date-btn.inactive { border-color: #2A2A2A; }
  .co-more-dates-btn { width: 100%; padding: 10px; background: transparent; border: 1px solid #2A2A2A; border-radius: 10px; color: #ccc; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px; transition: border-color 0.15s; }
  .co-more-dates-btn:hover { border-color: #3A3A3A; color: #fff; }
  .co-times-list { overflow-y: auto; flex: 1; padding: 0 24px 8px; }
  .co-time-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #141414; cursor: pointer; }
  .co-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
  .co-radio.selected { border-color: #FED800; background: #FED800; }
  .co-radio.unselected { border-color: #333; background: transparent; }
  .co-radio-inner { width: 8px; height: 8px; border-radius: 50%; background: #000; }
  .co-schedule-footer { padding: 16px 24px; border-top: 1px solid #1A1A1A; flex-shrink: 0; }
  .co-schedule-confirm { width: 100%; padding: 14px; background: #FED800; border: none; border-radius: 12px; color: #000; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s; }
  .co-schedule-confirm:hover { transform: translateY(-1px); }
`;

export default function CheckoutPage() {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/payments/stripe-key`)
      .then(r => r.ok ? r.json() : { key: null })
      .then(data => {
        if (data.key && data.key.startsWith('pk_') && data.key.length > 20) {
          setStripePromise(loadStripe(data.key));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'night', variables: { colorPrimary: '#FED800', colorBackground: '#0A0A0A', colorText: '#FEFEFE', borderRadius: '10px' } } }}>
      <CheckoutInner />
    </Elements>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { isOpen, statusMessage, taxRate, storeName, storeAddress, storeTimezone } = useStoreSettings();
  const [tzAbbr, setTzAbbr] = useState('ET');
  useEffect(() => {
    try {
      const tz = new Intl.DateTimeFormat('en-US', { timeZone: storeTimezone || 'America/New_York', timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
      if (tz) setTzAbbr(tz);
    } catch {}
  }, [storeTimezone]);
  const {
    cart, cartTotal, orderType, setOrderType, getPrice,
    deliveryAddress, setDeliveryAddress, deliveryApt, setDeliveryApt,
    deliveryInstructions, setDeliveryInstructions,
    scheduleType, setScheduleType, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime,
    deliveryFee: cartDeliveryFee, setDeliveryFee, deliveryZone,
    clearCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Refresh delivery fee from backend zones on page load
  useEffect(() => {
    if (orderType !== 'delivery') return;
    fetch(`${API_URL}/settings/delivery_settings`)
      .then(r => r.ok ? r.text() : '')
      .then(text => {
        if (!text) return;
        const data = JSON.parse(text);
        const zones = data?.zones?.filter((z: any) => z.active) || [];
        if (deliveryZone && zones.length > 0) {
          const matched = zones.find((z: any) => z.name === deliveryZone);
          if (matched) setDeliveryFee(Number(matched.deliveryFee));
        } else if (zones.length > 0) {
          const cheapest = zones.reduce((min: any, z: any) => z.deliveryFee < min.deliveryFee ? z : min, zones[0]);
          setDeliveryFee(Number(cheapest.deliveryFee));
        }
      })
      .catch(() => {});
  }, [orderType]);

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMoreDates, setShowMoreDates] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState<1 | 2>(deliveryAddress ? 2 : 1);
  const [deliveryAddrError, setDeliveryAddrError] = useState('');

  // Google Maps autocomplete
  const mapsLoaded = useGoogleMaps();
  const coAddrInputRef = useRef<HTMLInputElement>(null);
  const coCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mapsLoaded || !coAddrInputRef.current || !showDeliveryModal) return;
    coCleanupRef.current?.();
    coCleanupRef.current = initAutocomplete(coAddrInputRef.current, (place) => {
      setDeliveryAddress(place.address);
      validateDeliveryAddress(place.lat, place.lng)
        .then(result => {
          if (result.eligible) {
            setDeliveryFee(result.deliveryFee);
            setDeliveryAddrError('');
            setDeliveryStep(2);
          } else {
            setDeliveryAddrError(`Sorry, this address is ${result.distance} miles away — outside our delivery area.`);
          }
        })
        .catch(() => setDeliveryStep(2));
    });
    return () => { coCleanupRef.current?.(); coCleanupRef.current = null; };
  }, [mapsLoaded, showDeliveryModal]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Pre-fill from logged-in user data
  useEffect(() => {
    const token = localStorage.getItem('eggok_token');
    const userData = localStorage.getItem('eggok_user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const [first, ...rest] = (user.name || '').split(' ');
        setFirstName(first || '');
        setLastName(rest.join(' ') || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setIsLoggedIn(true);
      } catch { }
    }
  }, []);

  // Stripe
  const stripe = useStripe();
  const elements = useElements();
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const cardComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [tipMode, setTipMode] = useState<'preset' | 'custom'>('preset');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [showCustomTipModal, setShowCustomTipModal] = useState(false);

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
  const taxes = subtotal * taxRate;
  const deliveryFee = orderType === 'delivery' ? cartDeliveryFee : 0;
  const discount = promoApplied ? promoDiscount : 0;

  const tipAmount = tipMode === 'custom' && customTipAmount && parseFloat(customTipAmount) > 0
    ? parseFloat(customTipAmount)
    : (subtotal * tipPercent) / 100;

  const total = subtotal + taxes + deliveryFee - discount + tipAmount;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#0A0A0A', border: '1px solid #3A3A3A',
    borderRadius: '10px', color: '#ffffff',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: '600',
    color: '#CACACA', display: 'block',
    marginBottom: '6px',
  };

  const cardStyle: React.CSSProperties = {
    background: '#111111', border: '1px solid #1E1E1E',
    borderRadius: '14px', padding: '20px', marginBottom: '20px',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '16px', fontWeight: '800',
    color: '#ffffff', marginBottom: '16px',
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`${API_URL}/promotions/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied(true);
        setPromoDiscount(data.discountAmount);
        setPromoLabel(data.message);
        setPromoError('');
      } else {
        setPromoApplied(false);
        setPromoDiscount(0);
        setPromoLabel('');
        setPromoError(data.message || 'Invalid promo code');
      }
    } catch {
      setPromoError('Unable to validate promo code. Please try again.');
    }
    setPromoLoading(false);
  };

  const placingRef = useRef(false);
  const handlePlaceOrder = async () => {
    if (placingRef.current) return;
    placingRef.current = true;
    setPlacing(true);
    setOrderError('');

    const orderData = {
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
      items: cart.map(c => {
        const selectedModifiersList: Array<{ name: string; price: number }> = [];
        if (c.item.modifiers) {
          c.item.modifiers.forEach(group => {
            const selected = c.selectedModifiers[group.id] || [];
            selected.forEach(optId => {
              const opt = group.options.find(o => o.id === optId);
              if (opt) selectedModifiersList.push({ name: opt.name, price: opt.price });
            });
          });
        }
        return { id: c.item.id, name: c.item.name, price: getPrice(c.item), quantity: c.quantity, specialInstructions: c.specialInstructions || null, modifiers: selectedModifiersList };
      }),
      subtotal,
      tax: taxes,
      deliveryFee,
      tip: tipAmount,
      total,
      promoCode: promoApplied ? promoCode : null,
      discount,
      isAuthenticated: isLoggedIn,
    };

    try {
      // Step 1: Create order FIRST to get real order number
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = Array.isArray(errorData?.message) ? errorData.message[0] : errorData?.message;
        throw new Error(message || 'Unable to place your order right now.');
      }

      const order = await response.json();

      // Step 2: Process payment with REAL order number
      const cardElement = stripe && elements ? elements.getElement(CardNumberElement) : null;
      if (stripe && cardElement) {
        const piRes = await fetch(`${API_URL}/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, orderNumber: order.orderNumber, customerEmail: email, customerName: `${firstName} ${lastName}` }),
        });

        if (!piRes.ok) {
          const err = await piRes.json().catch(() => ({}));
          throw new Error(err.message || 'Payment setup failed');
        }

        const { clientSecret } = await piRes.json();

        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement, billing_details: { name: `${firstName} ${lastName}`, email } },
        });

        if (stripeError) {
          throw new Error(stripeError.message || 'Payment failed');
        }
      }

      localStorage.setItem('eggok_last_order', JSON.stringify(order));
      clearCart();
      router.push('/confirmation');
    } catch (err) {
      // Order placement failed
      setOrderError(err instanceof Error ? err.message : 'Unable to place your order right now.');
      setPlacing(false);
      placingRef.current = false;
    }
  };

  const getScheduleLabel = () => {
    if (scheduleType === 'asap') return 'ASAP In 15 min';
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      return { value: d.toISOString().split('T')[0], label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });
    const dayLabel = days.find(d => d.value === scheduleDate)?.label || 'Today';
    const [h, m] = scheduleTime.split(':').map(Number);
    const timeLabel = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} ${tzAbbr}`;
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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
  const hasItems = cart.length > 0;
  const hasDeliveryAddress = orderType === 'pickup' || deliveryAddress.trim().length > 0;
  const isFormValid = firstName && lastName && isEmailValid && isPhoneValid && hasItems && hasDeliveryAddress;
  const isPaymentValid = (stripe && elements?.getElement(CardNumberElement)) ? cardComplete : true;
  const canPlaceOrder = isFormValid && isPaymentValid;

  const isPreset = (t: number) => tipMode === 'preset' && tipPercent === t;
  const isCustomActive = tipMode === 'custom';

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{css}</style>

      <div className="checkout-wrap">

        {/* Back */}
        <Link href="/order"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffffffffff', fontSize: '14px', marginBottom: '28px', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffffffffffff'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Menu
        </Link>

        <h1 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: '900', color: '#ffffff', marginBottom: '32px', letterSpacing: '-0.5px' }}>Checkout</h1>

        <div className="checkout-grid">

          {/* â”€â”€ LEFT â”€â”€ */}
          <div>

            {/* Order Details */}
            <div style={cardStyle}>
              <p style={sectionTitle}>{orderType === 'pickup' ? 'Pickup details' : 'Delivery details'}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: '14px', color: '#ffffff', flex: 1, wordBreak: 'break-word' }}>
                  {orderType === 'pickup' ? storeAddress : deliveryAddress || 'Please set a delivery address'}
                </span>
                <button onClick={() => setShowDeliveryModal(true)} style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Change</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: orderType === 'delivery' ? '10px' : '0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getScheduleLabel()}</span>
                <button onClick={() => setShowScheduleModal(true)} style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Change</button>
              </div>

              {orderType === 'delivery' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                    </svg>
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

            {/* Tip */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Tip</p>
              <div className="tip-grid">
                {[10, 15, 20, 25].map(t => (
                  <button key={t} onClick={() => selectPresetTip(t)} style={{
                    padding: '12px 8px', borderRadius: '10px',
                    background: isPreset(t) ? '#FED80015' : '#0A0A0A',
                    border: `1.5px solid ${isPreset(t) ? '#FED800' : '#2A2A2A'}`,
                    color: isPreset(t) ? '#FED800' : '#ffffffffffff',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', margin: 0 ,color:'#ffffff',}}>${((subtotal * t) / 100).toFixed(2)}</p>
                    <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.7,color:'#ffffff', }}>{t}%</p>
                  </button>
                ))}
                <button onClick={() => setShowCustomTipModal(true)} style={{
                  padding: '12px 8px', borderRadius: '10px',
                  background: isCustomActive ? '#FED80015' : '#0A0A0A',
                  border: `1.5px solid ${isCustomActive ? '#FED800' : '#2A2A2A'}`,
                  color: isCustomActive ? '#FED800' : '#ffffff',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
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

            {/* Your Information */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Your information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Mobile number *</label>
                  <input type="tel" style={inputStyle} placeholder="(215) 555-0100" value={phone} onChange={e => setPhone(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  {phone && !isPhoneValid && <p style={{ fontSize: '11px', color: '#FC0301', marginTop: '4px' }}>Please enter a valid phone number (at least 10 digits)</p>}
                </div>
                <div className="name-grid">
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
                  {email && !isEmailValid && <p style={{ fontSize: '11px', color: '#FC0301', marginTop: '4px' }}>Please enter a valid email address</p>}
                </div>
              </div>
              {!hasItems && <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '8px' }}>Your cart is empty. Please add items before checking out.</p>}
              {orderType === 'delivery' && !hasDeliveryAddress && <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '8px' }}>Please set a delivery address before placing your order.</p>}
            </div>

            {/* Payment */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Payment</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #22C55E20', marginBottom: '16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ fontSize: '12px', color: '#22C55E' }}>Secured by Stripe — 256-bit SSL encryption</span>
              </div>
              {stripe ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Card Number</label>
                    <div style={{ padding: '14px', background: '#0A0A0A', border: '1px solid #3A3A3A', borderRadius: '10px' }}>
                      <CardNumberElement
                        options={{
                          style: {
                            base: { fontSize: '15px', color: '#FEFEFE', '::placeholder': { color: '#555' }, iconColor: '#FED800' },
                            invalid: { color: '#FC0301', iconColor: '#FC0301' },
                          },
                        }}
                        onChange={(e) => setCardNumberComplete(e.complete)}
                      />
                    </div>
                  </div>
                  <div className="payment-grid">
                    <div>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Expiry Date</label>
                      <div style={{ padding: '14px', background: '#0A0A0A', border: '1px solid #3A3A3A', borderRadius: '10px' }}>
                        <CardExpiryElement
                          options={{
                            style: {
                              base: { fontSize: '15px', color: '#FEFEFE', '::placeholder': { color: '#555' } },
                              invalid: { color: '#FC0301' },
                            },
                          }}
                          onChange={(e) => setCardExpiryComplete(e.complete)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '600' }}>CVV</label>
                      <div style={{ padding: '14px', background: '#0A0A0A', border: '1px solid #3A3A3A', borderRadius: '10px' }}>
                        <CardCvcElement
                          options={{
                            style: {
                              base: { fontSize: '15px', color: '#FEFEFE', '::placeholder': { color: '#555' } },
                              invalid: { color: '#FC0301' },
                            },
                          }}
                          onChange={(e) => setCardCvcComplete(e.complete)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', background: '#0A0A0A', borderRadius: '10px', border: '1px dashed #2A2A2A', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Payment processing not configured. Add Stripe keys in Admin → Integrations.</p>
                </div>
              )}
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
              {placing ? 'Placing Order...' : `Place order  $${total.toFixed(2)}`}
            </button>
            {orderError && (
              <p style={{ fontSize: '12px', color: '#FC0301', textAlign: 'center', marginBottom: '12px' }}>
                {orderError}
              </p>
            )}
            <p style={{ fontSize: '11px', color: '#ffffffff', textAlign: 'center', lineHeight: '1.6' }}>
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* â”€â”€ RIGHT â€” Summary â”€â”€ */}
          <div className="summary-sticky">
            <div style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E1E1E' }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Order summary</p>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>Taxes & fees</span>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>${taxes.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#ffffff' }}>Delivery</span>
                      <span style={{ fontSize: '14px', color: '#ffffff' }}>${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#ffffff' }}>Tip</span>
                      <span style={{ fontSize: '14px', color: '#ffffff' }}>${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {promoApplied && discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#22C55E' }}>Discount ({promoCode})</span>
                      <span style={{ fontSize: '14px', color: '#22C55E' }}>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Promo */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Add coupon or gift card"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoApplied(false); setPromoDiscount(0); setPromoLabel(''); }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                    <button onClick={applyPromo} disabled={promoLoading}
                      style={{ padding: '12px 14px', background: promoLoading ? '#1A1A1A' : '#FED800', borderRadius: '10px', color: promoLoading ? '#555' : '#000', fontSize: '13px', fontWeight: '700', cursor: promoLoading ? 'not-allowed' : 'pointer', border: 'none', flexShrink: 0 }}>
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoApplied && <p style={{ fontSize: '12px', color: '#22C55E', marginTop: '6px' }}>&#10003; {promoLabel}</p>}
                  {promoError && <p style={{ fontSize: '12px', color: '#FC0301', marginTop: '6px' }}>{promoError}</p>}
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1E1E1E', marginBottom: '20px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>Total</span>
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
                          : <svg width="20" height="20" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5" /><path d="M20 32 Q32 20 44 32" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="32" cy="38" r="6" stroke="#2A2A2A" strokeWidth="1.5" /></svg>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>{cartItem.item.name}</p>

                        {/* Selected Modifiers */}
                        {cartItem.item.modifiers && (
                          <div style={{ marginTop: '4px' }}>
                            {cartItem.item.modifiers.map(group => {
                              const selectedIds = cartItem.selectedModifiers[group.id] || [];
                              return selectedIds.map(optId => {
                                const opt = group.options.find(o => o.id === optId);
                                if (!opt) return null;
                                return (
                                  <div key={`${group.id}-${optId}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>+ {opt.name}</p>
                                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>${(opt.price * cartItem.quantity).toFixed(2)}</p>
                                  </div>
                                );
                              });
                            })}
                          </div>
                        )}

                        {cartItem.specialInstructions && <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>{cartItem.specialInstructions}</p>}
                        <p style={{ fontSize: '12px', color: '#ffffff', margin: '2px 0 0' }}>Qty: {cartItem.quantity}</p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', flexShrink: 0 }}>${(getPrice(cartItem.item) * cartItem.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Place Order button â€” visible on mobile below summary */}
            <div style={{ marginTop: '16px', display: 'none' }} className="mobile-place-order">
              <button onClick={handlePlaceOrder} disabled={!canPlaceOrder || placing} style={{
                width: '100%', padding: '16px',
                background: canPlaceOrder && !placing ? '#FED800' : '#1A1A1A',
                color: canPlaceOrder && !placing ? '#000' : '#555',
                borderRadius: '12px', border: 'none',
                fontSize: '16px', fontWeight: '800',
                cursor: canPlaceOrder && !placing ? 'pointer' : 'not-allowed',
              }}>
                {placing ? 'Placing Order...' : `Place order Â· $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tip Modal */}
      {showCustomTipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowCustomTipModal(false)}>
          <div style={{ background: '#111', borderRadius: '20px', width: '100%', maxWidth: '400px', border: '1px solid #1E1E1E', padding: '24px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Custom tip</h2>
              <button onClick={() => setShowCustomTipModal(false)}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#FED800', fontWeight: '700', fontSize: '14px' }}>$</span>
                  <input type="number" placeholder="0.00" value={customTipAmount}
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
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                </div>
              </div>
              <span style={{ color: '#444', fontSize: '18px', marginTop: '20px' }}>=</span>
              <div>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Percent</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" placeholder="0" value={customTipPercent}
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
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#3A3A3A'} />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ffffff', fontSize: '14px' }}>%</span>
                </div>
              </div>
            </div>

            <button onClick={applyCustomTip} disabled={!customTipAmount || parseFloat(customTipAmount) <= 0}
              style={{ width: '100%', padding: '14px', background: customTipAmount && parseFloat(customTipAmount) > 0 ? '#FED800' : '#1A1A1A', border: 'none', borderRadius: '12px', color: customTipAmount && parseFloat(customTipAmount) > 0 ? '#000' : '#555', fontSize: '15px', fontWeight: '800', cursor: customTipAmount && parseFloat(customTipAmount) > 0 ? 'pointer' : 'not-allowed' }}>
              Done â†’
            </button>
          </div>
        </div>
      )}

      {/* ══ DELIVERY / ORDER TYPE MODAL ══ */}
      {showDeliveryModal && (
        <div className="co-modal-backdrop" onClick={() => setShowDeliveryModal(false)}>
          <div className="co-delivery-box" onClick={e => e.stopPropagation()}>
            <div className="co-delivery-inner">
              <div className="co-delivery-header">
                <h2 className="co-modal-title">ORDER DETAILS</h2>
                <button className="co-modal-close" onClick={() => setShowDeliveryModal(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="co-type-toggle">
                {(['pickup', 'delivery'] as const).map(type => (
                  <button key={type} className={`co-type-btn ${orderType === type ? 'active' : 'inactive'}`}
                    onClick={() => { setOrderType(type); if (type === 'pickup') setShowDeliveryModal(false); }}>
                    {type === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                ))}
              </div>

              {deliveryStep === 1 && (
                <div>
                  <div className="co-del-input-wrap">
                    <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input ref={coAddrInputRef} placeholder="Enter delivery address..." defaultValue={deliveryAddress} onChange={e => { setDeliveryAddress(e.target.value); setDeliveryAddrError(''); }} autoFocus className="co-del-input" />
                    {deliveryAddress && <button className="co-del-clear" onClick={() => { setDeliveryAddress(''); setDeliveryAddrError(''); if (coAddrInputRef.current) coAddrInputRef.current.value = ''; }}>Clear</button>}
                  </div>
                  {deliveryAddrError && (
                    <div style={{ marginTop: '8px', padding: '10px 14px', background: '#FC030115', border: '1px solid #FC030140', borderRadius: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#FC0301', fontWeight: '500', margin: 0 }}>{deliveryAddrError}</p>
                    </div>
                  )}
                  {!mapsLoaded && deliveryAddress.length > 2 && (
                    <div className="co-del-suggestion">
                      <div className="co-del-sug-row" onClick={() => setDeliveryStep(2)}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{deliveryAddress}</p>
                        <p style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>Philadelphia, PA</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deliveryStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="co-del-addr-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span style={{ flex: 1, fontSize: '13px', color: '#fff', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryAddress}</span>
                    <button className="co-del-addr-change" onClick={() => setDeliveryStep(1)}>Change</button>
                  </div>
                  <div>
                    <label className="co-del-field-label">Apt / Suite / Floor</label>
                    <input placeholder="Apt 4B, Suite 200…" value={deliveryApt} onChange={e => setDeliveryApt(e.target.value)} className="co-del-field-input" />
                  </div>
                  <div>
                    <label className="co-del-field-label">Delivery instructions</label>
                    <textarea placeholder="Leave at front door, don't ring the bell…" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} className="co-del-field-textarea" />
                  </div>
                  <div className="co-del-from">
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivering from</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{storeName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
                        <span style={{ fontSize: '12px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{isOpen ? statusMessage : 'Closed Now'}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>{storeAddress}</p>
                  </div>
                  <button className="co-btn-primary" onClick={() => { setScheduleType('asap'); setShowDeliveryModal(false); }}>Deliver ASAP</button>
                  <button className="co-btn-secondary" onClick={() => { setShowDeliveryModal(false); setShowScheduleModal(true); }}>Schedule delivery</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ SCHEDULE MODAL ══ */}
      {showScheduleModal && (
        <div className="co-modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="co-schedule-box" onClick={e => e.stopPropagation()}>
            <div className="co-schedule-header">
              <h2 className="co-modal-title">ORDER TIME</h2>
              <button className="co-modal-close" onClick={() => setShowScheduleModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="co-schedule-dates">
              {(() => {
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() + i * 86400000);
                  return { label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }), sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
                });
                const visibleDays = showMoreDates ? days : days.slice(0, 2);
                const selectedVal = scheduleDate || days[0].value;
                return (
                  <>
                    <div className="co-schedule-dates-grid">
                      {visibleDays.map(d => (
                        <button key={d.value} className={`co-schedule-date-btn ${selectedVal === d.value ? 'active' : 'inactive'}`} onClick={() => setScheduleDate(d.value)}>
                          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: selectedVal === d.value ? '#FED800' : '#fff' }}>{d.label}</p>
                          <p style={{ fontSize: '11px', color: '#444', margin: '2px 0 0' }}>{d.sub}</p>
                        </button>
                      ))}
                    </div>
                    <button className="co-more-dates-btn" onClick={() => setShowMoreDates(p => !p)}>
                      {showMoreDates ? 'Less dates' : 'More dates'}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <polyline points={showMoreDates ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
                      </svg>
                    </button>
                  </>
                );
              })()}
            </div>

            <div className="co-times-list">
              <div className="co-time-row" onClick={() => { setScheduleType('asap'); setScheduleTime(''); }}>
                <div className={`co-radio ${scheduleType === 'asap' ? 'selected' : 'unselected'}`}>
                  {scheduleType === 'asap' && <div className="co-radio-inner" />}
                </div>
                <span style={{ fontSize: '14px', color: '#fff' }}>ASAP</span>
              </div>
              {Array.from({ length: 57 }, (_, i) => {
                const totalMins = 7 * 60 + i * 15; const h = Math.floor(totalMins / 60); const m = totalMins % 60;
                const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} ${tzAbbr}`;
                const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const isSelected = scheduleType === 'scheduled' && scheduleTime === val;
                return (
                  <div key={val} className="co-time-row" onClick={() => { setScheduleType('scheduled'); setScheduleTime(val); }}>
                    <div className={`co-radio ${isSelected ? 'selected' : 'unselected'}`}>
                      {isSelected && <div className="co-radio-inner" />}
                    </div>
                    <span style={{ fontSize: '14px', color: '#fff' }}>{label}</span>
                  </div>
                );
              })}
            </div>

            <div className="co-schedule-footer">
              <button className="co-schedule-confirm" onClick={() => setShowScheduleModal(false)}>
                {scheduleType === 'asap' ? 'Order ASAP' : `Schedule for ${scheduleTime}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
