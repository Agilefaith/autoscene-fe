import type { Plan } from './pricing.types';

export type { CreditPack, Plan } from './pricing.types';

export const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    highlighted: false,
    avatarTier: '',
    personaLimit: 2,
    features: [
      '1 credit trial (30s video)',
      'Up to 2 personas',
      'Basic AI script generation',
      'Platform voices only',
      '9:16 format only',
    ],
    creditPacks: [],
    cta: 'Start Free',
    ctaHref: '/signup',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'per month',
    highlighted: true,
    badge: 'Most Popular',
    avatarTier: '',
    personaLimit: 10,
    features: [
      'Editing engine (zooms, cuts, pacing)',
      'Up to 10 personas',
      'AI script + custom script mode',
      'Full voice library + custom Voice ID',
      'All formats: 16:9, 9:16, 1:1, 4:5',
      'Campaign automation',
      'Real-time pipeline viewer',
    ],
    creditPacks: [
      { price: 10, credits: 10, approxMinutes: 5 },
      { price: 30, credits: 40, approxMinutes: 20 },
    ],
    cta: 'Start Creating',
    ctaHref: '/signup',
  },
  {
    name: 'Premium',
    price: 79,
    period: 'per month',
    highlighted: false,
    avatarTier: '',
    personaLimit: 'unlimited',
    features: [
      'Natural realism rendering (4x quality)',
      'Unlimited personas',
      'Priority render queue',
      'All Pro features included',
      'Dedicated support',
    ],
    creditPacks: [{ price: 100, credits: 40, approxMinutes: 20 }],
    cta: 'Go Premium',
    ctaHref: '/signup',
  },
];
