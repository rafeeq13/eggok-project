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
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useCart } from './context/CartContext';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
// No static favorites — all come from menu management (isPopular items)

const MENU_TILES = [
  { label: 'Breakfast Sandwiches', img: '/main-menu/Our-Gallery/1.webp', items: '9 items' },
  { label: 'Specialty Lattes',     img: '/main-menu/Our-Gallery/2.webp',       items: '4 items' },
  { label: 'Matcha Edition',       img: '/main-menu/Our-Gallery/3.webp',        items: '9 items' },
  { label: 'Smoothies',            img: '/main-menu/Our-Gallery/4.webp',        items: '7 items' },
  { label: 'Omelettes',            img: '/main-menu/Our-Gallery/5.webp',       items: '4 items' },
  { label: 'Burritos',             img: '/main-menu/Our-Gallery/6.webp',        items: '9 items' },
  { label: 'Smoothies',            img: '/main-menu/Our-Gallery/7.webp',        items: '7 items' },
  { label: 'Omelettes',            img: '/main-menu/Our-Gallery/8.webp',       items: '4 items' },
  { label: 'Burritos',             img: '/main-menu/Our-Gallery/9.webp',        items: '9 items' },
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
  image: 'https://eggsokphilly.com/logo.webp',
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
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isOpen, statusMessage, isDeliveryEnabled, isPickupEnabled } = useStoreSettings();
  const { addToCart, orderType, setOrderType } = useCart();

  // Favorites carousel
  const favScrollRef = useRef<HTMLDivElement>(null);
  const scrollFavorites = (dir: 'left' | 'right') => {
    favScrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  // Add-to-cart modal state
  const [selectedFav, setSelectedFav] = useState<any | null>(null);
  const [favQty, setFavQty] = useState(1);
  const [fullMenuItem, setFullMenuItem] = useState<any | null>(null);
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [favInstructions, setFavInstructions] = useState('');

  const openFavModal = (fav: any) => {
    setSelectedFav(fav);
    setFavQty(1);
    setSelectedModifiers({});
    setFavInstructions('');
    // Use already-fetched full item data
    const match = allMenuItems.find((i: any) => i.id === fav.id);
    if (match) {
      setFullMenuItem(match);
    } else {
      // Fallback: fetch if not yet loaded
      setFullMenuItem(null);
      fetch(`${API}/menu/items`)
        .then(r => r.ok ? r.json() : [])
        .then(items => {
          const found = items.find((i: any) => i.id === fav.id);
          if (found) setFullMenuItem(found);
        })
        .catch(() => {});
    }
  };

  const toggleModifier = (groupId: number, optId: number, maxSel: number) => {
    setSelectedModifiers(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optId)) return { ...prev, [groupId]: current.filter(id => id !== optId) };
      if (maxSel === 1) return { ...prev, [groupId]: [optId] };
      if (current.length >= maxSel) return prev;
      return { ...prev, [groupId]: [...current, optId] };
    });
  };

  const canAddFav = () => {
    if (!fullMenuItem?.modifiers) return true;
    return fullMenuItem.modifiers.filter((g: any) => g.required).every((g: any) => (selectedModifiers[g.id] || []).length >= Math.max(g.minSelections, 1));
  };

  const handleAddFav = () => {
    if (!fullMenuItem || !canAddFav()) return;
    addToCart(fullMenuItem, favQty, selectedModifiers, favInstructions);
    setSelectedFav(null);
    setFullMenuItem(null);
  };

  const getModifierTotal = () => {
    if (!fullMenuItem?.modifiers) return 0;
    let total = 0;
    fullMenuItem.modifiers.forEach((group: any) => {
      (selectedModifiers[group.id] || []).forEach((optId: number) => {
        const opt = group.options.find((o: any) => o.id === optId);
        if (opt) total += Number(opt.price);
      });
    });
    return total;
  };

  // Dynamic data with static fallbacks
  const [livePopular, setLivePopular] = useState<any[] | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[] | null>(null);

  useEffect(() => {
    // Fetch menu items from menu management
    fetch(`${API}/menu/items`)
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        const activeItems = items.filter((i: any) => !i.isDeleted);
        setAllMenuItems(activeItems);
        const available = activeItems
          .filter((i: any) => i.isAvailable)
          .map((i: any) => ({
            id: i.id,
            name: i.name,
            img: i.image || '',
            price: `$${Number(i.pickupPrice).toFixed(2)}`,
            tag: i.isPopular ? 'Popular' : '',
            desc: i.description || '',
          }));
        if (available.length > 0) setLivePopular(available);
      })
      .catch(() => {});

    // Fetch published reviews
    fetch(`${API}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(raw => {
        const reviews = Array.isArray(raw) ? raw : (raw.data || []);
        const published = reviews
          .filter((r: any) => r.status === 'Published')
          .map((r: any) => ({
            name: r.customer,
            stars: r.rating,
            text: r.body || r.title,
            date: new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          }));
        if (published.length > 0) setLiveReviews(published);
      })
      .catch(() => {});
  }, []);

  const displayFavorites = livePopular || [];
  const allReviews = liveReviews || REVIEWS;

  // Reviews carousel + star filter
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const scrollReviews = (dir: 'left' | 'right') => {
    reviewScrollRef.current?.scrollBy({ left: dir === 'right' ? 380 : -380, behavior: 'smooth' });
  };
  const displayReviews = starFilter ? allReviews.filter(r => r.stars === starFilter) : allReviews;

  const heroReveal      = useReveal();
  const featuredReveal  = useReveal();
  const menuReveal      = useReveal();
  const reviewsReveal   = useReveal();
  const rewardsReveal   = useReveal();
  const faqReveal       = useReveal();
  const locationReveal  = useReveal();

  const toggleFaq = useCallback((i: number) => setOpenFaq(prev => prev === i ? null : i), []);

  return (
    <main id="main-content" className="homepage-main" style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '16px', fontWeight: 500 }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Accessibility ── */
        .skip-link {
          position: absolute; top: -100px; left: 16px; z-index: 9999;
          background: #E3BF22; color: #000; padding: 12px 24px;
          border-radius: 0 0 8px 8px; font-weight: 700; font-size: 14px;
          text-decoration: none; transition: top 0.2s;
        }
        .skip-link:focus { top: 0; }
        :focus-visible { outline: 2px solid #E3BF22; outline-offset: 3px; }
        button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }

        /* ── Layout ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .bebas { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; letter-spacing: -0.3px; line-height: 1.2; }

        /* ── Scroll Reveal ── */
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }

        /* ── Buttons ── */
        .btn-yellow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #E3BF22; color: #000;
          border-radius: 10px; font-size: 16px; font-weight: 500;
          text-decoration: none; border: 2px solid transparent; cursor: pointer;
          transition: all 0.3s ease; font-family: inherit;
        }
        .btn-yellow:hover { background: #E3BF22; color: #000; border-color: transparent; transform: none; box-shadow: none; }
        .btn-yellow:active { transform: translateY(0); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: transparent; color: #4D4D4D;
          border-radius: 10px; font-size: 16px; font-weight: 700;
          text-decoration: none; border: 1.5px solid #4D4D4D;
          transition: border-color 0.15s, color 0.15s, background 0.15s; font-family: inherit; cursor: pointer;
        }
        .btn-outline:hover { background: #F0F0F0; border-color: #4D4D4D; color: #4D4D4D; }
        .btn-outline:active { background: #f4f4f410; }

        /* ── Section Label — consistent across all sections ── */
        .sec-label {
          font-size: 12px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #888888; margin-bottom: 10px; display: block;
        }

        /* ── Section Heading — consistent across all sections ── */
        .sec-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: -0.5px;
          line-height: 1.2;
          color: #1A1A1A;
        }

        /* ── Hero ── */
        .hero-section {
          min-height: 100vh; display: flex; align-items: flex-end; justify-content: flex-start;
          text-align: left; position: relative; overflow: hidden;
          padding-bottom: 40px;
          background-image: url('/main-menu/Hero-Banner.webp');
          background-size: cover; background-position: center; background-repeat: no-repeat;
        }
        .hero-tagline {
          font-size: 28px; font-weight: 700; color: #ffffff;
          letter-spacing: -0.3px; line-height: 1.2;
          font-family: var(--font-body);
          text-shadow: 0 2px 16px rgba(0,0,0,0.55);
          margin-bottom: 18px;
        }
        .hero-title {
          font-family: var(--font-heading);
          font-size: 52px; font-weight: 700; line-height: 1.05;
          color: #ffffff; letter-spacing: -1px;
          // text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4);
          margin-bottom: 36px;
        }
        .hero-pickup-btn, .hero-menu-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 28px; background: #E3BF22; color: #0D0D0D;
          border: 2px solid #E3BF22;
          border-radius: 10px; font-size: 17px; font-weight: 700;
          transition: all 0.25s ease; font-family: var(--font-body); cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .hero-pickup-btn:hover, .hero-menu-btn:hover {
          background: #C9A81D; border-color: #C9A81D; transform: translateY(-1px);
        }
        .hero-stat-value { text-shadow: 0 1px 10px rgba(0,0,0,0.5); }
        .hero-stat-label { text-shadow: 0 1px 6px rgba(0,0,0,0.4); }
        .hero-cta { display: flex; gap: 14px; justify-content: flex-start; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 40px; justify-content: center; flex-wrap: wrap; }

        /* ── Favorites Carousel ── */
        .fav-carousel-wrap { position: relative; }
        .fav-grid {
          display: flex; gap: 20px; overflow-x: auto; scroll-behavior: smooth;
          scrollbar-width: none; -ms-overflow-style: none; padding: 4px 0;
        }
        .fav-grid::-webkit-scrollbar { display: none; }
        .fav-card {
          background: #FFFFFF; display: flex; flex-direction: column; align-items: center;
          text-align: center; border-radius: 16px; padding: 0 0 16px; overflow: hidden;
          transition: background 0.18s, transform 0.25s, box-shadow 0.25s;
          cursor: pointer; text-decoration: none; border: 1px solid #E5E5E5;
          min-width: calc(25% - 15px); max-width: calc(25% - 15px); flex-shrink: 0;
        }
        .fav-card:hover { background: #F8F8F8; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); border-color: #E3BF2230; }
        .fav-img-wrap { height: 180px; width: 100%; overflow: hidden; position: relative; margin-bottom: 14px; flex-shrink: 0; }
        .fav-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .fav-card:hover .fav-img-wrap img { transform: scale(1.06); }
        .fav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.95); border: 1px solid #E5E5E5;
          color: #B8A000; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .fav-arrow:hover { background: #FFFFFF; border-color: #E3BF22; }
        .fav-arrow-left { left: -22px; }
        .fav-arrow-right { right: -22px; }

        /* ── Add-to-cart Modal (Home Page) ── */
        .home-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 500;
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .home-modal-box {
          background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 24px;
          max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto;
        }
        .home-modal-box::-webkit-scrollbar { width: 4px; }
        .home-modal-box::-webkit-scrollbar-thumb { background: #D0D0D0; border-radius: 4px; }
        .home-modal-img-wrap { position: relative; height: 260px; overflow: hidden; border-radius: 24px 24px 0 0; }
        .home-modal-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .home-modal-close {
          position: absolute; top: 12px; right: 12px; width: 40px; height: 40px;
          border-radius: 50%; background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .home-modal-close:hover { background: rgba(0,0,0,0.95); }
        .home-modal-body { padding: 24px; }
        .home-modal-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 28px; letter-spacing: -0.5px; color: #4D4D4D; margin-bottom: 8px; }
        .home-modal-desc { font-size: 16px; color: #666; line-height: 1.7; margin-bottom: 20px; }
        .home-modal-price-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .home-modal-price-card {
          flex: 1; padding: 12px; border-radius: 10px; cursor: pointer; text-align: center;
          border: 1px solid #D0D0D0; background: #F8F9FA; transition: all 0.15s;
        }
        .home-modal-price-card.active { border-color: #E3BF22; background: #E3BF2210; }
        .home-modal-modifier-group { margin-bottom: 16px; }
        .home-modal-modifier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .home-modal-modifier-name { font-size: 13px; font-weight: 700; color: #4D4D4D; text-transform: uppercase; letter-spacing: 0.5px; }
        .home-modal-modifier-badge { font-size: 12px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
        .home-modal-modifier-opt {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; border-radius: 10px; cursor: pointer;
          border: 1px solid #E5E5E5; margin-bottom: 6px; transition: all 0.12s;
        }
        .home-modal-modifier-opt.selected { border-color: #E3BF22; background: #E3BF2210; }
        .home-modal-modifier-opt:hover { border-color: #D0D0D0; }
        .home-modal-add-row {
          display: flex; align-items: center; gap: 12px; margin-top: 20px;
          padding-top: 16px; border-top: 1px solid #E0E0E0;
        }
        .home-modal-qty-wrap {
          display: flex; align-items: center; gap: 0; border: 1px solid #D0D0D0;
          border-radius: 10px; overflow: hidden;
        }
        .home-modal-qty-btn {
          width: 40px; height: 40px; background: #F5F5F5; border: none;
          color: #4D4D4D; font-size: 18px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
        }
        .home-modal-qty-btn:hover { background: #E5E5E5; }
        .home-modal-qty-val { width: 44px; text-align: center; font-size: 15px; font-weight: 700; color: #4D4D4D; background: #F5F5F5; }
        .home-modal-add-btn {
          flex: 1; padding: 14px; border-radius: 10px; border: 2px solid transparent;
          font-size: 16px; font-weight: 700; cursor: pointer;
          transition: all 0.3s ease;
        }
        .home-modal-add-btn.enabled { background: #E3BF22; color: #000; }
        .home-modal-add-btn.enabled:hover { background: #E3BF22; color: #000; }
        .home-modal-add-btn.disabled { background: #F0F0F0; color: #AAAAAA; cursor: not-allowed; }

        /* ── Menu Tiles ── */
        .menu-tiles { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 44px; }
        .menu-tile {
          border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden;
          text-decoration: none; display: flex; flex-direction: column;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s; background: #FFFFFF;
        }
        .menu-tile:hover { border-color: #E3BF2260; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
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
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: -0.5px; line-height: 1.2;
          color: #1A1A1A; margin-bottom: 20px;
        }
        .about-content p { color: #4D4D4D; line-height: 1.75; font-size: 16px; max-width: 520px; }

        /* ── Order Ahead CTA (Section 5) ── */
        .order-ahead-hero {
          position: relative; overflow: hidden;
          border-radius: 24px; margin: 60px auto;
          max-width: 100%; 
          max-height: 100vh !important;
          min-height: 100vh !important;
          background-image: url('/main-menu/Main-Page/order-ahead.webp');
          background-size: cover; background-position: center;
          display: flex; align-items: center; justify-content: flex-end;
        }
        .order-ahead-overlay {
          position: absolute; inset: 0;
          // background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.88) 45%);
        }
        .order-card-box {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.95); padding: 44px 48px;
          border-radius: 20px; max-width: 440px;
          margin: 40px auto 40px 48px;
          border: 1px solid #E0E0E0;
          backdrop-filter: blur(16px);
        }
        .order-card-box h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: -0.5px; line-height: 1.2;
          color: #1A1A1A; margin-bottom: 14px;
        }
        .order-card-box p { color: #4D4D4D; font-size: 16px; line-height: 1.75; margin-bottom: 24px; }
        .order-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #E3BF22; color: #000;
          padding: 13px 26px; border-radius: 10px; font-weight: 500;
          font-size: 16px; text-decoration: none; font-family: inherit;
          transition: all 0.3s ease; border: 2px solid transparent;
        }
        .order-btn:hover { background: #E3BF22; color: #000; border-color: transparent; transform: none; box-shadow: none; }

        /* ── Delivery CTA Section (Section 12) ── */
        .delivery-hero {
          position: relative; overflow: hidden;
          background-image: url('/main-menu/Main-Page/catering-home.webp');
          background-size: cover; background-position: center;
          min-height:100vh !important;
          display: flex; align-items: center; justify-content: center;
        }
        .delivery-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.10);
        }
        .delivery-content {
          position: relative; z-index: 1;
          text-align: center; color: #fff;
          max-width: 100%; padding: 72px 24px;
        }
        .delivery-small-text {
          font-size: 12px; font-weight: 700;
          letter-spacing: 3.5px; text-transform: uppercase;
          color: #888888; margin-bottom: 14px; display: block;
        }
        .delivery-content h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: -0.5px; line-height: 1.2;
          color: #ffffff; margin-bottom: 16px;
        }
        .delivery-content h2 span { color: #ffffff; }
        .delivery-content p {
          font-size: 16px; color: #ffffff;
          line-height: 1.75; margin-bottom: 36px;
           margin-left: auto; margin-right: auto;
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

        /* ── Reviews Carousel ── */
        .reviews-carousel-wrap { position: relative; }
        .reviews-grid {
          display: flex; gap: 16px; overflow-x: auto; scroll-behavior: smooth;
          scrollbar-width: none; -ms-overflow-style: none; padding: 4px 0;
        }
        .reviews-grid::-webkit-scrollbar { display: none; }
        .review-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-left: 3px solid #E3BF22;
          border-radius: 18px; padding: 28px;
          transition: transform 0.25s, box-shadow 0.25s;
          min-width: calc(33.33% - 11px); max-width: calc(33.33% - 11px); flex-shrink: 0;
        }
        .review-card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.06); }
        .review-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.95); border: 1px solid #E5E5E5;
          color: #B8A000; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .review-arrow:hover { background: #FFFFFF; border-color: #E3BF22; }
        .review-arrow-left { left: -22px; }
        .review-arrow-right { right: -22px; }
        .star-filter-wrap {
          display: flex; justify-content: center; gap: 8px; margin-top: 20px; flex-wrap: wrap;
        }
        .star-filter-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 20px;
          border: 1px solid #D0D0D0; background: transparent;
          color: #888; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .star-filter-btn:hover { border-color: #4D4D4D60; color: #4D4D4D; }
        .star-filter-btn.active { border-color: #4D4D4D; background: #4D4D4D15; color: #4D4D4D; }

        /* ── Rewards ── */
        .rewards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .rewards-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .reward-step {
          background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px;
          padding: 26px 20px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.25s;
        }
        .reward-step:hover { transform: translateY(-3px); }

        /* ── FAQ ── */
        .faq-item { border-bottom: 1px solid #E5E5E5; }
        .faq-q {
          width: 100%; background: none; border: none; color: #4D4D4D;
          font-size: 16px; font-weight: 600; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 0; gap: 16px; text-align: left;
          font-family: inherit; transition: color 0.15s;
        }
        .faq-q:hover { color: #555555; }
        .faq-answer-wrap {
          background: #F8F9FA; border-radius: 0 0 12px 12px; overflow: hidden;
          display: grid; grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .faq-answer-wrap[data-open="true"] { grid-template-rows: 1fr; }
        .faq-answer-inner { overflow: hidden; }
        .faq-a { font-size: 16px; color: #444444; line-height: 1.8; padding: 16px 20px; max-width: 760px; }

        /* ── Location ── */
        .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 22px; overflow: hidden; border: 1px solid #E0E0E0; }

        /* ── Footer ── */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .footer-bottom { border-top: 1px solid #E5E5E5; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-link { display: block; font-size: 16px; color: #4D4D4D;  padding: 4px 0px; text-decoration: none; transition: color 0.15s, padding-left 0.15s; }
        .footer-link:hover { color: #4D4D4D; text-decoration: underline; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
          .hero-section { min-height: 60vh; padding-bottom: 48px; padding-top: 90px; }
          
          .fav-card { min-width: calc(33.33% - 14px); max-width: calc(33.33% - 14px); }
          .review-card { min-width: calc(50% - 8px); max-width: calc(50% - 8px); }
          .rewards-grid { grid-template-columns: 1fr; gap: 40px; }
          .location-grid { grid-template-columns: 1fr; }
          .menu-tiles { grid-template-columns: repeat(2,1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
          .order-card-box { margin: 40px auto 40px 32px; }
        }
        @media (max-width: 900px) {
          .photo-gallery { grid-template-columns: repeat(2,1fr); }
          .about-grid { grid-template-columns: 1fr; }
          .about-img { height: 340px; }
          .order-ahead-hero { justify-content: center; }
          .order-ahead-overlay { background: rgba(0,0,0,0.55); }
          .order-card-box { margin: 40px auto; max-width: 92%; }
        }
        @media (max-width: 1024px) {
          .hero-title { font-size: 52px; }
          .hero-tagline { font-size: 22px; }
        }
        @media (max-width: 768px) {
          .hero-section { min-height: 70vh; padding: 80px 0 56px; }
          .hero-title { font-size: 40px; margin-bottom: 24px; }
          .hero-tagline { font-size: 18px; margin-bottom: 14px; }
          .hero-pickup-btn, .hero-menu-btn { padding: 7px 12px 22px; font-size: 15px; }
          .hero-stats { margin-top: 24px; gap: 20px; }
          .hero-stat-value { font-size: clamp(22px, 5vw, 30px) !important; }
          .fav-card { min-width: calc(50% - 10px); max-width: calc(50% - 10px); }
          .review-card { min-width: 85%; max-width: 85%; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .footer-brand { grid-column: unset; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .rewards-steps { grid-template-columns: 1fr; }
          .order-card-box { margin: 24px; max-width: 100%; padding: 32px 28px; }
        }
        @media (max-width: 500px) {
          .hero-section { min-height: 62vh; padding-bottom: 40px; padding-top: 72px; }
          .hero-title { font-size: 32px; margin-bottom: 20px; }
          .hero-tagline { font-size: 15px; margin-bottom: 12px; }
          .hero-cta { gap: 10px; }
          .hero-pickup-btn, .hero-menu-btn { padding: 7px 18px; font-size: 14px; }
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
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(43, 43, 43, 0.35) 20%, rgba(151, 151, 151, 0.05) 100%)', zIndex: 0 }} />

        <div className="container hero-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div
            id="hero-content"
            className={`hero-inner reveal ${heroReveal.visible ? 'visible' : ''}`}
            ref={heroReveal.ref}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            {/* Store status badge */}
            {/* <div
              id="hero-store-status"
              className="hero-status-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: isOpen ? '#22C55E15' : '#fdfdfd15',
                border: `2px solid ${isOpen ? '#22C55E30' : '#FC0301'}`,
                borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
              }}
            > */}
              {/* <span className="hero-status-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
              <span className="hero-status-text" style={{ fontSize: '16px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>
                {isOpen ? statusMessage : 'Closed'}
              </span>
            </div> */}

            <p id="hero-tagline" className="hero-tagline">
              Best Breakfast in University City, Philadelphia, PA
            </p>

            <h1 id="hero-title" className="hero-title">
             Welcome to Eggs Ok West Philadelphia
            </h1>

            <div id="hero-cta-buttons" className="hero-cta">
              <Link href="/order?type=pickup" className="hero-pickup-btn">
                Order pickup
              </Link>
              <Link href="/order?type=delivery" className="hero-menu-btn">
                Order delivery
              </Link>
            </div>

            {/* <div id="hero-stats-bar" className="hero-stats">
              {[{ v: '80+', l: 'Menu Items' }, { v: '15 min', l: 'Ready Time' }, { v: '5★', l: 'Rated' }].map((s, i) => (
                <div key={i} className={`hero-stat hero-stat-${i + 1}`}>
                  <p className="hero-stat-value bebas" style={{ fontSize: '24px', color: '#4D4D4D' }}>{s.v}</p>
                  <p className="hero-stat-label" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{s.l}</p>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURED FAVORITES
      ══════════════════════════════════════════ */}
      <section id="featured" className="section-featured" style={{ background: '#F8F9FA', padding: '80px 0' }} aria-labelledby="featured-heading">
        <div className="container featured-container" ref={featuredReveal.ref}>
          <div className={`featured-header reveal ${featuredReveal.visible ? 'visible' : ''}`} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '52px', flexWrap: 'wrap', gap: '20px' }}>
            <div className="featured-header-text">
              {/* <span className="sec-label">Featured</span> */}
              <h2 id="featured-heading" className="sec-heading">Featured</h2>
            </div>
            <Link href="/order" className="btn-outline featured-view-all-btn">View Full Menu <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="fav-carousel-wrap">
            <button className="fav-arrow fav-arrow-left" onClick={() => scrollFavorites('left')} aria-label="Scroll left">
              <ChevronLeft size={22} />
            </button>
            <div id="favorites-grid" className="fav-grid" ref={favScrollRef} role="list" aria-label="Featured menu items">
              {displayFavorites.map((item, i) => (
                <div
                  key={`fav-${item.id}-${i}`}
                  id={`fav-card-${item.id}`}
                  className={`fav-card reveal ${featuredReveal.visible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.08 * i}s` }}
                  role="listitem" aria-label={`${item.name} — ${item.price}`}
                  onClick={() => openFavModal(item)}
                >
                  <div className="fav-img-wrap">
                    {item.img
                      ? <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F5F5E8, #F8F9FA)' }}>
                          <svg width="40" height="40" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
                        </div>
                    }
                    {item.tag && <div className="fav-tag-badge" style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E3BF2240', borderRadius: '20px', padding: '4px 12px' }}>
                      <span className="fav-tag-text" style={{ fontSize: '12px', fontWeight: '700', color: '#4D4D4D', letterSpacing: '0.5px' }}>{item.tag}</span>
                    </div>}
                    <div className="fav-add-btn" style={{ position: 'absolute', bottom: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} aria-hidden="true">
                      <Plus size={15} color="#000" strokeWidth={2.8} />
                    </div>
                  </div>
                  <div className="fav-card-body" style={{ padding: '0 14px 4px', width: '100%' }}>
                    <p className="fav-card-name" style={{ fontSize: '14px', fontWeight: '500', color: '#4D4D4D', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                    {/* <p className="fav-card-desc" style={{ fontSize: '14px', color: '#888888', lineHeight: 1.4, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{item.desc}</p> */}
                    <p className="fav-card-price" style={{ fontSize: '16px', fontWeight: '900', color: '#4D4D4D' }}>{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="fav-arrow fav-arrow-right" onClick={() => scrollFavorites('right')} aria-label="Scroll right">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. OUR STORY
      ══════════════════════════════════════════ */}
      <section id="our-story" className="section-story" style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="container story-container">
          <div className="about-grid story-grid">
            <div className="about-img story-img">
              <Image src="/main-menu/Main-Page/Born-in-the-Heart-of-West-Philly.webp" alt="Inside Eggs Ok" width={600} height={460}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content story-content">
            
              <h2 id="story-heading" className="story-heading">Born in the Heart of West Philly</h2>

              <p className="story-body">
                Eggs Ok started with a simple idea  great breakfast should be fast, fresh, and made with
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
      <section id="quality" className="section-quality" style={{ background: '#F8F9FA', padding: '80px 0' }}>
        <div className="container quality-container">
          <div className="about-grid quality-grid">
            <div className="about-content quality-content">
            
              <h2 id="quality-heading" className="quality-heading">Fresh Ingredients, Bold Flavors</h2>
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
          <h2 id="order-ahead-heading" className="order-ahead-heading">Order Ahead, Enjoy Anytime</h2>
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
      <section id="menu" className="section-menu" style={{ background: '#F8F9FA', padding: '80px 0' }} aria-labelledby="menu-heading">
        <div className="container menu-container" ref={menuReveal.ref}>
          <div className={`menu-header reveal ${menuReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'left', marginBottom: '52px' }}>
        
            <h2 id="menu-heading" className="sec-heading">
             A Taste of Our Menu
            </h2>
            <p className="menu-subheading" style={{ color: '#4D4D4D', marginTop: '14px', fontSize: '16px' }}>
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
                  <p className="menu-tile-label" style={{ fontSize: '16px', fontWeight: '700', color: '#4D4D4D', marginBottom: '4px' }}>{tile.label}</p>
                  <p className="menu-tile-count" style={{ fontSize: '12px', color: '#4D4D4D', fontWeight: '600' }}>{tile.items}</p>
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
      <section id="catering" className="section-catering" style={{ background: '#FFFFFF', padding: '80px 0' }} aria-labelledby="catering-heading">
        <div className="container catering-container">
          <div className="about-grid catering-grid">
            <div className="about-img catering-img">
              <Image src="/main-menu/Main-Page/catering-home.webp" alt="Eggs Ok catering spread" width={600} height={460}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            </div>
            <div className="about-content catering-content">
             
              <h2 id="catering-heading" className="catering-heading">Let Us Cater Your Next Event</h2>
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
      <section id="reviews" className="section-reviews" style={{ background: '#F8F9FA', padding: '80px 0' }} aria-labelledby="reviews-heading">
        <div className="container reviews-container" ref={reviewsReveal.ref}>
          <div className={`reviews-header reveal ${reviewsReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '40px' }}>
            
            <h2 id="reviews-heading" className="sec-heading">
              What Our Guests Are Saying
            </h2>
            <div id="reviews-rating-bar" className="reviews-rating-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '14px' }}>
              {[0,1,2,3,4].map(i => <Star key={i} size={19} color="#E3BF22" fill="#E3BF22" aria-hidden="true" />)}
              <span className="reviews-rating-text" style={{ fontSize: '16px', color: '#4D4D4D', marginLeft: '8px' }}>
                {allReviews.length > 0
                  ? `${(allReviews.reduce((a, r) => a + r.stars, 0) / allReviews.length).toFixed(1)} average from ${allReviews.length} reviews`
                  : '5.0 average'}
              </span>
            </div>

            {/* Star Filters */}
            <div className="star-filter-wrap">
              <button className={`star-filter-btn ${starFilter === null ? 'active' : ''}`} onClick={() => setStarFilter(null)}>
                All
              </button>
              {[5, 4, 3, 2, 1].map(s => (
                <button key={s} className={`star-filter-btn ${starFilter === s ? 'active' : ''}`} onClick={() => setStarFilter(starFilter === s ? null : s)}>
                  {s} <Star size={12} color="#E3BF22" fill="#E3BF22" />
                </button>
              ))}
            </div>
          </div>

          <div className="reviews-carousel-wrap">
            <button className="review-arrow review-arrow-left" onClick={() => scrollReviews('left')} aria-label="Scroll reviews left">
              <ChevronLeft size={22} />
            </button>
            <div id="reviews-grid" className="reviews-grid" ref={reviewScrollRef} role="list" aria-label="Customer reviews">
              {displayReviews.length === 0 ? (
                <div style={{ minWidth: '100%', textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '16px', color: '#AAAAAA' }}>No {starFilter}-star reviews yet</p>
                </div>
              ) : displayReviews.map((r, i) => (
                <article
                  key={i}
                  id={`review-card-${i}`}
                  className={`review-card reveal ${reviewsReveal.visible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.1 * i}s` }}
                  role="listitem"
                >
                  <div className="review-stars" style={{ display: 'flex', gap: '3px', marginBottom: '18px' }} aria-label={`${r.stars} out of 5 stars`}>
                    {[0,1,2,3,4].map(s => <Star key={s} size={13} color={s < r.stars ? '#E3BF22' : '#D0D0D0'} fill={s < r.stars ? '#E3BF22' : 'none'} aria-hidden="true" />)}
                  </div>
                  <blockquote className="review-quote" style={{ fontSize: '16px', color: '#4D4D4D', lineHeight: 1.75, marginBottom: '24px', fontStyle: 'italic' }}>
                    &ldquo;{r.text}&rdquo;
                  </blockquote>
                  <div className="review-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="review-author" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="review-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F0F0F0', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                        <span className="review-avatar-initial" style={{ fontSize: '14px', fontWeight: '700', color: '#4D4D4D' }}>{r.name[0]}</span>
                      </div>
                      <cite className="review-name" style={{ fontSize: '16px', fontWeight: '600', color: '#4D4D4D', fontStyle: 'normal' }}>{r.name}</cite>
                    </div>
                    <time className="review-date" style={{ fontSize: '12px', color: '#4D4D4D' }}>{r.date}</time>
                  </div>
                </article>
              ))}
            </div>
            <button className="review-arrow review-arrow-right" onClick={() => scrollReviews('right')} aria-label="Scroll reviews right">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. REWARDS
      ══════════════════════════════════════════ */}
      <section id="rewards" className="section-rewards" style={{ background: '#FFFFFF', padding: '80px 0' }} aria-labelledby="rewards-heading">
      
      <div id="order-ahead" className="order-ahead-hero container">
        <div className="order-ahead-overlay" />
        <div className="order-card-box">
          <h2 id="order-ahead-heading" className="order-ahead-heading">Eggs Ok Rewards</h2>
          <p className="order-ahead-body">
             Every order earns you points. Redeem for free food, exclusive deals, and early access
                to new menu items. The more you eat, the more you earn.
          </p>
         <Link href="/account" className="btn-yellow rewards-join-btn">
                <Gift size={16} aria-hidden="true" /> Join Rewards — It&apos;s Free
              </Link>
        </div>
      </div>
           
          
      </section>

      {/* ══════════════════════════════════════════
          10. FAQ
      ══════════════════════════════════════════ */}
      <section id="faq" className="section-faq" style={{ background: '#F8F9FA', padding: '80px 0' }} aria-labelledby="faq-heading">
        <div className="container faq-container" ref={faqReveal.ref}>
          <div className={`faq-header reveal ${faqReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '60px' }}>
       
            <h2 id="faq-heading" className="sec-heading">
              Frequently Asked Questions
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
                    color={openFaq === i ? '#555555' : '#777777'}
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
            <p className="faq-contact-text" style={{ fontSize: '16px', color: '#4D4D4D', marginBottom: '16px' }}>Still have questions?</p>
            <Link href="/contact" className="btn-outline faq-contact-btn">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. OUR LOCATION
      ══════════════════════════════════════════ */}
      <section id="location" className="section-location" style={{ background: '#FFFFFF', padding: '80px 0' }} aria-labelledby="location-heading">
        <div className="container location-container" ref={locationReveal.ref}>
          <div className={`location-header reveal ${locationReveal.visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '56px' }}>
            
            <h2 id="location-heading" className="sec-heading">
              Our Location
            </h2>
          </div>

          <div id="location-grid" className={`location-grid reveal ${locationReveal.visible ? 'visible' : ''} reveal-d1`}>
            {/* Info panel */}
            <div id="location-info" className="location-info-panel" style={{ background: '#F8F9FA', padding: 'clamp(32px, 5vw, 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '36px' }}>
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

                <h3 id="location-name" className="location-name bebas" style={{ fontSize: '28px', fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', marginBottom: '28px' }}>
                  Eggs Ok<br />West Philadelphia
                </h3>

                <address id="location-address" className="location-address" style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="location-address-row" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#000000ff" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div className="location-address-text">
                      <p className="location-street" style={{ fontSize: '16px', color: '#4D4D4D', fontWeight: '600' }}>3517 Lancaster Ave</p>
                      <p className="location-city" style={{ fontSize: '16px', color: '#888888' }}>Philadelphia, PA 19104</p>
                    </div>
                  </div>
                  <div className="location-hours-row" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <Clock size={16} color="#000000ff" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                    <div id="location-hours-list" className="location-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {HOURS.map((row, i) => (
                        <div key={i} className={`location-hours-row-item location-hours-${row.d.toLowerCase()}`} style={{ display: 'flex', gap: '14px' }}>
                          <span className="location-hours-day" style={{ fontSize: '16px', color: '#4D4D4D', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                          <span className="location-hours-time" style={{ fontSize: '16px', color: '#4D4D4D' }}>{row.h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="location-phone-row" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Smartphone size={16} color="#000000ff" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <a href="tel:2159489902" className="location-phone" style={{ fontSize: '16px', color: '#4D4D4D', textDecoration: 'none', fontWeight: '600' }}>215-948-9902</a>
                  </div>
                </address>
              </div>

              <div id="location-cta-buttons" className="location-cta-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener noreferrer" className="btn-yellow location-directions-btn" style={{ fontSize: '16px', padding: '12px 22px' }}>
                  <MapPin size={14} aria-hidden="true" /> Get Directions
                </a>
                <Link href="/order" className="btn-outline location-order-btn" style={{ fontSize: '16px', padding: '12px 22px' }}>Order Now</Link>
              </div>
            </div>

            {/* Map */}
            <div id="location-map" className="location-map-panel" style={{ background: '#F8F9FA', minHeight: '460px', position: 'relative', overflow: 'hidden' }}>
              <iframe
                id="location-map-iframe"
                title="Eggs Ok location on Google Maps  3517 Lancaster Ave, Philadelphia PA 19104"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.7!2d-75.2!3d39.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c65b7a6a5555%3A0x0!2s3517+Lancaster+Ave%2C+Philadelphia%2C+PA+19104!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="100%"
                style={{ border: 0, minHeight: '460px', display: 'block' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              <div id="location-map-pin" className="location-map-pin" style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', padding: '10px 16px', border: '1px solid #E3BF2240', pointerEvents: 'none' }} aria-hidden="true">
                <p className="location-map-pin-name bebas" style={{ fontSize: '14px', color: '#4D4D4D', letterSpacing: '-0.5px' }}>Eggs Ok</p>
                <p className="location-map-pin-address" style={{ fontSize: '12px', color: '#888888' }}>3517 Lancaster Ave</p>
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
        
          <h2 id="delivery-heading" className="delivery-heading">
            Get It Delivered 
            Straight to Your Door
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
      <footer id="footer" className="site-footer" style={{ background: '#F8F9FA', padding: '68px 0 32px', borderTop: '1px solid #E5E5E5' }}>
        <div className="container footer-container">
          <div className="footer-grid">
            <div id="footer-brand" className="footer-brand">
              <div className="footer-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div className="footer-logo-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/logo.webp" alt="Eggs Ok" width={100} height={70} style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <p className="footer-brand-tagline" style={{ fontSize: '16px', color: '#4D4D4D', lineHeight: 1.75, maxWidth: '280px', marginBottom: '22px' }}>
                Fresh breakfast and lunch in West Philadelphia. Made to order, every time.
              </p>
              <address id="footer-address" className="footer-address" style={{ fontStyle: 'normal' }}>
                <p className="footer-address-line" style={{ fontSize: '16px', color: '#4D4D4D', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <MapPin size={13} color="#000000ff"  aria-hidden="true" href='https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104'/> <a href='https://www.google.com/maps?q=3517+Lancaster+Ave,+Philadelphia+PA+19104' className="footer-address-link">3517 Lancaster Ave, Philadelphia PA 19104</a>
                </p>
                <p className="footer-phone-line" style={{ fontSize: '16px', color: '#4D4D4D', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Smartphone size={13} color="#000000ff" aria-hidden="true" />
                  <a href="tel:2159489902" className="footer-phone-link" style={{ color: '#4D4D4D', textDecoration: 'none' }}>215-948-9902</a>
                </p>
              </address>
            </div>

            <nav id="footer-nav" className="footer-nav" aria-label="Quick links">
              <p className="footer-nav-heading" style={{ fontSize: '18px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: '700', color: '#1A1A1A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Links</p>
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
              <p className="footer-hours-heading" style={{ fontSize: '18px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: '700', color: '#1A1A1A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Hours</p>
              <div id="footer-hours-list" className="footer-hours-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {HOURS.map((row, i) => (
                  <div key={i} className={`footer-hours-row footer-hours-${row.d.toLowerCase()}`} style={{ display: 'flex', gap: '14px' }}>
                    <span className="footer-hours-day" style={{ fontSize: '16px', color: '#4D4D4D', fontWeight: '600', minWidth: '96px' }}>{row.d}</span>
                    <span className="footer-hours-time" style={{ fontSize: '16px', color: '#666666' }}>{row.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="footer-bottom" className="footer-bottom">
            <p id="footer-copyright" className="footer-copyright" style={{ fontSize: '16px', color: '#888888' }}>&copy; {new Date().getFullYear()} Eggs Ok. All rights reserved.</p>
            {/* <p id="footer-credit" className="footer-credit" style={{ fontSize: '13px', color: '#ffffff' }}>Built by <span className="footer-credit-brand" style={{ color: '#E3BF22' }}>RestoRise Business Solutions</span></p> */}
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          ADD-TO-CART MODAL (from favorites)
      ══════════════════════════════════════════ */}
      {selectedFav && (
        <div className="home-modal-backdrop" onClick={() => { setSelectedFav(null); setFullMenuItem(null); }}>
          <div className="home-modal-box" onClick={e => e.stopPropagation()}>
            <div className="home-modal-img-wrap">
              {selectedFav.img
                ? <img src={selectedFav.img} alt={selectedFav.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F5F5E8, #F8F9FA)' }}>
                    <svg width="48" height="48" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
                  </div>
              }
              <button className="home-modal-close" onClick={() => { setSelectedFav(null); setFullMenuItem(null); }}>
                <X size={16} />
              </button>
            </div>
            <div className="home-modal-body">
              <h2 className="home-modal-name">{selectedFav.name}</h2>
              <p className="home-modal-desc">{selectedFav.desc}</p>

              {fullMenuItem ? (
                <>
                  {/* Price cards */}
                  <div className="home-modal-price-row">
                    {(['pickup', 'delivery'] as const).filter(type => type === 'pickup' ? isPickupEnabled : isDeliveryEnabled).map(type => (
                      <div key={type} className={`home-modal-price-card ${orderType === type ? 'active' : ''}`} onClick={() => setOrderType(type)}>
                        <p style={{ fontSize: '12px', color: '#777777', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{type}</p>
                        <p style={{ fontSize: '18px', fontWeight: '900', color: '#4D4D4D' }}>
                          ${(Number(type === 'pickup' ? fullMenuItem.pickupPrice : fullMenuItem.deliveryPrice) || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Modifiers */}
                  {fullMenuItem.modifiers?.map((group: any) => (
                    <div key={group.id} className="home-modal-modifier-group">
                      <div className="home-modal-modifier-header">
                        <p className="home-modal-modifier-name">{group.name}</p>
                        <span className="home-modal-modifier-badge" style={{ background: group.required ? '#FC030120' : '#22C55E20', color: group.required ? '#FC0301' : '#22C55E', border: `1px solid ${group.required ? '#FC030140' : '#22C55E40'}` }}>
                          {group.required ? 'Required' : 'Optional'} · {group.maxSelections === 1 ? 'Choose 1' : `Up to ${group.maxSelections}`}
                        </span>
                      </div>
                      {group.options.map((opt: any) => {
                        const isSel = (selectedModifiers[group.id] || []).includes(opt.id);
                        return (
                          <div key={opt.id} className={`home-modal-modifier-opt ${isSel ? 'selected' : ''}`} onClick={() => toggleModifier(group.id, opt.id, group.maxSelections)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: group.maxSelections === 1 ? '50%' : '4px', border: isSel ? '2px solid #E3BF22' : '1px solid #D0D0D0', background: isSel ? '#E3BF22' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isSel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E3BF22" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                              </div>
                              <span style={{ fontSize: '16px', color: '#4D4D4D' }}>{opt.name}</span>
                            </div>
                            <span style={{ fontSize: '13px', color: Number(opt.price) > 0 ? '#4D4D4D' : '#AAAAAA' }}>
                              {Number(opt.price) > 0 ? `+$${Number(opt.price).toFixed(2)}` : 'Free'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Special instructions */}
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#777777', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Special Instructions</p>
                    <textarea
                      placeholder="Add a note (extra sauce, no onions, etc.)"
                      value={favInstructions}
                      onChange={e => setFavInstructions(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', background: '#F8F9FA', border: '1px solid #D0D0D0', borderRadius: '10px', color: '#4D4D4D', fontSize: '13px', resize: 'none', height: '60px', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Add to cart row */}
                  <div className="home-modal-add-row">
                    <div className="home-modal-qty-wrap">
                      <button className="home-modal-qty-btn" onClick={() => setFavQty(q => Math.max(1, q - 1))}>
                        <Minus size={16} />
                      </button>
                      <span className="home-modal-qty-val">{favQty}</span>
                      <button className="home-modal-qty-btn" onClick={() => setFavQty(q => q + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button className={`home-modal-add-btn ${canAddFav() ? 'enabled' : 'disabled'}`} onClick={handleAddFav} disabled={!canAddFav()}>
                      Add to Cart · ${(((Number(orderType === 'pickup' ? fullMenuItem.pickupPrice : fullMenuItem.deliveryPrice) || 0) + getModifierTotal()) * favQty).toFixed(2)}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '13px', color: '#777777' }}>Loading item details...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}