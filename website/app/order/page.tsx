'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { useGoogleMaps, initAutocomplete, validateDeliveryAddress } from '../../hooks/useGoogleMaps';

type ModifierOption = { id: number; name: string; price: number };
type ModifierGroup = { id: number; name: string; required: boolean; minSelections: number; maxSelections: number; options: ModifierOption[] };
type MenuItem = { id: number; categoryId: number; name: string; description: string; pickupPrice: number; deliveryPrice: number; image: string; imageUrl: string; isPopular?: boolean; modifiers?: ModifierGroup[] };
type Category = { id: number; name: string; isActive?: boolean };

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --y: #E5B800;
    --r: #FC0301;
    --w: #1A1A1A;
    --bg0: #FFFFFF;
    --bg1: #F8F9FA;
    --bg2: #FFFFFF;
    --bg3: #F5F5F5;
    --bg4: #F0F0F0;
    --border: #D0D0D0;
    --t1: #1A1A1A;
    --t2: #333333;
    --t3: #888888;
    --t4: #AAAAAA;
    --green: #22C55E;
    --font-head: 'Playfair Display', Georgia, serif;
    --font-body: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── Base ── */
  .order-page { font-family: var(--font-body); background: var(--bg1); min-height: 100vh; color: var(--t1); }

  /* ── Skip link ── */
  .skip-link { position: absolute; top: -100px; left: 16px; z-index: 9999; background: var(--y); color: #000; padding: 10px 20px; border-radius: 0 0 8px 8px; font-weight: 700; font-size: 13px; text-decoration: none; transition: top 0.2s; }
  .skip-link:focus { top: 0; }
  :focus-visible { outline: 2px solid var(--y); outline-offset: 3px; }
  button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }

  /* ── NAV ── */
  .order-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.98); backdrop-filter: blur(24px);
   
    height: 72px; display: flex; align-items: center;
    padding: 0 20px; gap: 12px;
  }
  .nav-logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
  .nav-logo-img { object-fit: cover; }
  .nav-spacer { flex: 1; }
  .nav-actions { display: flex; align-items: center; gap: 8px; }

  /* ── Burger ── */
  .burger {
    display: none; align-items: center; justify-content: center;
    width: 44px; height: 44px;
    background: var(--bg4); border: 1px solid var(--border);
    border-radius: 10px; cursor: pointer; color: var(--t2); flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
  }
  .burger:hover { background: #EEEEEE; border-color: #C0C0C0; }

  /* ── Nav More dropdown ── */
  .nav-more-wrap { position: relative; }
  .nav-more-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 8px 12px; background: transparent;
    border: 1px solid var(--border); border-radius: 8px;
    color: var(--t2); font-size: 16px; font-weight: 600;
    cursor: pointer; font-family: var(--font-body);
    transition: border-color 0.15s, color 0.15s;
  }
  .nav-more-btn:hover { border-color: #C0C0C0; color: var(--t1); }
  .nav-more-dropdown {
    position: absolute; top: 46px; right: 0;
    background: var(--bg2); border: 1px solid #E0E0E0;
    border-radius: 14px; padding: 6px; min-width: 170px;
    box-shadow: 0 16px 48px rgba(0,0,0,.1); z-index: 200;
  }
  .nav-more-link {
    display: block; padding: 8px 12px; color:# 4D4D4D;
    text-decoration: none; font-size: 16px; font-weight: 500;
    border-radius: 8px; transition: background 0.12s, color 0.12s;
    font-family: var(--font-body);
  }
  .nav-more-link:hover { background: var(--bg4); color: #4D4D4D; }

  /* ── Sign in ── */
  .nav-signin {
    padding: 5px 12px; background: transparent;
    border: 1px solid var(--border); border-radius: 8px;
    color: var(--t2); font-size: 16px; font-weight: 600;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: border-color 0.15s, color 0.15s;
  }
  .nav-signin:hover { border-color: #000; color: var(--t1); }

  /* ── Cart button ── */
  .nav-cart-btn {
    position: relative; width: 42px; height: 42px;
    
    background: #ffffff; border: 2px solid transparent; border-radius: 10px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.3s ease;
  }
  .nav-cart-btn:hover { background: #ffffff; border-color: transparent; transform: none; box-shadow: none; }
  .nav-cart-badge {
    position: absolute; top: -6px; right: -6px;
    width: 20px; height: 20px; background: var(--r);
    border-radius: 50%; font-size: 11px; font-weight: 900;
    color: #fff; display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg1);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 17%; flex-shrink: 0;
    position: sticky; top: 72px;
    height: calc(100vh - 72px); overflow-y: auto;
    // border-right: 1px solid #E5E5E5;
    background: var(--bg2); padding: 24px 0;
    scrollbar-width: none; z-index: 50;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  }
  .sidebar::-webkit-scrollbar { display: none; }

  .sidebar-search-wrap { padding: 0 0% 0px 4%; }
  .sidebar-search-inner { position: relative; color:#ffffff; }
  .sidebar-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .sidebar-search-input {
    width: 100%; padding: 10px 12px 10px 36px;
    background: #ffffff; border: 1px solid #D0D0D0;
    border-radius: 10px; color: var(--t1); font-size: 16px;
    outline: none; font-family: var(--font-body);
    transition: border-color 0.15s;
  }
  // .sidebar-search-input:focus { border-color: 2px solid #000; }
    .sidebar-search-input:hover { border-color: #000; background: #ffffff; }
  .sidebar-search-input::placeholder { color: #D0D0D0); }

  .sidebar-menu-wrap { padding: 16px 0px; margin-left:4%}
  .sidebar-menu-label {
    font-size: 15px; color: #1A1A1A; font-weight: 900;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 0 16px 10px; display: block; font-family: var(--font-body);
  }
  .sidebar-cat-btn {
    width: 100%; border-radius:8px;padding:10px 8px; text-align: left;
    background: transparent; color: #4D4D4D; border: none;
    font-size: 16px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border-left: 3px solid transparent;
    font-family: var(--font-body); display: flex; align-items: center; gap: 8px;
  }
  .sidebar-cat-btn:hover { background: var(--bg4); color: var(--t1); }
  .sidebar-cat-btn.active {
    background: #000; color: #ffffff;border-radius:8px;padding:10px 8px;
    font-weight: 500; ;
  }
  .sidebar-cat-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; opacity: 0.5; }
  .sidebar-cat-btn.active .sidebar-cat-dot { opacity: 1; }

  /* ── Sidebar overlay ── */
  .sidebar-overlay { display: none; position: fixed; inset: 0; z-index: 148; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); }
  .sidebar-overlay.visible { display: block; }

  /* ── Main scroll ── */
  .main-scroll { flex: 1; overflow-y: auto; height: calc(100vh - 72px); min-width: 0; background: #ffffff; }
  .main-inner { max-width: 960px; margin: 0 auto; padding: 20px 36px 100px; }

  /* ── Page header ── */
  .page-header { margin-bottom: 32px; }
  .page-title {
    font-family: var(--font-head);
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0.5px; line-height: 1.2;
    color: var(--t1); margin: 0 0 12px;
  }
  .page-title-accent { color: var(--t1); }
  .page-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .page-meta-location { display: flex; align-items: center; gap: 5px; }
  .page-meta-dot { color: #D0D0D0; }
  .page-meta-status { display: flex; align-items: center; gap: 5px; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .status-dot.open { background: var(--green); }
  .status-dot.closed { background: var(--r); }
  .status-text { font-size: 13px; font-weight: 600; }
  .status-text.open { color: #007a2d; }
  .status-text.closed { color: var(--r); }

  /* ── Order row ── */
  .order-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* ── Order type toggle ── */
  .order-type-toggle {
    display: flex; background: var(--bg4); border-radius: 20px;
    padding: 1px; border: 1px solid var(--border); flex-shrink: 0;
  }
  .order-type-btn {
    padding: 10px 20px; border-radius: 10px; border: none;
    cursor: pointer; font-size: 16px; font-weight: 500;
    transition: all 0.2s; font-family: var(--font-body);
  }
  .order-type-btn.active { background: #ffffff; color: #000; border-radius: 20px; }
  .order-type-btn.inactive { background: transparent; color: #4D4D4D; }
  .order-type-btn.inactive:hover { color: var(--t2); }

  /* ── Delivery address btn ── */
  .delivery-addr-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 14px; background: var(--bg4);
    border: 1px solid var(--border); border-radius: 10px;
    color: #000; font-size: 14px; cursor: pointer;
    font-weight: 500; max-width: 200px;
    transition: border-color 0.15s, color 0.15s;
    font-family: var(--font-body);
  }
  .delivery-addr-btn:hover { border-color: #C0C0C0; color: var(--t1); }

  /* ── Schedule btn ── */
  .schedule-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; background: transparent;
    border: 1.5px solid #C0C0C0; border-radius: 999px;
    color: var(--t1); font-size: 16px; cursor: pointer;
    font-weight: 500; white-space: nowrap; flex-shrink: 0;
    transition: border-color 0.15s; font-family: var(--font-body);
  }
  .schedule-btn:hover { border-color: #C0C0C0; }

  /* ── Category section ── */
  .cat-section { scroll-margin-top: 24px; margin-bottom: 56px; }
  .cat-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 22px;
  }
  .cat-section-title {
    font-family: var(--font-head);
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.5px; color: var(--t1); margin: 0;
  }
  .cat-section-title .accent { color: var(--t1); }
  .popular-scroll-btns { display: flex; gap: 6px; }
  .popular-scroll-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--bg4); border: 1px solid var(--border);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--t3); transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .popular-scroll-btn:hover { background: var(--bg3); border-color: #C0C0C0; color: var(--t1); }

  /* ── Popular scroll row ── */
  .popular-scroll-row { display: flex; gap: 14px; overflow-x: auto; scrollbar-width: none; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
  .popular-scroll-row::-webkit-scrollbar { display: none; }
  .pop-card { flex-shrink: 0; width: 210px; }

  /* ── Popular card ── */
  .pop-card-inner {
    background: var(--bg2); border: 1px solid #E5E5E5;
    border-radius: 16px; overflow: hidden; cursor: pointer;
    transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s;
    height: 100%; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .pop-card-inner:hover { border-color: rgba(254,216,0,0.2); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .pop-card-img-wrap { height: 155px; background: var(--bg1); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .pop-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .pop-card-inner:hover .pop-card-img { transform: scale(1.06); }
  .pop-card-add-btn { position: absolute; bottom: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: var(--y); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
  .pop-card-body { padding: 14px 16px; }
  .pop-card-name { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 5px; line-height: 1.35; }
  .pop-card-price { font-size: 16px; font-weight: 900; color: var(--t1); }
  .pop-card-popular-badge {
    position: absolute; top: 10px; left: 10px;
    background: var(--y); color: #000; padding: 3px 10px;
    border-radius: 20px; font-size: 10px; font-weight: 900;
    display: flex; align-items: center; gap: 4px;
    font-family: var(--font-head); letter-spacing: -0.5px;
  }

  /* ── Menu grid ── */
  .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }

  /* ── Grid card ── */
  .grid-card {
    display: flex; align-items: center; gap: 16px;
    background: #ffffff; cursor: pointer; min-height: 130px;
    transition: background 0.15s, box-shadow 0.2s, border-color 0.2s;
    border: 1px solid #E5E5E5; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .grid-card:hover { background: #F8F8F8;border-color: #D0D0D0; }
  .grid-card-body { flex: 1; min-width: 0; padding-left: 20px; }
  .grid-card-name { font-size: 16px; font-weight: 500; color: #1A1A1A; margin-bottom: 5px; line-height: 1.4; }
  .grid-card-price { font-size: 16px; font-weight: 500; color: #1A1A1A; margin-bottom: 6px; }
  .grid-card-desc { font-size: 14px; color: #4D4D4D; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .grid-card-img-wrap { position: relative; flex-shrink: 0; }
  .grid-card-img { width: 200px; height: 200px;  overflow: hidden; background: #E0E0E0; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
  .grid-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .grid-card:hover .grid-card-img img { transform: scale(1.05); }
  .grid-card-add-btn { position: absolute; bottom: 7px; right: 10px; width: 30px; height: 30px; border-radius: 20%; background: #ffffff; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg3); box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

  /* ── Search results header ── */
  .search-results-meta { font-size: 14px; color: var(--t3); margin-bottom: 20px; }
  .search-results-meta .search-term { color: var(--t1); font-weight: 700; }

  /* ── Loading ── */
  .menu-loading { color: var(--t4); text-align: center; padding: 80px 20px; font-size: 16px; font-weight: 500; }
  @keyframes skeleton-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .skeleton-card { background: var(--bg3); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .skeleton-img { height: 160px; background: var(--bg2); animation: skeleton-pulse 1.5s infinite; }
  .skeleton-body { padding: 14px; }
  .skeleton-line { height: 12px; background: var(--bg2); border-radius: 6px; margin-bottom: 8px; animation: skeleton-pulse 1.5s infinite; }
  .skeleton-line.w60 { width: 60%; }
  .skeleton-line.w40 { width: 40%; }
  .skeleton-line.w80 { width: 80%; }

  /* ══ MOBILE CATEGORY BAR ══ */
  .mobile-cat-bar {
    display: none; position: fixed;
    top: 72px; left: 0; right: 0; z-index: 98;
    background: rgba(255,255,255,0.98); backdrop-filter: blur(20px);
    border-bottom: 1px solid #E5E5E5;
    height: 52px; align-items: center;
  }
  .mobile-cat-scroll {
    display: flex; align-items: center; overflow-x: auto;
    scrollbar-width: none; padding: 0 12px; gap: 6px;
    height: 100%; -webkit-overflow-scrolling: touch;
  }
  .mobile-cat-scroll::-webkit-scrollbar { display: none; }
  .mobile-cat-pill {
    flex-shrink: 0; padding: 6px 14px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--bg4);
    color: var(--t3); font-size: 14px; font-weight: 600;
    cursor: pointer; white-space: nowrap;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    font-family: var(--font-body); line-height: 1;
  }
  .mobile-cat-pill.active { background: #000; color: #ffffff; border-color: var(--y); }
  .mobile-cat-pill:not(.active):hover { border-color: #C0C0C0; color: var(--t2); }
  .mobile-cat-divider { width: 1px; height: 20px; background: #D0D0D0; flex-shrink: 0; }
  .mobile-search-icon-btn {
    flex-shrink: 0; padding: 6px 12px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--bg4);
    color: var(--t3); cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 6px; transition: background 0.15s, border-color 0.15s;
    font-size: 12px; font-weight: 600; font-family: var(--font-body);
    white-space: nowrap;
  }
  .mobile-search-icon-btn:hover { background: #EEEEEE; border-color: #C0C0C0; color: var(--t2); }
  .mobile-search-bar { display: flex; align-items: center; padding: 0 12px; gap: 10px; width: 100%; height: 100%; }
  .mobile-search-input-wrap { position: relative; flex: 1; }
  .mobile-search-input {
    width: 100%; padding: 8px 12px 8px 34px;
    background: var(--bg4); border: 1px solid var(--border);
    border-radius: 999px; color: var(--t1); font-size: 16px;
    outline: none; font-family: var(--font-body); transition: border-color 0.15s;
  }
  .mobile-search-input:focus { border-color: var(--y); }
  .mobile-search-input::placeholder { color: var(--t4); }
  .mobile-search-cancel {
    background: none; border: none; color: var(--t1); cursor: pointer;
    font-size: 14px; font-weight: 700; flex-shrink: 0; padding: 4px 0;
    font-family: var(--font-body);
  }

  /* ══ CART PANEL ══ */
  .cart-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 380px;
    background: var(--bg1); border-left: 1px solid #E5E5E5;
    z-index: 500; display: flex; flex-direction: column;
    box-shadow: -20px 0 60px rgba(0,0,0,0.1);
  }
  .cart-header { padding: 20px; border-bottom: 1px solid #E5E5E5; display: flex; align-items: center; justify-content: space-between; }
  .cart-title { font-family: var(--font-body); font-size: 22px; font-weight: 500; letter-spacing: 0.1px; color: #1A1A1A; margin: 0; }
  .cart-close-btn { width: 32px; height: 32px; border-radius: 8px; background: var(--bg4); border: 1px solid var(--border); color: var(--t3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .cart-close-btn:hover { background: #EEEEEE; color: var(--t1); }
  .cart-type-wrap { padding: 14px 20px; border-bottom: 1px solid #E5E5E5; }
  .cart-type-toggle { display: flex; background: var(--bg4); border-radius: 20px; padding:1px; border: 1px solid var(--border); }
  .cart-type-btn { flex: 1; padding: 9px; border-radius: 20px; border: none; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s; font-family: var(--font-body); }
  .cart-type-btn.active { background: #ffffff; color: #0D0D0D;  }
  .cart-type-btn.inactive { background: transparent; color: #0D0D0D; }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
  .cart-empty { text-align: center; padding: 72px 20px; }
  .cart-empty-title { font-size: 16px; color: var(--t4); font-weight: 600; margin-top: 16px; }
  .cart-empty-sub { font-size: 14px; color: var(--t4); margin-top: 4px; }
  .cart-item { padding: 16px 0; border-bottom: 1px solid #E5E5E5; }
  .cart-item-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .cart-item-name { font-size: 16px; font-weight: 500; color: #0D0D0D; flex: 1; margin-right: 10px; line-height: 1.4; }
  .cart-item-price { font-size: 16px; font-weight: 500; color: #0D0D0D; flex-shrink: 0; }
  .cart-item-modifiers { margin-bottom: 10px; padding-left: 4px; }
  .cart-modifier-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .cart-modifier-name { font-size: 16px; color: #4D4D4D; }
  .cart-modifier-price { font-size: 16px; color: #4D4D4D; }
  .cart-item-controls { display: flex; align-items: center; justify-content: space-between; }
  .cart-qty-wrap { display: flex; align-items: center; gap: 12px; background: var(--bg4); border-radius: 10px; padding: 4px 10px; border: 1px solid var(--border); }
  .cart-qty-btn { width: 28px; height: 28px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: background 0.15s; }
  .cart-qty-dec { background: var(--bg3); color: var(--t1); }
  .cart-qty-dec:hover { background: #E0E0E0; }
  .cart-qty-inc { background: #E0E0E0; color: #000; }
  .cart-qty-inc:hover { background: #ffffff; }
  .cart-qty-val { font-size: 16px; font-weight: 500; color: #4D4D4D; min-width: 18px; text-align: center; }
  .cart-remove-btn { font-size: 12px; color: #0D0D0D; background: none; border: none; cursor: pointer; text-decoration: underline; transition: color 0.15s; font-family: var(--font-body); }
  .cart-remove-btn:hover { color: var(--r); }
  .cart-footer { padding: 18px 20px; border-top: 1px solid #E5E5E5; }
  .cart-summary-row { display: flex; justify-content: space-between; margin-bottom: 7px; }
  .cart-summary-label { font-size: 22px; color: #0D0D0D; }
  .cart-summary-val { font-size: 22px; color: #0D0D0D; }
  .cart-total-row { display: flex; justify-content: space-between; margin-bottom: 18px; margin-top: 8px; padding-top: 12px; border-top: 1px solid #E5E5E5; }
  .cart-total-label { font-family: var(--font-body); font-size: 16px; letter-spacing: -0.5px; color: #4D4D4D; }
  .cart-total-val { font-family: var(--font-body); font-size: 16px; letter-spacing: -0.5px; color: #4D4D4D; }
  .cart-checkout-btn {
    display: block; width: 100%; padding: 8px;
    background: var(--y); border: 2px solid transparent; border-radius: 12px; color: #000;
    font-size: 16px; font-weight: 500; text-align: center;
    text-decoration: none; font-family: var(--font-body);
    transition: all 0.3s ease;
  }
  .cart-checkout-btn:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; box-shadow: none; }

  /* ══ MODAL COMMON ══ */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal-close-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--bg4); border: 1px solid var(--border); color: var(--t3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
  .modal-close-btn:hover { background: #EEEEEE; color: var(--t1); }
  .modal-title { font-family: var(--font-head); font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--t1); margin: 0; }

  /* ══ DELIVERY MODAL ══ */
  .delivery-modal-box {
    background: var(--bg2); border-radius: 20px; width: 100%; max-width: 460px;
    border: 1px solid #E5E5E5; box-shadow: 0 24px 64px rgba(0,0,0,0.1);
    max-height: 92vh; overflow-y: auto;
  }
  .delivery-modal-inner { padding: 28px; }
  .delivery-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .delivery-type-toggle { display: flex; background: var(--bg4); border-radius: 999px; padding: 1px; margin-bottom: 20px; border: 1px solid var(--border); }
  .delivery-type-btn { flex: 1; padding: 10px; border-radius: 999px; border: none; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s; font-family: var(--font-body); }
  .delivery-type-btn.active { background: #ffffff; color: #000; }
  .delivery-type-btn.inactive { background: transparent; color: var(--t4); }
  .delivery-input {
    width: 100%; padding: 13px 40px 13px 42px;
    background: var(--bg1); border: 1.5px solid #C0C0C0;
    border-radius: 12px; color: var(--t1); font-size: 16px;
    outline: none; box-sizing: border-box; font-family: var(--font-body);
  }
  .delivery-input::placeholder { color: var(--t4); }
  .delivery-input-wrap { position: relative; }
  .delivery-input-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--t4); cursor: pointer; font-size: 14px; font-weight: 600; font-family: var(--font-body); }
  .delivery-input-clear:hover { color: var(--t1); }
  .delivery-suggestion {
    margin-top: 8px; background: var(--bg1); border: 1px solid #E5E5E5;
    border-radius: 12px; overflow: hidden;
  }
  .delivery-suggestion-row { padding: 14px 16px; cursor: pointer; transition: background 0.12s; }
  .delivery-suggestion-row:hover { background: #F0F0F0; }
  .delivery-suggestion-name { font-size: 16px; font-weight: 700; color: var(--t1); }
  .delivery-suggestion-city { font-size: 14px; color: var(--t4); margin-top: 2px; }
  .delivery-field-label { font-size: 12px; color: #555555; display: block; margin-bottom: 6px; font-weight: 600; }
  .delivery-field-input {
    width: 100%; padding: 12px; background: var(--bg1); border: 1px solid var(--border);
    border-radius: 10px; color: var(--t1); font-size: 16px; outline: none;
    box-sizing: border-box; font-family: var(--font-body); transition: border-color 0.15s;
  }
  .delivery-field-input:focus { border-color: #C0C0C0; }
  .delivery-field-input::placeholder { color: var(--t4); }
  .delivery-field-textarea {
    width: 100%; padding: 12px; background: var(--bg1); border: 1px solid var(--border);
    border-radius: 10px; color: var(--t1); font-size: 16px; outline: none;
    height: 80px; resize: none; font-family: var(--font-body);
    box-sizing: border-box; transition: border-color 0.15s;
  }
  .delivery-field-textarea:focus { border-color: #C0C0C0; }
  .delivery-field-textarea::placeholder { color: var(--t4); }
  .delivery-addr-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg1); border: 1.5px solid #C0C0C0; border-radius: 12px; }
  .delivery-addr-change { background: none; border: none; color: var(--t1); font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0; font-family: var(--font-body); }
  .delivery-from-box { padding: 14px 16px; background: var(--bg1); border-radius: 12px; border: 1px solid #E5E5E5; }
  .delivery-from-label { font-size: 12px; font-weight: 700; color: var(--t3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: -0.5px; }
  .delivery-from-name-row { display: flex; align-items: center; gap: 8px; }
  .delivery-btn-primary { width: 100%; padding: 8px; background: var(--y); border: 2px solid transparent; border-radius: 12px; color: #000; font-size: 16px; font-weight: 500; cursor: pointer; font-family: var(--font-body); transition: all 0.3s ease; }
  .delivery-btn-primary:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; box-shadow: none; }
  .delivery-btn-secondary { width: 100%; padding: 14px; background: transparent; border: 1.5px solid var(--border); border-radius: 12px; color: var(--t2); font-size: 16px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: border-color 0.15s; }
  .delivery-btn-secondary:hover { border-color: #C0C0C0; color: var(--t1); }

  /* ══ SCHEDULE MODAL ══ */
  .schedule-modal-box {
    background: var(--bg2); border-radius: 20px; width: 100%; max-width: 420px;
    border: 1px solid #E5E5E5; box-shadow: 0 24px 64px rgba(0,0,0,0.1);
    overflow: hidden; max-height: 90vh; display: flex; flex-direction: column;
  }
  .schedule-modal-header { padding: 20px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5E5E5; flex-shrink: 0; }
  .schedule-dates-wrap { padding: 16px 24px 0; flex-shrink: 0; }
  .schedule-dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .schedule-date-btn { padding: 10px 14px; border-radius: 10px; border: 1px solid; cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s; background: var(--bg4); }
  .schedule-date-btn.active { border-color: #000; background: #000; }
   .schedule-date-btn.active p { color: #fff; }
     .schedule-date-btn  {
    display: flex;
    justify-content: space-between; /* pushes both <p> to edges */
    align-items: center;
    width: 100%; /* important so space can expand */
}

.co-schedule-date-btn p {
    margin: 0;
}
    .schedule-date-btn.active p { color: #fff; }
  .schedule-date-btn.inactive { border-color: var(--border); }
  .schedule-date-label { font-size: 14px; font-weight: 700; margin: 0; }
  .schedule-date-label.active { color: var(--t1); }
  .schedule-date-label.inactive { color: var(--t1); }
  .schedule-date-sub { font-size: 12px; color: #888888; margin: 2px 0 0; }
  .schedule-date-sub.active { color: var(--t2); }
  .schedule-more-btn { width: 100%; padding: 10px; background: transparent; border: 1px solid var(--border); border-radius: 10px; color: var(--t2); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px; font-family: var(--font-body); transition: border-color 0.15s; }
  .schedule-more-btn:hover { border-color: #C0C0C0; color: var(--t1); }
  .schedule-times-list { overflow-y: auto; flex: 1; padding: 0 24px 8px; }
  .schedule-time-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #E5E5E5; cursor: pointer; }
  .schedule-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
  .schedule-radio.selected { border-color: #000; background:#000; }
  .schedule-radio.unselected { border-color: #D0D0D0; background: transparent; }
  .schedule-radio-inner { width: 8px; height: 8px; border-radius: 50%; background: #ffffff; }
  .schedule-time-label { font-size: 16px; color: var(--t1); }
  .schedule-modal-footer { padding: 16px 24px; border-top: 1px solid #E5E5E5; flex-shrink: 0; }
  .schedule-confirm-btn { width: 100%; padding: 8px; background: var(--y); border: 2px solid transparent; border-radius: 12px; color: #000; font-size: 16px; font-weight: 500; cursor: pointer; font-family: var(--font-body); transition: all 0.3s ease; }
  .schedule-confirm-btn:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; }

  /* ══ ITEM MODAL ══ */
  .item-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-start; justify-content: center;}
  .item-modal-box {
    margin-top:20px;
    background: var(--bg2); border-radius: 24px 24px 0 0; width: 100%; max-width: 600px;
    max-height: 94vh; overflow: auto; border: 1px solid #E5E5E5;
    box-shadow: 0 -16px 60px rgba(0,0,0,0.1);
    display: flex; flex-direction: column;
  }
  .item-modal-close {
    position: sticky; top: 8px; z-index: 30;
    align-self: flex-end;
    margin: 12px 12px -56px 0;
    width: 40px; min-height: 40px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(0, 0, 0, 0.1);
    color: var(--t1); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
    backdrop-filter: blur(6px);
  }
  .item-modal-close:hover { background: rgba(255, 255, 255, 0.98); }
  .item-modal-img-wrap { position: relative;  background: var(--bg1); overflow: hidden; border-radius: 24px 24px 0 0; flex-shrink: 0; }
  .item-modal-img { width: 100%; height: 100%; object-fit: cover; }
  .item-modal-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FAFAE0, var(--bg1)); }
  .item-popular-badge { position: absolute; top: 16px; left: 16px; background: var(--y); color: #000; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 900; display: flex; align-items: center; gap: 4px; font-family: var(--font-head); letter-spacing: -0.5px; }
  .item-modal-body { padding: 0 28px 28px; }
  .item-modal-name {
    position: sticky; top: 0; z-index: 10;
    background: var(--bg2);
    margin: 0 -28px 10px;
    padding: 18px 68px 12px 28px;
    font-family: var(--font-body); font-size: 22px; font-weight: 500;
    letter-spacing: 0.9px; line-height: 1; color: #0D0D0D;
    border-bottom: 1px solid #F0F0F0;
  }
  .item-modal-desc { font-size: 16px; color: #333333; line-height: 1.7; margin-bottom: 20px; }
  .item-price-row { display: flex; gap: 10px; margin-bottom: 28px; }
  .item-price-card { flex: 1; padding: 4px; border-radius: 12px; text-align: center; cursor: pointer; transition: border-color 0.15s, background 0.15s; border: 2px solid; }
  .item-price-card.active { background: #ffffff; border-color: #C0C0C0; }
  .item-price-card.inactive { background: var(--bg1); border-color: #C0C0C0; }
  .item-price-type { font-size: 10px; color:#4D4D4D; margin-bottom: 0px; text-transform: uppercase; letter-spacing: -0.5px; font-weight: 700; }
  .item-price-val { font-family: var(--font-body); color: #4D4D4D !important; font-size: 16px; font-weight: 500; letter-spacing: -0.5px; }
  .item-price-val.active { color: var(--t1); }
  .item-price-val.inactive { color: var(--t1); }
  .modifier-group { margin-bottom: 28px; }
  .modifier-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
  .modifier-group-name { font-family: var(--font-body); font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--t1); }
  .modifier-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; border: 1px solid; }
  .modifier-badge.required { background: #FC030120; color: #FC0301; border: 1px solid #FC030140;  }
  .modifier-badge.optional { background: var(--bg4); color: #000; border-color: #E0E0E0; }
  .modifier-options { display: flex; flex-direction: column; gap: 6px; }
  .modifier-option {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 16px; border-radius: 10px; cursor: pointer;
    transition: all 0.15s;
  }
  .modifier-option.selected { background: #ffffff; border-color: #C0C0C0; }
  .modifier-option.unselected {  }
  .modifier-option:hover.unselected { border-color: #D0D0D0; }
  .modifier-option-left { display: flex; align-items: center; gap: 12px; }
  .modifier-check { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid; transition: border-color 0.15s, background 0.15s; }
  .modifier-check.radio { border-radius: 50%; }
  .modifier-check.checkbox { border-radius: 5px; }
  .modifier-check.selected { border-color: #000; background: #000; }
  .modifier-check.unselected { border-color: #D0D0D0; background: transparent; }
  .modifier-option-name { font-size: 16px; color: var(--t1); font-weight: 500; }
  .modifier-option-price { font-size: 14px; font-weight: 600; }
  .modifier-option-price.paid { color: var(--t1); font-weight: 700; }
  .modifier-option-price.free { color: var(--t4); }
  .item-instructions-label { font-family: var(--font-body); font-size: 22px; font-weight: 500; letter-spacing: -0.9px; color: #1A1A1A; margin-bottom: 10px; }
  .item-instructions-input { width: 100%; padding: 14px; background: var(--bg1); border: 1px solid #E5E5E5; border-radius: 10px; color: var(--t1); font-size: 16px; height: 80px; resize: none; outline: none; font-family: var(--font-body); box-sizing: border-box; transition: border-color 0.15s; }
  .item-instructions-input:focus { border-color: #C0C0C0; }
  .item-instructions-input::placeholder { color: var(--t4); }
  .upsell-section { margin-bottom: 28px; }
  .upsell-label { font-size: 22px; font-weight: 500; color: #1A1A1A; margin-bottom: 12px; letter-spacing: -0.9px; }
  .upsell-row { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .upsell-row::-webkit-scrollbar { display: none; }
  .upsell-card { flex-shrink: 0; width: 130px; background: var(--bg1); border-radius: 12px; overflow: hidden; cursor: pointer; border: 1px solid #E5E5E5; transition: border-color 0.15s; }
  .upsell-card:hover { border-color: rgba(254,216,0,0.2); }
  .upsell-card-img { height: 80px; background: var(--bg2); overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .upsell-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .upsell-card-body { padding: 8px 10px; }
  .upsell-card-name { font-size: 13px; font-weight: 500; color: #4D4D4D; margin-bottom: 3px; line-height: 1.3; }
  .upsell-card-price { font-size: 14px; color: #4D4D4D; font-weight: 500; }
  .item-add-row {
    display: flex; gap: 12px; align-items: center;
    position: sticky; bottom: 0; z-index: 10;
    background: var(--bg2);
    margin: 0 -28px -28px;
    padding: 14px 28px;
    border-top: 1px solid #E5E5E5;
  }
  .item-qty-wrap { display: flex; align-items: center; gap: 14px; background: var(--bg1); border: 1px solid #E5E5E5; border-radius: 12px; padding: 4px 16px; flex-shrink: 0; }
  .item-qty-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: background 0.15s; }
  .item-qty-dec { background: var(--bg4); color: var(--t1); }
  .item-qty-dec:hover { background: #E0E0E0; }
  .item-qty-inc { background: #E0E0E0; color: #000; }
  .item-qty-inc:hover { background: #E0E0E0; }
  .item-qty-val { font-size: 16px; font-weight: 500; color: var(--t1); min-width: 22px; text-align: center; }
  .item-add-btn { flex: 1; padding: 8px; border-radius: 12px; border: 2px solid transparent; font-size: 16px; font-weight: 500; cursor: pointer; font-family: var(--font-body); transition: all 0.3s ease; }
  .item-add-btn.enabled { background: var(--y); color: #000; }
  .item-add-btn.enabled:hover { background: #E5B800; color: #000; border-color: transparent; transform: none; box-shadow: none; }
  .item-add-btn.disabled { background: #E5B800; color: #000; cursor: not-allowed; }

  /* ══ TABLET + MOBILE ≤ 1024px (tablet uses mobile layout) ══ */
  @media (max-width: 1024px) {
  .item-modal-box {min-height: 60vh;max-width: 80vh;}
    .nav-signin { display: none; }
    .sidebar { position: fixed; top: 72px; left: 0; height: calc(100vh - 72px); transform: translateX(-100%); box-shadow: 6px 0 32px rgba(0,0,0,0.1); z-index: 149; width: 250px; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.visible { display: block; }
    .mobile-cat-bar { display: flex; }
    .burger { display: none; }
    .cat-section { scroll-margin-top: 76px; }
    .main-inner { padding: 70px 14px 100px !important; }
    .menu-grid { grid-template-columns: 1fr; }
    .cart-panel { width: 100%; }
    .pop-card { width: 160px; }
    .grid-card-img { width: 150px; height: 150px; }
    .order-row { gap: 8px; }
  }

  /* ══ SMALL ≤ 480px ══ */
  @media (max-width: 480px) {
  .item-modal-box {min-height: 60vh !important;max-height: 86vh !important;}
    .sidebar { width: 220px; }
    .pop-card { width: 148px; }
    .grid-card-img { width: 140px; height: 140px; }
    .main-inner { padding: 66px 12px 100px !important; }
    .cat-section { scroll-margin-top: 76px; }
    .item-modal-img-wrap { height: 220px; }
  }

  /* ══ REDUCED MOTION ══ */
  @media (prefers-reduced-motion: reduce) {
    .pop-card-inner, .grid-card, .cart-checkout-btn, .item-add-btn { transition: none; }
    .pop-card-img, .grid-card-img img { transition: none; }
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
    deliveryFee, setDeliveryFee,
    setDeliveryZone, setDeliveryMinOrder,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [fetchError, setFetchError] = useState(false);
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
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [showMoreDates, setShowMoreDates] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState<1 | 2>(deliveryAddress ? 2 : 1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchParams = useSearchParams();
  const { isOpen, statusMessage, isDeliveryEnabled, isPickupEnabled, storeTimezone, storeName, storeAddress, taxRate, deliveryFee: defaultDeliveryFee } = useStoreSettings();
  const [tzAbbr, setTzAbbr] = useState('ET');
  useEffect(() => {
    try {
      const tz = new Intl.DateTimeFormat('en-US', { timeZone: storeTimezone || 'America/New_York', timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
      if (tz) setTzAbbr(tz);
    } catch {}
  }, [storeTimezone]);

  // Set default order type based on allowed options
  useEffect(() => {
    if (!isPickupEnabled && isDeliveryEnabled) {
      setOrderType('delivery');
    } else if (isPickupEnabled && !isDeliveryEnabled) {
      setOrderType('pickup');
    }
  }, [isPickupEnabled, isDeliveryEnabled]);

  const popularScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mobileCatScrollRef = useRef<HTMLDivElement>(null);
  const mobileCatRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Close More dropdown on click outside
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [showMoreMenu]);

  // Google Maps + Places Autocomplete
  const mapsLoaded = useGoogleMaps();
  const [deliveryError, setDeliveryError] = useState('');
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Init autocomplete when maps loaded and modal opens
  useEffect(() => {
    if (!mapsLoaded || !autocompleteInputRef.current) return;
    cleanupRef.current?.();
    cleanupRef.current = initAutocomplete(autocompleteInputRef.current, (place) => {
      setDeliveryAddress(place.address);
      validateDeliveryAddress(place.lat, place.lng)
        .then(result => {
          if (result.eligible) {
            setDeliveryFee(result.deliveryFee);
            setDeliveryZone(result.zone || '');
            setDeliveryMinOrder(result.minOrder);
            setDeliveryError('');
            setDeliveryStep(2);
          } else {
            setDeliveryError(`Sorry, this address is ${result.distance} miles away — outside our delivery area.`);
          }
        })
        .catch(() => setDeliveryStep(2));
    });
    return () => { cleanupRef.current?.(); cleanupRef.current = null; };
  }, [mapsLoaded, showDeliveryModal]);

  useEffect(() => { setMounted(true); fetchData(); }, [searchParams, menuItems]);

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
      const pId = searchParams.get('productId');
      if (pId && availableItems.length > 0) {
        const item = availableItems.find((i: MenuItem) => i.id === Number(pId));
        if (item) {
          setTimeout(() => {
            openItem(item);
            document.getElementById(`item-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
        }
      }
    }).catch(() => { setLoading(false); setFetchError(true); });
  };

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

  useEffect(() => {
    const container = mobileCatScrollRef.current;
    const activeEl = mobileCatRefs.current[activeCategory];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const targetScrollLeft = container.scrollLeft + elRect.left - containerRect.left - (containerRect.width - elRect.width) / 2;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [activeCategory]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock background scroll when the item modal is open
  useEffect(() => {
    if (!selectedItem) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [selectedItem]);

  const popularItems = menuItems.filter(i => i.isPopular);
  const getItemsByCategory = (catId: number) => catId === 0 ? popularItems : menuItems.filter(i => i.categoryId === catId);
  const filteredItems = search ? menuItems.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase())) : null;

  const getModifierTotal = () => {
    if (!selectedItem?.modifiers) return 0;
    let total = 0;
    selectedItem.modifiers.forEach(group => {
      (selectedModifiers[group.id] || []).forEach(optId => {
        const opt = group.options.find(o => o.id === optId);
        if (opt) total += Number(opt.price);
      });
    });
    return total;
  };

  const openItem = (item: MenuItem) => {
    if (!isOpen) return;
    setSelectedItem(item); setSelectedModifiers({}); setQuantity(1); setSpecialInstructions('');
  };

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
    return selectedItem.modifiers.filter(g => g.required).every(g => (selectedModifiers[g.id] || []).length >= Math.max(g.minSelections, 1));
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
    if (showMobileSearch) { setShowMobileSearch(false); setSearch(''); }
    categoryRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollPopular = (dir: 'left' | 'right') => {
    popularScrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  const getItemPrice = (item: MenuItem) => Number(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);

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
    <div id="order-page" className="order-page">
      <style>{css}</style>
      <a href="#order-main" className="skip-link">Skip to menu</a>

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav id="order-nav" className="order-nav" aria-label="Order page navigation">

        {/* Burger — tablet only */}
        <button id="sidebar-burger" className="burger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle category menu">
          {sidebarOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>

        {/* Logo */}
        <Link href="/" id="nav-logo" className="nav-logo-link" aria-label="Eggs Ok home">
          <div className="nav-logo-img-wrap">
            <img src="/logo.webp" alt="Eggs Ok" height={80} width={80} className="nav-logo-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </Link>

        <div className="nav-spacer" />

        <div id="nav-actions" className="nav-actions">

          {/* More dropdown */}
          <div id="nav-more-wrap" ref={moreMenuRef} className="nav-more-wrap">
            <button id="nav-more-btn" className="nav-more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}>
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showMoreMenu && (
              <>
                <div id="nav-more-dropdown" className="nav-more-dropdown">
                  {moreLinks.map(link => (
                    <Link key={link.href} href={link.href} className="nav-more-link" onClick={() => setShowMoreMenu(false)}>{link.label}</Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sign In */}
          <Link href="/account" id="nav-signin" className="nav-signin">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Sign In
          </Link>

          {/* Cart */}
          <button id="nav-cart-btn" className="nav-cart-btn" onClick={() => setShowCart(true)} aria-label={`Cart, ${mounted ? cartCount : 0} items`}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#4D4D4D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {mounted && cartCount > 0 && (
              <div id="cart-badge" className="nav-cart-badge" aria-hidden="true">{cartCount}</div>
            )}
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          MOBILE CATEGORY BAR (≤768px)
      ══════════════════════════════════════════ */}
      <div id="mobile-cat-bar" className="mobile-cat-bar" role="navigation" aria-label="Menu categories">
        {showMobileSearch ? (
          <div id="mobile-search-bar" className="mobile-search-bar">
            <div className="mobile-search-input-wrap">
              <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="mobile-search-input"
                autoFocus
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mobile-search-input"
                aria-label="Search menu items"
              />
            </div>
            <button id="mobile-search-cancel" className="mobile-search-cancel"
              onClick={() => { setShowMobileSearch(false); setSearch(''); }}>
              Cancel
            </button>
          </div>
        ) : (
          <div id="mobile-cat-scroll" ref={mobileCatScrollRef} className="mobile-cat-scroll">
            {/* Search icon pill */}
            <button id="mobile-search-trigger" className="mobile-search-icon-btn" onClick={() => setShowMobileSearch(true)} aria-label="Search menu">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Search
            </button>
            {/* <div className="mobile-cat-divider" aria-hidden="true" /> */}
            {categories.map(cat => (
                cat.name !== "Popular" && (

                <button
                  key={cat.id}
                  id={`mobile-cat-pill-${cat.id}`}
                  ref={el => { mobileCatRefs.current[cat.id] = el; }}
                  className={`mobile-cat-pill${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => scrollToCategory(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.name}

              </button>
               )
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BODY
      ══════════════════════════════════════════ */}
      <div id="order-body" style={{ display: 'flex', paddingTop: '64px' }}>

        {/* Overlay */}
        <div id="sidebar-overlay" className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

        {/* ── SIDEBAR ── */}
        <aside id="order-sidebar" className={`sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Menu categories">
          <div id="sidebar-search" className="sidebar-search-wrap">
            <div className="sidebar-search-inner">
              <svg className="sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="sidebar-search-input"
                placeholder="Search menu"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="sidebar-search-input"
                aria-label="Search menu items"
              />
            </div>
          </div>

          <div id="sidebar-categories" className="sidebar-menu-wrap">
            
           {categories
  .filter(cat => cat.name !== "Popular")
  .map(cat => (
    <button
      key={cat.id}
      id={`sidebar-cat-${cat.id}`}
      className={`sidebar-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
      onClick={() => scrollToCategory(cat.id)}
      aria-pressed={activeCategory === cat.id}
    >
      <div>{cat.name}</div>
    </button>
))}

          </div>
        </aside>

        {/* ── MAIN ── */}
        <main id="order-main" ref={mainContentRef} className="main-scroll">
          <div id="order-inner" className="main-inner">

            {/* Page header */}
            <header id="order-page-header" className="page-header">
              <h1 id="order-page-title" className="page-title">
                Eggs Ok Menu
              </h1>
              <div id="order-page-meta" className="page-meta">
                <div className="page-meta-location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#4D4D4D" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                  </svg>
                  <span style={{ fontSize: '16px', color: '#4D4D4D' }}>{storeAddress}</span>
                </div>
                <span className="page-meta-dot" aria-hidden="true">·</span>
                <div id="order-store-status" className="page-meta-status" role="status" aria-live="polite">
                  <div className={`status-dot ${isOpen ? 'open' : 'closed'}`} aria-hidden="true" />
                  <span className={`status-text ${isOpen ? 'open' : 'closed'}`}>
                    {isOpen ? statusMessage : 'Closed Now'}
                  </span>
                </div>
              </div>

              {/* Order controls row */}
              <div id="order-controls-row" className="order-row">

                {/* Pickup / Delivery toggle */}
                <div id="order-type-toggle" className="order-type-toggle" role="group" aria-label="Order type">
                  {isPickupEnabled && (
                    <button
                      id="pickup-btn"
                      className={`order-type-btn ${orderType === 'pickup' ? 'active' : 'inactive'}`}
                      onClick={() => setOrderType('pickup')}
                    >
                      Pickup
                    </button>
                  )}
                  {isDeliveryEnabled && (
                    <button
                      id="delivery-btn"
                      className={`order-type-btn ${orderType === 'delivery' ? 'active' : 'inactive'}`}
                      onClick={() => { setOrderType('delivery'); setShowDeliveryModal(true); }}
                    >
                      Delivery
                    </button>
                  )}
                </div>

                {/* Delivery address */}
                {mounted && orderType === 'delivery' && (
                  <button id="delivery-addr-btn" className="delivery-addr-btn" onClick={() => setShowDeliveryModal(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {truncateAddress(deliveryAddress)}
                    </span>
                  </button>
                )}

                {/* Schedule */}
                <button id="schedule-btn" className="schedule-btn" onClick={() => setShowScheduleModal(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  <span id="schedule-label" className="schedule-label">
                    {mounted ? getScheduleLabel() : 'ASAP (15 min)'}
                  </span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

              </div>
            </header>

            {/* Loading Skeleton */}
            {loading && (
              <div style={{ padding: '20px 0' }}>
                <div className="skeleton-line w40" style={{ height: '20px', marginBottom: '16px' }} />
                <div className="menu-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-img" />
                      <div className="skeleton-body">
                        <div className="skeleton-line w80" />
                        <div className="skeleton-line w60" />
                        <div className="skeleton-line w40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fetch Error */}
            {fetchError && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '16px', color: '#FC0301', marginBottom: '12px' }}>Unable to load menu</p>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>Please check your connection and try again.</p>
                <button onClick={() => { setFetchError(false); setLoading(true); fetchData(); }} style={{ padding: '10px 24px', background: 'var(--y)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Retry</button>
              </div>
            )}

            {/* Search results */}
            {search && filteredItems && (
              <div id="search-results" style={{ marginBottom: '48px' }}>
                <p className="search-results-meta">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "<span className="search-term">{search}</span>"
                </p>
                {filteredItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px 0', fontSize: '16px' }}>No items found. Try a different search term.</p>
                ) : (
                  <div id="search-results-grid" className="menu-grid">
                    {filteredItems.map(item => (
                      <div key={item.id} id={`search-item-${item.id}`}>
                        <GridCard item={item} orderType={orderType} onSelect={openItem} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category sections */}
            {!search && categories.map(cat => {
              const items = getItemsByCategory(cat.id);
              if (items.length === 0) return null;
              const isPopular = cat.id === 0;
              return (
                <div
                  key={cat.id}
                  id={`cat-section-${cat.id}`}
                  ref={el => { categoryRefs.current[cat.id] = el; }}
                  className="cat-section"
                >
                  <div className="cat-section-header">
                    <h2 className="cat-section-title">
                      {isPopular
                        ? <><span className="accent">★</span> {cat.name}</>
                        : cat.name
                      }
                    </h2>
                    {isPopular && (
                      <div id="popular-scroll-btns" className="popular-scroll-btns">
                        {(['left', 'right'] as const).map(dir => (
                          <button key={dir} id={`popular-scroll-${dir}`} className="popular-scroll-btn" onClick={() => scrollPopular(dir)} aria-label={`Scroll popular ${dir}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isPopular ? (
                    <div id="popular-scroll-row" ref={popularScrollRef} className="popular-scroll-row" role="list" aria-label="Popular items">
                      {items.map(item => (
                        <div key={item.id} id={`pop-item-${item.id}`} className="pop-card" role="listitem">
                          <PopularCard item={item} orderType={orderType} onSelect={openItem} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id={`menu-grid-cat-${cat.id}`} className="menu-grid" role="list" aria-label={`${cat.name} items`}>
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
                        return (
                          <div key={item.id} id={`item-${item.id}`} role="listitem">
                            <GridCard item={item} orderType={orderType} onSelect={openItem} borderRadius={br} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════
          CART PANEL
      ══════════════════════════════════════════ */}
      {showCart && (
        <>
          <div id="cart-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 400 }} onClick={() => setShowCart(false)} />
          <div id="cart-panel" className="cart-panel" role="dialog" aria-label="Shopping cart" aria-modal="true">

            <div id="cart-header" className="cart-header">
              <h3 className="cart-title">Cart</h3>
              <button id="cart-close-btn" className="cart-close-btn" onClick={() => setShowCart(false)} aria-label="Close cart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div id="cart-type-section" className="cart-type-wrap">
              <div id="cart-type-toggle" className="cart-type-toggle" role="group" aria-label="Order type">
                {(['pickup', 'delivery'] as const).filter(type => type === 'pickup' ? isPickupEnabled : isDeliveryEnabled).map(type => (
                  <button
                    key={type}
                    id={`cart-type-${type}`}
                    className={`cart-type-btn ${orderType === type ? 'active' : 'inactive'}`}
                    onClick={() => setOrderType(type)}
                  >
                    {type === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                ))}
              </div>
            </div>

            <div id="cart-body" className="cart-body">
              {cart.length === 0 ? (
                <div id="cart-empty" className="cart-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D0D0D0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <p className="cart-empty-title">Your cart is empty</p>
                  <p className="cart-empty-sub">Add items to get started</p>
                </div>
              ) : cart.map(cartItem => (
                <div key={cartItem.id} id={`cart-item-${cartItem.id}`} className="cart-item">
                  <div className="cart-item-top">
                    <p className="cart-item-name">{cartItem.item.name}</p>
                    <p className="cart-item-price">${(getPrice(cartItem.item) * cartItem.quantity).toFixed(2)}</p>
                  </div>
                  {cartItem.item.modifiers && (
                    <div className="cart-item-modifiers">
                      {cartItem.item.modifiers.map(group =>
                        (cartItem.selectedModifiers[group.id] || []).map(optId => {
                          const opt = group.options.find(o => o.id === optId);
                          if (!opt) return null;
                          return (
                            <div key={`${group.id}-${optId}`} className="cart-modifier-row">
                              <p className="cart-modifier-name">+ {opt.name}</p>
                              <p className="cart-modifier-price">${(Number(opt.price) * cartItem.quantity).toFixed(2)}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  <div className="cart-item-controls">
                    <div className="cart-qty-wrap">
                      <button className="cart-qty-btn cart-qty-dec" onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <span className="cart-qty-val" aria-label={`Quantity: ${cartItem.quantity}`}>{cartItem.quantity}</span>
                      <button className="cart-qty-btn cart-qty-inc" onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(cartItem.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div id="cart-footer" className="cart-footer">
                <div className="cart-summary-row"><span className="cart-summary-label">Subtotal</span><span className="cart-summary-val">${cartTotal.toFixed(2)}</span></div>
                {/* {orderType === 'delivery' && <div className="cart-summary-row"><span className="cart-summary-label">Delivery fee</span><span className="cart-summary-val">${(deliveryFee || defaultDeliveryFee).toFixed(2)}</span></div>}
                <div className="cart-summary-row"><span className="cart-summary-label">Tax</span><span className="cart-summary-val">${(cartTotal * taxRate).toFixed(2)}</span></div>
                <div className="cart-total-row">
                  <span className="cart-total-label">Total</span>
                  <span className="cart-total-val">${(cartTotal + (orderType === 'delivery' ? (deliveryFee || defaultDeliveryFee) : 0) + cartTotal * taxRate).toFixed(2)}</span>
                </div> */}
                <Link id="cart-checkout-btn" href="/checkout" className="cart-checkout-btn" onClick={() => setShowCart(false)}>
                  Checkout →
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          DELIVERY MODAL
      ══════════════════════════════════════════ */}
      {showDeliveryModal && (
        <div id="delivery-modal-backdrop" className="modal-backdrop" onClick={() => setShowDeliveryModal(false)}>
          <div id="delivery-modal" className="delivery-modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-label="Order details" aria-modal="true">
            <div className="delivery-modal-inner">
              <div id="delivery-modal-header" className="delivery-modal-header">
                <h2 className="modal-title">Order Details</h2>
                <button id="delivery-modal-close" className="modal-close-btn" onClick={() => setShowDeliveryModal(false)} aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div id="delivery-type-toggle" className="delivery-type-toggle" role="group" aria-label="Order type">
                {(['pickup', 'delivery'] as const).filter(type => type === 'pickup' ? isPickupEnabled : isDeliveryEnabled).map(type => (
                  <button
                    key={type}
                    id={`delivery-modal-type-${type}`}
                    className={`delivery-type-btn ${orderType === type ? 'active' : 'inactive'}`}
                    onClick={() => { setOrderType(type); if (type === 'pickup') setShowDeliveryModal(false); }}
                  >
                    {type === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                ))}
              </div>

              {deliveryStep === 1 && (
                <div id="delivery-step-1">
                  <div className="delivery-input-wrap">
                    <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      id="delivery-address-input"
                      ref={autocompleteInputRef}
                      placeholder="Enter delivery address..."
                      defaultValue={deliveryAddress}
                      onChange={e => { setDeliveryAddress(e.target.value); setDeliveryError(''); }}
                      autoFocus
                      className="delivery-input"
                      aria-label="Delivery address"
                    />
                    {deliveryAddress && (
                      <button className="delivery-input-clear" onClick={() => { setDeliveryAddress(''); setDeliveryError(''); if (autocompleteInputRef.current) autocompleteInputRef.current.value = ''; }}>Clear</button>
                    )}
                  </div>
                  {deliveryError && (
                    <div style={{ marginTop: '8px', padding: '10px 14px', background: '#FC030115', border: '1px solid #FC030140', borderRadius: '10px' }}>
                      <p style={{ fontSize: '14px', color: '#FC0301', fontWeight: '500' }}>{deliveryError}</p>
                    </div>
                  )}
                  {!mapsLoaded && deliveryAddress.length > 2 && (
                    <div id="delivery-suggestion" className="delivery-suggestion">
                      <div className="delivery-suggestion-row" onClick={() => setDeliveryStep(2)}>
                        <p className="delivery-suggestion-name">{deliveryAddress}</p>
                        <p className="delivery-suggestion-city">Philadelphia, PA</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deliveryStep === 2 && (
                <div id="delivery-step-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div id="delivery-addr-row" className="delivery-addr-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span style={{ flex: 1, fontSize: '16px', color: '#1A1A1A', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryAddress}</span>
                    <button className="delivery-addr-change" onClick={() => setDeliveryStep(1)}>Change</button>
                  </div>

                  <div id="delivery-apt-field">
                    <label htmlFor="delivery-apt-input" className="delivery-field-label">Apt / Suite / Floor</label>
                    <input id="delivery-apt-input" placeholder="Apt 4B, Suite 200…" value={deliveryApt} onChange={e => setDeliveryApt(e.target.value)} className="delivery-field-input" />
                  </div>

                  <div id="delivery-instructions-field">
                    <label htmlFor="delivery-instructions-input" className="delivery-field-label">Delivery instructions</label>
                    <textarea id="delivery-instructions-input" placeholder="Leave at front door, don't ring the bell…" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} className="delivery-field-textarea" />
                  </div>

                  <div id="delivery-from-box" className="delivery-from-box">
                    <p className="delivery-from-label">Delivering from</p>
                    <div className="delivery-from-name-row">
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>{storeName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#FC0301' }} />
                        <span style={{ fontSize: '14px', color: isOpen ? '#22C55E' : '#FC0301', fontWeight: '600' }}>{isOpen ? statusMessage : 'Closed Now'}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#AAAAAA', marginTop: '2px' }}>{storeAddress}</p>
                  </div>

                  <button id="deliver-asap-btn" className="delivery-btn-primary" onClick={() => { setScheduleType('asap'); setShowDeliveryModal(false); }}>
                    Deliver ASAP
                  </button>
                  <button id="schedule-delivery-btn" className="delivery-btn-secondary" onClick={() => { setShowDeliveryModal(false); setShowScheduleModal(true); }}>
                    Schedule delivery
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SCHEDULE MODAL
      ══════════════════════════════════════════ */}
      {showScheduleModal && (
        <div id="schedule-modal-backdrop" className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div id="schedule-modal" className="schedule-modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-label="Order time" aria-modal="true">

            <div id="schedule-modal-header" className="schedule-modal-header">
              <h2 className="modal-title">Order Time</h2>
              <button id="schedule-modal-close" className="modal-close-btn" onClick={() => setShowScheduleModal(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div id="schedule-dates-section" className="schedule-dates-wrap">
              {(() => {
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() + i * 86400000);
                  return { label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }), sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
                });
                const visibleDays = showMoreDates ? days : days.slice(0, 2);
                const selectedVal = scheduleDate || days[0].value;
                return (
                  <>
                    <div id="schedule-dates-grid" className="schedule-dates-grid">
                      {visibleDays.map(d => (
                        <button
                          key={d.value}
                          id={`schedule-date-${d.value}`}
                          className={`schedule-date-btn ${selectedVal === d.value ? 'active' : 'inactive'}`}
                          onClick={() => setScheduleDate(d.value)}
                        >
                          <p className={`schedule-date-label ${selectedVal === d.value ? 'active' : 'inactive'}`}>{d.label}</p>
                          <p className={`schedule-date-sub ${selectedVal === d.value ? 'active' : ''}`}>{d.sub}</p>
                        </button>
                      ))}
                    </div>
                    <button id="schedule-more-dates-btn" className="schedule-more-btn" onClick={() => setShowMoreDates(p => !p)}>
                      {showMoreDates ? 'Less dates' : 'More dates'}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5">
                        <polyline points={showMoreDates ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
                      </svg>
                    </button>
                  </>
                );
              })()}
            </div>

            <div id="schedule-times-list" className="schedule-times-list">
              {/* ASAP option */}
              <div id="schedule-asap-row" className="schedule-time-row" onClick={() => { setScheduleType('asap'); setScheduleTime(''); }}>
                <div className={`schedule-radio ${scheduleType === 'asap' ? 'selected' : 'unselected'}`}>
                  {scheduleType === 'asap' && <div className="schedule-radio-inner" />}
                </div>
                <span className="schedule-time-label">ASAP</span>
              </div>

              {/* Time slots */}
              {Array.from({ length: 57 }, (_, i) => {
                const totalMins = 7 * 60 + i * 15; const h = Math.floor(totalMins / 60); const m = totalMins % 60;
                const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} ${tzAbbr}`;
                const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const isSelected = scheduleType === 'scheduled' && scheduleTime === val;
                return (
                  <div key={val} id={`schedule-time-${val}`} className="schedule-time-row" onClick={() => { setScheduleType('scheduled'); setScheduleTime(val); }}>
                    <div className={`schedule-radio ${isSelected ? 'selected' : 'unselected'}`}>
                      {isSelected && <div className="schedule-radio-inner" />}
                    </div>
                    <span className="schedule-time-label">{label}</span>
                  </div>
                );
              })}
            </div>

            <div id="schedule-modal-footer" className="schedule-modal-footer">
              <button id="schedule-confirm-btn" className="schedule-confirm-btn" onClick={() => setShowScheduleModal(false)}>
                {scheduleType === 'asap' ? 'Order ASAP' : `Schedule for ${scheduleTime}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ITEM MODAL
      ══════════════════════════════════════════ */}
      {selectedItem && (
        <div id="item-modal-backdrop" className="item-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div id="item-modal" className="item-modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-label={selectedItem.name} aria-modal="true">

            {/* Sticky close (stays top-right while scrolling) */}
            <button id="item-modal-close" className="item-modal-close" onClick={() => setSelectedItem(null)} aria-label="Close item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Image */}
            <div id="item-modal-img-wrap" className="item-modal-img-wrap">
              {selectedItem.imageUrl
                ? <img src={selectedItem.imageUrl} alt={selectedItem.name} className="item-modal-img" />
                : <div className="item-modal-img-placeholder">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
                </div>
              }
              {selectedItem.isPopular && (
                <div id="item-popular-badge" className="item-popular-badge" aria-label="Popular item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#000"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  POPULAR
                </div>
              )}
            </div>

            <div id="item-modal-body" className="item-modal-body">
              <h2 id="item-modal-name" className="item-modal-name">{selectedItem.name}</h2>
              <p id="item-modal-desc" className="item-modal-desc">{selectedItem.description}</p>

              {/* Price cards */}
              <div id="item-price-row" className="item-price-row" style={{display:'none'}}>
                {(['pickup', 'delivery'] as const).filter(type => type === 'pickup' ? isPickupEnabled : isDeliveryEnabled).map(type => (
                  <div
                    key={type}
                    id={`item-price-${type}`}
                    className={`item-price-card ${orderType === type ? 'active' : 'inactive'}`}
                    onClick={() => setOrderType(type)}
                    role="button"
                    aria-pressed={orderType === type}
                  >
                    <p className="item-price-type">{type}</p>
                    <p className={`item-price-val ${orderType === type ? 'active' : 'inactive'}`}>
                      ${Number(type === 'pickup' ? selectedItem.pickupPrice : selectedItem.deliveryPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Modifier groups */}
              {selectedItem.modifiers?.map(group => (
                <div key={group.id} id={`modifier-group-${group.id}`} className="modifier-group">
                  <div className="modifier-group-header">
                    <p className="modifier-group-name">{group.name}</p>
                    <span className={`modifier-badge ${group.required ? 'required' : 'optional'}`}>
                      {group.required ? 'Required' : 'Optional'} · {group.maxSelections === 1 ? 'Choose 1' : `Up to ${group.maxSelections}`}
                    </span>
                  </div>
                  <div id={`modifier-options-${group.id}`} className="modifier-options">
                    {group.options.map(opt => {
                      const isSel = (selectedModifiers[group.id] || []).includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          id={`modifier-option-${opt.id}`}
                          className={`modifier-option ${isSel ? 'selected' : 'unselected'}`}
                          onClick={() => toggleModifier(group.id, opt.id, group.maxSelections)}
                          role="checkbox"
                          aria-checked={isSel}
                        >
                          <div className="modifier-option-left">
                            <div className={`modifier-check ${group.maxSelections === 1 ? 'radio' : 'checkbox'} ${isSel ? 'selected' : 'unselected'}`}>
                              {isSel && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <span className="modifier-option-name">{opt.name}</span>
                          </div>
                          <span className={`modifier-option-price ${Number(opt.price) > 0 ? 'paid' : 'free'}`}>
                            {Number(opt.price) > 0 ? `+$${Number(opt.price).toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div id="item-instructions" style={{ marginBottom: '28px' }}>
                <p className="item-instructions-label">Special Instructions</p>
                <textarea
                  id="item-instructions-input"
                  placeholder="Add a note (extra sauce, no onions, etc.)"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  className="item-instructions-input"
                />
              </div>

              {/* Upsell */}
              {menuItems.filter(i => i.id !== selectedItem.id && i.categoryId === selectedItem.categoryId).length > 0 && (
                <div id="item-upsell" className="upsell-section">
                  <p className="upsell-label">You might also like</p>
                  <div id="upsell-row" className="upsell-row">
                    {menuItems.filter(i => i.id !== selectedItem.id && i.categoryId === selectedItem.categoryId).slice(0, 4).map(item => (
                      <div key={item.id} id={`upsell-${item.id}`} className="upsell-card" onClick={() => openItem(item)}>
                        <div className="upsell-card-img">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} />
                            : <svg width="28" height="28" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
                          }
                        </div>
                        <div className="upsell-card-body">
                          <p className="upsell-card-name">{item.name}</p>
                          <p className="upsell-card-price">
                            ${Number(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart row */}
              <div id="item-add-row" className="item-add-row">
                <div id="item-qty-wrap" className="item-qty-wrap">
                  <button id="item-qty-dec" className="item-qty-btn item-qty-dec" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span id="item-qty-val" className="item-qty-val" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
                  <button id="item-qty-inc" className="item-qty-btn item-qty-inc" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button
                  id="item-add-btn"
                  className={`item-add-btn ${canAddToCart() ? 'enabled' : 'disabled'}`}
                  onClick={handleAddToCart}
                  disabled={!canAddToCart()}
                >
                  Add to cart · ${((getItemPrice(selectedItem) + getModifierTotal()) * quantity).toFixed(2)} 
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
    <Suspense fallback={
      <div style={{ background: '#F8F9FA', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#AAAAAA', letterSpacing: '-0.5px' }}>
        LOADING MENU…
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}

/* ──────────────────────────────────────────────
   POPULAR CARD
────────────────────────────────────────────── */
function PopularCard({ item, orderType, onSelect }: { item: MenuItem; orderType: 'pickup' | 'delivery'; onSelect: (item: MenuItem) => void }) {
  const price = Number(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);
  return (
    <div id={`popular-card-${item.id}`} className="pop-card-inner" onClick={() => onSelect(item)}>
      <div className="pop-card-img-wrap">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="pop-card-img" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#E5E5E5,#F8F9FA)' }}>
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
          </div>
        }
        {item.isPopular && (
          <div className="pop-card-popular-badge" aria-label="Popular item">★ HOT</div>
        )}
        <div className="pop-card-add-btn" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>
      <div className="pop-card-body">
        <p className="pop-card-name">{item.name}</p>
        <p className="pop-card-price">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   GRID CARD
────────────────────────────────────────────── */
function GridCard({ item, orderType, onSelect, borderRadius }: { item: MenuItem; orderType: 'pickup' | 'delivery'; onSelect: (item: MenuItem) => void; borderRadius?: string }) {
  const price = Number(orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice);
  return (
    <div
      id={`grid-card-${item.id}`}
      className="grid-card"
    style={{ borderRadius: '8px' }}
      onClick={() => onSelect(item)}
    >
      <div className="grid-card-body">
        <p className="grid-card-name">{item.name}</p>
        <p className="grid-card-price">${price.toFixed(2)}</p>
        <p className="grid-card-desc">{item.description}</p>
      </div>
      <div className="grid-card-img-wrap">
        <div className="grid-card-img">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} />
            : <svg width="36" height="36" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#D0D0D0" strokeWidth="1.5"/><path d="M20 32 Q32 20 44 32" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/><circle cx="32" cy="38" r="6" stroke="#D0D0D0" strokeWidth="1.5"/></svg>
          }
        </div>
        <div className="grid-card-add-btn" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>
    </div>
  );
}