'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Header from './components/Header';
import {
  MapPin,
  Clock,
  Smartphone,
  Star,
  ChevronDown,
  Gift,
  Truck,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';


/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FAVORITES = [
  { id: 1, name: 'Ultimate Sammies Sandwich', img: '/main-menu/Fully Loaded Sandwich.jpg', price: '$14.50', tag: 'Best Seller', desc: '2 fried eggs, Cheddar, hashbrown, applewood smoked bacon' },
  { id: 2, name: 'Breakfast BLT Sandwich', img: '/main-menu/Breakfast BLT Sandwich.jpg', price: '$14.50', tag: 'Popular', desc: 'Applewood smoked bacon, romaine, tomato, 2 fried eggs' },
  { id: 3, name: 'Fully Loaded Sandwich', img: '/main-menu/Fully Loaded Sandwich.jpg', price: '$14.50', tag: 'Fan Fave', desc: 'Scrambled eggs, Cheddar, tomato, avocado, spinach' },
  { id: 4, name: 'Sunrise Burrito', img: '/main-menu/Sunrise Burrito.jpg', price: '$13.00', tag: 'New', desc: 'Scrambled eggs, black beans, salsa, sour cream, cheddar' },
  { id: 5, name: 'Avocado Omelette', img: '/main-menu/Avocado Omelette.jpg', price: '$13.50', tag: 'Healthy', desc: 'Fresh avocado, spinach, tomato, pepper jack cheese' },
  { id: 6, name: 'Brown Sugar Latte', img: '/main-menu/Brown Sugar Latte.jpg', price: '$6.50', tag: 'Popular', desc: 'Espresso, oat milk, brown sugar cinnamon syrup' },
];


const MENU_TILES = [
  { label: 'Breakfast Sandwiches', img: '/main-menu/Breakfast BLT Sandwich.jpg', items: '9 items' },
  { label: 'Specialty Lattes', img: '/main-menu/Brown Sugar Latte.jpg', items: '4 items' },
  { label: 'Matcha Edition', img: '/main-menu/Avocado Omelette.jpg', items: '9 items' },
  { label: 'Smoothies', img: '/main-menu/Avocado Omelette.jpg', items: '7 items' },
];

const CATEGORIES = [
  { name: 'Breakfast Sandwiches', count: 9 },
  { name: 'Burritos', count: 4 },
  { name: 'Not Sandwiches', count: 5 },
  { name: 'Pancakes', count: 2 },
  { name: 'Omelettes', count: 6 },
  { name: 'Lunch Sandwiches', count: 4 },
  { name: 'Specialty Lattes', count: 4 },
  { name: 'Matcha Edition', count: 9 },
  { name: 'Cold Foam', count: 3 },
  { name: 'Smoothies', count: 7 },
  { name: 'Wellness Smoothies', count: 4 },
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
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isOpen, statusMessage, isDeliveryEnabled, isPickupEnabled } = useStoreSettings();


  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; line-height: 0.93; }

        /* ── Buttons ── */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #FED800; color: #000;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s; font-family: inherit;
        }
        .btn-yellow:hover { transform: translateY(-2px); box-shadow: 0 10px 28px #FED80050; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: #FEFEFE;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #333;
          transition: border-color 0.15s, color 0.15s; font-family: inherit; cursor: pointer;
        }
        .btn-outline:hover { border-color: #FED800; color: #FED800; }

        .sec-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #FED800; margin-bottom: 10px; display: block;
        }

        /* ── HERO ── */
        .hero-section {
          min-height: 92vh; display: flex; align-items: center;
          background: linear-gradient(135deg, #000 0%, #0A0A0A 60%, #0D0D00 100%);
          position: relative; overflow: hidden; padding: 120px 0 80px;
        }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .hero-logo-ring {
          width: clamp(280px, 38vw, 440px); height: clamp(280px, 38vw, 440px);
          border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center;
        }
        .hero-stats { display: flex; gap: 40px; margin-top: 52px; padding-top: 40px; border-top: 1px solid #1A1A1A; }
        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ── ORDER AHEAD ── */
        .order-ahead-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; border-radius: 20px; overflow: hidden; }
        .order-card { padding: 52px 48px; position: relative; overflow: hidden; cursor: pointer; transition: filter 0.2s; }
        .order-card:hover { filter: brightness(1.05); }

        /* ── FAVORITES ── */
        .fav-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px; border-radius: 18px; overflow: hidden; background: #1E1E1E;
        }
        .fav-card {
          background: #111; display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 0 0 28px; overflow: hidden;
          transition: background 0.18s; cursor: pointer; text-decoration: none;
        }
        .fav-card:hover { background: #161616; }
        .fav-img-wrap {
          width: 100%; aspect-ratio: 1 / 1; overflow: hidden;
          position: relative; margin-bottom: 20px;
        }
        .fav-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .fav-card:hover .fav-img-wrap img { transform: scale(1.05); }

        /* ── MENU TILES ── */
        .menu-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 40px; }
        .menu-tile {
          border: 1px solid #1A1A1A; border-radius: 16px;
          overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column;
          transition: border-color 0.15s, transform 0.2s;
          background: #0D0D0D;
        }
        .menu-tile:hover { border-color: #FED80060; transform: translateY(-3px); }
        .menu-tile-img { width: 100%; aspect-ratio: 1 / 1; overflow: hidden; position: relative; }
        .menu-tile-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .menu-tile:hover .menu-tile-img img { transform: scale(1.06); }
        .menu-tile-body { padding: 16px 18px 20px; }

        /* ── CATEGORY PILLS ── */
        .cat-scroll { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-pill {
          flex-shrink: 0; padding: 9px 18px;
          background: #111; border: 1px solid #222; border-radius: 999px;
          color: #FEFEFE; font-size: 13px; font-weight: 600;
          white-space: nowrap; text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s; font-family: inherit;
        }
        .cat-pill:hover { background: #FED800; border-color: #FED800; color: #000; }

        /* ── REVIEWS ── */
        .reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .review-card { background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 18px; padding: 30px; }

        /* ── REWARDS ── */
        .rewards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .rewards-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* ── FAQ ── */
        .faq-item { border-bottom: 1px solid #1A1A1A; }
        .faq-q {
          width: 100%; background: none; border: none; color: #FEFEFE;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 0; gap: 16px; text-align: left;
          font-family: inherit; transition: color 0.15s;
        }
        .faq-q:hover { color: #FED800; }
        .faq-a { font-size: 14px; color: #777; line-height: 1.8; padding-bottom: 22px; max-width: 760px; }

        /* ── LOCATION ── */
        .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 22px; overflow: hidden; border: 1px solid #1E1E1E; }

        /* ── FOOTER ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

        /* ═══ ANIMATIONS ═══ */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%,100% { opacity: .12; } 50% { opacity: .28; } }

        /* ═══ TABLET ≤ 1024px ═══ */
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-logo-ring { display: none; }
          .hero-section { min-height: unset; padding: 140px 0 64px; }
          .fav-grid { grid-template-columns: repeat(2, 1fr); }
          .order-ahead-grid { grid-template-columns: 1fr; }
          .reviews-grid { grid-template-columns: 1fr; }
          .rewards-grid { grid-template-columns: 1fr; gap: 40px; }
          .rewards-steps { grid-template-columns: repeat(3, 1fr); }
          .location-grid { grid-template-columns: 1fr; }
          .menu-tiles { grid-template-columns: repeat(2, 1fr); }
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
          .hero-cta .btn-yellow, .hero-cta .btn-outline { flex: 1; justify-content: center; }
          .rewards-steps { grid-template-columns: 1fr; }
          .catering-inner { grid-template-columns: 1fr !important; }
          .catering-stats { display: none !important; }
        }

        /* ═══ SMALL ≤ 480px ═══ */
        @media (max-width: 480px) {
          .container { padding: 0 14px; }
          .menu-tiles { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .fav-grid { border-radius: 14px; }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="hero-section">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 65% 65% at 15% 55%, #FED80014 0%, transparent 70%), radial-gradient(ellipse 45% 55% at 85% 30%, #FC030110 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#ffffff04 1px, transparent 1px), linear-gradient(90deg, #ffffff04 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isOpen ? '#22C55E15' : '#FC030115', border: `1px solid ${isOpen ? '#22C55E30' : '#FC030130'}`, borderRadius: '20px', padding: '6px 16px', marginBottom: '28px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{statusMessage} · West Philadelphia</span>
              </div>


              <h1 className="bebas" style={{ fontSize: 'clamp(52px, 7vw, 88px)', color: '#FEFEFE' }}>
                <span style={{ display: 'block' }}>WELCOME TO</span>
                <span style={{ display: 'block', color: '#FED800' }}>EGGSOK</span>
                <span style={{ display: 'block', fontSize: '48%', color: '#555', letterSpacing: '4px', marginTop: '4px', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}>Breakfast & Lunch Done Right</span>
              </h1>

              <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#777', lineHeight: 1.7, maxWidth: '460px', margin: '28px 0 40px' }}>
                Fresh made-to-order sandwiches, burritos, omelettes, and specialty drinks. Pickup or delivery from the heart of West Philly.
              </p>

              <div className="hero-cta">
                <Link href="/order" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 34px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" /></svg>
                  Order Now
                </Link>
                <a href="#menu" className="btn-outline" style={{ fontSize: '16px', padding: '16px 34px' }}>View Menu</a>
              </div>

              <div className="hero-stats">
                {[{ v: '80+', l: 'Menu Items' }, { v: '15 min', l: 'Ready Time' }, { v: '5★', l: 'Rated' }].map((s, i) => (
                  <div key={i}>
                    <p className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: '#FED800' }}>{s.v}</p>
                    <p style={{ fontSize: '12px', color: '#444', marginTop: '3px' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo ring */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="hero-logo-ring">
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px dashed #FED80030', animation: 'spin 40s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '1px solid #FED80018', animation: 'spin 25s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, #FED80022 0%, transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
                <div style={{ width: '68%', height: '68%', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 80px #FED80050, 0 0 180px #FED80020', position: 'relative', zIndex: 1 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={220} height={220} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURED — A Delicious Lineup
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '88px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '52px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="sec-label">Featured</span>
              <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
                A DELICIOUS LINEUP<br /><span style={{ color: '#FED800' }}>OF FAVORITES</span>
              </h2>
            </div>
            <Link href="/order" className="btn-outline">View Full Menu →</Link>
          </div>

          <div className="fav-grid">
            {FAVORITES.map((item, i) => (
              <Link href={`/order?productId=${item.id}`} key={i} className="fav-card">

                {/* Full-width centered image */}
                <div className="fav-img-wrap">
                  <img src={item.img} alt={item.name} />
                  {/* Tag badge */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#000000CC', backdropFilter: 'blur(8px)', border: '1px solid #FED80040', borderRadius: '20px', padding: '4px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#FED800', letterSpacing: '0.5px' }}>{item.tag}</span>
                  </div>
                  {/* Add btn */}
                  <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                </div>

                {/* Text centered below image */}
                <div style={{ padding: '0 20px', width: '100%' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px', lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, marginBottom: '10px' }}>{item.desc}</p>
                  <p style={{ fontSize: '17px', fontWeight: '800', color: '#FED800' }}>{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. ORDER AHEAD, ENJOY ANYTIME
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '88px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Flexible Ordering</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              ORDER AHEAD, <span style={{ color: '#FED800' }}>ENJOY ANYTIME</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#555', marginTop: '14px', maxWidth: '440px', margin: '14px auto 0', lineHeight: 1.7 }}>
              Skip the wait. Schedule your order for exactly when you want it — pickup or delivery.
            </p>
          </div>

          <div className="order-ahead-grid">
            {isPickupEnabled && (
              <Link href="/order" className="order-card" style={{ background: '#FED800', textDecoration: 'none' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-70px', left: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '58px', height: '58px', background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                    <UtensilsCrossed size={26} color="#FED800" />
                  </div>
                  <p className="bebas" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#000', marginBottom: '10px' }}>PICKUP</p>
                  <p style={{ fontSize: '15px', color: '#00000075', lineHeight: 1.7, maxWidth: '320px', marginBottom: '32px' }}>
                    Order online and pick up fresh at 3517 Lancaster Ave. Ready in about 15 minutes.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#000', background: 'rgba(0,0,0,0.1)', padding: '10px 18px', borderRadius: '999px' }}>
                    Order Pickup <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            )}

            {isDeliveryEnabled && (
              <Link href="/order" className="order-card" style={{ background: '#111', textDecoration: 'none', border: '2px solid #1E1E1E', gridColumn: !isPickupEnabled ? '1 / span 2' : 'auto' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: '#FED80009' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '58px', height: '58px', background: '#FED80018', border: '1px solid #FED80035', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <Truck size={26} color="#FED800" />
                  </div>
                  <p className="bebas" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#FEFEFE', marginBottom: '10px' }}>DELIVERY</p>
                  <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7, maxWidth: '320px', marginBottom: '32px' }}>
                    Get your order delivered right to your door across West Philadelphia. Hot and fresh.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#FED800', background: '#FED80012', border: '1px solid #FED80025', padding: '10px 18px', borderRadius: '999px' }}>
                    Order Delivery <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            )}
          </div>


          {/* Info strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', background: '#0A0A0A', border: '1px solid #1A1A1A', borderTop: 'none', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
            {[
              { icon: <Zap size={14} color="#FED800" />, text: 'Ready in ~15 minutes' },
              { icon: <Clock size={14} color="#FED800" />, text: 'Schedule up to 7 days ahead' },
              { icon: <MapPin size={14} color="#FED800" />, text: '3517 Lancaster Ave, Philly' },
              { icon: <Smartphone size={14} color="#FED800" />, text: 'Easy online ordering' },
            ].map((item, i) => (
              <div key={i} style={{ flex: '1 1 200px', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderRight: i < 3 ? '1px solid #1A1A1A' : 'none' }}>
                {item.icon}
                <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. A TASTE OF OUR MENU
      ══════════════════════════════════════════ */}
      <section id="menu" style={{ background: '#050505', padding: '88px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="sec-label">Explore</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              A TASTE OF <span style={{ color: '#FED800' }}>OUR MENU</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#555', marginTop: '14px', maxWidth: '440px', margin: '14px auto 0', lineHeight: 1.7 }}>
              14 categories, 80+ items. From sunrise to sundown — something for every craving.
            </p>
          </div>

          {/* Category pills */}
          <div className="cat-scroll" style={{ marginBottom: '40px' }}>
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href="/order" className="cat-pill">
                {cat.name} <span style={{ color: '#FED800', marginLeft: '3px' }}>{cat.count}</span>
              </Link>
            ))}
          </div>

          {/* 4 visual tiles — image fills top half, label bottom */}
          <div className="menu-tiles">
            {MENU_TILES.map((tile, i) => (
              <Link href="/order" key={i} className="menu-tile">
                <div className="menu-tile-img">
                  <img src={tile.img} alt={tile.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {/* overlay gradient */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0D0D 0%, transparent 60%)' }} />
                </div>
                <div className="menu-tile-body">
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>{tile.label}</p>
                  <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600' }}>{tile.items} →</p>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/order" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 44px' }}>
              Browse Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. CATER YOUR NEXT EVENT
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '88px 0' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(130deg, #FED800 0%, #E6C700 100%)', borderRadius: '24px', padding: 'clamp(40px, 6vw, 72px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '45%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />

            <div className="catering-inner" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#00000055', display: 'block', marginBottom: '10px' }}>Catering</span>
                <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 66px)', color: '#000', marginBottom: '16px' }}>
                  LET US CATER<br />YOUR NEXT EVENT
                </h2>
                <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#00000068', lineHeight: 1.8, maxWidth: '500px', marginBottom: '36px' }}>
                  Corporate breakfasts, birthday brunches, office meetings, graduation parties — we bring the food, you enjoy the moment. Custom menus available for any group size.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Link href="/catering" style={{ padding: '14px 32px', background: '#000', color: '#FED800', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <UtensilsCrossed size={16} /> Book Catering
                  </Link>
                  <a href="tel:2159489902" style={{ padding: '14px 28px', background: 'rgba(0,0,0,0.1)', color: '#000', border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Call Us
                  </a>
                </div>
              </div>

              <div className="catering-stats" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[['Any Size', 'Group Orders'], ['24h', 'Response Time'], ['Custom', 'Menu Available']].map(([v, l], i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.09)', borderRadius: '14px', padding: '18px 26px', textAlign: 'center', minWidth: '148px' }}>
                    <p className="bebas" style={{ fontSize: '30px', color: '#000' }}>{v}</p>
                    <p style={{ fontSize: '11px', color: '#00000060', fontWeight: '700', letterSpacing: '0.5px' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. REVIEWS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '88px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Reviews</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              WHAT OUR GUESTS <span style={{ color: '#FED800' }}>ARE SAYING</span>
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '14px' }}>
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={19} color="#FED800" fill="#FED800" />)}
              <span style={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>5.0 · 200+ reviews</span>
            </div>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }}>
                  {[0, 1, 2, 3, 4].map(s => <Star key={s} size={13} color="#FED800" fill="#FED800" />)}
                </div>
                <p style={{ fontSize: '15px', color: '#BBBBBB', lineHeight: 1.75, marginBottom: '24px', fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80050', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#FED800' }}>{r.name[0]}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#383838' }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FEATURING
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '56px 0', borderTop: '1px solid #141414', borderBottom: '1px solid #141414' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', letterSpacing: '3.5px', textTransform: 'uppercase', color: '#333', marginBottom: '36px' }}>Featuring</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(28px, 6vw, 80px)', flexWrap: 'wrap' }}>
            {[
              { name: 'Philadelphia Magazine', sub: 'Best Breakfast 2024' },
              { name: 'Visit Philadelphia', sub: 'Local Favorite' },
              { name: 'Philly Voice', sub: 'Featured Restaurant' },
              { name: 'Yelp', sub: "People's Choice" },
            ].map((p, i) => (
              <div key={i} style={{ textAlign: 'center', opacity: 0.45 }}>
                <p className="bebas" style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#FEFEFE' }}>{p.name}</p>
                <p style={{ fontSize: '10px', color: '#555', marginTop: '4px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{p.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. REWARDS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '88px 0' }}>
        <div className="container">
          <div className="rewards-grid">
            <div>
              <span className="sec-label">Loyalty Program</span>
              <h2 className="bebas" style={{ fontSize: 'clamp(36px, 5vw, 58px)', color: '#FEFEFE', marginBottom: '16px' }}>
                EGGS OK <span style={{ color: '#FED800' }}>REWARDS</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.8, marginBottom: '36px', maxWidth: '440px' }}>
                Every order earns you points. Redeem for free food, exclusive deals, and early access to new menu items. The more you eat, the more you earn.
              </p>
              <Link href="/account" className="btn-yellow">
                <Gift size={16} /> Join Rewards — It's Free
              </Link>
            </div>

            <div className="rewards-steps">
              {[
                { step: '01', title: 'Sign Up Free', desc: 'Create your account in under a minute. No fees, ever.', color: '#FED800' },
                { step: '02', title: 'Earn Points', desc: '$1 spent = 10 points. Points stack up fast.', color: '#FC0301' },
                { step: '03', title: 'Redeem Rewards', desc: 'Free items, discounts, and exclusive member perks.', color: '#22C55E' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '26px 20px', position: 'relative', overflow: 'hidden' }}>
                  <p className="bebas" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '64px', color: `${s.color}10`, lineHeight: 1 }}>{s.step}</p>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <p className="bebas" style={{ fontSize: '16px', color: s.color }}>{s.step}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '8px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. FAQ
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '88px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="sec-label">FAQ</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              FREQUENTLY ASKED <span style={{ color: '#FED800' }}>QUESTIONS</span>
            </h2>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} color={openFaq === i ? '#FED800' : '#444'}
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease' }} />
                </button>
                {openFaq === i && <p className="faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '52px' }}>
            <p style={{ fontSize: '14px', color: '#444', marginBottom: '16px' }}>Still have questions?</p>
            <Link href="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. OUR LOCATION
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '88px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Find Us</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              OUR <span style={{ color: '#FED800' }}>LOCATION</span>
            </h2>
          </div>

          <div className="location-grid">
            {/* Info panel */}
            <div style={{ background: '#0D0D0D', padding: 'clamp(32px, 5vw, 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '36px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isOpen ? '#22C55E15' : '#FC030115', border: `1px solid ${isOpen ? '#22C55E30' : '#FC030130'}`, borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
                  <span style={{ fontSize: '12px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{isOpen ? 'Open Now' : 'Closed'}</span>
                </div>

                <h3 className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#FEFEFE', marginBottom: '28px' }}>
                  EGGS OK<br /><span style={{ color: '#FED800' }}>WEST PHILADELPHIA</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '14px', color: '#FEFEFE', fontWeight: '600' }}>3517 Lancaster Ave</p>
                      <p style={{ fontSize: '13px', color: '#555' }}>Philadelphia, PA 19104</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <Clock size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[{ d: 'Mon – Fri', h: '8:00 AM – 10:00 PM' }, { d: 'Saturday', h: '9:00 AM – 11:00 PM' }, { d: 'Sunday', h: '9:00 AM – 9:00 PM' }].map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px' }}>
                          <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600', minWidth: '80px' }}>{row.d}</span>
                          <span style={{ fontSize: '13px', color: '#555' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Smartphone size={16} color="#FED800" style={{ flexShrink: 0 }} />
                    <a href="tel:2159489902" style={{ fontSize: '14px', color: '#FEFEFE', textDecoration: 'none', fontWeight: '600' }}>215-948-9902</a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: '14px', padding: '12px 22px' }}>
                  <MapPin size={14} /> Get Directions
                </a>
                <Link href="/order" className="btn-outline" style={{ fontSize: '14px', padding: '12px 22px' }}>Order Now</Link>
              </div>
            </div>

            {/* Map */}
            <div style={{ background: '#0A0A0A', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
              <iframe
                title="Eggs Ok Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.7!2d-75.2!3d39.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c65b7a6a5555%3A0x0!2s3517+Lancaster+Ave%2C+Philadelphia%2C+PA+19104!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', minHeight: '420px', display: 'block' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', borderRadius: '10px', padding: '10px 16px', border: '1px solid #FED80040', pointerEvents: 'none' }}>
                <p className="bebas" style={{ fontSize: '14px', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</p>
                <p style={{ fontSize: '11px', color: '#555' }}>3517 Lancaster Ave</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(130deg, #FED800 0%, #E6C700 100%)', padding: 'clamp(56px, 8vw, 88px) 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 className="bebas" style={{ fontSize: 'clamp(44px, 9vw, 92px)', color: '#000', marginBottom: '16px' }}>READY TO ORDER?</h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#00000065', maxWidth: '460px', margin: '0 auto 44px', lineHeight: 1.7 }}>
            Fresh breakfast and lunch made to order. Available for pickup and delivery every day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/order" style={{ padding: '16px 44px', background: '#000', color: '#FED800', borderRadius: '10px', fontSize: '16px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" /></svg>
              Order Online Now
            </Link>
            <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 36px', background: 'rgba(0,0,0,0.1)', color: '#000', borderRadius: '10px', fontSize: '16px', fontWeight: '700', border: '1.5px solid rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <MapPin size={18} /> Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={36} height={36} style={{ objectFit: 'contain' }} />
                </div>
                <p className="bebas" style={{ fontSize: '22px', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</p>
              </div>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.75, maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <p style={{ fontSize: '13px', color: '#444', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <MapPin size={13} color="#FED800" /> 3517 Lancaster Ave, Philadelphia PA 19104
              </p>
              <p style={{ fontSize: '13px', color: '#444', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Smartphone size={13} color="#FED800" />
                <a href="tel:2159489902" style={{ color: '#444', textDecoration: 'none' }}>215-948-9902</a>
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
              {[{ label: 'Home', href: '/' }, { label: 'Order Online', href: '/order' }, { label: 'Catering', href: '/catering' }, { label: 'Our Story', href: '/story' }, { label: 'Gift Cards', href: '/gift-cards' }, { label: 'Contact', href: '/contact' }].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: '14px', color: '#444', marginBottom: '11px', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#444'}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              {[{ d: 'Mon – Fri', h: '8:00 AM – 10:00 PM' }, { d: 'Saturday', h: '9:00 AM – 11:00 PM' }, { d: 'Sunday', h: '9:00 AM – 9:00 PM' }].map((row, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600' }}>{row.d}</p>
                  <p style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>{row.h}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '13px', color: '#333' }}>© 2026 Eggs Ok. All rights reserved.</p>
            <p style={{ fontSize: '13px', color: '#333' }}>Built by <span style={{ color: '#FED800' }}>RestoRise Business Solutions</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}