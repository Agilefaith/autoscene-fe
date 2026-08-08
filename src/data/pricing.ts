// Landing-page pricing, derived from the shared plan catalog (data/plans.ts)
// so marketing and the in-app billing page never drift apart.
import { PLAN_CATALOG, TOPUP_PACKS, formatNgn } from './plans';

export interface LandingPlan {
  id: string;
  name: string;
  price: string;         // formatted NGN, e.g. "₦22,400"
  period: string;
  highlighted: boolean;
  badge?: string;
  // Structured spec fields — rendered as a uniform, comparable block per card.
  credits: string;       // e.g. "20 credits"
  creditsSub: string;    // e.g. "≈ 20 min of video / month"
  queue: string;         // e.g. "Faster queue"
  features: string[];
  cta: string;
  ctaHref: string;
}

export const plans: LandingPlan[] = PLAN_CATALOG.map((p) => ({
  id: p.id,
  name: p.name,
  price: formatNgn(p.priceNgn),
  period: 'per month',
  highlighted: !!p.highlighted,
  badge: p.badge,
  credits: `${p.creditsPerMonth} credits`,
  creditsSub: `≈ ${p.creditsPerMonth} min of video / month`,
  queue: p.queue,
  features: p.features,
  cta: `Get ${p.name}`,
  ctaHref: '/login',
}));

// Pay-As-You-Go: a one-off purchase, not a subscription. These credits never
// expire, so they sit alongside whatever plan the user is on.
export const topupPacks = TOPUP_PACKS.map((t) => ({
  id: t.id,
  credits: `${t.credits} credits`,
  price: formatNgn(t.priceNgn),
  sub: `≈ ${t.credits} min of video`,
}));
