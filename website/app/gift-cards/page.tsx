'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  Gift, Send, Check, MapPin, Smartphone,
  ShieldCheck, RefreshCw, Infinity, ArrowRight,
} from 'lucide-react';

export default function GiftCardsPage() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const presetAmounts = [10, 25, 50, 100];
  const finalAmount = customAmount ? Number(customAmount) : amount;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const res = await fetch(`${API}/mail/gift-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, recipientName, recipientEmail, senderName, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send gift card');
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const perks = [
    { icon: ShieldCheck, title: 'Never Expires',     desc: 'Valid forever, no expiry date'   },
    { icon: RefreshCw,   title: 'Reloadable',         desc: 'Top up anytime you like'         },
    { icon: Infinity,    title: 'Any Order',          desc: 'Use on any menu item'            },
  ];

  return (
    <div id="giftcards-page" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --y: #FED800;
          --r: #FC0301;
          --green: #22C55E;
          --bg0: #000;
          --bg1: #0A0A0A;
          --bg2: #111111;
          --bg3: #1A1A1A;
          --border: #1E1E1E;
          --t1: #ffffff;
          --t2: #ffffff;
          --t3: #666666;
          --font-head: 'Bebas Neue', sans-serif;
          --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Accessibility ── */
        :focus-visible { outline: 2px solid var(--y); outline-offset: 3px; }
        a:focus:not(:focus-visible), button:focus:not(:focus-visible) { outline: none; }

        /* ── Layout ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .bebas { font-family: var(--font-head); letter-spacing: 1px; }

        /* ── Buttons ── */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: var(--y); color: #000;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          font-family: var(--font-body);
        }
        .btn-yellow:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(254,216,0,0.25); }
        .btn-yellow:active { transform: translateY(0); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: var(--t1);
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #333;
          transition: border-color 0.15s, color 0.15s;
          font-family: var(--font-body); cursor: pointer;
        }
        .btn-outline:hover { border-color: var(--y); color: var(--y); }

        /* ── Section label ── */
        .sec-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: var(--y);
          margin-bottom: 10px; display: block;
        }

        /* ── Section heading ── */
        .sec-heading {
          font-family: var(--font-head);
          font-size: clamp(36px, 6vw, 62px);
          letter-spacing: 1px; line-height: 0.95; color: var(--t1);
        }
        .sec-heading .accent { color: var(--y); }

        /* ── Main grid ── */
        .giftcard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: flex-start; }

        /* ── Perks strip ── */
        .perks-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
        .perk-item {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 18px 12px; background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; text-align: center;
          transition: border-color 0.2s, transform 0.2s;
        }
        .perk-item:hover { border-color: rgba(254,216,0,0.2); transform: translateY(-2px); }
        .perk-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2); display: flex; align-items: center; justify-content: center; }
        .perk-title { font-size: 12px; font-weight: 700; color: var(--t1); }
        .perk-desc  { font-size: 11px; color: var(--t3); line-height: 1.4; }

        /* ── Gift card visual ── */
        .giftcard-visual {
          background: linear-gradient(135deg, #FED800 0%, #E8C400 100%);
          border-radius: 20px; padding: 32px; margin-bottom: 20px;
          position: relative; overflow: hidden; aspect-ratio: 1.6;
          box-shadow: 0 24px 60px rgba(254,216,0,0.2), 0 8px 24px rgba(0,0,0,0.4);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .giftcard-visual:hover { transform: translateY(-3px); box-shadow: 0 32px 72px rgba(254,216,0,0.28), 0 12px 32px rgba(0,0,0,0.5); }
        .card-bubble-1 { position: absolute; top: -50px; right: -50px; width: 220px; height: 220px; border-radius: 50%; background: rgba(0,0,0,0.07); }
        .card-bubble-2 { position: absolute; bottom: -70px; left: -30px; width: 200px; height: 200px; border-radius: 50%; background: rgba(0,0,0,0.04); }
        .card-chip { position: absolute; top: 20px; right: 24px; width: 42px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.08); }
        .card-inner { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
        .card-header { display: flex; align-items: center; gap: 8px; }
        .card-eyebrow { font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.5); letter-spacing: 2.5px; text-transform: uppercase; }
        .card-amount { font-family: var(--font-head); color: #000; line-height: 1; font-size: clamp(44px, 6vw, 60px); }
        .card-footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-address { font-size: 11px; color: rgba(0,0,0,0.45); }
        .card-wordmark { font-family: var(--font-head); font-size: 26px; color: rgba(0,0,0,0.18); letter-spacing: 2px; }

        /* ── Amount selector ── */
        .amount-box { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .amount-box-title { font-family: var(--font-head); font-size: 18px; letter-spacing: 1px; color: var(--t1); margin-bottom: 16px; }
        .amount-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .amount-preset-btn {
          padding: 13px 8px; border-radius: 10px; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; font-family: var(--font-body); border: 1px solid;
        }
        .amount-preset-btn.active { background: var(--y); color: #000; border-color: var(--y); }
        .amount-preset-btn.inactive { background: #0A0A0A; color: var(--t3); border-color: #2A2A2A; }
        .amount-preset-btn.inactive:hover { border-color: rgba(254,216,0,0.3); color: var(--t2); }
        .amount-custom-label { font-size: 12px; font-weight: 700; color: var(--t2); display: block; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .amount-custom-input {
          width: 100%; padding: 12px 16px; background: #0A0A0A;
          border: 1px solid #2A2A2A; border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none; font-family: var(--font-body);
          transition: border-color 0.15s;
        }
        .amount-custom-input:focus { border-color: var(--y); }
        .amount-custom-input::placeholder { color: var(--t3); }

        /* ── Form wrap ── */
        .form-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: 18px; padding: 32px; }
        .form-header { display: flex; align-items: center; gap: 14px; margin-bottom: 26px; padding-bottom: 22px; border-bottom: 1px solid var(--border); }
        .form-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .form-title    { font-family: var(--font-head); font-size: 24px; letter-spacing: 1px; color: var(--t1); margin: 0 0 3px; line-height: 1; }
        .form-subtitle { font-size: 13px; color: var(--t2); margin: 0; }
        .form-fields   { display: flex; flex-direction: column; gap: 14px; }
        .form-label    { font-size: 12px; font-weight: 700; color: var(--t2); display: block; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input {
          width: 100%; padding: 13px 16px; background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1); font-size: 14px; outline: none;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-input:focus { border-color: var(--y); }
        .form-input::placeholder { color: var(--t3); }
        .form-textarea {
          width: 100%; padding: 13px 16px; background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1); font-size: 14px; outline: none;
          resize: none; height: 90px;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-textarea:focus { border-color: var(--y); }
        .form-textarea::placeholder { color: var(--t3); }

        /* ── Order summary row ── */
        .order-summary {
          padding: 16px 18px; background: #0D0D0D;
          border-radius: 12px; border: 1px solid rgba(254,216,0,0.15);
          display: flex; justify-content: space-between; align-items: center;
        }
        .order-summary-label { font-size: 13px; color: var(--t2); }
        .order-summary-value { font-family: var(--font-head); font-size: 26px; letter-spacing: 1px; color: var(--y); }

        /* ── Submit btn ── */
        .form-submit-btn {
          width: 100%; padding: 16px; border-radius: 12px; font-size: 15px;
          font-weight: 800; cursor: pointer; border: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body); transition: transform 0.15s, box-shadow 0.15s;
        }
        .form-submit-btn.enabled { background: var(--y); color: #000; }
        .form-submit-btn.enabled:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(254,216,0,0.25); }
        .form-submit-btn.disabled { background: var(--bg3); color: var(--t3); cursor: not-allowed; }

        /* ── Success card ── */
        .success-card {
          padding: 60px 36px; background: var(--bg2);
          border: 1px solid rgba(34,197,94,0.2); border-radius: 18px; text-align: center;
        }
        .success-icon-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(34,197,94,0.08); border: 2px solid var(--green);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        }
        .success-title { font-family: var(--font-head); font-size: clamp(28px, 5vw, 38px); letter-spacing: 1px; color: var(--t1); margin-bottom: 14px; line-height: 1; }
        .success-amount { color: var(--y); font-weight: 800; }
        .success-email  { font-family: var(--font-head); font-size: 20px; letter-spacing: 1px; color: var(--y); margin: 6px 0 16px; }
        .success-note   { font-size: 12px; color: var(--t3); margin-bottom: 32px; }
        .success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 14px; color: var(--t1); margin-bottom: 11px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
        .footer-link:hover { color: var(--y); padding-left: 4px; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .giftcard-grid { grid-template-columns: 1fr; gap: 36px; }
          .footer-grid   { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand  { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .form-wrap     { padding: 24px 18px; }
          .success-card  { padding: 40px 24px; }
        }
        @media (max-width: 480px) {
          .container       { padding: 0 14px; }
          .perks-strip     { grid-template-columns: 1fr; }
          .amount-presets  { grid-template-columns: repeat(2, 1fr); }
          .success-actions { flex-direction: column; align-items: center; }
          .success-actions .btn-yellow,
          .success-actions .btn-outline { width: 100%; justify-content: center; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .perk-item, .giftcard-visual, .btn-yellow, .btn-outline, .form-submit-btn { transition: none; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="giftcards-hero" style={{ padding: '110px 0 80px', background: '#000', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #141414' }}>

        <div className="hero-glow" style={{ position: 'absolute', top: '-100px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,216,0,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        <div className="hero-glow-left" style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,3,1,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container hero-container" style={{ position: 'relative', textAlign: 'center' }}>
          <span id="hero-label" className="sec-label">Gift Cards</span>
          <h1 id="hero-title" className="bebas" style={{ fontSize: 'clamp(52px, 9vw, 80px)', color: '#ffffff', lineHeight: '0.93', marginBottom: '22px' }}>
            GIVE THE GIFT <span style={{ color: '#FED800' }}>OF BREAKFAST</span>
          </h1>
          <p id="hero-subtitle" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#ffffff', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto 40px' }}>
            Share the love with an Eggs Ok gift card. Perfect for friends, family, and coworkers who deserve a great meal.
          </p>
          <div id="hero-cta" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a id="hero-buy-btn" href="#buy" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 34px' }}>
              Buy a Gift Card <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a id="hero-redeem-btn" href="#buy" className="btn-outline" style={{ fontSize: '16px', padding: '16px 34px' }}>
              Redeem a Card
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN — Card + Form
      ══════════════════════════════════════════ */}
      <section id="buy" style={{ padding: '88px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div id="giftcard-grid" className="giftcard-grid">

            {/* ── LEFT — Visual + Amount ── */}
            <div id="giftcard-left">

              {/* Section header */}
              <div id="giftcard-left-header" style={{ marginBottom: '28px' }}>
                <span className="sec-label">Choose Amount</span>
                <h2 id="amount-heading" className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#ffffff', lineHeight: '0.95' }}>
                  PICK YOUR <span style={{ color: '#FED800' }}>VALUE</span>
                </h2>
              </div>

              {/* Perks strip */}
              <div id="perks-strip" className="perks-strip" role="list" aria-label="Gift card benefits">
                {perks.map((p, i) => (
                  <div key={i} id={`perk-${i}`} className="perk-item" role="listitem">
                    <div className="perk-icon" aria-hidden="true">
                      <p.icon size={20} color="#FED800" strokeWidth={2} />
                    </div>
                    <p className="perk-title">{p.title}</p>
                    <p className="perk-desc">{p.desc}</p>
                  </div>
                ))}
              </div>

              {/* Gift Card Visual */}
              <div id="giftcard-visual" className="giftcard-visual" aria-label={`Gift card preview — $${finalAmount > 0 ? finalAmount : 0}`}>
                <div className="card-bubble-1" aria-hidden="true" />
                <div className="card-bubble-2" aria-hidden="true" />
                <div className="card-chip" aria-hidden="true" />
                <div id="card-inner" className="card-inner">
                  <div id="card-top">
                    <div id="card-header" className="card-header">
                      <Gift size={16} color="rgba(0,0,0,0.45)" strokeWidth={2.5} aria-hidden="true" />
                      <p className="card-eyebrow">Eggs Ok Gift Card</p>
                    </div>
                    <p id="card-amount" className="card-amount">
                      ${finalAmount > 0 ? finalAmount : '00'}
                    </p>
                  </div>
                  <div id="card-footer" className="card-footer">
                    <p className="card-address">3517 Lancaster Ave · Philadelphia PA</p>
                    <p className="card-wordmark">EGGS OK</p>
                  </div>
                </div>
              </div>

              {/* Amount selector */}
              <div id="amount-box" className="amount-box">
                <p id="amount-box-title" className="amount-box-title">SELECT AMOUNT</p>

                <div id="amount-presets" className="amount-presets" role="group" aria-label="Preset gift card amounts">
                  {presetAmounts.map(a => (
                    <button
                      key={a}
                      id={`preset-${a}`}
                      className={`amount-preset-btn ${amount === a && !customAmount ? 'active' : 'inactive'}`}
                      onClick={() => { setAmount(a); setCustomAmount(''); }}
                      aria-pressed={amount === a && !customAmount}
                    >
                      ${a}
                    </button>
                  ))}
                </div>

                <div id="amount-custom-group">
                  <label htmlFor="amount-custom-input" className="amount-custom-label">Custom Amount ($)</label>
                  <input
                    id="amount-custom-input"
                    type="number" min="5" max="500"
                    className="amount-custom-input"
                    placeholder="Enter amount (min $5)"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
                  />
                </div>
              </div>

            </div>

            {/* ── RIGHT — Form ── */}
            <div id="giftcard-right">
              {submitted ? (
                <div id="success-card" className="success-card">
                  <div id="success-icon" className="success-icon-wrap" aria-hidden="true">
                    <Check size={36} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 id="success-title" className="success-title">GIFT CARD SENT!</h3>
                  <p id="success-msg-line1" style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>
                    A <span className="success-amount">${finalAmount}</span> gift card has been sent to
                  </p>
                  <p id="success-email" className="success-email">{recipientEmail}</p>
                  <p id="success-note" className="success-note">
                    Note: Gift cards will be fully activated once backend payment is connected.
                  </p>
                  <div id="success-actions" className="success-actions">
                    <button
                      id="success-another-btn"
                      className="btn-outline"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another
                    </button>
                    <Link id="success-home-btn" href="/" className="btn-yellow">
                      Back to Home <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div id="giftcard-form-wrap" className="form-wrap">

                  {/* Form header */}
                  <div id="form-header" className="form-header">
                    <div id="form-icon" className="form-icon" aria-hidden="true">
                      <Send size={22} color="#FED800" strokeWidth={2} />
                    </div>
                    <div id="form-header-text">
                      <h2 id="form-title" className="form-title">GIFT CARD DETAILS</h2>
                      <p id="form-subtitle" className="form-subtitle">Fill out who this is for</p>
                    </div>
                  </div>

                  <form id="giftcard-form" className="form-fields" onSubmit={handleSubmit} noValidate>

                    {/* Recipient Name */}
                    <div id="form-group-recipient-name">
                      <label htmlFor="input-recipient-name" className="form-label">Recipient Name *</label>
                      <input
                        id="input-recipient-name"
                        className="form-input"
                        placeholder="Who is this for?"
                        required
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                      />
                    </div>

                    {/* Recipient Email */}
                    <div id="form-group-recipient-email">
                      <label htmlFor="input-recipient-email" className="form-label">Recipient Email *</label>
                      <input
                        id="input-recipient-email"
                        type="email"
                        className="form-input"
                        placeholder="Their email address"
                        required
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                      />
                    </div>

                    {/* Sender Name */}
                    <div id="form-group-sender-name">
                      <label htmlFor="input-sender-name" className="form-label">Your Name *</label>
                      <input
                        id="input-sender-name"
                        className="form-input"
                        placeholder="From who?"
                        required
                        value={senderName}
                        onChange={e => setSenderName(e.target.value)}
                      />
                    </div>

                    {/* Message */}
                    <div id="form-group-message">
                      <label htmlFor="input-message" className="form-label">Personal Message (optional)</label>
                      <textarea
                        id="input-message"
                        className="form-textarea"
                        placeholder="Add a personal note..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                      />
                    </div>

                    {/* Order summary */}
                    <div id="order-summary" className="order-summary">
                      <p className="order-summary-label">Gift card value</p>
                      <p id="order-summary-value" className="order-summary-value">
                        ${finalAmount > 0 ? finalAmount : 0}
                      </p>
                    </div>

                    {submitError && <p style={{ color: '#FC0301', fontSize: '13px', margin: '0 0 8px' }}>{submitError}</p>}

                    {/* Submit */}
                    <button
                      id="form-submit-btn"
                      type="submit"
                      disabled={finalAmount <= 0 || submitting}
                      className={`form-submit-btn ${finalAmount > 0 && !submitting ? 'enabled' : 'disabled'}`}
                      style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      <Gift size={18} strokeWidth={2.5} aria-hidden="true" />
                      {submitting ? 'Sending...' : `Purchase Gift Card · $${finalAmount > 0 ? finalAmount : 0}`}
                    </button>

                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="giftcards-footer" className="site-footer" style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
        <div className="container footer-container">
          <div id="footer-grid" className="footer-grid">

            {/* Brand */}
            <div id="footer-brand" className="footer-brand">
              <div id="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div id="footer-logo-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={100} height={50} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p id="footer-tagline" style={{ fontSize: '14px', color: '#ffffff', lineHeight: '1.75', maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address id="footer-address" style={{ fontStyle: 'normal' }}>
                <p id="footer-address-line" style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#FED800" aria-hidden="true" />
                  <a id="footer-address-link" href="https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104" style={{ color: '#ffffff', textDecoration: 'none' }}>
                    3517 Lancaster Ave, Philadelphia PA 19104
                  </a>
                </p>
                <p id="footer-phone-line" style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#FED800" aria-hidden="true" />
                  <a id="footer-phone-link" href="tel:2159489902" style={{ color: '#ffffff', textDecoration: 'none' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            {/* Quick links */}
            <nav id="footer-nav" aria-label="Quick links">
              <p id="footer-nav-heading" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
              {[
                { label: 'Home',          href: '/'           },
                { label: 'Order Online',  href: '/order'      },
                { label: 'Catering',      href: '/catering'   },
                { label: 'Our Story',     href: '/story'      },
                { label: 'Gift Cards',    href: '/gift-cards' },
                { label: 'Contact',       href: '/contact'    },
              ].map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>

            {/* Hours */}
            <div id="footer-hours">
              <p id="footer-hours-heading" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div id="footer-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { day: 'Monday',    hours: '8:00 AM – 10:00 PM' },
                  { day: 'Tuesday',   hours: '8:00 AM – 10:00 PM' },
                  { day: 'Wednesday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Thursday',  hours: '8:00 AM – 10:00 PM' },
                  { day: 'Friday',    hours: '8:00 AM – 10:00 PM' },
                  { day: 'Saturday',  hours: '9:00 AM – 11:00 PM' },
                  { day: 'Sunday',    hours: '9:00 AM – 9:00 PM'  },
                ].map((h, i) => (
                  <div key={i} id={`footer-hours-row-${i}`} style={{ display: 'flex', gap: '14px' }}>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', minWidth: '96px' }}>{h.day}</span>
                    <span style={{ fontSize: '13px', color: '#BBBBBB' }}>{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div id="footer-bottom" className="footer-bottom">
            <p id="footer-copyright" style={{ fontSize: '13px', color: '#ffffff' }}>
              &copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.
            </p>
            <p id="footer-credit" style={{ fontSize: '13px', color: '#ffffff' }}>
              {/* Built by <span id="footer-credit-brand" style={{ color: '#FED800' }}>RestoRise Business Solutions</span> */}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}