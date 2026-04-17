'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');

    try {
      const res = await fetch(`${API}/orders/track?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error('Failed to search');
      const match = await res.json();

      if (match && match.id) {
        router.push(`/order-tracking?id=${match.id}`);
      } else {
        setError('No order found. Check your order number or email and try again.');
      }
    } catch {
      setError('Unable to search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '120px 20px 60px', textAlign: 'center' }}>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(254,216,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Track Your Order</h1>
        <p style={{ color: '#777777', fontSize: '14px', marginBottom: '28px' }}>Enter your order number or email to see your order status</p>

        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setError(''); }}
            placeholder="Order number (EO-123456-789) or email"
            style={{
              padding: '14px 18px', background: '#F8F9FA', border: '1px solid #D0D0D0',
              borderRadius: '12px', color: '#1A1A1A', fontSize: '15px', textAlign: 'center', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#E5B800'}
            onBlur={e => e.target.style.borderColor = '#D0D0D0'}
          />

          {error && <p style={{ color: '#FC0301', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button type="submit" disabled={searching || !query.trim()} style={{
            padding: '14px', background: searching ? '#E5E5E5' : '#E5B800', border: 'none',
            borderRadius: '12px', color: searching ? '#777777' : '#000', fontSize: '15px', fontWeight: '700',
            cursor: searching ? 'not-allowed' : 'pointer',
          }}>
            {searching ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '24px' }}>
          Your order number was included in your confirmation email
        </p>
      </div>
    </div>
  );
}
