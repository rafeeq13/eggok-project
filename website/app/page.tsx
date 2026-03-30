'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import { 
  MapPin, 
  Clock, 
  Car, 
  Smartphone,
  Sandwich,
  Coffee,
  Egg,
  Milk,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    { name: 'Breakfast Sandwiches', icon: Sandwich, count: 9 },
    { name: 'Burritos', icon: Sandwich, count: 4 },
    { name: 'Omelettes', icon: Egg, count: 6 },
    { name: 'Pancakes', icon: Egg, count: 2 },
    { name: 'Specialty Lattes', icon: Coffee, count: 4 },
    { name: 'Matcha Edition', icon: Coffee, count: 9 },
    { name: 'Smoothies', icon: Milk, count: 7 },
    { name: 'Lunch Sandwiches', icon: Sandwich, count: 4 },
  ];
  const highlights = [
    { icon: MapPin, title: 'West Philadelphia', desc: '3517 Lancaster Ave, Philadelphia PA 19104' },
    { icon: Clock, title: 'Open Daily', desc: 'Mon–Fri 8AM–10PM · Sat–Sun 9AM–11PM' },
    { icon: Car, title: 'Pickup & Delivery', desc: 'Order online — ready in 15 minutes' },
    { icon: Smartphone, title: 'Mobile App', desc: 'iOS and Android — coming soon' },
  ];

  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
      .hero-title{
      font-size: clamp(42px, 7vw, 55px);
      line-height:.95;
      margin-bottom:32px;
      // margin-left:40px;
      }

      .white{ color:#FEFEFE }
      .yellow{ color:#FED800 }

      @media (max-width:768px){
        .hero-title{
          text-align:center;
          margin-left:0;
        }

      .scroll-indicator {
        display: none;
      }

      }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hero-logo-side {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: #FED800;
          border: 1px solid #FED800;
          border-radius: 16px;
          overflow: hidden;
          margin: 40px 0px;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 40px;
        }
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 20px;
        }
        .hero-stats {
          display: flex;
          gap: 32px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #1A1A1A;
        }
        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-buttons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
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
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .highlights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .how-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
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
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .hero-logo-side {
            display: none !important;
          }
          .highlights-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 24px 0;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .how-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-brand {
            grid-column: unset;
          }
          .hero-stats {
            gap: 20px;
            margin-top: 32px;
            padding-top: 24px;
            justify-content: center;
          }
          .hero-section {
            padding-top: 24px !important;
            padding-bottom: 40px !important;
          }
          .section-pad {
            padding: 48px 0 !important;
          }
          .section-pad-sm {
            padding: 40px 0 !important;
          }
        }

        /* ── SMALL MOBILE (≤ 480px) ── */
        @media (max-width: 480px) {
          .highlights-grid {
            grid-template-columns: 1fr;
          }
          .highlights-item {
            padding: 20px 18px !important;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .cat-item {
            padding: 18px 14px !important;
          }
          .hero-badge {
            font-size: 11px !important;
          }
          .hero-buttons .btn-primary,
          .hero-buttons .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .cta-buttons a {
            width: 100%;
            justify-content: center;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}
      </style>

      <Header />

      {/* ── HERO SECTION ── */}
      <section className="hero-section" style={{
        minHeight: '20vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #000000 0%, #0A0A0A 50%, #111100 100%)',
        padding: '30px 0 20px',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, #FED80015 0%, transparent 60%), radial-gradient(circle at 80% 50%, #FC030110 0%, transparent 60%)',
        }} />

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          border: '1px solid #FED80020',
        }} />
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '300px', height: '300px', borderRadius: '50%',
          border: '1px solid #FED80030',
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          border: '1px solid #FED80015',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-grid">
            {/* Left — Text */}
            <div>
              <div className="hero-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#FED80015', border: '1px solid #FED80030',
                borderRadius: '20px', padding: '6px 16px', marginBottom: '24px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: '#FED800', fontWeight: '600' }}>Now Open — Order Online</span>
              </div>

            <h1 className="hero-title">
  <span className="white">BREAKFAST</span>
  <span className="yellow">&nbsp;&amp; LUNCH</span>
  <span className="white">&nbsp;DONE RIGHT</span>
</h1>

              <p style={{
                fontSize: 'clamp(14px, 2vw, 17px)', color: '#888888',
                lineHeight: '1.7', maxWidth: '440px',
                marginBottom: '40px', fontWeight: '400',
              }}>
                Fresh made-to-order breakfast sandwiches, burritos, omelettes and specialty drinks. Located in the heart of West Philadelphia.
              </p>

              <div className="hero-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' as const }}>
                <Link href="/order" className="btn-primary" style={{ fontSize: '16px', padding: '15px 32px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
                  </svg>
                  Order Online
                </Link>
                <a href="tel:2159489902" className="btn-secondary" style={{ fontSize: '16px', padding: '15px 32px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6z"/>
                  </svg>
                  Call Us
                </a>
              </div>

              {/* Stats */}
              <div className="hero-stats">
                {[
                  { value: '80+', label: 'Menu Items' },
                  { value: '14', label: 'Categories' },
                  { value: '15min', label: 'Avg Ready Time' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '800', color: '#FED800', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>{stat.value}</p>
                    <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Logo */}
            <div className="hero-logo-side">
              <div style={{
                width: 'clamp(260px, 35vw, 400px)', height: 'clamp(260px, 35vw, 400px)', borderRadius: '50%',
                background: 'radial-gradient(circle, #FED80020 0%, transparent 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: '-20px',
                  borderRadius: '50%',
                  border: '2px dashed #FED80030',
                  animation: 'spin 30s linear infinite',
                }} />
                <div style={{
                  width: 'clamp(180px, 25vw, 280px)', height: 'clamp(180px, 25vw, 280px)',
                  borderRadius: '50%',
                  background: '#FED800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 80px #FED80040, 0 0 160px #FED80020',
                }}>
                  <Image
                    src="/logo.svg"
                    alt="Eggs Ok"
                    width={220}
                    height={220}
                    style={{ objectFit: 'contain', width: '80%', height: '80%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px',
          animation: 'fadeUp 1s ease 1s both',
        }}>
          <p className="scroll-indicator" style={{ fontSize: '11px', color: '#888888', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</p>
          <div className="scroll-indicator" style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(to bottom, #888888, transparent)',
          }} />
        </div>
      </section>

      {/* ── HIGHLIGHTS ── */}
      <section className="section-pad-sm" style={{ padding: '20px 0', background: '#FED800' }}>
        <div className="container">
          <div className="highlights-grid">
            {highlights.map((item, i) => (
              <div key={i} className="highlights-item" style={{
                padding: '32px 24px',
                background: '#0A0A0A',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#111111'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#0A0A0A'}
              >
                <div style={{ marginBottom: '12px' }}>
                  <item.icon size={28} color="#FED800" strokeWidth={2.2} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU CATEGORIES ── */}
      <section className="section-pad" style={{ padding: '20px 0', background: '#000' }}>
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px',textAlign: 'center' }}>Our Menu</p>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 50px)', color: '#FEFEFE', marginBottom: '16px',textAlign: 'center' }}>
              SOMETHING FOR 
              <span style={{ color: '#FED800' }}> EVERYONE</span>
            </h2>
            <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#888888', maxWidth: '500px' }}>
              From classic breakfast sandwiches to specialty matcha drinks — we have got you covered all day long.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link href="/order" key={i} className="cat-item" style={{
                padding: '24px 20px',
                background: '#111111',
                border: '1px solid #1A1A1A',
                borderRadius: '14px',
                transition: 'all 0.2s',
                display: 'block',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#1A1A1A';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FED80040';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#111111';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <cat.icon size={28} color="#FED800" strokeWidth={2.2} />
                </div>
                <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{cat.name}</p>
                <p style={{ fontSize: '12px', color: '#888888' }}>{cat.count} items</p>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/order" className="btn-primary" style={{ fontSize: '16px', padding: '15px 40px' }}>
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ padding: '20px 0', background: '#0A0A0A' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Simple &amp; Fast</p>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 50px)', color: '#FEFEFE' }}>
              HOW IT <span style={{ color: '#FED800' }}>WORKS</span>
            </h2>
          </div>

          <div className="how-grid">
            {[
              { step: '01', title: 'Browse Menu', desc: 'Browse our full menu and customize your order exactly how you like it.', color: '#FED800' },
              { step: '02', title: 'Choose Pickup or Delivery', desc: 'Pick up at 3517 Lancaster Ave or get it delivered to your door.', color: '#FC0301' },
              { step: '03', title: 'Enjoy Your Food', desc: 'Your order will be ready in approximately 15 minutes. Fresh every time.', color: '#22C55E' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '40px 32px',
                background: '#111111',
                border: '1px solid #1A1A1A',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <p style={{
                  position: 'absolute', top: '-10px', right: '20px',
                  fontSize: '80px', fontFamily: 'Bebas Neue, sans-serif',
                  color: `${item.color}10`, lineHeight: '1',
                }}>{item.step}</p>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${item.color}20`, border: `1px solid ${item.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <p style={{ fontSize: '20px', fontFamily: 'Bebas Neue, sans-serif', color: item.color, fontWeight: '700' }}>{item.step}</p>
                </div>
                <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#FEFEFE', marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="section-pad" style={{
        padding: '20px 0',
        background: 'linear-gradient(135deg, #FED800 0%, #E5C200 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.05)',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(36px, 8vw, 70px)', color: '#000', marginBottom: '16px' }}>
            READY TO ORDER?
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#00000080', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Fresh breakfast and lunch made to order. Available for pickup and delivery daily.
          </p>
          <div className="cta-buttons">
            <Link href="/order" style={{
              padding: '16px 40px', background: '#000', color: '#FED800',
              borderRadius: '12px', fontSize: '16px', fontWeight: '700',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
              </svg>
              Order Online Now
            </Link>
            <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" style={{
              padding: '16px 40px', background: 'transparent', color: '#000',
              borderRadius: '12px', fontSize: '16px', fontWeight: '700',
              border: '2px solid #00000030',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#000'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00000030'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Get Directions
            </a>
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
                <Smartphone size={14} /> <a href="tel:2159489902" style={{ color: '#888888' }}>215-948-9902</a>
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffffff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Links</p>
              {['Home', 'Menu', 'Order Online'].map(link => (
                <Link key={link} href={link === 'Menu' || link === 'Order Online' ? '/order' : '/'} style={{ display: 'block', fontSize: '14px', color: '#ffffffff', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffffffff'}
                >{link}</Link>
              ))}
            </div>

            {/* Hours */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Hours</p>
              {[
                { day: 'Mon – Fri', hours: '8:00 AM – 10:00 PM' },
                { day: 'Saturday', hours: '9:00 AM – 11:00 PM' },
                { day: 'Sunday', hours: '9:00 AM – 9:00 PM' },
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
    </main>
  );
}