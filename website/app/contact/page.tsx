'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Check,
  Smartphone,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const hours = [
    { day: 'Monday – Friday', hours: '8:00 AM – 10:00 PM' },
    { day: 'Saturday',        hours: '9:00 AM – 11:00 PM' },
    { day: 'Sunday',          hours: '9:00 AM – 9:00 PM' },
  ];

  const contactInfo = [
    { Icon: MapPin, label: 'Address',  value: '3517 Lancaster Ave, Philadelphia PA 19104', href: 'https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104', external: true },
    { Icon: Phone,  label: 'Phone',    value: '215-948-9902',         href: 'tel:2159489902',              external: false },
    { Icon: Phone,  label: 'Catering', value: '267-370-7993',         href: 'tel:2673707993',              external: false },
    { Icon: Mail,   label: 'Email',    value: 'orders@eggsokphilly.com', href: 'mailto:orders@eggsokphilly.com', external: false },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── RESPONSIVE STYLES (homepage reference pattern) ── */}
      <style>{`
        /* ── BASE (desktop) ── */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 48px;
          align-items: flex-start;
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
          .contact-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ── MOBILE (≤ 768px) ── */
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .section-pad { padding: 56px 0 !important; }
          .hero-section { padding: 48px 0 40px !important; }
          .form-row-2  { grid-template-columns: 1fr; }
          .form-wrap   { padding: 24px 16px; }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-brand { grid-column: unset; }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
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
      <section className="hero-section" style={{textAlign: 'center', padding: '80px 0 60px', background: '#000', borderBottom: '1px solid #1A1A1A' }}>
        <div className="container">
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Get In Touch</p>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 60px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '16px' }}>
            WE&apos;D LOVE TO <span style={{ color: '#FED800' }}>HEAR FROM YOU</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#888888',  lineHeight: '1.7' }}>
            Questions, feedback, catering inquiries, or just want to say hi — we are here for it.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="section-pad" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="contact-grid">

            {/* ── LEFT — Info ── */}
            <div>
              {/* Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {contactInfo.map((info, i) => (
                  <a key={i} href={info.href}
                    target={info.external ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', transition: 'all 0.2s', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FED80040'; (e.currentTarget as HTMLAnchorElement).style.background = '#1A1A1A'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A'; (e.currentTarget as HTMLAnchorElement).style.background = '#111111'; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <info.Icon size={20} color="#FED800" strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{info.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{info.value}</p>
                    </div>
                    <ChevronRight size={16} color="#888888" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  </a>
                ))}
              </div>

              {/* Hours */}
              <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Clock size={18} color="#FED800" strokeWidth={2} />
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Hours</p>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22C55E', fontWeight: '600' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                    Open Now
                  </span>
                </div>
                {hours.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < hours.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
                    <span style={{ fontSize: '14px', color: '#888888' }}>{h.day}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE' }}>{h.hours}</span>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '200px', background: 'linear-gradient(135deg, #0A0A0A, #111100)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 12.5}%`, height: '1px', background: '#FED800' }} />
                    ))}
                    {[...Array(10)].map((_, i) => (
                      <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 10}%`, width: '1px', background: '#FED800' }} />
                    ))}
                  </div>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FC0301', border: '3px solid #fff', zIndex: 1 }} />
                  <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '8px 14px', zIndex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>3517 Lancaster Ave</p>
                    <p style={{ fontSize: '11px', color: '#888888' }}>Philadelphia, PA 19104</p>
                  </div>
                </div>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#0A0A0A', color: '#FED800', fontSize: '13px', fontWeight: '600', borderTop: '1px solid #1A1A1A', transition: 'background 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#111111'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0A0A0A'}
                >
                  <MapPin size={14} color="currentColor" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* ── RIGHT — Form ── */}
            <div>
              {submitted ? (
                <div style={{ padding: '60px 32px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Check size={32} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(22px, 5vw, 32px)', color: '#FEFEFE', marginBottom: '12px' }}>MESSAGE SENT!</h3>
                  <p style={{ fontSize: '15px', color: '#888888', marginBottom: '28px' }}>
                    Thank you, {formData.name}! We will get back to you at <span style={{ color: '#FED800' }}>{formData.email}</span> within 24 hours.
                  </p>
                  <div className="success-actions">
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                      style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#888888', fontSize: '14px', cursor: 'pointer' }}>
                      Send Another
                    </button>
                    <Link href="/" style={{ padding: '12px 24px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="form-wrap">
                  <h2 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: '#FEFEFE', marginBottom: '6px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>SEND US A MESSAGE</h2>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '24px' }}>We typically respond within a few hours during business hours.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                        <label style={labelStyle}>Phone Number</label>
                        <input type="tel" style={inputStyle} placeholder="215-555-0100"
                          value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          onFocus={e => e.target.style.borderColor = '#FED800'}
                          onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input type="email" style={inputStyle} placeholder="john@gmail.com" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }}
                        value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                        <option value="">Select a topic</option>
                        <option value="order">Order Issue</option>
                        <option value="catering">Catering Inquiry</option>
                        <option value="feedback">General Feedback</option>
                        <option value="allergy">Allergy / Dietary Info</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Message *</label>
                      <textarea
                        style={{ ...inputStyle, height: '130px', resize: 'none' as const }}
                        placeholder="Tell us how we can help..."
                        required
                        value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
                        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1A1A1A'}
                      />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '15px', background: '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: '#000', cursor: 'pointer', border: 'none' }}>
                      Send Message
                    </button>
                  </form>

                  <div style={{ marginTop: '20px', padding: '14px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={16} color="#FED800" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#888888' }}>
                      Prefer to call? <a href="tel:2159489902" style={{ color: '#FED800', fontWeight: '600' }}>215-948-9902</a> · Mon–Fri 8AM–10PM
                    </p>
                  </div>
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
                { label: 'Contact Us',   href: '/contact' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: '14px', color: '#888888', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#888888'}
                >{link.label}</Link>
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