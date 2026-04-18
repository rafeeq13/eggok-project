import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500, padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(254,216,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '40px' }}>🍳</span>
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-2px' }}>404</h1>
      <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A', margin: '0 0 8px' }}>Page Not Found</p>
      <p style={{ fontSize: '16px', color: '#777777', margin: '0 0 32px', maxWidth: '400px' }}>
        Looks like this page got scrambled. Let&apos;s get you back to something delicious.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ padding: '8px 12px', background: '#E5B800', borderRadius: '10px', color: '#000', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>
          Back to Home
        </Link>
        <Link href="/order" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #D0D0D0', borderRadius: '10px', color: '#777777', fontWeight: '600', fontSize: '16px', textDecoration: 'none' }}>
          View Menu
        </Link>
      </div>
    </div>
  );
}
