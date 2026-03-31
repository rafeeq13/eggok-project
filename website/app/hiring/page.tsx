'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  UtensilsCrossed,
  DollarSign,
  CalendarDays,
  TrendingUp,
  Shirt,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Smartphone,
  SendHorizonal,
} from 'lucide-react';

export default function HiringPage() {
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', position: '', experience: '', message: '',
  });

  const jobs = [
    { id: 1, title: 'Line Cook',               type: 'Full-time',            pay: '$16–$20/hr',  desc: 'Prepare and cook menu items to our quality standards. Experience in a fast-paced kitchen preferred.',                                               requirements: ['1+ year kitchen experience', 'Food safety certification preferred', 'Availability on weekends', 'Team player'] },
    { id: 2, title: 'Cashier / Front of House', type: 'Full-time / Part-time', pay: '$14–$16/hr',  desc: 'Greet customers, take orders, and ensure an amazing dining experience. Great communication skills required.',                                     requirements: ['Customer service experience', 'Positive attitude', 'Basic math skills', 'Flexible schedule'] },
    { id: 3, title: 'Delivery Driver',          type: 'Part-time',            pay: '$15/hr + tips', desc: "Deliver Eggs Ok orders to customers safely and on time. Must have a valid driver's license and reliable vehicle.",                               requirements: ['Valid PA driver\'s license', 'Clean driving record', 'Smartphone for app navigation', 'Own reliable vehicle'] },
    { id: 4, title: 'Shift Manager',            type: 'Full-time',            pay: '$20–$24/hr',  desc: 'Lead and motivate our team during shifts. Oversee kitchen operations and ensure customer satisfaction.',                                           requirements: ['2+ years restaurant management', 'Strong leadership skills', 'Food safety certified', 'Weekend availability'] },
  ];

  const perks = [
    { icon: UtensilsCrossed, title: 'Free Meals',       desc: 'Enjoy a free meal every shift' },
    { icon: DollarSign,      title: 'Competitive Pay',  desc: 'Above-average wages + tips' },
    { icon: CalendarDays,    title: 'Flexible Hours',   desc: 'We work around your schedule' },
    { icon: TrendingUp,      title: 'Growth',           desc: 'Promote from within' },
    { icon: Shirt,           title: 'Uniform Provided', desc: 'We provide your work gear' },
    { icon: Users,           title: 'Great Team',       desc: 'Fun, supportive work environment' },
  ];

  const inputStyle = {
    width: '100%', padding: '12px 16px',
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

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── RESPONSIVE STYLES (homepage reference pattern) ── */}
      <style>{`
        /* ── BASE ── */
        .perks-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .jobs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: flex-start;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
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
          .perks-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ── MOBILE (≤ 768px) ── */
        @media (max-width: 768px) {
          .hero-section { padding: 48px 0 40px !important; }
          .section-pad  { padding: 56px 0 !important; }
          .jobs-grid    { grid-template-columns: 1fr; gap: 32px; }
          .form-row-2   { grid-template-columns: 1fr; }
          .sticky-form  { position: static !important; top: unset !important; }
          .footer-grid  { grid-template-columns: 1fr; gap: 32px; }
          .footer-brand { grid-column: unset; }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .perks-grid   { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        padding: '80px 0 60px', textAlign: 'center',
        background: 'linear-gradient(135deg, #000 0%, #0A0A0A 100%)',
        borderBottom: '1px solid #1A1A1A',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80012 0%, transparent 70%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Join Our Team</p>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 70px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px' }}>
            WORK WITH <span style={{ color: '#FED800' }}>THE BEST</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#888888', lineHeight: '1.7', marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
            We are always looking for passionate, hardworking people to join the Eggs Ok family. Great pay, flexible hours, and free food.
          </p>
          <a href="#positions" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            View Open Positions
          </a>
        </div>
      </section>

      {/* ── PERKS ── */}
      <section className="section-pad" style={{ padding: '70px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', color: '#FEFEFE' }}>
              WHY WORK WITH <span style={{ color: '#FED800' }}>US?</span>
            </h2>
          </div>
          <div className="perks-grid">
            {perks.map((perk, i) => (
              <div key={i} style={{ padding: '22px 24px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#FED80015', border: '1px solid #FED80030',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <perk.icon size={22} color="#FED800" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{perk.title}</p>
                  <p style={{ fontSize: '13px', color: '#888888' }}>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOBS + FORM ── */}
      <section id="positions" className="section-pad" style={{ padding: '80px 0', background: '#000' }}>
        <div className="container">
          <div className="jobs-grid">

            {/* Job Listings */}
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#FEFEFE', marginBottom: '24px' }}>
                OPEN <span style={{ color: '#FED800' }}>POSITIONS</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {jobs.map(job => (
                  <div key={job.id}
                    onClick={() => setActiveJob(activeJob === job.id ? null : job.id)}
                    style={{
                      background: activeJob === job.id ? '#1A1A1A' : '#111111',
                      border: `1px solid ${activeJob === job.id ? '#FED80040' : '#1A1A1A'}`,
                      borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px' }}>{job.title}</p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#FED80020', color: '#FED800', border: '1px solid #FED80040' }}>{job.type}</span>
                          <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>{job.pay}</span>
                        </div>
                      </div>
                      {activeJob === job.id
                        ? <ChevronUp size={16} color="#888888" />
                        : <ChevronDown size={16} color="#888888" />}
                    </div>
                    {activeJob === job.id && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #2A2A2A' }}>
                        <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.6', margin: '14px 0 12px' }}>{job.desc}</p>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {job.requirements.map((req, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80040', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={8} color="#FED800" strokeWidth={3} />
                              </div>
                              <span style={{ fontSize: '13px', color: '#CACACA' }}>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Form */}
            <div className="sticky-form" style={{ position: 'sticky', top: '90px' }}>
              {applied ? (
                <div style={{ padding: '48px 28px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Check size={32} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: '#FEFEFE', marginBottom: '12px' }}>APPLICATION SENT!</h3>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '6px' }}>Thank you, {formData.name}!</p>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '28px' }}>
                    We will review your application and reach out to <span style={{ color: '#FED800' }}>{formData.email}</span> within 3–5 business days.
                  </p>
                  <Link href="/" style={{ padding: '12px 28px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>
                    Back to Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '28px' }}>
                  {/* Form Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <SendHorizonal size={20} color="#FED800" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontFamily: 'Bebas Neue, sans-serif', color: '#FEFEFE', letterSpacing: '1px', margin: 0 }}>APPLY NOW</h2>
                      <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>Fill out the form and we will be in touch.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-row-2">
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input style={inputStyle} placeholder="John Smith" required
                          value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                          onFocus={e => e.target.style.borderColor = '#FED800'}
                          onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone *</label>
                        <input type="tel" style={inputStyle} placeholder="215-555-0100" required
                          value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          onFocus={e => e.target.style.borderColor = '#FED800'}
                          onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input type="email" style={inputStyle} placeholder="john@gmail.com" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'}
                        onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Position *</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }} required
                        value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
                        <option value="">Select a position</option>
                        {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Experience</label>
                      <select style={{ ...inputStyle, cursor: 'pointer' }}
                        value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}>
                        <option value="">Years of experience</option>
                        <option value="none">No experience</option>
                        <option value="1">Less than 1 year</option>
                        <option value="1-3">1–3 years</option>
                        <option value="3+">3+ years</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tell Us About Yourself</label>
                      <textarea
                        style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                        placeholder="Why do you want to join Eggs Ok?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
                        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#1A1A1A'} />
                    </div>
                    <button type="submit" style={{
                      width: '100%', padding: '14px', background: '#FED800',
                      borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                      color: '#000', cursor: 'pointer', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                      <SendHorizonal size={16} strokeWidth={2.5} />
                      Submit Application
                    </button>
                  </div>
                </form>
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
                { label: 'Join Our Team', href: '/hiring' },
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