'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import {
  MapPin, Phone, Mail, Clock,
  ChevronRight, Check, Smartphone, ArrowRight,
} from 'lucide-react';

export default function ContactPage() {
  const { isOpen } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const res = await fetch(`${API}/mail/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send message');
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hours = [
    { day: 'Monday',    hours: '8:00 AM – 10:00 PM' },
    { day: 'Tuesday',   hours: '8:00 AM – 10:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM – 10:00 PM' },
    { day: 'Thursday',  hours: '8:00 AM – 10:00 PM' },
    { day: 'Friday',    hours: '8:00 AM – 11:00 PM' },
    { day: 'Saturday',  hours: '9:00 AM – 11:00 PM' },
    { day: 'Sunday',    hours: '9:00 AM – 9:00 PM'  },
  ];

  const contactInfo = [
    { Icon: MapPin, label: 'Address',  value: '3517 Lancaster Ave, Philadelphia PA 19104', href: 'https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104', external: true  },
    { Icon: Phone,  label: 'Phone',    value: '215-948-9902',                              href: 'tel:2159489902',                                                    external: false },
    { Icon: Phone,  label: 'Catering', value: '267-370-7993',                              href: 'tel:2673707993',                                                    external: false },
    { Icon: Mail,   label: 'Email',    value: 'orders@eggsokphilly.com',                   href: 'mailto:orders@eggsokphilly.com',                                    external: false },
  ];

  return (
    <div id="contact-page" style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --y: #E5B800;
          --r: #FC0301;
          --green: #22C55E;
          --bg0: #FFFFFF;
          --bg1: #F8F9FA;
          --bg2: #FFFFFF;
          --bg3: #F0F0F0;
          --border: #E0E0E0;
          --t1: #1A1A1A;
          --t2: #333333;
          --t3: #888888;
          --font-head: 'Playfair Display', Georgia, serif;
          --font-body: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ── Accessibility ── */
        :focus-visible { outline: 2px solid var(--y); outline-offset: 3px; }
        a:focus:not(:focus-visible), button:focus:not(:focus-visible) { outline: none; }

        /* ── Layout ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .bebas { font-family: var(--font-head); letter-spacing: -0.5px; }

        /* ── Buttons ── */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: var(--y); color: #000;
          border-radius: 10px; font-size: 16px; font-weight: 700;
          text-decoration: none; border: 2px solid transparent; cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-body);
        }
        .btn-yellow:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; box-shadow: none; }
        .btn-yellow:active { transform: translateY(0); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: #1A1A1A;
          border-radius: 10px; font-size: 16px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #1A1A1A;
          transition: border-color 0.15s, color 0.15s;
          font-family: var(--font-body); cursor: pointer;
        }
        .btn-outline:hover { background: #F0F0F0; border-color: #1A1A1A; color: #1A1A1A; }

        /* ── Section label ── */
        .sec-label {
          font-size: 12px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #888888;
          margin-bottom: 10px; display: block;
        }

        /* ── Section heading ── */
        .sec-heading {
          font-family: var(--font-head);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px; line-height: 1.2; color: var(--t1);
        }
        .sec-heading .accent { color: var(--t1); }

        /* ── Hero section ── */
        .contact-hero {
          text-align: center;
          padding: 110px 0 80px;
          background: #FFFFFF;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid #EBEBEB;
        }

        /* ── Main section ── */
        .contact-main {
          padding: 88px 0;
          background: #F8F9FA;
        }

        /* ── Contact grid ── */
        .contact-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; align-items: flex-start; }

        /* ── Contact info card ── */
        .contact-info-card {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 20px; background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; transition: border-color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .contact-info-card:hover { border-color: rgba(254,216,0,0.15); background: #F8F8F8; }
        .contact-card-icon {
          width: 46px; height: 46px; border-radius: 12px;
          background: rgba(254,216,0,0.06); border: 1px solid rgba(254,216,0,0.15);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .contact-card-label { font-size: 12px; color: var(--t3); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px; font-weight: 600; }
        .contact-card-value { font-size: 16px; font-weight: 600; color: var(--t1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .contact-card-chevron { margin-left: auto; flex-shrink: 0; color: var(--t3); transition: color 0.15s; }
        .contact-info-card:hover .contact-card-chevron { color: var(--y); }

        /* ── Hours box ── */
        .hours-box {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 26px; margin-bottom: 16px;
        }
        .hours-box-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .hours-box-title { font-family: var(--font-head); font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--t1); }
        .hours-open-badge { margin-left: auto; display: flex; align-items: center; gap: 6px; }
        .hours-open-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
        .hours-open-text { font-size: 12px; color: var(--green); font-weight: 600; }
        .hours-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; gap: 8px; }
        .hours-row + .hours-row { border-top: 1px solid #EBEBEB; }
        .hours-row-day { font-size: 16px; color:#4D4D4D; white-space: nowrap; }
        .hours-row-time { font-size: 16px; font-weight: 500; color:#4D4D4D; text-align: right; white-space: nowrap; }

        /* ── Map box ── */
        .map-box {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
        }
        .map-placeholder {
          height: 210px;
          background: linear-gradient(135deg, #F8F9FA, #FFFFF0);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; position: relative;
        }
        .map-grid-line-h { position: absolute; left: 0; right: 0; height: 1px; background: rgba(254,216,0,0.06); }
        .map-grid-line-v { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(254,216,0,0.06); }
        .map-pin-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--r); border: 3px solid #fff; z-index: 1; box-shadow: 0 0 0 6px rgba(252,3,1,0.15); }
        .map-address-chip {
          background: var(--bg2); border: 1px solid #D0D0D0;
          border-radius: 10px; padding: 9px 16px; z-index: 1;
          max-width: calc(100% - 32px);
        }
        .map-address-name { font-size: 14px; font-weight: 700; color: var(--t1); }
        .map-address-sub  { font-size: 14px; color: var(--t3); }
        .map-open-link {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; background: #F8F9FA; color: var(--t1);
          font-size: 16px; font-weight: 700; border-top: 1px solid #EBEBEB;
          text-decoration: none; transition: background 0.15s; font-family: var(--font-body);
          letter-spacing: 0.5px;
        }
        .map-open-link:hover { background: #F0F0F0; }

        /* ── Form wrap ── */
        .form-wrap {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 18px; padding: 36px;
        }
        .form-header { margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid var(--border); }
        .form-title { font-family: var(--font-head); font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: var(--t1); margin-bottom: 6px; line-height: 1.2; }
        .form-subtitle { font-size: 16px; color: #4D4D4D; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-label { font-size: 12px; font-weight: 700; color: var(--t2); display: block; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input {
          width: 100%; padding: 13px 16px;
          background: #F8F9FA; border: 1px solid #D0D0D0;
          border-radius: 10px; color: #1A1A1A; font-size: 16px; outline: none;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-input:focus { border-color: var(--y); }
        .form-input::placeholder { color: var(--t3); }
        .form-select {
          width: 100%; padding: 13px 16px;
          background: #F8F9FA; border: 1px solid #D0D0D0;
          border-radius: 10px; color: #1A1A1A; font-size: 16px; outline: none;
          cursor: pointer; appearance: none;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-select:focus { border-color: var(--y); }
        .form-textarea {
          width: 100%; padding: 13px 16px;
          background: #F8F9FA; border: 1px solid #D0D0D0;
          border-radius: 10px; color: #1A1A1A; font-size: 16px; outline: none;
          resize: none; height: 140px;
          transition: border-color 0.15s; font-family: var(--font-body);
        }
        .form-textarea:focus { border-color: var(--y); }
        .form-textarea::placeholder { color: var(--t3); }
        .form-submit-btn {
          width: 100%; padding: 16px; background: var(--y);
          border-radius: 12px; font-size: 16px; font-weight: 500;
          color: #000; cursor: pointer; border: 2px solid transparent;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body);
          transition: all 0.3s ease;
        }
        .form-submit-btn:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; box-shadow: none; }
        .form-phone-note {
          margin-top: 18px; padding: 14px 18px;
          background: #F5F5F5; border-radius: 10px;
          border: 1px solid #E0E0E0; display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
        }
        .form-phone-note-text { font-size: 16px; color: var(--t2); }
        .form-phone-note-link { color: var(--t1); font-weight: 700; text-decoration: none; }
        .form-phone-note-link:hover { text-decoration: underline; }

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
        .success-title { font-family: var(--font-head); font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: var(--t1); margin-bottom: 14px; line-height: 1.2; }
        .success-msg { font-size: 16px; color: var(--t2); line-height: 1.75; margin-bottom: 32px; }
        .success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ── */
        .site-footer { background: #F8F9FA; padding: 68px 0 32px; border-top: 1px solid #E5E5E5; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #E5E5E5; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 16px; color: #4D4D4D; text-decoration: none; transition: color 0.15s, padding-left 0.15s; padding: 4px 0px; }
        .footer-link:hover { color: #1A1A1A; text-decoration: underline; }
        .footer-hours-row { display: flex; gap: 14px; }
        .footer-hours-day { font-size: 14px; color: #4D4D4D; font-weight: 500; min-width: 90px; }
        .footer-hours-time { font-size: 14px; color: #666666; }

        /* ═══ RESPONSIVE ═══ */

        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-grid  { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 768px) {
          .container     { padding: 0 18px; }
          .contact-hero  { padding: 80px 0 56px; }
          .contact-main  { padding: 56px 0; }
          .contact-grid  { grid-template-columns: 1fr; gap: 28px; }
          .form-wrap     { padding: 24px 18px; }
          .hours-box     { padding: 20px 16px; }
          .site-footer   { padding: 52px 0 28px; }
          .footer-grid   { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand  { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .success-card  { padding: 40px 24px; }
        }

        @media (max-width: 480px) {
          .container       { padding: 0 14px; }
          .contact-hero    { padding: 72px 0 44px; }
          .contact-main    { padding: 40px 0; }
          .form-row-2      { grid-template-columns: 1fr; }
          .contact-info-card { padding: 14px 16px; gap: 12px; }
          .contact-card-icon { width: 40px; height: 40px; border-radius: 10px; }
          .contact-card-value { font-size: 13px; }
          .hours-box       { padding: 16px 14px; }
          .hours-row-day,
          .hours-row-time  { font-size: 12px; }
          .site-footer     { padding: 40px 0 24px; }
          .footer-hours-day  { min-width: 80px; font-size: 12px; }
          .footer-hours-time { font-size: 12px; }
          .success-card    { padding: 32px 16px; }
          .success-actions { flex-direction: column; align-items: center; }
          .success-actions .btn-yellow,
          .success-actions .btn-outline { width: 100%; justify-content: center; }
        }

        @media (max-width: 360px) {
          .container         { padding: 0 12px; }
          .contact-hero      { padding: 64px 0 36px; }
          .form-wrap         { padding: 18px 14px; border-radius: 14px; }
          .contact-info-card { padding: 12px 12px; gap: 10px; }
          .contact-card-icon { width: 36px; height: 36px; flex-shrink: 0; }
          .hours-box         { padding: 14px 12px; }
          .map-placeholder   { height: 170px; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .contact-info-card, .btn-yellow, .btn-outline, .form-submit-btn { transition: none; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="contact-hero" className="contact-hero">

        <div className="hero-glow" style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,216,0,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container hero-container" style={{ position: 'relative' }}>
         
          <h1 id="hero-title" className="bebas" style={{ fontSize: '28px', color: '#1A1A1A', lineHeight: '1.2', marginBottom: '22px' }}>
            We&apos;d Love to Hear From You
          </h1>
          <p id="hero-subtitle" style={{ fontSize: '16px', color: '#4D4D4D', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto' }}>
            Questions, feedback, catering inquiries, or just want to say hi — we are here for it.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section id="contact-main" className="contact-main">
        <div className="container contact-container">
          <div id="contact-grid" className="contact-grid">

            {/* ── LEFT — Info panel ── */}
            <div id="contact-info-panel">

              {/* Section header */}
              <div id="contact-info-header" style={{ marginBottom: '28px' }}>
                <span className="sec-label">Contact Info</span>
                <h2 id="contact-info-heading" className="bebas" style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', lineHeight: '1.2' }}>
                  Reach <span style={{ color: '#1A1A1A' }}>Us Anytime</span>
                </h2>
              </div>

              {/* Contact info cards */}
              <div id="contact-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {contactInfo.map((info, i) => (
                  <a
                    key={i}
                    id={`contact-card-${i}`}
                    href={info.href}
                    className="contact-info-card"
                    target={info.external ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={`${info.label}: ${info.value}`}
                  >
                    <div className="contact-card-icon" aria-hidden="true">
                      <info.Icon size={20} color="#000000ff" strokeWidth={2} />
                    </div>
                    <div className="contact-card-text" style={{ minWidth: 0, flex: 1 }}>
                      <p className="contact-card-label">{info.label}</p>
                      <p className="contact-card-value">{info.value}</p>
                    </div>
                    <ChevronRight size={16} className="contact-card-chevron" aria-hidden="true" />
                  </a>
                ))}
              </div>

              {/* Hours box */}
              <div id="hours-box" className="hours-box">
                <div id="hours-box-header" className="hours-box-header">
                  <Clock size={18} color="#000000ff" strokeWidth={2} aria-hidden="true" />
                  <p id="hours-box-title" className="hours-box-title">Hours</p>
                  <div id="hours-open-badge" className="hours-open-badge" role="status" aria-live="polite">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301', flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: '12px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: 600 }}>{isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>
                <div id="hours-list">
                  {hours.map((h, i) => (
                    <div key={i} id={`hours-row-${i}`} className="hours-row">
                      <span className="hours-row-day">{h.day}</span>
                      <span className="hours-row-time">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map box */}
              <div id="map-box" className="map-box">
                <div id="map-placeholder" className="map-placeholder">
                  {[...Array(8)].map((_, i) => (
                    <div key={`h${i}`} className="map-grid-line-h" style={{ top: `${i * 12.5}%` }} aria-hidden="true" />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <div key={`v${i}`} className="map-grid-line-v" style={{ left: `${i * 10}%` }} aria-hidden="true" />
                  ))}
                  <div id="map-pin-dot" className="map-pin-dot" aria-hidden="true" />
                  <div id="map-address-chip" className="map-address-chip">
                    <p className="map-address-name">3517 Lancaster Ave</p>
                    <p className="map-address-sub">Philadelphia, PA 19104</p>
                  </div>
                </div>
                <a
                  id="map-open-link"
                  href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104"
                  target="_blank" rel="noopener noreferrer"
                  className="map-open-link"
                  aria-label="Open location in Google Maps"
                >
                  <MapPin size={14} aria-hidden="true" />
                  Open in Google Maps
                </a>
              </div>

            </div>

            {/* ── RIGHT — Form ── */}
            <div id="contact-form-panel">
              {submitted ? (
                <div id="success-card" className="success-card">
                  <div id="success-icon" className="success-icon-wrap" aria-hidden="true">
                    <Check size={36} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 id="success-title" className="success-title">Message Sent!</h3>
                  <p id="success-msg" className="success-msg">
                    Thank you, {formData.name}! We will get back to you at{' '}
                    <span style={{ color: '#1A1A1A', fontWeight: 700 }}>{formData.email}</span>{' '}
                    within 24 hours.
                  </p>
                  <div id="success-actions" className="success-actions">
                    <button
                      id="success-another-btn"
                      className="btn-outline"
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    >
                      Send Another
                    </button>
                    <Link id="success-home-btn" href="/" className="btn-yellow">
                      Back to Home <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div id="contact-form-wrap" className="form-wrap">

                  {/* Form header */}
                  <div id="form-header" className="form-header">
                    <h2 id="form-title" className="form-title">Send Us a Message</h2>
                    <p id="form-subtitle" className="form-subtitle">We typically respond within a few hours during business hours.</p>
                  </div>

                  <form id="contact-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Name + Phone */}
                    <div id="form-row-name-phone" className="form-row-2">
                      <div id="form-group-name">
                        <label htmlFor="input-name" className="form-label">Full Name *</label>
                        <input
                          id="input-name" className="form-input"
                          placeholder="John Smith" required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div id="form-group-phone">
                        <label htmlFor="input-phone" className="form-label">Phone Number</label>
                        <input
                          id="input-phone" type="tel" className="form-input"
                          placeholder="215-555-0100"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div id="form-group-email">
                      <label htmlFor="input-email" className="form-label">Email Address *</label>
                      <input
                        id="input-email" type="email" className="form-input"
                        placeholder="john@gmail.com" required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    {/* Subject */}
                    <div id="form-group-subject">
                      <label htmlFor="input-subject" className="form-label">Subject</label>
                      <select
                        id="input-subject" className="form-select"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="">Select a topic</option>
                        <option value="order">Order Issue</option>
                        <option value="catering">Catering Inquiry</option>
                        <option value="feedback">General Feedback</option>
                        <option value="allergy">Allergy / Dietary Info</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div id="form-group-message">
                      <label htmlFor="input-message" className="form-label">Message *</label>
                      <textarea
                        id="input-message" className="form-textarea"
                        placeholder="Tell us how we can help..."
                        required
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    {/* Error */}
                    {submitError && (
                      <p style={{ color: '#FC0301', fontSize: '13px', margin: '0 0 8px' }}>{submitError}</p>
                    )}

                    {/* Submit */}
                    <button id="form-submit-btn" type="submit" className="form-submit-btn" disabled={submitting} style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                      {submitting ? 'Sending...' : 'Send Message'} {!submitting && <ArrowRight size={16} aria-hidden="true" />}
                    </button>

                  </form>

                  {/* Phone note */}
                  <div id="form-phone-note" className="form-phone-note">
                    <Phone size={16} color="#000000ff" strokeWidth={2} style={{ flexShrink: 0 }} aria-hidden="true" />
                    <p className="form-phone-note-text">
                      Prefer to call?{' '}
                      <a id="form-phone-link" href="tel:2159489902" className="form-phone-note-link">215-948-9902</a>
                      {' '}· Mon–Fri 8AM–10PM
                    </p>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="contact-footer" className="site-footer">
        <div className="container footer-container">
          <div id="footer-grid" className="footer-grid">

            {/* Brand */}
            <div id="footer-brand" className="footer-brand">
              <div id="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div id="footer-logo-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.webp" alt="Eggs Ok" width={100} height={70} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p id="footer-tagline" style={{ fontSize: '16px', color: '#4D4D4D', lineHeight: '1.75', maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address id="footer-address" style={{ fontStyle: 'normal' }}>
                <p id="footer-address-line" style={{ fontSize: '14px', color: '#4D4D4D', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#000000ff" aria-hidden="true" />
                  <a id="footer-address-link" href="https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104" style={{ color: '#1A1A1A', textDecoration: 'none' }}>
                    3517 Lancaster Ave, Philadelphia PA 19104
                  </a>
                </p>
                <p id="footer-phone-line" style={{ fontSize: '14px', color: '#4D4D4D', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#000000ff" aria-hidden="true" />
                  <a id="footer-phone-link" href="tel:2159489902" style={{ color: '#4D4D4D', textDecoration: 'none' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            {/* Quick links */}
            <nav id="footer-nav" aria-label="Quick links">
              <p id="footer-nav-heading" style={{ fontSize: '18px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: '700', color: '#1A1A1A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
              {[
                { label: 'Home',         href: '/'          },
                { label: 'Order Online', href: '/order'     },
                { label: 'Catering',     href: '/catering'  },
                { label: 'Our Story',    href: '/story'     },
                { label: 'Gift Cards',   href: '/gift-cards'},
                { label: 'Contact',      href: '/contact'   },
              ].map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>

            {/* Hours */}
            <div id="footer-hours">
              <p id="footer-hours-heading" style={{ fontSize: '18px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: '700', color: '#1A1A1A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
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
                  <div key={i} id={`footer-hours-row-${i}`} className="footer-hours-row">
                    <span className="footer-hours-day">{h.day}</span>
                    <span className="footer-hours-time">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div id="footer-bottom" className="footer-bottom">
            <p id="footer-copyright" style={{ fontSize: '13px', color: '#888888' }}>
              &copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.
            </p>
            <p id="footer-credit" style={{ fontSize: '13px', color: '#888888' }}>
              {/* Built by <span id="footer-credit-brand" style={{ color: '#E5B800' }}>RestoRise Business Solutions</span> */}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}