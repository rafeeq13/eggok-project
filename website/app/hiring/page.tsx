'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

export default function HiringPage() {
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '', experience: '', message: '' });

  const jobs = [
    { id: 1, title: 'Line Cook', type: 'Full-time', pay: '$16–$20/hr', desc: 'Prepare and cook menu items to our quality standards. Experience in a fast-paced kitchen preferred.', requirements: ['1+ year kitchen experience', 'Food safety certification preferred', 'Availability on weekends', 'Team player'] },
    { id: 2, title: 'Cashier / Front of House', type: 'Full-time / Part-time', pay: '$14–$16/hr', desc: 'Greet customers, take orders, and ensure an amazing dining experience. Great communication skills required.', requirements: ['Customer service experience', 'Positive attitude', 'Basic math skills', 'Flexible schedule'] },
    { id: 3, title: 'Delivery Driver', type: 'Part-time', pay: '$15/hr + tips', desc: 'Deliver Eggs Ok orders to customers safely and on time. Must have a valid driver\'s license and reliable vehicle.', requirements: ['Valid PA driver\'s license', 'Clean driving record', 'Smartphone for app navigation', 'Own reliable vehicle'] },
    { id: 4, title: 'Shift Manager', type: 'Full-time', pay: '$20–$24/hr', desc: 'Lead and motivate our team during shifts. Oversee kitchen operations and ensure customer satisfaction.', requirements: ['2+ years restaurant management', 'Strong leadership skills', 'Food safety certified', 'Weekend availability'] },
  ];

  const perks = [
    { icon: '🍳', title: 'Free Meals', desc: 'Enjoy a free meal every shift' },
    { icon: '💰', title: 'Competitive Pay', desc: 'Above-average wages + tips' },
    { icon: '📅', title: 'Flexible Hours', desc: 'We work around your schedule' },
    { icon: '📈', title: 'Growth', desc: 'Promote from within' },
    { icon: '👕', title: 'Uniform Provided', desc: 'We provide your work gear' },
    { icon: '🤝', title: 'Great Team', desc: 'Fun, supportive work environment' },
  ];

  const inputStyle = {
    width: '100%', padding: '12px 16px',
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

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg, #000 0%, #0A0A0A 100%)', borderBottom: '1px solid #1A1A1A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80012 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Join Our Team</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px' }}>
            WORK WITH<br /><span style={{ color: '#FED800' }}>THE BEST</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#888888', maxWidth: '520px', lineHeight: '1.7', marginBottom: '32px' }}>
            We are always looking for passionate, hardworking people to join the Eggs Ok family. Great pay, flexible hours, and free food.
          </p>
          <a href="#positions" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            View Open Positions
          </a>
        </div>
      </section>

      {/* Perks */}
      <section style={{ padding: '70px 24px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#FEFEFE' }}>WHY WORK WITH <span style={{ color: '#FED800' }}>US?</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {perks.map((perk, i) => (
              <div key={i} style={{ padding: '24px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{perk.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{perk.title}</p>
                  <p style={{ fontSize: '13px', color: '#888888' }}>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="positions" style={{ padding: '80px 24px', background: '#000' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'flex-start' }}>

          {/* Job Listings */}
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#FEFEFE', marginBottom: '24px' }}>OPEN <span style={{ color: '#FED800' }}>POSITIONS</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jobs.map(job => (
                <div key={job.id} onClick={() => setActiveJob(activeJob === job.id ? null : job.id)} style={{
                  background: activeJob === job.id ? '#1A1A1A' : '#111111',
                  border: `1px solid ${activeJob === job.id ? '#FED80040' : '#1A1A1A'}`,
                  borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{job.title}</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#FED80020', color: '#FED800', border: '1px solid #FED80040' }}>{job.type}</span>
                        <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>{job.pay}</span>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points={activeJob === job.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                  </div>
                  {activeJob === job.id && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #2A2A2A' }}>
                      <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.6', margin: '14px 0 12px' }}>{job.desc}</p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {job.requirements.map((req, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80040', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
          <div style={{ position: 'sticky', top: '90px' }}>
            {applied ? (
              <div style={{ padding: '48px 28px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '28px', color: '#FEFEFE', marginBottom: '12px' }}>APPLICATION SENT!</h3>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '6px' }}>Thank you, {formData.name}!</p>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '28px' }}>We will review your application and reach out to <span style={{ color: '#FED800' }}>{formData.email}</span> within 3-5 business days.</p>
                <Link href="/" style={{ padding: '12px 28px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700' }}>Back to Home</Link>
              </div>
            ) : (
              <form onSubmit={handleApply} style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '28px' }}>
                <h2 style={{ fontSize: '24px', fontFamily: 'Bebas Neue, sans-serif', color: '#FEFEFE', marginBottom: '6px', letterSpacing: '1px' }}>APPLY NOW</h2>
                <p style={{ fontSize: '13px', color: '#888888', marginBottom: '20px' }}>Fill out the form and we will be in touch.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input style={inputStyle} placeholder="John Smith" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input type="tel" style={inputStyle} placeholder="215-555-0100" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" style={inputStyle} placeholder="john@gmail.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Position *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} required value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
                      <option value="">Select a position</option>
                      {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Experience</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}>
                      <option value="">Years of experience</option>
                      <option value="none">No experience</option>
                      <option value="1">Less than 1 year</option>
                      <option value="1-3">1–3 years</option>
                      <option value="3+">3+ years</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Tell Us About Yourself</label>
                    <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }} placeholder="Why do you want to join Eggs Ok?"
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#FED800'} onBlur={e => e.target.style.borderColor = '#1A1A1A'} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', background: '#FED800', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#000', cursor: 'pointer' }}>
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}