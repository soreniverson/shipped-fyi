import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      projects: 1,
      items: 50,
    },
    features: [
      '1 feedback board',
      'Up to 50 items',
      'Public roadmap',
      'Public changelog',
      'Unlimited voters',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      projects: Infinity,
      items: Infinity,
    },
    features: [
      'Unlimited boards',
      'Unlimited items',
      'Public roadmap',
      'Public changelog',
      'Unlimited voters',
      'Embeddable widget',
      'Remove "Powered by" badge',
      'Priority support',
    ],
  },
}
