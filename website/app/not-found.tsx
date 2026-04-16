import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(254,216,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '40px' }}>🍳</span>
      </div>
      <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#FED800', margin: '0 0 8px', letterSpacing: '-2px' }}>404</h1>
      <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: '0 0 8px' }}>Page Not Found</p>
      <p style={{ fontSize: '14px', color: '#777777', margin: '0 0 32px', maxWidth: '400px' }}>
        Looks like this page got scrambled. Let&apos;s get you back to something delicious.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ padding: '12px 28px', background: '#FED800', borderRadius: '10px', color: '#000', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
          Back to Home
        </Link>
        <Link href="/order" style={{ padding: '12px 28px', background: 'transparent', border: '1px solid #D0D0D0', borderRadius: '10px', color: '#777777', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
          View Menu
        </Link>
      </div>
    </div>
  );
}
