'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

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
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const,
    color: '#CACACA', display: 'block' as const,
    marginBottom: '6px',
  };

  const hours = [
    { day: 'Monday – Friday', hours: '8:00 AM – 10:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 11:00 PM' },
    { day: 'Sunday', hours: '9:00 AM – 9:00 PM' },
  ];

  const contactInfo = [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Address', value: '3517 Lancaster Ave, Philadelphia PA 19104', href: 'https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6z"/></svg>, label: 'Phone', value: '215-948-9902', href: 'tel:2159489902' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6z"/></svg>, label: 'Catering', value: '267-370-7993', href: 'tel:2673707993' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', value: 'orders@eggsokphilly.com', href: 'mailto:orders@eggsokphilly.com' },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: '#000', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Get In Touch</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '16px' }}>
            WE'D LOVE TO<br /><span style={{ color: '#FED800' }}>HEAR FROM YOU</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#888888', maxWidth: '500px', lineHeight: '1.7' }}>
            Questions, feedback, catering inquiries, or just want to say hi — we are here for it.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '48px', alignItems: 'flex-start' }}>

          {/* Left — Info */}
          <div>
            {/* Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {contactInfo.map((info, i) => (
                <a key={i} href={info.href} target={info.label === 'Address' ? '_blank' : undefined} rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', background: '#111111',
                  border: '1px solid #1A1A1A', borderRadius: '12px',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FED80040'; (e.currentTarget as HTMLAnchorElement).style.background = '#1A1A1A'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A'; (e.currentTarget as HTMLAnchorElement).style.background = '#111111'; }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {info.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{info.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE' }}>{info.value}</p>
                  </div>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Hours</p>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22C55E', fontWeight: '600' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                  Open Now
                </span>
              </div>
              {hours.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < hours.length - 1 ? '1px solid #1A1A1A' : 'none' }}>
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
              <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#0A0A0A', color: '#FED800', fontSize: '13px', fontWeight: '600', borderTop: '1px solid #1A1A1A', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#111111'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0A0A0A'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div style={{ padding: '60px 32px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '32px', color: '#FEFEFE', marginBottom: '12px' }}>MESSAGE SENT!</h3>
                <p style={{ fontSize: '15px', color: '#888888', marginBottom: '28px' }}>
                  Thank you, {formData.name}! We will get back to you at <span style={{ color: '#FED800' }}>{formData.email}</span> within 24 hours.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#888888', fontSize: '14px', cursor: 'pointer' }}>
                    Send Another
                  </button>
                  <Link href="/" style={{ padding: '12px 24px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700' }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '32px' }}>
                <h2 style={{ fontSize: '28px', color: '#FEFEFE', marginBottom: '6px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>SEND US A MESSAGE</h2>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '24px' }}>We typically respond within a few hours during business hours.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    <textarea style={{ ...inputStyle, height: '130px', resize: 'none' as const }}
                      placeholder="Tell us how we can help..."
                      required
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '15px', background: '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: '#000', cursor: 'pointer' }}>
                    Send Message
                  </button>
                </form>

                <div style={{ marginTop: '20px', padding: '14px 16px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6z"/></svg>
                  <p style={{ fontSize: '13px', color: '#888888' }}>
                    Prefer to call? <a href="tel:2159489902" style={{ color: '#FED800', fontWeight: '600' }}>215-948-9902</a> · Mon–Fri 8AM–10PM
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}