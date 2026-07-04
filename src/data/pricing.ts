// Landing-page pricing, derived from the shared plan catalog (data/plans.ts)
// so marketing and the in-app billing page never drift apart.
import { PLAN_CATALOG, formatDuration } from './plans';

export interface LandingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  highlighted: boolean;
  badge?: string;
  quota: string;
  maxDuration: string;
  mode: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

export const plans: LandingPlan[] = PLAN_CATALOG.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  period: p.price === 0 ? 'forever' : 'per month',
  highlighted: !!p.highlighted,
  badge: p.badge,
  quota: `${p.videosPerMonth} ${p.videosPerMonth === 1 ? 'video' : 'videos'} / ${p.price === 0 ? 'trial' : 'month'}`,
  maxDuration: `Up to ${formatDuration(p.maxSeconds)} per video`,
  mode: p.mode === 'mode_2' ? 'Enhanced motion (Mode 2)' : 'Cinematic motion (Mode 1)',
  features: p.features,
  cta: p.price === 0 ? 'Start Free' : `Get ${p.name}`,
  ctaHref: '/signup',
}));
