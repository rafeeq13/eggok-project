'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  ChefHat, Truck, SlidersHorizontal, ClipboardList,
  Lightbulb, UtensilsCrossed, MapPin, Smartphone,
  ArrowRight, Check, Phone,
} from 'lucide-react';

export default function CateringPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', eventDate: '',
    eventType: '', guestCount: '', location: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const packages = [
    {
      name: 'Breakfast Box',
      price: 'From $12/person',
      minGuests: '10',
      color: '#FED800',
      items: ['Choice of 2 Breakfast Sandwiches', 'Hash Browns', 'Fresh Fruit Cup', 'Coffee or Juice'],
      popular: false,
    },
    {
      name: 'Full Brunch',
      price: 'From $22/person',
      minGuests: '20',
      color: '#FC0301',
      items: ['Choice of 3 Breakfast Items', 'Omelette Station', 'Pancakes & Waffles', 'Specialty Drinks', 'Fresh Fruit & Pastries'],
      popular: true,
    },
    {
      name: 'Corporate Package',
      price: 'Custom Pricing',
      minGuests: '50+',
      color: '#22C55E',
      items: ['Full Menu Access', 'Dedicated Server', 'Setup & Cleanup', 'Custom Branding Options', 'Invoice & Receipt'],
      popular: false,
    },
  ];

  const whyItems = [
    { icon: ChefHat,           title: 'Made Fresh',   desc: 'Every item prepared fresh on the day of your event' },
    { icon: Truck,             title: 'We Deliver',   desc: 'Free delivery within 5 miles for orders over $200' },
    { icon: SlidersHorizontal, title: 'Customizable', desc: 'Build your own menu from our full selection'        },
    { icon: ClipboardList,     title: 'Easy Setup',   desc: 'We handle setup, serving, and cleanup'             },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="catering-page" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

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
          font-family: var(--font-body);
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

        /* ── Why grid ── */
        .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        /* ── Why card ── */
        .why-card {
          padding: 28px 24px; background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; text-align: center;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s;
        }
        .why-card:hover { border-color: rgba(254,216,0,0.2); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
        .why-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .why-title { font-family: var(--font-head); font-size: 20px; letter-spacing: 1px; color: var(--t1); margin-bottom: 8px; }
        .why-desc  { font-size: 13px; color: var(--t2); line-height: 1.6; }

        /* ── Packages grid ── */
        .packages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }

        /* ── Package card ── */
        .pkg-card { background: var(--bg2); border-radius: 18px; overflow: hidden; position: relative; transition: transform 0.25s, box-shadow 0.25s; }
        .pkg-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.5); }
        .pkg-popular-bar { padding: 9px; text-align: center; font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #000; }
        .pkg-body { padding: 28px 26px; }
        .pkg-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .pkg-name { font-family: var(--font-head); font-size: clamp(22px, 3vw, 30px); letter-spacing: 1px; color: var(--t1); margin-bottom: 6px; line-height: 1; }
        .pkg-price { font-family: var(--font-head); font-size: 22px; letter-spacing: 1px; margin-bottom: 4px; }
        .pkg-min-guests { font-size: 12px; color: var(--t3); margin-bottom: 22px; font-weight: 500; }
        .pkg-items { display: flex; flex-direction: column; gap: 9px; margin-bottom: 26px; }
        .pkg-item { display: flex; align-items: center; gap: 10px; }
        .pkg-item-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pkg-item-text { font-size: 13px; color: var(--t2); }
        .pkg-cta {
          display: block; width: 100%; padding: 13px;
          border-radius: 10px; text-align: center;
          font-size: 14px; font-weight: 700;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          font-family: var(--font-body); cursor: pointer;
          text-decoration: none;
        }
        .pkg-cta-solid:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        .pkg-cta-outline:hover { filter: brightness(1.2); }

        /* ── Tip banner ── */
        .tip-banner {
          display: flex; align-items: center; gap: 18px;
          padding: 22px 28px; background: var(--bg2);
          border: 1px solid rgba(254,216,0,0.15); border-radius: 14px;
        }
        .tip-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tip-text { font-size: 14px; color: var(--t2); line-height: 1.7; }
        .tip-link { color: var(--y); font-weight: 700; text-decoration: none; }
        .tip-link:hover { text-decoration: underline; }

        /* ── Form section ── */
        .form-wrap {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 18px; padding: 36px;
        }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-label { font-size: 12px; font-weight: 700; color: var(--t2); display: block; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input {
          width: 100%; padding: 13px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-input:focus { border-color: var(--y); }
        .form-input::placeholder { color: var(--t3); }
        .form-select {
          width: 100%; padding: 13px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none; cursor: pointer;
          transition: border-color 0.15s; font-family: var(--font-body);
          appearance: none;
        }
        .form-select:focus { border-color: var(--y); }
        .form-textarea {
          width: 100%; padding: 13px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none; resize: none; height: 110px;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-textarea:focus { border-color: var(--y); }
        .form-textarea::placeholder { color: var(--t3); }
        .form-submit-btn {
          width: 100%; padding: 16px; background: var(--y);
          border-radius: 12px; font-size: 16px; font-weight: 800;
          color: #000; cursor: pointer; border: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .form-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(254,216,0,0.25); }

        /* ── Success card ── */
        .success-card {
          padding: 56px 36px; background: var(--bg2);
          border: 1px solid rgba(34,197,94,0.2); border-radius: 18px; text-align: center;
        }
        .success-icon-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(34,197,94,0.08); border: 2px solid var(--green);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        }
        .success-title { font-family: var(--font-head); font-size: clamp(28px, 5vw, 38px); letter-spacing: 1px; color: var(--t1); margin-bottom: 14px; line-height: 1; }
        .success-msg { font-size: 15px; color: var(--t2); line-height: 1.75; margin-bottom: 32px; }
        .success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── Phone CTA ── */
        .phone-cta-section {
          padding: 72px 0; background: #060606;
          border-top: 1px solid #141414; text-align: center;
        }
        .phone-cta-number {
          font-family: var(--font-head);
          font-size: clamp(36px, 6vw, 64px);
          color: var(--y); letter-spacing: 3px; display: block;
          transition: color 0.15s;
        }
        .phone-cta-number:hover { color: #e8c400; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 14px; color: var(--t1); margin-bottom: 11px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
        .footer-link:hover { color: var(--y); padding-left: 4px; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .why-grid      { grid-template-columns: repeat(2, 1fr); }
          .packages-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid   { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand  { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .packages-grid { grid-template-columns: 1fr; }
          .form-row-2    { grid-template-columns: 1fr; }
          .form-wrap     { padding: 24px 18px; }
          .tip-banner    { flex-direction: column; align-items: flex-start; gap: 12px; padding: 18px 20px; }
          .footer-grid   { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand  { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .success-actions { flex-direction: column; align-items: center; }
        }
        @media (max-width: 480px) {
          .container  { padding: 0 14px; }
          .why-grid   { grid-template-columns: 1fr; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .why-card, .pkg-card, .btn-yellow, .btn-outline, .form-submit-btn { transition: none; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="catering-hero" style={{ padding: '110px 0 80px', background: '#000', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #141414' }}>

        <div className="hero-glow" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,216,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        <div className="hero-glow-bottom" style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,3,1,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container hero-container" style={{ position: 'relative', textAlign: 'center' }}>
          <span id="hero-label" className="sec-label">Catering Services</span>
          <h1 id="hero-title" className="bebas" style={{ fontSize: 'clamp(52px, 9vw, 80px)', color: '#ffffff', lineHeight: '0.93', marginBottom: '24px' }}>
            FEED YOUR <span style={{ color: '#FED800' }}>WHOLE CREW</span>
          </h1>
          <p id="hero-subtitle" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#ffffff', lineHeight: '1.8', maxWidth: '520px', margin: '0 auto 40px' }}>
            From office breakfasts to special events — Eggs Ok caters for groups of all sizes. Fresh, made-to-order food delivered to your door.
          </p>
          <div id="hero-cta" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a id="hero-packages-btn" href="#packages" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 34px' }}>
              View Packages <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a id="hero-quote-btn" href="#contact" className="btn-outline" style={{ fontSize: '16px', padding: '16px 34px' }}>
              Get a Quote
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section id="why-us" style={{ padding: '88px 0', background: '#0A0A0A' }}>
        <div className="container why-container">

          <div id="why-header" style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Why Eggs Ok</span>
            <h2 id="why-heading" className="sec-heading">
              THE <span className="accent">DIFFERENCE</span>
            </h2>
          </div>

          <div id="why-grid" className="why-grid" role="list" aria-label="Why choose Eggs Ok catering">
            {whyItems.map((item, i) => (
              <div key={i} id={`why-card-${i}`} className="why-card" role="listitem">
                <div className="why-icon" aria-hidden="true">
                  <item.icon size={26} color="#FED800" strokeWidth={2} />
                </div>
                <p className="why-title">{item.title}</p>
                <p className="why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PACKAGES
      ══════════════════════════════════════════ */}
      <section id="packages" style={{ padding: '88px 0', background: '#000' }}>
        <div className="container packages-container">

          <div id="packages-header" style={{ marginBottom: '52px' }}>
            <span className="sec-label">Catering Packages</span>
            <h2 id="packages-heading" className="sec-heading">
              CHOOSE YOUR <span className="accent">PACKAGE</span>
            </h2>
          </div>

          <div id="packages-grid" className="packages-grid" role="list" aria-label="Catering packages">
            {packages.map((pkg, i) => (
              <div key={i} id={`pkg-card-${i}`} className="pkg-card" style={{ border: `1px solid ${pkg.popular ? pkg.color + '50' : '#1E1E1E'}` }} role="listitem">

                {pkg.popular && (
                  <div id={`pkg-popular-bar-${i}`} className="pkg-popular-bar" style={{ background: pkg.color }}>
                    ★ MOST POPULAR
                  </div>
                )}

                <div className="pkg-body">
                  <div id={`pkg-icon-${i}`} className="pkg-icon" style={{ background: `${pkg.color}15`, border: `1px solid ${pkg.color}30` }}>
                    <UtensilsCrossed size={24} color={pkg.color} strokeWidth={2} />
                  </div>
                  <h3 id={`pkg-name-${i}`} className="pkg-name">{pkg.name.toUpperCase()}</h3>
                  <p id={`pkg-price-${i}`} className="pkg-price" style={{ color: pkg.color }}>{pkg.price}</p>
                  <p id={`pkg-guests-${i}`} className="pkg-min-guests">Minimum {pkg.minGuests} guests</p>

                  <ul id={`pkg-items-${i}`} className="pkg-items" aria-label={`${pkg.name} includes`}>
                    {pkg.items.map((item, j) => (
                      <li key={j} id={`pkg-item-${i}-${j}`} className="pkg-item">
                        <div className="pkg-item-check" style={{ background: `${pkg.color}15`, border: `1px solid ${pkg.color}40` }} aria-hidden="true">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={pkg.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span className="pkg-item-text">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    id={`pkg-cta-${i}`}
                    href="#contact"
                    className={`pkg-cta ${pkg.popular ? 'pkg-cta-solid' : 'pkg-cta-outline'}`}
                    style={pkg.popular
                      ? { background: pkg.color, color: '#000', border: `2px solid ${pkg.color}` }
                      : { background: 'transparent', color: pkg.color, border: `2px solid ${pkg.color}` }
                    }
                  >
                    Request This Package
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Tip banner */}
          <div id="tip-banner" className="tip-banner">
            <div id="tip-icon" className="tip-icon" aria-hidden="true">
              <Lightbulb size={20} color="#FED800" strokeWidth={2} />
            </div>
            <p id="tip-text" className="tip-text">
              Need something custom? We can build a catering menu specifically for your event. Call us at{' '}
              <a href="tel:2673707993" className="tip-link">267-370-7993</a>{' '}
              or fill out the form below.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT FORM
      ══════════════════════════════════════════ */}
      <section id="contact" style={{ padding: '88px 0', background: '#0A0A0A' }}>
        <div className="container contact-container">
          <div id="contact-inner" style={{ maxWidth: '700px', margin: '0 auto' }}>

            <div id="contact-header" style={{ marginBottom: '44px' }}>
              <span className="sec-label">Get A Quote</span>
              <h2 id="contact-heading" className="sec-heading">
                LET&apos;S PLAN YOUR <span className="accent">EVENT</span>
              </h2>
              <p id="contact-subtitle" style={{ fontSize: '15px', color: '#ffffff', marginTop: '14px', lineHeight: '1.7' }}>
                Fill out the form below and we will get back to you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div id="success-card" className="success-card">
                <div id="success-icon" className="success-icon-wrap" aria-hidden="true">
                  <Check size={36} color="#22C55E" strokeWidth={2.5} />
                </div>
                <h3 id="success-title" className="success-title">REQUEST SENT!</h3>
                <p id="success-msg" className="success-msg">
                  Thank you, {formData.name}! We received your catering request.<br />
                  Our team will contact you at{' '}
                  <span style={{ color: '#FED800' }}>{formData.email}</span>{' '}
                  within 24 hours.
                </p>
                <div id="success-actions" className="success-actions">
                  <button
                    id="success-resubmit-btn"
                    className="btn-outline"
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', eventDate: '', eventType: '', guestCount: '', location: '', message: '' }); }}
                  >
                    Submit Another
                  </button>
                  <Link id="success-home-btn" href="/" className="btn-yellow">
                    Back to Home <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : (
              <form id="catering-form" className="form-wrap" onSubmit={handleSubmit} noValidate>
                <div id="form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Name + Phone */}
                  <div id="form-row-name-phone" className="form-row-2">
                    <div id="form-group-name">
                      <label htmlFor="input-name" className="form-label">Full Name *</label>
                      <input id="input-name" className="form-input" placeholder="John Smith" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div id="form-group-phone">
                      <label htmlFor="input-phone" className="form-label">Phone Number *</label>
                      <input id="input-phone" type="tel" className="form-input" placeholder="215-555-0100" required
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>

                  {/* Email */}
                  <div id="form-group-email">
                    <label htmlFor="input-email" className="form-label">Email Address *</label>
                    <input id="input-email" type="email" className="form-input" placeholder="john@company.com" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  {/* Date + Guests */}
                  <div id="form-row-date-guests" className="form-row-2">
                    <div id="form-group-date">
                      <label htmlFor="input-date" className="form-label">Event Date *</label>
                      <input id="input-date" type="date" className="form-input" required
                        style={{ colorScheme: 'dark' } as React.CSSProperties}
                        value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />
                    </div>
                    <div id="form-group-guests">
                      <label htmlFor="input-guests" className="form-label">Number of Guests *</label>
                      <select id="input-guests" className="form-select" required
                        value={formData.guestCount} onChange={e => setFormData({ ...formData, guestCount: e.target.value })}>
                        <option value="">Select</option>
                        <option value="10-25">10–25 guests</option>
                        <option value="25-50">25–50 guests</option>
                        <option value="50-100">50–100 guests</option>
                        <option value="100+">100+ guests</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Type + Location */}
                  <div id="form-row-type-location" className="form-row-2">
                    <div id="form-group-type">
                      <label htmlFor="input-type" className="form-label">Event Type</label>
                      <select id="input-type" className="form-select"
                        value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                        <option value="">Select</option>
                        <option value="corporate">Corporate Breakfast</option>
                        <option value="wedding">Wedding / Brunch</option>
                        <option value="birthday">Birthday Party</option>
                        <option value="office">Office Meeting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div id="form-group-location">
                      <label htmlFor="input-location" className="form-label">Event Location</label>
                      <input id="input-location" className="form-input" placeholder="Address or venue name"
                        value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                  </div>

                  {/* Message */}
                  <div id="form-group-message">
                    <label htmlFor="input-message" className="form-label">Additional Details</label>
                    <textarea id="input-message" className="form-textarea"
                      placeholder="Tell us about your event, dietary restrictions, special requests..."
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                  </div>

                  {/* Submit */}
                  <button id="form-submit-btn" type="submit" className="form-submit-btn">
                    Submit Catering Request <ArrowRight size={16} aria-hidden="true" />
                  </button>

                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHONE CTA
      ══════════════════════════════════════════ */}
      <section id="phone-cta" className="phone-cta-section">
        <div className="container">
          <div id="phone-cta-icon" style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(254,216,0,0.08)', border: '1px solid rgba(254,216,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Phone size={24} color="#FED800" strokeWidth={2} aria-hidden="true" />
          </div>
          <p id="phone-cta-label" style={{ fontSize: '13px', color: '#ffffff', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Catering Hotline</p>
          <a id="phone-cta-number" href="tel:2673707993" className="phone-cta-number">267-370-7993</a>
          <p id="phone-cta-hours" style={{ fontSize: '13px', color: '#ffffff', marginTop: '12px' }}>Mon–Fri 8AM–6PM · Sat 9AM–4PM</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="catering-footer" className="site-footer" style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
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
                { label: 'Home',          href: '/'         },
                { label: 'Order Online',  href: '/order'    },
                { label: 'Catering',      href: '/catering' },
                { label: 'Our Story',     href: '/story'    },
                { label: 'Gift Cards',    href: '/gift-cards'},
                { label: 'Contact',       href: '/contact'  },
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
              Built by <span id="footer-credit-brand" style={{ color: '#FED800' }}>RestoRise Business Solutions</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}