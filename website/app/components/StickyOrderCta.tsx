'use client';
import Link from 'next/link';

export default function StickyOrderCta() {
  return (
    <>
      <Link href="/order" id="sticky-order-cta-global" className="sticky-order-cta-global">
        Order online
      </Link>
      <style>{`
        .sticky-order-cta-global { display: none; }
        @media (max-width: 1024px) {
          body { padding-bottom: 80px; }
          .sticky-order-cta-global {
            display: block;
            position: fixed;
            left: 12px; right: 12px;
            bottom: 8px;
            z-index: 150;
            padding: 14px 20px;
            background: #E3BF22;
            color: #000;
            font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            border-radius: 14px;
            border: 2px solid transparent;
            box-shadow: 0 10px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08);
          }
          .sticky-order-cta-global:hover { background: #D4B01E; color: #000; }
        }
      `}</style>
    </>
  );
}
