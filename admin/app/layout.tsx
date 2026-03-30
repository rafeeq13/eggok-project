import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eggs OK — Admin Dashboard",
  description: "RestoRise Business Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}