'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

export default function GiftCardsPage() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const presetAmounts = [10, 25, 50, 100];
  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#111111', border: '1px solid #1A1A1A',
    borderRadius: '10px', color: '#FEFEFE',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const,
    color: '#CACACA', display: 'block' as const,
    marginBottom: '6px',
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg, #000 0%, #1A1100 100%)', borderBottom: '1px solid #1A1A1A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80015 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Gift Cards</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: '#FEFEFE', lineHeight: '0.95', marginBottom: '20px' }}>
            GIVE THE GIFT<br /><span style={{ color: '#FED800' }}>OF BREAKFAST</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#888888', maxWidth: '500px', lineHeight: '1.7' }}>
            Share the love with an Eggs Ok gift card. Perfect for friends, family, and coworkers who deserve a great meal.
          </p>
        </div>
      </section>

      {/* Main */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'flex-start' }}>

          {/* Left — Gift Card Visual + Amount */}
          <div>
            {/* Card Visual */}
            <div style={{ background: 'linear-gradient(135deg, #FED800 0%, #E5C200 100%)', borderRadius: '20px', padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden', aspectRatio: '1.6' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#00000060', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Eggs Ok Gift Card</p>
                <p style={{ fontSize: '48px', fontFamily: 'Bebas Neue, sans-serif', color: '#000', lineHeight: '1', marginBottom: '4px' }}>
                  ${finalAmount > 0 ? finalAmount : '00'}
                </p>
                <p style={{ fontSize: '12px', color: '#00000060' }}>3517 Lancaster Ave · Philadelphia PA</p>
              </div>
              <div style={{ position: 'absolute', bottom: '24px', right: '24px' }}>
                <p style={{ fontSize: '28px', fontFamily: 'Bebas Neue, sans-serif', color: '#00000040', letterSpacing: '2px' }}>EGGS OK</p>
              </div>
            </div>

            {/* Amount Selection */}
            <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '14px' }}>Select Amount</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {presetAmounts.map(a => (
                  <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }} style={{
                    padding: '12px', borderRadius: '10px', fontSize: '16px', fontWeight: '700',
                    background: amount === a && !customAmount ? '#FED800' : '#0A0A0A',
                    color: amount === a && !customAmount ? '#000' : '#888888',
                    border: `1px solid ${amount === a && !customAmount ? '#FED800' : '#1A1A1A'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>${a}</button>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Custom Amount ($)</label>
                <input type="number" min="5" max="500" style={{ ...inputStyle, background: '#0A0A0A' }}
                  placeholder="Enter amount (min $5)"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                />
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div style={{ padding: '48px 28px', background: '#111111', border: '1px solid #22C55E30', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22C55E15', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '28px', color: '#FEFEFE', marginBottom: '12px' }}>GIFT CARD SENT!</h3>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '6px' }}>A ${finalAmount} gift card has been sent to</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#FED800', marginBottom: '20px' }}>{recipientEmail}</p>
                <p style={{ fontSize: '13px', color: '#888888', marginBottom: '28px' }}>Note: Gift cards will be fully activated once backend is connected.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={() => setSubmitted(false)} style={{ padding: '11px 20px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>Send Another</button>
                  <Link href="/" style={{ padding: '11px 20px', background: '#FED800', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: '700' }}>Back to Home</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '28px' }}>
                <h2 style={{ fontSize: '24px', fontFamily: 'Bebas Neue, sans-serif', color: '#FEFEFE', marginBottom: '20px', letterSpacing: '1px' }}>GIFT CARD DETAILS</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Recipient Name *</label>
                    <input style={inputStyle} placeholder="Who is this for?" required
                      value={recipientName} onChange={e => setRecipientName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Recipient Email *</label>
                    <input type="email" style={inputStyle} placeholder="Their email address" required
                      value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input style={inputStyle} placeholder="From who?" required
                      value={senderName} onChange={e => setSenderName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Personal Message (optional)</label>
                    <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                      placeholder="Add a personal note..."
                      value={message} onChange={e => setMessage(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#FED800'}
                      onBlur={e => e.target.style.borderColor = '#1A1A1A'}
                    />
                  </div>
                  <div style={{ padding: '12px 14px', background: '#0A0A0A', borderRadius: '10px', border: '1px solid #FED80020' }}>
                    <p style={{ fontSize: '13px', color: '#888888' }}>
                      Gift card value: <span style={{ color: '#FED800', fontWeight: '700', fontSize: '16px' }}>${finalAmount > 0 ? finalAmount : 0}</span>
                    </p>
                  </div>
                  <button type="submit" disabled={finalAmount <= 0} style={{ width: '100%', padding: '15px', background: finalAmount > 0 ? '#FED800' : '#2A2A2A', borderRadius: '12px', fontSize: '16px', fontWeight: '700', color: finalAmount > 0 ? '#000' : '#888888', cursor: finalAmount > 0 ? 'pointer' : 'not-allowed' }}>
                    Purchase Gift Card · ${finalAmount > 0 ? finalAmount : 0}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}