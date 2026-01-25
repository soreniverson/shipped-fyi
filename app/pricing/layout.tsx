import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | shipped.fyi',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing | shipped.fyi',
    description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
    type: 'website',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
