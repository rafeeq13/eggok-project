import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eggs OK Admin Dashboard",
  description: "",
  icons: {
    icon: '/favicon.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}