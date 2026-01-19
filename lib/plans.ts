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
