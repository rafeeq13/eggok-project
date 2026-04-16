'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

function ReviewContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [orderType, setOrderType] = useState('Pickup');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: name, email, rating, title, body, orderType, orderId: orderId || `WEB-${Date.now()}`, status: 'Pending' }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: '#F8F9FA', border: '1px solid #D0D0D0', borderRadius: '10px', color: '#1A1A1A', fontSize: '14px', outline: 'none' };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Header />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '100px 20px 60px' }}>

        {submitted ? (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#22C55E20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Thank You!</h1>
            <p style={{ color: '#777777', fontSize: '14px', marginBottom: '24px' }}>Your review has been submitted. We appreciate your feedback!</p>
            <Link href="/order" style={{ padding: '12px 28px', background: '#E5B800', borderRadius: '10px', color: '#000', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>Order Again</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Leave a Review</h1>
            <p style={{ color: '#777777', fontSize: '14px', marginBottom: '28px' }}>We'd love to hear about your experience at Eggs Ok</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rating */}
              <div>
                <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '8px' }}>Rating *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: star <= (hoverRating || rating) ? '#E5B800' : '#D0D0D0', transition: 'color 0.15s' }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '6px' }}>Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '6px' }}>Email *</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@gmail.com" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '6px' }}>Order Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Pickup', 'Delivery'].map(t => (
                    <button key={t} type="button" onClick={() => setOrderType(t)} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                      background: orderType === t ? '#E5B80020' : '#F8F9FA',
                      border: orderType === t ? '1px solid #E5B800' : '1px solid #D0D0D0',
                      color: orderType === t ? '#1A1A1A' : '#777777', fontSize: '13px', fontWeight: '600',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '6px' }}>Review Title *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Great food and fast service!" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#777777', display: 'block', marginBottom: '6px' }}>Your Review *</label>
                <textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us about your experience..." style={{ ...inputStyle, height: '120px', resize: 'none' }} />
              </div>

              {error && <p style={{ color: '#FC0301', fontSize: '13px', margin: 0 }}>{error}</p>}

              <button type="submit" disabled={submitting} style={{
                padding: '14px', background: submitting ? '#E5E5E5' : '#E5B800', border: 'none',
                borderRadius: '10px', color: submitting ? '#777777' : '#000', fontSize: '15px', fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense fallback={<div style={{ background: '#FFFFFF', minHeight: '100vh' }} />}><ReviewContent /></Suspense>;
}
