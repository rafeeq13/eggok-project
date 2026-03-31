import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import {
  Flame,
  Globe,
  Users,
  Leaf,
  MapPin,
  Smartphone,
} from 'lucide-react';

export default function StoryPage() {
  const values = [
    { icon: Flame,  title: 'Fresh Every Day',   desc: 'Every item on our menu is made fresh to order. No freezers, no shortcuts — just real food made with care.' },
    { icon: Globe,  title: 'Cultural Fusion',    desc: 'Our menu blends American breakfast classics with Indonesian flavors, creating something truly unique in Philadelphia.' },
    { icon: Users,  title: 'Community First',    desc: 'We are proud to serve West Philadelphia. Every order supports our local team and the neighborhood we love.' },
    { icon: Leaf,   title: 'Sustainable',        desc: 'We source locally where possible and are committed to reducing our environmental footprint every day.' },
  ];

  const team = [
    { name: 'Berry',  role: 'Co-Founder & Chef',       initial: 'B' },
    { name: 'Steven', role: 'Co-Founder & Operations',  initial: 'S' },
  ];

  const timeline = [
    { year: '2020', title: 'The Idea',        desc: 'Berry and Steven dreamed of bringing bold, fresh breakfast to West Philadelphia.' },
    { year: '2021', title: 'First Kitchen',   desc: 'Started as a pop-up at local markets — the response was overwhelming.' },
    { year: '2022', title: 'Brick & Mortar',  desc: 'Opened our first location at 3517 Lancaster Ave, Philadelphia PA 19104.' },
    { year: '2023', title: 'Growing Menu',    desc: 'Expanded to include Indonesian-inspired dishes and specialty drinks.' },
    { year: '2024', title: 'Delivery Launch', desc: 'Launched delivery service to bring Eggs Ok to more Philadelphia neighborhoods.' },
    { year: '2026', title: 'Online Ordering', desc: 'Launched our custom ordering platform for the best digital experience.' },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── STYLES (homepage reference pattern) ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* footer link hover — CSS only, no JS handlers (Server Component) */
        .footer-link {
          display: block;
          font-size: 14px;
          color: #888888;
          margin-bottom: 10px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-link:hover { color: #FED800; }

        /* ── BASE (desktop) ── */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .story-logo-side {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .timeline-row {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
        }
        .timeline-row-reverse { flex-direction: row-reverse; }
        .timeline-card-wrap   { flex: 1; }
        .timeline-card-wrap-right { text-align: right; }
        .timeline-card-wrap-left  { text-align: left; }
        .team-grid {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .cta-btns {
          display: flex;
          gap: 14px;
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

        /* ── TABLET (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .values-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ── MOBILE (≤ 768px) ── */
        @media (max-width: 768px) {
          .section-pad { padding: 56px 0 !important; }
          .hero-section { padding: 64px 0 48px !important; }
          .story-grid { grid-template-columns: 1fr; gap: 32px; }
          .story-logo-side { display: none; }
          .values-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .timeline-row,
          .timeline-row-reverse { flex-direction: row !important; }
          .timeline-card-wrap-right { text-align: left; }
          .timeline-dot { display: none; }
          .timeline-spacer { display: none; }
          .timeline-center-line { display: none; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer-brand { grid-column: unset; }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .values-grid { grid-template-columns: 1fr; }
          .cta-btns a { width: 100%; text-align: center; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        padding: '100px 0 80px',
        background: 'linear-gradient(180deg, #000 0%, #0A0A0A 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80010 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Our Story</p>
          <h1 style={{ fontSize: 'clamp(48px, 10vw, 70px)', color: '#FEFEFE', lineHeight: '0.9', marginBottom: '24px' }}>
            MADE WITH <span style={{ color: '#FED800' }}>PURPOSE</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#888888', lineHeight: '1.8', maxWidth: '580px', margin: '0 auto' }}>
            Eggs Ok was born from a simple belief — that everyone deserves a great breakfast. Fresh ingredients, bold flavors, and a whole lot of love from West Philadelphia.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div className="story-grid">
            <div className="story-logo-side">
              <div style={{ width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80025 0%, #FED80005 60%, transparent 80%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px dashed #FED80030', animation: 'spin 40s linear infinite' }} />
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px #FED80030' }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={180} height={180} style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Who We Are</p>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', color: '#FEFEFE', marginBottom: '20px' }}>
                WEST PHILLY&apos;S BREAKFAST SPOT
              </h2>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '16px' }}>
                We are Berry and Steven — two friends who believed that Philadelphia deserved a breakfast spot that was bold, fresh, and unapologetically delicious.
              </p>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '16px' }}>
                Our menu is a love letter to two cultures — the classic American breakfast sandwich elevated with Indonesian spices, sauces, and techniques that make every bite memorable.
              </p>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '28px' }}>
                From our signature Bacon Egg &amp; Cheese with housemade OK sauce to our Indonesian-inspired Telur Padang Omelette — every item tells a story.
              </p>
              <Link href="/order" className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
                Try Our Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#000' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>What We Stand For</p>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: '#FEFEFE' }}>
              OUR <span style={{ color: '#FED800' }}>VALUES</span>
            </h2>
          </div>
          <div className="values-grid">
            {values.map((val, i) => (
              <div key={i} style={{ padding: '28px 20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <val.icon size={26} color="#FED800" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#FEFEFE', marginBottom: '10px' }}>{val.title.toUpperCase()}</h3>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Our Journey</p>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: '#FEFEFE' }}>
              HOW WE <span style={{ color: '#FED800' }}>GOT HERE</span>
            </h2>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <div className="timeline-center-line" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#1A1A1A', transform: 'translateX(-50%)' }} />
            {timeline.map((item, i) => (
              <div key={i} className={`timeline-row${i % 2 !== 0 ? ' timeline-row-reverse' : ''}`}>
                <div className={`timeline-card-wrap ${i % 2 === 0 ? 'timeline-card-wrap-right' : 'timeline-card-wrap-left'}`}>
                  <div style={{ padding: '20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', display: 'inline-block', maxWidth: '280px', textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', marginBottom: '4px' }}>{item.year}</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px' }}>{item.title}</p>
                    <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                </div>
                <div className="timeline-dot" style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FED800', border: '3px solid #000', flexShrink: 0, marginTop: '20px', position: 'relative', zIndex: 1 }} />
                <div className="timeline-spacer" style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#000' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Meet The Founders</p>
          <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: '#FEFEFE', marginBottom: '48px' }}>
            THE PEOPLE <span style={{ color: '#FED800' }}>BEHIND THE EGG</span>
          </h2>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} style={{ padding: '32px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', flex: 1, minWidth: '200px', maxWidth: '280px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#000', margin: '0 auto 16px', fontFamily: 'Bebas Neue, sans-serif' }}>
                  {member.initial}
                </div>
                <h3 style={{ fontSize: 'clamp(20px, 4vw, 28px)', color: '#FEFEFE', marginBottom: '4px' }}>{member.name.toUpperCase()}</h3>
                <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad" style={{ padding: '80px 0', background: '#FED800', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(36px, 8vw, 70px)', color: '#000', marginBottom: '16px' }}>
            COME TASTE THE STORY
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#00000070', marginBottom: '32px' }}>
            3517 Lancaster Ave, Philadelphia PA 19104
          </p>
          <div className="cta-btns">
            <Link href="/order" style={{ padding: '15px 36px', background: '#000', color: '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'inline-block' }}>
              Order Online
            </Link>
            <Link href="/catering" style={{ padding: '15px 36px', background: 'transparent', border: '2px solid #00000040', color: '#000', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'inline-block' }}>
              Catering
            </Link>
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

            {/* Quick Links — CSS hover only (no JS handlers, Server Component safe) */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Links</p>
              {[
                { label: 'Home',         href: '/' },
                { label: 'Order Online', href: '/order' },
                { label: 'Catering',     href: '/catering' },
                { label: 'Our Story',    href: '/story' },
                { label: 'Contact Us',   href: '/contact' },
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