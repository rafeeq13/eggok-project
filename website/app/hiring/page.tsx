'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  UtensilsCrossed, DollarSign, CalendarDays, TrendingUp,
  Shirt, Users, ChevronDown, ChevronUp, Check,
  MapPin, Smartphone, SendHorizontal, ArrowRight,
} from 'lucide-react';

export default function HiringPage() {
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', position: '', experience: '', message: '',
  });
  const [resumeFile, setResumeFile] = useState<{ name: string; data: string } | null>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { alert('File too large. Max 100MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setResumeFile({ name: file.name, data: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const jobs = [
    { id: 1, title: 'Line Cook',               type: 'Full-time',             pay: '$16–$20/hr',   desc: 'Prepare and cook menu items to our quality standards. Experience in a fast-paced kitchen preferred.',                                            requirements: ['1+ year kitchen experience', 'Food safety certification preferred', 'Availability on weekends', 'Team player'] },
    { id: 2, title: 'Cashier / Front of House', type: 'Full-time / Part-time', pay: '$14–$16/hr',   desc: 'Greet customers, take orders, and ensure an amazing dining experience. Great communication skills required.',                                    requirements: ['Customer service experience', 'Positive attitude', 'Basic math skills', 'Flexible schedule'] },
    { id: 3, title: 'Delivery Driver',          type: 'Part-time',             pay: '$15/hr + tips', desc: "Deliver Eggs Ok orders to customers safely and on time. Must have a valid driver's license and reliable vehicle.",                              requirements: ["Valid PA driver's license", 'Clean driving record', 'Smartphone for app navigation', 'Own reliable vehicle'] },
    { id: 4, title: 'Shift Manager',            type: 'Full-time',             pay: '$20–$24/hr',   desc: 'Lead and motivate our team during shifts. Oversee kitchen operations and ensure customer satisfaction.',                                        requirements: ['2+ years restaurant management', 'Strong leadership skills', 'Food safety certified', 'Weekend availability'] },
    // other postion 
    {id:5,title:'Other', type:'Full-time',pay:'',desc:'other', requirements:[]}
  ];

  const perks = [
    { icon: UtensilsCrossed, title: 'Free Meals',        desc: 'Enjoy a free meal every shift you work'    },
    { icon: DollarSign,      title: 'Competitive Pay',   desc: 'Above-average wages plus tips'             },
    { icon: CalendarDays,    title: 'Flexible Hours',    desc: 'We work around your schedule'             },
    { icon: TrendingUp,      title: 'Room to Grow',      desc: 'We promote from within'                   },
    { icon: Shirt,           title: 'Uniform Provided',  desc: 'We supply all your work gear'             },
    { icon: Users,           title: 'Great Team',        desc: 'Fun, tight-knit work environment'         },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const res = await fetch(`${API}/mail/hiring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, resume: resumeFile?.data || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit application');
      }
      setApplied(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="hiring-page" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

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
          --bg4: #181818;
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

        /* ── Perks grid ── */
        .perks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* ── Perk card ── */
        .perk-card {
          padding: 24px; background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; display: flex; align-items: flex-start; gap: 18px;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s;
        }
        .perk-card:hover { border-color: rgba(254,216,0,0.2); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
        .perk-icon {
          width: 50px; height: 50px; border-radius: 12px;
          background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .perk-title { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
        .perk-desc  { font-size: 13px; color: var(--t2); line-height: 1.55; }

        /* ── Jobs + form grid ── */
        .jobs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: flex-start; }

        /* ── Job card ── */
        .job-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .job-card.active { background: #141400; border-color: rgba(254,216,0,0.3); }
        .job-card:not(.active):hover { border-color: #2A2A2A; background: #131313; }
        .job-card-header {
          padding: 20px 22px; display: flex;
          justify-content: space-between; align-items: center; gap: 12px;
        }
        .job-title { font-size: 15px; font-weight: 700; color: var(--t1); margin-bottom: 8px; line-height: 1.3; }
        .job-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .job-type-badge {
          font-size: 11px; padding: 3px 10px; border-radius: 20px;
          background: rgba(254,216,0,0.08); color: var(--y);
          border: 1px solid rgba(254,216,0,0.2); font-weight: 600;
        }
        .job-pay { font-size: 13px; color: var(--green); font-weight: 700; }
        .job-chevron { color: var(--t3); flex-shrink: 0; transition: color 0.15s; }
        .job-card.active .job-chevron { color: var(--y); }
        .job-body { padding: 0 22px 22px; border-top: 1px solid #2A2A2A; }
        .job-desc { font-size: 14px; color: var(--t2); line-height: 1.7; margin: 16px 0 14px; }
        .job-reqs-label {
          font-size: 11px; font-weight: 700; color: var(--t3);
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
        }
        .job-req-item { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
        .job-req-check {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .job-req-text { font-size: 13px; color: var(--t2); }

        /* ── Apply form ── */
        .apply-form-wrap {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 18px; padding: 32px; position: sticky; top: 88px;
        }
        .form-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .form-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .form-title { font-family: var(--font-head); font-size: 26px; letter-spacing: 1px; color: var(--t1); margin: 0 0 3px; line-height: 1; }
        .form-subtitle { font-size: 13px; color: var(--t2); margin: 0; }
        .form-fields { display: flex; flex-direction: column; gap: 14px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-label { font-size: 12px; font-weight: 700; color: var(--t2); display: block; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input {
          width: 100%; padding: 12px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none;
          transition: border-color 0.15s;
          font-family: var(--font-body);
        }
        .form-input:focus { border-color: var(--y); }
        .form-input::placeholder { color: var(--t3); }
        .form-select {
          width: 100%; padding: 12px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none; cursor: pointer;
          transition: border-color 0.15s;
          font-family: var(--font-body); appearance: none;
        }
        .form-select:focus { border-color: var(--y); }
        .form-textarea {
          width: 100%; padding: 12px 16px;
          background: #0D0D0D; border: 1px solid #2A2A2A;
          border-radius: 10px; color: var(--t1);
          font-size: 14px; outline: none; resize: none; height: 90px;
          transition: border-color 0.15s;
          font-family: var(--font-body);
        }
        .form-textarea:focus { border-color: var(--y); }
        .form-textarea::placeholder { color: var(--t3); }
        .form-submit-btn {
          width: 100%; padding: 15px; background: var(--y);
          border-radius: 12px; font-size: 15px; font-weight: 800;
          color: #000; cursor: pointer; border: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .form-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(254,216,0,0.25); }

        /* ── Success state ── */
        .success-card {
          padding: 52px 32px; background: var(--bg2);
          border: 1px solid rgba(34,197,94,0.2); border-radius: 18px; text-align: center;
        }
        .success-icon-wrap {
          width: 76px; height: 76px; border-radius: 50%;
          background: rgba(34,197,94,0.08); border: 2px solid var(--green);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        }
        .success-title { font-family: var(--font-head); font-size: 32px; letter-spacing: 1px; color: var(--t1); margin-bottom: 14px; line-height: 1; }
        .success-msg { font-size: 14px; color: var(--t2); line-height: 1.75; margin-bottom: 28px; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 14px; color: var(--t1); margin-bottom: 11px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
        .footer-link:hover { color: var(--y); padding-left: 4px; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .perks-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .jobs-grid { grid-template-columns: 1fr; gap: 36px; }
          .apply-form-wrap { position: static !important; top: unset !important; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 14px; }
          .perks-grid { grid-template-columns: 1fr; }
          .form-row-2 { grid-template-columns: 1fr; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .perk-card, .job-card, .btn-yellow, .form-submit-btn { transition: none; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="hiring-hero" style={{ padding: '110px 0 80px', background: '#000', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #141414' }}>

        {/* Glow */}
        <div className="hero-glow" style={{ position: 'absolute', top: '-80px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,216,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        <div className="hero-glow-left" style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,3,1,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container hero-container" style={{ position: 'relative', textAlign: 'center' }}>
          <span id="hero-label" className="sec-label" style={{ display: 'block' }}>Join Our Team</span>
          <h1 id="hero-title" className="bebas" style={{ fontSize: 'clamp(52px, 9vw, 80px)', color: '#ffffff', lineHeight: '0.93', marginBottom: '24px' }}>
            WORK WITH <span style={{ color: '#FED800' }}>THE BEST</span>
          </h1>
          <p id="hero-subtitle" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#ffffff', lineHeight: '1.8', maxWidth: '520px', margin: '0 auto 40px' }}>
            We are always looking for passionate, hardworking people to join the Eggs Ok family. Great pay, flexible hours, and free food every shift.
          </p>
          <div id="hero-cta" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#positions" id="hero-view-positions-btn" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 34px' }}>
              View Open Positions <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="#apply" id="hero-apply-btn" className="btn-outline" style={{ fontSize: '16px', padding: '16px 34px' }}>
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PERKS
      ══════════════════════════════════════════ */}
      <section id="perks" style={{ padding: '88px 0', background: '#0A0A0A' }}>
        <div className="container perks-container">

          <div id="perks-header" style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Benefits</span>
            <h2 id="perks-heading" className="sec-heading">
              WHY WORK <span className="accent">WITH US?</span>
            </h2>
          </div>

          <div id="perks-grid" className="perks-grid" role="list" aria-label="Employee benefits">
            {perks.map((perk, i) => (
              <div key={i} id={`perk-card-${i}`} className="perk-card" role="listitem">
                <div className="perk-icon" aria-hidden="true">
                  <perk.icon size={22} color="#FED800" strokeWidth={2} />
                </div>
                <div className="perk-body">
                  <p className="perk-title">{perk.title}</p>
                  <p className="perk-desc">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          JOBS + FORM
      ══════════════════════════════════════════ */}
      <section id="positions" style={{ padding: '88px 0', background: '#000' }}>
        <div className="container positions-container">
          <div id="jobs-form-grid" className="jobs-grid">

            {/* ── Job Listings ── */}
            <div id="job-listings">
              <div id="jobs-header" style={{ marginBottom: '28px' }}>
                <span className="sec-label">Careers</span>
                <h2 id="jobs-heading" className="sec-heading">
                  OPEN <span className="accent">POSITIONS</span>
                </h2>
              </div>

              <div id="jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {jobs.map(job => (
                  <div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    className={`job-card${activeJob === job.id ? ' active' : ''}`}
                    onClick={() => setActiveJob(activeJob === job.id ? null : job.id)}
                    role="button"
                    aria-expanded={activeJob === job.id}
                  >
                    <div className="job-card-header">
                      <div className="job-info">
                        <p className="job-title">{job.title}</p>
                        <div className="job-meta">
                          <span className="job-type-badge">{job.type}</span>
                          <span className="job-pay">{job.pay}</span>
                        </div>
                      </div>
                      <div className="job-chevron" aria-hidden="true">
                        {activeJob === job.id
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }
                      </div>
                    </div>

                    {activeJob === job.id && (
                      <div id={`job-body-${job.id}`} className="job-body">
                        <p className="job-desc">{job.desc}</p>
                        <p className="job-reqs-label">Requirements</p>
                        <div id={`job-reqs-${job.id}`} className="job-reqs">
                          {job.requirements.map((req, j) => (
                            <div key={j} id={`job-req-${job.id}-${j}`} className="job-req-item">
                              <div className="job-req-check" aria-hidden="true">
                                <Check size={9} color="#FED800" strokeWidth={3} />
                              </div>
                              <span className="job-req-text">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Apply Form ── */}
            <div id="apply">
              {applied ? (
                <div id="success-card" className="success-card">
                  <div id="success-icon" className="success-icon-wrap" aria-hidden="true">
                    <Check size={34} color="#22C55E" strokeWidth={2.5} />
                  </div>
                  <h3 id="success-title" className="success-title">APPLICATION SENT!</h3>
                  <p id="success-msg" className="success-msg">
                    Thank you, {formData.name}!<br />
                    We will review your application and reach out to{' '}
                    <span style={{ color: '#FED800' }}>{formData.email}</span>{' '}
                    within 3–5 business days.
                  </p>
                  <Link id="success-home-btn" href="/" className="btn-yellow">
                    Back to Home <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <form id="apply-form" className="apply-form-wrap" onSubmit={handleApply} noValidate>

                  {/* Form header */}
                  <div id="form-header" className="form-header">
                    <div id="form-icon" className="form-icon" aria-hidden="true">
                      <SendHorizontal size={22} color="#FED800" strokeWidth={2} />
                    </div>
                    <div id="form-header-text">
                      <h2 id="form-title" className="form-title">APPLY NOW</h2>
                      <p id="form-subtitle" className="form-subtitle">Fill out the form and we'll be in touch.</p>
                    </div>
                  </div>

                  <div id="form-fields" className="form-fields">

                    {/* Row: Name + Phone */}
                    <div id="form-row-name-phone" className="form-row-2">
                      <div id="form-group-name">
                        <label htmlFor="input-name" className="form-label">Full Name *</label>
                        <input
                          id="input-name"
                          className="form-input"
                          placeholder="John Smith"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div id="form-group-phone">
                        <label htmlFor="input-phone" className="form-label">Phone *</label>
                        <input
                          id="input-phone"
                          type="tel"
                          className="form-input"
                          placeholder="215-555-0100"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div id="form-group-email">
                      <label htmlFor="input-email" className="form-label">Email *</label>
                      <input
                        id="input-email"
                        type="email"
                        className="form-input"
                        placeholder="john@gmail.com"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    {/* Position */}
                    <div id="form-group-position">
                      <label htmlFor="input-position" className="form-label">Position *</label>
                      <select
                        id="input-position"
                        className="form-select"
                        required
                        value={formData.position}
                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                      >
                        <option value="">Select a position</option>
                        {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                      </select>
                    </div>

                    {/* Experience */}
                    <div id="form-group-experience">
                      <label htmlFor="input-experience" className="form-label">Experience</label>
                      <select
                        id="input-experience"
                        className="form-select"
                        value={formData.experience}
                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option value="">Years of experience</option>
                        <option value="none">No experience</option>
                        <option value="1">Less than 1 year</option>
                        <option value="1-3">1–3 years</option>
                        <option value="3+">3+ years</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div id="form-group-message">
                      <label htmlFor="input-message" className="form-label">Tell Us About Yourself</label>
                      <textarea
                        id="input-message"
                        className="form-textarea"
                        placeholder="Why do you want to join Eggs Ok?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    {/* Resume Upload */}
                    <div id="form-group-resume">
                      <label className="form-label">Resume / CV (optional, max 5MB)</label>
                      <div style={{
                        border: `2px dashed ${resumeFile ? '#22C55E' : '#2A2A2A'}`,
                        borderRadius: '12px', padding: '20px', textAlign: 'center',
                        background: resumeFile ? '#22C55E08' : '#0A0A0A',
                        cursor: 'pointer', transition: 'border-color 0.2s',
                      }}
                        onClick={() => document.getElementById('resume-input')?.click()}
                      >
                        <input id="resume-input" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                        {resumeFile ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>{resumeFile.name}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>✕</button>
                          </div>
                        ) : (
                          <div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Click to upload PDF or Word document</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error */}
                    {submitError && (
                      <p style={{ color: '#FC0301', fontSize: '13px', margin: '0 0 8px' }}>{submitError}</p>
                    )}

                    {/* Submit */}
                    <button id="form-submit-btn" type="submit" className="form-submit-btn" disabled={submitting} style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                      <SendHorizontal size={16} strokeWidth={2.5} aria-hidden="true" />
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>

                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="hiring-footer" className="site-footer" style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
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
                { label: 'Home',          href: '/'        },
                { label: 'Order Online',  href: '/order'   },
                { label: 'Catering',      href: '/catering'},
                { label: 'Our Story',     href: '/story'   },
                { label: 'Join Our Team', href: '/hiring'  },
                { label: 'Contact',       href: '/contact' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>

            {/* Hours */}
            <div id="footer-hours">
              <p id="footer-hours-heading" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div id="footer-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { day: 'Monday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Tuesday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Wednesday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Thursday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Friday', hours: '8:00 AM – 11:00 PM' },
                  { day: 'Saturday',  hours: '9:00 AM – 11:00 PM' },
                  { day: 'Sunday',    hours: '9:00 AM – 9:00 PM'  },
                ].map((h, i) => (
                  <div key={i} className={`footer-hours-row footer-hours-${h.day.toLowerCase()}`} style={{ display: 'flex', gap: '14px' }}>
                    <span className="footer-hours-day" style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', minWidth: '96px' }}>{h.day}</span>
                    <span className="footer-hours-time" style={{ fontSize: '13px', color: '#BBBBBB' }}>{h.hours}</span>
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