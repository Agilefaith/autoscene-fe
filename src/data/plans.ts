// The AutoScene plan catalog — mirrors backend PLANS (app/core/config.py).
// Billing is in CREDITS, where one credit is one minute of finished video
// (Faith, 2026-08-05): a 20-minute video costs 20 credits, so the plan's credits
// are what caps how much you can render. Plan credits reset monthly with no
// rollover; Pay-As-You-Go credits are bought separately and never expire.
// Prices are Naira because the Paystack account settles in NGN.

export type PlanId = 'starter' | 'creator' | 'pro' | 'scale';

export interface PlanDef {
  id: PlanId;
  name: string;
  priceNgn: number;         // NGN / month
  creditsPerMonth: number;  // 1 credit = 1 minute of video
  queue: string;            // render-queue priority tier
  features: string[];       // value-adds only (specs live in structured fields)
  highlighted?: boolean;
  badge?: string;
}

export interface TopupPackDef {
  id: string;
  credits: number;
  priceNgn: number;
}

export function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

// Per-plan feature bullets — kept 1:1 with Faith's pricing brief (nothing added
// or removed). Structured specs (credits / queue) render separately.
export const PLAN_CATALOG: PlanDef[] = [
  {
    id: 'starter', name: 'Starter', priceNgn: 22_400, creditsPerMonth: 20,
    queue: 'Standard queue',
    features: ['Transitions + motion effects'],
  },
  {
    id: 'creator', name: 'Creator', priceNgn: 57_400, creditsPerMonth: 60,
    queue: 'Faster queue',
    highlighted: true, badge: 'Most Popular',
    // "No watermark" was dropped from the bullets (Faith, 2026-08-06): no plan
    // has ever watermarked its output, so advertising it here implied the
    // cheaper plans do.
    features: ['Faster rendering'],
  },
  {
    id: 'pro', name: 'Pro', priceNgn: 129_400, creditsPerMonth: 150,
    queue: 'Priority queue',
    features: ['Priority rendering', 'Better quality'],
  },
  {
    id: 'scale', name: 'Scale', priceNgn: 260_400, creditsPerMonth: 350,
    queue: 'Priority queue',
    badge: 'Best Value',
    features: ['Bulk discount'],
  },
];

// One-off credit purchases. These do not renew and the credits never expire.
export const TOPUP_PACKS: TopupPackDef[] = [
  { id: 'topup_80', credits: 80, priceNgn: 96_000 },
  { id: 'topup_180', credits: 180, priceNgn: 176_000 },
];

export const PLAN_IDS = PLAN_CATALOG.map((p) => p.id);

// Internal accounts (user_type='internal') bypass the public plan catalog
// entirely — this is not a purchasable plan, so it's kept out of PLAN_CATALOG
// to avoid it ever rendering on pricing/billing pages.
export const INTERNAL_PLAN: PlanDef = {
  id: 'scale', name: 'Internal', priceNgn: 0, creditsPerMonth: Infinity,
  queue: 'Priority queue',
  features: ['Unlimited internal access'],
};

export function planById(id: string | null | undefined): PlanDef | null {
  return PLAN_CATALOG.find((p) => p.id === id) ?? null;
}

// There is no free tier any more, so an account with no live subscription has no
// plan at all — callers must handle null rather than silently showing a tier.
export function resolvePlan(
  userType: string | null | undefined,
  planTier: string | null | undefined,
): PlanDef | null {
  if (userType === 'internal') return INTERNAL_PLAN;
  return planById(planTier);
}
