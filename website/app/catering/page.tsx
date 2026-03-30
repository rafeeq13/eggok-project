'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  ChefHat,
  Truck,
  SlidersHorizontal,
  ClipboardList,
  Lightbulb,
  UtensilsCrossed,
  MapPin,
  Smartphone,
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
      items: [
        'Choice of 2 Breakfast Sandwiches',
        'Hash Browns',
        'Fresh Fruit Cup',
        'Coffee or Juice',
      ],
      popular: false,
    },
    {
      name: 'Full Brunch',
      price: 'From $22/person',
      minGuests: '20',
      color: '#FC0301',
      items: [
        'Choice of 3 Breakfast Items',
        'Omelette Station',
        'Pancakes & Waffles',
        'Specialty Drinks',
        'Fresh Fruit & Pastries',
      ],
      popular: true,
    },
    {
      name: 'Corporate Package',
      price: 'Custom Pricing',
      minGuests: '50+',
      color: '#22C55E',
      items: [
        'Full Menu Access',
        'Dedicated Server',
        'Setup & Cleanup',
        'Custom Branding Options',
        'Invoice & Receipt',
      ],
      popular: false,
    },
  ];

  const whyItems = [
    { icon: ChefHat,           title: 'Made Fresh',    desc: 'Every item prepared fresh on the day of your event' },
    { icon: Truck,             title: 'We Deliver',    desc: 'Free delivery within 5 miles for orders over $200' },
    { icon: SlidersHorizontal, title: 'Customizable',  desc: 'Build your own menu from our full selection' },
    { icon: ClipboardList,     title: 'Easy Setup',    desc: 'We handle setup, serving, and cleanup' },
  ];

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

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── RESPONSIVE STYLES (follows homepage reference pattern) ── */}
      <style>{`

        .hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .tip-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 28px;
          background: #111111;
          border: 1px solid #FED80030;
          border-radius: 12px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-wrap {
          background: #111111;
          border: 1px solid #1A1A1A;
          border-radius: 16px;
          padding: 32px;
        }

        .success-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ── FOOTER ── */
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

        /* ── TABLET (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .why-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .packages-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        /* ── MOBILE (≤ 768px) ── */
        @media (max-width: 768px) {
          .hero-section {
            padding: 48px 0 40px !important;
          }
          .section-pad {
            padding: 56px 0 !important;
          }
          .why-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .packages-grid {
            grid-template-columns: 1fr;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
          .tip-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding: 18px 20px;
          }
          .form-wrap {
            padding: 24px 16px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-brand {
            grid-column: unset;
          }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .why-grid {
            grid-template-columns: 1fr;
          }
          .hero-btns .btn-primary,
          .hero-btns .btn-secondary {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
          .success-actions {
            flex-direction: column;
          }
          .success-actions a,
          .success-actions button {
            width: 100%;
            text-align: center;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        padding: '40px 0',
        background: 'linear-gradient(135deg, #000 0%, #0A0A0A 60%, #1A1100 100%)',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, #FED80015 0%, transparent 70%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Catering Services</p>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 50px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px',justifyContent: 'center', display: 'flex', gap: '8px' }}>
            FEED YOUR <span style={{ color: '#FED800' }}>WHOLE CREW</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#888888', maxWidth: '520px', lineHeight: '1.7', marginBottom: '32px' ,display: 'flex', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            From office breakfasts to special events — Eggs Ok caters for groups of all sizes. Fresh, made-to-order food delivered to your door.
          </p>
          <div className="hero-btns">
            <a href="#packages" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
              View Packages
            </a>
            <a href="#contact" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
              Get a Quote
            </a>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#ffffffff' }}>
        <div className="container">
          <div className="why-grid">
            {whyItems.map((item, i) => (
              <div key={i} style={{
                padding: '28px 24px', background: '#111111',
                border: '1px solid #1A1A1A', borderRadius: '14px', textAlign: 'center',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: '#FED80015', border: '1px solid #FED80030',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <item.icon size={26} color="#FED800" strokeWidth={2} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="section-pad" style={{ padding: '80px 0', background: '#000' }}>
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Catering Packages</p>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: '#FEFEFE' }}>
              CHOOSE YOUR <span style={{ color: '#FED800' }}>PACKAGE</span>
            </h2>
          </div>

          <div className="packages-grid">
            {packages.map((pkg, i) => (
              <div key={i} style={{
                background: '#111111',
                border: `1px solid ${pkg.popular ? pkg.color + '60' : '#1A1A1A'}`,
                borderRadius: '16px', overflow: 'hidden',
                position: 'relative',
              }}>
                {pkg.popular && (
                  <div style={{ background: pkg.color, padding: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#000', letterSpacing: '1px' }}>⭐ MOST POPULAR</p>
                  </div>
                )}
                <div style={{ padding: '28px 24px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: `${pkg.color}20`, border: `1px solid ${pkg.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <UtensilsCrossed size={22} color={pkg.color} strokeWidth={2} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(20px, 4vw, 28px)', color: '#FEFEFE', marginBottom: '4px' }}>{pkg.name.toUpperCase()}</h3>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: pkg.color, marginBottom: '4px' }}>{pkg.price}</p>
                  <p style={{ fontSize: '13px', color: '#888888', marginBottom: '20px' }}>Minimum {pkg.minGuests} guests</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {pkg.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: `${pkg.color}20`, border: `1px solid ${pkg.color}60`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={pkg.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: '13px', color: '#CACACA' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#contact" style={{
                    display: 'block', width: '100%', padding: '13px',
                    background: pkg.popular ? pkg.color : 'transparent',
                    border: `2px solid ${pkg.color}`,
                    borderRadius: '10px', textAlign: 'center',
                    color: pkg.popular ? '#000' : pkg.color,
                    fontSize: '14px', fontWeight: '700', transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}>
                    Request This Package
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Tip Banner */}
          <div className="tip-banner">
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#FED80015', border: '1px solid #FED80030',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Lightbulb size={20} color="#FED800" strokeWidth={2} />
            </div>
            <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.6' }}>
              Need something custom? We can build a catering menu specifically for your event. Call us at{' '}
              <a href="tel:2673707993" style={{ color: '#FED800', fontWeight: '600' }}>267-370-7993</a>{' '}
              or fill out the form below.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact" className="section-pad" style={{ padding: '80px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Get A Quote</p>
              <h2 style={{ fontSize: 'clamp(28px, 6vw, 64px)', color: '#FEFEFE', marginBottom: '12px' }}>
                LET&apos;S PLAN YOUR <span style={{ color: '#FED800' }}>EVENT</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#888888' }}>Fill out the form below and we will get back to you within 24 hours.</p>
            </div>

            {submitted ? (
              <div style={{
                padding: '48px 32px', background: '#111111',
                border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center',
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: '#22C55E20', border: '2px solid #22C55E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 'clamp(22px, 5vw, 32px)', color: '#FEFEFE', marginBottom: '12px' }}>REQUEST SENT!</h3>
                <p style={{ fontSize: '15px', color: '#888888', marginBottom: '8px' }}>Thank you, {formData.name}! We received your catering request.</p>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '28px' }}>
                  Our team will contact you at <span style={{ color: '#FED800' }}>{formData.email}</span> within 24 hours.
                </p>
                <div className="success-actions">
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', eventDate: '', eventType: '', guestCount: '', location: '', message: '' }); }}
                    style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#888888', fontSize: '14px', cursor: 'pointer' }}>
                    Submit Another
                  </button>
                  <Link href="/" style={{ padding: '12px 24px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-wrap">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input style={inputStyle} placeholder="John Smith" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input type="tel" style={inputStyle} placeholder="215-555-0100" required
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input type="email" style={inputStyle} placeholder="john@company.com" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>

                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>Event Date *</label>
                      <input type="date" style={{ ...inputStyle, colorScheme: 'dark' } as React.CSSProperties} required
                        value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Number of Guests *</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }} required
                        value={formData.guestCount} onChange={e => setFormData({ ...formData, guestCount: e.target.value })}>
                        <option value="">Select</option>
                        <option value="10-25">10–25 guests</option>
                        <option value="25-50">25–50 guests</option>
                        <option value="50-100">50–100 guests</option>
                        <option value="100+">100+ guests</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>Event Type</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }}
                        value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                        <option value="">Select</option>
                        <option value="corporate">Corporate Breakfast</option>
                        <option value="wedding">Wedding / Brunch</option>
                        <option value="birthday">Birthday Party</option>
                        <option value="office">Office Meeting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Event Location</label>
                      <input style={inputStyle} placeholder="Address or venue name"
                        value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Additional Details</label>
                    <textarea
                      style={{ ...inputStyle, height: '100px', resize: 'none' as const }}
                      placeholder="Tell us about your event, dietary restrictions, special requests..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1A1A1A'}
                    />
                  </div>

                  <button type="submit" style={{
                    width: '100%', padding: '15px', background: '#FED800',
                    borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                    color: '#000', cursor: 'pointer', marginTop: '4px', border: 'none',
                  }}>
                    Submit Catering Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ padding: '60px 0', background: '#000', borderTop: '1px solid #1A1A1A', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '13px', color: '#888888', marginBottom: '8px' }}>Have questions? Call our catering hotline</p>
          <a href="tel:2673707993" style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontFamily: 'Bebas Neue, sans-serif',
            color: '#FED800', letterSpacing: '2px', display: 'block',
          }}>
            267-370-7993
          </a>
          <p style={{ fontSize: '13px', color: '#888888', marginTop: '8px' }}>Mon–Fri 8AM–6PM · Sat 9AM–4PM</p>
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
              {['Home', 'Menu', 'Order Online'].map(link => (
                <Link key={link} href={link === 'Menu' || link === 'Order Online' ? '/order' : '/'} style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#888888'}
                >{link}</Link>
              ))}
            </div>

            {/* Hours */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Hours</p>
              {[
                { day: 'Mon – Fri', hours: '8:00 AM – 10:00 PM' },
                { day: 'Saturday', hours: '9:00 AM – 11:00 PM' },
                { day: 'Sunday',   hours: '9:00 AM – 9:00 PM' },
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