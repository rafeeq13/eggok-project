'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../../hooks/useStoreSettings';


type ModifierOption = { id: number; name: string; price: number };
type ModifierGroup = { id: number; name: string; required: boolean; minSelections: number; maxSelections: number; options: ModifierOption[] };
type MenuItem = { id: number; categoryId: number; name: string; description: string; pickupPrice: any; deliveryPrice: any; image: string; imageUrl: string; isPopular?: boolean; modifiers?: ModifierGroup[] };
type Category = { id: number; name: string; isActive?: boolean };

const API = 'http://localhost:3002/api';

const css = `
  *,*::before,*::after { box-sizing: border-box; }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    border-right: 1px solid #2A2A2A;
    background: #111111;
    padding: 20px 0;
    scrollbar-width: none;
    z-index: 50;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  }
  .sidebar::-webkit-scrollbar { display: none; }

  /* ── Burger btn — hidden on desktop ── */
  .burger {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #1A1A1A;
    border: 1px solid #2A2A2A;
    border-radius: 10px;
    cursor: pointer;
    color: #CCCCCC;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .burger:hover { background: #252525; }

  /* ── Sign-in ── */
  .signin-link {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #2A2A2A;
    border-radius: 8px;
    color: #CCC;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── Main scroll ── */
  .main-scroll {
    flex: 1;
    overflow-y: auto;
    height: calc(100vh - 64px);
    min-width: 0;
    background: #0D0D0D;
  }

  /* ── Menu grid: 2-col ── */
  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    // background: #2A2A2A;
    border-radius: 16px;
    overflow: hidden;
    // border: 1px solid #2A2A2A;
  }

  /* ── Cart panel ── */
  .cart-panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 380px;
    background: #0D0D0D;
    border-left: 1px solid #1A1A1A;
    z-index: 500;
    display: flex;
    flex-direction: column;
    box-shadow: -20px 0 60px rgba(0,0,0,.6);
  }

  /* ── Popular card ── */
  .pop-card { flex-shrink: 0; width: 210px; }

  /* ── Grid card image ── */
  .grid-img { width: 130px; height: 130px; }

  /* ── Order row ── */
  .order-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* ── Overlay ── */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 148;
  }

  /* cat btn hover */
  .cat-btn:hover { background: #1A1A1A !important; }
  .more-link:hover { background: #1A1A1A; }

  /* ── Category section scroll margin ── */
  .cat-section { scroll-margin-top: 24px; }

  /* ══ MOBILE CATEGORY BAR ══ */
  .mobile-cat-bar {
    display: none;
    position: fixed;
    top: 64px; left: 0; right: 0;
    z-index: 98;
    background: rgba(10,10,10,0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid #1E1E1E;
    height: 52px;
    align-items: center;
  }

  .mobile-cat-scroll {
    display: flex;
    align-items: center;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0 10px;
    gap: 6px;
    height: 100%;
    -webkit-overflow-scrolling: touch;
  }
  .mobile-cat-scroll::-webkit-scrollbar { display: none; }

  .mobile-cat-pill {
    flex-shrink: 0;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid #2A2A2A;
    background: #1A1A1A;
    color: #888;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    font-family: inherit;
    line-height: 1;
  }
  .mobile-cat-pill.active {
    background: #FED800;
    color: #000;
    border-color: #FED800;
    margin-left:85px;
  }
  .mobile-cat-pill:not(.active):hover {
    border-color: #3A3A3A;
    color: #CCC;
  }

  .mobile-search-bar {
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 10px;
    width: 100%;
    height: 100%;
  }

  .mobile-search-input-wrap {
    position: relative;
    flex: 1;
  }

  .mobile-search-input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    background: #1A1A1A;
    border: 1px solid #2A2A2A;
    border-radius: 999px;
    color: #FFF;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s;
  }
  .mobile-search-input:focus { border-color: #FED800; }

  .mobile-search-icon-btn {
  position: fixed;
    flex-shrink: 0;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #2A2A2A;
    background: #1A1A1A;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
    line-height: 0;
  }
  .mobile-search-icon-btn:hover {
    background: #252525;
    border-color: #3A3A3A;
  }

  /* ════ TABLET ≤ 1024px ════ */
  @media (max-width: 1024px) {
    .burger { display: flex; }
    .signin-link { display: none; }

    .sidebar {
      position: fixed;
      top: 64px; left: 0;
      height: calc(100vh - 64px);
      transform: translateX(-100%);
      box-shadow: 6px 0 32px rgba(0,0,0,.6);
      z-index: 149;
    }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.visible { display: block; }

    .pop-card { width: 185px; }
    .grid-img { width: 110px; height: 110px; }
  }

  /* ════ MOBILE ≤ 768px ════ */
  @media (max-width: 768px) {
    /* Show mobile category bar, hide burger (pills replace sidebar nav) */
    .mobile-cat-bar { display: flex; }
    .burger { display: none; }

    /* Push main content below the fixed category bar */
    .cat-section { scroll-margin-top: 76px; }
    .main-inner { padding: 70px 14px 100px !important; }

    .sidebar { width: 250px; }
    .menu-grid { grid-template-columns: 1fr; }
    .cart-panel { width: 100%; }
    .pop-card { width: 160px; }
    .grid-img { width: 100px; height: 100px; }
    .order-row { gap: 8px; }
  }

  /* ════ SMALL ≤ 480px ════ */
  @media (max-width: 480px) {
    .sidebar { width: 220px; }
    .pop-card { width: 145px; }
    .grid-img { width: 88px; height: 88px; }
    .main-inner { padding: 66px 10px 100px !important; }
    .schedule-label { display: block; }
    .cat-section { scroll-margin-top: 76px; }
  }
`;


function OrderContent() {

  const {
    cart, orderType, setOrderType, addToCart, removeFromCart, updateQuantity,
    cartCount, cartTotal, getPrice,
    deliveryAddress, setDeliveryAddress,
    deliveryApt, setDeliveryApt,
    deliveryInstructions, setDeliveryInstructions,
    scheduleType, setScheduleType,
    scheduleDate, setScheduleDate,
    scheduleTime, setScheduleTime,
  } = useCart();

  const [mounted, setMounted] = useState(false);

  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMoreDates, setShowMoreDates] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState<1 | 2>(deliveryAddress ? 2 : 1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const { isOpen, statusMessage, isDeliveryEnabled, isPickupEnabled } = useStoreSettings();


  // Mobile-specific state
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const popularScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Mobile category bar refs
  const mobileCatScrollRef = useRef<HTMLDivElement>(null);
  const mobileCatRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [searchParams, menuItems]);

  const fetchData = () => {
    Promise.all([
      fetch(`${API}/menu/categories`).then(r => r.json()),
      fetch(`${API}/menu/items`).then(r => r.json()),
    ]).then(([cats, items]) => {
      const activeCategories = cats.filter((c: any) => c.isActive);
      const availableItems = items.filter((i: any) => i.isAvailable).map((i: any) => ({ ...i, imageUrl: i.image || '' }));
      setCategories([{ id: 0, name: 'Popular' }, ...activeCategories]);
      setMenuItems(availableItems);
      setLoading(false);

      // Handle Deep-Linking
      const pId = searchParams.get('productId');
      if (pId && availableItems.length > 0) {
        const item = availableItems.find((i: MenuItem) => i.id === Number(pId));
        if (item) {
          setTimeout(() => {
            openItem(item);
            const el = document.getElementById(`item-${item.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
        }
      }
    }).catch(() => setLoading(false));
  };



  // Scroll spy — tracks active category from main scroll
  useEffect(() => {
    const el = mainContentRef.current;
    if (!el) return;
    const handler = () => {
      let current = 0;
      for (const cat of [...categories].reverse()) {
        const ref = categoryRefs.current[cat.id];
        if (ref && ref.getBoundingClientRect().top <= 160) { current = cat.id; break; }
      }
      setActiveCategory(current);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [categories]);

  // Auto-scroll mobile category pill bar to keep active pill centred
  useEffect(() => {
    const container = mobileCatScrollRef.current;
    const activeEl = mobileCatRefs.current[activeCategory];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const targetScrollLeft =
      container.scrollLeft + elRect.left - containerRect.left - (containerRect.width - elRect.width) / 2;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [activeCategory]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile search when search is cleared
  useEffect(() => {
    if (!search && showMobileSearch) {
      // keep open so user can type; they close via Cancel
    }
  }, [search]);

  const popularItems = menuItems.filter(i => i.isPopular);
  const getItemsByCategory = (catId: number) => catId === 0 ? popularItems : menuItems.filter(i => i.categoryId === catId);
  const filteredItems = search ? menuItems.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase())) : null;

  const getModifierTotal = () => {
    if (!selectedItem?.modifiers) return 0;
    let total = 0;
    selectedItem.modifiers.forEach(group => {
      (selectedModifiers[group.id] || []).forEach(optId => {
        const opt = group.options.find(o => o.id === optId);
        if (opt) total += opt.price;
      });
    });
    return total;
  };

  const openItem = (item: MenuItem) => { setSelectedItem(item); setSelectedModifiers({}); setQuantity(1); setSpecialInstructions(''); };

  const toggleModifier = (groupId: number, optId: number, maxSelections: number) => {
    setSelectedModifiers(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optId)) return { ...prev, [groupId]: current.filter(id => id !== optId) };
      if (maxSelections === 1) return { ...prev, [groupId]: [optId] };
      if (current.length >= maxSelections) return prev;
      return { ...prev, [groupId]: [...current, optId] };
    });
  };

  const canAddToCart = () => {
    if (!selectedItem?.modifiers) return true;
    return selectedItem.modifiers.filter(g => g.required).every(g => (selectedModifiers[g.id] || []).length >= g.minSelections);
  };

  const handleAddToCart = () => {
    if (!selectedItem || !canAddToCart()) return;
    addToCart(selectedItem, quantity, selectedModifiers, specialInstructions);
    setSelectedItem(null);
    setShowCart(true);
  };

  const scrollToCategory = (catId: number) => {
    setActiveCategory(catId);
    setSidebarOpen(false);
    // Also close mobile search if open
    if (showMobileSearch) {
      setShowMobileSearch(false);
      setSearch('');
    }
    const el = categoryRefs.current[catId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollPopular = (dir: 'left' | 'right') => {
    if (popularScrollRef.current)
      popularScrollRef.current.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  const getItemPrice = (item: MenuItem) => parseFloat(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);

  const getScheduleLabel = () => {
    if (scheduleType === 'asap') return 'ASAP (15 min)';
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      return { value: d.toISOString().split('T')[0], label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });
    const dayLabel = days.find(d => d.value === scheduleDate)?.label || 'Today';
    const [h, m] = scheduleTime.split(':').map(Number);
    return `${dayLabel}, ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const truncateAddress = (addr: string, maxLen = 22) =>
    !addr ? 'Delivery address...' : addr.length > maxLen ? addr.slice(0, maxLen) + '...' : addr;

  const moreLinks = [
    { label: 'Home', href: '/' },
    { label: 'Catering', href: '/catering' },
    { label: 'Our Story', href: '/story' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Gift Cards', href: '/gift-cards' },
  ];

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#FEFEFE', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{css}</style>

      {/* ══ NAV ══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1E1E1E', height: '64px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px' }}>

        {/* Burger — visible on tablet only (768-1024px) */}
        <button className="burger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">
          {sidebarOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          }
        </button>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img src="/logo.svg" alt="Eggs Ok" style={{ width: '36px', height: '36px', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#FED800', letterSpacing: '0.5px', lineHeight: 1 }}>EGGS OK</div>
            <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Philadelphia</div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* More dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#CCC', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showMoreMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setShowMoreMenu(false)} />
                <div style={{ position: 'absolute', top: '46px', right: 0, background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '6px', minWidth: '160px', boxShadow: '0 12px 40px rgba(0,0,0,.6)', zIndex: 200 }}>
                  {moreLinks.map(link => (
                    <Link key={link.href} href={link.href} className="more-link" onClick={() => setShowMoreMenu(false)}
                      style={{ display: 'block', padding: '10px 14px', color: '#CCC', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '8px' }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sign In — hidden mobile */}
          <Link href="/account" className="signin-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Sign In
          </Link>

          {/* Cart */}
          <button onClick={() => setShowCart(true)}
            style={{ position: 'relative', width: '42px', height: '42px', background: '#FED800', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {mounted && cartCount > 0 && (
              <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: '#FC0301', borderRadius: '50%', fontSize: '11px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* ══ MOBILE CATEGORY BAR (≤768px only) ══ */}
      <div className="mobile-cat-bar">
        {showMobileSearch ? (
          /* Expanded search mode */
          <div className="mobile-search-bar">
            <div className="mobile-search-input-wrap">
              <svg
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mobile-search-input"
              />
            </div>
            <button
              onClick={() => { setShowMobileSearch(false); setSearch(''); }}
              style={{ background: 'none', border: 'none', color: '#FED800', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flexShrink: 0, padding: '4px 0', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        ) : (
          /* Scrollable category pills */
          <div ref={mobileCatScrollRef} className="mobile-cat-scroll">
            {/* Search icon pill — always first */}
            <button
              className="mobile-search-icon-btn"
              onClick={() => setShowMobileSearch(true)}
              aria-label="Search menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>  &nbsp;Search
            </button>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: '#2A2A2A', flexShrink: 0 }} />

            {/* Category pills */}
            {categories.map(cat => (
              <button
                key={cat.id}
                ref={el => { mobileCatRefs.current[cat.id] = el; }}
                className={`mobile-cat-pill${activeCategory === cat.id ? ' active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ BODY ══ */}
      <div style={{ display: 'flex', paddingTop: '64px' }}>

        {/* Overlay */}
        <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR (desktop + tablet drawer) ── */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #2A2A2A' }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input placeholder="Search menu" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
            </div>
          </div>
          <div style={{ padding: '12px 0' }}>
            <p style={{ fontSize: '10px', color: '#666', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 16px 8px' }}>Menu</p>
            {categories.map(cat => (
              <button key={cat.id} className="cat-btn" onClick={() => scrollToCategory(cat.id)}
                style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: activeCategory === cat.id ? '#FED800' : 'transparent', color: activeCategory === cat.id ? '#000' : '#FFF', border: 'none', fontSize: '14px', fontWeight: activeCategory === cat.id ? '700' : '400', cursor: 'pointer', transition: 'all 0.15s', borderLeft: activeCategory === cat.id ? '3px solid #000' : '3px solid transparent' }}>
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main ref={mainContentRef} className="main-scroll">
          <div className="main-inner" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 32px 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: '#FEFEFE', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Eggs Ok</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FED800">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" fill="#0D0D0D" />
                  </svg>
                  <span style={{ fontSize: '13px', color: '#666' }}>3517 Lancaster Ave, Philadelphia</span>
                </div>
                <span style={{ color: '#333' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
                  <span style={{ fontSize: '13px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{statusMessage}</span>

                </div>
              </div>

              <div className="order-row">
                {/* Pickup / Delivery */}
                <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '10px', padding: '3px', border: '1px solid #2A2A2A', flexShrink: 0 }}>
                  {isPickupEnabled && (
                    <button onClick={() => setOrderType('pickup')}
                      style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: orderType === 'pickup' ? '#FED800' : 'transparent', color: orderType === 'pickup' ? '#000' : '#666', transition: 'all 0.2s' }}>
                      Pickup
                    </button>
                  )}
                  {isDeliveryEnabled && (
                    <button onClick={() => { setOrderType('delivery'); setShowDeliveryModal(true); }}
                      style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: orderType === 'delivery' ? '#FED800' : 'transparent', color: orderType === 'delivery' ? '#000' : '#666', transition: 'all 0.2s' }}>
                      Delivery
                    </button>
                  )}
                </div>

                {/* Delivery address */}
                {mounted && orderType === 'delivery' && (
                  <button onClick={() => setShowDeliveryModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#CCC', fontSize: '13px', cursor: 'pointer', fontWeight: '500', maxWidth: '200px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncateAddress(deliveryAddress)}</span>
                  </button>
                )}
                {/* Schedule */}
                <button onClick={() => setShowScheduleModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 8px', background: 'transparent', border: '1.5px solid #3A3A3A', borderRadius: '999px', color: '#FEFEFE', fontSize: '13px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#FED800'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#3A3A3A'}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FED800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span className="schedule-label">{mounted ? getScheduleLabel() : 'ASAP (15 min)'}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>


              </div>
            </div>

            {loading && <p style={{ color: '#444', textAlign: 'center', padding: '60px' }}>Loading menu...</p>}

            {/* Search results */}
            {search && filteredItems && (
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "<span style={{ color: '#FED800' }}>{search}</span>"
                </p>
                <div className="menu-grid">
                  {filteredItems.map(item => <GridCard key={item.id} item={item} orderType={orderType} onSelect={openItem} />)}
                </div>
              </div>
            )}

            {/* Categories */}
            {!search && categories.map(cat => {
              const items = getItemsByCategory(cat.id);
              if (items.length === 0) return null;
              const isPopular = cat.id === 0;
              return (
                <div
                  key={cat.id}
                  ref={el => { categoryRefs.current[cat.id] = el; }}
                  className="cat-section"
                  style={{ marginBottom: '52px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: 'clamp(17px,3vw,22px)', fontWeight: '800', color: '#FFF', margin: 0, letterSpacing: '-0.3px' }}>{cat.name}</h2>
                    {isPopular && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['left', 'right'] as const).map(dir => (
                          <button key={dir} onClick={() => scrollPopular(dir)}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#141414', border: '1px solid #2A2A2A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isPopular ? (
                    <div ref={popularScrollRef} style={{ display: 'flex', gap: '14px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '6px' }}>
                      {items.map(item => <div key={item.id} className="pop-card"><PopularCard item={item} orderType={orderType} onSelect={openItem} /></div>)}
                    </div>
                  ) : (
                    <div className="menu-grid">
                      {items.map((item, idx) => {
                        const isFirst = idx === 0; const isLast = idx === items.length - 1;
                        const isLeftCol = idx % 2 === 0; const isRightCol = idx % 2 !== 0;
                        const totalRows = Math.ceil(items.length / 2); const itemRow = Math.floor(idx / 2);
                        const isLastRow = itemRow === totalRows - 1;
                        let br = '';
                        if (isFirst) br = '14px 0 0 0';
                        if (idx === 1) br = '0 14px 0 0';
                        if (items.length % 2 === 0 && isLastRow && isLeftCol) br = '0 0 0 14px';
                        if (items.length % 2 === 0 && isLastRow && isRightCol) br = '0 0 14px 0';
                        if (items.length % 2 !== 0 && isLast) br = '0 0 14px 14px';
                        return <div key={item.id} id={`item-${item.id}`}><GridCard item={item} orderType={orderType} onSelect={openItem} borderRadius={br} /></div>;

                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* ══ CART ══ */}
      {showCart && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400 }} onClick={() => setShowCart(false)} />
          <div className="cart-panel">
            <div style={{ padding: '20px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>Cart</h3>
              <button onClick={() => setShowCart(false)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #1A1A1A' }}>
              <div style={{ display: 'flex', background: '#141414', borderRadius: '10px', padding: '3px', border: '1px solid #2A2A2A' }}>
                {(['pickup', 'delivery'] as const).map(type => (
                  <button key={type} onClick={() => setOrderType(type)}
                    style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: orderType === type ? '#FED800' : 'transparent', color: orderType === type ? '#000' : '#666', transition: 'all 0.2s' }}>
                    {type === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p style={{ fontSize: '15px', color: '#444', fontWeight: '600' }}>Your cart is empty</p>
                  <p style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>Add items to get started</p>
                </div>
              ) : cart.map(cartItem => (
                <div key={cartItem.id} style={{ padding: '14px 0', borderBottom: '1px solid #1A1A1A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE', flex: 1, marginRight: '10px', lineHeight: 1.4 }}>{cartItem.item.name}</p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#FED800' }}>${(getPrice(cartItem.item) * cartItem.quantity).toFixed(2)}</p>
                  </div>

                  {/* Display Modifiers */}
                  {cartItem.item.modifiers && (
                    <div style={{ marginBottom: '10px', paddingLeft: '4px' }}>
                      {cartItem.item.modifiers.map(group => {
                        const selectedIds = cartItem.selectedModifiers[group.id] || [];
                        return selectedIds.map(optId => {
                          const opt = group.options.find(o => o.id === optId);
                          if (!opt) return null;
                          return (
                            <div key={`${group.id}-${optId}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>+ {opt.name}</p>
                              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>${(Number(opt.price) * cartItem.quantity).toFixed(2)}</p>
                            </div>
                          );
                        });
                      })}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#141414', borderRadius: '8px', padding: '4px 10px', border: '1px solid #2A2A2A' }}>
                      <button onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#1A1A1A', border: 'none', color: '#FFF', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', minWidth: '18px', textAlign: 'center' }}>{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FED800', border: 'none', color: '#000', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(cartItem.id)}
                      style={{ fontSize: '12px', color: '#ffffffff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #1A1A1A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span><span style={{ fontSize: '13px', color: '#FFF' }}>${cartTotal.toFixed(2)}</span></div>
                {orderType === 'delivery' && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '13px', color: '#666' }}>Delivery fee</span><span style={{ fontSize: '13px', color: '#FFF' }}>$3.99</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ fontSize: '13px', color: '#666' }}>Tax</span><span style={{ fontSize: '13px', color: '#FFF' }}>${(cartTotal * 0.08).toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>Total</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FED800' }}>${(cartTotal + (orderType === 'delivery' ? 3.99 : 0) + cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <Link href="/checkout" onClick={() => setShowCart(false)}
                  style={{ display: 'block', width: '100%', padding: '15px', background: '#FED800', borderRadius: '12px', color: '#000', fontSize: '15px', fontWeight: '800', textAlign: 'center', textDecoration: 'none' }}>
                  Go to Checkout →
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ DELIVERY MODAL ══ */}
      {showDeliveryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowDeliveryModal(false)}>
          <div style={{ background: '#111', borderRadius: '20px', width: '100%', maxWidth: '460px', border: '1px solid #1E1E1E', boxShadow: '0 20px 60px rgba(0,0,0,.6)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>Order details</h2>
                <button onClick={() => setShowDeliveryModal(false)}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '999px', padding: '3px', marginBottom: '18px', border: '1px solid #2A2A2A' }}>
                {(['pickup', 'delivery'] as const).map(type => (
                  <button key={type} onClick={() => { setOrderType(type); if (type === 'pickup') setShowDeliveryModal(false); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: orderType === type ? '#FEFEFE' : 'transparent', color: orderType === type ? '#000' : '#666', transition: 'all 0.2s' }}>
                    {type === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                ))}
              </div>

              {deliveryStep === 1 && (
                <div>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input placeholder="Enter delivery address..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} autoFocus
                      style={{ width: '100%', padding: '13px 40px 13px 42px', background: '#0A0A0A', border: '1.5px solid #FED800', borderRadius: '12px', color: '#FEFEFE', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    {deliveryAddress && (
                      <button onClick={() => setDeliveryAddress('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Clear</button>
                    )}
                  </div>
                  {deliveryAddress.length > 2 && (
                    <div style={{ marginTop: '8px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
                      <div onClick={() => setDeliveryStep(2)} style={{ padding: '14px 16px', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#141414'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>{deliveryAddress}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>Philadelphia, PA</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deliveryStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#0A0A0A', border: '1.5px solid rgba(254,216,0,0.25)', borderRadius: '12px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span style={{ flex: 1, fontSize: '13px', color: '#FEFEFE', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryAddress}</span>
                    <button onClick={() => setDeliveryStep(1)}
                      style={{ background: 'none', border: 'none', color: '#FED800', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}>Change</button>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Apt / Suite / Floor</label>
                    <input placeholder="Apt 4B, Suite 200…" value={deliveryApt} onChange={e => setDeliveryApt(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#FEFEFE', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#2A2A2A'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Delivery instructions</label>
                    <textarea placeholder="Leave at front door, don't ring the bell…" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#FEFEFE', fontSize: '13px', outline: 'none', height: '80px', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#FED800'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#2A2A2A'} />
                  </div>
                  <div style={{ padding: '14px 16px', background: '#0A0A0A', borderRadius: '12px', border: '1px solid #1A1A1A' }}>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#FEFEFE', marginBottom: '4px' }}>Delivering from</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', margin: 0 }}>Eggs Ok</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                        <span style={{ fontSize: '12px', color: '#22C55E', fontWeight: '600' }}>Open now</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>3517 Lancaster Ave, Philadelphia, PA</p>
                  </div>
                  <button onClick={() => { setScheduleType('asap'); setShowDeliveryModal(false); }}
                    style={{ width: '100%', padding: '14px', background: '#FED800', border: 'none', borderRadius: '12px', color: '#000', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
                    Deliver ASAP
                  </button>
                  <button onClick={() => { setShowDeliveryModal(false); setShowScheduleModal(true); }}
                    style={{ width: '100%', padding: '14px', background: 'transparent', border: '1.5px solid #2A2A2A', borderRadius: '12px', color: '#CCC', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    Schedule delivery
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ SCHEDULE MODAL ══ */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowScheduleModal(false)}>
          <div style={{ background: '#111', borderRadius: '20px', width: '100%', maxWidth: '420px', border: '1px solid #1E1E1E', boxShadow: '0 20px 60px rgba(0,0,0,.6)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FEFEFE', margin: 0 }}>Order time</h2>
              <button onClick={() => setShowScheduleModal(false)}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
              {(() => {
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() + i * 86400000);
                  return { label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }), sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
                });
                const visibleDays = showMoreDates ? days : days.slice(0, 2);
                const selectedVal = scheduleDate || days[0].value;
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      {visibleDays.map(d => (
                        <button key={d.value} onClick={() => setScheduleDate(d.value)}
                          style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${selectedVal === d.value ? '#FED800' : '#2A2A2A'}`, background: selectedVal === d.value ? 'rgba(254,216,0,0.08)' : '#1A1A1A', cursor: 'pointer', textAlign: 'left' }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: selectedVal === d.value ? '#FED800' : '#FEFEFE', margin: 0 }}>{d.label}</p>
                          <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>{d.sub}</p>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowMoreDates(p => !p)}
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#CCC', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                      {showMoreDates ? 'Less dates' : 'More dates'}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5">
                        <polyline points={showMoreDates ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                      </svg>
                    </button>
                  </>
                );
              })()}
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px 8px' }}>
              <div onClick={() => { setScheduleType('asap'); setScheduleTime(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #1E1E1E', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${scheduleType === 'asap' ? '#FED800' : '#333'}`, background: scheduleType === 'asap' ? '#FED800' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {scheduleType === 'asap' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#FEFEFE' }}>ASAP</span>
              </div>
              {Array.from({ length: 57 }, (_, i) => {
                const totalMins = 7 * 60 + i * 15; const h = Math.floor(totalMins / 60); const m = totalMins % 60;
                const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} EDT`;
                const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const isSelected = scheduleType === 'scheduled' && scheduleTime === val;
                return (
                  <div key={val} onClick={() => { setScheduleType('scheduled'); setScheduleTime(val); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #1E1E1E', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? '#FED800' : '#333'}`, background: isSelected ? '#FED800' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                    </div>
                    <span style={{ fontSize: '14px', color: '#FEFEFE' }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #1E1E1E', flexShrink: 0 }}>
              <button onClick={() => setShowScheduleModal(false)}
                style={{ width: '100%', padding: '14px', background: '#FED800', border: 'none', borderRadius: '12px', color: '#000', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
                {scheduleType === 'asap' ? 'Order ASAP' : `Schedule for ${scheduleTime}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ITEM MODAL ══ */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setSelectedItem(null)}>
          <div style={{ background: '#111', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '600px', maxHeight: '94vh', overflow: 'auto', border: '1px solid #1A1A1A', boxShadow: '0 -10px 60px rgba(0,0,0,.6)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '260px', background: '#0A0A0A', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              {selectedItem.imageUrl
                ? <img src={selectedItem.imageUrl} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1A1A00,#0A0A0A)' }}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5" /><path d="M20 32 Q32 20 44 32" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="32" cy="38" r="6" stroke="#2A2A2A" strokeWidth="1.5" /></svg>
                </div>
              }
              {selectedItem.isPopular && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#FED800', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#000"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  POPULAR
                </div>
              )}
              <button onClick={() => setSelectedItem(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#FEFEFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: 'clamp(20px,4vw,24px)', fontWeight: '900', color: '#FEFEFE', marginBottom: '8px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{selectedItem.name}</h2>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>{selectedItem.description}</p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                {(['pickup', 'delivery'] as const).map(type => (
                  <div key={type} onClick={() => setOrderType(type)}
                    style={{ flex: 1, padding: '13px', background: orderType === type ? 'rgba(254,216,0,0.08)' : '#0A0A0A', border: `2px solid ${orderType === type ? '#FED800' : '#1A1A1A'}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <p style={{ fontSize: '11px', color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{type}</p>
                    <p style={{ fontSize: '19px', fontWeight: '800', color: orderType === type ? '#FED800' : '#FEFEFE' }}>
                      ${parseFloat(type === 'pickup' ? selectedItem.pickupPrice : selectedItem.deliveryPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {selectedItem.modifiers?.map(group => (
                <div key={group.id} style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#FEFEFE' }}>{group.name}</p>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: group.required ? 'rgba(254,216,0,0.08)' : '#1A1A1A', color: group.required ? '#FED800' : '#555', border: `1px solid ${group.required ? 'rgba(254,216,0,0.2)' : '#222'}` }}>
                      {group.required ? 'Required' : 'Optional'} · {group.maxSelections === 1 ? 'Choose 1' : `Up to ${group.maxSelections}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {group.options.map(opt => {
                      const isSel = (selectedModifiers[group.id] || []).includes(opt.id);
                      return (
                        <div key={opt.id} onClick={() => toggleModifier(group.id, opt.id, group.maxSelections)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', background: isSel ? '#1A1A00' : '#0A0A0A', border: `1px solid ${isSel ? 'rgba(254,216,0,0.25)' : '#1A1A1A'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: group.maxSelections === 1 ? '50%' : '5px', border: `2px solid ${isSel ? '#FED800' : '#333'}`, background: isSel ? '#FED800' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isSel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <span style={{ fontSize: '14px', color: '#FEFEFE', fontWeight: '500' }}>{opt.name}</span>
                          </div>
                          <span style={{ fontSize: '13px', color: Number(opt.price) > 0 ? '#FED800' : '#444', fontWeight: Number(opt.price) > 0 ? '600' : '400' }}>
                            {Number(opt.price) > 0 ? `+$${Number(opt.price).toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#FEFEFE', marginBottom: '10px' }}>Special Instructions</p>
                <textarea placeholder="Add a note (extra sauce, no onions, etc.)" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                  style={{ width: '100%', padding: '13px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '10px', color: '#FEFEFE', fontSize: '13px', height: '80px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              {menuItems.filter(i => i.id !== selectedItem.id && i.categoryId === selectedItem.categoryId).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>You might also like</p>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                    {menuItems.filter(i => i.id !== selectedItem.id && i.categoryId === selectedItem.categoryId).slice(0, 4).map(item => (
                      <div key={item.id} onClick={() => openItem(item)}
                        style={{ flexShrink: 0, width: '130px', background: '#0A0A0A', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #1A1A1A' }}>
                        <div style={{ height: '80px', background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <svg width="28" height="28" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5" /></svg>
                          }
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: '#FEFEFE', marginBottom: '2px', lineHeight: 1.3 }}>{item.name}</p>
                          <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '600' }}>
                            ${parseFloat(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '8px 16px', flexShrink: 0 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#1A1A1A', border: 'none', color: '#FEFEFE', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FEFEFE', minWidth: '22px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FED800', border: 'none', color: '#000', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button onClick={handleAddToCart} disabled={!canAddToCart()}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', background: canAddToCart() ? '#FED800' : '#1A1A1A', color: canAddToCart() ? '#000' : '#333', border: 'none', fontSize: '15px', fontWeight: '800', cursor: canAddToCart() ? 'pointer' : 'not-allowed', letterSpacing: '-0.2px' }}>
                  Add item · ${((getItemPrice(selectedItem) + getModifierTotal()) * quantity).toFixed(2)} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading menu...</div>}>
      <OrderContent />
    </Suspense>
  );
}


function PopularCard({ item, orderType, onSelect }: { item: MenuItem; orderType: 'pickup' | 'delivery'; onSelect: (item: MenuItem) => void }) {
  const price = parseFloat(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);
  return (
    <div onClick={() => onSelect(item)}
      style={{ background: '#111', border: '1px solid #1A1A1A', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(254,216,0,0.3)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#1A1A1A'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
      <div style={{ height: '155px', background: '#0A0A0A', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1A1A1A,#0A0A0A)' }}>
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5" /><path d="M20 32 Q32 20 44 32" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="32" cy="38" r="6" stroke="#2A2A2A" strokeWidth="1.5" /></svg>
          </div>
        }
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '30px', height: '30px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
        <p style={{ fontSize: '14px', fontWeight: '800', color: '#FED800' }}>${price.toFixed(2)}</p>
      </div>
    </div>
  );
}

function GridCard({ item, orderType, onSelect, borderRadius }: { item: MenuItem; orderType: 'pickup' | 'delivery'; onSelect: (item: MenuItem) => void; borderRadius?: string }) {
  const price = parseFloat(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);
  return (
    <div onClick={() => onSelect(item)}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', background: '#181818', cursor: 'pointer', transition: 'background 0.15s', borderRadius: borderRadius || '0', minHeight: '130px' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#202020'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#181818'}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'clamp(13px,2vw,15px)', fontWeight: '700', color: '#FFF', marginBottom: '6px', lineHeight: 1.4 }}>{item.name}</p>
        <p style={{ fontSize: 'clamp(13px,2vw,15px)', fontWeight: '800', color: '#FED800', marginBottom: '6px' }}>${price.toFixed(2)}</p>
        <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {item.description}
        </p>
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="grid-img" style={{ borderRadius: '12px', overflow: 'hidden', background: '#222', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <svg width="36" height="36" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#2A2A2A" strokeWidth="1.5" /><path d="M20 32 Q32 20 44 32" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="32" cy="38" r="6" stroke="#2A2A2A" strokeWidth="1.5" /></svg>
          }
        </div>
        <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '30px', height: '30px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #181818', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}