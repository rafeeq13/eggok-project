'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  Gift,
  Send,
  Check,
  MapPin,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Infinity,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#111111', border: '1px solid #1A1A1A',
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

  const perks = [
    { icon: ShieldCheck, text: 'Never expires' },
    { icon: RefreshCw,   text: 'Reloadable anytime' },
    { icon: Infinity,    text: 'Use for any order' },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── RESPONSIVE STYLES (homepage reference pattern) ── */}
      <style>{`
        /* ── BASE ── */
        .giftcard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: flex-start;
        }
        .perks-row {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
        }
        .perk-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: #111111;
          border: 1px solid #1A1A1A;
          border-radius: 12px;
          text-align: center;
        }
        .success-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 20px;
        }
        .footer-bottom {
          border-top: 1px solid #1A1A1A;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-link {
          display: block;
          font-size: 14px;
          color: #888888;
          margin-bottom: 10px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-link:hover { color: #FED800; }

        /* ── TABLET (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ── MOBILE (≤ 768px) ── */
        @media (max-width: 768px) {
          .giftcard-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hero-section { padding: 48px 0 40px !important; }
          .section-pad  { padding: 56px 0 !important; }
          .footer-grid  { grid-template-columns: 1fr; gap: 32px; }
          .footer-brand { grid-column: unset; }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .perks-row { flex-direction: column; }
          .success-actions { flex-direction: column; }
          .success-actions a,
          .success-actions button { width: 100%; text-align: center; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, #000 0%, #1A1100 100%)',
        borderBottom: '1px solid #1A1A1A',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80015 0%, transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Gift Cards</p>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 70px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px' }}>
            GIVE THE GIFT <span style={{ color: '#FED800' }}>OF BREAKFAST</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#888888',lineHeight: '1.7' }}>
            Share the love with an Eggs Ok gift card. Perfect for friends, family, and coworkers who deserve a great meal.
          </p>
        </div>
      </section>

      {/* ── MAIN ── */}
      <section className="section-pad" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="giftcard-grid">

            {/* ── LEFT — Card visual + amount selector ── */}
            <div>
              {/* Perks strip */}
              <div className="perks-row">
                {perks.map((p, i) => (
                  <div key={i} className="perk-item">
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p.icon size={20} color="#FED800" strokeWidth={2} />
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#CACACA' }}>{p.text}</p>
                  </div>
                ))}
              </div>

              {/* Card Visual */}
              <div style={{
                background: 'linear-gradient(135deg, #FED800 0%, #E5C200 100%)',
                borderRadius: '20px', padding: '32px', marginBottom: '24px',
                position: 'relative', overflow: 'hidden',
                aspectRatio: '1.6' as unknown as undefined,
                boxShadow: '0 20px 60px #FED80030',
              }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Gift size={18} color="#00000060" strokeWidth={2.5} />
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#00000060', letterSpacing: '2px', textTransform: 'uppercase' }}>Eggs Ok Gift Card</p>
                    </div>
                    <p style={{ fontSize: 'clamp(40px, 6vw, 56px)', fontFamily: 'Bebas Neue, sans-serif', color: '#000', lineHeight: '1' }}>
                      ${finalAmount > 0 ? finalAmount : '00'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: '12px', color: '#00000060' }}>3517 Lancaster Ave · Philadelphia PA</p>
                    <p style={{ fontSize: '24px', fontFamily: 'Bebas Neue, sans-serif', color: '#00000030', letterSpacing: '2px' }}>EGGS OK</p>
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '14px' }}>Select Amount</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {presetAmounts.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }} style={{
                      padding: '12px', borderRadius: '10px', fontSize: '16px', fontWeight: '700',
                      background: amount === a && !customAmount ? '#FED800' : '#0A0A0A',
                      color: amount === a && !customAmount ? '#000' : '#888888',
                      border: `1px solid ${amount === a && !customAmount ? '#FED800' : '#1A1A1A'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>${a}</button>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Custom Amount ($)</label>
                  <input
                    type="number" min="5" max="500"
                    style={{ ...inputStyle, background: '#0A0A0A' }}
                    placeholder="Enter amount (min $5)"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                  />
                </div>
              </div>
            </div>

            {/* ── RIGHT — Form ── */}
            <div>
              {submitted ? (
                <div style={{ padding: '60px 32px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Check size={32} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(22px, 5vw, 28px)', color: '#FEFEFE', marginBottom: '12px' }}>GIFT CARD SENT!</h3>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '6px' }}>
                    A <span style={{ color: '#FED800', fontWeight: '700' }}>${finalAmount}</span> gift card has been sent to
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#FED800', marginBottom: '20px' }}>{recipientEmail}</p>
                  <p style={{ fontSize: '13px', color: '#555555', marginBottom: '28px' }}>
                    Note: Gift cards will be fully activated once backend payment is connected.
                  </p>
                  <div className="success-actions">
                    <button onClick={() => setSubmitted(false)} style={{ padding: '11px 20px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>
                      Send Another
                    </button>
                    <Link href="/" style={{ padding: '11px 20px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: '700', display: 'inline-block' }}>
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '28px' }}>
                  {/* Form Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Send size={20} color="#FED800" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontFamily: 'Bebas Neue, sans-serif', color: '#FEFEFE', letterSpacing: '1px', margin: 0 }}>GIFT CARD DETAILS</h2>
                      <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>Fill out who this is for</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Recipient Name *</label>
                      <input style={inputStyle} placeholder="Who is this for?" required
                        value={recipientName} onChange={e => setRecipientName(e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Recipient Email *</label>
                      <input type="email" style={inputStyle} placeholder="Their email address" required
                        value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Your Name *</label>
                      <input style={inputStyle} placeholder="From who?" required
                        value={senderName} onChange={e => setSenderName(e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Personal Message (optional)</label>
                      <textarea
                        style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                        placeholder="Add a personal note..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
                        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1A1A1A'}
                      />
                    </div>

                    {/* Order summary */}
                    <div style={{ padding: '14px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #FED80020', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#888888' }}>Gift card value</p>
                      <p style={{ color: '#FED800', fontWeight: '800', fontSize: '20px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                        ${finalAmount > 0 ? finalAmount : 0}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={finalAmount <= 0}
                      style={{
                        width: '100%', padding: '15px',
                        background: finalAmount > 0 ? '#FED800' : '#1A1A1A',
                        borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                        color: finalAmount > 0 ? '#000' : '#555555',
                        cursor: finalAmount > 0 ? 'pointer' : 'not-allowed',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }}>
                      <Gift size={18} strokeWidth={2.5} />
                      Purchase Gift Card · ${finalAmount > 0 ? finalAmount : 0}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0A0A', padding: '30px 0 32px', borderTop: '1px solid #1A1A1A' }}>
        <div className="container">
          <div className="footer-grid">

            {/* Brand */}
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={40} height={40} style={{ objectFit: 'contain' }} />
                </div>
                <p style={{ fontSize: '20px', fontFamily: 'Bebas Neue, sans-serif', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</p>
              </div>
              <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.7', maxWidth: '300px', marginBottom: '20px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <p style={{ fontSize: '13px', color: '#888888', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> 3517 Lancaster Ave, Philadelphia PA 19104
              </p>
              <p style={{ fontSize: '13px', color: '#888888', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={14} />
                <a href="tel:2159489902" style={{ color: '#888888' }}>215-948-9902</a>
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Links</p>
              {[
                { label: 'Home',         href: '/' },
                { label: 'Order Online', href: '/order' },
                { label: 'Catering',     href: '/catering' },
                { label: 'Our Story',    href: '/story' },
                { label: 'Gift Cards',   href: '/gift-cards' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="footer-link">{link.label}</Link>
              ))}
            </div>

            {/* Hours */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Hours</p>
              {[
                { day: 'Mon – Fri', hours: '8:00 AM – 10:00 PM' },
                { day: 'Saturday',  hours: '9:00 AM – 11:00 PM' },
                { day: 'Sunday',    hours: '9:00 AM – 9:00 PM' },
              ].map((h, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '500' }}>{h.day}</p>
                  <p style={{ fontSize: '12px', color: '#888888' }}>{h.hours}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '13px', color: '#888888' }}>© 2026 Eggs Ok. All rights reserved.</p>
            <p style={{ fontSize: '13px', color: '#888888' }}>Built by <span style={{ color: '#FED800' }}>RestoRise Business Solutions</span></p>
          </div>
        </div>
      </footer>

    </div>
  );
}