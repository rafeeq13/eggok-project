import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

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
    url: 'https://eggsokphilly.com',
    siteName: 'Eggs Ok',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}