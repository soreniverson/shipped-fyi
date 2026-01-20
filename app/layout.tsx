import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: {
    default: "shipped.fyi - Product feedback without the product management degree",
    template: "%s | shipped.fyi",
  },
  description: "Simple feedback board, roadmap, and changelog tool for your product. Collect user feedback, track your roadmap, and celebrate shipped features.",
  keywords: ["product feedback", "roadmap", "changelog", "feature requests", "user feedback", "product management", "feedback board"],
  authors: [{ name: "shipped.fyi" }],
  creator: "shipped.fyi",
  metadataBase: new URL('https://shipped.fyi'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'shipped.fyi - Product feedback, simplified',
    description: 'Simple feedback board, roadmap, and changelog tool for your product.',
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
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'shipped.fyi - Product feedback, simplified',
    description: 'Simple feedback board, roadmap, and changelog tool for your product.',
    images: ['/og-image.png'],
    creator: '@shippedfyi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'shipped.fyi',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': 'Simple feedback board, roadmap, and changelog tool for product teams. Collect user feedback, prioritize features with voting, share your roadmap, and celebrate shipped features with an auto-updating changelog.',
      'url': 'https://shipped.fyi',
      'offers': [
        {
          '@type': 'Offer',
          'name': 'Free',
          'price': '0',
          'priceCurrency': 'USD',
          'description': '1 feedback board, up to 50 items, public roadmap, public changelog, unlimited voters'
        },
        {
          '@type': 'Offer',
          'name': 'Pro',
          'price': '9',
          'priceCurrency': 'USD',
          'priceSpecification': {
            '@type': 'UnitPriceSpecification',
            'price': '9',
            'priceCurrency': 'USD',
            'billingDuration': 'P1M'
          },
          'description': 'Unlimited boards, unlimited items, embeddable widget, remove branding, priority support'
        }
      ],
      'featureList': [
        'Feedback board for collecting user ideas',
        'User voting on feature requests',
        'Public roadmap with status columns',
        'Auto-updating changelog for shipped features',
        'Email notifications when features ship',
        'Category organization for feedback items',
        'Embeddable widget for your website',
        'No sign-up required for voters'
      ],
      'screenshot': 'https://shipped.fyi/og-image.png',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '5',
        'ratingCount': '1'
      }
    },
    {
      '@type': 'Organization',
      'name': 'shipped.fyi',
      'url': 'https://shipped.fyi',
      'logo': 'https://shipped.fyi/icon.png',
      'sameAs': [],
      'contactPoint': {
        '@type': 'ContactPoint',
        'email': 'support@shipped.fyi',
        'contactType': 'customer support'
      }
    },
    {
      '@type': 'WebSite',
      'name': 'shipped.fyi',
      'url': 'https://shipped.fyi',
      'description': 'Simple feedback board, roadmap, and changelog for indie hackers and product teams',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://shipped.fyi/{search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="shipped.fyi RSS Feed" href="/feed.xml" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
