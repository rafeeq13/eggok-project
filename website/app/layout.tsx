import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import FacebookPixel from './components/FacebookPixel';
import { API_URL } from '../lib/api';

export const metadata: Metadata = {
  title: 'Eggs Ok  Breakfast & Lunch Philadelphia',
  description: 'Order online from Eggs Ok in Philadelphia. Fresh breakfast sandwiches, burritos, omelettes, and specialty drinks. Pickup and delivery available.',
  keywords: 'breakfast philadelphia, eggs ok, breakfast sandwiches, lunch philadelphia, burritos, online ordering',
  icons: {
    icon: '/favicon.webp',
  },
  openGraph: {
    title: 'Eggs Ok  Breakfast & Lunch Philadelphia',
    description: 'Order online from Eggs Ok. Fresh breakfast made daily.',
    url: 'https://eggsokpa.com',
    siteName: 'Eggs Ok',
    locale: 'en_US',
    type: 'website',
  },
  verification: {
    google: 'yY3Zgo8j23THXCga1bpHAxc8_L5xD-2K58KaJwcxgbo',
  },
};

// Server-side fetch of public-safe integration fields so the pixel ID and the
// facebook-domain-verification meta tag are present in the initial HTML
// (Facebook's verifier scrapes static HTML — JS-injected meta tags don't count).
async function getPublicIntegrations(): Promise<{ facebookPixelId?: string; facebookPixelStatus?: string; facebookDomainVerification?: string }> {
  try {
    // Short revalidation so an admin toggle (turning the pixel on/off, rotating
    // the domain-verification code) propagates within ~1 min without a redeploy.
    const res = await fetch(`${API_URL}/settings/integrations`, { next: { revalidate: 60 } });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const integrations = await getPublicIntegrations();
  const pixelId = integrations.facebookPixelStatus === 'connected' && integrations.facebookPixelId
    ? integrations.facebookPixelId
    : '';
  const fbVerify = integrations.facebookDomainVerification || '';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        {fbVerify && <meta name="facebook-domain-verification" content={fbVerify} />}
      </head>
      <body>
        <FacebookPixel pixelId={pixelId} />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
