'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const moreLinks = [
    { label: 'Our Story', href: '/story' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Gift Cards', href: '/gift-cards' },
    { label: "We're Hiring", href: '/hiring' },
  ];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1A1A1A' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
              <Image src="/logo.svg" alt="Eggs Ok" width={44} height={44} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: '800', color: '#FED800', letterSpacing: '1px', fontFamily: 'Bebas Neue, sans-serif' }}>EGGS OK</p>
              <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px' }}>PHILADELPHIA</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile">
            <Link href="/" style={{ padding: '8px 14px', color: '#888888', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FEFEFE'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffffffff'}
            >Home</Link>

            <Link href="/order" style={{ padding: '8px 14px', color: '#888888', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FEFEFE'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffffffff'}
            >Menu</Link>

            <Link href="/catering" style={{ padding: '8px 14px', color: '#888888', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FEFEFE'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffffffff'}
            >Catering</Link>

            {/* More Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                style={{ padding: '8px 14px', color: '#888888', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#FEFEFE'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#ffffffff'}
              >
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={moreOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
              </button>
              {moreOpen && (
                <>
                  <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#111111', border: '1px solid #2A2A2A',
                    borderRadius: '12px', padding: '8px', zIndex: 20,
                    minWidth: '180px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}>
                    {moreLinks.map(link => (
                      <Link key={link.href} href={link.href} onClick={() => setMoreOpen(false)} style={{
                        display: 'block', padding: '10px 14px',
                        color: '#888888', fontSize: '14px', borderRadius: '8px',
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FEFEFE'; (e.currentTarget as HTMLAnchorElement).style.background = '#1A1A1A'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888888'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                      >{link.label}</Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sign In */}
            <Link href="/account" style={{
              padding: '9px 18px', color: '#FEFEFE', fontSize: '14px',
              fontWeight: '600', borderRadius: '8px',
              border: '1px solid #2A2A2A', background: 'transparent',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FED800'; (e.currentTarget as HTMLAnchorElement).style.color = '#FED800'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLAnchorElement).style.color = '#FEFEFE'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Sign In
            </Link>

            {/* Order Now */}
            <Link href="/order" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', marginLeft: '4px' }}>
              Order Now
            </Link>

            {/* Cart */}
            <Link href="/order" style={{
              position: 'relative', width: '42px', height: '42px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#111111', borderRadius: '10px', border: '1px solid #1A1A1A',
              marginLeft: '4px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '20px', height: '20px',
                  background: '#FED800', borderRadius: '50%',
                  fontSize: '11px', fontWeight: '700', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-desktop">
            <Link href="/account" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111', borderRadius: '8px', color: '#FEFEFE' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <Link href="/order" style={{ position: 'relative', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', background: '#FED800', borderRadius: '50%', fontSize: '10px', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111', borderRadius: '8px', color: '#FEFEFE', fontSize: '18px' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', top: '20px', right: '24px', color: '#888888', fontSize: '24px', background: 'transparent' }}>✕</button>
          <div style={{ width: '70px', height: '70px', borderRadius: '16px', overflow: 'hidden', marginBottom: '8px' }}>
            <Image src="/logo.svg" alt="Eggs Ok" width={70} height={70} style={{ objectFit: 'contain' }} />
          </div>
          {[
            { label: 'Home', href: '/' },
            { label: 'Menu', href: '/order' },
            { label: 'Catering', href: '/catering' },
            { label: 'Our Story', href: '/story' },
            { label: 'Contact', href: '/contact' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '32px', fontWeight: '800', color: '#ffffffff', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              {item.label}
            </Link>
          ))}
          <Link href="/order" onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '8px', padding: '14px 40px', background: '#FED800', borderRadius: '12px', fontSize: '18px', fontWeight: '700', color: '#000', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            ORDER NOW
          </Link>
        </div>
      )}

      <div style={{ height: '70px' }} />
    </>
  );
}