import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import { Flame, Globe, Users, MapPin, Smartphone, ArrowRight } from 'lucide-react';

export default function StoryPage() {
  return (
    <div id="story-page" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --y: #FED800;
          --r: #FC0301;
          --bg0: #000;
          --bg1: #0A0A0A;
          --bg2: #111;
          --bg3: #1A1A1A;
          --t1: #ffffff;
          --t2: #ffffff;
          --t3: #666666;
          --font-head: 'Bebas Neue', sans-serif;
          --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Accessibility ── */
        :focus-visible { outline: 2px solid var(--y); outline-offset: 3px; }
        a:focus:not(:focus-visible) { outline: none; }

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

        /* ── Story badge ── */
        .story-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(254,216,0,0.08); border: 1px solid rgba(254,216,0,0.2);
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; color: var(--y); font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          margin-bottom: 14px;
        }

        /* ── Story grid ── */
        .story-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .story-img-side { display: flex; align-items: center; justify-content: center; }

        /* ── Image frame ── */
        .story-img-frame { position: relative; width: 100%; max-width: 480px; }
        .story-img-frame::after {
          content: ''; position: absolute;
          bottom: -16px; right: -16px;
          width: 64px; height: 64px;
          border-right: 2px solid var(--y); border-bottom: 2px solid var(--y);
          pointer-events: none;
        }
        .story-img-frame-alt::after {
          right: auto; left: -16px;
          border-right: none; border-left: 2px solid var(--y);
        }
        .story-img-frame img {
          object-fit: cover; border-radius: 16px;
          display: block; width: 100%; height: auto; aspect-ratio: 4/3;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .story-img-frame:hover img { transform: scale(1.02); }

        /* ── Chapter watermark ── */
        .chapter-num {
          position: absolute; top: -44px; left: 0;
          font-size: 140px; font-family: var(--font-head);
          color: rgba(254,216,0,0.04); line-height: 1;
          pointer-events: none; user-select: none;
        }

        /* ── Floating label badge on images ── */
        .img-float-badge {
          position: absolute; bottom: -14px; left: -14px;
          background: var(--y); color: #000;
          font-family: var(--font-head); font-size: 14px; letter-spacing: 2px;
          padding: 7px 16px; border-radius: 8px; z-index: 2;
        }
        .img-float-badge-dark {
          position: absolute; bottom: -14px; right: -14px;
          background: var(--bg2); border: 1px solid rgba(254,216,0,0.2);
          color: var(--y); font-family: var(--font-head);
          font-size: 13px; letter-spacing: 2px;
          padding: 7px 14px; border-radius: 8px; z-index: 2;
        }
        .img-float-badge-top {
          position: absolute; top: -14px; right: -14px;
          background: var(--bg2); border: 1px solid rgba(254,216,0,0.2);
          color: var(--y); font-family: var(--font-head);
          font-size: 13px; letter-spacing: 2px;
          padding: 7px 14px; border-radius: 8px; z-index: 2;
        }
        .img-float-location {
          position: absolute; bottom: -14px; right: -14px;
          background: var(--bg2); border: 1px solid #333;
          border-radius: 10px; padding: 10px 14px;
          display: flex; align-items: center; gap: 7px; z-index: 2;
        }

        /* ── Story body text ── */
        .story-body {
          font-size: 15px; color: var(--t2);
          line-height: 1.85; margin-bottom: 20px;
        }

        /* ── Pull quote ── */
        .pull-quote {
          border-left: 3px solid var(--y);
          padding: 12px 20px;
          background: #0D0D0D; border-radius: 0 8px 8px 0;
          margin: 22px 0;
        }
        .pull-quote p {
          font-size: 15px; color: var(--t2);
          font-style: italic; line-height: 1.75; margin: 0;
        }

        /* ── Stat pills ── */
        .stat-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
        .stat-pill {
          display: inline-flex; flex-direction: column; align-items: center;
          background: var(--bg2); border: 1px solid #1E1E1E;
          border-radius: 12px; padding: 14px 20px; min-width: 88px;
          transition: border-color 0.2s;
        }
        .stat-pill:hover { border-color: rgba(254,216,0,0.2); }
        .stat-pill-value {
          font-size: 24px; font-family: var(--font-head); color: var(--y); line-height: 1;
        }
        .stat-pill-label {
          font-size: 10px; color: var(--t3);
          text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;
        }

        /* ── Feature checklist ── */
        .feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 32px; }
        .feature-item { display: flex; align-items: center; gap: 10px; }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--y); flex-shrink: 0; }
        .feature-text { font-size: 13px; color: var(--t2); font-weight: 500; }

        /* ── CTA group ── */
        .cta-group { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ── Divider ── */
        .section-divider { border: none; border-top: 1px solid #141414; margin: 0; }

        /* ── FOOTER ── */
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          gap: 48px; margin-bottom: 40px;
        }
        .footer-bottom {
          border-top: 1px solid #1A1A1A; padding-top: 24px;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .footer-link {
          display: block; font-size: 14px; color: var(--t1);
          margin-bottom: 11px; text-decoration: none;
          transition: color 0.15s, padding-left 0.15s;
        }
        .footer-link:hover { color: var(--y); padding-left: 4px; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .section-pad { padding: 64px 0 !important; }
          .story-grid { grid-template-columns: 1fr; gap: 36px; }
          .story-img-side { order: -1; }
          .story-img-frame { max-width: 100%; }
          .story-img-frame::after { display: none; }
          .img-float-badge, .img-float-badge-dark, .img-float-badge-top, .img-float-location { display: none; }
          .chapter-num { display: none; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 14px; }
          .feature-list { grid-template-columns: 1fr; }
          .cta-group .btn-yellow, .cta-group .btn-outline { flex: 1; justify-content: center; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .story-img-frame img, .btn-yellow, .btn-outline, .stat-pill { transition: none; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="story-hero" className="hero-section" style={{ padding: '120px 0 88px', background: '#000', position: 'relative', overflow: 'hidden' }}>

        {/* Glow */}
        <div className="hero-glow" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,216,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: '#141414' }} aria-hidden="true" />

        <div className="container hero-container" style={{ textAlign: 'center', position: 'relative' }}>
          <span id="hero-label" className="sec-label" style={{ justifyContent: 'center', display: 'block' }}>Our Story</span>
          <h1 id="hero-title" className="bebas" style={{ fontSize: 'clamp(52px, 10vw, 80px)', color: '#ffffff', lineHeight: '0.93', marginBottom: '24px' }}>
            MADE WITH <span style={{ color: 'var(--y)' }}>PURPOSE</span>
          </h1>
          <p id="hero-subtitle" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--t2)', lineHeight: '1.8', maxWidth: '540px', margin: '0 auto 40px' }}>
            Born from a simple belief — everyone deserves a great breakfast. Fresh ingredients, bold flavors, from West Philadelphia.
          </p>
          <div id="hero-stats" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {[{ n: '2020', l: 'Founded' }, { n: '80+', l: 'Menu Items' }, { n: '100%', l: 'Made Fresh' }, { n: '5★', l: 'Rated' }].map(s => (
              <div key={s.l} className="stat-pill">
                <span className="stat-pill-value">{s.n}</span>
                <span className="stat-pill-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 1 — THE ORIGIN
      ══════════════════════════════════════════ */}
      <section id="story-origin" className="section-pad" style={{ padding: '96px 0', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div className="section-bg-glow" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(254,216,0,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container origin-container">
          <div className="story-grid origin-grid">

            {/* Image side */}
            <div id="origin-img-side" className="story-img-side">
              <div id="origin-img-frame" className="story-img-frame">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="The original Eggs Ok sandwich"
                  width={480} height={360}
                  style={{ objectFit: 'cover', borderRadius: '16px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div id="origin-badge" className="img-float-badge">EST. 2020</div>
              </div>
            </div>

            {/* Text side */}
            <div id="origin-text" style={{ position: 'relative' }}>
              <span className="chapter-num" aria-hidden="true">01</span>
              <div id="origin-story-badge" className="story-badge"><Flame size={10} aria-hidden="true" /> The Origin</div>
              <h2 id="origin-heading" className="bebas" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--t1)', lineHeight: '0.95', marginBottom: '22px' }}>
                TWO FRIENDS,<br /><span style={{ color: 'var(--y)' }}>ONE BIG IDEA</span>
              </h2>
              <p id="origin-body" className="story-body">
                Berry — raised on bold Indonesian flavors — and Steven — a Philly guy who lived on corner-store egg sandwiches — asked a simple question: why couldn&apos;t breakfast be both?
              </p>
              <blockquote id="origin-quote" className="pull-quote">
                <p>&ldquo;We didn&apos;t want to choose between the food we loved. So we built a place that had all of it.&rdquo;</p>
              </blockquote>
              <div id="origin-stats" className="stat-pills">
                {[{ n: '2020', l: 'Founded' }, { n: '3+', l: 'Years Serving' }, { n: '100%', l: 'Made Fresh' }].map(s => (
                  <div key={s.l} className="stat-pill">
                    <span className="stat-pill-value">{s.n}</span>
                    <span className="stat-pill-label">{s.l}</span>
                  </div>
                ))}
              </div>
              <div id="origin-cta" className="cta-group">
                <Link href="/order" className="btn-yellow">
                  Taste the Story <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════════════════════════════════════
          SECTION 2 — THE FOOD
      ══════════════════════════════════════════ */}
      <section id="story-food" className="section-pad" style={{ padding: '96px 0', background: '#060606', position: 'relative', overflow: 'hidden' }}>
        <div className="section-bg-glow" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(254,216,0,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container food-container">
          <div className="story-grid food-grid">

            {/* Text side */}
            <div id="food-text" style={{ position: 'relative' }}>
              <span className="chapter-num" aria-hidden="true">02</span>
              <div id="food-story-badge" className="story-badge"><Globe size={10} aria-hidden="true" /> The Food</div>
              <h2 id="food-heading" className="bebas" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--t1)', lineHeight: '0.95', marginBottom: '22px' }}>
                TWO CULTURES,<br /><span style={{ color: 'var(--y)' }}>ONE PLATE</span>
              </h2>
              <p id="food-body" className="story-body">
                Classic Philly breakfast meets Indonesian technique — sambal heat, kecap manis sweetness, Padang spice. Nothing frozen. Our OK Sauce and Telur Padang Omelette are made fresh every single morning.
              </p>
              <ul id="food-features" className="feature-list" aria-label="Food highlights">
                {['Housemade OK Sauce', 'No freezers. Ever.', 'Indonesian-spiced dishes', 'Locally sourced', 'Gluten-free options', 'Breakfast all day'].map(item => (
                  <li key={item} className="feature-item">
                    <div className="feature-dot" aria-hidden="true" />
                    <span className="feature-text">{item}</span>
                  </li>
                ))}
              </ul>
              <div id="food-cta" className="cta-group">
                <Link href="/order" className="btn-yellow">
                  Explore the Menu <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Image side */}
            <div id="food-img-side" className="story-img-side">
              <div id="food-img-frame" className="story-img-frame story-img-frame-alt">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="Eggs Ok — fresh, made to order"
                  width={480} height={360}
                  style={{ objectFit: 'cover', borderRadius: '16px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div id="food-badge" className="img-float-badge-top">MADE FRESH DAILY</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════════════════════════════════════
          SECTION 3 — COMMUNITY
      ══════════════════════════════════════════ */}
      <section id="story-community" className="section-pad" style={{ padding: '96px 0', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div className="section-bg-glow" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 60%, rgba(254,216,0,0.04) 0%, transparent 55%)', pointerEvents: 'none' }} aria-hidden="true" />

        <div className="container community-container">
          <div className="story-grid community-grid">

            {/* Image side */}
            <div id="community-img-side" className="story-img-side">
              <div id="community-img-frame" className="story-img-frame">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="Serving West Philadelphia"
                  width={480} height={360}
                  style={{ objectFit: 'cover', borderRadius: '16px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div id="community-location-badge" className="img-float-location">
                  <MapPin size={13} color="#FED800" aria-hidden="true" />
                  <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '500' }}>West Philadelphia, PA</span>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div id="community-text" style={{ position: 'relative' }}>
              <span className="chapter-num" aria-hidden="true">03</span>
              <div id="community-story-badge" className="story-badge"><Users size={10} aria-hidden="true" /> The Community</div>
              <h2 id="community-heading" className="bebas" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--t1)', lineHeight: '0.95', marginBottom: '22px' }}>
                WEST PHILLY<br /><span style={{ color: 'var(--y)' }}>IS HOME</span>
              </h2>
              <p id="community-body" className="story-body">
                3517 Lancaster Ave isn&apos;t just our address — it&apos;s our anchor. Every order supports our local team and the neighborhood we&apos;ve always called home.
              </p>
              <blockquote id="community-quote" className="pull-quote">
                <p>&ldquo;When the neighborhood eats well, the neighborhood does well. That&apos;s always been the point.&rdquo;</p>
              </blockquote>
              <div id="community-cta" className="cta-group">
                <Link href="/order" className="btn-yellow">
                  Order Now <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/catering" className="btn-outline">
                  Catering
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="story-footer" className="site-footer" style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
        <div className="container footer-container">
          <div id="footer-grid" className="footer-grid">

            {/* Brand */}
            <div id="footer-brand" className="footer-brand">
              <div id="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div id="footer-logo-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={100} height={50} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p id="footer-tagline" style={{ fontSize: '14px', color: 'var(--t1)', lineHeight: '1.75', maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address id="footer-address" style={{ fontStyle: 'normal' }}>
                <p id="footer-address-line" style={{ fontSize: '13px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#FED800" aria-hidden="true" />
                  <a href="https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104" id="footer-address-link" style={{ color: 'var(--t1)', textDecoration: 'none', transition: 'color 0.15s' }}>
                    3517 Lancaster Ave, Philadelphia PA 19104
                  </a>
                </p>
                <p id="footer-phone-line" style={{ fontSize: '13px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#FED800" aria-hidden="true" />
                  <a href="tel:2159489902" id="footer-phone-link" style={{ color: 'var(--t1)', textDecoration: 'none', transition: 'color 0.15s' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            {/* Quick links */}
            <nav id="footer-nav" aria-label="Quick links">
              <p id="footer-nav-heading" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
              {[
                { label: 'Home',         href: '/'           },
                { label: 'Order Online', href: '/order'      },
                { label: 'Catering',     href: '/catering'   },
                { label: 'Our Story',    href: '/story'      },
                { label: 'Gift Cards',   href: '/gift-cards' },
                { label: 'Contact',      href: '/contact'    },
              ].map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>

            {/* Hours */}
            <div id="footer-hours">
              <p id="footer-hours-heading" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div id="footer-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { day: 'Monday',  hours: '8:00 AM – 10:00 PM' },
                  { day: 'Tuesday',  hours: '8:00 AM – 10:00 PM' },
                  { day: 'Wednesday',  hours: '8:00 AM – 10:00 PM' },
                  { day: 'Thursday',  hours: '8:00 AM – 10:00 PM' },
                  { day: 'Friday',  hours: '8:00 AM – 11:00 PM' },
                  { day: 'Saturday',   hours: '9:00 AM – 11:00 PM' },
                  { day: 'Sunday',     hours: '9:00 AM – 9:00 PM'  },
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
            <p id="footer-copyright" style={{ fontSize: '13px', color: 'var(--t1)' }}>
              &copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.
            </p>
            <p id="footer-credit" style={{ fontSize: '13px', color: 'var(--t1)' }}>
              Built by <span id="footer-credit-brand" style={{ color: 'var(--y)' }}>RestoRise Business Solutions</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}