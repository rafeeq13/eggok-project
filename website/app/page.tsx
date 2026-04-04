'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import {
  MapPin,
  Clock,
  Smartphone,
  Star,
  ChevronDown,
  Gift,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FAVORITES = [
  { id: 1, name: 'Ultimate Sammies Sandwich',  img: '/main-menu/Fully Loaded Sandwich.jpg',    price: '$14.50', tag: 'Best Seller', desc: '2 fried eggs, Cheddar, hashbrown, applewood smoked bacon' },
  { id: 2, name: 'Breakfast BLT Sandwich',     img: '/main-menu/Breakfast BLT Sandwich.jpg',   price: '$14.50', tag: 'Popular',    desc: 'Applewood smoked bacon, romaine, tomato, 2 fried eggs' },
  { id: 3, name: 'Fully Loaded Sandwich',      img: '/main-menu/Fully Loaded Sandwich.jpg',    price: '$14.50', tag: 'Fan Fave',   desc: 'Scrambled eggs, Cheddar, tomato, avocado, spinach' },
  { id: 4, name: 'Sunrise Burrito',            img: '/main-menu/Sunrise Burrito.jpg',          price: '$13.00', tag: 'New',        desc: 'Scrambled eggs, black beans, salsa, sour cream, cheddar' },
];

const MENU_TILES = [
  { label: 'Breakfast Sandwiches', img: '/main-menu/Breakfast BLT Sandwich.jpg', items: '9 items' },
  { label: 'Specialty Lattes',     img: '/main-menu/Brown Sugar Latte.jpg',       items: '4 items' },
  { label: 'Matcha Edition',       img: '/main-menu/Avocado Omelette.jpg',        items: '9 items' },
  { label: 'Smoothies',            img: '/main-menu/Avocado Omelette.jpg',        items: '7 items' },
  { label: 'Omelettes',            img: '/main-menu/Brown Sugar Latte.jpg',       items: '4 items' },
  { label: 'Burritos',             img: '/main-menu/Avocado Omelette.jpg',        items: '9 items' },
];

const REVIEWS = [
  { name: 'Jasmine T.', stars: 5, text: 'Best breakfast spot in West Philly hands down. The Fully Loaded Sandwich is absolutely insane — I order it every single week.',                                                      date: 'March 2025'    },
  { name: 'Marcus R.',  stars: 5, text: 'Ordered online and it was ready in 12 minutes. Fresh, hot, and exactly what I wanted. The brown sugar latte is a must.',                                                            date: 'February 2025' },
  { name: 'Priya K.',   stars: 5, text: "The matcha drinks here are genuinely the best I've had outside of a specialty café. And the breakfast burrito? Chef's kiss.",                                                       date: 'January 2025'  },
  { name: 'Devon M.',   stars: 5, text: 'Catered our office breakfast meeting and every single person was raving. Huge variety, everything was delicious. Will definitely book again.',                                       date: 'December 2024' },
];

const FAQS = [
  { q: 'What are your hours?',            a: "We're open Monday–Friday 8 AM–10 PM and Saturday–Sunday 9 AM–11 PM. Hours may vary on holidays — check our social media for updates." },
  { q: 'Do you offer delivery?',          a: 'Yes! We offer both pickup and delivery. You can place your order online and choose your preferred method at checkout. Delivery radius covers most of West Philadelphia.' },
  { q: 'How long does an order take?',    a: 'Pickup orders are typically ready in about 15 minutes. Delivery times depend on your location and current demand, usually 25–40 minutes.' },
  { q: 'Can I customize my order?',       a: 'Absolutely. Our online ordering system lets you add modifiers, swap ingredients, and leave special instructions for every item.' },
  { q: 'Do you do catering?',             a: "Yes! We cater corporate events, birthday parties, brunch gatherings and more. Visit our Catering page to submit a request and we'll get back to you within 24 hours." },
  { q: 'Is there parking available?',     a: "Street parking is available on Lancaster Ave. We're also steps away from several SEPTA bus stops for easy transit access." },
];

const HOURS = [
  { d: 'Monday',    h: '8:00 AM – 10:00 PM' },
  { d: 'Tuesday',   h: '8:00 AM – 10:00 PM' },
  { d: 'Wednesday', h: '8:00 AM – 10:00 PM' },
  { d: 'Thursday',  h: '8:00 AM – 10:00 PM' },
  { d: 'Friday',    h: '8:00 AM – 10:00 PM' },
  { d: 'Saturday',  h: '9:00 AM – 11:00 PM' },
  { d: 'Sunday',    h: '9:00 AM – 9:00 PM'  },
];

/* ─────────────────────────────────────────────
   JSON-LD STRUCTURED DATA (Schema.org)
───────────────────────────────────────────── */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Eggs Ok',
  image: 'https://eggsokphilly.com/logo.svg',
  url: 'https://eggsokphilly.com',
  telephone: '+1-215-948-9902',
  servesCuisine: ['Breakfast', 'Lunch', 'American'],
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3517 Lancaster Ave',
    addressLocality: 'Philadelphia',
    addressRegion: 'PA',
    postalCode: '19104',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 39.96, longitude: -75.2 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '22:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '23:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday',   opens: '09:00', closes: '21:00' },
  ],
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '200' },
  hasMenu: 'https://eggsokphilly.com/order',
};

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isOpen, statusMessage } = useStoreSettings();

  const heroReveal      = useReveal();
  const featuredReveal  = useReveal();
  const menuReveal      = useReveal();
  const reviewsReveal   = useReveal();
  const rewardsReveal   = useReveal();
  const faqReveal       = useReveal();
  const locationReveal  = useReveal();

  const toggleFaq = useCallback((i: number) => setOpenFaq(prev => prev === i ? null : i), []);

  return (
    <main id="main-content" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Accessibility ── */
        .skip-link {
          position: absolute; top: -100px; left: 16px; z-index: 9999;
          background: #FED800; color: #000; padding: 12px 24px;
          border-radius: 0 0 8px 8px; font-weight: 700; font-size: 14px;
          text-decoration: none; transition: top 0.2s;
        }
        .skip-link:focus { top: 0; }
        :focus-visible { outline: 2px solid #FED800; outline-offset: 3px; }
        button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }

        /* ── Layout ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; line-height: 0.93; }

        /* ── Scroll Reveal ── */
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }

        /* ── Buttons ── */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #FED800; color: #000;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s; font-family: inherit;
        }
        .btn-yellow:hover { transform: translateY(-2px); box-shadow: 0 10px 28px #FED80050; }
        .btn-yellow:active { transform: translateY(0); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: #FEFEFE;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #ffffffff;
          transition: border-color 0.15s, color 0.15s, background 0.15s; font-family: inherit; cursor: pointer;
        }
        .btn-outline:hover { border-color: #FED800; color: #FED800; }
        .btn-outline:active { background: #f4f4f410; }

        .sec-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #FED800; margin-bottom: 10px; display: block;
        }

        /* ── Hero ── */
        .hero-section {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          text-align: center; position: relative; overflow: hidden;
          background-image: url('/main-menu/Avocado Omelette.jpg');
          background-size: cover; background-position: center; background-repeat: no-repeat;
        }
        .hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 40px; justify-content: center; flex-wrap: wrap; }

        /* ── Favorites ── */
        .fav-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .fav-card {
          background: #111; display: flex; flex-direction: column; align-items: center;
          text-align: center; border-radius: 18px; padding: 0 0 10px; overflow: hidden;
          transition: background 0.18s, transform 0.25s, box-shadow 0.25s;
          cursor: pointer; text-decoration: none; border: 1px solid #1A1A1A;
        }
        .fav-card:hover { background: #161616; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(254,216,0,0.08); border-color: #FED80030; }
        .fav-img-wrap { height: 200px; width: 100%; overflow: hidden; position: relative; margin-bottom: 20px; }
        .fav-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .fav-card:hover .fav-img-wrap img { transform: scale(1.06); }

        /* ── Menu Tiles ── */
        .menu-tiles { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 44px; }
        .menu-tile {
          border: 1px solid #1A1A1A; border-radius: 16px; overflow: hidden;
          text-decoration: none; display: flex; flex-direction: column;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s; background: #0D0D0D;
        }
        .menu-tile:hover { border-color: #FED80060; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(254,216,0,0.06); }
        .menu-tile-img { width: 100%; height: 200px; overflow: hidden; position: relative; }
        .menu-tile-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .menu-tile:hover .menu-tile-img img { transform: scale(1.06); }
        .menu-tile-body { padding: 16px 18px 20px; }

        /* ── Photo Gallery ── */
        .photo-gallery { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .gallery-item { border-radius: 20px; overflow: hidden; height: 250px; }
        .gallery-item img { transition: transform 0.4s ease; }
        .gallery-item:hover img { transform: scale(1.05); }

        /* ── About / Split Sections ── */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .about-img { height: 420px; }
        .about-content h2 { color: #FED800; font-size: 32px; font-weight: 700; margin-bottom: 16px; }
        .about-content p { color: #ffffffff; line-height: 1.7; font-size: 15px; max-width: 520px; }
        .about-content .btn-yellow,
        .about-content .order-btn { margin-top: 28px; }

        /* ── Order Hero CTA ── */
        .order-hero {
          padding: 120px 0; background-image: url('/main-menu/Avocado Omelette.jpg');
          background-size: cover; background-position: center;
          border-radius: 30px; margin: 60px auto; max-width: 1200px;
        }
        .order-card-box {
          background: #f5f2ec; padding: 40px; border-radius: 20px;
          max-width: 420px; margin-left: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .order-card-box h2 { color: #000000ff; font-size: 26px; font-weight: 700; margin-bottom: 12px; }
        .order-card-box p { color: #000; font-size: 14px; line-height: 1.7; margin-bottom: 20px; }
        .order-btn {
          display: inline-block; background: #FED800; color: #000;
          padding: 10px 18px; border-radius: 8px; font-weight: 600; text-decoration: none;
        }

        /* ── Reviews ── */
        .reviews-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .review-card {
          background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 18px; padding: 32px;
          transition: border-color 0.2s, transform 0.25s;
        }
        .review-card:hover { border-color: #FED80025; transform: translateY(-2px); }

        /* ── Rewards ── */
        .rewards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .rewards-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .reward-step {
          background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 16px;
          padding: 26px 20px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.25s;
        }
        .reward-step:hover { transform: translateY(-3px); }

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
        .faq-answer-wrap {
          background: #212020; border-radius: 0 0 12px 12px; overflow: hidden;
          display: grid; grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .faq-answer-wrap[data-open="true"] { grid-template-rows: 1fr; }
        .faq-answer-inner { overflow: hidden; }
        .faq-a { font-size: 14px; color: #eaeaea; line-height: 1.8; padding: 10px; max-width: 760px; }

        /* ── Location ── */
        .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 22px; overflow: hidden; border: 1px solid #1E1E1E; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 14px; color: #ffffffff; margin-bottom: 11px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
        .footer-link:hover { color: #FED800; padding-left: 4px; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .fav-grid { grid-template-columns: repeat(2,1fr); }
          .reviews-grid { grid-template-columns: 1fr; }
          .rewards-grid { grid-template-columns: 1fr; gap: 40px; }
          .location-grid { grid-template-columns: 1fr; }
          .menu-tiles { grid-template-columns: repeat(2,1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 900px) {
          .photo-gallery { grid-template-columns: repeat(2,1fr); }
          .about-grid { grid-template-columns: 1fr; }
          .about-img { height: 320px; }
        }
        @media (max-width: 768px) {
          .fav-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .hero-cta .btn-yellow, .hero-cta .btn-outline { flex: 1; justify-content: center; }
          .rewards-steps { grid-template-columns: 1fr; }
          .order-hero { padding: 60px 20px; }
          .order-card-box { margin: 0; max-width: 100%; }
        }
          .order-hero {
  position: relative;
  height: 300px;
  background: url('/main-menu/Avocado Omelette.jpg') no-repeat center center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark overlay for readability */
.overlay {
  width: 100%;
  // height: 100%;
  background: rgba(0.65, 0.55, 0.55, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-content {
  text-align: center;
  color: #fff;
  max-width: 800px;
  padding: 20px;
}

.small-text {
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 10px;
  display: block;
}

.order-content h1 {
  font-size: 48px;
  font-weight: 800;
  margin: 10px 0;
}

.order-content h1 span {
  color: #f5c518; /* yellow */
}

.order-content p {
  font-size: 16px;
  margin: 15px 0 25px;
}

.order-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}

.uber {
  background: #fff;
  color: #000;
}

.doordash {
  background: #fff;
  color: #e53935;
}

        @media (max-width: 500px) {
          .photo-gallery { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 14px; }
          .menu-tiles { grid-template-columns: repeat(2,1fr); gap: 8px; }
        }

        /* ═══ REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .fav-card, .menu-tile, .review-card, .reward-step { transition: none; }
          .fav-img-wrap img, .menu-tile-img img, .gallery-item img { transition: none; }
        }
      `}</style>

      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="hero-section" aria-label="Welcome to Eggs Ok">
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div
            className={`reveal ${heroReveal.visible ? 'visible' : ''}`}
            ref={heroReveal.ref}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}
          >
            {/* Store status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: isOpen ? '#22C55E15' : '#fdfdfd15',
              border: `2px solid ${isOpen ? '#22C55E30' : '#FC0301'}`,
              borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
              <span style={{ fontSize: '16px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>
                {isOpen ? statusMessage : 'Closed'}
              </span>
            </div>

            <h1 className="bebas" style={{ fontSize: 'clamp(52px, 7vw, 70px)', color: '#FEFEFE' }}>
              <span style={{ display: 'block' }}>WELCOME TO EGGS OK</span>
              <span style={{ display: 'block', color: '#FED800' }}></span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#ffffffff', lineHeight: 1.7, maxWidth: '560px', margin: '28px auto 40px' }}>
              Fresh made-to-order sandwiches, burritos, omelettes, and specialty drinks.
              Pickup or delivery from the heart of West Philly.
            </p>

            <div className="hero-cta">
              <Link href="/order" className="btn-yellow" style={{ fontSize: '16px', padding: '16px 34px' }}>
                <ShoppingCart size={18} /> Order Now
              </Link>
              <a href="#menu" className="btn-outline" style={{ fontSize: '16px', padding: '16px 34px' }}>
                View Menu
              </a>
            </div>

            <div className="hero-stats">
              {[{ v: '80+', l: 'Menu Items' }, { v: '15 min', l: 'Ready Time' }, { v: '5★', l: 'Rated' }].map((s, i) => (
                <div key={i}>
                  <p className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: '#FED800' }}>{s.v}</p>
                  <p style={{ fontSize: '12px', color: '#ccc', marginTop: '3px' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURED FAVORITES
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '20px 0' }} aria-labelledby="featured-heading">
        <div className="container" ref={featuredReveal.ref}>
          <div className={`reveal ${featuredReveal.visible ? 'visible' : ''}`} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '52px', flexWrap: 'wrap', gap: '20px' }}>
            <span className="sec-label">Featured</span>
            <Link href="/order" className="btn-outline">View Full Menu <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="fav-grid" role="list" aria-label="Featured menu items">
            {FAVORITES.map((item, i) => (
              <Link
                href={`/order?productId=${item.id}`} key={item.id}
                className={`fav-card reveal ${featuredReveal.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.08 * i}s` }}
                role="listitem" aria-label={`${item.name} — ${item.price}`}
              >
                <div className="fav-img-wrap">
                  <Image src={item.img} alt={item.name} width={400} height={200} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#000000CC', backdropFilter: 'blur(8px)', border: '1px solid #FED80040', borderRadius: '20px', padding: '4px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#FED800', letterSpacing: '0.5px' }}>{item.tag}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                </div>
                <div style={{ padding: '0 20px', width: '100%' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px', lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.5, marginBottom: '10px' }}>{item.desc}</p>
                  <p style={{ fontSize: '17px', fontWeight: '800', color: '#FED800' }}>{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. OUR STORY
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-img">
              <Image src="/main-menu/Avocado Omelette.jpg" alt="Inside Eggs Ok" width={600} height={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content">
              <h2>Born in the Heart of West Philly</h2>
              <p>
                Eggs Ok started with a simple idea — great breakfast should be fast, fresh, and made with
                real ingredients. Located at 3517 Lancaster Ave, we&apos;ve been serving the neighborhood
                made-to-order sandwiches, burritos, omelettes, and specialty drinks since day one.
                Every item on our menu is crafted with care and ready in about 15 minutes.
              </p>
              <Link href="/story" className="btn-yellow" style={{ marginTop: '28px' }}>
                Our Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FRESH INGREDIENTS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2>Fresh Ingredients, Bold Flavors</h2>
              <p>
                We source quality ingredients and prep everything in-house daily. Whether you&apos;re
                fueling up before work, grabbing lunch on the run, or treating yourself to a specialty
                matcha or smoothie, every bite and sip is made to satisfy. No shortcuts. No reheating.
                Just good food, every time.
              </p>
              <Link href="/order" className="btn-yellow" style={{ marginTop: '28px' }}>
                Order Now <ArrowRight size={15} />
              </Link>
            </div>
            <div className="about-img">
              <Image src="/main-menu/Breakfast BLT Sandwich.jpg" alt="Fresh Eggs Ok ingredients" width={600} height={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. ORDER AHEAD CTA
      ══════════════════════════════════════════ */}
      <div className="order-hero container">
        <div className="order-card-box">
          <h2>Order Ahead, Enjoy Anytime</h2>
          <p>
            Skip the line and order online in seconds. Pick it up hot and ready, or have it
            delivered straight to your door. It only takes a few taps.
          </p>
          <Link href="/order" className="order-btn">Order Now →</Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          6. OUR MENU GALLERY
      ══════════════════════════════════════════ */}
      <section id="menu" style={{ background: '#fff', padding: '40px 0' }} aria-labelledby="menu-heading">
        <div className="container" ref={menuReveal.ref}>
          <h2 id="menu-heading" className="bebas" style={{ fontSize: '1.5rem', color: '#000', textAlign: 'center', marginBottom: '12px' }}>
            OUR MENU
          </h2>
          <p style={{ textAlign: 'center', color: '#999', marginBottom: '28px' }}>
            Discover the delicious offerings we have for you.
          </p>
          <div className="photo-gallery">
            {MENU_TILES.map((tile, i) => (
              <div key={i} className="gallery-item">
                <Image src={tile.img} alt={tile.label} width={400} height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. CATERING
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '80px 0' }} aria-labelledby="catering-heading">
        <div className="container">
          <div className="about-grid">
            <div className="about-img">
              <Image src="/main-menu/Sunrise Burrito.jpg" alt="Eggs Ok catering spread" width={600} height={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content">
              <h2 id="catering-heading">Let Us Cater Your Next Event</h2>
              <p>
                From corporate breakfasts to birthday brunches, Eggs Ok brings the same fresh,
                made-to-order quality to your event. We handle setup, variety, and volume — you
                enjoy the moment. Submit a request and we&apos;ll get back to you within 24 hours.
              </p>
              <Link href="/catering" className="btn-yellow" style={{ marginTop: '28px' }}>
                Request Catering <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. REVIEWS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '20px 0' }} aria-labelledby="reviews-heading">
        <div className="container" ref={reviewsReveal.ref}>
          <div className={`reveal ${reviewsReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Reviews</span>
            <h2 id="reviews-heading" className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              WHAT OUR GUESTS <span style={{ color: '#FED800' }}>ARE SAYING</span>
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '14px' }}>
              {[0,1,2,3,4].map(i => <Star key={i} size={19} color="#FED800" fill="#FED800" aria-hidden="true" />)}
              <span style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }}>5.0 average from 200+ reviews</span>
            </div>
          </div>

          <div className="reviews-grid" role="list" aria-label="Customer reviews">
            {REVIEWS.map((r, i) => (
              <article key={i} className={`review-card reveal ${reviewsReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: `${0.1 * i}s` }} role="listitem">
                <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }} aria-label={`${r.stars} out of 5 stars`}>
                  {[0,1,2,3,4].map(s => <Star key={s} size={13} color="#FED800" fill="#FED800" aria-hidden="true" />)}
                </div>
                <blockquote style={{ fontSize: '15px', color: '#CCCCCC', lineHeight: 1.75, marginBottom: '24px', fontStyle: 'italic' }}>
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80050', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#FED800' }}>{r.name[0]}</span>
                    </div>
                    <cite style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', fontStyle: 'normal' }}>{r.name}</cite>
                  </div>
                  <time style={{ fontSize: '12px', color: '#555' }}>{r.date}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. REWARDS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '20px 0' }} aria-labelledby="rewards-heading">
        <div className="container" ref={rewardsReveal.ref}>
          <div className="rewards-grid">
            <div className={`reveal ${rewardsReveal.visible ? 'visible' : ''}`}>
              <span className="sec-label">Loyalty Program</span>
              <h2 id="rewards-heading" className="bebas" style={{ fontSize: 'clamp(36px, 5vw, 58px)', color: '#FEFEFE', marginBottom: '16px' }}>
                EGGS OK <span style={{ color: '#FED800' }}>REWARDS</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#CCCCCC', lineHeight: 1.8, marginBottom: '36px', maxWidth: '440px' }}>
                Every order earns you points. Redeem for free food, exclusive deals, and early access
                to new menu items. The more you eat, the more you earn.
              </p>
              <Link href="/account" className="btn-yellow">
                <Gift size={16} aria-hidden="true" /> Join Rewards — It&apos;s Free
              </Link>
            </div>

            <div className="rewards-steps" role="list" aria-label="How rewards work">
              {[
                { step: '01', title: 'Sign Up Free',    desc: 'Create your account in under a minute. No fees, ever.',    color: '#FED800' },
                { step: '02', title: 'Earn Points',     desc: '$1 spent = 10 points. Points stack up fast.',              color: '#FC0301' },
                { step: '03', title: 'Redeem Rewards',  desc: 'Free items, discounts, and exclusive member perks.',       color: '#22C55E' },
              ].map((s, i) => (
                <div key={i} className={`reward-step reveal ${rewardsReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: `${0.12 * i + 0.1}s`, borderColor: `${s.color}20` }} role="listitem">
                  <p className="bebas" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '64px', color: `${s.color}10`, lineHeight: 1 }} aria-hidden="true">{s.step}</p>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <p className="bebas" style={{ fontSize: '16px', color: s.color }}>{s.step}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#FEFEFE', marginBottom: '8px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: '#e7e7e7', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. FAQ
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '20px 0' }} aria-labelledby="faq-heading">
        <div className="container" ref={faqReveal.ref}>
          <div className={`reveal ${faqReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="sec-label">FAQ</span>
            <h2 id="faq-heading" className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              FREQUENTLY ASKED <span style={{ color: '#FED800' }}>QUESTIONS</span>
            </h2>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }} role="list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item reveal ${faqReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: `${0.06 * i}s` }} role="listitem">
                <button
                  className="faq-q"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-button-${i}`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18} aria-hidden="true"
                    color={openFaq === i ? '#FED800' : '#888'}
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                </button>
                <div className="faq-answer-wrap" data-open={openFaq === i ? 'true' : 'false'} id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-button-${i}`}>
                  <div className="faq-answer-inner">
                    <p className="faq-a">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '52px' }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>Still have questions?</p>
            <Link href="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. OUR LOCATION
      ══════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '20px 0' }} aria-labelledby="location-heading">
        <div className="container" ref={locationReveal.ref}>
          <div className={`reveal ${locationReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Find Us</span>
            <h2 id="location-heading" className="bebas" style={{ fontSize: 'clamp(36px, 6vw, 62px)', color: '#FEFEFE' }}>
              OUR <span style={{ color: '#FED800' }}>LOCATION</span>
            </h2>
          </div>

          <div className={`location-grid reveal ${locationReveal.visible ? 'visible' : ''} reveal-d1`}>
            {/* Info panel */}
            <div style={{ background: '#0D0D0D', padding: 'clamp(32px, 5vw, 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '36px' }}>
              <div>
                <div
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isOpen ? '#22C55E15' : '#FC030115', border: `1px solid ${isOpen ? '#22C55E30' : '#FC030130'}`, borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}
                  role="status" aria-live="polite"
                >
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} aria-hidden="true" />
                  <span style={{ fontSize: '12px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{isOpen ? 'Open Now' : 'Closed'}</span>
                </div>

                <h3 className="bebas" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#FEFEFE', marginBottom: '28px' }}>
                  EGGS OK<br /><span style={{ color: '#FED800' }}>WEST PHILADELPHIA</span>
                </h3>

                <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <p style={{ fontSize: '14px', color: '#FEFEFE', fontWeight: '600' }}>3517 Lancaster Ave</p>
                      <p style={{ fontSize: '13px', color: '#999' }}>Philadelphia, PA 19104</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <Clock size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {HOURS.map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px' }}>
                          <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                          <span style={{ fontSize: '13px', color: '#BBBBBB' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Smartphone size={16} color="#FED800" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <a href="tel:2159489902" style={{ fontSize: '14px', color: '#FEFEFE', textDecoration: 'none', fontWeight: '600' }}>215-948-9902</a>
                  </div>
                </address>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: '14px', padding: '12px 22px' }}>
                  <MapPin size={14} aria-hidden="true" /> Get Directions
                </a>
                <Link href="/order" className="btn-outline" style={{ fontSize: '14px', padding: '12px 22px' }}>Order Now</Link>
              </div>
            </div>

            {/* Map */}
            <div style={{ background: '#0A0A0A', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
              <iframe
                title="Eggs Ok location on Google Maps — 3517 Lancaster Ave, Philadelphia PA 19104"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.7!2d-75.2!3d39.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c65b7a6a5555%3A0x0!2s3517+Lancaster+Ave%2C+Philadelphia%2C+PA+19104!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', minHeight: '420px', display: 'block' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', borderRadius: '10px', padding: '10px 16px', border: '1px solid #FED80040', pointerEvents: 'none' }} aria-hidden="true">
                <p className="bebas" style={{ fontSize: '14px', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</p>
                <p style={{ fontSize: '11px', color: '#999' }}>3517 Lancaster Ave</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="order-hero">
        <div className="overlay">
          <div className="order-content">
            <span className="small-text">ORDER ONLINE</span>

            <h1>
              GET IT DELIVERED <br />
              <span>STRAIGHT TO YOUR DOOR</span>
            </h1>

            <p>
              Craving Philly Cheesesteak? Order takeout or get it delivered piping hot via your favorite app—
              UberEats, Grubhub, or DoorDash.
            </p>

            <div className="order-buttons">
              <img src="/main-menu/Ubereats-ordering-1.webp" alt="Uber Eats" width={120} />
              {/* <a href="#" className="btn doordash">DoorDash</a> */}
              <img src="/main-menu/Doordash-Ordering-1.webp" alt="DoorDash" width={120} />
            </div>
          </div>
        </div>
      </div>



      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={100} height={50} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#fff', lineHeight: 1.75, maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address style={{ fontStyle: 'normal' }}>
                <p style={{ fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#FED800" aria-hidden="true" /> 3517 Lancaster Ave, Philadelphia PA 19104
                </p>
                <p style={{ fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#FED800" aria-hidden="true" />
                  <a href="tel:2159489902" style={{ color: '#fff', textDecoration: 'none' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            <nav aria-label="Quick links">
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
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

            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#FEFEFE', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {HOURS.map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px' }}>
                          <span style={{ fontSize: '13px', color: '#FEFEFE', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                          <span style={{ fontSize: '13px', color: '#BBBBBB' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '13px', color: '#fff' }}>&copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.</p>
            <p style={{ fontSize: '13px', color: '#fff' }}>Built by <span style={{ color: '#FED800' }}>RestoRise Business Solutions</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}