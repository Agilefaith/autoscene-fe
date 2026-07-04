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
  // Structured spec fields — rendered as a uniform, comparable block per card.
  videos: string;        // e.g. "10 videos"
  videosSub: string;     // e.g. "/ month" | "/ trial"
  maxDuration: string;   // e.g. "Up to 15 min per video"
  queue: string;         // e.g. "Faster queue"
  modeGroup: 'mode_1' | 'mode_2';
  modeLabel: string;     // e.g. "Cinematic motion (Mode 1)"
  features: string[];
  cta: string;
  ctaHref: string;
}

export const plans: LandingPlan[] = PLAN_CATALOG.map((p) => ({
  id: p.id,
  // The mode toggle already communicates Mode 1 / Mode 2, so drop the suffix
  // for a clean tier name ("Creator" instead of "Creator Mode 2").
  name: p.name.replace(/ Mode 2$/, ''),
  price: p.price,
  period: p.price === 0 ? 'forever' : 'per month',
  highlighted: !!p.highlighted,
  badge: p.badge,
  videos: `${p.videosPerMonth} ${p.videosPerMonth === 1 ? 'video' : 'videos'}`,
  videosSub: p.price === 0 ? '/ trial' : '/ month',
  maxDuration: `Up to ${formatDuration(p.maxSeconds)} per video`,
  queue: p.queue,
  modeGroup: p.mode,
  modeLabel: p.mode === 'mode_2' ? 'Enhanced motion (Mode 2)' : 'Cinematic motion (Mode 1)',
  features: p.features,
  cta: p.price === 0 ? 'Start Free' : `Get ${p.name.replace(/ Mode 2$/, '')}`,
  ctaHref: '/signup',
}));

export const freePlan = plans.find((p) => p.id === 'free')!;
export const mode1Plans = plans.filter((p) => p.modeGroup === 'mode_1' && p.id !== 'free');
export const mode2Plans = plans.filter((p) => p.modeGroup === 'mode_2');
