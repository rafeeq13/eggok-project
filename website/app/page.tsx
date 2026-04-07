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
  { label: 'Breakfast Sandwiches', img: '/main-menu/Our-Gallery/1.webp', items: '9 items' },
  { label: 'Specialty Lattes',     img: '/main-menu/Our-Gallery/2.webp',       items: '4 items' },
  { label: 'Matcha Edition',       img: '/main-menu/Our-Gallery/3.webp',        items: '9 items' },
  { label: 'Smoothies',            img: '/main-menu/Our-Gallery/4.webp',        items: '7 items' },
  { label: 'Omelettes',            img: '/main-menu/Our-Gallery/5.webp',       items: '4 items' },
  { label: 'Burritos',             img: '/main-menu/Our-Gallery/6.webp',        items: '9 items' },
  { label: 'Smoothies',            img: '/main-menu/Our-Gallery/7.webp',        items: '7 items' },
  { label: 'Omelettes',            img: '/main-menu/Our-Gallery/8.webp',       items: '4 items' },
  { label: 'Burritos',             img: '/main-menu/Our-Gallery/8.webp',        items: '9 items' },
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
    <main id="main-content" className="homepage-main" style={{ background: '#000', minHeight: '100vh', fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>

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
          padding: 14px 28px; background: transparent; color: #ffffff;
          border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #ffffff;
          transition: border-color 0.15s, color 0.15s, background 0.15s; font-family: inherit; cursor: pointer;
        }
        .btn-outline:hover { border-color: #FED800; color: #FED800; }
        .btn-outline:active { background: #f4f4f410; }

        /* ── Section Label — consistent across all sections ── */
        .sec-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #FED800; margin-bottom: 10px; display: block;
        }

        /* ── Section Heading — consistent across all sections ── */
        .sec-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 62px);
          letter-spacing: 1px;
          line-height: 0.95;
          color: #ffffff;
        }

        /* ── Hero ── */
        .hero-section {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          text-align: center; position: relative; overflow: hidden;
          background-image: url('/main-menu/Hero-Banner.webp');
          background-size: cover; background-position: center; background-repeat: no-repeat;
        }
        .hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 40px; justify-content: center; flex-wrap: wrap; }

        /* ── Favorites ── */
        .fav-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .fav-card {
          background: #111; display: flex; flex-direction: column; align-items: center;
          text-align: center; border-radius: 18px; padding: 0 0 20px; overflow: hidden;
          transition: background 0.18s, transform 0.25s, box-shadow 0.25s;
          cursor: pointer; text-decoration: none; border: 1px solid #1A1A1A;
        }
        .fav-card:hover { background: #161616; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(254,216,0,0.08); border-color: #FED80030; }
        .fav-img-wrap { height: 220px; width: 100%; overflow: hidden; position: relative; margin-bottom: 20px; flex-shrink: 0; }
        .fav-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .fav-card:hover .fav-img-wrap img { transform: scale(1.06); }

        /* ── Menu Tiles ── */
        .menu-tiles { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 44px; }
        .menu-tile {
          border: 1px solid #1A1A1A; border-radius: 16px; overflow: hidden;
          text-decoration: none; display: flex; flex-direction: column;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s; background: #0D0D0D;
        }
        .menu-tile:hover { border-color: #FED80060; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(254,216,0,0.06); }
        .menu-tile-img { width: 100%; height: 220px; overflow: hidden; position: relative; flex-shrink: 0; }
        .menu-tile-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .menu-tile:hover .menu-tile-img img { transform: scale(1.06); }
        .menu-tile-body { padding: 18px 20px 22px; display:none !important; }

        /* ── Photo Gallery ── */
        .photo-gallery { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .gallery-item { border-radius: 20px; overflow: hidden; height: 280px; position: relative; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .gallery-item:hover img { transform: scale(1.05); }

        /* ── About / Split Sections ── */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .about-img { height: 460px; border-radius: 20px; overflow: hidden; position: relative; }
        .about-img img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 20px; }
        .about-content h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(32px, 4vw, 52px);
          letter-spacing: 1px; line-height: 1;
          color: #ffffffff; margin-bottom: 20px;
        }
        .about-content p { color: #ffffff; line-height: 1.75; font-size: 15px; max-width: 520px; }

        /* ── Order Ahead CTA (Section 5) ── */
        .order-ahead-hero {
          position: relative; overflow: hidden;
          border-radius: 24px; margin: 60px auto;
          max-width: 1200px; 
          max-height: 600px;
          min-height: 600px;
          background-image: url('/main-menu/Main-Page/catering-home.webp');
          background-size: cover; background-position: center;
          display: flex; align-items: center; justify-content: flex-end;
        }
        .order-ahead-overlay {
          position: absolute; inset: 0;
          // background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.88) 45%);
        }
        .order-card-box {
          position: relative; z-index: 1;
          background: rgba(8,8,8,0.92); padding: 44px 48px;
          border-radius: 20px; max-width: 440px;
          margin: 40px 48px 40px auto;
          border: 1px solid #222;
          backdrop-filter: blur(16px);
        }
        .order-card-box h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 3.5vw, 44px);
          letter-spacing: 1px; line-height: 1;
          color: #ffffff; margin-bottom: 14px;
        }
        .order-card-box p { color: #AAAAAA; font-size: 14px; line-height: 1.75; margin-bottom: 24px; }
        .order-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #FED800; color: #000;
          padding: 13px 26px; border-radius: 10px; font-weight: 700;
          font-size: 15px; text-decoration: none; font-family: inherit;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .order-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px #FED80050; }

        /* ── Delivery CTA Section (Section 12) ── */
        .delivery-hero {
          position: relative; overflow: hidden;
          background-image: url('/main-menu/Main-Page/catering-home.webp');
          background-size: cover; background-position: center;
          min-height: 420px;
          display: flex; align-items: center; justify-content: center;
        }
        .delivery-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.72);
        }
        .delivery-content {
          position: relative; z-index: 1;
          text-align: center; color: #fff;
          max-width: 700px; padding: 72px 24px;
        }
        .delivery-small-text {
          font-size: 11px; font-weight: 700;
          letter-spacing: 3.5px; text-transform: uppercase;
          color: #FED800; margin-bottom: 14px; display: block;
        }
        .delivery-content h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 62px);
          letter-spacing: 1px; line-height: 0.95;
          color: #ffffff; margin-bottom: 16px;
        }
        .delivery-content h2 span { color: #FED800; }
        .delivery-content p {
          font-size: 15px; color: #ffffff;
          line-height: 1.75; margin-bottom: 36px;
          max-width: 480px; margin-left: auto; margin-right: auto;
        }
        .delivery-buttons {
          display: flex; justify-content: center; align-items: center;
          gap: 24px; flex-wrap: wrap;
        }
        .delivery-buttons img {
          height: 52px; width: auto;
          // border-radius: 10px; object-fit: contain;
          transition: transform 0.18s, opacity 0.18s;
          opacity: 0.92;
        }
        .delivery-buttons img:hover { transform: translateY(-3px); opacity: 1; }

        /* ── Reviews ── */
        .reviews-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .review-card {
          background: #0D0D0D;
          border: 1px solid #1A1A1A;
          border-left: 3px solid #FED800;
          border-radius: 18px; padding: 32px;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .review-card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(254,216,0,0.06); }

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
          width: 100%; background: none; border: none; color: #ffffff;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 0; gap: 16px; text-align: left;
          font-family: inherit; transition: color 0.15s;
        }
        .faq-q:hover { color: #FED800; }
        .faq-answer-wrap {
          background: #111; border-radius: 0 0 12px 12px; overflow: hidden;
          display: grid; grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .faq-answer-wrap[data-open="true"] { grid-template-rows: 1fr; }
        .faq-answer-inner { overflow: hidden; }
        .faq-a { font-size: 14px; color: #ffffff; line-height: 1.8; padding: 16px 20px; max-width: 760px; }

        /* ── Location ── */
        .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 22px; overflow: hidden; border: 1px solid #1E1E1E; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 14px; color: #ffffff; margin-bottom: 11px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
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
          .order-card-box { margin: 40px 32px 40px auto; }
        }
        @media (max-width: 900px) {
          .photo-gallery { grid-template-columns: repeat(2,1fr); }
          .about-grid { grid-template-columns: 1fr; }
          .about-img { height: 340px; }
          .order-ahead-hero { justify-content: center; }
          .order-ahead-overlay { background: rgba(0,0,0,0.80); }
          .order-card-box { margin: 40px auto; max-width: 92%; }
        }
        @media (max-width: 768px) {
          .fav-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .hero-cta .btn-yellow, .hero-cta .btn-outline { flex: 1; justify-content: center; }
          .rewards-steps { grid-template-columns: 1fr; }
          .order-card-box { margin: 24px; max-width: 100%; padding: 32px 28px; }
        }
        @media (max-width: 500px) {
        .hero-order-btn{
        padding:16px 14px !important;
        white-space: nowrap !important;
        }
          .photo-gallery { grid-template-columns: 1fr; }
          .gallery-item { height: 220px; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 14px; }
          .menu-tiles { grid-template-columns: repeat(2,1fr); gap: 8px; }
          .menu-tile-img { height: 160px; }
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
      <section id="hero" className="hero-section" aria-label="Welcome to Eggs Ok">
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 0 }} />

        <div className="container hero-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div
            id="hero-content"
            className={`hero-inner reveal ${heroReveal.visible ? 'visible' : ''}`}
            ref={heroReveal.ref}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}
          >
            {/* Store status badge */}
            <div
              id="hero-store-status"
              className="hero-status-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: isOpen ? '#22C55E15' : '#fdfdfd15',
                border: `2px solid ${isOpen ? '#22C55E30' : '#FC0301'}`,
                borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
              }}
            >
              <span className="hero-status-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
              <span className="hero-status-text" style={{ fontSize: '16px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>
                {isOpen ? statusMessage : 'Closed'}
              </span>
            </div>

            <h1 id="hero-title" className="hero-title bebas" style={{ fontSize: 'clamp(52px, 7vw, 72px)', color: '#ffffff' }}>
              <span className="hero-title-line1" style={{ display: 'block' }}>WELCOME TO EGGS OK</span>
              <span className="hero-title-line2" style={{ display: 'block', color: '#FED800' }}>WEST PHILADELPHIA</span>
            </h1>

            <p id="hero-subtitle" className="hero-subtitle" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#ffffff', lineHeight: 1.7, maxWidth: '560px', margin: '28px auto 40px' }}>
              Fresh made-to-order sandwiches, burritos, omelettes, and specialty drinks.
              Pickup or delivery from the heart of West Philly.
            </p>

            <div id="hero-cta-buttons" className="hero-cta">
              <Link href="/order" className="btn-yellow hero-order-btn" style={{ fontSize: '16px', padding: '16px 34px' }}>
                <ShoppingCart size={18} /> Order Now
              </Link>
              <a href="#menu" className="btn-outline hero-menu-btn" style={{ fontSize: '16px', padding: '16px 34px' }}>
                View Menu
              </a>
            </div>

            <div id="hero-stats-bar" className="hero-stats">
              {[{ v: '80+', l: 'Menu Items' }, { v: '15 min', l: 'Ready Time' }, { v: '5★', l: 'Rated' }].map((s, i) => (
                <div key={i} className={`hero-stat hero-stat-${i + 1}`}>
                  <p className="hero-stat-value bebas" style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: '#FED800' }}>{s.v}</p>
                  <p className="hero-stat-label" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURED FAVORITES
      ══════════════════════════════════════════ */}
      <section id="featured" className="section-featured" style={{ background: '#0A0A0A', padding: '80px 0' }} aria-labelledby="featured-heading">
        <div className="container featured-container" ref={featuredReveal.ref}>
          <div className={`featured-header reveal ${featuredReveal.visible ? 'visible' : ''}`} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '52px', flexWrap: 'wrap', gap: '20px' }}>
            <div className="featured-header-text">
              <span className="sec-label">Featured</span>
              <h2 id="featured-heading" className="sec-heading">OUR <span className="text-accent" style={{ color: '#FED800' }}>FAVORITES</span></h2>
            </div>
            <Link href="/order" className="btn-outline featured-view-all-btn">View Full Menu <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div id="favorites-grid" className="fav-grid" role="list" aria-label="Featured menu items">
            {FAVORITES.map((item, i) => (
              <Link
                href={`/order?productId=${item.id}`} key={item.id}
                id={`fav-card-${item.id}`}
                className={`fav-card reveal ${featuredReveal.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.08 * i}s` }}
                role="listitem" aria-label={`${item.name} — ${item.price}`}
              >
                <div className="fav-img-wrap">
                  <Image src={item.img} alt={item.name} width={400} height={220} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div className="fav-tag-badge" style={{ position: 'absolute', top: '14px', left: '14px', background: '#000000CC', backdropFilter: 'blur(8px)', border: '1px solid #FED80040', borderRadius: '20px', padding: '4px 12px' }}>
                    <span className="fav-tag-text" style={{ fontSize: '11px', fontWeight: '700', color: '#FED800', letterSpacing: '0.5px' }}>{item.tag}</span>
                  </div>
                  <div className="fav-add-btn" style={{ position: 'absolute', bottom: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                </div>
                <div className="fav-card-body" style={{ padding: '0 20px 4px', width: '100%' }}>
                  <p className="fav-card-name" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '6px', lineHeight: 1.3 }}>{item.name}</p>
                  <p className="fav-card-desc" style={{ fontSize: '13px', color: '#999', lineHeight: 1.5, marginBottom: '10px' }}>{item.desc}</p>
                  <p className="fav-card-price" style={{ fontSize: '17px', fontWeight: '800', color: '#FED800' }}>{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. OUR STORY
      ══════════════════════════════════════════ */}
      <section id="our-story" className="section-story" style={{ background: '#000', padding: '80px 0' }}>
        <div className="container story-container">
          <div className="about-grid story-grid">
            <div className="about-img story-img">
              <Image src="/main-menu/Main-Page/Born-in-the-Heart-of-West-Philly.webp" alt="Inside Eggs Ok" width={600} height={460}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content story-content">
              <span className="sec-label">Our Story</span>
              <h2 id="story-heading" className="story-heading">Born in the Heart <span className="text-accent" style={{ color: '#FED800' }}>of West Philly</span></h2>

              <p className="story-body">
                Eggs Ok started with a simple idea — great breakfast should be fast, fresh, and made with
                real ingredients. Located at 3517 Lancaster Ave, we&apos;ve been serving the neighborhood
                made-to-order sandwiches, burritos, omelettes, and specialty drinks since day one.
                Every item on our menu is crafted with care and ready in about 15 minutes.
              </p>
              <Link href="/story" className="btn-yellow story-cta-btn" style={{ marginTop: '32px' }}>
                Our Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FRESH INGREDIENTS
      ══════════════════════════════════════════ */}
      <section id="quality" className="section-quality" style={{ background: '#0A0A0A', padding: '80px 0' }}>
        <div className="container quality-container">
          <div className="about-grid quality-grid">
            <div className="about-content quality-content">
              <span className="sec-label">Quality First</span>
              <h2 id="quality-heading" className="quality-heading">Fresh Ingredients, <span className="text-accent" style={{ color: '#FED800' }}> Bold Flavors</span></h2>
              <p className="quality-body">
                We source quality ingredients and prep everything in-house daily. Whether you&apos;re
                fueling up before work, grabbing lunch on the run, or treating yourself to a specialty
                matcha or smoothie, every bite and sip is made to satisfy. No shortcuts. No reheating.
                Just good food, every time.
              </p>
              <Link href="/order" className="btn-yellow quality-cta-btn" style={{ marginTop: '32px' }}>
                Order Now <ArrowRight size={15} />
              </Link>
            </div>
            <div className="about-img quality-img">
              <Image src="/main-menu/Main-Page/Fresh-Ingredients-Bold-Flavors.webp" alt="Fresh Eggs Ok ingredients" width={600} height={460}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. ORDER AHEAD CTA
      ══════════════════════════════════════════ */}
      <div id="order-ahead" className="order-ahead-hero container">
        <div className="order-ahead-overlay" />
        <div className="order-card-box">
          <h2 id="order-ahead-heading" className="order-ahead-heading">Order Ahead, <span className="text-accent" style={{ color: '#FED800' }}> Enjoy Anytime</span></h2>
          <p className="order-ahead-body">
            Skip the line and order online in seconds. Pick it up hot and ready, or have it
            delivered straight to your door. It only takes a few taps.
          </p>
          <Link href="/order" className="order-btn order-ahead-cta">Order Now <ArrowRight size={15} /></Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          6. OUR MENU GALLERY
      ══════════════════════════════════════════ */}
      <section id="menu" className="section-menu" style={{ background: '#0A0A0A', padding: '80px 0' }} aria-labelledby="menu-heading">
        <div className="container menu-container" ref={menuReveal.ref}>
          <div className={`menu-header reveal ${menuReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'left', marginBottom: '52px' }}>
            <span className="sec-label">Explore</span>
            <h2 id="menu-heading" className="sec-heading">
             A Taste Of  <span className="text-accent" style={{ color: '#FED800' }}> OUR MENU</span>
            </h2>
            <p className="menu-subheading" style={{ color: '#ffffff', marginTop: '14px', fontSize: '15px' }}>
              Bright Flavors, warm atmosphere, and a menu that has something for everyone. <br /> From classic breakfast sandwiches to bold specialty drinks,  get a glimpse of what we offer <br /> before you order. 
            </p>
          </div>

          <div id="menu-tiles-grid" className="menu-tiles" role="list" aria-label="Menu categories">
            {MENU_TILES.map((tile, i) => (
              <Link
                href="/order"
                key={i}
                id={`menu-tile-${i}`}
                className={`menu-tile reveal ${menuReveal.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.07 * i}s` }}
                role="listitem"
                aria-label={`${tile.label} — ${tile.items}`}
              >
                <div className="menu-tile-img">
                  <Image src={tile.img} alt={tile.label} width={400} height={220}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div className="menu-tile-body">
                  <p className="menu-tile-label" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{tile.label}</p>
                  <p className="menu-tile-count" style={{ fontSize: '12px', color: '#FED800', fontWeight: '600' }}>{tile.items}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* <div id="menu-photo-gallery" className="photo-gallery">
            {MENU_TILES.map((tile, i) => (
              <div key={i} id={`gallery-item-${i}`} className="gallery-item">
                <Image src={tile.img} alt={tile.label} width={400} height={280}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. CATERING
      ══════════════════════════════════════════ */}
      <section id="catering" className="section-catering" style={{ background: '#000', padding: '80px 0' }} aria-labelledby="catering-heading">
        <div className="container catering-container">
          <div className="about-grid catering-grid">
            <div className="about-img catering-img">
              <Image src="/main-menu/Main-Page/catering-home.webp" alt="Eggs Ok catering spread" width={600} height={460}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content catering-content">
              <span className="sec-label">Catering</span>
              <h2 id="catering-heading" className="catering-heading">Let Us Cater Your <span className="text-accent" style={{ color: '#FED800' }}> Next Event</span></h2>
              <p className="catering-body">
                From corporate breakfasts to birthday brunches, Eggs Ok brings the same fresh,
                made-to-order quality to your event. We handle setup, variety, and volume — you
                enjoy the moment. Submit a request and we&apos;ll get back to you within 24 hours.
              </p>
              <Link href="/catering" className="btn-yellow catering-cta-btn" style={{ marginTop: '32px' }}>
                Request Catering <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. REVIEWS
      ══════════════════════════════════════════ */}
      <section id="reviews" className="section-reviews" style={{ background: '#0A0A0A', padding: '80px 0' }} aria-labelledby="reviews-heading">
        <div className="container reviews-container" ref={reviewsReveal.ref}>
          <div className={`reviews-header reveal ${reviewsReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Reviews</span>
            <h2 id="reviews-heading" className="sec-heading">
              WHAT OUR GUESTS <span className="text-accent" style={{ color: '#FED800' }}>ARE SAYING</span>
            </h2>
            <div id="reviews-rating-bar" className="reviews-rating-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '14px' }}>
              {[0,1,2,3,4].map(i => <Star key={i} size={19} color="#FED800" fill="#FED800" aria-hidden="true" />)}
              <span className="reviews-rating-text" style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }}>5.0 average from 200+ reviews</span>
            </div>
          </div>

          <div id="reviews-grid" className="reviews-grid" role="list" aria-label="Customer reviews">
            {REVIEWS.map((r, i) => (
              <article
                key={i}
                id={`review-card-${i}`}
                className={`review-card reveal ${reviewsReveal.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.1 * i}s` }}
                role="listitem"
              >
                <div className="review-stars" style={{ display: 'flex', gap: '3px', marginBottom: '18px' }} aria-label={`${r.stars} out of 5 stars`}>
                  {[0,1,2,3,4].map(s => <Star key={s} size={13} color="#FED800" fill="#FED800" aria-hidden="true" />)}
                </div>
                <blockquote className="review-quote" style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.75, marginBottom: '24px', fontStyle: 'italic' }}>
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <div className="review-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="review-author" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="review-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80050', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                      <span className="review-avatar-initial" style={{ fontSize: '14px', fontWeight: '700', color: '#FED800' }}>{r.name[0]}</span>
                    </div>
                    <cite className="review-name" style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', fontStyle: 'normal' }}>{r.name}</cite>
                  </div>
                  <time className="review-date" style={{ fontSize: '12px', color: '#555' }}>{r.date}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. REWARDS
      ══════════════════════════════════════════ */}
      <section id="rewards" className="section-rewards" style={{ background: '#000', padding: '80px 0' }} aria-labelledby="rewards-heading">
        <div className="container rewards-container" ref={rewardsReveal.ref}>
          <div className="rewards-grid">
            <div className={`rewards-left reveal ${rewardsReveal.visible ? 'visible' : ''}`}>
              <span className="sec-label">Loyalty Program</span>
              <h2 id="rewards-heading" className="sec-heading" style={{ marginBottom: '16px' }}>
                EGGS OK <span className="text-accent" style={{ color: '#FED800' }}>REWARDS</span>
              </h2>
              <p className="rewards-body" style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.8, marginBottom: '36px', maxWidth: '440px' }}>
                Every order earns you points. Redeem for free food, exclusive deals, and early access
                to new menu items. The more you eat, the more you earn.
              </p>
              <Link href="/account" className="btn-yellow rewards-join-btn">
                <Gift size={16} aria-hidden="true" /> Join Rewards — It&apos;s Free
              </Link>
            </div>

            <div id="rewards-steps" className="rewards-steps" role="list" aria-label="How rewards work">
              {[
                { step: '01', title: 'Sign Up Free',    desc: 'Create your account in under a minute. No fees, ever.',    color: '#FED800' },
                { step: '02', title: 'Earn Points',     desc: '$1 spent = 10 points. Points stack up fast.',              color: '#FC0301' },
                { step: '03', title: 'Redeem Rewards',  desc: 'Free items, discounts, and exclusive member perks.',       color: '#22C55E' },
              ].map((s, i) => (
                <div
                  key={i}
                  id={`reward-step-${i + 1}`}
                  className={`reward-step reveal ${rewardsReveal.visible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.12 * i + 0.1}s`, borderColor: `${s.color}20` }}
                  role="listitem"
                >
                  <p className="reward-step-bg-number bebas" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '64px', color: `${s.color}10`, lineHeight: 1 }} aria-hidden="true">{s.step}</p>
                  <div className="reward-step-icon" style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <p className="reward-step-number bebas" style={{ fontSize: '16px', color: s.color }}>{s.step}</p>
                  </div>
                  <p className="reward-step-title" style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>{s.title}</p>
                  <p className="reward-step-desc" style={{ fontSize: '13px', color: '#AAAAAA', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. FAQ
      ══════════════════════════════════════════ */}
      <section id="faq" className="section-faq" style={{ background: '#0A0A0A', padding: '80px 0' }} aria-labelledby="faq-heading">
        <div className="container faq-container" ref={faqReveal.ref}>
          <div className={`faq-header reveal ${faqReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="sec-label">FAQ</span>
            <h2 id="faq-heading" className="sec-heading">
              FREQUENTLY ASKED <span className="text-accent" style={{ color: '#FED800' }}>QUESTIONS</span>
            </h2>
          </div>

          <div id="faq-list" className="faq-list" style={{ maxWidth: '800px', margin: '0 auto' }} role="list">
            {FAQS.map((faq, i) => (
              <div key={i} id={`faq-item-${i}`} className={`faq-item reveal ${faqReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: `${0.06 * i}s` }} role="listitem">
                <button
                  className="faq-q"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-button-${i}`}
                >
                  <span className="faq-question-text">{faq.q}</span>
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

          <div id="faq-contact-cta" className="faq-contact-cta" style={{ textAlign: 'center', marginTop: '52px' }}>
            <p className="faq-contact-text" style={{ fontSize: '14px', color: '#ffffff', marginBottom: '16px' }}>Still have questions?</p>
            <Link href="/contact" className="btn-outline faq-contact-btn">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. OUR LOCATION
      ══════════════════════════════════════════ */}
      <section id="location" className="section-location" style={{ background: '#000', padding: '80px 0' }} aria-labelledby="location-heading">
        <div className="container location-container" ref={locationReveal.ref}>
          <div className={`location-header reveal ${locationReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="sec-label">Find Us</span>
            <h2 id="location-heading" className="sec-heading">
              OUR <span className="text-accent" style={{ color: '#FED800' }}>LOCATION</span>
            </h2>
          </div>

          <div id="location-grid" className={`location-grid reveal ${locationReveal.visible ? 'visible' : ''} reveal-d1`}>
            {/* Info panel */}
            <div id="location-info" className="location-info-panel" style={{ background: '#0D0D0D', padding: 'clamp(32px, 5vw, 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '36px' }}>
              <div className="location-info-body">
                <div
                  id="location-status-badge"
                  className="location-status-badge"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isOpen ? '#22C55E15' : '#FC030115', border: `1px solid ${isOpen ? '#22C55E30' : '#FC030130'}`, borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}
                  role="status" aria-live="polite"
                >
                  <div className="location-status-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} aria-hidden="true" />
                  <span className="location-status-text" style={{ fontSize: '12px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{isOpen ? 'Open Now' : 'Closed'}</span>
                </div>

                <h3 id="location-name" className="location-name bebas" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#ffffff', marginBottom: '28px' }}>
                  EGGS OK<br /><span className="location-name-accent" style={{ color: '#FED800' }}>WEST PHILADELPHIA</span>
                </h3>

                <address id="location-address" className="location-address" style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="location-address-row" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div className="location-address-text">
                      <p className="location-street" style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>3517 Lancaster Ave</p>
                      <p className="location-city" style={{ fontSize: '13px', color: '#999' }}>Philadelphia, PA 19104</p>
                    </div>
                  </div>
                  <div className="location-hours-row" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <Clock size={16} color="#FED800" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                    <div id="location-hours-list" className="location-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {HOURS.map((row, i) => (
                        <div key={i} className={`location-hours-row-item location-hours-${row.d.toLowerCase()}`} style={{ display: 'flex', gap: '14px' }}>
                          <span className="location-hours-day" style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                          <span className="location-hours-time" style={{ fontSize: '13px', color: '#BBBBBB' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="location-phone-row" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Smartphone size={16} color="#FED800" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <a href="tel:2159489902" className="location-phone" style={{ fontSize: '14px', color: '#ffffff', textDecoration: 'none', fontWeight: '600' }}>215-948-9902</a>
                  </div>
                </address>
              </div>

              <div id="location-cta-buttons" className="location-cta-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" className="btn-yellow location-directions-btn" style={{ fontSize: '14px', padding: '12px 22px' }}>
                  <MapPin size={14} aria-hidden="true" /> Get Directions
                </a>
                <Link href="/order" className="btn-outline location-order-btn" style={{ fontSize: '14px', padding: '12px 22px' }}>Order Now</Link>
              </div>
            </div>

            {/* Map */}
            <div id="location-map" className="location-map-panel" style={{ background: '#0A0A0A', minHeight: '460px', position: 'relative', overflow: 'hidden' }}>
              <iframe
                id="location-map-iframe"
                title="Eggs Ok location on Google Maps — 3517 Lancaster Ave, Philadelphia PA 19104"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.7!2d-75.2!3d39.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c65b7a6a5555%3A0x0!2s3517+Lancaster+Ave%2C+Philadelphia%2C+PA+19104!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', minHeight: '460px', display: 'block' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div id="location-map-pin" className="location-map-pin" style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', borderRadius: '10px', padding: '10px 16px', border: '1px solid #FED80040', pointerEvents: 'none' }} aria-hidden="true">
                <p className="location-map-pin-name bebas" style={{ fontSize: '14px', color: '#FED800', letterSpacing: '1px' }}>EGGS OK</p>
                <p className="location-map-pin-address" style={{ fontSize: '11px', color: '#999' }}>3517 Lancaster Ave</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          12. DELIVERY CTA
      ══════════════════════════════════════════ */}
      <section id="delivery" className="delivery-hero section-delivery" aria-labelledby="delivery-heading">
        <div className="delivery-overlay" />
        <div className="delivery-content">
          <span className="delivery-small-text">Order Online</span>
          <h2 id="delivery-heading" className="delivery-heading">
            GET IT DELIVERED <br />
            <span className="delivery-heading-accent">STRAIGHT TO YOUR DOOR</span>
          </h2>
          <p className="delivery-body">
            Craving something fresh? Order online and get it delivered piping hot via your
            favorite delivery app — fast, easy, and always made to order.
          </p>
          <div id="delivery-app-buttons" className="delivery-buttons">
            <img id="ubereats-btn" className="delivery-app-btn delivery-app-ubereats" src="/main-menu/Ubereats-ordering-1.webp" alt="Order on Uber Eats" />
            <img id="doordash-btn" className="delivery-app-btn delivery-app-doordash" src="/main-menu/Doordash-Ordering-1.webp" alt="Order on DoorDash" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="footer" className="site-footer" style={{ background: '#050505', padding: '68px 0 32px', borderTop: '1px solid #141414' }}>
        <div className="container footer-container">
          <div className="footer-grid">
            <div id="footer-brand" className="footer-brand">
              <div className="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div className="footer-logo-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={100} height={50} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p className="footer-brand-tagline" style={{ fontSize: '14px', color: '#ffffff', lineHeight: 1.75, maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address id="footer-address" className="footer-address" style={{ fontStyle: 'normal' }}>
                <p className="footer-address-line" style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#FED800" aria-hidden="true" href='https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104'/> <a href='https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104' className="footer-address-link">3517 Lancaster Ave, Philadelphia PA 19104</a>
                </p>
                <p className="footer-phone-line" style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#FED800" aria-hidden="true" />
                  <a href="tel:2159489902" className="footer-phone-link" style={{ color: '#ffffff', textDecoration: 'none' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            <nav id="footer-nav" className="footer-nav" aria-label="Quick links">
              <p className="footer-nav-heading" style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
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

            <div id="footer-hours" className="footer-hours">
              <p className="footer-hours-heading" style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div id="footer-hours-list" className="footer-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {HOURS.map((row, i) => (
                  <div key={i} className={`footer-hours-row footer-hours-${row.d.toLowerCase()}`} style={{ display: 'flex', gap: '14px' }}>
                    <span className="footer-hours-day" style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                    <span className="footer-hours-time" style={{ fontSize: '13px', color: '#BBBBBB' }}>{row.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="footer-bottom" className="footer-bottom">
            <p id="footer-copyright" className="footer-copyright" style={{ fontSize: '13px', color: '#ffffff' }}>&copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.</p>
            <p id="footer-credit" className="footer-credit" style={{ fontSize: '13px', color: '#ffffff' }}>Built by <span className="footer-credit-brand" style={{ color: '#FED800' }}>RestoRise Business Solutions</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}