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
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

const COMMON = ['AI or custom script', 'Voiceover + burned-in subtitles', '16:9 and 9:16 formats'];

export const PLAN_CATALOG: PlanDef[] = [
  {
    id: 'free', name: 'Free Trial', price: 0, videosPerMonth: 1, maxSeconds: 30, mode: 'mode_1',
    features: ['1 video (30s)', 'Cinematic motion (Mode 1)', 'Try before you subscribe'],
  },
  {
    id: 'starter', name: 'Starter', price: 7, videosPerMonth: 10, maxSeconds: 900, mode: 'mode_1',
    features: ['10 videos / month', 'Up to 15 min each', 'Cinematic motion (Mode 1)', ...COMMON],
  },
  {
    id: 'creator', name: 'Creator', price: 18, videosPerMonth: 30, maxSeconds: 1200, mode: 'mode_1',
    highlighted: true, badge: 'Most Popular',
    features: ['30 videos / month', 'Up to 20 min each', 'Cinematic motion (Mode 1)', ...COMMON],
  },
  {
    id: 'scale', name: 'Scale', price: 28, videosPerMonth: 65, maxSeconds: 1800, mode: 'mode_1',
    features: ['65 videos / month', 'Up to 30 min each', 'Cinematic motion (Mode 1)', 'Priority render queue', ...COMMON],
  },
  {
    id: 'creator_m2', name: 'Creator Mode 2', price: 25, videosPerMonth: 20, maxSeconds: 1200, mode: 'mode_2',
    features: ['20 videos / month', 'Up to 20 min each', 'Enhanced motion (Mode 2)', 'Mode 1 also included', ...COMMON],
  },
  {
    id: 'scale_m2', name: 'Scale Mode 2', price: 47, videosPerMonth: 50, maxSeconds: 1500, mode: 'mode_2',
    features: ['50 videos / month', 'Up to 25 min each', 'Enhanced motion (Mode 2)', 'Mode 1 also included', 'Priority render queue', ...COMMON],
  },
];

export const PLAN_IDS = PLAN_CATALOG.map((p) => p.id);
export const PAID_PLANS = PLAN_CATALOG.filter((p) => p.id !== 'free');

export function planById(id: string | null | undefined): PlanDef {
  return PLAN_CATALOG.find((p) => p.id === id) ?? PLAN_CATALOG[0];
}
