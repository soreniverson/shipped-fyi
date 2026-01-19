import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shipped.fyi - Product feedback without the product management degree",
  description: "Simple feedback board, roadmap, and changelog tool for your product.",
  metadataBase: new URL('https://shipped.fyi'),
  openGraph: {
    title: 'shipped.fyi',
    description: 'Product feedback, simplified',
    url: 'https://shipped.fyi',
    siteName: 'shipped.fyi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'shipped.fyi - Product feedback, simplified',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'shipped.fyi',
    description: 'Product feedback, simplified',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
