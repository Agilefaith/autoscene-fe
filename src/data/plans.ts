// The AutoScene plan catalog — mirrors backend PLANS (app/core/config.py).
// Billing is a per-month VIDEO QUOTA: N videos / month, a max duration per
// video, and the render mode(s) the plan unlocks. No rollover, monthly reset.

export type PlanId = 'free' | 'starter' | 'creator' | 'scale' | 'creator_m2' | 'scale_m2';

export interface PlanDef {
  id: PlanId;
  name: string;
  price: number;            // USD / month
  videosPerMonth: number;
  maxSeconds: number;       // max duration per video
  mode: 'mode_1' | 'mode_2';
  imagesPerScene: 1 | 3;    // Mode 1 = 1, Mode 2 = 3
  queue: string;            // render-queue priority tier
  features: string[];       // value-adds only (specs live in structured fields)
  highlighted?: boolean;
  badge?: string;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

// Per-plan feature bullets — kept 1:1 with Faith's pricing brief (nothing added
// or removed). Structured specs (videos / duration / queue) render separately.
export const PLAN_CATALOG: PlanDef[] = [
  {
    id: 'free', name: 'Free Trial', price: 0, videosPerMonth: 1, maxSeconds: 30, mode: 'mode_1',
    imagesPerScene: 1, queue: 'Standard queue',
    features: ['Transitions + motion effects'],
  },
  {
    id: 'starter', name: 'Starter', price: 7, videosPerMonth: 10, maxSeconds: 900, mode: 'mode_1',
    imagesPerScene: 1, queue: 'Standard queue',
    features: ['Transitions + motion effects'],
  },
  {
    id: 'creator', name: 'Creator', price: 18, videosPerMonth: 30, maxSeconds: 1200, mode: 'mode_1',
    imagesPerScene: 1, queue: 'Faster queue',
    highlighted: true, badge: 'Most Popular',
    features: ['Transitions + motion effects'],
  },
  {
    id: 'scale', name: 'Scale', price: 28, videosPerMonth: 65, maxSeconds: 1800, mode: 'mode_1',
    imagesPerScene: 1, queue: 'Priority queue',
    features: ['Transitions + motion effects'],
  },
  {
    id: 'creator_m2', name: 'Creator Mode 2', price: 25, videosPerMonth: 20, maxSeconds: 1200, mode: 'mode_2',
    imagesPerScene: 3, queue: 'Standard queue',
    features: ['3 images per scene', 'Polished cinematic feel'],
  },
  {
    id: 'scale_m2', name: 'Scale Mode 2', price: 47, videosPerMonth: 50, maxSeconds: 1500, mode: 'mode_2',
    imagesPerScene: 3, queue: 'Priority queue',
    highlighted: true, badge: 'Best Quality',
    features: ['3 images per scene', 'Polished cinematic feel'],
  },
];

export const PLAN_IDS = PLAN_CATALOG.map((p) => p.id);
export const PAID_PLANS = PLAN_CATALOG.filter((p) => p.id !== 'free');

export function planById(id: string | null | undefined): PlanDef {
  return PLAN_CATALOG.find((p) => p.id === id) ?? PLAN_CATALOG[0];
}
