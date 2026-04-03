import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import { Flame, Globe, Users, MapPin, Smartphone } from 'lucide-react';

export default function StoryPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      <style>{`
        .footer-link {
          display: block;
          font-size: 14px;
          color: #888888;
          margin-bottom: 10px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-link:hover { color: #FED800; }

        /* ── story grid ── */
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

        /* ── image frame ── */
        .story-img-frame {
          position: relative;
          width: 100%;
          max-width: 460px;
        }
        .story-img-frame::after {
          content: '';
          position: absolute;
          bottom: -16px;
          right: -16px;
          width: 60px;
          height: 60px;
          border-right: 2px solid #FED800;
          border-bottom: 2px solid #FED800;
          pointer-events: none;
        }
        .story-img-frame-alt::after {
          right: auto;
          left: -16px;
          border-right: none;
          border-left: 2px solid #FED800;
        }

        /* ── chapter watermark ── */
        .chapter-num {
          position: absolute;
          top: -36px;
          left: 0;
          font-size: 130px;
          font-family: 'Bebas Neue', sans-serif;
          color: #FED80008;
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }

        /* ── stat pills ── */
        .stat-pill {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 12px 18px;
          min-width: 80px;
        }
        .stat-pill span:first-child {
          font-size: 22px;
          font-family: 'Bebas Neue', sans-serif;
          color: #FED800;
          line-height: 1;
        }
        .stat-pill span:last-child {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 3px;
        }

        /* ── pull quote ── */
        .pull-quote {
          border-left: 3px solid #FED800;
          padding: 10px 18px;
          background: #0F0F0F;
          border-radius: 0 6px 6px 0;
          margin: 20px 0;
        }
        .pull-quote p {
          font-size: 15px;
          color: #CCCCCC;
          font-style: italic;
          line-height: 1.7;
          margin: 0;
        }

        /* ── story badge ── */
        .story-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FED80015;
          border: 1px solid #FED80030;
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 11px;
          color: #FED800;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        /* ── footer ── */
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

        /* ── TABLET ── */
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .section-pad { padding: 56px 0 !important; }
          .hero-section { padding: 64px 0 48px !important; }
          .story-grid { grid-template-columns: 1fr; gap: 28px; }
          .story-logo-side { order: -1; }
          .story-img-frame { max-width: 100%; }
          .story-img-frame::after { display: none; }
          .chapter-num { display: none; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer-brand { grid-column: unset; }
        }

        /* ── SMALL MOBILE ── */
        @media (max-width: 480px) {
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
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, #FED80010 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Our Story</p>
          <h1 style={{ fontSize: 'clamp(42px, 10vw, 68px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px' }}>
            MADE WITH <span style={{ color: '#FED800' }}>PURPOSE</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#888888', lineHeight: '1.8', maxWidth: '520px', margin: '0 auto' }}>
            Born from a simple belief — everyone deserves a great breakfast. Fresh ingredients, bold flavors, from West Philadelphia.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 1 — THE ORIGIN
          ═══════════════════════════════════════ */}
      <section className="section-pad" style={{
        padding: '90px 0', background: '#000', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 50%, #FED80008 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <div className="story-grid">

            <div className="story-logo-side">
              <div className="story-img-frame">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="The original Eggs Ok sandwich"
                  width={460}
                  height={345}
                  style={{ objectFit: 'cover', borderRadius: '6px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div style={{
                  position: 'absolute', bottom: '-12px', left: '-12px',
                  background: '#FED800', color: '#000',
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: '15px', letterSpacing: '2px',
                  padding: '7px 14px', borderRadius: '4px',
                }}>
                  EST. 2020
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <span className="chapter-num">01</span>
              <div className="story-badge"><Flame size={10} /> The Origin</div>
              <h2 style={{ fontSize: 'clamp(30px, 5vw, 46px)', color: '#FEFEFE', lineHeight: '1', marginBottom: '20px', fontFamily: 'Bebas Neue, sans-serif' }}>
                TWO FRIENDS,<br /><span style={{ color: '#FED800' }}>ONE BIG IDEA</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.85', marginBottom: '4px' }}>
                Berry — raised on bold Indonesian flavors — and Steven — a Philly guy who lived on corner-store egg sandwiches — asked a simple question: why couldn&apos;t breakfast be both?
              </p>
              <div className="pull-quote">
                <p>&ldquo;We didn&apos;t want to choose between the food we loved. So we built a place that had all of it.&rdquo;</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {[{ n: '2020', l: 'Founded' }, { n: '3+', l: 'Years Serving' }, { n: '100%', l: 'Made Fresh' }].map(s => (
                  <div key={s.l} className="stat-pill">
                    <span>{s.n}</span><span>{s.l}</span>
                  </div>
                ))}
              </div>
              <Link href="/order" className="btn-primary" style={{ fontSize: '14px', padding: '13px 28px' }}>
                Taste the Story
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — THE FOOD
          ═══════════════════════════════════════ */}
      <section className="section-pad" style={{
        padding: '90px 0', background: '#070707', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, #FED80006 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <div className="story-grid">

            <div style={{ position: 'relative' }}>
              <span className="chapter-num">02</span>
              <div className="story-badge"><Globe size={10} /> The Food</div>
              <h2 style={{ fontSize: 'clamp(30px, 5vw, 46px)', color: '#FEFEFE', lineHeight: '1', marginBottom: '20px', fontFamily: 'Bebas Neue, sans-serif' }}>
                TWO CULTURES,<br /><span style={{ color: '#FED800' }}>ONE PLATE</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.85', marginBottom: '20px' }}>
                Classic Philly breakfast meets Indonesian technique — sambal heat, kecap manis sweetness, Padang spice. Nothing frozen. Our OK Sauce and Telur Padang Omelette are made fresh every single morning.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                {['Housemade OK Sauce', 'No freezers. Ever.', 'Indonesian-spiced dishes', 'Locally sourced', 'Gluten-free options', 'Breakfast all day'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FED800', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#AAAAAA' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/order" className="btn-primary" style={{ fontSize: '14px', padding: '13px 28px' }}>
                Explore the Menu
              </Link>
            </div>

            <div className="story-logo-side">
              <div className="story-img-frame story-img-frame-alt">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="Eggs Ok — fresh, made to order"
                  width={460}
                  height={345}
                  style={{ objectFit: 'cover', borderRadius: '6px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div style={{
                  position: 'absolute', top: '-12px', right: '-12px',
                  background: '#111', border: '1px solid #FED80040',
                  color: '#FED800', fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '13px', letterSpacing: '2px', padding: '7px 14px', borderRadius: '4px',
                }}>
                  MADE FRESH DAILY
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — COMMUNITY
          ═══════════════════════════════════════ */}
      <section className="section-pad" style={{
        padding: '90px 0', background: '#000', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 70% 60%, #FED80008 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <div className="story-grid">

            <div className="story-logo-side">
              <div className="story-img-frame">
                <Image
                  src="/main-menu/Fully Loaded Sandwich.jpg"
                  alt="Serving West Philadelphia"
                  width={460}
                  height={345}
                  style={{ objectFit: 'cover', borderRadius: '6px', display: 'block', width: '100%', height: 'auto', aspectRatio: '4/3' }}
                />
                <div style={{
                  position: 'absolute', bottom: '-12px', right: '-12px',
                  background: '#111', border: '1px solid #333',
                  borderRadius: '8px', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <MapPin size={13} color="#FED800" />
                  <span style={{ fontSize: '12px', color: '#AAAAAA', fontWeight: '500' }}>West Philadelphia, PA</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <span className="chapter-num">03</span>
              <div className="story-badge"><Users size={10} /> The Community</div>
              <h2 style={{ fontSize: 'clamp(30px, 5vw, 46px)', color: '#FEFEFE', lineHeight: '1', marginBottom: '20px', fontFamily: 'Bebas Neue, sans-serif' }}>
                WEST PHILLY<br /><span style={{ color: '#FED800' }}>IS HOME</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.85', marginBottom: '4px' }}>
                3517 Lancaster Ave isn&apos;t just our address — it&apos;s our anchor. Every order supports our local team and the neighborhood we&apos;ve always called home.
              </p>
              <div className="pull-quote">
                <p>&ldquo;When the neighborhood eats well, the neighborhood does well. That&apos;s always been the point.&rdquo;</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/order" className="btn-primary" style={{ fontSize: '14px', padding: '13px 28px' }}>
                  Order Now
                </Link>
                <Link href="/catering" style={{
                  fontSize: '14px', padding: '13px 28px',
                  border: '1px solid #333', borderRadius: '6px',
                  color: '#AAAAAA', textDecoration: 'none',
                }}>
                  Catering
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0A0A', padding: '48px 0 32px', borderTop: '1px solid #1A1A1A' }}>
        <div className="container">
          <div className="footer-grid">

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