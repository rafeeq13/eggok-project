'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on click outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [userMenuOpen]);

  // Close "More" dropdown on any click outside it
  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [moreOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const moreLinks = [
    // { label: 'Our Story', href: '/story' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Gift Cards', href: '/gift-cards' },
    { label: 'Track My Order', href: '/track' },
    // { label: "We're Hiring", href: '/hiring' },
  ];
const css = `
  .navLink:hover{
  color:#000000 !important;
  background: #F0F0F0 !important;
  }
  .navLink.active{
  background: #F0F0F0 !important;
  color:#000000 !important;
  font-weight: 600 !important;
  }
`
  return (
    <>
      <style>{css}</style>
      <header className="header-wrap" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.98)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #E5E5E5' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div className="header-inner" style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="header-logo" style={{  borderRadius: '10px', overflow: 'hidden', background: 'transparent', flexShrink: 0 }}>
              <Image src="/logo.svg" alt="EggsOK Eatery" width={135} height={60} style={{ objectFit: 'contain' }} />
            </div>
            <div>
              {/* <p style={{ fontSize: '17px', fontWeight: '800', color: '#E5B800', letterSpacing: '1px', fontFamily: 'DM Sans, sans-serif' }}>EggsOK</p>
              <p style={{ fontSize: '10px', color: '#888888', letterSpacing: '1px' }}>EATERY WEST PHILLY</p> */}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile nav-desktop-gap">
            <Link href="/" className={`navLink${pathname === '/' ? ' active' : ''}`} style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s' }}
            >Home</Link>

            <Link href="/story" className={`navLink${pathname === '/story' ? ' active' : ''}`} style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s' }}
            >Our Story</Link>

            <Link href="/hiring" className={`navLink${pathname === '/hiring' ? ' active' : ''}`} style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s' }}
            >We're Hiring</Link>

            <Link href="/order" className={`navLink${pathname === '/order' ? ' active' : ''}`} style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s' }}
            >Menu</Link>

            <Link href="/catering" className={`navLink${pathname === '/catering' ? ' active' : ''}`} style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s' }}
            >Catering</Link>

            {/* More Dropdown — hover to open */}
            <div ref={moreRef} style={{ position: 'relative' }}
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
              className={`navLink${['/contact', '/gift-cards', '/track'].includes(pathname) ? ' active' : ''}`}
                style={{ padding: '8px 14px', color: '#333333', fontSize: '14px', fontWeight: '500', borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent' }}
              >
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={moreOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
              </button>
              {moreOpen && (
                <>
                  <div style={{
                    position: 'absolute', top: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    paddingTop: '8px',
                  }}>
                    <div style={{
                      background: '#FFFFFF', border: '1px solid #E5E5E5',
                      borderRadius: '12px', padding: '8px', zIndex: 20,
                      minWidth: '180px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                      {moreLinks.map(link => (
                        <Link key={link.href} className="navLink" href={link.href} onClick={() => setMoreOpen(false)} style={{
                          display: 'block', padding: '10px 14px',
                          color: '#333333', fontSize: '14px', borderRadius: '8px',
                          transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1A1A1A'; (e.currentTarget as HTMLAnchorElement).style.background = '#F5F5F5'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#333333'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                        >{link.label}</Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Auth / Account */}
            {mounted && user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    padding: '9px 18px', color: '#333333', fontSize: '14px',
                    fontWeight: '600', borderRadius: '8px',
                    border: '1px solid #E5B80040', background: 'rgba(254, 216, 0, 0.08)',
                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(254, 216, 0, 0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(254, 216, 0, 0.08)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {user.name.split(' ')[0]}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points={userMenuOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#FFFFFF', border: '1px solid #E5E5E5',
                    borderRadius: '12px', padding: '8px', zIndex: 20,
                    minWidth: '170px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                      color: '#333333', fontSize: '14px', borderRadius: '8px',
                      transition: 'all 0.15s', textDecoration: 'none',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#000000'; e.currentTarget.style.background = '#F5F5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#333333'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      My Account
                    </Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                      color: '#333333', fontSize: '14px', borderRadius: '8px',
                      transition: 'all 0.15s', background: 'transparent', border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#FC0301'; e.currentTarget.style.background = '#F5F5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#333333'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/account" style={{
                padding: '9px 18px', color: '#1A1A1A', fontSize: '14px',
                fontWeight: '600', borderRadius: '8px',
                border: '1px solid #D0D0D0', background: 'transparent',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A'; (e.currentTarget as HTMLAnchorElement).style.color = '#000000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#D0D0D0'; (e.currentTarget as HTMLAnchorElement).style.color = '#1A1A1A'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Sign In
              </Link>
            )}

            {/* Order Now */}
            <Link href="/order" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', marginLeft: '4px' }}>
              Order Now
            </Link>

            {/* Cart */}
            <Link href="/order"  style={{
              position: 'relative', width: '42px', height: '42px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F5F5F5', borderRadius: '10px', border: '1px solid #E5E5E5',
              marginLeft: '4px',
            }}>
              <svg width="18"  className="navLink" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" />
              </svg>
              {mounted && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '20px', height: '20px',
                  background: '#E5B800', borderRadius: '50%',
                  fontSize: '12px', fontWeight: '700', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-desktop">
            <Link href="/account" style={{
              width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: user ? 'rgba(254, 216, 0, 0.08)' : '#F5F5F5',
              border: user ? '1px solid #E5B80040' : '1px solid #E5E5E5',
              borderRadius: '8px', color: user ? '#333333' : '#333333'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link href="/order" style={{ position: 'relative', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6" />
              </svg>
              {mounted && cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', background: '#E5B800', borderRadius: '50%', fontSize: '12px', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '8px', color: '#333333', fontSize: '18px' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 101, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
          {/* Mobile Menu Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.svg" alt="EggsOK Eatery" width={100} height={44} style={{ objectFit: 'contain' }} />
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#333333', fontSize: '22px' }}>
              ✕
            </button>
          </div>

          {/* Mobile Menu Links */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {!user && (
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '16px 24px', fontSize: '16px', fontWeight: '500', color: '#333333', textDecoration: 'none', borderBottom: '1px solid #F5F5F5' }}>
                Sign in
              </Link>
            )}
            {user && (
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '16px 24px', fontSize: '16px', fontWeight: '500', color: '#333333', textDecoration: 'none', borderBottom: '1px solid #F5F5F5' }}>
                My Account
              </Link>
            )}
            {[
              { label: 'Menu', href: '/order' },
              { label: 'Catering', href: '/catering' },
              { label: 'Our Story', href: '/story' },
              { label: "We're Hiring", href: '/hiring' },
              { label: 'Gift Cards', href: '/gift-cards' },
              { label: 'Contact Us', href: '/contact' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block', padding: '16px 24px',
                  fontSize: '16px', fontWeight: '500', color: '#333333',
                  textDecoration: 'none', borderBottom: '1px solid #F5F5F5',
                  background: pathname === item.href ? '#F5F5F5' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
            {mounted && user && (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ display: 'block', width: '100%', padding: '16px 24px', fontSize: '16px', fontWeight: '500', color: '#FC0301', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', fontFamily: 'inherit' }}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <div className="header-spacer" style={{ height: '80px' }} />
    </>
  );
}