'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Header from './components/Header';
import {
  MapPin,
  Clock,
  Car,
  Smartphone,
  Star,
  ChevronDown,
  Gift,
  Truck,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FAVORITES = [
  { name: 'Ultimate Sammies Sandwich', img: 'main-menu/Fully Loaded Sandwich.jpg', price: '$14.50', tag: 'Best Seller', desc: '2 fried eggs, Cheddar, hashbrown, applewood smoked bacon' },
  { name: 'Breakfast BLT Sandwich', img: 'main-menu/Breakfast BLT Sandwich.jpg', price: '$14.50', tag: 'Popular', desc: 'Applewood smoked bacon, romaine, tomato, 2 fried eggs' },
  { name: 'Fully Loaded Sandwich', img: 'main-menu/Fully Loaded Sandwich.jpg', price: '$14.50', tag: 'Fan Fave', desc: 'Scrambled eggs, Cheddar, tomato, avocado, spinach' },
  { name: 'Sunrise Burrito', img: 'main-menu/Sunrise Burrito.jpg', price: '$13.00', tag: 'New', desc: 'Scrambled eggs, black beans, salsa, sour cream, cheddar' },
  { name: 'Avocado Omelette', img: 'main-menu/Avocado Omelette.jpg', price: '$13.50', tag: 'Healthy', desc: 'Fresh avocado, spinach, tomato, pepper jack cheese' },
  { name: 'Brown Sugar Latte', img: 'main-menu/Brown Sugar Latte.jpg', price: '$6.50', tag: 'Popular', desc: 'Espresso, oat milk, brown sugar cinnamon syrup' },
];

const CATEGORIES = [
  { name: 'Breakfast Sandwiches', img: 'main-menu/Breakfast BLT Sandwich.jpg', count: 9 },
  { name: 'Burritos', img: 'main-menu/Sunrise Burrito.jpg', count: 4 },
  { name: 'Not Sandwiches', img: 'main-menu/Fully Loaded Sandwich.jpg', count: 5 },
  { name: 'Pancakes', img: 'main-menu/Avocado Omelette.jpg', count: 2 },
  { name: 'Omelettes', img: 'main-menu/Avocado Omelette.jpg', count: 6 },
  { name: 'Lunch Sandwiches', img: 'main-menu/Breakfast BLT Sandwich.jpg', count: 4 },
  { name: 'Specialty Lattes', img: 'main-menu/Brown Sugar Latte.jpg', count: 4 },
  { name: 'Matcha Edition', img: 'main-menu/Avocado Omelette.jpg', count: 9 },
  { name: 'Cold Foam', img: 'main-menu/Brown Sugar Latte.jpg', count: 3 },
  { name: 'Smoothies', img: 'main-menu/Avocado Omelette.jpg', count: 7 },
  { name: 'Wellness Smoothies', img: 'main-menu/Avocado Omelette.jpg', count: 4 },
  { name: 'Coffee & Tea', count: 6 },
];

const REVIEWS = [
  { name: 'Jasmine T.', stars: 5, text: 'Best breakfast spot in West Philly hands down. The Fully Loaded Sandwich is absolutely insane — I order it every single week.', date: 'March 2025' },
  { name: 'Marcus R.', stars: 5, text: 'Ordered online and it was ready in 12 minutes. Fresh, hot, and exactly what I wanted. The brown sugar latte is a must.', date: 'February 2025' },
  { name: 'Priya K.', stars: 5, text: 'The matcha drinks here are genuinely the best I have had outside of a specialty café. And the breakfast burrito? Chef\'s kiss.', date: 'January 2025' },
  { name: 'Devon M.', stars: 5, text: 'Catered our office breakfast meeting and every single person was raving. Huge variety, everything was delicious. Will definitely book again.', date: 'December 2024' },
];

const FAQS = [
  { q: 'What are your hours?', a: 'We\'re open Monday–Friday 8AM–10PM and Saturday–Sunday 9AM–11PM. Hours may vary on holidays — check our social media for updates.' },
  { q: 'Do you offer delivery?', a: 'Yes! We offer both pickup and delivery. You can place your order online and choose your preferred method at checkout. Delivery radius covers most of West Philadelphia.' },
  { q: 'How long does an order take?', a: 'Pickup orders are typically ready in about 15 minutes. Delivery times depend on your location and current demand, usually 25–40 minutes.' },
  { q: 'Can I customize my order?', a: 'Absolutely. Our online ordering system lets you add modifiers, swap ingredients, and leave special instructions for every item.' },
  { q: 'Do you do catering?', a: 'Yes! We cater corporate events, birthday parties, brunch gatherings and more. Visit our Catering page to submit a request and we\'ll get back to you within 24 hours.' },
  { q: 'Is there parking available?', a: 'Street parking is available on Lancaster Ave. We\'re also steps away from several SEPTA bus stops for easy transit access.' },
];

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* Bebas headings */
        .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; line-height: 0.92; }

        /* Buttons */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #FED800; color: #000;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          font-family: inherit;
        }
        .btn-yellow:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #FED80040; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: #FEFEFE;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #333;
          transition: border-color 0.15s, color 0.15s;
          font-family: inherit; cursor: pointer;
        }
        .btn-outline:hover { border-color: #FED800; color: #FED800; }

        /* Section label */
        .sec-label {
          font-size: 12px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #FED800; margin-bottom: 12px;
          display: block;
        }

        /* ── HERO ── */
        .hero-section {
          min-height: 92vh; display: flex; align-items: center;
          background: linear-gradient(135deg, #000 0%, #0A0A0A 60%, #0D0D00 100%);
          position: relative; overflow: hidden;
          padding: 120px 0 80px;
        }
        .hero-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
        }
        .hero-title {
          font-size: clamp(52px, 7vw, 88px);
          color: #FEFEFE;
        }
        .hero-sub { font-size: clamp(15px, 2vw, 18px); color: #888; line-height: 1.7; max-width: 460px; margin: 24px 0 40px; }
        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 56px; padding-top: 40px; border-top: 1px solid #1A1A1A; }
        .hero-logo-ring {
          width: clamp(280px, 38vw, 440px); height: clamp(280px, 38vw, 440px);
          border-radius: 50%; position: relative;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── ORDER AHEAD ── */
        .order-ahead-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; border-radius: 20px; overflow: hidden;
        }
        .order-card {
          padding: 52px 48px; position: relative; overflow: hidden;
          cursor: pointer; transition: opacity 0.2s;
        }
        .order-card:hover { opacity: 0.92; }

        /* ── FAVORITES ── */
        .fav-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
          border-radius: 16px; overflow: hidden; background: #1A1A1A;
        }
        .fav-card {
          background: #111; padding: 28px 24px;
          transition: background 0.18s;
          cursor: pointer;
        }
        .fav-card:hover { background: #161616; }

        /* ── MENU TASTE ── */
        .cat-scroll {
          display: flex; gap: 10px; overflow-x: auto;
          scrollbar-width: none; padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-pill {
          flex-shrink: 0; padding: 10px 20px;
          background: #111; border: 1px solid #222;
          border-radius: 999px; color: #FEFEFE;
          font-size: 13px; font-weight: 600;
          white-space: nowrap; text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          font-family: inherit;
        }
        .cat-pill:hover { background: #FED800; border-color: #FED800; color: #000; }

        /* ── REVIEWS ── */
        .reviews-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
        }
        .review-card {
          background: #0D0D0D; border: 1px solid #1A1A1A;
          border-radius: 16px; padding: 28px;
        }

        /* ── REWARDS ── */
        .rewards-steps {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }

        /* ── FAQ ── */
        .faq-item {
          border-bottom: 1px solid #1A1A1A;
          overflow: hidden;
        }
        .faq-q {
          width: 100%; background: none; border: none; color: #FEFEFE;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 0; gap: 16px; text-align: left;
          font-family: inherit; transition: color 0.15s;
        }
        .faq-q:hover { color: #FED800; }
        .faq-a {
          font-size: 14px; color: #888; line-height: 1.7;
          padding-bottom: 22px; max-width: 780px;
        }

        /* ── MAP / LOCATION ── */
        .location-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          border-radius: 20px; overflow: hidden; border: 1px solid #1A1A1A;
        }

        /* ── FOOTER ── */
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
          margin-bottom: 40px;
        }
        .footer-bottom {
          border-top: 1px solid #1A1A1A; padding-top: 24px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }

        /* ═══ ANIMATIONS ═══ */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%,100% { opacity: .15; } 50% { opacity: .35; } }

        /* ═══ TABLET ≤ 1024px ═══ */
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; gap: 0; }
          .hero-logo-ring { display: none; }
          .hero-section { min-height: unset; padding: 140px 0 60px; }
          .fav-grid { grid-template-columns: repeat(2, 1fr); }
          .order-ahead-grid { grid-template-columns: 1fr; gap: 2px; }
          .reviews-grid { grid-template-columns: 1fr; }
          .rewards-steps { grid-template-columns: 1fr; gap: 16px; }
          .location-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }

        /* ═══ MOBILE ≤ 768px ═══ */
        @media (max-width: 768px) {
          .fav-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .order-card { padding: 36px 28px; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .hero-cta .btn-yellow, .hero-cta .btn-outline { width: 100%; justify-content: center; }
        }

        /* ═══ SMALL ≤ 480px ═══ */
        @media (max-width: 480px) {
          .container { padding: 0 16px; }
          .fav-grid { border-radius: 12px; }
          .order-ahead-grid { border-radius: 14px; }
          .location-grid { border-radius: 14px; }
        }
      `}</style>

      <Header />

      {/* 1. HERO — Welcome To EggsOK Eatery (West Philly) */}
      <section className="hero-section">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 60% at 20% 50%, #FED80012 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 30%, #FC030108 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#ffffff04 1px, transparent 1px), linear-gradient(90deg, #ffffff04 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FED80015', border: '1px solid #FED80030', borderRadius: '20px', padding: '6px 16px', marginBottom: '28px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: '#FED800', fontWeight: '600' }}>Now Open · West Philadelphia</span>
              </div>

              <h1 className="bebas hero-title">
                <span style={{ color: '#FEFEFE', display: 'block' }}>WELCOME TO</span>
                <span style={{ color: '#FED800', display: 'block' }}>EggsOK EATERY</span>
                <span style={{ color: '#FEFEFE', display: 'block', fontSize: '55%' }}>(WEST PHILLY)</span>
              </h1>

              <p className="hero-sub">
                Fresh made-to-order sandwiches, burritos, omelettes, and specialty drinks. Pickup or delivery from the heart of West Philly.
              </p>

              <div className="hero-cta">
                <Link href="/order" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 32px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" /></svg>
                  Order Now
                </Link>
                <a href="#menu" className="btn-outline" style={{ fontSize: '16px', padding: '16px 32px' }}>
                  View Menu
                </a>
              </div>

              <div className="hero-stats">
                {[
                  { v: '80+', l: 'Menu Items' },
                  { v: '15 min', l: 'Ready Time' },
                  { v: '5★', l: 'Rated' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: '#FED800' }}>{s.v}</p>
                    <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="hero-logo-ring">
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px dashed #FED80030', animation: 'spin 40s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '1px solid #FED80018', animation: 'spin 25s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, #FED80020 0%, transparent 70%)', animation: 'pulse-ring 4s ease-in-out infinite' }} />
                <div style={{ width: '68%', height: '68%', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 80px #FED80040, 0 0 160px #FED80020', position: 'relative', zIndex: 1 }}>
                  <Image src="/logo.svg" alt="EggsOK Eatery" width={220} height={220} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED — A Delicious Lineup of Favorites */}
      <section style={{ background: '#0A0A0A', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="sec-label">Featured</span>
              <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
                A DELICIOUS LINEUP<br /><span style={{ color: '#FED800' }}>OF FAVORITES</span>
              </h2>
            </div>
            <Link href="/order" className="btn-outline">View Full Menu →</Link>
          </div>

          <div className="fav-grid">
            {FAVORITES.map((item, i) => (
              <Link href="/order" key={i} className="fav-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {/* <span style={{ fontSize: '11px', fontWeight: '700', color: '#FED800', background: '#FED80015', border: '1px solid #FED80030', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>{item.tag}</span> */}
                  {/* <span style={{ fontSize: '18px', fontWeight: '800', color: '#FED800', fontFamily: 'DM Sans, sans-serif' }}>{item.price}</span> */}
                </div>
                {/* <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '8px', lineHeight: 1.3 }}>{item.name}</p> */}
                {/* <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{item.desc}</p> */}
                                  <img src={item.img} alt={item.name} style={{ width: '200px', height: '200px', borderRadius: '8px' }} />

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444', fontWeight: '600' }}>
                  Add to order <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* 3. ORDER AHEAD, ENJOY ANYTIME */}
      <section style={{ padding: '0', background: '#000' }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Flexible Ordering</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
              ORDER AHEAD, <span style={{ color: '#FED800' }}>ENJOY ANYTIME</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#666', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.6 }}>
              Skip the wait. Schedule your order for exactly when you want it — pickup or delivery.
            </p>
          </div>

          <div className="order-ahead-grid">
            {/* Pickup */}
            <Link href="/order" className="order-card" style={{ background: '#FED800', textDecoration: 'none' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: '56px', height: '56px', background: '#000', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <UtensilsCrossed size={26} color="#FED800" />
                </div>
                <p className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#000', marginBottom: '8px' }}>PICKUP</p>
                <p style={{ fontSize: '15px', color: '#00000080', lineHeight: 1.6, maxWidth: '320px', marginBottom: '28px' }}>
                  Order online and pick up fresh at 3517 Lancaster Ave. Ready in about 15 minutes.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#000' }}>
                  Order Pickup <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* Delivery */}
            <Link href="/order" className="order-card" style={{ background: '#111', textDecoration: 'none', border: '2px solid #1A1A1A' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: '#FED80008' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: '56px', height: '56px', background: '#FED80015', border: '1px solid #FED80030', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Truck size={26} color="#FED800" />
                </div>
                <p className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#FEFEFE', marginBottom: '8px' }}>DELIVERY</p>
                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, maxWidth: '320px', marginBottom: '28px' }}>
                  Get your order delivered right to your door across West Philadelphia. Hot and fresh.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#FED800' }}>
                  Order Delivery <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '0', marginTop: '2px', borderRadius: '0 0 20px 20px', overflow: 'hidden', background: '#0A0A0A', border: '1px solid #1A1A1A', borderTop: 'none', flexWrap: 'wrap' }}>
            {[
              { icon: <Zap size={15} color="#FED800" />, text: 'Ready in ~15 minutes' },
              { icon: <Clock size={15} color="#FED800" />, text: 'Schedule up to 7 days ahead' },
              { icon: <MapPin size={15} color="#FED800" />, text: '3517 Lancaster Ave, Philly' },
              { icon: <Smartphone size={15} color="#FED800" />, text: 'Easy online ordering' },
            ].map((item, i) => (
              <div key={i} style={{ flex: '1 1 200px', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderRight: i < 3 ? '1px solid #1A1A1A' : 'none' }}>
                {item.icon}
                <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. A TASTE OF OUR MENU */}
      <section id="menu" style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="sec-label">Explore</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
              A TASTE OF <span style={{ color: '#FED800' }}>OUR MENU</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#666', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.6 }}>
              14 categories, 80+ items. From sunrise to sundown — there's something for every craving.
            </p>
          </div>

          <div className="cat-scroll" style={{ marginBottom: '40px' }}>
            {CATEGORIES.map((cat, i) => (
              
              <Link key={i} href="/order" className="cat-pill">
                
                {cat.name} <span style={{ color: '#FED800', marginLeft: '4px' }}>{cat.count}</span>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
            {[
              { label: 'Breakfast Sandwiches', img: 'main-menu/Breakfast BLT Sandwich.jpg', bg: 'linear-gradient(135deg, #1A1200, #0D0900)', items: '9 items' },
              { label: 'Specialty Lattes', img: 'main-menu/Brown Sugar Latte.jpg', bg: 'linear-gradient(135deg, #0D0A00, #1A1100)', items: '4 items' },
              { label: 'Matcha Edition', img: 'main-menu/Avocado Omelette.jpg', bg: 'linear-gradient(135deg, #001A0A, #000D05)', items: '9 items' },
              { label: 'Smoothies', img: 'main-menu/Avocado Omelette.jpg', bg: 'linear-gradient(135deg, #1A000A, #0D0005)', items: '7 items' },
            ].map((tile, i) => (
              <Link href="/order" key={i} style={{ background: tile.bg, border: '1px solid #1A1A1A', borderRadius: '14px', padding: '32px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '160px', transition: 'border-color 0.15s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FED80040'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A'}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <img src={tile.img} alt={tile.label} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', position: 'absolute', top: '20px', left: '20px', border: '2px solid #1A1A1A' }} />
                
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{tile.label}</p>
                <p style={{ fontSize: '12px', color: '#FED800' }}>{tile.items}</p>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/order" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 40px' }}>
              Browse Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. LET US CATER YOUR NEXT EVENT! */}
      <section style={{ background: '#0A0A0A', padding: '80px 0' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #FED800 0%, #E5C200 100%)', borderRadius: '24px', padding: 'clamp(40px, 6vw, 72px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '40%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#00000060', display: 'block', marginBottom: '12px' }}>Catering</span>
                <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 68px)', color: '#000', marginBottom: '16px', lineHeight: '0.95' }}>
                  LET US CATER<br />YOUR NEXT EVENT
                </h2>
                <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#00000070', lineHeight: 1.7, maxWidth: '500px', marginBottom: '32px' }}>
                  Corporate breakfasts, birthday brunches, office meetings, graduation parties — we bring the food, you enjoy the moment. Custom menus available for any size group.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Link href="/catering" style={{ padding: '14px 32px', background: '#000', color: '#FED800', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <UtensilsCrossed size={16} />
                    Book Catering
                  </Link>
                  <a href="tel:2159489902" style={{ padding: '14px 28px', background: 'transparent', color: '#000', border: '2px solid #00000030', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Call Us
                  </a>
                </div>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }} className="hide-mobile">
                {[['Any Size', 'Group Orders'], ['24h', 'Response Time'], ['Custom', 'Menu Available']].map(([v, l], i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '12px', padding: '18px 24px', minWidth: '140px' }}>
                    <p className="bebas" style={{ fontSize: '28px', color: '#000' }}>{v}</p>
                    <p style={{ fontSize: '12px', color: '#00000060', fontWeight: '600' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT OUR GUESTS ARE SAYING */}
      <section style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Reviews</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
              WHAT OUR GUESTS <span style={{ color: '#FED800' }}>ARE SAYING</span>
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={20} color="#FED800" fill="#FED800" />)}
              <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>5.0 · 200+ reviews</span>
            </div>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[0, 1, 2, 3, 4].map(s => <Star key={s} size={14} color="#FED800" fill="#FED800" />)}
                </div>
                <p style={{ fontSize: '15px', color: '#CCCCCC', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80040', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#FED800' }}>{r.name[0]}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#444' }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FEATURING — Press / Recognition */}
      <section style={{ background: '#0A0A0A', padding: '60px 0', borderTop: '1px solid #1A1A1A', borderBottom: '1px solid #1A1A1A' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#444', marginBottom: '32px' }}>Featuring</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(32px, 6vw, 80px)', flexWrap: 'wrap' }}>
            {[
              { name: 'Philadelphia Magazine', sub: 'Best Breakfast 2024' },
              { name: 'Visit Philadelphia', sub: 'Local Favorite' },
              { name: 'Philly Voice', sub: 'Featured Restaurant' },
              { name: 'Yelp', sub: "People's Choice" },
            ].map((p, i) => (
              <div key={i} style={{ textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', fontWeight: '800', color: '#FEFEFE', letterSpacing: '-0.3px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>{p.name}</p>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '4px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{p.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. EggsOK EATERY REWARDS */}
      <section style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="sec-label">Loyalty Program</span>
              <h2 className="bebas" style={{ fontSize: 'clamp(38px, 5vw, 60px)', color: '#FEFEFE', marginBottom: '16px' }}>
                EggsOK <span style={{ color: '#FED800' }}>REWARDS</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7, marginBottom: '32px' }}>
                Every order earns you points. Redeem for free food, exclusive deals, and early access to new menu items. The more you eat, the more you earn.
              </p>
              <Link href="/account" className="btn-yellow">
                <Gift size={16} />
                Join Rewards
              </Link>
            </div>

            <div className="rewards-steps">
              {[
                { step: '01', title: 'Sign Up Free', desc: 'Create your account in under a minute. No fees, ever.', color: '#FED800' },
                { step: '02', title: 'Earn Points', desc: '$1 spent = 10 points. Points stack up fast.', color: '#FC0301' },
                { step: '03', title: 'Redeem Rewards', desc: 'Free items, discounts, and exclusive member perks.', color: '#22C55E' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
                  <p className="bebas" style={{ position: 'absolute', top: '-8px', right: '12px', fontSize: '60px', color: `${s.color}12`, lineHeight: 1 }}>{s.step}</p>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <p className="bebas" style={{ fontSize: '16px', color: s.color }}>{s.step}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '8px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section style={{ background: '#0A0A0A', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">FAQ</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
              FREQUENTLY ASKED <span style={{ color: '#FED800' }}>QUESTIONS</span>
            </h2>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} color={openFaq === i ? '#FED800' : '#555'} style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s, color 0.15s' }} />
                </button>
                {openFaq === i && <p className="faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>Still have questions?</p>
            <Link href="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* 10. OUR LOCATION */}
      <section style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Find Us</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#FEFEFE' }}>
              OUR <span style={{ color: '#FED800' }}>LOCATION</span>
            </h2>
          </div>

          <div className="location-grid">
            <div style={{ background: '#111', padding: 'clamp(32px, 5vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: '600' }}>Open Now</span>
                </div>
                <h3 className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#FEFEFE', marginBottom: '20px' }}>EggsOK<br /><span style={{ color: '#FED800' }}>WEST PHILADELPHIA</span></h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '14px', color: '#FEFEFE', fontWeight: '600' }}>3517 Lancaster Ave</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>Philadelphia, PA 19104</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Clock size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      {[
                        { d: 'Mon – Fri', h: '8:00 AM – 10:00 PM' },
                        { d: 'Saturday', h: '9:00 AM – 11:00 PM' },
                        { d: 'Sunday', h: '9:00 AM – 9:00 PM' },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600', minWidth: '80px' }}>{row.d}</span>
                          <span style={{ fontSize: '13px', color: '#666' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Smartphone size={16} color="#FED800" style={{ flexShrink: 0 }} />
                    <a href="tel:2159489902" style={{ fontSize: '14px', color: '#FEFEFE', textDecoration: 'none', fontWeight: '600' }}>215-948-9902</a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: '14px', padding: '12px 22px' }}>
                  <MapPin size={15} /> Get Directions
                </a>
                <Link href="/order" className="btn-outline" style={{ fontSize: '14px', padding: '12px 22px' }}>
                  Order Now
                </Link>
              </div>
            </div>

            <div style={{ background: '#0A0A0A', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
              <iframe
                title="EggsOK Eatery Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.7!2d-75.2!3d39.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c65b7a6a5555%3A0x0!2s3517+Lancaster+Ave%2C+Philadelphia%2C+PA+19104!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', minHeight: '400px', display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: '#000', borderRadius: '10px', padding: '10px 14px', border: '1px solid #FED80040', pointerEvents: 'none' }}>
                <p style={{ fontSize: '13px', fontWeight: '800', color: '#FED800', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>EggsOK</p>
                <p style={{ fontSize: '11px', color: '#666' }}>3517 Lancaster Ave</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section style={{ background: 'linear-gradient(135deg, #FED800 0%, #E8C800 100%)', padding: 'clamp(48px, 8vw, 80px) 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 className="bebas" style={{ fontSize: 'clamp(44px, 9vw, 88px)', color: '#000', marginBottom: '16px' }}>
            READY TO ORDER?
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#00000070', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Fresh breakfast and lunch made to order. Available for pickup and delivery every day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/order" style={{ padding: '16px 40px', background: '#000', color: '#FED800', borderRadius: '10px', fontSize: '16px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" /></svg>
              Order Online Now
            </Link>
            <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 36px', background: 'transparent', color: '#000', borderRadius: '10px', fontSize: '16px', fontWeight: '700', border: '2px solid #00000025', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <MapPin size={18} /> Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0A0A', padding: '64px 0 32px', borderTop: '1px solid #1A1A1A' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/logo.svg" alt="EggsOK Eatery" width={36} height={36} style={{ objectFit: 'contain' }} />
                </div>
                <p className="bebas" style={{ fontSize: '22px', color: '#FED800', letterSpacing: '1px' }}>EggsOK</p>
              </div>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7, maxWidth: '300px', marginBottom: '20px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <p style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <MapPin size={13} color="#FED800" /> 3517 Lancaster Ave, Philadelphia PA 19104
              </p>
              <p style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={13} color="#FED800" />
                <a href="tel:2159489902" style={{ color: '#666', textDecoration: 'none' }}>215-948-9902</a>
              </p>
            </div>

            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '18px' }}>Quick Links</p>
              {[
                { label: 'Home', href: '/' },
                { label: 'Order Online', href: '/order' },
                { label: 'Catering', href: '/catering' },
                { label: 'Our Story', href: '/story' },
                { label: 'Gift Cards', href: '/gift-cards' },
                { label: 'Contact', href: '/contact' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="footer-link" style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '10px', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#666'}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '18px' }}>Hours</p>
              {[
                { d: 'Mon – Fri', h: '8:00 AM – 10:00 PM' },
                { d: 'Saturday', h: '9:00 AM – 11:00 PM' },
                { d: 'Sunday', h: '9:00 AM – 9:00 PM' },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600' }}>{row.d}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>{row.h}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '13px', color: '#444' }}>© 2026 EggsOK Eatery. All rights reserved.</p>
            <p style={{ fontSize: '13px', color: '#444' }}>Built by <span style={{ color: '#FED800' }}>RestoRise Business Solutions</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}